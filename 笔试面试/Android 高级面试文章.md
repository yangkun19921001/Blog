# Android 高级面试题库

如今安卓开发不像前几年那么热门，但是高级人才依然紧缺，大家看着这句话是不是很熟悉，因为 web 高级人才也紧缺，c++ 高级人才一样紧缺，那么到了人工智能时代，人工智能时代的高级人才也同样会紧缺！似乎是高级人才的人在其他领域也是高级人才，而不是因为选择了热门才会一帆风顺。

**网上高级工程师面试相关文章鱼龙混杂，要么一堆内容，要么内容质量太浅**， 鉴于此我整理了如下安卓开发高级工程师面试题以及答案帮助大家顺利进阶为高级工程师，目前我就职于某大厂安卓高级工程师职位，在当下大环境下也想为安卓工程师出一份力，通过我的技术经验整理了面试经常问的题，答案部分会是一篇文章或者几篇文章，都是我认真看过并且觉得不错才整理出来，大家知道高级工程师不会像刚入门那样被问的问题一句话两句话就能表述清楚，所以我通过过滤好文章来帮助大家理解，进入正题：

## Handler 相关知识，面试必问！

常问的点：
Handler Looper Message 关系是什么？
Messagequeue 的数据结构是什么？为什么要用这个数据结构？
如何在子线程中创建 Handler?
Handler post 方法原理？

