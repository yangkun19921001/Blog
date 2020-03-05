## AMS 介绍
ActivityManagerService 简称 AMS , 是 Android 内核中核心功能之一，由 com.android.server.SystemService.java 启动。

## AMS 启动流程

以下流程因为涉及的源代码太多了 , 我这里以 UML 流程图跟代码截图以示,

### Android 系统启动

[![Android-.png](https://s3.ax2x.com/2019/07/20/Android-.png)](https://free.imgsha.com/i/jI06P)

### 应用进程启动

![](http://tva1.sinaimg.cn/large/0060lm7Tly1g56sx1xxqcj30u01fox6q.jpg)



### ServiceManager 启动

[![BinderServiceManager.png](https://s3.ax2x.com/2019/07/21/BinderServiceManager.png)](https://free.imgsha.com/i/jI8WE)

### AMS 注册 

[![AMS.png](https://s3.ax2x.com/2019/07/21/AMS.png)](https://free.imgsha.com/i/jI9n3)

### AMS 启动详解

[![AMS-.png](https://s3.ax2x.com/2019/07/21/AMS-.png)](https://free.imgsha.com/i/jNLv5)

`代码流程:`

1. AMS 具体是在 SystemService 进中启动的，主要是在 `com/android/server/SystemServer.java` main() 函数中进行。

   ```java
       /**
        * 这里的 main 函数 主要是 zygote 通过反射调用
        */
       public static void main(String[] args) {
           new SystemServer().run();
       }
   ```

2. 从上图可以得知 main 方法主要是执行的 `com/android/server/SystemServer.java` run() 函数，我们具体来看下 run() 到底干了什么？

   ```java
   
       private void run() {
           try {
   				....
               //加载了动态库libandroid_servers.so
               System.loadLibrary("android_servers");
               //创建SystemServiceManager，它会对系统的服务进行创建、启动和生命周期管理
               mSystemServiceManager = new SystemServiceManager(mSystemContext);
               mSystemServiceManager.setRuntimeRestarted(mRuntimeRestart);
               LocalServices.addService(SystemServiceManager.class, mSystemServiceManager);
           } finally {
      
           }
   
           // 启动各种服务
           try {
               traceBeginAndSlog("StartServices");
             //启动了ActivityManagerService、PowerManagerService、PackageManagerService 等服务
               startBootstrapServices();
             // 启动了BatteryService、UsageStatsService和WebViewUpdateService 等服务
               startCoreServices();
             // 启动了CameraService、AlarmManagerService、VrManagerService等服务
               startOtherServices();
               SystemServerInitThreadPool.shutdown();
             
             ....
               
           } catch (Throwable ex) {
               throw ex;
           } finally {
               traceEnd();
           }
           // Loop forever.
           Looper.loop();
           throw new RuntimeException("Main thread loop unexpectedly exited");
       }
   ```

   run () 函数核心任务就是初始化一些事务和核心服务启动，这里核心服务初略有 80 多个，系统把核心服务大概分为了 3 类，分别是引导服务、核心服务和其他服务，因为这小节主要研究 AMS 启动，所以我们只关注 startBootstrapServices(); 内容就行了。

3. startBoostrapService() 这个函数的主要作用，根据官方的意思就是启动需要获得的小型的关键服务。 这些服务具有复杂的相互依赖性，这就是我们在这里将它们全部初始化的原因。 除非您的服务也与这些依赖关系缠绕在一起，否则应该在其他一个函数中初始化它。

   ```java
   public void startBootstrapServices(){
     ...
       
       		//启动 AMS 服务
           mActivityManagerService = mSystemServiceManager.startService(
           ActivityManagerService.Lifecycle.class).getService();
     			//设置管理器
           mActivityManagerService.setSystemServiceManager(mSystemServiceManager);
     			//设置安装器
           mActivityManagerService.setInstaller(installer);
     
     ...
       
   }
   ```

   这里主要调用 SystemServiceManager 的 startService 方法，方法的参数是 `ActivityManagerService.Lifecycle.class`  `com/android/server/SystemServiceManager.java` 我们再来看看 SSM 的 startService 方法主要干嘛了?

4. SSM startService(Class<T> serviceClass)

   ```java
       public <T extends SystemService> T startService(Class<T> serviceClass) {
           try {
             ...
               final T service;
               try {
                   Constructor<T> constructor = serviceClass.getConstructor(Context.class);
                   //实例化对象
                   service = constructor.newInstance(mContext);
               }  catch (InvocationTargetException ex) {
                   throw new RuntimeException("Failed to create service " + name
                           + ": service constructor threw an exception", ex);
               }
   
               startService(service);
               return service;
           } finally {
               Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
           }
       }
   ```

   跟踪代码可以得知 startService 方法传入的参数是 Lifecycle.class，Lifecycle 继承自 SystemService 。首先，通过反射来创建 Lifecycle 实例，得到传进来的 Lifecycle 的构造器 constructor ，接着又调用 constructor 的newInstance 方法来创建 Lifecycle 类型的 service 对象。接着将刚创建的 service 添加到 ArrayList 类型的mServices 对象中来完成注册。最后在调用 service 的 onStart 方法来启动 service ，并返回该 service 。Lifecycle 是 AMS 的内部类。

5. Lifecycle 走向

   ```java
       public static final class Lifecycle extends SystemService {
           private final ActivityManagerService mService;
   
           public Lifecycle(Context context) {
               super(context);
               mService = new ActivityManagerService(context);
           }
   
           @Override
           public void onStart() {
               mService.start();
           }
   
           public ActivityManagerService getService() {
               return mService;
           }
       }
   ```

   `主要执行 Lifecyle onStart()`

   ```java
       public void startService(@NonNull final SystemService service) {
           // 把 AMS 服务添加到系统服务中
           mServices.add(service);
           // Start it.
           long time = System.currentTimeMillis();
           try {
             //执行 Lifecyle 重 onStart 函数方法
               service.onStart();
           } catch (RuntimeException ex) {
               throw new RuntimeException("Failed to start service " + service.getClass().getName()
                       + ": onStart threw an exception", ex);
           }
           warnIfTooLong(System.currentTimeMillis() - time, service, "onStart");
       }
   ```

   

   上面第四步调用 constructor 的 newInstance 方法已经实例化了 Lifecycle 并创建 new 

   ActivityManagerService(context); 对象，接着又在第四步 startService(service) 调用了 service.start();实际上是调用了 Lifecyle  onStart 函数方法。

6. ActivityManagerService getService() 

   ```java
           mActivityManagerService = mSystemServiceManager.startService(
                   ActivityManagerService.Lifecycle.class).getService();
   ```

   从上面代码得知实际上是调用了 AMS 中内部类 Lifecycle 中的 getService 函数返回了 AMS 实例，那么 AMS 实例就相当于创建了。

7. 最后启动 AMS 进程是在 Zygote 中执行的，可以参考应用进程中的流程图。