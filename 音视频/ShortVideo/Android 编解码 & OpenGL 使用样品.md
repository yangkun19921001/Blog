# Android MediaCodec stuff

- [概述](https://bigflake.com/mediacodec/#overview)
- [样品](https://bigflake.com/mediacodec/#samples)
- [常问问题](https://bigflake.com/mediacodec/#faq)

这个页面是关于Android`MediaCodec` 类，它可以用来编码和解码音频和视频数据。它包括示例代码和常见问题解答的集合。

从 Marshmallow (API 23) 开始， [官方文档](http://developer.android.com/reference/android/media/MediaCodec.html)非常详细且非常有用。（这是一个**巨大**的东西在那里创建此页面时的一步，并通过在API 21半合理的文档一个显著的进步），其页面上的信息应该是你的主要信息来源。此处的代码预计可与 API 18+ 一起使用，以实现广泛的兼容性。如果您专门针对 Lollipop 或 Marshmallow，则可以使用此处未显示的选项。

## 概述

该`MediaCodec`级第一次搭载Android 4.1（API 16）面世。添加它以允许直接访问设备上的媒体编解码器。因此，它提供了一个相当“原始”的界面。虽然`MediaCodec`该类存在于 Java 和 C++ 源代码中，但只有前者是公共的。

在 Android 4.3 (API 18) 中， `MediaCodec`进行了扩展以包含一种通过`Surface`(via the `createInputSurface`method)提供输入的 方法。这允许输入来自相机预览或 OpenGL ES 渲染。Android 4.3 也是第一个`MediaCodec`在[CTS 中](http://source.android.com/compatibility/cts-intro.html)进行测试的 版本，这有助于确保设备之间的行为一致。

Android 4.3 还引入了 [MediaMuxer](http://developer.android.com/reference/android/media/MediaMuxer.html)，它允许将 AVC 编解码器（原始 H.264 基本流）的输出转换为 .MP4 格式，无论是否有关联的音频流。

Android 5.0 (API 21) 引入了“异步模式”，该模式允许应用提供 [回调方法](http://developer.android.com/reference/android/media/MediaCodec.Callback.html)，该[方法](http://developer.android.com/reference/android/media/MediaCodec.Callback.html)在缓冲区可用时执行。从此页面链接的代码位没有利用这一点，因为它们针对 API 18+。

#### 基本用法

“同步” `MediaCodec`API 的所有使用都遵循一个基本模式：

- 创建和配置`MediaCodec`对象
- 循环直到完成：
  - 如果输入缓冲区已准备好：
    - 读取一大块输入，将其复制到缓冲区中
  - 如果输出缓冲区已准备好：
    - 从缓冲区复制输出
- 释放`MediaCodec`对象

单个实例`MediaCodec`处理一种特定类型的数据（例如 MP3 音频或 H.264 视频），并且可以编码或解码。它对“原始”数据进行操作，因此必须去除任何文件头（例如 ID3 标签）。它不与任何更高级别的系统组件通信；它不会通过扬声器播放您的音频或通过网络接收视频流。它只是将数据缓冲区输入并吐出数据缓冲区。（ 在大多数情况下，您可以使用 [MediaExtractor 去除](http://developer.android.com/reference/android/media/MediaExtractor.html)包装器。）

一些编解码器对它们的缓冲区非常挑剔。它们可能需要具有特定的内存对齐方式，或者具有特定的最小或最大大小，或者具有一定数量的可用内存可能很重要。为了适应广泛的可能性，缓冲区分配由编解码器本身而不是应用程序执行。您不会将带有数据的缓冲区交给`MediaCodec`. 你向它请求一个缓冲区，如果一个缓冲区可用，你就将数据复制进去。

这似乎与“零拷贝”原则背道而驰，但在大多数情况下，拷贝会更少，因为编解码器不必复制或调整数据以满足其要求。在某些情况下，您可以直接使用缓冲区，例如直接从磁盘或网络读取数据到缓冲区中，因此不需要复制。

输入 to`MediaCodec`必须在“访问单元”中完成。编码 H.264 视频时意味着一帧，解码时意味着单个 NAL 单元。但是，从某种意义上说，它的行为类似于流，您不能提交单个块并期望一个块很快从输出中出现。在实践中，编解码器可能希望在产生任何输出之前有几个缓冲区排队。

强烈建议您从示例代码开始，而不是试图从文档中弄清楚。

## 样品

**[EncodeAndMuxTest.java](https://bigflake.com/mediacodec/EncodeAndMuxTest.java.txt)**（需要 4.3，API 18）

> 使用 OpenGL ES 生成电影。使用 
>
> MediaCodec
>
>  将电影编码为 H.264 基本流，并使用 
>
> MediaMuxer
>
>  将流转换为 .MP4 文件。
>
> 这就像 CTS 测试一样编写，但不是 CTS 的一部分。使代码适应其他环境应该很简单。

**[CameraToMpegTest.java](https://bigflake.com/mediacodec/CameraToMpegTest.java.txt)**（需要 4.3，API 18）

> 从相机预览录制视频并将其编码为 MP4 文件。使用 
>
> MediaCodec
>
>  将电影编码为 H.264 基本流，并使用 
>
> MediaMuxer
>
>  将流转换为 .MP4 文件。作为额外的奖励，演示了如何使用 GLES 片段着色器在录制视频时对其进行修改。
>
> 这就像 CTS 测试一样编写，但不是 CTS 的一部分。使代码适应其他环境应该很简单。

**[Android Breakout 游戏记录器补丁](https://bigflake.com/mediacodec/0001-Record-game-into-.mp4.patch)**（需要 4.3，API 18）

> 这是
>
> Android Breakout
>
>  v1.0.2的补丁 ，增加了游戏录制。当游戏在全屏分辨率下以 60fps 播放时，使用 AVC 编解码器进行 30fps 720p 录制。该文件保存在应用程序私有数据区中，例如 
>
> ```
> /data/data/com.faddensoft.breakout/files/video.mp4
> ```
>
> .
>
> 这本质上与 相同`EncodeAndMuxTest.java`，但它是完整应用程序的一部分，而不是孤立的 CTS 测试。一个关键的区别在于 EGL 设置，它以一种允许在显示和视频上下文之间共享纹理的方式完成。 **警告：此代码具有竞争条件。有关 详细信息和建议的修复，请参阅 [此错误报告](https://github.com/google/grafika/issues/36)。**
>
> 另一种方法是将每个游戏帧渲染为 FBO 纹理，然后使用该纹理渲染全屏四边形两次（一次用于显示，一次用于视频）。对于渲染成本高的游戏，这可能会更快。在[Grafika 的 RecordFBOActivity](https://github.com/google/grafika) 类中可以找到这两种方法 [的示例](https://github.com/google/grafika)。

**[EncodeDecodeTest.java](https://android.googlesource.com/platform/cts/+/jb-mr2-release/tests/tests/media/src/android/media/cts/EncodeDecodeTest.java)**（需要 4.3，API 18）

> CTS 测试。有三种测试在本质上做同样的事情，但方式不同。每个测试将：
>
> - 生成视频帧
> - 使用 AVC 编解码器对帧进行编码
> - 解码生成的流
> - 测试解码的帧以查看它们是否与原始帧匹配
>
> 生成、编码、解码和检查几乎是同时进行的：生成帧并馈送到编码器，来自编码器的数据一旦可用就会馈送到解码器。
>
> 这三个测试是：
>
> 1. 缓冲区到缓冲区。缓冲区是软件生成的`ByteBuffer`对象中的YUV 帧，并被解码为相同的帧 。这是最慢（也是最不便携）的方法，但它允许应用程序检查和修改 YUV 数据。
> 2. 缓冲区到表面。编码再次由软件生成的 YUV 数据在`ByteBuffer`s 中完成，但这次解码是对`Surface`. 使用 OpenGL ES 检查输出 `glReadPixels()`。
> 3. 表面对表面。帧使用 OpenGL ES 生成到输入上`Surface`，然后解码到`Surface`. 这是最快的方法，但可能涉及 YUV 和 RGB 之间的转换。
>
> 每个测试都以三种不同的分辨率运行：720p (1280x720)、QCIF (176x144) 和 QVGA (320x240)。
>
> 缓冲区到缓冲区和缓冲区到表面测试可以使用 Android 4.1 (API 16) 构建。但是，由于 CTS 测试直到 Android 4.3 才存在，因此许多设备附带了损坏的实现。
>
> 注意：`setByteBuffer()`用法可能不完全正确，因为它没有设置“csd-1”。
>
> （有关使用 Android 5.x 异步 API 的示例，请参阅 mstorsjo 的 [android-decodeencodetest](https://github.com/mstorsjo/android-decodeencodetest) 项目。）

**[DecodeEditEncodeTest.java](https://android.googlesource.com/platform/cts/+/jb-mr2-release/tests/tests/media/src/android/media/cts/DecodeEditEncodeTest.java)**（需要 4.3，API 18）

> CTS 测试。测试执行以下操作：
>
> - 生成一系列视频帧，并使用 AVC 对其进行编码。编码数据流保存在内存中。
>
> - `MediaCodec`使用输出解码生成的流`Surface`。
> - 使用 OpenGL ES 片段着色器编辑帧（交换绿色/蓝色通道）。
> - `MediaCodec`使用输入 使用 对帧进行编码`Surface`。
>
> - 解码编辑过的视频流，验证输出。
>
> 中间的解码-编辑-编码通道几乎同时执行解码和编码，将帧直接从解码器传输到编码器。初始生成和最终验证作为对内存中保存的视频数据的单独传递完成。
>
> 每个测试都以三种不同的分辨率运行：720p (1280x720)、QCIF (176x144) 和 QVGA (320x240)。
>
> 不使用软件解释的 YUV 缓冲区。一切都经过 `Surface`。RGB和YUV在某些时候会发生转换；它们发生的数量和位置取决于驱动程序的实现方式。
>
> 注意：对于此测试和其他 CTS 测试，您可以通过编辑类 URL 来查看相关类。例如，要查看 InputSurface 和 OutputSurface，请从 URL 中删除“DecodeEditEncodeTest.java”，从而生成[ 此目录链接](https://android.googlesource.com/platform/cts/+/jb-mr2-release/tests/tests/media/src/android/media/cts/)。

**[ExtractMpegFramesTest.java](https://bigflake.com/mediacodec/ExtractMpegFramesTest.java.txt)**（需要 4.1，API 16）
**[ExtractMpegFramesTest.java](https://bigflake.com/mediacodec/ExtractMpegFramesTest_egl14.java.txt)**（需要 4.2，API 17）

> 从 .mp4 文件中提取视频的前 10 帧，并将它们保存到 .mp4 格式的单个 PNG 文件中
>
> ```
> /sdcard/
> ```
>
> 。使用 
>
> MediaExtractor
>
>  提取 CSD 数据并将各个访问单元馈送到 
>
> MediaCodec
>
>  解码器。帧被解码为
>
> ```
> Surface
> ```
>
> 从
>
> SurfaceTexture
>
> 创建的 ，渲染（屏幕外）到 pbuffer，用 提取 
>
> ```
> glReadPixels()
> ```
>
> ，并用 保存到 PNG 文件 
>
> ```
> Bitmap#compress()
> ```
>
> 。
>
> 在 Nexus 5 上解码帧并将其复制到`ByteBuffer` with`glReadPixels()`大约需要 8 毫秒，足够快以跟上 30fps 输入的速度，但是将其作为 PNG 保存到磁盘所需的额外步骤很昂贵（大约半秒）。保存一帧的成本大致是这样分解的（您可以通过修改测试以从 Nexus 5 上的 720p 视频中提取全尺寸帧，观察保存 10 帧所需的总时间，并与以后进行连续运行来获得移除阶段；或通过使用 [android.os.Trace 进行检测](http://developer.android.com/reference/android/os/Trace.html) 并使用[systrace](https://bigflake.com/systrace/)）：
>
> - 0.5% 视频解码（硬件 AVC 编解码器）
> - 1.5%`glReadPixels()`成直接`ByteBuffer`
> - 1.5% 将像素数据从 复制`ByteBuffer`到`Bitmap`
> - 96.5% PNG 压缩和文件 I/O
>
> 理论上，`Surface`来自 API 19 [ImageReader](http://developer.android.com/reference/android/media/ImageReader.html) 类的一个可以传递给`MediaCodec`解码器，允许直接访问 YUV 数据。从 Android 4.4 开始， `MediaCodec`解码器格式不受 `ImageReader`.
>
> 加快 RGB 数据传输速度的一种可能方法是通过[PBO](http://www.opengl.org/wiki/Pixel_Buffer_Object)异步复制数据 ，但在当前实现中，传输时间与后续 PNG 活动相形见绌，因此这样做几乎没有价值。
>
> 两个版本的源代码功能相同。一个是针对 EGL 1.0 编写的，另一个是针对 EGL 1.4 编写的。EGL 1.4 更容易使用，并且具有其他示例使用的一些功能，但是如果您希望您的应用程序在 Android 4.1 上运行，则无法使用它。
>
> 这就像 CTS 测试一样编写，但不是 CTS 的一部分。使代码适应其他环境应该很简单。（**注意：**如果您在 中遇到超时问题 `awaitNewImage()`，请参阅 [本文](https://stackoverflow.com/q/22457623/294248)。）

**[DecoderTest.java](https://android.googlesource.com/platform/cts/+/jb-mr2-release/tests/tests/media/src/android/media/cts/DecoderTest.java)**（需要 4.1，API 16）

> CTS 测试。测试解码预先录制的音频流。

**[EncoderTest.java](https://android.googlesource.com/platform/cts/+/jb-mr2-release/tests/tests/media/src/android/media/cts/EncoderTest.java)**（需要 4.1，API 16）

> CTS 测试。测试音频流的编码。

**[MediaMuxerTest.java](https://android.googlesource.com/platform/cts/+/kitkat-release/tests/tests/media/src/android/media/cts/MediaMuxerTest.java)**（需要 4.3，API 18）

> CTS 测试。使用 MediaMuxer 从输入到输出克隆音频轨道、视频轨道和音频+视频轨道。

**[screenrecord](http://www.bigflake.com/screenrecord/)**（使用非公开的原生 API）

> 您可以访问
>
> ```
> screenrecord
> ```
>
> Android 4.4 (API 19) 中引入的开发人员 shell 命令的源代码。它说明了如何使用的天然等同物
>
> ```
> MediaCodec
> ```
>
> 和 
>
> ```
> MediaMuxer
> ```
>
> 在纯天然命令。v1.1 使用 GLES 和
>
> ```
> SurfaceTexture
> ```
>
> .
>
> 这仅供参考。非公共 API 很可能会在不同版本之间中断，并且不能保证在不同设备上具有一致的行为。

**[Grafika](https://github.com/google/grafika)**（需要 4.3，API 18）

> 测试运用各种图形和媒体功能的应用程序。实例包括记录和显示相机预览，记录的OpenGL ES绘制，同时解码多个视频，以及使用`SurfaceView`，`GLSurfaceView`和`TextureView`。极不稳定。乐趣无穷。与此处的大多数示例不同，Grafika 是一个完整的应用程序，因此您可以更轻松地自己尝试。EGL/GLES 代码也更加精炼，更适合包含在其他项目中。

## 常问问题

**一季度。**如何播放`MediaCodec` 使用“video/avc”编解码器创建的视频流？

**A1.** 创建的流是原始 H.264 基本流。适用于 Linux 的 Totem 电影播放器可能会工作，但许多其他播放器不会接触它们。您需要使用 `MediaMuxer`该类来创建 MP4 文件。请参阅 [EncodeAndMuxTest 示例](https://bigflake.com/mediacodec/#EncodeAndMuxTest)。

 

**Q2。**当我尝试创建编码器时，为什么我的调用`MediaCodec.configure()` 失败了`IllegalStateException`？

**A2。**这通常是因为您没有指定 编码器所需的所有 [必需密钥](http://developer.android.com/reference/android/media/MediaFormat.html)。有关 示例，请参阅 [此 stackoverflow 项目](https://stackoverflow.com/a/17243175/294248)。

 

**Q3。**我的视频解码器已配置但不接受数据。怎么了？

**A3.** 一个常见的错误是忽略了通过键“csd-0”和“csd-1”来设置文档中简要提到的编解码器特定数据。这是一堆原始数据，包括序列参数集和图片参数集；您通常需要知道的是 `MediaCodec`编码器生成它们而`MediaCodec` 解码器需要它们。

如果您将编码器的输出提供给解码器，您会注意到从编码器获得的第一个数据包 设置了 [BUFFER_FLAG_CODEC_CONFIG](http://developer.android.com/reference/android/media/MediaCodec.html#BUFFER_FLAG_CODEC_CONFIG)标志。您需要确保将此标志传播到解码器，以便解码器接收到的第一个缓冲区进行设置。或者，您可以在 中设置 CSD 数据`MediaFormat`，然后通过 将其传递到解码器中`configure()`。您可以在[EncodeDecodeTest 示例中](https://bigflake.com/mediacodec/#EncodeDecodeTest)看到这两种方法的 [示例](https://bigflake.com/mediacodec/#EncodeDecodeTest)。

如果您不确定如何设置，您可能应该使用 [MediaExtractor](http://developer.android.com/reference/android/media/MediaExtractor.html)，它会为您处理所有这些。

 

**第 4 季度。**我可以将数据流式传输到解码器中吗？

**A4.** 是和否。解码器采用“访问单元”流，它可能不是字节流。对于视频解码器，这意味着您需要保留编码器建立的“数据包边界”（例如 H.264 视频的 NAL 单元）。例如，查看[DecodeEditEncodeTest 示例中](https://bigflake.com/mediacodec/#DecodeEditEncodeTest)的`VideoChunks`类 如何运行。您不能只是读取文件的任意块并将它们传入。

 

**Q5.** 我正在通过 YUV 预览缓冲区对相机的输出进行编码。为什么颜色看起来不对？

**A5.** 相机输出和`MediaCodec`编码器输入的颜色格式 不同。相机支持 YV12（平面 YUV 4:2:0）和 NV21（半平面 YUV 4:2:0）。该 `MediaCodec`编码器支持一个或多个：

- \#19 COLOR_FormatYUV420Planar (I420)
- \#20 COLOR_FormatYUV420PackedPlanar（也是 I420）
- \#21 COLOR_FormatYUV420SemiPlanar (NV12)
- \#39 COLOR_FormatYUV420PackedSemiPlanar（也是 NV12）
- \#0x7f000100 COLOR_TI_FormatYUV420PackedSemiPlanar（也是 NV12）

I420 与 YV12 具有相同的一般数据布局，但 Cr 和 Cb 平面相反。NV12 与 NV21 相同。因此，如果您尝试将 YV12 缓冲区从相机传递给期望其他内容的编码器，您会看到一些奇怪的色彩效果，就像在 [这些图像中一样](https://stackoverflow.com/q/13703596/294248)。

从 Android 4.4 (API 19) 开始，仍然没有通用的输入格式。像 Nexus 7 (2012) 这样的 Nvidia Tegra 3 设备和像 Nexus 10 这样的三星 Exynos 设备需要`COLOR_FormatYUV420Planar`. Nexus 4、Nexus 5 和 Nexus 7 (2013) 等 Qualcomm Adreno 设备需要 `COLOR_FormatYUV420SemiPlanar`. 像 Galaxy Nexus 这样的 TI OMAP 设备需要`COLOR_TI_FormatYUV420PackedSemiPlanar`. （这是基于查询AVC编解码器时首先返回的格式。）



一种更便携、更高效的方法是使用 API 18 `Surface`输入 API，如 [CameraToMpegTest 示例所示](https://bigflake.com/mediacodec/#CameraToMpegTest)。这样做的缺点是你必须在 RGB 而不是 YUV 中操作，这对于图像处理软件来说是一个问题。如果您可以在片段着色器中实现图像处理，也许通过在计算前后在 RGB 和 YUV 之间进行转换，您就可以利用 GPU 上的代码执行。

请注意，`MediaCodec` **解码器**可能会使用上述格式之一或专有格式在 ByteBuffers 中生成数据。例如，基于 Qualcomm SoC 的设备通常使用 `OMX_QCOM_COLOR_FormatYUV420PackedSemiPlanar32m`(#2141391876 / 0x7FA30C04)。

表面输入使用`COLOR_FormatSurface`，也称为`OMX_COLOR_FormatAndroidOpaque` (#2130708361 / 0x7F000789)。有关完整列表，请参阅`OMX_COLOR_FORMATTYPE`在 [OMX_IVCommon.h](https://android.googlesource.com/platform/frameworks/native/+/kitkat-release/include/media/openmax/OMX_IVCommon.h)。

从 API 21 开始，您可以 改用[Image](http://developer.android.com/reference/android/media/Image.html)对象。请参阅 MediaCodec`getInputImage()`和 `getOutputImage()`调用。

 

**Q6.** 这是什么`EGL_RECORDABLE_ANDROID`旗帜？

**A6.** 这告诉 EGL 它创建的表面必须与视频编解码器兼容。如果没有这个标志，EGL 可能会使用`MediaCodec`无法理解的缓冲区格式。

 

**Q7.** 我可以使用 [ImageReader](http://developer.android.com/reference/android/media/ImageReader.html) 类`MediaCodec`吗？

**A7.** 也许。的`ImageReader`类，在Android 4.4的（API 19）加入，提供了一个方便的方法来访问数据的YUV表面。不幸的是，从 API 19 开始，它仅适用于来自的缓冲区 `Camera`（尽管在 API 21 中可能已更正，当 MediaCodec 添加时`getOutputImage()`）。此外，在`ImageWriter`API 23 之前没有用于创建内容的相应类。

 

**Q8.** 编码视频时是否必须设置演示时间戳？

**A8.** 是的。如果演示时间戳未设置为合理值，某些设备似乎会丢帧或以低质量对它们进行编码（请参阅 [此 stackoverflow 项目](https://stackoverflow.com/q/20475332/294248)）。

请记住，所需的时间`MediaCodec`以微秒为单位。Java 代码中传递的大多数时间戳以毫秒或纳秒为单位。

 

**Q9.** 大多数示例都需要 API 18。我正在为 API 16 编码。有什么我应该知道的吗？

**A9.** 是的。一些关键功能直到 API 18 才可用，而一些基本功能在 API 16 中更难使用。

如果您正在解码视频，则情况不会有太大变化。正如您从[ExtractMpegFramesTest](https://bigflake.com/mediacodec/#ExtractMpegFramesTest)的两个实现中看到的那样 ，较新版本的 EGL 不可用，但对于许多无关紧要的应用程序。

如果您正在编码视频，情况会更糟。三个关键点：

1. 该`MediaCodec`编码器不从表面接受输入，所以你必须提供的数据作为原始YUV帧。
2. YUV 帧的布局因设备而异，在某些情况下，您必须按名称检查特定供应商以处理某些问题。
3. 某些设备可能不会宣传支持任何可用的 YUV 格式（即它们仅供内部使用）。
4. 本`MediaMuxer`类不存在，所以没有办法H.264视频流转换为东西`MediaPlayer` （或很多桌面播放器）将接受。您必须使用第 3 方库（可能是 [mp4parser](https://stackoverflow.com/q/22996378/294248)）。
5. 当`MediaMuxer`类API 18被引入，行为`MediaCodec`编码器改为发出 `INFO_OUTPUT_FORMAT_CHANGED`一开始，让你有一个方便的`MediaFormat`来进料流合并。在旧版本的 Android 上，这不会发生。

这个[stackoverflow 项目](https://stackoverflow.com/q/21262797/294248) 有额外的链接和评论。

CTS 测试`MediaCodec`是在 API 18 (Android 4.3) 中引入的，这在实践中意味着这是第一个基本功能可能在不同设备上一致运行的版本。特别是，4.3 之前的设备在解码时会丢弃最后一帧或加扰 PTS 值。

 

**Q10。**我可以`MediaCodec`在 AOSP 模拟器中使用吗？

**A10.** 也许。模拟器提供了一个软件 AVC 编解码器，该编解码器缺少某些功能，特别是来自 Surface 的输入（尽管现在似乎[可以](https://android.googlesource.com/platform/frameworks/av/+/2edda09a^!/) 在 Android 5.0“Lollipop”中[修复](https://android.googlesource.com/platform/frameworks/av/+/2edda09a^!/)此问题 ）。在物理设备上开发可能不会那么令人沮丧。

 

**Q11。**为什么输出混乱（全为零、太短等）？

**A11。**最常见的错误是没有调整 `ByteBuffer`位置和限制值。从 API 19 开始， `MediaCodec`不会为您执行此操作。

您需要执行以下操作：

```
  int bufIndex = codec.dequeueOutputBuffer(info, TIMEOUT);
  ByteBuffer outputData = outputBuffers[bufIndex];
  如果（信息大小！= 0）{
      outputData.position(info.offset);
      outputData.limit(info.offset + info.size);
  }
```

在输入端，您希望`clear()`在将数据复制到缓冲区之前调用缓冲区。

 

**Q12。**为什么我`storeMetaDataInBuffers`在日志中看到 失败？

**A12.** 它们看起来像这样（来自 Nexus 5 的示例）：

```
E OMXNodeInstance: OMX_SetParameter() 失败 StoreMetaDataInBuffers: 0x8000101a
E ACodec : [OMX.qcom.video.encoder.avc] storeMetaDataInBuffers (output) failed w/err -2147483648
```

你可以忽略它们，它们是无害的。

 

## 更多帮助

请将所有问题 与标签（以及对于 问题，标签）一起发布到[stackoverflow](https://stackoverflow.com/)。对框架或 CTS 测试的评论或功能请求应 [在 AOSP 错误跟踪器上进行](http://b.android.com/)。 `android``MediaCodec``mediacodec`