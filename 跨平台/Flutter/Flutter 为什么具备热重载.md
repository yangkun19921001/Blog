# Google 为什么以 Flutter 作为原生突破口

![1552892602(1).jpg](http://pntnlt1wq.bkt.clouddn.com/1552892602(1).jpg)

## Android 的前生今世

### Android 系统

Android系统作为全球第一大系统，基于 Java 开发的移动端有着诸多的性能优势。
2018年前 H5 的性能瓶颈和 RN 的停更  导致业界对跨平台开发失去信心。
直到2018年10月Google推出首个 Flutter 跨平台解决方案，打破整个移动开发的方向。

## 为什么 Flutter 成为 Android 方向标

1. 跨平台性：Flutter基于图像绘制引擎进行渲染，在不同平台下绘制效果是绝对一致的，能做到真正的跨平台，一处写处处运行
2. 性能优异性：不同于H5通过DOM渲染 和RN映射组件，Flutter直接基于native进行绘制。性能上完全超过原生
3. 热重载性: Android原生开发  会遇到 编译-打包-安装 三部曲。开发效率迟迟得不到提升。热重载技术在Flutter内完美体现

## Flutter 详细介绍

1. Dart 语法编译：Dart 是一种强类型、跨平台的客户端开发语言。具有专门为客户端优化、高生产力、快速高效、可移植易学的风格。Dart主要由Google负责开发和维护
2.  Flutter 插件：Flutter使用的Dart语言无法直接调用Android系统提供的Java接口，这时就需要使用插件来实现中转。Flutter官方提供了丰富的原生接口封装

## Flutter 系统结构

![1552893059(1).jpg](http://pntnlt1wq.bkt.clouddn.com/1552893059(1).jpg)

## Skia 图像处理引擎

1. 2005年Skia图像处理引擎成立，用来展示Chrome  火狐 和其他Google自家的产品使用。
2. 2007年 第一个Android系统问世，于是Google开发者将Skia移植到Android平台。
3. Skia作为一个2D的图形系统，包括绘图，渲染，显示图片都是用Skia完成。

## 原生开发会接触 SKia 吗？

![1552893230(1).jpg](http://pntnlt1wq.bkt.clouddn.com/1552893230(1).jpg)

## Skia 引擎详解

- 疑问： 是真的吗？我只接触过 Bitmap,原来 Bitmap 下面还有很多奥秘

  ![1552893376(1).jpg](http://pntnlt1wq.bkt.clouddn.com/1552893376(1).jpg)

  ![1552893413(1).jpg](http://pntnlt1wq.bkt.clouddn.com/1552893413(1).jpg)

  ![1552893442(1).jpg](http://pntnlt1wq.bkt.clouddn.com/1552893442(1).jpg)

  

## Skia 引擎与 Flutter 有什么关系勒？

- 除了通过xml方式定义布局 或者继承View  显示在Android屏幕外  还有没有 方法呢？

![1552893533(1).jpg](http://pntnlt1wq.bkt.clouddn.com/1552893533(1).jpg)

## 为什么 Flutter 会实现三大特性

![1552893626(1).jpg](http://pntnlt1wq.bkt.clouddn.com/1552893626(1).jpg)

### 跨平台

![1552893676(1).jpg](http://pntnlt1wq.bkt.clouddn.com/1552893676(1).jpg)

### 性能优异

![1552893718(1).jpg](http://pntnlt1wq.bkt.clouddn.com/1552893718(1).jpg)

### 渲染流程

![1552893764(1).jpg](http://pntnlt1wq.bkt.clouddn.com/1552893764(1).jpg)

#### React 渲染与 Flutter 渲染相同点

![1552893882(1).jpg](http://pntnlt1wq.bkt.clouddn.com/1552893882(1).jpg)

#### React 渲染与 Flutter 渲染不同点

1. 绘制树：ReactNative 基于 ReactShadow 的链式结构在内存中形成一个虚拟的 Dom 树，Flutter 是通过引擎实现不同图层的渲染方式。
2. 机制不一样：ReactNative 最终被反射成原生控件，而 Flutter 是底层通过引擎直接渲染，不存在映射的说法。

#### Flutter 渲染

在 Flutter 界面渲染过程分为三个阶段：布局、绘制、合成，布局和绘制在 Flutter 框架中完成合成则交由引擎负责。

![1552894074(1).jpg](http://pntnlt1wq.bkt.clouddn.com/1552894074(1).jpg)