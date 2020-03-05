## 我们为什么要优化内存

![](https://img-blog.csdn.net/20140318212143937?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvemhhbmdqZ19ibG9n/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

在 Android 中我们写的 .java 文件，最终会编译成 .class 文件, class 又由类装载器加载后，在 JVM 中会形成一份描述 class 结构的元信息对象，通过该元信息对象可以知道 class 的结构信息 (构造函数、属性、方法)等。JVM 会把描述类的数据从 class 文件加载到内存，Java 有一个很好的管理内存的机制，垃圾回收机制 GC 。为什么 Java 都给我们提供了垃圾回收机制，程序有时还会导致内存泄漏，内存溢出 OOM，甚至导致程序 Crash 。接下来我们就对实际开发中出现的这些内存问题，来进行优化。

## JAVA 虚拟机

我们先来大概了解一下 Java 虚拟机里面运行时的数据区域有哪些，如果想深入了解 Java 虚拟机 建议可以购买[<<深入理解 Java 虚拟机>> ](<https://item.jd.com/11252778.html?dist=jd>) [或者直接点击我这里的 PDF 版本 密码: jmnf ](https://pan.baidu.com/s/17WqfDh9ynQovuSgCCFqb8Q 
)

![](https://images2015.cnblogs.com/blog/665375/201601/665375-20160126212928129-1855187537.png)

### 线程独占区

**程序计数器**

- 相当于一个执行代码的指示器，用来确认下一行执行的地址
- 每个线程都有一个
- 没有 OOM 的区

**虚拟机栈**

- 我们平时说的栈就是这块区域
- java 虚拟机规范中定义了 OutOfMemeory , stackoverflow 异常

**本地方法栈**

- java 虚拟机规范中定义了 OutOfMemory ，stackoverflow 异常

**注意**

- 在 hotspotVM 中把虚拟机栈和本地方法栈合为了一个栈区

### 线程共享区

**方法区**

- ClassLoader 加载类信息
- 常量、静态变量
- 编译后的代码
- 会出现 OOM
- 运行时常量池
  - public static final
  - 符号引用类、接口全名、方法名

**java 堆 (本次需要优化的地方)**

- 虚拟机能管理的最大的一块内存 GC 主战场
- 会出现 OOM
- 对象实例
- 数据的内容

## JAVA GC 如何确定内存回收

随着程序的运行，内存中的实例对象、变量等占据的内存越来越多，如果不及时进行回收，会降低程序运行效率，甚至引发系统异常。

目前虚拟机基本都是采用**可达性分析算法**，为什么不采用引用计数算法呢？下面就说说引用计数法是如果统计所有对象的引用计数的，再对比**可达性分析算法**是如何解决引用计数算法的不足。下面就来看下这 2 个算法：

### 引用计数算法

每个对象有一个引用计数器，当对象被引用一次则计数器加一，当对象引用一次失效一次则计数器减一，对于计数器为 0 的时候就意味着是垃圾了，可以被 GC 回收。

**下面通过一段代码来实际看下**

```java

public class GCTest {
    private Object instace = null;

    public static void onGCtest() {
        //step 1
        GCTest gcTest1 = new GCTest();
        //step 2
        GCTest gcTest2 = new GCTest();
        //step 3
        gcTest1.instace = gcTest2;
        //step 4
        gcTest2.instace = gcTest1;
        //step 5
        gcTest1 = null;
        //step 6
        gcTest2 = null;

    }

    public static void main(String[] arg) {
        onGCtest();
    }
}
```

**分析代码**

```java
//step 1 gcTest1 引用 + 1 = 1
//step 2 gcTest2 引用 + 1 = 1
//step 3 gcTest1 引用 + 1 = 2
//step 4 gcTest2 引用 + 1 = 2
//step 5 gcTest1 引用 - 1 = 1
//step 6 gcTest2 引用 - 1 = 1
```

很明显现在 2 个对象都不能用了都为 null 了，但是 GC 确不能回收它们，因为它们本身的引用计数不为 0 。不能满足被回收的条件，尽管调用  System.gc() 也还是不能得到回收, 这就造成了 内存泄漏 。当然，现在虚拟机基本上都不采用此方式。

### 可达性分析算法

![](https://upload-images.jianshu.io/upload_images/12753144-12d748a60b156bbe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/943/format/webp)

**GC Roots** 的对象作为起始点，向下搜索走过的路径称为**引用链**，当一个对象到 GC Roots 没有任何引用链，即从GC roots 到这个对象不可达，则证明对象不可用，可被回收。

**可以作为 GC Roots 的对象**

- 虚拟机栈正在运行使用的引用
- 静态属性 常量
- JNI 引用的对象

GC 是需要 2 次扫描才回收对象，所以我们可以使用 finalize 去救活丢失的引用

```java
 @Override
    protected void finalize() throws Throwable {
        super.finalize();
        instace = this;
    }
```



**到了这里，相信大家已经能够弄明白这 2 个算法的区别了吧？反正对于对象之间循环引用的情况，引用计数算法无法回收这 2 个对象，而可达性是从 GC Roots 开始搜索，所以能够正确的回收。**

### 不同引用类型的回收状态

#### 强引用

```java
Object strongReference = new Object()
```

如果一个对象具有强引用，那垃圾回收器绝不会回收它，当内存空间不足， Java 虚拟机宁愿抛出 OOM 错误，使程序异常 Crash ,也不会靠随意回收具有强引用的对象来解决内存不足的问题.如果强引用对象不再使用时，需要弱化从而使 GC 能够回收，需要：

```java
strongReference = null; //等 GC 来回收
```

还有一种情况，如果：

```java
public void onStrongReference(){
    Object strongReference = new Object()
}
```

在 onStrongReference() 内部有一个强引用，这个引用保存在 *java 栈* 中，而真正的引用内容 （Object）保存在 java 堆中。当这个方法运行完成后，就会退出方法栈，则引用对象的引用数为 0 ，这个对象会被回收。

但是如果 mStrongReference 引用是全局时，就需要在不用这个对象时赋值为 null ,因为 强引用 不会被 GC 回收。

#### 软引用 (SoftReference)

如果一个对象只具有软引用，则内存空间足够，垃圾回收器就不会回收它；如果内存空间不足了，就会回收这些对象的内存，只要垃圾回收器没有回收它，该对象就可以被程序使用。软引用可用来实现内存敏感的高速缓存。

软引用可以和一个引用队列（ReferenceQueue）联合使用，如果软引用所引用的对象被垃圾回收器回收， java 虚拟机就会把这个软引用加入到与之关联的引用队列中。

![](<https://ws3.sinaimg.cn/large/005BYqpgly1g2vfsqxxgbj30iu0ig0tm.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>)

**注意:** 软引用对象是在 jvm 内存不够的时候才会被回收，我们调用 System.gc() 方法只是起通知作用， JVM 什么时候扫描回收对象是 JVM 自己的状态决定的。就算扫描到了 str 这个对象也不会回收，只有内存不足才会回收。

#### 弱引用 (WeakReference)

弱引用与软引用的区别在于: 只具有弱引用的对象拥有更短暂的生命周期。在垃圾回收器线程扫描它所管辖的内存区域的过程中，一旦发现了只具有弱引用的对象，不管当前内存空间足够与否，都会回收它的内存。不过由于垃圾回收器是一个优先级很低的线程，因此不一定会很快发现那些只具有弱引用的对象。

弱引用可以和一个引用队列联合使用，如果弱引用所引用的对象被垃圾回收，Java 虚拟机就会把这个弱引用加入到与之关联的引用队列中。

![](<https://ws3.sinaimg.cn/large/005BYqpgly1g2vgev5k86j30la0m3tab.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>)

可见 weakReference 对象的生命周期基本由 GC 决定，一旦 GC 线程发现了弱引用就标记下来，第二次扫描到就直接回收了。

注意这里的 referenceQueuee 是装的被回收的对象。

#### 虚引用 (PhantomReference)

```java
    @Test
    public void onPhantomReference()throws InterruptedException{
        String str = new String("123456");
        ReferenceQueue queue = new ReferenceQueue();
        // 创建虚引用，要求必须与一个引用队列关联
        PhantomReference pr = new PhantomReference(str, queue);
        System.out.println("PhantomReference:" + pr.get());
        System.out.printf("ReferenceQueue:" + queue.poll());
    }
```

**虚引用**顾名思义，就是形同虚设，与其他几种引用都不同，虚引用并不会决定对象的生命周期。如果一个对象仅持有虚引用，那么它就和没有任何引用一样，在任何时候都可能被垃圾回收器回收。

虚引用主要用来跟踪对象被垃圾回收器回收的活动。虚引用与软引用和弱引用的一个区别在于: 虚引用必须和引用队列 (ReferenceQueue) 联合使用。当垃圾回收器准备回收一个对象时，如果发现它还有虚引用，就会在回收对象的内存之前，把这个虚引用加入到与之关联的引用队列中。 

#### 总结

| 引用类型 | 调用方式 | GC                                       | 是否内存泄漏 |
| -------- | -------- | ---------------------------------------- | ------------ |
| 强引用   | 直接调用 | 不回收                                   | 是           |
| 软引用   | .get()   | 视内存情况回收                           | 否           |
| 弱引用   | .get()   | 回收                                     | 不可能       |
| 虚引用   | null     | 任何时候都可能被回收，相当于没有引用一样 | 否           |



## 分析内存常用工具

**工具很多，掌握原理方法，工具随意挑选使用。**

### top/procrank

### meinfo

### Procstats

### DDMS

### MAT

### Finder - Activity

### LeakCanary

### LeakInspector

## 内存泄漏

**产生的原因:** 一个长生命周期的对象持有一个短生命周期对象的引用，通俗点讲就是该回收的对象，因为引用问题没有被回收，最终会产生 OOM。

下面我们来利用 Profile 来检查项目是否有内存泄漏

### 怎么利用 profile 来查看项目中是否有内存泄漏

1. 在 AS 中项目以 profile 运行

   ![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g2yw45t9pcg31gr0piqv5.jpg)

2. 在 MEMORY 界面中选择要分析的一段内存，右键 export 

   ![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g2xhivne0jg31gr0pi4qp.jpg)

   **Allocations:** 动态分配对象个数

   **Deallocation:** 解除分配的对象个数

   **Total count:** 对象的总数

   **Shalow Size:** 对象本身占用的内存大小

   **Retained Size:** GC 回收能收走的内存大小

3. 转换 profile 文件格式

   - 将 export 导出的 dprof 文件转换为 Mat 的 dprof 文件

   - cd /d 进入到 Android sdk/platform-tools/hprof-conv.exe

     ```java
     //转换命令 hprof-conv -z src des
     D:\Android\AndroidDeveloper-sdk\android-sdk-windows\platform-tools>hprof-conv -z D:\temp_\temp_6.hprof D:\temp_\memory6.hprod
     ```

4. [下载 Mat 工具](https://www.eclipse.org/mat/downloads.php)

5. 打开 MemoryAnalyzer.exe 点击左上角 File 菜单中的 Open Heap Dupm

   ![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g2xi4a8ut3g31e80qxhdt.jpg)

6. 查看内存泄漏中的 GC Roots 强引用

   ![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g2xi8mt828g31e80qxgxz.jpg)

   这里我们得知是一个 ilsLoginListener 引用了 LoginView,我们来看下代码最后怎么解决的。

   ![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g2xif193yqg30v30fq43c.jpg)

   代码中我们找到了 LoginView 这个类，发现是一个单例中的回调引起的内存泄漏，下面怎么解决勒，请看第七小点。

7. 2种解决单例中的内存泄漏

   1. 将引用置为 null

      ```java
      /**
           * 销毁监听
           */
          public void unRemoveRegisterListener(){
              mMessageController.unBindListener();
          }
          public void unBindListener(){
              if (listener != null){
                  listener = null;
              }
          }
      ```

   2. 使用弱引用

      ```java
      //将监听器放入弱引用中
      WeakReference<IBinderServiceListener> listenerWeakReference = new WeakReference<>(listener);
      
      //从弱引用中取出回调
      listenerWeakReference.get()；
      ```

8. 通过第七小点就能完美的解决单例中回调引起的内存泄漏。

### Android 中常见的内存泄漏经典案例及解决方法

1. 单例

   **示例 :** 

   ```java
   public class AppManager {
   
       private static AppManager sInstance;
       private CallBack mCallBack;
       private Context mContext;
   
       private AppManager(Context context) {
           this.mContext = context;
       }
   
       public static AppManager getInstance(Context context) {
           if (sInstance == null) {
               sInstance = new AppManager(context);
           }
           return sInstance;
       }
       
       public void addCallBack(CallBack call){
           mCallBack = call；
       }
   }
   ```

   1. 通过上面的单列，如果 context 传入的是 Activity , Service 的 this，那么就会导致内存泄漏。

      以 Activity 为例，当 Activity 调用 getInstance 传入 this ，那么 sInstance 就会持有 Activity 的引用，当 Activity 需要关闭的时候需要 回收的时候，发现 sInstance 还持有 没有用的 Activity 引用，导致 Activity 无法被 GC 回收，就会造成内存泄漏

   2. addCallBack(CallBack call) 这样写看起来是没有毛病的。但是当这样调用在看一下勒。

      ```java
      //在 Activity 中实现单例的回调
      AppManager.getInstance(getAppcationContext()).addCallBack(new CallBack(){
          @Override
          public void onStart(){
              
          }
      })；
      ```

      这里的 new CallBack() 匿名内部类 默认持有外部的引用，造成 CallBack 释放不了，那么怎么解决了，请看下面解决方法

   **解决方法**: 

   1. getInstance(Context context) context 都传入 Appcation 级别的 Context,或者实在是需要传入 Activity 的引用就用 WeakReference<Activity> 这种形式。

   2. 匿名内部类建议大家单独写一个文件或者

      ```java
      public void addCallBack(CallBack call){
              WeakReference<CallBack> mCallBack= new WeakReference<CallBack>(call)；
          }
      ```

2. Handler

   **示例:** 

   ```java
   //在 Activity 中实现 Handler
   class MyHandler extends Handler{
       private Activity m;
       public MyHandler(Activity activity){
           m=activity;
       }
   
   //    class.....
   }
   ```

   这里的 MyHandler 持有 activity 的引用，当 Activity 销毁的时候，导致 GC 不会回收造成 内存泄漏。

   **解决方法**: 

   ```java
   1.使用静态内部类 + 弱引用
   2.在 Activity onDestoty() 中处理  removeCallbacksAndMessages() 
       @Override
       protected void onDestroy() {
           super.onDestroy();
       if(null != handler){
             handler.removeCallbacksAndMessages(null);
             handler = null;
       }
    }
   ```

3. 静态变量

   **示例:** 

   ```java
   public class MainActivity extends AppCompatActivity {
   
       private static Police sPolice;
   
       @Override
       protected void onCreate(Bundle savedInstanceState) {
           super.onCreate(savedInstanceState);
           setContentView(R.layout.activity_main);
           if (sPolice != null) {
               sPolice = new Info(this);
           }
       }
   }
   
   class Police {
       public Police(Activity activity) {
       }
   }
   ```

   这里 Police 持有 activity 的引用，会造成 activity 得不到释放，导致内存泄漏。

   **解决方法**: 

   ```
   //1. sPolice 在 onDestory（）中 sPolice = null;
   //2. 在 Police 构造函数中 将强引用 to 弱引用；
   ```

   

4. 非静态内部类

   参考 第二点 Handler 的处理方式

5. 匿名内部类

   **示例:** 

   ```java
   public class MainActivity extends AppCompatActivity {
   
       @Override
       protected void onCreate(Bundle savedInstanceState) {
           super.onCreate(savedInstanceState);
           setContentView(R.layout.activity_main);
         	new Thread(){
                @Override
                public void run() {
                   super.run();
                           }
                       };
       }
   }
   ```

   很多初学者都会像上面这样新建线程和异步任务，殊不知这样的写法非常地不友好，这种方式新建的子线程`Thread`和`AsyncTask`都是匿名内部类对象，默认就隐式的持有外部`Activity`的引用，导致`Activity`内存泄露。

   **解决方法**: 

   ```java
   //静态内部类 + 弱引用
   //单独写一个文件 + onDestory  = null;
   ```

   

6. 未取消注册或回调

   **示例:** 

   ```java
   public class MainActivity extends AppCompatActivity {
   
       @Override
       protected void onCreate(Bundle savedInstanceState) {
           super.onCreate(savedInstanceState);
           setContentView(R.layout.activity_main);
           registerReceiver(mReceiver, new IntentFilter());
       }
   
       private BroadcastReceiver mReceiver = new BroadcastReceiver() {
           @Override
           public void onReceive(Context context, Intent intent) {
               // TODO ------
           }
       };
   }
   ```

   在注册观察则模式的时候，如果不及时取消也会造成内存泄露。比如使用`Retrofit + RxJava`注册网络请求的观察者回调，同样作为匿名内部类持有外部引用，所以需要记得在不用或者销毁的时候取消注册。

   **解决方法**: 

   ```
   //Activity 中实现 onDestory（）反注册广播得到释放
       @Override
       protected void onDestroy() {
           super.onDestroy();
           this.unregisterReceiver(mReceiver);
       }
   ```

   

7. 定时任务

   **示例:** 

   ```java
   public class MainActivity extends AppCompatActivity {
   
       /**模拟计数*/
       private int mCount = 1;
       private Timer mTimer;
       private TimerTask mTimerTask;
   
       @Override
       protected void onCreate(Bundle savedInstanceState) {
           super.onCreate(savedInstanceState);
           setContentView(R.layout.activity_main);
           init();
           mTimer.schedule(mTimerTask, 1000, 1000);
       }
   
       private void init() {
           mTimer = new Timer();
           mTimerTask = new TimerTask() {
               @Override
               public void run() {
                   MainActivity.this.runOnUiThread(new Runnable() {
                       @Override
                       public void run() {
                           addCount();
                       }
                   });
               }
           };
       }
   
       private void addCount() {
         mCount += 1;
       }
   }
   ```

   当我们`Activity`销毁的时，有可能`Timer`还在继续等待执行`TimerTask`，它持有Activity 的引用不能被 GC 回收，因此当我们 Activity 销毁的时候要立即`cancel`掉`Timer`和`TimerTask`，以避免发生内存泄漏。

   **解决方法**: 

   ```java
   //当 Activity 关闭的时候，停止一切正在进行中的定时任务，避免造成内存泄漏。
       private void stopTimer() {
           if (mTimer != null) {
               mTimer.cancel();
               mTimer = null;
           }
           if (mTimerTask != null) {
               mTimerTask.cancel();
               mTimerTask = null;
           }
       }
   
       @Override
       protected void onDestroy() {
           super.onDestroy();
           stopTimer();
       }
   ```

   

8. 资源未关闭

   **示例:** 

   ```JAVA
   ArrayList,HashMap,IO,File,SqLite,Cursor 等资源用完一定要记得 clear remove 等关闭一系列对资源的操作。
   ```

   **解决方法**: 

   ```java
   用完即刻销毁
   ```

9. 属性动画

   **示例:** 

   ```java
   动画同样是一个耗时任务，比如在 Activity 中启动了属性动画 (ObjectAnimator) ，但是在销毁的时候，没有调用 cancle 方法，虽然我们看不到动画了，但是这个动画依然会不断地播放下去，动画引用所在的控件，所在的控件引用 Activity ，这就造成 Activity 无法正常释放。因此同样要在Activity 销毁的时候 cancel 掉属性动画，避免发生内存泄漏。
   ```

   **解决方法**: 

   ```java
   @Override
   protected void onDestroy() {
       super.onDestroy();
       //当关闭 Activity 的时候记得关闭动画的操作
       mAnimator.cancel();
   }
   ```

   

10. Android 源码或者第三方 SDK

    **示例:** 

    ```java
    //如果在开发调试中遇见 Android 源码或者 第三方 SDK 持有了我们当前的 Activity 或者其它类，那么现在怎么办了。
    ```

    **解决方法**: 

    ```java
    //当前是通过 Java 中的反射找到某个类或者成员，来进行手动 = null 的操作。
    ```

    

## 内存抖动

### 什么是内存抖动

内存频繁的分配与回收,(分配速度大于回收速度时) 最终产生 OOM 。

**也许下面的录屏更能解释什么是内存泄漏**

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g2yqm6bdi8g31fs0m11l2.jpg)

可以看出当我点击了一下 Button 内存就频繁的创建并回收（注意看垃圾桶）。

**那么我们找出代码中具体那一块出现问题了勒，请看下面一段录屏**

```java
  
mButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                imPrettySureSortingIsFree();
            }
        });

/**
     *　排序后打印二维数组，一行行打印
     */
    public void imPrettySureSortingIsFree() {
        int dimension = 300;
        int[][] lotsOfInts = new int[dimension][dimension];
        Random randomGenerator = new Random();
        for (int i = 0; i < lotsOfInts.length; i++) {
            for (int j = 0; j < lotsOfInts[i].length; j++) {
                lotsOfInts[i][j] = randomGenerator.nextInt();
            }
        }
        


        for (int i = 0; i < lotsOfInts.length; i++) {
            String rowAsStr = "";
            //排序
            int[] sorted = getSorted(lotsOfInts[i]);
            //拼接打印
            for (int j = 0; j < lotsOfInts[i].length; j++) {
                rowAsStr += sorted[j];
                if (j < (lotsOfInts[i].length - 1)) {
                    rowAsStr += ", ";
                }
            }
            Log.i("ricky", "Row " + i + ": " + rowAsStr);
        }
    }
```



![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g2yrdttm69g31fs0ns7j3.jpg)

最后我们之后是 onClick 中的 imPrettySureSortingIsFree() 函数里面的 rowAsStr += sorted[j]; 字符串拼接造成的 内存抖动 ，因为每次拼接一个 String 都会申请一块新的堆内存，那么怎么解决这个频繁开辟内存的问题了。其实在 Java 中有 2 个更好的 API 对 String 的操作很友好，相信应该有人猜到了吧。没错就是将 此处的 String 换成 StringBuffer 或者 StringBuilder，就能很完美的解决字符串拼接造成的内存抖动问题。

**修改后**

```java
        /**
         *　打印二维数组，一行行打印
         */
        public void imPrettySureSortingIsFree() {
            int dimension = 300;
            int[][] lotsOfInts = new int[dimension][dimension];
            Random randomGenerator = new Random();
            for(int i = 0; i < lotsOfInts.length; i++) {
                for (int j = 0; j < lotsOfInts[i].length; j++) {
                    lotsOfInts[i][j] = randomGenerator.nextInt();
                }
            }

            // 使用StringBuilder完成输出，我们只需要创建一个字符串即可，				不需要浪费过多的内存
            StringBuilder sb = new StringBuilder();
            String rowAsStr = "";
            for(int i = 0; i < lotsOfInts.length; i++) {
                // 清除上一行
                sb.delete(0, rowAsStr.length());
                //排序
                int[] sorted = getSorted(lotsOfInts[i]);
                //拼接打印
                for (int j = 0; j < lotsOfInts[i].length; j++) {
                    sb.append(sorted[j]);
                    if(j < (lotsOfInts[i].length - 1)){
                        sb.append(", ");
                    }
                }
                rowAsStr = sb.toString();
                Log.i("jason", "Row " + i + ": " + rowAsStr);
            }
        }
```

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g2yrt38lbpg31fs0nskjl.jpg)

这里可以看见没有垃圾桶出现，说明内存抖动解决了。

**注意**: 实际开发中如果在 LogCat 中发现有这些 Log 说明也发生了 内存抖动 (Log 中出现 concurrent copying GC freed ....)

### 回收算法

[ps:我觉得这个只是为了应付面试，那么可以参考这里，我也只了解概念这里就不用在多写了，点击看这个帖子吧](<https://www.zhihu.com/question/35164211>)

### 标记清除算法 Mark-Sweep

![](https://s1.ax1x.com/2018/08/25/PbAuX4.png

### 复制算法 Copying

### 标记压缩算法 Mark-Compact

### 分带收集算法

## 总结 (只要养成这样的习惯，至少可以避免 90 % 以上不会造成内存异常)

1. 数据类型: 不要使用比需求更占用空间的基本数据类型

2. 循环尽量用 foreach ,少用 iterator, 自动装箱也尽量少用

3. 数据结构与算法的解度处理 (数组，链表，栈树，树，图)

   - 数据量千级以内可以使用 Sparse 数组 (Key为整数)，ArrayMap (Key 为对象) 虽然性能不如 HashMap ，但节约内存。

4. 枚举优化

   **缺点**: 

   - 每一个枚举值都是一个单例对象,在使用它时会增加额外的内存消耗,所以枚举相比与 Integer 和 String 会占用更多的内存

   - 较多的使用 Enum 会增加 DEX 文件的大小,会造成运行时更多的 IO 开销,使我们的应用需要更多的空间

   - 特别是分 Dex 多的大型 APP，枚举的初始化很容易导致 ANR

   优化后的代码:可以直接限定传入的参数个数

   ```java
   public class SHAPE {
       public static final int TYPE_0=0;
       public static final int TYPE_1=1;
       public static final int TYPE_2=2;
       public static final int TYPE_3=3;
   
   
       @IntDef(flag=true,value={TYPE_0,TYPE_1,TYPE_2,TYPE_3})
       @Target({ElementType.PARAMETER,ElementType.METHOD,ElementType.FIELD})
       @Retention(RetentionPolicy.SOURCE)
       public @interface Model{
   
       }
   
       private @Model int value=TYPE_0;
       public void setShape(@Model int value){
           this.value=value;
       }
       @Model
       public int getShape(){
           return this.value;
       }
   }
   ```

   

5. static , static final 的问题

   - static 会由编译器调用 clinit 方法进行初始化

   - static final 不需要进行初始化工作，打包在 dex 文件中可以直接调用，并不会在类初始化申请内存

   基本数据类型的成员，可以全写成 static final 

6. 字符串的拼接尽量少用 +=

7. 重复申请内存问题

   - 同一个方法多次调用，如递归函数 ，回调函数中 new 对象

   - 不要在 onMeause()  onLayout() ,onDraw()  中去刷新UI（requestLayout）

8. 避免 GC 回收将来要重新使用的对象 (内存设计模式对象池 + LRU 算法)

9. Activity 组件泄漏

   - 非业务需要不要把 activity 的上下文做参数传递，可以传递 application 的上下文
   - 非静态内部类和匿名内部内会持有 activity 引用（静态内部类 或者 单独写文件）
   - 单例模式中回调持有 activity 引用（弱引用）
   - handler.postDelayed() 问题
     - 如果开启的线程需要传入参数，用弱引接收可解决问题
     - handler 记得清除 removeCallbacksAndMessages(null)

10. Service 耗时操作尽量使用 IntentService,而不是 Service

    

    

   

    

    

    

    