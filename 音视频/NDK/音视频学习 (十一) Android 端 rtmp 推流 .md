![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200302220507.png)

## 前言

咱们回顾了前面 2 篇文章，主要讲解了如何搭建 rtmp [直播服务器](https://juejin.im/post/5e4ec66c5188254967067502)，和如何开发一款具有拉流功能的 Android [播放器](https://juejin.im/post/5e495ec1e51d452713551017)。那么现在有了播放端和直播服务器还缺少推流端。该篇文章我们就一起来实现 Android 端的 rtmp 推流，想要实现 Android 端推流必须要经过如下几个阶段，见下图:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200302154202.png)

该篇文章主要完成上图黄颜色功能部分，下面就开始进入正题，代码编写了。

## 项目效果

## 推流监控

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200302204444.png)

### 软编码

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200302210529.gif)

### 硬编码

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200302210914.gif)

文章末尾会介绍软硬编解码。

## 音频采集

Android SDK 提供了两套音频采集的 API ,分别是 MediaRecorder 、AudioRecord 。前者是一个上层 API ,它可以直接对手机麦克风录入的音频数据进行编码压缩(如 AMR/MP3) 等，并存储为文件；后者则更接近底层，能够更加自由灵活地控制，其可以让开发者得到内存中的 PCM 原始音频数据流。如果想做一个简单的录音机，输出音频文件则推荐使用 MediaRecorder ； 如果需要对音频做进一步的算法处理，或者需要采用第三方的编码库进行编码，又或者需要用到网络传输等场景中，那么只能使用 AudioRecord 或者 OpenSL ES ，其实 MediaRecorder 底层也是调用了 AudioRecord 与 Android Framework 层的 AudioFlinger 进行交互的。而我们该篇的场景更倾向于第二种实现方式，即使用 AudioRecord 来采集音频。

如果想要使用 AudioRecord 这个 API ,则需要在应用 AndroidManifest.xml 的配置文件中进行如下配置:

```xml
 <uses-permission android:name="android.permission.RECORD_AUDIO"></uses-permission>
```

当然，如果你想把采集到的 PCM 原始数据，存储 sdcard 中，还需要额外添加写入权限:

```xml
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

接下来了解一下 AudioRecord 的工作流程。

### 1. 初始化 AudioRecord

首先来看一下 AudioRecord 的配置参数，AudioRecord 是通过构造函数来配置参数的，其函数原型如下:

```java
public AudioRecord(int audioSource, int sampleRateInHz, int channelConfig, int audioFormat,int bufferSizeInBytes)
```

上述参数所代表的函数及其在各种场景下应该传递的值的含义参考如下说明:

**audioSource:** 该参数指的是音频采集的输入源，可选值以常量的形式定义在类 AudioSource （MediaRecorder 中的一个内部类）中，常用的值包过:

- DEFAULT(默认)
- VOICE_RECOGNITION (用于语音识别，等同于默认)
- MIC (由手机麦克风输入)
- VOICE_COMMUNICATION (用于 VOIP 应用场景)

**sampleRateInHz:** 用于指定以多大的采样频率来采集音频，现在用的最多的兼容最好是 44100 (44.1KHZ)采样频率。

**channelConfig:** 该参数用于指定录音器采集几个声道的声音，可选值以常量的形式定义在 AudioFormat 类中，常用的值包括:

- CHANNEL_IN_MONO 单声道 (移动设备上目前推荐使用)
- CHANNEL_IN_STEREO 立体声

**audioFormat:** 采样格式，以常量的形式定义在 AudioFormat 类中，常用的值包括:

- ENCODING_PCM_16BIT (16bit 兼容大部分 Android 手机)
- ENCODING_PCM_8BIT (8bit)

**bufferSizeInBytes:** 配置内部音频缓冲区的大小(配置的缓存值越小，延时就越低)，而具体的大小，有可能在不同的手机上会有不同的值，那么可以使用如下 API 进行确定缓冲大小:

```java
AudioRecord.getMinBufferSize(int sampleRateInHz, int channelConfig, int audioFormat);
```

配置好之后，检查一下 AudioRecord 当前的状态是否可以进行录制，可以通过 AudioRecord##getState 来获取当前的状态:

- STATE_UNINITIALIZED 还没有初始化，或者初始化失败了
- STATE_INITIALIZED 已经初始化成功了。

### 2. 开启采集

创建好 AudioRecord 之后，就可以开启音频数据的采集了，可以通过调用下面的函数进行控制麦克风的采集：

```java
mAudioRecord.startRecording();
```

### 3. 提取数据

执行完上一步之后，需要开启一个子线程用于不断的从 AudioRecord 缓冲区读取 PCM 数据，调用如下函数进行读取数据:

```java
int read(@NonNull byte[] audioData, int offsetInBytes, int sizeInBytes);
```

### 4. 停止采集

如果想要停止采集，那么只需要调用 AudioRecord 的 stop 方法来实现，最后可以通过一个变量先控制子线程停止读取数据，然后在调用 stop 停止最后释放 AudioRecord 实例。

```java
    public void stopEncode() {
      	//停止的变量标记
        mStopFlag = true;
        if(mAudioEncoder != null) {
          	//停止采集
            mAudioEncoder.stop();
          	//释放内存
            mAudioEncoder = null;
        }
    }
```

## 视频采集

视频画面的采集主要是使用各个平台提供的摄像头 API 来实现的，在为摄像头设置了合适的参数之后，将摄像头实时采集的视频帧渲染到屏幕上提供给用户预览，然后将该视频帧传递给编码通道，进行编码。

### 1. 权限配置

```java
<uses-permission android:name="android.permission.CAMERA"></uses-permission>
```

### 2. 打开摄像头

#### 2.1 检查摄像头

```java
public static void checkCameraService(Context context)
            throws CameraDisabledException {
    // Check if device policy has disabled the camera.
    DevicePolicyManager dpm = (DevicePolicyManager) context.getSystemService(
            Context.DEVICE_POLICY_SERVICE);
    if (dpm.getCameraDisabled(null)) {
        throw new CameraDisabledException();
    }
}
```

#### 2.2 检查摄像头的个数

检查完摄像头服务后，还需要检查手机上摄像头的个数，如果个数为 0，则说明手机上没有摄像头，这样的话也是不能进行后续操作的。

```java
public static List<CameraData> getAllCamerasData(boolean isBackFirst) {
    ArrayList<CameraData> cameraDatas = new ArrayList<>();
    Camera.CameraInfo cameraInfo = new Camera.CameraInfo();
    int numberOfCameras = Camera.getNumberOfCameras();
    for (int i = 0; i < numberOfCameras; i++) {
        Camera.getCameraInfo(i, cameraInfo);
        if (cameraInfo.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
            CameraData cameraData = new CameraData(i, CameraData.FACING_FRONT);
            if(isBackFirst) {
                cameraDatas.add(cameraData);
            } else {
                cameraDatas.add(0, cameraData);
            }
        } else if (cameraInfo.facing == Camera.CameraInfo.CAMERA_FACING_BACK) {
            CameraData cameraData = new CameraData(i, CameraData.FACING_BACK);
            if(isBackFirst) {
                cameraDatas.add(0, cameraData);
            } else {
                cameraDatas.add(cameraData);
            }
        }
    }
    return cameraDatas;
}
```

在上面的方法中，需要传入一个是否先开启背面摄像头的 boolean 变量，如果变量为 true，则把背面摄像头放在列表第一个，之后打开摄像头的时候，直接获取列表中第一个摄像头相关参数，然后进行打开。这样的设计使得切换摄像头也变得十分简单，切换摄像头时，先关闭当前摄像头，然后变化摄像头列表中的顺序，然后再打开摄像头即可，也就是每次打开摄像头都打开摄像头列表中第一个摄像头参数所指向的摄像头。

#### 2.3 打开摄像头

打开摄像头之前，先从摄像头列表中获取第一个摄像头参数，之后根据参数中的 CameraId 来打开摄像头，打开成功后改变相关状态。相关代码如下：

```java
public synchronized Camera openCamera()
            throws CameraHardwareException, CameraNotSupportException {
    CameraData cameraData = mCameraDatas.get(0);
    if(mCameraDevice != null && mCameraData == cameraData) {
        return mCameraDevice;
    }
    if (mCameraDevice != null) {
        releaseCamera();
    }
    try {
        Log.d(TAG, "open camera " + cameraData.cameraID);
        mCameraDevice = Camera.open(cameraData.cameraID);
    } catch (RuntimeException e) {
        Log.e(TAG, "fail to connect Camera");
        throw new CameraHardwareException(e);
    }
    if(mCameraDevice == null) {
        throw new CameraNotSupportException();
    }
    mCameraData = cameraData;
    mState = State.OPENED;
    return mCameraDevice;
}
```

上面需要注意的是，在 Android 提供的 Camera 源码中，Camera.open(cameraData.cameraID) 抛出异常则说明Camera 不可用，否则说明 Camera 可用，但是在一些手机上 Camera.open(cameraData.cameraID) 不是抛出异常，而是返回 null。

### 3. 配置摄像头参数

在给摄像头设置参数后，需要记录这些参数，以方便其他地方使用。比如记录当前摄像头是否有闪光点，从而可以决定 UI 界面上是否显示打开闪光灯按钮。在直播项目中使用 CameraData 来记录这些参数，CameraData 类如下所示：

```java
public class CameraData {
    public static final int FACING_FRONT = 1;
    public static final int FACING_BACK = 2;

