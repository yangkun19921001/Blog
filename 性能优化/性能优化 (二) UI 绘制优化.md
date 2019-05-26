## CPU 与 GPU 工作流程

### 介绍

![](https://ws3.sinaimg.cn/large/005BYqpgly1g2g1283vz9j30qo0k0mx3.jpg)

CPU 的任务繁多，做逻辑计算外，还要做内存管理、显示操作，因此
在实际运算的时候性能会大打折扣，在没有 GPU 的时代，不能显示复
杂的图形，其运算速度远跟不上今天复杂三维游戏的要求。即使 CPU
的工作频率超过 2GHz 或更高，对它绘制图形提高也不大。这时 GPU
的设计就出来了

### CPU GPU 架构分析

![](<http://xingyaohuang.com/content/images/2017/09/cpu_gpu_arch.png>)

**由图分析 CPU GPU :**

1. 黄色的 Control 为控制器，用于协调控制整个 CPU 的运行，包括取出指令、控制其它模块的运行等；
2. 绿色的 ALU (Arithmetic Logic Unit) 是算术逻辑单元，用于进行数学、逻辑运行；
3. 橙色的 Cache 和 DRAM 分别为缓存和 RAW，用于存储信息；

**总结**

从 CPU / GPU 结构图可以看出，CPU 的控制器较为复杂，而 ALU 数量较少。因此 CPU 擅长各种复杂的逻辑运算，但不擅长数据尤其是浮点运算。

### 简要执行流程

![](https://ws3.sinaimg.cn/large/005BYqpgly1g2g2gzce6ij30rv0mp41m.jpg)

**栅格化概念: **栅格化是将向量图形格式表示的图像转换成位图来交于显示器

##60 HZ 刷新频率由来

**12 fps:** 由于人类眼睛的特殊生理结构，如果所看到的画面之帧率高于每秒约 10 - 12 帧的时候，就会认为是连贯的；

**24 fps:** 有声电影的拍摄及播放帧率均为 24 帧，对一般人而言可以接受；

**30 fps: ** 早期的高动态电子游戏，帧率少于每秒 30 帧的话就会显得不连贯，这是因为没有动态模糊使流畅度降低;

**60 fps: ** 在于手机交互过程中，如触摸和反馈 60 帧以下，肉眼是能感觉出来的。60 帧以上不能察觉变化。当低于 60 fps 时感觉画面有卡顿现象。

Android 系统每隔 16ms 发出 VSYNC 信号 (1000 ms / 60 = 16.66 ms) ，触发对 UI 进行渲染， 如果每次渲染都成功这样就能够达到流畅的画面所需要的 60 fps ，为了能够实现 60 fps ，这意味着计算渲染的大多数操作都必须在 16ms 内完成

## 卡顿原理分析

### 介绍

![](http://blog4jimmy.com/wp-content/uploads/2018/08/vsync_7.png)

当这一帧画面渲染时间操过 16 ms 的时候，垂直同步机制会让显示器硬件等待 GPU 完成栅格化渲染操作，这样会让这一帧画面，多停留了 16 ms,甚至更多，这样就造成了用户看起来画面停顿。

**16 毫秒的时间主要被两件事情所占用**

1. 将 UI 对象转换为一系列多边形和纹理。
2.  CPU 传递处理数据到 GPU 。所以很明显，我们要缩短
   这两部分的时间，也就是说需要尽量减少对象转换的次数，以及上
   传数据的次数。

**如何减少这 2 件事的耗时，以满足在16ms 渲染完成**

1. CPU 减少 xml 转换成对象的时间。
2. GPU 减少重复绘制的时间。
   

## 过渡绘制优化(主要减少 GPU 工作量)

### 简介

![](https://upload-images.jianshu.io/upload_images/1492901-49f8e1166542c79f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/450/format/webp)

​	GPU 的绘制过程，就跟刷墙一样，一层一层的进行， 16 ms 刷一次，这样就会造成图层覆盖的现象，即无用的图层还是绘制在底层，造成不必要的浪费。

### GPU 过渡绘制几种情况

1. 自定义控件中 onDraw 方法做了过多重复绘制。
2. 布局层次太深，重叠性太强。用户看不到区域也会渲染，导致耗时增加。

### 过渡绘制查看工具

![](https://jaeger.itscoder.com/img/postimg/cp_overdraw.png)

**真彩色: ** 没有过渡绘制

**浅蓝色: **过渡绘制一次

**浅绿色: **过渡绘制 二次

**粉红色: ** 过渡绘制 三次

**大红色: ** 过渡绘制 四次

**工具查看**

![](https://jaeger.itscoder.com/img/postimg/cp_debug_overdraw.png)

### 优化方案

1. 减少背景重复（非业务需要，不要设置背景）

   1. 去掉单个 activity的主题设置，可以在 setContentView 之前 getWindow().setBackgroupDrawable(null);

   2. 去掉所有的 activity 主题中的属性

      ```dart
      <item name="android:windowBackground">@null</item>
      ```

2. 使用裁剪来减少控件之间的重合部分（比如扑克牌）

   Android 7.0 之后系统做出了优化 invalidate() 不在执行测量和布局动作。

## 布局的优化(主要减少 CPU 工作量)

### 常用工具

1. UI Automator Viewer (Android / SDK / tool / bin /uiautomator.bat)

   ![](https://ws3.sinaimg.cn/large/005BYqpgly1g2g5gizhqdg30ob0nue81.jpg)

   uiautomatorviewer 是 android SDK 自带的工具。通过截屏并分析 XML布局文件的方式，为用户提供控件信息查看服务。该工具位于 SDK 目录下的 tools\bin 子目录下。可以看到，它是通过 bat 文件启动的。

2. monitor.bat  (Android/sdk/tools/monitor.bat)。

   [官网介绍使用](<https://developer.android.com/studio/profile/hierarchy-viewer.html?tdsourcetag=s_pcqq_aiomsg>)

   Device Monitor 窗口中 Hierarchy view；

   三个点也是代表着 View 的 Measure , Layout 和 Draw 。 

   绿: 表示该 View 的此项性能比该 View Tree 中超过 50% 的 View 都要快；例如,代表Measure 的是绿点,意味着这个视图的测量时间快于树中的视图对象的 50%。 

   黄: 表示该 View 的此项性能比该 View Tree 中超过 50% 的 View 都要慢； 

   红: 表示该 View 的此项性能是 View Tree 中最慢的；

   

## 总结

1. 自定义中 如果有出现覆盖遮挡的视图，可以按照上一层的位置来进行 裁剪。
2.  XML 中层次问题，能在一个平面显示的内容，尽量只用一个容器。
3. 尽可能把相同的容器合并 merge。
4. 能复用的代码，用 include 处理，可以减少 GPU 重复工作。









