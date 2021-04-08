# ijkplayer中遇到的问题汇总

**原文-https://juejin.cn/post/6844903694845083655**



在做音视频播放的时候，很多公司使用的是开源的ijkplayer播放器，ijkplayer底层是基于ffmpeg，在某机型上面可能常常遇到各种问题。今天整理了大家在使用ijkplayer中遇到的问题，以及根据ijkplayer社区issue和solution方案。如下：

1、直播技术总结（三）ijkplayer的一些问题优化记录 [blog.csdn.net/hejjunlin/a…](https://blog.csdn.net/hejjunlin/article/details/57075026)

2、视频直播技术（四）：使用Ijkplayer播放直播视频 [www.cnblogs.com/renhui/p/64…](https://www.cnblogs.com/renhui/p/6420140.html)

3、IJKPlayer问题集锦之不定时更新- [www.jianshu.com/p/220b00d00…](https://www.jianshu.com/p/220b00d00deb)

4、直播技术总结（三）ijkplayer的一些问题优化记录- [blog.csdn.net/hejjunlin/a…](http://blog.csdn.net/hejjunlin/article/details/57075026)

5、ijkplayer rtmp秒开 ijkplayer设置rtmp秒开,可以让rtmp加载时间从5~10秒缩短到1s以内，以达到秒开且低延迟的目的:



```
IjkMediaPlayer ijkMediaPlayer = null;  
ijkMediaPlayer = new IjkMediaPlayer();  
ijkMediaPlayer.setOption(1, "analyzemaxduration", 100L);  
ijkMediaPlayer.setOption(1, "probesize", 10240L);  
ijkMediaPlayer.setOption(1, "flush_packets", 1L);  
ijkMediaPlayer.setOption(4, "packet-buffering", 0L);  
ijkMediaPlayer.setOption(4, "framedrop", 1L); 

```



6、ijkplayer实时 播放rtmp等实时性要求很高的流媒体时候，会出现10S左右的延迟，原因是因为加了缓冲区处理，可以把其缓存设置变小，达到实时的效果：



```
ijkMediaPlayer.setOption(IjkMediaPlayer.OPT_CATEGORY_PLAYER, "start-on-prepared", 0);  
ijkMediaPlayer.setOption(IjkMediaPlayer.OPT_CATEGORY_FORMAT, "http-detect-range-support", 0);  
ijkMediaPlayer.setOption(IjkMediaPlayer.OPT_CATEGORY_CODEC, "skip_loop_filter", 48);  
ijkMediaPlayer.setOption(IjkMediaPlayer.OPT_CATEGORY_CODEC, "skip_loop_filter", 8);  
ijkMediaPlayer.setOption(1, "analyzemaxduration", 100L);  
ijkMediaPlayer.setOption(1, "probesize", 10240L);  
ijkMediaPlayer.setOption(1, "flush_packets", 1L);  
ijkMediaPlayer.setOption(4, "packet-buffering", 0L);  
ijkMediaPlayer.setOption(4, "framedrop", 1L);
```



7、快速起直播流： 直播技术总结（五）如何快速起播直播流- [blog.csdn.net/hejjunlin/a…](http://blog.csdn.net/hejjunlin/article/details/72860470) 这里优化后者，主要修改两个参数，一个是`probesize`，一个是`analyzeduration`，分别用来控制其读取的数据量大小和时长。减少 probesize 和 `analyzeduration` 可以降低`avformat_find_stream_info`的函数耗时，达到起播快


```
ijkMediaPlayer.setOption(1,"analyzemaxduration",xxx);
ijkMediaPlayer.setOption(1,"probesize",xxx);
```



8、卡顿优化和秒开,弱网优化

- ijkplayer 解决rtmp 延迟长的问题，达到秒开的结果- [blog.csdn.net/yyhjifeng/a…](https://blog.csdn.net/yyhjifeng/article/details/71191950)
- ijkplayer直播播放器使用经验之谈-卡顿优化和秒开实现- [blog.csdn.net/cmshao/arti…](https://blog.csdn.net/cmshao/article/details/80149176)

9、ijkplayer丢帧的处理方案https://www.jianshu.com/p/ecf51ee32589 直播的延迟，如果延迟过大，可以采取两种策略，一种是丢帧，一种是追帧。我们可以考虑丢音频包来实现，音频包不不在关键帧的问题，丢起来比较好操作，然后因为视频同步到音频，所以视频会追帧，也会跟上来。

10、使用Ijkplayer倍速变调问题解决方案- [www.cnblogs.com/renhui/p/65…](https://www.cnblogs.com/renhui/p/6510872.html)


```
public void setSpeed(float speed) {
    _setPropertyFloat(FFP_PROP_FLOAT_PLAYBACK_RATE, speed);
}
public float getSpeed(float speed) {
    return _getPropertyFloat(FFP_PROP_FLOAT_PLAYBACK_RATE, .0f);
}

```



11、ijkPlayer中的错误码：

```
IJKMEDIA: SDL_JNI_DetachThreadEnv
ijkplayer如何断掉握手 Android ? ijkplayer如何释放连接  Android ?
/*
 * Do not change these values without updating their counterparts in native
 */
int MEDIA_INFO_UNKNOWN = 1;//未知信息
int MEDIA_INFO_STARTED_AS_NEXT = 2;//播放下一条
int MEDIA_INFO_VIDEO_RENDERING_START = 3;//视频开始整备中，准备渲染
int MEDIA_INFO_VIDEO_TRACK_LAGGING = 700;//视频日志跟踪
int MEDIA_INFO_BUFFERING_START = 701;//开始缓冲中 开始缓冲
int MEDIA_INFO_BUFFERING_END = 702;//缓冲结束
int MEDIA_INFO_NETWORK_BANDWIDTH = 703;//网络带宽，网速方面
int MEDIA_INFO_BAD_INTERLEAVING = 800;//
int MEDIA_INFO_NOT_SEEKABLE = 801;//不可设置播放位置，直播方面
int MEDIA_INFO_METADATA_UPDATE = 802;//
int MEDIA_INFO_TIMED_TEXT_ERROR = 900;
int MEDIA_INFO_UNSUPPORTED_SUBTITLE = 901;//不支持字幕
int MEDIA_INFO_SUBTITLE_TIMED_OUT = 902;//字幕超时
int MEDIA_INFO_VIDEO_INTERRUPT= -10000;//数据连接中断，一般是视频源有问题或者数据格式不支持，比如音频不是AAC之类的
int MEDIA_INFO_VIDEO_ROTATION_CHANGED = 10001;//视频方向改变，视频选择信息
int MEDIA_INFO_AUDIO_RENDERING_START = 10002;//音频开始整备中
int MEDIA_ERROR_SERVER_DIED = 100;//服务挂掉，视频中断，一般是视频源异常或者不支持的视频类型。
int MEDIA_ERROR_NOT_VALID_FOR_PROGRESSIVE_PLAYBACK = 200;//数据错误没有有效的回收
int MEDIA_ERROR_IO = -1004;//IO 错误
int MEDIA_ERROR_MALFORMED = -1007;
int MEDIA_ERROR_UNSUPPORTED = -1010;//数据不支持
int MEDIA_ERROR_TIMED_OUT = -110;//数据超时
Error (-10000,0)

```

12、ijkplayer 使用经验：

a、IJKPlayer 不像系统播放器会给你旋转视频角度，所以你需要通过onInfo的what == IMediaPlayer.MEDIA_INFO_VIDEO_ROTATION_CHANGED去获取角度，自己旋转画面；或者开启硬解硬解码，不过硬解码容易造成黑屏无声，诸位慎重啊O__O "…。

```
mediaPlayer.setOption(IjkMediaPlayer.OPT_CATEGORY_PLAYER, "mediacodec", 1);
mediaPlayer.setOption(IjkMediaPlayer.OPT_CATEGORY_PLAYER, "mediacodec-auto-rotate", 1);
mediaPlayer.setOption(IjkMediaPlayer.OPT_CATEGORY_PLAYER, "mediacodec-handle-resolution-change", 1);
复制代码
```

b、IJKPlayer 出现黑色有声音没图像，看看你的视频编码是不是H264，pixel format是否存在，音频编码是不是AAC？默认IJKPlayer是不支持3pg（支持它干啥(?-?*)？），不支持mepg（比如这个库RecordVideoDemo ）,不支持AMR。所以如果你真的想要支持，那么参考这个#1961，打开mpeg支持，重新编ffmpeg，然后通过硬解码播放mpeg；或者通过系统的录制VideoRecord；或者选另外的JAVACV录制封装FFmpegRecorder。

```
ijkMediaPlayer.setOption(IjkMediaPlayer.OPT_CATEGORY_PLAYER, "mediacodec", 1);
ijkMediaPlayer.setOption(IjkMediaPlayer.OPT_CATEGORY_PLAYER, "mediacodec_mpeg4", 1);
复制代码
```

c、快进和慢放接口，只支持API23以上，23以下的支持，是需要自己配置ffmpeg支持avfilter，不过可能会出现声音颤抖等问题，官方说不稳定，参考#1690。 Tryavfilter but the audio sounds shaking = = For avfilter, only support software decoder.

d、暂停的时候，退到后台再回到前台，画面黑了？这时候个人处理方式是，可以在暂停的时候，通过TextureView.getBitmap(point.x, point.y);获取到暂停的画面，用ImageView显示它，在onSurfaceTextureUpdated的时候隐藏ImageView，来实现画面的衔接。

e、一些视频返回码

```
int MEDIA_INFO_VIDEO_RENDERING_START = 3;//视频准备渲染
int MEDIA_ERROR_NOT_VALID_FOR_PROGRESSIVE_PLAYBACK = 200;//数据错误没有有效的回收
int MEDIA_INFO_BUFFERING_START = 701;//开始缓冲
int MEDIA_INFO_BUFFERING_END = 702;//缓冲结束
int MEDIA_INFO_VIDEO_ROTATION_CHANGED = 10001;//视频选择信息
int MEDIA_ERROR_SERVER_DIED = 100;//视频中断，一般是视频源异常或者不支持的视频类型。
int MEDIA_ERROR_IJK_PLAYER = -10000,//一般是视频源有问题或者数据格式不支持，比如音频不是AAC之类的
    MediaPlayer Error (-10000,0), 视频播放过程中出错了，可能是视频的原因，播放器内部错误
复制代码
```

f、某些视频在SeekTo的时候，会跳回到拖动前的位置，这是因为视频的关键帧的问题，通俗一点就是FFMPEG不兼容，视频压缩过于厉害，seek只支持关键帧，出现这个情况就是原始的视频文件中i 帧比较少，播放器会在拖动的位置找最近的关键帧，目前么，IJKPlayer无解。

g、下载速度可以通过IjkMediaPlayer的getTcpSpeed获取。

h、高分辨率开启硬解码，不支持的话会自动切换到软解，就算开启mediacodec，如果设备不支持，显示的解码器也是avcodec软解。

i、ijkMediaPlayer.setOption可配置的对应头文件参考：ff_ffplay_options。

j、缓冲进度条不到100，官方表示我就不保证都100，所以一般我都是： //95这个数值可能不准确，有些时候可能还需要低一些 if (secProgress > 95) secProgress = 100;

k、上面a、b、f的问题，在IJK封装的EXOPlayer和MediaPlayer都不会有问题，兼容上确实强过IJKPlayer，但是它们在细节上，却没有IJK处理的好，如EXOPlayer：退到后再回到前台、切换渲染控件的黑屏一段时间问题，除了用seekto之外目前没发现其他办法，这样的体验让我最后还是选择IJKPlayer。

l、设置cookie 可以通过ijkPlayer的public void setDataSource(String path, Map<String, String> headers) 的header实现设置，参考ijkPlayer的issues-1150，headers也是在内部被转化为何issuses一样的setOption方法。

13、ijkplayer常见问题以及解决方案

a、ijkplayer播放rtmp直播流，延迟明显- [github.com/Bilibili/ij…](https://github.com/Bilibili/ijkplayer/issues/210) b、全屏播放 c、有时候会开始直播时出现黑屏 d、有时候会出现花屏 e、解码方式设置 f、如何区分点播直播 g、是否需要开启硬件加速 h、How to set up only listen to the sound does not show video?- [github.com/Bilibili/ij…](https://github.com/Bilibili/ijkplayer/issues/1074) i、如何设置后台播放 j、视频加载速度慢 The traffic speed is mostly depending on the quality of video CDN, not player itself. k、怎么静音 和非静音 mute/unmute system volume.There is no mute/unmute API in ijkplayer. l、视频黑屏，但是有声音 确定下视频源的编码方式,ijk默认只带了h264解码code m、适配问题,对于不同的cpu架构,需要编译不同的so库 n、播放视频有的设备声画不同步 o、如何查看m3u8时长

```
 cat game05.m3u8 | grep EXTINF | wc -l 32
p、how to change the video quality? 
Video quality is determined when being encoded.I don’t think it can be changed by player.
复制代码
```

q、为什么往前拖动进度条后，还会往后退几秒 seek只支持关键帧，出现这个情况就是原始的视频文件中i 帧比较少，播放器会在拖动的位置找最近的关键帧。 r、how to change URL when ijkplayer is playing RTMP video Create new player. s、怎样添加字幕呢？ 如果希望字幕时间精确，可以在native层做解析和时间同步，到了时间后回调给java层,一般字幕文件加载都是在java层做的，解析文件格式，然后按照时间区间来显示。 t、如何设置硬解?

```
ijkMediaPlayer.setOption(IjkMediaPlayer.OPT_CATEGORY_PLAYER, “mediacodec”, 1);
ijkMediaPlayer.setOption(IjkMediaPlayer.OPT_CATEGORY_FORMAT, "http-detect-range-support", 0);
ijkMediaPlayer.setOption(IjkMediaPlayer.OPT_CATEGORY_PLAYER, "overlay-format", IjkMediaPlayer.SDL_FCC_RV32);
ijkMediaPlayer.setOption(IjkMediaPlayer.OPT_CATEGORY_PLAYER, "analyzeduration", "2000000");
ijkMediaPlayer.setOption(IjkMediaPlayer.OPT_CATEGORY_PLAYER, "probsize", "4096");
ijkMediaPlayer.setOption(IjkMediaPlayer.OPT_CATEGORY_CODEC, "skip_loop_filter", 0);
复制代码
```

u、http重定向到rtmp/Https，ijkplayer无法播放视频

```
ijkMediaPlayer.setOption( IjkMediaPlayer.OPT_CATEGORY_FORMAT, "dns_cache_clear", 1);
复制代码
```

v、android mediaPlayer error (-38,0) prepare()调用报错解决办法: 出现这个错误发现在mediaPlayer.reset()后调用了mediaPlayer.getDuration()在没有给mediaPlayer对象设置数据源之前，是不能使用getDuration等这些方法的.需要检查一下在设置MediaPlayer的数据源时，使用的是那种方式：

- 1、在初始化MediaPlayer时，通过create方法设置数据源。则不能写MediaPlayer.prepare()方法，这时，会报错。
- 2、如果是使用MediaPlayer构造函数初始化MediaPlayer，然后通过setDataSource方法设置数据源时，就需要在start（）之前，使用MediaPlayer.prepare()方法，对数据源进行一次编译。能够避免出现（-38,0）这种错误。

参考资料：

- [github.com/Bilibili/ij…](https://github.com/Bilibili/ijkplayer/issues)


