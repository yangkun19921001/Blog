# FFMPEG  - ffplay 命令

[https://blog.csdn.net/leixiaohua1020/article/details/15186441](https://blog.csdn.net/leixiaohua1020/article/details/15186441)

ffmpeg 查看视频信息

```java
ffmpeg -i xxx.mp4
```

ffmpeg Mp4 to H264

```text
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

ffmpeg udp h264 拉流

```java
ffplay -f h264 udp:233.233.233.223:6666
```

ffmpeg h264 to mp4

```java
ffmpeg -i D:\Temp\dump.264 -vcodec copy -f mp4 notNv21ToNv12.mp4
```

RTP 推流

```text
ffmpeg -re -i chunwan.h264 -vcodec copy -f rtp rtp://233.233.233.223:6666>test.sdp

注1：-re一定要加，代表按照帧率发送，否则ffmpeg会一股脑地按最高的效率发送数据。

注2：-vcodec copy要加，否则ffmpeg会重新编码输入的H.264裸流。

注3：最右边的“>test.sdp”用于将ffmpeg的输出信息存储下来形成一个sdp文件。该文件用于RTP的接收。当不加“>test.sdp”的时候，ffmpeg会直接把sdp信息输出到控制台。将该信息复制出来保存成一个后缀是.sdp文本文件，也是可以用来接收该RTP流的。加上“>test.sdp”后，可以直接把这些sdp信息保存成文本。

原文：https://blog.csdn.net/leixiaohua1020/article/details/38283297
```

RTP 拉流 [参考地址](http://notes.maxwi.com/2017/04/05/ffmpeg-streaming/)

```java
ffplay bunny.sdp -protocol_whitelist file,udp,rtp
```

播放 YUV

```java
ffplay -f rawvideo -video_size 1920x1080 a.yuv

ffplay -video_size  1280x720  -i D:\Android\ffmpeg\temp\test3.yuv  -pixel_format  nv21
```

ffmpeg yuv to h264

```java
ffmpeg -s 1280x720 -i D:\Android\ffmpeg\temp\test2.yuv -vcodec h264 D:\Android\ffmpeg\temp\test3.264
```

ffmpeg 编译 脚本

```java
 #!/bin/bash

echo "进入编译ffmpeg脚本" 
NDK=/home/yangkun/android/ndk_sdk/android-ndk-r14b
#5.0
PLATFORM=$NDK/platforms/android-21/arch-arm
TOOLCHAIN=$NDK/toolchains/arm-linux-androideabi-4.9/prebuilt/linux-x86_64
CPU=armv7-a
#输出路径
PREFIX=./android/$CPU
function buildFF 
{ 
 echo "开始编译ffmpeg" 
 ./configure \
 --prefix=$PREFIX \
 --target-os=android \
 --cross-prefix=$TOOLCHAIN/bin/arm-linux-androideabi- \
 --arch=arm \
 --cpu=$CPU  \
 --sysroot=$PLATFORM \
 --extra-cflags="$CFLAG" \
 --cc=$TOOLCHAIN/bin/arm-linux-androideabi-gcc \
 --nm=$TOOLCHAIN/bin/arm-linux-androideabi-nm \
 --enable-shared \
 --enable-runtime-cpudetect \
 --enable-gpl \
 --enable-small \
 --enable-cross-compile \
 --disable-debug \
 --disable-static \
 --disable-doc \
 --disable-ffmpeg \
 --disable-ffplay \
 --disable-ffprobe \
 --disable-ffserver \
 --disable-postproc \
 --disable-avdevice \
 --disable-symver \
 --disable-stripping \
 $ADDmake
 -j16
 make install
 echo "编译结束！"
 }
########################################################### 
echo "编译支持neon和硬解码"
CPU=armv7-a
PREFIX=./android/armv7-a-neon-hard
CFLAG="-I$PLATFORM/usr/include -fPIC -DANDROID -mfpu=neon -mfloat-abi=softfp "
                                                                                                                                                                                          11,1          Top
```

