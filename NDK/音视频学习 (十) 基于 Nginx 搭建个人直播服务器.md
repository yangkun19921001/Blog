![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200221012409.png)
## 前言

最近这几年做直播和短视频领域是真的很火，而且直播的领域也很广泛，可以预见，未来的音视频技术将会作为一种基础技术应用到更广泛的场景中。它可以与 AR/VR 结合，让你在远端体验虚拟与现实，如虚拟服装体验；也可以与人工智能结合用于提高服务质量，如用于教学上帮助老师提高教学质量；它还可以与物联网结合，用在自动驾驶、家庭办公等领域。那么这么火范围这么广的领域我们可不可以参与一下呢，肯定是可以的，下面我们借助 [Nginx](http://nginx.org/en/download.html) 和 [nginx-http-flv-module](https://github.com/winshining/nginx-http-flv-module)  搭建一个简易的直播服务器，当然如果对并发要求不是太高的，这个完全可以满足了。

由于笔者没有后台服务开发的经验并且对一些服务环境配置也不太懂，所以也是参考了一些博客最后总结了一套安装使用教程，下面附上详细的步骤。

**注意:** 以下文字中如有出现 `http://ip:port` ，请替换成您自己的 IP 或域名。

## 直播协议介绍

国内常见公开的直播协议有几个：RTMP、HLS、HDL（HTTP-FLV）、RTP，我们来逐一介绍。

### RTMP

它是 Adobe 的专利协议，现在大部分国外的 CDN 已不支持。在国内流行度很高。原因有几个方面：

1、开源软件和开源库的支持稳定完整。如斗鱼主播常用的 OBS 软件，开源的 librtmp 库，服务端有 nginx-rtmp 插件。

2、播放端安装率高。只要浏览器支持 FlashPlayer 就能非常简易的播放 RTMP 的直播，协议详解可以 Google 了解。相对其他协议而言，RTMP 协议初次建立连接的时候握手过程过于复杂（底层基于 TCP，这里说的是 RTMP 协议本身的交互），视不同的网络状况会带来给首开带来 100ms 以上的延迟。基于 RTMP 的直播一般内容延迟在2~5 秒。

### HTTP-FLV

即使用 HTTP 协议流式的传输媒体内容。相对于 RTMP，HTTP 更简单和广为人知，而且不担心被 Adobe 的专利绑架。内容延迟同样可以做到 2~5 秒，打开速度更快，因为 HTTP 本身没有复杂的状态交互。所以从延迟角度来看，HTTP-FLV 要优于 RTMP。

### HLS

即 Http Live Streaming ，是由苹果提出基于 HTTP 的流媒体传输协议。HLS 有一个非常大的优点：**HTML5 可以直接打开播放；这个意味着可以把一个直播链接通过微信等转发分享**，不需要安装任何独立的 APP，有浏览器即可，所以流行度很高。**社交直播 APP，HLS 可以说是刚需**，下来我们分析下其原理 。

基于 HLS 的直播流 URL 是一个 m3u8 的文件，里面包含了最近若干个小视频 TS（一种视频封装格式，这里就不扩展介绍）文件。如 `http://ip:port/live.m3u8` 是一个直播留链接，其内容如下：

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200221002949.png)

假设列表里面的包含 5 个 TS 文件，每个 TS 文件包含 5 秒的视频内容，那么整体的延迟就是 25 秒。当然可以缩短列表的长度和单个 TS 文件的大小来降低延迟，极致来说可以缩减列表长度为 1，1 秒内容的 m3u8 文件，但是极易受网络波动影响造成卡顿。通过公网的验证，目前按同城网络可以做到比较好的效果是 5~7 秒的延迟，也是综合流畅度和内容延迟的结果。

### RTP

即 Real-time Transport Protocol ，用于 Internet 上针对多媒体数据流的一种传输层协议。

实际应用场景下经常需要 RTCP（RTP Control Protocol）配合来使用，可以简单理解为 RTCP 传输交互控制的信令，RTP 传输实际的媒体数据。

**RTP 在视频监控、视频会议、IP 电话上有广泛的应用**，因为视频会议、IP 电话的一个重要的使用体验：内容实时性强。

对比与上述 3 种或实际是 2 种协议，RTP 和它们有一个重要的区别就是默认是使用 UDP 协议来传输数据，而 RTMP 和 HTTP 是基于 TCP 协议传输。为什么 UDP 能做到如此实时的效果呢？关于 TCP 和 UDP 差别的分析文章一搜一大把，这里不在赘述，简单概括：

