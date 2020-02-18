## 前言

View 可以说是在日常开发中，天天使用的角色，虽然说 View 不属于四大组件，但是它的作用跟重要程度你真不可小视。该类型的文章打算写一个系列，对于自己复习或新手学习提供一个方式。

****

[高级 UI 成长之路 (一) View 的基础知识你必须知道]()

[高级 UI 成长之路 (二) 深入理解 Android 8.0 View 触摸事件分发机制]

[高级 UI 成长之路 (三) 深入理解 Android 8.0 View 工作原理]

[高级 UI 成长之路 (四) Paint 详解]

[高级 UI 成长之路 (五) Canvas 详解]

[高级 UI 成长之路 (六) PathMeaure 的使用]

[高级 UI 成长之路 (七) 实际开发中的屏幕适配总结]

[高级 UI 成长之路 (八) 属性动画详解]

****



## View 基础知识

该篇主要介绍 View 的一些基础知识，从而可以为后续文章内容做好铺垫，主要涉及到的内容有 View 的位置参数、MotionEvent 和 TouchSlop 对象、VelocityTracker、GestureDetector 和 Scroller 对象，通过对这些基础知识的介绍，相信你对更加复杂的操作也是手到擒来。

### View 介绍

![MNOC40.png](https://s2.ax1x.com/2019/11/14/MNOC40.png)

在介绍 View 的基础知识之前，我们需要知道它到底是什么? View 在 Android 中是所有控件的基类(结构参考上图)，不管是简单的 TextView , 还是复杂的 ViewGroup  、 CustomView 亦或者 RecyclerView 它们的共同顶级父类都是 View, 所以说, View 是一种界面层控制的一种抽象，它代表的是一个控件。从上图可知 ViewGroup 是 View 的子类，ViewGroup 在视图层它可以有任意子 View 。

明白 View 的层级关系有助于理解 View 的工作机制。从上图我们也可以知道实现自定义 View 控件可以继承自 View 也可以继承自 ViewGroup 。

### View 位置参数

View 的位置主要由它的四个顶点来决定，分别对应于 View 的四个属性: top、left、right、bottom , 其中 top 是左上角纵坐标，left 是左上角横坐标，right 是右下角横坐标，bottom 是右下角纵坐标。需要注意的是，这些坐标都是相对于 View 的父容器，因为它是一种相对坐标，View 的坐标和父容器的关系可以参考下图，在 Android 中 ，x 轴 y 轴 的正方向分别为右和下，这点不难理解，不仅仅是 Android ,其实大部分显示系统都是按照这个标准来定义坐标系的。

![坐标系](https://s2.ax1x.com/2019/11/14/MUFjJg.png)

根据上图，我们很容易得出 View 的宽高和坐标的关系:

```kotlin
val width = right - left
val height = bottom - top
```

那么如何得到 View 的这四个参数呢？也很简单，在 View 的源码中它们对应于 mLeft 、mRight 、mTop 、和 mBottom 这四个成员变量，通过代码获取方式如下:

```kotlin
val left = left;
val right = right
val top = top
val bottom = bottom
```

从 Android 3.0 开始，View 增加了 额外的几个参数，x 、y 、translationX 、translationY , 其中 x 和 y 是 View 左上角的坐标，而 translationX 和 translationY 是 View 左上角相对于父容器的偏移量。这几个参数也是相对于父容器的坐标，并且 translationX 和 translationY 的默认值是 0 ，和 View 的四个基本的位置参数一样，View 也为他们提供了 set/get 方法，这几个参数的换算关系如下所示:

```kotlin
val x = left + translationX
val y = top + translationY
```

需要注意的是，View 在平移过程中，top 和 left 表示的是原始左上角的位置信息，其值并不会发生改变，此时发生改变的是 x 、y、translationX 、translationY 这四个参数。

### MotionEvent 和 TouchSlop

**MotionEvent**

```kotlin
    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event?.action) {
            MotionEvent.ACTION_DOWN -> {
                println("手指按下")
            }
            MotionEvent.ACTION_UP -> {
                println("手指抬起")

            }
            MotionEvent.ACTION_MOVE -> {
                println("手指移动")
            }
        }
        return true

    }
```

在手指接触屏幕后所产生的一系列事件中，常用的并且非常典型的事件类型有如下几种:

- **MotionEvent.ACTION_DOWN:** 手指刚接触屏幕
- **MotionEvent.ACTION_MOVE:** 手指在屏幕上滑动
- **MotionEvent.ACTION_UP: ** 手指在屏幕上抬起的一瞬间触发该事件

正常情况下，一次手指触摸屏幕的行为会触发一些列点击事件，考虑有如下几种情况:

- **DOWN ---> UP:** 点击屏幕后立刻抬起手指松开屏幕触发的事件
- **DOWN ---> MOVE ---> MOVE ---> MOVE ---> UP:** 点击屏幕然后随着在屏幕上滑动之后在松开产生的事件

上述三种情况是典型的事件序列，同时通过 MotionEvent 对象我们可以得到点击事件发生的 x 和 y 坐标。因此，系统提供了两组方法 getX / getY 和 getRawX / getRawY 它们的区别其实很简单, 如下:

- **getX / getY :** 返回相对于当前 View 左上角的 x 和 y 的坐标
- **getRawX / getRawY :** 返回的是相对于手机屏幕左上角的 x 和 y 坐标。

**TouchSlop**

TouchSlop 官方解释就是系统所能识别的被认为是滑动的最小距离，通俗点说就是当手指在屏幕上滑动时，如果两次滑动之间的距离小于这个常量，那么系统就认为你没有在滑动，可以通过下面的 API 获取该常量值,

```kotlin
/**
  * 系统所能识别出来的被认为滑动的最小距离
  */
val scaledDoubleTapSlop = ViewConfiguration.get(context).scaledDoubleTapSlop;
```

这个常量可以帮助我们在处理滑动时，利用该数值来做一些过滤，比如当两次滑动事件的滑动距离小于这个值，我们就可以未达到滑动距离的临界点，因此就可以认为他们不是滑动，这样做可以有更好的用户体验。

### VelocityTracker 、GestureDetector 和 Scroller

**VelocityTracker**

VelocityTracker 的作用是用于追踪滑动过程中的速度，包括水平和竖直方向的速度。它的使用过程很简单，首先，在 View 的 onTouchEvent 方法中追踪当前单击事件的速度；

```kotlin
/**
  * 速度追踪
  */
 val velocityTracker = VelocityTracker.obtain()
   velocityTracker.addMovement(event)
```

接着，当我们先知道当前的滑动速度时，这个时候可以采用如下方式来获得当前的速度:

```java
velocityTracker.computeCurrentVelocity(1000)
val xVelocity = velocityTracker.getXVelocity()
val yVelocity = velocityTracker.getYVelocity()
```

这一步有 2 点需要注意，其一 获取速度之前必须先计算速度，既 getXVelocity 和 getYVelocity 这两个方法的前面必须要调用 computeCurrentVelocity 方法，第二点，这里的速度是指一段时间内手指所滑过的像素值，比如将时间间隔设为 1000 ms 时，那么就是在 1s 内手指在水平方向从左向右滑动 500 px 那么水平速度就是 500，注意速度可以为负数，当手指从右往左滑动时，水平方向速度即为负值，这个需要理解一下。速度的计算可以用如下公式:

**速度 =  ( 终点位置 - 起点位置) / 时间段**

根据上面的公式再加上 Android 系统的坐标体系，可以知道，手指逆着坐标系的正方向滑动，所产生的速度就为负值，另外，computeCurrentVelocity 这个方法的参数表示的是一个时间单元或者说时间间隔，它的单位是毫秒 （ms）, 计算速度时得到的速度就是在这个时间间隔内手指在水平或竖直方向上所滑动的像素值。

针对上面的例子，如果我们通过 obtain.computeCurrentVelocity(1000) 来获取速度，那么得到的速度就是手指在 1000 ms 毫秒内所滑过的 px 值，因此可以直接套上面公式:

**水平速度 = 500 px / 1000 ms**

既水平速度为 2  , 这里需要好好理解一下。

最后，当不需要它的时候，需要调用 clear 方法来重置并回收内存:

```kotlin
velocityTracker.clear()
velocityTracker.recycle()
```

VelocityTracker 的 API 简单明了，我们可以记住一个套路。

1. 在触摸事件为 `ACTION_DOWN`或是进入 `onTouchEvent`方法时，通过 `obtain`获取一个 VelocityTracker 
2. 在触摸事件为 `ACTION_UP`时，调用 `recycle`进行释放 VelocityTracker
3. 在进入 `onTouchEvent`方法或将 `ACTION_DOWN`、`ACTION_MOVE`、`ACTION_UP`的事件通过 `addMovement`方法添加进 VelocityTracker
4. 在需要获取速度的地方，先调用 `computeCurrentVelocity`方法，然后通过 `getXVelocity`、`getYVelocity`获取对应方向的速度

解锁更多姿势可以参考该[文章](https://juejin.im/post/5c7f4f0351882562ed516ab6)

**GestureDetector**

GestureDetector 的作用用于辅助检测用户的单机、滑动、长按、双击等行为。要使用 GestureDetector 也不复杂，参考如下过程:

1. 首先创建一个 GestureDetector 对象并实现 OnGestureListener 接口，根据需要我们还可以实现 OnDoubleTapListener 从而能够监听双击行为;

   ```kotlin
   val mGetDetector = GestureDetector(context,this)
   //解决长按屏幕后无法拖动的现象
   mGetDetector.setIsLongpressEnabled(false)
   ```

2. 接管目前 View 的 onTouchEvent 方法，在 View 的 onTouchEvent 方法中添加如下代码:

   ```kotlin
   override fun onTouchEvent(event: MotionEvent) = mGetDetector.onTouchEvent(event)
   ```

做完了上面这 2 步，我们就可以有选择的实现 OnGestureListener 和 OnDoubleTapListener 中的方法了，这 2 个接口中的方法介绍如下所示:

| OnGestureListener / 方法名 | 描述                                                         |
| -------------------------- | ------------------------------------------------------------ |
| onDown                     | 手指轻轻触摸屏幕的一瞬间，由 1 个 ACTION_DOWN 触发           |
| onShowPress                | 手指轻轻触摸屏幕, 尚未松开或拖动，由一个 ACTION_DOWN 触发,它强调的是没有松开或者拖动的状态 |
| onSingleTapUp              | 手指(轻轻触摸屏幕后)松开，伴随着 1 个 MotinEvent.ACTION_UP 而触发，这是单击行为 |
| onScroll                   | 手指按下屏幕并拖动，由 1 个 ACTION_DOWN ，多个 ACTION_MOVE 触发，这是拖动行为 |
| onLongPress                | 用户长久的按着屏幕不放，既长按                               |
| onFling                    | 用户按下触摸屏、快速滑动后松开，由 1 个 ACTION_DOWN 、多个 ACTION_MOVE 和 1 个 ACTION_UP 触发，这是快速滑动行为 |

| OnDoubleTapListener / 方法名 | 描述                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| onDoubleTap                  | 双击，由 2 次连续的单击组成，它不可能和 onSingleTapConfirmed 共存 |
| onSingleTapConfirmed         | 严格的单机行为（注意它和 onSingleTapUp 的区别，如果触发了 onSingleTapConfirmed, 那么后面不可能再紧跟着另一个单击行为，既这只可能是单击，而不可能是双击中的一次单击） |
| onDoubleTapEvent             | 表示发生了双击行为，在双击的期间， ACTION_DOWN 、ACTION_MOVE 和 ACTION_UP 都会触发此回调 |

上面图表里面的方法很多，但是并不是所有的方法都会被时常用到，在日常开发中，比较常用的有 onSingleTapUp 单击、onFling 快速滑动 、onScroll 拖动 、onLongPress 长按、onDoubleTap 双击 。另外在说一下，在实际开发中，可以不使用 GestureDector, 完全可以自己在 View 的 OnTouchEvent 方法中实现所需要的监听，这个看实际场景跟个人喜好了。

**Scroller**

Scroller 用于实现 View 的弹性滑动。我们知道，当使用 View 的 scrollTo / scrollBy 方法进行滑动时，其过程是瞬间完成的，没有一个过渡的效果体验是不友好的，那么这个时候就可以借助 Scroller 来实现过渡效果的滑动。Scroller 本身无法让 View 弹性滑动，它需要和 View 的 computeScroll 方法配合使用才能共同完成这个功能。那么如何使用 Scroller 呢？它的典型代码可以说是固定的，如下所示:

```kotlin
class ScrollerSample_1 : LinearLayout {

    constructor(context: Context, attrs: AttributeSet?) : super(context, attrs)

    constructor(context: Context) : super(context) 

    /**
     * 定义滑动 Scroller
     */
    private val mScroller = Scroller(context)


    public fun smoothScrollTo(destX: Int = -100, destY: Int = -100) {
        //滑动了的位置
        val scrollX = scrollY;
        val delta = destY - scrollY;
        //2000 ms 内滑动到 destX 位置，效果就是缓慢滑动
        mScroller.startScroll(scrollX, 0, 0, delta, 2000)
        invalidate()
    }

    override fun computeScroll() {
        if (mScroller.computeScrollOffset()) {
            scrollTo(mScroller.currX, mScroller.currY)
            postInvalidate()
        }
    }
}
```

主要实现有 3 步:

- 第一步实例化 Scroller 

- 第一步调用 Scroller 的 startScroll 方法，让其内部保存新的变量值
- 第二步重写 View 的 computeScroll 方法，调度自身的 scrollTo 方法，让其缓慢弹性滑动

## View 的滑动

上面咱们介绍了 View 的一些基本知识和一些位置参数概念，该小节将来介绍一个重要的内容 **View 的滑动**

现在市面上所有软件应该几乎都具备滑动的功能吧？可以说滑动功能是一个 APP 的标配，滑动在 Android 开发中具有很重要的作用，因此，掌握滑动的方法是实现优化用户体验的基础。滑动可以通过以下三种方式来实现，当然并不是只有三种，其它还得靠自己去挖掘。其方式如下:

1. 通过 View 本身提供的 scrollTo / scrollBy 方法来实现滑动（上一小节咱们已经用到 scrollTo 方法了）
2. 通过动画给 View 施加平移效果来实现滑动
3. 通过改变 View 的位置参数

### scrollTo、scrollBy

为了实现 View 的滑动看，自身专门提供了 scrollTo 和 scrollBy 方法来实现，如下所示:

```java
//View.java
    public void scrollTo(int x, int y) {
        /**
         * 传入的位置跟自己目前所滑动的位置不一致才开始滑动
         */
        if (mScrollX != x || mScrollY != y) {
            int oldX = mScrollX;
            int oldY = mScrollY;
            mScrollX = x;
            mScrollY = y;
            invalidateParentCaches();
            onScrollChanged(mScrollX, mScrollY, oldX, oldY);
            if (!awakenScrollBars()) {
                postInvalidateOnAnimation();
            }
        }
    }

    public void scrollBy(int x, int y) {
        /**
         * 其内部也是调用了 View 的 scrollTo 方法，把当前滑动的 mScrollX,mScrollY 分别加上指定的位					 * 置，然后滑动，多次调用相当于接着上一次位置滑动
         */
        scrollTo(mScrollX + x, mScrollY + y);
    }
```

通过上面的源码我们知道 scrollBy 方法内部是调用了 scrollTo 方法，那么他们之前有什么区别呢？请看下面分析:

**scrollTo:** 基于所传递的 x , y 坐标来进行绝对滑动，重复点击如果不改变滑动参数，那么内部就会做判断，相等就不会再滑动了。

**scrollBy:** 通过源码我们知道内部调用了 scrollTo 方法传递了 **mScrollX + x, mScrollY + y** 那么这是什么意思呢？其实就是基于当前的位置来做的相对滑动。重复点击滑动会继续在当前所在的位置上继续滑动。

还有一个知识点我们要知道，就是这里出现了 2 个默认的变量 mScrollX  , mScrollY 通过 scrollTo 内部实现我们知道，其传递进去的 x,y 分别赋值给了 mScrollX 和 mScrollY 那么它们在这里这么做的具体含义是什么呢？它们可以通过 getScrollX 和 getScrollY 来获取具体的值。下面我们就来具体分析下:

**mScrollX:**  在滑动过程中，mScrollX 的值总是等于 View 左边缘和 View 内容左边缘在水平方向的距离。并且当 View 左边缘在 View 内容左边缘的右边时， mScrollX 值为正，反之为负，通俗的来讲就是如果从左向右滑动，那么 mScrollX 为 负值，反之为正值。

**mScrollY:** 在滑动过程中，mScrollY 的值总是等于 View 上边缘和 View 内容上边缘在水平方向的距离。并且当 View 上边缘在 View 内容上边缘下边时，mScrollY 为正，反之为负，通俗的来讲就是如果从上往下滑动，那么 mScrollY 为负值，反之为正值。

上面解释了这么多，为了更好的理解我这里就画一张水平跟竖值方向都滑动了 100 px, 然后来看对应的 mScrollX 和 mScrollY 值是多少，请看下图:

![M0GeGF.png](https://s2.ax1x.com/2019/11/16/M0GeGF.png)

`注意:` 在使用 scrollBy / scrollTo 对 View 滑动时，只能将 View 的内容进行移动，并不能将 View 本身进行移动。

### 使用动画

上一小节我们知道可以采用 View 自身的 scrollTo / scrollBy 方法来实现滑动功能，本小节介绍另外一个实现滑动的方式，即使用动画，通过动画我们能够让一个 View 进行平移，而平移就是一种滑动。使用动画来移动 View ，主要是操作 View 的 translationX 和 translationY 属性，可以采用传统的 View 动画，也可以使用属性动画，如果采用属性动画注意要兼容 3.0 一下版本，当然现在都 androidX 版本了，可以看实际项目情况来具体处理，实现滑动的平移代码如下:

1. 采用 View 动画，将 View 在 100ms 内从原始位置向右下角移动 100 px 

   ```kotlin
   <?xml version="1.0" encoding="utf-8"?>
   <set xmlns:android="http://schemas.android.com/apk/res/android"
        android:fillAfter="true"
   >
       <translate
               android:duration="100"
               android:fromXDelta="0"
               android:fromYDelta="0"
               android:toXDelta="100"
               android:toYDelta="100"
               android:repeatCount="-1"            
       />
   </set>
   ```

   `注意:` View 动画并不能真正改变 View 的位置。

2. 采用属性动画，将 View 在 100ms 内从原始位置向右平移 100 px

   ```kotlin
   //动画属性有 translationX 、translationY 、alpha 、rotation、rotationX、rotationY 、scaleX、scaleY  
   val objAnimator = ObjectAnimator.ofFloat(View targetView,"translationX",0f,100f).setDuration(100).start()
   ```

### 改变 View LayoutParams

本小节将介绍第三种实现 View 滑动的方法，那就是直接改变布局参数,即 LayoutParams。比如我们想把一个 LinearLayout 向右平移 100px 只需要将它的 LayoutParams 内部的 marginLeft 参数的值增加 100 px 就行，代码如下:

```kotlin
val layoutParams = scroller.layoutParams as LinearLayout.LayoutParams
layoutParams.let {
                it.leftMargin += 100
                it.weight += 100
            }
            scroller.requestLayout()
```

通过改变 LinearLayout 的 LayoutParams 参数同样也实现了 View 的滑动。

### 滑动方式对比

上面分别介绍了 3 种不同的滑动方式，它们都能实现 View 的滑动，那么它们之间的差异是什么呢？请看下表:

| 实现方式          | 优点                                                         | 缺点                                     |
| ----------------- | ------------------------------------------------------------ | ---------------------------------------- |
| scrollTo/scrollBy | 专门用于 View 的滑动，比较方便地实现滑动效果且不影响自身的单机事件 | 只能滑动 View 的内容，不能滑动 View 本身 |
| 动画              | 复杂动画使用属性动画来完成比较简单                           | View 动画不能改变自身属性                |
| 改变布局参数      |                                                              | 使用不简洁                               |

针对上面情况这里做一个小总结:

- scrollTo/scrollBy 操作简单，适合对 View 内容的滑动
- 动画操作简单，主要适合用于没有交互的 View 和实现复杂的动画效果
- 改变布局参数操作稍微复杂，适用于有交互的 View

## 弹性滑动

知道了 View 如何滑动，我们还要知道如何实现 View 的弹性滑动，比较生硬的滑动体验确实很差，下面我们介绍 View 如何实现弹性滑动

### 使用 Scroller

请参考该篇 View基础知识#Scroller 介绍

### 通过动画

![M023wV.gif](https://s2.ax1x.com/2019/11/16/M023wV.gif)

利用动画的特性来实现一些动画不能实现的效果，模仿 Scroller 来实现 View 的弹性滑动，代码如下:

```kotlin
val valueAnimator = ValueAnimator.ofInt(0, 1).setDuration(2000);
valueAnimator.addUpdateListener {
   val animatedFraction = it.animatedFraction
   scroller.scrollTo(- (100 * animatedFraction).toInt(), 0)
}
valueAnimator.start()
```

在上述代码中，我们的动画本质上没有作用于任何对象上，它只是在 2s 内完成了整个动画过程，利用这个特性我们就可以在动画的每一帧到来时获取动画完成的比例，然后根据这个比例计算滑动的距离。

### 通过延时策略

该小节我们继续介绍另一种实现弹性滑动的效果，即延时策略，它的核心思想是通过发送一系列延时消息从而达到一种渐近式的效果，代码如下:

```kotlin
    val MESSAGE_SCROLLER_TO = 1;
    val FRAME_COUNT = 30;
    val DELAYED_TIME = 33L;
    var mCount = 0;
    private val mHandler = object : Handler() {
        override fun handleMessage(msg: Message) {
            super.handleMessage(msg)
            when (msg.what) {
                MESSAGE_SCROLLER_TO -> {
                    mCount++
                    if (mCount <= FRAME_COUNT) {
                        val fraction = mCount / FRAME_COUNT.toFloat()
                        val scrollX = (fraction * 100).toInt()
                        scroller.scrollTo(scrollX, 0)
                        sendEmptyMessageDelayed(MESSAGE_SCROLLER_TO, DELAYED_TIME)
                    }
                }


            }
        }
    }
```

其效果都是一样的，这里就不再贴效果了，在实际中可以根据项目需求或灵活性来选择到底使用哪一种来实现弹性滑动。

基础知识就讲到这里了，下面基于我们所学的基础知识练习几道关于滑动的自定义 View

## 运用所学知识进行实战

这里由浅到深的案例练习。

### 1. View 随着手指移动

![](https://pic.superbed.cn/item/5dcfd1058e0e2e3ee9769e37.gif)

```kotlin
public class SlideView1(context: Context?, attrs: AttributeSet?) : View(context, attrs) {

    /**
     * 记录上次滑动的坐标
     */
    private var mLastX = 0;
    private var mLastY = 0;
    
    /**
     * 初始化画笔
     */
    val paint = Paint().apply {
        color = Color.BLACK
        isAntiAlias = true
        strokeWidth = 3f
    }


    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                //拿到相对于屏幕按下的坐标点
                mLastX = event.getX().toInt();
                mLastY = event.getY().toInt();
                println("拿到相对于屏幕按下的坐标点: x:$mLastX y:$mLastY")

            }
            MotionEvent.ACTION_MOVE -> {
                var offsetX = event.getX().toInt() - mLastX;//计算 View 新的摆放位置
                var offsetY = event.getY().toInt() - mLastY;
                //重新放置新的位置
                layout(getLeft() + offsetX, getTop() + offsetY, getRight() + offsetX, getBottom() + offsetY);
            }

            MotionEvent.ACTION_UP -> {

            }
        }
        return true//消耗触摸事件
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        canvas.drawCircle(300f, 300f, 150f, paint)
    }

}
```

**第二种 setX/setY 方式**

```kotlin

public class SlideView2(context: Context?, attrs: AttributeSet?) : View(context, attrs) {

    /**
     * 记录上次滑动的坐标
     */
    private var mLastX = 0;
    private var mLastY = 0;

    private val mScroller = Scroller(context)

    /**
     * 初始化画笔
     */
    val paint = Paint().apply {
        color = Color.BLACK
        isAntiAlias = true
        strokeWidth = 3f
    }


    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                //拿到相对于屏幕按下的坐标点
                mLastX = event.getRawX().toInt();
                mLastY = event.getRawY().toInt();
                println("拿到相对于屏幕按下的坐标点: x:$mLastX y:$mLastY")

            }
            MotionEvent.ACTION_MOVE -> {
              //1
//                x = event.getRawX() - mLastX
//                y =  event.getRawY() - mLastY

							//2
                translationX = event.getRawX() - mLastX
                translationY = event.getRawY() - mLastY
            }

            MotionEvent.ACTION_UP -> {

            }
        }
        return true//消耗触摸事件
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        canvas.drawCircle(300f, 300f, 150f, paint)
    }
}
```

第二种方法是调用 View 的 setX、setY  其实内部就是调用的是 setTranslationX、setTranslationY 这 2 中方式其实都一样  setX 内部也会调用 setTranslationX,可以看一下源码,如下:

```java
//View.java
    public void setX(float x) {
        setTranslationX(x - mLeft);
    }
```



这里为了演示效果，代码没有做边界判断，下来感兴趣的可以自己去研究，还有其它随着手指滑动的实现就靠自己去发掘了。

### 2.高仿 ViewPager

![](https://pic.superbed.cn/item/5dcff14b8e0e2e3ee97cb9b8.gif)

下面就以 Scroller 来实现一个简版的 ViewPager 效果，要实现 Scroller 效果其固定步骤如下:

1. 创建 Scroller 的实例
2. 调用 startScroll() 方法来初始化滚动数据并刷新界面
3. 重写 computeScroll() 方法，并在其内部完成平滑滚动的逻辑

```kotlin
/**
 * <pre>
 *     author  : devyk on 2019-11-16 19:23
 *     blog    : https://juejin.im/user/578259398ac2470061f3a3fb/posts
 *     github  : https://github.com/yangkun19921001
 *     mailbox : yang1001yk@gmail.com
 *     desc    : This is ScrollerViewPager
 * </pre>
 */
class ScrollerViewPager(context: Context?, attrs: AttributeSet?) : ViewGroup(context, attrs) {
    /**
     * 第一步 定义 Scroller 实例
     */
    private var mScroller = Scroller(context)

    /**
     * 判断拖动的最小移动像素点
     */
    private var mTouchSlop = 0

    /**
     * 手指按下屏幕的 x 坐标
     */
    private var mDownX = 0f

    /**
     * 手指当前所在的坐标
     */
    private var mMoveX = 0f

    /**
     * 记录上一次触发 按下是的坐标
     */
    private var mLastMoveX = 0f

    /**
     * 界面可以滚动的左边界
     */
    private var mLeftBorder = 0

    /**
     * 界面可以滚动的右边界
     */
    private var mRightBorder = 0


    init {
        init()
    }

    constructor(context: Context?) : this(context, null) {
    }


    private fun init() {
        /**
         * 通过 ViewConfiguration 拿到认为手指滑动的最短的移动 px 值
         */
        mTouchSlop = ViewConfiguration.get(context).scaledPagingTouchSlop
    }


    /**
     * 测量 child 宽高
     */
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        //拿到子View 个数
        val childCount = childCount
        for (index in 0..childCount - 1) {
            val childView = getChildAt(index)
            //为 ScrollerViewPager 中的每一个子控件测量大小
            measureChild(childView, widthMeasureSpec, heightMeasureSpec)

        }
    }

    /**
     * 测量完之后，拿到 child 的大小然后开始对号入座
     */
    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        if (changed) {
            val childCount = childCount
            for (child in 0..childCount - 1) {
                //拿到子View
                val childView = getChildAt(child)
                //开始对号入座
                childView.layout(
                    child * childView.measuredWidth, 0,
                    (child + 1) * childView.measuredWidth, childView.measuredHeight
                )
            }
            //初始化左右边界
            mLeftBorder = getChildAt(0).left
            mRightBorder = getChildAt(childCount - 1).right

        }

    }

    /**
     * 重写拦截事件
     */
    override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
        when (ev.action) {
            MotionEvent.ACTION_DOWN -> {
                //拿到手指按下相当于屏幕的坐标
                mDownX = ev.getRawX()
                mLastMoveX = mDownX
            }
            MotionEvent.ACTION_MOVE -> {
                //拿到当前移动的 x 坐标
                mMoveX = ev.getRawX()
                //拿到差值
                val absDiff = Math.abs(mMoveX - mDownX)
                mLastMoveX = mMoveX
                //当手指拖动值大于 TouchSlop 值时，就认为是在滑动，拦截子控件的触摸事件
                if (absDiff > mTouchSlop)
                    return true
            }
        }


        return super.onInterceptTouchEvent(ev)
    }

    /**
     * 父容器没有拦截事件，这里就会接收到用户的触摸事件
     */
    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_MOVE -> {
                //拿到当前滑动的相对于屏幕左上角的坐标
                mMoveX = event.getRawX()
                var scrolledX = (mLastMoveX - mMoveX).toInt()
                if (scrollX + scrolledX < mLeftBorder) {
                    scrollTo(mLeftBorder, 0)
                    return true
                }else if (scrollX + width + scrolledX > mRightBorder){
                    scrollTo(mRightBorder-width,0)
                    return true

                }
                scrollBy(scrolledX,0)
                mLastMoveX = mMoveX
            }
            MotionEvent.ACTION_UP -> {
                //当手指抬起是，根据当前滚动值来判定应该回滚到哪个子控件的界面上
                var targetIndex = (scrollX + width/2 ) / width
                var dx = targetIndex * width - scrollX
                /** 第二步 调用 startScroll 方法弹性回滚并刷新页面*/
                mScroller.startScroll(scrollX,0,dx,0)
                invalidate()
            }
        }
    return super.onTouchEvent(event)
    }

    override fun computeScroll() {
        super.computeScroll()
        /**
         * 第三步 重写 computeScroll 方法，并在其内部完成平滑滚动的逻辑
         */
        if (mScroller.computeScrollOffset()){
            scrollTo(mScroller.currX,mScroller.currY)
            postInvalidate()
        }
    }
}
```

```java
<?xml version="1.0" encoding="utf-8"?>
<com.devyk.customview.sample_1.ScrollerViewPager
        xmlns:android="http://schemas.android.com/apk/res/android"
        xmlns:tools="http://schemas.android.com/tools"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        tools:context=".MainActivity">


    <Button
            android:id="@+id/btn_1"
            android:text="1"
            android:layout_width="match_parent"
            android:layout_height="match_parent"/>
    <Button
            android:id="@+id/btn_2"
            android:text="2"
            android:layout_width="match_parent"
            android:layout_height="match_parent"/>
    <Button
            android:id="@+id/btn_3"
            android:text="3"
            android:layout_width="match_parent"
            android:layout_height="match_parent"/>
    <Button
            android:id="@+id/btn_4"
            android:text="4"
            android:layout_width="match_parent"
            android:layout_height="match_parent"/>
    <Button
            android:id="@+id/btn_5"
            android:text="5"
            android:layout_width="match_parent"
            android:layout_height="match_parent"/>
    <Button
            android:id="@+id/btn_6"
            android:text="6"
            android:layout_width="match_parent"
            android:layout_height="match_parent"/>
</com.devyk.customview.sample_1.ScrollerViewPager>
```

通过上面自定义 ViewGroup 实现了跟 ViewPager 一样的效果基本上用到了该篇文章所学知识，比如 **Scroller、TouchSlop** 还有下一节即将要分析的事件拦截处理及分发机制。

## 总结

该篇文章对于新手来说一定要掌握, 特别是文章中基础知识和 View 的滑动实现，只有打好了基础，看开源自定义框架或自己写自定义才顺手。

(ps:可以看到上面代码示例都是基于 [Kotlin](http://www.kotlincn.net/docs/reference/) 来编写了，如果有对 Kotlin 感兴趣的或者是从 0 开始学的，看完 [Kotlin 基础语法](http://www.kotlincn.net/docs/reference/) 之后，我相信 [新手入门级 Kotlin GitHub APP 正是你需要的](https://github.com/yangkun19921001/Kotlin_GitHub))

感谢你的阅读，谢谢。

## 参考

- 《Android 开发艺术探索》
- https://www.gcssloop.com/customview/CustomViewIndex/
- https://juejin.im/post/5c7f4f0351882562ed516ab6