##ffmpeg-4.2.2编译参数-中文

### 帮助选项:

```shell
  --help                           打印此消息
  --quiet                          抑制显示信息输出
  --list-decoders                  显示所有可用的解码器
  --list-encoders                  显示所有可用的编码器
  --list-hwaccels                  显示所有可用的硬件加速器
  --list-demuxers                  显示所有可用的demuxer
  --list-muxers                    显示所有可用的muxer
  --list-parsers                   显示所有可用的解析器
  --list-protocols                 显示所有可用的协议
  --list-bsfs                      显示所有可用的位流过滤器
  --list-indevs                    显示所有可用的输入设备
  --list-outdevs                   显示所有可用的输出设备
  --list-filters                   显示所有可用的过滤器

```



### 标准选项:

```shell
  --logfile=FILE                   日志测试和输出到文件[ffbuild/config.log]
  --disable-logging                不记录配置调试信息
  --fatal-warnings                 如果生成配置警告，则失败
  --prefix=PREFIX                  安装在前缀[/usr/local]
  --bindir=DIR                     在DIR [PREFIX/bin]中安装二进制文件
  --datadir=DIR                    在DIR [PREFIX/share/ffmpeg]中安装数据文件
  --docdir=DIR                     在DIR [PREFIX/share/doc/ffmpeg]中安装文档
  --libdir=DIR                     在DIR [PREFIX/lib]中安装libs
  --shlibdir=DIR                   在DIR [LIBDIR]中安装共享库
  --incdir=DIR                     安装包含在DIR [PREFIX/include]
  --mandir=DIR                     在目录[PREFIX/share/man]中安装手册页
  --pkgconfigdir=DIR               在DIR [LIBDIR/pkgconfig]中安装pkg-config文件
  --enable-rpath                   使用rpath允许在不属于动态链接器搜索路径的路径上安装库
  --install-name-dir=DIR           已安装目标的达尔文目录名

```



### 授权选项:

```shell
  --enable-gpl                     允许使用GPL代码，生成的库和二进制文件将在GPL 【默认-否】下
  --enable-version3                将(L)GPL升级到版本3 【默认-否】
  --enable-nonfree                 如果允许使用非自由代码，生成的库和二进制文件将是不可重新分发的【默认-否】

```



### 配置选项:

```shell
  --disable-static                 不要构建静态库[否]
  --enable-shared                  构建共享库【默认-否】
  --enable-small                   优化大小而不是速度
  --disable-runtime-cpudetect      在运行时禁用CPU检测功能(较小的二进制)
  --enable-gray                    启用全灰度支持(较慢的颜色)
  --disable-swscale-alpha          在swscale中禁用alpha通道支持
  --disable-all                    禁用构建组件、库和程序
  --disable-autodetect             禁用自动检测到的外部库【默认-否】

```



### 程序选项：

```shell
  --disable-programs               不构建命令行程序
  --disable-ffmpeg                 禁用ffmpeg构建
  --disable-ffplay                 禁用ffplay构建
  --disable-ffprobe                禁用ffprobe构建

```



### 文档选项:

```shell
  --disable-doc                    不要构建文档
  --disable-htmlpages              不构建HTML文档页面
  --disable-manpages               不构建man文档页面
  --disable-podpages               不构建POD文档页面
  --disable-txtpages               不构建文本文档页面

```



### 组件选项：

```shell
  --disable-avdevice               禁用libavdevice构建
  --disable-avcodec                禁用libavcodec构建
  --disable-avformat               禁用libavformat构建
  --disable-swresample             禁用libswresample构建
  --disable-swscale                禁用libswscale构建
  --disable-postproc               禁用libpostproc构建
  --disable-avfilter               禁用libavfilter构建
  --enable-avresample              启用libavresample build(已弃用)[否]
  --disable-pthreads               禁用pthreads(自动检测)
  --disable-w32threads             禁用Win32线程[自动检测]
  --disable-os2threads             禁用OS/2线程[自动检测]
  --disable-network                禁用网络支持[否]
  --disable-dct                    禁用DCT编码
  --disable-dwt                    禁用DWT代码
  --disable-error-resilience       禁用错误恢复码
  --disable-lsp                    禁用LSP代码
  --disable-lzo                    禁用LZO解码器代码
  --disable-mdct                   禁用多层螺旋ct的代码
  --disable-rdft                   禁用RDFT代码
  --disable-fft                    禁用FFT代码
  --disable-faan                   禁用浮点AAN (I)DCT代码
  --disable-pixelutils             在libavutil中禁用像素utils

```



