# 高级 UI 成长之路 \(三\) 深入理解 Android 8.0 View 工作原理

## 前言

该篇分为上下结构，上部分主要讲解 View 的工作原理，下部分主要以案例的形式讲解自定义 View。

ps：该篇文章大部份内容会参考 **Android 开发艺术探索**。

系列文章

[高级 UI 成长之路 \(一\) View 的基础知识你必须知道](https://juejin.im/post/5dcff9d3f265da0bd20af0da)

[高级 UI 成长之路 \(二\) 深入理解 Android 8.0 View 触摸事件分发机制](https://juejin.im/post/5dd7a4796fb9a07a8f412d17)

[高级 UI 成长之路 \(三\) 理解 Android 8.0 View 工作原理并带你入自定义 View 门](https://juejin.im/post/5ddff234518825793218d2e4)

## 初识 ViewRootImpl 和 DecorView

在介绍 View 绘制的三大流程之前我们有必要先了解下 **ViewRootImpl** 和 **DecorView** 基本概念，ViewRootImpl 它是连接 WindowManager 和 DecorView 的纽带，View 的三大绘制流程也是在 **ViewRootImpl** 中完成的。在 ActivityThread 中，当 Activity 创建完成并执行 onCreate 生命周期的调用，在用户主动调用 setContentView 之后，会初始化 DecorView 实例，DecorView 相当于是整个 Activity 中 View 的父类。ViewRootImpl 是在 ActivityThread 执行 handleResumeActivity 函数之后的 WindowManagerGlobal 中进行初始化的，可以把它理解为是 Activity 的 View 树管理者，最后并将 ViewRootImpl 和 DecorView 建立关联，这个过程可以参考下面源码，代码如下:

```java
//ActivityThread#handleResumeActivity -> ViewManager#addView -> WindowManagerGlobal#andView
//WindowManagerGlobal.java
    /**
     *
     * @param view DecorView
     * @param params
     * @param display
     * @param parentWindow
     */
    public void addView(View view, ViewGroup.LayoutParams params,
            Display display, Window parentWindow) {
                ...

        ViewRootImpl root;
        View panelParentView = null;

        synchronized (mLock) {
            ...

            /**
             * 1. 实例化 ViewRootImpl 对象，并赋值给 root 变量
             */
            root = new ViewRootImpl(view.getContext(), display);
          ...
            try {
                /**
                 * 2. 将 DecorView 和窗口的参数通过ViewRootImpl setView 方法设置到 ViewRootImpl                                  *        中
                 */
                root.setView(view, wparams, panelParentView);
            } catch (RuntimeException e) {
             ...
            }
        }
    }
```

通过上面代码我们可以知道在 Activity 执行 onResume 生命周期之后，首先会执行上面的代码逻辑，进行关联。

View 的绘制流程是从 ViewRootImpl 的 performTraversals 方法开始的，它经过了 measure 、layout、draw 三个过程才能最终将一个 View 绘制出来，其中 measure 用来测量 View 的宽高，layout 确定 View 在父容器中的放置位置，draw 就是根据前面 measure 和 layout 的步骤把 View 绘制在屏幕上。针对 performTraversals 的大致流程，可以看下图:

![](https://user-gold-cdn.xitu.io/2019/11/29/16eb2ca0baa61445?w=1882&h=1112&f=png&s=62124)

通过上图我们知道 ViewRootImpl\#performTraversals 会依次调用 performMeasure, performLayout , performDraw 三个方法，这三个方法会分别调用顶级 View 的 measure, layout,draw 方法以完成 View 的绘制工作。由于在 ViewRootImpl \# performTraversals 中的三大方法会在 onMeasure ，onLayout，onDraw 中分别对所有子 View 进行操作，由于每一步都相似，这里就拿 onMeasure 测量举例 ,通过上图我们知道在 performMeasure 中会调用 measure 方法，在 measure 方法中又会调用 onMeasure 方法，在 onMeasure 方法中则会对所有的子元素进行 measure 测量过程，这个时候 measure 流程就从父容器传递到子元素中了，这样就完成了一次 measure 过程。接着子元素会重复父容器的 measure 过程，如此反复就完成了整个 View 树的遍历。

**measure:** measure 过程决定了 View 的实际宽高， Measure 测量完了之后，可以通过 **getMeasuredWidth/getMeasuredHeight** 方法来获取到 View 测量后的宽高，在几乎所有的情况下它都等同于 View 的最终宽高，但是有一种情况下除外，比如在 Activity 中的 onCreate ,onStart, onResume 中如果直接获取 View 的宽高，你会发现获取都是 0，0，为什么会这样呢？这个后面会进行说明。

**Layout:** layout 过程决定了 View 的四个顶点的坐标和实际的 View 的宽高，完成以后，可以通过 getTop,getBottom,getLeft，和 getRight 分别获取对应的值，并通过 getWidth 和 getHeight 方法来拿到 View 最终宽高。

**Draw:** draw 过程则决定了 View 的显示，只有 draw 方法完成以后 View 的内容才能显示到屏幕上。

前面我们讲解了 ViewRootImpl 的基本概念，下面我们来看下 **DecorView** 在 Activity 中的作用,先来看一张图:

![](https://user-gold-cdn.xitu.io/2019/11/29/16eb2ca0bad3428e?w=666&h=1018&f=png&s=26047)

**DecorView** 是一个应用窗口的根容器，它本质上是一个 FrameLayout。DecorView 有唯一一个子 View，它是一个垂直 LinearLayout，包含两个子元素，一个是 TitleView（ActionBar的容器），另一个是 ContentView（窗口内容的容器）。关于 ContentView，它是一个 FrameLayout（android.R.id.content\)，我们平常用的 setContentView 就是设置它的子 View。上图还表达了每个 Activity 都与一个 Window（具体来说是PhoneWindow）相关联，用户界面则由 Window 所承载。View 层的事件传递也都要先经过 DecorView ,然后才传递给我们的 View。

## 理解 MeasureSpec

为了更好的理解 View 的测量过程，我们还需要理解 MeasureSpec 它的含义，从名字上得出的解译，看起来像是 “测量规则” ，其实它就是决定 View 在测量的时候的一个尺寸规格。

### MeasureSpec

MeasureSpec 代表一个 32 位 int 值，高 2 位代表 SpecMode ,低 30 位代表 SpecSize ,SpecMode 是指测量模式，而 SpecSize 是指在某种测量代码模式下的规格大小，下面先看一下 MeasureSpec 的定义，代码如下:

```java
   public static class MeasureSpec {
        private static final int MODE_SHIFT = 30;
        private static final int MODE_MASK  = 0x3 << MODE_SHIFT;

        @IntDef({UNSPECIFIED, EXACTLY, AT_MOST})
        @Retention(RetentionPolicy.SOURCE)
        public @interface MeasureSpecMode {}

        public static final int UNSPECIFIED = 0 << MODE_SHIFT;

        public static final int EXACTLY     = 1 << MODE_SHIFT;

        public static final int AT_MOST     = 2 << MODE_SHIFT;

        public static int makeMeasureSpec(@IntRange(from = 0, to = (1 << MeasureSpec.MODE_SHIFT) - 1) int size,
                                          @MeasureSpecMode int mode) {
            if (sUseBrokenMakeMeasureSpec) {
                return size + mode;
            } else {
                return (size & ~MODE_MASK) | (mode & MODE_MASK);
            }
        }


        public static int makeSafeMeasureSpec(int size, int mode) {
            if (sUseZeroUnspecifiedMeasureSpec && mode == UNSPECIFIED) {
                return 0;
            }
            return makeMeasureSpec(size, mode);
        }

        @MeasureSpecMode
        public static int getMode(int measureSpec) {
            //noinspection ResourceType
            return (measureSpec & MODE_MASK);
        }

        public static int getSize(int measureSpec) {
            return (measureSpec & ~MODE_MASK);
        }
     ...
   }
```

MeasureSpec 通过将 SpecMode 和 SpecSize 打包成一个 int 值来避免过多的对象内存分配，为了方便操作，其提供了打包和解包方法。SpecMode 和 SpecSize 也是一个 int 值，一组 SpecMode 和 SpecSize 可以打包为一个 MeasureSpec , 而一个 MeasureSpec 可以通过解包的形式来解出其原始的 SpecMode 和 SpceSize ，需要注意的是这里提到的 MeasureSpec 是指 MeasureSpec 所代表的 int 值，而并非 MeasureSpec 本身。

SpecMode 有三类，每一类都表示特殊的含义，如下所示。

**UNSPECIFIED:** 父容器不对 View 有任何的限制，原始多大就是多大。

**EXACTLY:** 父容器已经检测出 View 所需要的精确大小，这个时候 View 的最终大小就是 SpecSize 所指定的值。它对应于 LayoutParams 中的 match\_parent 和 具体数值 这 2 中模式。

**AT\_MOST:** 父容器指定了一个可用大小即 SpecSize ， View 的大小不能大于这个值，具体是什么值看不同 View 的具体实现。它对应于 LayoutParams 中的 wrap\_content 。

### MeasureSpec 和 LayoutParams 对应关系

在上面提到，系统内部是通过 MeasureSpec 来进行 View 的测量，但是正常情况下我们使用 View 指定 MeasureSpec, 尽管如此，但是我们可以给 View 设置 LayoutParams 。在 View 测量的时候，系统会将 LayoutParams 在父容器的约束下转换成对应的 MeasureSpec ，然后在根据这个 MeasureSpec 来确定 View 的测量后的宽高，需要注意的是，MeasureSpec 不是唯一由 LayoutParams 决定的，LayoutParams 需要和父容器一起才能决定 View 的 MeasureSpec ，从而进一步决定 View 的宽高。另外，对于顶级 View \(DecorView\) 和普通 View 来说，MeasureSpec 的转换过程略有不同。对于 DecorView ，其 MeasureSpec 由窗口的尺寸和其自身的 LayoutParams 来共同决定；对于普通 View ，其 MeasureSpec 由父容器的 MeasureSpec 和自身的 LayoutParams 来共同决定，MeasureSpec 一旦确定后，onMeasure 中就可以确定 View 的测量宽、高。

对于 DecorView 来说，在 ViewRootImpl 中的 measureHierarchy 方法中有如下一段代码，它展示了 DecorView 的 MeasureSpec 的创建过程，其中 desiredWindowWidth 和 desiredWindowHeight 是屏幕的尺寸；

```java
//ViewRootImpl.java
private boolean measureHierarchy(final View host, final WindowManager.LayoutParams lp,
            final Resources res, final int desiredWindowWidth, final int desiredWindowHeight) {
int childWidthMeasureSpec;
int childHeightMeasureSpec;
 ...

  /**
    * 根据父容器的 size 和 LayoutParsms 宽高来得到子 View 的测量规格
    */
   childWidthMeasureSpec = getRootMeasureSpec(baseSize, lp.width);
   childHeightMeasureSpec = getRootMeasureSpec(desiredWindowHeight, lp.height);
   performMeasure(childWidthMeasureSpec, childHeightMeasureSpec);  
 ...


}
```

我们在继续看下 getRootMeasureSpec 的源码实现，代码如下:

```java
//ViewRootImpl.java
    private static int getRootMeasureSpec(int windowSize, int rootDimension) {
        int measureSpec;
        switch (rootDimension) {
            /**
             *其实就是 XML 布局中定义的 MATCH_PARENT
             */
        case ViewGroup.LayoutParams.MATCH_PARENT:
            measureSpec = MeasureSpec.makeMeasureSpec(windowSize, MeasureSpec.EXACTLY);
            break;
            /**
             *其实就是 XML 布局中定义的 WRAP_CONTENT
             */
        case ViewGroup.LayoutParams.WRAP_CONTENT:
            measureSpec = MeasureSpec.makeMeasureSpec(windowSize, MeasureSpec.AT_MOST);
            break;
        default:
            /**
             *其实就是 XML 布局中定义的 绝对 px
             */
            measureSpec = MeasureSpec.makeMeasureSpec(rootDimension, MeasureSpec.EXACTLY);
            break;
        }
        return measureSpec;
    }
```

通过上面代码，DecorView 的 MeasureSpec 的产生过程就很明确了，具体其准守如下规则，根据它的 LayoutParams 中的宽高的参数来划分。

* **LayoutParams.MATCH\_PARENT**: 精确模式，大小就是窗口的大小; 
* **LayoutParams.WRAP\_CONTENT:** 最大模式，大小不定，此模式一般是子 View 决定,但是不能超过父容器的大小;
* **XML 中宽高 px/dp 固定:** 精确模式，大小为 LayoutParams 中指定的大小。

  那么对于普通 View 也就是 XML 布局中的 View 是怎么测量的呢？我们先来看一下 ViewGroup 的 measureChildWithMargins 方法，因为 View 的 measure 过程就是由它给传递过来的，代码如下:

```java
//ViewGroup.java
    protected void measureChildWithMargins(View child,
            int parentWidthMeasureSpec, int widthUsed,
            int parentHeightMeasureSpec, int heightUsed) {
        final MarginLayoutParams lp = (MarginLayoutParams) child.getLayoutParams();
                //得到子元素的 MeasureSpec 
        final int childWidthMeasureSpec = getChildMeasureSpec(parentWidthMeasureSpec,
                mPaddingLeft + mPaddingRight + lp.leftMargin + lp.rightMargin
                        + widthUsed, lp.width);
        final int childHeightMeasureSpec = getChildMeasureSpec(parentHeightMeasureSpec,
                mPaddingTop + mPaddingBottom + lp.topMargin + lp.bottomMargin
                        + heightUsed, lp.height);
                //对子View 开始进行 measure
        child.measure(childWidthMeasureSpec, childHeightMeasureSpec);
    }
```

上述方法首先会拿到子 View 的 LayoutParams 布局中定义的参数，然后根据父容器的 MeasureSpec 、 子元素的 LayoutParams 、子元素的 padding 等然后拿到对子元素的测量规格，可以看 getChildMeasureSpec 代码具体实现:

```java
//ViewGroup.java
        //padding：指父容器中已占用的大小
    public static int getChildMeasureSpec(int spec, int padding, int childDimension) {
        int specMode = MeasureSpec.getMode(spec);
        int specSize = MeasureSpec.getSize(spec);
                //拿到在父容器中可用的最大的尺寸值
        int size = Math.max(0, specSize - padding);

        int resultSize = 0;
        int resultMode = 0;
                //根据父容器的测量规格和 View 本身的 LayoutParams 来确定子元素的 MeasureSpec 
        switch (specMode) {

        case MeasureSpec.EXACTLY:
            if (childDimension >= 0) {
                resultSize = childDimension;
                resultMode = MeasureSpec.EXACTLY;
            } else if (childDimension == LayoutParams.MATCH_PARENT) {

                resultSize = size;
                resultMode = MeasureSpec.EXACTLY;
            } else if (childDimension == LayoutParams.WRAP_CONTENT) {

                resultSize = size;
                resultMode = MeasureSpec.AT_MOST;
            }
            break;

        case MeasureSpec.AT_MOST:
            if (childDimension >= 0) {
                resultSize = childDimension;
                resultMode = MeasureSpec.EXACTLY;
            } else if (childDimension == LayoutParams.MATCH_PARENT) {
                resultSize = size;
                resultMode = MeasureSpec.AT_MOST;
            } else if (childDimension == LayoutParams.WRAP_CONTENT) {

                resultSize = size;
                resultMode = MeasureSpec.AT_MOST;
            }
            break;


        case MeasureSpec.UNSPECIFIED:
            if (childDimension >= 0) {
                resultSize = childDimension;
                resultMode = MeasureSpec.EXACTLY;
            } else if (childDimension == LayoutParams.MATCH_PARENT) {

                resultSize = View.sUseZeroUnspecifiedMeasureSpec ? 0 : size;
                resultMode = MeasureSpec.UNSPECIFIED;
            } else if (childDimension == LayoutParams.WRAP_CONTENT) {

                resultSize = View.sUseZeroUnspecifiedMeasureSpec ? 0 : size;
                resultMode = MeasureSpec.UNSPECIFIED;
            }
            break;
        }

        return MeasureSpec.makeMeasureSpec(resultSize, resultMode);
    }
```

这一段代码虽然比较多，但是还是比较容易理解，它主要的工作就是先拿到在父容器中可用的尺寸，然后根据父元素的测量规格和子元素中 LayoutParams 参数来决定当前子 View 的 MeasureSpec。

上面的代码，如果用一张表格来表示的话，应该更好理解，请看下表:

| parentSpecMode / childLaoutParams | EXACTLY\(精准模式\) | AT\_MOST\(最大模式\) | UNSPECIFIED\(精准模式\) |
| :--- | :--- | :--- | :--- |
| dp/px | EXACTLY     childSize | EXACTLY     childSize | EXACTLY       childSize |
| match\_parent | EXACTLY parentSize | AT\_MOST parentSize | UNSPECIFIED                 0 |
| Warap\_content | AT\_MOST parentSize | AT\_MOST parentSize | UNSPECIFIED                 0 |

通过此表可以更加清晰的看出，只要提供父容器的 MeasureSpec 和子元素的 LayoutParams, 就可以快速的确定出子元素的 MeasureSpec 了，有了 MeasureSpec 就可以进一步确定出子元素测量后的大小了。

## View 工作流程

View 的工作流程主要是指 measure、layout 、draw 这三个流程，即 测量 -&gt; 布局 -&gt; 绘制，其中 measure 确定 View 测量宽高，layout 确定 View 的最终宽高和四个顶点的位置，而 draw 则将 View 绘制到屏幕上。

在讲解 View 的绘制流程之前，我们有必要知道 View 的 measure 何时触发，其实如果对 Activity 生命周期源码有所了解的应该知道，在 onCreate 生命周期中，我们做了 setContentView 把 XML 中的节点转为 View 树的过程，然后在 onResume 可以交互的状态，开始触发绘制工作，可以说 Activity 的 onResume 是开始绘制 View 的入口也不为过，下面看入口代码:

```java
//ActivityThread.java
    final void handleResumeActivity(IBinder token,
            boolean clearHide, boolean isForward, boolean reallyResume, int seq, String reason) {
        ...

        /**
         * 1. 最终会调用 Activity onResume 生命周期函数
         */
        r = performResumeActivity(token, clearHide, reason);
                    ...
                if (a.mVisibleFromClient) {
                    if (!a.mWindowAdded) {
                        a.mWindowAdded = true;
                        /**
                         * 2. 调用 ViewManager 的 addView 方法
                         */
                        wm.addView(decor, l);
                    } else {
                       ...

        } else {
           ...
        }
    }
```

通过上面代码我们知道，首先会调用注释 1 performResumeActivity 方法，其内部会执行 Activity onResume 生命周期方法, 然后会执行将 Activity 所有 View 的父类 DecorView 添加到 Window 的过程，我们看注释 2 代码它调用的是 ViewManager\#addView 方法，在讲解 WindowManager 源码的时候，我们知道了 WindowManager 继承了 ViewManager 然后它们的实现类就是 WindowManagerImpl 所以我们直接看它内部 addView 实现:

```java
//WindowManagerImpl.java
    @Override
    public void addView(@NonNull View view, @NonNull ViewGroup.LayoutParams params) {
        applyDefaultToken(params);
        /**
         * 委托给 WindowManagerGlobal 来处理 addView
         */
        mGlobal.addView(view, params, mContext.getDisplay(), mParentWindow);
    }
```

内部处理又交给了 WindowManagerGlobal 对象，我们继续跟踪，代码如下:

```java
//WindowManagerGlobal.java
   /**
     *
     * @param view DecorView
     * @param params
     * @param display
     * @param parentWindow
     */
    public void addView(View view, ViewGroup.LayoutParams params,
            Display display, Window parentWindow) {
        if (view == null) {
            throw new IllegalArgumentException("view must not be null");
        }
        if (display == null) {
            throw new IllegalArgumentException("display must not be null");
        }
        if (!(params instanceof WindowManager.LayoutParams)) {
            throw new IllegalArgumentException("Params must be WindowManager.LayoutParams");
        }

        final WindowManager.LayoutParams wparams = (WindowManager.LayoutParams) params;
        if (parentWindow != null) {
            /**
             * 1. 根据 WindowManager.LayoutParams 的参数来对添加的子窗口进行相应的调整
             */
            parentWindow.adjustLayoutParamsForSubWindow(wparams);
        } else {
            ...
        }

        ViewRootImpl root;
        View panelParentView = null;

        synchronized (mLock) {
           ...

            /**
             * 2. 实例化 ViewRootImpl 对象，并赋值给 root 变量
             */
            root = new ViewRootImpl(view.getContext(), display);

            view.setLayoutParams(wparams);

            /**
             * 3. 添加 view 到 mViews 列表中
             */
            mViews.add(view);
            /**
             * 4. 将 root 存储在 ViewRootImp 列表中
             */
            mRoots.add(root);
            /**
             * 5. 将窗口的参数保存到布局参数列表中。
             */
            mParams.add(wparams);

            // do this last because it fires off messages to start doing things
            try {
                /**
                 * 6. 将窗口和窗口的参数通过 setView 方法设置到 ViewRootImpl 中
                 */
                root.setView(view, wparams, panelParentView);
            } catch (RuntimeException e) {
                // BadTokenException or InvalidDisplayException, clean up.
                if (index >= 0) {
                    removeViewLocked(index, true);
                }
                throw e;
            }
        }
    }
```

我们直接注释 6 ViewRootImpl\#setView 方法，代码如下:

```java
//ViewRootImpl.java
    /**
     * We have one child
     */
public void setView(View view, WindowManager.LayoutParams attrs, View panelParentView) {
...

    //1. 请求刷新布局
    requestLayout();

...


}
```

该类 setView 代码比较多，我们直接直接找我们需要的核心代码注释 1 ，我们看它内部实现，代码如下:

```java
//ViewRootImpl.java
    @Override
    public void requestLayout() {
          //如果 onMeasure 和 onLayout 工作还没完成，那么就不允许调用 执行
        if (!mHandlingLayoutInLayoutRequest) {
            //检查线程,是否是主线程
            checkThread();
            mLayoutRequested = true;
            //开始遍历
            scheduleTraversals();
        }
    }
```

上面代码首先是检查是否可以开始进入绘制流程，我们看 checkThread 方法实现，代码如下:

```java
//ViewRootImpl.java
    /**
     * 检查当前线程，如果是子线程就抛出异常。
     */
void checkThread() {
        if (mThread != Thread.currentThread()) {
            throw new CalledFromWrongThreadException(
                    "Only the original thread that created a view hierarchy can touch its views.");
        }
    }
```

是不是在程序中这个异常经常遇见？现在知道它是从哪里抛出来的了吧，下面我们接着看 scheduleTraversals 方法的实现，代码如下:

```java
   //ViewRootImpl.java  
   void scheduleTraversals() {
        if (!mTraversalScheduled) {
            mTraversalScheduled = true;
            mTraversalBarrier = mHandler.getLooper().getQueue().postSyncBarrier();
            /**
             * mChoreographer：用于接收显示系统的 VSync 信号，在下一帧渲染时控制执行一些操作，
             * 用于发起添加回调 在 mTraversalRunnable 的 run 中具体实现
             */
            mChoreographer.postCallback(
                    Choreographer.CALLBACK_TRAVERSAL, mTraversalRunnable, null);
            if (!mUnbufferedInputDispatch) {
                scheduleConsumeBatchedInput();
            }
            notifyRendererOfFramePending();
            pokeDrawLockIfNeeded();
        }
    }
```

这里代码的意思就是如果收到系统 VSYNC 信号，那么就会在 mTraversalRunnable run 方法执行，代码如下:

```java
//ViewRootImpl.java
    void doTraversal() {
        if (mTraversalScheduled) {
            mTraversalScheduled = false;
              //1. 删除当前接收 SYNCBarrier 信号的回调
            mHandler.getLooper().getQueue().removeSyncBarrier(mTraversalBarrier);

            if (mProfile) {
                Debug.startMethodTracing("ViewAncestor");
            }
                        //2. 绘制入口
            performTraversals();

            if (mProfile) {
                Debug.stopMethodTracing();
                mProfile = false;
            }
        }
    }
```

在文章的开始部分我们知道 performTraversals 就是测量 layout draw 入口，那么我们继续看它的实现，代码如下:

```java
//ViewRootImpl.java
private void performTraversals() {
    ...
    int childWidthMeasureSpec = getRootMeasureSpec(mWidth, lp.width);
    int childHeightMeasureSpec = getRootMeasureSpec(mHeight, lp.height);
    ...
    //1. 执行测量流程
    performMeasure(childWidthMeasureSpec, childHeightMeasureSpec);
    ...
    //2. 执行布局流程
    performLayout(lp, desiredWindowWidth, desiredWindowHeight);
    ...
    //3. 执行绘制流程
    performDraw();
}


//说明 1.
private void performMeasure(int childWidthMeasureSpec, int childHeightMeasureSpec) {
        if (mView == null) {
            return;
        }
        Trace.traceBegin(Trace.TRACE_TAG_VIEW, "measure");
        try {
              //调用 View 的 measure 方法 
            mView.measure(childWidthMeasureSpec, childHeightMeasureSpec);
        } finally {
            Trace.traceEnd(Trace.TRACE_TAG_VIEW);
        }
    }

//说明 2.
private void performLayout(WindowManager.LayoutParams lp, int desiredWindowWidth, int desiredWindowHeight) {
 ...
  final View host = mView;//代表 DecorView
  ...
  //内部在调用 View onLayout 
  host.layout(0, 0, host.getMeasuredWidth(), host.getMeasuredHeight());
 ...

}

//说明 3.
private void performDraw() {
...
  //内部通过调用 GPU/CPU 来绘制
   draw(fullRedrawNeeded);
...    
}
```

到这里上面对应的函数会对应调用 View 的 onMeasure -&gt; onLayout -&gt; ondraw 方法，下面我们就具体来说明下绘制过程。

### measure 过程

measure 过程要分情况来看，如果一个原始的 View ，那么通过 measure 方法就完成了其测量过程，如果是一个 ViewGroup ，除了完成自己的测量过程外，还会遍历它所有的子 View 的 measure 方法，各个子元素在递归去执行这个流程（有子 View 的情况），下面针对这两种情况分别讨论。

#### View 的 measure 过程

```java
//View.java
    public final void measure(int widthMeasureSpec, int heightMeasureSpec) {
        boolean optical = isLayoutModeOptical(this);
        ...
        onMeasure(widthMeasureSpec, heightMeasureSpec);

            ....
    }
```

View 的 measure 过程由其 measure 方法来完成，通过 View\#measure 源码可以知道 它是被 final 修饰的，那么就代表了子类不能重写，通过上面源码我们知道在 View\#measure 内部又会去调用 onMeasure 方法，我们接着看它的源码实现，代码如下:

```java
//View.java
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        setMeasuredDimension(getDefaultSize(getSuggestedMinimumWidth(), widthMeasureSpec),
                getDefaultSize(getSuggestedMinimumHeight(), heightMeasureSpec));
    }
```

上面的代码就做了一件事儿,就是设置测量之后的宽高值，我们先来看看 getDefaultSize 方法，代码如下:

```java
//View.java
    public static int getDefaultSize(int size, int measureSpec) {
        int result = size;
        //根据 measureSpec 拿到当前 View 的 specMode
        int specMode = MeasureSpec.getMode(measureSpec);
        //根据 measureSpec 拿到当前 View 的 specSize
        int specSize = MeasureSpec.getSize(measureSpec);

        switch (specMode) {
        case MeasureSpec.UNSPECIFIED: //一般用于系统内部的测量过程
            result = size;//直接返回传递进来的 size
            break;
        case MeasureSpec.AT_MOST:// wrap_content 模式，大小由子类决定但是不能超过父类
        case MeasureSpec.EXACTLY://精准模式
            result = specSize;//返回测量之后的大小
            break;
        }
        return result;
    }
```

通过上面代码可以看出，getDefaultSize 内部逻辑不多，也比较简单，对于我们来说只需要关心 AT\_MOST, EXACTLY 这两种情况就行，其最终就是返回测量之后的大小。这里要注意的是这里测量之后的大小并不是最终 View 的大小，最终大小是在 layout 阶段确定的，所以这里一定要注意。

我们来看一下 getSuggestedMinimumXXXX\(\) 源码实现:

```java
//View.java
    protected int getSuggestedMinimumHeight() {
        return (mBackground == null) ? mMinHeight : max(mMinHeight, mBackground.getMinimumHeight());

    }
    protected int getSuggestedMinimumWidth() {
        return (mBackground == null) ? mMinWidth : max(mMinWidth, mBackground.getMinimumWidth());
    }
```

可以看到 getSuggestedMinimumXXX 内部的代码意思就是，如果 View 没有设置背景，那么返回 android:minWidth 这个属性所指定的值，这个值可以为 0，如果 View 设置了背景，则返回 android:minWidth 和背景的 最小宽度/最小高度 这两者的者中的最大值，它们返回的就是 UNSPECIFIED 情况下的宽高。

从 getDefaultSize 方法实现来看， View 的宽高由 specSize 决定，所以我们可以得到如下结论：既然 measure 被 final 修饰不能重写，可是我们在它内部也发现了新大陆 onMeasure 方法，我们可以直接继承 View 然后重写 onMeasure 方法并设置自身大小。

这里在重写 onMeasure 方法的时候设置自身宽高需要注意一下,如果在 View 在布局中使用 wrap\_content ，那么它的 specMode 是 AT\_MOST 模式，在这种模式下，它的宽高等于 specSize,也就是父类控件空剩余可以使用的空间大小，这种效果和在布局中使用 match\_parent 完全一致，那么如何解决这个问题勒，可以参考下面代码:

```kotlin
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        val widthMode = MeasureSpec.getMode(widthMeasureSpec)
        val heightMode = MeasureSpec.getMode(heightMeasureSpec)       

        val widthSize = MeasureSpec.getSize(widthMeasureSpec)
        val heightSize = MeasureSpec.getSize(heightMeasureSpec)

        /**
         * 说明在布局中使用了 wrap_content 模式
         */
        if (widthMeasureSpec == MeasureSpec.AT_MOST && heightMeasureSpec == MeasureSpec.AT_MOST){
            setMeasuredDimension(mWidth,mHeight)
        }else if (widthMeasureSpec == MeasureSpec.AT_MOST){
            setMeasuredDimension(mWidth,heightSize)
        }else if (heightMeasureSpec == MeasureSpec.AT_MOST){
            setMeasuredDimension(widthSize,mHeight)
        }else {
           setMeasuredDimension(widthSize,heightSize)
        }
    }
```

在上面代码中，我们只需要给 View 指定一个默认的内部宽高（mWidth、mHeight），并在 wrap\_content 的时候设置此宽高即可。对于非 wrap\_content 情形，我们就沿用系统的测量值即可。

#### ViewGroup 的 measure 过程

对于 ViewGroup 来说，初了完成自己的 measure 过程以外，还会去遍历调用所有的子 View 的 measure 方法，各个元素递归去执行这个过程，和 View 不同的是 ViewGroup 是一个抽象类，因此它没有重写 View 的 onMeasure 方法，但是它定义了一个 measureChild 方法，代码如下:

```java
//ViewGroup.java
    protected void measureChildren(int widthMeasureSpec, int heightMeasureSpec) {
        final int size = mChildrenCount;
        //拿到所有子 View
        final View[] children = mChildren;
        //遍历子 View 
        for (int i = 0; i < size; ++i) {
            final View child = children[i];
            if ((child.mViewFlags & VISIBILITY_MASK) != GONE) {
                //依次对子 View 进行测量
                measureChild(child, widthMeasureSpec, heightMeasureSpec);
            }
        }
    }
```

上面代码也很简单，ViewGroup 在 measure 时，会对每一个子元素进行 measure ，如下代码所示:

```java
//ViewGroup.java
    protected void measureChild(View child, int parentWidthMeasureSpec,
            int parentHeightMeasureSpec) {
          //拿到该子 View 在布局XML中或者代码中定义的属性
        final LayoutParams lp = child.getLayoutParams();
                //通过 getChildMeasureSpec 方法，根据父元素的宽高测量规则拿到子元素的测量规则
        final int childWidthMeasureSpec = getChildMeasureSpec(parentWidthMeasureSpec,
                mPaddingLeft + mPaddingRight, lp.width);
        final int childHeightMeasureSpec = getChildMeasureSpec(parentHeightMeasureSpec,
                mPaddingTop + mPaddingBottom, lp.height);
                //拿到子元素的测量规则之后传递到 View 中，开始 measure 流程
        child.measure(childWidthMeasureSpec, childHeightMeasureSpec);
    }
```

measureChild 代码逻辑也很容易理解，首先取出设置的 LayoutParams 参数，然后通过 getChildMeasureSpec 方法，根据父元素的宽高测量规格拿到子元素的测量规格，最后将拿到的测量规格直接传递给 View\#measure 来进行测量。

**measure 小总结:**

1. 获取 View 最终宽高，需要在 onLayout 中获取，因为 measure 在某些极端的情况下需要测量多次。
2. 在 Activity 中获取 View 的宽高需要使用 `Activity/View#onWindowFocusChanged`、`view.post(runnable)`、`ViewTreeObserver 的 onGlobalLayoutListener 回调`、`手动调用 view.measure(int width,int height)` ,最终使用哪个以实际情况来定。

### layout 过程

measure 完之后就是 layout 确定子 View 的位置，当 ViewGroup 位置确定以后，它在 onLayout 中会遍历所有的子元素并调用其 layout 方法，在 layout 方法中 onLayout 方法又会被调用，我们直接看 View 的 layout 方法，代码如下:

```java
//View.java
    @SuppressWarnings({"unchecked"})
    public void layout(int l, int t, int r, int b) {
        if ((mPrivateFlags3 & PFLAG3_MEASURE_NEEDED_BEFORE_LAYOUT) != 0) {
            onMeasure(mOldWidthMeasureSpec, mOldHeightMeasureSpec);
            mPrivateFlags3 &= ~PFLAG3_MEASURE_NEEDED_BEFORE_LAYOUT;
        }

        int oldL = mLeft;
        int oldT = mTop;
        int oldB = mBottom;
        int oldR = mRight;

        /**
         * 1. 通过 setFrame 来初始化四个点的位置
         */
        boolean changed = isLayoutModeOptical(mParent) ?
                setOpticalFrame(l, t, r, b) : setFrame(l, t, r, b);

        if (changed || (mPrivateFlags & PFLAG_LAYOUT_REQUIRED) == PFLAG_LAYOUT_REQUIRED) {
            /**
             * 2. 确定 子View 位置
             */
            onLayout(changed, l, t, r, b);

            ...
        }
    }
```

layout 方法大致流程首先会通过 setFrame 方法来设定 View 四个顶点位置，View 的四个顶点一旦确认了那么就会接着调用 onLayout 方法，这个方法的用途是父容器确定子元素的位置。

### draw 过程

measure 和 layout 过程确定了之后就该执行绘制的最后一个流程了 draw,它的作用就是将 View 绘制到屏幕上面，View 的绘制过程遵循以下几点:

1. 绘制背景 backgroud.draw\(canvas\)
2. 绘制自己\(onDraw\)
3. 绘制 children \(dispatchDraw\)
4. 绘制装饰 \(onDrawScrollBars\)

下面我们从源码的角度来看一下 draw 实现，代码如下:

```java
//ViewRootImpl.java
private void performDraw() {
    ...
    draw(fullRefrawNeeded);
    ...
}

private void draw(boolean fullRedrawNeeded) {
  ....

  //使用硬件加速绘制,mView -> DecorView
  mAttachInfo.mThreadedRenderer.draw(mView, mAttachInfo, this);
 ...
 //使用 CPU 绘制
 if (!drawSoftware(surface, mAttachInfo, xOffset, yOffset, scalingRequired, dirty)) {
     return;
    }
}
```

这里我们直接看 CPU 绘制

```java
//ViewRootImpl.java
private boolean drawSoftware(Surface surface, AttachInfo attachInfo, int xoff, int yoff,
            boolean scalingRequired, Rect dirty) {
...
 mView.draw(canvas);  
...
}
```

上面代码内部会调用 View\#draw 方法，我们直接看内部实现，代码如下:

```java
//View.java
public void draw(Canvas canvas) {
        final int privateFlags = mPrivateFlags;
        final boolean dirtyOpaque = (privateFlags & PFLAG_DIRTY_MASK) == PFLAG_DIRTY_OPAQUE &&
                (mAttachInfo == null || !mAttachInfo.mIgnoreDirtyState);
        mPrivateFlags = (privateFlags & ~PFLAG_DIRTY_MASK) | PFLAG_DRAWN;

        int saveCount;

        if (!dirtyOpaque) {
            /**
             * 1. 绘制背景
             */
            drawBackground(canvas);
        }


        final int viewFlags = mViewFlags;
        boolean horizontalEdges = (viewFlags & FADING_EDGE_HORIZONTAL) != 0;
        boolean verticalEdges = (viewFlags & FADING_EDGE_VERTICAL) != 0;
        if (!verticalEdges && !horizontalEdges) {
            /**
             * 2. 调用 ondraw 绘制 View 内容
             */
            if (!dirtyOpaque) onDraw(canvas);


            /**
             *3. 绘制 View 的子 View
             */
            dispatchDraw(canvas);

            drawAutofilledHighlight(canvas);

            if (mOverlay != null && !mOverlay.isEmpty()) {
                mOverlay.getOverlayView().dispatchDraw(canvas);
            }


            /**
             * 4. 绘制 View 的装饰
             */
            onDrawForeground(canvas);


            drawDefaultFocusHighlight(canvas);

            if (debugDraw()) {
                debugDrawFocus(canvas);
            }

            // we're done...
            return;
        }

        ...
    }
```

到目前为止，View 的绘制流程就介绍完了。根节点是 DecorView，整个 View 体系就是一棵以 DecorView 为根的View 树，依次通过遍历来完成 measure、layout 和 draw 过程。而如果要自定义 view ，一般都是通过重写onMeasure\(\)，onLayout\(\)，onDraw\(\) 来完成要自定义的部分，整个绘制流程也基本上是围绕着这几个核心的地方来展开的。

## 自定义 View

下面我们将详细介绍自定义 View 。自定义 View 的作用不用多说，这个大家应该都比较清楚，如果你想做出比较绚丽华彩的 UI 那么仅仅依靠系统的控件是远远不够的，这个时候就必须通过自定义 View 来实现这个绚丽的效果。自定义 View 是一个综合性技术体系，它涉及 View 的层次结构、事件分发、和 View 工作原理等，这些技术每一项又都是初学者难以掌握的，所以前面 2 篇文章我们分别讲解了 View 基础，事件分发以及该篇文章的 View 工作原理等知识，有了这些知识之后再来学习自定义 View 那将面对复杂的 UI 效果也能一一应对了，下面我们就来认识自定义 View 在该小节末尾也会给出实际例子，以供大家参考。

### 自定义 View 分类

自定义 View 的分类标准不唯一，这里则把它分为四大类，请看下面:

1. 继承 View 重写 onDraw 方法

   这个方法主要用于实现一些不规则的效果，即这种效果不方便通过布局的组合方式达到，往往需要静态或者动态地显示一些不规则的图形。很显然这需要通过绘制的方式实现，即重写 onDraw 方法，采用这种方式需要自己支持 wrap\_content ，并且 padding 也需要自己处理。

2. 继承 ViewGroup 派生特殊的 Layout

   这种方式主要用于实现自定义的布局，即除了基本系统布局之外，我们重新定义一种新的布局，当某种效果看起来像几种 View 组合在一起的时候，可以采用这种方式来实现。采用这种方式稍微复杂一些，需要合适的处理 ViewGroup 的 measure 、布局这两个过程，并同时处理子元素的测量和布局过程。

3. 继承特定的 View \(比如 TextView\)

   这种方式比较常见，一般是用于扩展某种已有的 View 的功能，比如 TextView ,这种方法比较容易实现。也不需要自己支持 wrap\_content 和 padding 等。

4. 继承特定的 ViewGroup\(比如 LinearLayout\)

   这种方式也比较常见，当某种效果看起来很像几种 View 组合在一起的时候，可以采用这种方法来实现。采用这种方法不需要自己处理 ViewGroup 的测量和布局这 两个过程，需要注意的这种方法和方法 2 的区别，一般来说方法 2 能实现的效果方式 4 也能实现，两则的区别在于方法 2 更接近 View 的底层。

### 自定义 View 注意事项

该小节主要介绍 自定义 View 过程中的一些注意事项，这些问题如果处理不好有可能直接导致 View 的正常使用，具体事项如下:

1. 让 View 支持 wrap\_content

   这是因为直接继承 View 或者 ViewGroup 的控件，如果不在 onMeasure 中对 wrap\_content 做特殊处理，那么当外界在布局中使用 wrap\_content 属性时就无法达到预期的效果，具体处理可以参考该篇文章的 `View 的 measure 过程`。

2. 如果有必要，让你的 View 支持 padding

   这是因为直接继承 View 的控件，如果不在 draw 方法中处理 padding ,那么 padding 属性时无法起作用的。另外直接继承 ViewGroup 的控件需要在 onMeasure 和 onLayout 中考虑 padding 和子元素的 margin 对其造成的影响，不然将导致 padding 和 子元素的 margin 失效。

3. 尽量不要在 View 中使用 Handler

   这是因为 View 内部本身就提供了 post 系列的方法，完全可以替代 Handler 的作用，当然除非你很明确需要使用 handler 来发送消息。

4. View 中如果有线程或者动画，需要及时停止，参考 View\#onDetachedFromWindow

   这一条也很好理解，如果有线程或者动画需要停止时，那么 onDetachedFromWindow 是一个很好的时机。当包含此 View 的 Activity 退出或者当前 View 被 remove 时，View 的 onDetachedFromWindow 方法会被调用，和此方法对应的是 onAttachedToWindow ，当包含此 View 的 Activity 启动时，View 的 onAttachedToWindow 方法会被调用，同时，当 View 变得不可见时我们也需要停止线程和动画，如果不及时处理这种问题，将有可能会造成内存泄漏。

5. View 带有滑动嵌套情形时，需要处理好滑动冲突

   如果有滑动冲突的话，那么就需要合适的处理滑动冲突，否则将严重影响 View 的效果，具体处理请看[高级 UI 成长之路 \(二\) 深入理解 Android 8.0 View 触摸事件分发机制](https://juejin.im/post/5dd7a4796fb9a07a8f412d17)

### 自定义 View 示例

下面通过示例代码来一起学习自定义 View, 下面还是以自定义分类来具体体现。

1. 继承 View 重写 onDraw 方法

   为了更好的展示一些平时不容易注意到的问题，这里先实现一个很简单的自定义控件，我们先绘制一个圆，尽管如此，需要注意的细节还是很多的，为了实现一个规范控件，在实现过程必须考虑 wrap\_content 模式以及 padding ,同时为了便捷性，还要对外提供自定义属性，我们先来看一下代码实现，如下:

   ![](https://user-gold-cdn.xitu.io/2019/11/29/16eb2ca0bb67fc3c?w=574&h=1022&f=jpeg&s=29535)

   ```kotlin
   class CircleView2: View {
       val color = Color.RED
       val paint = Paint(Paint.ANTI_ALIAS_FLAG)
       constructor(context: Context) : super(context) {
           init()
       }
       constructor(context: Context, attrs: AttributeSet) : super(context, attrs) {
           init()
       }
       constructor(context: Context, attrs: AttributeSet, defStyleAttr: Int) : super(context, attrs, defStyleAttr) {
           init()
       }

       override fun draw(canvas: Canvas) {
           super.draw(canvas)
           val height = height
           val width = width
           val radius = Math.min(width, height) / 2f
           canvas.drawCircle(width/2f,height/2f,radius,paint)
       }
       private fun init() {
           paint.setColor(color)
           paint.isAntiAlias = true
       }
   }
   ```

   \`\`\`xml &lt;?xml version="1.0" encoding="utf-8"?&gt;

&lt;/LinearLayout&gt;

```text
   上面简单绘制了一个以当前宽高的一半的最小值在自己的中心点绘制一个红色的实心圆，其实上面并不是一个规范的自定义控件为什么这么说呢？我们通过调整布局参数再来看一下

   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
                 android:orientation="vertical"
                 android:layout_width="match_parent"
                 android:layout_height="match_parent">


       <com.devyk.customview.sample_1.CircleView2
               android:layout_width="match_parent"
               android:background="#000"
               android:layout_height="100dp"/>


       <com.devyk.customview.sample_1.CircleView2
               android:layout_width="match_parent"
               android:background="#9C27B0"
               android:layout_margin="20dp"
               android:layout_height="100dp"/>
   </LinearLayout>
```

![](https://user-gold-cdn.xitu.io/2019/11/29/16eb2ca0bc84f54f?w=566&h=1022&f=jpeg&s=34865)

运行效果如上，可以看到 margin 属性是有效果的，这是因为 margin 属性是由父容器控制的，因此不需要再 CircleView2 中做特殊处理。我们现在在来调整它的布局参数，为其设置 20dp 的 padding,如下所示:

```markup
   <?xml version="1.0" encoding="utf-8"?>
   <LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
                 android:orientation="vertical"
                 android:background="#FF9800"
                 android:layout_width="match_parent"
                 android:layout_height="match_parent">


       <com.devyk.customview.sample_1.CircleView2
               android:layout_width="match_parent"
               android:background="#000"
               android:layout_height="100dp"/>


       <com.devyk.customview.sample_1.CircleView2
               android:layout_width="match_parent"
               android:background="#9C27B0"
               android:layout_margin="20dp"
               android:layout_height="100dp"/>

       <com.devyk.customview.sample_1.CircleView2
               android:layout_width="match_parent"
               android:background="#2196F3"
               android:layout_margin="20dp"
               android:padding="20dp"
               android:layout_height="100dp"/>
   </LinearLayout>
```

运行效果如下:

![](https://user-gold-cdn.xitu.io/2019/11/29/16eb2ca0bc9daa8c?w=572&h=1016&f=jpeg&s=42116)

可以看到 第三个圆 我们在布局中设置了 padding 结果根本没有无效，这就是我们在前面提到的直接继承自 View 和 ViewGroup 的控件，padding 是默认无法生效的，需要自己处理，我们在将其宽度设置为 wrap\_content ，如下:

```markup
       <com.devyk.customview.sample_1.CircleView2
               android:layout_width="wrap_content"
               android:background="#8BC34A"
               android:layout_margin="20dp"
               android:padding="20dp"
               android:layout_height="100dp"/>
```

运行效果如下:

![](https://user-gold-cdn.xitu.io/2019/11/29/16eb2ca0bc9f922c?w=568&h=1016&f=jpeg&s=47240)

结果发现 wrap\_content 并没有达到预期的效果，对比图上其它的 MATCH\_PARENT 属性绘制的圆其实跟 wrap\_content 一样，其实的确是这样，这一点在源码中也讲解到了，可以看下面:

```java
       public static int getDefaultSize(int size, int measureSpec) {
           int result = size;
           //根据 measureSpec 拿到当前 View 的 specMode
           int specMode = MeasureSpec.getMode(measureSpec);
           //根据 measureSpec 拿到当前 View 的 specSize
           int specSize = MeasureSpec.getSize(measureSpec);

           switch (specMode) {
           case MeasureSpec.UNSPECIFIED: //一般用于系统内部的测量过程
               result = size;
               break;
           case MeasureSpec.AT_MOST:// wrap_content 模式，大小由子类决定但是不能超过父类
           case MeasureSpec.EXACTLY://精准模式
               result = specSize;
               break;
           }
           return result;
       }
```

其实不管是 AT\_MOST 或者 EXACTLY 都是按照 specSize 赋值，大小都是一样的，所以为了解决这个问题，我们需要重写 onMeasure 并且在 draw 方法中拿到 padding 然后减去该值 ，先来看代码实现:

```kotlin
       /**
        * 解决 wrap_content 
        */
       override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
           super.onMeasure(widthMeasureSpec, heightMeasureSpec)
           val widthSpecMode = View.MeasureSpec.getMode(widthMeasureSpec)
           val widthSpecSize = View.MeasureSpec.getSize(widthMeasureSpec)
           val heightSpecMode = View.MeasureSpec.getMode(heightMeasureSpec)
           val heightSpecSize = View.MeasureSpec.getSize(heightMeasureSpec)
           if (widthSpecMode == View.MeasureSpec.AT_MOST && heightSpecMode == View.MeasureSpec.AT_MOST) {
               setMeasuredDimension(200, 200)
           } else if (widthSpecMode == View.MeasureSpec.AT_MOST) {
               setMeasuredDimension(200, heightSpecSize)
           } else if (heightSpecMode == View.MeasureSpec.AT_MOST) {
               setMeasuredDimension(widthSpecSize, 200)
           }
       }


       /**
        * 解决 padding
        */
       override fun draw(canvas: Canvas) {
           super.draw(canvas)

           val paddingLeft = paddingLeft
           val paddingRight = paddingRight
           val paddingBottom = paddingBottom
           val paddingTop = paddingTop
           val height = height - paddingBottom - paddingTop
           val width = width - paddingLeft - paddingRight
           val radius = Math.min(width, height) / 2f

           canvas.drawCircle(paddingLeft + width/2f,paddingTop + height/2f,radius,paint)


       }
```

```markup
   <?xml version="1.0" encoding="utf-8"?>
   <LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
                 android:orientation="vertical"
                 android:background="#FF9800"
                 android:layout_width="match_parent"
                 android:layout_height="match_parent">


       <com.devyk.customview.sample_1.CircleView2
               android:layout_width="match_parent"
               android:background="#000"
               android:layout_height="100dp"/>


       <com.devyk.customview.sample_1.CircleView2
               android:layout_width="match_parent"
               android:background="#9C27B0"
               android:layout_margin="20dp"
               android:layout_height="100dp"/>

       <com.devyk.customview.sample_1.CircleView2
               android:layout_width="match_parent"
               android:background="#2196F3"
               android:layout_margin="20dp"
               android:padding="20dp"
               android:layout_height="100dp"/>

       <com.devyk.customview.sample_1.CircleView3
               android:layout_width="wrap_content"
               android:background="#8BC34A"
               android:layout_margin="20dp"
               android:padding="30dp"
               android:layout_height="100dp"/>
   </LinearLayout>
```

运行效果如下:

![](https://user-gold-cdn.xitu.io/2019/11/29/16eb2ca0f93107e1?w=568&h=1016&f=jpeg&s=43102)

通过我们在 draw 中减去了 各自的 padding 解决了 padding 的问题，通过重写 onMeasure 对该 View 设置宽高，解决了 wrap\_content 属性的效果。

最后为了我们的自定义控件的扩展性，我们需要给它实现自定义属性，步骤如下所示:

```markup
   //1. 我们在 values 目录下创建一个 attrs 开头的文件夹，然后在创建一个 attrs_circle 的文件，
   <?xml version="1.0" encoding="utf-8"?>
   <resources>
       <declare-styleable name="CircleView">
           <attr name="circle_view_color" format="color"></attr>
       </declare-styleable>
   </resources>

   //2. 代码中进行解析属性值
       private fun initTypedrray(context: Context, attrs: AttributeSet) {
           //拿到自定义属性组
           val obtainStyledAttributes = context.obtainStyledAttributes(attrs, R.styleable.CircleView)
           color = obtainStyledAttributes.getColor(R.styleable.CircleView_circle_view_color, Color.RED)
           obtainStyledAttributes.recycle()

       }

   //3. 布局中声明自定义属性的空间，在根布局中添加如下属性
    xmlns:app="http://schemas.android.com/apk/res-auto"

   //4. 在自定义 View 中配置该属性值
       <com.devyk.customview.sample_1.CircleView3
               android:layout_width="wrap_content"
               android:background="#8BC34A"
               android:layout_margin="20dp"
               app:circle_view_color = "#3F51B5"
               android:padding="20dp"
               android:layout_height="100dp"/>
```

运行效果如下:

![](https://user-gold-cdn.xitu.io/2019/11/29/16eb2ca0fa3459c3?w=566&h=1012&f=jpeg&s=42632)

自定义属性也配置完成了。这样做的好处是在不修改原始代码的情况下，可以让用户自定义颜色值，扩展性比较强。

1. 继承 ViewGroup 派生特殊的 Layout

   我们先看一下我们需要实现的效果-&gt;流式布局

   ![](https://user-gold-cdn.xitu.io/2019/11/29/16eb2ca0fa7f4e02?w=572&h=1014&f=jpeg&s=59437)

   1. 定义用于装 x 轴 View，y 轴 height, 容器中所有子 View 的容器

      ```kotlin
          /**
           * 定义一个装所有子 View 的容器
           */
          protected var mAllViews: MutableList<List<View>> = ArrayList<List<View>>()
          /**
           * 定义行高
           */
          protected var mLineHeight: MutableList<Int> = ArrayList()
          /**
           * 定义行宽
           */
          protected var mLineWidth: MutableList<Int> = ArrayList()
          /**
           * 当前行上的子 View 控件
           */
          protected var mLinViews: MutableList<View> = ArrayList<View>()
      ```

   2. 重写 View onMeasure 方法，测量每一个子 View 的宽高，并且计算 X 轴上每一个子 View 的宽度是否操出总的 width

      ```kotlin
          /**
           * 1. 确定所有子 View 的宽高
           */
          override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
              super.onMeasure(widthMeasureSpec, heightMeasureSpec)
              //根据当前宽高的测量模式，拿到宽高和当前模式
              val widthMode = MeasureSpec.getMode(widthMeasureSpec)
              val heightMode = MeasureSpec.getMode(heightMeasureSpec)
              val widthSize = MeasureSpec.getSize(widthMeasureSpec)
              val heightsize = MeasureSpec.getSize(heightMeasureSpec)

              //如果当前容器 XML 布局定义的 wrap_content 那么就需要自己解决实际测量高度
              var width = 0
              var height = 0

              //当前行高/宽
              var lineWidth = 0
              var lineHeight = 0

              //拿到所有子 View 总数
              val allViewCount = childCount

              //遍历进行对子 View 进行测量
              for (child in 0..allViewCount -1 ){
                  //拿到当前 View
                  var childView = getChildAt(child)
                  //判断当前 view 是否隐藏状态
                  if (childView.visibility == View.GONE) {
                      //如果是最后一个,拿到当前行高
                      if (child == allViewCount - 1){
                          width = Math.max(lineWidth,width)
                          height += lineHeight
                      }
                      continue
                  }
                  //对 childView 进行测量
                  measureChild(childView,widthMeasureSpec,heightMeasureSpec)
                  //拿到当前子 View 布局参数
                  val marginLayoutParams = childView.layoutParams as MarginLayoutParams
                  //拿到测量之后的宽、高 + 设置的 margin
                  val childWidth = childView.measuredWidth + marginLayoutParams.leftMargin + marginLayoutParams.rightMargin
                  val childHeight = childView.measuredHeight + marginLayoutParams.topMargin + marginLayoutParams.bottomMargin

                  //说明已经放不下
                  if (lineWidth + childWidth > widthSize - paddingLeft - paddingRight){
                      //拿到当前行最大的宽值
                      width = Math.max(width,lineWidth)
                      //当前行的宽度
                      lineWidth = childWidth
                      //子 View 总高度
                      height += lineHeight
                      //当前行的高度
                      lineHeight = childHeight
                  }else{
                      //将子 View 的宽度累计相加
                      lineWidth += childWidth
                      //拿到当前行最大的高度
                      lineHeight = Math.max(lineHeight,childHeight)

                  }
              }
              //设置当前容器的宽高
              setMeasuredDimension(
                  //判断是否是 match——parent 模式如果不是,那么就是 wrap_content 或者 精准 dp 模式，需要所有子 View 宽/高 相加
                  if (widthMode === MeasureSpec.EXACTLY) widthSize else width + paddingLeft + paddingRight,
                  if (heightMode === MeasureSpec.EXACTLY) heightsize else height + paddingTop + paddingBottom
              )
          }
      ```

   3. 将测量好的子 View 开始放入 ViewGroup 中

      \`\`\`kotlin /\*\*

      * 1. 确定所有子 View 的位置 \*/ override fun onLayout\(changed: Boolean, l: Int, t: Int, r: Int, b: Int\) { //清空容器里面的数据 mAllViews.clear\(\) mLineHeight.clear\(\) mLineWidth.clear\(\) mLinViews.clear\(\)

           //拿到控件的宽 var width = width //当前行宽 var lineWidth = 0 //当前行高 var lineHeight = 0 //当前 childCount val childCount = childCount //遍历子 View for \(childIndex in 0..childCount-1\){ var childView = getChildAt\(childIndex\) if\(childView.visibility == View.GONE\)continue val marginLayoutParams = childView.layoutParams as MarginLayoutParams //拿到最后 View 真实宽高 val measuredWidth = childView.measuredWidth val measuredHeight = childView.measuredHeight

           //当前子 View 的宽+ 当前行宽再加当前 margin 如果大于当前总宽的话 说明放不下了，需要换行 if \(measuredWidth + lineWidth + marginLayoutParams.leftMargin + marginLayoutParams.rightMargin &gt; width - paddingRight-paddingLeft\){ //当前行的最大的高 mLineHeight.add\(lineHeight\) //当前行总宽度 mLineWidth.add\(lineWidth\) //这里面装的是每一行所有的子View，该容器的 size 取决于 有多少行 mAllViews.add\(mLinViews\) //将下一行的宽设置为 0 初始高度 lineWidth = 0 //将下一行的高度初始为第一个子 View 的高度 lineHeight = measuredHeight //初始化一个容器，用于装下一行所有的子 View mLinViews = ArrayList\(\)

           ```text
             Log.d(TAG,"lineWidth:$lineWidth lineHeight:$lineHeight")
           ```

           }

           //依次加当前 View 占用的宽 lineWidth += measuredWidth //找出当前子 View 最大的height lineHeight = Math.max\(lineHeight,measuredHeight + marginLayoutParams.bottomMargin + marginLayoutParams.topMargin\) //将行上的 VIew 添加到容器里面 mLinViews.add\(childView\) Log.d\(TAG,"--- lineWidth:$lineWidth lineHeight:$lineHeight"\) }

```text
          mLineHeight.add(lineHeight)
          mLineWidth.add(lineWidth)
          mAllViews.add(mLinViews)

          var left = paddingLeft
          var top  = paddingTop

          //拿到当前所有的子 VIew
          for (curAllView in 0..mAllViews.size -1){
              mLinViews = mAllViews.get(curAllView) as ArrayList
              lineHeight = mLineHeight.get(curAllView)

              val curLinewidth = mLineHeight.get(curAllView)
              when(mGravity){
                  LEFT -> left = paddingLeft
                  CENTER -> (width - curLinewidth)/2 + paddingLeft
                  RIGHT -> {
                      left = width - (curLinewidth + paddingLeft) - paddingRight
                      Collections.reverse(mLinViews)
                  }
              }

              mLinViews.forEach lit@{
                  if (it.visibility == View.GONE)return@lit

                  val lp = it.layoutParams as MarginLayoutParams
                  var lc = left + lp.leftMargin
                  var tc = top + lp.topMargin
                  var rc = lc + it.measuredWidth
                  var bc = tc + it.measuredHeight

                  Log.d(TAG,"lc:$lc tc:$tc rc:$rc bc:$bc");

                  //开始放入子 VIew
                  it.layout(lc,tc,rc,bc)

                  left += it.measuredWidth + lp.leftMargin + lp.rightMargin
              }
              top += lineHeight
          }
      }
  ```
```

1. 添加子 View

   ```kotlin
           mFlowLayout.setAdapter(object : TagAdapter<String>(mVals) {

               override fun getView(parent: FlowLayout, position: Int, s: String): View {
                   val tv = LayoutInflater.from(applicationContext).inflate(
                       R.layout.tv,
                       mFlowLayout, false
                   ) as TextView
                   tv.text = s
                   Log.d(TAG,s);
                   return tv
               }
           })
   ```

   到这里就已经将流式布局绘制出来了，该源码我参考的是 [hongyangAndroid/FlowLayout](https://github.com/hongyangAndroid/FlowLayout/blob/master/flowlayout-lib/src/main/java/com/zhy/view/flowlayout/FlowLayout.java) 上面代码跟源码略有不同，我这个是 kotlin 版本，需要看所有代码，请移步源代码仓库。

   通过学习该案例你将学习到自定义 ViewGroup 的流程和如果测量子 View 及如何放置子 View.建议不会都一定要敲一遍，才能加深对自定义 View 的认识。

## 总结

到这里，自定义 View 相关的知识都已经介绍完了，在阅读该篇文章之前首先要对 View 有一个整体的认识，比如如果在 View 、ViewGroup 中进行 measure ，如何解决 xml 中定义的 wrap\_content 和 padding 边距。绘制流程是如何进行的。我相信看完该篇文章你对 View 的认识会更加深刻。

感谢你的阅读，谢谢！

## 参考

* 《Android 开发艺术探索》
* [http://www.10tiao.com/html/227/201807/2650243397/1.html](http://www.10tiao.com/html/227/201807/2650243397/1.html)

