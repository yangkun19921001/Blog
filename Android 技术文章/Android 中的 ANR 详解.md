# 前言

关于ANR，以前只知道Activity、BroadCastReceiver、Service三种组件的ANR时限、一般采用哪些方式避免ANR、以及通过data/anr/traces.txt去分析ANR原因，感觉好像这就够用了。

但是，前几天看源码的时候，脑海里突然跳出一个问题：

ANR是怎么判断的5秒还是10秒？

这个问题迅速扩大为一连串问题：

ANR的时间定义在哪些文件里？

ANR是怎么计时的？

是谁在监控ANR？

所有的ANR都会弹窗吗？

traces.txt能记录多少内容？

ANR一定是app代码问题导致的吗？

# 前ANR机制的基本原理

任何功能都有个执行者，以及业务逻辑的实现原理，在ANR上，就是两个问题：

**1.ANR是谁做的**

ANR不可能是在应用层做的，有两个理由：

从能力上，发生ANR时，App自己已经死掉了，没有能力处理；

从安全上，App的安全事实上是不可控的，如果有恶意App故意不处理ANR，设备就废了。

所以，ANR的监控和处理，只能是在系统层做的。

系统层要做ANR的话，我们首先想到是在AMS，因为AMS管理着所有的组件，也只有AMS知道组件是什么时候启动的，以便判断是否触发了ANR。

不过，实际上，还有Activity Service，Input Manager Service这些服务，也参与了ANR的管理。

**2.ANR是怎么判断超时时间的**

这个问题，其实就是怎样定义超时时间、什么时候开始计时、以及如何计时的问题。

ANR超时时间的定义，是在执行者，也就是系统服务那里定义的，这个容易理解。

ANR从什么时候开始计时呢，在Android中，实际上是系统服务在控制每个组件的生命周期回调，所以可以在这个逻辑入口开始计时。

至于如何计时的问题，其实Android系统里已经有一个时间相对准确的机制，就是Handler机制，可以用Handler机制发送延时消息，如果超时了，就发出ANR，如果没有超时，就取消队列里的延时消息，这就解决了计时的问题。

这样看来，ANR的基本原理如下：

