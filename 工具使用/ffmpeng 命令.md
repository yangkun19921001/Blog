## FFMPEG  - ffplay 命令

## install

### MAC

```
brew install ffmpeg

brew install ffmpeg --with-fdk-aac --with-ffplay --with-freetype --with-libass --with-libquvi --with-libvorbis --with-libvpx --with-opus --with-x265

brew update && brew upgrade ffmpeg
```

## 推流

### RTP 推流

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

###查看视频信息

```
ffmpeg -i xxx.mp4
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

### YUV2H264

```
ffmpeg -s 1280x720 -i D:\Android\ffmpeg\temp\test2.yuv -vcodec h264 D:\Android\ffmpeg\temp\test3.264
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





## 音频

### play PCM

```
ffplay -ar 44100 -channels 2 -f s16le -i ceshi.pcm 
```

### pcm2wav

```
ffmpeg -y -f s16le -ar 16k -ac 1 -i input.raw output.wav
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



##参考

- <https://blog.csdn.net/leixiaohua1020/article/details/15186441>





