    public int cameraID;            //camera的id
    public int cameraFacing;        //区分前后摄像头
    public int cameraWidth;         //camera的采集宽度
    public int cameraHeight;        //camera的采集高度
    public boolean hasLight;        //camera是否有闪光灯
    public int orientation;         //camera旋转角度
    public boolean supportTouchFocus;   //camera是否支持手动对焦
    public boolean touchFocusMode;      //camera是否处在自动对焦模式

    public CameraData(int id, int facing, int width, int height){
        cameraID = id;
        cameraFacing = facing;
        cameraWidth = width;
        cameraHeight = height;
    }

    public CameraData(int id, int facing) {
        cameraID = id;
        cameraFacing = facing;
    }
}
```

给摄像头设置参数的时候，有一点需要注意：设置的参数不生效会抛出异常，因此需要每个参数单独设置，这样就避免一个参数不生效后抛出异常，导致之后所有的参数都没有设置。

### 4. 摄像头开启预览

设置预览界面有两种方式：1、通过 SurfaceView 显示；2、通过 GLSurfaceView 显示。当为 SurfaceView 显示时，需要传给 Camera 这个 SurfaceView 的 SurfaceHolder。当使用 GLSurfaceView 显示时，需要使用Renderer 进行渲染，先通过 OpenGL 生成纹理，通过生成纹理的纹理 id 生成 SurfaceTexture ，将SurfaceTexture 交给 Camera ，那么在 Render 中便可以使用这个纹理进行相应的渲染，最后通过GLSurfaceView 显示。

#### 4.1 设置预览回调

```java
public static void setPreviewFormat(Camera camera, Camera.Parameters parameters) {
    //设置预览回调的图片格式
    try {
        parameters.setPreviewFormat(ImageFormat.NV21);
        camera.setParameters(parameters);
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

当设置预览好预览回调的图片格式后，需要设置预览回调的 Callback。

```java
Camera.PreviewCallback myCallback = new Camera.PreviewCallback() {
    @Override
    public void onPreviewFrame(byte[] data, Camera camera) {
        //得到相应的图片数据
        //Do something
    }
};
public static void setPreviewCallback(Camera camera, Camera.PreviewCallback callback) {
    camera.setPreviewCallback(callback);
}
```

Android 推荐的 PreViewFormat 是 NV21，在 PreviewCallback 中会返回 Preview 的 N21 图片。如果是软编的话，由于 H264 支持 I420 的图片格式，因此需要将 N21格式转为 I420 格式，然后交给 x264 编码库。如果是硬编的话，由于 Android 硬编编码器支持 I420(COLOR_FormatYUV420Planar) 和NV12(COLOR_FormatYUV420SemiPlanar)，因此可以将 N21 的图片转为 I420 或者 NV12 ，然后交给硬编编码器。

#### 4.2 设置预览图像大小

在摄像头相关处理中，一个比较重要的是 **屏幕显示大小和摄像头预览大小比例不一致** 的处理。在 Android 中，摄像头有一系列的 PreviewSize，我们需要从中选出适合的 PreviewSize 。选择合适的摄像头 PreviewSize 的代码如下所示：

```java
public static Camera.Size getOptimalPreviewSize(Camera camera, int width, int height) {
    Camera.Size optimalSize = null;
    double minHeightDiff = Double.MAX_VALUE;
    double minWidthDiff = Double.MAX_VALUE;
    List<Camera.Size> sizes = camera.getParameters().getSupportedPreviewSizes();
    if (sizes == null) return null;
    //找到宽度差距最小的
    for(Camera.Size size:sizes){
        if (Math.abs(size.width - width) < minWidthDiff) {
            minWidthDiff = Math.abs(size.width - width);
        }
    }
    //在宽度差距最小的里面，找到高度差距最小的
    for(Camera.Size size:sizes){
        if(Math.abs(size.width - width) == minWidthDiff) {
            if(Math.abs(size.height - height) < minHeightDiff) {
                optimalSize = size;
                minHeightDiff = Math.abs(size.height - height);
            }
        }
    }
    return optimalSize;
}

public static void setPreviewSize(Camera camera, Camera.Size size, Camera.Parameters parameters) {
    try {    
        parameters.setPreviewSize(size.width, size.height);           
        camera.setParameters(parameters);
    } 
    catch (Exception e) {    
        e.printStackTrace();
    }
}
```

在设置好最适合的 PreviewSize 之后，将 size 信息存储在 CameraData 中。当选择了 SurfaceView 显示的方式，可以将 SurfaceView 放置在一个 LinearLayout 中，然后根据摄像头 PreviewSize 的比例改变 SurfaceView 的大小，从而使得两者比例一致，确保图像正常。当选择了GLSurfaceView 显示的时候，可以通过裁剪纹理，使得纹理的大小比例和 GLSurfaceView 的大小比例保持一致，从而确保图像显示正常。

#### 4.3 图像旋转

在 Android 中摄像头出来的图像需要进行一定的旋转，然后才能交给屏幕显示，而且如果应用支持屏幕旋转的话，也需要根据旋转的状况实时调整摄像头的角度。在 Android 中旋转摄像头图像同样有两种方法，一是通过摄像头的 setDisplayOrientation(result) 方法，一是通过 OpenGL 的矩阵进行旋转。下面是通过setDisplayOrientation(result) 方法进行旋转的代码：

```java
public static int getDisplayRotation(Activity activity) {
    int rotation = activity.getWindowManager().getDefaultDisplay().getRotation();
    switch (rotation) {
        case Surface.ROTATION_0: return 0;
        case Surface.ROTATION_90: return 90;
        case Surface.ROTATION_180: return 180;
        case Surface.ROTATION_270: return 270;
    }
    return 0;
}

public static void setCameraDisplayOrientation(Activity activity, int cameraId, Camera camera) {
    // See android.hardware.Camera.setCameraDisplayOrientation for
    // documentation.
    Camera.CameraInfo info = new Camera.CameraInfo();
    Camera.getCameraInfo(cameraId, info);
    int degrees = getDisplayRotation(activity);
    int result;
    if (info.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
        result = (info.orientation + degrees) % 360;
        result = (360 - result) % 360; // compensate the mirror
    } else { // back-facing
        result = (info.orientation - degrees + 360) % 360;
    }
    camera.setDisplayOrientation(result);
}
```

#### 4.4 设置预览帧率

通过 Camera.Parameters 中 getSupportedPreviewFpsRange() 可以获得摄像头支持的帧率变化范围，从中选取合适的设置给摄像头即可。相关的代码如下：

```java
public static void setCameraFps(Camera camera, int fps) {
    Camera.Parameters params = camera.getParameters();
    int[] range = adaptPreviewFps(fps, params.getSupportedPreviewFpsRange());
    params.setPreviewFpsRange(range[0], range[1]);
    camera.setParameters(params);
}

private static int[] adaptPreviewFps(int expectedFps, List<int[]> fpsRanges) {
    expectedFps *= 1000;
    int[] closestRange = fpsRanges.get(0);
    int measure = Math.abs(closestRange[0] - expectedFps) + Math.abs(closestRange[1] - expectedFps);
    for (int[] range : fpsRanges) {
        if (range[0] <= expectedFps && range[1] >= expectedFps) {
            int curMeasure = Math.abs(range[0] - expectedFps) + Math.abs(range[1] - expectedFps);
            if (curMeasure < measure) {
                closestRange = range;
                measure = curMeasure;
            }
        }
    }
    return closestRange;
}
```

#### 4.5 设置相机对焦

一般摄像头对焦的方式有两种：手动对焦和触摸对焦。下面的代码分别是设置自动对焦和触摸对焦的模式：

```java
public static void setAutoFocusMode(Camera camera) {
    try {
        Camera.Parameters parameters = camera.getParameters();
        List<String> focusModes = parameters.getSupportedFocusModes();
        if (focusModes.size() > 0 && focusModes.contains(Camera.Parameters.FOCUS_MODE_CONTINUOUS_PICTURE)) {
            parameters.setFocusMode(Camera.Parameters.FOCUS_MODE_CONTINUOUS_PICTURE);
            camera.setParameters(parameters);
        } else if (focusModes.size() > 0) {
            parameters.setFocusMode(focusModes.get(0));
            camera.setParameters(parameters);
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}

public static void setTouchFocusMode(Camera camera) {
    try {
        Camera.Parameters parameters = camera.getParameters();
        List<String> focusModes = parameters.getSupportedFocusModes();
        if (focusModes.size() > 0 && focusModes.contains(Camera.Parameters.FOCUS_MODE_AUTO)) {
            parameters.setFocusMode(Camera.Parameters.FOCUS_MODE_AUTO);
            camera.setParameters(parameters);
        } else if (focusModes.size() > 0) {
            parameters.setFocusMode(focusModes.get(0));
            camera.setParameters(parameters);
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

对于自动对焦这样设置后就完成了工作，但是对于触摸对焦则需要设置对应的对焦区域。要准确地设置对焦区域，有三个步骤：一、得到当前点击的坐标位置；二、通过点击的坐标位置转换到摄像头预览界面坐标系统上的坐标；三、根据坐标生成对焦区域并且设置给摄像头。整个摄像头预览界面定义了如下的坐标系统，对焦区域也需要对应到这个坐标系统中。
![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200302170719.png)

如果摄像机预览界面是通过 SurfaceView 显示的则比较简单，由于要确保不变形，会将 SurfaceView 进行拉伸，从而使得 SurfaceView 和预览图像大小比例一致，因此整个 SurfaceView 相当于预览界面，只需要得到当前点击点在整个 SurfaceView 上对应的坐标，然后转化为相应的对焦区域即可。如果摄像机预览界面是通过GLSurfaceView 显示的则要复杂一些，由于纹理需要进行裁剪，才能使得显示不变形，这样的话，我们要还原出整个预览界面的大小，然后通过当前点击的位置换算成预览界面坐标系统上的坐标，然后得到相应的对焦区域，然后设置给摄像机。当设置好对焦区域后，通过调用 Camera 的 autoFocus() 方法即可完成触摸对焦。
整个过程代码量较多，请自行阅读项目源码。

#### 4.6 设置缩放

当检测到手势缩放的时候，我们往往希望摄像头也能进行相应的缩放，其实这个实现还是比较简单的。首先需要加入缩放的手势识别，当识别到缩放的手势的时候，根据缩放的大小来对摄像头进行缩放。代码如下所示：

```java
/**
 * Handles the pinch-to-zoom gesture
 */
private class ZoomGestureListener extends ScaleGestureDetector.SimpleOnScaleGestureListener {
    @Override
    public boolean onScale(ScaleGestureDetector detector) {
        if (!mIsFocusing) {
            float progress = 0;
            if (detector.getScaleFactor() > 1.0f) {
                progress = CameraHolder.instance().cameraZoom(true);
            } else if (detector.getScaleFactor() < 1.0f) {
                progress = CameraHolder.instance().cameraZoom(false);
            } else {
                return false;
            }
            if(mZoomListener != null) {
                mZoomListener.onZoomProgress(progress);
            }
        }
        return true;
    }
}

public float cameraZoom(boolean isBig) {
    if(mState != State.PREVIEW || mCameraDevice == null || mCameraData == null) {
        return -1;
    }
    Camera.Parameters params = mCameraDevice.getParameters();
    if(isBig) {
        params.setZoom(Math.min(params.getZoom() + 1, params.getMaxZoom()));
    } else {
        params.setZoom(Math.max(params.getZoom() - 1, 0));
    }
    mCameraDevice.setParameters(params);
    return (float) params.getZoom()/params.getMaxZoom();
}
```

#### 4.7 闪光灯操作

一个摄像头可能有相应的闪光灯，也可能没有，因此在使用闪光灯功能的时候先要确认是否有相应的闪光灯。检测摄像头是否有闪光灯的代码如下：

```java
public static boolean supportFlash(Camera camera){
    Camera.Parameters params = camera.getParameters();
    List<String> flashModes = params.getSupportedFlashModes();
    if(flashModes == null) {
        return false;
    }
    for(String flashMode : flashModes) {
        if(Camera.Parameters.FLASH_MODE_TORCH.equals(flashMode)) {
            return true;
        }
    }
    return false;
}
```

切换闪光灯的代码如下：

```java
public static void switchLight(Camera camera, Camera.Parameters cameraParameters) {
    if (cameraParameters.getFlashMode().equals(Camera.Parameters.FLASH_MODE_OFF)) {
        cameraParameters.setFlashMode(Camera.Parameters.FLASH_MODE_TORCH);
    } else {
        cameraParameters.setFlashMode(Camera.Parameters.FLASH_MODE_OFF);
    }
    try {
        camera.setParameters(cameraParameters);
    }catch (Exception e) {
        e.printStackTrace();
    }
}
```

#### 4.8 开始预览 

当打开了摄像头，并且设置好了摄像头相关的参数后，便可以通过调用 Camera 的 startPreview() 方法开始预览。有一个需要说明，无论是 SurfaceView 还是 GLSurfaceView ，都可以设置 SurfaceHolder.Callback ，当界面开始显示的时候打开摄像头并且开始预览，当界面销毁的时候停止预览并且关闭摄像头，这样的话当程序退到后台，其他应用也能调用摄像头。

```
private SurfaceHolder.Callback mSurfaceHolderCallback = new SurfaceHolder.Callback() {
    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        Log.d(SopCastConstant.TAG, "SurfaceView destroy");
        CameraHolder.instance().stopPreview();
        CameraHolder.instance().releaseCamera();
    }

    @TargetApi(Build.VERSION_CODES.GINGERBREAD)
    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        Log.d(SopCastConstant.TAG, "SurfaceView created");
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
     Log.d(SopCastConstant.TAG, "SurfaceView width:" + width + " height:" + height);
        CameraHolder.instance().openCamera();
        CameraHolder.instance().startPreview();
    }
};
```

### 5. 停止预览

停止预览只需要释放掉相机资源即可:

```java

    public synchronized void releaseCamera() {
        if (mState == State.PREVIEW) {
            stopPreview();
        }
        if (mState != State.OPENED) {
            return;
        }
        if (mCameraDevice == null) {
            return;
        }
        mCameraDevice.release();
        mCameraDevice = null;
        mCameraData = null;
        mState = State.INIT;
    }
