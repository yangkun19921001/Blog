## 前言

上一篇文章我们分析了  **WindowManager**,  该篇文章我们就该分析 WindowManager 的管理者 **WindowManagerService** 了，WMS 不只是 WindowManager 的管理者，它还有很多重要的职责，该篇文章将为大家分析 WMS 的职责、WMS 的创建过程、WMS 的成员以及 Window 在 WMS 中的添加和删除操作，在阅读该篇文章之前，请保证已经对 WindowManager 有过了解，如果没有了解过请先看 [Android 8.0 源码分析 (九) WindowManager](https://juejin.im/post/5dc7d729f265da4cf85d7feb) 的内容。

## WMS 的职责

很多开发者应该都知道 WMS 是 Android 中很重要的一个服务，它是 WindowManager 的管理者，WMS 无论对于应用开发还是 Framework 开发都是重要的知识点，其原因是因为 WMS 有很多职责，每个职责都会涉及重要且复杂的系统，这使得 WMS 就像一个十字路口的交通灯一样，没有了这个交通灯，十字路口就无法正常通车。WMS 的职责用简洁的语言介绍主要有以下几点。

### 1. 窗口管理

WMS 是窗口的管理者，它负责窗口的启动、添加和删除。另外窗口的大小和层级也是由 WMS 进行管理的。窗口管理的核心成员有 DisplayContent、WindowToken 和 WindowState.

### 2. 窗口动画

窗口间进行切换时，使用动画可以显得更炫一些，窗口动画由 WMS 的动画子系统来负责，动画子系统的管理者为 WindowAnimator。

### 3. 输入系统中转站

通过对窗口的触摸从而产生触摸事件，InputManagerService(IMS) 会对触摸事件进行处理，它会寻找一个最合适的窗口来处理触摸反馈信息，WMS 是窗口的管理者，它作为输入系统的中转站再合适不过了。

### 4. Surface 管理

窗口不具备绘制功能，因此每个窗口都需要有一块 Surface 来供自己绘制，为每个窗口分配 Surface 是由 WMS 来完成的。

**小总结:**

WMS 的职责可以简单总结为下图所示:

![MKypOU.png](https://s2.ax1x.com/2019/11/10/MKypOU.png)

从上图我们了解到 WMS 整个是很复杂的，与它关联的有窗口管理、窗口动画、输入系统中转站和 Surface 管理, 它们每一个都是重要且复杂的系统，本章就对窗口管理来进行分析，因为它跟我们应用开发关系真的是太紧密了。

## WMS 创建过程

在介绍 WMS 之前我们还是非常有必要知道 WMS 是合适创建的，如果对 SystemServer 了解的话应该知道 WMS 是在系统进程中进行启动的，感兴趣的可以看 [Android 8.0 源码分析 (一) SystemServer 进程启动](https://juejin.im/post/5db3f95ee51d4529e83947f9) 里面有详细的介绍， 下面我们直接看 SystemServer 的入口 main 方法，代码如下:

```java
//SystemServer.java
    /**
     * 这里的 main 函数 主要是 zygote 通过反射调用
     */
    public static void main(String[] args) {
        new SystemServer().run();
    }
```

在 main 方法中调用了 SystemServer 的 run 方法，代码如下:

```java
//SystemServer.java
    private void run() {
        try {
           ...
            /**
             * 创建 主线程的消息 Looper
             */

            Looper.prepareMainLooper();

            // Initialize native services.
            /**
             * 1. 加载动态库 libandroid_servers .so
             */
            System.loadLibrary("android_servers");

      			...
            /**
             * 创建系统级别的 Context
             */
            createSystemContext();

            /**
             * 2. 创建 SystemServiceManager 它会对系统服务进行创建、启动和生命周期管理
             */
            mSystemServiceManager = new SystemServiceManager(mSystemContext);
            mSystemServiceManager.setRuntimeRestarted(mRuntimeRestart);
            LocalServices.addService(SystemServiceManager.class, mSystemServiceManager);
            // Prepare the thread pool for init tasks that can be parallelized
            SystemServerInitThreadPool.get();
        } finally {
            traceEnd();  // InitBeforeStartServices
        }

        // Start services.
        try {
            traceBeginAndSlog("StartServices");
            /**
             * 3. SystemServiceManager启动了 AMS 、PowerMS、PackageMS 等服务
             */
            startBootstrapServices();
            /**
             * 4. 启动了 DropBoxManagerService、BatteryService、UsageStatsService 和 WebViewUpdateService
             */
            startCoreServices();
            /**
             * 5. 启动了CameraService、AlarmManagerService、VrManagerService 等服务。
             */
            startOtherServices();
            SystemServerInitThreadPool.shutdown();
        } catch (Throwable ex) {
          ...
        } finally {
            traceEnd();
        }
				...
    }
```

如果看过我分析 Android 8.0 源码的知道这里的 main 函数，已经分析过很多次了，上面注释也很清楚那么我们就知道来到 WMS 初始化的地方吧，请看注释 5 的 startOtherServices 方法，代码如下:

```java
//SystemServer.java
    private void startOtherServices() {
     ... 
      
      			/**
             * 1. 得到 Watchdog,它是用来监控系统的一些关键服务的运行状况
             */
            final Watchdog watchdog = Watchdog.getInstance();
            /**
             * 2. 对 Watchdog 进行一些初始化
             */
            watchdog.init(context, mActivityManagerService);
            traceEnd();

            traceBeginAndSlog("StartInputManagerService");
            /**
             * 3. 创建 IMS 服务，并赋值给 inputManager
             */
            inputManager = new InputManagerService(context);
            traceEnd();

            traceBeginAndSlog("StartWindowManagerService");
            // WMS needs sensor service ready
            ConcurrentUtils.waitForFutureNoInterrupt(mSensorServiceStart, START_SENSOR_SERVICE);
            mSensorServiceStart = null;
            /**
             * 4. 执行 WMS main 方法，其内部会初始化 WMS
             */
            wm = WindowManagerService.main(context, inputManager,
                    mFactoryTestMode != FactoryTest.FACTORY_TEST_LOW_LEVEL,
                    !mFirstBoot, mOnlyCore, new PhoneWindowManager());
            /**
             * 5. 将 WMS 注册到 ServiceManager 中
             */
            ServiceManager.addService(Context.WINDOW_SERVICE, wm);
            /**
             * 6.将 IMS 注册到 ServiceManager 中
             */
            ServiceManager.addService(Context.INPUT_SERVICE, inputManager);
            traceEnd();
      
      ...
        
         try {
            /**
             * 7. 初始化屏幕显示信息
             */
            wm.displayReady();
        } catch (Throwable e) {
         ...
        }
      ...
        try {
            /**
             * 8. 用来通知 WMS ,系统的初始化已经完成，其内部调用 WindowManagerPolicy 的 systemReady 方法
             */
            wm.systemReady();
        } catch (Throwable e) {
         ...
        }
      ...
    }
```

startOtherServices 方法主要用于启动系统其它服务，启动的服务大概有 100 个左右，上面代码只是列出跟本章相关的核心代码，我们直接看注释 1，2 分别得到 Watchdog 并对它初始化，Watchdog 主要用来监控系统的一些关键服务的运行状况。注释 3 创建了 IMS, 注释 4 执行 WMS 的 main 方法，其内部会创建 WMS, 注释 5 ，6 分别把 IMS、WMS 注册到 ServiceManager 中，这样的话如果某个客户端想要使用 WMS ，就需要先去 ServiceManager 中查询信息，然后根据与 WMS 所在的进程建立通信链路，客户端就可以使用 WMS 了。在注释 7 处是用来初始化屏幕显示信息，最后注释 8 则使用来通知 WMS ，告知系统初始化工作已经完成，其内部会调用 WindowManagerPolicy 的 systemReady 方法。因为该小节主要分析 WMS 启动，那么我们直接分析注释 4 ，看它的调用，代码如下:

```java
//WMS.java
    public static WindowManagerService main(final Context context, final InputManagerService im,
            final boolean haveInputMethods, final boolean showBootMsgs, final boolean onlyCore,
            WindowManagerPolicy policy) {
        /**
         * 1. 得到 DisplayThead 中的 handler 实例，调用 handler 的 runWithScissors 方法，使用来处理需要低延迟显示的相关操作，并
         * 只能由 WindowManger, DisplayManager 和 InputManager 实时执行快速操作
         */
        DisplayThread.getHandler().runWithScissors(() ->
                /**
                 * 2. 创建 WMS 实例运行在 Runnable 的 run 方法中
                 */
                sInstance = new WindowManagerService(context, im, haveInputMethods, showBootMsgs,
                        onlyCore, policy), 0);
        return sInstance;
    }
```

可以看到上面的代码是一个 Java8 中的一个特性使用了 lambda 表达式，在注释一种拿到了 "android.display” 该执行线程的 handler 对象，调用 runWithScissors 方法，它是用来执行一些低延迟的相关操作，并只能由 WindowManager、DisplayManager、和 InputManager 来实时执行，注释 2 创建了 WMS 实例，这里 Handler 的 runWithScissors 函数比较默认，注意第二个参数 timeout 传递的是 0 ，反正我在开发中没有用到，既然没有用到那我们就先去看看它到底是什么？如果有对 Handler 源码不了解了可以看我之前对 Handler 的分析[移动架构 (二) Android 中 Handler 架构分析，并实现自己简易版本 Handler 框架](https://juejin.im/post/5d30b4a8f265da1b855c8f45) 代码如下:

```java
//Handler.java
    public final boolean runWithScissors(final Runnable r, long timeout) {
        if (r == null) {
            throw new IllegalArgumentException("runnable must not be null");
        }
        if (timeout < 0) {
            throw new IllegalArgumentException("timeout must be non-negative");
        }

        /**
         * 1. 判断当前的线程是否是 Handler 所指向的线程
         */
        if (Looper.myLooper() == mLooper) {
            r.run();
            return true;
        }
        /**
         * r: 外部传递进来的 Runnable
         */
        BlockingRunnable br = new BlockingRunnable(r);
        return br.postAndWait(this, timeout);
    }
```

上面代码主要判断传递进来的 Runnable 是否为空，和延迟时间是否小于0 ，如果不满足就排除异常。注释一出就是判断当前 SystemServer 所运行的线程是否是 Handler 所指向的线程（android.dispaly）线程，如果是直接执行 run 方法，如果不是则调用 BlockingRunnable 的 postAndWait 方法并把当前的 Handler 和延迟时间传递进去，BlockingRunnable 是 Handler 的内部类，我们来看它的具体实现，代码如下:

```java
//Handler.java

    private static final class BlockingRunnable implements Runnable {
        private final Runnable mTask;
        private boolean mDone;

        public BlockingRunnable(Runnable task) {
            mTask = task;
        }

        @Override
        public void run() {
            try {
                /**
                 * 1.
                 */
                mTask.run();
            } finally {
                synchronized (this) {
                    mDone = true;
                    notifyAll();
                }
            }
        }

        public boolean postAndWait(Handler handler, long timeout) {
            /**将当前的 BlockingRunnable 添加到 Handler 的任务队列中。
             * 2. 
             */
            if (!handler.post(this)) {
                return false;
            }

            synchronized (this) {
                if (timeout > 0) {
                    final long expirationTime = SystemClock.uptimeMillis() + timeout;
                    while (!mDone) {
                        long delay = expirationTime - SystemClock.uptimeMillis();
                        if (delay <= 0) {
                            return false; // timeout
                        }
                        try {

                            wait(delay);
                        } catch (InterruptedException ex) {
                        }
                    }
                } else {
                    while (!mDone) {
                        try {
                            /**
                             * 3. 
                             */
                            wait();
                        } catch (InterruptedException ex) {
                        }
                    }
                }
            }
            return true;
        }
    }

```

根据上面代码我们分析得出，在注释 2 中将当前的 BlockingRunnable 对象添加到 Handler 任务队列中。前面调用 runWithScissors 方法的第二个参数传递的是 0 ，因此 timeout > 0 不成立，这样如果 mDone 为 false 的话就会执行注释 3 让当前线程进入等待状态，那么等待的是哪个线程呢？我们往上看，在注释 1  处执行了传入的 Runnable 的 run 方法（运行在 android.display 线程），执行完之后将 mDone 设置为 true, 并调用 notifyAll 方法将等待状态的线程进行唤醒，这样就不会继续调用注释 3  处的等待方法了，因此得出结论，SystemServer 所运行的线程等待的就是 android.display 线程，一直到 android.display 线程执行完毕在执行 SystemServer 所在的线程，这是因为内部执行了 WMS 的创建，而 WMS 的创建优先级要更高。WMS 的创建就讲到这里，最后我们查看 WMS 的构造函数，代码如下:

```java
//WMS.java

    private WindowManagerService(Context context, InputManagerService inputManager,
            boolean haveInputMethods, boolean showBootMsgs, boolean onlyCore,
            WindowManagerPolicy policy) {
    ...
        /**
         * 1. 将传递进来的 IMS 赋值给 mInputManager
         */
        mInputManager = inputManager; // Must be before createDisplayContentLocked.
        mDisplayManagerInternal = LocalServices.getService(DisplayManagerInternal.class);
        mDisplaySettings = new DisplaySettings();
        mDisplaySettings.readSettingsLocked();

       ...
        /**
         * 2. 拿到 DisplayManager 对象，调用它的 getDisplays 方法拿到 Displays数组 每个显示设备都有一个 Display 实例
         */
        mDisplays = mDisplayManager.getDisplays();

        for (Display display : mDisplays) {
            /**
             * 3. 遍历 Display 数组，将 Display 对象封装成 DiplayContent,DisplayContent 用来描述一块屏幕
             */
            createDisplayContentLocked(display);
        }

      ...
        /**
         * 4. 得到 AMS 实例并赋值给 WMS 中成员变量 mActivityManager
         */
        mActivityManager = ActivityManager.getService();
 				...

        /**
         * 5. 创建 WindowAnimator 对象它用于管理所有窗口的动画
         */
        mAnimator = new WindowAnimator(this);

        mAllowTheaterModeWakeFromLayout = context.getResources().getBoolean(
                com.android.internal.R.bool.config_allowTheaterModeWakeFromWindowLayout);



        LocalServices.addService(WindowManagerInternal.class, new LocalService());
        /**
         * 6. 初始化窗口管理策略的接口类
         */ 
      	initPolicy();

        /**
         * 7.将自身的 WMS 通过 addmonitor 方法添加到 Watchdog 中，
         * 它是用来监控系统的一些关键服务的运行状况，这些被监控的服务都会实现 Watchdog.Monitor 接口。
         * Watchdog 每分钟都会对被监控的系统服务进行检查，如果被监控的系统服务出现了死锁，则会杀死 Watchdog 所在的进程，也就是 SystemServer 进程
         */
        Watchdog.getInstance().addMonitor(this);


    }
```

在上面构造函数中大概做了 7 件事儿

1. 注释 1 处用来保存传进来的 IMS, 这样就相当于 WMS 持有了 IMS 引用
2. 注释 2 处通过 DisplayManager 的 getDisplays 方法得到 Display 数组（每个显示设备都有一个 Display 实例）接着遍历 Display 数组
3. 注释 3 遍历 Display 数组，将 Display 对象封装成 DiplayContent,DisplayContent 用来描述一块屏幕
4. 注释 4 得到 AMS 实例并赋值给 WMS 中成员变量 mActivityManager，这样 WMS 就持有了 AMS 的引用
5. 注释 5 创建 WindowAnimator 对象它用于管理所有窗口的动画
6. 初始化窗口管理策略的接口类 WindowManagerPolicy，它用来定义一个窗口策略索要遵循的通用规范
7. 将自身的 WMS 通过 addmonitor 方法添加到 Watchdog 中，它是用来监控系统的一些关键服务的运行状况，这些被监控的服务都会实现 Watchdog.Monitor 接口。 Watchdog 每分钟都会对被监控的系统服务进行检查，如果被监控的系统服务出现了死锁，则会杀死 Watchdog 所在的进程，也就是 SystemServer 进程,

我们看注释 6 处的实现：

```java
//WMS.java

    private void initPolicy() {
        UiThread.getHandler().runWithScissors(new Runnable() {
            @Override
            public void run() {
                WindowManagerPolicyThread.set(Thread.currentThread(), Looper.myLooper());
								//1. 
                mPolicy.init(mContext, WindowManagerService.this, WindowManagerService.this);
            }
        }, 0);
    }
```

这里是不是跟之前那个 DisplayThread 处理的有点相似吧？我们看注释 1 处执行了 WMP 的 init 方法，init 方法具体执行在 PhoneWindowManager 中实现。PMW 的 init 方法运行在 android.ui 线程中，它的优先级高于 android.display 线程，因此 android.display 线程需要等待 PMW 的 init 方法执行完毕后，处理等待状态的 android.display 线程才会被唤醒从而继续执行下面的代码。到目前咱们已经涉及到了 3 个线程（SystemSerer 所在线程也就是 system_server、android.display、android.ui）便于理解，我这里绘制了一个简图，请看下面:

![MKjr59.png](https://s2.ax1x.com/2019/11/10/MKjr59.png)

从上图可以看出，三个线程之前的关系分为三个步骤来实现：

1. 首先在 system_server 线程中执行了 SystemServer 的 startOtherServices 方法，在 startOtherServices 方法中会调用 WMS 的 main 方法，main 方法会创建 WMS ,创建的过程在 android.display 线程中实现，创建 WMS 的优先级更高，因此 system_server 线程要等待 WMS 创建完成后，处于等待状态的 system_server 线程才会被唤醒从而继续执行下面的代码。
2. 在 WMS 的构造方法中会调用 WMS 的 initPolicy 方法，在 initPolicy 方法中又会调用 PWM 的 init 方法， PWM 的 init 方法在 android.ui 线程中运行，它的优先级要高于 android.display 线程，因此 android.display 线程要等待 PWM 的 init 方法执行完毕后，处于等待状态的 android.display 线程才会被唤醒从而继续执行下面的代码。
3. PWM 的 init 方法执行完成后，android.display 线程就完成了 WMS 的创建，等待的 system_server 线程被唤醒后继续执行 WMS 的 main 方法后的逻辑，比如 WMS 的displayReady 方法用来初始化屏幕显示信息（SystemServer 的 startOtherServices 方法注释 7 处）

## WMS 重要成员

想要更好地理解 WMS ，不但要了解 WMS 是如何创建的，还要知道 WMS 的重要成员，这里的重要成员指的是 WMS 的部分成员变量，下面以一张表格来具体描述它们的作用，如下所示:

| 成员              | 类型                | 说明                                                         |
| ----------------- | ------------------- | ------------------------------------------------------------ |
| mPolicy           | WindowManagerPolicy | 是窗口管理策略的接口类，用来定义一个窗口策略索要遵循的通用规范，并提供了  WindowManager 所有的特定的 UI 行为。它的具体实现类为 PhoneWindowManager, 这个实现类在 WMS 创建时被创建。WMP 允许定制窗口层级和特殊窗口类型以及关键的调度和布局。 |
| mSessions         | ArraySet            | 主要用于进程间通信，其它应用程序进程想要和 WMS 进程进行通信就需要经过 Session, 并且每个应用程序进程都会对应一个 Session, WMS 保存这些 Session 用来记录所有向 WMS 提出窗口管理服务的客户端。 |
| mWindowMap        | WindowHashMap       | 它继承自 HashMap, 限制了 hashMap 的 key 值的类型为 IBinder , value 的值的类型为 WindowState . WindowState 用于保存窗口的信息，在 WMS 中它用来描述一个窗口。综上得出结论，它就是用来保存 WMS 中各种窗口的集合。 |
| mFinishedStarting | ArrayList           | 它的元素类型为 AppWindowToken, 它是 WindowToken 的子类，mFinishedStarting 就是用来存储已经完成启动的应用程序窗口（比如 Activity）的 AppWindowToken 的列表。 |
| mResizingWindows  | ArrayList           | 用来存储正在调整大小的窗口的列表                             |
| mAnimator         | WindowAnimator      | 用于管理窗口的动画以及特效动画                               |
| mH                | H                   | 用于将任务加入到主线程的消息队列中，这样的代码逻辑就会在主线程中执行。 |
| mInputManager     | InputManagerService | 它是输入系统的管理者，它会对触摸事件进行处理，会寻找一个最合适的窗口来处理触摸反馈信息。 |

这里在补充一个知识 **WindowToken** (它是 mFinishedStarting 元素类型 AppWindowToken 的父类) 是干嘛的？

- 可以理解为窗口令牌，当应用程序想要向 WMS 申请新创建一个窗口，则需要向 WMS 出示有效的 WindowToken 。AppWindowToken 作为 WindowToken 的子类，主要用来描述应用程序的 WindowToken 结构，应用程序中每个 Activity 都对应一个 AppWindowToken
- WindowToken 会将通一个组件（比如同一个 Activity）的窗口 （WindowState）集合在一起，方便管理

## Window 的添加过程（WMS 处理部分）

在上一篇文章中我们讲到了对 Window 的操作是分为两大部分一部分是 WindowManager ，另一部分是 WindowManagerService , 在上一篇文章中学习到了在 WIndowManager 的处理过程，那么该小节为大家介绍 WMS 中 addWindow 的处理过程，源码如下:

```java
//WMS.java
    public int addWindow(Session session, IWindow client, int seq,
            WindowManager.LayoutParams attrs, int viewVisibility, int displayId,
            Rect outContentInsets, Rect outStableInsets, Rect outOutsets,
            InputChannel outInputChannel) {
        int[] appOp = new int[1];
        /**
         * 1. 根据 Window 的属性，调用 WMP 的 checkAddPermission 方法来检查权限，具体在 PhoneWindowManager 的 checkAddPermission
         *    方法中实现，如果没有权限则不会执行后续的代码逻辑
         */
        int res = mPolicy.checkAddPermission(attrs, appOp);
        if (res != WindowManagerGlobal.ADD_OKAY) {
            return res;
        }

        ...

        synchronized(mWindowMap) {
            if (!mDisplayReady) {
                throw new IllegalStateException("Display has not been initialialized");
            }

            /**
             * 2. 通过 displayID 来获得窗口要添加到那个 DisplayContent 上，如果没有找到 DisplayContent 则返回 WindowManagerGlobal.ADD_INVALID_DISPLAY 
             *    这一状态，其中 DisplayContent 用来描述一块屏幕
             */
            final DisplayContent displayContent = mRoot.getDisplayContentOrCreate(displayId);
            if (displayContent == null) {
                Slog.w(TAG_WM, "Attempted to add window to a display that does not exist: "
                        + displayId + ".  Aborting.");
                return WindowManagerGlobal.ADD_INVALID_DISPLAY;
            }
            if (!displayContent.hasAccess(session.mUid)
                    && !mDisplayManagerInternal.isUidPresentOnDisplay(session.mUid, displayId)) {
                Slog.w(TAG_WM, "Attempted to add window to a display for which the application "
                        + "does not have access: " + displayId + ".  Aborting.");
                return WindowManagerGlobal.ADD_INVALID_DISPLAY;
            }

            if (mWindowMap.containsKey(client.asBinder())) {
                Slog.w(TAG_WM, "Window " + client + " is already added");
                return WindowManagerGlobal.ADD_DUPLICATE_ADD;
            }

            /**
             * 3. type 代表一个窗口的类型，它的数值介于 FIRST_SUB_WINDOW 和 LAST_SUB_WINDOW 之间 （1000~1999）
             *    定义在 WindowManager 中，代表子类窗口定义
             */
            if (type >= FIRST_SUB_WINDOW && type <= LAST_SUB_WINDOW) {
                /**
                 * 4. attrs.token 是 IBinder 类型的对象，windowForClientLocked 方法内部会根据 attrs.token 作为 key 值从 mWindowMap 中得到该子窗口的父窗口。接着对父窗口进行判断，如果
                 *    父窗口为 null 或者 type 的取值范围不正确这会返回错误的状态。
                 */
                parentWindow = windowForClientLocked(null, attrs.token, false);
                if (parentWindow == null) {
                    Slog.w(TAG_WM, "Attempted to add window with token that is not a window: "
                          + attrs.token + ".  Aborting.");
                    return WindowManagerGlobal.ADD_BAD_SUBWINDOW_TOKEN;
                }
                if (parentWindow.mAttrs.type >= FIRST_SUB_WINDOW
                        && parentWindow.mAttrs.type <= LAST_SUB_WINDOW) {
                    Slog.w(TAG_WM, "Attempted to add window with token that is a sub-window: "
                            + attrs.token + ".  Aborting.");
                    return WindowManagerGlobal.ADD_BAD_SUBWINDOW_TOKEN;
                }
            }
						...
            /** 
             * 5. 通过 displayContent 的 getWindowToken 得到 WindowToken 对象
             */
            WindowToken token = displayContent.getWindowToken(
                    hasParent ? parentWindow.mAttrs.token : attrs.token);
            
            /**
             * 6. 如果有父窗口就将父窗口的 type 值赋值给 rootType , 如果没有将当前窗口的 type 值赋值给 rootType.接下来
             *    如果 WindowToken 为 null ，则根据 rootType 或者 type 的值进行区分判断，如果 rootType 值等于 TYPE_INPUT_METHOD、TYPE_WALLPAPER 
             *    等值时，则返回状态值 WindowManagerGlobal.ADD_BAD_APP_TOKEN ,说明 rootType 值等于 TYPE_INPUT_METHOD、TYPE_WALLPAPER  值时
             *    是不允许 WindowToken 为 null 的
             */
            final int rootType = hasParent ? parentWindow.mAttrs.type : type;

            boolean addToastWindowRequiresToken = false;

            if (token == null) {
                if (rootType >= FIRST_APPLICATION_WINDOW && rootType <= LAST_APPLICATION_WINDOW) {
                    Slog.w(TAG_WM, "Attempted to add application window with unknown token "
                          + attrs.token + ".  Aborting.");
                    return WindowManagerGlobal.ADD_BAD_APP_TOKEN;
                }
                if (rootType == TYPE_INPUT_METHOD) {
                    Slog.w(TAG_WM, "Attempted to add input method window with unknown token "
                          + attrs.token + ".  Aborting.");
                    return WindowManagerGlobal.ADD_BAD_APP_TOKEN;
                }
                if (rootType == TYPE_VOICE_INTERACTION) {
                    Slog.w(TAG_WM, "Attempted to add voice interaction window with unknown token "
                          + attrs.token + ".  Aborting.");
                    return WindowManagerGlobal.ADD_BAD_APP_TOKEN;
                }
                if (rootType == TYPE_WALLPAPER) {
                    Slog.w(TAG_WM, "Attempted to add wallpaper window with unknown token "
                          + attrs.token + ".  Aborting.");
                    return WindowManagerGlobal.ADD_BAD_APP_TOKEN;
                }
                if (rootType == TYPE_DREAM) {
                    Slog.w(TAG_WM, "Attempted to add Dream window with unknown token "
                          + attrs.token + ".  Aborting.");
                    return WindowManagerGlobal.ADD_BAD_APP_TOKEN;
                }
                if (rootType == TYPE_QS_DIALOG) {
                    Slog.w(TAG_WM, "Attempted to add QS dialog window with unknown token "
                          + attrs.token + ".  Aborting.");
                    return WindowManagerGlobal.ADD_BAD_APP_TOKEN;
                }
                if (rootType == TYPE_ACCESSIBILITY_OVERLAY) {
                    Slog.w(TAG_WM, "Attempted to add Accessibility overlay window with unknown token "
                            + attrs.token + ".  Aborting.");
                    return WindowManagerGlobal.ADD_BAD_APP_TOKEN;
                }
                if (type == TYPE_TOAST) {
                    // Apps targeting SDK above N MR1 cannot arbitrary add toast windows.
                    if (doesAddToastWindowRequireToken(attrs.packageName, callingUid,
                            parentWindow)) {
                        Slog.w(TAG_WM, "Attempted to add a toast window with unknown token "
                                + attrs.token + ".  Aborting.");
                        return WindowManagerGlobal.ADD_BAD_APP_TOKEN;
                    }
                }
                final IBinder binder = attrs.token != null ? attrs.token : client.asBinder();
                /**
                 * 7. 通过多次的条件判断之后，会隐式创建 WindowToken,这说明当我们添加窗口时可以不向 WMS 提供 WindoToken ，
                 *    前提是 rootType 和 type 的值不为前面条件判断筛选的值。WindowToken 隐式和显示的创建肯定是要加以区分的，在该对象的第 4 个参数传入
                 *    false 就代表是隐式创建的。
                 *    
                 */
                token = new WindowToken(this, binder, type, false, displayContent,
                        session.mCanAddInternalSystemWindow);

                /**
                 * 8. 判断如果窗口为应用程序窗口
                 */
            } else if (rootType >= FIRST_APPLICATION_WINDOW && rootType <= LAST_APPLICATION_WINDOW) {
                /**
                 * 9. 将 WindowToken 转换为专门针对应用程序窗口的 AppWindowToken, 然后根据 AppWindowToken 的值进行后续的判断
                 */
                atoken = token.asAppWindowToken();
                if (atoken == null) {
                    return WindowManagerGlobal.ADD_NOT_APP_TOKEN;
                } else if (atoken.removed) {
                    return WindowManagerGlobal.ADD_APP_EXITING;
                }
            } else if (rootType == TYPE_INPUT_METHOD) {
                if (token.windowType != TYPE_INPUT_METHOD) {
                      return WindowManagerGlobal.ADD_BAD_APP_TOKEN;
                }
            } 
          
          ...	
            }

            /**
             * 10. 创建 WindowState,它存有窗口的所有的状态信息，在 WMS 中它代表一个窗口
             *     this 指 IWindow ,IWindow 会将 WMS 中窗口管理的操作回调给 ViewRootImpl,token 指的是 WindowToken
             */
            final WindowState win = new WindowState(this, session, client, token, parentWindow,
                    appOp[0], seq, attrs, viewVisibility, session.mUid,
                    session.mCanAddInternalSystemWindow);
            /**
             * 11. 判断请求添加窗口的客户端是否已经死亡
             */
            if (win.mDeathRecipient == null) {
                return WindowManagerGlobal.ADD_APP_EXITING;
            }

            /**
             * 12. 判断窗口的 DisplayContent 是否为 null 
             */
            if (win.getDisplayContent() == null) {
                Slog.w(TAG_WM, "Adding window to Display that has been removed.");
                return WindowManagerGlobal.ADD_INVALID_DISPLAY;
            }

            /**
             * 13.调用 WMP 的 adjustWindowParamsLw 方法，该方法在 PhoneWindowManager 中实现，此方法会根据窗口的 type 对窗口的 LayoutParams 的值进行修改
             */
            mPolicy.adjustWindowParamsLw(win.mAttrs);
            win.setShowToOwnerOnlyLocked(mPolicy.checkShowToOwnerOnly(attrs));

            /**
             * 14. 调用 WMP 的 prepareAddWindowLw 方法，用于准备将窗口添加到系统中
             */
            res = mPolicy.prepareAddWindowLw(win, attrs);
            if (res != WindowManagerGlobal.ADD_OKAY) {
                return res;
            }

           ...
             
            win.attach();
            /**
             * 15. 将 WindowState 添加到 mWindowMap 中
             */
            mWindowMap.put(client.asBinder(), win);
            if (win.mAppOp != AppOpsManager.OP_NONE) {
                int startOpResult = mAppOps.startOpNoThrow(win.mAppOp, win.getOwningUid(),
                        win.getOwningPackage());
                if ((startOpResult != AppOpsManager.MODE_ALLOWED) &&
                        (startOpResult != AppOpsManager.MODE_DEFAULT)) {
                    win.setAppOpVisibilityLw(false);
                }
            }

            final AppWindowToken aToken = token.asAppWindowToken();
            if (type == TYPE_APPLICATION_STARTING && aToken != null) {
                aToken.startingWindow = win;
                if (DEBUG_STARTING_WINDOW) Slog.v (TAG_WM, "addWindow: " + aToken
                        + " startingWindow=" + win);
            }

            boolean imMayMove = true;

            /**
             * 16. 将 WindowState 添加到该 WindowState 对应的 WindowToken 中（实际是保存在 WindowToken的父类 WindowContainer 中），这样 WindowToken 就包含了同一个组件的 WindowState
             */
            win.mToken.addWindow(win);
            if (type == TYPE_INPUT_METHOD) {
                win.mGivenInsetsPending = true;
                setInputMethodWindowLocked(win);
                imMayMove = false;
            } else if (type == TYPE_INPUT_METHOD_DIALOG) {
                displayContent.computeImeTarget(true /* updateImeTarget */);
                imMayMove = false;
            } else {
                if (type == TYPE_WALLPAPER) {
                    displayContent.mWallpaperController.clearLastWallpaperTimeoutTime();
                    displayContent.pendingLayoutChanges |= FINISH_LAYOUT_REDO_WALLPAPER;
                } else if ((attrs.flags&FLAG_SHOW_WALLPAPER) != 0) {
                    displayContent.pendingLayoutChanges |= FINISH_LAYOUT_REDO_WALLPAPER;
                } else if (displayContent.mWallpaperController.isBelowWallpaperTarget(win)) {
                    displayContent.pendingLayoutChanges |= FINISH_LAYOUT_REDO_WALLPAPER;
                }
            }
					...
        return res;
    }
```

WMS 的 addWindow 方法中代码比较多而且比较复杂，大概分为 16 步，这里因为把重要代码都注释了详细意思，所以不在过多讲解，我这里直接对 **addWindow**  方法做一个总结:

- 对所有要添加的窗口进行检查，如果窗口不满足一些条件，就不会再执行下面的代码逻辑。
- WindowToken 相关的处理，比如有的窗口类型需要提供 WindowToken , 没有提供的话就不会执行下面的代码逻辑，有的窗口类型则需要有 WMS 隐式创建 WindowToken.
- WindowState 的创建和相关处理，将 WindowToken 和 WindowState 相关联。
- 创建和配置 DisplayContent, 完成窗口添加到系统前的准备工作。

## Window 删除过程

在上一篇文章我们讲解了 Window 的创建和更新过程一样，要删除 Window 就需要先调用 WindowManagerImpl 的 removeView 方法，在 removeView 方法中又会调用 WindowManagerGlobal 的 removeView 方法，我们就从这里开始讲起。代码如下:

```java
//WindowManagerGlobal.java

    public void removeView(View view, boolean immediate) {
        if (view == null) {
            throw new IllegalArgumentException("view must not be null");
        }

        synchronized (mLock) {
            /**
             * 1. 通过要删除的 view 找到在 mViews 列表中的位置
             */
            int index = findViewLocked(view, true);
            View curView = mRoots.get(index).getView();
            /**
             * 2. 调用内部方法将索引位置传递进去
             */
            removeViewLocked(index, immediate);
            if (curView == view) {
                return;
            }

            ...
        }
    }
    private int findViewLocked(View view, boolean required) {
        final int index = mViews.indexOf(view);
        if (required && index < 0) {
            ...
        }
        return index;
    }
```

接下来我们看注释 2 的实现，代码如下:

```java
//WindowManagerGlobal.java
    private void removeViewLocked(int index, boolean immediate) {
        /**
         * 1.根据传入的索引拿到需要删除 Window  的 ViewRootImpl
         */
        ViewRootImpl root = mRoots.get(index);
        View view = root.getView();

        if (view != null) {
            /**
             * 2. 得到 InputMethodManager 实例
             */
            InputMethodManager imm = InputMethodManager.getInstance();
            if (imm != null) {
                /**
                 * 3. 结束 IMM 实例在被删除 window 中的输入法相关的逻辑
                 */
                imm.windowDismissed(mViews.get(index).getWindowToken());
            }
        }
        /**
         * 4. 调用 ViewRootImpl 的 die 方法
         */
        boolean deferred = root.die(immediate);
        if (view != null) {
            view.assignParent(null);
            if (deferred) {
                mDyingViews.add(view);
            }
        }
    }
```

上面代码分为 4 步，做一些删除的准备工作，然后我们来看注释 4 的实现，代码如下:

```java
//ViewRootImpl.java
    //die 方法需要立即执行并且此时 ViewRootImpl 不再执行 performTraversals 方法
    boolean die(boolean immediate) {

        /**
         * 1. immediate 为 true ，mIsInTraversal 为 false 就立刻执行
         */
        if (immediate && !mIsInTraversal) {
            /**
             * 2. mIsInTraversal 在执行 ViewRootImpl 的  performTraversals 方法的时候会被设置为 true ，在 performTraversals 方法执行完成的时候会被设置为 false
             */
            doDie();
            return false;
        }

       ...
        mHandler.sendEmptyMessage(MSG_DIE);
        return true;
    }
```

上面我们知道在 performTraversals  执行完成之后就将 mIsInTraversal 设置了 false ，那么这里就必须立刻执行 doDie 方法，代码如下:

```java
//ViewRootImpl.java

    void doDie() {
        /**
         * 1. 检查执行线程是否是在创建 Window 的线程中，如果不属于就抛一个异常
         */
        checkThread();
        synchronized (this) {
            /**
             * 2. 如果在删除了就支持 return
             */
            if (mRemoved) {
                return;
            }
            /**
             * 3. 将删除动作设置为 true 避免重复删除操作
             */
            mRemoved = true;
            /**
             * 4. 判断被删除的 Window 是否有子 View
             */
            if (mAdded) {
                /**
                 * 5. 如果有就会调用 dispatchDetachedFromWindow 方法来销毁 View
                 */
                dispatchDetachedFromWindow();
            }

            /**
             * 6. 如果被删除的 Window 有子 View 并且不是第一次被删除，就会执行后面逻辑
             */
            if (mAdded && !mFirst) {
                destroyHardwareRenderer();

                if (mView != null) {
                    int viewVisibility = mView.getVisibility();
                    boolean viewVisibilityChanged = mViewVisibility != viewVisibility;
                    if (mWindowAttributesChanged || viewVisibilityChanged) {
                        
                        try {
                            if ((relayoutWindow(mWindowAttributes, viewVisibility, false)
                                    & WindowManagerGlobal.RELAYOUT_RES_FIRST_TIME) != 0) {
                                mWindowSession.finishDrawing(mWindow);
                            }
                        } catch (RemoteException e) {
                        }
                    }

                    mSurface.release();
                }
            }

            mAdded = false;
        }
        /**
         * 7. 处理 WindowManagerGlobal 的 doRemoveView 方法
         */
        WindowManagerGlobal.getInstance().doRemoveView(this);
    }
```

这里总结一点首先判断执行删除 Window 的线程是否属于创建该 Window 的线程，如果不属于将会抛一个异常，这说明只允许创建和删除在同一个线程中处理，然后做了一些删除动作的逻辑判断比如是否有重复删除动作，还有被删除的 Window 是否有子 View 存在如果有就分发下去删除 View 的动作，最后调用注释 7 ，代码如下:

```java
//WindowManagerGlobal.java
    void doRemoveView(ViewRootImpl root) {
        synchronized (mLock) {
            /**
             * 1. 找到被删除 Window 对应的 ViewRootImpl 在 mRoots 列表中的位置，
             */
            final int index = mRoots.indexOf(root);
            if (index >= 0) {
                mRoots.remove(index);
                mParams.remove(index);
                final View view = mViews.remove(index);
                mDyingViews.remove(view);
            }
        }
        if (ThreadedRenderer.sTrimForeground && ThreadedRenderer.isAvailable()) {
            doTrimForeground();
        }
    }
```

上面代码首先找到被删除 Window 对应的 ViewRootImpl 在 mRoots 的列表中的位置，然后拿到索引位置执行对布局参数列表和 View 列表中删除掉将要被删除 Window 对应的元素，接着我们回到 ViewRootImpl 的 doDie 方法中注释 5 的代码实现，代码如下:

```java
//ViewRootImpl.java

    void dispatchDetachedFromWindow() {
        ...
        try {
          //1. 
            mWindowSession.remove(mWindow);
        } catch (RemoteException e) {
        }
			...
    }
```

在 dispatchDetachedFromWindow 方法中，核心代码就是注释 1 处的代码，调用 IWindowSession 的 remove 方法，IWindowSession 的实现类在 Session , 在上一篇文章中已经讲到了，不理解的先去看一下该系列对 **WindowManager** 源码分析，接下来我们看 Session 的 remove 方法，代码如下:

```java
//Session.java
    public void remove(IWindow window) {
        mService.removeWindow(this, window);
    }
```

这里又通知 WMS 来删除 Window ，代码如下:

```java
//WMS.java
    void removeWindow(Session session, IWindow client) {
        synchronized(mWindowMap) {
            /**
             * 1. 获取 Window 对应的 WindowState,WindowState 用于保存窗口的信息，此处用于描述一个窗							*			口
             */
            WindowState win = windowForClientLocked(session, client, false);
            if (win == null) {
                return;
            }
            /**
             * 2. 调用 WindowState 的 removeIfPossible 方法
             */
            win.removeIfPossible();
        }
    }
```

我们看注释 2 实现，代码实现:

```java
//WindowState.java
    @Override
    void removeIfPossible() {
        super.removeIfPossible();
        /**
         * 调用内部的 removeIfPossible 方法
         */
        removeIfPossible(false /*keepVisibleDeadWindow*/);
    }
```

```java
//WindowState.java
    private void removeIfPossible(boolean keepVisibleDeadWindow) {
       ...//判断逻辑代码省略

        /**
         * 1. 
         */
        removeImmediately();
        ...
    }
```

在注释 1 上面会对被删除 Window 的操作进行条件判断过滤，只有有一个不符合就延迟在删除，比如该 Window 正在执行一个动画，那么就需要等待动画执行完成之后在删除，最后在执行注释 1 的代码，如下：

```java
//WindowState.java

    @Override
    void removeImmediately() {
        super.removeImmediately();

        /**
         * 1. 以为着正在执行删除的动作
         */
        if (mRemoved) {
            ..
            return;
        }

        /**
         * 2. 用于防止重复删除的操作
         */
        mRemoved = true;

      	...
        /**
         * 3. 如果当前要删除的 Window 是 StatusBar 或者 NavigationBar 就会将这个 Window 从对应的控制器中删除
         */
        mPolicy.removeWindowLw(this);

				...
        /**
         * 4.将被删除 Window 对应的 Session 从 WMS 中删除
         */
        mSession.windowRemovedLocked();
				...

        /**
         * 5.调用 WMS 的 postWindowRemoveCleanupLocked 方法用于对被删除 Window 进行一些集中的清理工作。
         */
        mService.postWindowRemoveCleanupLocked(this);
    }
```

下面我们分别来对注释 3 ，4 来看下它们具体操作实现，代码如下

```java
//PhoneWindowManager.java    
@Override
    public void removeWindowLw(WindowState win) {
        if (mStatusBar == win) {
            mStatusBar = null;
            mStatusBarController.setWindow(null);
        } else if (mNavigationBar == win) {
            mNavigationBar = null;
            mNavigationBarController.setWindow(null);
        }
    }
```

上面代码就是将 StatusBar 和 NavigationBar 在 对应的控制器中删除，下面看注释 4 ，代码如下:

```java
//Session.java
    void windowRemovedLocked() {
        mNumWindow--;
        killSessionLocked();
    }
    private void killSessionLocked() {
        if (mNumWindow > 0 || !mClientDead) {
            return;
        }

        /**
         * 1. 将被删除 Window 身上的 Session 在 WMS 中删除
         */
        mService.mSessions.remove(this);
        if (mSurfaceSession == null) {
            return;
        }
				....
        try {
            /**
             * 2. 释放被删除 Window  身上的 SurfaceSession 资源
             */
            mSurfaceSession.kill();
        } catch (Exception e) {
           ...
        }
 ...
    }
```

上面代码首先将被删除 Window 身上的 Session 在 WMS 中删除，然后释放被删除 Window 身上的 SurfaceSession 资源 ，SurfaceSession 资源是 SufaceFlinger 的一个连接，通过这个连接可以创建 1~n 个 Surface 并渲染到屏幕上。



Window 的删除过程就分析到这里了，虽然删除过程过于复杂繁琐，但是我们可以对它删除的过程做一个简单的总结，如下:

1. 检查删除线程是否符合要求，如果不符合就抛出一个异常。
2. 从 ViewRootImpl 、布局参数 、View 列表中删除与被删除 Window 对应的元素。
3. 判断是否可以执行删除操作，如果不能就推迟操作。
4. 执行删除操作，清理和释放与被删除 Window 的相关资源。

 

## 总结

在该篇文章中我们学习到了 WMS 的职责以及 Window 的添加和删除操作，从 WMS 的职责可以看出 WMS 是相当的复杂，与它关联的就有 4 大模块 “窗口管理”、“窗口动画”、“输入系统”、“Surface” ，它们每一个都是比较重要且复杂的系统，该篇就介绍了与应用开发关联比较密切的窗口管理，剩下的就得靠自己去查阅相关系统源码书籍或一些相关文章了。

感谢大家阅读，希望对你有帮组！

## 参考

- 《Android 进阶解密》