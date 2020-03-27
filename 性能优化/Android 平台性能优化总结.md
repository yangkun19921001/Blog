## 前言
如果你已经有 2 - 3 年以上开发经验还不懂的怎么去优化自己的项目，那就有点说不过去了，下面是我自己总结的一套入门级别的 Android 性能优化。如果图片不清晰文末可以下载原始 xmind 图。

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200327002447.png)



> 如果你正在找工作, 那么你需要一份 [Android 高级开发面试宝典](https://github.com/yangkun19921001/Blog/blob/master/%E7%AC%94%E8%AF%95%E9%9D%A2%E8%AF%95/Android%E9%AB%98%E7%BA%A7%E5%B7%A5%E7%A8%8B%E5%B8%88%E9%9D%A2%E8%AF%95%E5%BF%85%E5%A4%87/README.md)

## 启动

### 查看耗时

1. LogCat 过滤 Displayed 可以查看 Activity 启动时间

2. 保存 trace 文件，查看具体耗时函数启动时间                      

   ```java
   //开始计时
   Debug.startMethodTracing(filePath);
     中间为需要统计执行时间的代码
   //停止计时
   Debug.stopMethodTracing();
   ```

3. 通过 systrace 查看耗时

   1. 命令输入  systrace.py gfx view wm am pm ss dalvik app sched -b 90960 -a 包名 -o test.log.html
   2. chrom 输入 chrome://tracing/ 点击 load 加载 html 
   3. 只看当前进程

### 黑白屏

**原因:**

- 系统 AppTheme 主题 设置了windowBackground 

**优化:**

1. 在自己的 AppTheme 加入 windowBackgroup。
2. 设置 windowbackgroup android:windowIsTranslucent 透明 。
3. 为第一个SplashActivity 单独设置一个主题，相当于加入广告页  。

### 启动优化方案

#### 1. Application 启动优化

1. Application 生命周期中如果需要延迟初始化的，对异步要求不高可以选择开子线程。
2. 懒加载，用的时候才初始化
3. 改用 IntentService onHandleIntent  加载耗时任务

#### 2. 线程优化

1. 控制线程数据量使用线程池
2. 检查线程之间锁机制，是否相互过于依赖

#### 3. GC 优化

1. 避免进行大量的字符串操作，特别是序列化和反序列化
2. 频繁创建的对象需要考虑复用

#### 4. 主页面启动优化建议

1. 布局减少层级关系
2. onCreate 中不要做耗时任务
3. 使用 ViewStub 、include 、merge 标签
4. 闲时调用，通过 IdleHandler 来实现主线程闲时监控，用于加载一些不那么重要的资源

#### 5. APK 瘦身

1. 代码资源混淆
2. 减少 dex 数量

#### 6. redex 重排列 class 文件

redex 是 Facebook 开源的一款字节码优化工具，目前只支持 mac 和 linux。

通过文件重排列的目的，将启动阶段需要用到的文件在 APK 文件中排布在一起，尽可能的利用 Linux 文件系统的 pagecache 机制，用最少的磁盘 IO 次数，读取尽可能多的启动阶段需要的文件，减少 IO 开销，从而达到提升启动性能的目的。

####7. MultiDex 

**原理:**

1. 将 APK 解压，找到 dex 然后压缩成 zip
2. 每个 zip 文件做 ODEX 优化，生成 classesN.zip.odex

3. 将 zip 通过DexPathLists 的  makeDexElements 制作成 Elements 数组
4. 将制作出来的数组添加到新数组的后面

**冷启动优化方案 5.0 以下：**

在第一次启动的时候，直接加载没有经过 OPT 优化的原始 DEX，先使得 APP 能够正常启动。然后在后台启动一个单独进程，慢慢地做完 DEX 的 OPT 工作，尽可能避免影响到前台 APP 的正常使用。



## 内存

### 概念

#### 内存管理机制

##### Java

1. 内存分配机制

   - 线程共享

     **方法区:**

     - ClassLoader 加载类信息
     - 常量、静态变量
     - 编译后的代码
     - 符号引用类、接口全名、方法名

     **堆:**

     - 对象实例

   - 线程独有

     **虚拟机栈:**

     - 我们平时遇见的 stackoverflow 异常就是这块区域

     **程序计数器:**

     - 执行代码的指示器

     **本地方法栈:**

     - 本地 native 方法

2. 内存分配策略

   - 年轻代

     **Eden:**

     - 大多数情况下，对象优先分配在该区域

     **S0:**

     - 当 Eden 空间满时，还存活的对象放入该区

     **S1:**

     - 当 S0 空间满时，存放的对象复制到该区域，当 S1 区域也满时，从 S0 复制过来的清切此时还存活的对象，将被复制到老年代

   - 老年代

     - 1. 大对象直接进入老年代
     - 2. 年轻代内存满了之后会存入

3. 内存回收机制 

   - 如何确定一个对象是否需要回收？

     - 1. 引用计数法: 每次引用都让计数器加一(目前已不推荐)

     - 2. 可达性分析算法：从 GC Root 作为起点往下开始搜索，只要达到的都是活着的

   - 垃圾收集算法

     - 1. 标记-清除
     - 2. 标记-整理
     - 3. 复制
     - 4. 分代收集
          - 年轻代: 复制算法
          - 老年代 ：标记-清除、标记-整理

   - 引用类型

     - 强引用 ：用的最多，比如 Student s = new Student() GC 永远不会回收
     - 弱引用: GC 只要扫描到弱应用那么就回收
     - 软引用: 只有内存不足是才回收
     - 虚引用: 任何时候都可能被回收，相当于没有引用一样。 

##### Android

在大多数情况下，Android 通过显示的分配共享内存区域来实现动态 RAM 区域能够在不同进程之间共享的机制

### 优化内存的意义

1. 减少 OOM, 提高应用稳定性
2. 减少卡顿，提高应用流畅度
3. 减少内存占用，提高应用后台存活
4. 减少异常发生，减少代码逻辑隐患

### 内存检测工具

1. MAT
2. LeakCanary

### 内存泄漏

- 定义: 

  当这个对象不需要再使用，应该完整的执行最后的生命周期，但是由于某些原因，对象虽然已经不再使用，仍然在内存中并没有结束整个生命周期，这就意味着对象已经泄漏了。

- 内存泄漏场景

  1. 资源型对象未关闭: Cursor,File
  2. 注册对象未销毁: 广播，回调监听
  3. 类的静态变量持有大数据对象
  4. 非静态内部类的静态实例
  5. Handler 临时性内存泄漏: 使用静态 + 弱引用，退出即销毁
  6. 容器中的对象没清理造成的内存泄漏
  7. WebView: 使用单独进程

### 内存抖动

一般指在很短的时间内发生了多次的内存分配和释放。会直接造成应用卡顿。

### 内存优化方案

####1. AutoBoxing(自动装箱)

能用 int 坚决不用 Integer

#### 2. 内存复用

1. 有效利用系统自带的资源
2. 视图复用(ViewHolder)
3. 对象池
4. Bitmap 对象复用: 利用 Bitmap 的 inBitmap 的特性。

####3. 使用最优的数据类型 

1. HashMap 与 ArrayMap 的选型

   当对象的数目在 1K 以内，但是访问特别多，或者删除和插入频率不高时可以使用 ArrayMap

#### 4. 枚举类型: 

使用注解枚举限制替换 Enum

#### 5. 图片内存优化

1. 选择合适的位图格式

   通过设置 options.inPreferredConfig = RGB_8888 来决定解码格式

   RGB_8888 ：4byte

   RGB_565：2byte

   ARGB_4444: 透明 16 byte

   ALPHA_8：透明 1byte

2. 建议 Bitmap 优化代码 

   1. Bitmap 内存占用计算

      **加载资源文件计算方式: **

      长 * (设备 dpi / 资源目录对应的 dpi) * 宽 * (设备 dpi / 资源目录对应的 dpi) * 位图格式 = /1024/1024 = ? MB 

      **其它:**

      w * h * 位图格式

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

3. 图片多级缓存设计

####6. static final

基本数据类型如果不用修改的建议全部写成 static final,因为 它不需要进行初始化工作，直接打包到 dex 就可以直接使用，并不会在 类 中进行申请内存

#### 7. 拼接优化

字符串拼接别用 +=，使用 StringBuffer 或 StringBuilder 

####8. 重复申请内存问题

- 同一个方法多次调用，如递归函数，回调函数中 new 对象
- 不要在 onMeause, onLayout, onDraw 中去刷新 UI

#### 9. 图片格式优化

drawable 中的 png,jpg 图片转换为 webp 格式图片

#### 10. 色彩格式转换

不要用 Java 代码转换 RGB 格式或者转 Bitamp 资源。特占内存资源



## 耗电

### Battery-Historian

#### 优化建议

##### 1. 加入电量白名单

##### 2. GPS 优化

1. 选择合适的定位模式
2. 选择合适的定位间隔
3. 不用及时注销

##### 3. 文件上传

不是紧急的文件可以选择用户连接 wifi 在上传，同时配个一定的规则，避免用户一直使用 4G 环境(可以选择如果在多少时间内网络状态还是 wifi 并且在充电状态下可以选择上传大文件，比如 APP 日志等) 

##### 4. 慎用 WakeLock 唤醒 CPU 

1. 亮屏替换

   ```java
   //在Activity中： 
   getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
   
   //或在布局中添加这个属性：
   android:keepScreenOn="true"
   
   ```

2. alarm 闹钟让 CPU 间断式工作

##### 5. JobScheduler (8.0 后 Google 推荐使用)

1. 把工作任务放到合适的时间再去执行，比如充电时间，wifi 连接后
2. 可以把多个任务合并到一起，再选择时间去执行
3. 在充电并且连接 wifi 的状态下发送数据（这里旋转屏幕是为了发送数据用的）

##### 6. 减少 View 绘制，借鉴 布局优化

##### 7. 复杂计算尽量使用 native 处理

##### 8. TCP 心跳机制建议 30s 以后

#####9. 定时器任务如果不是特殊的也尽量在 30s 以后



## 稳定流畅

### 流畅

1. 显示原理

   1. 绘制原理

      - 1. 当 Activity 成功创建，并且调用 onCreate 声明周期的时候，会执行将 setContentView 的布局 ID 转换为 View 对象的一个过程

      - 2. 拿到转换后的 View Tree ,请求接收 VSYNC 垂直同步的消息，收到消息之后会执行 performTraversals 函数最后实行绘制

           1. onMeasure : 用深度优先的原则递归所有视图的宽高，获取当前 View 的正确宽高之后，可以调用它的成员函数 Measure 来设置它的大小。如果当前正在测量的子视图 child 是一个容器，那么它又会重复执行操作，直到它的所有子视图的大小都测量完毕。
           2.  onLayout：用深度优先原则得到所有视图 View 的位置，当一个子 View 在应用程序窗口左上角的位置确定之后，再结合它在前面测量过程中确定的宽高，就可以完全确定它在应用程序窗口中的布局。

           3. onDraw: 目前 Android 支持两种绘制方式，软件绘制和硬件加速(GPU)，其中硬件加速在 Android 3.0 开始已经全面支持，很明显，硬件加速在 UI 的显示和绘制的效率远远高于 CPU 的绘制，但是硬件加速也有缺点:
              1. 耗电问题: GPU 的功耗比 CPU 高
              2. 兼容问题: 某些接口和函数不支持硬件加速
              3. 内存大: 使用 OpenGL 的接口至少需要 8MB 的内存

           

           

   2. 刷新原理

      View 的 requestLayout 和 ViewRootImpl##setView 会调到ViewRootImpl 的 requestLayout方法，然后通过 scheduleTraversals 方法向Choreographer 提交一个绘制任务，然后再通过 DisplayEventReceiver 向底层请求 vsync 信号，当 vsync 信号来的时候，会通过 JNI 回调回来，通过 Handler 往主线程消息队列post一个异步任务，最终是 ViewRootImpl 去执行那个绘制任务，调用 performTraversals 方法，里面是 View 的三个方法的回调。

      ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200326235213.png)

   3. 卡顿的根本原因

      从刷新原理来看卡顿的根本原理是有两个地方会造成掉帧，一个是主线程有其它耗时操作，导致doFrame 没有机会在 vsync 信号发出之后 16 毫秒内调用；还有一个就是当前doFrame方法耗时，绘制太久，下一个 vsync 信号来的时候这一帧还没画完，造成掉帧。

      

      **避免在主线程中做耗时任务**

      1. UI 生命周期的控制
      2. 系统事件的处理
      3. 消息处理
      4. 界面布局
      5. 界面绘制
      6. 界面刷新

      

      

