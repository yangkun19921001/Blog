## 简介

上一篇咱们在 **Linux** 平台下搭建了播放器开发环境，该篇主要介绍如何在 **Windows** 平台下搭建 `QT` 和 `FFmpeg` 开发环境。 如果你是在 `mac` 或者`linux` 环境下那么可以参考下面文章进行搭建

 [跨平台播放器开发 (一) QT for MAC OS & FFmpeg 环境搭建](https://mp.weixin.qq.com/s/-oL-Xlw0ZAI6gEtJ2OGQzA)

 [跨平台播放器开发 (二) QT for Linux & FFmpeg 环境搭建](https://mp.weixin.qq.com/s/N5EQH5g_tWM5VSKUzXrPKA)

## 环境准备

由于我自己用的是 `MAC` 电脑，所以如果想在 `Linux` 或者是 `Win` 上面想跑代码，那么只能装一个虚拟机了。可以参考该篇文章 [给mac装个 vmware 虚拟机](https://snowdreams1006.github.io/tools/mac-install-vmware.html)

### Windows
#### QT安装

**进入 [QT 官网](https://www.qt.io/zh-cn/supported-platforms-languages)**

从 5.15.0 版本开始 QT 便不再支持离线安装了。所以我们只能通过申请一个账号，在线安装了。

直接点击 **Go open source** -> **Download the Qt Online Installer** 最后会根据自己的系统匹配软件，点击 Download 就可以下载了。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2ba13639018d499fb264012bfa085416~tplv-k3u1fbpfcp-zoom-1.image)

**双击执行下载下来的软件:**

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fe568b817429452aa7dc5a34b767f5a6~tplv-k3u1fbpfcp-zoom-1.image)

**跟着提示点击 next 即可:**

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b450730ba6fd44aca0150e036bf2d510~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/179b914fd9024fdbbd2e157c5928dbd1~tplv-k3u1fbpfcp-zoom-1.image)

然后选择 `QT SDK` 开发包，我这里安装的是 6.1.1

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/394840459709421b994a8bc5dc27a7a8~tplv-k3u1fbpfcp-zoom-1.image)

选择好了之后，点击 next 就会进入下载状态:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/04700601b1894f0081ee5f2c7c7627b5~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e15604ff7dd94641b5ccd77f25e74aba~tplv-k3u1fbpfcp-zoom-1.image)

**直到出现如下页面，就代表安装成功可以启动 QT 了:**

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0055900e96f74828a29e0c931bbd7a10~tplv-k3u1fbpfcp-zoom-1.image)

最后 **QT for Linux  GUI 样式如下:**

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/64324d68749e4d3b8af2f7ba60da6356~tplv-k3u1fbpfcp-zoom-1.image)

#### 编译 FFmpeg

由于在 Windows 平台下编译 FFmpeg 实在是太麻烦，所以我这里直接下载 FFmpeg 官网编译好的，当然如果你对 windows 平台编译比较熟悉，那么可以直接源码编译好了将`动态库`和`头文件`放在 `QTFFplayer/libs` 即可。

**1、源码编译**

- [Cygwin安装与配置 - Windows下编译安装FFmpeg](http://www.ibooker.cc/article/340/detail)

- [ffmpeg精讲常见问题](https://blog.avdancedu.com/f3f66133/)

`(ps:后面有时间我自己编译一下，然后再补上编译脚本)`

**2、官网下载**

 首先进入 [FFmpeg Builds](https://github.com/BtbN/FFmpeg-Builds/releases) ,然后选择你需要的动态库，我这里选择的是 [ffmpeg-n4.4-72-g91aa49218e-win64-gpl-shared-4.4.zip](https://github.com/BtbN/FFmpeg-Builds/releases/download/autobuild-2021-06-19-12-36/ffmpeg-n4.4-72-g91aa49218e-win64-gpl-shared-4.4.zip)

下载完成之后，直接解压放入如下目录:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8406cdc26fbf4b68b27bc45b0a32fe4d~tplv-k3u1fbpfcp-zoom-1.image)

现在 `FFmpeg` 环境放入到了咱们项目中，下面就来编译看下结果

**选择编译环境**

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8c868d7d9bd244d4a0e43990273782a8~tplv-k3u1fbpfcp-zoom-1.image)

这里有可能编译通过，但是打不开软件报 QT6Core.dll 找不到，这种一般直接在 系统环境变量 PATH 加上你当前安装 QT 的路径，我这里是 `C:\Qt\6.1.1\mingw81_64\bin;` 

现在我们再次编译运行，发现还是崩溃，报错如下 ffmpeg 的 `*.dll` 库找不到，我们直接把 **QTFFplayer/libs/bin** 中的 ***.dll** copy 到 **c:\windows\System32\\** 下即可，编译运行出现如下页面，代表成功:
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a860a67cf5b94192877b27cc0b0823a8~tplv-k3u1fbpfcp-zoom-1.image)





可以发现在  **Windows** 平台下，可以调用 FFmpeg 和 QT API 进行开发了。



## 总结

 **QT for Mac OS** 、 **Linux** 、**Windows**  开发环境都搭建完毕了，可以发现 QT 在各个平台安装都几乎一样，但是编译 FFmpeg 就不是很顺利了，特别是 **Windows** 环境下编译。

现在环境都搭建好了，以后直接在主平台开发即可。等播放器开发完了之后，我们会在 **MAC OS、Linux 、Windows 、IOS 、Android** 平台下跑下看下效果。

下一篇主要讲解 FFmpeg 解封装的知识，敬请等待吧!

[项目地址](https://github.com/yangkun19921001/QTFFPlayer.git)
