> TextureView 和 SurfaceView 区别

TextureView 和 SurfaceView 都是 Android 系统中用于显示视频、相机预览等图像的视图控件，但它们有一些不同之处。

1.  渲染方式：TextureView 使用 OpenGL ES 渲染图像，而 SurfaceView 则使用双缓冲机制和硬件加速渲染图像。
    
2.  View 层级关系：TextureView 位于 View 层级的最上层，可以和其他 View 重叠。而 SurfaceView 位于 View 层级的底层，它的绘制在单独的窗口中进行，因此不能和其他 View 重叠。
    
3.  刷新方式：TextureView 的刷新是由 UI 线程驱动的，因此会受到 UI 线程的影响；而 SurfaceView 的刷新是由另一个线程驱动的，因此可以独立于 UI 线程进行。
    
4.  绘制内容：TextureView 可以显示任何类型的 View，并且可以通过 Canvas 进行绘制，而 SurfaceView 只能用于显示预览或视频等特定类型的图像。
    

总之，TextureView 更加灵活、可以实现更多种类的绘制，并且可以和其他 View 重叠，但它的性能略逊于 SurfaceView；而 SurfaceView 性能更加优秀，但是它只能用于特定类型的图像，并且不能和其他 View 重叠。因此，在具体应用中应该根据需求选择合适的视图控件。

> 能再详细点吗

当涉及到在 Android 应用中显示图像时，TextureView 和 SurfaceView 是两个常用的视图控件。这些控件提供了不同的渲染方式和用途，因此在不同的场景中应该选择合适的控件。

TextureView 是一个视图控件，它可以呈现 2D 和 3D 图形，并使用 OpenGL ES 渲染这些图像。它使用硬件加速来提高性能，它可以与其他视图重叠，并支持透明度和动画效果。TextureView 适用于任何类型的视图，可以在 View 中使用 Canvas 进行绘制，并且提供了更加灵活的绘制方式。但是，由于它使用 UI 线程来刷新图像，因此可能会受到 UI 线程负载的影响，因此需要进行一些优化。

SurfaceView 是一个独立的窗口，它提供了双缓冲机制和硬件加速来提高性能。SurfaceView 的绘制不受 UI 线程的限制，因此可以在单独的线程中进行，从而提供更高的性能。SurfaceView 适用于特定类型的图像，例如相机预览和视频播放等。由于它在单独的窗口中进行绘制，因此不能与其他视图重叠。在使用 SurfaceView 时，开发者需要自行管理线程和内存，因此相对比较复杂。

总之，在选择 TextureView 和 SurfaceView 时，需要根据具体的应用场景和需求进行选择。如果需要更加灵活的绘制方式和可以与其他视图重叠的效果，可以选择 TextureView；如果需要高性能的特定类型图像显示，可以选择 SurfaceView。

> TextureView 源码分析

TextureView 是 Android 中一个非常重要的视图控件，它可以在 UI 线程中渲染图像，并且可以与其他视图重叠。在这里，我将从几个方面对 TextureView 的源码进行分析。

1.  构造方法

TextureView 的构造方法很简单，它调用了 View 的构造方法并将硬件加速设置为 true。

java

```java
public TextureView(Context context) {
    this(context, null);
}

public TextureView(Context context, AttributeSet attrs) {
    this(context, attrs, 0);
}

public TextureView(Context context, AttributeSet attrs, int defStyleAttr) {
    this(context, attrs, defStyleAttr, 0);
}

public TextureView(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
    super(context, attrs, defStyleAttr, defStyleRes);
    mRenderThread = new RenderThread();
    setOpaque(false);
    setLayerType(LAYER_TYPE_HARDWARE, null);
}
```

2.  SurfaceTexture 的创建和销毁

TextureView 内部使用 SurfaceTexture 对象来管理图像渲染。在 TextureView 中，SurfaceTexture 的创建和销毁是在 onAttachedToWindow() 和 onDetachedFromWindow() 方法中完成的。

java

```java
@Override
protected void onAttachedToWindow() {
    super.onAttachedToWindow();
    if (isHardwareAccelerated()) {
        if (mSurfaceTexture == null) {
            mSurfaceTexture = new SurfaceTexture(false);
        }
        mRenderThread.attachToGLContext(mSurfaceTexture);
    }
}

@Override
protected void onDetachedFromWindow() {
    if (isHardwareAccelerated()) {
        mRenderThread.detachFromGLContext();
        if (mSurfaceTexture != null) {
            mSurfaceTexture.release();
            mSurfaceTexture = null;
        }
    }
    super.onDetachedFromWindow();
}
```

