# 性能优化总结

\[TOC\]

## 1. 绘制优化

### 1.1 卡顿优化

#### 卡顿的根本原因

* 绘制任务太重，绘制一帧内容耗时太长
* 主线程太忙了，导致 VSync 信号来时还没有准备好数据导致丢帧

#### 主线程主要做什么

* UI 声明周期控制
* 系统事件处理
* 消息处理
* 界面布局
* 界面绘制
* 界面刷新

处了这些以外避免将其他耗时任务放在主线程操作。

#### 性能分析工具

* 卡顿检测工具 
  * Profile GPU Rendering \(不利于分析\)
  * 通过 `adb shell dumpsys gfxinfo 包名` 可以把具体时间耗时输出到日志中
* TraceView
  * Debug.startMethodTracing\(Environment.getExternalStorageDirectory\(\) + File.separator + "test.trace"\);
  * Debug.stopMethodTracing\(\);
  * 直接拖动到 AS 中打开
* Systrace UI 性能分析

### 1.1 布局优化

* 常用布局优化工具
  * Layout Inspector
  * 布局层级查看 File -&gt;Settings -&gt; Inspections -&gt; Android Lint 
* 布局优化方法
  * 1. 减少层级
  * 1. Merge 使用\(如果用 Merge 系统在加载布局转换为对象的时候会把 Merge 标签下的子元素加载到 Parent 中\)
       1. 只能用在根元素使用
       2. 使用 merge 来加载一个布局时，必须指定一个 Parent 并且要设置 attachToRoot（true）
       3. 不能在 ViewStub 中使用 Merge 标签
       4. 如果代码层级确实很多可以参考将 Activity 的\(id/content\) 容器拿到，将 merge 添加进去。
  * 1. 提高显示速度 -  ViewStub 
  * 1. 布局复用 - include
* 建议优化点
  * 尽量多使用 RelativeLayout ,LinearLayout ,不要使用绝对布局
  * 通用布局以 include 代替
  * 使用 merge 标签减少布局层级的嵌套
  * 尽量少用 wrap\_content ,wrap\_content 会增加布局 measure 是的计算成本，已知宽高为固定值时，不用 wrap\_content.
  * 删除控件中无用属性

### 1.2 避免过度绘制

* 过度绘制检测工具 
  * Show GPU Overdraw
* 如何避免过度绘制
  * 1. 布局上的优化
       1. 移除 XML 中非必需的背景，或者根据条件设置
       2. 移除 Window 默认的背景
       3. 按需显示占位背景图片
  * 1. 自定义 View 优化
       1. 使用 canvas.quickreject\(\) 判断是否和某个矩形相交。
       2. 使用 canvas.clipRect 控制显示的区域

### 1.3 启动优化

* 1. 启动耗时监测
     1. LogCat 筛选关键字：Displayed
     2. adb shell am start -W  com.devyk.ykav\_sample/.SampleActivity
     3. 代码打点
* 1. 优化方案
     1. UI 布局 - 参考布局优化
     2. 启动加载逻辑优化
        1. 必要且耗时: 启动初始化，考虑线程
        2. 必要不耗时：首页绘制
        3. 非必要耗时：异步
        4. 非必要不耗时：用时加载

### 1.4 提升动画性能

* 使用属性动画，别用补间动画，可以开启硬件加速。

### 1.5 卡顿监控方案

* 自定义 Looper 中的 Printer 消息处理跟消息分发差值如果大于阀值说明卡顿了。

### 1.7 绘制优化总结

优化分为以下几个过程:

* 1. 发现问题
* 1. 分析问题
* 1. 找到导致问题的原因
* 1. 解决问题

## 2. 内存优化

### 2.1 了解 Android 内存管理机制

### 2.2 了解内存分配

### 2.3 了解内存回收机制

### 2.4 优化内存有什么意义 ？

* 1. 减少 OOM, 提高应用稳定性。
* 1. 减少卡顿，提高应用流程性。
* 1. 减少内存占用，提高应用后台运行时的存货率。
* 1. 减少异常发生，减少代码逻辑隐患。

### 2.5 内存分析工具

* Android 自带内存检测工具 Profile 

