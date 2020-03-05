# 音视频学习 \(九\) 基于 FFmpeg 4.2.2 、Librtmp 从 0 ~ 1 开发一款 Android 端播放器\(支持网络拉流本地文件\)

## 前言

现在一个 APP 玩的花样是越来越多了几乎都离不开音频、视频、图片等数据显示，该篇就介绍其中的音视频播放，音视频播放可以用已经成熟开源的播放器，\(推荐一个不错的播放器开源项目[GSYVideoPlayer](https://github.com/CarGuo/GSYVideoPlayer)\)。如果用已开源的播放器就没有太大的学习意义了，该篇文章会介绍从 0~1 开发一款 Android 播放器流程和实例代码编写。

开发一款播放器你首先要具备的知识有:

> * FFmpeg RTMP 混合交叉编译
> * C/C++ 基础
> * NDK、JNI
> * 音视频解码、同步

学完之后我们的播放器大概效果如下:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200216155927.gif)

效果看起来有点卡，这跟实际网络环境有关，此播放器已具备 rtmp/http/URL/File 等协议播放。

## RTMP 与 FFmpeg 混合编译

### RTMP

**介绍:**

RTMP 是 Real Time Messaging Protocol（实时消息传输[协议](https://baike.baidu.com/item/协议/13020269)）的首字母缩写。该协议基于 TCP，是一个协议族，包括 RTMP 基本协议及 RTMPT/RTMPS/RTMPE 等多种变种。RTMP 是一种设计用来进行实时数据通信的网络协议，主要用来在 Flash/AIR 平台和支持 RTMP 协议的流媒体/交互服务器之间进行音视频和数据通信。支持该协议的软件包括 Adobe Media Server/Ultrant Media Server/red5 等。RTMP 与 HTTP 一样，都属于 TCP/IP 四层模型的应用层。

**下载:**

```text
git clone https://github.com/yixia/librtmp.git
```

**脚本编写:**

```text
#!/bin/bash

#配置NDK 环境变量
NDK_ROOT=$NDK_HOME

#指定 CPU
CPU=arm-linux-androideabi

#指定 Android API
ANDROID_API=17

TOOLCHAIN=$NDK_ROOT/toolchains/$CPU-4.9/prebuilt/linux-x86_64

export XCFLAGS="-isysroot $NDK_ROOT/sysroot -isystem $NDK_ROOT/sysroot/usr/include/arm-linux-androideabi -D__ANDROID_API__=$ANDROID_API"
export XLDFLAGS="--sysroot=${NDK_ROOT}/platforms/android-17/arch-arm "
export CROSS_COMPILE=$TOOLCHAIN/bin/arm-linux-androideabi-

make install SYS=android prefix=`pwd`/result CRYPTO= SHARED=  XDEF=-DNO_SSL
```

如果出现如下效果就证明编译成功了:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200116225959.gif)

### 混合编译

上一篇文章咱们编译了 FFmpeg 静态库，那么该小节咱们要把 librtmp 集成到 FFmpeg 中编译，首先我们需要到 **configure** 脚本中把 librtmp 模块注释掉，如下:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200116231025.png)

**修改 FFmpeg 编译脚本:**

```text
#!/bin/bash

#NDK_ROOT 变量指向ndk目录
NDK_ROOT=$NDK_HOME
#TOOLCHAIN 变量指向ndk中的交叉编译gcc所在的目录
TOOLCHAIN=$NDK_ROOT/toolchains/arm-linux-androideabi-4.9/prebuilt/linux-x86_64

#指定android api版本
ANDROID_API=17

#此变量用于编译完成之后的库与头文件存放在哪个目录
PREFIX=./android/armeabi-v7a

#rtmp路径
RTMP=/root/android/librtmp/result

#执行configure脚本，用于生成makefile
#--prefix : 安装目录
#--enable-small : 优化大小
#--disable-programs : 不编译ffmpeg程序(命令行工具)，我们是需要获得静态(动态)库。
#--disable-avdevice : 关闭avdevice模块，此模块在android中无用
#--disable-encoders : 关闭所有编码器 (播放不需要编码)
#--disable-muxers :  关闭所有复用器(封装器)，不需要生成mp4这样的文件，所以关闭
#--disable-filters :关闭视频滤镜
#--enable-cross-compile : 开启交叉编译
#--cross-prefix: gcc的前缀 xxx/xxx/xxx-gcc 则给xxx/xxx/xxx-
#disable-shared enable-static 不写也可以，默认就是这样的。
#--sysroot: 
#--extra-cflags: 会传给gcc的参数
#--arch --target-os : 必须要给

./configure \
--prefix=$PREFIX \
--enable-small \
--disable-programs \
--disable-avdevice \
--disable-encoders \
--disable-muxers \
--disable-filters \
--enable-librtmp \
--enable-cross-compile \
--cross-prefix=$TOOLCHAIN/bin/arm-linux-androideabi- \
--disable-shared \
--enable-static \
--sysroot=$NDK_ROOT/platforms/android-$ANDROID_API/arch-arm \
--extra-cflags="-isysroot $NDK_ROOT/sysroot -isystem $NDK_ROOT/sysroot/usr/include/arm-linux-androideabi -D__ANDROID_API__=$ANDROID_API -U_FILE_OFFSET_BITS  -DANDROID -ffunction-sections -funwind-tables -fstack-protector-strong -no-canonical-prefixes -march=armv7-a -mfloat-abi=softfp -mfpu=vfpv3-d16 -mthumb -Wa,--noexecstack -Wformat -Werror=format-security  -O0 -fPIC -I$RTMP/include" \
--extra-ldflags="-L$RTMP/lib" \
--extra-libs="-lrtmp" \
--arch=arm \
--target-os=android

#上面运行脚本生成makefile之后，使用make执行脚本
make clean
make
make install
```

