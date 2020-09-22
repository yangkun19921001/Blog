![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200115141001.jpeg)

## 前言

​		该篇文章起就正式进入音视频学习了，在进入音视频学习之前我们必须要先学习 FFmpeg 这个库，这个库非常强大，强大到什么地步呢 ？可以说只要做音视频的没有人不了解它，包括国内外一些比较出名的播放器也用到了 FFmpeg 这个库。

## FFmpeg 定义

​		FFmpeg 既是一款音视频编解码工具，同时也是一组音视频编解码开发套件，作为编解码开发套件，他为开发者提供了丰富的音视频处理的调用接口。

​		FFmpeg 提供了多种媒体格式的封装和解封装，包括多种音视频编码、多种协议的流媒体、多种色彩格式转换、多种采样率转换、多种码率转换等; FFmpeg 框架提供了多种丰富的插件模块，包含封装与解封转的插件、编码与解码的插件等。

## FFmpeg 历史

​		FFmpeg 由法国天才程序员 **Fabrice Bellard** 在 2000 年的时开发出初版；后来发展到 2004 年， **Fabrice Bellard** 找到了接手人，这个人至今还在维护 FFmpeg 的 Michael Niedermayer 。Michael Niedermayer 对 FFmpeg 的贡献非常大，其将滤镜子系统 libavfilter 加入 FFmpeg 项目中，使得 FFmpeg 的多媒体处理更加多样、更加方便。在 FFmpeg 发布了 0.5 版本之后，很长一段时间没有进行新版本的发布，直到后来 FFmpeg 采用了 Git 作为版本控制服务器以后才开始继续进行代码更新、版本发布，当然也是时隔多年之后了；2011 年 3 月，在 FFmpeg 项目中有一些提交者对 FFmpeg的项目管理方式并不满意，因而重新创建了一个新的项目，命名为 Libav, 该项目尽管至今并没有 FFmpeg 发展这么迅速，但是提交权限相对 FFmpeg 更加开放；2015 年 8 月，Michael Niedermayer 主动辞去 FFmpeg 项目负责人的职务。Michael Niedermayter 从 Libav 中移植了大量的代码和功能到 FFmpeg 中，Michael Niedermayter 辞职的主要目的是希望两个项目最终能够一起发展，若能够合并则更好。时至今日，在大多数的 Linux 发行版本系统中已经使用 FFmpeg 来进行多媒体处理。

FFmpeg 可以通过以下方式自由获取源代码，具体方式如下:

- [官方网站](https://www.ffmpeg.org/)
- [http://git.videolan.org/?p=ffmpeg.git](http://git.videolan.org/?p=ffmpeg.git)
- [GitHub](https://github.com/FFmpeg/FFmpeg)

## FFmpeg 模块介绍

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200114221739.png)

​		FFmpeg 框架的基本组成包含 libavcodec 、libavformat、libavfilter、libavdevice 、libavutil 等模块。

下面针对这些模块做一个大概的介绍。

- **libavcodec:** 

  编解码库，封装了 Codec 层，但是有一些 codec 是具备自己的 License 的，FFmpeg 不会默认添加像 libx264、FDK-AAC、Lame 等库，但是 FFmpeg 像一个平台，可以将其他的第三方codec以插件的方式添加进来，为开发者提供统一接口

- **libavformat:**

  文件格式和协议库，封装了 Protocol 层和 Demuxer、Muxer 层，使得协议和格式对于开发者来说是透明的

- **libavfilter:**

  音视频滤镜库，该模块包含了音频特效和视频特效的处理，在使用 FFmpeg 的 API 进行编解码的过程中，可以使用该模块高效的为音视频数据做特效处理

- **libavdevice:**

  输入输出设备库，比如需要编译出播放声音或者视频的工具 ffplay，就需要确保该模块是打开的，同事也需要 libsdl 的预先编译，该设备模块播放声音和视频都又是使用libsdl 库

- **libavutil:** 

  核心工具库，最基础模块之一，其他模块都会依赖该库做一些基本的音视频处理操作

- **libswresample:**

  用于音频重采样，可以对数字音频进行声道数、数据格式、采样率等多种基本信息的转换

- **libswscale**

  该模块用于图像格式转换，可以将 YUV 的数据转换为 RGB 的数据

- **libpostproc**

  该模块用于进行后期处理，当我们使用filter的时候，需要打开这个模块，filter会用到这个模块的一些基础函数

  比较老的 ffmpeg 还会编译出 avresamle 模块，也是用于对音频原始出具进行重采样的，但是已经被废弃，推荐使用 libswresample 替代

  另外，库里还可以包含对 H.264/MPEG-4 AVC 视频编码的 X264 库，是最常用的有损视频编码器，支持 CBR、VBR 模式，可以在编码的过程中直接改变码率的设置，在直播的场景中非常适用！可以做码率自适应的功能。

## 下载 FFmpeg

[FFmpeg 官网](https://www.ffmpeg.org/download.html) 直接下载源码方式

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200114232135.png)

在 linux 环境中，命令下载:

```
//1. 命令下载
wget https://ffmpeg.org/releases/ffmpeg-4.2.2.tar.bz2
//2. 安装解压缩工具
yum -y install bzip2
//3. 解压 FFmpeg 
tar -jxvf ffmpeg-4.2.2.tar.bz2
```

## 编译 FFmpeg

### 编译环境

- ffmpeg-4.2.2
- Centos 7
- android-ndk-r17c-linux-x86_64.zip

### configure 脚本介绍

```shell
#!/bin/sh
...

#帮组选项
Help options:
  --help                   print this message
  --quiet                  Suppress showing informative output
  --list-decoders          show all available decoders
  --list-encoders          show all available encoders
  --list-hwaccels          show all available hardware accelerators
  --list-demuxers          show all available demuxers
  --list-muxers            show all available muxers
  --list-parsers           show all available parsers
  --list-protocols         show all available protocols
  --list-bsfs              show all available bitstream filters
  --list-indevs            show all available input devices
  --list-outdevs           show all available output devices
  --list-filters           show all available filters

#标准选项
#--disable  代表关闭状态 ；--enable   代表开启状态
Standard options:
  --logfile=FILE           log tests and output to FILE [ffbuild/config.log]
  --disable-logging        do not log configure debug information
  --fatal-warnings         fail if any configure warning is generated
  
  #我们最终编译好的动态静态库位置，必须设置
  --prefix=PREFIX          install in PREFIX [$prefix_default]
  
  --bindir=DIR             install binaries in DIR [PREFIX/bin]
  --datadir=DIR            install data files in DIR [PREFIX/share/ffmpeg]
  --docdir=DIR             install documentation in DIR [PREFIX/share/doc/ffmpeg]
  --libdir=DIR             install libs in DIR [PREFIX/lib]
  --shlibdir=DIR           install shared libs in DIR [LIBDIR]
  --incdir=DIR             install includes in DIR [PREFIX/include]
  --mandir=DIR             install man page in DIR [PREFIX/share/man]
  --pkgconfigdir=DIR       install pkg-config files in DIR [LIBDIR/pkgconfig]
  --enable-rpath           use rpath to allow installing libraries in paths
                           not part of the dynamic linker search path
                           use rpath when linking programs (USE WITH CARE)
  --install-name-dir=DIR   Darwin directory name for installed targets

Licensing options:
  --enable-gpl             allow use of GPL code, the resulting libs
                           and binaries will be under GPL [no]
  --enable-version3        upgrade (L)GPL to version 3 [no]
  --enable-nonfree         allow use of nonfree code, the resulting libs
                           and binaries will be unredistributable [no]

Configuration options:
#开启静态库
  --disable-static         do not build static libraries [no]
#关闭动态库
  --enable-shared          build shared libraries [no
#可以优化库的大小
  --enable-small           optimize for size instead of speed
  --disable-runtime-cpudetect disable detecting CPU capabilities at runtime (smaller binary)
  --enable-gray            enable full grayscale support (slower color)
  --disable-swscale-alpha  disable alpha channel support in swscale
  --disable-all            disable building components, libraries and programs
  --disable-autodetect     disable automatically detected external libraries [no]

Program options:
#我们不需要使用程序，不需要在Windows中执行，某.exe程序，我们只需要在代码中使用  [此命令操作的是下面三项]
  --disable-programs       do not build command line programs
  #使用FFmpeg命令
  --disable-ffmpeg         disable ffmpeg build
  #播放器
  --disable-ffplay         disable ffplay build
  --disable-ffprobe        disable ffprobe build

Documentation options:
  --disable-doc            do not build documentation
  --disable-htmlpages      do not build HTML documentation pages
  --disable-manpages       do not build man documentation pages
  --disable-podpages       do not build POD documentation pages
  --disable-txtpages       do not build text documentation pages

#模块选项
Component options:
#可以操控我们的摄像头-（Android中是不支持））
  --disable-avdevice       disable libavdevice build
#audio video codec(编码 和 解码)
  --disable-avcodec        disable libavcodec build
#音视频格式生成和解析相关
  --disable-avformat       disable libavformat build
#音频重采样（如果想把单声道，变成双声道）
  --disable-swresample     disable libswresample build
#对视频显示相关（对视频的缩放，放大 缩小）
  --disable-swscale        disable libswscale build
#后期处理，很少用，可以关闭掉
  --disable-postproc       disable libpostproc build
#给视频加水印，加字幕，特殊效果
  --disable-avfilter       disable libavfilter build
  --enable-avresample      enable libavresample build (deprecated) [no]
  --disable-pthreads       disable pthreads [autodetect]
  --disable-w32threads     disable Win32 threads [autodetect]
  --disable-os2threads     disable OS/2 threads [autodetect]
  --disable-network        disable network support [no]
  --disable-dct            disable DCT code
  --disable-dwt            disable DWT code
  --disable-error-resilience disable error resilience code
  --disable-lsp            disable LSP code
  --disable-lzo            disable LZO decoder code
  --disable-mdct           disable MDCT code
  --disable-rdft           disable RDFT code
  --disable-fft            disable FFT code
  --disable-faan           disable floating point AAN (I)DCT code
  --disable-pixelutils     disable pixel utils in libavutil

Individual component options:
  --disable-everything     disable all components listed below
  --disable-encoder=NAME   disable encoder NAME
  --enable-encoder=NAME    enable encoder NAME
#编码可以去关闭掉
  --disable-encoders       disable all encoders
  --disable-decoder=NAME   disable decoder NAME
  --enable-decoder=NAME    enable decoder NAME
  --disable-decoders       disable all decoders
  --disable-hwaccel=NAME   disable hwaccel NAME
  --enable-hwaccel=NAME    enable hwaccel NAME
  --disable-hwaccels       disable all hwaccels
  --disable-muxer=NAME     disable muxer NAME
  --enable-muxer=NAME      enable muxer NAME
  #混合封装（音视频等于 一段音频 一段视频 合并在一起 就是.mp4，不想这样就可以关闭）
  --disable-muxers         disable all muxers
  --disable-demuxer=NAME   disable demuxer NAME
  --enable-demuxer=NAME    enable demuxer NAME
  --disable-demuxers       disable all demuxers
  --enable-parser=NAME     enable parser NAME
  --disable-parser=NAME    disable parser NAME
  --disable-parsers        disable all parsers
  --enable-bsf=NAME        enable bitstream filter NAME
  --disable-bsf=NAME       disable bitstream filter NAME
  --disable-bsfs           disable all bitstream filters
  --enable-protocol=NAME   enable protocol NAME
  --disable-protocol=NAME  disable protocol NAME
  --disable-protocols      disable all protocols
  --enable-indev=NAME      enable input device NAME
  --disable-indev=NAME     disable input device NAME
  --disable-indevs         disable input devices
  --enable-outdev=NAME     enable output device NAME
  --disable-outdev=NAME    disable output device NAME
  --disable-outdevs        disable output devices
  --disable-devices        disable all devices
  --enable-filter=NAME     enable filter NAME
  --disable-filter=NAME    disable filter NAME
  --disable-filters        disable all filters
...

```

### 编写 32/64 位 FFmpeg4.2.2 shell 脚本

####ndk20b+ffmpeg4.2.2 clang 编译脚本

```shell
#!/bin/bash

echo ">>>>>>>>> 编译硬件解码版本 <<<<<<<<"
echo ">>>>>>>>> 注意：该编译环境目前只在 NDK20b + ffmpeg4.2.2 测试过 <<<<<<<<"
echo ">>>>>>>>> 注意：该编译环境目前只在 NDK20b + ffmpeg4.2.2 测试过 <<<<<<<<"

#你自己的NDK路径.
export NDK=/root/android/ndk/android-ndk-r20b
TOOLCHAIN=$NDK/toolchains/llvm/prebuilt/linux-x86_64


function build_android
{


echo "开始编译 $CPU"

./configure \
--prefix=$PREFIX \
--enable-neon  \
--enable-hwaccels  \
--enable-gpl   \
--enable-postproc \
--enable-shared \
--disable-debug \
--enable-small \
--enable-jni \
--enable-mediacodec \
--enable-decoder=h264_mediacodec \
--disable-static \
--disable-doc \
--enable-ffmpeg \
--disable-ffplay \
--disable-ffprobe \
--disable-avdevice \
--disable-doc \
--disable-symver \
--cross-prefix=$CROSS_PREFIX \
--target-os=android \
--arch=$ARCH \
--cpu=$CPU \
--cc=$CC \
--cxx=$CXX \
--enable-cross-compile \
--sysroot=$SYSROOT \
--extra-cflags="-Os -fpic $OPTIMIZE_CFLAGS" \
--extra-ldflags="$ADDI_LDFLAGS"


make clean
make
make install

echo "编译成功 $CPU"

}

#armv8-a
ARCH=arm64
CPU=armv8-a
API=21
CC=$TOOLCHAIN/bin/aarch64-linux-android$API-clang
CXX=$TOOLCHAIN/bin/aarch64-linux-android$API-clang++
SYSROOT=$NDK/toolchains/llvm/prebuilt/linux-x86_64/sysroot
CROSS_PREFIX=$TOOLCHAIN/bin/aarch64-linux-android-
PREFIX=$(pwd)/android/$CPU
OPTIMIZE_CFLAGS="-march=$CPU"

build_android

#armv7-a
ARCH=arm
CPU=armv7-a
API=16
CC=$TOOLCHAIN/bin/armv7a-linux-androideabi$API-clang
CXX=$TOOLCHAIN/bin/armv7a-linux-androideabi$API-clang++
SYSROOT=$NDK/toolchains/llvm/prebuilt/linux-x86_64/sysroot
CROSS_PREFIX=$TOOLCHAIN/bin/arm-linux-androideabi-
PREFIX=$(pwd)/android/$CPU
OPTIMIZE_CFLAGS="-mfloat-abi=softfp -mfpu=vfp -marm -march=$CPU "

build_android

```



####**ndk17c + ffmpeg4.2.2 gcc编译脚本**

```shell
#!/bin/bash

echo ">>>>>>>>> 编译软件解码版本 <<<<<<<<"
echo ">>>>>>>>> 注意：该编译环境目前只在 NDK17c + ffmpeg4.2.2 测试过 <<<<<<<<"
echo ">>>>>>>>> 注意：该编译环境目前只在 NDK17c + ffmpeg4.2.2 测试过 <<<<<<<<"

#NDK_ROOT 变量指向 ndk 目录
NDK_ROOT=$NDK_HOME
#指定android api版本
ANDROID_API=21


#开始编译 在下面调用传入参数即可
function build_ffmpeg
{
echo "开始编译 $PREFIX_CPU"
echo "开始编译 $PREFIX"
echo "开始编译 $TOOLCHAIN"

./configure \
--prefix=$PREFIX \
--disable-doc \
--disable-yasm \
--disable-asm \
--disable-symver \
--enable-gpl \
--disable-ffplay \
--disable-ffmpeg \
--disable-ffprobe \
--enable-small \
--disable-programs \
--disable-avdevice \
--disable-encoders \
--disable-muxers \
--disable-filters \
--enable-cross-compile \
--cross-prefix=$CROSS_PREFIX \
--disable-shared \
--enable-static \
--sysroot=$NDK_ROOT/platforms/android-$ANDROID_API/arch-$ARCH \
--extra-cflags="$CFLAGES" \
--arch=$ARCH \
--target-os=android

#上面运行脚本生成makefile之后，使用make执行脚本
make clean
make
make install

echo "$PREFIX_CPU 编译完成"
echo "$PREFIX_CPU 编译完成"
echo "$PREFIX_CPU 编译完成"
}

#armeabi-v7a
PREFIX=./result/armeabi-v7a
TOOLCHAIN=$NDK_ROOT/toolchains/arm-linux-androideabi-4.9/prebuilt/linux-x86_64
ARCH=arm
CROSS_PREFIX=$TOOLCHAIN/bin/arm-linux-androideabi-
CFLAGES="-isysroot $NDK_ROOT/sysroot -isystem $NDK_ROOT/sysroot/usr/include/arm-linux-androideabi -D__ANDROID_API__=$ANDROID_API -U_FILE_OFFSET_BITS  -DANDROID -ffunction-sections -funwind-tables -fstack-protector-strong -no-canonical-prefixes -march=armv7-a -mfloat-abi=softfp -mfpu=vfpv3-d16 -mthumb -Wa,--noexecstack -Wformat -Werror=format-security  -O0 -fPIC"

build_ffmpeg

#arm64-v8a
PREFIX=./result/arm64-v8a
TOOLCHAIN=$NDK_ROOT/toolchains/aarch64-linux-android-4.9/prebuilt/linux-x86_64
ARCH=arm64
CROSS_PREFIX=$TOOLCHAIN/bin/aarch64-linux-android-
CFLAGES="-isysroot $NDK_ROOT/sysroot -isystem $NDK_ROOT/sysroot/usr/include/aarch64-linux-android -D__ANDROID_API__=$ANDROID_API -U_FILE_OFFSET_BITS  -DANDROID -ffunction-sections -funwind-tables -fstack-protector-strong -no-canonical-prefixes -Wa,--noexecstack -Wformat -Werror=format-security  -O0 -fPIC"

build_ffmpeg

#直接跳转到编译完成的路径
cd /result
```



**编译遇见的坑:**

1. arm-linux-androideabi-gcc is unable to create an executable file

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200115101836.png)

   原因 1：
   FFmpeg 4.2.2 版本默认使用了 clang 进行编译

   解决：

   ```shell
   //1. 修改 configure 文件
   vim configure
   //2. 把 默认的 clang 修改为 gcc
   if test "$target_os" = android; then
      # cc_default="clang"
   		 cc_default="gcc"
   fi
   ```

   原因 2：

   检查路径是否正确

2. nasm/yasm not found or too old. Use --disable-x86asm for a crippled build.

   分析：yasm 是汇编编译器，ffmpeg 为了提高效率使用了汇编指令，如 MMX 和 SSE等。

   所以系统中未安装yasm时，就会报上面错误。

   ```shell
   解决错误：安装yasm编译器。安装方法如下：
   
   1）下载：[yasm的下载链接]
   wget http://www.tortall.net/projects/yasm/releases/yasm-1.3.0.tar.gz
   
   2）解压：把下载下来的压缩包进行解压
   tar -zxvf yasm-1.3.0.tar.gz
   
   3）切换路径： 
   cd yasm-1.3.0
   
   4）执行配置： 
   ./configure
   
   5）编译：
   make
   
   6）安装：
   make install
   
   ```

3. 解决 " lib64 libc so 6 version `GLIBC_2 18' not found (required by lib...

   ```shell
   curl -O http://ftp.gnu.org/gnu/glibc/glibc-2.18.tar.gz
   tar zxf glibc-2.18.tar.gz 
   cd glibc-2.18/
   mkdir build
   cd build/
   ../configure --prefix=/usr --disable-profile --enable-add-ons --with-headers=/usr/include --with-binutils=/usr/bin
   
   make 
   make install
   
   安装完成后，查看是否成功
   ll /lib64/libc*
   
   然后可以继续查看 glibc 支持的版本
   strings /lib64/libc.so.6 | grep GLIBC
   
   //------------------------------------------------------------
   //下面可以不用参考，这个是我在升级 glibc 的时候把 libc-2.17.so 给误删除了，导致基本上瘫痪了，可以使用以下命令恢复
   //ll cp 等命令失效请用以下进行软连接   
   LD_PRELOAD=/lib64/libc-2.17.so ln -s /lib64/libc-2.17.so /lib64/libc.so.6
   //如果不小心定义了错误环境变量可以通过以下命令删除
   unset LD_LIBRARY_PATH
   ```

4. config.mak 文件没有生成

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200115101946.png)

   解决：
   执行`./configure --disable-x86asm` 生成 config.mak 文件

   [更多坑错误请点击此处查看](https://www.laoyuyu.me/2019/05/23/android/clang_compile_ffmpeg/)

   错误解决完之后，按下回车键，如果出现如下输出，就开始在编译了:

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200115101504.jpg)

   大概等 10 分钟左右就会编译完成，如下所示就代表编译静态库成功了:

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200115120011.gif)



