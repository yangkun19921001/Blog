## 简介

本文将重点介绍在 Android 平台上，WebRTC 是如何使用 MediaCodec 对视频数据进行编码，以及在整个编码过程中 webrtc native 与 java 的流程交互。

本篇开始会先回顾一下 Andorid MediaCodec 的概念和基础使用，然后再跟着问题去源码中分析。

## MediaCodec 基础知识

[MediaCodec](https://developer.android.com/reference/android/media/MediaCodec) 是 Android 提供的一个用于处理音频和视频数据的底层 API。它支持编码（将原始数据转换为压缩格式）和解码（将压缩数据转换回原始格式）的过程。MediaCodec 是自 Android 4.1（API 16）起引入的，（通常与`MediaExtractor`、`MediaSync`、`MediaMuxer`、`MediaCrypto`、 `MediaDrm`、`Image`、`Surface`一起使用）。



以下是 MediaCodec 的一些关键概念和用法：

1. 创建和配置 MediaCodec：首先，需要根据所需的编解码器类型（例如 H.264、VP8、Opus 等）创建一个 MediaCodec 实例。接下来，通过 MediaFormat 对象指定编解码器的一些参数，如分辨率、帧率、码率等。然后，使用 `configure()` 方法配置 MediaCodec。

   ```java
           try {
               // 1. 创建和配置 MediaCodec
               MediaCodecInfo codecInfo = selectCodec(MIME_TYPE);
               if (codecInfo == null) {
                   throw new RuntimeException("No codec found for " + MIME_TYPE);
               }
               MediaFormat format = MediaFormat.createVideoFormat(MIME_TYPE, WIDTH, HEIGHT);
               format.setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface);
               format.setInteger(MediaFormat.KEY_BIT_RATE, BIT_RATE);
               format.setInteger(MediaFormat.KEY_FRAME_RATE, FRAME_RATE);
               format.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, IFRAME_INTERVAL);
               encoder = MediaCodec.createByCodecName(codecInfo.getName());
               encoder.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE);
               encoder.start();
           } catch (IOException e) {
               throw new RuntimeException("Failed to initialize encoder", e);
           }
   ```

   

2. 输入和输出缓冲区：MediaCodec 有两个缓冲区队列，一个用于输入，另一个用于输出。输入缓冲区用于接收原始数据（例如从摄像头捕获的视频帧），输出缓冲区用于存储编码后的数据。在编解码过程中，需要将这些缓冲区填充或消费。

   ![](http://devyk.top/2022/202304161447304.png)

   

3. 编码器工作模式：MediaCodec 支持两种工作模式，分别是同步和异步。在同步模式下，需要手动管理输入和输出缓冲区。在异步模式下，通过设置回调函数（`MediaCodec.Callback`），可以在编解码事件发生时自动通知应用程序。

   **同步：**

   ```java
    MediaCodec codec = MediaCodec.createByCodecName(name);
    codec.configure(format, …);
    MediaFormat outputFormat = codec.getOutputFormat(); // option B
    codec.start();
    for (;;) {
     int inputBufferId = codec.dequeueInputBuffer(timeoutUs);
     if (inputBufferId >= 0) {
       ByteBuffer inputBuffer = codec.getInputBuffer(…);
       // fill inputBuffer with valid data
       …
       codec.queueInputBuffer(inputBufferId, …);
     }
     int outputBufferId = codec.dequeueOutputBuffer(…);
     if (outputBufferId >= 0) {
       ByteBuffer outputBuffer = codec.getOutputBuffer(outputBufferId);
       MediaFormat bufferFormat = codec.getOutputFormat(outputBufferId); // option A
       // bufferFormat is identical to outputFormat
       // outputBuffer is ready to be processed or rendered.
       …
       codec.releaseOutputBuffer(outputBufferId, …);
     } else if (outputBufferId == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
       // Subsequent data will conform to new format.
       // Can ignore if using getOutputFormat(outputBufferId)
       outputFormat = codec.getOutputFormat(); // option B
     }
    }
    codec.stop();
    codec.release();
   ```

   **异步(推荐使用):**

   ```java
    MediaCodec codec = MediaCodec.createByCodecName(name);
    MediaFormat mOutputFormat; // member variable
    codec.setCallback(new MediaCodec.Callback() {
     @Override
     void onInputBufferAvailable(MediaCodec mc, int inputBufferId) {
       ByteBuffer inputBuffer = codec.getInputBuffer(inputBufferId);
       // fill inputBuffer with valid data
       …
       codec.queueInputBuffer(inputBufferId, …);
     }
    
     @Override
     void onOutputBufferAvailable(MediaCodec mc, int outputBufferId, …) {
       ByteBuffer outputBuffer = codec.getOutputBuffer(outputBufferId);
       MediaFormat bufferFormat = codec.getOutputFormat(outputBufferId); // option A
       // bufferFormat is equivalent to mOutputFormat
       // outputBuffer is ready to be processed or rendered.
       …
       codec.releaseOutputBuffer(outputBufferId, …);
     }
    
     @Override
     void onOutputFormatChanged(MediaCodec mc, MediaFormat format) {
       // Subsequent data will conform to new format.
       // Can ignore if using getOutputFormat(outputBufferId)
       mOutputFormat = format; // option B
     }
    
     @Override
     void onError(…) {
       …
     }
     @Override
     void onCryptoError(…) {
       …
     }
    });
    codec.configure(format, …);
    mOutputFormat = codec.getOutputFormat(); // option B
    codec.start();
    // wait for processing to complete
    codec.stop();
    codec.release();
   ```

   

   

4. MediaCodec 与 Surface：对于视频编解码，MediaCodec 可以与 Surface 对象一起使用，以便使用 GPU 进行高效处理。通过将编解码器与 Surface 关联，可以将图像数据直接从 Surface 传输到编解码器，而无需在 CPU 和 GPU 之间复制数据。这可以提高性能并降低功耗。

   可使用如下 api 进行创建一个输入 surface

   ```java
   public Surface createInputSurface ();
   ```

   返回的 inputSurface 可与 EGL 进行绑定，与 OpenGL ES 再进行关联。
   sample 可以参考这个开源库 [grafika](https://github.com/google/grafika/blob/master/app/src/main/java/com/android/grafika/RecordFBOActivity.java)

5. 开始和停止编解码：配置完 MediaCodec 后，调用 `start()` 方法开始编解码过程。在完成编解码任务后，需要调用 `stop()` 方法停止编解码器，并使用 `release()` 方法释放资源。

6. 错误处理：在使用 MediaCodec 时，可能会遇到各种类型的错误，如不支持的编解码格式、资源不足等。为了确保应用程序的稳定性，需要妥善处理这些错误情况。

总之，MediaCodec 是 Android 中处理音视频编解码的关键组件。了解其基本概念和用法有助于构建高效、稳定的媒体应用程序。



## webrtc 中如何使用硬件编码器？

由于在 WebRTC 中优先使用的是 VP8 编码器，所以我们想要分析 Android 上硬件编码的流程，需要先支持 h264 的硬件编码

1. 创建 PeerConnectionFactory 时设置视频编码器

   ```
   
       private PeerConnectionFactory createPeerConnectionFactory() {
           PeerConnectionFactory.initialize(
                   PeerConnectionFactory.InitializationOptions.builder(applicationContext)
                           .setEnableInternalTracer(true)
                           .createInitializationOptions());
   
           PeerConnectionFactory.Options options = new PeerConnectionFactory.Options();
           DefaultVideoEncoderFactory defaultVideoEncoderFactory =
                   new DefaultVideoEncoderFactory(
                           rootEglBase.getEglBaseContext(), true /* enableIntelVp8Encoder */, true);
           DefaultVideoDecoderFactory defaultVideoDecoderFactory =
                   new DefaultVideoDecoderFactory(rootEglBase.getEglBaseContext());
   
           return PeerConnectionFactory.builder()
                   .setOptions(options)
                   .setVideoEncoderFactory(defaultVideoEncoderFactory)
                   .setVideoDecoderFactory(defaultVideoDecoderFactory)
                   .createPeerConnectionFactory();
       }
   ```

   

2. 在 createOffer / createAnswer 将 SDP 中 m=video 的 h264 playload 编号放在第一位

   这部分代码可以参考 [preferCodec](https://github.com/yangkun19921001/OpenRTCClient/blob/develop/examples/android_gradle/AppRTCMobile/src/main/java/org/appspot/apprtc/PeerConnectionClient.java)

## webrtc 中编码器是如何初始化的？

通过上一个问题得知，我们使用的是 **DefaultVideoEncoderFactory** 默认编码器，内容其实就是使用的硬件能力

![](http://devyk.top/2022/202304161542395.png)

内部实例化了一个 **HardwareVideoEncoderFactory** ，我们在 **DefaultVideoEncoderFactory** 中看到了 `createEncoder`  函数，这里的内部就是实例化 HardwareVideoEncoder 的地方，我先 debug 下看下是哪里调用的，如下图所示，

下图的第一点可以发现底层传递过来的已经是 h264 编码器的信息了。

![](http://devyk.top/2022/202304161631092.png)

发现调用栈并没有在 java 端，那肯定在 native 端了，我们可以通过 **createPeerConnectionFactory** 查看下调用

1. 将 videoEnvoderFactory 引用传递到 native 

   ![](http://devyk.top/2022/202304161631311.png)

2. Native 入口在 PeerConnectionFactory_jni.h

   ![](http://devyk.top/2022/202304161633190.png)

3. 根据调用栈，发现将 jencoder_factory 包装到了 **CreateVideoEncoderFactory**

   ```
   ScopedJavaLocalRef<jobject> CreatePeerConnectionFactoryForJava(
       JNIEnv* jni,
       const JavaParamRef<jobject>& jcontext,
       const JavaParamRef<jobject>& joptions,
       rtc::scoped_refptr<AudioDeviceModule> audio_device_module,
       rtc::scoped_refptr<AudioEncoderFactory> audio_encoder_factory,
       rtc::scoped_refptr<AudioDecoderFactory> audio_decoder_factory,
       const JavaParamRef<jobject>& jencoder_factory,
       const JavaParamRef<jobject>& jdecoder_factory,
       rtc::scoped_refptr<AudioProcessing> audio_processor,
       std::unique_ptr<FecControllerFactoryInterface> fec_controller_factory,
       std::unique_ptr<NetworkControllerFactoryInterface>
           network_controller_factory,
       std::unique_ptr<NetworkStatePredictorFactoryInterface>
           network_state_predictor_factory,
       std::unique_ptr<NetEqFactory> neteq_factory) {
   
   ...
   
     media_dependencies.video_encoder_factory =
         absl::WrapUnique(CreateVideoEncoderFactory(jni, jencoder_factory));
   
   ...
   }
   
   VideoEncoderFactory* CreateVideoEncoderFactory(
       JNIEnv* jni,
       const JavaRef<jobject>& j_encoder_factory) {
     return IsNull(jni, j_encoder_factory)
                ? nullptr
                : new VideoEncoderFactoryWrapper(jni, j_encoder_factory);
   }
   ```

4. 通过一系列的调用，我们发现java 端的引用，被封装成了 c++ 端的 **VideoEncoderFactoryWrapper** ,我们看一下它的构造函数

   ![](http://devyk.top/2022/202304161644418.png)

   主要就是通过  jni 调用 java 端的代码，用以获取当前设备所支持的编码器和编码器的信息

5. 猜测既然在 Native 中包装了 java 端 VideoEncoder.java 的引用，那么肯定也有对应的 CreateEncoder 函数

   ![](http://devyk.top/2022/202304161653222.png)

   我们在 video_encoder_factory_wrapper.h 中看到了我们想要的函数，我们看下它的实现

   ![](http://devyk.top/2022/202304161657500.png)

   ![](http://devyk.top/2022/202304161657499.png)
   这不就是我们找到了 createEncoder jni 调用的入口吗？那么是什么时候调用的呢？我们进行 debug 一下

   ![](http://devyk.top/2022/202304161700450.png)

   它的调用栈是媒体协商成功后，根据发起方的编码器来匹配，目前匹配到了最优的 H264 编码，然后进行创建 H264 编码器

   ![](http://devyk.top/2022/202304161704320.gif)

   此时，我们已经又回到了 java 端的 createEncoder 代码，我们来看下是怎么对 MediaCodec 初始化的

6. MediaCodec 核心初始化代码

   在 HardwareVideoEncoderFactory 中的 createEncoder 中

   ![](http://devyk.top/2022/202304161708921.png)

   上面的逻辑是判断 MediaCodec 是否只是 baseline 和 high ,如果都不支持返回空，反之返回 HardwareVideoEncoder 实例，该实例又返回给了 native ，然后转为了 native 的智能指针 std::unique_ptr<VideoEncoder> 的实体 VideoEncoderWrapper

   ![](http://devyk.top/2022/202304161718584.png)

   通过 debug ，我们找到了在 native jni 执行 initEncode 的入口函数

   ![](http://devyk.top/2022/202304161719529.png)

   通过媒体协商后，我们得到了编码器配置的一些参数

   ![](http://devyk.top/2022/202304161723236.png)

   内部执行了 **initEncodeInternal** ,我们看下具体实现

   ![](http://devyk.top/2022/202304161730969.png)

   这里就是我们所熟悉的 MediaCodec 编码配置了，根据上面的序号我们知道，先根据媒体协商后的编码器名称来创建一个 MediaCodec 对象，然后配置一些必要的参数，最后启动编码器.

   下一步我们开始分析 webrtc 如何将采集到的纹理送入到编码器中进行编码的。还没有看 [WebRTC 源码分析 (一) Android 相机采集](https://juejin.cn/post/7139488477892050975#heading-4) 需要去温习一下。

   

## webrtc 中是如何将数据送入编码器的？

WebRTC 使用 `VideoEncoder` 接口来进行视频编码，该接口定义了一个用于编码视频帧的方法：`encode(VideoFrame frame, EncodeInfo info)`。WebRTC 提供了一个名为 `HardwareVideoEncoder` 的类，该类实现了 `VideoEncoder` 接口，并使用 MediaCodec 对视频帧进行编码。

在 `HardwareVideoEncoder` 类中，WebRTC 将 `VideoFrame` 对象转换为与 MediaCodec 关联的 `Surface` 的纹理。这是通过使用 `EglBase` 类创建一个 EGL 环境，并使用该环境将 `VideoFrame` 的纹理绘制到 `Surface` 上来实现的。

为了更好的理解 MediaCodec createInputSurface 和 OpenGL ES 、EGL 的关系，我简单画了一个架构图。如下所示:

![](http://devyk.top/2022/202304162036455.png)

EGL、OpenGL ES、 InputSurface 关系流程：

1. 使用 OpenGL ES 绘制图像。
2. EGL 管理和连接 OpenGL ES 渲染的表面。
3. 通过 Input Surface，将 OpenGL ES 绘制的图像传递给 MediaCodec。
4. MediaCodec 对接收到的图像数据进行编码。



我们看下具体的流程吧，通过上一篇文章得知， [WebRTC 源码分析 (一) Android 相机采集](https://juejin.cn/post/7139488477892050975#heading-4)  采集到相机数据后，会提交给 VideoStreamEncoder ，我们来看一下堆栈

![](http://devyk.top/2022/202304161922718.png)

根据上面流程得知，采集到的 VideoFrame 会提交给 VideoStreamEncoder::OnFrame 然后经过调用 EncodeVideoFrame 会执行到 VideoEncoder.java 的包装类,webrtc::jni::VideoEnacoderWrapper::Encode 函数，最后通过 jni 将(videoFrame,encodeInfo) 回调给了 java 端。

接下来我们看 java 端如何处理的 VideoFrame

![](http://devyk.top/2022/202304161936223.png)

该函数的核心是判断是否使用 surface 模式进行编码，如果条件成立调用 encodeTextureBuffer 进行纹理编码，

![](http://devyk.top/2022/202304161940918.png)

我们先看上图的第一步,

![](http://devyk.top/2022/202304161947167.png)

第一步的 1-3 小点主要是通过 OpenGL ES 将 OES 纹理数据绘制出来，然后第二大步的 **textureEglBase.swapBuffers(...)** 主要是将 OpenGL ES 处理后的图像数据提交给 EGLSurface 。经过这些操作后纹理数据就提交给 MediaCodec 的 inputsurface 了。





## webrtc 是如何获取编码后的数据？

在 `HardwareVideoEncoder` 类中，使用 MediaCodec 同步模式进行获取编码后的数据。当数据可用时，会调用 `callback.onEncodedFrame(encodedImage, new CodecSpecificInfo());` 方法,然后将编码后的帧传递给 WebRTC 引擎。WebRTC 引擎会对编码后的帧进行进一步处理，如封装 RTP 包、发送到对端等。

主要流程如下:

![](http://devyk.top/2022/202304162101149.png)

第一步有点印象吧？对，就是在编码器初始化的时候会开启一个循环获取解码数据的线程，我们分析下 deliverEncodedImage 函数的实现逻辑

![](http://devyk.top/2022/202304162109204.png)



这段代码的主要功能是从编解码器 (MediaCodec) 中获取编码后的视频帧，并对关键帧进行处理。以下是代码的逐步分析：

1. 定义一个 `MediaCodec.BufferInfo` 对象，用于存储输出缓冲区的元信息。

2. 调用 `codec.dequeueOutputBuffer()` 方法来获取编码后的输出缓冲区索引。如果索引小于 0，则有特殊含义。比如 `MediaCodec.INFO_OUTPUT_BUFFERS_CHANGED` 表示输出缓冲区已更改，此时需要重新获取输出缓冲区。

3. 使用索引获取编码后的输出缓冲区 (ByteBuffer)。

4. 设置缓冲区的位置 (position) 和限制 (limit)，以便读取数据。

5. 检查 `info.flags` 中的 `MediaCodec.BUFFER_FLAG_CODEC_CONFIG` 标志。如果存在，表示当前帧为编解码器配置帧。这种情况下，将配置帧数据存储在 `configBuffer` 中。

6. 如果当前帧不是配置帧，则执行以下操作：

   6.1 查看当前是否重新配置编码码率，如果是就更新比特率。 

   6.2 检查当前帧是否为关键帧。如果 `info.flags` 中的 `MediaCodec.BUFFER_FLAG_SYNC_FRAME` 标志存在，则表示当前帧为关键帧。 6.3 对于 H.264 编码的关键帧，将 SPS 和 PPS NALs 数据附加到帧的开头。创建一个新的缓冲区，将 `configBuffer` 和编码后的输出缓冲区的内容复制到新缓冲区中。 

   6.4 根据帧类型 (关键帧或非关键帧)，创建一个 `EncodedImage` 对象。在释放输出缓冲区时，确保不抛出任何异常。

   6.5 调用 `callback.onEncodedFrame()` 方法传递编码后的图像和编解码器特定信息。

   6.6 释放 `EncodedImage` 对象。

当遇到异常 (例如 `IllegalStateException`) 时，代码将记录错误信息。

总之，这段代码的目标是从 MediaCodec 中获取编码后的视频帧，对关键帧进行处理，并将结果传递给回调函数。



对，该疑问的答案就是 6.5 它将编码后的数据通过 onEncodedFrame 告知了 webrtc 引擎。由于后面的处理不是本章的重点，所以不再分析。

## webrtc 是如何做码流控制的？

WebRTC 的码流控制包括拥塞控制和比特率自适应两个主要方面。这里只简单介绍下概念，及 Android 是如何配合 webrtc 来动态修改码率的。

1. 拥塞控制 (Congestion Control)： 拥塞控制主要关注在不引起网络拥塞的情况下传输尽可能多的数据。WebRTC 实现了基于 Google Congestion Control (GCC) 的拥塞控制算法，它也被称为 Send Side Bandwidth Estimation（发送端带宽估计）。此算法根据丢包率、往返时间 (RTT) 和接收端的 ACK 信息来调整发送端的码率。拥塞控制算法会持续监测网络状况，并根据需要动态调整发送码率。
2. 比特率自适应 (Bitrate Adaptation)： 比特率自适应关注如何根据网络条件和设备性能调整视频编码参数，以实现最佳的视频质量。

当比特率发生变化时，WebRTC 会调用 `VideoEncoder.setRateAllocation()` 方法来通知更新比特率。

在编码的时候，其实在上一个疑问中已经知道了如何调节码率。判断条件是当当前的码率与需要调节的码率不匹配时，调用如下代码进行更新:

![](http://devyk.top/2022/202304162147792.png)

## 总结

本文深入剖析了 WebRTC 在 Android 平台上是如何使用 MediaCodec 对视频数据进行编码的，以及整个编码过程中 webrtc native 与 java 的流程交互。首先回顾了 Android MediaCodec 的概念和基础使用，包括创建和配置 MediaCodec、输入和输出缓冲区、编码器工作模式以及 MediaCodec 与 Surface 的关系。然后，通过具体的代码示例，详细说明了在 WebRTC 中如何实现视频数据的编解码。并通过几个疑问的方式从源码的角度了解到了整个编码流程。希望通过此文能帮助读者更好地理解 WebRTC Android 编码技术。

## 参考

- [WebRTC Native 源码导读（三）：安卓视频硬编码实现分析](https://blog.piasy.com/2017/08/08/WebRTC-Android-HW-Encode-Video/index.html)
- https://developer.android.com/reference/android/media/MediaCodec.html

