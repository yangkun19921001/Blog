## 简介

由于音视频底层基本上是基于 C/C++ 开发的，并且绝大部分开源框架也都是跨平台的，像 **FFmpeg** 、**WebRTC** 、**Linphone** 、**Doubango** 、**libvlc** 等优秀开源项目。如果我们想学习这些框架，并且想基于它二次开发亦或者调用它的 API 自己做一个跨平台的项目，如果没有跨平台的经验是很难办到的。于是我就有了一个想法，**定一个小目标：先写它一个跨平台的播放器再说** ，写完这个播放器相当于也入门跨平台了。好了废话不多说了，进入该篇正文了，该篇主要是搭建 MAC/Win/Linux/ 上的开发环境。那么开始吧。

## 环境准备

由于我自己用的是 MAC 电脑，如果想在 Linux 或者是 Win 上面想跑代码怎么办，只能装一个虚拟机了。可以参考该篇文章 [给mac装个 vmware 虚拟机](https://snowdreams1006.github.io/tools/mac-install-vmware.html)

### QT

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210529162956.png)

这里我们选择 QT 来进行跨平台开发，因为它基本可以基于一套代码在多个平台上部署项目。

下面介绍各个平台上怎么安装和运行 QT

####Linux

之前更新了 MAC OS 系统到最新版 **11.3.1** ，QT 不知道为何编译不过了，固下载了最新版本。

**进入 [QT 官网](https://www.qt.io/zh-cn/supported-platforms-languages)**

从 5.15.0 版本开始 QT 便不再支持离线安装了。所以我们只能通过申请一个账号，在线安装了。

直接点击 **Go open source** -> **Download the Qt Online Installer** 最后会根据自己的系统匹配软件，点击 Download 就可以下载了。

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210529164012.png)

接下来就点击下载下来的软件，主页面的样式如下:
![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210529164138)

跟着指引点击 Next ，

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210530151148.png)

根据指引安装需要的 SDK，

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210530151345.png)

我当前安装了 QT5/QT6 全平台的开发包, 再点击 Next 按钮等待安装，最后直到出现如下操作，证明安装成功了，可以启动开发了。

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210529164321)

最后进入主页面，

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210529164809.png)

MAC 下 QT 软件安装完毕!

**下面为 QT for Mac  搭建 FFmpeg 环境:**

```shell
#一、通过命令安装
brew install ffmpeg
//配置环境变量
vim .bash_profile
//保存环境变量
source .bash_profile
//查看安装是否成功
ffmpeg

#二、通过源码编译

```

编译完了之后，直接在 **CMakeLists.txt** 配置 **ffmpeg**

```cmake
set(FFMPEG_PREFIX_DIR "/usr/local/Cellar/ffmpeg/4.3.1_8")
include_directories(${FFMPEG_PREFIX_DIR}/include/)
link_directories(${FFMPEG_PREFIX_DIR}/lib/)

target_link_libraries(QTFFPlayer PRIVATE
    Qt${QT_VERSION_MAJOR}::Widgets
    #FFmpeg 支持
    avcodec avdevice avfilter avformat avutil swscale
)
```

**测试**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210529225457.png)

可以发现 FFmpeg 在  QT for Mac OS 平台下，可以调用 API 进行开发了。



####Windows

Qt for Win 也跟其它平台一样，我这里还是做一个简略记录，首先下载在线安装包并且打开它，主页面如下：

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210530174122.png)

点击下一步，我们配置好安装的目录

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210530174133.png)

由于我主要在 MAC 上开发，其它系统平台只是辅助测试。所以这里不再下载 Android 环境了

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210530174100.png)

继续点击下一步

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210530174226.png)

这里配置好以后，就开始下载了，这是一个漫长的等待。

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20210530174306.png)

终于下载完成了，我们打开软件，页面跟其它平台一样:



现在我们配置 FFmpeg 的环境:

```
```



## 总结

三个平台上的 QT 环境终于配置好了，下一篇文章将介绍如何利用 FFmpeg 来对媒体信息进行解封装。



## 参考

- [Brew 编译 FFmpeg 4.2.2](https://lvv.me/blog/posts/2020/04/14_build_ffmpeg/)