```

## 音频编码

AudioRecord 采集完之后需要对 PCM 数据进行实时的编码 (软编利用 [libfaac](https://sourceforge.net/projects/faac/files/faac-src/) 通过 NDK 交叉编译静态库、硬编使用 Android SDK MediaCodec 进行编码)。

### 软编

语音软编这里们用主流的编码库 libfaac 进行编码 AAC 语音格式数据。 

#### 1. 编译 libfaac

##### 1.1 下载 libfaac

```shell
wget https://sourceforge.net/projects/faac/files/faac-src/faac-1.29/faac-1.29.9.2.tar.gz
```

##### 1.2 编写交叉编译脚本

```shell
#!/bin/bash

#打包地址
PREFIX=`pwd`/android/armeabi-v7a
#配置NDK 环境变量
NDK_ROOT=$NDK_HOME
#指定 CPU
CPU=arm-linux-androideabi
#指定 Android API
ANDROID_API=17
#编译工具链目录
TOOLCHAIN=$NDK_ROOT/toolchains/$CPU-4.9/prebuilt/linux-x86_64

FLAGS="-isysroot $NDK_ROOT/sysroot -isystem $NDK_ROOT/sysroot/usr/include/arm-linux-androideabi -D__ANDROID_API__=$ANDROID_API -U_FILE_OFFSET_BITS  -DANDROID -ffunction-sections -funwind-tables -fstack-protector-strong -no-canonical-prefixes -march=armv7-a -mfloat-abi=softfp -mfpu=vfpv3-d16 -mthumb -Wa,--noexecstack -Wformat -Werror=format-security  -O0 -fPIC"