2. 性能检测/分析工具

   1. 分析
      1. TraceVIew
      2. Systrace UI
   2. 监控
      1. 基于 Looper 的 Printer 分发消息的时间差值来判断是否卡顿
      2. Android 系统从 4.1(API 16) 开始加入 Choreographer 类，用于同 Vsync 机制配合，实现统一调度界面绘图。 系统每隔 16.6ms 发出 VSYNC 信号，来通知界面进行重绘、渲染，理想情况下每一帧的周期为 16.6ms，代表一帧的刷新频率。开发者可以通过 Choreographer 的 postFrameCallback 设置自己的 callback，你设置的 callcack 会在下一个 frame 被渲染时触发。因此，1S 内有多少次 callback，就代表了实际的帧率。然后我们再记录两次 callback 的时间差，如果大于 16.6ms，那么就说明 UI 主线程发生了卡顿。同时，设置一个报警阀值 100ms，当 UI 主线程卡顿超过 100ms 时，就上报卡顿的耗时以及当时的堆栈信息。 
      3. BlockCanary: 监控 UI 卡顿

3. 布局优化

   **布局优化必备分析工具**

   1. Hierarchy Viewer: 用来检查 Layout 层级关系
   2. 检查是否过度绘制工具：手机设置->开发者选项->打开 GPU 过度绘制开关

   优化方案

   1. 减少层级

      1. 合理使用 RelativeLayout 与 LinearLayout 布局。

      2. 合理使用 Merge 布局标签

      3. 如果布局层级确实很多，可以不使用 setContentView 直接使用系统的 content 布局 ID 最后直接 addView(View v) 也行。

   2. 提高显示速度

      1. ViewStub

         应用场景: 当某个布局当中的子 View布局非常多，但并不是所有元素都同时显示出来，而是 二选一或者 N 选一，打开布局在选择。那么这个时候就可以考虑时候该标签，而不是使用 VISIBLE 或 INVISIBLE 属性。

   3. 布局复用

      如果多个 xml 布局中都会使用相同的布局对象，那么可以考虑把相同的布局抽出一个单独的布局文件，然后以 include 形式添加

   4. 如何避免过度绘制

      1. 布局上的优化

         1. 移除 XML 中非必须的背景，或根据条件设置。 

         2. 移除 Window 默认的背景。

         3. 按需显示占位背景图片

      2. 自定义 View 上的优化：如果有覆盖绘制的情景，应该把覆盖的区域裁剪。

   总结:

   1. 布局的层级越少，加载速度越快。
   2. 减少同一层控件的数量，加载速度会变快。
   3. 一个控件的属性越少，解析越快。
   4. 尽量多使用 RelativeLayout 与 LinearLayout 布局。
   5. 将可复用的组件抽取出来，在需要使用的地方通过 include 标签加载。
   6. 使用 ViewStub 标签加载不常用的布局
   7. 使用 merge 标签减少布局的嵌套层级
   8. 尽可能少用 wrap_content ,wrap_content 会增加布局 measure 时的计算成本，已知宽高为固定值时，不要使用 wrap_content 属性
   9. 删除控件中无用属性

