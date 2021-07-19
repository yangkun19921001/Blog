## 简介

上一篇咱们在 **MAC OS** 平台下搭建了 QT 和 FFmpeg 开发环境，该篇主要介绍如何在 **Linux** 平台下搭建 QT 和 FFmpeg 开发环境，MAC OS 平台下环境搭建可以参考上一篇文章 [跨平台播放器开发 (一) QT for MAC OS & FFmpeg 环境搭建](https://mp.weixin.qq.com/s/-oL-Xlw0ZAI6gEtJ2OGQzA)

## 环境准备

由于我自己用的是 MAC 电脑，所以如果想在 Linux 或者是 Win 上面想跑代码怎么办，只能装一个虚拟机了。可以参考该篇文章 [给mac装个 vmware 虚拟机](https://snowdreams1006.github.io/tools/mac-install-vmware.html)

###Linux

**进入 [QT 官网](https://www.qt.io/zh-cn/supported-platforms-languages)**

从 5.15.0 版本开始 QT 便不再支持离线安装了。所以我们只能通过申请一个账号，在线安装了。

直接点击 **Go open source** -> **Download the Qt Online Installer** 最后会根据自己的系统匹配软件，点击 Download 就可以下载了。

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210529164012.png)

**执行下载下来的软件:**

```shell
chmod +x qt-unified-linux-x64-4.1.1-online.run
./qt-unified-linux-x64-4.1.1-online.run
```

**执行完成之后会有一个安装页面,如下:**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210616222754.png)

跟着指引点击 Next ，

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210616223753.png)

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210616223833.png)

**选择安装路径:**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210616224014.png)





**根据指引安装需要的 SDK**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210616224044.png)

由于我只是在 Linux 平台下跑代码，所以我当前只安装了 QT5/QT6 桌面平台的开发包, 继续点击 Next 按钮等待安装，最后直到出现如下操作，就证明安装成功了，可以启动开发了。

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210529164321)

最后 **QT for Linux  GUI 样式如下:**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210616224543.png)

由于咱们已经在 **MAC OS ** 平台下创建了项目，所以直接通过 git 命令将代码 clone 下来，

```shell
git clone https://github.com/yangkun19921001/QTFFPlayer.git
```

然后编译 **FFmpeg for Linux** 动态库

```shell
#1、先安装 FFmpeg 依赖库
sudo apt-get update && sudo apt-get install autoconf automake  libfreetype6-dev  libtool make pkg-config zlib1g zlib1g.dev clang yasm yasm libgnutls28-dev \
 nasm  libx264-dev  libnuma-dev \
 libx265-dev libnuma-dev libvpx-dev \
 libfdk-aac-dev libmp3lame-dev libopus-dev \
 libspeex-dev frei0r-plugins-dev libsdl2-2.0 libsdl2-dev libxss1 \


sudo apt-get install python3-pip && \
pip3 install --user meson \

#2、源码方式编译 FFmpeg
./configure \
--prefix=$FFMPEG_PREFIX \
--enable-shared  \
--disable-static  \
--enable-pthreads  \
--enable-gpl  \
--enable-nonfree \
--enable-libmp3lame  \
--enable-libsnappy  \
--enable-libtheora  \
--enable-libx264  \
--enable-libx265  \
--enable-libfdk-aac \
--enable-libfontconfig  \
--enable-libfreetype  \
--enable-libspeex \

make -j8
make install
```

如果出现如下这样，那么可以确定已经开始编译了，根据电脑配置的不同，编译时间也都不一样的。

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210616225136.png)



编译完了之后，我们可以选择 QT5 或者 QT6 的环境编译运行，如下所示:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210616225716.png)

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210616230016.png)

可以发现 FFmpeg 在  **QT for Linux** 平台下，可以调用 API 进行开发了。

这里在运行项目的时候报了一个错 **error while loading shared libraries: lib*.so.*: cannot open ...** 查了下原因是 ubuntu ffmpeg 通过源码编译安装没有设置环境变量配置，找不到启动路径导致的，可以通过下面方式解决

```shell
sudo vim /etc/ld.so.conf

#在文件末尾添加编译好的路径
/home/ffmpeg/lib

#更新环境变量
sudo ldconfig

#加入全局变量
sudo vi /etc/profile
export PATH="/home/ffmpeg/bin:$PATH"

#保存
source /etc/profile

#测试
ffmpeg
```



## 总结

 **QT for Mac OS ** 和 **Linux**  开发环境都搭建完毕了，最后还剩下一个 **Windows** 平台了，环境都搭建完毕之后就要开始撸码了，激动啊！

[项目地址](https://github.com/yangkun19921001/QTFFPlayer.git)



