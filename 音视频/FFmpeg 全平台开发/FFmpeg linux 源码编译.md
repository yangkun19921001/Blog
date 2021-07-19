## 下面开始按步骤来

- 第一步,

  如果你已经安装了最新版gcc，gcc-c++，cmake，make的话，请忽略安装这些程序！

  - `yum install autoconf automake bzip2 cmake freetype-devel gcc gcc-c++ git libtool make mercurial pkgconfig zlib-devel harfbuzz-devel`

- 第二步
   `mkdir ~/ffmpeg_sources`



## 升级开发工具



```bash
yum install centos-release-scl -y
yum install devtoolset-7-toolchain -y
scl enable devtoolset-7 bash
```

------

- CMAKE,安装最新版本(非必须，但推荐)

```bash
cd ~/ffmpeg_sources
curl -O -L https://src.fedoraproject.org/lookaside/extras/cmake/cmake-3.13.2.tar.gz/sha512/da095d483326ed379bfc8fa54e95db3426149ab923479a757149a4aed5c90693c0244bc2c9550cf4b64385f5003ee2060fea1698d989ed13bd0198e718c40903/cmake-3.13.2.tar.gz
tar xzvf cmake-3.13.2.tar.gz
cd cmake-3.13.2
./bootstrap --prefix=/usr/local
make
make install

ln -s -f /usr/local/bin/ccmake /usr/bin/
ln -s -f /usr/local/bin/cmake /usr/bin/
ln -s -f /usr/local/bin/ctest /usr/bin/
ln -s -f /usr/local/bin/cpack /usr/bin/
```

- mercurial (hg), 只支持python2.x版本，如果你的系统上安装了多个python版本，且前提条件是在命令行输入python2的时候，执行的是2.x版本的python
  - `whereis hg` 查看hg位置
  - `vi /usr/bin/hg` 进入编辑模式
  - 把第一行代码改成如下: `#!/usr/bin/python2`
  - 保存退出
  - `# hg --version`

```
echo "/usr/local/ffmpeg/lib" >> /etc/ld.so.conf
```

```dart
Mercurial Distributed SCM (version 4.0-rc)
(see https://mercurial-scm.org for more information)

Copyright (C) 2005-2016 Matt Mackall and others
This is free software; see the source for copying conditions. There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
```

- ffplay使用sdl作为窗体，需要先安装SDL2，如果不需要ffplay可以跳过这个步骤！
   `yum install libXext-devel`

```bash
cd ~/ffmpeg_sources
hg clone https://hg.libsdl.org/SDL SDL
cd SDL
mkdir build
cd build
../configure
make && make install
ln -s /usr/local/lib/libSDL2.so /usr/lib64/libSDL2.so
strings /lib64/libSDL2.so | grep GLIBC_
```

- Nasm



```bash
cd ~/ffmpeg_sources
curl -O -L https://www.nasm.us/pub/nasm/releasebuilds/2.14/nasm-2.14.tar.bz2
tar xjvf nasm-2.14.tar.bz2
cd nasm-2.14
./autogen.sh
./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin"
make
make install
```

- Yasm



```bash
cd ~/ffmpeg_sources
curl -O -L http://www.tortall.net/projects/yasm/releases/yasm-1.3.0.tar.gz
tar xzvf yasm-1.3.0.tar.gz
cd yasm-1.3.0
./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin"
make
make install
```

- libx264



```bash
cd ~/ffmpeg_sources
git clone --depth 1 http://git.videolan.org/git/x264
cd x264
PKG_CONFIG_PATH="$HOME/ffmpeg_build/lib/pkgconfig" ./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin" --enable-static
make
make install
```

- libx265



```bash
cd ~/ffmpeg_sources
hg clone https://bitbucket.org/multicoreware/x265
cd ~/ffmpeg_sources/x265/build/linux
cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX="$HOME/ffmpeg_build" -DENABLE_SHARED:bool=off ../../source
make
make install
cp ~/ffmpeg_build/bin/x265 ~/bin/
```

- libfdk_aac



```bash
cd ~/ffmpeg_sources
git clone --depth 1 https://github.com/mstorsjo/fdk-aac
cd fdk-aac
autoreconf -fiv
./configure --prefix="$HOME/ffmpeg_build" --disable-shared
make
make install
```

- libmp3lame