CROSS_COMPILE=$TOOLCHAIN/bin/arm-linux-androideabi
export CC="$CROSS_COMPILE-gcc --sysroot=$NDK_ROOT/platforms/android-17/arch-arm"
export CFLAGS="$FLAGS"

./configure \
--prefix=$PREFIX \
--host=arm-linux \
--with-pic \
--enable-shared=no

make clean
make install
```

#### 2. CMakeLists.txt 配置

```cmake
cmake_minimum_required(VERSION 3.4.1)
#语音编码器
set(faac ${CMAKE_SOURCE_DIR}/faac)
#加载 faac 头文件目录
include_directories(${faac}/include)
#指定 faac 静态库文件目录
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -L${faac}/libs/${CMAKE_ANDROID_ARCH_ABI}")
#批量添加自己编写的 cpp 文件,不要把 *.h 加入进来了
file(GLOB Push_CPP ${ykpusher}/*.cpp)
#添加自己编写 cpp 源文件生成动态库
add_library(ykpusher SHARED ${Push_CPP})
#找系统中 NDK log库
find_library(log_lib
        log)
#推流 so
target_link_libraries(
        #播放 so
        ykpusher
#        # 写了此命令不用在乎添加 ffmpeg lib 顺序问题导致应用崩溃
#        -Wl,--start-group
#        avcodec avfilter avformat avutil swresample swscale
#        -Wl,--end-group
#        z
        #推流库
        rtmp
        #视频编码
        x264
        #语音编码
        faac
        #本地库
        android
        ${log_lib}
        )

```

####3. 配置 faac 编码参数

```c++

//设置语音软编码参数
void AudioEncoderChannel::setAudioEncoderInfo(int samplesHZ, int channel) {
  	//如果已经初始化，需要释放
    release();
    //通道 默认单声道
    mChannels = channel;
    //打开编码器
    //3、一次最大能输入编码器的样本数量 也编码的数据的个数 (一个样本是16位 2字节)
    //4、最大可能的输出数据  编码后的最大字节数
    mAudioCodec = faacEncOpen(samplesHZ, channel, &mInputSamples, &mMaxOutputBytes);
    if (!mAudioCodec) {
        if (mIPushCallback) {
            mIPushCallback->onError(THREAD_MAIN, FAAC_ENC_OPEN_ERROR);
        }
        return;
    }

    //设置编码器参数
    faacEncConfigurationPtr config = faacEncGetCurrentConfiguration(mAudioCodec);
    //指定为 mpeg4 标准
    config->mpegVersion = MPEG4;
    //lc 标准
    config->aacObjectType = LOW;
    //16位
    config->inputFormat = FAAC_INPUT_16BIT;
    // 编码出原始数据 既不是adts也不是adif
    config->outputFormat = 0;
    faacEncSetConfiguration(mAudioCodec, config);
    //输出缓冲区 编码后的数据 用这个缓冲区来保存
    mBuffer = new u_char[mMaxOutputBytes];
  	//设置一个标志，用于开启编码
    isStart = true;
}
```

####4. 配置 AAC 包头

在发送 rtmp 音视频包的时候需要将语音包头第一个发送

```c++
/**
 * 音频头包数据
 * @return
 */
RTMPPacket *AudioEncoderChannel::getAudioTag() {
    if (!mAudioCodec) {
        setAudioEncoderInfo(FAAC_DEFAUTE_SAMPLE_RATE, FAAC_DEFAUTE_SAMPLE_CHANNEL);
        if (!mAudioCodec)return 0;
    }
    u_char *buf;
    u_long len;
    faacEncGetDecoderSpecificInfo(mAudioCodec, &buf, &len);
    int bodySize = 2 + len;
    RTMPPacket *packet = new RTMPPacket;
    RTMPPacket_Alloc(packet, bodySize);
    //双声道
    packet->m_body[0] = 0xAF;
    if (mChannels == 1) { //单身道
        packet->m_body[0] = 0xAE;
    }
    packet->m_body[1] = 0x00;
    //将包头数据 copy 到RTMPPacket 中
    memcpy(&packet->m_body[2], buf, len);
		//是否使用绝对时间戳
    packet->m_hasAbsTimestamp = FALSE;
  	//包大小
    packet->m_nBodySize = bodySize;
  	//包类型
    packet->m_packetType = RTMP_PACKET_TYPE_AUDIO;
  	//语音通道
    packet->m_nChannel = 0x11;
    packet->m_headerType = RTMP_PACKET_SIZE_LARGE;
    return packet;
}
```

####5. 开始实时编码

```c++
void AudioEncoderChannel::encodeData(int8_t *data) {
    if (!mAudioCodec || !isStart)//不符合编码要求，退出
        return;
    //返回编码后的数据字节长度
    int bytelen = faacEncEncode(mAudioCodec, reinterpret_cast<int32_t *>(data), mInputSamples,mBuffer, mMaxOutputBytes);
    if (bytelen > 0) {
        //开始打包 rtmp
        int bodySize = 2 + bytelen;
        RTMPPacket *packet = new RTMPPacket;
        RTMPPacket_Alloc(packet, bodySize);
        //双声道
        packet->m_body[0] = 0xAF;
        if (mChannels == 1) {
            packet->m_body[0] = 0xAE;
        }
        //编码出的音频 都是 0x01
        packet->m_body[1] = 0x01;
        memcpy(&packet->m_body[2], mBuffer, bytelen);

        packet->m_hasAbsTimestamp = FALSE;
        packet->m_nBodySize = bodySize;
        packet->m_packetType = RTMP_PACKET_TYPE_AUDIO;
        packet->m_nChannel = 0x11;
        packet->m_headerType = RTMP_PACKET_SIZE_LARGE;
        //发送 rtmp packet，回调给 RTMP send 模块
        mAudioCallback(packet);
    }
}
```

####6. 释放编码器

在不需要编码或者退出编码的时候需要主动释放编码器，释放 native 内存，可以通过如下函数来实现释放编码器的操作:

```c++
void AudioEncoderChannel::release() {
  	//退出编码的标志
    isStart = false;
    //释放编码器
    if (mAudioCodec) {
      	//关闭编码器
        faacEncClose(mAudioCodec);
      	//释放缓冲区
      	DELETE(mBuffer);
        mAudioCodec = 0;
    }
}
```

### 硬编

软编码介绍完了下面利用 Android SDK 自带的 MediaCodec 函数进行对 PCM 编码为 AAC 的格式音频数据。使用 MediaCodec 编码 AAC 对 Android 系统是有要求的，必须是 4.1系统以上，即要求 Android 的版本代号在 Build.VERSION_CODES.JELLY_BEAN (16) 以上。MediaCodec 是 Android 系统提供的硬件编码器，它可以利用设备的硬件来完成编码，从而大大提高编码的效率，还可以降低电量的使用，但是其在兼容性方面不如软编号，因为 Android 设备的锁片化太严重，所以读者可以自己衡量在应用中是否使用 Android 平台的硬件编码特性。

#### 1. 创建 `"audio/mp4a-latm"` 类型的硬编码器

```java
 mediaCodec = MediaCodec.createEncoderByType(configuration.mime);    
```

#### 2.   配置音频硬编码器

```java
    public static MediaCodec getAudioMediaCodec(AudioConfiguration configuration){
        MediaFormat format = MediaFormat.createAudioFormat(configuration.mime, configuration.frequency, configuration.channelCount);
        if(configuration.mime.equals(AudioConfiguration.DEFAULT_MIME)) {
            format.setInteger(MediaFormat.KEY_AAC_PROFILE, configuration.aacProfile);
        }
      	//语音码率
        format.setInteger(MediaFormat.KEY_BIT_RATE, configuration.maxBps * 1024);
      	//语音采样率 44100
        format.setInteger(MediaFormat.KEY_SAMPLE_RATE, configuration.frequency);
        int maxInputSize = AudioUtils.getRecordBufferSize(configuration);
        format.setInteger(MediaFormat.KEY_MAX_INPUT_SIZE, maxInputSize);
        format.setInteger(MediaFormat.KEY_CHANNEL_COUNT, configuration.channelCount);

        MediaCodec mediaCodec = null;
        try {
            mediaCodec = MediaCodec.createEncoderByType(configuration.mime);
          	//MediaCodec.CONFIGURE_FLAG_ENCODE 代表编码器，解码传 0 即可
            mediaCodec.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE);
        } catch (Exception e) {
            e.printStackTrace();
            if (mediaCodec != null) {
                mediaCodec.stop();
                mediaCodec.release();
                mediaCodec = null;
            }
        }
        return mediaCodec;
    }
