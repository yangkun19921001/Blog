## 前言

首先这一篇为什么会讲解 WindowManager 而不是直接分析 WindowManagerService 呢？他们之间又是怎样的关系 ？这是因为, 为了更好的理解 WMS , 需要先理解 WindowManager,  而且 WindowManager 又是与 WMS 关联最紧密的类，所以相当于给 WMS 做了一个铺垫。那么接下来该篇文章会详细介绍 WindowManager 相关内容。大家先来回顾一下在该系列文章我们已经学习了 SystemServer (系统服务进程)、四大组件和 AMS 启动分析，在 Activity 启动完成之后需要将 XML 解析成 View 在将 View 添加到 Window 的一个过程。那么 Window 又与咱们今天介绍的 WindowManager 又是什么关系呢？下面我们就慢慢来分析其中的原因。还没有看过该系列文章的，建议先去了解下, 不然到时候直接讲 Window 添加或绑定 WMS 的过程不是那么容易理解，下面给出链接，不了解的可以先去看一下。

[Android 8.0 源码分析 (一) SystemServer 进程启动](https://juejin.im/post/5db3f95ee51d4529e83947f9)

[Android 8.0 源码分析 (二) Launcher 启动](https://juejin.im/post/5db5565cf265da4d0f14053c)

[Android 8.0 源码分析 (三) 应用程序进程创建到应用程序启动的过程](https://juejin.im/post/5db599bc6fb9a0203b234b08)

[Android 8.0 源码分析 (四) Activity 启动](https://juejin.im/post/5db85da4e51d4529f73e27fb)

[Android 8.0 源码分析 (五) Service 启动](https://juejin.im/post/5dbb0507f265da4cf406f735)

[Android 8.0 源码分析 (六) BroadcastReceiver 启动](https://juejin.im/post/5dbd5144e51d456eec1830af)

[Android 8.0 源码分析 (七) ContentProvider 启动](https://juejin.im/post/5dbe8e6ce51d456f0006634a)

[Android 8.0 源码分析 (八) ActivityManagerService](https://juejin.im/post/5dc4339c5188254e7a15585c)

## Window 、WindowManager 、WMS 之间的关系

- **Window:** window 它是一个抽象类，具体实现类为 PhoneWindow ，它对 View 进行管理。

  ```java
  //Window.java
  public abstract class Window {
    ...
  }
  //PhoneWindow.java
  public class PhoneWindow extends Window implements MenuBuilder.Callback {
    ...
  }
  ```

- WindowManager 是一个接口类，继承自接口 `ViewManager` ，从它的名称就知道它是用来管理 Window 的，它的实现类为 WindowManagerImpl。

  ```java
  //ViewManager.java
  public interface ViewManager
  {
    //添加 View 
      public void addView(View view, ViewGroup.LayoutParams params);
    //更新
      public void updateViewLayout(View view, ViewGroup.LayoutParams params);
    //删除
      public void removeView(View view);
  }
  
  //WindowManager.java
  public interface WindowManager extends ViewManager {
  ...
  }
  
  //WindowManagerImpl
  public final class WindowManagerImpl implements WindowManager {
    ...
  }
  ```

  如果我们想要对 Window 进行添加、更新、删除操作就可以使用 WindowManager 类, WindowManager 会将具体的工作交于 WMS 来处理， WindowManager 与 WMS 以 Binder 的形式进行通信，这一点与 ActivityManager 和 AMS 一样 。

下面我们以一张它们之间的关系图来说明下它们之间的联系

![Mmr7wR.png](https://s2.ax1x.com/2019/11/09/Mmr7wR.png)

Window 包含了 View 并对 View 进行管理， WindowManager 用来管理 Window, 而 WindowManager 所提供的功能最终会由 WMS 进行处理。

## WindowManager 的关联类

接下来我们会从源码的角度来分析 WindowManager 的关联类，从中我们可以更好地理解 Window  和 WindowManager 的关系。

在上一节介绍中我们知道，WindowManager 其实是一个接口，它继承自 ViewManager , ViewManager 中定义了 3 个抽象方法，分别是用来添加、更新、删除 View 的，WindowManager 继承了父类接口的方法，说明也具备了父类的能力，从父类方法中的第一个参数得知，传入的都是 View 类型的参数，那么这就可以说明 Window 都是以 View 的方式存在。在继承父类的特性之外 WindowManager 又加入了很多功能，比如 Window 的类型和层级相关的常量、内部类以及一些方法，其中有两个方法时根据 Window 的特性加入的。如下所示:

```java
//interface-->WindowManager.java
public interface WindowManager extends ViewManager {
  
 ...
   
    /**
     * 得知将 Window 添加到哪个屏幕上了，通俗来说就是拿到 WindowManager 所管理的屏幕 Display
     * @return
     */
    public Display getDefaultDisplay();


    /**
     * 规定在这个方法返回前要立刻执行 View.onDetachedFromWindow() 来完成传入的 View 相关逻辑的销毁工作
     * @param view
     */
    public void removeViewImmediate(View view);
   
 ...
}
```

这 2 个方法功能上的意思可以看上面的注释，下面我们来看下 Window 何时创建，通过上面的介绍我们知道 Window 是一个抽象类，它继承自 ViewManager , Window 的具体实现就是 PhoneWindow, 那么 PhoneWindow 是何时创建的呢？在讲解 Activity 启动的时候我们知道要启动一个 Activity 最后实际调用的 H 类的 handleLaunchActivity -> performLaunchActivity  方法中又调用了 Activity 的 attach 方法，PhoneWindow 就在该方法中创建的，我们直接看代码:

```java
//Activity.java
    final void attach(Context context, ActivityThread aThread,
            Instrumentation instr, IBinder token, int ident,
            Application application, Intent intent, ActivityInfo info,
            CharSequence title, Activity parent, String id,
            NonConfigurationInstances lastNonConfigurationInstances,
            Configuration config, String referrer, IVoiceInteractor voiceInteractor,
            Window window, ActivityConfigCallback activityConfigCallback) {
       	...
        /**
         * 1. 实例化 Window 的唯一子类 PhoneWindow 
         */
        mWindow = new PhoneWindow(this, window, activityConfigCallback);
        mWindow.setWindowControllerCallback(this);
        mWindow.setCallback(this);
        mWindow.setOnWindowDismissedCallback(this);
        mWindow.getLayoutInflater().setPrivateFactory(this);
        ...

        /**
         * 2. 绑定 WindowManager
         */
        mWindow.setWindowManager(
                (WindowManager)context.getSystemService(Context.WINDOW_SERVICE),
                mToken, mComponent.flattenToString(),
                (info.flags & ActivityInfo.FLAG_HARDWARE_ACCELERATED) != 0);
        if (mParent != null) {
            mWindow.setContainer(mParent.getWindow());
        }
        mWindowManager = mWindow.getWindowManager();
        mCurrentConfig = config;

        mWindow.setColorMode(info.colorMode);
    }
```

上面的代码主要就 2 个意思，其一实例化 Window 抽象类的子类 PhonWindow, 其二就是 PhoneWindow 与 WindowManager 想关联，我们看 setWindowManager 方法实现, 代码如下:

```java
//Window.java
    public void setWindowManager(WindowManager wm, IBinder appToken, String appName,
            boolean hardwareAccelerated) {
        mAppToken = appToken;
        mAppName = appName;
        mHardwareAccelerated = hardwareAccelerated
                || SystemProperties.getBoolean(PROPERTY_HARDWARE_UI, false);
        if (wm == null) {
          	//1. 
            wm = (WindowManager)mContext.getSystemService(Context.WINDOW_SERVICE);
        }
      //2. 
        mWindowManager = ((WindowManagerImpl)wm).createLocalWindowManager(this);
    }
```

如果传入进来的 wm 类型的 WindowManager 为 null ，就通过 mContext . getSystemService 方法在获取 WIndowManager 对象，这里的 mContext 是 Context 类型，它的实现类是 ContentImp 对象，也是在 performLaunchActivity 方法中实例化。我们先跟一下 ContentImp 的 getSystemService 方法具体实现，代码如下:

```java
//ContextImpl.java
    @Override
    public Object getSystemService(String name) {
        return SystemServiceRegistry.getSystemService(this, name);
    }



```

我们看到在 SystemServiceRegistry 类中的静态方法 getSystemService 中获取，代码如下:

```java
//SystemServiceRegistry.java
final class SystemServiceRegistry {
  
  ...
    
   //1. 
  private static final HashMap<String, ServiceFetcher<?>> SYSTEM_SERVICE_FETCHERS =
            new HashMap<String, ServiceFetcher<?>>();
  
  ...
    
    static{
    ...
      //2.
    registerService(Context.WINDOW_SERVICE, WindowManager.class,
                new CachedServiceFetcher<WindowManager>() {
            @Override
            public WindowManager createService(ContextImpl ctx) {
                return new WindowManagerImpl(ctx);
            }});
    ...
  }
  
   private static <T> void registerService(String serviceName, Class<T> serviceClass,
            ServiceFetcher<T> serviceFetcher) {
        SYSTEM_SERVICE_NAMES.put(serviceClass, serviceName);
        SYSTEM_SERVICE_FETCHERS.put(serviceName, serviceFetcher);
    }
  
  public static Object getSystemService(ContextImpl ctx, String name) {
        ServiceFetcher<?> fetcher = SYSTEM_SERVICE_FETCHERS.get(name);
        return fetcher != null ? fetcher.getService(ctx) : null;
    }

```

通过上面的代码我们知道 SYSTEM_SERVICE_FETCHERS 是一个容器单例类，在 SystemServiceRegistry 类的静态代码块中会注册以 Context.xxx 类型的各种服务，最后 register 成功会存入单例容器中。

然后看下注释二调用 createLocalWindowManager 来创建 WindowManager 实现类，代码如下:

```java
//WindowManagerImpl.java
public final class WindowManagerImpl implements WindowManager {
  ...
    public WindowManagerImpl createLocalWindowManager(Window parentWindow) {
    		//实例化 WindowManager 的实现类对象
        return new WindowManagerImpl(mContext, parentWindow);
    }
  
      private WindowManagerImpl(Context context, Window parentWindow) {
        mContext = context;
        mParentWindow = parentWindow;
    }
  ...
}
```

注释 1 跟注释 2 都会创建一个 WindowManagerImpl 它们的不同之处就是在于注释 2 它是把创建 Window 的实例也传入了进入，这样 WindowManagerImpl 就有了 PhoneWindow 的引用，然后就就可以对 Window 进行一些处理，比如调用 WindowManagerImp 的 addView 方法,代码如下:

```java
//WindowManagerImpl.java
    @Override
    public void addView(@NonNull View view, @NonNull ViewGroup.LayoutParams params) {
        applyDefaultToken(params);
        /**
         * 委托给 WindowManagerGlobal 来处理 addView 
         */
        mGlobal.addView(view, params, mContext.getDisplay(), mParentWindow);
    }
```

通过上面代码知道，虽然调用了 WindowManagerImp 类中的 addView 方法，但是内部方法并没有具体实现，而是委托给了 WindowManagerGlobal 来具体处理 addView 的逻辑，WindowManagerGlobal 将在后面小节会将到，我们先来看下它在 WindowManagerImp 中怎么创建出来的，代码如下:

```java
//WindowManagerImp.java
public final class WindowManagerImpl implements WindowManager {
  	//1. 通过线程安全的单例拿到 WindowManagerGlobal 对象
    private final WindowManagerGlobal mGlobal = WindowManagerGlobal.getInstance();
			/**2. */
      private final Window mParentWindow;
  
      private WindowManagerImpl(Context context, Window parentWindow) {
        mContext = context;
        //3
        mParentWindow = parentWindow;
    }
  
  
  
}

//WindowManagerGlobal.java
    public static WindowManagerGlobal getInstance() {
        synchronized (WindowManagerGlobal.class) {
            if (sDefaultWindowManager == null) {
                sDefaultWindowManager = new WindowManagerGlobal();
            }
            return sDefaultWindowManager;
        }
    }
```

在注释 1 代码可以看出我们通过了一个线程安全的单例拿到了 WindowManagerGlobal 的地址，然后注释 2 ，注释 3 是在 Activity 创建 PhoneWindow 的时候一路传递进来的，这里就代表 WindowManagerImpl 实例会作为哪个 Window 的子 Window, 通过该小节讲解的源码，我这里画了一个 WindowManager 的关联图，请看下图.

![MnNJKI.png](https://s2.ax1x.com/2019/11/09/MnNJKI.png)

通过图中可以看出， PhoneWindow 继承自 Window, PhoneWindow 通过 setWindowManager 方法与WindowManager 进行关联。WindowManager 继承自接口 ViewManager, WindowManagerImpl 是 WindowManager 接口的实现类，但是内部功能都委托给了 WindowManagerGlobal 来处理。

## Window 的属性

在上小节中我们讲解了 Window 与 WindowManager 、WMS 的关系 ， 也知道 WMS 是最终处理 Window 的执行者，Window 好比是员工， WMS 好比是老板，为了方便老板管理员工则需要定义一套 “规章制度”，那么这些规章制度就相当于是 Window 的属性，它们被定义在 WindowManager 的内部类 LayoutParams 中，了解 Window 的属性能够更好地理解 WMS 的内部原理。Window 属性有很多种，与应用开发最密切的有 3 种，它们分别是 Type(Window 的类型)，Flag(Window 的标志) 和 SoftInputMode(软键盘相关模式)，下面分别介绍这 3 种属性。

### Window 的类型

Window 的类型有很多种，比如应用程序窗口、系统错误窗口、输入法窗口、PopWindow、Toast、Dialog 等。总的来说 Window 分为三大类型，分别是 Application Window(应用程序窗口)、Sub Window(子窗口)、System Window (系统窗口)，每个大类型中又包含了很多种类型，它们都定义在 WindowManager 的静态内部类 LayoutParams 中，接下来分别对这三大类型进行讲解。

1. 应用程序窗口

   Activity 就是一个典型的应用程序窗口，应用程序窗口包含的类型如下所示:

   ```java
   //WindowManager.java
           /**
            * 表示应用程序窗口类型初始值
            */
           public static final int FIRST_APPLICATION_WINDOW = 1;
           /**
            * 窗口的基础值，其它的窗口值要大于这个值
            */
           public static final int TYPE_BASE_APPLICATION   = 1;
   
   
           /**
            * 普通的应用程序窗口
            * 
            */
           public static final int TYPE_APPLICATION        = 2;
   
   
           /**
            * 应用程序启动窗口的类型，用于系统在应用程序窗口启动前显示的窗口
            */
           public static final int TYPE_APPLICATION_STARTING = 3;
   
   
           public static final int TYPE_DRAWN_APPLICATION = 4;
   
   
           /**
            * 表示应用程序窗口类型的结束值值的范围是 1~99
            */
           public static final int LAST_APPLICATION_WINDOW = 99;
   ```

   通过上面的常量我们知道，应用程序的窗口的 Type 值范围为 1~99，这个值的大小涉及窗口的层级，关于窗口层级知识后面会讲到。

2. 子窗口

   子窗口，顾名思义，他是一个必须依附在其它窗口之上，可以理解为 fragment + Activity 的关系一样。子窗口的类型定义如下:

   ```java
   //WindowManager.java
           /**
            * 子类窗口初始化值
            */
           public static final int FIRST_SUB_WINDOW = 1000;
   
           public static final int TYPE_APPLICATION_PANEL = FIRST_SUB_WINDOW;
   
           public static final int TYPE_APPLICATION_MEDIA = FIRST_SUB_WINDOW + 1;
   
           public static final int TYPE_APPLICATION_SUB_PANEL = FIRST_SUB_WINDOW + 2;
   
           public static final int TYPE_APPLICATION_ATTACHED_DIALOG = FIRST_SUB_WINDOW + 3;
           public static final int TYPE_APPLICATION_MEDIA_OVERLAY  = FIRST_SUB_WINDOW + 4;
   
           public static final int TYPE_APPLICATION_ABOVE_SUB_PANEL = FIRST_SUB_WINDOW + 5;
           /**
            * 子类窗口类型结束值
            */
           public static final int LAST_SUB_WINDOW = 1999;
   
   ```

   可以看出子窗口的 Type 值的范围为 1000~1999

3. 系统窗口

   比如 Android 中的 Toast、输入法窗口、系统音量条窗口、系统错误窗口都是属于系统级别的 Window . 系统级别的 window 类型定义有如下几个:

   ```java
   //WindowManager.java
           /**
            * 系统类型窗口类型初始值
            */
           public static final int FIRST_SYSTEM_WINDOW     = 2000;
   
           /**
            * 系统状态栏窗口
            */
           public static final int TYPE_STATUS_BAR         = FIRST_SYSTEM_WINDOW;
   
           /**
            * 搜索条窗口
            */
           public static final int TYPE_SEARCH_BAR         = FIRST_SYSTEM_WINDOW+1;
   
           /**
            * 通话窗口
            */
           @Deprecated
           public static final int TYPE_PHONE              = FIRST_SYSTEM_WINDOW+2;
   
           /**
            * 系统 aleat 窗口
            */
           @Deprecated
           public static final int TYPE_SYSTEM_ALERT       = FIRST_SYSTEM_WINDOW+3;
   
           /**
            * 系统锁屏窗口
            */
           public static final int TYPE_KEYGUARD           = FIRST_SYSTEM_WINDOW+4;
   
           /**
            * Toast 窗口
            */
           @Deprecated
           public static final int TYPE_TOAST              = FIRST_SYSTEM_WINDOW+5;
   
   				...
           /**
            * 系统窗口类型的结束值
            */
           public static final int LAST_SYSTEM_WINDOW      = 2999;
   ```

   系统窗口的类型值有接近 40 多个，这里只列举了部分，系统窗口的 Type 值范围为 2000 - 2999.

### Window 的标志

Window 的标志也就是 Flag, 用于控制 Window 的现实，同样被定义在 WindowManager 的内部类 LayoutParams 中，一共有  20 多个，这里给出几个比较常用的，如下:

| Window Flag                     | 说明                                                         |
| ------------------------------- | ------------------------------------------------------------ |
| FLAG_ALLOW_LOCK_WHILE_SCREEN_ON | 只要窗口可见，就允许在开启状态的屏幕上锁屏                   |
| FLAG_NOT_FOCUSABLE              | 窗口不能获得输入焦点，设置该标志的同时，FLAG_NOT_TOUCH_MODAL 也会被设置 |
| FLAG_NOT_TOUCHABLE              | 窗口不接收任何触摸事件                                       |
| FLAG_NOT_TOUCH_MODAL            | 将该窗口区域外的触摸事件传递给其它的 Window,而自己只会处理窗口区域内的触摸事件 |
| FLAG_KEEP_SCREEN_NO             | 只要窗口可见，屏幕就会一直常亮                               |
| FLAG_LAYOUT_NO_LIMITS           | 允许窗口超过屏幕之外                                         |
| FLAG_FULISCREEN                 | 隐藏所有的屏幕装饰窗口，比如在游戏、播放器中的全屏显示       |
| FLAG_SHOW_WHEN_LOCKED           | 窗口可以在锁屏的窗口之上显示                                 |
| FLAG_IGNORE_CHEEK_PRESSES       | 当用户的脸贴近屏幕时（比如打电话），不会去响应事件           |
| FLAG_TURN_SCREEN_NO             | 窗口显示时将屏幕点亮                                         |

设置 Window 的 Flag 有 3 种方法

1. 通过 Window 的 addFlag 方法

   ```java
   Window mWindow = getWindow();
   mWindow.addFlay(WindowManager.LayoutParams.FLAG_FULLSCREEN);
   ```

2. 通过 Window 的 setFlags 方法

   ```java
   Window mWindow = getWindow();
   mWindow.setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,WindowManager.LayoutParams.FLAG_FULLSCREEN)
   ```

3. 给 LayoutParams 设置 Flag, 并通过 WindowManager 的 addView 方法进行添加

   ```java
   WindowManager.LayoutParams mWindowLayoutParams = new WindowManager.LayoutParams();
   mWindowLayoutParams.flags = WindowManager.LayoutParams.FLAG_FULLSCREEN;
   WindowManager mWindowManager = (WindowManager)getSystemService(Context.WINDOW_SERVICE);
   Text mText = new Text(this);
   mWindowManager.addView(mTextView,mWindowLayoutParams);
   ```

### 软件盘相关模式

窗口与窗口的叠加是十分常见的场景，但是如果其中的窗口是软件盘的窗口，可能就会出现一些问题，比如典型的用户登录页面，默认的情况弹出软件盘窗口可能遮挡输入框下方的按钮，这样用户体验非常糟糕。为了使得软键盘窗口能够按照期望来显示， WindowManager 的静态内部类 LayoutParams 中定义了软件盘相关模式，这里给出常用的几个:

| SoftInputMode                  | 描述                                                       |
| ------------------------------ | ---------------------------------------------------------- |
| SOFT_INPUT_STATE_UNSPECIFIED   | 没有设定状态，系统会选择一个合适的状态或依赖于主题的设置   |
| SOFT_INPUT_STATE_UNCHANGED     | 不会改变软键盘状态                                         |
| SOFT_INPUT_STATE_ALWAYS_HIDDEN | 当窗口获取焦点时，软键盘总是被隐藏                         |
| SOFT_INPUT_ADJUST_RESIZE       | 当软键盘弹出时，窗口会调整大小                             |
| SOFT_INPUT_ADJUST_PAN          | 当软键盘弹出时，窗口不需要调整大小，要确保输入焦点是可见的 |
| SOFT_INPUT_STATE_HIDDEN        | 当用户进入该窗口时，软键盘默认隐蔽                         |

从上面给出的 SoftInputMode ，可以发现，它们与 AndroidManifest.xml 中 Activity 的属性 android:windowsoftInputMode 是对应的。因此，除了在 AndroidManifest.xml 中为 Activity 配置还可以通过代码动态配置，如下所示:

```java
geWindow().setSoftInputMode(MindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
```

## Window 的操作

WindowManager 对 Window 进行管理，说到管理肯定离不开 add、update、remove 等一系列操作，对于这些操作最后是交由 WMS 来进行处理。通过上面的介绍我们知道 Window 分为 3 大类 ApplicationWindow(应用程序窗口)、SubWindow(子窗口)、SystemWindow(系统窗口), 对于不同类型的添加过程会有所不同，但是对于 WMS 处理确实一样的，下面画了一张简图，有助于理解:

![Mu834J.png](https://s2.ax1x.com/2019/11/10/Mu834J.png)

### 系统窗口的添加过程

根据上面文章介绍我们知道 Window 分为三大类型，不同的 Window 类型添加过程也不同，本小节就来分析系统窗口的添加过程。系统添加也会根据不同的系统窗口有所区别，那么这里以我们常用的 Toast 来分析添加到 SystemWindow 中的过程,这里 Toast 不会像之前介绍四大组件启动分析，我们主要挑重点讲解，毕竟主角还是添加的过程，感兴趣的可以自行阅读 Toast 源码，下面我们来看 Toast 的 makeText 方法源码实现,代码如下:

```java
  //Toast  
	public static Toast makeText(@NonNull Context context, @Nullable Looper looper,
            @NonNull CharSequence text, @Duration int duration) {
       //1. 实例化 Toast 对象
    		Toast result = new Toast(context, looper);
				
        LayoutInflater inflate = (LayoutInflater)
                context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
    		//2. 内部解析 XML 为一个 View 的过程
        View v = inflate.inflate(com.android.internal.R.layout.transient_notification, null);
        TextView tv = (TextView)v.findViewById(com.android.internal.R.id.message);
        tv.setText(text);
				//3. 记住这里 mNextView 它就是我们待会要添加的对象
        result.mNextView = v;
        result.mDuration = duration;

        return result;
    }


    final TN mTN;
    int mDuration;
    View mNextView;

    public Toast(@NonNull Context context, @Nullable Looper looper) {
        mContext = context;
        mTN = new TN(context.getPackageName(), looper);
        mTN.mY = context.getResources().getDimensionPixelSize(
                com.android.internal.R.dimen.toast_y_offset);
        mTN.mGravity = context.getResources().getInteger(
                com.android.internal.R.integer.config_toastDefaultGravity);
    }
```

通过 makeText 我们得知 Toast 主要就做了添加了一个默认布局的 View ，然后将 View 赋值给了 Toast 的 mNextView 变量，下面我们来看 Toast show 方法，代码如下:

```java
//Toast.java
    public void show() {
        if (mNextView == null) {
            throw new RuntimeException("setView must have been called");
        }
				//1. 拿到 NMS 代理类
        INotificationManager service = getService();
        String pkg = mContext.getOpPackageName();
      	//2. TN 接收 NMS 消息
        TN tn = mTN;
        tn.mNextView = mNextView;

        try {
          //3. 通知 NMS 调用 enqueueToast 方法
            service.enqueueToast(pkg, tn, mDuration);
        } catch (RemoteException e) {
            // Empty
        }
    }

  private static class TN extends ITransientNotification.Stub {
    ...
  }
```

通过上面代码我们知道首先拿到 INotificationManager ，然后将创建好的 mTN 赋值给 TN 对象，它继承自 ITransientNotification.Stub Binder对象说明具备了接收进程间通信的功能，最后调用 INotificationManager 的 enqueueToast 方法来通知 NotificationManagerService,下面我们来看 NMS 的 enqueueToast 具体实现，代码如下:

```java
//NotificationManagerService.java
public class NotificationManagerService extends SystemService {
  ....
      private final IBinder mService = new INotificationManager.Stub() {
        @Override
        public void enqueueToast(String pkg, ITransientNotification callback, int duration)
        {
           ...

            synchronized (mToastQueue) {
                int callingPid = Binder.getCallingPid();
                long callingId = Binder.clearCallingIdentity();
                try {
                    ToastRecord record;
                    ...
                    //1. 
                    record = new ToastRecord(callingPid, pkg, callback, duration, token);
                        
                    if (index == 0) {
                      //2. 
                        showNextToastLocked();
                    }
                } finally {
                    Binder.restoreCallingIdentity(callingId);
                }
            }
        }  
  }
  ....
  
}

    void showNextToastLocked() {
        ToastRecord record = mToastQueue.get(0);
        while (record != null) {
            try {
              	//3. 
                record.callback.show(record.token);
                scheduleTimeoutLocked(record);
                return;
            } catch (RemoteException e) {
               ....
        }
    }
```

通过上面代码我们知道在 Toast 调用到 NMS 中，然后构造 ToastRecord 对象将 pkg、callback 等对象传递进去，然后调用注释 3 record.callback.show 函数，这里的 callback 就是定义在 Toast 中接收 NMS 消息的，我们回到 Toast 中 show(Binder binder) 方法，代码如下:

```java
//Toast.java
        @Override
        public void show(IBinder windowToken) {
            //1. 
            mHandler.obtainMessage(SHOW, windowToken).sendToTarget();
        }


            mHandler = new Handler(looper, null) {
                @Override
                public void handleMessage(Message msg) {
                    switch (msg.what) {
                        case SHOW: {
                            IBinder token = (IBinder) msg.obj;
                          //2. 
                            handleShow(token);
                            break;
                        }
                        ...
                        }
                    }
                }
            };
```

上面就是一个简单的线程间通信操作，我们直接看注释 2 具体实现，代码如下:

```java
//Toast.java

        public void handleShow(IBinder windowToken) {
            ....
            if (mView != mNextView) {
  							...
                /**
                 * 1. 添加的对象
                 */
                mView = mNextView;
                Context context = mView.getContext().getApplicationContext();
                String packageName = mView.getContext().getOpPackageName();
                if (context == null) {
                    context = mView.getContext();
                }
                /**
                 * 1. 拿到 WindowManager
                 */
                mWM = (WindowManager)context.getSystemService(Context.WINDOW_SERVICE);
                ...
                try {
                    /**
                     * 3. 调用 WindowManager addView 添加
                     */
                    mWM.addView(mView, mParams);
                    trySendAccessibilityEvent();
                } catch (WindowManager.BadTokenException e) {
                    /* ignore */
                }
            }
        }
```

我们直接看上面最重要的代码注释 3 ，调用 WindowManager 的 addView 方法，通过上面的介绍，我们知道 WindowManager 的实现是在 WindowManagerImpl ，具体实现代码如下:

```java
//WindowManagerImpl.java

    @Override
    public void addView(@NonNull View view, @NonNull ViewGroup.LayoutParams params) {
        applyDefaultToken(params);
        /**
         * 委托给 WindowManagerGlobal 来处理 addView
         */
        mGlobal.addView(view, params, mContext.getDisplay(), mParentWindow);
    }
```

addView 的第一个参数类型为 View ，说明窗口都是以 View 的形式存在的，addView 方法中会调用 WindowManagerGlobal 对象中 addView  方法，代码如下：

```java
//
    public void addView(View view, ViewGroup.LayoutParams params,
            Display display, Window parentWindow) {
    ...

        final WindowManager.LayoutParams wparams = (WindowManager.LayoutParams) params;
        if (parentWindow != null) {
            /**
             * 1. 根据 WindowManager.LayoutParams 的参数来对添加的子窗口进行相应的调整
             */
            parentWindow.adjustLayoutParamsForSubWindow(wparams);
        } else {
            ...
        }

        ViewRootImpl root;
        View panelParentView = null;

        synchronized (mLock) {
            ...
            /**
             * 2. 实例化 ViewRootImpl 对象，并赋值给 root 变量
             */
            root = new ViewRootImpl(view.getContext(), display);

            view.setLayoutParams(wparams);

            /**
             * 3. 添加 view 到 mViews 列表中
             */
            mViews.add(view);
            /**
             * 4. 将 root 存储在 ViewRootImp 列表中
             */
            mRoots.add(root);
            /**
             * 5. 将窗口的参数保存到布局参数列表中。
             */
            mParams.add(wparams);

            try {
                /**
                 * 6. 将窗口和窗口的参数通过 setView 方法设置到 ViewRootImpl 中
                 */
                root.setView(view, wparams, panelParentView);
            } catch (RuntimeException e) {
                // BadTokenException or InvalidDisplayException, clean up.
                if (index >= 0) {
                    removeViewLocked(index, true);
                }
                throw e;
            }
        }
    }
```

通过上面代码我们可以知道主要做了 6 件事儿，如下:

1. 根据 WindowManager.LayoutParams 的参数来对添加的子窗口进行相应的调整.
2. 实例化 ViewRootImpl 对象，并赋值给 root 变量
3. 添加 view 到 mViews 列表中
4. 将 root 存储在 ViewRootImp 列表中
5. 将窗口的参数保存到布局参数列表中
6. 将窗口和窗口的参数通过 setView 方法设置到 ViewRootImpl 中

最后经过一系列的操作到了第 6 步，可见我们添加窗口这一操作是通过 ViewRootImpl 来进行的。ViewRootImpl 身负很多职责，主要有以下几点:

1. View 树的根并管理 View 树
2. 触发 View 的测量、布局、绘制
3. 输入事件的中转站
4. 管理 surface
5. 负责与 WMS 进行系统间通信

了解到了 ViewRootImpl 的职责后，我们接着来查看 ViewRootImpl 的 setView 方法:

```java
//ViewRootImpl.java
 public void setView(View view, WindowManager.LayoutParams attrs, View panelParentView) {
    synchronized (this) {
     ...
      try {
                    mOrigWindowType = mWindowAttributes.type;
                    mAttachInfo.mRecomputeGlobalAttributes = true;
                    collectViewAttributes();
                    res = mWindowSession.addToDisplay(mWindow, mSeq, mWindowAttributes,
                            getHostVisibility(), mDisplay.getDisplayId(),
                            mAttachInfo.mContentInsets, mAttachInfo.mStableInsets,
                            mAttachInfo.mOutsets, mInputChannel);
                } catch (RemoteException e) {
                   ...
                }  
       
     ...
      
    }
   
 }
```

setView 方法中有很多逻辑，这里只截取重要代码，主要就是调用 mWindowSession 类型的 WindowSession 的 addToDisplay 方法，它是一个 Binder 对象，它的服务端的实现是 Session 类，我们先来看一张图，来看下 ViewRootImpl 、IWindowSession、WMS、Session 之间的关系，如下:

![MusD3V.png](https://s2.ax1x.com/2019/11/10/MusD3V.png)

我们具体来看下它的实现，代码如下:

```java
//Session.java
public class Session extends IWindowSession.Stub implements IBinder.DeathRecipient {
  
  final WindowManagerService mService;
  ...
        @Override
    public int addToDisplay(IWindow window, int seq, WindowManager.LayoutParams attrs,
            int viewVisibility, int displayId, Rect outContentInsets, Rect outStableInsets,
            Rect outOutsets, InputChannel outInputChannel) {
        return mService.addWindow(this, window, seq, attrs, viewVisibility, displayId,
                outContentInsets, outStableInsets, outOutsets, outInputChannel);
    }
  ...
  
}
        
        
```

通过上面代码我们知道本地进程的 ViewRootImpl 想要和 WMS 进行通信需要经过 Session, 那么 Session 为何包含在 WMS 中呢？ 我们看上面代码知道，Session 内部的 addToDisplay 方法，其实就是调用 WMS 的 addWindow 方法。并将自身也就是 Session 作为参数传递进去，那么这样每一个应用程序进程都会对应一个 Session ,WMS 会调用 ArrayList 来保存这些 Session。这也是为什么 WMS 包裹 Session 的原因了。这样剩下的工作就交给 WMS 来处理了，在 WMS 中会为这个添加的窗口分配 Surface ，可见负责显示界面的是 Surface 而不是 Window. WMS 会将它所管理的 Surface 交由 SurfaceFlinger 处理，SurfaceFlinger 会将这些 Surface 混合并绘制到屏幕上。

WMS 窗口添加部分我们会在下一篇文章中来单独分析，系统窗口 Toast 的添加过程就分析到这里，下面我们看应用程序的 Window 添加过程。

### Activity 的添加过程

无论是哪种窗口，它的添加过程在 WMS 处理部分中基本是类似的，只是在 WindowManager 处理部分会有所不同，这里就以最典型的 Activity 为例，Activity 在启动过程中，如果 Activity 所在的进程不存在则会创建新的进程，创建新的进程之后就会运行代表主线程的实例 ActivityThread, ActivityThread 管理着当前应用程序进程的线程，这在 Activity 的启动过程中运用得很明显，当界面要与用户进行交互时，会调用 ActivityThread 的 handleResumeActivity 方法，如下所示:

```java
//ActivityThread.java
    final void handleResumeActivity(IBinder token,
            boolean clearHide, boolean isForward, boolean reallyResume, int seq, String reason) {
      ...

        /**
         * 1. 最终会调用 Activity onResume 生命周期函数
         */
        r = performResumeActivity(token, clearHide, reason);

        if (r != null) {
          ...
            if (r.window == null && !a.mFinished && willBeVisible) {
                r.window = r.activity.getWindow();
                View decor = r.window.getDecorView();
                decor.setVisibility(View.INVISIBLE);
                /**
                 * 2. 得到 ViewManager 对象
                 */
                ViewManager wm = a.getWindowManager();
                WindowManager.LayoutParams l = r.window.getAttributes();
                a.mDecor = decor;
                l.type = WindowManager.LayoutParams.TYPE_BASE_APPLICATION;
                l.softInputMode |= forwardBit;
                if (r.mPreserveWindow) {
                    a.mWindowAdded = true;
                    r.mPreserveWindow = false;
                    ViewRootImpl impl = decor.getViewRootImpl();
                    if (impl != null) {
                        impl.notifyChildRebuilt();
                    }
                }
                if (a.mVisibleFromClient) {
                    if (!a.mWindowAdded) {
                        a.mWindowAdded = true;
                        /**
                         * 3. 调用 ViewManager 的 addView 方法
                         */
                        wm.addView(decor, l);
                    } else {
                      
                        a.onWindowAttributesChanged(l);
                    }
                }

           ...
        }
    }
```

通过上面代码我们得到 3 个重要信息，其一，通过注释 1 会执行 Activity 的 onResume 生命周期函数，其二，拿到 ViewManager 对象，这里 ViewManager 在之前介绍过，它是一个接口由 WindowManager 继承，最后在 WindowManagerImpl 中具体实现，所以其三，注释三就是调用 WindowManagerImpl 的 addView 方法, 剩下的调用跟 Toast 的执行流程一样，这里就不再重复讲一遍了。下面我们来分析 Window 的更新过程

### Window 的更新过程

Window 的更新过程和 Window 的添加过程是类似的，需要调用 ViewManager 的 updateViewlayout 方法，updateViewLayout 方法在 WindowmanagerImpl 中实现， WindowManagerImpl 的 updateViewLayout 方法的调用 WindowManagerGlobal 的 updateViewLayout 方法，如下所示:

```java
//WindowManagerGlobal.java
    public void updateViewLayout(View view, ViewGroup.LayoutParams params) {
        if (view == null) {
            throw new IllegalArgumentException("view must not be null");
        }
        if (!(params instanceof WindowManager.LayoutParams)) {
            throw new IllegalArgumentException("Params must be WindowManager.LayoutParams");
        }

        final WindowManager.LayoutParams wparams = (WindowManager.LayoutParams)params;

        /**
         * 1. 将更新的参数设置到 View 中
         */
        view.setLayoutParams(wparams);

        synchronized (mLock) {
            /**
             * 2. 得到要更新的窗口在 View 列表中的索引
             */
            int index = findViewLocked(view, true);
            /**
             * 3. 根据索引得到窗口的 ViewRootImpl
             */
            ViewRootImpl root = mRoots.get(index);
            /**
             * 4. 删除旧的参数
             */
            mParams.remove(index);
            /**
             * 5.重新添加新的参数
             */
            mParams.add(index, wparams);
            /**
             * 6.将更新的参数设置到 ViewRootImpl 中
             */
            root.setLayoutParams(wparams, false);
        }
    }
```

上面拿到需要更新的 ViewRootImpl 然后调用它的 setLayoutParams 把参数传递进去，我们来看下注释 6 的代码实现:

```java
//ViewRootImpl.java
  void setLayoutParams(WindowManager.LayoutParams attrs, boolean newView) {
    ...
      
    scheduleTraversals();
    
  }
```

```java
//ViewRootImpl.java
final TraversalRunnable mTraversalRunnable = new TraversalRunnable();

final class TraversalRunnable implements Runnable {
  ....
}

    void scheduleTraversals() {
        if (!mTraversalScheduled) {
            mTraversalScheduled = true;
            mTraversalBarrier = mHandler.getLooper().getQueue().postSyncBarrier();
            /**
             * mChoreographer：用于接收显示系统的 VSync 信号，在下一帧渲染时控制执行一些操作，
             * 用于发起添加回调 在 mTraversalRunnable 的 run 中具体实现
             */
            mChoreographer.postCallback(
                    Choreographer.CALLBACK_TRAVERSAL, mTraversalRunnable, null);
            if (!mUnbufferedInputDispatch) {
                scheduleConsumeBatchedInput();
            }
            notifyRendererOfFramePending();
            pokeDrawLockIfNeeded();
        }
    }
```

根据注释我们直接看 TraversalRunnable 的 run 实现，代码如下:

```java
//ViewRootImpl.java
    final class TraversalRunnable implements Runnable {
        @Override
        public void run() {
          //调用内部的 doTraversal 方法
            doTraversal();
        }
    }
```

```java
//ViewRootImpl.java

    void doTraversal() {
        if (mTraversalScheduled) {
            mTraversalScheduled = false;
            mHandler.getLooper().getQueue().removeSyncBarrier(mTraversalBarrier);

            if (mProfile) {
                Debug.startMethodTracing("ViewAncestor");
            }

            performTraversals();

            if (mProfile) {
                Debug.stopMethodTracing();
                mProfile = false;
            }
        }
    }
```

在 doTraversal 中又调用了 performTraversals 方法，继续跟，代码如下:

```java
//ViewRootImpl.java
private void performTraversals() {
  /**
   * 1. 内部会调用 IWindowSession 的 relayout 方法来更新 Window 视图
   */
   relayoutResult = relayoutWindow(params, viewVisibility, insetsPending);
  ...
  /**
   * 2.内部调用 View 的 measure 测试方法
   */
    performMeasure(childWidthMeasureSpec, childHeightMeasureSpec);
  ...
   /**
   * 3. 内部会调用 View 的 layout 完成 View 的布局工作
   */
   performLayout(lp, mWidth, mHeight);
  ...
  /**
   * 4. 内部会调用 View 的 draw 方法，完成了 View 的绘制工作。
   */
   performDraw();
  ...
}
```

通过上面 performTraversals 函数，内部进行了 View 的 measure、layout、draw 这样就完成了 View 的绘制流程。在 performTraversals 方法中更新了 Window 视图，这样就完成了 Window 的更新。

## 总结

该篇文章学习了 WindowManager 的相关知识点，包括 WindowManager 的关联类、Window 的属性和 Window 的操作，下一篇文章将为来家带来 WindowManagerService 源码分析，敬请期待！



感谢你的阅读，希望对你有帮助！

## 参考

- 《Android 进阶解密》