### 单个组件选项:

```shell
  --disable-everything             禁用下面列出的所有组件
  --disable-encoder=NAME           禁用编码器的名字
  --enable-encoder=NAME            使编码器的名字
  --disable-encoders               禁用所有编码器
  --disable-decoder=NAME           禁用解码器的名字
  --enable-decoder=NAME            使解码器的名字
  --disable-decoders               禁用所有解码器
  --disable-hwaccel=NAME           禁用hwaccel名字
  --enable-hwaccel=NAME            使hwaccel名字
  --disable-hwaccels               禁用所有hwaccels
  --disable-muxer=NAME             禁用mux的名字
  --enable-muxer=NAME              使mux的名字
  --disable-muxers                 禁用所有muxers
  --disable-demuxer=NAME           禁用多路分配器的名字
  --enable-demuxer=NAME            支持多路分配器的名字
  --disable-demuxers               禁用所有demuxers
  --enable-parser=NAME             使解析器名称
  --disable-parser=NAME            禁用解析器名称
  --disable-parsers                禁用所有解析器
  --enable-bsf=NAME                启用位流过滤器名称
  --disable-bsf=NAME               禁用位流过滤器名称
  --disable-bsfs                   禁用所有位流过滤器
  --enable-protocol=NAME           使协议名称
  --disable-protocol=NAME          禁用协议名称
  --disable-protocols              禁用所有协议
  --enable-indev=NAME              启用输入设备名称
  --disable-indev=NAME             禁用输入设备名称
  --disable-indevs                 禁用输入设备
  --enable-outdev=NAME             启用输出设备名称
  --disable-outdev=NAME            禁用输出设备名称
  --disable-outdevs                禁用输出设备
  --disable-devices                禁用所有设备
  --enable-filter=NAME             使滤波器的名字
  --disable-filter=NAME            禁用过滤的名字
  --disable-filters                禁用所有过滤器

```



### 外部库支持:

使用下列任何一个开关将允许FFmpeg链接到相应的外部库。所有的组件都依赖于那个库将成为启用，如果他们的所有其他依赖项都满足，而他们没有显式禁用。 例如:enable-libwavpack将支持链接到libwavpack并允许构建libwavpack编码器，除非它是具体禁用——disable encoder=libwavpack。



> 注意，只有系统库是自动检测的。所有外部的必须显式地启用库。 还要注意，下面的帮助文本描述了这些库的用途FFmpeg不一定能够使用它们的所有特性。

