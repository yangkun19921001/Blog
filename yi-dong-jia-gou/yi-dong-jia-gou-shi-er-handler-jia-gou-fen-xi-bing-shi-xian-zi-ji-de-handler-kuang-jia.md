# 移动架构师 \(二\) Handler 架构分析并实现自己的 Handler 框架

## Android 中消息机制

Android 的消息机制主要指 Handler 的运行机制，先来看下 Handler 的一张运行架构图来对 Handler 有个大概的了解。

`Handler 消息机制图:`

[![Handler-.png](https://s3.ax2x.com/2019/07/18/Handler-.png)](https://free.imgsha.com/i/jjWji)

`Handler 类图:`

[![Handler.png](https://s3.ax2x.com/2019/07/18/Handler.png)](https://free.imgsha.com/i/jjAan)

`以上图的解释:`

1. 以 Handler 的 sendMessage \(\) 函数为例，当发送一个 message 后，会将此消息加入消息队列 MessageQueue 中。
2. Looper 负责去遍历消息队列并且将队列中的消息分发非对应的 Handler 进行处理。
3. 在 Handler 的 handlerMessage 方法中处理该消息，这就完成了一个消息的发送和处理过程。

这里从图中可以看到 Android 中 Handler 消息机制最重要的四个对象分别为 Handler 、Message 、MessageQueue 、Looper。

## ThreadLocal 的工作原理

ThreadLocal 是一个线程内部的数据存储类，通过它可以在指定的线程中存储数据, 数据存储以后，只有再指定线程中可以获取到存储的数据，对于其它线程来说则是无法获取到存储的对象。下面就是我们验证 ThreadLocal 存取是否是按照刚刚那样所说。

* 子线程中存，子线程中取

  ```java
           // 代码测试       
           new Thread("thread-1"){
              @Override
              public void run() {
                  ThreadLocal<String> mThread_A = new ThreadLocal();
                  mThread_A.set("thread-1");
                  System.out.println("mThread_A :"+mThread_A.get());

              }
          }.start();

          //打印结果
          mThread_A :thread-1
  ```

* 主线程中存，子线程取

  ```java
              //主线程中存，子线程取    
              final ThreadLocal<String> mThread_B = new ThreadLocal();   
              mThread_B.set("thread_B");      
              new Thread(){
              @Override
              public void run() {
                  System.out.println("mThread_B :"+mThread_B.get());
              }
          }.start();

              //打印结果
          mThread_B :null
  ```

* 主线程存，主线程取

  ```java
                  //主线程存，主线程取
          ThreadLocal<String> mThread_C = new ThreadLocal();
          mThread_C.set("thread_C");
          System.out.println("mThread_C :"+mThread_C.get());

                  //打印结果
                  mThread_C :thread_C
  ```

结果是不是跟上面我们所说的答案一样，那么为什么会是这样勒？现在我们带着问题去看下 `ThreadLocal` 源码到底做了什么？

[![ThreadLocal-.jpg](https://s3.ax2x.com/2019/07/18/ThreadLocal-.jpg)](https://free.imgsha.com/i/jj7JJ)

从上图可以 ThreadLocal 主要函数组成部分，这里我们用到了 set , get 那么就从 set , get 入手吧。

`ThreadLocal set(T):`

[![ThreadLocal-set.jpg](https://s3.ax2x.com/2019/07/18/ThreadLocal-set.jpg)](https://free.imgsha.com/i/jjKeO)

​ （图 1）

[![ThreadLocal-getMap.jpg](https://s3.ax2x.com/2019/07/18/ThreadLocal-getMap.jpg)](https://free.imgsha.com/i/jjS2e)

​ （图 2）

[![ThreadLocal-createMap.jpg](https://s3.ax2x.com/2019/07/18/ThreadLocal-createMap.jpg)](https://free.imgsha.com/i/jjBf8)

​ （图 3）

[![ThreadLocal-ThreadLocalMap-createMap-set.jpg](https://s3.ax2x.com/2019/07/18/ThreadLocal-ThreadLocalMap-createMap-set.jpg)](https://free.imgsha.com/i/jjUVx)

​ \(图 四\)

从 \(图一\) 得知 set 函数里面获取了当前线程，这里我们主要看下 getMap\(currentThread\) 主要干什么了？

从 \(图二\) 中我们得知 getMap 主要是从当前线程拿到 ThreadLocalMap 这个实例对象，如果当前线程的 ThreadLocalMap 为 NULL ，那么就 createMap ，这里的 ThreadLocalMap 可以暂时理解为一个集合对象就行了，它 \(图四\) 底层是一个数组实现的添加数据。

`ThreadLocal T get():`

[![ThreadLocal-get.jpg](https://s3.ax2x.com/2019/07/18/ThreadLocal-get.jpg)](https://free.imgsha.com/i/jjVGk)

这里的 get\(\) 函数其实已经能够说明为什么在不同线程存储的数据拿不到了。因为存储是在当前线程存储的，取数据也是在当前所在的线程取得，所以不可能拿到的。带着问题我们找到了答案。是不是有点小激动呀？\(_^▽^_\)

## Android 消息机制源码分析

这里我们就直接看源码，一下是我看源码的流程。

1. 创建全局唯一的 Looper 对象和全局唯一 MessageQueue 消息对象。

   [![Handler--Looper-MessageQueue.png](https://s3.ax2x.com/2019/07/18/Handler--Looper-MessageQueue.png)](https://free.imgsha.com/i/jjhRZ)

2. Activity 中创建 Handler。

   [![Handler-Activity-create.png](https://s3.ax2x.com/2019/07/18/Handler-Activity-create.png)](https://free.imgsha.com/i/jjr7d)

3. Handler sendMessage 发送一个消息的走向。

   [![Handler-message-.png](https://s3.ax2x.com/2019/07/18/Handler-message-.png)](https://free.imgsha.com/i/jj3m5)

4. Handler 消息处理。

   [![Handler-06c719af736b41fb.png](https://s3.ax2x.com/2019/07/18/Handler-06c719af736b41fb.png)](https://free.imgsha.com/i/jjHJz)

## 消息阻塞和延时

### 阻塞和延时

Looper 的阻塞主要是靠 MessageQueue 来实现的，在 MessageQueue -&gt; next\(\) nativePollOnce\(ptr, nextPollTimeoutMillis\) 进行阻塞 , 在 MessageQueue -&gt; enqueueMessage\(\) -&gt; nativeWake\(mPtr\) 进行唤醒。主要依赖 native 层的 looper epoll 进制进行的。

![f3da65a44123337f1b5b586a02aad8eb.png](https://s3.ax2x.com/2019/07/18/f3da65a44123337f1b5b586a02aad8eb.png)

阻塞和延时，主要是 next\(\) 的 nativePollOnce\(ptr , nextPollTimeoutMillis\) 调用 native 方法来操作管道，由 nextPollTimeoutMillis 决定是否需要阻塞 , nextPollTimeoutMilis 为 0 的时候表示不阻塞 , 为 -1 的时候表示一直阻塞直到被唤醒，其它时间表示延时。

### 唤醒

主要是指 enqueueMessage \(\) @MessageQueue 进行唤醒。

[![Handler-.jpg](https://s3.ax2x.com/2019/07/19/Handler-.jpg)](https://free.imgsha.com/i/jjz7L)

### 阻塞 -&gt; 唤醒 消息切换

[![Handler-f6fe406dad09b444.jpg](https://s3.ax2x.com/2019/07/19/Handler-f6fe406dad09b444.jpg)](https://free.imgsha.com/i/jjsEV)

### 总结

简单的理解阻塞和唤醒就是在主线程的 MessageQueue 没有消息时，便阻塞在 Loop 的 queue.next\(\) 中的 nativePollOnce\(\) 方法里面，此时主线程会释放 CPU 资源进入休眠状态，直到下一个消息到达或者有消息的时候才触发，通过往 pipe 管道写端写入数据来唤醒主线程工作。

这里采用的 epoll 机制，是一种 IO 多路复用机制，可以同时监控多个描述符，当某个描述符就绪 \(读或写就绪\) , 则立刻通知相应程序进行读或者写操作，本质同步 I/O , 即读写是阻塞的。所以说，主线程大多数时候都是处于休眠状态，并不会消耗大量的 CPU 资源。

## 延时入队

[![Handler-c4d53e3afdc11095.jpg](https://s3.ax2x.com/2019/07/19/Handler-c4d53e3afdc11095.jpg)](https://free.imgsha.com/i/jjtp0)

主要指 enqueueMessage\(\) 消息入队列（Message 单链表），上图代码对 message 对象池重新排序，遵循规则 \( when 从小到大\) 。

此处 for 死循环退出情况分为两种

1. p == null 表示对象池中已经运行到了最后一个，无需要再循环。
2. 碰到下一个消息 when 小于前一个，立马退出循环 \(不管对象池中所有 message 是否遍历完\) 进行重新排序。 

好了，到了这里 Handler 源码分析算是告一段落了，下面我们来看下面试中容易被问起的问题。

## 常见问题分析

### 为什么不能在子线程中更新 UI ，根本原因是什么？

![checkThread.jpg](https://s3.ax2x.com/2019/07/19/checkThread.jpg)

mThread 是主线程，这里会检查当前线程是否是主线程，那么为什么没有在 onCreate 里面没有进行这个检查呢？这个问题原因出现在 Activity 的生命周期中 , 在 onCreate 方法中， UI 处于创建过程，对用户来说界面还不可见，直到 onStart 方法后界面可见了，再到 onResume 方法后页面可以交互，从某种程度来讲, 在 onCreate 方法中不能算是更新 UI，只能说是配置 UI，或者是设置 UI 属性。 这个时候不会调用到 ViewRootImpl.checkThread \(\) , 因为 ViewRootImpl 没有创建。 而在 onResume 方法后， ViewRootImpl 才被创建。 这个时候去交户界面才算是更新 UI。

setContentView 知识建立了 View 树，并没有进行渲染工作 \(其实真正的渲染工作实在 onResume 之后\)。也正是建立了 View 树，因此我们可以通过 findViewById\(\) 来获取到 View 对象，但是由于并没有进行渲染视图的工作，也就是没有执行 ViewRootImpl.performTransversal。同样 View 中也不会执行 onMeasure \(\), 如果在 onResume\(\) 方法里直接获取 View.getHeight\(\) / View.getWidth \(\) 得到的结果总是 0。

### 为什么主线程用 Looper 死循环不会引发 ANR 异常？

简单来说就是在主线程的 MessageQueue 没有消息时，便阻塞在 loop 的 queue.next\(\) 中的 nativePollOnce\(\) 方法，此时主线程会释放 CPU 资源进入休眠状态，直到下个消息到达或者有事务发生，通过往 pipe 管道写入数据来唤醒主线程工作。这里采用的是 epoll 机制，是一种 IO 多路复用机制。

### 为什么 Handler 构造方法里面的 Looper 不是直接 new ?

如果在 Handler 构造方法里面直接 new Looper\(\), 可能是无法保证 Looper 唯一，只有用 Looper.prepare\(\) 才能保证唯一性，具体可以看 prepare 方法。

### MessageQueue 为什么要放在 Looper 私有构造方法初始化？

因为一个线程只绑定一个 Looper ,所以在 Looper 构造方法里面初始化就可以保证 mQueue 也是唯一的 Thread 对应一个 Looper 对应一个 mQueue。

### Handler . post 的逻辑在哪个线程执行的？是由 Looper 所在线程还是 Handler 所在线程决定的？

由 Looper 所在线程决定的。逻辑是在 Looper.loop\(\) 方法中，从 MessageQueue 中拿出 message ,并且执行其逻辑，这里在 Looper 中执行的，因此有 Looper 所在线程决定。

### MessageQueue.next\(\) 会因为发现了延迟消息，而进行阻塞。那么为什么后面加入的非延迟消息没有被阻塞呢？

可以参考 消息阻塞和延时 -&gt; 唤醒

### Handler 的 dispatchMessage \(\) 分发消息的处理流程？

[![handlerMessage-.jpg](https://s3.ax2x.com/2019/07/19/handlerMessage-.jpg)](https://free.imgsha.com/i/jjEdS)

1. 属于 Runnable 接口。
2. 通过下面代码形式调用。

   ```java
       private static Handler mHandler = new Handler(new Handler.Callback() {
           @Override
           public boolean handleMessage(Message msg) {
               return true;
           }
       });
   ```

3. 如果第一步，第二部都不满足直接走下面 handlerMessage 参考下面代码实现方式

   ```java
       private static Handler mHandler = new Handler(){
           @Override
           public void handleMessage(Message msg) {
               super.handleMessage(msg);
           }
       };
   ```

也可以通过 debug 方式来具体看 dispatchMessage 执行状态。

## 实现自己的 Handler 简单架构

主要实现测试代码

![Handler-34a4a4e9e149d8c4.jpg](https://s3.ax2x.com/2019/07/19/Handler-34a4a4e9e149d8c4.jpg)

[代码传送阵](https://github.com/yangkun19921001/CustomHandler)

