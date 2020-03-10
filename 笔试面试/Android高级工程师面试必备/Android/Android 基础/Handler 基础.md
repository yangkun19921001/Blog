#### 1. Handler机制

Android消息循环流程图如下所示：

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200310210328.png)

主要涉及的角色如下所示：

- message：消息。
- MessageQueue：消息队列，负责消息的存储与管理，负责管理由 Handler 发送过来的 Message。读取会自动删除消息，单链表维护，插入和删除上有优势。在其next()方法中会无限循环，不断判断是否有消息，有就返回这条消息并移除。
- Looper：消息循环器，负责关联线程以及消息的分发，在该线程下从 MessageQueue获取 Message，分发给Handler，Looper创建的时候会创建一个 MessageQueue，调用loop()方法的时候消息循环开始，其中会不断调用messageQueue的next()方法，当有消息就处理，否则阻塞在messageQueue的next()方法中。当Looper的quit()被调用的时候会调用messageQueue的quit()，此时next()会返回null，然后loop()方法也就跟着退出。
- Handler：消息处理器，负责发送并处理消息，面向开发者，提供 API，并隐藏背后实现的细节。

整个消息的循环流程还是比较清晰的，具体说来：

- 1、Handler通过sendMessage()发送消息Message到消息队列MessageQueue。
- 2、Looper通过loop()不断提取触发条件的Message，并将Message交给对应的target handler来处理。
- 3、target handler调用自身的handleMessage()方法来处理Message。

事实上，在整个消息循环的流程中，并不只有Java层参与，很多重要的工作都是在C++层来完成的。我们来看下这些类的调用关系。

注：虚线表示关联关系，实线表示调用关系。

在这些类中MessageQueue是Java层与C++层维系的桥梁，MessageQueue与Looper相关功能都通过MessageQueue的Native方法来完成，而其他虚线连接的类只有关联关系，并没有直接调用的关系，它们发生关联的桥梁是MessageQueue。

##### 总结

- Handler 发送的消息由 MessageQueue 存储管理，并由 Looper 负责回调消息到 handleMessage()。
- 线程的转换由 Looper 完成，handleMessage() 所在线程由 Looper.loop() 调用者所在线程决定。

##### Handler 引起的内存泄露原因以及最佳解决方案

Handler 允许我们发送延时消息，如果在延时期间用户关闭了 Activity，那么该 Activity 会泄露。 这个泄露是因为 Message 会持有 Handler，而又因为 Java 的特性，内部类会持有外部类，使得 Activity 会被 Handler 持有，这样最终就导致 Activity 泄露。

解决：将 Handler 定义成静态的内部类，在内部持有 Activity 的弱引用，并在Acitivity的onDestroy()中调用handler.removeCallbacksAndMessages(null)及时移除所有消息。

##### 为什么我们能在主线程直接使用 Handler，而不需要创建 Looper ？

通常我们认为 ActivityThread 就是主线程。事实上它并不是一个线程，而是主线程操作的管理者。在 ActivityThread.main() 方法中调用了 Looper.prepareMainLooper() 方法创建了 主线程的 Looper ,并且调用了 loop() 方法，所以我们就可以直接使用 Handler 了。

因此我们可以利用 Callback 这个拦截机制来拦截 Handler 的消息。如大部分插件化框架中Hook ActivityThread.mH 的处理。

##### 主线程的 Looper 不允许退出

主线程不允许退出，退出就意味 APP 要挂。

##### Handler 里藏着的 Callback 能干什么？

Handler.Callback 有优先处理消息的权利 ，当一条消息被 Callback 处理并拦截（返回 true），那么 Handler 的 handleMessage(msg) 方法就不会被调用了；如果 Callback 处理了消息，但是并没有拦截，那么就意味着一个消息可以同时被 Callback 以及 Handler 处理。

##### 创建 Message 实例的最佳方式

为了节省开销，Android 给 Message 设计了回收机制，所以我们在使用的时候尽量复用 Message ，减少内存消耗：

- 通过 Message 的静态方法 Message.obtain()；
- 通过 Handler 的公有方法 handler.obtainMessage()。

##### 子线程里弹 Toast 的正确姿势

本质上是因为 Toast 的实现依赖于 Handler，按子线程使用 Handler 的要求修改即可，同理的还有 Dialog。

##### 妙用 Looper 机制

- 将 Runnable post 到主线程执行；
- 利用 Looper 判断当前线程是否是主线程。

##### 主线程的死循环一直运行是不是特别消耗CPU资源呢？