```shell
  --disable-alsa                  禁用ALSA支持[自动检测]
  --disable-appkit                禁用Apple AppKit框架[自动检测]
  --disable-avfoundation          禁用Apple AVFoundation框架[自动检测]
  --enable-avisynth               允许读取AviSynth脚本文件【默认-否】
  --disable-bzlib                 禁用bzlib(自动检测)
  --disable-coreimage             禁用Apple CoreImage框架[自动检测]
  --enable-chromaprint            启用音频指纹与chromaprint 【默认-否】
  --enable-frei0r                 启用frei0r视频过滤功能[否]
  --enable-gcrypt                 启用gcrypt，如果没有使用openssl、librtmp或gmp，则需要启用rtmp(t)e支持【默认-否】
  --enable-gmp                    启用gmp，如果没有使用openssl或librtmp，则需要rtmp(t)e支持【默认-否】
  --enable-gnutls                 启用gnutls，如果不使用openssl、libtls或mbedtls，则需要https支持【默认-否】
  --disable-iconv                 禁用iconv(自动检测)
  --enable-jni                    启用JNI支持【默认-否】
  --enable-ladspa                 启用LADSPA音频过滤【默认-否】
  --enable-libaom                 通过libaom实现AV1视频编码/解码【默认-否】
  --enable-libaribb24             通过libaribb24 【默认-否】启用ARIB文本和字幕解码
  --enable-libass                 启用字幕渲染，需要字幕和ass过滤器【默认-否】
  --enable-libbluray              使用libbluray 【默认-否】启用BluRay阅读
  --enable-libbs2b                启用bs2b DSP库【默认-否】
  --enable-libcaca                使用libcaca 【默认-否】启用文本显示
  --enable-libcelt                通过libcelt启用CELT解码【默认-否】
  --enable-libcdio                启用libcdio的音频光盘抓取功能【默认-否】
  --enable-libcodec2              启用codec2 en/解码使用libcodec2 【默认-否】
  --enable-libdav1d               通过libdav1d 【默认-否】启用AV1解码
  --enable-libdavs2               通过libdavs2 【默认-否】启用AVS2解码
  --enable-libdc1394              启用IIDC-1394抓取使用libdc1394和libraw1394 【默认-否】
  --enable-libfdk-aac             通过libfdk-aac 【默认-否】启用AAC de/编码
  --enable-libflite               通过libflite启用flite(语音合成)支持【默认-否】
  --enable-libfontconfig          启用libfontconfig，对drawtext过滤器很有用【默认-否】
  --enable-libfreetype            启用libfreetype，用于drawtext过滤器【默认-否】
  --enable-libfribidi             启用libfribidi，改进drawtext过滤器【默认-否】
  --enable-libgme                 通过libgme启用游戏音乐Emu 【默认-否】
  --enable-libgsm                 通过libgsm 【默认-否】启用GSM de/编码
  --enable-libiec61883            通过libiec61883 【默认-否】启用iec61883
  --enable-libilbc                通过libilbc启用iLBC de/编码【默认-否】
  --enable-libjack                启用JACK audio sound server 【默认-否】
  --enable-libklvanc              启用内核实验室VANC处理【默认-否】
  --enable-libkvazaar             通过libkvazaar 【默认-否】启用HEVC编码
  --enable-liblensfun             启用lensfun镜头校正功能【默认-否】
  --enable-libmodplug             通过libmodplug 【默认-否】启用ModPlug
  --enable-libmp3lame             通过libmp3lame 【默认-否】启用MP3编码
  --enable-libopencore-amrnb      通过libopencore-amrnb 【默认-否】启用AMR-NB de/编码
  --enable-libopencore-amrwb      通过libopencore-amrwb启用AMR-WB解码【默认-否】
  --enable-libopencv              通过libopencv 【默认-否】启用视频过滤
  --enable-libopenh264            通过OpenH264 【默认-否】实现H.264编码
  --enable-libopenjpeg            通过OpenJPEG启用jpeg2000 de/编码【默认-否】
  --enable-libopenmpt             通过libopenmpt 【默认-否】启用解码跟踪文件
  --enable-libopus                通过libopus 【默认-否】启用Opus de/编码
  --enable-libpulse               通过libpulse 【默认-否】启用Pulseaudio输入
  --enable-librsvg                通过librsvg 【默认-否】启用SVG栅格化
  --enable-librubberband          橡胶带过滤器所需的橡胶带使能【默认-否】
  --enable-librtmp                通过librtmp 【默认-否】启用RTMP[E]支持
  --enable-libshine               通过libshine 【默认-否】启用定点MP3编码
  --enable-libsmbclient           通过libsmbclient 【默认-否】启用Samba协议
  --enable-libsnappy              启用Snappy压缩，hap编码需要【默认-否】
  --enable-libsoxr                enable Include libsoxr重新采样【默认-否】
  --enable-libspeex               通过libspeex 【默认-否】启用Speex de/编码
  --enable-libsrt                 通过libsrt 【默认-否】启用Haivision SRT协议
  --enable-libssh                 通过libssh启用SFTP协议【默认-否】
  --enable-libtensorflow          启用TensorFlow作为DNN模块后端，用于基于DNN的过滤器，如sr 【默认-否】
  --enable-libtesseract           启用Tesseract, ocr过滤器所需【默认-否】
  --enable-libtheora              通过libtheora 【默认-否】启用Theora编码
  --enable-libtls                 启用LibreSSL(通过libtls)，如果不使用openssl、gnutls或mbedtls，则需要https支持【默认-否】
  --enable-libtwolame             通过libtwolame 【默认-否】启用MP2编码
  --enable-libv4l2                启用libv4l2 / v4l-utils(没有)
  --enable-libvidstab             启用视频稳定使用vid。刺(没有)
  --enable-libvmaf                通过libvmaf 【默认-否】启用vmaf过滤器
  --enable-libvo-amrwbenc         通过libvo-amrwbenc实现AMR-WB编码【默认-否】
  --enable-libvorbis              通过libvorbis启用Vorbis en/解码，本机实现存在【默认-否】
  --enable-libvpx                 通过libvpx 【默认-否】启用VP8和VP9 de/编码
  --enable-libwavpack             通过libwavpack 【默认-否】启用wavpack编码
  --enable-libwebp                通过libwebp 【默认-否】启用WebP编码
  --enable-libx264                通过x264实现H.264编码【默认-否】
  --enable-libx265                通过x265 【默认-否】启用HEVC编码
  --enable-libxavs                通过xavs启用AVS编码【默认-否】
  --enable-libxavs2               通过xavs2启用AVS2编码【默认-否】
  --enable-libxcb                 启用X11抓取使用XCB[自动检测]
  --enable-libxcb-shm             启用X11抓取shm通信[自动检测]
  --enable-libxcb-xfixes          启用X11抓取鼠标渲染[自动检测]
  --enable-libxcb-shape           启用X11抓取形状渲染[自动检测]
  --enable-libxvid                启用Xvid编码通过xvidcore，本地MPEG-4/Xvid编码器存在【默认-否】
  --enable-libxml2                使用C库libxml2启用XML解析，这是dash demuxing支持所必需的【默认-否】
  --enable-libzimg                使z。zscale filter需要lib 【默认-否】
  --enable-libzmq                 启用通过libzmq传递的消息【默认-否】
  --enable-libzvbi                通过libzvbi 【默认-否】启用对teletext的支持
  --enable-lv2                    启用LV2音频过滤[否]
  --disable-lzma                  禁用lzma(自动检测)
  --enable-decklink               启用Blackmagic DeckLink I/O支持【默认-否】
  --enable-mbedtls                启用mbedTLS，如果不使用openssl、gnutls或libtls，则需要https支持【默认-否】
  --enable-mediacodec             启用Android MediaCodec支持【默认-否】
  --enable-libmysofa              启用libmysofa，需要软过滤器【默认-否】
  --enable-openal                 启用OpenAL 1.1捕获支持【默认-否】
  --enable-opencl                 启用OpenCL处理【默认-否】
  --enable-opengl                 启用OpenGL渲染【默认-否】
  --enable-openssl                启用openssl，如果不使用gnutls、libtls或mbedtls，则需要https支持【默认-否】
  --enable-pocketsphinx           启用PocketSphinx，需要asr过滤器【默认-否】
  --disable-sndio                 禁用sndio支持[自动检测]
  --disable-schannel              禁用SChannel SSP，如果没有使用openssl和gnutls，则需要在Windows上支持TLS[自动检测]
  --disable-sdl2                  禁用sdl2(自动检测)
  --disable-securetransport       禁用安全传输，如果没有使用openssl和gnutls, OSX上的TLS支持需要禁用安全传输[自动检测]
  --enable-vapoursynth            启用VapourSynth demuxer 【默认-否】
  --disable-xlib                  禁用xlib(自动检测)
  --disable-zlib                  禁用zlib(自动检测)

```