如果出现如下，证明开始编译了:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200116232052.png)

如果出现如下，证明编译成功了:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200116232956.png)

可以从上图中看到静态库和头文件库都已经编译成功了，下面我们就进入编写代码环节了。

## 播放器开发

### 流程图

想要实现一个网络/本地播放器，我们必须知道它的流程，如下图所示:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200120143323.png)

### 项目准备

1. 创建一个新的 Android 项目并导入各自库

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200118232929.png)

2. CmakeLists.txt 编译脚本编写

   ```text
   cmake_minimum_required(VERSION 3.4.1)

   #定义 ffmpeg、rtmp 、yk_player 目录
   set(FFMPEG ${CMAKE_SOURCE_DIR}/ffmpeg)
   set(RTMP ${CMAKE_SOURCE_DIR}/librtmp)
   set(YK_PLAYER ${CMAKE_SOURCE_DIR}/player)

   #指定 ffmpeg 头文件目录
   include_directories(${FFMPEG}/include)

   #指定 ffmpeg 静态库文件目录
   set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -L${FFMPEG}/libs/${CMAKE_ANDROID_ARCH_ABI}")

   #指定 rtmp 静态库文件目录
   set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -L${RTMP}/libs/${CMAKE_ANDROID_ARCH_ABI}")

   #批量添加自己编写的 cpp 文件,不要把 *.h 加入进来了
   file(GLOB ALL_CPP ${YK_PLAYER}/*.cpp)

   #添加自己编写 cpp 源文件生成动态库
   add_library(YK_PLAYER SHARED ${ALL_CPP})

   #找系统中 NDK log库
   find_library(log_lib
           log)

   #最后才开始链接库
   target_link_libraries(
           YK_PLAYER
           # 写了此命令不用在乎添加 ffmpeg lib 顺序问题导致应用崩溃
           -Wl,--start-group
           avcodec avfilter avformat avutil swresample swscale
           -Wl,--end-group
           z
           rtmp
           android
           #音频播放
           OpenSLES
           ${log_lib}
           )
   ```

3. 定义 native 函数

   ```java
      /**
        * 当前 ffmpeg 版本
        */
       public native String getFFmpegVersion();

       /**
        * 设置 surface
        * @param surface
        */
       public native void setSurfaceNative(Surface surface);

       /**
        * 做一些准备工作
        * @param mDataSource 播放气质
        */
       public native void prepareNative(String mDataSource);

       /**
        * 准备工作完成，开始播放
        */
       public native void startNative();

       /**
        * 如果点击停止播放，那么就调用该函数进行恢复播放
        */
       public native void restartNative();

       /**
        * 停止播放
        */
       public native void stopNative();

       /**
        * 释放资源
        */
       public native void releaseNative();

       /**
        * 是否正在播放
        * @return
        */
       public native boolean isPlayerNative();
   ```

### 解封装

根据之前我们的流程图得知在调用设置数据源了之后，ffmpeg 就开始解封装 \(可以理解为收到快递包裹，我们需要把包裹打开看看里面是什么，然后拿出来进行归类放置\)，这里就是把一个数据源分解成经过编码的音频数据、视频数据、字幕等，下面通过 FFmpeg API 来进行分解数据，代码如下:

```cpp
/**
 * 该函数是真正的解封装，是在子线程开启并调用的。
 */
void YKPlayer::prepare_() {
    LOGD("第一步 打开流媒体地址");
    //1. 打开流媒体地址(文件路径、直播地址)
    // 可以初始为NULL，如果初始为NULL，当执行avformat_open_input函数时，内部会自动申请avformat_alloc_context，这里干脆手动申请
    // 封装了媒体流的格式信息
    formatContext = avformat_alloc_context();

    //字典: 键值对
    AVDictionary *dictionary = 0;
    av_dict_set(&dictionary, "timeout", "5000000", 0);//单位是微妙


    /**
     *
     * @param AVFormatContext: 传入一个 format 上下文是一个二级指针
     * @param const char *url: 播放源
     * @param ff_const59 AVInputFormat *fmt: 输入的封住格式，一般让 ffmpeg 自己去检测，所以给了一个 0
     * @param AVDictionary **options: 字典参数
     */
    int result = avformat_open_input(&formatContext, data_source, 0, &dictionary);
    //result -13--> 没有读写权限
    //result -99--> 第三个参数写 NULl
    LOGD("avformat_open_input-->    %d，%s", result, data_source);
    //释放字典
    av_dict_free(&dictionary);


    if (result) {//0 on success true
        // 你的文件路径，或，你的文件损坏了，需要告诉用户
        // 把错误信息，告诉给Java层去（回调给Java）
        if (pCallback) {
            pCallback->onErrorAction(THREAD_CHILD, FFMPEG_CAN_NOT_OPEN_URL);
        }
        return;
    }

    //第二步 查找媒体中的音视频流的信息
    LOGD("第二步 查找媒体中的音视频流的信息");
    result = avformat_find_stream_info(formatContext, 0);
    if (result < 0) {
        if (pCallback) {
            pCallback->onErrorAction(THREAD_CHILD, FFMPEG_CAN_NOT_FIND_STREAMS);
            return;
        }
    }
    //第三步 根据流信息，流的个数，循环查找，音频流 视频流
    LOGD("第三步 根据流信息，流的个数，循环查找，音频流 视频流");
    //nb_streams = 流的个数
    for (int stream_index = 0; stream_index < formatContext->nb_streams; ++stream_index) {
        //第四步 获取媒体流 音视频
        LOGD("第四步 获取媒体流 音视频");
        AVStream *stream = formatContext->streams[stream_index];


        //第五步 从 stream 流中获取解码这段流的参数信息，区分到底是 音频还是视频
        LOGD("第五步 从 stream 流中获取解码这段流的参数信息，区分到底是 音频还是视频");
        AVCodecParameters *codecParameters = stream->codecpar;

        //第六步 通过流的编解码参数中的编解码 ID ,来获取当前流的解码器
        LOGD("第六步 通过流的编解码参数中的编解码 ID ,来获取当前流的解码器");
        AVCodec *codec = avcodec_find_decoder(codecParameters->codec_id);
        //有可能不支持当前解码
        //找不到解码器，重新编译 ffmpeg --enable-librtmp
        if (!codec) {
            pCallback->onErrorAction(THREAD_CHILD, FFMPEG_FIND_DECODER_FAIL);
            return;
        }

        //第七步 通过拿到的解码器，获取解码器上下文
        LOGD("第七步 通过拿到的解码器，获取解码器上下文");
        AVCodecContext *codecContext = avcodec_alloc_context3(codec);
        if (!codecContext) {
            pCallback->onErrorAction(THREAD_CHILD, FFMPEG_ALLOC_CODEC_CONTEXT_FAIL);
            return;
        }

        //第八步 给解码器上下文 设置参数
        LOGD("第八步 给解码器上下文 设置参数");
        result = avcodec_parameters_to_context(codecContext, codecParameters);
        if (result < 0) {
            pCallback->onErrorAction(THREAD_CHILD, FFMPEG_CODEC_CONTEXT_PARAMETERS_FAIL);
            return;
        }

        //第九步 打开解码器
        LOGD("第九步 打开解码器");
        result = avcodec_open2(codecContext, codec, 0);
        if (result) {
            pCallback->onErrorAction(THREAD_CHILD, FFMPEG_OPEN_DECODER_FAIL);
            return;
        }

        //媒体流里面可以拿到时间基
        AVRational baseTime = stream->time_base;

        //第十步 从编码器参数中获取流类型 codec_type
        LOGD("第十步 从编码器参数中获取流类型 codec_type");
        if (codecParameters->codec_type == AVMEDIA_TYPE_AUDIO) {
            audioChannel = new AudioChannel(stream_index, codecContext,baseTime);
        } else if (codecParameters->codec_type == AVMEDIA_TYPE_VIDEO) {
            //获取视频帧 fps
            //平均帧率 == 时间基
            AVRational frame_rate = stream->avg_frame_rate;
            int fps_value = av_q2d(frame_rate);
            videoChannel = new VideoChannel(stream_index, codecContext, baseTime, fps_value);
            videoChannel->setRenderCallback(renderCallback);
        }
    }//end for

    //第十一步 如果流中没有音视频数据
    LOGD("第十一步 如果流中没有音视频数据");
    if (!audioChannel && !videoChannel) {
        pCallback->onErrorAction(THREAD_CHILD, FFMPEG_NOMEDIA);
        return;
    }

    //第十二步 要么有音频 要么有视频 要么音视频都有
    LOGD("第十二步 要么有音频 要么有视频 要么音视频都有");
    // 准备完毕，通知Android上层开始播放
    if (this->pCallback) {
        pCallback->onPrepared(THREAD_CHILD);
    }
}
```

上面的注释我标注的很全面，这里我们直接跳到第十步，我们知道可以通过如下 `codecParameters->codec_type` 函数来进行判断数据属于什么类型，进行进行单独操作。

### 获取待解码数据\(如:H264、AAC\)

在解封装完成之后我们把待解码的数据放入队列中，如下所示:

```cpp
/**
 * 读包 、未解码、音频/视频 包 放入队列
 */
void YKPlayer::start_() {
    // 循环 读音视频包
    while (isPlaying) {
        if (isStop) {
            av_usleep(2 * 1000);
            continue;
        }
        LOGD("start_");
        //内存泄漏点 1，解决方法 : 控制队列大小
        if (videoChannel && videoChannel->videoPackages.queueSize() > 100) {
            //休眠 等待队列中的数据被消费
            av_usleep(10 * 1000);
            continue;
        }

        //内存泄漏点 2 ，解决方案 控制队列大小
        if (audioChannel && audioChannel->audioPackages.queueSize() > 100) {
            //休眠 等待队列中的数据被消费
            av_usleep(10 * 1000);
            continue;
        }

        //AVPacket 可能是音频 可能是视频，没有解码的数据包
        AVPacket *packet = av_packet_alloc();
        //这一行执行完毕， packet 就有音视频数据了
        int ret = av_read_frame(formatContext, packet);
        /*       if (ret != 0) {
                   return;
               }*/
        if (!ret) {
            if (videoChannel && videoChannel->stream_index == packet->stream_index) {//视频包
                //未解码的 视频数据包 加入队列
                videoChannel->videoPackages.push(packet);
            } else if (audioChannel && audioChannel->stream_index == packet->stream_index) {//语音包
                //将语音包加入到队列中，以供解码使用
                audioChannel->audioPackages.push(packet);
            }
        } else if (ret == AVERROR_EOF) { //代表读取完毕了
            //TODO----
            LOGD("拆包完成 %s", "读取完成了")
            isPlaying = 0;
            stop();
            release();
            break;
        } else {
            LOGD("拆包 %s", "读取失败")
            break;//读取失败
        }
    }//end while
    //最后释放的工作
    isPlaying = 0;
    isStop = false;
    videoChannel->stop();
    audioChannel->stop();
}
```