4. 提升动画性能

   1. 尽量别用补间动画，改为属性动画，因为通过性能监控发现补间动画重绘非常频繁
   2. 使用硬件加速提高渲染速度，实现平滑的动画效果。

   

### 稳定

1. 提高代码质量

   1. 团队之前可以相互代码审查
   2. 使用 Link 扫表代码，是否有缺陷性。

2. Crash

   1. 通过实现 Thread.UncaughtExceptionHandler 接口来全局监控异常状态，发生 Crash 及时上传日志给后台，并且及时通过插件包修复。
   2. native 捕获
      1. 线上可以使用腾讯的 Bugly 框架 
      2. 局域网内开发可以使用Google 开源的 breakpad 框架

3. ANR

   - 产生 ANR 原因
     	1. 主线程堵塞，死循环
     	2. 死锁
     	3. 频繁大量 GC
     	4. 当前应用程序抢占 CPU 时间片失败

4. 提高后台存活

   1. Activity 提权：监控手机锁屏解锁事件，在屏幕锁屏时启动 1 个像素透明的 Activity ，在用户解锁时将 Activity 销毁掉，从而达到提高进程优先级的作用。
   2. Service 提权 ：SDK >= 26 通过 startForegroundService 启动一个前台服务，如果开启 startForegroundService 前台服务，那么必须在 5 s内开启一个前台进程的服务通知栏,不然会报 ANR
   3. 广播拉活：在发生特定系统事件时，系统会发出广播，通过在 AndroidManifest 中静态注册对应的广播监听器，即可在发生响应事件时拉活。但是从android 7.0 开始，对广播进行了限制，而且在 8.0 更加严格。
   4. 全家桶拉活
   5. Service 机制拉活
   	将 Service 设置为 START_STICKY，利用系统机制在 Service 挂掉后自动拉活
   只要 targetSdkVersion 不小于5，就默认是 START_STICKY。
   但是某些 ROM 系统不会拉活。并且经过测试，Service 第一次被异常杀死后很快被重启，第二次会比第一次慢，第三次又会比前一次慢，一旦在短时间内 Service 被杀死 4-5 次，则系统不再拉起。

   6. 账号同步拉活（只做了解，不靠谱）
   7. JobScheduler 拉活(靠谱，8.0 官方推荐)
   	JobScheduler 允许在特定状态与特定时间间隔周期执行任务。可以利用它的这个特点完成保活的功能,效果即开启一个定时器，与普通定时器不同的是其调度由系统完成。
   注意 setPeriodic 方法
   在 7.0 以上如果设置小于 15 min 不起作用，可以使用setMinimumLatency 设置延时启动，并且轮询


   8. 推送拉活：根据终端不同，在小米手机（包括 MIUI）接入小米推送、华为手机接入华为推送。
   9. Native 拉活：Native fork 子进程用于观察当前 app 主进程的存亡状态。对于 5.0以上成功率极低。 
   10. 后台循环播放一条无声文件 
   	耗电
   11. 双进程守护 (靠谱) 
   13. 加入白名单电量优化
   总结:  Activity + Service 提权 + Service 机制拉活 + JobScheduler 定时检测进程是否运行 + 后台播放无声文件 + 双进程守护可以组成一个进程保活终极方案。

   

   

