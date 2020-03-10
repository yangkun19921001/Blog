### Service 相关面试题

##### 1. 怎么在Service中创建Dialog对话框？

1.在我们取得Dialog对象后，需给它设置类型，即：

```
dialog.getWindow().setType(WindowManager.LayoutParams.TYPE_SYSTEM_ALERT)
<span class="copy-code-btn">&#x590D;&#x5236;&#x4EE3;&#x7801;</span>
```

2.在Manifest中加上权限:

```
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINOW">
<span class="copy-code-btn">&#x590D;&#x5236;&#x4EE3;&#x7801;</span></uses-permission>
```



#### 2. 为什么bindService可以跟Activity生命周期联动？

1、bindService 方法执行时，LoadedApk 会记录 ServiceConnection 信息。

2、Activity 执行 finish 方法时，会通过 LoadedApk 检查 Activity 是否存在未注销/解绑的 BroadcastReceiver 和 ServiceConnection，如果有，那么会通知 AMS 注销/解绑对应的 BroadcastReceiver 和 Service，并打印异常信息，告诉用户应该主动执行注销/解绑的操作。



#### 3. 服务启动一般有几种，服务和activty之间怎么通信，服务和服务之间怎么通信

方式：

1、startService：

onCreate()--->onStartCommand() ---> onDestory()

如果服务已经开启，不会重复的执行onCreate()， 而是会调用onStartCommand()。一旦服务开启跟调用者(开启者)就没有任何关系了。 开启者退出了，开启者挂了，服务还在后台长期的运行。 开启者不能调用服务里面的方法。

2、bindService：

onCreate() --->onBind()--->onunbind()--->onDestory()

bind的方式开启服务，绑定服务，调用者挂了，服务也会跟着挂掉。 绑定者可以调用服务里面的方法。

通信：

1、通过Binder对象。

2、通过broadcast(广播)。



#### 4. 如何保证Service不被杀死？

Android 进程不死从3个层面入手：

A.提供进程优先级，降低进程被杀死的概率

方法一：监控手机锁屏解锁事件，在屏幕锁屏时启动1个像素的 Activity，在用户解锁时将 Activity 销毁掉。

方法二：启动前台service。

方法三：提升service优先级：

在AndroidManifest.xml文件中对于intent-filter可以通过android:priority = "1000"这个属性设置最高优先级，1000是最高值，如果数字越小则优先级越低，同时适用于广播。

B. 在进程被杀死后，进行拉活

方法一：注册高频率广播接收器，唤起进程。如网络变化，解锁屏幕，开机等

方法二：双进程相互唤起。

方法三：依靠系统唤起。

方法四：onDestroy方法里重启service：service + broadcast 方式，就是当service走ondestory的时候，发送一个自定义的广播，当收到广播的时候，重新启动service；

C. 依靠第三方

根据终端不同，在小米手机（包括 MIUI）接入小米推送、华为手机接入华为推送；其他手机可以考虑接入腾讯信鸽或极光推送与小米推送做 A/B Test。



#### 5. IntentService

IntentService是一种特殊的Service，它继承了Service并且它是一个抽象类，因此必须创建它的子类才能使用IntentService。

##### 原理

在实现上，IntentService封装了HandlerThread和Handler。当IntentService被第一次启动时，它的onCreate()方法会被调用，onCreat()方法会创建一个HandlerThread，然后使用它的Looper来构造一个Handler对象mServiceHandler，这样通过mServiceHandler发送的消息最终都会在HandlerThread中执行。

生成一个默认的且与主线程互相独立的工作者线程来执行所有传送至onStartCommand()方法的Intetnt。

生成一个工作队列来传送Intent对象给onHandleIntent()方法，同一时刻只传送一个Intent对象，这样一来，你就不必担心多线程的问题。在所有的请求(Intent)都被执行完以后会自动停止服务，所以，你不需要自己去调用stopSelf()方法来停止。

该服务提供了一个onBind()方法的默认实现，它返回null。

提供了一个onStartCommand()方法的默认实现，它将Intent先传送至工作队列，然后从工作队列中每次取出一个传送至onHandleIntent()方法，在该方法中对Intent做相应的处理。



##### 6. 为什么在mServiceHandler的handleMessage()回调方法中执行完onHandlerIntent()方法后要使用带参数的stopSelf()方法？

因为stopSel()方法会立即停止服务，而stopSelf（int startId）会等待所有的消息都处理完毕后才终止服务，一般来说，stopSelf(int startId)在尝试停止服务之前会判断最近启动服务的次数是否和startId相等，如果相等就立刻停止服务，不相等则不停止服务。



####7. Service的两种启动方法，有什么区别

1.在Context中通过`public boolean bindService(Intent service,ServiceConnection conn,int flags)` 方法来进行Service与Context的关联并启动，并且Service的生命周期依附于Context(**不求同时同分同秒生！但求同时同分同秒屎！！**)。

2.通过` public ComponentName startService(Intent service)`方法去启动一个Service，此时Service的生命周期与启动它的Context无关。

3.要注意的是，whatever，**都需要在xml里注册你的Service**，就像这样:

```java
<service
        android:name=".packnameName.youServiceName"
        android:enabled="true" />
```



####8. **onStartCommand 的几种模式**

- START_NOT_STICKY

  如果返回 START_NOT_STICKY，表示当 Service 运行的进程被 Android 系统强制杀掉之后，

  不会重新创建该 Service。当然如果在其被杀掉之后一段时间又调用了 startService，那么该

  Service 又将被实例化。那什么情境下返回该值比较恰当呢？

  如果我们某个 Service 执行的工作被中断几次无关紧要或者对 Android 内存紧张的情况下需

  要被杀掉且不会立即重新创建这种行为也可接受，那么我们便可将 onStartCommand 的返

  回值设置为 START_NOT_STICKY。

  举个例子，某个 Service 需要定时从服务器获取最新数据：通过一个定时器每隔指定的 N 分

  钟让定时器启动 Service 去获取服务端的最新数据。当执行到 Service 的 onStartCommand

  时，在该方法内再规划一个 N 分钟后的定时器用于再次启动该 Service 并开辟一个新的线程

  去执行网络操作。假设Service在从服务器获取最新数据的过程中被Android系统强制杀掉，

  Service 不会再重新创建，这也没关系，因为再过 N 分钟定时器就会再次启动该 Service 并重

  新获取数据。



- START_STICKY

  如果返回 START_STICKY，表示 Service 运行的进程被 Android 系统强制杀掉之后，Android

  系统会将该 Service 依然设置为 started 状态（即运行状态），但是不再保存 onStartCommand

  方法传入的 intent 对象，然后 Android 系统会尝试再次重新创建该 Service，并执行

  onStartCommand 回调方法，但是 onStartCommand 回调方法的 Intent 参数为 null，也就是

  onStartCommand 方法虽然会执行但是获取不到 intent 信息。如果你的 Service 可以在任意

  时刻运行或结束都没什么问题，而且不需要 intent 信息，那么就可以在 onStartCommand 方

  法中返回 START_STICKY，比如一个用来播放背景音乐功能的 Service 就适合返回该值。

  

- START_REDELIVER_INTENT

  如果返回 START_REDELIVER_INTENT，表示 Service 运行的进程被 Android 系统强制杀掉之

  后，与返回 START_STICKY 的情况类似，Android 系统会将再次重新创建该 Service，并执行

  onStartCommand 回调方法，但是不同的是，Android 系统会再次将 Service 在被杀掉之前

  最后一次传入 onStartCommand 方法中的 Intent 再次保留下来并再次传入到重新创建后的

  Service 的 onStartCommand 方法中，这样我们就能读取到 intent 参数。只要返回

  START_REDELIVER_INTENT，那么 onStartCommand 重的 intent 一定不是 null。如果我们的

  Service 需要依赖具体的 Intent 才能运行（需要从 Intent 中读取相关数据信息等），并且在强

  制销毁后有必要重新创建运行，那么这样的 Service 就适合返回 START_REDELIVER_INTENT



#### 9. **Service 和 IntentService 的区别？**

【参考】：

- 1、IntentService 是继承并处理异步请求的一个类，在 IntentService 内有一个工作

  线程来处理耗时操作，启动 IntentService 的方式和启动传统的 Service 一样，同时，当任务

  执行完后，IntentService 会自动停止，而不需要我们手动去控制或 stopSelf()。另外，可以启

  动 IntentService 多次 ，而 每 一个 耗时 操作 会以工 作 队列 的方 式 在 IntentService 的

  onHandleIntent 回调方法中执行，并且，每次只会执行一个工作线程，执行完第一个再执行

  第二个，以此类推。

- 2、子类需继承 IntentService 并且实现里面的 onHandlerIntent 抽象方法来处理 intent 类型

  的任务请求。

- 3、子类需要重写默认的构造方法，且在构造方法中调用父类带参数的构造方法。

- 4、IntentService 类内部利用 HandlerThread+Handler 构建了一个带有消息循环处理机制的

  后台工作线程，客户端只需调用 Content#startService(Intent)将 Intent 任务请求放入后台工

  作队列中，且客户端无需关注服务是否结束，非常适合一次性的后台任务。比如浏览器下载

  文件，退出当前浏览器之后，下载任务依然存在后台，直到下载文件结束，服务自动销毁。

  只要当前 IntentService 服务没有被销毁，客户端就可以同时投放多个 Intent 异步任务请求，

  IntentService 服务端这边是顺序执行当前后台工作队列中的 Intent 请求的，也就是每一时刻

  只能执行一个 Intent 请求，直到该 Intent 处理结束才处理下一个 Intent。因为 IntentService

  类内部利用 HandlerThread+Handler 构建的是一个单线程来处理异步任务。



#### 10 .**Service 和 Activity 通信**

【参考】

Activity 调用 bindService (Intent service, ServiceConnection conn, int flags)方法，得到 Service

对象的一个引用，这样 Activity 可以直接调用到 Service 中的方法，如果要主动通知 Activity，

我们可以利用回调方法

Service 向 Activity 发送消息，可以使用广播，当然 Activity 要注册相应的接收器。比如 Service

要向多个 Activity 发送同样的消息的话，用这种方法就更好