EventBus 我相信大家不会很默认，应该也都在项目中使用过，虽然 EventBus 在项目中不便于管理，发射出去的消息不便于跟踪或者阅读，但是不可否认它是一个优秀的开源项目，还是值得我们大家学习的，我个人感觉唯一不足的就是 EventBus 功能上不能根据 TAG 来进行发射和接收消息，只能通过注解 +  class 类型进行找消息。那么我们自己可以实现这个功能吗？不可否认，当然可以! 想要实现这个功能，我们先大概简要的了解下 EventBus 使用及源码是怎么实现的。

## EventBus 简单使用

EventBus 可以代替 Android 传统的 Intent, Handler, Broadcast 或接口函数, 在 Fragment, Activity, Service 线程间进行数据传递。

### 添加 EventBus 到项目中

```java
implementation 'org.greenrobot:eventbus:3.1.1'
```

### register

```java
EventBus.getDefault().register(this);
```

###注解实现接收的 Event

```java
    @Subscribe(threadMode = ThreadMode.MAIN)
    public void receive(String event){
        Log.d(TAG,"接收到 EventBus post message:" + event);
    }
```

### 发射数据

```java
EventBus.getDefault().post("发射一个测试消息");
```

### 注销注册的事件

```java
EventBus.getDefault().unregister(this);
```