### 下列库提供各种硬件加速功能:

```shell
  --disable-amf                   禁用AMF视频编码代码[自动检测]
  --disable-audiotoolbox          禁用Apple AudioToolbox代码[自动检测]
  --enable-cuda-nvcc              启用Nvidia CUDA编译器【默认-否】
  --disable-cuda-llvm             使用clang[自动检测]禁用CUDA编译
  --disable-cuvid                 禁用Nvidia CUVID支持[自动检测]
  --disable-d3d11va               禁用微软Direct3D 11视频加速代码[自动检测]
  --disable-dxva2                 禁用微软DirectX 9视频加速代码[自动检测]
  --disable-ffnvcodec             禁用动态链接的Nvidia代码[自动检测]
  --enable-libdrm                 启用DRM代码(Linux)[否]
  --enable-libmfx                 通过libmfx启用Intel MediaSDK(即快速同步视频)代码【默认-否】
  --enable-libnpp                 启用基于Nvidia性能原语的代码【默认-否】
  --enable-mmal                   通过MMAL 【默认-否】启用Broadcom多媒体抽象层(Raspberry Pi)
  --disable-nvdec                 禁用Nvidia视频解码加速(通过hwaccel)[自动检测]
  --disable-nvenc                 禁用Nvidia视频编码代码[自动检测]
  --enable-omx                    启用OpenMAX IL代码【默认-否】
  --enable-omx-rpi                启用树莓派OpenMAX IL代码【默认-否】
  --enable-rkmpp                  启用瑞芯微媒体处理平台代码【默认-否】
  --disable-v4l2-m2m              禁用V4L2 mem2mem代码[自动检测]
  --disable-vaapi                 禁用视频加速API(主要是Unix/Intel)代码[自动检测]
  --disable-vdpau                 禁用Nvidia视频解码和Unix代码演示API[自动检测]
  --disable-videotoolbox          禁用视频工具箱代码[自动检测]

```