通过上面源码我们知道，通过 FFmpeg API `av_packet_alloc();` 拿到待解码的指针类型 `AVPacket` 然后放入对应的音视频队列中，等待解码。

### 视频

#### 解码

上一步我们知道，解封装完成之后把对应的数据放入了待解码的队列中，下一步我们就从队列中拿到数据进行解码，如下图所示:

```cpp
/**
 * 视频解码
 */
void VideoChannel::video_decode() {
    AVPacket *packet = 0;
    while (isPlaying) {
        if (isStop) {
            //线程休眠 10s
            av_usleep(2 * 1000);
            continue;
        }

        //控制队列大小，避免生产快，消费满的情况
        if (isPlaying && videoFrames.queueSize() > 100) {
//            LOGE("视频队列中的 size :%d", videoFrames.queueSize());
            //线程休眠等待队列中的数据被消费
            av_usleep(10 * 1000);//10s
            continue;
        }

        int ret = videoPackages.pop(packet);

        //如果停止播放，跳出循环，出了循环，就要释放
        if (!isPlaying) {
            LOGD("isPlaying %d", isPlaying);
            break;
        }

        if (!ret) {
            continue;
        }

        //开始取待解码的视频数据包
        ret = avcodec_send_packet(pContext, packet);
        if (ret) {
            LOGD("ret %d", ret);
            break;//失败了
        }

        //释放 packet
        releaseAVPacket(&packet);

        //AVFrame 拿到解码后的原始数据包
        AVFrame *frame = av_frame_alloc();
        ret = avcodec_receive_frame(pContext, frame);
        if (ret == AVERROR(EAGAIN)) {
            //从新取
            continue;
        } else if (ret != 0) {
            LOGD("ret %d", ret);
            releaseAVFrame(&frame);//内存释放
            break;
        }

        //解码后的视频数据 YUV,加入队列中
        videoFrames.push(frame);
    }

    //出循环，释放
    if (packet)
        releaseAVPacket(&packet);
}
```

通过上面代码我们得到，主要把待解码的数据放入 `avcodec_send_packet` 中，然后通过 `avcodec_receive_frame` 函数来进行接收，最后解码完成的 YUV 数据又放入原始数据队列中，进行转换格式

#### YUV 转 RGBA

在 Android 中并不能直接播放 YUV, 我们需要把它转换成 RGB 的格式然后在调用本地 nativeWindow 或者 OpenGL ES 来进行渲染，下面就直接调用 FFmpeg API 来进行转换，代码如下所示:

```cpp
void VideoChannel::video_player() {
    //1. 原始视频数据 YUV ---> rgba
    /**
     * sws_getContext(int srcW, int srcH, enum AVPixelFormat srcFormat,
                                  int dstW, int dstH, enum AVPixelFormat dstFormat,
                                  int flags, SwsFilter *srcFilter,
                                  SwsFilter *dstFilter, const double *param)
     */
    SwsContext *swsContext = sws_getContext(pContext->width, pContext->height,
                                            pContext->pix_fmt,
                                            pContext->width, pContext->height, AV_PIX_FMT_RGBA,
                                            SWS_BILINEAR, NULL, NULL, NULL);
    //2. 给 dst_data 申请内存
    uint8_t *dst_data[4];
    int dst_linesize[4];
    AVFrame *frame = 0;

    /**
     * pointers[4]：保存图像通道的地址。如果是RGB，则前三个指针分别指向R,G,B的内存地址。第四个指针保留不用

     *   linesizes[4]：保存图像每个通道的内存对齐的步长，即一行的对齐内存的宽度，此值大小等于图像宽度。

     *   w: 要申请内存的图像宽度。

     *   h:  要申请内存的图像高度。

     *   pix_fmt: 要申请内存的图像的像素格式。

     *   align: 用于内存对齐的值。

     *   返回值：所申请的内存空间的总大小。如果是负值，表示申请失败。
     */
    int ret = av_image_alloc(dst_data, dst_linesize, pContext->width, pContext->height,
                             AV_PIX_FMT_RGBA, 1);
    if (ret < 0) {
        printf("Could not allocate source image\n");
        return;
    }

    //3. YUV -> rgba 格式转换 一帧一帧的转换
    while (isPlaying) {

        if (isStop) {
            //线程休眠 10s
            av_usleep(2 * 1000);
            continue;
        }

        int ret = videoFrames.pop(frame);

        //如果停止播放，跳出循环，需要释放
        if (!isPlaying) {
            break;
        }

        if (!ret) {
            continue;
        }

        //真正转换的函数,dst_data 是 rgba 格式的数据
        sws_scale(swsContext, frame->data, frame->linesize, 0, pContext->height, dst_data,
                  dst_linesize);

        //开始渲染，显示屏幕上
        //渲染一帧图像(宽、高、数据)
        renderCallback(dst_data[0], pContext->width, pContext->height, dst_linesize[0]);
        releaseAVFrame(&frame);//渲染完了，frame 释放。
    }
    releaseAVFrame(&frame);//渲染完了，frame 释放。
    //停止播放 flag
    isPlaying = 0;
    av_freep(&dst_data[0]);
    sws_freeContext(swsContext);
}
```