并不是，这里就涉及到Linux pipe/epoll机制，简单说就是在主线程的MessageQueue没有消息时，便阻塞在loop的queue.next()中的nativePollOnce()方法里，此时主线程会释放CPU资源进入休眠状态，直到下个消息到达或者有事务发生，通过往pipe管道写端写入数据来唤醒主线程工作。这里采用的epoll机制，是一种IO多路复用机制，可以同时监控多个描述符，当某个描述符就绪(读或写就绪)，则立刻通知相应程序进行读或写操作，本质是同步I/O，即读写是阻塞的。所以说，主线程大多数时候都是处于休眠状态，并不会消耗大量CPU资源。

##### handler postDelay这个延迟是怎么实现的？

handler.postDelay并不是先等待一定的时间再放入到MessageQueue中，而是直接进入MessageQueue，以MessageQueue的时间顺序排列和唤醒的方式结合实现的。

##### 如何保证在msg.postDelay情况下保证消息次序？



#### 2. Handler、Thread和HandlerThread的差别

1、Handler：在android中负责发送和处理消息，通过它可以实现其他支线线程与主线程之间的消息通讯。

2、Thread：Java进程中执行运算的最小单位，亦即执行处理机调度的基本单位。某一进程中一路单独运行的程序。

3、HandlerThread：一个继承自Thread的类HandlerThread，Android中没有对Java中的Thread进行任何封装，而是提供了一个继承自Thread的类HandlerThread类，这个类对Java的Thread做了很多便利的封装。HandlerThread继承于Thread，所以它本质就是个Thread。与普通Thread的差别就在于，它在内部直接实现了Looper的实现，这是Handler消息机制必不可少的。有了自己的looper，可以让我们在自己的线程中分发和处理消息。如果不用HandlerThread的话，需要手动去调用Looper.prepare()和Looper.loop()这些方法。



#### 3. HandlerThread

1、HandlerThread原理

当系统有多个耗时任务需要执行时，每个任务都会开启个新线程去执行耗时任务，这样会导致系统多次创建和销毁线程，从而影响性能。为了解决这一问题，Google提出了HandlerThread，HandlerThread本质上是一个线程类，它继承了Thread。HandlerThread有自己的内部Looper对象，可以进行loopr循环。通过获取HandlerThread的looper对象传递给Handler对象，可以在handleMessage()方法中执行异步任务。创建HandlerThread后必须先调用HandlerThread.start()方法，Thread会先调用run方法，创建Looper对象。当有耗时任务进入队列时，则不需要开启新线程，在原有的线程中执行耗时任务即可，否则线程阻塞。它在Android中的一个具体的使用场景是IntentService。由于HanlderThread的run()方法是一个无限循环，因此当明确不需要再使用HandlerThread时，可以通过它的quit或者quitSafely方法来终止线程的执行。

2、HanlderThread的优缺点

- HandlerThread优点是异步不会堵塞，减少对性能的消耗。
- HandlerThread缺点是不能同时继续进行多任务处理，要等待进行处理，处理效率较低。
- HandlerThread与线程池不同，HandlerThread是一个串队列，背后只有一个线程。



#### 4. **Handler 如何防止内存泄漏？**

除了写弱引用这个方法后，还有一个就是 handler.removeCallbacksAndMessages(null);，就

是移除所有的消息和回调，简单一句话就是清空了消息队列。注意，不要以为你 post 的是

个 Runnable 或者只是 sendEmptyMessage。你可以看一下源码，在 handler 里面都是会把

这些转成正统的 Message，放入消息队列里面，所以清空队列就意味着这个 Handler 直接被

打成原型了，当然也就可以回收了。



####5. 主线程的死循环是否一致耗费 CPU 资源？

【参考】

在主线程使用 Looper.loop 可以保证主线程一直在运行，事实上，在 Looper.loop 死循环之

前，已经创建了一个 Binder 线程: thread.attach 会建立 Binder 通道，创建新线程。attach(false)会创建一个 ApplicaitonThread的 Binder 线程，用于接受 AMS 发来的消息，该 Binder 线程通过 ActivityThread 的 H 类型Handler 将消息发送给主线程。ActivityThread 并不是线程类，只是它运行在主线程。Handler 底层采用 Linux 的 pipe/epoll 机制，MessageQueue 没有消息的时候，便阻塞在

Looper.mQueue.next 方法中，此时主线程会释放 CPU 资源进入休眠，直到下个事件到达，当有新消息的时候，通过往 pipe 管道写数据来唤醒主线程工作。所以主线程大多数时候处于休眠状态，不会阻塞。



#### 6. **Handler 主线程向子线程发消息**

- 【参考】https://www.jianshu.com/p/34fb9f9815f4