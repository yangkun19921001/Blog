## FFMPEG  - ffplay 命令

[ffmpeg 示例代码](https://www.ffmpeg.org/doxygen/2.7/examples.html)

[FFmpeg 命令参数](https://www.ruanyifeng.com/blog/2020/01/ffmpeg.html)

[FFmpeg 中文命令文档](https://www.bookstack.cn/read/other-doc-cn-ffmpeg/ffmpeg-doc-cn-34.md)

[官方命令 sample](https://ffmpeg.org/ffmpeg.html#Main-options)

[各平台编译好的 FFmpeg](https://github.com/BtbN/FFmpeg-Builds/releases)

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


通用参数
-f fmt：指定格式（音频或者视频格式）。
-i filename：指定输入文件名，在Linux下当然也能指定：0.0（屏幕录制）或摄像头。
-y：覆盖已有文件。
-t duration：指定时长。
-fs limit_size：设置文件大小的上限。
-ss time_off：从指定的时间（单位为秒）开始，也支持[-]hh：mm：ss[.xxx]的格式。
-re：代表按照帧率发送，尤其在作为推流工具的时候一定要加入该参数，否则ffmpeg会按照最高速率向流媒体服务器不停地发送数据。
-map：指定输出文件的流映射关系。例如：“-map 1：0-map 1：1”要求将第二个输入文件的第一个流和第二个流写入输出文件。如果没有-map选项，则ffmpeg采用默认的映射关系。
视频参数
-b：指定比特率（bit/s），ffmpeg是自动使用VBR的，若指定了该参数则使用平均比特率。
-bitexact：使用标准比特率。
-vb：指定视频比特率（bits/s）。
-r rate：帧速率（fps）。
-s size：指定分辨率（320×240）。
-aspect aspect：设置视频长宽比（4：3，16：9或1.3333，1.7777）。
-croptop size：设置顶部切除尺寸（in pixels）。
-cropbottom size：设置底部切除尺寸（in pixels）。
-cropleft size：设置左切除尺寸（in pixels）。
-cropright size：设置右切除尺寸（in pixels）。
-padtop size：设置顶部补齐尺寸（in pixels）。
-padbottom size：底补齐（in pixels）。
-padleft size：左补齐（in pixels）。
-padright size：右补齐（in pixels）。
-padcolor color：补齐带颜色（000000-FFFFFF）。
-vn：取消视频的输出。
-vcodec codec：强制使用codec编解码方式（'copy'代表不进行重新编码）。
音频参数
-ab：设置比特率（单位为bit/s，老版的单位可能是Kbit/s），对于MP3格式，若要听到较高品质的声音则建议设置为160Kbit/s（单声道则设置为80Kbit/s）以上。
-aq quality：设置音频质量（指定编码）。
-ar rate：设置音频采样率（单位为Hz）。
-ac channels：设置声道数，1就是单声道，2就是立体声。
-an：取消音频轨。
-acodec codec：指定音频编码（'copy'代表不做音频转码，直接复制）。
-vol volume：设置录制音量大小（默认为256）<百分比>。
```

```
We are in 2014 1234 5678 91011 1213 1415
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

### 查看版本

```
ffmpeg   -version
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
  
  //或者
  brew install ffmpeg
  
  brew install ffmpeg --with-fdk-aac --with-ffplay --with-freetype --with-libass --with-libquvi --with-libvorbis --with-libvpx --with-opus --with-x265
  
  brew update && brew upgrade ffmpeg
  ```

  

- MAC install ffmpeg 的路径

  ```
  /usr/local/Cellar/ffmpeg/4.2.2_2
  ```



## 码流建议

[MP4 码流建议](https://support.google.com/youtube/answer/1722171?hl=zh-Hans)

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

### 

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

### 显示每个 packet

```
-show_packets 
//只显示视频包
-select_streams v:0
```

### 显示每个关键帧的时间戳

```
ffprobe -loglevel error -skip_frame nokey -select_streams v:0 -show_entries frame=pkt_pts_time -of csv=print_section=0 "/Users/devyk/Data/Project/piaoquan/PQMedia/temp/199213.mp4" 
```

### 查看 pts

```
ffprobe -show_frames -select_streams v /data/test1s.mp4 | grep pkt_dts

ffmpeg -i /Users/devyk/Data/Project/piaoquan/PQMedia/web/demo/123.mp4 -dump -map 0:v -f null -
```





###以 json 格式输出

```
ffprobe-debug  -show_streams -of  json -i /Users/devyk/Data/Project/sample/github_code/YKAVStudyPlatform/temp/test.mp4
```





### 查看总帧率

```
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of default=nokey=1:noprint_wrappers=1 input.mp4
```

### 提取 IBP 帧的时间戳

```
ffprobe -i 666051400.mp4 -v quiet -select_streams v -show_entries frame=pkt_pts_time,pict_type
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



### 视频兼容问题

https://juejin.cn/post/6854573210579501070

```
ffmpeg -i leon.mp4 -c:v copy -tag:v hvc1 -c:a copy leon-hvc1.mp4
```





### 获取视频总帧率

```shell
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of default=nokey=1:noprint_wrappers=1 test.mp4
```



### lut 滤镜

```
- https://fixthephoto.com/film-luts
ffmpeg -i "/Users/devyk/Downloads/dog.mp4" -vf lut3d="/Users/devyk/Downloads/chrome-download/TEAL AND ORANGE _ riyazmn.com (RMN) 130 LUTS & PRESETS 2/3D Luts/test.cube"  -c:v libx264 test.mp4



```



### 旋转视频角度

```
ffmpeg -i /Users/devyk/Downloads/without_audioTtN4DpQrKB1s6IFjvXGqkY7OganHEciC_1pbDc15IEu.mp4  -metadata:s:v rotate="90" -codec copy -y TVq.mp4
```



### 关键帧设置

```
ffmpeg -i goptest.mp4 -c:v libx264 -preset ultrafast -profile:v baseline -x264-params keyint=30:scenecut=0 -acodec copy out.mp4

ffmpeg  -i /Users/devyk/Data/Project/piaoquan/PQMedia/temp/974f-5.mp4 -c:v libx265 -x265-params "keyint=30:min-keyint=30"   /Users/devyk/Data/Project/piaoquan/PQMedia/temp/974f-5-.mp4

```



### 速率播放

```
//音频
ffmpeg -i input.mkv -filter:a "atempo=2.0" -vn output.mkv

//视频
ffmpeg -i input.mkv  -filter:v "setpts=0.5*PTS" output.mkv

//音视频
ffmpeg -i input.mkv -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" output.mkv

```





###查看视频信息

```
ffmpeg -i xxx.mp4
```



### merge

```
ffmpeg -y -i /Users/devyk/Data/Project/piaoquan/文档/1月出行发票/test_mp4.mp4 -i /Users/devyk/Data/Project/piaoquan/文档/1月出行发票/test_mp4的副本.mp4 -vcodec copy -vsync 2 -filter_complex '[0:v]scale=720:1280,setdar=720/1280[outv0];[1:v]scale=720:1280,setdar=720/1280[outv1];[outv0][outv1]concat=n=2:v=1:a=0[outv];[0:a][1:a]concat=n=2:v=0:a=1[outa]' -map '[outv]' -map '[outa]' -preset superfast out.mp4


 
```



### 合成

```
ffmpeg -i video.mp4 -i audio.mp4 -map 0:v -map 1:a -c:a copy -c:v copy -y output.mp4
```

```shell
这种方法成功率很高，也是最好的，但是需要 FFmpeg 1.1 以上版本。先创建一个文本文件filelist.txt：

file 'input1.mkv'
file 'input2.mkv'
file 'input3.mkv'

然后：
ffmpeg -f concat -i filelist.txt -c copy output.mkv

ffmpeg -f concat -safe 0 -i /Users/devyk/Data/Project/piaoquan/PQMedia/temp/concat.txt -c copy -y  temp/concat.mp4
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



### 倒放

```
ffmpeg -i tenet.mp4 -vf reverse -af areverse tenet_r.mp4
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



### 苹果 h265 无法播放解决

```
ffmpeg -i input.mp4 -c:v libx265 -vtag hvc1 output.mp4
```

代码:

```
 if (out_stream->codecpar->codec_id == AV_CODEC_ID_HEVC)
                out_stream->codecpar->codec_tag = MKTAG('h', 'v', 'c', '1');
            else
                out_stream->codecpar->codec_tag = 0;
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



### 过滤器控制帧率

```
ffmpeg -i /Users/devyk/Data/Project/piaoquan/PQMedia/temp/199213.mp4 -filter_complex fps=fps=25 -y test_25fps.mp4

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
ffmpeg -i xxx.mp4 -pix_format yuv420 -y yuv420.yuv
```

### YUV to MP4

```
ffmpeg -s 1080x1920 -i yuv420.yuv  -y yuv420.mp4
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



### 改变音频信息

```
//ffmpeg -y -i input.mp4 -c:v libx264 -preset veryfast -profile:v baseline -r 30 -b:v 3000K  -ar 44100 -ac 2 output.mp4
```



### 视频补黑边

使用FFmpeg给视频增加黑边需要用到 pad 这个滤镜，具体用法如下：
  -vf pad=1280:720:0:93:black

按照从左到右的顺序依次为:
​   “宽”、“高”、“X坐标”和“Y坐标”，宽和高指的是输入视频尺寸（包含加黑边的尺寸），XY指的是视频所在位置。
​
比如一个输入视频尺寸是1280x534的源，想要加上黑边变成1280x720，那么用上边的语法可以实现，93是这样得来的，（720-534）/2。
​
如果视频原始1920x800的话，完整的语法应该是：
  -vf 'scale=1280:534,pad=1280:720:0:93:black'

先将视频缩小到1280x534，然后在加入黑边变成1280x720，将1280x534的视频放置在x=0，y=93的地方，
​FFmpeg会自动在上下增加93像素的黑边。
注：black可以不写，默认是黑色

```
ffmpeg -i /Users/lieyunye/Downloads/h265tails/hr.mp4 -vf "scale=960:540:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1[out]" -y /data/downloads/video_tails/fadf3013e6f18f72c0d137d92b723943.mp4
```

```
ffmpeg -i test222.mp4 -vf "scale=960:540,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1[out]" -y 960_540.mp4
ffmpeg -i test222.mp4 -filter:v "fps=fps=50,scale=960:540,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1[out]" -y 960_540.mp4
ffmpeg -i test222.mp4 -filter_complex "scale=960:540,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" -y 960_540.mp4
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

###给视频添加音频

```
去掉原视频音轨
ffmpeg -i G:\hi.mp4 -c:v copy -an G:\nosound.mp4
添加背景音乐
ffmpeg -i G:\nosound.mp4 -i G:\songs.mp3 -t 7.1 -c:v copy -y G:\output.mp4
```

### 添加 bgm

```
ffmpeg -i /Users/devyk/Data/Project/piaoquan/PQMedia/temp/concat-bgm.mp4  -i /Users/devyk/Data/Project/piaoquan/PQMedia/temp/1 -filter_complex '[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=0.5[a0];[1:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=0.5[a1];[a0][a1]amix=inputs=2:duration=first[aout]' -map '[aout]' -map 0:v:0  -c:v copy -c:a aac  -y temp/contact.mp4
```



### 添加静默音

```
ffmpeg -i addMusic.mp4 -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
-c:v copy -shortest output.mp4
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


# 耗时0.07s
ffmpeg -ss 00:00:30 -i 666051400.mp4 -vframes 1 0.jpg

# 耗时0.68s
ffmpeg -i 666051400.mp4 -ss 00:00:30  -vframes 1 0.jpg

指定 1s 截图多少张
ffmpeg -i /sdcard/dance.mp4 -q 2 -r 3 -y /sdcard/test/dance%05d.jpeg

# 抽取I帧
ffmpeg -i 666051400.mp4 -vf "select=eq(pict_type\,I)"  -vsync vfr -qscale:v 2 -f image2 ./%08d.jpg

# 抽取P帧
ffmpeg -i 666051400.mp4 -vf "select=eq(pict_type\,P)"  -vsync vfr -qscale:v 2 -f image2 ./%08d.jpg

# 抽取B帧
ffmpeg -i 666051400.mp4 -vf "select=eq(pict_type\,B)"  -vsync vfr -qscale:v 2 -f image2 ./%08d.jpg

//每帧都是关键帧
ffmpeg -i 2.mp4 -c:v libx264 -x264opts keyint=1 -y keyint11.mp4
```



### 均匀抽帧

```
# -r 指定抽取的帧率，即从视频中每秒钟抽取图片的数量。1代表每秒抽取一帧。
ffmpeg -i 666051400.mp4 -r 1 -q:v 2 -f image2 ./%08d.000000.jpg
```



### png2h264

```
ffmpeg -start_number 00500 -i frame_00500.jpg -c:v h264 test_500.h264
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



### 添加水印

>**-filter_complex**: 相比-vf, filter_complex适合开发复杂的滤镜功能，如同时对视频进行裁剪并旋转。参数之间使用逗号（，）隔开即可
> **main_w**:视频宽度
> **overlay_w**: 要添加的图片水印宽度
> **main_h** : 视频高度
> **overlay_h**:要添加的图片水印宽度
>
>



在视频右下角的添加图片水印

```
ffmpeg -i input.mp4 -i logo.png -filter_complex 'overlay=main_w-overlay_w-10:main_h-overlay_h-10' output.mp4
```

在视频左下角添加图片水印

```
ffmpeg -i input.mp4 -i logo.png -filter_complex 'overlay=x=10:y=main_h-overlay_h-10' output.mp4
```



### 添加本地时间水印

```
ffmpeg  -i src.mp4 -vf "drawtext=fontsize=160:text='%{localtime\:%T}'" -c:v libx264 -an -f mp4 output.mp4 -y
```



### 把视频的pts时间戳添加为水印

```
ffmpeg -t 5 -i src.mp4 -vf "drawtext=fontsize=160:text='%{pts\:hms}'" -c:v libx264 -an -f mp4 output.mp4 -y
```

### 添加动态水印

```
./ffmpeg -y -i ~/Desktop/v.mp4 -ignore_loop 0 -i hello.gif -ss 0 -t 9 -filter_complex overlay=main_w-138:0:1 v-3.mp4
```



### 添加字幕

**fontfile**:字体类型
**text**:要添加的文字内容
**fontsize**:字体大小
**fontcolor**：字体颜色

```
ffmpeg -i input.mp4 -vf "drawtext=fontfile=simhei.ttf: text=‘技术是第一生产力’:x=10:y=10:fontsize=24:fontcolor=white:shadowy=2" output.mp4
```

滚动字幕

```
ffmpeg -i ~/Desktop/hello.mp4 -b:v 500K -vf drawtext="fontfile=/Library/Fonts/YaHei.Consolas.1.11b.ttf:fontcolor=0xaaff00:fontsize=18:shadowy=0:\x='if(gte(t,2), (main_w-mod(t*50,main_w)), NAN)':y=(main_h-line_h-10):text='关注广州小程，提升专业技能。'" hello.mp4
```

添加 srt 字幕

https://www.hexianwei.com/2021/08/09/ffmpeg__-subtitles_%E4%B8%AD%E6%96%87/



```
01.Name             风格(Style)的名称. 区分大小写. 不能包含逗号.
02.Fontname         使用的字体名称, 区分大小写.
03.Fontsize         字体的字号
04.PrimaryColour    设置主要颜色, 为蓝-绿-红三色的十六进制代码相排列, BBGGRR. 为字幕填充颜色
05.SecondaryColour  设置次要颜色, 为蓝-绿-红三色的十六进制代码相排列, BBGGRR. 在卡拉OK效果中由次要颜色变为主要颜色.
06.OutlineColour    设置轮廓颜色, 为蓝-绿-红三色的十六进制代码相排列, BBGGRR.
07.BackColour       设置阴影颜色, 为蓝-绿-红三色的十六进制代码相排列, BBGGRR. ASS的这些字段还包含了alpha通道信息. (AABBGGRR), 注ASS的颜色代码要在前面加上&H
08.Bold             -1为粗体, 0为常规
09.Italic           -1为斜体, 0为常规
10.Underline       [-1 或者 0] 下划线
11.Strikeout       [-1 或者 0] 中划线/删除线
12.ScaleX          修改文字的宽度. 为百分数
13.ScaleY          修改文字的高度. 为百分数
14.Spacing         文字间的额外间隙. 为像素数
15.Angle           按Z轴进行旋转的度数, 原点由alignment进行了定义. 可以为小数
16.BorderStyle     1=边框+阴影, 3=纯色背景. 当值为3时, 文字下方为轮廓颜色的背景, 最下方为阴影颜色背景.
17.Outline         当BorderStyle为1时, 该值定义文字轮廓宽度, 为像素数, 常见有0, 1, 2, 3, 4.
18.Shadow          当BorderStyle为1时, 该值定义阴影的深度, 为像素数, 常见有0, 1, 2, 3, 4.
19.Alignment       定义字幕的位置. 字幕在下方时, 1=左对齐, 2=居中, 3=右对齐. 1, 2, 3加上4后字幕出现在屏幕上方. 1, 2, 3加上8后字幕出现在屏幕中间. 例: 11=屏幕中间右对齐. Alignment对于ASS字幕而言, 字幕的位置与小键盘数字对应的位置相同.
20.MarginL         字幕可出现区域与左边缘的距离, 为像素数
21.MarginR         字幕可出现区域与右边缘的距离, 为像素数
22.MarginV         垂直距离

```

```
"subtitles=subs.srt:force_style='Fontname=STSong,Fontsize=24,PrimaryColour=&H0000ff&'"

ffmpeg -i /Users/devyk/Data/Project/piaoquan/PQMedia/temp/sdk_out_file3.mp4 -vf  "subtitles=/Users/devyk/Downloads/chrome-download/test1.srt:force_style='Fontname=STSong'" -r 30 /Users/devyk/Data/Project/piaoquan/PQMedia/temp/output.mp4
```



### 视频旋转

```
//一度等于π/ 180弧度。因此，如果您想旋转90°：
ffmpeg -i /Users/devyk/Data/Project/piaoquan/PQMedia/temp/sdk_out_file.mp4 -vf "rotate=90*(PI/180),format=yuv420p

```





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



### 去除静默音

```shell
ffmpeg -i input.wav -af silenceremove=stop_periods=-1:stop_duration=1:stop_threshold=-30dB output.wav
剪去所有从开始到结束遇到的音频中超过1秒的静音片段，

ffmpeg -i input.wav -af silenceremove=stop_periods=-1:stop_duration=0.3:stop_threshold=-30dB output.wav
剪去所有从开始到结束遇到的音频中超过0.3秒的静音片段
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

### 音频拼接和混音

```
ffmpeg -i 1.mp3 -i 2.mp3 -i 3.mp3 \
  -filter_complex "[1]adelay=4000|4000[del1],[2]adelay=6000|6000[del2],[0][del1]amix[out],[out][del2]amix" output.mp3 
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

### 禁止 B Frame

```
ffmpeg -i test.mp4 -vcodec libx264 -profile:v baseline -pix_fmt yuv420p -s 640x480 -acodec aac test1.mp4

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

### 抽取IPB帧到jpg图片：

```shell
# 抽取I帧
ffmpeg -i 666051400.mp4 -vf "select=eq(pict_type\,I)"  -vsync vfr -qscale:v 2 -f image2 ./%08d.jpg

# 抽取P帧
ffmpeg -i 666051400.mp4 -vf "select=eq(pict_type\,P)"  -vsync vfr -qscale:v 2 -f image2 ./%08d.jpg

# 抽取B帧
ffmpeg -i 666051400.mp4 -vf "select=eq(pict_type\,B)"  -vsync vfr -qscale:v 2 -f image2 ./%08d.jpg
```

### 抽取制定时间的帧

```
# 耗时0.07s
ffmpeg -ss 00:00:30 -i 666051400.mp4 -vframes 1 0.jpg

# 耗时0.68s
ffmpeg -i 666051400.mp4 -ss 00:00:30  -vframes 1 0.jpg
```

### 均匀抽帧

```
# -r 指定抽取的帧率，即从视频中每秒钟抽取图片的数量。1代表每秒抽取一帧。
ffmpeg -i 666051400.mp4 -r 1 -q:v 2 -f image2 ./%08d.000000.jpg
```



### 图片转视频

```
ffmpeg  -i /Users/devyk/Downloads/chrome-download/123.png  -vcodec libx264 -r 10  test.mp4
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



##质量检查

###黑屏

####blackdetect 滤镜实现对视频黑屏画面时间段的检测

**参数简介**

- blackdetect filter :
  检查视频中纯黑色画面的时间段。在检查视频中的过渡片段、广告或者非法数据等黑屏画面时很有效。输出数据包含黑屏片段的起始点，以及黑屏时长，单位为秒。

- black_min_duration, d:
  设置黑场时间阈值，只有黑场的连续时间大于门限值才认为是黑场视频。阈值大于等于0，默认2.0。

- picture_black_ratio_th, pic_th:
  设置黑场的判断阈值，nb_black_pixels/nb_pixels（黑场像素/总像素），该值为百分比，大于等于此阈值认为此帧图片是黑场. 默认值0.98.

- pixel_black_th, pix_th:
  设置黑场像素的判断阈值，默认值0.10。根据此阈值计算绝对阈值，低于绝对阈值的像素认为是黑场像素点。
  绝对阈值计算公式如下：
  absolute_threshold = luminance_minimum_value + pixel_black_th * luminance_range_size
  luminance_range_size and luminance_minimum_value 依赖输入视频的格式, 对于YUV full-range 其范围是 [0-255]，对于YUV non full-range 其范围是 [16-235];

- 例子：
  blackdetect=d=2:pix_th=0.00
  该命令设置黑色像素判断的阈值为0，检查黑屏时长不小于2s的片段。

**参考命令**

```shell
ffmpeg -loglevel info  -i ~/test.mp4  -vf blackdetect=d=0.5:pic_th=0.80  -f null -
ffmpeg -loglevel info  -i ~/test.mp4  -vf blackdetect=d=0.5:pix_th=0.40  -f null -
```



### 图像模糊检测

- https://github.com/Leezhen2014/python--/blob/master/BlurDetection.py
- [无参考图像的清晰度评价方法及实现源码](https://blog.csdn.net/weixin_45250844/article/details/102734991)



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

































