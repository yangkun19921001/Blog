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

