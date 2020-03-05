## LayoutInflater 介绍

在 Android 中 LayoutInflater 是扮演者很重要的角色，很多时候我们忽略了它的重要性，因为它的重要性完成被隐藏起来了，可以说是直接隐藏在了Activity , Fragment  等组件的光环之下了。

## from(mContext) 源码解析

在 Android 系统中，我们经常以 Context 获取系统级别的服务，比如 AMS, WMS, LayoutInfoater 等，这些服务会在合适的时候注册在系统中，在我们需要的时候 getSS(String name) 通过系统的名字来获取。我们先来看一段代码：

这里我就拿 Activity setContentView() 举例

```java
    @Override
    public void setContentView(@LayoutRes int layoutResID) {
        getDelegate().setContentView(layoutResID);
    }
```

继续跟下去：

```java
    /**
     * Should be called instead of {@link Activity#setContentView(int)}}
     */
    public abstract void setContentView(@LayoutRes int resId);
```

跟下去发现是一个抽象类，我们找它的实现类：

```java
    @Override
    public void setContentView(int resId) {
        ensureSubDecor();
        ViewGroup contentParent = (ViewGroup) mSubDecor.findViewById(android.R.id.content);
        contentParent.removeAllViews();
      //通过 LayoutInflater 加载 XML id 
        LayoutInflater.from(mContext).inflate(resId, contentParent);
        mOriginalWindowCallback.onContentChanged();
    }
```

我们在 AppCompatDelegateImpl 类找到了实现类，眼神好的是不是发现了上面的 LayoutInflater ，没错我们 Activity 最后也是通过 LayoutInflater 解析 XML 加载布局的，继续跟 from 函数：

```java
    /**
     * Obtains the LayoutInflater from the given context.
     */
    public static LayoutInflater from(Context context) {
        LayoutInflater LayoutInflater =
                (LayoutInflater) 
          //通过 Context 获取服务
          context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        if (LayoutInflater == null) {
            throw new AssertionError("LayoutInflater not found.");
        }
        return LayoutInflater;
    }
```

通过上面代码可以知道，LayoutInflater 是通过 Context 的 getSystemService(String name) 来获取到的。context 的 getSS 函数怎么获取到的勒，下面我们就来介绍下 Context 的源码。

### Context

其实在 Application，Activity，Service 中都会存在一个 Context 对象，我们叫其上下文，可以通过这个上下文，启动 Activity,Service, 注册一个广播，获取系统服务等等操作，那么 Context 是怎么创建出来的勒，先来看一段代码：

```java
public abstract class Context {...}
```

Context 是一个抽象类，我们找下它的实现类，我们知道在启动 Activity 的时候有一个 Context 上下文，启动 Activity 的入口在 ActivityThread main 函数，我们就从这里开始找

```java
    //通过反射调用执行的
    public static void main(String[] args) {
      	...
        //主线程消息循环
        Looper.prepareMainLooper();
        //创建 ActivityThread 对象
        ActivityThread thread = new ActivityThread();
        //Application,Activity 入口
        thread.attach(false);
        Looper.loop();
      
				...
        throw new RuntimeException("Main thread loop unexpectedly exited");
    }
```

```java

    private void attach(boolean system) {
        sCurrentActivityThread = this;
        mSystemThread = system;
        //不是系统级别的应用
        if (!system) {
            ViewRootImpl.addFirstDrawHandler(new Runnable() {
                @Override
                public void run() {
                    ensureJitEnabled();
                }
            });
            android.ddm.DdmHandleAppName.setAppName("<pre-initialized>",
                                                    UserHandle.myUserId());
            RuntimeInit.setApplicationObject(mAppThread.asBinder());
            final IActivityManager mgr = ActivityManager.getService();
            try {
                //通过 IActivityManager。aidl 文件 底层通过 Binder 通信，关联 Application
                mgr.attachApplication(mAppThread);
            } catch (RemoteException ex) {
                throw ex.rethrowFromSystemServer();
            }
           ...
        } else {
          代码省略
           ....
    }
```

在 main 方法中，我们创建了 ActivityThread 对象后，调用了其 attach 函数，并且参数为 false。在 attach 函数中，参数为 false 的情况下是属于非系统应用，会通过 Binder 机制与 AMS 通信，并且最终调用  H 类的 LAUNCH_ACTIVITY - > handleLaunchActivity 函数，我们看下该函数的实现:

```java
  /**
     *
     *启动 Activity
     * @param r
     * @param customIntent
     * @param reason
     */
    private void handleLaunchActivity(ActivityClientRecord r, Intent customIntent, String reason) {
      //实施 启动 Activity 的实例
        Activity a = performLaunchActivity(r, customIntent);

    }
```

继续跟：

```java

/***启动 Activity 代码*/
    private Activity performLaunchActivity(ActivityClientRecord r, Intent customIntent) {
 ....
        //1. 创建 Context 对象
        ContextImpl appContext = createBaseContextForActivity(r);
        Activity activity = null;

.....
        try {
            // 2. 制作 Application 对象
            Application app = r.packageInfo.makeApplication(false, mInstrumentation);

            if (activity != null) {
                //3. 获取 Context 对象
                CharSequence title = r.activityInfo.loadLabel(appContext.getPackageManager());
                Configuration config = new Configuration(mCompatConfiguration);
                appContext.setOuterContext(activity);
                //4. 将 appContext 等对象依附在 Activity 的 attach 函数中
                activity.attach(appContext, this, getInstrumentation(), r.token,
                        r.ident, app, r.intent, r.activityInfo, title, r.parent,
                        r.embeddedID, r.lastNonConfigurationInstances, config,
                        r.referrer, r.voiceInteractor, window, r.configCallback);
                //是否是持久化
                if (r.isPersistable()) {
                    mInstrumentation.callActivityOnCreate(activity, r.state, r.persistentState);
                } else {
                    //5. 调用 Activity 的 onCreate 方法
                    mInstrumentation.callActivityOnCreate(activity, r.state);
                }
           ....
        return activity;
    }
```

```Java

/***Context 的实现类 ContextImp*/
    private ContextImpl createBaseContextForActivity(ActivityClientRecord r) {
        //1.创建 Activity 的 Context 对象, 到这里点击 ContextImpl 是 Context 实现类
        ContextImpl appContext = ContextImpl.createActivityContext(
                this, r.packageInfo, r.activityInfo, r.token, displayId, r.overrideConfig);

      ....
        return appContext;
    }
```

```java
/**
 * Common implementation of Context API, which provides the base
 * context object for Activity and other application components.
 */
class ContextImpl extends Context {
  ...
}
```

通过上面代码 1- 5 的注释分析可知，Context 的实现类是 ContextImpl, 这里我们相当于又带着大家复习了一遍 Application , Activity 启动源码了。

### getSystemService

通过上面我们得知 ContextImpl 是 Context 的实现类，我们继续看源码

```java
public class ContextImpl extends Context{
  ...
   
  /**
  * 通过服务名称代号 Context.XXX 拿到系统各种服务
  */
        @Override
	public Object getSystemService(String name) {
   return SystemServiceRegistry.getSystemService(this, name);
	}
  ...
}
```

这里我们发现返回的是 SystemServiceRegistry 类里面的 getSystemService 函数，继续跟：

```java
    /**
     * Gets a system service from a given context.
     */
    public static Object getSystemService(ContextImpl ctx, String name) {
        ServiceFetcher<?> fetcher = SYSTEM_SERVICE_FETCHERS.get(name);
        return fetcher != null ? fetcher.getService(ctx) : null;
    }
```

```java

    /**
     * 交给子类来实现获取服务
     * 
     */
    static abstract interface ServiceFetcher<T> {
        T getService(ContextImpl ctx);
    }

```

```java
/**
* 装服务的容器
*/
private static final HashMap<String, ServiceFetcher<?>> SYSTEM_SERVICE_FETCHERS =
            new HashMap<String, ServiceFetcher<?>>();
```

到了这里我们知道了通过容器缓存拿到了 LayInflater 服务，那么什么时候注册的？下面我们继续看该类源码

### registerService

```java
final class SystemServiceRegistry {
  		/***装系统各种服务的容器，这里相当于容器单例类*/
      private static final HashMap<String, ServiceFetcher<?>> SYSTEM_SERVICE_FETCHERS =
            new HashMap<String, ServiceFetcher<?>>();
  
    // Not instantiable.
    private SystemServiceRegistry() { }
  
      static {
		 .....
       //注册 LayoutInflater 服务
        registerService(Context.LAYOUT_INFLATER_SERVICE, LayoutInflater.class,
                new CachedServiceFetcher<LayoutInflater>() {
            @Override
            public LayoutInflater createService(ContextImpl ctx) {
                return new PhoneLayoutInflater(ctx.getOuterContext());
            }});
     .....
    }
}
```

