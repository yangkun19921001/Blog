## 前言

2020 年要属什么最火，肯定是短视频和直播带货了。我自己基本上每天晚上睡觉之前都会刷一会儿 douyin 短视频，不得不承认 douyin 的推荐算法是真 nb ，推荐给我都是我的最爱 😁。那么 douyin 短视频这么 nb 我们可不可以自己模仿着也做一个，当然肯定是可以的啦。接下来的日子我准备写一个从 0-1 如何开发一款音视频编辑的 SDK 。先来看一下效果，这只是第一个版本，具备的功能有限。后面会一直持续迭代下去！

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200820232848.gif)

那么，作为一个音视频零基础的人来说, 开发一款短视频 SDK 到底需要具备哪些知识? 下面就由我来一一为大家介绍。

> 短视频开发系列文章:
>
> [短视频 SDK 开发 (一) 开发一款短视频 SDK 需要具备哪些知识?]()
>
> [短视频 SDK 开发 (二) 短视频 SDK 架构设计]()
>
> [短视频 SDK 开发 (三) FFmpeg + OpenGL ES + OpenSL ES + soundtouch 实现音视频播放器]()
>
> [短视频 SDK 开发 (四) Camera + MediaCodec + OpenGL ES + FFmpeg MP4Muxer 实现音视频试试录制封装为 MP4]()
>
> [短视频 SDK 开发 (五) 滤镜、贴纸、水印实现]()
>
> [短视频 SDK 开发 (六) 美颜特效实现]()
>
> [短视频 SDK 开发 (七) 音视频剪辑实现]()



## 基础知识

1、你必须要有 **C/C++** 开发语言基础，可以看我之前写的文章 

