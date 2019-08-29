# 面试准备

# 数据结构和算法

# Java 基础

# Android 基础

##  Activity

### 生命周期

![](https://img-blog.csdn.net/20150814221322974?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

1. Activity 四种状态

   1. running - 正在运行
   2. paused - 不可见不可交互
   3. Stoped - 当前 Activity 停止运行
   4. Killed - 当前 Activity 被杀死

2. Activity 生命周期分析

   1. 正常  Activity 启动过程

      onCreate -> onStart -> onResume

   2. 异常情况下 Activity 生命周期分析

      - 系统配置发生改变

      - 内存发生改变

      异常终止,系统会调用 onSaveInstanceState() 用户可以在这个回调中保存下次需要恢复的数据，当 Activity 重新创建的时候可以在 onRestoreInstanceState 中取出保存的数据。

   3. 退出当前 Activity 

      onPause -> onStop -> onDestory

   4. 在当前正在运行的 Activity 基础上打开新的 Activity

      onPause -> onStop

3. Android 进程优先级

   前台 -> 可见 -> 服务 -> 后台 -> 空

### Activity 组件之间通信

1. Activity 与 Activity 通信

   1. Intent / Bundle
   2. 类静态变量
   3. 全局变量

2. Activity 与 Fragment 通信

   1. Activity 将数据传递给 Fragment

      1. Bundle

         Put

         ```java
         fragment.setArguments(Bundle bundle);
         ```

         get

         ```
         if(isAdded())判断 Fragment 已经依附 Activity
         Bundle bundler = getArguments();
         ```

      2. 直接在 Activity 中定义方法

         put

         ```java
         Activity1 extends Activity{
           ...
          public int  getVersion(){
             return 1;
           }
           ...
         }
         ```

         get

         ```java
         Fragment1 extentds Fragment{
           ...
           public void onAttaach(Activity act){
           Activity1 act1 = (Activity1)act.getTitles()
           act1.getVersion();
           }
           ...
         }
         ```

         

   2. Fragment 将数据传递给 Activity

      1. 接口回调

         1. 在 Fragment 中定义一个内部回调接口

            ```java
            public class Fragment1 extents Fragment{
            
            //获取到依附在 Activity 中接口
            private FragmentListener listener;
              
            //定义 Activity 必须实现的接口方法
            public interface FragmentListener{
              int getVersion();
            }
             
            //用于回调到 Activity 中
            public int getVersion(){
              return 2;
             }
            }
            ```

         2. Fragment  的 onAttach 生命周期回调中拿到回调函数

            ```java
            public void onAttach(Activity activity){
              if(activity instanceof FragmentListener){
                listener = (FragmentListener)activity;
              }
            }
            ```

         3. 释放传递进来的对象，避免内存泄漏。

            ```java
            public void onDetach(){
              if(null != listener){
                listener = null;
              }
            }
            ```

            

   3. Activity 与 Service 通信

      1. bindServie 利用 ServiceConnection 类
      2. 简单通信，利用 Intent 进行传值
      3. 定义一个 callback 接口来监听服务中进程的变化,IBinder 调用。

### 启动模式

1. standard - 标准

   1. 在不指定启动模式的前提下，系统默认使用该模式启动 Activity
   2. 每次启动一个 Activity 都会重写创建一个新的实例
   3. Activity 它的 onCreate() ,onStart() , onResume() 都会被依次调用

2. singleTop - 栈顶复用

   1. 当前栈中已有该 Actiivty 实例，并且该实例位于栈顶时被复用
   2. 当前栈中已有该 Actiivty 实例，但是该实例不在栈顶时，创建新的实例
   3. 当前栈中不存在该 Activity 的实例中，跟 standard 标准模式一样，创建一个实例

   应用场景：

   1. IM 对话窗
   2. 新闻客服端推送

3. singleTask - 栈内复用

   1. 首先会根据 taskAffinity 去寻找当前是否存在一个对应名字的任务栈
   2. 如果不存在，创建一个新的 Task
   3. 如果存在，则得到该任务栈，查找该任务栈中是否存在该 Activity 实例

   应用场景:

   1. 应用的主页面

4. singleInstance - 给当前 Activity 开启一个单一的任务栈模式方法

   1. 该模式启动的 Activity 具有全局唯一性，独占性
   2. 如果在启动 Activity 时已经存在了一个实例，那么久复用。

   应用场景；

   1. 呼叫来电

## Service

### service 和 Thread 的区别和场景

Thread :  

程序执行的最小单元，它是分配 CPU 的基本单位

- 生命周期
  - 新建
  - 就绪
  - 运行
  - 死亡
  - 阻塞
- 场景
  - Thread 需要连续不停的每隔一段时间就要连接服务器做一种同步

Service:

Service 是 Android 的一种机制，服务是运行在主线中，是四大组件之一

- 生命周期
  - onCreate
  - onStart
  - onDestory
  - onBind
  - onUnbind

### 如何管理 service 生命周期

![](https://www.runoob.com/wp-content/uploads/2015/06/services.jpg)

- startService 只会调用一次 onCreate
- stopService (注意结合体，必须先解绑服务在停止服务) ：如果该服务同时调用 startService,bindService  如果没有unBindService 那么 stopService 停止不了服务。
- bindService：每次都会执行 onCreate 
- unBindService：onUnbind -> onDestory

### service 和 IntentService 的区别

不建议在 Service 中编写耗时的逻辑和操作，否则会引起 ANR

Service:

运行在主线程

IntentService (extends Service):

- 内部有一个工作线程 HanderThread 来处理耗时操作

- IntentService 是继承并处理异步请求的一个类
- IntentService 内部则是通过消息的方式，发送给 HandlerThread 的，然后由 Handler 中 Looper 来处理消息

### 启动服务 & 绑定服务先后次序问题

1. 先绑定服务后启动服务

   绑定服务转为启动服务的运行状态，直到 stopService 才停止。

2. 先启动服务后绑定服务

   不会转换绑定服务，但是还是会跟当前 Activity 进行绑定，如果当前 Activity 消息，那么还是会以启动服务的生命周期在后台运行。直到 stopService 才停止。

总结：

1. 启动服务的优先级比绑定高
2. 服务在其托管进程的主线程中运行（UI 线程）

### 序列化: Parcelable 和 Serializable 

序列化: 内存中的对象 -> 磁盘

反序列化： 磁盘中的对象 -> 内存

区别:

1. 实现上的差异

   1. implements Serializable

      添加一个成员变量

   2. implements Parcelable

      1. 写入流 writeToParcel 在从流中去读 createFromParcel

2. 性能

   Parcelable (组件之前传递数据，内存中传递数据推荐使用) > Serializable (写入设备推荐使用）

### Binder 

AIDL:

进程间通信（IPC）机制

1. 创建 AIDL : 实体对象， 新建 AIDL 文件，make 工程
2. 服务端 ：新建 Service , 创建 Binder 对象，定义方法
3. 客服务 ：实现 ServiceConnection ，bindService

## BoardCast

### 静态注册 & 动态注册

区别：

1. 注册方式不同（清单 xml ，代码 context.register）
2. 静态：常驻进程中，不受组件生命周期影响
3. 动态：跟随组件的生命周期

注意：

动态注册避免内存泄漏注册方式，onResume() -> register -> onPause - > unRegiser;

应用场景:

1. 静态：需要时刻监听广播
2. 动态：需要在特定时刻接受广播

总结：

1. 自动回调 onReceive 方法
2. 接收在 UI 线程，所以不能做耗时操作。

## Webview

### Webview 常见的一些坑

1. Android API level 16 以及之前的版本存在远程代码执行安全漏洞，该漏洞源于程序没有正确的限制使用 WebView.addJavascriptInterface 方法，远程攻击者可通过使用 Java Reflection API 利用该漏洞执行任意 Java 对象的方法。
2. webview 在布局文件中的使用：webview 写在其它容器中时，一定要 remove
3. Jsbridge    web 和 native 桥
4. webviewClient.onPageFinished -> WebChromeClient.onProgressChanged
5. 后台耗电
6. WebView 硬件加速导致页面渲染问题（页面闪烁，白块）- 暂时关闭硬件加速

### 关于 webview内存泄漏的问题

1. 独立进程，简单粗暴，不过可能涉及到进程间通信

2. 动态添加 WebView,对传入 WebView 中使用 Context 使用弱引用，动态添加意思是在代码中 addView 添加，销毁 Activity 的时候需要 remove 掉.

   

## 异步消息处理机制

### Handler 

提供给开发者方便进行异步消息处理的类

源码分析参考：[https://juejin.im/post/5d30b4a8f265da1b855c8f45](https://juejin.im/post/5d30b4a8f265da1b855c8f45)

Handler 面试总结:

1. Looper 类主要为了每个线程开启的单独的消息循环
2. Handler 是 Looper 的一个接口
3. 子线程中直接 new Handler() 需要创建 Looper 

### AsyncTask

Handler + 线程池

总结：

1. AsyncTask 的实例必须在主线程中创建
2. AsyncTask 的 execute 方法必须在主线程中调用
3. 回调方法，Android 会自动调用
4. 一个 AsyncTask 的实例，只能执行一次 execute 方法



# Android 高级