```bash
cd ~/ffmpeg_sources
curl -O -L http://downloads.sourceforge.net/project/lame/lame/3.100/lame-3.100.tar.gz
tar xzvf lame-3.100.tar.gz
cd lame-3.100
./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin" --disable-shared --enable-nasm
make
make install
```

- libopus



```bash
cd ~/ffmpeg_sources
curl -O -L https://archive.mozilla.org/pub/opus/opus-1.3.tar.gz
tar xzvf opus-1.3.tar.gz
cd opus-1.3
./configure --prefix="$HOME/ffmpeg_build" --disable-shared
make
make install
```

- libogg



```bash
cd ~/ffmpeg_sources
curl -O -L http://downloads.xiph.org/releases/ogg/libogg-1.3.3.tar.gz
tar xzvf libogg-1.3.3.tar.gz
cd libogg-1.3.3
./configure --prefix="$HOME/ffmpeg_build" --disable-shared
make
make install
```

- libvorbis



```bash
cd ~/ffmpeg_sources
curl -O -L http://downloads.xiph.org/releases/vorbis/libvorbis-1.3.6.tar.gz
tar xzvf libvorbis-1.3.6.tar.gz
cd libvorbis-1.3.6
./configure --prefix="$HOME/ffmpeg_build" --with-ogg="$HOME/ffmpeg_build" --disable-shared
make
make install
```

- libvpx



```bash
cd ~/ffmpeg_sources
git clone --depth 1 https://chromium.googlesource.com/webm/libvpx.git
cd libvpx
./configure --prefix="$HOME/ffmpeg_build" --disable-examples --disable-unit-tests --enable-vp9-highbitdepth --as=yasm
make
make install
```

- freetype2



```bash
cd ~/ffmpeg_sources
curl -O -L  https://github.com/aseprite/freetype2/archive/VER-2-6-3.tar.gz
tar xzvf VER-2-6-3.tar.gz
cd freetype2-VER-2-6-3
./autogen.sh
./configure --prefix="$HOME/ffmpeg_build" --disable-shared
make
make install
cp ~/ffmpeg_build/bin/freetype-config ~/bin/
```

- FFmpeg



```bash
cd ~/ffmpeg_sources
curl -O -L https://ffmpeg.org/releases/ffmpeg-4.1.tar.bz2
tar xjvf ffmpeg-4.1.tar.bz2
cd ffmpeg-4.1
PATH="$HOME/bin:$PATH" PKG_CONFIG_PATH="$HOME/ffmpeg_build/lib/pkgconfig" ./configure \
  --prefix="$HOME/ffmpeg_build" \
  --pkg-config-flags="--static" \
  --extra-cflags="-I$HOME/ffmpeg_build/include" \
  --extra-ldflags="-L$HOME/ffmpeg_build/lib" \
  --extra-libs=-lpthread \
  --extra-libs=-lm \
  --bindir="$HOME/bin" \
  --enable-gpl \
  --enable-libfdk_aac \
  --enable-libfreetype \
  --enable-libmp3lame \
  --enable-libopus \
  --enable-libvorbis \
  --enable-libvpx \
  --enable-libx264 \
  --enable-libx265 \
  --enable-nonfree

make
make install
```

- `# ffmpeg -version` 查看版本



```bash
ffmpeg version 4.1 Copyright (c) 2000-2018 the FFmpeg developers
built with gcc 4.8.5 (GCC) 20150623 (Red Hat 4.8.5-36)
configuration: --prefix=/root/ffmpeg_build --pkg-config-flags=--static --extra-cflags=-I/root/ffmpeg_build/include --extra-ldflags=-L/root/ffmpeg_build/lib --extra-libs=-lpthread --extra-libs=-lm --bindir=/root/bin --enable-gpl --enable-libfdk_aac --enable-libfreetype --enable-libmp3lame --enable-libopus --enable-libvorbis --enable-libvpx --enable-libx264 --enable-libx265 --enable-nonfree
libavutil      56. 22.100 / 56. 22.100
libavcodec     58. 35.100 / 58. 35.100
libavformat    58. 20.100 / 58. 20.100
libavdevice    58.  5.100 / 58.  5.100
libavfilter     7. 40.101 /  7. 40.101
libswscale      5.  3.100 /  5.  3.100
libswresample   3.  3.100 /  3.  3.100
libpostproc    55.  3.100 / 55.  3.100
```

> 本文章参考地址 https://trac.ffmpeg.org/wiki/CompilationGuide/Centos

