## 概述

现在多进程传递数据使用越来越广泛了，在 Android 中进程间通信提供了 `文件` 、`AIDL` 、`Binder` 、`Messenger` 、`ContentProvider` 、``Socket` 、`MemoryFile` 等，实际开发中使用最多的应该是 AIDL ,但是 AIDL 需要编写 aidl 文件，如果使用 AIDL 仅仅是为了传递数据, 那么 [YKProBus](https://github.com/yangkun19921001/YKProBus) 是你不错的选择。

## YKProBus 

### 怎么使用？

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g5vu48bq07g30fs0uaqsd.jpg)

#### 1. root/build.gradle 中添加框架 maven

```java
	allprojects {
		repositories {
			...
			maven { url 'https://jitpack.io' }
		}
	}
```

#### 2. app/build.gradle 中添加框架 依赖

```java
	dependencies {
	        implementation 'com.github.yangkun19921001:YKProBus:1.0.1'
	}
```

#### 3. 发送进程绑定接收进程服务

```java
EventManager.getInstance().bindApplication(getApplicationContext(),"com.devyk.module_a");
```

#### 4. 发送消息

```java
 EventManager.getInstance().sendMessage(int messageTag,Bundle bundle);
```

#### 5. 接收进程中需要在清单文件注册服务

```java
<service        android:name="com.devyk.component_eventbus.proevent.service.MessengerService"
 android:enabled="true"
 android:exported="true">
    <intent-filter>
           <action android:name="com.devyk.component_eventbus.service"></action>
           <category android:name="android.intent.category.DEFAULT" />
    </intent-filter>
</service>
```

#### 6. 接收消息

6.1 在需要接收消息的类中实现 IMessageHandler 并实例化一个 Handler 用于接收发送进程发来的消息

```java
public class MainActivity extends Activity implements IMessageHandler{
  ...
    
   
    /**
     * 接收其它进程发送过来的消息
     *
     * @return
     */
    @Override
    public Handler getHandler() {
        return new Handler() {
            @Override
            public void handleMessage(Message msg) {
                super.handleMessage(msg);
                switch (msg.what) {
                    case 0x001:
                       ...
                        break;
                }
            }
        };
    } 
  ...
}
```

6.2 注册当前类需要接收消息

```java
 EventManager.getInstance().registerMessager(int messageTag, Object obj);
```



### 框架设计大概流程

[![Messenger-YKProBus-.png](https://s3.ax2x.com/2019/08/11/Messenger-YKProBus-.png)](https://free.imgsha.com/i/z9RYd)

## Messenger 源码分析

Messenger 内部其实也是依赖 aidl 实现的进程间通信。

### 服务端

```java
    @Override
    public IBinder onBind(Intent intent) {
        return mServiceMessenger.getServiceMessenger().getBinder();
    }
```

getBinder() 跟进去

```java
    public IBinder getBinder() {
        return mTarget.asBinder();
    }
```

mTarget 从何而来，从源码找找

```java
    public Messenger(Handler target) {
        mTarget = target.getIMessenger();
    }
```

这里是我们实例化 服务端 Messenger 传入的 Handler target

```java
    /**
     * 初始化服务端 Messenger
     */
    public MessengerManager() {
        if (null == mServiceMessenger)
            mServiceMessenger = new Messenger(mMessengerServiceHandler);
    }
```

那么我们在点击 getIMessenger() 在看看内部实现

```java
    final IMessenger getIMessenger() {
        synchronized (mQueue) {
            if (mMessenger != null) {
                return mMessenger;
            }
            mMessenger = new MessengerImpl();
            return mMessenger;
        }
    }
   
```

继续点击 MessengerImple

```java
    private final class MessengerImpl extends IMessenger.Stub {
        public void send(Message msg) {
            msg.sendingUid = Binder.getCallingUid();
            Handler.this.sendMessage(msg);
        }
    }
```

这个是一个内部实现的类，可以看到继承的是 IMessenger.Stub 然后实现 send (Message msg) 函数，然后通过 mTarget.sendMessage(msg) 发送消息，最后在我们传入进去的 mMessengerServiceHandler 的 handleMessage (Message) 接收发来的消息。

既然这里内部帮我们写了 aidl 文件 ，并且也继承了 IMessenger.Stub  我们今天就要看到 aidl 才死心 ， 好吧我们来找找 IMessenger aidl 文件。

[![IMessenger-aidl-.jpg](https://s3.ax2x.com/2019/08/11/IMessenger-aidl-.jpg)](https://free.imgsha.com/i/z9LB1)

可以看到是在 framework/base/core/java/android/os 路径中，我们点击在来看下文件中怎么写的

![IMessenger-aidl-2.jpg](https://s3.ax2x.com/2019/08/11/IMessenger-aidl-2.jpg)

内部就一个 send 函数，看到这，大家应该都明白了，Messenger 其实也没什么大不了，就是系统内部帮我们写了 aidl 并且也实现了 aidl ，最后又帮我们做了一个 Handler 线程间通信，所以服务端收到了客服端发来的消息。

### 客服端

客服端需要在 bindServicer onServiceConnected 回调中拿到 servicer, 平时我们自己写 应该是这么拿到 Ibinder 对象吧

```java
IMessenger mServiceMessenger = IMessenger.Stub.asInterface(service);
```

但是我们实际客服端是这样拿到服务端的 Messenger

```java
    /**
     * 服务端消息是否连接成功
     */
    private class EventServiceConnection implements ServiceConnection {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            isBindApplication = true;
            // 得到服务信使对象
            mServiceMessenger = new Messenger(service);

            //将本地信使告诉服务端
            registerMessenger();

            String proName = ProcessUtils.getProName(mApplicationContext);
            Log.d(TAG, " EventServiceConnection " + proName);

        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            isBindApplication = false;
        }
    }
```

```java
// 得到服务信使对象
mServiceMessenger = new Messenger(service);
```

跟进去

```java
public Messenger(IBinder target) {
  mTarget = IMessenger.Stub.asInterface(target);
}
```

这不就是我们刚刚说的自己实现的那种写法吧，到这里我们都懂了吧，我们平时写的 aidl android 中已经帮我们写了，想当于在 aidl 中封装下就变成了现在的 Messenger ,  而我们又在 Messenger 上封装了下，想当于 三次封装了，为了使用更简单。封装才是王道！

## 总结

我们自己的 [YKProBus](https://github.com/yangkun19921001/YKProBus) 为了进程间通信使用更简单方便，其实相当于在 AIDL 中的三次封装。想要了解的可以去看下我具体的封装或者 Messenger 源码。

感谢大家抽空阅览文章，谢谢！