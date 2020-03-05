# Google 为什么以 Flutter 作为原生突破口

![flutter.png](https://user-gold-cdn.xitu.io/2019/3/21/169a0ad070532752?w=1425&h=633&f=png&s=152122)

## Android 的前生今世

### Android 系统

Android 系统作为全球第一大系统，基于 Java 开发的移动端有着诸多的性能优势。 2018年前 H5 的性能瓶颈和 react-native 的一系列缺点\(动画性能、第三方依赖、逻辑上的额外开销、调试的困难、不能完全屏蔽原生平台 等\)导致业界对跨平台开发失去信心。 直到 2018 年 10 月 Google 推出首个 Flutter 跨平台解决方案，打破整个移动开发的方向。

## 为什么 Flutter 成为 Android 方向标

1. 跨平台性: Flutter 基于图像绘制引擎进行渲染，在不同平台下绘制效果是绝对一致的，能做到真正的跨平台，一处写处处运行
2. 性能优异性: 不同于 H5 通过 DOM 渲染 和 RN 映射组件，Flutter 直接基于 native 进行绘制。性能上完全超过原生
3. 热重载性: Android 原生开发  会遇到 编译-打包-安装 三部曲。开发效率迟迟得不到提升。热重载技术在 Flutter 内完美体现

## Flutter 详细介绍

1. Dart 语法编译: Dart 是一种强类型、跨平台的客户端开发语言。具有专门为客户端优化、高生产力、快速高效、可移植易学的风格。Dart 主要由 Google 负责开发和维护
2. Flutter 插件: Flutter 使用的 Dart 语言无法直接调用 Android 系统提供的 Java 接口，这时就需要使用插件来实现中转。Flutter 官方提供了丰富的原生接口封装

## Flutter 系统结构

![1552893059\(1\).jpg](https://user-gold-cdn.xitu.io/2019/3/20/1699a152cf1f8708?w=1395&h=590&f=png&s=182291)

## Skia 图像处理引擎

1. 2005 年 Skia 图像处理引擎成立，用来展示 Chrome  火狐 和其他 Google 自家的产品使用。
2. 2007 年 第一个 Android 系统问世，于是 Google 开发者将 Skia 移植到 Android 平台。
3. Skia 作为一个 2D 的图形系统，包括绘图，渲染，显示图片都是用 Skia 完成。

## 原生开发会接触 SKia 吗？

![1552893230\(1\).jpg](https://user-gold-cdn.xitu.io/2019/3/20/1699a152cf2bb69e?w=886&h=483&f=png&s=23885)

## Skia 引擎详解

* 疑问： 是真的吗？我只接触过 Bitmap,原来 Bitmap 下面还有很多奥秘

  ![1552893376\(1\).jpg](https://user-gold-cdn.xitu.io/2019/3/20/1699a152cf298f53?w=788&h=58&f=png&s=6520)

  ![1552893413\(1\).jpg](https://user-gold-cdn.xitu.io/2019/3/20/1699a152cf4670bf?w=865&h=523&f=png&s=18617)

  ![1552893442\(1\).jpg](https://user-gold-cdn.xitu.io/2019/3/20/1699a152cf67f1c3?w=849&h=527&f=png&s=17648)

## Skia 引擎与 Flutter 有什么关系勒？

* 除了通过 xml 方式定义布局 或者继承View  显示在 Android 屏幕外还有没有方法呢？

![1552893533\(1\).jpg](https://user-gold-cdn.xitu.io/2019/3/20/1699a153028177d6?w=849&h=107&f=png&s=3087)

## 为什么 Flutter 会实现三大特性

![1552893626\(1\).jpg](https://user-gold-cdn.xitu.io/2019/3/20/1699a152ffff7149?w=718&h=508&f=png&s=16860)

### 跨平台

![1552893676\(1\).jpg](https://user-gold-cdn.xitu.io/2019/3/20/1699a15302c5c78d?w=1024&h=639&f=png&s=259099)

### 性能优异

![1552893718\(1\).jpg](https://user-gold-cdn.xitu.io/2019/3/20/1699a1530b8c7ecf?w=1351&h=620&f=png&s=25966)

### 渲染流程

![1552893764\(1\).jpg](https://user-gold-cdn.xitu.io/2019/3/20/1699a1530095b566?w=1373&h=733&f=png&s=55005)

#### React 渲染与 Flutter 渲染相同点

![1552893882\(1\).jpg](https://user-gold-cdn.xitu.io/2019/3/20/1699a152f850226b?w=1147&h=585&f=png&s=29703)

#### React 渲染与 Flutter 渲染不同点

1. 绘制树：ReactNative 基于 ReactShadow 的链式结构在内存中形成一个虚拟的 Dom 树，Flutter 是通过引擎实现不同图层的渲染方式。
2. 机制不一样：ReactNative 最终被反射成原生控件，而 Flutter 是底层通过引擎直接渲染，不存在映射的说法。

#### Flutter 渲染

在 Flutter 界面渲染过程分为三个阶段：布局、绘制、合成，布局和绘制在 Flutter 框架中完成合成则交由引擎负责。

![1552894074\(1\).jpg](https://user-gold-cdn.xitu.io/2019/3/20/1699a1531bf5d65d?w=1161&h=617&f=png&s=43670)

## Flutter优势

* Flutter 横空出世! 在 Flutter 的响应式框架中，控件树中的控件直接通过可移植的图形加速渲染引擎、⾼性能的本地 ARM 代码进⾏绘制,不再需要通过虚拟 DOM 或虚拟控件、真实 DOM 或平台控件这些中间对象来绘制。Flutter 响应式框架通过“⽆中间商赚差价”的⽅式直接利⽤硬件的所有性能，所以正如前⾯所说的，Flutter 应⽤的性能⽐原⽣ App 更加优秀。

## 个人见解

* 相对于几大跨平台框架，个人还是很看好 Flutter 的。毕竟是 Google 的亲儿子嘛，还是可以先入坑的，自己动手写一个 Flutter APP 出来。在不同设备上跑一下，自己体验一下。

## 计划

后续我会推出从零开发一个完整的 Flutter 项目一系列文章, 把自己踩得坑记录下来。

## Flutter 系列文章

* [Flutter \(一\) Dart 语言基础详解\(变量、内置类型、函数、操作符、流程控制语句\)](https://juejin.im/post/5c91ed15518825573578c31f)
* [Flutter \(二\) Dart 语言基础详解\(异常,类,Mixin, 泛型,库\)](https://juejin.im/post/5c939b275188252d863cc797)
* [Flutter \(三\) Dart 语言基础详解 \(异步,生成器,隔离,元数据,注释\)](https://juejin.im/post/5c962b356fb9a0710e47e361)

  **感谢**

* [Flutter 中文网](https://flutterchina.club/)