**UDP：单个数据报，不用建立连接，简单，不可靠，会丢包，会乱序；**

**TCP：流式，需要建立连接，复杂，可靠 ，有序。**

实时音视频流的场景不需要可靠保障，因此也不需要有重传的机制，实时的看到图像声音，网络抖动时丢了一些内容，画面模糊和花屏，完全不重要。TCP 为了重传会造成延迟与不同步，如某一截内容因为重传，导致 1 秒以后才到，那么整个对话就延迟了 1 秒，随着网络抖动，延迟还会增加成 2 秒、3 秒，如果客户端播放是不加以处理将严重影响直播的体验。

总结一下：在直播协议的选择中，如果选择是 RTMP 或 HTTP-FLV 则意味着有 2~5 秒的内容延迟，但是就打开延迟开，HTTP-FLV 要优于 RTMP。HLS 则有 5~7 秒的内容延迟。选择 RTP 进行直播则可以做到1秒内的直播延迟。但就目前所了解，各大 CDN 厂商没有支持基于 RTP 直播的，所以目前国内主流还是 RTMP 或 HTTP-FLV 。

## 流媒体服务器开源软件

- [流媒体服务器](https://www.oschina.net/project/tag/111/streaming?lang=0&os=0&sort=view&p=1)

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200221005909.png)

## 环境准备