3.  SurfaceTexture 和 TextureView 大小的匹配

在渲染图像之前，需要确保 SurfaceTexture 和 TextureView 的大小是匹配的。因此，在 TextureView 中，我们需要重写 onSizeChanged() 方法，并在其中更新 SurfaceTexture 的大小。

java

```java
@Override
protected void onSizeChanged(int w, int h, int oldw, int oldh) {
    if (mSurfaceTexture != null) {
        mSurfaceTexture.setDefaultBufferSize(getWidth(), getHeight());
    }
}
```

4.  渲染线程

TextureView 的渲染线程是一个独立的线程，它负责渲染图像并更新 TextureView 的显示。这个线程在 TextureView 的构造方法中创建，它实现了 Runnable 接口，并在 run() 方法中完成渲染和更新工作。

java

```java
private final class RenderThread extends Thread {
    private boolean mExited;
    private boolean mRequestUpdate;
    private boolean mRequestRelease;
    private SurfaceTexture mSurfaceTexture;

    public RenderThread() {
        super("TextureView");
    }

    public synchronized void attachToGLContext(SurfaceTexture surfaceTexture) {
        mSurfaceTexture = surfaceTexture;
        mRequestUpdate = false;
        mRequestRelease = false;
        notify();
    }

    public synchronized void detachFromGLContext() {
        mRequestRelease = true;
        notify();
        while (!mExited && mRequestRelease) {
            try {
                wait();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt
```

> 继续

java

            ```java
break;
        }
    }
}

public synchronized void requestRender() {
    mRequestUpdate = true;
    notify();
}

@Override
public void run() {
    while (true) {
        synchronized (this) {
            if (mSurfaceTexture == null || mExited) {
                break;
            }

            boolean requestRelease = mRequestRelease;
            boolean requestUpdate = mRequestUpdate;
            if (requestRelease) {
                releaseSurfaceTexture();
            }

            if (requestUpdate && !requestRelease) {
                mSurfaceTexture.updateTexImage();
                mSurfaceTexture.getTransformMatrix(mTransform);
            }

            // draw the content here
            // ...

            if (!requestRelease) {
                boolean dirty = false;
                if (mRequestUpdate) {
                    mRequestUpdate = false;
                    dirty = true;
                }
                if (mAttachInfo != null) {
                    dirty |= (mPrivateFlags & View.PFLAG_DIRTY_MASK) == View.PFLAG_DIRTY;
                    mPrivateFlags &= ~View.PFLAG_DIRTY_MASK;
                }
                if (dirty) {
                    mSurfaceTexture.setOnFrameAvailableListener(this);
                    mRenderHandler.sendEmptyMessage(MSG_REQUEST_RENDER);
                }
            }
        }
    }
}

private synchronized void releaseSurfaceTexture() {
    if (mSurfaceTexture != null) {
        mSurfaceTexture.release();
        mSurfaceTexture = null;
        mRequestRelease = false;
        notify();
    }
}
```

}

scss

```scss
5. 刷新和重绘

TextureView 重写了 View 的 invalidate() 和 requestLayout() 方法，并在其中调用了 RenderThread 的 requestRender() 方法，以触发渲染线程的更新和重绘操作。

```java
@Override
public void invalidate() {
    super.invalidate();
    if (mRenderThread != null) {
        mRenderThread.requestRender();
    }
}