## 网络

1. 连接服务器优化策略
	1. 不用域名，用 IP 直连
	2. 服务器合理部署
2. 获取数据优化策略
	1. 连接复用
	2. 请求合并
	3. 减小请求数据大小：对于 POST 请求，Body 可以做 Gzip 压缩，如日志。
	4. 减小返回数据大小
	   1. 使用 Gzip 压缩
	   2. 精简数据格式
	   3. 对于不同的设备不同网络返回不同的内容 如不同分辨率图片大小
	   4.  需要数据更新时，可考虑增量更新。如常见的服务端进行 bsdiff，客户端进行 bspatch。 
	   5.  支持断点续传，并缓存 Http Resonse 的 ETag 标识，下次请求时带上，从而确定是否数据改变过，未改变则直接返回 304
	   6. 缓存获取到的数据，在一定的有效时间内再次请求可以直接从缓存读取数据。 





## 存储

### SharedPreferences 

	#### 性能问题

1. 当 SharePreferences 文件还没有被加载内存时，调用 getSharedPreferences 方法会初始化文件并读入内存，这容易导致耗时更长
2. Editor 的 commit 或者 apply 方法每次执行时，同步写入磁盘耗时较长。

#### 优化建议

1. 使用 apply 异步写入
2. SharedPreferences 类中的 commitToMember() 方法会锁定 SharedPreferences 对象，Put 和 getEditor 方法会锁定 Editor 对象，在写入磁盘时更会锁定一个写入锁，因此要避免频繁的读写 SharedPreferences ，减少无畏的调用。
3. 对于 SharedPreferences 的批量操作，最好先获取一个 editor ，进行批量操作，然后调用 apply 方法。这样会比 commit 方法性能高

