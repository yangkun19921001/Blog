# Android 8.0 源码分析 \(二\) Launcher 启动

## 前言

我们熟知一般 Android 工程师都是在应用层上开发，不会涉及系统源码，但是如果你想往底层发展，或者深入插件化、Framework 系统层等开发工作，如果不了解 Android 源码可是不行的，那么接下来我基于自己的理解跟学习来记录跟 Android 开发息息相关的源码分析，大概从 Android 中的 SystemServer 启动、四大组件启动、AMS、PMS 等几个维度来介绍，下面是我的计划，当然在未来也有可能改变。

**还没有关注的小伙伴，可以先关注一波，系列文章会持续更新。**

[Android 8.0 源码分析 \(一\) SystemServer 进程启动](https://juejin.im/post/5db3f95ee51d4529e83947f9)

[Android 8.0 源码分析 \(二\) Launcher 启动](android-8.0-yuan-ma-fen-xi-er-launcher-qi-dong.md)

[Android 8.0 源码分析 \(三\) 应用程序进程启动](android-8.0-yuan-ma-fen-xi-er-launcher-qi-dong.md)

[Android 8.0 源码分析 \(四\) Activity 启动](android-8.0-yuan-ma-fen-xi-er-launcher-qi-dong.md)

[Android 8.0 源码分析 \(五\) Service 启动](android-8.0-yuan-ma-fen-xi-er-launcher-qi-dong.md)

[Android 8.0 源码分析 \(六\) BroadcastReceiver 启动](android-8.0-yuan-ma-fen-xi-er-launcher-qi-dong.md)

[Android 8.0 源码分析 \(七\) ContentProvider 启动](android-8.0-yuan-ma-fen-xi-er-launcher-qi-dong.md)

## 介绍

上面一章介绍了 Android 中 SystemServer 启动和一些其它服务的启动，那么系统服务启动完了之后，就该显示Android 系统桌面了，在显示之前会请求 PMS 返回系统中已经安装的应用程序信息，并将这些信息封装成一个快捷图标列表显示在系统屏幕上，这样用户就可以通过点击桌面上的图标来启动相应的应用程序了，在 Android 中用于显示桌面的 Activity 是 Launcher.java 下面我们就分析 Launcher 启动过程。

## Launcher 的启动分析

SystemServer 进程在启动过程中会启动 PMS ,PMS 启动后会将系统中的应用程序安装完成。在此前已经启动的 AMS 会将 Launcher 启动起来。可以看下执行的时序图

[![KDsaIP.png](https://s2.ax1x.com/2019/10/26/KDsaIP.png)](https://imgchr.com/i/KDsaIP)

启动 Launcher 的入口为 AMS 的 systemRead 函数，它在 SystemServer 的 startOtherServices 函数中被调用，如下代码所示：

```java
//com.android.server SystemServer.java

public void startOtherServices(){
  ...
  //1. 这里是 lambda 语法
  mActivityManagerService.systemReady(() -> {
  ...
  }     
}
```

我们看 AMS 的 systemRead 函数具体实现

```java
//com.android.server.am ActivityManagerService.java

  public void systemReady(final Runnable goingCallback, BootTimingsTraceLog traceLog) {
        ...
        synchronized(this) {
            ...
                        //1. 
            mStackSupervisor.resumeFocusedStackTopActivityLocked();
            mUserController.sendUserSwitchBroadcastsLocked(-1, currentUserId);

        }
    }
```

systemReady 函数中调用了 ActivityStackSupervisor 的 resumeFocusedStackTopActivityLocked\(\) 函数，如下代码所示

```java
    //package com.android.server.am; ActivityStackSupervisor.java

        boolean resumeFocusedStackTopActivityLocked() {
        return resumeFocusedStackTopActivityLocked(null, null, null);
    }

    boolean resumeFocusedStackTopActivityLocked(
            ActivityStack targetStack, ActivityRecord target, ActivityOptions targetOptions) {
       //需要启动的目标栈不为空，并且启动的栈跟需要启动栈一样就执行
        if (targetStack != null && isFocusedStack(targetStack)) {
            /**
             * ActivityStack 描述堆栈的
             */
            return targetStack.resumeTopActivityUncheckedLocked(target, targetOptions);
        }
        ...
        return false;
    }
```

根据上面的代码，首先判断启动的 Activity 堆栈是否为空，并且是需要的栈，那么久执行 targetStack.resumeTopActivityUncheckedLocked 函数

```java
//com.android.server.am ActivityStack.java
    boolean resumeTopActivityUncheckedLocked(ActivityRecord prev, ActivityOptions options) {
        if (mStackSupervisor.inResumeTopActivity) {
            // Don't even start recursing.
            return false;
        }

        boolean result = false;
        try {
            // Protect against recursion.
            mStackSupervisor.inResumeTopActivity = true;
            /**
             * 1.
             */
            result = resumeTopActivityInnerLocked(prev, options);
        } finally {
            mStackSupervisor.inResumeTopActivity = false;
        }

        mStackSupervisor.checkReadyForSleepLocked();

        return result;
    }
```

执行到 resumeTopActivityInnerLocked 函数，具体看代码

```java
//com.android.server.am; ActivityStack.java

    private boolean resumeTopActivityInnerLocked(ActivityRecord prev, ActivityOptions options) {
    ...

     return isOnHomeDisplay() &&
                        mStackSupervisor.resumeHomeStackTask(prev, "prevFinished");
            }
    ...

    }
```

调用 ActivityStackSupervisor 的 resumeHomeStackTask 函数，代码如下：

```java
//com.android.server.am; ActivityStackSupervisor.java

    boolean resumeHomeStackTask(ActivityRecord prev, String reason) {
        ...

        if (prev != null) {
            prev.getTask().setTaskToReturnTo(APPLICATION_ACTIVITY_TYPE);
        }
        //将 home 移动到栈顶
        mHomeStack.moveHomeStackTaskToTop();
        //获取 HomeActivity
        ActivityRecord r = getHomeActivity();
        final String myReason = reason + " resumeHomeStackTask";

        // Only resume home activity if isn't finishing.
        if (r != null && !r.finishing) {
            moveFocusableActivityStackToFrontLocked(r, myReason);
            return resumeFocusedStackTopActivityLocked(mHomeStack, prev, null);
        }
        //调用 AMS startHomeActivityLocked 函数
        return mService.startHomeActivityLocked(mCurrentUser, myReason);
    }
```

上面代码先把 home 移动到栈顶，然后通过 AMS startHomeActivityLocked 来启动 Launcher ,看下面代码

```java
//com.android.server.am; ActivityManagerService.java

    boolean startHomeActivityLocked(int userId, String reason) {
        /**
         * 1.  判断值是否符合要求--> 判断当前启动的运行模式是否是低级工厂模式并且 mTopAction 为空的时候
         *
         * @mFactoryTest： 代表启动的运行模式：非工厂模式、低级工厂模式、高级工厂模式、
         * @mTopAction： 则描述第一个被启动 Activity 组件的 Action,默认是 Intent.ACTION_MAIN.
         */

        if (mFactoryTest == FactoryTest.FACTORY_TEST_LOW_LEVEL
                && mTopAction == null) {
            return false;
        }
        /**
         * 2.  创建 Launcher 所需要的 Intent
         */
        Intent intent = getHomeIntent();
        ActivityInfo aInfo = resolveActivityInfo(intent, STOCK_PM_FLAGS, userId);
        if (aInfo != null) {
            intent.setComponent(new ComponentName(aInfo.applicationInfo.packageName, aInfo.name));

            aInfo = new ActivityInfo(aInfo);
            aInfo.applicationInfo = getAppInfoForUser(aInfo.applicationInfo, userId);
            ProcessRecord app = getProcessRecordLocked(aInfo.processName,
                    aInfo.applicationInfo.uid, true);
            /**
             * 3. 判断符合 action 为 Intent.ACTION_MAIN、Category 为 Intent.CATEGORY_HOME 的应用程序是否已经启动
             */
            if (app == null || app.instr == null) {
                intent.setFlags(intent.getFlags() | Intent.FLAG_ACTIVITY_NEW_TASK);
                final int resolvedUserId = UserHandle.getUserId(aInfo.applicationInfo.uid);
                // For ANR debugging to verify if the user activity is the one that actually
                // launched.
                final String myReason = reason + ":" + userId + ":" + resolvedUserId;
                /**
                 * 3.1. 这个被启动的应用程序就是 Launcher,
                 */
                mActivityStarter.startHomeActivityLocked(intent, aInfo, myReason);
            }
        } else {
            Slog.wtf(TAG, "No home screen found for " + intent, new Throwable());
        }

        return true;
    }
```

上面代码主要做了一下几件事：

* 1. 判断 mFactoryTest、mTopAction 是否符合要求--&gt; 判断当前启动的运行模式是否是低级工厂模式并且 mTopAction 为空的时候
* 1. 创建 Launcher 所需要的 Intent
* 1. 判断符合 action 为 Intent.ACTION\_MAIN、Category 为 Intent.CATEGORY\_HOME 的应用程序是否已经启动
* 3.1 如果没有启动调用  ActivityStarter 的 startHomeActivityLocked 函数

接着我们看下 getHomeIntent\(\) 是怎么生成的 Launcher 的 Intent

```java
//com.android.server.am; ActivityManagerService.java

    Intent getHomeIntent() {
        //传入第一个启动的 action 和 启动的 mTopData
        Intent intent = new Intent(mTopAction, mTopData != null ? Uri.parse(mTopData) : null);
          //传入组件  ComponentName(app.packageName,ai.name);
        intent.setComponent(mTopComponent);
          //内部标志
        intent.addFlags(Intent.FLAG_DEBUG_TRIAGED_MISSING);
          //设置主页面
        if (mFactoryTest != FactoryTest.FACTORY_TEST_LOW_LEVEL) {
            intent.addCategory(Intent.CATEGORY_HOME);
        }
        return intent;
    }
```

其实这里的 getHomeIntent\(\) 获取到的就是 Launcher.java 启动 Intent, 我们可以看下它的清单文件 Activity 的注册

```java
//android-8.0.0_r1/packages/apps/Launcher3/AndroidManifest.xml

<manifest
    xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.android.launcher3">
    <uses-sdk android:targetSdkVersion="23" android:minSdkVersion="21"/>
   ....
              //1. 手机启动的主页面
           <activity
            android:name="com.android.launcher3.Launcher"
            android:launchMode="singleTask"
            android:clearTaskOnLaunch="true"
            android:stateNotNeeded="true"
            android:windowSoftInputMode="adjustPan|stateUnchanged"
            android:screenOrientation="nosensor"
            android:configChanges="keyboard|keyboardHidden|navigation"
            android:resizeableActivity="true"
            android:resumeWhilePausing="true"
            android:taskAffinity=""
            android:enabled="true">

            <!--2. 设置了 android.intent.action.MAIN 属性就是主启动-->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.HOME" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.MONKEY"/>
            </intent-filter>
        </activity>   
   ...

 </manifest>
```

可以看到 Launcher 的  内部配置了 **android.intent.action.MAIN** 属性，那么这样 Launcher 的 Activity 也就成了主 Activity。回到 AMS 的 startHomeActivityLocked 函数中，看注释 3.1 如果没有启动过 Launcher 那么就执行 ActivityStarter 的 startHomeActivityLocked 函数来启动 Launcher，看下面代码：

```java
//com.android.server.am; ActivityStarter.java
    void startHomeActivityLocked(Intent intent, ActivityInfo aInfo, String reason) {
        /**
         * 1. 将 home 放入 HomeStack 中
         */
        mSupervisor.moveHomeStackTaskToTop(reason);
        /**
         * 2. 会执行到 Launcher 的 onCreate 函数中
         */
        mLastHomeActivityStartResult = startActivityLocked(null /*caller*/, intent,
                null /*ephemeralIntent*/, null /*resolvedType*/, aInfo, null /*rInfo*/,
                null /*voiceSession*/, null /*voiceInteractor*/, null /*resultTo*/,
                null /*resultWho*/, 0 /*requestCode*/, 0 /*callingPid*/, 0 /*callingUid*/,
                null /*callingPackage*/, 0 /*realCallingPid*/, 0 /*realCallingUid*/,
                0 /*startFlags*/, null /*options*/, false /*ignoreTargetSecurity*/,
                false /*componentSpecified*/, mLastHomeActivityStartRecord /*outActivity*/,
                null /*container*/, null /*inTask*/, "startHomeActivity: " + reason);
        if (mSupervisor.inResumeTopActivity) {
            mSupervisor.scheduleResumeTopActivities();
        }
    }
```

在注释 1 中将 Launcher 放入 HomeStack 中，HomeStack 是在 ActivityStackSupervisor 中定义的用于存储 Launcher 的变量。接着调用 startActivityLocked 来启动 Launcher Activity,Activity 启动我们后面单独会写一篇介绍，这里不做过多说明。最终进入到 Launcher 的 onCreate 生命周期函数中

```java
// package com.android.launcher3; Launcher.java

public class Launcher extends BaseActivity implements LauncherExterns, View.OnClickListener, OnLongClickListener,LauncherModel.Callbacks, View.OnTouchListener, LauncherProviderChangeListener, AccessibilityManager.AccessibilityStateChangeListener {



    @Override
    protected void onCreate(Bundle savedInstanceState) {

      ...
      //1. 加载布局 R.layout.launcher 路径在 android-8.0.0_r1/packages/apps/Launcher3/res/layout-port/launcher.xml
      mLauncherView = getLayoutInflater().inflate(R.layout.launcher, null);
      ...
      //2. 设置布局底层解析 xml2View 并添加到 ViewGroup 中
      setContentView(mLauncherView); 
      ...
    }

}
```

接下来我们就分析 Launcher 中应用图标的显示。

## Launcher 应用图标显示

上一小节我们讲到了 Launcher 启动，那么这一小节就讲 Launcher 显示过程，我们直接看它的 onCreate 生命周期函数具体实现

```java
//com.android.launcher3; Launcher.java

public class Launcher extends BaseActivity
        implements LauncherExterns, View.OnClickListener, OnLongClickListener,
                   LauncherModel.Callbacks, View.OnTouchListener, LauncherProviderChangeListener,
                   AccessibilityManager.AccessibilityStateChangeListener {



    @Override
    protected void onCreate(Bundle savedInstanceState) {
                ...

        super.onCreate(savedInstanceState);

        /**
         * 1. 获取 LauncherAppState 实例
         */
        LauncherAppState app = LauncherAppState.getInstance(this);


        mDeviceProfile = app.getInvariantDeviceProfile().getDeviceProfile(this);
        if (isInMultiWindowModeCompat()) {
            Display display = getWindowManager().getDefaultDisplay();
            Point mwSize = new Point();
            display.getSize(mwSize);
            mDeviceProfile = mDeviceProfile.getMultiWindowProfile(this, mwSize);
        }

        mSharedPrefs = Utilities.getPrefs(this);
        mIsSafeModeEnabled = getPackageManager().isSafeMode();
        /**
         * 2. 将 Launcer 与 LauncherAppState 对象绑定
         */
        mModel = app.setLauncher(this);
        mModelWriter = mModel.getWriter(mDeviceProfile.isVerticalBarLayout());
        mIconCache = app.getIconCache();
        mAccessibilityDelegate = new LauncherAccessibilityDelegate(this);

        mDragController = new DragController(this);
        mAllAppsController = new AllAppsTransitionController(this);
        mStateTransitionAnimation = new LauncherStateTransitionAnimation(this, mAllAppsController);

        mAppWidgetManager = AppWidgetManagerCompat.getInstance(this);

        mAppWidgetHost = new LauncherAppWidgetHost(this, APPWIDGET_HOST_ID);
        mAppWidgetHost.startListening();

        // If we are getting an onCreate, we can actually preempt onResume and unset mPaused here,
        // this also ensures that any synchronous binding below doesn't re-trigger another
        // LauncherModel load.
        mPaused = false;
                //通过打气筒解析 xml 布局转化成 View 的过程
        mLauncherView = getLayoutInflater().inflate(R.layout.launcher, null);

        setupViews();
        mDeviceProfile.layout(this, false /* notifyListeners */);
        mExtractedColors = new ExtractedColors();
        loadExtractedColorsAndColorItems();

        mPopupDataProvider = new PopupDataProvider(this);

        ((AccessibilityManager) getSystemService(ACCESSIBILITY_SERVICE))
                .addAccessibilityStateChangeListener(this);

        lockAllApps();

        restoreState(savedInstanceState);

        if (LauncherAppState.PROFILE_STARTUP) {
            Trace.endSection();
        }

        //获取意外退出 Activity 保存的属于新兴
        if (savedInstanceState != null) {
            currentScreen = savedInstanceState.getInt(RUNTIME_STATE_CURRENT_SCREEN, currentScreen);
        }
        /**
         * 3.调用 LauncherModel 的 startLoader 函数
         */
        if (!mModel.startLoader(currentScreen)) {
            mDragLayer.setAlpha(0);
        } else {

           ...
        }

     ...
           //设置当前 Activity 显示方向
        setOrientation();
                //设置布局底层解析 xml2View 并添加到 ViewGroup 中
        setContentView(mLauncherView);
        if (mLauncherCallbacks != null) {
            mLauncherCallbacks.onCreate(savedInstanceState);
        }
    }                    

}
```

通过上面代码我们可以知道主要是进行一些对象初始化的绑定，还有解析 xml 文件的过程，我们先来看 LauncherAppState 的 setLauncher 函数实现:

```java
//com.android.launcher3; LauncherAppState.java

    LauncherModel setLauncher(Launcher launcher) {
        getLocalProvider(mContext).setLauncherProviderChangeListener(launcher);
          //1. 调用LauncherModel initialize 初始化工作
        mModel.initialize(launcher);
        return mModel;
    }
```

跟一下 LauncherModel initialize 函数具体实现

```java
//com.android.launcher3; LauncherModel.java
    public void initialize(Callbacks callbacks) {
        synchronized (mLock) {
            Preconditions.assertUIThread();
            // Remove any queued UI runnables
            /**
             * 1. 取消队列里面所有的 Runnable
             */
            mHandler.cancelAll();
            /**
             * 2. 使用 弱引用添加 callbacks 避免内存泄漏
             */
            mCallbacks = new WeakReference<>(callbacks);
        }
    }
```

在 initialize 函数中会将 Callbacks ，也就是传入的 Launcher，封装成一个弱引用对象。因此我们得知 mCallBack 的成员变量指的就是封装成弱引用对象 Launcher,这个 mCallbacks 在 Launcher 的 onCreate 注释 3 中会用到，现在我们看注释 3 的 LauncherModel 调用 startLoader 函数实现:

```java
//com.android.launcher3; LauncherModel.java

public class LauncherModel extends BroadcastReceiver
        implements LauncherAppsCompat.OnAppsChangedCallbackCompat {

  /**
     * 1. 创建了一个具有消息循环的线程
     */
    @Thunk static final HandlerThread sWorkerThread = new HandlerThread("launcher-loader");
    static {
        //启动
        sWorkerThread.start();
    }

    /**
     * 2. 向 HanderThread 发送消息
     */
    @Thunk static final Handler sWorker = new Handler(sWorkerThread.getLooper());       

    //Launcher 的弱引用
    @Thunk WeakReference<Callbacks> mCallbacks;   

    ...//省略部分代码

    public boolean startLoader(int synchronousBindPage) {
        InstallShortcutReceiver.enableInstallQueue();
        synchronized (mLock) {
            if (mCallbacks != null && mCallbacks.get() != null) {
                final Callbacks oldCallbacks = mCallbacks.get();

                runOnMainThread(new Runnable() {
                    public void run() {
                        oldCallbacks.clearPendingBinds();
                    }
                });

                // If there is already one running, tell it to stop.
                stopLoaderLocked();
                /**
                 * 3. 创建 LoaderTask
                 */
                mLoaderTask = new LoaderTask(mApp.getContext(), synchronousBindPage);
                if (synchronousBindPage != PagedView.INVALID_RESTORE_PAGE
                        && mModelLoaded && !mIsLoaderTaskRunning) {
                    mLoaderTask.runBindSynchronousPage(synchronousBindPage);
                    return true;
                } else {
                    sWorkerThread.setPriority(Thread.NORM_PRIORITY);
                    /**
                     * 4.  将mLoaderTask 作为消息发送给 HandlerThread
                     */
                    sWorker.post(mLoaderTask);
                }
            }
        }
        return false;
    }

    ...//省略部分代码

}
```

通过上面代码跟注释我们总结下主要做了哪些事

* 1. 在当前 LauncherModel 的成员声明了 HandlerThread 具有消息循环的线程
* 1. 在当前 LauncherModel 的成员声明了 Handler 并把 HandlerThread 的 Looper 作为参数传递给了 Handler,那么 Handler 这里就是把消息指向了 HandlerThread
* 1. 创建 LoaderTask 实例，它实现了 Runnable 接口
* 1. 将 LoaderTask 作为消息发送给了 HandlerThread  的 Looper 来处理，最后 在 LoaderTask 的 run 函数回调

我们来看下 LoaderTask run 具体实现

```java
private class LoaderTask implements Runnable {

...

          public void run() {
            synchronized (mLock) {
                if (mStopped) {
                    return;
                }
                mIsLoaderTaskRunning = true;
            }

            try {
                if (DEBUG_LOADERS) Log.d(TAG, "step 1.1: loading workspace");
                // Set to false in bindWorkspace()
                mIsLoadingAndBindingWorkspace = true;
                /**
                 * 1. 加载工作区信息
                 */
                loadWorkspace();

              ...

                /**
                 * 2. 绑定工作区信息
                 */
                bindWorkspace(mPageToBindFirst);

                                ...

                /**
                 * 3. 加载系统以及安装额应用程序信息
                 */
                loadAllApps();

                verifyNotStopped();
                           ...
            } catch (CancellationException e) {

            }

                            ...


}
```

Launcher 是工作区的形式来显示系统安装的应用程序的快捷图标的，每一个工作区都是用来描述一个抽象桌面的，它有 n 个屏幕组成，每一个屏幕又分为 n 个单元格，每个单元格用来显示一个应用程序的快捷图标。在注释 1 、2 处分别调用了 bindWorkspace 函数来加载和绑定工作区信息。注释 3 处的 loadAllApps 函数用来加载系统已经安装的应用程序信息，我们来看下注释 3 的实现

```java
//com.android.launcher3 LauncherModel.java

        private void loadAllApps() {
          ...
            mHandler.post(new Runnable() {
                public void run() {

                    final long bindTime = SystemClock.uptimeMillis();
                    final Callbacks callbacks = tryGetCallbacks(oldCallbacks);
                    if (callbacks != null) {
                        /**
                         * 1.
                         */
                        callbacks.bindAllApplications(added);
                        if (DEBUG_LOADERS) {
                            Log.d(TAG, "bound " + added.size() + " apps in "
                                    + (SystemClock.uptimeMillis() - bindTime) + "ms");
                        }
                    } else {
                        Log.i(TAG, "not binding apps: no Launcher activity");
                    }
                }
            });
           ...
        }
```

在注释 1 处会调用 callbacks 的 bindAllApplications 函数，从之前 Launcher 的 onCreate 函数注释 3 处我们得知这个 callbacks 实际指向的 Launcher 的。所以我们回到 Launcher.java 类中看它具体实现 bindAllApplications 做了什么，如下代码所示:

```java
//com.android.launcher3; Launcher.java


    /**
     * 在 LauncherModel 中调用
     */
    public void bindAllApplications(final ArrayList<AppInfo> apps) {
        if (waitUntilResume(mBindAllApplicationsRunnable, true)) {
            mTmpAppsList = apps;
            return;
        }

        if (mAppsView != null) {
            /**
             * 1. 将包含应用信息的列表 apps 传入 mAppsView 中
             */
            mAppsView.setApps(apps);
        }
        if (mLauncherCallbacks != null) {
            mLauncherCallbacks.bindAllApplications(apps);
        }
    }
```

在注释 1 处会调用 AllAppsContainerView 的成员变量 mAppsView 的 setApps 函数, 它会把所有 APP 信息传递进去。

```java
//com.android.launcher3.allapps; AllAppsContainerView.java
    public void setApps(List<AppInfo> apps) {
        mApps.setApps(apps);
    }
```

mApps 成员变量是 AlphabeticalAppsList 里面的函数，接着在跟

```java
//com.android.launcher3.allapps; AlphabeticalAppsList.java
    public void setApps(List<AppInfo> apps) {
        mComponentToAppMap.clear();
          //1. 添加 APP
        addApps(apps);
    }

    public void addApps(List<AppInfo> apps) {
          //2. 更新 APP
        updateApps(apps);
    }

    /**
     * Updates existing apps in the list
     */
    public void updateApps(List<AppInfo> apps) {

        for (AppInfo app : apps) {
            mComponentToAppMap.put(app.toComponentKey(), app);
        }
        onAppsUpdated();
    }

    private void onAppsUpdated() {
       ...//添加逻辑省略
         //更新 Adapter 中的对象数据
        updateAdapterItems();
    }
    private void updateAdapterItems() {
        refillAdapterItems();
        refreshRecyclerView();
    }

    private void refreshRecyclerView() {
        if (mAdapter != null) {
          //刷新 RecyclerView.Adapter 
            mAdapter.notifyDataSetChanged();
        }
    }
```

刷新 APP 信息我们找到了，init Adapter 的地方其实就在 AllAppsContainerView 布局对象加载完成之后的回调 onFinishInflate 中，我们看下具体实现:

```java
//com.android.launcher3.allapps; AllAppsContainerView.java
    @Override
    protected void onFinishInflate() {
        super.onFinishInflate();
                ....

            //找到主页面搜索按钮
        mSearchContainer = findViewById(R.id.search_container);
          //输入扩展 View
        mSearchInput = (ExtendedEditText) findViewById(R.id.search_box_input);
        /**
         * 1. 得到 AllAppsRecyclerView 继承的是 RecyclerView
         */
        mAppsRecyclerView = (AllAppsRecyclerView) findViewById(R.id.apps_list_view);
        /**
         * 2. 设置 mApps
         */
        mAppsRecyclerView.setApps(mApps);
        mAppsRecyclerView.setLayoutManager(mLayoutManager);
        /**
         * 3. 设置加载适配器
         */
        mAppsRecyclerView.setAdapter(mAdapter);
        mAppsRecyclerView.setHasFixedSize(true);
        mAppsRecyclerView.addOnScrollListener(mElevationController);
        mAppsRecyclerView.setElevationController(mElevationController);


    }
```

在注释 1 处得到 AllAppsRecyclerView 对象用来显示 APP 列表，并在注释 2 处将此前的 mAPPs 设置进去，在注释 3 处设置 RecyclerView 的 Apdapter 适配器，这样 APP 就显示在屏幕上了。

到这里 Launcher 中应用图标显示过程以及 launcher 启动流程就将完了，下一篇将为带来应用程序的启动流程，还没有关注的小伙伴可以先关注一波...

## 总结

这里我就以一张图来总结 Launcher 的启动流程吧。

![KshAMt.png](https://s2.ax1x.com/2019/10/27/KshAMt.png)

## 参考

* 《Android 进阶解密》