如果想编译动态库，仅仅修改下参数就行了，如下所示:

```shell
#开启动态库
--enable-shared \
#关闭静态库
--disable-static \
```

压缩:

```
tar -zcvf ffmpeg_android.tar.gz android
```

利用 **FileZill 工具** 从服务器端把编译好的静态文件导出到电脑本地，导出完之后我们就在 AS 中测试编译的 .a 文件是否有误。

5. ERROR: mediacodec requires --enable-jni

   ```shell
   --enable-jni 
   ```

   



## Android 集成交叉编译之后的 FFmpeg 静态库

1. 创建一个 C/C++ 项目的 Android 工程，并把编译好的静态库导入项目中，如下结构:

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200115134201.png)

2. 编写 JNI 代码

   ```c++
   #include <jni.h>
   
   // 有坑，会报错，必须混合编译
   //#include <libavutil/avutil.h>
   
   extern "C" {
   #include <libavutil/avutil.h>
   }
   
   
   /**
    * 拿到 ffmpeg 当前版本
    * @return
    */
   const char *getFFmpegVer() {
       return av_version_info();
   }
   
   extern "C"
   JNIEXPORT jstring JNICALL
   Java_com_devyk_ffmpeg_MainActivity_getFFmpegVersion(JNIEnv *env, jclass type) {
       return env->NewStringUTF(getFFmpegVer());
   }
   ```

