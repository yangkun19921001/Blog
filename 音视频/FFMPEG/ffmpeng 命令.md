## FFMPEG  - ffplay 命令

[ffmpeg 示例代码](https://www.ffmpeg.org/doxygen/2.7/examples.html)

[FFmpeg 命令参数](https://www.ruanyifeng.com/blog/2020/01/ffmpeg.html)

### 基础参数

```shell
-codecs                                                     # 列出可用编码
-formats                                                    # 列出支持的格式
-protocols                                                  # 列出支持的协议
-i input.mp4                                                # 指定输入文件
-c:v libx264                                                # 指定视频编码
-c:a aac                                                    # 指定音频编码
-vcodec libx264                                             # 旧写法
-acodec aac                                                 # 旧写法
-fs SIZE                                                    # 指定文件大小
```



### 使用格式

```shell
ffmpeg {1} {2} -i {3} {4} {5}

1、全局参数
2、输入文件参数
3、输入文件
4、输出文件参数
5、输出文件

//支持换行输入
$ ffmpeg \
[全局参数] \
[输入文件参数] \
-i [输入文件] \
[输出文件参数] \
[输出文件]

//常用命令参数
-c：指定编码器
-c copy：直接复制，不经过重新编码（这样比较快）
-c:v：指定视频编码器
-c:a：指定音频编码器
-i：指定输入文件
-an：去除音频流
-vn： 去除视频流
-preset：指定输出的视频质量，会影响文件的生成速度，有以下几个可用的值 ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow。
-y：不经过确认，输出时直接覆盖同名文件。
```



### 查看信息

###查看支持的编解码器

```
//查看文件大小 ls -lht
查看支持的编解码器（也就是-vcodec后面可以接的参数）:
命令：ffmpeg -codecs > codec.txt

//查看安装的编码器
ffmpeg -encoders
```

### 查看支持的封装格式

```

查看支持的封装格式（也就是-f后面可以接的参数）
命令：ffmpeg -formats > formats.txt
```

###查看支持的滤镜

```

查看支持的滤镜（也就是-vf后面可以接的参数）:
命令：ffmpeg -filters > filters.txt
```

## install

## FFmpeg 学习地址

```
[Ffmpeg视频开发王纲](https://www.iqiyi.com/u/1426749687/videos)
[FFmpeg音视频核心技术精讲与实战](https://coding.imooc.com/class/279.html)
[ffmpeg 跟我学 视频教程](https://www.cnblogs.com/wanggang123/p/6412799.html)
```

### MAC

- MAC install ffmpeg 的路径

  ```
  /usr/local/Cellar/ffmpeg/4.2.2_2
  ```




## 码流建议

- https://docs.agora.io/cn/Video/video_profile_android?platform=Android

| 分辨率 (宽 x 高) | 帧率 (fps) | 基准码率 (Kbps，适用于通信) | 直播码率 (Kbps，适用于直播) |
| ---------------- | ---------- | --------------------------- | --------------------------- |
| 160 x 120        | 15         | 65                          | 130                         |
| 120 x 120        | 15         | 50                          | 100                         |
| 320 x 180        | 15         | 140                         | 280                         |
| 180 x 180        | 15         | 100                         | 200                         |
| 240 x 180        | 15         | 120                         | 240                         |
| 320 x 240        | 15         | 200                         | 400                         |
| 240 x 240        | 15         | 140                         | 280                         |
| 424 x 240        | 15         | 220                         | 440                         |
| 640 x 360        | 15         | 400                         | 800                         |
| 360 x 360        | 15         | 260                         | 520                         |
| 640 x 360        | 30         | 600                         | 1200                        |
| 360 x 360        | 30         | 400                         | 800                         |
| 480 x 360        | 15         | 320                         | 640                         |
| 480 x 360        | 30         | 490                         | 980                         |
| 640 x 480        | 15         | 500                         | 1000                        |
| 480 x 480        | 15         | 400                         | 800                         |
| 640 x 480        | 30         | 750                         | 1500                        |
| 480 x 480        | 30         | 600                         | 1200                        |
| 848 x 480        | 15         | 610                         | 1220                        |
| 848 x 480        | 30         | 930                         | 1860                        |
| 640 x 480        | 10         | 400                         | 800                         |
| 1280 x 720       | 15         | 1130                        | 2260                        |
| 1280 x 720       | 30         | 1710                        | 3420                        |
| 960 x 720        | 15         | 910                         | 1820                        |
| 960 x 720        | 30         | 1380                        | 2760                        |

### MAC

```
brew install ffmpeg

brew install ffmpeg --with-fdk-aac --with-ffplay --with-freetype --with-libass --with-libquvi --with-libvorbis --with-libvpx --with-opus --with-x265

brew update && brew upgrade ffmpeg
```

## 推流

##RTP 推流

```
ffmpeg -re -i chunwan.h264 -vcodec copy -f rtp rtp://233.233.233.223:6666>test.sdp

注1：-re一定要加，代表按照帧率发送，否则ffmpeg会一股脑地按最高的效率发送数据。

注2：-vcodec copy要加，否则ffmpeg会重新编码输入的H.264裸流。

注3：最右边的“>test.sdp”用于将ffmpeg的输出信息存储下来形成一个sdp文件。该文件用于RTP的接收。当不加“>test.sdp”的时候，ffmpeg会直接把sdp信息输出到控制台。将该信息复制出来保存成一个后缀是.sdp文本文件，也是可以用来接收该RTP流的。加上“>test.sdp”后，可以直接把这些sdp信息保存成文本。

原文：https://blog.csdn.net/leixiaohua1020/article/details/38283297 
```



## 拉流

### udp h264 拉流

```
ffplay -f h264 udp:233.233.233.223:6666
```

### RTP 拉流 [参考地址](http://notes.maxwi.com/2017/04/05/ffmpeg-streaming/)

```
ffplay bunny.sdp -protocol_whitelist file,udp,rtp
```



## 视频

### 视频参数

```shell
-aspect RATIO                                               # 长宽比 4:3, 16:9
-r RATE                                                     # 每秒帧率
-s WIDTHxHEIGHT                                             # 视频尺寸：640x480
-vn                                                         # 禁用视频
-b:v 1M                                                     # 设置视频码率 1mbps/s
```



###查看视频信息

```
ffmpeg -i xxx.mp4
```

###转码

```shell
//https://blog.p2hp.com/archives/5512
//将高清格式（1920x1080像素）的视频分辨率降低到640x360（对于宽高比16：9，这是一个相当常用的配置）
ffmpeg -i video_1920.mp4 -vf scale=640:360 video_640.mp4 -hide_banner

//更改视频宽高比
ffmpeg -i video_1920.mp4 -vf scale=640:480,setdar=4:3 video_640x480.mp4 -hide_banner
ffmpeg -i video_1920.mp4 -vf scale=200:400,setsar=1:1 video_200x400.mp4 -hide_banner

//视频大小调整的示例
ffmpeg -i video_320x180.mp4 -vf scale=160:90 video_180x90.mp4 -hide_banner

//将原始视频宽高比从16：9更改为4：3。为此，我们使用以下命令将视频从320x180调整为320x240：
ffmpeg -i video_320x180.mp4 -vf scale=320:240,setdar=4:3 video_320x240.mp4 -hide_banner

ffmpeg -i input.mp4 -vf "scale=640:320" output.mp4          # 视频尺寸缩放
ffmpeg -i input.mp4 -vf "crop=400:300:10:10" output.mp4     # 视频尺寸裁剪

```

### 转码 MP4

```shell
ffmpeg -i input.mov output.mp4                              # 转码为 MP4
```



### 循环播放一段 bgm

```
//1 添加一个默认视频
ffmpeg -f lavfi -i color=size=1280x720:rate=25:color=black -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -t 10 output.mp4

//2、为视频添加一个音频并循环播放
ffmpeg -an -i video.mp4 -stream_loop -1 -i audio.wav -c:v copy -t 60 -y out.mp4

-ss, 00:00:17, -t, 00:00:23, -accurate_seek, -i, /storage/emulated/0/DCIM/Camera/60a9aaa3f64549b9f8a2d203e53bc459.mp4, -vn, -c:a, libmp3lame, /storage/emulated/0/SpeedPiaoquanVideo/create/videoMp3/974170983086247.mp3

FFmpeg  -i 60a9aaa3f64549b9f8a2d203e53bc459.mp4 -vn -ss 00:00:17 -t 00:00:23 -accurate_seek  -c:a libmp3lame 974170983086247.mp3


       
```



### 改变分辨率

```shell
ffmpeg -i video_1920.mp4 -vf scale=640:360 video_640.mp4 -hide_banner

//从 1080p 转为 480p 。
ffmpeg \
-i input.mp4 \
-vf scale=480:-1 \
output.mp4
```



### 添加音轨

```
ffmpeg \
-i input.aac -i input.mp4 \
output.mp4
```







###转换编码格式

```
//使用编码器libx264
ffmpeg -i [input.file] -c:v libx264 output.mp4
```



### mp4 转 webm

```
ffmpeg -i input.mp4 -c copy output.webm
```



### 调整码率

调整码率（transrating）指的是，改变编码的比特率，一般用来将视频文件的体积变小。下面的例子指定码率最小为964K，最大为3856K，缓冲区大小为 2000K。

```
ffmpeg \
-i input.mp4 \
-minrate 964K -maxrate 3856K -bufsize 2000K \
output.mp4
```





###Mp4 to H264

```
有时候为了找到个合适的264测试视频比较难，那就只能自己动手生成了。

先用手机拍一段MP4（现在的手机默认拍的视频都是MP4）.再放到电脑上用ffmpeg  提取H264

命令行：

ffmpeg -i 20130312_133313.mp4 -codec copy -bsf h264_mp4toannexb -f h264 20130312_133313.264

说明：

 -i 20130312_133313.mp4 :是输入的MP4文件

-codec copy：从MP4封装中进行拷贝

-bsf: h264_mp4toannexb：从MP4拷贝到annexB封装

-f h264：采用h.264格式

20130312_133313.264：输出的文件名称
```

###MP4 to YUV

```
ffmpeg -i 123456.mp4 123456.yuv 
```

### Flv_2_MP4

```shell
ffmpeg -i file.flv file.mp4
```

### FLV_2_AAC

```
ffmpeg -i xx.flv -acodec copy -vn test.aac
```

### MP4_2_PCM

```
ffmpeg -i out.mp4 -vn -ar 44100 -ac 2 -f s16le out.pcm
```

###MP4 to 音频

```
抽取音频命令
ffmpeg -i 3.mp4 -vn -y -acodec copy 3.aac
ffmpeg -i 3.mp4 -vn -y -acodec copy 3.m4a
ffmpeg -i input.mp4 -vn -c:a mp3 output.mp3
```

### 指定编码参数

```shell
ffmpeg -i input.mov -c:v libx264 -c:a aac -2 out.mp4        # 指定编码参数
```

### 转码为webm

```shell
ffmpeg -i input.mov -c:v libvpx -c:a libvorbis out.webm     # 转换 webm
```

### 转码为 flv

```shell
ffmpeg -i input.mp4 -ab 56 -ar 44100 -b 200 -f flv out.flv  # 转换 flv
```

### 转码为 Gif

```shell
ffmpeg -i input.mp4 -an animated.gif                        # 转换 GIF
```

### h264_2_mp4

```
ffmpeg -i D:\Temp\dump.264 -vcodec copy -f mp4 notNv21ToNv12.mp4
```

### 播放 YUV 

```
ffplay -f rawvideo -video_size 1920x1080 a.yuv

//指定 YUV 格式
ffplay -video_size  1280x720  -i D:\Android\ffmpeg\temp\test3.yuv  -pixel_format  nv21
```

### play H264

```
ffplay -stats -f h264 file.h264
```



### YUV2H264

```
ffmpeg -s 1280x720 -i D:\Android\ffmpeg\temp\test2.yuv -vcodec h264 D:\Android\ffmpeg\temp\test3.264
```

### H264_2_YUV

```
ffmpeg -i  text.h264 -vcodec rawvideo -an out.yuv
```



###缩放视频尺寸

```
//注意 sacle 值必须是偶数，这里的 -1 表示保持长宽比，根据宽度值自适应高度。
//如果要求压缩出来的视频尺寸长宽都保持为偶数，可以使用 -2
ffmpeg -i big.mov -vf scale=360:-1  small.mov
```

### 加倍速播放视频

```
ffmpeg -i input.mov -filter:v "setpts=0.5*PTS" output.mov
```

### 定义帧率 16fps:

```
ffmpeg -i input.mov -r 16 -filter:v "setpts=0.125*PTS" -an output.mov
```

### 静音视频（移除视频中的音频）

```
//-an 就是禁止音频输出
ffmpeg -i input.mov -an mute-output.mov
```

### 将 GIF 转化为 MP4

```
ffmpeg -f gif -i animation.gif animation.mp4
```

### 将 gif 转为其他视频格式

```
ffmpeg -f gif -i animation.gif animation.mpeg

ffmpeg -f gif -i animation.gif animation.webm
```



### 截图

下面的例子是从指定时间开始，连续对1秒钟的视频进行截图

```
ffmpeg \
-y \
-i input.mp4 \
-ss 00:01:24 -t 00:00:01 \
output_%3d.jpg

如果只需要截一张图，可以指定只截取一帧。
ffmpeg \
-ss 01:23:45 \
-i input \
-vframes 1 -q:v 2 \
output.jpg
上面例子中，-vframes 1指定只截取一帧，-q:v 2表示输出的图片质量，一般是1到5之间（1 为质量最高）
```



### 裁剪

裁剪（cutting）指的是，截取原始视频里面的一个片段，输出为一个新视频。可以指定开始时间（start）和持续时间（duration），也可以指定结束时间（end）。

> ```bash
> $ ffmpeg -ss [start] -i [input] -t [duration] -c copy [output]
> $ ffmpeg -ss [start] -i [input] -to [end] -c copy [output]
> ```

下面是实际的例子。

> ```bash
> $ ffmpeg -ss 00:01:50 -i [input] -t 10.5 -c copy [output]
> $ ffmpeg -ss 2.5 -i [input] -to 10 -c copy [output]
> 
> * -ss 指定从什么时间开始
> * -t 指定需要截取多长时间
> * -i 指定输入文件
> ```

上面例子中，`-c copy`表示不改变音频和视频的编码格式，直接拷贝，这样会快很多。



## 音频

### 音频参数

```shell
-aq QUALITY                                                 # 音频质量，编码器相关
-ar 44100                                                   # 音频采样率
-ac 1                                                       # 音频声道数量
-an                                                         # 禁止音频
-vol 512                                                    # 改变音量为 200%
-b:a 1M                                                     # 设置音频码率 1mbps/s
```



### 为音频添加封面

有些视频网站只允许上传视频文件。如果要上传音频文件，必须为音频添加封面，将其转为视频，然后上传。

下面命令可以将音频文件，转为带封面的视频文件。

> ```bash
> $ ffmpeg \
> -loop 1 \
> -i cover.jpg -i input.mp3 \
> -c:v libx264 -c:a aac -b:a 192k -shortest \
> output.mp4
> ```

上面命令中，有两个输入文件，一个是封面图片`cover.jpg`，另一个是音频文件`input.mp3`。`-loop 1`参数表示图片无限循环，`-shortest`参数表示音频文件结束，输出视频就结束。

### play PCM

```
ffplay -ar 44100 -channels 2 -f s16le -i ceshi.pcm 
```

### pcm2wav

```
ffmpeg -y -f s16le -ar 16k -ac 1 -i input.raw output.wav
```

### pcm2amr

```
ffmpeg -f s16le -ar 8000 -ac 1 -i audio.pcm out.amr
```

### pcm2aac

```
ffmpeg -f s16le -ar 8000 -ac 1 -i audio.pcm out.aac
```

### pcm2mp3

```
ffmpeg -f s16le -ar 8000 -ac 1 -i audio.pcm out.mp3
```

### aac2pcm

```
-ar:音频的采样率 44100
-ac2:双声道
-f:音频的数据存储格式 s16le : 
s 代表 有符号的，有正有负，
16 代表每一个数值用16位表示 

ffmpeg -i test.aac -vn -ar 44100 -ac 2 -f s16le test.pcm
```



### 音频转换为 MP3 格式

```
ffmpeg -y -f s16le -ar 16k -ac 1 -i input.raw output.mp3
```

### WAV 音频转换为 PCM 格式

```
ffmpeg -y  -i input.wav  -acodec pcm_s16le -f s16le -ac 1 -ar 16k output.pcm
```

### MP3 音频转换为 PCM 格式

```
ffmpeg -y  -i input.mp3  -acodec pcm_s16le -f s16le -ac 1 -ar 16k output.pcm
```

### WAV 音频转换为 MP3 格式

```
ffmpeg -y  -i input.wav  input.mp3
```

###MP3 音频转换为 WAV 格式

```
ffmpeg -y  -i input.mp3  input.wav
```

### 拼接 MP3

```
ffmpeg -i d1.mp3 -i d2.mp3 -filter_complex '[0:0] [1:0] concat=n=2:v=0:a=1 [a]' -map [a] j5.mp3

ffmpeg -i 片头.wav -i 内容.WAV -i 片尾.wav -filter_complex '[0:0] [1:0] [2:0] concat=n=3:v=0:a=1 [a]' -map [a] 合成.wav

//测试成功
ffmpeg -i 'concat:test_loop.mp3|test_loop.mp3|test_loop.mp3' -acodec copy merge___.mp3
```



### 播放 AAC

```
// -ac指定通道个数，-ar指定采样率
ffplay  test.aac
```

### 重采样

```
ffpmeg -i test.mp3 -ar 16000 test.wav
```

### 音频裁剪

```
ffmpeg -i input.mp3 -ss 0 -t 100 -acodec libmp3lame output.mp3
```



## 图片

### 将视频 MP4 转化为 GIF

```
ffmpeg -i small.mp4 small.gif
```

### 转化视频中的一部分为 GIF

```
//从视频中第二秒开始，截取时长为3秒的片段转化为 gif
ffmpeg -t 3 -ss 00:00:02 -i small.webm small-clip.gif
```

### 转化高质量 GIF

```
//默认转化是中等质量模式，若要转化出高质量的 gif，可以修改比特率
ffmpeg -i small.mp4 -b 2048k small.gif
```



## 常用 linux 命令

- 压缩

  ```shell
  tar -zcvf /home/xahot.tar.gz /xahot
  ```

- 解压

  ```shell
  tar -zxvf xxx.tar.gz
  ```

- 查看文件大小

  ```shell
  ls -lht 
  ```

- 下载

  ```
  wget https//xxxx
  ```

##参考

- <https://blog.csdn.net/leixiaohua1020/article/details/15186441>













```
 devyk@DevYK-MacBookPro  ~/Data/Project/piaoquan/PiaoquanVideoPlus/output   video_create_audiorecord ●  ffmpeg -i s_0_1612701420767.mp3 -filter_complex volumedetect -c:v copy -f null /dev/null 
ffmpeg version 4.3.1 Copyright (c) 2000-2020 the FFmpeg developers
  built with Apple clang version 11.0.0 (clang-1100.0.33.17)
  configuration: --prefix=/usr/local/Cellar/ffmpeg/4.3.1_8 --enable-shared --enable-pthreads --enable-version3 --enable-avresample --cc=clang --host-cflags= --host-ldflags= --enable-ffplay --enable-gnutls --enable-gpl --enable-libaom --enable-libbluray --enable-libdav1d --enable-libmp3lame --enable-libopus --enable-librav1e --enable-librubberband --enable-libsnappy --enable-libsrt --enable-libtesseract --enable-libtheora --enable-libvidstab --enable-libvorbis --enable-libvpx --enable-libwebp --enable-libx264 --enable-libx265 --enable-libxml2 --enable-libxvid --enable-lzma --enable-libfontconfig --enable-libfreetype --enable-frei0r --enable-libass --enable-libopencore-amrnb --enable-libopencore-amrwb --enable-libopenjpeg --enable-librtmp --enable-libspeex --enable-libsoxr --enable-videotoolbox --enable-libzmq --enable-libzimg --disable-libjack --disable-indev=jack
  libavutil      56. 51.100 / 56. 51.100
  libavcodec     58. 91.100 / 58. 91.100
  libavformat    58. 45.100 / 58. 45.100
  libavdevice    58. 10.100 / 58. 10.100
  libavfilter     7. 85.100 /  7. 85.100
  libavresample   4.  0.  0 /  4.  0.  0
  libswscale      5.  7.100 /  5.  7.100
  libswresample   3.  7.100 /  3.  7.100
  libpostproc    55.  7.100 / 55.  7.100
[mp3 @ 0x7fe6e6001400] Estimating duration from bitrate, this may be inaccurate
Input #0, mp3, from 's_0_1612701420767.mp3':
  Duration: 00:00:02.56, start: 0.000000, bitrate: 32 kb/s
    Stream #0:0: Audio: mp3, 16000 Hz, mono, fltp, 32 kb/s
[Parsed_volumedetect_0 @ 0x7fe6e5f00440] n_samples: 0
Stream mapping:
  Stream #0:0 (mp3float) -> volumedetect
  volumedetect -> Stream #0:0 (pcm_s16le)
Press [q] to stop, [?] for help
Output #0, null, to '/dev/null':
  Metadata:
    encoder         : Lavf58.45.100
    Stream #0:0: Audio: pcm_s16le, 16000 Hz, mono, s16, 256 kb/s
    Metadata:
      encoder         : Lavc58.91.100 pcm_s16le
size=N/A time=00:00:02.55 bitrate=N/A speed= 530x    
video:0kB audio:80kB subtitle:0kB other streams:0kB global headers:0kB muxing overhead: unknown
[Parsed_volumedetect_0 @ 0x7fe6e5f00680] n_samples: 40896
[Parsed_volumedetect_0 @ 0x7fe6e5f00680] mean_volume: -18.6 dB
[Parsed_volumedetect_0 @ 0x7fe6e5f00680] max_volume: -1.6 dB
[Parsed_volumedetect_0 @ 0x7fe6e5f00680] histogram_1db: 3
[Parsed_volumedetect_0 @ 0x7fe6e5f00680] histogram_2db: 27
[Parsed_volumedetect_0 @ 0x7fe6e5f00680] histogram_3db: 54

```





```
 devyk@DevYK-MacBookPro  ~/Data/Project/piaoquan/PiaoquanVideoPlus/output   video_create_audiorecord ●  ffmpeg -i merge_1612700788878.mp3 -filter_complex volumedetect -c:v copy -f null /dev/null 
ffmpeg version 4.3.1 Copyright (c) 2000-2020 the FFmpeg developers
  built with Apple clang version 11.0.0 (clang-1100.0.33.17)
  configuration: --prefix=/usr/local/Cellar/ffmpeg/4.3.1_8 --enable-shared --enable-pthreads --enable-version3 --enable-avresample --cc=clang --host-cflags= --host-ldflags= --enable-ffplay --enable-gnutls --enable-gpl --enable-libaom --enable-libbluray --enable-libdav1d --enable-libmp3lame --enable-libopus --enable-librav1e --enable-librubberband --enable-libsnappy --enable-libsrt --enable-libtesseract --enable-libtheora --enable-libvidstab --enable-libvorbis --enable-libvpx --enable-libwebp --enable-libx264 --enable-libx265 --enable-libxml2 --enable-libxvid --enable-lzma --enable-libfontconfig --enable-libfreetype --enable-frei0r --enable-libass --enable-libopencore-amrnb --enable-libopencore-amrwb --enable-libopenjpeg --enable-librtmp --enable-libspeex --enable-libsoxr --enable-videotoolbox --enable-libzmq --enable-libzimg --disable-libjack --disable-indev=jack
  libavutil      56. 51.100 / 56. 51.100
  libavcodec     58. 91.100 / 58. 91.100
  libavformat    58. 45.100 / 58. 45.100
  libavdevice    58. 10.100 / 58. 10.100
  libavfilter     7. 85.100 /  7. 85.100
  libavresample   4.  0.  0 /  4.  0.  0
  libswscale      5.  7.100 /  5.  7.100
  libswresample   3.  7.100 /  3.  7.100
  libpostproc    55.  7.100 / 55.  7.100
[mp3 @ 0x7ffb9c800000] Estimating duration from bitrate, this may be inaccurate
Input #0, mp3, from 'merge_1612700788878.mp3':
  Duration: 00:00:02.35, start: 0.000000, bitrate: 32 kb/s
    Stream #0:0: Audio: mp3, 44100 Hz, mono, fltp, 32 kb/s
[Parsed_volumedetect_0 @ 0x7ffb9ae01180] n_samples: 0
Stream mapping:
  Stream #0:0 (mp3float) -> volumedetect
  volumedetect -> Stream #0:0 (pcm_s16le)
Press [q] to stop, [?] for help
Output #0, null, to '/dev/null':
  Metadata:
    encoder         : Lavf58.45.100
    Stream #0:0: Audio: pcm_s16le, 44100 Hz, mono, s16, 705 kb/s
    Metadata:
      encoder         : Lavc58.91.100 pcm_s16le
size=N/A time=00:00:02.35 bitrate=N/A speed= 386x    
video:0kB audio:202kB subtitle:0kB other streams:0kB global headers:0kB muxing overhead: unknown
[Parsed_volumedetect_0 @ 0x7ffb9ae09ac0] n_samples: 103680
[Parsed_volumedetect_0 @ 0x7ffb9ae09ac0] mean_volume: -62.9 dB
[Parsed_volumedetect_0 @ 0x7ffb9ae09ac0] max_volume: -44.4 dB
[Parsed_volumedetect_0 @ 0x7ffb9ae09ac0] histogram_44db: 3
[Parsed_volumedetect_0 @ 0x7ffb9ae09ac0] histogram_45db: 9
[Parsed_volumedetect_0 @ 0x7ffb9ae09ac0] histogram_46db: 19
[Parsed_volumedetect_0 @ 0x7ffb9ae09ac0] histogram_47db: 46
[Parsed_volumedetect_0 @ 0x7ffb9ae09ac0] histogram_48db: 71


-i  'concat:/storage/emulated/0/SpeedPiaoquanVideo/create/record_mp3/record_1612702954144.mp3|/storage/emulated/0/SpeedPiaoquanVideo/create/record_mp3/record_1612702960645.mp3 -filter：“volume = 20dB” /storage/emulated/0/SpeedPiaoquanVideo/create/record_mp3/merge_1612702967164.mp3

video:0kB audio:666kB subtitle:0kB other streams:0kB global headers:0kB muxing overhead: unknown
[Parsed_volumedetect_0 @ 0x7f9c47e0f480] n_samples: 340992
[Parsed_volumedetect_0 @ 0x7f9c47e0f480] mean_volume: -16.6 dB
[Parsed_volumedetect_0 @ 0x7f9c47e0f480] max_volume: -0.6 dB
[Parsed_volumedetect_0 @ 0x7f9c47e0f480] histogram_0db: 65
[Parsed_volumedetect_0 @ 0x7f9c47e0f480] histogram_1db: 605

```