上面代码就是直接通过 `sws_scale` 该函数来进行 YUV -&gt; RGBA 转换。

#### 渲染 RGBA

转换完之后，我们直接调用 ANativeWindow 来进行渲染，代码如下所示:

```cpp
/**
 * 设置播放 surface
 */
extern "C"
JNIEXPORT void JNICALL
Java_com_devyk_player_1common_PlayerManager_setSurfaceNative(JNIEnv *env, jclass type,
                                                             jobject surface) {
    LOGD("Java_com_devyk_player_1common_PlayerManager_setSurfaceNative");
    pthread_mutex_lock(&mutex);
    if (nativeWindow) {
        ANativeWindow_release(nativeWindow);
        nativeWindow = 0;
    }
    //创建新的窗口用于视频显示窗口
    nativeWindow = ANativeWindow_fromSurface(env, surface);

    pthread_mutex_unlock(&mutex);


}
```

渲染:

```cpp
/**
 *
 * 专门渲染的函数
 * @param src_data  解码后的视频 rgba 数据
 * @param width  视频宽
 * @param height 视频高
 * @param src_size 行数 size 相关信息
 *
 */
void renderFrame(uint8_t *src_data, int width, int height, int src_size) {
    pthread_mutex_lock(&mutex);

    if (!nativeWindow) {
        pthread_mutex_unlock(&mutex);
    }

    //设置窗口属性
    ANativeWindow_setBuffersGeometry(nativeWindow, width, height, WINDOW_FORMAT_RGBA_8888);

    ANativeWindow_Buffer window_buffer;

    if (ANativeWindow_lock(nativeWindow, &window_buffer, 0)) {
        ANativeWindow_release(nativeWindow);
        nativeWindow = 0;
        pthread_mutex_unlock(&mutex);
        return;
    }

    //填数据到 buffer,其实就是修改数据
    uint8_t *dst_data = static_cast<uint8_t *>(window_buffer.bits);
    int lineSize = window_buffer.stride * 4;//RGBA

    //下面就是逐行 copy 了。
    //一行 copy
    for (int i = 0; i < window_buffer.height; ++i) {
        memcpy(dst_data + i * lineSize, src_data + i * src_size, lineSize);
    }
    ANativeWindow_unlockAndPost(nativeWindow);
    pthread_mutex_unlock(&mutex);
}
```

视频渲染就完成了。

### 音频

#### 解码

音频的流程跟视频一样，拿到解封装之后的 AAC 数据开始进行解码，代码如下所示:

```cpp
/**
 * 音频解码
 */
void AudioChannel::audio_decode() {
    //待解码的 packet
    AVPacket *avPacket = 0;
    //只要正在播放，就循环取数据
    while (isPlaying) {

        if (isStop) {
            //线程休眠 10s
            av_usleep(2 * 1000);
            continue;
        }

        //这里有一个 bug，如果生产快，消费慢，就会造成队列数据过多容易造成 OOM,
        //解决办法：控制队列大小
        if (isPlaying && audioFrames.queueSize() > 100) {
//            LOGE("音频队列中的 size :%d", audioFrames.queueSize());
            //线程休眠 10s
            av_usleep(10 * 1000);
            continue;
        }

        //可以正常取出
        int ret = audioPackages.pop(avPacket);
        //条件判断是否可以继续
        if (!ret) continue;
        if (!isPlaying) break;

        //待解码的数据发送到解码器中
        ret = avcodec_send_packet(pContext,
                                  avPacket);//@return 0 on success, otherwise negative error code:
        if (ret)break;//给解码器发送失败了

        //发送成功，释放 packet
        releaseAVPacket(&avPacket);

        //拿到解码后的原始数据包
        AVFrame *avFrame = av_frame_alloc();
        //将原始数据发送到 avFrame 内存中去
        ret = avcodec_receive_frame(pContext, avFrame);//0:success, a frame was returned

        if (ret == AVERROR(EAGAIN)) {
            continue;//获取失败，继续下次任务
        } else if (ret != 0) {//说明失败了
            releaseAVFrame(&avFrame);//释放申请的内存
            break;
        }

        //将获取到的原始数据放入队列中，也就是解码后的原始数据
        audioFrames.push(avFrame);
    }

    //释放packet
    if (avPacket)
        releaseAVPacket(&avPacket);
}
```

音视频的逻辑都是一样的就不在多说了。

#### 渲染 PCM

渲染 PCM 可以使用 Java 层的 AudioTrack ,也可以使用 NDK 的 OpenSL ES 来渲染，我这里为了性能和更好的对接，直接都在 C++ 中实现了，代码如下:

```cpp
/**
 * 音频播放  //直接使用 OpenLS ES 渲染 PCM 数据
 */
void AudioChannel::audio_player() {
    //TODO 1. 创建引擎并获取引擎接口
    // 1.1创建引擎对象：SLObjectItf engineObject
    SLresult result = slCreateEngine(&engineObject, 0, NULL, 0, NULL, NULL);
    if (SL_RESULT_SUCCESS != result) {
        return;
    }

    // 1.2 初始化引擎
    result = (*engineObject)->Realize(engineObject, SL_BOOLEAN_FALSE);
    if (SL_BOOLEAN_FALSE != result) {
        return;
    }

    // 1.3 获取引擎接口 SLEngineItf engineInterface
    result = (*engineObject)->GetInterface(engineObject, SL_IID_ENGINE, &engineInterface);
    if (SL_RESULT_SUCCESS != result) {
        return;
    }

    //TODO 2. 设置混音器
    // 2.1 创建混音器：SLObjectItf outputMixObject
    result = (*engineInterface)->CreateOutputMix(engineInterface, &outputMixObject, 0, 0, 0);

    if (SL_RESULT_SUCCESS != result) {
        return;
    }

    // 2.2 初始化 混音器
    result = (*outputMixObject)->Realize(outputMixObject, SL_BOOLEAN_FALSE);
    if (SL_BOOLEAN_FALSE != result) {
        return;
    }
    //  不启用混响可以不用获取混音器接口
    //  获得混音器接口
    //  result = (*outputMixObject)->GetInterface(outputMixObject, SL_IID_ENVIRONMENTALREVERB,
    //                                         &outputMixEnvironmentalReverb);
    //  if (SL_RESULT_SUCCESS == result) {
    //  设置混响 ： 默认。
    //  SL_I3DL2_ENVIRONMENT_PRESET_ROOM: 室内
    //  SL_I3DL2_ENVIRONMENT_PRESET_AUDITORIUM : 礼堂 等
    //  const SLEnvironmentalReverbSettings settings = SL_I3DL2_ENVIRONMENT_PRESET_DEFAULT;
    //  (*outputMixEnvironmentalReverb)->SetEnvironmentalReverbProperties(
    //       outputMixEnvironmentalReverb, &settings);
    //  }

    //TODO 3. 创建播放器
    // 3.1 配置输入声音信息
    // 创建buffer缓冲类型的队列 2个队列
    SLDataLocator_AndroidSimpleBufferQueue loc_bufq = {SL_DATALOCATOR_ANDROIDSIMPLEBUFFERQUEUE,
                                                       2};
    // pcm数据格式
    // SL_DATAFORMAT_PCM：数据格式为pcm格式
    // 2：双声道
    // SL_SAMPLINGRATE_44_1：采样率为44100（44.1赫兹 应用最广的，兼容性最好的）
    // SL_PCMSAMPLEFORMAT_FIXED_16：采样格式为16bit （16位）(2个字节)
    // SL_PCMSAMPLEFORMAT_FIXED_16：数据大小为16bit （16位）（2个字节）
    // SL_SPEAKER_FRONT_LEFT | SL_SPEAKER_FRONT_RIGHT：左右声道（双声道）  （双声道 立体声的效果）
    // SL_BYTEORDER_LITTLEENDIAN：小端模式
    SLDataFormat_PCM format_pcm = {SL_DATAFORMAT_PCM, 2, SL_SAMPLINGRATE_44_1,
                                   SL_PCMSAMPLEFORMAT_FIXED_16,
                                   SL_PCMSAMPLEFORMAT_FIXED_16,
                                   SL_SPEAKER_FRONT_LEFT | SL_SPEAKER_FRONT_RIGHT,
                                   SL_BYTEORDER_LITTLEENDIAN};

    // 数据源 将上述配置信息放到这个数据源中
    SLDataSource audioSrc = {&loc_bufq, &format_pcm};

    // 3.2 配置音轨（输出）
    // 设置混音器
    SLDataLocator_OutputMix loc_outmix = {SL_DATALOCATOR_OUTPUTMIX, outputMixObject};
    SLDataSink audioSnk = {&loc_outmix, NULL};

    //  需要的接口 操作队列的接口
    const SLInterfaceID ids[1] = {SL_IID_BUFFERQUEUE};
    const SLboolean req[1] = {SL_BOOLEAN_TRUE};

    //  3.3 创建播放器
    result = (*engineInterface)->CreateAudioPlayer(engineInterface, &bqPlayerObject, &audioSrc,
                                                   &audioSnk, 1, ids, req);
    if (SL_RESULT_SUCCESS != result) {
        return;
    }
    //  3.4 初始化播放器：SLObjectItf bqPlayerObject
    result = (*bqPlayerObject)->Realize(bqPlayerObject, SL_BOOLEAN_FALSE);
    if (SL_RESULT_SUCCESS != result) {
        return;
    }
    //  3.5 获取播放器接口：SLPlayItf bqPlayerPlay
    result = (*bqPlayerObject)->GetInterface(bqPlayerObject, SL_IID_PLAY, &bqPlayerPlay);
    if (SL_RESULT_SUCCESS != result) {
        return;
    }

    //TODO 4. 设置播放器回调函数
    // 4.1 获取播放器队列接口：SLAndroidSimpleBufferQueueItf bqPlayerBufferQueue
    (*bqPlayerObject)->GetInterface(bqPlayerObject, SL_IID_BUFFERQUEUE, &bqPlayerBufferQueue);

    // 4.2 设置回调 void bqPlayerCallback(SLAndroidSimpleBufferQueueItf bq, void *context)
    (*bqPlayerBufferQueue)->RegisterCallback(bqPlayerBufferQueue, bqPlayerCallback, this);

    //TODO 5. 设置播放状态
    (*bqPlayerPlay)->SetPlayState(bqPlayerPlay, SL_PLAYSTATE_PLAYING);

    //TODO 6. 手动激活回调函数
    bqPlayerCallback(bqPlayerBufferQueue, this);

}
```