![img](https://mmbiz.qpic.cn/mmbiz_png/82jN7o40p6mXxfl38VhB2icDliaY8Fq9Wic9a9CiczkfstWafpVKnmXmyYVJGuyicUeMEc2wEcN0CP5ZkAmVeDq46TQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)



不过，这个机制并不完全，在判断Activity的InputDispatching超时的情况下，是InputDispatcher发现上一个事件没有处理完，新的事件又进来了，才会去走ANR。

# 各组件触发ANR的过程

会产生ANR的，包括Activity、Service、BroadCastReceiver、ContentProvider和Application，他们各自的ANR过程都有些不同，我们先从简单的看起。

**1.BroadCastReceiver**

时间定义

广播的超时时间是定义在AMS里：

BROADCAST_FG_TIMEOUT：10s

BROADCAST_BG_TIMEOUT：60s

前/后台广播是在发送Intent时，在intent.addFlag里定义的。

**触发时机**

当AMS处理广播时，会调用processNextBroadcast函数，这里面会处理并行广播和串行广播，其中，并行广播是单向通知，不需要等待反馈，所以并行广播没有ANR。

在处理串行广播时：

首先，判断是否已经有一个广播超时消息；然后，根据目标进程优先级，分别在前台队列和后台队列（超时时限不同）中排队处理；接下来，根据不同的队列，发出不同延时的ANR消息；如果处理及时，取消延时消息；如果处理超时，触发ANR；

**ANR处理**

广播的ANR处理相对简单，主要是再次判断是否超时、记录日志，记录ANR次数等。

然后就继续调用processNextBroadcast函数，处理下一条广播了。

**2.Service**

Service真正的管理者是ActiveServices，AMS虽然会去交互与通信，但在启动服务时，是交给ActiveServices去做的。

**时间定义**

服务的超时时间是定义在AS里：

SERVICE_TIMEOUT：20s；

SERVICE_BACKGROUND_TIMEOUT：200s；

在ActiveService执行startServiceLocked启动服务时，会判断启动服务的发起方的进程（Process.THREAD_GROUP_BG_NONINTERACTIVE），以便选择不同的超时时间。

**触发时机**

ActivityServices会调用realStartServiceLocked函数启动Service，最前面会先发送一个延迟消息，sendMessageAtTime(msg,time)；其中的time，是在最开始startServiceLocked函数中判断出前/后台进程，然后装在ServiceRecord中，一路传过来的。

如果Service操作执行完毕，会执行serviceDoneExecutingLocked，这里面会移除延迟消息。

如果Service执行超时，会执行mServices.serviceTimeout。

**ANR处理**

其实Service的ANR处理也相对简单，记录日志，清理anr活动等。

mServices.serviceTimeout((ProcessRecord)msg.obj)函数里，提供了进程信息。

**3.ContentProvider**

ContentProvider也是会ANR的，如果AMS中的ContentProviderClient在处理中超时，也可以启动ANR，超时时间和是否使用，由开发者决定：

CONTENT_PROVIDER_PUBLISH_TIMEOUT：10s

CONTENT_PROVIDER_RETAIN_TIME：20s

**4.Application**

Application的启动是执行在主线程的，attachBaseContext和onCreate等回调也是在主线程的，这里如果出现ANR，会影响到当前组件的运行。

**5.Activity**

Activity的ANR是相对最复杂的，也只有Activity中出现的ANR会弹出ANR提示框。

**InputDispatching**

Activity最主要的功能之一是交互，为了方便交互，Android中的InputDispatcher会发出操作事件，最终在Input Manager Service中发出事件，通过InputChannel，向Activity分发事件。

交互事件必须得到响应，如果不能及时处理，IMS就会报出ANR，交给AMS去弹出ANR提示框。

**KeyDispatching**

如果输入是个Key事件，会从IMS进入ActivityRecord.Token.keyDispatchingTimeOut，然后进入AMS处理，不同的是，在ActivityRecord中，会先截留一次Key的不响应，只有当Key连续第二次处理超时，才会弹出ANR提示框。

窗口焦点

Activity总是需要有一个当前窗口来响应事件的，但如果迟迟没有当前窗口（获得焦点），比如在Activity切换时，旧Activity已经onPause，新的Activity一直没有onResume，持续超过5秒，就会ANR。

App的生命周期太慢，或CPU资源不足，或WMS异常，都可能导致窗口焦点。

**时间定义**

在AMS中定义

KEY_DISPATCHING_TIMEOUT：5s

INSTRUMENTATION_KEY_DISPATCHING_TIMEOUT ：60s

**触发时机**

输入界面的触发时机，绝不是尽快提示ANR，而是尽量不提示ANR，因为ANR一旦提示出来，App一般也就关掉了。

对于InputDispatcher来说，如果有新的输入事件时，上一个输入事件还没有处理完，才会通知IMS去判断，是否需要处理ANR。

**ANR处理**

首先，写日志（data/anr/traces.txt）。

然后，会发出一个Message，弹出ANR提示框。

# ANR的处理和日志

ANR是在AMS的appNotResponding函数中处理的，主要是记录日志，和弹出提示。

**如何记录**

log日志记录在data/anr/traces.txt文件中，这个文件每次只记录最近的一次ANR，有可能记录失败。

文件内容包括dump栈，CPU负载，IO Wait等

**如何解读**

分析ANR，除了检查代码的生命周期函数是否有耗时操作，还可以分析traces日志，分析角度主要包括：

- 栈信息，一般可以知道在哪段代码附近发生了ANR，可能不是直接原因，但一般在问题点附近。
- CPU用量，看负载比例和平均负载，判断是不是有别的App占用了过多的CPU。
- IO Wait，看IOWait的占比是否很高，判断是否在等待IO。

# ANR的原因

如果从根源上划分的话，导致ANR的原因有如下几点：

- IO操作，如数据库、文件、网络
- CPU不足，一般是别的App占用了大量的CPU，导致App无法及时处理
- 硬件操作，如camera
- 线程问题，如主线程被join/sleep，或wait锁等导致超时
- service问题，如service忙导致超时无响应，或service binder的数量达到上限
- system server问题，如WatchDog发现ANR