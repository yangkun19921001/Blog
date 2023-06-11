# WebRTC 实战: mediasoup SFU 架构的多人音视频通话解决方案

## 简介

WebRTC 是一种实现实时音视频通信的开源技术，它能够在浏览器和移动应用中直接进行点对点的数据传输。然而，要实现大规模的多人音视频通话，就需要引入更复杂的服务器端组件，这就是我们要讲的 mediasoup。mediasoup 是一个功能强大的 WebRTC SFU(Selective Forwarding Unit) 实现，它可以处理大量的音视频流，为开发者提供了实现多人音视频通话的解决方案。

这是我们搭建完，运行的效果图

![image-20230527172224121](http://devyk.top/2022/202305271722804.png)

## SFU架构原理

SFU是指选择性转发单元，用于多人实时音视频通话的场景。在SFU架构中，每个参与者将他的媒体流发送到SFU服务器，SFU服务器再将其转发到所有其他的参与者。这种架构相比于P2P架构，可以节省带宽，并且可以更容易地进行流量控制和质量调整。



## mediasoup 

### 架构

mediasoup 是一个以 SFU 为核心的 WebRTC 服务器框架，它提供了多路音视频流的能力。mediasoup 可以运行在服务器上，处理所有传入和传出的流，包括音频、视频和数据。由于其模块化的设计，mediasoup 可以轻松地集成到任何应用程序中。



### 原理

mediasoup 使用 RTP over UDP 进行音视频传输，这是一种实时传输协议，可以在网络中实现音视频的实时传输。mediasoup 通过使用 DTLS/SRTP 进行加密，保证了传输的安全性。

此外，mediasoup 还提供了强大的 API，使得开发者可以控制房间、生产者、消费者等实体，同时也可以进行编解码器的选择、转发策略的控制等。



### mediasoup-demo 部署

https://mediasoup.org/documentation/v3/mediasoup/installation/#requirements

我们根据  [mediasoup-demo](https://github.com/versatica/mediasoup-demo) 官方要求的步骤在 centos 服务器上进行部署

#### 1. 安装通用依赖

如官方介绍，我们需要在编译之前先安装必要的依赖

- Node.js version >= v16.0.0
- Python version >= 3.7 & python3-pip



#### 2. 下载代码

```shell
git clone https://github.com/versatica/mediasoup-demo.git
cd mediasoup-demo
git checkout v3
```



#### 3. 安装服务依赖

```shell
cd server
PYTHON=python3.9 npm install mediasoup@3 --save
```



#### 4. 配置 mediasoup-demo

```shell
cp config.example.js config.js
```

配置对应的 ip

```js
/**
 * IMPORTANT (PLEASE READ THIS):
 *
 * This is not the "configuration file" of mediasoup. This is the configuration
 * file of the mediasoup-demo app. mediasoup itself is a server-side library, it
 * does not read any "configuration file". Instead it exposes an API. This demo
 * application just reads settings from this file (once copied to config.js) and
 * calls the mediasoup API with those settings when appropriate.
 */

const os = require('os');

module.exports =
{
	domain : process.env.DOMAIN || 'localhost',
	https  :
	{
		listenIp   : '0.0.0.0',
		listenPort : process.env.PROTOO_LISTEN_PORT || 4443, // 1. 配置信令服务器 ip
		tls        : //2. 配置 https 证书
		{
			cert : process.env.HTTPS_CERT_FULLCHAIN || `${__dirname}/certs/fullchain.pem`,
			key  : process.env.HTTPS_CERT_PRIVKEY || `${__dirname}/certs/privkey.pem`
		}
	},
	mediasoup :
	{
		...
		webRtcServerOptions :
		{
			listenInfos :
			[
				{
					protocol    : 'udp',
					ip          : process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0',//3. 填私有 ip
					announcedIp : process.env.MEDIASOUP_ANNOUNCED_IP,//4. 公网 ip
					port        : 44444
				},
				{
					protocol    : 'tcp',
					ip          : process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0',//5. 填私有 ip
					announcedIp : process.env.MEDIASOUP_ANNOUNCED_IP,//6. 公网 ip
					port        : 44444
				}
			],
		},
		webRtcTransportOptions :
		{
			listenIps :
			[
				{
					ip          : process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0',//7.私有网络
					announcedIp : process.env.MEDIASOUP_ANNOUNCED_IP //8.公有网络
				}
			],
			...
		},
		plainTransportOptions :
		{
			listenIp :
			{
				ip          : process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0', //9.公有网络
				announcedIp : process.env.MEDIASOUP_ANNOUNCED_IP //10.公有网络
			},
			maxSctpMessageSize : 262144
		}
	}
};
```

根据上面 10 个修改步骤，即可。

#### 5. 启动服务

```shell
//前台启动
npm start
//后台启动
pm2 start server.js 
```



### mediasoup-web 部署

#### 1. 安装web端需要的依赖

```
cd app
npm install -g yarn
yarn install
```

#### 2. 启动 web 端

```shell
vim lib/urlFactory.js 修改对应的端口,对应于 server https 的端口
//前台
npm start
//后台
nohup gulp live > output.log 2>&1 &
```

**如启动报** 

```
/root/mediasoup-demo2/mediasoup-demo/app/gulpfile.js
  58:21  error  Unexpected use of file extension "json" for "./package.json"  import/extensions
```

找到 58 行，进行如下修改
```
const PKG = require('./package.json');
```

如继续报错:

```shell
/root/mediasoup-demo2/mediasoup-demo/app/lib/components/PeerView.jsx
  455:6  error  Invalid property 'playsInline' found on tag 'audio', but it is only allowed on: video  react/no-unknown-property
```

将 <audio> 标签的 playsInline 删除

继续启动应该就可以正常运行了

### mediasoup-android 部署

android 部署的话，我们参考 [mediasoup-client-android](https://github.com/haiyangwu/mediasoup-client-android) 项目，然后集成到我们核心 **OpenRTClicent** 库中



## 总结

mediasoup 是一个非常强大的 WebRTC SFU 服务器框架，它提供了多路音视频流的能力，可以满足各种复杂的音视频通信需求。通过深入理解 mediasoup 的原理和使用方法，我们可以更好地利用它来构建高质量的实时音视频通信应用。希望这篇文章能够帮助你更好地理解和使用 mediasoup。

