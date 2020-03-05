## 前言

我们熟知一般 Android 工程师都是在应用层上开发，不会涉及系统源码，但是如果你想往底层发展，或者深入插件化、Framework 系统层等开发工作，如果不了解 Android 源码可是不行的，那么接下来我基于自己的理解跟学习来记录跟 Android 开发息息相关的源码分析，大概从 Android 中的 SystemServer 启动、四大组件启动、AMS、PMS 等几个维度来介绍，下面是我的计划，当然在未来也有可能改变。

**还没有关注的小伙伴，可以先关注一波，系列文章会持续更新。**

[Android 8.0 源码分析 (一) SystemServer 进程启动](https://juejin.im/post/5db3f95ee51d4529e83947f9)

[Android 8.0 源码分析 (二) Launcher 启动](https://juejin.im/post/5db5565cf265da4d0f14053c)

[Android 8.0 源码分析 (三) 应用程序进程创建到应用程序启动的过程](https://juejin.im/post/5db599bc6fb9a0203b234b08)

[Android 8.0 源码分析 (四) Activity 启动]()

[Android 8.0 源码分析 (五) Service 启动]()

[Android 8.0 源码分析 (六) BroadcastReceiver 启动]()

[Android 8.0 源码分析 (七) ContentProvider 启动]()

## 介绍

上一篇文章我们讲解了 Activity 的启动，那么这一篇将为来家分析四大组件中的 Service 的 startService 和 bindService 启动原理。在实际开发中，运用 Service 组件有很多场景，比如，后台播放音乐，后台下载文件等等，只要你想把些任务逻辑放在后台执行的，那么都可以开启一个服务。在现在这个开发环境中，会运用 Service 可不行，得懂点内部运行原理才行，好了，废话不多说了，下面先来分析 startService。

## startService 启动过程

### ContextImpl 到 AMS 的调用过程

下面先看一张在 Activity 中调用 startService 的时序图

![KoWsfA.png](https://s2.ax1x.com/2019/10/31/KoWsfA.png)

当我们在 Activity 中调用 startActivity 函数的时候，点击 startActivity 看源码实现会发现它是在 ContextWrapper  类中实现的。

```java
//ContextWrappaer
	Context mBase;

    @Override
    public ComponentName startService(Intent service) {
        return mBase.startService(service);
    }
```

那么 ContextWrapper 是什么呢？下面我们以一张图片看下它的继承关系

![Kootld.png](https://s2.ax1x.com/2019/10/31/Kootld.png)

通过上面的层级，能明白了吧,我们继续看 Context 的 startService 实现，代码如下:

```java
//Context.java
public abstract class Context {
 ...
       @Nullable
    public abstract ComponentName startService(Intent service);
 ...
  
}
```

通过上面代码可以看到 Context 是一个抽象类，那么它具体实现是哪个类？在上一篇文章我们介绍了 Activity 的启动，那么在启动的时候，就会创建 Context ,注意看下面代码，如下：

```java
//ActivityThread.java
    private Activity performLaunchActivity(ActivityClientRecord r, Intent customIntent) {
      

        /**
         * 1. 通过封装启动 Activity 信息类 ActivityClientRecord 来获取到 ActivityInfo
         */
        ActivityInfo aInfo = r.activityInfo;
        /**
         * 2. 如果 r.packageInfo == null 就获取 LoadedApk 实例
         */
        if (r.packageInfo == null) {
            r.packageInfo = getPackageInfo(aInfo.applicationInfo, r.compatInfo,
                    Context.CONTEXT_INCLUDE_CODE);
        }

        /**
         * 3. 通过封装启动 Activity 信息类 ActivityClientRecord 来获取启动 Activity 组件的 ComponentName
         */
        ComponentName component = r.intent.getComponent();
        if (component == null) {
            component = r.intent.resolveActivity(
                mInitialApplication.getPackageManager());
            r.intent.setComponent(component);
        }

        if (r.activityInfo.targetActivity != null) {
            component = new ComponentName(r.activityInfo.packageName,
                    r.activityInfo.targetActivity);
        }
        /**
         * 4. 创建Activity 中的上下文环境
         */
        ContextImpl appContext = createBaseContextForActivity(r);
        Activity activity = null;
        try {
            /**
             * 拿到当前上下文加载的 ClassLoader 加载器
             */
            java.lang.ClassLoader cl = appContext.getClassLoader();
            /**
             * 5. 调用 Instrumentation.newActivity 函数 ，内部通过 ClassLoader 类加载器来创建 Activity 的实例
             */
            activity = mInstrumentation.newActivity(
                    cl, component.getClassName(), r.intent);
            StrictMode.incrementExpectedActivityCount(activity.getClass());
            r.intent.setExtrasClassLoader(cl);
            r.intent.prepareToEnterProcess();
            if (r.state != null) {
                r.state.setClassLoader(cl);
            }
        } catch (Exception e) {
           ...
        }

        try {
            /**
             * 6. 得到 Application 对象
             */
            Application app = r.packageInfo.makeApplication(false, mInstrumentation);

            ....
                /**
                 * 7. 将 appContext 等对象依附在 Activity 的 attach 函数中,进行 Activity  attach 初始化
                 */
                activity.attach(appContext, this, getInstrumentation(), r.token,
                        r.ident, app, r.intent, r.activityInfo, title, r.parent,
                        r.embeddedID, r.lastNonConfigurationInstances, config,
                        r.referrer, r.voiceInteractor, window, r.configCallback);

               ...

        return activity;
    }
```

通过上面代码，我们只关注注释 4 跟注释 7，我们看下注释 4 的实现,代码如下:

```java
//ActivityThread.java
    private ContextImpl createBaseContextForActivity(ActivityClientRecord r) {
...

        //1.创建 Activity 的 Context 对象
        ContextImpl appContext = ContextImpl.createActivityContext(
                this, r.packageInfo, r.activityInfo, r.token, displayId, r.overrideConfig);

...
        return appContext;
    }
```

```java
//ContextImpl.java
    static ContextImpl createActivityContext(ActivityThread mainThread,
            LoadedApk packageInfo, ActivityInfo activityInfo, IBinder activityToken, int displayId,
            Configuration overrideConfiguration) {
        ...
				//2. 实例化 Context 的实现类 ContextImpl
        ContextImpl context = new ContextImpl(null, mainThread, packageInfo, activityInfo.splitName,
                activityToken, null, 0, classLoader);

...
        return context;
    }
```

通过上面代码我们知道，最后在 **createActivityContext** 函数中实例化了 **ContextImpl 对象**，现在我们回到 **ActivityThread performLaunchActivity** 函数的注释 7 ，代码如下

```java
//ActivityThread.java
                /**
                 * 7. 将 appContext 等对象依附在 Activity 的 attach 函数中,进行 Activity  attach 初始化
                 */
activity.attach(appContext, this, getInstrumentation(), r.token,r.ident, app, r.intent, r.activityInfo, title, r.parent,r.embeddedID, r.lastNonConfigurationInstances, config,
                        r.referrer, r.voiceInteractor, window, r.configCallback);
```

```java
//Activity.java
    final void attach(Context context, ActivityThread aThread,
            Instrumentation instr, IBinder token, int ident,
            Application application, Intent intent, ActivityInfo info,
            CharSequence title, Activity parent, String id,
            NonConfigurationInstances lastNonConfigurationInstances,
            Configuration config, String referrer, IVoiceInteractor voiceInteractor,
            Window window, ActivityConfigCallback activityConfigCallback) {
      	//调用父类函数
        attachBaseContext(context);
      
      ....
        
    }
```

attachBaseContext 是父类函数，代码如下:

```java
//ContextThemeWrapper
  public class ContextThemeWrapper extends ContextWrapper {
    ...
	@Override
    protected void attachBaseContext(Context newBase) {
        super.attachBaseContext(newBase);
    }
    
    ...
      
  }
```

继续调用父类,代码如下:

```java
public class ContextWrapper extends Context {
    Context mBase;

    public ContextWrapper(Context base) {
        mBase = base;
    }
    

    protected void attachBaseContext(Context base) {
        if (mBase != null) {
            throw new IllegalStateException("Base context already set");
        }
      	//赋值给 Context
        mBase = base;
    }
```

到最后我们看到 Context 的实现类 ContextImpl 赋值给了 ContextWrapper 的成员变量 mBase,现在我们直接去 ContextImpl 的 startService 看它具体实现，代码如下:

```java
//ContextImpl
class ContextImpl extends Context {
  ...
    @Override
    public ComponentName startService(Intent service) {
        warnIfCallingFromSystemProcess();
        /**
         * 调用内部 startServiceCommon 函数
         */
        return startServiceCommon(service, false, mUser);
    }
 ...
   
}
```

继续调用内部函数，代码如下:

```java
//ContextImpl
    private ComponentName startServiceCommon(Intent service, boolean requireForeground,
            UserHandle user) {
        try {
            validateServiceIntent(service);
            service.prepareToLeaveProcess(this);
            /**
             * 调用 AMS 代理的 IActivityManager  的 startService 函数
             */
            ComponentName cn = ActivityManager.getService().startService(
                mMainThread.getApplicationThread(), service, service.resolveTypeIfNeeded(
                            getContentResolver()), requireForeground,
                            getOpPackageName(), user.getIdentifier());
      ...
            return cn;
        } catch (RemoteException e) {
            throw e.rethrowFromSystemServer();
        }
    }
```

在启动 Activity 源码讲解中，我们已经见过了这种调用方式，其内部就是通过 aidl 来进行应用进程与 AMS(SystemServer) 进程通信，最后回调到 AMS 的 startService 函数



### ActivityThread 启动 Service

调用过程按照老规矩，看看总体时序图:

![Koj07d.png](https://s2.ax1x.com/2019/10/31/Koj07d.png)

通过上一小节我们知道最后会回到 AMS 的 startService 函数中，那么我们直接看 AMS 中的具体实现，代码如下:

```java
//AMS.java

   /**
     * 这里是 ContextImpl 通过进程间通信调用的
     * @param caller
     * @param service
     * @param resolvedType
     * @param requireForeground
     * @param callingPackage
     * @param userId
     * @return
     * @throws TransactionTooLargeException
     */
    @Override
    public ComponentName startService(IApplicationThread caller, Intent service,
            String resolvedType, boolean requireForeground, String callingPackage, int userId)
            throws TransactionTooLargeException {

      ...
            try {
                /**
                 * 1. 调用 ActiveService 的 startServiceLocked 函数
                 */
                res = mServices.startServiceLocked(caller, service,
                        resolvedType, callingPid, callingUid,
                        requireForeground, callingPackage, userId);
            } finally {
                Binder.restoreCallingIdentity(origId);
            }
            return res;
        }
    }
```

注释 1 的代码具体实现是通过 ActiveService 类调用 startServiceLocked 函数，代码如下:

```java
//ActiveService.java

    ComponentName startServiceLocked(IApplicationThread caller, Intent service, String resolvedType,
            int callingPid, int callingUid, boolean fgRequired, String callingPackage, final int userId)
            throws TransactionTooLargeException {
			...

        /**
         * 1. 查找是否有与参数 Service 对应的 ServiceRecord
         */
        ServiceLookupResult res =
            retrieveServiceLocked(service, resolvedType, callingPackage,
                    callingPid, callingUid, userId, true, callerFg, false);

        if (res == null) {
            return null;
        }
        if (res.record == null) {
            return new ComponentName("!", res.permission != null
                    ? res.permission : "private to package");
        }

        /**
         * 2. 通过 ServiceLookupResult 得到参数 Service 对应的 ServiceRecord ,并传入到注释 3 处的 startServiceInnerLocked 中
         */
        ServiceRecord r = res.record;

        ...
        /**
         * 3. 调用内部 startServiceInnerLocked 函数
         */
        ComponentName cmp = startServiceInnerLocked(smap, service, r, callerFg, addToStarting);
        return cmp;
    }
```

在注释 1 处的 retrieveServiceLocked 函数会查找是否有与参数 service 对应的 ServiceRecord, 如果没有找到，就会调用 PMS 去获取参数 service 对应的 Service 信息，并封装到 ServiceRecord 中，最后将 ServiceRecord 封装为 ServiceLookupResult 返回。其中 ServiceRecord 用于描述一个 Service, 和此前讲过的 ActivityRecord 类似，在注释 2 中将得到的 ServiceRecord 赋值给注释 3 ，最后调用内部 startServiceInnerLocked 函数，代码如下:

```java
//ActiveServices.java


    ComponentName startServiceInnerLocked(ServiceMap smap, Intent service, ServiceRecord r,
            boolean callerFg, boolean addToStarting) throws TransactionTooLargeException {
			 ...
        /**
         * 继续调用内部函数
         */
        String error = bringUpServiceLocked(r, service.getFlags(), callerFg, false, false);
       ...

        return r.name;
    }
```

我们继续看 **bringUpServiceLocked** 函数

```java
//ActiveServices.java

    private String bringUpServiceLocked(ServiceRecord r, int intentFlags, boolean execInFg,
            boolean whileRestarting, boolean permissionsReviewRequired)
            throws TransactionTooLargeException {
        ....
        /**
         * 1. 获取 Service 想要在哪个进程中运行
         */
        final String procName = r.processName;
        String hostingType = "service";
        ProcessRecord app;

        if (!isolated) {
            /**
             * 2. 将 procname 和 Service 的 uid 传入到 AMS 的getProcessRecordLocked 函数，查询是否已经存在了当前启动的 Service
             */
            app = mAm.getProcessRecordLocked(procName, r.appInfo.uid, false);
      

            /**
             * 3. 如果运行 Service 的应用程序进程已经存在
             */
            if (app != null && app.thread != null) {
                try {
                    app.addPackage(r.appInfo.packageName, r.appInfo.versionCode, mAm.mProcessStats);
                    /**
                     * 3.1 启动 Service
                     */
                    realStartServiceLocked(r, app, execInFg);
                    return null;
...
            }
        } else {
...


        /**
         * 4. 如果用来运行的 Service 的应用程序进程不存在
         */
        if (app == null && !permissionsReviewRequired) {
            /**
             * 5. 创建应用程序进程
             */
            if ((app=mAm.startProcessLocked(procName, r.appInfo, true, intentFlags,
                    hostingType, r.name, false, isolated, false)) == null) {
                String msg = "Unable to launch app "
                        + r.appInfo.packageName + "/"
                        + r.appInfo.uid + " for service "
                        + r.intent.getIntent() + ": process is bad";
                Slog.w(TAG, msg);
                bringDownServiceLocked(r);
                return msg;
            }
....

        return null;
    }
```

上面代码主要逻辑就是通过在 AMS 查询需要启动的 Service 所在的进程是否已经存在，如果存在则启动 Service, 如果不存在就调用 注释 5 内部函数，创建一个应用程序进程，那么我们直接看注释 3.1 启动 Service 函数，代码如下:

```java
//ActiveService.java

    private final void realStartServiceLocked(ServiceRecord r,
            ProcessRecord app, boolean execInFg) throws RemoteException {
        ...
            /**
             * 1. 调用 app.thread 函数，其实就是调用 IApplicationThread 的 scheduleCreateService 函数
             */
            app.thread.scheduleCreateService(r, r.serviceInfo,
                    mAm.compatibilityInfoForPackageLocked(r.serviceInfo.applicationInfo),
                    app.repProcState);
            r.postNotification();
            created = true;
        } catch (DeadObjectException e) {
         ...
    }
```

这里的函数如果调用了 scheduleCreateService 说明已经离开了 AMS 进程，那么 app.thread 到底是什么了？它其实就是跟上一篇咱们介绍 Activity 启动模式一样，app.thread 就是 IApplicationThread 它是一个 aidl 文件，具体实现在 ActivityThread 的非静态内部类，具体看如下代码吧:

```java
//ActivityThread.java
public final class ActivityThread {
...
private class ApplicationThread extends IApplicationThread.Stub {
 ...
   
        public final void scheduleCreateService(IBinder token,
                ServiceInfo info, CompatibilityInfo compatInfo, int processState) {
            updateProcessState(processState, false);
            CreateServiceData s = new CreateServiceData();
            s.token = token;
            s.info = info;
            s.compatInfo = compatInfo;
						//调用内部重载函数
            sendMessage(H.CREATE_SERVICE, s);
        }   
 ...
  
  
}
```

这里调用内部重载函数这里只需记住 **H.CREATE_SERVIC** 标记，具体实现代码如下:

```java
  //ActivityThread.java 
	private void sendMessage(int what, Object obj) {
        /**
         * 1. 继续调用内部重载函数 what = H.CREATE_SERVIC
         */

        sendMessage(what, obj, 0, 0, false);
    }

....

    private void sendMessage(int what, Object obj, int arg1, int arg2, boolean async) {
        if (DEBUG_MESSAGES) Slog.v(
            TAG, "SCHEDULE " + what + " " + mH.codeToString(what)
            + ": " + arg1 + " / " + obj);
        Message msg = Message.obtain();
        msg.what = what;
        msg.obj = obj;
        msg.arg1 = arg1;
        msg.arg2 = arg2;
        if (async) {
            msg.setAsynchronous(true);
        }
        /**
         * 2. 通过 H 的 Handler 将 what = H.CREATE_SERVIC 消息 what 发送出去
         */
        mH.sendMessage(msg);
    }
```

这里直接看注释 2 通过 H 类的 sendMessage 将标志为 H.CREATE_SERVIC 发送出去。这里的 H 类就是继承的 Handler ，具体实现代码如下:

```java
//ActivityThread.java
public final class ActivityThread {
//初始化 H 类
final H mH = new H();
  
    /**
     * H 继承自 handler 是应用程序进程中主线程的消息管理类
     */
    private class H extends Handler {
      ...
        
      public static final int CREATE_SERVICE  = 114;
      
     .... 
  		public void handleMessage(Message msg) {
       ...
                
      case CREATE_SERVICE:
       //调用 handleCreateService
       handleCreateService((CreateServiceData)msg.obj);
       Trace.traceEnd(Trace.TRACE_TAG_ACTIVITY_MANAGER);
       break;
       ...
     }
    }
  
}
```

H 的 handleMessage 接收到发送过来的消息，调用 **handleCreateService** 函数，我们来看下具体实现:

```java
//ActivityService.java


    private void handleCreateService(CreateServiceData data) {

        /**
         * 1. 拿到要启动 Service 的应用程序的 LoadApk
         */
        LoadedApk packageInfo = getPackageInfoNoCheck(
                data.info.applicationInfo, data.compatInfo);
        Service service = null;
        try {
            /**
             * 2. 拿到类加载器
             */
            java.lang.ClassLoader cl = packageInfo.getClassLoader();
            /**
             * 3. 创建 Servcie 实例
             */
            service = (Service) cl.loadClass(data.info.name).newInstance();
        } catch (Exception e) {
            ...
        }

        try {
            if (localLOGV) Slog.v(TAG, "Creating service " + data.info.name);
            /**
             * 4. 创建 Context 实例
             */
            ContextImpl context = ContextImpl.createAppContext(this, packageInfo);
            context.setOuterContext(service);
            /**
             * 5. 拿到缓存中的 Application
             */
            Application app = packageInfo.makeApplication(false, mInstrumentation);
            service.attach(context, this, data.info.name, data.token, app,
                    ActivityManager.getService());
            /**
             * 6. 执行 Service onCreate 生命周期
             */
            service.onCreate();
            mServices.put(data.token, service);
            try {
                ActivityManager.getService().serviceDoneExecuting(
                        data.token, SERVICE_DONE_EXECUTING_ANON, 0, 0);
            } catch (RemoteException e) {
                throw e.rethrowFromSystemServer();
            }
        } catch (Exception e) {
            ...
        }
    }
```

这个函数里面的代码，几乎每行都很重要，我这里简单概括下，主要通过 ClassLoader 加载 Service 类，与 service 绑定 Application 和 Context 一个是应用级别，一个是服务级别，最后执行 Service 生命周期 onCreate 函数，这样服务就启动了，那么剩下的生命周期就都大同小异，小伙伴感兴趣的话，可以自己翻阅源码进行查阅，下一小节带给大家是另一种方式启动服务。

## bindService 绑定服务过程

###ContextImpl 到 AMS 的调用过程

下面还是以一张时序图先看下 ContextImpl 到 AMS 调用过程:

![KTeLJf.png](https://s2.ax1x.com/2019/10/31/KTeLJf.png)

ContextWrapper 的关系这里不再过多讲解，如果忘记了可以看我文章开头的介绍，我们直接看 ContextWrapper 类中的 bindService 函数，代码如下:

```java
//ContextWrapper.java
public class ContextWrapper extends Context {
    Context mBase;
  ...
    @Override
    public boolean bindService(Intent service, ServiceConnection conn,
            int flags) {
        return mBase.bindService(service, conn, flags);
    }
  
  ...
}
```

这里调用方式跟 startService 相似，都是调用 ContextImpl 内部函数，直接看 ContextImpl 的 bindService 函数

```java
//ContextImpl.java
    @Override
    public boolean bindService(Intent service, ServiceConnection conn,
            int flags) {
        warnIfCallingFromSystemProcess();
        return bindServiceCommon(service, conn, flags, mMainThread.getHandler(),
                Process.myUserHandle());
    }
```

调用内部重载函数 **bindServiceCommon**，代码如下:

```java
//ContextImp.java
    private boolean bindServiceCommon(Intent service, ServiceConnection conn, int flags, Handler handler, UserHandle user) {
...
        /**
         * 1. 调用 LoadApk 类型的对象 mPackageInfo 的 getServiceDispatcher 函数，它的主要作用就是将 ServiceConnection 封装为 IServiceConncet 类型的对象 sd, 从 IServiceConnection 的名字
         * 我们就能得知它实现了 Binder 机制，这样 Service 的绑定就支持了跨进程。
         */
        if (mPackageInfo != null) {
            sd = mPackageInfo.getServiceDispatcher(conn, getOuterContext(), handler, flags);
        } else {
            throw new RuntimeException("Not supported in system context");
        }
        validateServiceIntent(service);
        try {
            IBinder token = getActivityToken();
            if (token == null && (flags&BIND_AUTO_CREATE) == 0 && mPackageInfo != null
                    && mPackageInfo.getApplicationInfo().targetSdkVersion
                    < android.os.Build.VERSION_CODES.ICE_CREAM_SANDWICH) {
                flags |= BIND_WAIVE_PRIORITY;
            }
            service.prepareToLeaveProcess(this);
            /**
             * 2. 获得 AMS 的代理，调用 bindService 函数，将会传递到 AMS 中
             */
            int res = ActivityManager.getService().bindService(
                mMainThread.getApplicationThread(), getActivityToken(), service,
                service.resolveTypeIfNeeded(getContentResolver()),
                sd, flags, getOpPackageName(), user.getIdentifier());
            if (res < 0) {
                throw new SecurityException(
                        "Not allowed to bind to service " + service);
            }
            return res != 0;
        } catch (RemoteException e) {
            throw e.rethrowFromSystemServer();
        }
    }
```

这里我们直接看核心代码 调用 IActivityManager 的 bindService 函数，最终也还是会回到 AMS 中 bindService 函数，下一小节将详细介绍:

### Service 绑定过程

收到 ContextImp 向 AMS 发送过来的 bindService 请求，具体代码如下:

```java
//AMS.java

    /**
     * 通过 ContextImpl 调用，中间进程间通信传递过来的
     * @param caller
     * @param token
     * @param service
     * @param resolvedType
     * @param connection
     * @param flags
     * @param callingPackage
     * @param userId
     * @return
     * @throws TransactionTooLargeException
     */
    public int bindService(IApplicationThread caller, IBinder token, Intent service,
            String resolvedType, IServiceConnection connection, int flags, String callingPackage, int userId) throws TransactionTooLargeException {
			...
        synchronized(this) {
            //调用 ActiveService 的 bindServiceLocked 函数 
            return mServices.bindServiceLocked(caller, token, service,
                    resolvedType, connection, flags, callingPackage, userId);
        }
    }
```

回调到 AMS 的 bindService 函数中，内部又调用 ActiveService 的 bindServiceLocked 函数进行传递，这里可以看到 ActiveService 不管是 start 还是 bind 最后都是在 ActiveService 中处理 Service 的启动逻辑。下面调用代码如下:

```java
//ActiveServie.java

    int bindServiceLocked(IApplicationThread caller, IBinder token, Intent service,
            String resolvedType, final IServiceConnection connection, int flags,
            String callingPackage, final int userId) throws TransactionTooLargeException {
						....

            /**
             * 1. 调用 ServiceRecord 的 retrieveAppBindingLocked 函数来获取 AppBindRecord ，
             *    retrieveAppBindingLocked 函数内部创建 IntentBindRecord ,并对 IntentBindRecord 的成员变量进行赋值。
             */
            AppBindRecord b = s.retrieveAppBindingLocked(service, callerApp);
            ConnectionRecord c = new ConnectionRecord(b, activity,
                    connection, flags, clientLabel, clientIntent);

            IBinder binder = connection.asBinder();
					...

            if ((flags&Context.BIND_AUTO_CREATE) != 0) {
                s.lastActivity = SystemClock.uptimeMillis();
                /**
                 * 2. 在 bringUpServiceLocked 函数的内部中调用了 realStartServiceLocked 函数，最终由 ActivityThread 来调用 Service 的 onCreate 函数启动 Service.
                 */
                if (bringUpServiceLocked(s, service.getFlags(), callerFg, false,
                        permissionsReviewRequired) != null) {
                    return 0;
                }
            }

          ....

            /**
             * 3. 表示 Server 已经运行，其中 s 是 ServiceRecord 对象，app 是 ProcessRecord 类型对象，b.intent.received 表示当前应用程序进程已经接收到绑定服务的 Service 是返回回来的 Binder,
             */
            if (s.app != null && b.intent.received) {
                // Service is already running, so we can immediately
                // publish the connection.
                try {
                    /**
                     * 4. 调用 IServiceConnect 的connected 函数，具体实现在 @see ServiceDispatcher.InnerConnection，
                     */
                    c.conn.connected(s.name, b.intent.binder, false);
                } catch (Exception e) {
                  ...
                }

                /**
                 * 5. 如果当前应用程序进程是第一个与 Service 进行绑定的，并且 Service 已经调用过 onUnBind 函数，则需要调用注释 6 
                 */
                if (b.intent.apps.size() == 1 && b.intent.doRebind) {
                    /**
                     * 6. 调用内部 requestServiceBindingLocked 函数
                     */
                    requestServiceBindingLocked(s, b.intent, callerFg, true);
                }
            } else if (!b.intent.requested) {//7. 如果应用程序进程的 Client 端没有发送过绑定 Service 的请求，则会调用注释 8 
                /**
                 * 8.表示不是重新绑定
                 */
                requestServiceBindingLocked(s, b.intent, callerFg, false);
            }
            getServiceMapLocked(s.userId).ensureNotStartingBackgroundLocked(s);
        } finally {
            Binder.restoreCallingIdentity(origId);
        }
        return 1;
    }

```

当前函数中的处理逻辑比较多，涉及到了与 Service 相关的几个对象，这里先说明下；

- ServiceRecord：用于描述一个 Service
- ProcessRecord: 一个进程的信息
- ConnectionRecord：用于描述应用程序进程和 Service 建立的一次通信
- AppBindRecord: 应用程序进程通过 Intent 绑定 Service 时，会通过 AppBindRecord 来维护 Service 与应用程序进程之间的关联。其内部存储了谁绑定的 Service（ProcessRecord）、被绑定的 Service (AppBindRecord)、绑定 Service 的 Intent (IntentBindRecord) 和所有绑定通信记录的信息（ArraySet<ConnectionRecord>）。
- IntentBindRecord: 用于描述绑定 Service 的 Intent。

这里就不在介绍上面代码具体意思了，每一步都标注了详细注释，这里提一下上面注释 2 ，这里内部会调用 onCreate 步骤跟 startService 一样，然后我们看注释 6 如果当前应用程序进程是第一个与 Service 进行绑定的，并且 Service 已经调用过 onUnBind 函数。代码如下:

```java
//ActiveServices.java
    private final boolean requestServiceBindingLocked(ServiceRecord r, IntentBindRecord i,
            boolean execInFg, boolean rebind) throws TransactionTooLargeException {
        if (r.app == null || r.app.thread == null) {
            // If service is not currently running, can't yet bind.
            return false;
        }
        if (DEBUG_SERVICE) Slog.d(TAG_SERVICE, "requestBind " + i + ": requested=" + i.requested
                + " rebind=" + rebind);
        /**
         * 1. i.requested 表示是否发送过绑定的请求，这里上上一步知道是发送过的，因为 为 false, rebind 为true ,所以前面为 true,
         *    i.apps.size() 其中 i 是 IntentBindRecord 对象，AMS 会为每个绑定 Service 的Intent 分配一个 IntentBindRecord 类型的对象。
         */
        if ((!i.requested || rebind) && i.apps.size() > 0) {
            try {
                bumpServiceExecutingLocked(r, execInFg, "bind");
                r.app.forceProcessStateUpTo(ActivityManager.PROCESS_STATE_SERVICE);
              	//2. 调用 IApplicationThread 对象
                r.app.thread.scheduleBindService(r, i.intent.getIntent(), rebind,
                        r.app.repProcState);
                if (!rebind) {
                    i.requested = true;
                }
                i.hasBound = true;
                i.doRebind = false;
            } catch (TransactionTooLargeException e) {
             		...
                throw e;
            } catch (RemoteException e) {
              ...
                return false;
            }
        }
        return true;
    }
```

根据上面代码，最后会调用注释 2 ，通过 IApplicationThread 与 ActivityThread 应用程序进程通信，代码如下:

```java
//ActivityThread#ApplicationThread.java
 public final void scheduleBindService(IBinder token, Intent intent,boolean rebind, int processState) {
            updateProcessState(processState, false);
            BindServiceData s = new BindServiceData();
            s.token = token;
            s.intent = intent;
            s.rebind = rebind;
...
  					//1. 
            sendMessage(H.BIND_SERVICE, s);
        }
```

调用内部函数:

```java
//ActivityThread.java
    private void sendMessage(int what, Object obj) {
        /**
         * 继续调用内部重载函数 what = H.LAUNCH_ACTIVITY
         */

        sendMessage(what, obj, 0, 0, false);
    }

    private void sendMessage(int what, Object obj, int arg1, int arg2, boolean async) {
        if (DEBUG_MESSAGES) Slog.v(
            TAG, "SCHEDULE " + what + " " + mH.codeToString(what)
            + ": " + arg1 + " / " + obj);
        Message msg = Message.obtain();
        msg.what = what;
        msg.obj = obj;
        msg.arg1 = arg1;
        msg.arg2 = arg2;
        if (async) {
            msg.setAsynchronous(true);
        }
        /**
         * 2. 通过 H 的 Handler 将 what = H.LAUNCH_ACTIVITY 消息 what 发送出去
         */
        mH.sendMessage(msg);
    }
```

这里跟 startService 一样最后都是 通过 H 来通知bindService，下面代码如下:

```java
//ActivityThread.java
//ActivityThread.java
public final class ActivityThread {
//初始化 H 类
final H mH = new H();
  
    /**
     * H 继承自 handler 是应用程序进程中主线程的消息管理类
     */
    private class H extends Handler {
      ...
        
      public static final int CREATE_SERVICE  = 114;
      
     .... 
  		public void handleMessage(Message msg) {
       ...
                
      case BIND_SERVICE:
       //调用 handleBindService
				handleBindService((BindServiceData)msg.obj);
       break;
       ...
     }
    }
  
}
```

接下来我们看 handleUnbindService 函数具体实现:

```java
//ActivityThread.java
    private void handleBindService(BindServiceData data) {
        /**
         * 1. 获取需要绑定的 Service
         */
        Service s = mServices.get(data.token);
        if (s != null) {
            try {
                data.intent.setExtrasClassLoader(s.getClassLoader());
                data.intent.prepareToEnterProcess();
                try {
                    /**
                     * 2.没有经过绑定
                     */
                    if (!data.rebind) {
                        /**
                         * 3. 调动 Service 生命周期 onBind 函数
                         */
                        IBinder binder = s.onBind(data.intent);
                        /**
                         * 4. 调用 AMS 的 publishService 函数
                         */
                        ActivityManager.getService().publishService(
                                data.token, data.intent, binder);
                    } else {
                        /**
                         * 5.如果已经经过绑定调用 onRebind 生命周期函数
                         */
                        s.onRebind(data.intent);
                        ActivityManager.getService().serviceDoneExecuting(
                                data.token, SERVICE_DONE_EXECUTING_ANON, 0, 0);
                    }
                    ensureJitEnabled();
                } catch (RemoteException ex) {
                    throw ex.rethrowFromSystemServer();
                }
            } catch (Exception e) {
                ...
            }
        }
    }
```

这一步算是对 Service 进行开始执行生命周期函数了，如果 data.rebind 为 false 那么说明没有绑定，执行 **s.onBind(data.intent);** 生命周期函数，下面我们来看注释 4 调用 AMS 的 publishService ,代码如下:

```java
//AMS.java
    public void publishService(IBinder token, Intent intent, IBinder service) {
        // Refuse possible leaked file descriptors
        if (intent != null && intent.hasFileDescriptors() == true) {
            throw new IllegalArgumentException("File descriptors passed in Intent");
        }

        synchronized(this) {
            if (!(token instanceof ServiceRecord)) {
                throw new IllegalArgumentException("Invalid service token");
            }
            mServices.publishServiceLocked((ServiceRecord)token, intent, service);
        }
    }
```

内部调用 ActiveServices 的 publishServiceLocked 函数

```java
//ActiveServices.java

    void publishServiceLocked(ServiceRecord r, Intent intent, IBinder service) {
        final long origId = Binder.clearCallingIdentity();
        try {
         ...
            if (r != null) {
                Intent.FilterComparison filter
                        = new Intent.FilterComparison(intent);
                IntentBindRecord b = r.bindings.get(filter);
              ...
                    for (int conni=r.connections.size()-1; conni>=0; conni--) {
                        ArrayList<ConnectionRecord> clist = r.connections.valueAt(conni);
                        for (int i=0; i<clist.size(); i++) {
                            ConnectionRecord c = clist.get(i);
                           .....
                            try {
                              
                              //1. 
                                c.conn.connected(r.name, service, false);
                            } catch (Exception e) {
                                ...
                            }
                        }
                    }
                }
                serviceDoneExecutingLocked(r, mDestroyingServices.contains(r), false);
            }
        } finally {
            Binder.restoreCallingIdentity(origId);
        }
    }
```

在注释1 处调用了 ServiceDispatcher 类型的 sd 对象的 connected 函数，代码如下：

```java
//LoadedApk.java
        private static class InnerConnection extends IServiceConnection.Stub {
            final WeakReference<LoadedApk.ServiceDispatcher> mDispatcher;

            InnerConnection(LoadedApk.ServiceDispatcher sd) {
                mDispatcher = new WeakReference<LoadedApk.ServiceDispatcher>(sd);
            }

            public void connected(ComponentName name, IBinder service, boolean dead)
                    throws RemoteException {
                LoadedApk.ServiceDispatcher sd = mDispatcher.get();
                if (sd != null) {
                  //1. 
                    sd.connected(name, service, dead);
                }
            }
        }

        public void connected(ComponentName name, IBinder service, boolean dead) {
            if (mActivityThread != null) {
              //2. 
                mActivityThread.post(new RunConnection(name, service, 0, dead));
            } else {
                doConnected(name, service, dead);
            }
        }
```

这里首先通过进程间通信 AMS 发到 InnerConnection 的 connected 函数，然后调用 LoadedApk 的 connected 函数，最后执行 注释 2 的 post 函数， 代码如下：

```java
//LoadedApk.java

        private final class RunConnection implements Runnable {
            RunConnection(ComponentName name, IBinder service, int command, boolean dead) {
                mName = name;
						...
            }

            public void run() {
                if (mCommand == 0) {
                    doConnected(mName, mService, mDead);
                } else if (mCommand == 1) {
                    doDeath(mName, mService);
                }
            }
        }
```

调用 doConnected 函数，代码如下:

```java

        public void doConnected(ComponentName name, IBinder service, boolean dead) {
            ServiceDispatcher.ConnectionInfo old;
            ServiceDispatcher.ConnectionInfo info;

            synchronized (this) {
            ...

            // If there was an old service, it is now disconnected.
            if (old != null) {
                mConnection.onServiceDisconnected(name);
            }
            if (dead) {
                mConnection.onBindingDied(name);
            }
            // If there is a new service, it is now connected.
            if (service != null) {
                /**
                 * 1. 调用了 ServiceConnection 类型的对象 mConnection 的 onServiceConnected 函数，这样在客户端实现了 ServiceConnection 接口，那么就会被执行。
                 */
                mConnection.onServiceConnected(name, service);
            }
        }
```

通过上面代码的注释 1 我们知道，只要客户端通过如下代码绑定，那么就会回调到 onServiceConnected 回调，

```java
        bindService(new Intent(XXXX,XXXX), new ServiceConnection() {
            @Override
            public void onServiceConnected(ComponentName name, IBinder service) {
                Log.d(TAG,"绑定成功");
            }

            @Override
            public void onServiceDisconnected(ComponentName name) {
 								Log.d(TAG,"绑定失败，或者取消绑定");
            }
        })
```

至此，整个 bindService 过程就分析完成。最后给出一个 AMS 到 ServiceConnection 时序图。

![KTwFtf.png](https://s2.ax1x.com/2019/10/31/KTwFtf.png)

## 总结

这里我们可以分为 3 个阶段来进行服务的绑定，下面还是以一张图来表述（ps: 这里给处较难的 bindService 大概流程）。

![KTwo8S.png](https://s2.ax1x.com/2019/10/31/KTwo8S.png)

## 参考

- 《Android 进阶解密》