3. 编写 CMakeLists.txt 脚本

   ```cmake
   #指定 Cmake 最低版本
   cmake_minimum_required(VERSION 3.4.1)
   
   #找到包含所有的cpp文件
   file(GLOB allCpp *.cpp)
   
   #打印当前 cmakeLists 的路径
   message("当前cmakel路径: ${CMAKE_SOURCE_DIR} \n cpu架构：${CMAKE_ANDROID_ARCH_ABI}")
   
   add_library(
           ffmpeg_lib
   
           SHARED
   
           ${allCpp})
   
   find_library(
           log-lib
   
           log)
   
   # 引入FFmpeg的头文件
   include_directories(${CMAKE_SOURCE_DIR}/include)
   
   # 引入FFmpeg的库文件，设置内部的方式引入，指定库的目录是 -L  指定具体的库-l
   set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -L${CMAKE_SOURCE_DIR}/${CMAKE_ANDROID_ARCH_ABI}")
   
   target_link_libraries(
           ffmpeg_lib
   
           # 具体的库文件，链接到总库
           # 这样写会报错，有坑
           # avcodec avfilter avformat avutil swresample swscale
   
           # 先把有依赖的库，先依赖进来
           avformat avcodec avfilter avutil swresample swscale
   
           ${log-lib})
   ```