```

#### 3. 开启音频硬编码器

```java
void prepareEncoder() {
   mMediaCodec = AudioMediaCodec.getAudioMediaCodec(mAudioConfiguration);
   mMediaCodec.start();
}
```

#### 4. 拿到硬编码输入(PCM)输出(AAC) ByteBufferer

到了这一步说明，音频编码器配置完成并且也成功开启了，现在就可以从 MediaCodec 实例中获取两个 buffer ，一个是输入 buffer 一个是输出 buffer , 输入 buffer 类似于 FFmpeg 中的 AVFrame 存放待编码的 PCM 数据，输出 buffer 类似于 FFmpeg 的 AVPacket 编码之后的 AAC 数据, 其代码如下:

```java
//存放的是 PCM 数据
ByteBuffer[] inputBuffers = mMediaCodec.getInputBuffers();
//存放的是编码之后的 AAC 数据
ByteBuffer[] outputBuffers = mMediaCodec.getOutputBuffers();
```

#### 5. 开始 PCM 硬编码为 AAC

到此，所有初始化方法已实现完毕，下面来看一下 MediaCodec 的工作原理如下图所示，左边 Client 元素代表要将 PCM 放到 inputBuffer 中的某个具体的 buffer 中去，右边的 Client 元素代表将编码之后的原始 AAC 数据从 outputBuffer 中的某个具体 buffer 中取出来，👈 左边的小方块代表各个 inputBuffer 元素，右边的小方块则代表各个 outputBuffer 元素。详细介绍可以看 [MediaCodec 类介绍](https://developer.android.com/reference/android/media/MediaCodec)。

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200302185720.png)

代表具体实现如下:

```java
  //input:PCM  
	synchronized void offerEncoder(byte[] input) {
        if(mMediaCodec == null) {
            return;
        }
        ByteBuffer[] inputBuffers = mMediaCodec.getInputBuffers();
        ByteBuffer[] outputBuffers = mMediaCodec.getOutputBuffers();
        int inputBufferIndex = mMediaCodec.dequeueInputBuffer(12000);
        if (inputBufferIndex >= 0) {
            ByteBuffer inputBuffer = inputBuffers[inputBufferIndex];
            inputBuffer.clear();
            inputBuffer.put(input);
            mMediaCodec.queueInputBuffer(inputBufferIndex, 0, input.length, 0, 0);
        }

        int outputBufferIndex = mMediaCodec.dequeueOutputBuffer(mBufferInfo, 12000);
        while (outputBufferIndex >= 0) {
            ByteBuffer outputBuffer = outputBuffers[outputBufferIndex];
            if(mListener != null) {
              	//将 AAC 数据回调出去
                mListener.onAudioEncode(outputBuffer, mBufferInfo);
            }
          	//释放当前内部编码内存
            mMediaCodec.releaseOutputBuffer(outputBufferIndex, false);
            outputBufferIndex = mMediaCodec.dequeueOutputBuffer(mBufferInfo, 0);
        }
    }
```

#### 6. AAC 打包为 flv

```java
    @Override
    public void onAudioData(ByteBuffer bb, MediaCodec.BufferInfo bi) {
        if (packetListener == null || !isHeaderWrite || !isKeyFrameWrite) {
            return;
        }
        bb.position(bi.offset);
        bb.limit(bi.offset + bi.size);

        byte[] audio = new byte[bi.size];
        bb.get(audio);
        int size = AUDIO_HEADER_SIZE + audio.length;
        ByteBuffer buffer = ByteBuffer.allocate(size);
        FlvPackerHelper.writeAudioTag(buffer, audio, false, mAudioSampleSize);
        packetListener.onPacket(buffer.array(), AUDIO);
    }

    public static void writeAudioTag(ByteBuffer buffer, byte[] audioInfo, boolean isFirst, int audioSize) {
        //写入音频头信息
        writeAudioHeader(buffer, isFirst, audioSize);

        //写入音频信息
        buffer.put(audioInfo);
    }
```

#### 7. 释放编码器

在使用完 MediaCodec 编码器之后，就需要停止运行并释放编码器，代码如下:

```java
    synchronized public void stop() {
        if (mMediaCodec != null) {
            mMediaCodec.stop();
            mMediaCodec.release();
            mMediaCodec = null;
        }
    }
```

## 视频编码

Camera 采集完之后需要对 YUV 数据进行实时的编码 (软编利用 [x264](https://www.videolan.org/developers/x264.html) 通过 NDK 交叉编译静态库、硬编使用 Android SDK MediaCodec 进行编码)。

### 软编

视频软编这里们用主流的编码库 x264 进行编码 H264 视频格式数据。 

#### 1. 交叉编译 x264

##### 1.1 下载 x264

```shell
//方式 一
git clone https://code.videolan.org/videolan/x264.git
//方式 二
wget ftp://ftp.videolan.org/pub/x264/snapshots/last_x264.tar.bz2
```

##### 1.2 编写编译脚本

在编写脚本之前需要在 configure 中添加一处代码 `-Werror=implicit-function-declaration`,如下所示:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200302192219.png)

交叉编译脚本如下:

```java
#!/bin/bash

#打包地址
PREFIX=./android/armeabi-v7a

#配置NDK 环境变量
NDK_ROOT=$NDK_HOME

#指定 CPU
CPU=arm-linux-androideabi

#指定 Android API
ANDROID_API=17

TOOLCHAIN=$NDK_ROOT/toolchains/$CPU-4.9/prebuilt/linux-x86_64

FLAGS="-isysroot $NDK_ROOT/sysroot -isystem $NDK_ROOT/sysroot/usr/include/arm-linux-androideabi -D__ANDROID_API__=$ANDROID_API -U_FILE_OFFSET_BITS  -DANDROID -ffunction-sections -funwind-tables -fstack-protector-strong -no-canonical-prefixes -march=armv7-a -mfloat-abi=softfp -mfpu=vfpv3-d16 -mthumb -Wa,--noexecstack -Wformat -Werror=format-security  -O0 -fPIC"

#--disable-cli 不需要命令行工具
#--enable-static 静态库


./configure \
--prefix=$PREFIX \
--disable-cli \
--enable-static \
--enable-pic \
--host=arm-linux \
--cross-prefix=$TOOLCHAIN/bin/arm-linux-androideabi- \
--sysroot=$NDK_ROOT/platforms/android-17/arch-arm \
--extra-cflags="$FLAGS"

make clean
make install
```

#### 2. CMakeList.txt 配置

```cmake
cmake_minimum_required(VERSION 3.4.1)

#视频编码器
set(x264 ${CMAKE_SOURCE_DIR}/x264)

#加载 x264 头文件目录
include_directories(${x264}/include)

#指定 x264 静态库文件目录
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -L${x264}/libs/${CMAKE_ANDROID_ARCH_ABI}")