### 2.6 内存泄漏

* MAT 工具分析内存泄漏
* 内存泄漏监控工具： LeakCanary
* 常见内存泄漏场景 1. 资源性对象未关闭。File 、Cursor 2. 注册对象为销毁 3. 类的静态变量持有大量对象 4. 非静态内部类的静态实例 5. Handler 临时性内存泄漏 6. 容器中的对象没清理造成的内存泄漏 7. WebView

### 2.7 优化内存空间

* 1. 了解对象引用
* 1. 减少不必要的内存开销
     1. 自动装箱
     2. 内存复用
     3. 视图复用
     4. 对象池
     5. Bitmap 复用
     6. 使用最优的数据结构类型
        1. HashMap 与 ArrayMap 选型
           1. 当对象的数目非常小 （1000 以内），但是访问特别多，或者删除和插入频率不高时可以使用  ArrayMap。
           2. 当有映射容器，有映射发生，并且所有映射的容器也是 ArrayMap 时。
     7. 枚举类型
        1. 使用注解优化枚举
* 1. 图片内存优化
     1. 设置位图规格 options.inPreferredConfig = RGB\_?
        1. RGB\_8888 32 bit
        2. RGB\_565 16 bit
           1. 显示小图片
           2. 小屏幕手机或者对图片要求不高时。
        3. RGB\_4444
           1. 用于显示用户头像
     2. inSampleSize
        1. 如果内存中的图片大于屏幕显示的图片大小，或者大于指定屏幕区域的大小，这个时候就需要设置 options.inSampleSize  = ? \(1/4\) 原始图片的 1/4 大小 
     3. inScaled , inDensity 和 inTargetDensity 结合使用效果更佳

        ```java
        BitmapFactory.Options options = new BitmapFactory.Options();
        //不分配内存大小，和不返回实际 bitmap
        option.inJustDecodeBounds = true;
        BitmapFactory.decodeStream(is,null,options);
        //isScaled = true: 系统会按照现有的目标密度来重新划分目标密度
        options.isScaled = true;
        //生成对应的大小
        options.inDensity = options.outWidth;
        //设置缩放比--> 处理采样为原始图片的 1/4 大
        options.inSampleSize = 4;
        //生成对应的大小
        option.inTargetDensity = dstWith*options.inSampleSize;
        //需要分配内存大小，返回实际 bitmap
        option.inJustDecodeBounds = false;
        BitmapFactory.decodeStream(is,null,options);
        ```

     4. inBitmap

        如果设置属性为 true ，那么当使用了带有该 Options 参数的 decode 方法加载内容时，decode 方法会尝试重用一个已经存在的位图。

     5. 图片缓存

### 2.8 总结

* 1. 检查
* 1. 监控
* 1. 优化

## 3. 存储优化

* SharedPreference: 轻量级数据库，适用于保存软件配置参数\(/data/data/packageName/shared\_prefs\)。
* SQLite: 轻量级数据库，支持 SQL 语法。适用于存储数据量大比如聊天数据等。
* File: 适用于存储大数据，比如 LOG 日志等，确定更新慢
* ContentProvider: 数据共享

### 3.1 SharedPreference

是一个简单便捷的存储方式，在 Android 应用中，常用来存储一些简单配置信息，例如保存应用中的一个开关状态和一些数据的独家属性等，适用方便，存储数据类型少。

优化:

* 1. IO 性能
* 1. 同步锁问题

多用异步操作，不要基于 SP 做跨进程操作

### 3.2 File

Android 文件系统与其他平台基于磁盘的文件系统类似，文件存储对象适合于读写大量的流逝数据，如媒体文件（图片、音视频）和其他网络传输等。

### 3.2 SQLite

优化建议:

* 1. 使用 Android 系统提供的 SQLiteStatement 类来将数据插入数据库，在性能上有一定提高，也解决了  SQL 注入问题。
* 1. 使用事务（beginTranscation -&gt;setTranscationSuccessful -&gt;endTransaction ）
* 1. 异步线程，写数据库统一管理

### 3.3 ContentProvider

### 3.4 序列化

使用场景:

* 永久性保存对象，将对象的字节序列保存到本地文件中。
* 对象在网络中传递
* 对象在 IPC 间传递