@Override
public void requestLayout() {
    super.requestLayout();
    if (mRenderThread != null) {
        mRenderThread.requestRender();
    }
}
```

以上是 TextureView 的源码分析，TextureView 作为一个非常重要的控件，它的源码实现非常精妙，为我们提供了一个高效的图像渲染机制。

> 写完了吗

是的，以上就是 TextureView 的源码分析。如有任何疑问或需要进一步了解，请随时提出。

> SurfaceView 源码分析

好的，下面是 SurfaceView 的源码分析。

1.  概述

SurfaceView 是一个可以在其他 View 的上层绘制自己内容的视图控件。SurfaceView 的特点是可以创建一个单独的绘制表面，并在该表面上进行绘制，从而可以避免由于 UI 线程繁忙而导致的卡顿问题。SurfaceView 在 Android 开发中得到广泛的应用，比如视频播放、游戏开发等。

2.  SurfaceView 的基本结构

SurfaceView 的基本结构包括 View 和 SurfaceHolder 两个部分，其中 View 负责接收用户输入、处理事件、响应用户交互等任务，而 SurfaceHolder 则负责创建和管理 Surface。SurfaceView 中的 Surface 可以由系统本身创建，也可以由应用程序自己创建。

SurfaceView 中还包括一个渲染线程，该线程负责将绘制的内容渲染到 Surface 上，并保持 Surface 的刷新。这样可以保证 Surface 上的内容始终保持最新的状态，从而达到流畅的绘制效果。

3.  SurfaceView 的工作流程

SurfaceView 的工作流程可以分为以下几个步骤：

*   创建 Surface 和 SurfaceHolder
*   启动渲染线程
*   渲染线程将内容绘制到 Surface 上
*   通知 Surface 刷新

下面对这些步骤进行详细解释。

3.1 创建 Surface 和 SurfaceHolder

在 SurfaceView 的构造方法中会创建一个 SurfaceHolder 对象和一个 Callback 对象。SurfaceHolder 是一个接口，它定义了一组用于管理 Surface 的方法。Callback 对象则实现了 SurfaceHolder.Callback 接口，用于监听 Surface 的状态变化。在 SurfaceView 中，当 Surface 创建、改变或销毁时，系统会自动调用 SurfaceHolder.Callback 中相应的方法。

java

```java
public SurfaceView(Context context, AttributeSet attrs) {
    super(context, attrs);
    init();
}

private void init() {
    mSurfaceHolder = getHolder();
    mSurfaceHolder.addCallback(this);
}
```

3.2 启动渲染线程

在 SurfaceHolder.Callback 的 surfaceCreated() 回调方法中会启动渲染线程，并在渲染线程中创建一个 Canvas 对象。在 Canvas 对象中绘制内容后，需要将该 Canvas 对象传递给 SurfaceHolder 的 lockCanvas() 方法。该方法会返回一个 Canvas 对象，表示可以在 Surface 上进行绘制。绘制完成后，需要调用 SurfaceHolder 的 unlockCanvasAndPost() 方法，将绘制结果提交到 Surface 上，并通知系统进行刷新。

java

```java
@Override
public void surfaceCreated(SurfaceHolder holder) {
    mRenderThread = new RenderThread();
    mRenderThread.start();
}

private class RenderThread extends Thread {
    private volatile boolean mExited = false;
    private Canvas mCanvas;

    @Override
    public void run() {
        while (!mExited) {
            try {
                mCanvas = mSurfaceHolder.lockCanvas();
                // draw the content here
                //
```

> 继续

3.3 渲染线程将内容绘制到 Surface 上

渲染线程可以通过 SurfaceHolder.lockCanvas() 方法获取一个用于绘制的 Canvas 对象，并在该对象上进行绘制操作。需要注意的是，在多线程环境下进行绘制时，必须使用同步机制（比如 synchronized 或 Lock）保证线程安全。同时，在绘制完成后，需要调用 unlockCanvasAndPost() 方法提交绘制结果到 Surface 上。

java

```java
@Override
public void run() {
    while (!mExited) {
        try {
            mCanvas = mSurfaceHolder.lockCanvas();
            // draw the content here
            // ...
            mSurfaceHolder.unlockCanvasAndPost(mCanvas);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

3.4 通知 Surface 刷新

SurfaceView 中的 Surface 会周期性地进行刷新，以便将渲染线程绘制的内容显示出来。当渲染线程完成一次绘制后，需要调用 SurfaceHolder 的 unlockCanvasAndPost() 方法提交绘制结果到 Surface 上，并通知系统进行刷新。

java

```java
@Override
public void run() {
    while (!mExited) {
        try {
            mCanvas = mSurfaceHolder.lockCanvas();
            // draw the content here
            // ...
            mSurfaceHolder.unlockCanvasAndPost(mCanvas);
            mSurfaceHolder.surfaceChanged(mSurfaceHolder.getSurface(), 0, getWidth(), getHeight());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

4.  总结

SurfaceView 是一个重要的视图控件，它可以避免由于 UI 线程繁忙而导致的卡顿问题，并在 Android 开发中得到广泛的应用。SurfaceView 的工作原理是基于 Surface 和 SurfaceHolder 的，同时需要使用渲染线程进行绘制。在使用 SurfaceView 进行开发时，需要注意多线程同步问题，并及时通知 Surface 进行刷新。