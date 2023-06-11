

## 简介

在  **WebRTC** Android 中，已经兼容了 Camera 和 Camera2 原生 API 的相机采集，所以我们不必再单独实现一套采集功能。不过我们可以根据 RTC 的抽象 CameraCapturer 接口实现 CameraX (其实也是基于 Camera2的封装) 的相机采集，显然，这不是该篇的主题就不再多说了。该篇文章，主要为大家解析 WebRTC 的相机采集从  java 到 Jni 的一个调用过程。

先上一个整个调用的时序图，有条件的同学可以根据时序图来跟踪源码:

其实整个涉及到的文件还是比较多的

![](http://devyk.top/2022/WebRTC相机采集流程.png)

## 相机采集

WebRTC Android 中定义了一个抽象的视频采集接口为 `VideoCapturer` , 内部定义了 **初始化(SurfaceTexture 渲染帮助类 、相机采集 VideoFrame 回调 )** 、**开始/结束/释放 ** 等采集生命周期 API, 最终实现有 Camera1Capturer 和 Camera2Capturer  2 个子类。

为了有一个更清晰的一个结构，下面可以看一下 `VideoCapturer` 类图:

![](http://devyk.top/2022/相机采集 UML (1).png)

下面我们分别来介绍 webrtc 是如何来对 Camera1/2 进行创建并使用的，首先我们先看下上面的类图， 最顶层是 VideoCapturer 抽象接口

```java
// Base interface for all VideoCapturers to implement.
public interface VideoCapturer {

  void initialize(SurfaceTextureHelper surfaceTextureHelper, Context applicationContext,
      CapturerObserver capturerObserver);

  void startCapture(int width, int height, int framerate);

  void stopCapture() throws InterruptedException;

  void changeCaptureFormat(int width, int height, int framerate);

  void dispose();

  boolean isScreencast();
}
```

它的直接实现为 **CameraVideoCapturer** 然后它具体的实现是一个抽象 **CameraCapturer** ,  该抽象类封装了 Camera1/2 公共部分，当调用 **startCapture** 接口，内部实现了 **createCameraSession** 抽象函数，以供 Camera1/2 各自进行创建 Session,可以看下下面代码的调用:

```java
abstract class CameraCapturer implements CameraVideoCapturer {
  
  ...
    
  @Override
  public void startCapture(int width, int height, int framerate) {
   ...
   createSessionInternal(0);
  }
  
  private void createSessionInternal(int delayMs) {
    cameraThreadHandler.postDelayed(new Runnable() {
      @Override
      public void run() {
        createCameraSession(createSessionCallback, cameraSessionEventsHandler, applicationContext,
            surfaceHelper, cameraName, width, height, framerate);
      }
    }, delayMs);
  }
  
 //Camera 1 and Camera1 实现
 abstract protected void createCameraSession(CameraSession.CreateSessionCallback   	createSessionCallback, CameraSession.Events events,
      Context applicationContext, SurfaceTextureHelper surfaceTextureHelper, String cameraName,
      int width, int height, int framerate);
}
```

![](http://devyk.top/2022/WX20220904-124037.png)

可以看到最终抽象的实现就是最上面类图中的 **Camera1Capturer** 和 **Camera2Capturer** ,我们还是分别进行分析。

### Camera 1

如果最上层使用 Camera1 进行 startCapture, 最终将执行到如下代码:
```java
  public Camera1Capturer(
      @Override
  protected void createCameraSession(CameraSession.CreateSessionCallback  createSessionCallback,
      CameraSession.Events events, Context applicationContext,
      SurfaceTextureHelper surfaceTextureHelper, String cameraName, int width, int height,
      int framerate) {
    
    Camera1Session.create(createSessionCallback, events, captureToTexture, applicationContext,surfaceTextureHelper, Camera1Enumerator.getCameraIndex(cameraName), width, height,framerate);
  }
}  
```

可以看到函数体中具体是 Camera1Session#create 的调用，我们跟进去看一下

```java
class Camera1Session implements CameraSession {
  ...
    
  public static void create(final CreateSessionCallback callback, final Events events,
      final boolean captureToTexture, final Context applicationContext,
      final SurfaceTextureHelper surfaceTextureHelper, final int cameraId, final int width,
      final int height, final int framerate) {
    final long constructionTimeNs = System.nanoTime();
		
    ...

    final android.hardware.Camera camera;
    camera = android.hardware.Camera.open(cameraId);
    camera.setPreviewTexture(surfaceTextureHelper.getSurfaceTexture());

    final android.hardware.Camera.CameraInfo info = new android.hardware.Camera.CameraInfo();
    android.hardware.Camera.getCameraInfo(cameraId, info);

    final CaptureFormat captureFormat;
    final android.hardware.Camera.Parameters parameters = camera.getParameters();
    captureFormat = findClosestCaptureFormat(parameters, width, height, framerate);
    final Size pictureSize = findClosestPictureSize(parameters, width, height);
      updateCameraParameters(camera, parameters, captureFormat, pictureSize, captureToTexture);

    if (!captureToTexture) {
      final int frameSize = captureFormat.frameSize();
      for (int i = 0; i < NUMBER_OF_CAPTURE_BUFFERS; ++i) {
        final ByteBuffer buffer = ByteBuffer.allocateDirect(frameSize);
        camera.addCallbackBuffer(buffer.array());
      }
    }

    // Calculate orientation manually and send it as CVO insted.
    camera.setDisplayOrientation(0 /* degrees */);

    //内部会设置采集的 NV21 or OES 回调
    callback.onDone(new Camera1Session(events, captureToTexture, applicationContext,
        surfaceTextureHelper, cameraId, camera, info, captureFormat, constructionTimeNs));
  }  
}  
```

可以看到这一步就是通过 Camera.open 打开摄像头，并进行帧率、采集格式、预览等一些基础设置.

```java
  private Camera1Session(...) {

	...
    surfaceTextureHelper.setTextureSize(captureFormat.width, captureFormat.height);

    startCapturing();
  }
```

当实例化 Camera1Session 时，会首先设置 **surfaceTexture** 的缓冲大小，也就是分辨率，最后是调用 **this.startCapturing()** 

在 startCapturing 实现体中，调用了 camera 的预览函数，我们一起来看下

```java

  private void startCapturing() {
    Logging.d(TAG, "Start capturing");
    checkIsOnCameraThread();

    state = SessionState.RUNNING;

		...

    if (captureToTexture) {
      //采集输出 OES 纹理
      listenForTextureFrames();
    } else {
      //采集输出 YUV420sp（NV21）buf
      listenForBytebufferFrames();
    }
    try {
      camera.startPreview();
    } catch (RuntimeException e) {
      stopInternal();
      events.onCameraError(this, e.getMessage());
    }
  }
```

这里我们统一只介绍采集 OES 纹理，在 listenForTextureFrames 函数中实现了采集的 frame 回调

```java
  private void listenForTextureFrames() {
    surfaceTextureHelper.startListening((VideoFrame frame) -> {
      checkIsOnCameraThread();
			...
      final VideoFrame modifiedFrame = new VideoFrame(
          CameraSession.createTextureBufferWithModifiedTransformMatrix(
              (TextureBufferImpl) frame.getBuffer(),
              /* mirror= */ info.facing == android.hardware.Camera.CameraInfo.CAMERA_FACING_FRONT,
              /* rotation= */ 0),
          /* rotation= */ getFrameOrientation(), frame.getTimestampNs());
      events.onFrameCaptured(Camera1Session.this, modifiedFrame);
      modifiedFrame.release();
    });
  }
```

当接收到采集后的数据，会调用 events.onFrameCaptured 函数，后面的处理就会在 native 中了，会单独进行分析。

### Camera2

Camera2 API 是 Android API-22 加入的，目的是为了支持更加复杂的相机使用场景，因此它的 API 使用也相较于 Camera1 复杂一些。

如果最上层使用 Camera2 进行 startCapture, 那么它的代码调用如下:

```java
@TargetApi(21)
public class Camera2Capturer extends CameraCapturer {
  ...
    

  @Override
  protected void createCameraSession(CameraSession.CreateSessionCallback createSessionCallback,
                                     CameraSession.Events events, Context applicationContext,
                                     SurfaceTextureHelper surfaceTextureHelper, String cameraName, int width, int height,
                                     int framerate) {
    Camera2Session.create(createSessionCallback, events, applicationContext, cameraManager,
        surfaceTextureHelper, cameraName, width, height, framerate);
  }
}  
```

这里与 Camera1 调用类似，具体 Camera2 使用也是在 CameraSeesion 中，代码如下:

```java
class Camera2Session implements CameraSession {
  
  
  public static void create(CreateSessionCallback callback, Events events,
                              Context applicationContext, CameraManager cameraManager,
                              SurfaceTextureHelper surfaceTextureHelper, String cameraId, int width, int height,int framerate) {
        new Camera2Session(callback, events, applicationContext, cameraManager, surfaceTextureHelper,cameraId, width, height, framerate);
    }
  
  private Camera2Session(...)
  {
    start();
  }
  private void start() {
        checkIsOnCameraThread();
        Logging.d(TAG, "start");
    		
        findCaptureFormat();
        openCamera();
  }
}
```

上面 start 主要是找到相机的采集格式，比如找到采集的 fps 范围，采集的分辨率等，还有采集的颜色格式（统一是 NV21）,最后是通过 openCamera 打开摄像头

```java
    @SuppressLint("MissingPermission")
    private void openCamera() {
        checkIsOnCameraThread();

        Logging.d(TAG, "Opening camera " + cameraId);
        events.onCameraOpening();

        try {
            cameraManager.openCamera(cameraId, new CameraStateCallback(), cameraThreadHandler);
        } catch (CameraAccessException e) {
            reportError("Failed to open camera: " + e);
            return;
        }
    }
```

通过 mCameraManager#openCamera 传入摄像头的 id 和 Camera 状态回调。调用之后，成功与失败就会执行到该接口中

```java
public static abstract class StateCallback {
  public abstract void onOpened(@NonNull CameraDevice camera);
  public void onClosed(@NonNull CameraDevice camera);
  public abstract void onDisconnected(@NonNull CameraDevice camera);
  public abstract void onError(@NonNull CameraDevice camera,
                @ErrorCode int error);
}
```

当打开成功就会执行到 #onOpened 函数中，我们看下具体打开成功后的操作

```java
        @Override
        public void onOpened(CameraDevice camera) {
            checkIsOnCameraThread();

            Logging.d(TAG, "Camera opened.");
            cameraDevice = camera;

            surfaceTextureHelper.setTextureSize(captureFormat.width, captureFormat.height);
            surface = new Surface(surfaceTextureHelper.getSurfaceTexture());
            try {
                camera.createCaptureSession(
                        Arrays.asList(surface), new CaptureSessionCallback(), cameraThreadHandler);
            } catch (CameraAccessException e) {
                reportError("Failed to create capture session. " + e);
                return;
            }
        }
```

可以看到，在该函数中主要设置启动预览，用的是 SurfaceTexture 进行接收数据，当调用 camera.createCaptureSession 之后会将创建的状态回调给 **CameraCaptureSession.StateCallback** 的子类，也就是第二个参数 new CaptureSessionCallback(), 当创建成功之后，会执行 onConfigured 回调，最后会在该回调中进行设置帧率，和关联 surface 和设置采集的回调(OES)。有一点需要注意一下，采集的宽高不是直接设置给 CameraDevice 的，而是设置给 SurfaceTexture 的。

```java
public void onConfigured(CameraCaptureSession session) {
 ....
 surfaceTextureHelper.startListening((VideoFrame frame) -> {
   ...
     //将采集到的相机 OES 纹理回调出去
     events.onFrameCaptured(Camera2Session.this, modifiedFrame);
   ...
 }
 ....
}
```

这里之后，Camera1 和 Camera2 的处理流程是一样的了，下面会统一介绍。



到这里主要采集的工作已经完成了，我们总结下 Camera1和Camera2 的流程吧:

**Camera1:**

1. 通过 Camera.open 实例化
2. 通过 camera.setPreviewTexture 设置预览 SurfaceTexture , 主要是用来接收帧数据.
3. 通过 camera.setParameters 设置相机预览的参数，比如帧率、分辨率等
4. 通过 camera.setDisplayOrientation 设置预览的方向
5. 通过 camera.startPreview/stopPreview/release 设置预览的生命周期

**Camera2:**

1. 通过 getSystemService(Context.CAMERA_SERVICE)  创建相机管理类
2. 通过 mCameraManager.openCamera 创建 CameraDevice ，并设置创建的状态回调
3. 通过 CameraDevice.StateCallback#onOpened 接收创建成功的回调，通过 camera.createCaptureSession 开启预览的 session,并设置 create 的回调。
4. 通过 CameraCaptureSession.StateCallback#onConfigured 来接收上一步设置的session 状态回调，最后是通过 session.setRepeatingRequest 来设置采集的数据格式
5. 通过 cameraCaptureSession.stop 和 cameraDevice.close 来停止 Camera2 的预览



## 相机数据 native 处理

上一小节我们分析到了 **events.onFrameCaptured(Camera2Session.this, modifiedFrame);** 该回调会执行到

**CameraCapturer#onFrameCaptured** 函数中，最后调用 **capturerObserver.onFrameCaptured(frame);** 会执行到 **VideoSource#onFrameCaptured** 函数，如下代码所示:

```java
   //CameraCapturer.java
    @Override
    public void onFrameCaptured(CameraSession session, VideoFrame frame) {
      checkIsOnCameraThread();
      synchronized (stateLock) {
			...
        capturerObserver.onFrameCaptured(frame);
      }
    }
```

```java
  //VideoSource.java
    @Override
    public void onFrameCaptured(VideoFrame frame) {
      final VideoProcessor.FrameAdaptationParameters parameters =
          nativeAndroidVideoTrackSource.adaptFrame(frame);
      synchronized (videoProcessorLock) {
        if (videoProcessor != null) {
          videoProcessor.onFrameCaptured(frame, parameters);
          return;
        }
      }

      VideoFrame adaptedFrame = VideoProcessor.applyFrameAdaptationParameters(frame, 	parameters);
      if (adaptedFrame != null) {
        nativeAndroidVideoTrackSource.onFrameCaptured(adaptedFrame);
        adaptedFrame.release();
      }
    }

```

```java
//NativeAndroidVideoTrackSource.java

  private static native void nativeOnFrameCaptured(
      long nativeAndroidVideoTrackSource, int rotation, long timestampNs, VideoFrame.Buffer buffer);
```

到这里，就会将采集到的数据 VideoFrame 包装类，传递到 NativeAndroidVideoTrackSource_jni.h 代码中, 接着会把 nativeAndroidVideoTrackSource 指针地址转为 Native 端的 AndroidVideoTrackSource class,再调用内部的 OnFrameCaptured 函数，详细代码如下:

```c++
JNI_GENERATOR_EXPORT void Java_org_webrtc_NativeAndroidVideoTrackSource_nativeOnFrameCaptured(
    JNIEnv* env,
    jclass jcaller,
    jlong nativeAndroidVideoTrackSource,
    jint rotation,
    jlong timestampNs,
    jobject buffer) {
  AndroidVideoTrackSource* native =
      reinterpret_cast<AndroidVideoTrackSource*>(nativeAndroidVideoTrackSource);
  CHECK_NATIVE_PTR(env, jcaller, native, "OnFrameCaptured");
  return native->OnFrameCaptured(env, rotation, timestampNs,
      base::android::JavaParamRef<jobject>(env, buffer));
}
```

当执行到内部的 OnFrameCaptured 函数，代码如下:

```c++
void AndroidVideoTrackSource::OnFrameCaptured(
    JNIEnv* env,
    jint j_rotation,
    jlong j_timestamp_ns,
    const JavaRef<jobject>& j_video_frame_buffer) {
  rtc::scoped_refptr<VideoFrameBuffer> buffer =
      AndroidVideoBuffer::Create(env, j_video_frame_buffer);
  //转为 c++ 枚举
  const VideoRotation rotation = jintToVideoRotation(j_rotation);

  // AdaptedVideoTrackSource handles applying rotation for I420 frames.
  //这里主要是处理 I420 数据的旋转
  if (apply_rotation() && rotation != kVideoRotation_0)
    buffer = buffer->ToI420();
  //调用当前的 OnFrame 函数
  OnFrame(VideoFrame::Builder()
              .set_video_frame_buffer(buffer)
              .set_rotation(rotation)
              .set_timestamp_us(j_timestamp_ns / rtc::kNumNanosecsPerMicrosec)
              .build());
}
```

调用 OnFrame 后的代码

```c++
void AdaptedVideoTrackSource::OnFrame(const webrtc::VideoFrame& frame) {
  rtc::scoped_refptr<webrtc::VideoFrameBuffer> buffer(
      frame.video_frame_buffer());
  if (apply_rotation() && frame.rotation() != webrtc::kVideoRotation_0 &&
      buffer->type() == webrtc::VideoFrameBuffer::Type::kI420) {
    /* Apply pending rotation. */
    webrtc::VideoFrame rotated_frame(frame);
    //内部调用 libyuv 进行处理旋转
    rotated_frame.set_video_frame_buffer(
        webrtc::I420Buffer::Rotate(*buffer->GetI420(), frame.rotation()));
    rotated_frame.set_rotation(webrtc::kVideoRotation_0);
    broadcaster_.OnFrame(rotated_frame);
  } else {
    broadcaster_.OnFrame(frame);
  }
}
```

因为我们这里是 OES 纹理，并且也不会处理旋转，所以直接走``` else ,VideoBroadcaster#OnFrame 函数，在这里会遍历 std::vector<SinkPair>``` ，然后调用对应 sink 的 OnFrame 进行处理

```c++

void VideoBroadcaster::OnFrame(const webrtc::VideoFrame& frame) {
  rtc::CritScope cs(&sinks_and_wants_lock_);
  bool current_frame_was_discarded = false;
  for (auto& sink_pair : sink_pairs()) {
		...
    if (sink_pair.wants.black_frames) {
      webrtc::VideoFrame black_frame =
          webrtc::VideoFrame::Builder()
              .set_video_frame_buffer(
                  GetBlackFrameBuffer(frame.width(), frame.height()))
              .set_rotation(frame.rotation())
              .set_timestamp_us(frame.timestamp_us())
              .set_id(frame.id())
              .build();
      sink_pair.sink->OnFrame(black_frame);
    } else if (!previous_frame_sent_to_all_sinks_ && frame.has_update_rect()) {
      webrtc::VideoFrame copy = frame;
      copy.clear_update_rect();
      sink_pair.sink->OnFrame(copy);
    } else {
      sink_pair.sink->OnFrame(frame);
    }
  }

}

```

通过 debug 我们可以知道，内部有 2 个 sink,一个是 VideoSinkWrapper 另一个是 VideoStreamEncoder 

![](http://devyk.top/2022/WechatIMG40.png)

该篇不会涉及编码相关介绍，所以先忽略这个指针吧

![](http://devyk.top/2022/WX20220904-171707.png)

我们跟进 VideoSinkWrapper#OnFrame 去看看

```c++
#video_sink.cc
void VideoSinkWrapper::OnFrame(const VideoFrame& frame) {
  JNIEnv* jni = AttachCurrentThreadIfNeeded();
  //1. 主要将 Native 中的 VideoFrame 实例化为 Java 端的 VideoFrame
  ScopedJavaLocalRef<jobject> j_frame = NativeToJavaVideoFrame(jni, frame);
  //2. 
  Java_VideoSink_onFrame(jni, j_sink_, j_frame);
  //3. 
  ReleaseJavaVideoFrame(jni, j_frame);
}
```

我们直接看第二步把，这一步其实就是把 VideoFrame 通过 JNIEnv#CallVoidMethod 回调给 Java 端,代码如下

```c++
static void Java_VideoSink_onFrame(JNIEnv* env, const base::android::JavaRef<jobject>& obj, const
    base::android::JavaRef<jobject>& frame) {
  //拿到 "org/webrtc/VideoSink" Java的 claszz
  jclass clazz = org_webrtc_VideoSink_clazz(env);
  CHECK_CLAZZ(env, obj.obj(),
      org_webrtc_VideoSink_clazz(env));

  jni_generator::JniJavaCallContextChecked call_context;
  call_context.Init<
      base::android::MethodID::TYPE_INSTANCE>(
          env,
          clazz,
          "onFrame",
          "(Lorg/webrtc/VideoFrame;)V",
          &g_org_webrtc_VideoSink_onFrame);

     env->CallVoidMethod(obj.obj(),
          call_context.base.method_id, frame.obj());
}
```

看到 **CallVoidMethod** 是不是感觉特亲切了，它的第一个参数就是回调给 java 具体的对象，第二个参数就是回调给对象中的具体函数，第三个传参的数据类型。

```c++
 void CallVoidMethod(jobject obj, jmethodID methodID, ...)
```

第一个参数 obj 我们预览的时候再进行说明，第二个参数可以通过上面的代码得知，它是 **onFrame** 函数，参数签名为 **"(Lorg/webrtc/VideoFrame;)V"** ，后面传递的参数就是 VideoFrame。



到这里 jni 处理采集到的相机数据就处理完了，其实采集 java -> jni -> java 中间部分就通过 libyuv处理了下 I420 的旋转，如果不处理旋转的话，就直接再回调给 java 即可。

## 相机数据预览

上一小节我们留了一个问题，就是 **env->CallVoidMethod(obj.obj(),
          call_context.base.method_id, frame.obj());** 的第一个参数这个 obj 具体是哪个类的，我们先来到 CallActivity.java 的 **onConnectedToRoomInternal** 函数这个函数的回调就是代表 WebSocket 连接成功并且进入到了视频通话房间中。我们具体看下该函数的实现:

```java
//CallActivity.java
private final ProxyVideoSink remoteProxyRenderer = new ProxyVideoSink();
private final ProxyVideoSink localProxyVideoSink = new ProxyVideoSink();
private final List<VideoSink> remoteSinks = new ArrayList<>();

remoteSinks.add(remoteProxyRenderer);


private static class ProxyVideoSink implements VideoSink {
        private VideoSink target;

        @Override
        synchronized public void onFrame(VideoFrame frame) {
            if (target == null) {
                Logging.d(TAG, "Dropping frame in proxy because target is null.");
                return;
            }
            //本地纹理
            target.onFrame(frame);
        }

        synchronized public void setTarget(VideoSink target) {
            this.target = target;
        }
    }

private void onConnectedToRoomInternal(final SignalingParameters params) {
        final long delta = System.currentTimeMillis() - callStartedTimeMs;

        signalingParameters = params;
        logAndToast("Creating peer connection, delay=" + delta + "ms");
        VideoCapturer videoCapturer = null;
        if (peerConnectionParameters.videoCallEnabled) {
          //第一步
            videoCapturer = createVideoCapturer();
        }
        //第二步
        peerConnectionClient.createPeerConnection(
                localProxyVideoSink, remoteSinks, videoCapturer, signalingParameters);

        ...
    }

```

P2P 建联媒体协商，这里就不再说明了，因为不是该篇的内容。我们先看第一步，可以发现 createVideoCapturer 返回值就是 **VideoCapturer** 相机采集的基类，跟第一小节的 VideoCapturer 给对应上了，接着往下看，这里会调用 PeerConnectionClient#createPeerConnection 函数，会把本地的 VideoSink和远端的 VideoSink 给传递过去，具体代码如下:

```java
 //PeerConnectionClient.java
 public void createPeerConnection(final VideoSink localRender, final List<VideoSink> remoteSinks,
      final VideoCapturer videoCapturer, final SignalingParameters signalingParameters) {
   ...
    this.localRender = localRender;
    this.remoteSinks = remoteSinks;
    this.videoCapturer = videoCapturer;
    
    executor.execute(() -> {
      try {
        ...
        createPeerConnectionInternal();
        ...
      } catch (Exception e) {
        reportError("Failed to create peer connection: " + e.getMessage());
        throw e;
      }
    });
   ...
  }
```

我们只分析关键位置，继续执行到 createPeerConnectionInternal 函数内部中

```java
  //PeerConnectionClient.java
  private void createPeerConnectionInternal() {
    ...
     if (isVideoCallEnabled()) {
      peerConnection.addTrack(createVideoTrack(videoCapturer), mediaStreamLabels);
		...
    }  
    ...
    
  }
```

已经快接近真像了，再坚持一下. 我们先看一下 createVideoTrack 具体实现，代码如下:

```java
//PeerConnectionClient.java
  @Nullable
  private VideoTrack createVideoTrack(VideoCapturer capturer) {
    //第一步
    surfaceTextureHelper =
        SurfaceTextureHelper.create("CaptureThread", rootEglBase.getEglBaseContext());
    videoSource = factory.createVideoSource(capturer.isScreencast());
    //第二步
    capturer.initialize(surfaceTextureHelper, appContext, videoSource.getCapturerObserver());
    capturer.startCapture(videoWidth, videoHeight, videoFps);

    localVideoTrack = factory.createVideoTrack(VIDEO_TRACK_ID, videoSource);
    localVideoTrack.setEnabled(renderVideo);
    //第三步
    localVideoTrack.addSink(localRender);
    return localVideoTrack;
  }
```

这个函数代码比较核心，我们分为 3 个步骤进行分析

先来看第一步，首先是通过 SurfaceTextureHelper.create 创建一个 **SurfaceTextureHelper** 。在第一小节我们已经发现它的影子了，当时没有介绍它。就是等这一刻来介绍。

当调用 create 的时候，内部会进行实例化该对象，最终会执行到构造函数，我们看下具体实现，代码如下:

```java
  private SurfaceTextureHelper(Context sharedContext, Handler handler, boolean alignTimestamps,
      YuvConverter yuvConverter, FrameRefMonitor frameRefMonitor) {
    //判断线程
    if (handler.getLooper().getThread() != Thread.currentThread()) {
			...
    }
      ...
    //在 CaptureThread 线程中创建 EGL 环境
    eglBase = EglBase.create(sharedContext, EglBase.CONFIG_PIXEL_BUFFER);
    try {
      eglBase.createDummyPbufferSurface();
      eglBase.makeCurrent();
    } catch (RuntimeException e) {
      eglBase.release();
      handler.getLooper().quit();
      throw e;
    }
		
    //OES 纹理id 生成的核心代码
    oesTextureId = GlUtil.generateTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES);
    //创建 SurfaceTexture 对象，传入纹理 id
    surfaceTexture = new SurfaceTexture(oesTextureId);
    //设置渲染的回调，调用 updateTexImage 执行
    setOnFrameAvailableListener(surfaceTexture, (SurfaceTexture st) -> {
      hasPendingTexture = true;
      //相机机数据可用时就会进行回调，然后就将采集到数据回调给 设置 SurfaceTextureHelper#startListening 处
      tryDeliverTextureFrame();
    }, handler);
  }

  @TargetApi(21)
  private static void setOnFrameAvailableListener(SurfaceTexture surfaceTexture,
      SurfaceTexture.OnFrameAvailableListener listener, Handler handler) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      surfaceTexture.setOnFrameAvailableListener(listener, handler);
    } else {
      surfaceTexture.setOnFrameAvailableListener(listener);
    }
  }
```

总结一下上面的代码作用，首先是创建 EGL 环境，然后通过 GL ES 创建一个 OES ID 纹理，将这个纹理传递给创建好的 SurfaceTexture 对象，最后是设置采集到的帧回调，如果有数据就会回调给如下代码:

```java
 surfaceTextureHelper.startListening((VideoFrame frame) -> {
 ...
  events.onFrameCaptured(Camera1Session.this, modifiedFrame);
 ...
 }
```

  该处代码也与上一小节给对应上了。

我们继续看 createVideoTrack 代码的第二部分:

首先调用 VideoCapturer#initialize 初始化函数，其次是调用 VideoCapturer#startCapture 开始采集的函数，该处也与上一小节给对应上了。

我们来看 createVideoTrack 代码的第三部分:

我们传入了 本地预览的 VideoSink 

```java
localVideoTrack.addSink(localRender);
```

继续跟一下 addSink,

```java
//VideoTrack.java

  public void addSink(VideoSink sink) {
		...
    if (!sinks.containsKey(sink)) {
      //1.
      final long nativeSink = nativeWrapSink(sink);
      sinks.put(sink, nativeSink);
      //2.
      nativeAddSink(getNativeMediaStreamTrack(), nativeSink);
    }
  }
```

第一步是一个 native 函数，它的实现在 **VideoTrack_jni.h** 处，我们跟一下代码

```c++
JNI_GENERATOR_EXPORT jlong Java_org_webrtc_VideoTrack_nativeWrapSink(
    JNIEnv* env,
    jclass jcaller,
    jobject sink) {
  return JNI_VideoTrack_WrapSink(env, base::android::JavaParamRef<jobject>(env, sink));
}
```

继续跟

```c++
//video_track.cc
static jlong JNI_VideoTrack_WrapSink(JNIEnv* jni,
                                     const JavaParamRef<jobject>& sink) {
  return jlongFromPointer(new VideoSinkWrapper(jni, sink));
}
```

咦，我们发现上一小节的相机数据 native 处理好像也用到了 **VideoSinkWrapper** 类，我们继续看一下这个实例化对象做了什么

![image-20220904185544097](/Users/devyk/Library/Application Support/typora-user-images/image-20220904185544097.png)

通过上图标注 1 处，我们发现实例化该对象只是赋值了从 java 端传递过来的 **ProxyVideoSink** 。该 sink 就是接收采集到渲染的数据。

第二处就是执行在 ProxyVideoSink 中的 onFrame 函数，将 VideoFrame 给回调给 java 。所以这整个采集流程到渲染起始处都已经结合起来了，后面具体的渲染就是 SurfaceViewRenderer 了，通过 OpenGL ES 来渲染。就不详细来分析了。

## 实战 Demo

我把相机采集的代码从 WebRTC 中抽出来了，感兴趣的可以 clone 下来看看。

地址: https://github.com/yangkun19921001/WebRTCSample



## 总结

该篇文章详细的分析了 Camera1/2 的整个采集流程，有条件的建议 debug webrtc 源码来看。如果大家不会在 MACOS 下 debug webrtc 我后续可以出一篇如何在 MACOS 下搭建 webrtc 调试环境。



## 参考

- 《WebRTC Native 开发实战》