[Android消息机制的原理及源码解析](https://www.jianshu.com/p/f10cff5b4c25) 源码角度完整解析 
[Handler 都没搞懂，拿什么去跳槽啊？](https://juejin.im/post/5c74b64a6fb9a049be5e22fc) 
[Android Handler 消息机制（解惑篇）](https://juejin.im/entry/57fb3c53128fe100546ea4f2)
[Android 消息机制](https://blog.csdn.net/guolin_blog/article/details/9991569) **郭神的文章** 

## Activity 相关 

启动模式以及使用场景?
onNewIntent()和onConfigurationChanged()
onSaveInstanceState()和onRestoreInstanceState()
Activity 到底是如何启动的

[启动模式以及使用场景](https://blog.csdn.net/black_bird_cn/article/details/79764794) 详细的解释场景并且以及一些坑
[onSaveInstanceState以及onRestoreInstanceState使用](https://www.jianshu.com/p/27181e2e32d2) 简单通透
[onConfigurationChanged使用以及问题解决](https://www.jianshu.com/p/0127fb67516d) 全面得描述了各种情况
[Activity 启动流程解析](https://blog.csdn.net/zhaokaiqiang1992/article/details/49428287)

## Fragment   

Fragment 生命周期和 Activity 对比
Fragment 之间如何进行通信
Fragment的startActivityForResult
Fragment重叠问题

[Fragment 初探](https://blog.csdn.net/guolin_blog/article/details/8881711)
[Fragment 重叠， 如何通信](https://blog.csdn.net/qq_24442769/article/details/77679147)
[Fragment生命周期](https://www.jianshu.com/p/1b3f829810a1)

## Service 相关 

**进程保活Service的运行线程（生命周期方法全部在主线程）Service启动方式以及如何停止ServiceConnection里面的回调方法运行在哪个线程？**

[startService 和 bingService区别](https://www.jianshu.com/p/d870f99b675c) 完整讲解了它们之间得区别
[进程保活一般套路](https://juejin.im/entry/58acf391ac502e007e9a0a11) 把进程保活手段都讲了一遍
[关于进程保活你需要知道的一切](https://www.jianshu.com/p/63aafe3c12af) 10万+ 关于进程保活得文章

## Android布局优化之ViewStub、include、merge 

什么情况下使用 ViewStub、include、merge？
他们的原理是什么？

[ViewStub、include、merge概念解析](https://blog.csdn.net/u012792686/article/details/72901531)
[Android布局优化之ViewStub、include、merge使用与源码分析](https://blog.csdn.net/bboyfeiyu/article/details/45869393)

## BroadcastReceiver 相关 

注册方式，优先级
广播类型，区别
广播的使用场景，原理

[Android广播动态静态注册](https://blog.csdn.net/csdn_aiyang/article/details/68947014) 通俗易懂
[常见使用以及流程解析](https://blog.csdn.net/carson_ho/article/details/52973504)
[广播源码解析](https://www.jianshu.com/p/02085150339c)

## AsyncTask相关 

AsyncTask是串行还是并行执行？
AsyncTask随着安卓版本的变迁

[AsyncTask完全解析](https://blog.csdn.net/guolin_blog/article/details/11711405) **郭神的文章 一篇足够 从使用到源码**
[串行还是并行](https://blog.csdn.net/singwhatiwanna/article/details/17596225) 

## Android 事件分发机制 

onTouch和onTouchEvent区别，调用顺序
dispatchTouchEvent， onTouchEvent， onInterceptTouchEvent 方法顺序以及使用场景
滑动冲突，如何解决

[事件分发机制](https://blog.csdn.net/guolin_blog/article/details/9097463) 郭神出品
[事件分发解析](https://blog.csdn.net/lmj623565791/article/details/39102591) 鸿洋出品
[dispatchTouchEvent， onTouchEvent， onInterceptTouchEvent方法的使用场景解析](https://www.jianshu.com/p/d3758eef1f72)

## Android View 绘制流程 

简述 View 绘制流程
onMeasure， onlayout， ondraw方法中需要注意的点
如何进行自定义 View
view 重绘机制

[Android LayoutInflater原理分析，带你一步步深入了解View(一)](https://blog.csdn.net/guolin_blog/article/details/12921889)
[Android视图状态及重绘流程分析，带你一步步深入了解View(二)](https://blog.csdn.net/guolin_blog/article/details/16330267)
[Android视图状态及重绘流程分析，带你一步步深入了解View(三)](https://blog.csdn.net/guolin_blog/article/details/17045157)
[Android自定义View的实现方法，带你一步步深入了解View(四)](https://blog.csdn.net/guolin_blog/article/details/17357967)
**别问我为什么推荐这么多郭神的文章，因为我是看着郭神的文章长大的！**

## Android Window、Activity、DecorView以及ViewRoot 

[Window、Activity、DecorView以及ViewRoot之间的关系](https://www.jianshu.com/p/8766babc40e0)

## Android 的核心 Binder 多进程 AIDL 

常见的 IPC 机制以及使用场景
为什么安卓要用 binder 进行跨进程传输
多进程带来的问题

[AIDL 使用浅析](https://blog.csdn.net/lmj623565791/article/details/38461079)
[binder 原理解析](https://zhuanlan.zhihu.com/p/35519585) 真的不错
[binder 最底层解析](https://blog.csdn.net/luoshengyang/article/details/6618363/) 很难理解，我看了几遍还是了解一个大概
[多进程通信方式以及带来的问题](http://wuxiaolong.me/2018/02/15/AndroidIPC/)
[多进程通信方式对比](https://blog.csdn.net/u011240877/article/details/72863432)



## Android 高级必备 ：AMS,WMS,PMS 

这部分真的复杂！
AMS,WMS,PMS 创建过程

[AMS,WMS,PMS全解析](https://www.cnblogs.com/sunkeji/articles/7650482.html)
[AMS启动流程](https://blog.csdn.net/itachi85/article/details/76405596) 
[WindowManagerService启动过程解析](https://blog.csdn.net/itachi85/article/details/78186741)
[PMS 启动流程解析](https://blog.csdn.net/lilian0118/article/details/24455019)

## Android ANR  

为什么会发生 ANR？
如何定位 ANR？
如何避免 ANR？

[什么是 ANR](https://droidyue.com/blog/2015/07/18/anr-in-android/)
[如何避免以及分析方法](https://www.jianshu.com/p/388166988cef)
[Android 性能优化之 ANR 详解](https://juejin.im/post/58e5bd6dda2f60005fea525c)

## Android 内存相关 

**注意：内存泄漏和内存溢出是 2 个概念**

什么情况下会内存泄漏？
如何防止内存泄漏？

[内存泄漏和溢出的区别](https://blog.csdn.net/u013435893/article/details/50608190)
[OOM 概念以及安卓内存管理机制](http://hukai.me/android-performance-oom/)
[内存泄漏的可能性](https://www.jianshu.com/p/ac00e370f83d)
[防止内存泄漏的方法](https://www.jianshu.com/p/c5ac51d804fa)

## Android 屏幕适配 

屏幕适配相关名词解析
现在流行的屏幕适配方式

[屏幕适配名词以及概念解析](https://blog.csdn.net/zhaokaiqiang1992/article/details/45419023)
[今日头条技术适配方案](https://zhuanlan.zhihu.com/p/37199709)

## Android 缓存机制 

LruCache使用极其原理

[Android缓存机制](https://www.jianshu.com/p/2608f036f362)
[LruCache使用极其原理述](https://www.jianshu.com/p/b49a111147ee)

## Android 性能优化 

如何进行 内存 cpu 耗电 的定位以及优化
性能优化经常使用的方法
如何避免 UI 卡顿

我正在看极客时间的Android开发高手课，里面的性能优化文章不错

[性能优化全解析，工具使用](https://juejin.im/post/5a0d30e151882546d71ee49e)
[性能优化最佳实践](https://juejin.im/post/5b50b017f265da0f7b2f649c)
[知乎高赞文章](https://zhuanlan.zhihu.com/p/30691789)

## Android MVC、MVP、MVVM 

好几种我该选择哪个？优劣点

任玉刚的文章： [设计模式选择](https://juejin.im/post/5b3a3a44f265da630e27a7e6)

## Android Gradle 知识 

这俩篇官方文章基础的够用了
[必须贴一下官方文档：配置构建](https://developer.android.com/studio/build?hl=zh-cn)
[Gradle 提示与诀窍](https://developer.android.com/studio/build/gradle-tips?hl=zh-cn)

Gradle插件 了解就好 
[Gradle 自定义插件方式](https://blog.csdn.net/eclipsexys/article/details/50973205)
[全面理解Gradle - 执行时序](https://blog.csdn.net/singwhatiwanna/article/details/78797506)

[Gradle系列一](https://juejin.im/post/5af4f117f265da0b9f405221#heading-2)
[Gradle系列二](https://juejin.im/post/5afa06466fb9a07aaa1163f1)
[Gradle系列三](https://juejin.im/post/5b02113a5188254289190671)

## RxJava 

使用过程，特点，原理解析
[RxJava 名词以及如何使用](https://blog.piasy.com/2016/09/15/Understand-RxJava/index.html)
[Rxjava 观察者模式原理解析](https://juejin.im/post/58dcc66444d904006dfd857a)
[Rxjava订阅流程，线程切换，源码分析 系列](https://juejin.im/post/5a209c876fb9a0452577e830)

## OKHTTP 和 Retrofit 

[OKHTTP完整解析](https://blog.csdn.net/lmj623565791/article/details/47911083) --鸿洋出品
[Retrofit使用流程，机制详解](https://blog.csdn.net/carson_ho/article/details/73732076)
[从 HTTP 到 Retrofit](https://www.jianshu.com/p/45cb536be2f4)
[Retrofit是如何工作的](https://www.jianshu.com/p/cb3a7413b448)

## 最流行图片加载库： Glide 

**郭神系列 Glide 分析**
[Android图片加载框架最全解析（一），Glide的基本用法](https://blog.csdn.net/guolin_blog/article/details/53759439)
[Android图片加载框架最全解析（二），从源码的角度理解Glide的执行流程](https://blog.csdn.net/guolin_blog/article/details/53939176)
[Android图片加载框架最全解析（三），深入探究Glide的缓存机制](http://blog.csdn.net/guolin_blog/article/details/54895665)
[Android图片加载框架最全解析（四），玩转Glide的回调与监听](https://blog.csdn.net/guolin_blog/article/details/70215985)
[Android图片加载框架最全解析（五），Glide强大的图片变换功能](http://blog.csdn.net/guolin_blog/article/details/71524668)
[Android图片加载框架最全解析（六），探究Glide的自定义模块功能](http://blog.csdn.net/guolin_blog/article/details/78179422)
[Android图片加载框架最全解析（七），实现带进度的Glide图片加载功能](http://blog.csdn.net/guolin_blog/article/details/78357251)
[Android图片加载框架最全解析（八），带你全面了解Glide 4的用法](http://blog.csdn.net/guolin_blog/article/details/78582548)

## Android 组件化与插件化 

业务大了代码多了会用到。

为什么要用组件化？
组件之间如何通信？
组件之间如何跳转？

[Android 插件化和热修复知识梳理](https://www.jianshu.com/p/704cac3eb13d)
[为什么要用组件化](https://blog.csdn.net/guiying712/article/details/55213884)
[1、Android彻底组件化方案实践](https://www.jianshu.com/p/1b1d77f58e84)
[2、Android彻底组件化demo发布](https://www.jianshu.com/p/59822a7b2fad)
[3、Android彻底组件化-代码和资源隔离](https://www.jianshu.com/p/c7459b59dcd5)
[4、Android彻底组件化—UI跳转升级改造](https://www.jianshu.com/p/03c498e05a46)
[5、Android彻底组件化—如何使用Arouter](https://www.jianshu.com/p/aa17cf4b2dca)

[插件化框架历史](https://juejin.im/entry/59decdf36fb9a0451c39621b)
[深入理解Android插件化技术](https://zhuanlan.zhihu.com/p/33017826) 阿里插件化技术
[Android 插件化和热修复知识梳理
](https://www.jianshu.com/p/704cac3eb13d)

## 面试常问的点 

除了上面整理的安卓高级技术问题，还有一些面试官喜欢问的点，大家针对准备回答：

- 你在项目中遇到最难得点是什么？如何解决的？
- 平时遇到问题了是如何解决的？比较好的回答： 官方文档一定要看，通过源码解决问题，然后才是搜索引擎以及和同事讨论
- 你最近做的 APP 是如何架构的？为什么要这样架构？
- 平时怎么进行技术进阶，如何学习？
- 你觉得自己处于什么技术水平？
- 你的技术优势是什么？
- 用过什么开源技术？它的原理是什么？看过它的源码么？ 这里建议看上面 Glide 相关

