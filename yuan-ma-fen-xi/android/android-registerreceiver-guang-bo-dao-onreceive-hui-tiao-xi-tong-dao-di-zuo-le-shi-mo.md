# Android registerReceiver 广播到 onReceive 回调系统到底做了什么?

## 介绍

BroadcastReceiver 是 Android 的四大组件之一，它作用于应用内、进程间重要的一种通信方式，能够将某个消息通过广播的形式传递给订阅的广播接收器中，下面我就来分析一下 广播注册到接收到消息 Android 源码到底做了些什么？

## 源码解析

### registerReceiver

**时序图**

[![hUj3E.png](https://storage7.cuntuku.com/2019/09/08/hUj3E.png)](https://cuntuku.com/image/hUj3E)

**代码讲解**

我们跟着上面时序图的步骤来讲解代码

1. 先在 MainActivity registerReceiver 广播接收者

   ```java
   public class MainActivity extends Activity {
         @Override
       protected void onCreate(Bundle savedInstanceState) {
           super.onCreate(savedInstanceState);
           setContentView(R.layout.activity_main);
             //注册广播接收者
                   registerReceiver(new ReceiverB(),filterB);
       }
   ...代码省略...
   }
   ```

点击 registerReceiver 我们发现并不是 Activity 里面的方法，而是 Activity 的父类 ContextWrapper

1. ContextWrapper registerReceiver

   ```java
   public class Activity extends ContextThemeWrapper
           implements LayoutInflater.Factory2,
           Window.Callback, KeyEvent.Callback,
           OnCreateContextMenuListener, ComponentCallbacks2,
           Window.OnWindowDismissedCallback, WindowControllerCallback,
           AutofillManager.AutofillClient {

             ....代码省略...

           }
   ```

   ```java
   public class ContextThemeWrapper extends ContextWrapper {
     ....代码省略...
   }
   ```

   ```java
   public class ContextWrapper extends Context {
         @Override
       public Intent registerReceiver(
           BroadcastReceiver receiver, IntentFilter filter) {
           return mBase.registerReceiver(receiver, filter);
       }
   }
   ```

   这里的成员变量 mBase 是 Context，看过 Application 应用启动那块的源码知道 ContextImp 实现了 Context ，那么我们看实现类具体 registerReceiver 方法吧。

2. ContextImp registerReceiver

   ```java
   class ContextImpl extends Context {   
   @Override
       public Intent registerReceiver(BroadcastReceiver receiver, IntentFilter filter,
               String broadcastPermission, Handler scheduler, int flags) {
           return registerReceiverInternal(receiver, getUserId(),
                   filter, broadcastPermission, scheduler, getOuterContext(), flags);
       }
   }
   ```

3. 继续看 registerReceiverInternal

   ```java
       private Intent registerReceiverInternal(BroadcastReceiver receiver, int userId,
               IntentFilter filter, String broadcastPermission,
               Handler scheduler, Context context, int flags) {
           IIntentReceiver rd = null;
           if (receiver != null) {
               if (mPackageInfo != null && context != null) {
                   if (scheduler == null) {
                       //获取 ActivityThread H  
                       scheduler = mMainThread.getHandler();
                   }
                   //获取 IIntentReceiver 对象，通过它与 AMS 交互，并且通过 Handler 传递消息
                   rd = mPackageInfo.getReceiverDispatcher(
                       receiver, context, scheduler,
                       mMainThread.getInstrumentation(), true);
               } else {
                   if (scheduler == null) {
                       scheduler = mMainThread.getHandler();
                   }
                   rd = new LoadedApk.ReceiverDispatcher(
                           receiver, context, scheduler, null, true).getIIntentReceiver();
               }
           }
           try {
               //调用 AMS 的 registerReceiver 
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

   注册广播接收器的函数最终进入到了 ContextImpl 的 registerReceiverInternal 这个函数，这里的成员变量 mPackageInfo 是一个 LoadApk 实例，它是用来负责处理广播的接收。

4. mPackageInfo.getReceiverDispatcher 函数实现

   ```java
   //LoadeApk
       public IIntentReceiver getReceiverDispatcher(BroadcastReceiver r,
               Context context, Handler handler,
               Instrumentation instrumentation, boolean registered) {
           synchronized (mReceivers) {
               LoadedApk.ReceiverDispatcher rd = null;
               ArrayMap<BroadcastReceiver, LoadedApk.ReceiverDispatcher> map = null;
               if (registered) {
                   map = mReceivers.get(context);
                   if (map != null) {
                       rd = map.get(r);
                   }
               }
               if (rd == null) {
                   rd = new ReceiverDispatcher(r, context, handler,
                           instrumentation, registered);
                   if (registered) {
                       if (map == null) {
                           map = new ArrayMap<BroadcastReceiver, LoadedApk.ReceiverDispatcher>();
                           //以Context 为 key,map 为 values 存储到 mReveivers 中
                           mReceivers.put(context, map);
                       }
                       map.put(r, rd);
                   }
               } else {
                   rd.validate(context, handler);
               }
               rd.mForgotten = false;
               return rd.getIIntentReceiver();
           }
       }
   ```

   在 LoadedAPK 类中的 getReceivcerDispatcher 函数中，首先看下 r 是不是已经实例化了，如果没有就创建一个，并且以 r 为 key 值保存在一个 HM 集合中，而这个 map 又被存储在了 mReceivers 中，这样只要给定一个 Activity 和 BroadcastReceiver ，就可以查看 LoadedAPK 里面是否已经存在相应的广播接收发布器了。

   现在在回到 ContextImpl.registerReceiverInternal 函数，获得了 IIntentReceiver 类型的 Binder 对象后，就开始注册到 AMS 中了，具体代码看下面小点。

5. AMS registerReceiver

   ```java
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
                   //1. 获取进ProcessRecord
                   callerApp = getRecordForAppLocked(caller);
                   if (callerApp == null) {
                               ...代码省略...
                   }

                         ...代码省略...

               //2. 根据 Action 查找匹配的 sticky 接收器
               Iterator<String> actions = filter.actionsIterator();
               if (actions == null) {
                   ArrayList<String> noAction = new ArrayList<String>(1);
                   noAction.add(null);
                   actions = noAction.iterator();
               }

                 ...代码省略...

               //3. 获取 ReceiverList
               ReceiverList rl = mRegisteredReceivers.get(receiver.asBinder());
               if (rl == null) {
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
                          ...代码省略...
               }

               //4. 构建 BroadcastFilter 对象并且添加到 ReceiverList 中
               BroadcastFilter bf = new BroadcastFilter(filter, rl, callerPackage,
                       permission, callingUid, userId, instantApp, visibleToInstantApps);
               rl.add(bf);
               if (!bf.debugCheck()) {
                   Slog.w(TAG, "==> For Dynamic broadcast");
               }
               mReceiverResolver.addFilter(bf);

                    ...代码省略...

               return sticky;
           }
       }
   ```

   * 根据上面注释 1 可知，获取进程对应的 pid,uid;
   * 注释 2 获取 IntentFilter 的所有 Action；
   * 注释 3 把广播接收器的 receiver 保存到了一个 ReceiverList 中，这个列表的宿主进程是 rl.app，就是 MainActivity 所在的进程。
   * 注释 4 只是把广播接收器保存起来，但是还没有和 filter 关联起来，这里就创建一个 BroadcastFilter 来把广播接收器列表 rl 和 filter 关联起来，然后保存在 AMS 成员变量 mReceiverResolver 中，这样，就将广播接收器和要接收广播类型的接收器 filter 保存在 AMS 中了，以后就能接到到相应的广播并做处理了。

6. 7. Activity H

   ```java
    private class H extends Handler {
      ...
      public void handleMessage(Message msg) {
      case RECEIVER:                
           handleReceiver((ReceiverData)msg.obj);
                       maybeSnapshot();

        break;
      }

      ....
    }
   ```

8. 继续看 handleReceiver

   ```java
       private void handleReceiver(ReceiverData data) {
                   ....

           //应用 Application 局部变量
           Application app;
           //广播局部变量
           BroadcastReceiver receiver;
           //应用 Context
           ContextImpl context;
           try {
               //制作 Applicaiton
               app = packageInfo.makeApplication(false, mInstrumentation);
               //拿到上下文
               context = (ContextImpl) app.getBaseContext();
               if (data.info.splitName != null) {
                   context = (ContextImpl) context.createContextForSplit(data.info.splitName);
               }
               java.lang.ClassLoader cl = context.getClassLoader();
               data.intent.setExtrasClassLoader(cl);
               data.intent.prepareToEnterProcess();
               data.setExtrasClassLoader(cl);
               //通过反射进行实例化广播
               receiver = (BroadcastReceiver)cl.loadClass(component).newInstance();
           } catch (Exception e) {
           try {
               if (localLOGV) Slog.v(
               sCurrentBroadcastIntent.set(data.intent);
               receiver.setPendingResult(data);
               //onReceive 进行调用
           receiver.onReceive(context.getReceiverRestrictedContext(),
                       data.intent);
           } catch (Exception e) {
              ...
           } finally {
               sCurrentBroadcastIntent.set(null);
           }
                   ....
       }
   ```

   这里就是 onReceive 回调过程，现在有了这个回调就可以接收消息了。

   下面我们就来具体看下，sendBroadcast 之后的流程吧！

### onReceive

**时序图**

[![hU3l8.png](https://storage6.cuntuku.com/2019/09/09/hU3l8.png)](https://cuntuku.com/image/hU3l8)

1. 在 Activity 通过 sendBroadcast 发送一个广播最后 Binder 发送给 AMS , AMS 根据这个广播的 Action 类型找到相应的广播接收器，然后把这个广播放进自己的消息队列中，完成第一部分广播异步分发。

   ```java
       final int broadcastIntentLocked(ProcessRecord callerApp,
               String callerPackage, Intent intent, String resolvedType,
               IIntentReceiver resultTo, int resultCode, String resultData,
               Bundle resultExtras, String[] requiredPermissions, int appOp, Bundle bOptions,
               boolean ordered, boolean sticky, int callingPid, int callingUid, int userId) {
           intent = new Intent(intent);

               ......代码省略....

           if (intent.getComponent() == null) {

                 ......代码省略....

               } else {
                   //查询到该 Intent 对应的 BroadcastFilter 也就是接收器列表
                   registeredReceivers = mReceiverResolver.queryIntent(intent,
                           resolvedType, false /*defaultOnly*/, userId);
               }
           }

             ......代码省略....

               if (!replaced) {
                   queue.enqueueParallelBroadcastLocked(r);
                   //处理广播分发
                   queue.scheduleBroadcastsLocked();
               }
               registeredReceivers = null;
               NR = 0;
           }

                    ......代码省略....

           return ActivityManager.BROADCAST_SUCCESS;
       }
   ```

2. AMS 在消息循环中处理这个广播，并通过 Binder 机制把这个广播分发给注册的 ReceiverDispatch ，ReceiverDispatch 把这个广播放进 MainActivity 所在进程的消息队列中，完成第二部分异步消息分发。

   ```java
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

   ```java
       private final class BroadcastHandler extends Handler {
               ......
           @Override
           public void handleMessage(Message msg) {
               switch (msg.what) {
                   case BROADCAST_INTENT_MSG: {
                       if (DEBUG_BROADCAST) Slog.v(
                               TAG_BROADCAST, "Received BROADCAST_INTENT_MSG");
                       //处理下一个广播
                       processNextBroadcast(true);
                   } break;
                  ....
               }
           }
       }
   ```

