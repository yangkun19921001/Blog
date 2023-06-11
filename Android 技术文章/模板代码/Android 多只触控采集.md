```java
package com.example.p2ps;

import android.content.Context;
import android.graphics.PointF;
import android.os.Build;
import android.util.AttributeSet;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.SparseArray;
import android.view.Display;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;

public class MultiTouchView extends View {
    // 存储当前活跃的手指及其对应的坐标点
    private SparseArray<PointF> mActivePointers = new SparseArray<>();
    // 存储每个手指的上次触控事件时间
    private SparseArray<Long> mLastEventTimes = new SparseArray<>();
    //存储手指移动
    private SparseArray<Boolean> mFingerMoved = new SparseArray<>();
    private SparseArray<Float> mTouchDistances = new SparseArray<>();


    // 设置速度阈值和采样间隔
    private static final float SLOW_VELOCITY_THRESHOLD = 0.1f; // 像素/毫秒
    private static final float FAST_VELOCITY_THRESHOLD = 10.0f; // 像素/毫秒
    private static final long SLOW_SAMPLE_INTERVAL = 100; // 毫秒
    private static final long FAST_SAMPLE_INTERVAL = 16; // 毫秒
    private static final float DISTANCE = 0.5f;


    // 触控事件监听器接口
    public interface OnTouchListener {
        void onFingerDown(int pointerId, float x, float y);

        void onFingerMove(int pointerId, float deltaX, float deltaY);

        void onFingerUp(int pointerId, float x, float y);

        void onBeforeSliding();

        void onAfterSliding();
    }

    private OnTouchListener mListener;

    public MultiTouchView(Context context) {
        super(context);
        init();
    }

    public MultiTouchView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public MultiTouchView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        WindowManager windowManager = (WindowManager) getContext().getSystemService(Context.WINDOW_SERVICE);
        if (windowManager != null) {
            Display display = windowManager.getDefaultDisplay();
            DisplayMetrics displayMetrics = new DisplayMetrics();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
                display.getRealMetrics(displayMetrics);
//                mDeviceRefreshRate = displayMetrics.density * 1000f / display.getRefreshRate();
            } else {
//                mDeviceRefreshRate = 33;
            }

        }
    }

    public void setOnTouchListener(OnTouchListener listener) {
        mListener = listener;
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        int action = event.getActionMasked();
        int pointerIndex = event.getActionIndex();
        int pointerId = event.getPointerId(pointerIndex);

        long currentTime = System.currentTimeMillis();
        long elapsedTime;

        switch (action) {
            case MotionEvent.ACTION_DOWN:
            case MotionEvent.ACTION_POINTER_DOWN:
                mActivePointers.put(pointerId, new PointF(event.getX(pointerIndex), event.getY(pointerIndex)));
                mTouchDistances.put(pointerId, 0f);
                mFingerMoved.put(pointerId, false);
                mLastEventTimes.put(pointerId, System.currentTimeMillis());
                break;

            case MotionEvent.ACTION_MOVE:
                for (int i = 0; i < event.getPointerCount(); i++) {
                    pointerId = event.getPointerId(i);
                    PointF previousPoint = mActivePointers.get(pointerId);
                    Long lastEventTime = mLastEventTimes.get(pointerId);

                    // 如果从 mLastEventTimes 中获取不到相应的 pointerId 的时间，则设置 elapsedTime 为 SLOW_SAMPLE_INTERVAL
                    elapsedTime = lastEventTime == null ? SLOW_SAMPLE_INTERVAL : currentTime - lastEventTime;

                    // 计算当前触控事件的速度
                    float deltaX = event.getX(i) - previousPoint.x;
                    float deltaY = event.getY(i) - previousPoint.y;
                    float velocity = (float) Math.sqrt(deltaX * deltaX + deltaY * deltaY) / elapsedTime;

                    Log.i("velocity", "-SAMPLE_INTERVAL-:" + elapsedTime + " velocity：" + velocity);
                    // 根据速度动态调整采样率，同时考虑设备刷新率
                    if (velocity < SLOW_VELOCITY_THRESHOLD) {
                        if (elapsedTime < SLOW_SAMPLE_INTERVAL) {
                            Log.i("velocity", "SLOW_SAMPLE_INTERVAL:" + elapsedTime);
                            continue;
                        }
                    } else if (velocity < FAST_VELOCITY_THRESHOLD) {
                        if (elapsedTime < FAST_SAMPLE_INTERVAL) {
                            Log.i("velocity", "FAST_SAMPLE_INTERVAL:" + elapsedTime);
                            continue;
                        }
                    }

                    // 计算滑动距离并更新 mTouchDistances
                    float distance = mTouchDistances.get(pointerId) + (float) Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                    mTouchDistances.put(pointerId, distance);

                    // 如果滑动距离大于等于 DISTANCE px，更新 mFingerMoved 为 true
                    if (distance >= DISTANCE) {
                        if (!mFingerMoved.get(pointerId)) {
                            if (mListener != null) {
                                Log.i("velocity-onFingerMove", "onFingerMove:" + elapsedTime);
                                mListener.onBeforeSliding();
                            }
                        }
                        mFingerMoved.put(pointerId, true);
                    }

                    if (mListener != null && mFingerMoved.get(pointerId)) {
                        Log.i("velocity-onFingerMove", "onFingerMove:" + elapsedTime);
                        mListener.onFingerMove(pointerId, deltaX, deltaY);
                    }

                    previousPoint.set(event.getX(i), event.getY(i));
                    mLastEventTimes.put(pointerId, currentTime);
                }
                break;
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_POINTER_UP:
                boolean fingerMoved = mFingerMoved.get(pointerId);
                // 如果没有发生滑动，触发 onFingerDown 和 onFingerUp 回调
                if (!fingerMoved && mListener != null) {
                    mListener.onFingerDown(pointerId, mActivePointers.get(pointerId).x, mActivePointers.get(pointerId).y);
                    mListener.onFingerUp(pointerId, event.getX(pointerIndex), event.getY(pointerIndex));
                } else if (fingerMoved && mListener != null) {
                    mListener.onAfterSliding();
                }
                mActivePointers.remove(pointerId);
                mTouchDistances.remove(pointerId);
                mFingerMoved.remove(pointerId);
                mLastEventTimes.remove(pointerId);
                break;
            case MotionEvent.ACTION_CANCEL:
                mActivePointers.remove(pointerId);
                mTouchDistances.remove(pointerId);
                mFingerMoved.remove(pointerId);
                mLastEventTimes.remove(pointerId);
                break;
        }
        return true;
    }
}

```

这是一个完整的多指触控采集自定义 View 示例，包含了中文注释。在这个示例中，我们实现了一个基本的多指触控事件处理，并根据手指在屏幕上滑动的速度动态调整触控事件的采样率。你可以根据你的实际需求调整速度阈值和采样间隔，以达到理想的性能和响应速度。