###SQLite
	1. 使用事务
		beginTransaction
		setTransactionSuccessful
		endTransaction
	2. 使用索引
	3. 异步线程



## 自定义View

1. 加载长图大图优化
	1. 压缩图片
	2.  沿着对角线缩放
	3.  加载屏幕能够看见的区域
	4. 复用上一个 bitmap 区域的内存
	5. 处理滑动 



## 日志

#### 问题: 

Android 平台使用 java 实现日志模块，每有一句日志就加密写进文件。这样在使用过程中不仅存在大量的 GC，更致命的是因为有大量的 IO 需要写入，影响程序性能很容易导致程序卡顿。选择这种方案，在 release 版本只能选择把日志关掉。当有用户反馈时，就需要给用户重新编一个打开日志的安装包，用户重新安装重现后再通过日志来定位问题。不仅定位问题的效率低下，而且并不能保证每个需要定位的问题都能重现。

#### 解决方案: 

**mars:xlog**

1. 先把日志缓存到内存中 mmap
2. 为了进一步减少需要加密和写入的数据，在加密之前可以先进行压缩
3.  当到一定大小时再加密
4.  避免 Android 平台下存在频繁 GC 的问题，可以使用 C++ 来实现写入文件。



## APK

###APK 极限瘦身
	1.   将图片转换为 webp 格式
	2.  去除多语言
	3.  去除不必要 so 库
	4.  去除无用资源 Link 检查（谨慎删除）
	5.  开启混淆
	6.  移除无用资源 shinkResource
	7.  开启删除无用资源 (严格模式和普通模式)
	8.  AndResGuard 微信资源压缩

## 总结
[所有 xmind 原图点击获得](https://github.com/yangkun19921001/Blog/tree/master/xmind/%E7%83%AD%E9%97%A8%E6%8A%80%E6%9C%AF%E6%80%BB%E7%BB%93)