3.4.1 Serializable 与 Parcelable 选择

## 4. 稳定性优化

* Crash 捕获
* ANR
* 提高后台进程存活率
* 应用进程优先级 oom\_adj = ?

  * -17 : 系统创建的 Native 进程
  * -16：系统进程，在运行的过程中永远不会杀掉，如果杀掉可能会导致严重问题
  * -12：核心进程，系统不会杀掉这类进程
  * -11：正在运行的服务进程，一般不会被杀掉
  * 0：前台进程，指正在前台运行的应用，被杀概率不大
  * 1：可见进程，用户正在使用，或者有界面在显示，除非出现异常，否则系统不会杀此类进程
  * 2：可感知进程，虽然不在前台，但进程还在状态，系统除非到内存非常紧张才会杀掉这类进程，比如播放音乐
  * 3：正在备份的进程
  * 4：高权重进程
  * 5：有 Service 进程
  * 6：与 Home 有交互的进程，比如有桌面部件和应用正在通信，widget 小挂件之类，一般尽量避免杀掉此进程
  * 7：切换进程
  * 8：缓存进程
  * 9：不活跃的进程
  * 15：缓存进程，内存不足才会被优先杀掉
  * 16：最低级别进程，只有缓存的进程

  杀进程的规则如下:

  * -12: 被杀几率较低
  * 4：Activity,高权重进程
  * 0：不会被杀
  * 进程中没有任何 Activity 会被优先杀
  * 空进程最容易被杀

## 5. 耗电优化

### 5.1 耗电检测工具

* Battery Historian

### 5.2 显示

* LCD 比 OLCD 更耗电 

### 5.3 网络

* 1. 使用WIFI 传输数据时，尽量可能增加每个包的大小（不超过 MTU） ,并降低发包的频率。
* 1. 在蜂窝移动网络下，最好做到批量执行网络请求，尽量避免频繁的间隔网络请求，尽量多地保持在 Radio Standby（空闲态） 状态。
* 1. 尽量在 WIFI 模式下使用数据传输。
* 1. 数据解析使用 JSON 和 Protobuf 
* 1. 压缩数据格式，比如采用 GZIP

### 5.4 CPU

降低使用 CPU 频率

### 5.5 应用常用优化方案

* 1. 计算优化（浮点运算比整数运算更加消耗 CPU 时间片），因此耗电也会增加，建议使用以下方式避开:
     1. 除法变乘法
     2. 充分利用位移
     3. 利用 arm neon 指令集做并行运算，需要 arm V7 以上 CPU 架构
* 1. 避免 WakeLock 使用不当
     1. PARTIAL\_WAKE\_LOCK:保持 CPU 正常运转，屏幕和键盘灯有可能会关闭
     2. SCREEN\_DIM\_WAKE\_LOCK:保持 CPU 正常运转，运行保持屏幕显示，但是会变暗，允许关闭键盘灯
     3. SCREEN\_BRIGHT\_WAKE\_LOCK:保持 CPU 运转，允许保持屏幕高亮显示，允许关闭键盘灯
     4. FULL\_WAKE\_LOCK: 保持 CPU 运转，保持屏幕高亮显示，键盘灯也保持高亮
     5. ACQUIRE\_CAUSES\_WAKEUP: 强制使屏幕亮起，这种锁主要用于一些必须通知用户的操作。
     6. ON\_AFTER\_RELEASE: 当锁为释放时，保持屏幕亮起一段时间。 
* 1. 使用 Job Scheduler
     1. 重要不紧急的任务，可以延迟执行，如定期数据库数据更新和上报
     2. 耗电较大的任务，比如充电时才希望执行的备份数据
     3. 不紧急可以不执行的网络任务，如在 wifi 环境下预加载数据
     4. 可以批量执行的任务

## 6. 安装包大小优化

### 6. 1 分析安装包大小工具

* 直接使用 AS 自带工具或者反编译 APK 分析

### 6.2 常用优化方案

* 1. 代码混淆
* 1. 资源优化
* 1. 避免重复功能的库
* 1. 使用 webP图片格式
* 1. 插件化