本来我打算是在我的 [个人博客](https://www.devyk.top/) 服务器上搭建的，最终还是放弃了，因为之前的带宽跟容量也不是很大，也正巧碰见了 [腾讯云](https://cloud.tencent.com/act/season?fromSource=gwzcw.3381750.3381750.3381750&utm_medium=cpc&utm_id=gwzcw.3381750.3381750.3381750&gclid=Cj0KCQiA-bjyBRCcARIsAFboWg3FYHr_bD5iwOA1slhDSlU3C-2Rt-WLzFMPWEmbKKupuRKaAIWrdnAaAvhCEALw_wcB) 这几天在搞活动就又购买了一台服务器，以后关于后台服务的项目也基本上在这台部署了。

以下是我搭建以及测试的环境

**搭建服务器环境**

> 云服务器: 腾讯云
>
> 系统: centos
>
> 直播服务器: nginx
>
> 拓展模块: [nginx-http-flv-module](https://github.com/winshining/nginx-http-flv-module) (支持 rtmp、http-flv、http-hls 等)
>
> 如果 NGINX 要支持正则表达式，需要安装 [PCRE库](http://www.pcre.org/)。
>
> 如果 NGINX 要支持加密访问，需要安装 [OpenSSL库](https://www.openssl.org/)。
>
> 如果 NGINX 要支持压缩，需要安装 [zlib库](http://www.zlib.net/)。

**测试环境:**

> 电脑 : MAC
>
> 推流软件: [obs-studio](https://github.com/obsproject/obs-studio) 
>
> MAC 拉流软件: VLC
>
> Android 拉流软件: 前几天写的一个 Android 播放器 [ykplayer](https://github.com/yangkun19921001/NDK_AV_SAMPLE/tree/master/myplayer) 正好供于拉流测试
>
> HTML5 FLV 播放器: bilibili 开源的 [flv.js](https://github.com/bilibili/flv.js)



本来之前我是借助 [nginx-rtmp-module](https://github.com/arut/nginx-rtmp-module) 来搭建的直播服务器(已成功)，奈何它好像不支持 Http-flv 协议，所以替换成了 [nginx-http-flv-module](https://github.com/winshining/nginx-http-flv-module)  模块，它是基于 [nginx-rtmp-module](https://github.com/arut/nginx-rtmp-module)  模块二次开发的，所以完美的继承了 rtmp 模块的所有功能。 

## 服务器搭建 

### 1. download nginx 

```shell
# 通过 wget 命令下载
wget http://nginx.org/download/nginx-1.17.8.tar.gz
# 解压
tar -zxvf nginx-1.17.8.tar.gz
```

### 2. download nginx-http-flv-module 

**提醒:** 关于它的详细信息可以参考它的[介绍](https://github.com/winshining/nginx-http-flv-module/blob/master/README.CN.md)

```shell
# 通过 wget 命令下载
wget https://github.com/winshining/nginx-http-flv-module/archive/v1.2.7.tar.gz
# 解压
tar -zxvf v1.2.7.tar.gz
# 重命名
mv v1.2.7 nginx-http-flv-module
```

### 3. install nginx 需要的环境

如果在执行 configure 之后报 **OpenSSL 、PCRE 、Zlib** error 那么就必须安装它们

```shell
#安装 openssl
yum install   openssl
#安装 pcre
yum install 	pcre-devel
#安装 zlib
yum install   zlib-devel
```

等它们安装好了之后编译 nginx

### 4. build nginx

在当前解压 nginx 目录中创建编译 nginx 和 http-flv 脚本

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200220213231.png)

```shell
#!/bin/sh
# ../ 代表当前目录的上一级
HTTP_FLV_MODULE_PATH=../nginx-http-flv-module-1.2.7
OpenSSL_PATH=../openssl-1.1.1d

#--prefix=./bin 代表编译完成之后输出的路径地址
#--add-module 将拓展模块添加到当前一起编译
./configure --prefix=./bin \
--add-module=$HTTP_FLV_MODULE_PATH \
--with-openssl=$OpenSSL_PATH \
--with-debug

# 通过 make install 构建
make
make install
```

如果中途没有报任何错误，并且输出了我们指定的 **bin** 目录，那么就代表成功了。如下图所示:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200220214548.gif)

### 5. 配置 nginx.conf 

在当前目录下输入 `vim bin/conf/nginx.conf` 进行配置 rtmp、http 直播协议，我直接贴上我的配置

```json
user root;
worker_processes  auto; #运行在Windows上时，设置为1，因为Windows不支持Unix domain socket
#worker_processes  auto; #1.3.8和1.2.5以及之后的版本

#worker_cpu_affinity  0001 0010 0100 1000; #只能用于FreeBSD和Linux
worker_cpu_affinity  auto; #1.9.10以及之后的版本

error_log logs/error.log error;

#如果此模块被编译为动态模块并且要使用与RTMP相关的功
#能时，必须指定下面的配置项并且它必须位于events配置
#项之前，否则NGINX启动时不会加载此模块或者加载失败

#load_module modules/ngx_http_flv_live_module.so;

events {
    worker_connections  4096;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    keepalive_timeout  65;

    server {
        listen       80;//自定义填写 http 的端口

        location / {
        root   /root/nginx/nginx-http-flv-module-1.2.7/test/www; 
	 			index  index.html index.htm;//默认首页
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }

				location /flvjsplay {//测试地址
					root /root/nginx/flv.js-1.5.0;
					index index.html;//flv.js 测试播放首页
				}

				location /flv {
            flv_live on; #打开HTTP播放FLV直播流功能
            chunked_transfer_encoding on; #支持'Transfer-Encoding: chunked'方式回复
						#跨域
            add_header 'Access-Control-Allow-Origin' '*'; #添加额外的HTTP头
            add_header 'Access-Control-Allow-Credentials' 'true'; #添加额外的HTTP头
        }

	
        location /hls {
            types {
                application/vnd.apple.mpegurl m3u8;
                video/mp2t ts;
            }

            root /root/nginx/nginx-http-flv-module-1.2.7;
            add_header 'Cache-Control' 'no-cache';
						index hlsplay.html;//浏览器播放的页面。
        }

        location /dash {
            root /root/nginx/nginx-http-flv-module-1.2.7;
            add_header 'Cache-Control' 'no-cache';
        }

        location /stat {
            #push和pull状态的配置
            rtmp_stat all;
            rtmp_stat_stylesheet stat.xsl;
        }

        location /stat.xsl {
            root /root/nginx/nginx-http-flv-module-1.2.7; #指定stat.xsl的位置
        }

        #如果需要JSON风格的stat, 不用指定stat.xsl
        #但是需要指定一个新的配置项rtmp_stat_format

        #location /stat {
        #    rtmp_stat all;
        #    rtmp_stat_format json;
        #}

        location /control {
            rtmp_control all; #rtmp控制模块的配置
        }
    }
}

rtmp_auto_push on;
rtmp_auto_push_reconnect 1s;
rtmp_socket_dir /root/nginx/nginx-http-flv-module-1.2.7;

rtmp {
    out_queue           4096;
    out_cork            8;
    max_streams         128;
    timeout             30s;
    drop_idle_publisher 30s;

    log_interval 5s; #log模块在access.log中记录日志的间隔时间，对调试非常有用
    log_size     1m; #log模块用来记录日志的缓冲区大小

    server {
        listen 1935;//自定义 rtmp 端口
       # server_name www.test.*; #用于虚拟主机名后缀通配

        application devyk {
            live on;
            gop_cache on; #打开GOP缓存，减少首屏等待时间
        }

        application hls {
            live on;
            hls on;
            hls_path /root/nginx/nginx-http-flv-module-1.2.7/hls;
        }

        application dash {
            live on;
            dash on;
            dash_path /root/nginx/nginx-http-flv-module-1.2.7/dash;
        }
    }
	
		#可以有多个 server 配置
}

```

> [Nginx 配置文件详解请看该篇文章](https://zhuanlan.zhihu.com/p/31202053)
>
> [Nginx 配置文件详解请看该篇文章](https://blog.csdn.net/crazyzxljing0621/article/details/72522945)
>
> [nginx-rtmp-module配置指令详解](https://yq.aliyun.com/articles/243454)

在根目录输入 bin/sbin/nginx -t , 如出现如下就说明配置成功。

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200220222500.png)

### 6. 开启 nginx 服务

```shell
#开启服务
bin/sbin/nginx

#停止服务
bin/sbin/nginx -s stop

#重启服务
bin/sbin/nginx -s reload
```

### 7. 网页测试是否都显示正常

1. 直接在网页上输入: `http://ip:port`，如果出现如下，证明首页和基本配置没有问题了

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200220223104.png)

2. 直接在网页输入: `http://ip:port/stat` 如出现如下监控页面，说明监控页面一切正常。

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200220224014.png)

现在服务器搭建完成，下面可以进入测试环节了。

## rtmp 推流

我们直接用开源 [obs-studio](https://github.com/obsproject/obs-studio) 软件进行推流，听说很多游戏主播也用该款推流软件。

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200220225645.png)

推流源设置:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200220230352.gif)

如上图所示，证明已经推流成功了，下面我们就来测试拉流。

## 拉流

### flv 在 Html5 上播放

**注意:** 其它播放也是如下格式，这里只是以 Html 举例说明:

例子:

假设在`http`配置块中的`listen`配置项是：

```
http {
    ...
    server {
        listen 8080; #不是默认的80端口
        ...

        location /live {
            flv_live on;
        }
    }
}
```

在`rtmp`配置块中的`listen`配置项是：

```
rtmp {
    ...
    server {
        listen 1935; #也可以不是默认的1935端口
        ...

        application myapp {
            live on;
        }
    }
}

```

并且发布的流的名称是`mystream`，那么基于 HTTP-FLV 的播放url是：

```http
http://ip:8080/flv?port=1935&app=myapp&stream=mystream
```

播放器这里选择 bilibili 开源的 [flv.js](https://github.com/bilibili/flv.js) , 既然我们已经有服务器了，那就直接把 flv.js 项目部署在服务器上吧

1. 安装 npm

```shell
#安装 npm
yum install npm
#检查是否安装成功，如有输出证明安装成功
npm --version
```

2. 直接下载 flv.js 到服务器上

```shell
#通过 wget 下载
wget https://github.com/bilibili/flv.js/archive/v1.5.0.tar.gz
#解压
tar -zxvf v1.5.0.tar.gz
```

3. 安装

进入 flv.js 根目录直接输入 `npm install` 命令，安装完成之后会出现一个 `node_modules` 模块

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200220231700.png)

4. 安装生成工具

还是在当前根目录下安装，输入如下命令:

```shell
npm install -g gulp
```

5. 包装和最小化 js 放入 dist 文件夹中

```shell
#输入如下命令
gulp release
```

这一步执行完成之后会生成如下文件:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200220232201.png)

6. 修改 demo 提供的播放页面

将 demo 中 2 个文件(.ccs,.js) copy 到 dist 文件下,并修改 html 中 flv.js 路径，如下所示:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200220232907.png)

最后将 dist 文件夹重命名 flvjsplay

7. 部署

nginx.conf 配置网页加载路径:

```
				location /flvjsplay {//测试地址
					root /root/nginx/flv.js-1.5.0;
					index index.html;#flv.js 测试播放首页
				}
```

修改了配置文件需要在 nginx 根目录输入如下指令，对 nginx 服务器重启:

```shell
#重新启动
bin/sbin/nginx -s reload
```

8. chrome 加载播放

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200220234548.gif)
> 左边是拉流，右边是推流

可以看到首屏加载速度还是比较快延迟在 2-5s 之间，画面延迟有点高跟我服务器和网络有关。

### VLC rtmp 拉流播放

VLC 点击文件->打开网络输入 rtmp 拉流地址点击播放

```
//配置rtmp 拉流格式
//ip:host
//rtmpPost:rtmp 服务的端口
//appname 配置在rtmp application 的名称
//streamname：推流的时候填写的密码
rtmp://ip:rtmpPort/appname/streamname
```



![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200220235435.gif)
> 左边是拉流，右边是推流
### http-hls 播放

**播放格式:**

```http
http://ip:port/hls/streamname.m3u8
```

因为笔者不是做 H5 开发的，所以对浏览器播放 HLS 直播流兼容性不是太清楚，我就直接使用 video 标签在我电脑上用 chrome 浏览器测试, 结果是播放不出来的，查了资料好像说是原生 video 标签仅支持 **MP4、WebM、Ogg** 格式，那这怎么办呢？其实可以直接使用开源项目来解决的，比如 [video.js](https://link.jianshu.com/?t=https%3A%2F%2Fgithub.com%2Fvideojs%2Fvideo.js) 、[videojs-contrib-hls](https://link.jianshu.com/?t=https%3A%2F%2Fgithub.com%2Fvideojs%2Fvideojs-contrib-hls) 等，我这里直接使用的是 [videojs-contrib-hls](https://link.jianshu.com/?t=https%3A%2F%2Fgithub.com%2Fvideojs%2Fvideojs-contrib-hls) ，目前测试在 **Android 浏览器、PC 谷歌浏览器 、IOS 微信、IOS Safari 浏览器**  均已成功，下面是 Html 代码，如下所示:

```html
<html>
    <head>
        <meta charset="utf-8" />
        <title>Player</title>
        <link href="https://unpkg.com/video.js/dist/video-js.css" rel="stylesheet">
    </head>
 
    <body>
        <video id="video" class="video-js vjs-default-skin" controls autoplay="autoplay" width="640" height="320" data-setup='{}' poster="https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200221192142.png">
          //换成你自己的直播链接
            <source src="http://ip:8082/hls/live1.m3u8" type="application/x-mpegURL" />
        </video>
 
        <script src="https://unpkg.com/video.js/dist/video.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/videojs-contrib-hls/5.12.1/videojs-contrib-hls.min.js"></script>
    </body>
</html>
```

**注意:在这儿使用的js等资源皆是在线的一些支持。若需要在项目中使用，最好下载到本地使用**

为了测试方便，我也直接把该 Html 代码部署到了云服务器中，nginx.conf 配置如下:

```nginx
location /hlsplay {
    root /root/nginx/nginx-http-flv-module-1.2.7/hls;
    index hlsplay.html; //指定首页，也就是我们播放的页面，hlsplay.html 就是上面代码。
}
```

重启 nginx 服务器之后，直接输入 `http://ip:port/hlsplay` 就可以播放了，测试效果如下图:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200221182308.png)

### VLC、Html5、android 三端同时拉流测试

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200221000705.gif)



## 总结  
到这里您已经成功搭建直播服务器了，虽然说该篇文章没有敲任何的代码，也许你会说没有学到什么，但是搭建服务器和部署一套直播环境这个过程也都是值得我们作为一个移动或者前端开发者学习的。

## 参考

- [直播协议介绍](https://zhuanlan.zhihu.com/p/23377305)
- [nginx + nginx-http-flv-module 搭建文档](https://github.com/winshining/nginx-http-flv-module/blob/master/README.CN.md)

## 感谢

- Igor Sysoev，[NGINX](http://nginx.org/)的作者。

- Roman Arutyunyan，[nginx-rtmp-module](https://github.com/arut/nginx-rtmp-module)的作者。

- [winshining](https://github.com/winshining) ,[nginx-http-flv-module](https://github.com/winshining/nginx-http-flv-module) 的作者。

- [obsproject](https://github.com/obsproject) ，[obs-studio](https://github.com/obsproject/obs-studio) (用于实时流式传输和屏幕录制)。

- [bilibili](https://github.com/bilibili)，HTML5 [flv.js](https://github.com/Bilibili/flv.js/) 