设置渲染数据:

```cpp
/**
 * 获取 PCM
 * @return
 */
int AudioChannel::getPCM() {
    //定义 PCM 数据大小
    int pcm_data_size = 0;

    //原始数据包装类
    AVFrame *pcmFrame = 0;
    //循环取出
    while (isPlaying) {

        if (isStop) {
            //线程休眠 10s
            av_usleep(2 * 1000);
            continue;
        }

        int ret = audioFrames.pop(pcmFrame);
        if (!isPlaying)break;
        if (!ret)continue;

        //PCM 处理逻辑
        pcmFrame->data;
        // 音频播放器的数据格式是我们在下面定义的（16位 双声道 ....）
        // 而原始数据（是待播放的音频PCM数据）
        // 所以，上面的两句话，无法统一，一个是(自己定义的16位 双声道 ..) 一个是原始数据，为了解决上面的问题，就需要重采样。
        // 开始重采样
        int dst_nb_samples = av_rescale_rnd(swr_get_delay(swr_ctx, pcmFrame->sample_rate) +
                                            pcmFrame->nb_samples, out_sample_rate,
                                            pcmFrame->sample_rate, AV_ROUND_UP);

        //重采样
        /**
        *
        * @param out_buffers            输出缓冲区，当PCM数据为Packed包装格式时，只有out[0]会填充有数据。
        * @param dst_nb_samples         每个通道可存储输出PCM数据的sample数量。
        * @param pcmFrame->data         输入缓冲区，当PCM数据为Packed包装格式时，只有in[0]需要填充有数据。
        * @param pcmFrame->nb_samples   输入PCM数据中每个通道可用的sample数量。
        *
        * @return  返回每个通道输出的sample数量，发生错误的时候返回负数。
        */
        ret = swr_convert(swr_ctx, &out_buffers, dst_nb_samples, (const uint8_t **) pcmFrame->data,
                          pcmFrame->nb_samples);//返回每个通道输出的sample数量，发生错误的时候返回负数。
        if (ret < 0) {
            fprintf(stderr, "Error while converting\n");
        }

        pcm_data_size = ret * out_sample_size * out_channels;

        //用于音视频同步
        audio_time = pcmFrame->best_effort_timestamp * av_q2d(this->base_time);
        break;
    }
    //渲染完成释放资源
    releaseAVFrame(&pcmFrame);
    return pcm_data_size;
}


/**
 * 创建播放音频的回调函数
 */
void bqPlayerCallback(SLAndroidSimpleBufferQueueItf bq, void *context) {
    AudioChannel *audioChannel = static_cast<AudioChannel *>(context);
    //获取 PCM 音频裸流
    int pcmSize = audioChannel->getPCM();
    if (!pcmSize)return;
    (*bq)->Enqueue(bq, audioChannel->out_buffers, pcmSize);
}
```

代码编写到这里，音视频也都正常渲染了，但是这里还有一个问题，随着播放的时间越久那么就会产生音视频各渲染各的，没有达到同步或者一直播放，这样的体验是非常不好的，所以下一小节我们来解决这个问题。

### 音视频同步

音视频同步市面上有 3 种解决方案: 音频向视频同步，视频向音频同步，音视频统一向外部时钟同步。下面就分别来介绍这三种对齐方式是如何实现的，以及各自的优缺点。

* 1. 音频向视频同步

     先来看一下这种同步方式是如何实现的，音频向视频同步，顾名思义，就是视频会维持一定的刷新频率，或者根据渲染视频帧的时长来决定当前视频帧的渲染时长，或者说视频的每一帧肯定可以全部渲染出来，当我们向 AudioChannel 模块填充音频数据的时候，会与当前渲染的视频帧的时间戳进行比较，这个差值如果不在阀值得范围内，就需要做对齐操作；如果其在阀值范围内，那么就可以直接将本帧音频帧填充到 AudioChannel 模块，进而让用户听到该声音。那如果不在阀值范围内，又该如何进行对齐操作呢？这就需要我们去调整音频帧了，也就是说如果要填充的音频帧的时间戳比当前渲染的视频帧的时间戳小，那就需要进行跳帧操作（可以通过加快速度播放，也可以是丢弃一部分音频帧）；如果音频帧的时间戳比当前渲染的视频帧的时间戳大，那么就需要等待，具体实现可以向 AudioChannel 模块填充空数据进行播放，也可以是将音频的速度放慢播放给用户听，而此时视频帧是继续一帧一帧进行渲染的，一旦视频的时间戳赶上了音频的时间戳，就可以将本帧的音频帧的数据填充到 AudioChannel 模块了，这就是音频向视频同步的实现。

     **优点:** 视频可以将每一帧都播放给用户看，画面看上去是最流畅的。

     **缺点:** 音频会加速或者丢帧，如果丢帧系数小，那么用户感知可能不太强，如果系数大，那么用户感知就会非常的强烈了，发生丢帧或者插入空数据的时候，用户的耳朵是可以明显感觉到的。