### Toolchain options:

```shell
  --arch=ARCH                     选择架构[]
  --cpu=CPU                       选择所需的最小CPU(影响指令选择，可能在旧的CPU上崩溃)
  --cross-prefix=PREFIX           使用编译工具的前缀[]
  --progs-suffix=SUFFIX           程序名后缀[]
  --enable-cross-compile          假设使用了交叉编译器
  --sysroot=PATH                  交叉构建树的根
  --sysinclude=PATH               交叉构建系统头的位置
  --target-os=OS                  编译器目标OS []
  --target-exec=CMD               命令在目标上运行可执行文件
  --target-path=DIR               到目标上的生成目录视图的路径
  --target-samples=DIR            指向目标上的示例目录的路径
  --tempprefix=PATH               强制固定目录/前缀，而不是mktemp检查
  --toolchain=NAME                根据名称设置工具默认值(gcc-asan, clang-asan, gcc-msan, clang-msan, gcc-tsan, clang-tsan, gcc-usan, clang-usan, valgrind-massif, valgrind-memcheck, msvc, icl, gcov, llvm-cov，)——nm= nm使用nm工具nm [nm -g]
  --ar=AR                         使用档案工具AR [AR]
  --as=AS                         使用汇编程序作为[]
  --ln_s=LN_S                     使用符号链接工具LN_S [ln -s -f]
  --strip=STRIP                   带材刀具带[带材]
  --windres=WINDRES               使用windows资源编译器
  --x86asmexe=EXE                 使用nasm兼容的汇编程序EXE [nasm]
  --cc=CC                         使用C编译器CC [gcc]
  --cxx=CXX                       使用C编译器CXX [g++]
  --objcc=OCC                     使用ObjC编译器OCC [gcc]
  --dep-cc=DEPCC                  使用依赖生成器DEPCC [gcc]
  --nvcc=NVCC                     使用Nvidia CUDA编译器NVCC或clang []
  --ld=LD                         使用链接器LD []
  --pkg-config=PKGCONFIG          使用pkg-config工具PKGCONFIG [pkg-config]
  --pkg-config-flags=FLAGS        传递额外的标志到pkgconf []
  --ranlib=RANLIB                 使用ranlib [ranlib]
  --doxygen=DOXYGEN               使用DOXYGEN生成API doc [DOXYGEN]
  --host-cc=HOSTCC                使用主机C编译器HOSTCC
  --host-cflags=HCFLAGS           在为主机编译时使用HCFLAGS
  --host-cppflags=HCPPFLAGS       在为主机编译时使用HCPPFLAGS
  --host-ld=HOSTLD                使用主机链接器HOSTLD
  --host-ldflags=HLDFLAGS         在链接主机时使用HLDFLAGS
  --host-extralibs=HLIBS          当连接主机时使用libs HLIBS
  --host-os=OS                    编译器宿主OS []
  --extra-cflags=ECFLAGS          向CFLAGS[]添加ECFLAGS
  --extra-cxxflags=ECFLAGS        向CXXFLAGS[]添加ECFLAGS
  --extra-objcflags=FLAGS         向OBJCFLAGS[]添加标志
  --extra-ldflags=ELDFLAGS        将ELDFLAGS添加到LDFLAGS []
  --extra-ldexeflags=ELDFLAGS     将ELDFLAGS添加到LDEXEFLAGS []
  --extra-ldsoflags=ELDFLAGS      将ELDFLAGS添加到LDSOFLAGS []
  --extra-libs=ELIBS              添加ELIBS []
  --extra-version=STRING          版本字符串后缀[]
  --optflags=OPTFLAGS             覆盖与优化相关的编译器标志
  --nvccflags=NVCCFLAGS           覆盖nvcc标志[]
  --build-suffix=SUFFIX           库名后缀[]
  --enable-pic                    构建位置无关代码
  --enable-thumb                  编译拇指指令集
  --enable-lto                    使用链接时优化
  --env="ENV=override"            覆盖环境变量

```