#批量添加自己编写的 cpp 文件,不要把 *.h 加入进来了
file(GLOB Player_CPP ${ykplayer}/*.cpp)
file(GLOB Push_CPP ${ykpusher}/*.cpp)
#添加自己编写 cpp 源文件生成动态库
add_library(ykpusher SHARED ${Push_CPP})

#找系统中 NDK log库
find_library(log_lib
        log)

#推流 so
target_link_libraries(
        #播放 so
        ykpusher
#        # 写了此命令不用在乎添加 ffmpeg lib 顺序问题导致应用崩溃
#        -Wl,--start-group
#        avcodec avfilter avformat avutil swresample swscale
#        -Wl,--end-group
#        z
        #推流库
        rtmp
        #视频编码
        x264
        #语音编码
        faac
        #本地库
        android
        ${log_lib}
        )
```

#### 3. 配置并打开 x264 编码器

```c++
void VideoEncoderChannel::setVideoEncoderInfo(int width, int height, int fps, int bit) {
    pthread_mutex_lock(&mMutex);
    this->mWidth = width;
    this->mHeight = height;
    this->mFps = fps;
    this->mBit = bit;
    this->mY_Size = width * height;
    this->mUV_Size = mY_Size / 4;

    //如果编码器已经存在，需要释放
    if (mVideoCodec || pic_in) {
        release();
    }
    //打开x264编码器
    //x264编码器的属性
    x264_param_t param;
    //2： 最快
    //3:  无延迟编码
    x264_param_default_preset(&param, x264_preset_names[0], x264_tune_names[7]);
    //base_line 3.2 编码规格
    param.i_level_idc = 32;
    //输入数据格式
    param.i_csp = X264_CSP_I420;
    param.i_width = width;
    param.i_height = height;
    //无b帧
    param.i_bframe = 0;
    //参数i_rc_method表示码率控制，CQP(恒定质量)，CRF(恒定码率)，ABR(平均码率)
    param.rc.i_rc_method = X264_RC_ABR;
    //码率(比特率,单位Kbps)
    param.rc.i_bitrate = mBit;
    //瞬时最大码率
    param.rc.i_vbv_max_bitrate = mBit * 1.2;
    //设置了i_vbv_max_bitrate必须设置此参数，码率控制区大小,单位kbps
    param.rc.i_vbv_buffer_size = mBit;

    //帧率
    param.i_fps_num = fps;
    param.i_fps_den = 1;
    param.i_timebase_den = param.i_fps_num;
    param.i_timebase_num = param.i_fps_den;
//    param.pf_log = x264_log_default2;
    //用fps而不是时间戳来计算帧间距离
    param.b_vfr_input = 0;
    //帧距离(关键帧)  2s一个关键帧
    param.i_keyint_max = fps * 2;
    // 是否复制sps和pps放在每个关键帧的前面 该参数设置是让每个关键帧(I帧)都附带sps/pps。
    param.b_repeat_headers = 1;
    //多线程
    param.i_threads = 1;

    x264_param_apply_profile(&param, "baseline");
    //打开编码器
    mVideoCodec = x264_encoder_open(&param);
    pic_in = new x264_picture_t;
    x264_picture_alloc(pic_in, X264_CSP_I420, width, height);
    //相当于重启编码器
    isStart = true;
    pthread_mutex_unlock(&mMutex);
}
```

#### 4. 开始编码

```c++
void VideoEncoderChannel::onEncoder() {
    while (isStart) {
        if (!mVideoCodec) {
            continue;
        }
        int8_t *data = 0;
        mVideoPackets.pop(data);
        if (!data) {
            LOGE("获取 YUV 数据错误");
            continue;
        }
        //copy Y 数据
        memcpy(this->pic_in->img.plane[0], data, mY_Size);
        //拿到 UV 数据
        for (int i = 0; i < mUV_Size; ++i) {
            //拿到 u 数据
            *(pic_in->img.plane[1] + i) = *(data + mY_Size + i * 2 + 1);
            //拿到 v 数据
            *(pic_in->img.plane[2] + i) = *(data + mY_Size + i * 2);
        }
        //编码出来的数据
        x264_nal_t *pp_nal;
        //编码出来的帧数量
        int pi_nal = 0;
        x264_picture_t pic_out;
        //开始编码
        int ret = x264_encoder_encode(mVideoCodec, &pp_nal, &pi_nal, pic_in, &pic_out);
        if (!ret) {
            LOGE("编码失败");
            continue;
        }
        //如果是关键帧
        int sps_len = 0;
        int pps_len = 0;
        uint8_t sps[100];
        uint8_t pps[100];
        for (int i = 0; i < pi_nal; ++i) {
            if (pp_nal[i].i_type == NAL_SPS) {
                //排除掉 h264的间隔 00 00 00 01
                sps_len = pp_nal[i].i_payload - 4;
                memcpy(sps, pp_nal[i].p_payload + 4, sps_len);
            } else if (pp_nal[i].i_type == NAL_PPS) {
                pps_len = pp_nal[i].i_payload - 4;
                memcpy(pps, pp_nal[i].p_payload + 4, pps_len);
                //pps肯定是跟着sps的
                sendSpsPps(sps, pps, sps_len, pps_len);
            } else {
              	//编码之后的 H264 数据
                sendFrame(pp_nal[i].i_type, pp_nal[i].p_payload, pp_nal[i].i_payload, 0);
            }
        }
    }
}

/**
 * 发送 sps pps
 * @param sps  编码第一帧数据
 * @param pps  编码第二帧数据
 * @param sps_len  编码第一帧数据的长度
 * @param pps_len  编码第二帧数据的长度
 */
void VideoEncoderChannel::sendSpsPps(uint8_t *sps, uint8_t *pps, int sps_len, int pps_len) {
    int bodySize = 13 + sps_len + 3 + pps_len;
    RTMPPacket *packet = new RTMPPacket;
    //
    RTMPPacket_Alloc(packet, bodySize);
    int i = 0;
    //固定头
    packet->m_body[i++] = 0x17;
    //类型
    packet->m_body[i++] = 0x00;
    //composition time 0x000000
    packet->m_body[i++] = 0x00;
    packet->m_body[i++] = 0x00;
    packet->m_body[i++] = 0x00;

    //版本
    packet->m_body[i++] = 0x01;
    //编码规格
    packet->m_body[i++] = sps[1];
    packet->m_body[i++] = sps[2];
    packet->m_body[i++] = sps[3];
    packet->m_body[i++] = 0xFF;

    //整个sps
    packet->m_body[i++] = 0xE1;
    //sps长度
    packet->m_body[i++] = (sps_len >> 8) & 0xff;
    packet->m_body[i++] = sps_len & 0xff;
    memcpy(&packet->m_body[i], sps, sps_len);
    i += sps_len;

    //pps
    packet->m_body[i++] = 0x01;
    packet->m_body[i++] = (pps_len >> 8) & 0xff;
    packet->m_body[i++] = (pps_len) & 0xff;
    memcpy(&packet->m_body[i], pps, pps_len);

    //视频
    packet->m_packetType = RTMP_PACKET_TYPE_VIDEO;
    packet->m_nBodySize = bodySize;
    //随意分配一个管道（尽量避开rtmp.c中使用的）
    packet->m_nChannel = 0x10;
    //sps pps没有时间戳
    packet->m_nTimeStamp = 0;
    //不使用绝对时间
    packet->m_hasAbsTimestamp = 0;
    packet->m_headerType = RTMP_PACKET_SIZE_MEDIUM;
    if (mVideoCallback && isStart)
        mVideoCallback(packet);
}

/**
 * 发送视频帧 -- 关键帧
 * @param type
 * @param payload
 * @param i_playload
 */
void VideoEncoderChannel::sendFrame(int type, uint8_t *payload, int i_payload, long timestamp) {
    if (payload[2] == 0x00) {
        i_payload -= 4;
        payload += 4;
    } else {
        i_payload -= 3;
        payload += 3;
    }
    //看表
    int bodySize = 9 + i_payload;
    RTMPPacket *packet = new RTMPPacket;
    //
    RTMPPacket_Alloc(packet, bodySize);

    packet->m_body[0] = 0x27;
    if (type == NAL_SLICE_IDR) {
        packet->m_body[0] = 0x17;
        LOGE("关键帧");
    }
    //类型
    packet->m_body[1] = 0x01;
    //时间戳
    packet->m_body[2] = 0x00;
    packet->m_body[3] = 0x00;
    packet->m_body[4] = 0x00;
    //数据长度 int 4个字节
    packet->m_body[5] = (i_payload >> 24) & 0xff;
    packet->m_body[6] = (i_payload >> 16) & 0xff;
    packet->m_body[7] = (i_payload >> 8) & 0xff;
    packet->m_body[8] = (i_payload) & 0xff;

    //图片数据
    memcpy(&packet->m_body[9], payload, i_payload);

    packet->m_hasAbsTimestamp = 0;
    packet->m_nBodySize = bodySize;
    packet->m_packetType = RTMP_PACKET_TYPE_VIDEO;
    packet->m_nChannel = 0x10;
    packet->m_headerType = RTMP_PACKET_SIZE_LARGE;
    if (mVideoCallback && isStart)
        mVideoCallback(packet);//回调给 RTMP 模块
}
```

#### 5. 释放编码器

当我们不需要编码的时候需要释放编码器，代码如下:

```c++
x264_encoder_close(mVideoCodec);
```

### 硬编

在 Android 4.3 系统以后，用 MediaCodec 编码视频成为了主流的使用场景，尽管 Android 的碎片化很严重，会导致一些兼容性问题，但是硬件编码器的性能以及速度是非常可观的，并且在 4.3 系统之后可以通过 Surface 来配置编码器的输入，大大降低了显存到内存的交换过程所使用的时间，从而使得整个应用的体验得到大大提升。由于输入和输出已经确定，因此接下来将直接编写 MediaCodec 编码视频帧的过程。

#### 1. 创建 "video/avc" 类型的硬编码器

```java
 mediaCodec = MediaCodec.createEncoderByType(videoConfiguration.mime);
```

#### 2. 配置视频编码器

```java
    public static MediaCodec getVideoMediaCodec(VideoConfiguration videoConfiguration) {
        int videoWidth = getVideoSize(videoConfiguration.width);
        int videoHeight = getVideoSize(videoConfiguration.height);
        MediaFormat format = MediaFormat.createVideoFormat(videoConfiguration.mime, videoWidth, videoHeight);
        format.setInteger(MediaFormat.KEY_COLOR_FORMAT,
                MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface);
        format.setInteger(MediaFormat.KEY_BIT_RATE, videoConfiguration.maxBps* 1024);
        int fps = videoConfiguration.fps;
        //设置摄像头预览帧率
        if(BlackListHelper.deviceInFpsBlacklisted()) {
            SopCastLog.d(SopCastConstant.TAG, "Device in fps setting black list, so set mediacodec fps 15");
            fps = 15;
        }
        format.setInteger(MediaFormat.KEY_FRAME_RATE, fps);
        format.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, videoConfiguration.ifi);
        format.setInteger(MediaFormat.KEY_BITRATE_MODE, MediaCodecInfo.EncoderCapabilities.BITRATE_MODE_VBR);
        format.setInteger(MediaFormat.KEY_COMPLEXITY, MediaCodecInfo.EncoderCapabilities.BITRATE_MODE_CBR);
        MediaCodec mediaCodec = null;

        try {
            mediaCodec = MediaCodec.createEncoderByType(videoConfiguration.mime);
            mediaCodec.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE);
        }catch (Exception e) {
            e.printStackTrace();
            if (mediaCodec != null) {
                mediaCodec.stop();
                mediaCodec.release();
                mediaCodec = null;
            }
        }
        return mediaCodec;
    }