* 1. 视频向音频同步

     再来看一下视频向音频同步的方式是如何实现的，这与上面提到的方式恰好相反，由于不论是哪一个平台播放音频的引擎，都可以保证播放音频的时间长度与实际这段音频所代表的时间长度是一致的，所以我们可以依赖于音频的顺序播放为我们提供的时间戳，当客户端代码请求发送视频帧的时候，会先计算出当前视频队列头部的视频帧元素的时间戳与当前音频播放帧的时间戳的差值。如果在阀值范围内，就可以渲染这一帧视频帧；如果不在阀值范围内，则要进行对齐操作。具体的对齐操作方法就是: 如果当前队列头部的视频帧的时间戳小于当前播放音频帧的时间戳，那么就进行跳帧操作；如果大于当前播放音频帧的时间戳，那么就等待\(睡眠、重复渲染、不渲染\)的操作。

     **优点** : 音频可以连续的渲染。

     **缺点** : 视频画面会有跳帧的操作，但是对于视频画面的丢帧和跳帧用户的眼睛是不太容易分辨得出来的。
* 1. 音视频统一向外部时钟同步

     这种策略其实更像是上述两种方式对齐的合体，其实现就是在外部单独维护一轨外部时钟，我们要保证该外部时钟的更新是按照时间的增加而慢慢增加的，当我们获取音频数据和视频帧的时候，都需要与这个外部时钟进行对齐，如果没有超过阀值，那么就会直接返回本帧音频帧或者视频帧，如果超过阀值就要进行对齐操作，具体的对齐操作是: 使用上述两种方式里面的对齐操作，将其分别应用于音频的对齐和视频的对齐。

     **优点:** 可以最大限度的保证音视频都可以不发生跳帧的行为。

     **缺点:** 外部时钟不好控制，极有可能引发音频和视频都跳帧的行为。

  **同步总结:**

  根据人眼睛和耳朵的生理构造因素，得出了一个结论，那就是人的耳朵比人的眼睛要敏感的多，那就是说，如果音频有跳帧的行为或者填空数据的行为，那么我们的耳朵是非常容易察觉得到的；而视频如果有跳帧或者重复渲染的行为，我们的眼睛其实不容易分别出来。根据这个理论，所以我们这里也将采用 **视频向音频对齐** 的方式。

  根据得出的结论，我们需要在音频、视频渲染之前修改几处地方，如下所示:

  1. 通过 ffmpeg api 拿到音频时间戳

     ```cpp
     //1. 在 BaseChannel 里面定义变量,供子类使用
     //###############下面是音视频同步需要用到的
         //FFmpeg 时间基: 内部时间
         AVRational base_time;
         double audio_time;
         double video_time;
     //###############下面是音视频同步需要用到的

     //2. 得到音频时间戳 pcmFrame 解码之后的原始数据帧
     audio_time = pcmFrame->best_effort_timestamp * av_q2d(this->base_time);
     ```

  2. 视频向音频时间戳对齐\(大于小于音频时间戳的处理方式\)

     ```cpp
             //视频向音频时间戳对齐---》控制视频播放速度
             //在视频渲染之前，根据 fps 来控制视频帧
             //frame->repeat_pict = 当解码时，这张图片需要要延迟多久显示
             double extra_delay = frame->repeat_pict;
             //根据 fps 得到延迟时间
             double base_delay = 1.0 / this->fpsValue;
             //得到当前帧的延迟时间
             double result_delay = extra_delay + base_delay;

             //拿到视频播放的时间基
             video_time = frame->best_effort_timestamp * av_q2d(this->base_time);

             //拿到音频播放的时间基
             double_t audioTime = this->audio_time;

             //计算音频和视频的差值
             double av_time_diff = video_time - audioTime;

             //说明:
             //video_time > audioTime 说明视频快，音频慢，等待音频
             //video_time < audioTime 说明视频慢，音屏快，需要追赶音频，丢弃掉冗余的视频包也就是丢帧
             if (av_time_diff > 0) {
                 //通过睡眠的方式灵活等待
                 if (av_time_diff > 1) {
                     av_usleep((result_delay * 2) * 1000000);
                     LOGE("av_time_diff > 1 睡眠:%d", (result_delay * 2) * 1000000);
                 } else {//说明相差不大
                     av_usleep((av_time_diff + result_delay) * 1000000);
                     LOGE("av_time_diff < 1 睡眠:%d", (av_time_diff + result_delay) * 1000000);
                 }
             } else {
                 if (av_time_diff < 0) {
                     LOGE("av_time_diff < 0 丢包处理：%f", av_time_diff);
                     //视频丢包处理
                     this->videoFrames.deleteVideoFrame();
                     continue;
                 } else {
                     //完美
                 }
             }
     ```

  加上这段代码之后，咱们音视频就算是差不多同步了，不敢保证 100%。

## 总结

音视频播放器已经实现完毕，咱们从`解封装->解码->音视频同步->音视频渲染`按照流程讲解并编写了实例代码,相信你已经对播放器的流程和架构设计都已经有了一定的认识，等公司有需求的时候也可以自己设计一款播放器并开发出来了。

[完整代码已上传 GitHub ](https://github.com/yangkun19921001/ndk_study/tree/master/myplayer)