- [音视频学习 (一) C 语言入门](https://juejin.im/post/5df8c917f265da339772a5d1)
- [音视频学习 (二) C++ 语言入门](https://juejin.im/post/5e1347775188253a6c3966fd)

2、接下来就需要掌握 **JNI** 基础了

- [音视频学习 (三) JNI 从入门到掌握](https://juejin.im/post/5e1606e0f265da5d2d0ffbdb)

3、有了 **C/C++/JNI** 基础，你需要还要学会如何交叉编译 **FFmpeg** 等 C/C++ 库

- [音视频学习 (四) 交叉编译动态库、静态库的入门学习](https://juejin.im/post/5e1ad6806fb9a02ff076e103)
- [音视频学习 (五) Shell 脚本入门](https://juejin.im/post/5e1c0a4ce51d451c8771c487)
- [音视频学习 (六) FFmpeg 4.2.2 交叉编译](https://juejin.im/post/5e1eace16fb9a02fec66474e)

4、有了以上的基础，那么就可以开始了解 音视频 的基础知识了

- [雷神-视音频编解码技术零基础学习方法](http://blog.csdn.net/leixiaohua1020/article/details/18893769)
- [雷神-视音频数据处理入门：RGB、YUV像素数据处理](http://blog.csdn.net/leixiaohua1020/article/details/50534150)
- [雷神-视音频数据处理入门：PCM音频采样数据处理](http://blog.csdn.net/leixiaohua1020/article/details/50534316)
- [雷神-视音频数据处理入门：H.264视频码流解析](http://blog.csdn.net/leixiaohua1020/article/details/50534369)
- [雷神-视音频数据处理入门：AAC音频码流解析](http://blog.csdn.net/leixiaohua1020/article/details/50535042)

- [音视频学习 (七) 掌握音频基础知识并使用 AudioTrack、OpenSL ES 渲染 PCM 数据](https://juejin.im/post/5e3fcc5bf265da57685db2a9)
- [音视频学习 (八) 掌握视频基础知识并使用 OpenGL ES 2.0 渲染 YUV 数据](https://juejin.im/post/5e4581476fb9a07cd80f15e0)

5、现在可以入手音视频 AAC 、H264 软硬编解码了

| 组件库                                                       | 对应关系                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [fdkaac_audio_encode_decode](https://github.com/yangkun19921001/AVSample/tree/master/fdkaac_audio_encode_decode/src/main/cpp) | Libfdk-aac 音频编解码                                        |
| [x264_video_encode](https://github.com/yangkun19921001/AVSample/tree/master/x264_video_encode) | Libx264 视频编码                                             |
| [mediacodec_audio_encode_decode](https://github.com/yangkun19921001/AVSample/tree/master/mediacodec_audio_encode_decode) | Android MediaCodec AAC 硬编解码                              |
| [mediacodec_video_encode_decode](https://github.com/yangkun19921001/AVSample/tree/master/mediacodec_video_encode_decode) | Android MediaCodec H264 硬编解码                             |
| [ffmpeg_audio_encode_decode](https://github.com/yangkun19921001/AVSample/tree/master/ffmpeg_audio_encode_decode) | FFmpeg API 实现音频 AAC 软编解码                             |
| [ffmpeg_video_encode_decode](https://github.com/yangkun19921001/AVSample/tree/master/ffmpeg_video_encode_decode) | FFmpeg API 实现视频 H264 软编解码                            |
| [lame_ffmpeg_mp3_encode_decode](https://github.com/yangkun19921001/AVSample/tree/master/lame_ffmpeg_mp3_encode_decode) | MP3 编解码                                                   |
| [JavaAVPlayer](https://github.com/yangkun19921001/AVSample/tree/master/javaavplayer) | Java API 实现音视频播放(mp3/mp4/pcm/yuv)                     |
| [NativeAVPlayer](https://github.com/yangkun19921001/AVSample/tree/master/nativeavplayer) | Native 端实现音视频播放(PCM/YUV)                             |
| [ffmpeg_muxer](https://github.com/yangkun19921001/AVSample/tree/master/ffmpeg_muxer) | 基于 h264,AAC 文件打包为 MP4                                 |
| [camera_recorder](https://github.com/yangkun19921001/AVSample/tree/master/camera_recorder) | 基础实战:OpenGL ES 实现相机预览->硬编码->实时 音视频/图片音频 FFmpeg 合成 mp4 |
| [AVRtmpPushSDK](https://github.com/yangkun19921001/AVRtmpPushSDK) | 中级实战- rtmp 推流 SDK                                      |

`基础知识差不多就这些了，如果有落下的后面再补上了`

## 中级知识

1、FFmpeg + OpenGL ES + OpenSL ES 完成音视频播放

-  [Google Camera+OpenGL ES -grafika](https://github.com/google/grafika)
-  [Google 官方的音视频播放库](https://github.com/google/ExoPlayer?utm_source=gold_browser_extension)
- [bilibili 官方开源的音视频播放库- ijkplayer ](https://github.com/bilibili/ijkplayer)
- 当然也可以参考我自己的 [AVEditor](https://github.com/yangkun19921001/AVEditor) 音视频播放模块

2、OpenGL ES 渲染视频是必须要会的

- [NDK_OpenGLES_3_0](https://github.com/githubhaohao/NDK_OpenGLES_3_0)

3、Camera + MediaCodec + OpenGL ES + FFmpeg MP4Muxer 实现音视频录制

- [camera_recorder](https://github.com/yangkun19921001/AVSample/tree/master/camera_recorder)

4、RTMP 推流实现

- [AVRtmpPushSDK](https://github.com/yangkun19921001/AVRtmpPushSDK)

## 高级知识

1、音视频变速、变调录制

- [音频-soundtouch](https://github.com/rspeyer/soundtouch)
- 视频修改时间戳即可达到变速录制

2、音视频录制实时滤镜实现

- [android-gpuimage](https://github.com/cats-oss/android-gpuimage)

3、分段录制、水印、背景音

**分段录制:** 每次录制完成将录制的路径保存下来，最后将这些 MP4 的文件合并为一个 MP4 文件

**水印:**  拿着上一个视频处理的 纹理 ID ，在这基础上渲染一个 BItmap 即可

**背景音混音:** 可以参考如下实现代码

```c++
/**
 * 参考地址:https://www.shangmayuan.com/a/6daeefedbecb463f9dfce318.html
 * 归一算法：http://www.cppblog.com/jinq0123/archive/2007/10/31/35615.aspx
 * 能量值实现:https://www.jianshu.com/p/d3745dd23056
 * 实现原理:
 * 其实音频混音的核心原理就是将两个音频的原始byte数据进行叠加，
 * 很是简单的 + 起来，好比某个位置的数据是 1 而另外一个音频一样位置是 2 加起来就是3，
 * 这样就完成了音频的混音，固然这是最基础也是最垃圾的混音算法，咱们这里会介绍其中的一种混音算法，
 * 基本上能够达到商业使用的。那就是归一化混音算法。
 *
 *    C = A + B - A * B / (数据类型的最大值);
 *    byte数据就是
 *     C = A + B - A * B / 127;
 *     short数据就是
 *     C = A + B - A * B / 32767;
 *     //vol的取值范围 一般是小于10，大于0的，若是是0的话，就没有声音了，若是太大了就会出现杂音
 *     C = A * vol;
 *
 *
 *     混音算法总结:
 *     总结一下我对混音算法的学习，大概有以下几种方式：
 *      1. 直接加和
 *      2. 加和后再除以混音通道数，防止溢出
 *      3. 加和并箝位，如有溢出就设最大值
 *      4. 饱和处理，接近最大值时进行扭曲（“软件混音的实现”一文算法就是这类）
 *      5. 归一化处理，全部乘个系数，使幅值归一化。（只适用于文件）
 *      6. 衰减因子法，用衰减因子限制幅值[1]。
 */

extern "C"
JNIEXPORT jbyteArray JNICALL
Java_org_doubango_ngn_media_mixer_MultiAudioMixer_audioMix2(JNIEnv *env, jobject instance,
                                                            jbyteArray sourceA_,
                                                            jbyteArray sourceB_,
                                                            jbyteArray dst_, jfloat firstVol,
                                                            jfloat secondVol) {
    jbyte *sourceA = env->GetByteArrayElements(sourceA_, NULL);
    jbyte *sourceB = env->GetByteArrayElements(sourceB_, NULL);
    jbyte *dst = env->GetByteArrayElements(dst_, NULL);

    //归一化混音
    int aL = env->GetArrayLength(sourceA_);
    int bL = env->GetArrayLength(sourceB_);
    //除以通道数量
    int row = aL / 2;

    short sA[row];
    for (int i = 0; i < row; ++i) {
        sA[i] = (short) ((sourceA[i * 2] & 0xff) | (sourceA[i * 2 + 1] & 0xff) << 8);
    }

    short sB[row];
    for (int i = 0; i < row; ++i) {
        sB[i] = (short) ((sourceB[i * 2] & 0xff) | (sourceB[i * 2 + 1] & 0xff) << 8);
    }

    short result[row];
    for (int i = 0; i < row; ++i) {
        int a = (int) (sA[i] * firstVol);
        int b = (int) (sB[i] * secondVol);
        if (a < 0 && b < 0) {
            int i1 = a + b - a * b / (-32768);
            if (i1 > 32768) {
                result[i] = 32767;
            } else if (i1 < -32768) {
                result[i] = -32768;
            } else {
                result[i] = (short) i1;
            }
        } else if (a > 0 && b > 0) {
            int i1 = a + b - a * b / 32767;
            if (i1 > 32767) {
                result[i] = 32767;
            } else if (i1 < -32768) {
                result[i] = -32768;
            } else {
                result[i] = (short) i1;
            }
        } else {
            int i1 = a + b;
            if (i1 > 32767) {
                result[i] = 32767;
            } else if (i1 < -32768) {
                result[i] = -32768;
            } else {
                result[i] = (short) i1;
            }
        }
    }
    for (int i = 0; i < row; ++i) {
        dst[i * 2 + 1] = (jbyte) ((result[i] & 0xFF00) >> 8);
        dst[i * 2] = (jbyte) (result[i] & 0x00FF);
    }

    jbyteArray result1 = env->NewByteArray(aL);
    env->SetByteArrayRegion(result1, 0, aL, dst);

    env->ReleaseByteArrayElements(sourceA_, sourceA, 0);
    env->ReleaseByteArrayElements(sourceB_, sourceB, 0);
    env->ReleaseByteArrayElements(dst_, dst, 0);
    return result1;
}
```

5、人脸识别-特效

- 可以使用 OpenCV 来做人脸识别，拿到人脸特征点位，最后利用这些点位用 OpenGL 绘制绘制出来就行了。

6、音视频剪辑技术

## 书籍推荐

- <<音视频进阶指南>>
- <<OpenGL ES 3.0 编程指南>>
- <<学习 OpenCV 3 中文版>>

## 总结

目前能想到的从 0-1 开发一款短视频 SDK 需要具备的知识大概就有这些。其实学习这些知识的时间成本比较高，因为每一个知识点基本上都是一个独立的，就拿 OpenGL 来说, 要学这门知识基本上肯定是要按 月 来计算的。当然不要看着学习成本高，就直接放弃了，一般来说高投入肯定会有高回报的。好了，短视频入门开发就介绍到这里了。下面推荐一个目前我自己开源的零基础音视频进阶路线项目, 有需要的可以关注 star 一波 [AVSample](https://github.com/yangkun19921001/AVSample)

贴一张进阶路线图

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200702235045.jpg)



短视频 SDK 项目有更新都会提交到此处 [AVEditor](https://github.com/yangkun19921001/AVEditor) (`ps:目前只是一个半成品，功能尚未开发完成`)