4. app/build.gradle 配置

   ```groovy
   apply plugin: 'com.android.application'
   android {
       compileSdkVersion 29
       buildToolsVersion "29.0.2"
     	...
       defaultConfig {
         ...
           externalNativeBuild(){
               cmake{
                   abiFilters "armeabi-v7a" //指定编译为 armeabi-v7a
               }
           }
       }
   ...
       externalNativeBuild(){
           cmake{
             //指定构建 C++ 代码脚本
               path 'src/main/cpp/CMakeLists.txt'
           }
       }
   }
   ...
   ```

5. MainActivity 测试代码

   ```Java
   public class MainActivity extends AppCompatActivity {
   
       static {
           System.loadLibrary("ffmpeg_lib");
       }
   
       @Override
       protected void onCreate(Bundle savedInstanceState) {
           super.onCreate(savedInstanceState);
           setContentView(R.layout.activity_main);
   
           TextView ffmpegVer = findViewById(R.id.ffmpeg_ver);
           ffmpegVer.setText("当前 FFmpeg 版本为:" + getFFmpegVersion());
       }
   
   
       /**
        * @return 返回当前
        */
       public native static String getFFmpegVersion();
   }
   ```

   效果:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200115133808.png)

到这里 FFmpeg 编译及导入 AS 使用已经全部介绍完了，动态库编译及使用需要自己动手去实践了，使用方式都大同小异。

## 总结

在编译 FFmpeg 的时候会出现很多坑，基本上每个版本的 shell 脚本编写都不一样，所以如果对 Shell 不太了解的，建议先去复习一下。

该篇文章下来咱们用到了交叉编译、 Shell 脚本、 JNI 、Cmake 的知识，如果对这些基础还不了解的一定要先去把基础学好。也可以看我之前系列基础文章。

[文章中的代码](https://github.com/yangkun19921001/ndk_study/tree/master/ffmpeg)

## 感谢

- [FFmpeg](https://www.ffmpeg.org/download.html)