```java
    static abstract class CachedServiceFetcher<T> implements ServiceFetcher<T> {
        private final int mCacheIndex;

        public CachedServiceFetcher() {
            mCacheIndex = sServiceCacheSize++;
        }

        @Override
        @SuppressWarnings("unchecked")
        public final T getService(ContextImpl ctx) {
            final Object[] cache = ctx.mServiceCache;
            synchronized (cache) {
                // Fetch or create the service.
                Object service = cache[mCacheIndex];
                if (service == null) {
                    try {
                        service = createService(ctx);
                        cache[mCacheIndex] = service;
                    } catch (ServiceNotFoundException e) {
                        onServiceNotFound(e);
                    }
                }
                return (T)service;
            }
        }

      //交给抽象实现去创建服务
        public abstract T createService(ContextImpl ctx) throws ServiceNotFoundException;
    }
```

通过上面的代码可以知道抽象实现返回的是 new PhoneLayoutInflater(ctx.getOuterContext()); 那么这个 Phone... 到底什么了？ 我们继续跟

```java
public class PhoneLayoutInflater extends LayoutInflater {
  
}
```

真相大白啊，PhoneLayoutInflater 就是继承的 LayoutInflater。

`总结`：

通过上面的代码可知，在虚拟机第一次加载该类时，通过 静态代码块 会注册各种 ServiceFatcher, 这其中就包含了 LayoutInflater Service,    将这些服务以键值对的形式存储在 Map 中, 用户使用时只需要根据 key 来获取对应的 ServiceFetcher, 然后通过 ServiceFetcher 对象的 getService 来获取具体服务对象。当第一次获取时，会调用 ServiceFetcher 的 createService 函数创建服务，然后缓存到一个列表中，下次再取直接从缓存中获取，从而避免了重复创建对象，从而达到了单例的效果，这不就是我之前介绍的[单例模式-容器单例模式](https://juejin.im/post/5d6a8121e51d4561e6237193)嘛，通过容器的单例模式实现方式，系统核心服务以单例形式存在，减少了资源消耗。

## inflate 源码解析

```java
    @Override
    public void setContentView(int resId) {
        ensureSubDecor();
        ViewGroup contentParent = (ViewGroup) mSubDecor.findViewById(android.R.id.content);
        contentParent.removeAllViews();
        LayoutInflater.from(mContext).inflate(resId, contentParent);
        mOriginalWindowCallback.onContentChanged();
    }
```

跟 inflate

```java
    public View inflate(@LayoutRes int resource, @Nullable ViewGroup root) 			{
        // root 不为 null , 则会从resourec 布局解析到 View ,并添加到 root 中
        return inflate(resource, root, root != null);
    }
```

```java
    public View inflate(@LayoutRes int resource, @Nullable ViewGroup root, boolean attachToRoot) {
        final Resources res = getContext().getResources();
        if (DEBUG) {
            Log.d(TAG, "INFLATING from resource: \"" + res.getResourceName(resource) + "\" ("
                    + Integer.toHexString(resource) + ")");
        }
        //获取 XMl 解析器
        final XmlResourceParser parser = res.getLayout(resource);
        try {
            return inflate(parser, root, attachToRoot);
        } finally {
            parser.close();
        }
    }
```

```java
  /**
     *
     * @param parser xml 解析器
     * @param root 解析布局的父视图
     * @param attachToRoot 是否将要解析的视图添加到父视图中
     * @return
     */
public View inflate(XmlPullParser parser, @Nullable ViewGroup root, boolean attachToRoot) {
        synchronized (mConstructorArgs) {
            Trace.traceBegin(Trace.TRACE_TAG_VIEW, "inflate");

            final Context inflaterContext = mContext;
            final AttributeSet attrs = Xml.asAttributeSet(parser);
            Context lastContext = (Context) mConstructorArgs[0];
            //Context 对象
            mConstructorArgs[0] = inflaterContext;
            //存储父视图
            View result = root;

            try {
                // Look for the root node.
                int type;
                //找到 root 元素
                while ((type = parser.next()) != XmlPullParser.START_TAG &&
                        type != XmlPullParser.END_DOCUMENT) {
                    // Empty
                }
                final String name = parser.getName();
                //1. 解析 Merge 布局标签
                if (TAG_MERGE.equals(name)) {
                    if (root == null || !attachToRoot) {
                        throw new InflateException("<merge /> can be used only with a valid "
                                + "ViewGroup root and attachToRoot=true");
                    }

                    rInflate(parser, root, inflaterContext, attrs, false);
                } else {

                    // 根据 Tag 来解析layout 跟视图
                    final View temp = createViewFromTag(root, name, inflaterContext, attrs);

                    ViewGroup.LayoutParams params = null;

                    if (root != null) {
                        // 生成布局参数
                        params = root.generateLayoutParams(attrs);
                        //如果 attachRoot 为 false,那么将给 temp 设置布局参数
                        if (!attachToRoot) {
                            temp.setLayoutParams(params);
                        }
                    }
                    // 解析 temp 下所有子 View
                    rInflateChildren(parser, temp, attrs, true);
                    // 如果 Root 不为空，且 attachToroot 为 true ,那么将 temp 添加到父布局中
                    if (root != null && attachToRoot) {
                        root.addView(temp, params);
                    }
                    //如果 root == null 且 attachToRoot 为 false 那么直接返回 temp
                    if (root == null || !attachToRoot) {
                        result = temp;
                    }
                }

            } catch (XmlPullParserException e) {
               ...
            return result;
        }
    }
```

上述 inflate 方法中，主要有下面几步:

1. 解析 xml 中的根标签
2. 如果根标签是 merge ，那么调用 rInflate 进行解析，rInflate 会将所有的子 View 添加到跟标签中
3. 如果标签是普通元素，那么调用 createViewFromTag 对元素进行解析；
4. 调动 rInflate 解析 temp 根元素下的所有子 View, 并且将这些子 View 都添加到 temp 下
5. 返回解析到的根视图；

我们在看一段代码，先从简单的理解：

```java
    View createViewFromTag(View parent, String name, Context context, AttributeSet attrs,
            boolean ignoreThemeAttr) {
        if (name.equals("view")) {
            name = attrs.getAttributeValue(null, "class");
        }
        try {
            //1. 用户可以通过设置 LayoutInflater 的 factory 来自行解析 View,默认这些 Factory 都为空，可以忽略这段
            View view;
            if (mFactory2 != null) {
                view = mFactory2.onCreateView(parent, name, context, attrs);
            } else if (mFactory != null) {
                view = mFactory.onCreateView(name, context, attrs);
            } else {
                view = null;
            }
           
            if (view == null && mPrivateFactory != null) {
                view = mPrivateFactory.onCreateView(parent, name, context, attrs);
            }
            
            //2. 没有 Factory 的情况下通过 onCreateView 或者 createView 创建 View 
            if (view == null) {
                final Object lastContext = mConstructorArgs[0];
                mConstructorArgs[0] = context;
                try {
                    // 3. 内置 View 控件的解析
                    if (-1 == name.indexOf('.')) {
                        view = onCreateView(parent, name, attrs);
                    } else {
                        //4 自定义 View 的解析
                        view = createView(name, null, attrs);
                    }
                } finally {
                    mConstructorArgs[0] = lastContext;
                }
            }

            return view;
  		...
    }
```

本段代码重点就在注释 2 处，当这个 tag 的名字包含  “.” 时，认为这是一个内置 View, 也就是 

```java
    <TextView
        android:id="@+id/list_item"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        tools:ignore="MissingConstraints" />
```

这里的 TextView 就是 XMl 标签的名字，因此，在执行 infate 时就会调用注释 3 处的 onCreateView 来解析 TextView 标签。那么，当我们自定义 View 时，就会执行注释 4 

```java
    <com.t01.TextView
        android:id="@+id/list_item"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        tools:ignore="MissingConstraints" />
```

在上面的 PhoneLayoutInflater 重写了 onCreateView 方法，该方法就是在 View 标签名的前面设置了一个 “android.widget” 前缀，然后传递给 createView 解析。

那么我们来看下 createView 源码具体实现吧

```java
    //根据完整的路径的类名通过反射机制构造 View 对象
    public final View createView(String name, String prefix, AttributeSet attrs)
            throws ClassNotFoundException, InflateException {
        //1. 通过缓存获取构造函数
        Constructor<? extends View> constructor = sConstructorMap.get(name);
        if (constructor != null && !verifyClassLoader(constructor)) {
            constructor = null;
            sConstructorMap.remove(name);
        }
        Class<? extends View> clazz = null;

        try {
            Trace.traceBegin(Trace.TRACE_TAG_VIEW, name);

            //2. 没有缓存构造函数
            if (constructor == null) {
                // 如果 prefix 不为空，那么构造函数的 View 路径，并且加载该类
                clazz = mContext.getClassLoader().loadClass(
                        prefix != null ? (prefix + name) : name).asSubclass(View.class);

                if (mFilter != null && clazz != null) {
                    boolean allowed = mFilter.onLoadClass(clazz);
                    if (!allowed) {
                        failNotAllowed(name, prefix, attrs);
                    }
                }
                //3. 从 Class 对象中获取构造函数
                constructor = clazz.getConstructor(mConstructorSignature);
                constructor.setAccessible(true);
                //4. 将构造函数存入缓存中
                sConstructorMap.put(name, constructor);
            } else {
               ...
            }

            Object lastContext = mConstructorArgs[0];
            if (mConstructorArgs[0] == null) {
                // Fill in the context if not already within inflation.
                mConstructorArgs[0] = mContext;
            }
            Object[] args = mConstructorArgs;
            args[1] = attrs;
            //5. 通过反射构造 View
            final View view = constructor.newInstance(args);
            if (view instanceof ViewStub) {
                // Use the same context when inflating ViewStub later.
                final ViewStub viewStub = (ViewStub) view;
                viewStub.setLayoutInflater(cloneInContext((Context) args[0]));
            }
            mConstructorArgs[0] = lastContext;
            return view;

  
    }
```

createView 相当来说还比较理解，如果有前缀，那么就构造 View 的完整路径，并且将该类加载到虚拟机中，然后获取该类的构造函数并且缓存下来，在通过构造函数来创建该 View 的对象，最后将对象返回，这就是解析单个 View 的过程。而我们的窗口中时一个视图树， LayoutInflater 需要解析完这棵树，这个功能就交给 rInflateChildren 方法，看下面代码

```java
    void rInflate(XmlPullParser parser, View parent, Context context,
            AttributeSet attrs, boolean finishInflate) throws XmlPullParserException, IOException {
        //1. 获取树的深度，优先遍历
        final int depth = parser.getDepth();
        int type;
        boolean pendingRequestFocus = false;
        //2. 挨个元素解析
        while (((type = parser.next()) != XmlPullParser.END_TAG ||
                parser.getDepth() > depth) && type != XmlPullParser.END_DOCUMENT) {

            if (type != XmlPullParser.START_TAG) {
                continue;
            }

            final String name = parser.getName();

            if (TAG_REQUEST_FOCUS.equals(name)) {
                pendingRequestFocus = true;
                consumeChildElements(parser);
            } else if (TAG_TAG.equals(name)) {
                parseViewTag(parser, parent, attrs);
            } else if (TAG_INCLUDE.equals(name)) { // 解析 include 标签
                if (parser.getDepth() == 0) {
                    throw new InflateException("<include /> cannot be the root element");
                }
                parseInclude(parser, context, parent, attrs);
            } else if (TAG_MERGE.equals(name)) { //解析到 merge 标签，抛出异常，因为 merge 标签必须是根视图
                throw new InflateException("<merge /> must be the root element");
            } else {
                //3. 根据元素名进行解析，又回去了
                final View view = createViewFromTag(parent, name, context, attrs);
                final ViewGroup viewGroup = (ViewGroup) parent;
                final ViewGroup.LayoutParams params = viewGroup.generateLayoutParams(attrs);
                //递归调用进行解析
                rInflateChildren(parser, view, attrs, true);
                //将解析到的 View 添加进 ViewGroup 中，也就是它的 parent
                viewGroup.addView(view, params);
            }
        }
...
    }
```

rInflateChildren 通过深度优先遍历来构造视图树，每解析到一个 View 元素就会递归调用 rInflateChildren ，直到这条路径的最后一个元素，然后在回溯过来将每一个 View 元素添加进 parent 中，通过 rInflateChildren 解析之后，整棵树就构建完毕了。当回调了 onResume 之后，setContentView 设置的内容就会出现在屏幕中了。

## 总结

LayoutInflater 涉及的知识源码还是挺多的，有 Application , Activity 的启动，还有深度广度遍历，XML 节点解析，容器单例模式。这里也相当于带着大家温习了一遍 Activity 启动流程吧。

好了，到了这里相信大家对 setContentView 之后干了些什么事儿，已经有一定了解了。

感谢你的阅读，谢谢！

