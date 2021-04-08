## FFMPEG  - ffplay 命令

[ffmpeg 示例代码](https://www.ffmpeg.org/doxygen/2.7/examples.html)

[FFmpeg 命令参数](https://www.ruanyifeng.com/blog/2020/01/ffmpeg.html)

[FFmpeg 中文命令文档](https://www.bookstack.cn/read/other-doc-cn-ffmpeg/ffmpeg-doc-cn-34.md)

[官方命令 sample](https://ffmpeg.org/ffmpeg.html#Main-options)

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
-buildconf																									# 显示编译配置信息
-demuxers																										# 显示多路解复用器信息
-muxers																											# 显示多路封装器信息
-devices																										# 显示可用的设备
-hide_banner																								# 禁止打印横幅
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

- install

  ```
  brew install ffmpeg
  //配置环境变量
  vim .bash_profile
  //保存环境变量
  source .bash_profile
  
  
  //查看安装是否成功
  ffmpeg
  ```

  

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

## FFprobe

### 查看详细的帮助信息

```
ffprobe --help
```

### 查看多媒体封装格式

```
-show_format 
```

### 查看视频文件中的帧信息

```
-show_frames
```

### 查看视频文件中的流信息、

```
-show_streams
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



### 获取视频总帧率

```shell
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of default=nokey=1:noprint_wrappers=1 test.mp4
```





###查看视频信息

```
ffmpeg -i xxx.mp4
```



### merge

```
ffmpeg -y -i /Users/devyk/Data/Project/piaoquan/文档/1月出行发票/test_mp4.mp4 -i /Users/devyk/Data/Project/piaoquan/文档/1月出行发票/test_mp4的副本.mp4 -vcodec copy -vsync 2 -filter_complex '[0:v]scale=720:1280,setdar=720/1280[outv0];[1:v]scale=720:1280,setdar=720/1280[outv1];[outv0][outv1]concat=n=2:v=1:a=0[outv];[0:a][1:a]concat=n=2:v=0:a=1[outa]' -map '[outv]' -map '[outa]' -preset superfast out.mp4


 
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

### 提取音频和视频合成新的视频



```
ffmpeg -itsoffset 00:00:00.900 -i whs_sec08.mp4 -i whs_sec08.mp4  -map 0:v -map 1:a -vcodec copy -acodec copy whsad.mp4
说明：上面的命令把视频推迟了0.9秒

-itsoffset 00:00:00.900  推迟后面的输入0.9秒

-i whs_sec08.mp4  第一个输入流

-i whs_sec08.mp4  第二个输入流

-map 0:v  提取第一个输入流的视频

-map 1:a  提取第二个输入流的音频

-vcodec copy -acodec copy 视频音频编码均为复制

whsad.mp4 输出文件

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

### 定义帧率 16fps :

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

ffmpeg -i 'concat:/Users/devyk/Data/Project/piaoquan/PiaoquanVideoPlus/output/muxer/videoMp3/225502619098923.mp3|/Users/devyk/Data/Project/piaoquan/PiaoquanVideoPlus/output/muxer/videoMp3/225502629482777.mp3' -acodec copy merge___.mp3

ffmpeg -i 225502619098923.mp3 -i 225502629482777.mp3 -filter_complex '[0:0] [1:0] concat=n=2:v=0:a=1 [a]' -map [a] j5.mp3

ffmpeg -i 225502629482777.mp3 -vn 2.mp3
ffmpeg -i 225502631949444.mp3 -vn 3.mp3
ffmpeg -i 225516668949963.mp3 -vn 4.mp3
ffmpeg -i 225502628459861.mp3 -vn 5.mp3
ffmpeg -i 225502630660382.mp3 -vn 6.mp3
ffmpeg -i 225502633395798.mp3 -vn 7.mp3

ffmpeg -i 'concat:/Users/devyk/Data/Project/piaoquan/PiaoquanVideoPlus/output/muxer/videoMp3/a.mp3|/Users/devyk/Data/Project/piaoquan/PiaoquanVideoPlus/output/muxer/videoMp3/b.mp3|/Users/devyk/Data/Project/piaoquan/PiaoquanVideoPlus/output/muxer/videoMp3/c.mp3|/Users/devyk/Data/Project/piaoquan/PiaoquanVideoPlus/output/muxer/videoMp3/d.mp3|/Users/devyk/Data/Project/piaoquan/PiaoquanVideoPlus/output/muxer/videoMp3/e.mp3|/Users/devyk/Data/Project/piaoquan/PiaoquanVideoPlus/output/muxer/videoMp3/f.mp3|' -acodec copy -y merge___.mp3

2021-03-31 14:42:53.045 25473-26585/com.piaoquantv.piaoquanvideoplus D/VideoMuxerTask: videoDecoderHelper end deocde , pts = 29162 , end = 29162
2021-03-31 14:43:03.276 25473-26585/com.piaoquantv.piaoquanvideoplus D/VideoMuxerTask: videoDecoderHelper end deocde , pts = 78062 , end = 78062
2021-03-31 14:43:09.955 25473-26585/com.piaoquantv.piaoquanvideoplus D/VideoMuxerTask: videoDecoderHelper end deocde , pts = 96356 , end = 96356
2021-03-31 14:43:18.396 25473-26585/com.piaoquantv.piaoquanvideoplus D/VideoMuxerTask: videoDecoderHelper end deocde , pts = 141468 , end = 141468
2021-03-31 14:43:26.645 25473-26585/com.piaoquantv.piaoquanvideoplus D/VideoMuxerTask: videoDecoderHelper end deocde , pts = 179475 , end = 179475


2021-03-31 14:42:53.813 25473-26589/com.piaoquantv.piaoquanvideoplus D/FFmpegMergeAudio: videoDecoderHelper audio end deocde , startTimestamp = 0 duration=12192789 delay=0
2021-03-31 14:42:53.825 25473-26589/com.piaoquantv.piaoquanvideoplus D/FFmpegMergeAudio: videoDecoderHelper audio end deocde , startTimestamp = 34416 duration=42982040 delay=34416
2021-03-31 14:42:53.841 25473-26589/com.piaoquantv.piaoquanvideoplus D/FFmpegMergeAudio: videoDecoderHelper audio end deocde , startTimestamp = 77416 duration=18301859 delay=77416
2021-03-31 14:42:53.853 25473-26589/com.piaoquantv.piaoquanvideoplus D/FFmpegMergeAudio: videoDecoderHelper audio end deocde , startTimestamp = 77416 duration=4824000 delay=77416
2021-03-31 14:42:53.858 25473-26589/com.piaoquantv.piaoquanvideoplus D/FFmpegMergeAudio: videoDecoderHelper audio end deocde , startTimestamp = 82240 duration=4572000 delay=82240
2021-03-31 14:42:53.864 25473-26589/com.piaoquantv.piaoquanvideoplus D/FFmpegMergeAudio: videoDecoderHelper audio end deocde , startTimestamp = 86812 duration=3636000 delay=86812
2021-03-31 14:42:53.870 25473-26589/com.piaoquantv.piaoquanvideoplus D/FFmpegMergeAudio: videoDecoderHelper audio end deocde , startTimestamp = 90448 duration=3816000 delay=90448
2021-03-31 14:42:53.876 25473-26589/com.piaoquantv.piaoquanvideoplus D/FFmpegMergeAudio: videoDecoderHelper audio end deocde , startTimestamp = 94264 duration=3240000 delay=94264
2021-03-31 14:42:53.882 25473-26589/com.piaoquantv.piaoquanvideoplus D/FFmpegMergeAudio: videoDecoderHelper audio end deocde , startTimestamp = 97504 duration=3492000 delay=97504
2021-03-31 14:42:53.895 25473-26589/com.piaoquantv.piaoquanvideoplus D/FFmpegMergeAudio: videoDecoderHelper audio end deocde , startTimestamp = 100996 duration=77824000 delay=100996
2021-03-31 14:42:53.915 25473-26589/com.piaoquantv.piaoquanvideoplus D/FFmpegMergeAudio: videoDecoderHelper audio end deocde , startTimestamp = 104615 duration=36208390 delay=104615
2021-03-31 14:42:53.944 25473-26589/com.piaoquantv.piaoquanvideoplus D/FFmpegMergeAudio: videoDecoderHelper audio end deocde , startTimestamp = 140812 duration=38000136 delay=140812


0 29162 78062 96356 141468 179475 
0 34416 77416 77416 82240 86812 90448 94264 97504 100996 104615 140812








video   audio 
18120   18042
27560   27376
37000   36687
68440   68173
214520  214180
234760  234543


arrayListOf("sdcard/SpeedPiaoquanVideo/create/ossMaterial/62678018a765effdc4646bba82f105a7ad414351616996679950","sdcard/SpeedPiaoquanVideo/create/ossMaterial/62678017f60649e5a624977ab5d8271c641920c1616996690431","sdcard/SpeedPiaoquanVideo/create/ossMaterial/6267801c5ee0eec8e014fee9625788529a687d71616996694186","sdcard/SpeedPiaoquanVideo/create/ossMaterial/6267801e959c9d7afb045bc86167d0cf451ffc81616996697882","sdcard/SpeedPiaoquanVideo/create/ossMaterial/6267801d3699f65c54a4edcb75c3c729ab575c01616996711173","sdcard/SpeedPiaoquanVideo/create/ossMaterial/6267801199bdb03711c48cd9982ee387c8f22671616996768259")








```





225502619098923.mp3            225502629482777.mp3            225502631949444.mp3            225516668949963.mp4
225502628459861.mp3            225502630660382.mp3            225502633395798.mp3            225516668949963_AudioMerge.mp4



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



### 图片压缩

```
ffmpeg -i input.jpg -q 5 output.jpg
```

### 混音

```
ffmpeg -y  -i input1.wav  -iinput2.wav -filter_complex amix=inputs=2:duration=first:dropout_transition=4  output.wav
// input1.wav 和 input2.wav是需要混合输入的两个音频；
//amix=inputs=输入的音频个数，默认是2；
//duration=音频周期时常，默认是最长的
inputs
The number of inputs. If unspecified, it defaults to 2.//输入的数量，如果没有指明，默认为2.
 
duration
How to determine the end-of-stream.//决定了流的结束
 
longest
The duration of the longest input. (default)//最长输入的持续时间
 
shortest
The duration of the shortest input.//最短输入的持续时间
 
first
The duration of the first input.//第一个输入的持续时间
 
dropout_transition
The transition time, in seconds, for volume renormalization when an input stream ends. The default value is 2 seconds.
//输入流结束时（音频）容量重整化的转换时间（以秒为单位）。 默认值为2秒

大多数的时候，音频混合还会涉及到某个音频需要延迟，例如需要混音的第二个音频要在第一个音频的第五秒才开始播放，这就要使用ffmpeg的-itsoffset命令：

ffmpeg -y  -i  input1.wav -itsoffset 5 -i input2.wav -filter_complex amix=inputs=2:duration=first:dropout_transition=4 -async 1  output.wav    

-itsoffset  offset ： 延迟时间offset秒；

注意：一定要在音频输出之前加上 -async 1 命令，否则 -itsoffset 命令失效。



// 音频混合，调整第1个音频的音量和第2个音频的音量
ffmpeg -i ../../video/output.mp3 -i ../../video/new1.mp3 -filter_complex "[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=0.5[a0]; [1:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=0.9[a1]; [a0][a1]amerge=inputs=2[aout]" -map "[aout]" -ac 2 ../../video/mix_v0.5.mp3

// 音频混合，调整第1个音频的音量和第2个音频的音量
ffmpeg -i ../../video/output.mp3 -i ../../video/new2.mp3 -filter_complex "[0:a]aformat=sample_fmts=fltp:channel_layouts=stereo,volume=0.5[a0]; [1:a]aformat=sample_fmts=fltp:channel_layouts=stereo,volume=0.9,adelay=5000|5000|5000,apad[a1]; [a0][a1]amerge=inputs=2[aout]" -shortest -map "[aout]" -ac 2 ../../video/mix_new1.mp3
// apad  -shortest   是使音频长度为最长
// adelay            延时播放时间

// 音视频混合，调整第1个音频的音量和第2个音频的音量 
ffmpeg -i ../../video/demo.mp4 -i ../../video/new2.mp3 -filter_complex "[0:a]aformat=sample_fmts=fltp:channel_layouts=stereo,volume=0.4[a0]; [1:a]aformat=sample_fmts=fltp:channel_layouts=stereo,volume=0.9,adelay=5000|5000|5000[a1]; [a0][a1]amix=inputs=2:duration=first[aout]" -map [aout] -ac 2 -c:v copy -map 0:v:0 ../../video/mix_amerge3.mp4
或者
ffmpeg -i ../../video/demo.mp4 -i ../../video/new2.mp3 -filter_complex [0:a]aformat=sample_fmts=fltp:channel_layouts=stereo,volume=0.4[a0];[1:a]aformat=sample_fmts=fltp:channel_layouts=stereo,volume=0.9,adelay="5000|5000|5000"[a1];[a0][a1]amix=inputs=2:duration=first[aout] -map [aout] -ac 2 -c:v copy -map 0:v:0 E:\software\video\outfileName.mp4 E:\software\outfileName.mp4


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

































