# Android 8.0 源码分析 \(四\) Activity 启动

## 前言

我们熟知一般 Android 工程师都是在应用层上开发，不会涉及系统源码，但是如果你想往底层发展，或者深入插件化、Framework 系统层等开发工作，如果不了解 Android 源码可是不行的，那么接下来我基于自己的理解跟学习来记录跟 Android 开发息息相关的源码分析，大概从 Android 中的 SystemServer 启动、四大组件启动、AMS、PMS 等几个维度来介绍，下面是我的计划，当然在未来也有可能改变。

**还没有关注的小伙伴，可以先关注一波，系列文章会持续更新。**

[Android 8.0 源码分析 \(一\) SystemServer 进程启动](https://juejin.im/post/5db3f95ee51d4529e83947f9)

[Android 8.0 源码分析 \(二\) Launcher 启动](https://juejin.im/post/5db5565cf265da4d0f14053c)

[Android 8.0 源码分析 \(三\) 应用程序进程创建到应用程序启动的过程](https://juejin.im/post/5db599bc6fb9a0203b234b08)

[Android 8.0 源码分析 \(四\) Activity 启动](android-8.0-yuan-ma-fen-xi-si-activity-qi-dong.md)

[Android 8.0 源码分析 \(五\) Service 启动](android-8.0-yuan-ma-fen-xi-si-activity-qi-dong.md)

[Android 8.0 源码分析 \(六\) BroadcastReceiver 启动](android-8.0-yuan-ma-fen-xi-si-activity-qi-dong.md)

[Android 8.0 源码分析 \(七\) ContentProvider 启动](android-8.0-yuan-ma-fen-xi-si-activity-qi-dong.md)

## 介绍

前面 3 篇文章分别分析了系统进程、系统桌面 Launcher、应用程序进程的启动过程，那么接下来点击系统桌面图标就该进入到应用程序进程的根 Activity 了，这篇文章就给大家带来 Android 中四大组件之一的 **Activity 启动分析**，还没有看过我之前的源码分析可以先去了解下，因为前面讲解的内容相当于基础或者相当于四大组件启动的铺垫。

## 应用程序根 Activity 启动过程

Activity 启动过程分为 2 种，一种是应用程序根 Activity 的启动也就是在 XML 布局中有该配置的属性,

```java
<action android:name="android.intent.action.MAIN"/>
```

第二种就是我们程序中调用 **startActivity** 启动。不过这 2 种在最后源码中的调用几乎一样，可以这样说只要理解了第一种，那么第二种理解起来就轻松多了。下面我们先来分析第一种。

### Launcher 请求 AMS 过程

在 [Android 8.0 源码分析 \(二\) Launcher 启动](https://juejin.im/post/5db5565cf265da4d0f14053c) 这一节中，我们知道 Launcher 启动后会将已经安装应用安装应用程序的快捷图标显示到桌面上，这些应用图标就是启动应用程序根 Activity 入口，当我们点击某个应用的快捷图标的时候，就会通过 Launcher 请求 AMS 来启动该应用程序。 Launcher 请求 AMS 的时序图如下：

![KfEHMV.png](https://s2.ax1x.com/2019/10/29/KfEHMV.png)

当我们点击应用图标的时候，就会调用 Launcher 的 startActivitySafely 函数，如下所示:

```java
//Launcher.java
    public boolean startActivitySafely(View v, Intent intent, ItemInfo item) {
        if (mIsSafeModeEnabled && !Utilities.isSystemApp(this, intent)) {
            Toast.makeText(this, R.string.safemode_shortcut_error, Toast.LENGTH_SHORT).show();
            return false;
        }
        /**
         * 1. 为启动应用的 Activity 添加一个新的任务栈
         */
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        if (v != null) {
            intent.setSourceBounds(getViewBounds(v));
        }
        try {
            if (Utilities.ATLEAST_MARSHMALLOW
                    && (item instanceof ShortcutInfo)
                    && (item.itemType == Favorites.ITEM_TYPE_SHORTCUT
                     || item.itemType == Favorites.ITEM_TYPE_DEEP_SHORTCUT)
                    && !((ShortcutInfo) item).isPromise()) {
                // Shortcuts need some special checks due to legacy reasons.
                startShortcutIntentSafely(intent, optsBundle, item);
            } else if (user == null || user.equals(Process.myUserHandle())) {
                // Could be launching some bookkeeping activity
                /**
                 * 2. 执行 Activity 的 startActivity 函数
                 */
                startActivity(intent, optsBundle);
            } else {
                LauncherAppsCompat.getInstance(this).startActivityForProfile(
                        intent.getComponent(), user, intent.getSourceBounds(), optsBundle);
            }
            return true;
        } catch (ActivityNotFoundException|SecurityException e) {
            Toast.makeText(this, R.string.activity_not_found, Toast.LENGTH_SHORT).show();
            Log.e(TAG, "Unable to launch. tag=" + item + " intent=" + intent, e);
        }
        return false;
    }
```

注释 1 处为将要启动的 Activity 添加 Flag 为 **Intent.FLAG\_ACTIVITY\_NEW\_TASK** 模式，代表启动的 Activity 将在新的任务栈中启动，注释 2 处调用 Activity 内部的函数 startActivity，详细代码如下:

```java
//Activity.java
    @Override
    public void startActivity(Intent intent, @Nullable Bundle options) {
        /**
         * 判断是否有传参行为
         */
        if (options != null) {
            /**
             * 1. 调用 Activity startActivityForResult 函数，将参数传递下去
             */
            startActivityForResult(intent, -1, options);
        } else {
            // Note we want to go through this call for compatibility with
            // applications that may have overridden the method.
            startActivityForResult(intent, -1);
        }
    }
```

在 Activity startActivity 函数中最终会调用 startActivityForResult 函数，第二个参数 -1 代表 Activity 不需要知道结果，第三个参数就是启动设置进去的参数 Bundle，接着我们看注释 1 处调用的源码

```java
//Activity.java
    public void startActivityForResult(@RequiresPermission Intent intent, int requestCode,
            @Nullable Bundle options) {
        /**
         * 1. mParent 代表 Activity 的父类
         */
        if (mParent == null) {
            options = transferSpringboardActivityOptions(options);

            /**
             * Instrumentation：主要用来监控应用程序和系统的交互
             *
             * 2. 调用 Instrumentation 的 execStartActivity 函数。
             *
             */
            Instrumentation.ActivityResult ar =
                mInstrumentation.execStartActivity(
                    this, mMainThread.getApplicationThread(), mToken, this,
                    intent, requestCode, options);
            if (ar != null) {
                /**
                 * 3. 内部给 Activity onActivityResult 回调
                 */
                mMainThread.sendActivityResult(
                    mToken, mEmbeddedID, requestCode, ar.getResultCode(),
                    ar.getResultData());
            }
          ...
        } else {
            ...
        }
    }
```

注释 1 处的 mParent 代表的是 Activity 的类型，表示当前 Activity 的父类。因为目前根 Activity 还没有创建出来，因此判断成立执行注释 2 Instrumentation 的 execStartActivity 函数，注释 3 就是如果是以 **startActivityForResult** 函数启动的 Activity 那么就会回调给 Activity结果。我们看注释 2 的源码实现，如下:

```java
//Instrumentation.java
    public ActivityResult execStartActivity(
            Context who, IBinder contextThread, IBinder token, Activity target,
            Intent intent, int requestCode, Bundle options) {
          //1. 拿到 IAPPlicationThead 这个类可以说是是启动 Activity 的关键
        IApplicationThread whoThread = (IApplicationThread) contextThread;
        ....
        try {
            intent.migrateExtraStreamToClipData();
            intent.prepareToLeaveProcess(who);
            /**
             * 2. 拿到 AMS 代理对象 IActivityManager 调用 startActivity 函数
             */
            int result = ActivityManager.getService()
                .startActivity(whoThread, who.getBasePackageName(), intent,
                        intent.resolveTypeIfNeeded(who.getContentResolver()),
                        token, target != null ? target.mEmbeddedID : null,
                        requestCode, 0, null, options);
            checkStartActivityResult(result, intent);
        } catch (RemoteException e) {
            throw new RuntimeException("Failure from system", e);
        }
        return null;
    }
```

首先拿到 IApplicationThead . aidl 进程间通信方式，然后拿到 AMS 代理对象 IActivityManager .aidl ，调用 aidl 中的 startActivity 函数最后在 AMS 中执行。我们来看下 **ActivityManager.getService\(\)** 实现，代码如下:

```java
//ActivityManager.java
    public static IActivityManager getService() {
        return IActivityManagerSingleton.get();
    }
    private static final Singleton<IActivityManager> IActivityManagerSingleton =
            new Singleton<IActivityManager>() {
                @Override
                protected IActivityManager create() {
                      //1. 拿到 AMS 的引用
                    final IBinder b = ServiceManager.getService(Context.ACTIVITY_SERVICE);
                      //2. 
                    final IActivityManager am = IActivityManager.Stub.asInterface(b);
                    return am;
                }
            };
```

getService 函数调用 IActivityManagerSingleton 的 get 函数 ，IActivityManagerSingleton 是一个 Singleton 类。最后会直接回调到 AMS 中的 startActivity 函数。

### AMS 到 ApplicationThread 的调用过程

Launcher 请求 AMS 后，代码逻辑就已经执行到了 AMS 也就是系统 SystemServer 进程中了，接着 AMS 到 ApplicationThread 的调用流程，时序图如下:

![KfMa4S.png](https://s2.ax1x.com/2019/10/29/KfMa4S.png)

上一小节我们知道，在 Instrumentation 类中最后会通过获取 AMS 代理类 IActivityManager ，然后调用 startActivity 利用 aidl 进程间通信，最后会执行 AMS 中的 startActivity 函数，代码如下:

```java
//AMS.java

    /**
     * Instrumentation startActivity 传递过来的
     * @param caller
     * @param callingPackage
     * @param intent
     * @param resolvedType
     * @param resultTo
     * @param resultWho
     * @param requestCode
     * @param startFlags
     * @param profilerInfo
     * @param bOptions
     * @return
     */
    @Override
    public final int startActivity(IApplicationThread caller, String callingPackage,
            Intent intent, String resolvedType, IBinder resultTo, String resultWho, int requestCode,
            int startFlags, ProfilerInfo profilerInfo, Bundle bOptions) {
        /**
         * 调用内部 startActivityAsUser 函数
         */
        return startActivityAsUser(caller, callingPackage, intent, resolvedType, resultTo,
                resultWho, requestCode, startFlags, profilerInfo, bOptions,
                UserHandle.getCallingUserId());
    }


    @Override
    public final int startActivityAsUser(IApplicationThread caller, String callingPackage,
            Intent intent, String resolvedType, IBinder resultTo, String resultWho, int requestCode,
            int startFlags, ProfilerInfo profilerInfo, Bundle bOptions, int userId) {
        /**
         * 1. 判断调用者进程是否被隔离
         */
        enforceNotIsolatedCaller("startActivity");
        /**
         * 2. 检查调用者权限
         */
        userId = mUserController.handleIncomingUser(Binder.getCallingPid(), Binder.getCallingUid(),
                userId, false, ALLOW_FULL_ONLY, "startActivity", null);
        // TODO: Switch to user app stacks here.
        /**
         * 3. 调用 ActivityStarter 的 startActivityMayWait 函数，启动的理由
         */
        return mActivityStarter.startActivityMayWait(caller, -1, callingPackage, intent,
                resolvedType, null, null, resultTo, resultWho, requestCode, startFlags,
                profilerInfo, null, null, bOptions, false, userId, null, null,
                "startActivityAsUser");
    }
```

在 AMS 的 startActivity 函数中调用内部的 startActivityAsUser 函数，在该函数中我们主要做了 3 个步骤

1. 判断调用者进程是否被隔离
2. 检查调用者权限
3. 调用  ActivityStarter 的 startActivityMayWait 函数，启动 Activity 的理由

startActivityMayWait 函数中需要注意倒数第二个参数 TaskRecord,代表启动的 Activity 任务栈，最后一个是启动的理由

注释 3 代码如下:

```java
//ActivityStarter.java
    void startConfirmCredentialIntent(Intent intent, Bundle optionsBundle) {
        intent.addFlags(FLAG_ACTIVITY_NEW_TASK |
                FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS |
                FLAG_ACTIVITY_TASK_ON_HOME);
        ActivityOptions options = (optionsBundle != null ? new ActivityOptions(optionsBundle)
                        : ActivityOptions.makeBasic());
        options.setLaunchTaskId(mSupervisor.getHomeActivity().getTask().taskId);
        mService.mContext.startActivityAsUser(intent, options.toBundle(), UserHandle.CURRENT);
    }

...
            /**
             * ActivityStarter 是加载 Activity 控制类，会搜集所有的逻辑来决定如果将 Intent 和 Flags 转换为 Activity ，并将Activity 和 Task 以及 Stack 相关联。
             */
            int res = startActivityLocked(caller, intent, ephemeralIntent, resolvedType,
                    aInfo, rInfo, voiceSession, voiceInteractor,
                    resultTo, resultWho, requestCode, callingPid,
                    callingUid, callingPackage, realCallingPid, realCallingUid, startFlags,
                    options, ignoreTargetSecurity, componentSpecified, outRecord, container,
                    inTask, reason);


...
}
```

ActivityStarter 是 7.0 中新加入的类，它是加载 Activity 的控制类，会收集所有的逻辑来决定如果将 Intent 和 Flag 转为 Activity ，并将 Activity 和 Task 以及 Stack 相关联。

继续看内部 startActivityLocked 调用，代码如下:

```java
//ActivityStarter.java
    int startActivityLocked(IApplicationThread caller, Intent intent, Intent ephemeralIntent,
            String resolvedType, ActivityInfo aInfo, ResolveInfo rInfo,
            IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
            IBinder resultTo, String resultWho, int requestCode, int callingPid, int callingUid,
            String callingPackage, int realCallingPid, int realCallingUid, int startFlags,
            ActivityOptions options, boolean ignoreTargetSecurity, boolean componentSpecified,
            ActivityRecord[] outActivity, ActivityStackSupervisor.ActivityContainer container,
            TaskRecord inTask, String reason) {

        /**
         * 1. 判断启动的理由不为空
         */
        if (TextUtils.isEmpty(reason)) {
            throw new IllegalArgumentException("Need to specify a reason.");
        }
        mLastStartReason = reason;
        mLastStartActivityTimeMs = System.currentTimeMillis();
        mLastStartActivityRecord[0] = null;

        /**
         * 2. 继续调用当前类里面的 startActivity 函数
         */
        mLastStartActivityResult = startActivity(caller, intent, ephemeralIntent, resolvedType,
                aInfo, rInfo, voiceSession, voiceInteractor, resultTo, resultWho, requestCode,
                callingPid, callingUid, callingPackage, realCallingPid, realCallingUid, startFlags,
                options, ignoreTargetSecurity, componentSpecified, mLastStartActivityRecord,
                container, inTask);

        if (outActivity != null) {
            // mLastStartActivityRecord[0] is set in the call to startActivity above.
            outActivity[0] = mLastStartActivityRecord[0];
        }
        return mLastStartActivityResult;
    }
```

判断启动的理由，然后继续调用 startActivity 函数，代码如下:

```java
//ActivityStarter.java

    private int startActivity(IApplicationThread caller, Intent intent, Intent ephemeralIntent,
            String resolvedType, ActivityInfo aInfo, ResolveInfo rInfo,
            IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
            IBinder resultTo, String resultWho, int requestCode, int callingPid, int callingUid,
            String callingPackage, int realCallingPid, int realCallingUid, int startFlags,
            ActivityOptions options, boolean ignoreTargetSecurity, boolean componentSpecified,
            ActivityRecord[] outActivity, ActivityStackSupervisor.ActivityContainer container,
            TaskRecord inTask) {
 ...
        /**
         * 1. 判断 IApplicationThread 是否为空
         */
        if (caller != null) {
            /**
             * 1.1 得到 Launcher 所在进程
             */
            callerApp = mService.getRecordForAppLocked(caller);
            /**
             * 1.2 获得 Launcher 进程的 pid , uid
             */
            if (callerApp != null) {
                callingPid = callerApp.pid;
                callingUid = callerApp.info.uid;
            } else {
                Slog.w(TAG, "Unable to find app for caller " + caller
                        + " (pid=" + callingPid + ") when starting: "
                        + intent.toString());
                err = ActivityManager.START_PERMISSION_DENIED;
            }
        }
            ...

        /**
         * 2. 创建即将要启动 Activity 的描述类
         */
        ActivityRecord r = new ActivityRecord(mService, callerApp, callingPid, callingUid,
                callingPackage, intent, resolvedType, aInfo, mService.getGlobalConfiguration(),
                resultRecord, resultWho, requestCode, componentSpecified, voiceSession != null,
                mSupervisor, container, options, sourceRecord);
        if (outActivity != null) {
            /**
             * 3. 将创建的 ActivityRecord 赋值给 ActivityRecord 数组的第一个位置，最后会把 outActivity 传递给 startActivity
             */
            outActivity[0] = r;
        }

        if (r.appTimeTracker == null && sourceRecord != null) {
            // If the caller didn't specify an explicit time tracker, we want to continue
            // tracking under any it has.
            r.appTimeTracker = sourceRecord.appTimeTracker;
        }

       ...

        doPendingActivityLaunchesLocked(false);


        /**
         * 4. 继续调用内部的 startActivity  函数
         */
        return startActivity(r, sourceRecord, voiceSession, voiceInteractor, startFlags, true,
                options, inTask, outActivity);
    }
```

该类函数逻辑比较多，大概以上面注释总结了几点小点

1. 判断上层传递过来的 IApplicationThread 是否为空，因为这里我们是一路传递下来的，所以不为空。
2. 注释 1.1 处调用 AMS 的 getRecordForAppLocked 函数得到的代表 Launcher 进程的 callerApp 对象，它是 ProcessRecord 类型的， ProcessRecord 用于描述一个应用程序进程。
3. 创建 ActivityRecord 类，用于描述一个 Activity 所有的信息。
4. 将创建出来 ActivityRecord 赋值给 ActivityRecord 数组的第一个位置
5. 继续调用内部重载函数 startActivity 把 启动 Activity 的描述信息也一并传递过去。

接下来我们看注释 4 的代码实现:

```java
//ActivityStarter.java
    private int startActivity(final ActivityRecord r, ActivityRecord sourceRecord,
            IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
            int startFlags, boolean doResume, ActivityOptions options, TaskRecord inTask,
            ActivityRecord[] outActivity) {
        int result = START_CANCELED;
        try {
            /**
             * 拿到 WMS
             */
            mService.mWindowManager.deferSurfaceLayout();
            /**
             * 继续调用内部函数 startActivityUnchecked
             */
            result = startActivityUnchecked(r, sourceRecord, voiceSession, voiceInteractor,
                    startFlags, doResume, options, inTask, outActivity);
        } finally {
            ....

        return result;
    }
```

接着调用 ActivityStarter 内部函数 startActivityUnchecked

```java
//ActivityStarter.java
    /**
     * 主要处理 栈管理相关的逻辑
     * @param r
     * @param sourceRecord
     * @param voiceSession
     * @param voiceInteractor
     * @param startFlags
     * @param doResume
     * @param options
     * @param inTask
     * @param outActivity
     * @return
     */
    private int startActivityUnchecked(final ActivityRecord r, ActivityRecord sourceRecord,
            IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
            int startFlags, boolean doResume, ActivityOptions options, TaskRecord inTask,
            ActivityRecord[] outActivity) {

        ...

        /**
         * 1. 判断条件是否满足，是否是 新创建的任务栈模式
         */
        if (mStartActivity.resultTo == null && mInTask == null && !mAddingToTask
                && (mLaunchFlags & FLAG_ACTIVITY_NEW_TASK) != 0) {
            newTask = true;
            /**
             * 2. 创建新的 TaskRecord ,用来描述 Activity 任务栈
             */
            result = setTaskFromReuseOrCreateNewTask(
                    taskToAffiliate, preferredLaunchStackId, topStack);
        } else if (mSourceRecord != null) {
            result = setTaskFromSourceRecord();
        } else if (mInTask != null) {
            result = setTaskFromInTask();
        } else {
            setTaskToCurrentTopOrCreateNewTask();
        }
        ...
        if (mDoResume) {
            final ActivityRecord topTaskActivity =
                    mStartActivity.getTask().topRunningActivityLocked();
            if (!mTargetStack.isFocusable()
                    || (topTaskActivity != null && topTaskActivity.mTaskOverlay
                    && mStartActivity != topTaskActivity)) {
                ...
                mWindowManager.executeAppTransition();
            } else {
               ...
                if (mTargetStack.isFocusable() && !mSupervisor.isFocusedStack(mTargetStack)) {
                    mTargetStack.moveToFront("startActivityUnchecked");
                }
                /**
                 * 3. 调用 ActivityStackSupervisor 的 resumeFocusedStackTopActivityLocked 函数
                 */
                mSupervisor.resumeFocusedStackTopActivityLocked(mTargetStack, mStartActivity,
                        mOptions);
            }
        } else {
            mTargetStack.addRecentActivityLocked(mStartActivity);
        }
       ...
        return START_SUCCESS;
    }
```

startActivityUnchecked 函数主要处理与栈管理相关的逻辑。在注释 1 处我们得知启动 Activity 时会将 Intent 的

Flag 设置为 FLAG\_ACTIVITY\_NEW\_TASK 模式，这样注释 1 条件满足，接着执行注释 2 处的 setTaskFromReuseOrCreateNewTask 函数，其内部会创建一个新的 TaskRecord ，用来描述一个 Activity 的任务栈。在注释 3 处会调用 ActivityStackSupervisor 的 resumeFocusedStackTopActivityLocked 函数，代码如下所示:

```java
//ActivityStackSupervisor.java
    boolean resumeFocusedStackTopActivityLocked(
            ActivityStack targetStack, ActivityRecord target, ActivityOptions targetOptions) {
        //需要启动的目标栈不为空，并且启动的栈跟需要启动栈一样就执行
        if (targetStack != null && isFocusedStack(targetStack)) {
            /**
             * ActivityStack 描述堆栈的
             */
            return targetStack.resumeTopActivityUncheckedLocked(target, targetOptions);
        }
        /**
         * 1. 获取需要启动的 Activity 所在栈的栈顶 不是处于停止状态的 ActivityRecord
         */
        final ActivityRecord r = mFocusedStack.topRunningActivityLocked();
        /**
         * 2. 如果 ActivityRecord 不为 null,或者要启动的 Activity 的状态不是Resumed 状态
         */
        if (r == null || r.state != RESUMED) {
            /**
             * 3.代表是即将启动的 Activity
             */
            mFocusedStack.resumeTopActivityUncheckedLocked(null, null);
        } else if (r.state == RESUMED) {
            // Kick off any lingering app transitions form the MoveTaskToFront operation.
            mFocusedStack.executeAppTransition(targetOptions);
        }
        return false;
    }
```

这里主要是获取正在运行的任务栈，如果获取到的栈不为空并且不是 Resumed 状态 ,那么就代表即将要启动一个新的 Activity，注释 3 的代码如下：

```java
//ActivityStack.java
    boolean resumeTopActivityUncheckedLocked(ActivityRecord prev, ActivityOptions options) {
       ...
        boolean result = false;
        try {
            // Protect against recursion.
            mStackSupervisor.inResumeTopActivity = true;
            /**
             * 1.调用内部  resumeTopActivityInnerLocked 函数
             */
            result = resumeTopActivityInnerLocked(prev, options);
        } finally {
            mStackSupervisor.inResumeTopActivity = false;
        }
        mStackSupervisor.checkReadyForSleepLocked();

        return result;
    }
```

把 mStackSupervisor.inResumeTopActivity 设置为 true ,然后继续调用内部 resumeTopActivityInnerLocked 函数，代码如下:

```java
//ActivityStack.java
    private boolean resumeTopActivityInnerLocked(ActivityRecord prev, ActivityOptions options) {
       ...

            /**
             * 1. 调用 startSpecificActivityLocked 函数
             */
            mStackSupervisor.startSpecificActivityLocked(next, true, true);
        }

        if (DEBUG_STACK) mStackSupervisor.validateTopActivitiesLocked();
        return true;
    }
```

该函数逻辑处理比较多，我们只关注注释 1 的调用

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
               ...
            }

        }
                //4. 
        mService.startProcessLocked(r.processName, r.info.applicationInfo, true, 0,
                "activity", r.intent.getComponent(), false, false, true);
    }
```

这里主要判断当前启动 Activity 所在的进程是否已经运行，如果运行调用注释 3 ，如果处于没有运行的状态调用注释 4,最后会通知 AMS 与 Zygote 通信请求创建一个新的进程，这里我们直接看注释 3

```java
//ActivityStackSupervisor.java
    final boolean realStartActivityLocked(ActivityRecord r, ProcessRecord app,
            boolean andResume, boolean checkConfig) throws RemoteException {

      ...

        /*** 
                    这里的 app.thread 代表的是 IApplicationThread ,调用它内部 scheduleLaunchActivity 函                                数,
             * 它的实现在 ActivityThread 的内部类 ApplicationThread ,其中 ApplicationThread 继承了 IApplicationThread.Stub.,
             * app 指的是Activity 所在的应用程序进程。
             */

            app.thread.scheduleLaunchActivity(new Intent(r.intent), r.appToken,
                    System.identityHashCode(r), r.info,
                    // TODO: Have this take the merged configuration instead of separate global and
                    // override configs.
                    mergedConfiguration.getGlobalConfiguration(),
                    mergedConfiguration.getOverrideConfiguration(), r.compat,
                    r.launchedFromPackage, task.voiceInteractor, app.repProcState, r.icicle,
                    r.persistentState, results, newIntents, !andResume,
                    mService.isNextTransitionForward(), profilerInfo);

            ...

        } catch (RemoteException e) {
            ...

        return true;
    }
```

这里只拿出了核心代码，注意看上面代码，这里说明一下，app.thread 指的就是 IApplicationThread, 它的实现类在 ActivityThread 的内部类，其中 ApplicationThread 继承了 IApplicationThread.Stub。app 指的是传入的要启动的 Activity 所在应用程序进程，因此，这段代码指的就是要在目标应用进程进行启动 Activity 。当前代码逻辑运行在 AMS 所在的 SystemServer 进程中，通过 ApplicationThread 来与应用程序进程进行 Binder 通信，换句话说，ApplicationThread 是 SystemServer 和应用程序进程通信的中间人。

![KfddeS.png](https://s2.ax1x.com/2019/10/29/KfddeS.png)

到这里下面就该看 ActivityThread 类里面执行 Activity 任务了，由下一小节详细讲解。

### ActivityThread 启动 Activity 过程

通过上一小节讲解的内容，我们知道目前已经运行在了应用程序进程中，先来看一下 ActivityThread 启动 Activity 的时序图

![Kfwth9.png](https://s2.ax1x.com/2019/10/29/Kfwth9.png)

接着我们来看 ActivityThread 内部类 ApplicationThread 的 **scheduleLaunchActivity** 函数，ActivityThread 在应用程序进程创建成功后会运行在当前进程的主线程中。scheduleLaunchActivity 代码如下:

```java
//ActivityThread.java
public final class ActivityThread {
 ...

 private class ApplicationThread extends IApplicationThread.Stub {  

 ...

 private class ApplicationThread extends IApplicationThread.Stub {

 ....

         /**
         * Launcher 点击应用图标启动对应的应用 .... -> ActivityStackSupervisor . realStartActivityLocked 函数调用
         * @param intent
         * @param token
         * @param ident
         * @param info
         * @param curConfig
         * @param overrideConfig
         * @param compatInfo
         * @param referrer
         * @param voiceInteractor
         * @param procState
         * @param state
         * @param persistentState
         * @param pendingResults
         * @param pendingNewIntents
         * @param notResumed
         * @param isForward
         * @param profilerInfo
         */
        @Override
        public final void scheduleLaunchActivity(Intent intent, IBinder token, int ident,
                ActivityInfo info, Configuration curConfig, Configuration overrideConfig,
                CompatibilityInfo compatInfo, String referrer, IVoiceInteractor voiceInteractor,
                int procState, Bundle state, PersistableBundle persistentState,
                List<ResultInfo> pendingResults, List<ReferrerIntent> pendingNewIntents,
                boolean notResumed, boolean isForward, ProfilerInfo profilerInfo) {

            updateProcessState(procState, false);

            ActivityClientRecord r = new ActivityClientRecord();

            r.token = token;
            r.ident = ident;
            r.intent = intent;
            r.referrer = referrer;
            r.voiceInteractor = voiceInteractor;
            r.activityInfo = info;
            r.compatInfo = compatInfo;
            r.state = state;
            r.persistentState = persistentState;

            r.pendingResults = pendingResults;
            r.pendingIntents = pendingNewIntents;

            r.startsNotResumed = notResumed;
            r.isForward = isForward;

            r.profilerInfo = profilerInfo;

            r.overrideConfig = overrideConfig;
            updatePendingConfiguration(curConfig);
            /**
             * 1. 调用内部 sendMessage 函数，将启动 Activity 的信息封装成 ActivityClientRecord 对象，然后跟 H.LAUNCH_ACTIVITY 一起传递下去
             */
            sendMessage(H.LAUNCH_ACTIVITY, r);
        }

 ...
 }

 ...
}
```

上面代码中的 ActivityClientRecord 类会把启动 Activity 所有传递过来的参数全部封装进去，然后调用内部 sendMessage 函数\(**ps:这里记住 H.LAUNCH\_ACTIVITY** \)，代码如下:

```java
  //ActivityThread.java  
    private void sendMessage(int what, Object obj) {
        /**
         * 继续调用内部重载函数 what = H.LAUNCH_ACTIVITY
         */

        sendMessage(what, obj, 0, 0, false);
    }
```

继续调用重载函数

```java
//ActivityThread.java

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

mH 是 AcitivtyThread 非静态内部类，它继承自 Handler，下面我们看下 H 是实现

```java
//ActivityThread.java
public final class ActivityThread {

//应用程序进程 主线程 H 
final H mH = new H(); 

  ......

 private class H extends Handler {

  //启动 Activity 标志
  public static final int LAUNCH_ACTIVITY         = 100;

    public void handleMessage(Message msg) {
            if (DEBUG_MESSAGES) Slog.v(TAG, ">>> handling: " + codeToString(msg.what));
            switch (msg.what) {
                /**
                 * 1. 收到发送过来  LAUNCH_ACTIVITY 标志的消息
                 */
                case LAUNCH_ACTIVITY: {
                    Trace.traceBegin(Trace.TRACE_TAG_ACTIVITY_MANAGER, "activityStart");
                    /**
                     * 1.1 拿到封装启动 Activity 信息的 ActivityClientRecord 类
                     */
                    final ActivityClientRecord r = (ActivityClientRecord) msg.obj;

                    /**
                     * 1.2 通过 getPackageInfoNoCheck 函数获得 LoadedApk 类型的对象并赋值给 ActivityClientRecord 的成员变量 packageInfo。
                     *     应用程序进程要启动 Activity 时,需要将该 Activity 所属的 APK 加载进来，而 LoadedApk 就是用来描述已加载的 APk 文件的。
                     */
                    r.packageInfo = getPackageInfoNoCheck(
                            r.activityInfo.applicationInfo, r.compatInfo);
                    /**
                     * 1.3 调用内部 handleLaunchActivity
                     */
                    handleLaunchActivity(r, null, "LAUNCH_ACTIVITY");
                    Trace.traceEnd(Trace.TRACE_TAG_ACTIVITY_MANAGER);
                } break;


               ....
  ......
}
```

在上一小节我们知道由 mH.sendMessage 将标志 **LAUNCH\_ACTIVITY** 的消息发送到了 H 类，请看上面注释 1 代表接收发送过来 LAUNCH\_ACTIVITY 的消息入口，注释 1.1 代表拿到封装启动 Activity 信息，注释 1.2 拿到 加载 APK 的描述类 LoadedApk,最后调用注释 3 ，代码如下:

```java
//ActivityThread.java
    /**
     *
     *启动 Activity
     * @param r
     * @param customIntent
     * @param reason
     */
    private void handleLaunchActivity(ActivityClientRecord r, Intent customIntent, String reason) {
       ...

        /**
         * 1. 实施启动 Activity 的实例
         */
        Activity a = performLaunchActivity(r, customIntent);

        if (a != null) {
            r.createdConfig = new Configuration(mConfiguration);
            reportSizeConfigurations(r);
            Bundle oldState = r.state;
            /**
             * 2. 将 Activity 的状态设置为 Resume
             */
            handleResumeActivity(r.token, false, r.isForward,
                    !r.activity.mFinished && !r.startsNotResumed, r.lastProcessedSeq, reason);

            if (!r.activity.mFinished && r.startsNotResumed) {
               ...
                if (r.isPreHoneycomb()) {
                    r.state = oldState;
                }
            }
        } else {

            try {
                /**
                 * 如果出现异常，停止 Activity 
                 */
                ActivityManager.getService()
                    .finishActivity(r.token, Activity.RESULT_CANCELED, null,
                            Activity.DONT_FINISH_TASK_WITH_ACTIVITY);
            } catch (RemoteException ex) {
                throw ex.rethrowFromSystemServer();
            }
        }
    }
```

该函数通过 performLaunchActivity 函数启动了 Activity ，并且将 启动的 Activity 执行了 onCreate 生命周期函数，注释 2 代表将启动的 Activity 设置为可交互的生命周期状态，当然如果内部执行错误，又会以 aidl 的形式通知 AMS 关闭当前 Activity。

我们先看注释 1 代码如下:

```java
//ActivityThread.java


    private Activity performLaunchActivity(ActivityClientRecord r, Intent customIntent) {
        // System.out.println("##### [" + System.currentTimeMillis() + "] ActivityThread.performLaunchActivity(" + r + ")");

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
            if (!mInstrumentation.onException(activity, e)) {
                throw new RuntimeException(
                    "Unable to instantiate activity " + component
                    + ": " + e.toString(), e);
            }
        }

        try {
            /**
             * 6. 得到 Application 对象
             */
            Application app = r.packageInfo.makeApplication(false, mInstrumentation);

            if (localLOGV) Slog.v(TAG, "Performing launch of " + r);
            if (localLOGV) Slog.v(
                    TAG, r + ": app=" + app
                    + ", appName=" + app.getPackageName()
                    + ", pkg=" + r.packageInfo.getPackageName()
                    + ", comp=" + r.intent.getComponent().toShortString()
                    + ", dir=" + r.packageInfo.getAppDir());

            if (activity != null) {

                CharSequence title = r.activityInfo.loadLabel(appContext.getPackageManager());
                Configuration config = new Configuration(mCompatConfiguration);
                if (r.overrideConfig != null) {
                    config.updateFrom(r.overrideConfig);
                }
                if (DEBUG_CONFIGURATION) Slog.v(TAG, "Launching activity "
                        + r.activityInfo.name + " with config " + config);
                Window window = null;
                if (r.mPendingRemoveWindow != null && r.mPreserveWindow) {
                    window = r.mPendingRemoveWindow;
                    r.mPendingRemoveWindow = null;
                    r.mPendingRemoveWindowManager = null;
                }
                appContext.setOuterContext(activity);
                /**
                 * 7. 将 appContext 等对象依附在 Activity 的 attach 函数中,进行 Activity  attach 初始化
                 */
                activity.attach(appContext, this, getInstrumentation(), r.token,
                        r.ident, app, r.intent, r.activityInfo, title, r.parent,
                        r.embeddedID, r.lastNonConfigurationInstances, config,
                        r.referrer, r.voiceInteractor, window, r.configCallback);

                if (customIntent != null) {
                    activity.mIntent = customIntent;
                }
                r.lastNonConfigurationInstances = null;
                checkAndBlockForNetworkAccess();
                activity.mStartedActivity = false;
                int theme = r.activityInfo.getThemeResource();
                if (theme != 0) {
                    activity.setTheme(theme);
                }

                activity.mCalled = false;
                //是否是持久化
                if (r.isPersistable()) {
                    mInstrumentation.callActivityOnCreate(activity, r.state, r.persistentState);
                } else {
                    /**
                     *  8. 内部调用 Activity 的 onCreate 方法
                     */
                    mInstrumentation.callActivityOnCreate(activity, r.state);
                }
                if (!activity.mCalled) {
                    throw new SuperNotCalledException(
                        "Activity " + r.intent.getComponent().toShortString() +
                        " did not call through to super.onCreate()");
                }
                r.activity = activity;
                r.stopped = true;
                if (!r.activity.mFinished) {
                    activity.performStart();
                    r.stopped = false;
                }
                if (!r.activity.mFinished) {
                    if (r.isPersistable()) {
                        if (r.state != null || r.persistentState != null) {
                            mInstrumentation.callActivityOnRestoreInstanceState(activity, r.state,
                                    r.persistentState);
                        }
                    } else if (r.state != null) {
                        mInstrumentation.callActivityOnRestoreInstanceState(activity, r.state);
                    }
                }
                if (!r.activity.mFinished) {
                    activity.mCalled = false;
                    if (r.isPersistable()) {
                        mInstrumentation.callActivityOnPostCreate(activity, r.state,
                                r.persistentState);
                    } else {
                        mInstrumentation.callActivityOnPostCreate(activity, r.state);
                    }
                    if (!activity.mCalled) {
                        throw new SuperNotCalledException(
                            "Activity " + r.intent.getComponent().toShortString() +
                            " did not call through to super.onPostCreate()");
                    }
                }
            }
            r.paused = true;

            mActivities.put(r.token, r);

        } catch (SuperNotCalledException e) {
            throw e;

        } catch (Exception e) {
            if (!mInstrumentation.onException(activity, e)) {
                throw new RuntimeException(
                    "Unable to start activity " + component
                    + ": " + e.toString(), e);
            }
        }

        return activity;
    }
```

根据我的上面注释可以看出来 ，该函数里面几乎每一行代码都是核心代码，那么内部主要干了些什么了，这里就简单说一下，因为上面注释真的已经很清楚了，**拿到启动 Activity 组件 Component 的信息,通过 Instrumentation 类的 newActivity 函数，内部是通过 ClassLoader 的 loadClass 实例化了 Activity, 拿到 Application 进行与 Activity 绑定，最后调用 Instrumentation 函数的 callActivityOnCreate 执行了 Activity onCreate 生命周期** 这里我就拿 注释 5，6，8 来看一下源码，因为比较典型，注释 5 代码如下

```java
//Instrumentation.java
    public Activity newActivity(ClassLoader cl, String className,
            Intent intent)
            throws InstantiationException, IllegalAccessException,
            ClassNotFoundException {
        //通过 ClassLoader 实例化了  Activity 
        return (Activity)cl.loadClass(className).newInstance();
    }
```

注释 6 ，代码如下

```java
//LoadApk.java

    public Application makeApplication(boolean forceDefaultAppClass,
            Instrumentation instrumentation) {
        /**
         * 如果 mApplication 已经创建了就直接返回
         */
        if (mApplication != null) {
            return mApplication;
        }

       ...

        Application app = null;

       ...

        try {
            ...
            ContextImpl appContext = ContextImpl.createAppContext(mActivityThread, this);
            /**
             * 内部通过反射实例化 Application
             */
            app = mActivityThread.mInstrumentation.newApplication(
                    cl, appClass, appContext);
            appContext.setOuterContext(app);
        } catch (Exception e) {
           ...
        }
        mActivityThread.mAllApplications.add(app);
        mApplication = app;

        ....

        return app;
    }
```

这里拿到缓存 mApplication ,因为在创建应用程序进程的时候 Application 已经被实例化了，有不明白的可以看 [Android 8.0 源码分析 \(三\) 应用程序进程创建到应用程序启动的过程](https://juejin.im/post/5db599bc6fb9a0203b234b08) 该文章。

注释 8 代码如下:

```java
//Instrumentation.java
    public void callActivityOnCreate(Activity activity, Bundle icicle) {
        ...
        activity.performCreate(icicle);
        ...
    }

    final void performCreate(Bundle icicle) {
      ....
        //调用Activity 生命周期 onCreate 函数
        onCreate(icicle);
      ...

    }
```

到这里 Launcher 点击应用图标到启动应用程序的根 Activity 已经启动了，启动根 Activity 中涉及到的进程有 4 个分别为 Zygote 进程、Launcher 桌面进程、SystemServer 进程、应用程序进程。过程比较复杂，涉及知识点比较多，如果想详细了解的，建议可以跟着我的源码分析，然后自己跟一遍，这样效果最好。

## 应用程序内部 startActivity 调用过程

根 Activity 启动成功了之后，应用程序启动 Activity 就简单多了，我这里简单说一点，因为剩下逻辑都一样。

从应用程序中我们自己调用 startActivity\(Intent intent\) 会直接调用 Activity 如下代码:

```java
//Activity.java
    @Override
    public void startActivity(Intent intent) {
        this.startActivity(intent, null);
    }
```

执行内部重载 startActivity\(intent, null\); 函数

```java
    @Override
    public void startActivity(Intent intent, @Nullable Bundle options) {
        /**
         * 判断是否有传参行为
         */
        if (options != null) {
            /**
             * 1. 调用 Activity startActivityForResult 函数，将参数传递下去
             */
            startActivityForResult(intent, -1, options);
        } else {
            // Note we want to go through this call for compatibility with
            // applications that may have overridden the method.
            startActivityForResult(intent, -1);
        }
    }
```

看到这里是否已经有一点影响了，就是我们最开始讲过的，在 **应用程序根 Activity 启动过程\#Launcher请求 AMS 过程** 小节中，后面逻辑就完全一样了，所以不再将第二遍了。其中自己应用程序涉及到的进程就 2 个，一个是自己的应用程序进程，另一个就是 AMS 所在的 SystemServer 进程，ActivityThread 是跟着当前启动的组件进程走。

到这里 Activity 启动过程就将完了，不知道大家有没有看明白，不明白了可以跟着我的思路自己跟一下源码，如果还是不明白，那么我的好好反思一下，是不是我描述的有问题了。

下面我就简单以一张图来总结下 Launcher 启动应用程序根 Activity 所经过的进程。

## 总结

这里就以一张图片来简单概括一下启动根 Activity 进程间交互的时序图，相信这张图会比较容易理解一点。

![Kfg29O.png](https://s2.ax1x.com/2019/10/29/Kfg29O.png)

## 参考

* 《Android 进阶解密》