### 高级选项(仅限专家):

```shell
  --malloc-prefix=PREFIX          前缀malloc和具有前缀的相关名称
  --custom-allocator=NAME         使用受支持的自定义分配器
  --disable-symver                禁用符号版本控制
  --enable-hardcoded-tables       使用硬编码表而不是运行时生成
  --disable-safe-bitstream-reader 禁用位读取器中的缓冲区边界检查(更快，但可能崩溃)
  --sws-max-filter-size=N         swscale使用的最大过滤尺寸[256]

```



### 优化选项:

```shell
  --disable-asm                   禁用所有程序集优化
  --disable-altivec               禁用AltiVec优化
  --disable-vsx                   禁用VSX优化
  --disable-power8                禁用POWER8优化
  --disable-amd3dnow              禁用3DNow !优化
  --disable-amd3dnowext           禁用3DNow !扩展优化
  --disable-mmx                   禁用MMX优化
  --disable-mmxext                禁用MMXEXT优化
  --disable-sse                   禁用SSE优化
  --disable-sse2                  禁用SSE2优化
  --disable-sse3                  禁用SSE3优化
  --disable-ssse3                 禁用SSSE3优化
  --disable-sse4                  禁用SSE4优化
  --disable-sse42                 禁用SSE4.2优化
  --disable-avx                   禁用AVX优化
  --disable-xop                   禁用XOP优化
  --disable-fma3                  禁用FMA3优化
  --disable-fma4                  禁用FMA4优化
  --disable-avx2                  禁用AVX2优化
  --disable-avx512                禁用AVX-512优化
  --disable-aesni                 禁用AESNI优化
  --disable-armv5te               禁用armv5te优化
  --disable-armv6                 禁用armv6优化
  --disable-armv6t2               禁用armv6t2优化
  --disable-vfp                   禁用VFP优化
  --disable-neon                  禁用霓虹灯优化
  --disable-inline-asm            禁用内联组件的使用
  --disable-x86asm                禁用独立的x86组装
  --disable-mipsdsp               禁用MIPS DSP ASE R1优化
  --disable-mipsdspr2             禁用MIPS DSP酶R2优化
  --disable-msa                   禁用MSA优化
  --disable-msa2                  禁用MSA2优化
  --disable-mipsfpu               禁用浮点MIPS优化
  --disable-mmi                   禁用Loongson SIMD优化
  --disable-fast-unaligned        考虑不结盟的访问速度缓慢

```



### 开发者选项(在FFmpeg上工作时有用):

```shell
  --disable-debug                 禁用调试符号
  --enable-debug=LEVEL            设置调试级别[]
  --disable-optimizations         禁用编译器优化
  --enable-extra-warnings         启用更多编译器警告
  --disable-stripping             禁用可执行文件和共享库的剥离
  --assert-level=level            0(默认值)，1或2，断言测试量，2导致运行时的减速。
  --enable-memory-poisoning       用任意数据填充堆未初始化的分配空间
  --valgrind=VALGRIND             使用指定的valgrind二进制文件，通过valgrind运行“make fate”测试，以检测内存泄漏和错误。不能与-target-exec组合
  --enable-ftrapv                 陷阱算术溢出
  --samples=PATH                  测试样本的位置，如果没有设置，请在make调用时使用$FATE_SAMPLES。
  --enable-neon-clobber-test      检查霓虹灯寄存器是否具有重击功能(仅用于调试目的)
  --enable-xmm-clobber-test       检查XMM寄存器是否为clobbering(仅适用于win64;应该仅用于调试目的)
  --enable-random                 随机启用/禁用组件
  --disable-random
  --enable-random=LIST            随机启用/禁用特定组件或
  --disable-random=LIST           组件组。LIST是一个以逗号分隔的NAME[:PROB]条目列表，其中NAME是一个组件(组)，PROB是与NAME关联的概率(默认为0.5)。
  --random-seed=VALUE             种子值——enable/disable-random
  --disable-valgrind-backtrace    不要在Valgrind下打印一个回溯(只适用于——disable-optimizations)
  --enable-ossfuzz                启用建筑物模糊工具
  --libfuzzer=PATH                路径libfuzzer
  --ignore-tests=TESTS            忽略结果的测试的逗号分隔列表(名称中没有“fate-”前缀)
  --enable-linux-perf             启用Linux性能监视器API

```

