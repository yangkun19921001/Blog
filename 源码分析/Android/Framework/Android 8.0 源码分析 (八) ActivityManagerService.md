## 前言

相信在看过我前面几篇分析 Android 系统源码文章的知道，基本上每一篇文章都会涉及到 AMS 知识，那么 AMS 主要的作用是干嘛的，在这几篇文章中充当什么角色，当时也没有具体说明，那么这一篇文章将来全面分析 AMS, 在阅读本篇文章之前，建议先看一下我下面的几篇文章，这样有助于快速理解并进入状态。

[Android 8.0 源码分析 (一) SystemServer 进程启动](https://juejin.im/post/5db3f95ee51d4529e83947f9)

[Android 8.0 源码分析 (二) Launcher 启动](https://juejin.im/post/5db5565cf265da4d0f14053c)

[Android 8.0 源码分析 (三) 应用程序进程创建到应用程序启动的过程](https://juejin.im/post/5db599bc6fb9a0203b234b08)

[Android 8.0 源码分析 (四) Activity 启动](https://juejin.im/post/5db85da4e51d4529f73e27fb)

[Android 8.0 源码分析 (五) Service 启动](https://juejin.im/post/5dbb0507f265da4cf406f735)

[Android 8.0 源码分析 (六) BroadcastReceiver 启动](https://juejin.im/post/5dbd5144e51d456eec1830af)

[Android 8.0 源码分析 (七) ContentProvider 启动](https://juejin.im/post/5dbe8e6ce51d456f0006634a)

[Android 8.0 源码分析 (八) ActivityManagerService](https://juejin.im/post/5dc4339c5188254e7a15585c)

下面我们先从 AMS 启动来一步一步往下分析

## AMS 启动过程

AMS 启动是在 SystemServer 进程中启动的，关于 SystemServer 进程的启动我们在讲解系统源码的第一篇文章已经讲过，这里就直接从它的 main 函数入口分析，代码如下:

```java
//SystemServer.java
    /**
     * 这里的 main 函数 主要是 zygote 通过反射调用
     */
    public static void main(String[] args) {
        new SystemServer().run();
    }
```

main 方法里面初始化了 SystemServer 对象并调用了本身的 run 方法，代码如下:

```java
//SystemServer.java
    private void run() {
        try {
            ...//代码部分省略

            /**
             * 创建 主线程的消息 Looper
             */

            Looper.prepareMainLooper();

            /**
             * 1. 加载动态库 libandroid_servers .so
             */
            System.loadLibrary("android_servers");

						...//代码部分省略


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
        } finally {
            
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
            throw ex;
        } finally {
            traceEnd();
        }

        ...//代码省略
        Looper.loop();
        throw new RuntimeException("Main thread loop unexpectedly exited");
    }
```

其实这里的 run 方法在讲解 SystemServer 的时候已经讲解，这里咱们就再来学习一遍，就相当于复习了，下面根据小点来大概总结下 run 方法:

1. 在注释 1 处加载了动态库 `libandroid_servers.so` 文件;
2. 在注释 2 处创建 SystemServiceManager ，它会对系统的服务进行创建、启动和生命周期管理;
3. 在注释 3 处的 `startBootstrapServices` 方法中，通过注释 2 创建好的 SystemServiceManager 来启动 ActivityManagerService 、PowerManagerService、PackageManagerService 等服务。
4. 在注释 4 处的 `startCoreServices` 方法中则启动了 DropBoxManagerService、BatteryServices、UsageStatsService、WebViewUpdateService 等服务。
5. 在注释 5 处的 `startOtherServices` 方法中启动了 CameraService、AlarmManagerService、VrManagerService 等服务。

在注释 3，4，5 中启动的服务均为 `SystemService` 服务，从当中的方法可以看出，官方把这些服务分为了 3 个大类，分别是引导服务、核心服务和其它服务。这里我们启动了许多的系统服务，我们并不会一一去介绍它们，我们的主要任务还是了解引导服务中的 AMS 是如何启动的，请看下面代码:

```java
//SystemService.java
   private void startBootstrapServices() {
       ...//省略部分代码
         
        //1. 
        mActivityManagerService = mSystemServiceManager.startService(
                ActivityManagerService.Lifecycle.class).getService();
        mActivityManagerService.setSystemServiceManager(mSystemServiceManager);
        mActivityManagerService.setInstaller(installer);
        ...
    }
```

在注释 1 处调用了 SystemServiceManager 的 startService 方法，该方法的参数 AMS.Lifecyle.class; 下面我们看下 SystemServiceManager 的 startService 实现，如下代码:

```java
//SystemServiceManager.java
    public void startService(@NonNull final SystemService service) {
        //1. 将服务添加进开启服务的总容器中
        mServices.add(service);
        // Start it.
        long time = System.currentTimeMillis();
        try {
         //2. 
            service.onStart();
        } catch (RuntimeException ex) {
         ...//省略部分代码
        }
        
    }
```

传入 SystemService 类型的 service 对象的值为 AMS.Lifecycle.class 。在注释 1 处将 service 对象添加到 ArrayList 类型的 mServices 中来完成注册。在注释 2 处调用 service 的 onStart 方法来启动 service 对象，这个 service 对象具体指的是什么呢？ 我们接着往下看，Lifecycle 是 AMS 的内部类，代码如下:

```java
//AMS.java
    public static final class Lifecycle extends SystemService {
        private final ActivityManagerService mService;

        public Lifecycle(Context context) {
            super(context);
          //1.
            mService = new ActivityManagerService(context);
        }

        @Override
        public void onStart() {
          //2. 
            mService.start();
        }

        public ActivityManagerService getService() {
          //3. 
            return mService;
        }
    }
```

上面的代码需要结合 SystemServiceManager 的 startService 来分析。注释 1 在 Lifecycle 对象创建的时候会初始化 AMS 实例。当调用 SystemService 类型的 service 服务的 onStart 方法会执行注释 2 的 AMS start 方法，最后注释 3 得到的就是 AMS 实例对象了，AMS 启动就完成了。

## AMS 与应用程序进程

在 SystemServer 中讲到了 ZygoteInit main方法是开起 Java 框架的入口，在 main 中会创建一个 Server 端的 Socket , 这个 Socket 用来等待 AMS 请求 Zygote 进程创建一个新的子进程的任务。那么要启动一个应用程序首先就要保证应用程序的应用进程必须存在。在启动一个应用程序组件的前提就会先检查这个应用程序所需要依附的进程是否存在，如果不存在就会在 AMS 建立一个本地 Socket 连接 Zygote 的服务端 Socket ,发送创建需要启动进程的信息给 Zygote ，这里就以为常用的 Activity 启动为例，来分析 AMS 与应用程序进程的关系，Activity 在启动过程中会调用 `ActivityStackSupervisor#startSpecificActivityLocked(ActivityRecord r,
            boolean andResume, boolean checkConfig)` 方法，下面请看源码具体实现:

```java
//ActivityStackSupervisor.java
    void startSpecificActivityLocked(ActivityRecord r,
            boolean andResume, boolean checkConfig) {
        /**
         * 1. 获取即将启动的 Activity 所在的应用程序进程
         */
        ProcessRecord app = mService.getProcessRecordLocked(r.processName,
                r.info.applicationInfo.uid, true);

        r.getStack().setLaunchTime(r);

        /**
         * 2. 判断要启动的 Activity 所在的应用程序进程如果已经运行的话，就会调用注释 3
         */
        if (app != null && app.thread != null) {
            try {
                if ((r.info.flags&ActivityInfo.FLAG_MULTIPROCESS) == 0
                        || !"android".equals(r.info.packageName)) {
                    
                    app.addPackage(r.info.packageName, r.info.applicationInfo.versionCode,
                            mService.mProcessStats);
                }
                /**
                 * 3. 如果已经正在运行调用 realStartActivityLocked 函数
                 */
                realStartActivityLocked(r, app, andResume, checkConfig);
                return;
            } catch (RemoteException e) {
                Slog.w(TAG, "Exception when starting activity "
                        + r.intent.getComponent().flattenToShortString(), e);
            }
        }

        /**
         * 4，如果启动 Activity 所需要的进程不存在，就调用 AMS startProcessLocked 方法通知下去需要创建进程的任务
         */
        mService.startProcessLocked(r.processName, r.info.applicationInfo, true, 0,
                "activity", r.intent.getComponent(), false, false, true);
    }
```

我们直接看上面 注释 1，2，4 的代码，首先获取需要启动的 Activity 所在的进程是否存在，如果存在就继续下发启动 Activity 的任务，如果不存在执行注释 4 通知 AMS 需要创建新的进程的任务信息。最后会在 `ZygoteProcess#zygoteSendArgsAndGetResult(
            ZygoteState zygoteState, ArrayList<String> args)` 方法中，以 Socket 方式通知 zygote 进程来创建新的子进程任务，代码如下:

```java
//ZygoteProcess.java
   private static Process.ProcessStartResult zygoteSendArgsAndGetResult(
            ZygoteState zygoteState, ArrayList<String> args)
            throws ZygoteStartFailedEx {
        try {
          
            int sz = args.size();
            for (int i = 0; i < sz; i++) {
                if (args.get(i).indexOf('\n') >= 0) {
                    throw new ZygoteStartFailedEx("embedded newlines not allowed");
                }
            }

            final BufferedWriter writer = zygoteState.writer;
            final DataInputStream inputStream = zygoteState.inputStream;

            writer.write(Integer.toString(args.size()));
            writer.newLine();

            for (int i = 0; i < sz; i++) {
                String arg = args.get(i);
              	//将启动进程的信息通知给 zygote 进程
                writer.write(arg);
                writer.newLine();
            }

            writer.flush();

         ...
            return result;
        } catch (IOException ex) {
            zygoteState.close();
            throw new ZygoteStartFailedEx(ex);
        }
    }
```

zygote 进程收到 AMS 发送过来的消息，最后会通过 zygote 的`nativeForkAndSpecialize` native 方法来创建新的子进程，创建好了之后会以反射的方式来调用应用程序进程的入口 `ActivityThread#main` 到这里 AMS 与应用程序进程的关系也讲完了，下面我们分析 AMS 中重要的几个类。

## AMS 重要的数据结构

AMS 涉及到了很多数据结构，这一节我们来分析一下 ActivityRecord、TaskRecord 和 ActivityStack, 为什么要学习它们呢？因为它们和应用开发关联较大，是 Activity 任务栈模型的基础。

### 1. 解析 ActivityRecord 

ActivityRecord 在讲解 Activity 启动的时候，我们已经见过它了，它的作用就是记录 Activity 的所有信息，是在 Activity 启动的时候创建，具体是在 ActivityStarter 的 startActivity 方法中被创建的，下面我们看一下它内部结构:

| 成员名称            | 类型                   | 说明                                                         |
| ------------------- | ---------------------- | ------------------------------------------------------------ |
| service             | ActivityManagerService | AMS 的引用                                                   |
| Info                | ActivityInfo           | Activity 中代码和 AndroidManifes 设置的节点信息，比如 launchMode |
| launchedFromPackage | String                 | 启动 Activity 的包名                                         |
| taskAffinity        | String                 | Activity 希望归属的栈                                        |
| Task                | TaskRecord             | ActivityRecord 所在的 TaskRecord                             |
| App                 | ProcessRecord          | ActivityRecord 所在的应用程序进程                            |
| tate                | ActivityState          | 当前 Activity 的状态                                         |
| icon                | Int                    | Activity 的图标资源标识符                                    |
| theme               | Int                    | Activity 的主题资源标识符                                    |

从上面表格可以看出 ActivityRecord 的作用，其内部存储了 Activity 的所有信息，包括 AMS 的引用、AndroidManifes 节点信息、Activity 状态、Activity 资源信息和 Activity 进程相关信息等，需要注意的是其中包含该 ActivityRecord 所在的 TaskRecord ，这就将 ActivityRecord 和 TaskRecord 关联在一起，它们是 Activity 任务栈模型的重要成员，我们接着来查看 TaskRecord.

### 2. 解析 TaskRecord

TaskRecord 用来描述一个 Activity 任务栈，其内部也有很多的成员变量，这里挑出一些重要成员变量进行介绍

| 成员名称    | 类型                      | 说明                             |
| ----------- | ------------------------- | -------------------------------- |
| taskId      | Int                       | 任务栈的唯一标识符               |
| affinity    | String                    | 任务栈的倾向性                   |
| intent      | Intent                    | 启动这个任务栈的 Intent          |
| mActivities | ArrayList<ActivityRecord> | 按照历史顺序排列的 Activity 记录 |
| mStack      | ActivityStack             | 当前归属的 ActivityStack         |
| mService    | ActivityManagerService    | AMS 的引用                       |

从上面表格中可以发现 TaskRecord 的作用。其内部存储了任务栈的所有信息，包括任务栈的唯一标识符、任务栈的倾向性、任务栈中的 Activity 记录和 AMS 的引用等，需要注意的是其中含有 ActivityStack, 也就是当前 Activity 任务栈所归属的 ActivityStack, 我们接着来查看 ActivityStack.

### 3. 解析 ActivityStack

ActivityStack 是一个管理类，用来管理系统所有 Activity ，其内部维护了 Activity 的所有状态，特殊状态的 Activity 以及和 Activity 相关的列表等数据。ActivityStack 是由 ActivityStackSupervisor 来进行管理的，而 ActivityStackSupervisor 在 AMS 的构造方法中被创建，如下所示:

```java
//AMS.java

    public ActivityManagerService(Context systemContext) {
     ...
     mStackSupervisor = createStackSupervisor();  
     ...
      
    }
    protected ActivityStackSupervisor createStackSupervisor() {
        return new ActivityStackSupervisor(this, mHandler.getLooper());
    }
```

- ActivityStack 的实例类型

在 ActivityStackSupervisor 中有多种 ActivityStack 实例，如下所示:

```java
//ActivityStackSupervisor.java
public class ActivityStackSupervisor extends ConfigurationContainer implements DisplayListener {
 ...
      /** 用来存储 Launcher APP 的所有的 Activity */
    ActivityStack mHomeStack;

    /** 表示当前正在接收输入或启动下一个 Activity 的所有 Activity.  */
    ActivityStack mFocusedStack;

    /**  表示此前接收输入的所有的 Activity */
    private ActivityStack mLastFocusedStack; 
   
 ...
  
  
}
```

通过上面成员变量，我们知道这里提供了 3 种 ActivityStack,分别为 mHomeStack、mFocusedStack、mLastFocusedStack。通过 ActivityStackSupervisor 提供了获取上述 ActivityStack 的方法，代码如下:

```java
//ActivityStackSupervisor.java
    ActivityStack getFocusedStack() {
        return mFocusedStack;
    }

    ActivityStack getLastStack() {
        return mLastFocusedStack;
    }
```

- ActivityState

在 ActivityStack 中通过枚举存储了 Activity 的所有的状态，如下所示:

```java
    enum ActivityState {
        INITIALIZING,
        RESUMED,
        PAUSING,
        PAUSED,
        STOPPING,
        STOPPED,
        FINISHING,
        DESTROYING,
        DESTROYED
    }
```

通过名称我们可以很轻易知道这些状态所代表的意义。

- 特殊状态的 Activity

在 ActivityStack 中定义了一些特殊状态的 Activity, 如下所示:

```java
    /**
     * 正在暂停的 Activity
     */
    ActivityRecord mPausingActivity = null;

    /**
     * 上一个已经暂停的 Activity
     */
    ActivityRecord mLastPausedActivity = null;

    /**
     * 最近一次没有历史记录的 Activity
     */
    ActivityRecord mLastNoHistoryActivity = null;

    /**
     * 已经 resume 的 Activity
     */
    ActivityRecord mResumedActivity = null;

    /**
     * 传递给 convertToTranslucent 方法的最上层的 Activity
     */
    ActivityRecord mTranslucentActivityWaiting = null;
```

可以看到这些特殊状态类型都是 ActivityRecord, ActivityRecord 是用来记录所有的 Activity 信息。

- 维护的 ArrayList

  在 ActivityStack 中维护了很多 ArrayList ,这些 ArrayList 中的元素类型主要有 ActivityRecord 和 TaskRecord, 如下所示:

  | ArrayList          | 元素类型       | 说明                                                         |
  | ------------------ | -------------- | ------------------------------------------------------------ |
  | mTaskHisttory      | TaskRecord     | 所有没有被销毁的 Activity 任务栈                             |
  | mLRUActivities     | ActivityRecord | 正在运行的 Activity ,列表中的第一个条目是最近最少使用的 Activity |
  | mNoAnimActivities  | ActivityRecord | 不考虑转换动画的 Activity                                    |
  | mValidateAppTokens | TaskGroup      | 用于与窗口管理器验证应用令牌                                 |

  ActivityStack 维护了元素类型为 TaskRecord 的列表，这样 ActivityStack 和 TaskRecord 就有了关联， Activity 任务栈存储在 ActivityStack 中。AMS 重要的数据结构 ActivityRecord、TaskRecord 和 ActivityStack 就讲到这里下面开始分析 Activity 栈。

## Activity 栈管理

我们平时做应用开发都知道 Activity 是放入在 Activity 任务栈中的，有了任务栈，系统和开发者就能够更好地应用和管理 Activity,来完成各种业务逻辑，这一小节我们就来学习 Activity 栈管理相关的知识:

### Activity 任务栈模型

下面先以一张图来看一下 Activity 任务栈模型的重要组成部分

![MAvXZt.png](https://user-gold-cdn.xitu.io/2019/11/7/16e46697af2b0371?w=821&h=934&f=png&s=36853)

ActivityRecord 用来记录一个 Activity 的所有信息，TaskRecord 中包含了一个或多个 ActivityRecord ，TaskRecord 用来表示 Activity 的任务栈，用来管理栈中的 ActivityRecord , ActivityStack 又包含了一个或多个 TaskRecord, 它是 TaskRecord 管理者。Activity 栈管理就是建立在 Activity 任务栈模型之上的，有了栈管理，我们可以对应用程序进行操作，应用可以用自身应用中以及其他应用的 Activity ,节省了资源。

### Launch Mode

LaunchMode 相信大家都不陌生，用于设定 Activity 的启动方式，无论是哪种启动方式，所启动的 Activity 都会位于 Activity 的栈顶。下面来介绍 LaunchMode 启动模式:

- standerd：默认模式，每次启动 Activity 都会创建一个新的 Activity 实例。
- singleTop: 如果要启动的 Activity 已经在栈顶，则不会重新创建 Activity, 同时该 Activity 的 onNewIntent 方法会被调用。如果要启动的 Activity 不在栈顶，则会重新创建该 Activity 的实例。
- singleTask: 如果要启动的 Activity 已经存在栈中，那么该 Activity 不会重新创建实例，它会将存在栈中的 Activity 出栈，同时该 Activity 的 onNewIntent 方法会被调用。如果要启动的 Activity 不在栈中，则会重新创建该 Activity 实例。如果要启动的 Activity 不在栈中并且该 栈 也不存在，那么首先要创建一个新栈，然后创建该 Activity 实例并压入到新栈中。
- singleInstance: 和 singleTask 基本类似，不同的是启动 Activity 时，首先要创建一个新栈，然后创建该 Activity 实例并压入新栈中，新栈中只会存在着一个 Activity 实例。

### Intent 的 FLAG

在 Intent 中定义了很多 flag ，其中有几个可以设定 Activity 的启动方式，如果 LaunchMode 和 Flag 设定的 Activity 的启动方式有冲突，则以 Flag 设定的为准。

- FLAG_ACTIVITY_SINGLE_TOP: 和 LaunchMode 中的 singleTop 效果一致。
- FLAG_ACTIVITY_NEW_TASK: 和 LauncheMode 中的 singleTask 效果一致。
- FLAG_ACTIVITY_CLEAR_TOP: 在 LaunchMode 中没有与此对应的模式，如果要启动的 Activity 已经存在于栈中，则将所有位于它上面的 Activity 出栈。singleTask 默认具有此标记位的效果。

除了上述这三个 FLAG , 还有一些 FLAG 对我们分析栈管理有些帮组。

- FLAG_ACTIVITY_NO_HISTORY: Activity 一旦退出，就不会存在于栈中。同样地，也可以在 AndroidManifest.xml 中设置 andorid:noHistory。
- FLAG_ACTIVITY_MULTIPLE_TASK: 需要和 FLAG_ACTIVITY_NEW_TASK 一同使用才有效果，系统会启动一个新的栈来容纳新启动的 Activity.
- FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS: Activity 不会被放入到 “最近启动的 Activity” 列表中。
- FLAG_ACTIVITY_ BROUGHT_TO_FRONT: 这个标志位通常不是由应用程序中的代码设置的，而是 Launch Mode 为 singleTask 时，由系统自动加上的。
- FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY: 这个标志位通常不是由应用程序中的代码设置的，而是从历史记录中启动的(长按 Home 键调出)
- FLAG_ACTIVITY_CREATE_TASK: 需要和 FLAG_ACTIVITY_NEW_TASK 一同使用才有效果，用于清除与启动的 Activity 相关的栈的所有其它 Activity。

### taskAffinity

我们可以在 AndroidManifest.xml 中设置 android:taskAffinity, 用来指定 Activity 希望归属的栈，在默认情况下，同一个应用程序的所有的 Activity 都有着相同的 taskAffinity。taskAffinity 在下面两种情况时会产生效果。

1. taskAffinity 与 FLAG_ACTIVITY_NEW_TASK 或者 singleTask 配合。如果新启动 Activity 的 taskAffinity 和栈的 taskAffinity 相同则加入到该栈中；如果不同，就会创建新栈。
2. taskAffinity 与 allowTaskReparenting 配合。如果 allowTaskReparenting 为 true, 说明 Activity 具有转移的能力。

接下来根据源码来查看 taskAffinity，在 ActivityStackSupervistor 的 findTaskLocked 方法用于找到 Activity 最匹配的栈，最终会调用 ActivityStack 的 findTaskLocked 方法:

```java
//ActivityStack.java
    void findTaskLocked(ActivityRecord target, FindTaskResult result) {
        Intent intent = target.intent;
        ActivityInfo info = target.info;
        ComponentName cls = intent.getComponent();
       ...
        /**
         * 1.  遍历 TaskRecord 列表，它用于存储没有被销毁的栈
         */
        for (int taskNdx = mTaskHistory.size() - 1; taskNdx >= 0; --taskNdx) {
            /**
             * 2. 得到某一个栈的信息
             */
            final TaskRecord task = mTaskHistory.get(taskNdx);
            ...
                /**
                 * 3. 将栈的 taskAffinity 和目标 Activity 的 taskAffinity 作对比，如果相同，则将 FindTaskResult 的 matchedByRootAffinity 属性设置为 true 说明找到了匹配的栈
                 */
            } else if (!isDocument && !taskIsDocument
                    && result.r == null && task.rootAffinity != null) {
                if (task.rootAffinity.equals(target.taskAffinity)) {
                    if (DEBUG_TASKS) Slog.d(TAG_TASKS, "Found matching affinity candidate!");
                    result.r = r;
                    result.matchedByRootAffinity = true;
                }
            } else if (DEBUG_TASKS) Slog.d(TAG_TASKS, "Not a match: " + task);
        }
    }
```

上面代码主要先遍历 TaskRecord 列表（它用于存储没有被销毁的栈），然后列表中的 TaskRecord 的 rootAffinity 挨个与 目标 Activity 的 taskAffinity 做比较，如果相同，则将 FindTaskResult 的 matchedByRootAffinity 属性设置为 true ，说明找到了匹配的栈。



AMS 到这里就分析完了，不知道大家有没有收获!

## 总结

本篇文章主要介绍了 AMS 启动、AMS 数据结构、Activity 栈管理等知识，在了解 AMS 之前建议先去把我之前分析的四大组件和 SystemServer 源码建议先过一篇，因为它们都会涉及到 AMS 知识，如果都理解了前面的知识，相信看完这篇文章你会有更多的收获!

感谢你的阅读，谢谢!

## 参考

- 《Android 进阶解密》