```

#### 3. 开启视频编码器

```java
mMediaCodec.start();
```

#### 4. 拿到编码之后的数据

```java
	private void drainEncoder() {
		ByteBuffer[] outBuffers = mMediaCodec.getOutputBuffers();
		while (isStarted) {
			encodeLock.lock();
			if(mMediaCodec != null) {
				int outBufferIndex = mMediaCodec.dequeueOutputBuffer(mBufferInfo, 12000);
				if (outBufferIndex >= 0) {
					ByteBuffer bb = outBuffers[outBufferIndex];
					if (mListener != null) { //将编码好的 H264 数据回调出去
						mListener.onVideoEncode(bb, mBufferInfo);
					}
					mMediaCodec.releaseOutputBuffer(outBufferIndex, false);
				} else {
					try {
						// wait 10ms
						Thread.sleep(10);
					} catch (InterruptedException e) {
						e.printStackTrace();
					}
				}
				encodeLock.unlock();
			} else {
				encodeLock.unlock();
				break;
			}
		}
	}
```

#### 5. H264 打包为 flv

```java
    //接收 H264 数据 
		@Override
    public void onVideoData(ByteBuffer bb, MediaCodec.BufferInfo bi) {
        mAnnexbHelper.analyseVideoData(bb, bi);
    }   
	/**
     * 将硬编得到的视频数据进行处理生成每一帧视频数据，然后传给flv打包器
     * @param bb 硬编后的数据buffer
     * @param bi 硬编的BufferInfo
     */
    public void analyseVideoData(ByteBuffer bb, MediaCodec.BufferInfo bi) {
        bb.position(bi.offset);
        bb.limit(bi.offset + bi.size);

        ArrayList<byte[]> frames = new ArrayList<>();
        boolean isKeyFrame = false;

        while(bb.position() < bi.offset + bi.size) {
            byte[] frame = annexbDemux(bb, bi);
            if(frame == null) {
                LogUtils.e("annexb not match.");
                break;
            }
            // ignore the nalu type aud(9)
            if (isAccessUnitDelimiter(frame)) {
                continue;
            }
            // for pps
            if(isPps(frame)) {
                mPps = frame;
                continue;
            }
            // for sps
            if(isSps(frame)) {
                mSps = frame;
                continue;
            }
            // for IDR frame
            if(isKeyFrame(frame)) {
                isKeyFrame = true;
            } else {
                isKeyFrame = false;
            }
            byte[] naluHeader = buildNaluHeader(frame.length);
            frames.add(naluHeader);
            frames.add(frame);
        }
        if (mPps != null && mSps != null && mListener != null && mUploadPpsSps) {
            if(mListener != null) {
                mListener.onSpsPps(mSps, mPps);
            }
            mUploadPpsSps = false;
        }
        if(frames.size() == 0 || mListener == null) {
            return;
        }
        int size = 0;
        for (int i = 0; i < frames.size(); i++) {
            byte[] frame = frames.get(i);
            size += frame.length;
        }
        byte[] data = new byte[size];
        int currentSize = 0;
        for (int i = 0; i < frames.size(); i++) {
            byte[] frame = frames.get(i);
            System.arraycopy(frame, 0, data, currentSize, frame.length);
            currentSize += frame.length;
        }
        if(mListener != null) {
            mListener.onVideo(data, isKeyFrame);
        }
    }

```

这个方法主要是从编码后的数据中解析得到NALU，然后判断NALU的类型，最后再把数据回调给 FlvPacker 去处理。

处理 spsPps:

```java
    @Override
    public void onSpsPps(byte[] sps, byte[] pps) {
        if (packetListener == null) {
            return;
        }
        //写入第一个视频信息
        writeFirstVideoTag(sps, pps);
        //写入第一个音频信息
        writeFirstAudioTag();
        isHeaderWrite = true;
    }

```

处理视频帧:

```java
    @Override
    public void onVideo(byte[] video, boolean isKeyFrame) {
        if (packetListener == null || !isHeaderWrite) {
            return;
        }
        int packetType = INTER_FRAME;
        if (isKeyFrame) {
            isKeyFrameWrite = true;
            packetType = KEY_FRAME;
        }
        //确保第一帧是关键帧，避免一开始出现灰色模糊界面
        if (!isKeyFrameWrite) {
            return;
        }
        int size = VIDEO_HEADER_SIZE + video.length;
        ByteBuffer buffer = ByteBuffer.allocate(size);
        FlvPackerHelper.writeH264Packet(buffer, video, isKeyFrame);
        packetListener.onPacket(buffer.array(), packetType);
    }
```



#### 6. 释放编码器,并释放 Surface

```java
	//释放编码器
	private void releaseEncoder() {
		if (mMediaCodec != null) {
			mMediaCodec.signalEndOfInputStream();
			mMediaCodec.stop();
			mMediaCodec.release();
			mMediaCodec = null;
		}
		if (mInputSurface != null) {
			mInputSurface.release();
			mInputSurface = null;
		}
	}

	//释放 OpenGL ES 渲染，Surface
	public void release() {
		EGL14.eglDestroySurface(mEGLDisplay, mEGLSurface);
		EGL14.eglDestroyContext(mEGLDisplay, mEGLContext);
		EGL14.eglReleaseThread();
		EGL14.eglTerminate(mEGLDisplay);

		mSurface.release();

		mSurface    = null;
		mEGLDisplay = null;
		mEGLContext = null;
		mEGLSurface = null;
	}