这里就简单介绍下 EventBus 使用，想详细了解的可以看 [EventBus GitHub](https://github.com/greenrobot/EventBus)

## EventBus 3.1.1 源码分析 

上面小节咱们学习了 EventBus 的简单使用，那么我们就根据上面使用到的来进行源码分析。

### register 

`流程图:`

![EventBus-register.png](https://s3.ax2x.com/2019/07/27/EventBus-register.png)

`register 代码:`

```java
		/**
		*
		*EventBus register
		*/
    public void register(Object subscriber) {
      //1. 拿到当前注册 class
        Class<?> subscriberClass = subscriber.getClass();
      //2. 查找当前 class 类中所有订阅者的方法
        List<SubscriberMethod> subscriberMethods = subscriberMethodFinder.findSubscriberMethods(subscriberClass);
        synchronized (this) {
            for (SubscriberMethod subscriberMethod : subscriberMethods) {
              //3. 
                subscribe(subscriber, subscriberMethod);
            }
        }
    }
```

`subscribe（x,x）代码：`

```java
    //必须加锁调用
    private void subscribe(Object subscriber, SubscriberMethod subscriberMethod) {
      //拿到订阅者参数类型
        Class<?> eventType = subscriberMethod.eventType;
        Subscription newSubscription = new Subscription(subscriber, subscriberMethod);
      //根据参数类型，拿到当前所有订阅者
        CopyOnWriteArrayList<Subscription> subscriptions = subscriptionsByEventType.get(eventType);
      //4. 如果没有拿到，则存进去缓存中
        if (subscriptions == null) {
            subscriptions = new CopyOnWriteArrayList<>();
            subscriptionsByEventType.put(eventType, subscriptions);
        } else {
          //如果已经存在相同类型的注册事件，就抛出异常
            if (subscriptions.contains(newSubscription)) {
                throw new EventBusException("Subscriber " + subscriber.getClass() + " already registered to event "
                        + eventType);
            }
        }

       ......
    }
```

1. 拿到当前传入进来的 this 对象。

2. 查找当前 this 类中所有订阅的函数。

3. subscriptionsByEventType 完成数据初始化。

   ```
   subscriptionsByEventType = new HashMap();
   ```

   // 参考上图注释 4 ，根据参数类型存储订阅者和订阅方法


### post 

`流程图:`



![EventBus-post.png](https://s3.ax2x.com/2019/07/27/EventBus-post.png)

`代码`



```java
 /** 发送事件*/
    public void post(Object event) {
      //在当前线程中取出变量数据
        PostingThreadState postingState = currentPostingThreadState.get();
      //将需要发送的数据添加进当前线程的队列中
        List<Object> eventQueue = postingState.eventQueue;
        eventQueue.add(event);

        if (!postingState.isPosting) {
            postingState.isMainThread = isMainThread();
            postingState.isPosting = true;
            if (postingState.canceled) {
                throw new EventBusException("Internal error. Abort state was not reset");
            }
            try {
                while (!eventQueue.isEmpty()) {
                  //开启取出数据
                    postSingleEvent(eventQueue.remove(0), postingState);
                }
            } finally {
                postingState.isPosting = false;
                postingState.isMainThread = false;
            }
        }
    }
```

```java
    private void postSingleEvent(Object event, PostingThreadState postingState) throws Error {
        Class<?> eventClass = event.getClass();
        boolean subscriptionFound = false;
        if (eventInheritance) {
          //查找所有的事件类型
            List<Class<?>> eventTypes = lookupAllEventTypes(eventClass);
            int countTypes = eventTypes.size();
            for (int h = 0; h < countTypes; h++) {
                Class<?> clazz = eventTypes.get(h);
                subscriptionFound |= postSingleEventForEventType(event, postingState, clazz);
            }
        } else {
          //发送事件
            subscriptionFound = postSingleEventForEventType(event, postingState, eventClass);
        }
        if (!subscriptionFound) {
            if (logNoSubscriberMessages) {
                logger.log(Level.FINE, "No subscribers registered for event " + eventClass);
            }
            if (sendNoSubscriberEvent && eventClass != NoSubscriberEvent.class &&
                    eventClass != SubscriberExceptionEvent.class) {
                post(new NoSubscriberEvent(this, event));
            }
        }
    }
```

```java
    private boolean postSingleEventForEventType(Object event, PostingThreadState postingState, Class<?> eventClass) {
        CopyOnWriteArrayList<Subscription> subscriptions;
        synchronized (this) {
          //这里的容器就是 register 的时候添加进行去的，现在拿出来
            subscriptions = subscriptionsByEventType.get(eventClass);
        }
        if (subscriptions != null && !subscriptions.isEmpty()) {
            for (Subscription subscription : subscriptions) {
                postingState.event = event;
                postingState.subscription = subscription;
                boolean aborted = false;
                try {
                  //发送到订阅者哪里去
                    postToSubscription(subscription, event, postingState.isMainThread);
                    aborted = postingState.canceled;
                } finally {
                    postingState.event = null;
                    postingState.subscription = null;
                    postingState.canceled = false;
                }
                if (aborted) {
                    break;
                }
            }
            return true;
        }
        return false;
    }
```

```java
    private void postToSubscription(Subscription subscription, Object event, boolean isMainThread) {
      //根据订阅者 threadMode 来进行发送
        switch (subscription.subscriberMethod.threadMode) {
            case POSTING:
            //通过反射发送
                invokeSubscriber(subscription, event);
                break;
            case MAIN:
            //如果是主线程直接在当前线程发送
                if (isMainThread) {
                    invokeSubscriber(subscription, event);
                } else {
                  //开启一个子线程发送
                    mainThreadPoster.enqueue(subscription, event);
                }
                break;
            case MAIN_ORDERED:
                if (mainThreadPoster != null) {
                    mainThreadPoster.enqueue(subscription, event);
                } else {
                    // temporary: technically not correct as poster not decoupled from subscriber
                    invokeSubscriber(subscription, event);
                }
                break;
            case BACKGROUND:
                if (isMainThread) {
                    backgroundPoster.enqueue(subscription, event);
                } else {
                    invokeSubscriber(subscription, event);
                }
                break;
            case ASYNC:
                asyncPoster.enqueue(subscription, event);
                break;
            default:
                throw new IllegalStateException("Unknown thread mode: " + subscription.subscriberMethod.threadMode);
        }
    }
```

`步骤`

1. post
2. 获取事件类型
3. 根据类型，获取订阅者和订阅方法
4. 根据订阅者的 threadMode 来判断线程
5. 通过反射直接调用订阅者的订阅方法来完成本次通信息

### Subscribe

这里是订阅者的意思，通过自定义注解实现

```java
@Documented
@Retention(RetentionPolicy.RUNTIME) //注解会在class字节码文件中存在，在运行时可以通过反射获取到
@Target({ElementType.METHOD}) //只能在方法上声明
public @interface Subscribe {
    ThreadMode threadMode() default ThreadMode.POSTING; //默认在 post 线程

    boolean sticky() default false; //默认不是粘性事件

    int priority() default 0; //线程优先级默认
}
```



### threadMode

```java
package org.greenrobot.eventbus;

public enum ThreadMode {
    POSTING, // post 线程
    MAIN,//指定主线程
    MAIN_ORDERED,
    BACKGROUND,//后台进行
    ASYNC;//异步

    private ThreadMode() {
    }
}
```

### unregister

`流程:`

![EventBus-unRegister.png](https://s3.ax2x.com/2019/07/27/EventBus-unRegister.png)

### EventBus 源码总结

到这里我们就简单的分析了 注册 - > 订阅 - > 发送 - >接收事件 简单的流程就是这样了，如果想更深入的话，建议下载源码来看 [EventBus GitHub](https://github.com/greenrobot/EventBus)  架构方面还是要注重基础知识，比如 注解 + 反射 + 设计模式 (设计模式的话建议去看 《Android 源码设计模式》一书 )，现在开源项目几乎离不开这几项技术。只有我们掌握了基础 + 实现原理。我们模仿着也能写出来同样的项目。

下面我们就简单模仿下 EventBus 原理，实现自己的 EventBus 框架。

## YEventBus 根据 TAG 实现接收消息架构实现

说明一点，这里我们还是根据 EventBus 的核心原理实现，并不会有 EventBus 那么多功能，我们只是学习 EventBus 原理的同时，能根据它的原理，自己写一套简单的 EventBus 架构。

`最后一共差不多 300 行代码实现根据 TAG 发送/接收事件，下面是效果图：`

![](https://ws3.sinaimg.cn/large/005BYqpgly1g5eo9hzc1cg30sg1f2b2a.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn)

以下我就直接贴代码了 每一步代码都有详细的注释，相信应该不难理解。

## 使用方式

- 添加依赖

  ```java
  	allprojects {
  		repositories {
  			...
  			maven { url 'https://jitpack.io' }
  		}
  	}
  
  	dependencies {
  	        implementation 'com.github.yangkun19921001:YEventBus:Tag'
  	}
  ```

- 注册事件

  ```
   //开始注册事件。模仿 EventBus
   YEventBus.getDefault().register(this);
  ```

- 订阅消息

  ```java
      /**
       * 这里是自定义的注册，最后通过反射来获取当前类里面的订阅者
       *
       * @param meg
       */
  @YSubscribe(threadMode = YThreadMode.MAIN, tag = Constants.TAG_1)
      public void onEvent(String meg) {
          Toast.makeText(getApplicationContext(), "收到：" + meg, Toast.LENGTH_SHORT).show();
      」
  ```

- 发送消息

  ```java
  YEventBus.getDefault().post(Constants.TAG_1, "发送 TAG 为 1 的消息");
  ```

### register

```java
 /**
     * 注册方法
     */
    public void register(Object subscriber) {
        //拿到当前注册的所有的订阅者
        List<YSubscribleMethod> ySubscribleMethods = mChacheSubscribleMethod.get(subscriber);
        //如果订阅者已经注册了 就不需要再注册了
        if (ySubscribleMethods == null) {
            //开始反射找到当前类的订阅者
            ySubscribleMethods = getSubscribleMethods(subscriber);
            //注册了就存在缓存中，避免多次注册
            mChacheSubscribleMethod.put(subscriber, ySubscribleMethods);
        }
    }

    /**
     * 拿到当前注册的所有订阅者
     *
     * @param subscriber
     * @return
     */
    private List<YSubscribleMethod> getSubscribleMethods(Object subscriber) {
        //拿到注册的 class
        Class<?> subClass = subscriber.getClass();
        //定义一个容器，用来装订阅者
        List<YSubscribleMethod> ySubscribleMethodList = new ArrayList<>();
        //开始循环找到
        while (subClass != null) {
            //1. 开始进行筛选，如果是系统的就不需要进行下去
            String subClassName = subClass.getName();
            if (subClassName.startsWith(Constants.JAVA) ||
                    subClassName.startsWith(Constants.JAVA_X) ||
                    subClassName.startsWith(Constants.ANDROID) ||
                    subClassName.startsWith(Constants.ANDROID_X)
            ) {
                break;
            }
            //2. 遍历拿到当前 class
            Method[] declaredMethods = subClass.getDeclaredMethods();
            for (Method declaredMethod : declaredMethods) {
                //3. 检测当前方法中是否有 我们的 订阅者 注解也就是 YSubscribe
                YSubscribe annotation = declaredMethod.getAnnotation(YSubscribe.class);
                //如果没有直接跳出查找
                if (annotation == null)
                    continue;

                // check 这个方法的参数是否有多个
                Class<?>[] parameterTypes = declaredMethod.getParameterTypes();
                if (parameterTypes.length > 1) {
                    throw new RuntimeException("YEventBus 只能接收一个参数");
                }

                //4. 符合要求，最后添加到容器中
                //4.1 拿到需要在哪个线程中接收事件
                YThreadMode yThreadMode = annotation.threadMode();
                //只能在当前 tag 相同下才能接收事件
                String tag = annotation.tag();
                YSubscribleMethod subscribleMethod = new YSubscribleMethod(tag, declaredMethod, yThreadMode, parameterTypes[0]);
                ySubscribleMethodList.add(subscribleMethod);

            }
            //去父类找订阅者
            subClass =   subClass.getSuperclass();
        }
        return ySubscribleMethodList;
    }
```

### post (这里不是粘性事件)

```java

    /**
     * post 方法
     */
    public void post(String tag, Object object) {
        //拿到当前所有订阅者持有的类
        Set<Object> subscriberClass = mChacheSubscribleMethod.keySet();
        //拿到迭代器，
        Iterator<Object> iterator = subscriberClass.iterator();
        //进行循环遍历
        while (iterator.hasNext()) {
            //拿到注册 class
            Object subscribleClas = iterator.next();
            //获取类中所有添加订阅者的注解
            List<YSubscribleMethod> ySubscribleMethodList = mChacheSubscribleMethod.get(subscribleClas);
            for (YSubscribleMethod subscribleMethod : ySubscribleMethodList) {
                //判断这个方法是否接收事件
                if (!TextUtils.isEmpty(tag) && subscribleMethod.getTag().equals(tag) //注解上面的 tag 是否跟发送者的 tag 相同，相同就接收
                        && subscribleMethod.getEventType().isAssignableFrom(object.getClass() //判断类型
                )
                ) {
                    //根据注解上面的线程类型来进行切换接收消息
                    postMessage(subscribleClas, subscribleMethod, object);
                }

            }

        }

    }

    private void postMessage(final Object subscribleClas, final YSubscribleMethod subscribleMethod, final Object message) {

        //根据需要的线程来进行切换
        switch (subscribleMethod.getThreadMode()) {
            case MAIN:
                //如果接收的是主线程，那么直接进行反射，执行订阅者的方法
                if (isMainThread()) {
                    postInvoke(subscribleClas, subscribleMethod, message);
                } else {//如果接收消息在主线程，发送线程在子线程那么进行线程切换
                    mHandler.post(new Runnable() {
                        @Override
                        public void run() {
                            postInvoke(subscribleClas, subscribleMethod, message);
                        }
                    });
                }
                break;
            case ASYNC://需要在子线程中接收
                if (isMainThread())
                    //如果当前 post  是在主线程中，那么切换为子线程
                    ThreadUtils.executeByCached(new ThreadUtils.Task<Boolean>() {
                        @Nullable
                        @Override
                        public Boolean doInBackground() throws Throwable {
                            postInvoke(subscribleClas, subscribleMethod, message);
                            return true;
                        }

                        @Override
                        public void onSuccess(@Nullable Boolean result) {
                            Log.i(TAG, "执行成功");
                        }

                        @Override
                        public void onCancel() {

                        }

                        @Override
                        public void onFail(Throwable t) {

                        }
                    });
                else
                    postInvoke(subscribleClas, subscribleMethod, message);
                break;
            case POSTING:
            case BACKGROUND:
            case MAIN_ORDERED:
                postInvoke(subscribleClas, subscribleMethod, message);
                break;
            default:
                break;
        }
    }

    /**
     * 反射调用订阅者
     *
     * @param subscribleClas
     * @param subscribleMethod
     * @param message
     */
    private void postInvoke(Object subscribleClas, YSubscribleMethod subscribleMethod, Object message) {
        Log.i(TAG, "post message: " + "TAG:" + subscribleMethod.getTag() + " 消息体：" + message);
        Method method = subscribleMethod.getMethod();
        //执行
        try {
            method.invoke(subscribleClas, message);
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        }
    }
```



### Subscribe 订阅者

```java

/**
 * <pre>
 *     author  : devyk on 2019-07-27 18:05
 *     blog    : https://juejin.im/user/578259398ac2470061f3a3fb/posts
 *     github  : https://github.com/yangkun19921001
 *     mailbox : yang1001yk@gmail.com
 *     desc    : This is YSubscribe
 * </pre>
 */

@Target(ElementType.METHOD) //target 描述此注解在哪里使用
@Retention(RetentionPolicy.RUNTIME) //retention 描述此注解保留的时长 这里是在运行时
public @interface YSubscribe {
    YThreadMode threadMode() default YThreadMode.POSTING; //默认是在 post 线程接收数据

    String tag() default "";//根据消息来接收事件
}

```



### TreadMode 线程模式

```java

/**
 * <pre>
 *     author  : devyk on 2019-07-27 18:14
 *     blog    : https://juejin.im/user/578259398ac2470061f3a3fb/posts
 *     github  : https://github.com/yangkun19921001
 *     mailbox : yang1001yk@gmail.com
 *     desc    : This is YThreadMode
 * </pre>
 */
public enum  YThreadMode {
    /**
     * Subscriber will be called directly in the same thread, which is posting the event. This is the default. Event delivery
     * implies the least overhead because it avoids thread switching completely. Thus this is the recommended mode for
     * simple tasks that are known to complete in a very short time without requiring the main thread. Event handlers
     * using this mode must return quickly to avoid blocking the posting thread, which may be the main thread.
     */
    POSTING,

    /**
     * On Android, subscriber will be called in Android's main thread (UI thread). If the posting thread is
     * the main thread, subscriber methods will be called directly, blocking the posting thread. Otherwise the event
     * is queued for delivery (non-blocking). Subscribers using this mode must return quickly to avoid blocking the main thread.
     * If not on Android, behaves the same as {@link #POSTING}.
     */
    MAIN,

    /**
     * On Android, subscriber will be called in Android's main thread (UI thread). Different from {@link #MAIN},
     * the event will always be queued for delivery. This ensures that the post call is non-blocking.
     */
    MAIN_ORDERED,

    /**
     * On Android, subscriber will be called in a background thread. If posting thread is not the main thread, subscriber methods
     * will be called directly in the posting thread. If the posting thread is the main thread, EventBus uses a single
     * background thread, that will deliver all its events sequentially. Subscribers using this mode should try to
     * return quickly to avoid blocking the background thread. If not on Android, always uses a background thread.
     */
    BACKGROUND,

    /**
     * Subscriber will be called in a separate thread. This is always independent from the posting thread and the
     * main thread. Posting events never wait for subscriber methods using this mode. Subscriber methods should
     * use this mode if their execution might take some time, e.g. for network access. Avoid triggering a large number
     * of long running asynchronous subscriber methods at the same time to limit the number of concurrent threads. EventBus
     * uses a thread pool to efficiently reuse threads from completed asynchronous subscriber notifications.
     */
    ASYNC

}
```



### unRegister取消注册

```java
    /**
     * 取消注册订阅者
     */
    public void unRegister(Object subscriber) {
        Log.i(TAG, "unRegister start：当前注册个数" + mChacheSubscribleMethod.size());
        Class<?> subClas = subscriber.getClass();
        List<YSubscribleMethod> ySubscribleMethodList = mChacheSubscribleMethod.get(subClas);
        if (ySubscribleMethodList != null)
            mChacheSubscribleMethod.remove(subscriber);

        Log.i(TAG, "unRegister success：当前注册个数" + mChacheSubscribleMethod.size());
    }

```

### 框架怎么实现根据 TAG 接收消息

这个其实很简单，拿到 post 发送的 tag,跟订阅者的 tag 比较下就行了。其实只要了解原理也没有那么难得。

```java
//判断这个方法是否接收事件
                if (!TextUtils.isEmpty(tag) && subscribleMethod.getTag().equals(tag) //注解上面的 tag 是否跟发送者的 tag 相同，相同就接收
                        && subscribleMethod.getEventType().isAssignableFrom(object.getClass() //判断类型
                )
```



## 总结

最后我们根据开源项目 EventBus 实现了自己 [代码传送阵 YEventBus](https://github.com/yangkun19921001/YEventBus) 框架，可以根据 TAG 发送/接收消息。只要了解开源框架原理，根据自己需求改动原有框架或者实现自己的框架都不是太难，加油！

## 感谢

[EventBus GitHub](https://github.com/greenrobot/EventBus)



