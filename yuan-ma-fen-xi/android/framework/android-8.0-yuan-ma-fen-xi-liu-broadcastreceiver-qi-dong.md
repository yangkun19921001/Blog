# Android 8.0 源码分析 \(六\) BroadcastReceiver 启动

## 前言

我们熟知一般 Android 工程师都是在应用层上开发，不会涉及系统源码，但是如果你想往底层发展，或者深入插件化、Framework 系统层等开发工作，如果不了解 Android 源码可是不行的，那么接下来我基于自己的理解跟学习来记录跟 Android 开发息息相关的源码分析，大概从 Android 中的 SystemServer 启动、四大组件启动、AMS、PMS 等几个维度来介绍，下面是我的计划，当然在未来也有可能改变。

**还没有关注的小伙伴，可以先关注一波，系列文章会持续更新。**

[Android 8.0 源码分析 \(一\) SystemServer 进程启动](https://juejin.im/post/5db3f95ee51d4529e83947f9)

[Android 8.0 源码分析 \(二\) Launcher 启动](https://juejin.im/post/5db5565cf265da4d0f14053c)

[Android 8.0 源码分析 \(三\) 应用程序进程创建到应用程序启动的过程](https://juejin.im/post/5db599bc6fb9a0203b234b08)

[Android 8.0 源码分析 \(四\) Activity 启动](https://juejin.im/post/5db85da4e51d4529f73e27fb)

[Android 8.0 源码分析 \(五\) Service 启动](https://juejin.im/post/5dbb0507f265da4cf406f735)

[Android 8.0 源码分析 \(六\) BroadcastReceiver 启动](android-8.0-yuan-ma-fen-xi-liu-broadcastreceiver-qi-dong.md)

[Android 8.0 源码分析 \(七\) ContentProvider 启动](android-8.0-yuan-ma-fen-xi-liu-broadcastreceiver-qi-dong.md)

## 介绍

广播作为四大组件之一，使用频率虽然没有 Activity 高，但是使用场景也还是比较广泛，比如监听开机、息屏亮屏、组件或者进程间发送消息等等。接下来将为大家介绍广播的工作过程，分别从注册、发送、接收这三点来介绍。

## 源码分析

### 广播的注册过程

广播的注册分为静态跟动态注册，静态注册需要通过 PMS 来解析 Android 清单文件等等复杂操作，这里我们以动态注册广播来讲解。先来看一下注册时序图:

![](http://tva1.sinaimg.cn/large/007X8olVly1g8iyacddyej31ao0u075d.jpg)

首先，想要使用广播就得通过 **registerReceiver** 方法注册一个广播，最终也是在 **Activity** 的父类 **ContextWrapper** 中实现，代码如下:

```java
//ContextWrapper.java
        /**
     * 应用调用注册广播的函数
     * @param receiver The BroadcastReceiver to handle the broadcast.
     * @param filter Selects the Intent broadcasts to be received.
     *
     * @return
     */
    @Override
    public Intent registerReceiver(
        BroadcastReceiver receiver, IntentFilter filter) {
        //mBase 是 Context的引用
        return mBase.registerReceiver(receiver, filter);
    }
```

我们在讲解 [Android 8.0 源码分析 \(五\) Service 启动](https://juejin.im/post/5dbb0507f265da4cf406f735) 的时候，开篇介绍了 **Activity,Context,ContextImpl** 之间的关系，这里就不在多说了，有不了解可以先去看一下上一篇文章。这里我们直接看 **Context** 的实现类 **ContextImpl** 中的实现，代码如下：

```java
    /**
     * Context 调用
     * @param receiver The BroadcastReceiver to handle the broadcast.
     * @param filter Selects the Intent broadcasts to be received.
     *
     * @return
     */
    @Override
    public Intent registerReceiver(BroadcastReceiver receiver, IntentFilter filter) {
        //调用内部重载方法
        return registerReceiver(receiver, filter, null, null);
    }



    @Override
    public Intent registerReceiver(BroadcastReceiver receiver, IntentFilter filter,
                                   String broadcastPermission, Handler scheduler) {
        //调用内部重载方法
        return registerReceiverInternal(receiver, getUserId(),
                filter, broadcastPermission, scheduler, getOuterContext(), 0);
    }


    private Intent registerReceiverInternal(BroadcastReceiver receiver, int userId,
                                            IntentFilter filter, String broadcastPermission,
                                            Handler scheduler, Context context, int flags) {
        IIntentReceiver rd = null;
        if (receiver != null) {
            /**
             * 1. 
             */
            if (mPackageInfo != null && context != null) {
                if (scheduler == null) {
                    //获取 ActivityThread H
                    scheduler = mMainThread.getHandler();
                }
                //获取 IIntentReceiver 对象，通过它与 AMS 交互，并且通过 Handler 传递消息
                rd = mPackageInfo.getReceiverDispatcher(
                        receiver, context, scheduler,
                        /**
                         * 2. 
                         */
                        mMainThread.getInstrumentation(), true);
            } else {
                if (scheduler == null) {
                    scheduler = mMainThread.getHandler();
                }
                /**
                 * 3. 
                 */
                rd = new LoadedApk.ReceiverDispatcher(
                        receiver, context, scheduler, null, true).getIIntentReceiver();
            }
        }
        try {
            //调用 AMS 的 registerReceiver
            /**
             * 4. 
             */
            final Intent intent = ActivityManager.getService().registerReceiver(
                    mMainThread.getApplicationThread(), mBasePackageName, rd, filter,
                    broadcastPermission, userId, flags);
            if (intent != null) {
                intent.setExtrasClassLoader(getClassLoader());
                intent.prepareToEnterProcess();
            }
            return intent;
        } catch (RemoteException e) {
            throw e.rethrowFromSystemServer();
        }
    }
```

前面 2 个函数都是简单的调用内部重载方法，我们直接看 **registerReceiverInternal** 方法实现,注释 1 判断 mPackageInfo 与 context 是否为空，如果不为空将执行注释 2 代码，通过 mPackageInfo 方法调用 getReceiverDispatch 方法获取 rd 对象，否则就调用注释 3 处的代码来创建 rd 对象。这 2 步代码主要就是来获取 IIntentReceiver 对象，它是一个 Binder 接口，用于广播的跨进程通信，它在 **LoadedApk.ReceiverDispatcher.InnerReceiver** 中实现，代码如下所示:

```java
//LoadedApk.java
    static final class ReceiverDispatcher {

        final static class InnerReceiver extends IIntentReceiver.Stub {
            final WeakReference<LoadedApk.ReceiverDispatcher> mDispatcher;
            final LoadedApk.ReceiverDispatcher mStrongRef;

            InnerReceiver(LoadedApk.ReceiverDispatcher rd, boolean strong) {
                mDispatcher = new WeakReference<LoadedApk.ReceiverDispatcher>(rd);
                mStrongRef = strong ? rd : null;
            }

          ....

        }
```

回到 **registerReceiverInternal** 方法，在注释 4 处调用 AMS 代理类 **IActivityManager** 的 **registerReceiver** 方法，通过进程间通信最后在 AMS 类的 **registerReceiver** 方法，并将 **IIntentReceiver** 类型的 rd 引用也一并传递进 AMS 中，这里之所以不直接传入客户端的 **BroadcastReceiver** 而是传入 **IIntetnReceiver** ,因为注册广播是一个跨进程的过程，需要具有跨进程通信功能的 **IIntentReceiver** ,你也可以把它理解为一个中间者，registerReceiver 方法内部比较多，这里分为 2 个部分来讲解，先来看 part1,代码如下:

**1. registerReceiver 方法的 part1**

```java
//AMS.java
    /**
     * 这里是通过 Binder 通知调用
     * @return Intent
     */
    public Intent registerReceiver(IApplicationThread caller, String callerPackage,
            IIntentReceiver receiver, IntentFilter filter, String permission, int userId,
            int flags) {
        enforceNotIsolatedCaller("registerReceiver");
        ArrayList<Intent> stickyIntents = null;
        ProcessRecord callerApp = null;
        final boolean visibleToInstantApps
                = (flags & Context.RECEIVER_VISIBLE_TO_INSTANT_APPS) != 0;
        int callingUid;
        int callingPid;
        boolean instantApp;
        synchronized(this) {
            if (caller != null) {
                /**
                 * 1. 通过 getRecordForAppLocked 方法得到 ProcessRecord类型的 callerApp 对象，用描述 AMS 注册广播接收者的 Activity 所在的进程
                 */
                callerApp = getRecordForAppLocked(caller);
                if (callerApp == null) {
                    throw new SecurityException(
                            "Unable to find app for caller " + caller
                            + " (pid=" + Binder.getCallingPid()
                            + ") when registering receiver " + receiver);
                }
                if (callerApp.info.uid != SYSTEM_UID &&
                        !callerApp.pkgList.containsKey(callerPackage) &&
                        !"android".equals(callerPackage)) {
                    throw new SecurityException("Given caller package " + callerPackage
                            + " is not running in process " + callerApp);
                }
                callingUid = callerApp.info.uid;
                callingPid = callerApp.pid;
            } else {
                callerPackage = null;
                callingUid = Binder.getCallingUid();
                callingPid = Binder.getCallingPid();
            }

            instantApp = isInstantApp(callerApp, callerPackage, callingUid);
            userId = mUserController.handleIncomingUser(callingPid, callingUid, userId, true,
                    ALLOW_FULL_ONLY, "registerReceiver", callerPackage);

            /**
             * 2. 根据传入的 IntentFilter 类型的 filter 得到一个 action 列表
             */
            Iterator<String> actions = filter.actionsIterator();
            if (actions == null) {
                ArrayList<String> noAction = new ArrayList<String>(1);
                noAction.add(null);
                actions = noAction.iterator();
            }

            // Collect stickies of users
            int[] userIds = { UserHandle.USER_ALL, UserHandle.getUserId(callingUid) };
            while (actions.hasNext()) {

                String action = actions.next();
                for (int id : userIds) {
                    //根据actions 列表和 userIds 得到所有的粘性广播的 intent,并在注释 3 处传入到 stickyIntents 中
                    ArrayMap<String, ArrayList<Intent>> stickies = mStickyBroadcasts.get(id);
                    if (stickies != null) {
                        ArrayList<Intent> intents = stickies.get(action);
                        if (intents != null) {
                            if (stickyIntents == null) {
                                stickyIntents = new ArrayList<Intent>();
                            }
                            /**
                             * 3. 将匹配到的粘性广播 action 存入容器中
                             */
                            stickyIntents.addAll(intents);
                        }
                    }
                }
            }
        }

        ArrayList<Intent> allSticky = null;
        if (stickyIntents != null) {
            final ContentResolver resolver = mContext.getContentResolver();
            // Look for any matching sticky broadcasts...
            /**
             * 遍历寻找匹配的粘性广播
             */
            for (int i = 0, N = stickyIntents.size(); i < N; i++) {
                Intent intent = stickyIntents.get(i);
                // Don't provided intents that aren't available to instant apps.
                if (instantApp &&
                        (intent.getFlags() & Intent.FLAG_RECEIVER_VISIBLE_TO_INSTANT_APPS) == 0) {
                    continue;
                }
                //开始匹配
                if (filter.match(resolver, intent, true, TAG) >= 0) {
                    if (allSticky == null) {
                        allSticky = new ArrayList<Intent>();
                    }
                    /**
                     * 4. 将intent 存入 allSticky 列表中
                     */
                    allSticky.add(intent);
                }
            }
        }

        ....//后面代码 part2 讲解

            return sticky;
        }
    }
```

在注释 1 通过 **getRecordForAppLocked** 方法得到 ProcessRecord 类型的 callerApp 对象，它用于描述请求 AMS 注册广播接收者的 Activity 所在的应用程序进程。在注释 2 处根据传入的 IntentFilter 类型的 filter 得到一个 actions 列表，根据 actions 列表和 userIds 得到所有的粘性广播的 intent ,并在注释 3 处传入到 stickyIntents 中。接下来从 stickyIntent 中匹配传入的参数 filter 的粘性广播的 intent ，在注释 4 处将这些 intent 存入到 allSticky 列表中，从这里可以看出粘性广播是存储在 AMS 中的。

**2. registerReceiver 方法的 part2**

接下来看 AMS 的 **registerReceiver** 方法剩余内容，代码如下所示:

```java
//AMS.java

    /**
     * 这里是通过 Binder 通知调用
     * @return Intent
     */
    public Intent registerReceiver(IApplicationThread caller, String callerPackage,
            IIntentReceiver receiver, IntentFilter filter, String permission, int userId,
            int flags) {
     ...


          synchronized (this) {
                    ...
            /**
             * 1. 获取 ReceiverList
             */
            ReceiverList rl = mRegisteredReceivers.get(receiver.asBinder());
            if (rl == null) {//如果为空调用注释 2
                /**
                 * 2. 创建一个 ReceiverList 对象，它继承自 ArrayList,用于存放广播接收者
                 */
                rl = new ReceiverList(this, callerApp, callingPid, callingUid,
                        userId, receiver);
                if (rl.app != null) {
                    rl.app.receivers.add(rl);
                } else {
                    try {
                        receiver.asBinder().linkToDeath(rl, 0);
                    } catch (RemoteException e) {
                        return sticky;
                    }
                    rl.linkedToDeath = true;
                }
                mRegisteredReceivers.put(receiver.asBinder(), rl);
            } else if (rl.uid != callingUid) {
                ...
            }

            /**
             *  3. 构建 BroadcastFilter 对象，并且将 广播接收者列表 ReceiverList 添加到进去
             *  用于描述注册的广播接收者
             */
            BroadcastFilter bf = new BroadcastFilter(filter, rl, callerPackage,
                    permission, callingUid, userId, instantApp, visibleToInstantApps);
            /**
             * 4. 通过 add 函数将自身添加到广播接收者列表中
             */
            rl.add(bf);
            if (!bf.debugCheck()) {
                Slog.w(TAG, "==> For Dynamic broadcast");
            }
            /**
             * 5. 将 BroadcastFilter 添加到 IntentResolver 类型的 mReceiverResolver 中。
             */
            mReceiverResolver.addFilter(bf);


      ...
    }
```

在注释 1 处获取到了 ReceiverList 列表，如果为空则在注释 2 处创建一个新的接收列表 ReceiverList 对象，它继承自 ArrayList,用来存储广播接收者。在注释 3 处创建 BroadcastFilter 并传入此前创建的 ReceiverList ,BroadcastFilter 用来描述注册的广播接收者，并在注释 4 处通过 add 方法将自身添加到 ReceiverList 中。在注释 5 处将 BroadcastFilter 添加到 IntentResolver 类型的 mReceiverResolver 中，这样当 AMS 接收到广播时就可以从 mReceiverResolver 中找到对应的广播接收者了。从而达到注册广播的目的。

### 广播的发送和接收过程

广播的发送和接收分为 2 个阶段来分析，通过应用进程到 AMS SystemServer 进程的调用，然后 AMS 所在的进程通知应用进程的调用，下面我们先来分析应用程序进程到 AMS 的过程。

### ContextImpl 到 AMS 的调用过程

广播发送多种类型的广播，比如 无序、有序、粘性广播，这里以最简单的广播无序广播来讲解，也就是发送一个普通广播，它的实现也是在 ContextWrapper 中，下面先来看一个整体调用时序图.

![](http://tva1.sinaimg.cn/large/007X8olVly1g8jrk51rslj31fe0u0wfl.jpg)

直接来看 ContextWrapper 的 **sendBroadcast** 方法，代码如下：

```java
//ContextWrapper.java
    @Override
    public void sendBroadcast(Intent intent) {
          //调用 Context 的实现类 ContextImpl
        mBase.sendBroadcast(intent);
    }
```

这里的 mBase 是 Context , 在之前文章中将到了 ContextImpl 是 Context 的实现类，我们直接看它的实现，代码如下:

```java
//ContextImpl.java
    @Override
    public void sendBroadcast(Intent intent) {
        warnIfCallingFromSystemProcess();
        String resolvedType = intent.resolveTypeIfNeeded(getContentResolver());
        try {
            intent.prepareToLeaveProcess(this);
            ActivityManager.getService().broadcastIntent(
                    mMainThread.getApplicationThread(), intent, resolvedType, null,
                    Activity.RESULT_OK, null, null, null, AppOpsManager.OP_NONE, null, false, false,
                    getUserId());
        } catch (RemoteException e) {
            throw e.rethrowFromSystemServer();
        }
    }
```

看到上面的代码是不是倍感的亲切，熟悉，没错它又调用 AMS 的代理类 IActivityManager 的 **broadcastIntent** 函数，我们发现跟咱么之前讲解的 Activity,Service 调用方式一样都会经过 AMS 的代理类 IActivityManager ，那么 AMS 到底是何方神圣，这个我们讲解完 四大组件 之后会单独来介绍，下面我们直接看 AMS 的实现:

```java
//AMS.java

    /**
     * 应用程序进程调用
     * @param caller
     * @param intent
     * @param resolvedType
     * @param resultTo
     * @param resultCode
     * @param resultData
     * @param resultExtras
     * @param requiredPermissions
     * @param appOp
     * @param bOptions
     * @param serialized
     * @param sticky
     * @param userId
     * @return
     */
    public final int broadcastIntent(IApplicationThread caller,
            Intent intent, String resolvedType, IIntentReceiver resultTo,
            int resultCode, String resultData, Bundle resultExtras,
            String[] requiredPermissions, int appOp, Bundle bOptions,
            boolean serialized, boolean sticky, int userId) {
        enforceNotIsolatedCaller("broadcastIntent");
        synchronized(this) {
            /**
             * 1. 验证广播是否合法
             */
            intent = verifyBroadcastLocked(intent);
            /**
             * 拿到所在的进程
             */
            final ProcessRecord callerApp = getRecordForAppLocked(caller);
            final int callingPid = Binder.getCallingPid();
            final int callingUid = Binder.getCallingUid();
            final long origId = Binder.clearCallingIdentity();
            /**
             * 2. 
             */
            int res = broadcastIntentLocked(callerApp,
                    callerApp != null ? callerApp.info.packageName : null,
                    intent, resolvedType, resultTo, resultCode, resultData, resultExtras,
                    requiredPermissions, appOp, bOptions, serialized, sticky,
                    callingPid, callingUid, userId);
            Binder.restoreCallingIdentity(origId);
            return res;
        }
    }
```

我们先看注释 1 内部验证广播代码实现:

```java
//AMS.java

    final Intent verifyBroadcastLocked(Intent intent) {
        // Refuse possible leaked file descriptors
        /**
         * 1. 验证 intent 是否不为null 并且有文件描述符
         */
        if (intent != null && intent.hasFileDescriptors() == true) {
          ...
          }

        /**
         * 2. 获得 intent 的 flags
         */
        int flags = intent.getFlags();

        if (!mProcessesReady) {
            /**
             * 3. 系统正在启动过程中。如果是动态广播者不做处理
             */
            if ((flags&Intent.FLAG_RECEIVER_REGISTERED_ONLY_BEFORE_BOOT) != 0) {

                /**
                 * 4. 如果 flag 没有设置为 FLAG_RECEIVER_REGISTERED_ONLY 只接受动态注册的广播接收者则会抛出异常
                 */
            } else if ((flags&Intent.FLAG_RECEIVER_REGISTERED_ONLY) == 0) {
            ...    
            }
        }

                ...

        return intent;
    }
```

根据上面的注释我们知道就是对 Intent 判断是否合法性，下面我们继续回到 **broadcastIntent** 注释 2 ，代码如下:

```java
//AMS.java
    final int broadcastIntentLocked(ProcessRecord callerApp,
            String callerPackage, Intent intent, String resolvedType,
            IIntentReceiver resultTo, int resultCode, String resultData,
            Bundle resultExtras, String[] requiredPermissions, int appOp, Bundle bOptions,
            boolean ordered, boolean sticky, int callingPid, int callingUid, int userId) {
      ...

            /**
             * 1. 创建 BroadcastRecord 对象将 receivers 传进去。
             */
            BroadcastRecord r = new BroadcastRecord(queue, intent, callerApp,
                    callerPackage, callingPid, callingUid, callerInstantApp, resolvedType,
                    requiredPermissions, appOp, brOptions, registeredReceivers, resultTo,
                    resultCode, resultData, resultExtras, ordered, sticky, false, userId);

                  final boolean replaced = replacePending
                    && (queue.replaceParallelBroadcastLocked(r) != null);

            if (!replaced) {
                queue.enqueueParallelBroadcastLocked(r);
                /**
                 * 2.
                 */
                //处理广播分发
                queue.scheduleBroadcastsLocked();
            }
            registeredReceivers = null;
            NR = 0;
        }

      ...

    }
```

注释 1 上面省略了很多代码，省略的代码如要是把注册 动态/静态的广播接收者按照优先级高低不同储存在不同的列表中，在将这 2 个列表合并到 receivers 列表中，这样 receivers 列表包含了所有的广播接收者。在注释 1 处创建 BroadcastReceiver 对象并将 receivers 传递进去，在注释 2 处调用 BroadcastQuque 的 **scheduleBroadcastsLocked** 方法。

### AMS 到 BroadcastReceiver 的调用过程

AMS 到 BroadcastReceiver 的调用过程请先看下面时序图:

![](http://tva1.sinaimg.cn/large/007X8olVly1g8jsuy16lgj317p0u00uz.jpg)

下面直接看 BroadcastQueue 的 **scheduleBroadcastsLocked** 函数实现，代码如下:

```java
//BroadcastQueue.java

    public void scheduleBroadcastsLocked() {
        if (DEBUG_BROADCAST) Slog.v(TAG_BROADCAST, "Schedule broadcasts ["
                + mQueueName + "]: current="
                + mBroadcastsScheduled);

        if (mBroadcastsScheduled) {
            return;
        }
        //通过 Handler 分发
        mHandler.sendMessage(mHandler.obtainMessage(BROADCAST_INTENT_MSG, this));
        mBroadcastsScheduled = true;
    }
```

上面的代码向 BroadcastHandler 类型的 mHandler 对象发送了 BROADCAST\_INTENT\_MSG 类型的消息，这个消息在 BroadcastHandler 的 handleMessage 方法中进行处理，如下所示:

```java
    //BroadcastQueue.java
         private final class BroadcastHandler extends Handler {
        public BroadcastHandler(Looper looper) {
            super(looper, null, true);
        }

        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case BROADCAST_INTENT_MSG: {
                    if (DEBUG_BROADCAST) Slog.v(
                            TAG_BROADCAST, "Received BROADCAST_INTENT_MSG");
                    //处理下一个广播
                    processNextBroadcast(true);
                } break;
                case BROADCAST_TIMEOUT_MSG: {
                    synchronized (mService) {
                        broadcastTimeoutLocked(true);
                    }
                } break;
            }
        }
    }
```

在 handleMessage 方法中调用了 processnextBroadcast 方法，方法对无序广播和有序广播分别进行处理，在将广播发送给广播接收者，处理代码如下:

```java
//BroadcastQueue.java

    final void processNextBroadcast(boolean fromMsg) {
        synchronized(mService) {
            BroadcastRecord r;

                  ...
            mService.updateCpuStats();

            if (fromMsg) {
                /**
                 * 1.  已经处理了  BROADCAST_INTENT_MSG 这条消息
                 */

                mBroadcastsScheduled = false;
            }

            /**
             * 2. 遍历存储无序广播的 mParallelBroadcasts 列表
             */
            while (mParallelBroadcasts.size() > 0) {
                /*** 3.获取无序广播 */
                r = mParallelBroadcasts.remove(0);
                ...

                for (int i=0; i<N; i++) {
                    Object target = r.receivers.get(i);
                 /**
                 * 4. 将 r 对象描述的广播发送给对应的广播者
                 */
                    deliverToRegisteredReceiverLocked(r, (BroadcastFilter)target, false, i);
                }

                addBroadcastToHistoryLocked(r);
                if (DEBUG_BROADCAST_LIGHT) Slog.v(TAG_BROADCAST, "Done with parallel broadcast ["
                        + mQueueName + "] " + r);
            }

            ...
        }
    }
```

从前面 BroadcastHandler 方法中我们得知传入的参数 fromMsg 的值为 true,因此在注释1 处将 mBroadcastsScheduled 设置为 flase, 表示对于此前发来的 BROADCAST\_INTENT\_MSG 类型的消息已经处理了。在注释 2 处的 mParallelBroadcasts 列表用来存储无序广播，通过 while 循环将 mParallelBroadcasts 列表中的无序广播发送给对应的广播接收者。在注释 3 处获取每一个 mParallelBroadcasts 列表中存储的 BroadcastRecord 类型的 r 对象。在注释 4 处将这些 r 对象描述的广播发送给对应的广播接收者，deliverToRegisteredReceiverLocked 方法，如下所示:

```java
//BroadcastQueue.java


    private void deliverToRegisteredReceiverLocked(BroadcastRecord r,
            BroadcastFilter filter, boolean ordered, int index) {
     ...

                 if (filter.receiverList.app != null && filter.receiverList.app.inFullBackup) {
                 if (ordered) {
                    skipReceiverLocked(r);
                }
            } else {
                /***
                 * 1.
                 */
                performReceiveLocked(filter.receiverList.app, filter.receiverList.receiver,
                        new Intent(r.intent), r.resultCode, r.resultData,
                        r.resultExtras, r.ordered, r.initialSticky, r.userId);
            }  

     ...


    }
```

**deliverToRegisteredReceiverLocked**  内部代码如要是用来检查广播发送者和广播接收者的权限，如果通过了权限的检查，则会调用注释 1 处的 **performReceiveLocked** 方法。

```java
//BroadcastQueue.java

    void performReceiveLocked(ProcessRecord app, IIntentReceiver receiver,
            Intent intent, int resultCode, String data, Bundle extras,
            boolean ordered, boolean sticky, int sendingUser) throws RemoteException {
        /**
         * 1. 
         */
        if (app != null) {
            /**
             * 2. 
             */
            if (app.thread != null) {

                try {
                    /**
                     * 3. 
                     */
                    app.thread.scheduleRegisteredReceiver(receiver, intent, resultCode,
                            data, extras, ordered, sticky, sendingUser, app.repProcState);
                ...
    }
```

在注释 1 处和注释 2 处的代码表示如果广播的接收者所在的应用程序进程存在并且正在运行，则执行注释 3 处的代码，表示用广播接收者所在的应用程序进程来接收广播，这里 app.thread 指的是 ApplicationThread,它其实在 ActivityThread 内部类中，继承于 IApplicationThread.Stub 下面我们看它的实现，代码如下:

```java
//ActivityThread.java

    private class ApplicationThread extends IApplicationThread.Stub {
    ...

            public void scheduleRegisteredReceiver(IIntentReceiver receiver, Intent intent,
                int resultCode, String dataStr, Bundle extras, boolean ordered,
                boolean sticky, int sendingUser, int processState) throws RemoteException {
            updateProcessState(processState, false);
                  /***1. 调用 IIntentReceiver 中的 performReceive 函数*/
            receiver.performReceive(intent, resultCode, dataStr, extras, ordered,
                    sticky, sendingUser);
        }
    ...

    }
```

在注释 1 中调用了 IIntentReceiver 的 performReceive 函数，IItentReceiver 在前面提到过，用于广播的跨进程的通信，它的具体实现在 LoadedApk.ReceiverDispatcher.InnerReceiver,代码如下:

```java
//LoadedApk.java
    static final class ReceiverDispatcher {

        final static class InnerReceiver extends IIntentReceiver.Stub {
            final WeakReference<LoadedApk.ReceiverDispatcher> mDispatcher;
            final LoadedApk.ReceiverDispatcher mStrongRef;

            InnerReceiver(LoadedApk.ReceiverDispatcher rd, boolean strong) {
                mDispatcher = new WeakReference<LoadedApk.ReceiverDispatcher>(rd);
                mStrongRef = strong ? rd : null;
            }

            @Override
            public void performReceive(Intent intent, int resultCode, String data,
                    Bundle extras, boolean ordered, boolean sticky, int sendingUser) {
                final LoadedApk.ReceiverDispatcher rd;
                if (intent == null) {
                    Log.wtf(TAG, "Null intent received");
                    rd = null;
                } else {
                    rd = mDispatcher.get();
                }
              ...
                if (rd != null) {
                  //1. 
                    rd.performReceive(intent, resultCode, data, extras,
                            ordered, sticky, sendingUser);
                } else {
                   ...
                }
            }
        }
      ....

    }
```

其实 IIntentReceiver 和 IActivityManager 一样，都使用了 aidl 来实现进程间通信。InnerReceiver 继承自 IIntentReceiver.Stub,是 Binder 通信的服务器端， IIntentReceiver 则是 Binder 通信的客服端、InnerReceiver 在本地的代理，它的具体的实现就是 InnerReceiver. 在 InnerReceiver 的 performReceiver 方法的注释 1 调用了 ReceiverDispatch 类型的 rd 对象的 performReceive 方法，代码如下:

```java
//LoadedApk.java
        public void performReceive(Intent intent, int resultCode, String data,
                Bundle extras, boolean ordered, boolean sticky, int sendingUser) {
            /**
             * 1. 
             */
            final Args args = new Args(intent, resultCode, data, extras, ordered,
                    sticky, sendingUser);
           ...
            /**
             * 2. 
             */
            if (intent == null || !mActivityThread.post(args.getRunnable())) {
                if (mRegistered && ordered) {
                    IActivityManager mgr = ActivityManager.getService();
                    if (ActivityThread.DEBUG_BROADCAST) Slog.i(ActivityThread.TAG,
                            "Finishing sync broadcast to " + mReceiver);
                    args.sendFinished(mgr);
                }
            }
        }

    }
```

在注释 1 处将广播的 intent 等信息封装到了为 Args 对象中，在注释 2 处调用 mActivityThread 的 post 方法并传入了 Args 对象。在这个 mActivityThread 是一个 Handler 对象，具体指向的就是 H 类，在注释 2 处的代码就是将 Args 对象的 getRunnable 方法通过 H 发送到线程的消息队列中， Args 中的实现，代码如下：

```java
//LoadedApk.java

        final class Args extends BroadcastReceiver.PendingResult {
            private Intent mCurIntent;
            private final boolean mOrdered;
            private boolean mDispatched;
            private Throwable mPreviousRunStacktrace; // To investigate b/37809561. STOPSHIP remove.

            public Args(Intent intent, int resultCode, String resultData, Bundle resultExtras,
                    boolean ordered, boolean sticky, int sendingUser) {
                super(resultCode, resultData, resultExtras,
                        mRegistered ? TYPE_REGISTERED : TYPE_UNREGISTERED, ordered,
                        sticky, mIIntentReceiver.asBinder(), sendingUser, intent.getFlags());
                mCurIntent = intent;
                mOrdered = ordered;
            }

            public final Runnable getRunnable() {
                return () -> {
                    final BroadcastReceiver receiver = mReceiver;
                    ...
                    try {
                        ClassLoader cl = mReceiver.getClass().getClassLoader();
                        intent.setExtrasClassLoader(cl);
                        intent.prepareToEnterProcess();
                        setExtrasClassLoader(cl);
                        receiver.setPendingResult(this);
                        //1. 回调到接收广播的 onReceiver
                        receiver.onReceive(mContext, intent);
                    } catch (Exception e) {
                        ...

                };
            }
        }
```

在注释 1 处执行了 BroadcastReceiver 回调 **onReceive\(mContext, intent\);**方法，这样注册广播接收者就收到了广播并得到了 intent。

整个流程到这里就讲解完了，下一篇将为大家带来四大组件中的最后一个组件 **ContentProvider 启动过程**，敬请期待!

## 参考

* 《Android 进阶解密》

