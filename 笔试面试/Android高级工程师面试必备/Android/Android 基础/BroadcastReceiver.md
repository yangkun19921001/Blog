### 广播相关面试题

#### 1. 程序A能否接收到程序B的广播？

能，使用全局的BroadCastRecevier能进行跨进程通信，但是注意它只能被动接收广播。此外，LocalBroadCastRecevier只限于本进程的广播间通信。



#### 2. 广播传输的数据是否有限制，是多少，为什么要限制？

Intent在传递数据时是有大小限制的，大约限制在1MB之内，你用Intent传递数据，实际上走的是跨进程通信（IPC），跨进程通信需要把数据从内核copy到进程中，每一个进程有一个接收内核数据的缓冲区，默认是1M；如果一次传递的数据超过限制，就会出现异常。

不同厂商表现不一样有可能是厂商修改了此限制的大小，也可能同样的对象在不同的机器上大小不一样。

传递大数据，不应该用Intent；考虑使用ContentProvider或者直接匿名共享内存。简单情况下可以考虑分段传输。



#### 3. 广播注册一般有几种，各有什么优缺点？

第一种是常驻型(静态注册)：当应用程序关闭后如果有信息广播来，程序也会被系统调用，自己运行。

第二种不常驻(动态注册)：广播会跟随程序的生命周期。

动态注册

优点： 在android的广播机制中，动态注册优先级高于静态注册优先级，因此在必要情况下，是需要动态注册广播接收者的。

缺点： 当用来注册的 Activity 关掉后，广播也就失效了。

静态注册

优点： 无需担忧广播接收器是否被关闭，只要设备是开启状态，广播接收器就是打开着的。



#### 4. 如何通过广播拦截和abort一条短信？

可以监听这条信号，在传递给真正的接收程序时，我们将自定义的广播接收程序的优先级大于它，并且取消广播的传播，这样就可以实现拦截短信的功能了。



#### 5. BroadcastReceiver，LocalBroadcastReceiver 区别？

##### 1、应用场景

1、BroadcastReceiver用于应用之间的传递消息；

2、而LocalBroadcastManager用于应用内部传递消息，比broadcastReceiver更加高效。

##### 2、安全

1、BroadcastReceiver使用的Content API，所以本质上它是跨应用的，所以在使用它时必须要考虑到不要被别的应用滥用；

2、LocalBroadcastManager不需要考虑安全问题，因为它只在应用内部有效。

##### 3、原理方面

(1) 与BroadcastReceiver是以 Binder 通讯方式为底层实现的机制不同，LocalBroadcastManager 的核心实现实际还是 Handler，只是利用到了 IntentFilter 的 match 功能，至于 BroadcastReceiver 换成其他接口也无所谓，顺便利用了现成的类和概念而已。

(2) LocalBroadcastManager因为是 Handler 实现的应用内的通信，自然安全性更好，效率更高。



#### 6. 如何让程序自动启动？

定义一个Braodcastreceiver，action为BOOT——COMPLETE，接受到广播后启动程序。