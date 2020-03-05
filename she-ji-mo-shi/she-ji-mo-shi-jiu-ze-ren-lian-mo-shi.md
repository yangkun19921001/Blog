# 设计模式 \(九\) 责任链模式

## 介绍

责任链模式 \(Iterator Pattern\) ,属于行为型设计模式之一。什么是 “链” ？`我们将多个节点首尾相连所构成的模型称为链` 。就好比生活中一个个铁圆环一个连这一个环环相扣一样。

## 定义

使多个对象都有机会处理请求，从而避免了请求的发送者和接收者之间的耦合关系。将这些对象连成一条链，并沿着这条链传递该请求，直到处理为止。

## 使用场景

1. 多个对象可以处理同一个请求，但是具体由哪个对象处理则在运行时动态决定。
2. 在请求处理者不明确的情况下向多个对象中的一个提交一个请求。
3. 需要动态指定一组对象处理请求。

## XML 类图

[![hUPYr.png](https://storage1.cuntuku.com/2019/09/08/hUPYr.png)](https://cuntuku.com/image/hUPYr)

* Handler : 抽象处理者角色，声明一个请求处理的方法，并在其中保持一个对下一个处理节点 Handler 的引用。
* ConcreteHandler: 具体处理角色，对请求进行处理，如果不能处理则将该请求转发给下一个请求。

## 实战

**简单示例1：**

定义抽象处理者:

```java
public abstract class Handler {

    private String  TAG = getClass().getSimpleName();

    /**
     * 下一个节点来负责处理
     */
    public Handler nextHandler;

    /**
     * 开始处理请求
     */
    public final void handlerRequest(HandlerRequest handlerRequest){

        if (getHandlerRequestLevel() == handlerRequest.getRequestLevel()){
            handler(handlerRequest);
        }else {
            if (nextHandler != null) {
                nextHandler.handlerRequest(handlerRequest);
            }else {
                Log.i(TAG,"当前事件"+handlerRequest.getRequestLevel() + "都不处理");
            }
        }
    }

    /**
     * 具体处理方式
     * @param handlerRequest
     */
    protected abstract void handler(HandlerRequest handlerRequest);

    /**
     * 获取处理对象的处理级别
     * @return
     */
    protected abstract int getHandlerRequestLevel();
}
```

定义抽象请求者：

```java
public abstract class HandlerRequest {

    /**
     * 处理对象
     */
    private Object obj;

    public HandlerRequest(Object obj) {
        this.obj = obj;
    }

    /**
     * 获取处理对象内容
     */
    public Object getContent(){
        return obj;
    }

    /**
     * 获取请求级别
     */
    public abstract int  getRequestLevel();
}
```

定义具体处理者：

```java
public class HandlerA extends Handler {

    private String TAG = getClass().getSimpleName();

    @Override
    protected void handler(HandlerRequest handlerRequest) {
        System.out.println("handlerRequest = [" +TAG + " " + (String) handlerRequest.getContent() + "]");

    }

    @Override
    protected int getHandlerRequestLevel() {
        return 1;
    }
}
```

```java
public class HandlerB extends Handler {
    private String TAG = getClass().getSimpleName();

    @Override
    protected void handler(HandlerRequest handlerRequest) {
        System.out.println("handlerRequest = [" + TAG + " " +(String) handlerRequest.getContent() + "]");

    }

    @Override
    protected int getHandlerRequestLevel() {
        return 2;
    }
}
```

定义具体请求者：

```java
public class RequestA extends HandlerRequest {
    public RequestA(Object obj) {
        super(obj);
    }

    @Override
    public int getRequestLevel() {
        return 1;
    }
}
```

```java
public class RequestB extends HandlerRequest {
    public RequestB(Object obj) 
        super(obj);
    }

    @Override
    public int getRequestLevel() {
        return 2;
    }
}
```

定义 Client 测试：

```java
    /**
     * 客户处理
     */
    @Test
    public void testIterator() {
        //构造处理对象
        Handler handlerA = new HandlerA();
        Handler handlerB = new HandlerB();

        //交给下一个节点处理
        handlerA.nextHandler = handlerB;

        //构造请求对象
        HandlerRequest handlerRequestA = new RequestA("A");
        HandlerRequest handlerRequestB = new RequestB("B");

        //发起请求
        handlerA.handlerRequest(handlerRequestA);
        handlerA.handlerRequest(handlerRequestB);

    }
```

Output:

```java
handlerRequest = [HandlerA A]
handlerRequest = [HandlerB B]
```

从测试代码可以看到 ，我们的 handlerA 的下一个请求交给了 handlerB，那么在发起请求的时候内部就会判断，如果当前发起请求的级别跟处理事件的级别不符合的话 ，就交给下一个节点来判断，如果都没有找到就报空。

**实战示例2：**

在 Android 中我们知道 Broadcast 可以分为 2 种，一种是普通广播，一种是有序广播，普通广播是异步的，发出时可以被所有的接收者收到；而有序广播则是根据优先级依次传播的，直到接收者将其处理，是不是觉得有序广播跟我们的责任链模式很相似，通过广播也能达到实现责任链事件的处理，下面先看代码：

先动态注册 3 个广播

```java
    private void registerOrderBroadcast() {
        IntentFilter filter = new IntentFilter();
        filter.addAction("com.it.dp_order");
        filter.setPriority(1000);

        IntentFilter filterB = new IntentFilter();
        filterB.addAction("com.it.dp_order");
        filterB.setPriority(500);
        registerReceiver(new ReceiverB(),filterB);

        IntentFilter filterC = new IntentFilter();
        filterC.addAction("com.it.dp_order");
        filterC.setPriority(100);
        registerReceiver(new ReceiverC(),filterC);
        registerReceiver(new ReceiverA(),filter);
    }
```

```java
public class ReceiverA extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) {
            return;
        }
        int limit = intent.getIntExtra("limit", -1);

        if (limit == 100) {
            if (intent.getStringExtra("MEG") != null) {
                Log.i("ReceiverA","我处理了");
                Toast.makeText(context,intent.getStringExtra("MEG"),Toast.LENGTH_SHORT).show();
            }
            //处理事件，终止广播
            abortBroadcast();
        } else {
            Log.i("ReceiverA","我不处理，分发下去");
            //添加信息，继续分发，直到任务处理
            Bundle bundle = new Bundle();
            bundle.putInt("limit",1000);
            bundle.putString("MEG","中午啦，该吃饭了！");
            setResultExtras(bundle);
        }
    }
}
```

...其它 2 个广播省略 内部代码只有 limit == ? 不一样

发送一个有序广播：

```java
    public void order(View view) {
        Intent intent = new Intent();
        intent.setAction("com.it.dp_order");
        intent.putExtra("limit",1000);
        intent.putExtra("MEG","中午了，该吃饭了");
        sendOrderedBroadcast(intent,null);

    }
```

Output:

```java
2019-09-08 13:40:41.551 28992-28992/com.devyk.android_dp_code I/ReceiverA: 我不处理，分发下去
2019-09-08 13:40:41.557 28992-28992/com.devyk.android_dp_code I/ReceiverB: 我不处理，分发下去
2019-09-08 13:40:41.574 28992-28992/com.devyk.android_dp_code I/ReceiverC: 我处理了
```

这里我们动态注册了 3 个广播，优先级越高越先收到 A，B 都不符合要求，所以下发下去，最后在 C 接收者里面处理。

## 总结

**优点：**

可以对请求者和处理者关系解耦，提高代码灵活性。

**缺点：**

对链中请求处理者的遍历，如果处理者太多，那么遍历会影响一定的性能，特别是在一些递归调用中，要慎用。

但总体来说，优点是大于缺点的，缺点相对于优点来说还是可控的。

[文章代码地址](https://github.com/yangkun19921001/AndroidDpCode)

## 特别感谢

[《 Android 源码设计模式解析与实战 》](https://item.jd.com/12113187.html)

感谢你的阅读，谢谢！