3. ReceiverDispatch 的内部类 Args 在 MainActivity 所在的线程消息循环中处理这个广播，最终是将这个广播分发给注册的 Receiver 实例的 onReceiver 处理。

   \`\`\`java public final class LoadedApk { ... static final class ReceiverDispatcher {

   ```text
          final class Args extends BroadcastReceiver.PendingResult {

            ....
   ```

```text
           public final Runnable getRunnable() {
               return () -> {
             ....
                   try {
                       ClassLoader cl = mReceiver.getClass().getClassLoader();
                       intent.setExtrasClassLoader(cl);
                       intent.prepareToEnterProcess();
                       setExtrasClassLoader(cl);
                       receiver.setPendingResult(this);
                       //回调到接收广播的 onReceiver
                       receiver.onReceive(mContext, intent);
                   } catch (Exception e) {
                     ...
               };
           }
       }
    }

 ...
```

}

\`\`\`

## 总结

注册跟接收源码分析就到这里差不多了，简单来说广播就是一个订阅 - 发布的过程，通过一些 map 存储 BroadcastReceiver ，key 就是封装了这些广播的信息类，如 Action 之类的，当发布一个广播时通过 AMS 到这个 map 中查询注册了这个广播的 IntentFilter 的 BroadcastReceiver , 然后通过 ReceiverDispatch 将广播分发给各个订阅的对象，从而完成了整个通信过程。

感谢你的阅读谢谢！