```

## rtmp 推流

注: 实际项目 rtmp 需要先连接上才有后续操作。

rtmp 模块我们已在开发 [播放器](https://juejin.im/post/5e495ec1e51d452713551017) 的时候，将它和 ffmpeg 一并编译了。所以我们直接使用上次的静态库和头文件就可以了，如果对 rtmp 协议不了解的可以参考上一篇文章，里面也有介绍 [搭建 RTMP 直播服务器](https://juejin.im/post/5e4ec66c5188254967067502)。

到这里软编码和硬编码数据都已准备好了现在，需要发送给 rtmp 模块，也就是在 native 中，先看 java 发送出口:

```java
    /**
     * 打包之后的数据，和裸流数据
     *
     * @param data
     * @param type
     */
    @Override
    public void onData(byte[] data, int type) {
        if (type == RtmpPacker.FIRST_AUDIO || type == RtmpPacker.AUDIO) {//音频 AAC 数据,已打包 
            mPusherManager.pushAACData(data, data.length, type);
        } else if (type == RtmpPacker.FIRST_VIDEO ||
                type == RtmpPacker.INTER_FRAME || type == RtmpPacker.KEY_FRAME) {//H264 视频数据,已打包
            mPusherManager.pushH264(data, type, 0);
        } else if (type == RtmpPacker.PCM) { //PCM 裸流数据
            mPusherManager.pushPCM(data);
        } else if (type == RtmpPacker.YUV) { //YUV 裸流数据
            mPusherManager.pushYUV(data);
        }
    }

    /**
     * 发送 H264 数据
     *
     * @param h264
     */
    public native void pushH264(byte[] h264, int type, long timeStamp);
    /**
     * @param audio     直接推编码完成之后的音频流
     * @param length
     * @param timestamp
     */
    public native void pushAACData(byte[] audio, int length, int timestamp);
    /**
     * 发送 PCM 原始数据
     *
     * @param audioData
     */
    public native void native_pushAudio(byte[] audioData);
    /**
     * push 视频原始 nv21
     *
     * @param data
     */
    public native void native_push_video(byte[] data);
```

### 1. Rtmp 链接

Rtmp 底层是 TCP 协议，所以你可以使用 Java Socket 进行连接，也可以使用 c++ librtmp 库来进行连接，咱么这里就使用 librtmp 来进行连接。

```c++
/**
 * 真正 rtmp 连接的函数
 */
void RTMPModel::onConnect() {
		...

    //1. 初始化
    RTMP_Init(rtmp);
    //2. 设置rtmp地址
    int ret = RTMP_SetupURL(rtmp, this->url)

  	//3. 确认写入 rtmp
    RTMP_EnableWrite(rtmp);
		//4. 开始链接
    ret = RTMP_Connect(rtmp, 0);
		//5. 连接成功之后需要连接一个流
    ret = RTMP_ConnectStream(rtmp, 0);
   
  ...

}
```

### 2. Native 音频模块接收 AAC Flv 打包数据

```c++
/**
 * 直接推送 AAC 硬编码
 * @param data
 */
void AudioEncoderChannel::pushAAC(u_char *data, int dataLen, long timestamp) {
    RTMPPacket *packet = (RTMPPacket *) malloc(sizeof(RTMPPacket));
    RTMPPacket_Alloc(packet, dataLen);
    RTMPPacket_Reset(packet);
    packet->m_nChannel = 0x05; //音频
    memcpy(packet->m_body, data, dataLen);
    packet->m_headerType = RTMP_PACKET_SIZE_LARGE;
    packet->m_hasAbsTimestamp = FALSE;
    packet->m_packetType = RTMP_PACKET_TYPE_AUDIO;
    packet->m_nBodySize = dataLen;
    if (mAudioCallback)
        mAudioCallback(packet); //发送给 rtmp 模块
}
```

### 3. Native 视频模块接收 H264 Flv 打包数据

```c++
/**
 *
 * @param type  视频帧类型
 * @param buf  H264
 * @param len H264 长度
 */
void VideoEncoderChannel::sendH264(int type, uint8_t *data, int dataLen, int timeStamp) {
    RTMPPacket *packet = (RTMPPacket *) malloc(sizeof(RTMPPacket));
    RTMPPacket_Alloc(packet, dataLen);
    RTMPPacket_Reset(packet);

    packet->m_nChannel = 0x04; //视频

    if (type == RTMP_PACKET_KEY_FRAME) {
        LOGE("视频关键帧");
    }
    memcpy(packet->m_body, data, dataLen);
    packet->m_headerType = RTMP_PACKET_SIZE_LARGE;
    packet->m_hasAbsTimestamp = FALSE;
    packet->m_packetType = RTMP_PACKET_TYPE_VIDEO;
    packet->m_nBodySize = dataLen;
    mVideoCallback(packet);//发送给 rtmp 模块
}
```

###4. RTMP 发送数据

#### 4.1 将接收到的数据入发送队列

```c++
//不管是软编码还是硬编码所有发送数据都需要入队列
void callback(RTMPPacket *packet) {
    if (packet) {
        if (rtmpModel) {
            //设置时间戳
            packet->m_nTimeStamp = RTMP_GetTime() - rtmpModel->mStartTime;
            rtmpModel->mPackets.push(packet);
        }
    }
}
```

#### 4.2 发送

```c++
/**
 * 真正推流的地方
 */
void RTMPModel::onPush() {
    RTMPPacket *packet = 0;
    while (isStart) {
      	//从队列中获取发送的音视频数据
        mPackets.pop(packet);
        if (!readyPushing) {
            releasePackets(packet);
            return;
        }
        if (!packet) {
            LOGE("获取失败");
            continue;
        }
        packet->m_nInfoField2 = rtmp->m_stream_id;
        int ret = RTMP_SendPacket(rtmp, packet, 1);
        if (!ret) {
            LOGE("发送失败")
            if (pushCallback) {
                pushCallback->onError(THREAD_CHILD, RTMP_PUSHER_ERROR);
            }
            return;
        }
    }
    releasePackets(packet);
    release();//释放
}
```

### 5. 关闭 RTMP 

当不需要发送音视频数据的时候需要关闭 rtmp 连接

```c++
void RTMPModel::release() {
    isStart = false;
    readyPushing = false;
    if (rtmp) {
        RTMP_DeleteStream(rtmp);
        RTMP_Close(rtmp);
        RTMP_Free(rtmp);
        rtmp = 0;
        LOGE("释放 native 资源");
    }
    mPackets.clearQueue();
}
```

## 简单谈谈软硬编解码

### 1. 区别

**软编码:**  使用 CPU 进行编码。
**硬编码:**  使用 GPU 进行编码。

### 2. 比较

**软编码:**  实现直接、简单，参数调整方便，升级容易，但 CPU 负载重，性能较硬编码低，低码率下质量通常比硬编码要好一点。
**硬编码:**  性能高，低码率下通常质量低于软编码器，但部分产品在 GPU 硬件平台移植了优秀的软编码算法（如X264）的，质量基本等同于软编码。

###3. 使用场景

**软编码:** 适用短时间操作，如录制短视频等。

**硬编码:** 长时间编码或者对视频质量要求高(VOIP 实时通话)，可以推荐硬件编码 (前提是手机性能好)。

## 总结

到这里 Android 端软编推流，硬编推流都分别实现了。在项目上可以根据实际情况来选择到底是硬编还是软编。

硬编我是基于来疯开源项目进行二次开发:

 [Android 推流项目地址](https://github.com/yangkun19921001/NDK_AV_SAMPLE/tree/master/ykav_common)

 [Android 拉流项目地址](https://github.com/yangkun19921001/NDK_AV_SAMPLE/blob/master/ykav_sample/src/main/java/com/devyk/ykav_sample/PlayerActivity.java)

## 参考

- [来疯直播项目](https://github.com/LaiFeng-Android/SopCastComponent)



