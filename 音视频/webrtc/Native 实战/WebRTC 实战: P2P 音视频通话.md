## 简介

本文将详细介绍如何利用 **WebRTC** 技术实现 **P2P** 音视频通话，并提供了一个跨平台的方案，包括：基于 **socket.io** 和 **Node.js** 实现的服务端，以及 **JavaScript** 和 **Android** 客户端。让我们一起来探讨如何搭建这个系统，以及如何编写代码吧。



由于 server 、js、android 代码还在整理中，预计还需要 2-3 天时间。地址:https://github.com/yangkun19921001/OpenRTCProject。

下面是 PC 与 IOS 在不同网络环境下的效果图(WiFi <->移动网络)：

![](http://devyk.top/2022/202303252219247.gif)



## 服务端

### 1. 使用 nodejs 和 socket.io 实现信令服务器

我们借助上一篇信令服务的流程图，来实现一个 nodejs 信令服务器

![](http://devyk.top/2022/202303221325023.png)

我们先设计一个信令

**join:** 当前用户和远端用户加入到房间中的信令

**leave:** 当前用户和远端用户离开房间的信令

**message:** 交换双方的 SDP、ICE 信令



首先，我们需要搭建一个 **Node.js** 服务端，用于处理信令交换。在这里，我们将使用 **socket.io** 库作为通信协议，借助 http、https、fs 等组件。实现一个简单的 **Node.js** 服务端实例：

create server.js 下面就是信令服务的核心代码

```js
var log4js = require('log4js');
var http = require('http');
var https = require('https');
var fs = require('fs');
var socketIo = require('socket.io');

var express = require('express');
var serveIndex = require('serve-index');

var USERCOUNT = 3;

...

//http server
var http_server = http.createServer(app);
http_server.listen(80, '0.0.0.0');

var options = {
        key : fs.readFileSync('./cert/xxx.key'),
        cert: fs.readFileSync('./cert/xxx.pem')
}

//https server
var https_server = https.createServer(options, app);
var io = socketIo.listen(https_server);


io.sockets.on('connection', (socket)=> {
    socket.on('message', (room, data)=>{
            socket.to(room).emit('message',room, data);//发送给当前房间的其它客户端
    });

    socket.on('join', (room)=>{
            socket.join(room);
            var myRoom = io.sockets.adapter.rooms[room];
            var users = (myRoom)? Object.keys(myRoom.sockets).length : 0;
            logger.debug('the user number of room is: ' + users);

            if(users < USERCOUNT){
                    socket.emit('joined', room, socket.id); //发送给自己，相当于回调
               if(users > 1){
                  socket.to(room).emit('otherjoin', room, socket.id); //发送给当前房间的其它客户端
                    }

            }else{
                    socket.leave(room);
                    socket.emit('full', room, socket.id);
            }
    });
    socket.on('leave', (room)=>{
        var myRoom = io.sockets.adapter.rooms[room];
        var users = (myRoom)? Object.keys(myRoom.sockets).length : 0;
        logger.debug('the user number of room is: ' + (users-1));
        socket.to(room).emit('bye', room, socket.id);
        socket.emit('leaved', room, socket.id);
});
});

https_server.listen(443, '0.0.0.0');
```



要运行上面的 server.js 信令服务器，您需要按照以下步骤进行安装和运行：

1. 安装 Node.js 和 npm：
2. 安装所需的依赖项

```shell
npm install express socket.io fs http https
```

3. 启动 server

```shell
node server.js
```

### 2. 搭建 sturn/turn 服务器

由于网络环境的影响我们需要搭建一个 sturn/turn 服务器，以便提升 P2P 的成功率，下面是一个粗略的搭建方式，但是也够用了。

1. 安装 Coturn

在终端中输入以下命令，使用 yum 包管理器安装 Coturn：

```shell
sudo yum install coturn
```

2. 配置 Coturn

找到并编辑 Coturn 的配置文件 `/etc/coturn/turnserver.conf`，根据您的需求修改以下配置项：

```shell
# 配置监听的端口号
listening-port=3478
min-port=49152
max-port=65535
#配置域名
realm=xxx.com
#允许使用 TURN/STUN 服务的用户的凭据
user=123456:123456
cert=/path/to/xxx.pem
pkey=/path/to/xxx.pem
# 配置日志文件路径
log-file=/root/log/turnserver.log
```

3. 启动 Coturn

在终端中输入以下命令，启动 Coturn 服务：

```shell
sudo systemctl start coturn
sudo systemctl stop coturn
sudo systemctl restart coturn
sudo systemctl status coturn
```

4. 测试 coturn

   我们可以去 [trickle-ice](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/) 测试网站进行测试

   ![](http://devyk.top/2022/202303252030890.png)

正如 trickle-ice 网站所说: 如果你测试一个 STUN 服务器，你能收集到一个类型为“srflx”的候选者，它就可以工作。如果你测试一个 TURN 服务器，你能收集到一个类型为“relay”的候选人，它就会工作.

由此上图 sturn 和 turn 候选者地址都能成功连接。

## 客户端

WebRTC 是一种基于 **Web** 技术的实时通信解决方案，可用于在浏览器中实现P2P音视频通话。当然，现在基本上所有上层平台都支持了。在 **WebRTC** 中，双方通信通过 **ICE** 协议进行连接，通过 **SDP** 协议交换媒体信息，通过 **DTLS** 协议进行加密，通过 **SRTP** 协议进行媒体传输。

下面，我们将为你介绍如何使用 **WebRTC** 在浏览器和 **Android** 中实现 **P2P** 音视频通话。

### Web

我们按照上面信令的流程来实现:

#### 1. 获取媒体流

**WebRTC** 支持从设备摄像头和麦克风获取视频和音频流。使用 **JavaScript** 的`getUserMedia` API，您可以请求用户授权，从摄像头和麦克风获取本地媒体流，并将其添加到一个`MediaStream`对象中。

```js
function startCall(){

	if(!navigator.mediaDevices ||
		!navigator.mediaDevices.getUserMedia){
		console.error('the getUserMedia is not supported!');
		return;
	}else {

		var constraints = {
			video: true, //传输视频
			audio: true  //传输音频
		}

		navigator.mediaDevices.getUserMedia(constraints)
					.then(getMediaStream)//打开成功的回调
					.catch(handleError);//打开失败
	}

}
```



#### 2.连接信令服务器并加入到房间中

```js
function connect(){
  //连接信令服务器
  socket = io.connect();
    //加入成功的通知
  	socket.on('joined', (roomid, id) => {
			...
	});
    //远端加入
  	socket.on('otherjoin', (roomid) => {
			...
	});
    //房间满了
  	socket.on('full', (roomid, id) => {
		...
	});
   //接收自己离开房间的回调
   socket.on('leaved', (roomid, id) => {
		...
	});
    //收到对方挂断的消息
   socket.on('bye', (room, id) => {
	 ...
	});
  //收到服务断开的消息
  socket.on('disconnect', (socket) => {
	...
	});
  //收消息，用于交换 SDP 和 ICE 消息等
  socket.on('message', (roomid, data) => {
  	...
	});
  //发送 join 消息到信令服务器并加入到 123456 房间中
  socket.emit('join', 123456);
}
```

#### 3. 创建 PeerConnection 并添加媒体轨道

当收到自己加入房间成功的消息后，连接到远程对等方，我们就需要创建一个`RTCPeerConnection`对象，并将本地媒体流添加到其中。然后，您需要创建一个`RTCDataChannel`对象，用于在对等方之间传输数据。

```js
var pcConfig = {
  'iceServers': [{
    'urls': 'turn:xxx:3478',
    'credential': "1234",
    'username': "1234"
  }]
};
pc = new RTCPeerConnection(pcConfig);
		//当前 icecandida 数据
pc.onicecandidate = (e)=>{
      ...
}

    //datachannel 传输通道
pc.ondatachannel = e=> {
		...
}
// 添加远端的媒体流到 <video>  element
pc.ontrack = getRemoteStream;
  
//最后添加媒体轨道到 peerconnection 对象中
localStream.getTracks().forEach((track)=>{
		pc.addTrack(track, localStream);	
});
  
//创建一个非音视频的数据通道
dc = pc.createDataChannel('test');
dc.onmessage = receivemsg;//接收对端消息
dc.onopen = dataChannelStateChange;//当打开
dc.onclose = dataChannelStateChange;//当关闭
  
function getRemoteStream(e){
	remoteStream = e.streams[0];
	remoteVideo.srcObject = e.streams[0];
}
```

#### 4. 发送 createOffer 数据到远端

当对方加入到房间中，我们需要把当前 UserA 的 SDP 信息告诉 UserB 用户，使用如下代码

```js
		var offerOptions = {//同时接收远端的音、视频数据
			offerToRecieveAudio: 1, 
			offerToRecieveVideo: 1
		}

		pc.createOffer(offerOptions)
			.then(getOffer)//创建成功的回调
			.catch(handleOfferError);

function getOffer(desc){
  //设置 UserA SDP 信息
	pc.setLocalDescription(desc);
	offerdesc = desc;

	//将 usera 的 SDP 发送到信令服务器，信令服务器再根据 roomid 进行转发
	sendMessage(roomid, offerdesc);	

}
```

#### 5. 发送 answer 消息到对方

当 UserB 收到 UserA 发来的 offer 消息，我们需要设置 UserA 的 SDP 并且设置当前的 SDP 然后再讲自己的 SDP 发送给 UserA,以进行媒体协商, 如下代码:

```js
//1. 当收到 UserA OFFER 消息，设置 SDP
pc.setRemoteDescription(new RTCSessionDescription(data));

//2. 然后创建 answer 消息
pc.createAnswer()
.then(getAnswer)
.catch(handleAnswerError);

//3. 当创建成功后，拿到 UserB 自己的 SDP 消息并设置当前的 SDP 信息，最后再讲 SDP 消息发给信令再转发给 roomid 房间中的客户端
function getAnswer(desc){
	pc.setLocalDescription(desc);

	optBw.disabled = false;
	//send answer sdp
	sendMessage(roomid, desc);
}
```

#### 6. 接收 answer 消息，并设置 UserB 的 SDP 信息

当我们收到 UserB 发来的 answer sdp 消息后告诉底层

```js
pc.setRemoteDescription(new RTCSessionDescription(data));
```

#### 7. 交换 ICE 候选 

 SDP 协商完后，UserA / UserB 交换 ice 消息，用于 nat 和转发媒体数据，如果都在局域网其实可以省略这一步

``` js
//user A / UserB 收到 onicecandidate 回调然后将 candidate 发送给 UserB
pc.onicecandidate = (e)=>{
   if(e.candidate) {
				sendMessage(roomid, {
					type: 'candidate',
					label:event.candidate.sdpMLineIndex, 
					id:event.candidate.sdpMid, 
					candidate: event.candidate.candidate
				});
			}else{
				console.log('this is the end candidate');
			}
		}

//当 UserB / UserA 接收到 UserA / UserB 的candidate 后进行添加
function addIcecandida(data){

			var candidate = new RTCIceCandidate({
				sdpMLineIndex: data.label,
				candidate: data.candidate
			});
			pc.addIceCandidate(candidate)
				.then(()=>{
					console.log('Successed to add ice candidate');	
				})
				.catch(err=>{
					console.error(err);	
				});
}

```

#### 

通过如上核心步骤代码，你已经完成了一个基于 **WebRTC** JS 版的跨平台 **P2P** 音视频通话系统。当然，这里展示的代码只是简化版示例，完整版的代码可以点击文末简介处有说明。



### Android

上面我们实现了 服务端和跨平台的 JS 端，最后我们实现一个 Android 端，毕竟最开始我就是搞 Android 的😄。



对于Android客户端，您可以使用 **Google** 提供的 **WebRTC** 库。如下，当前也可以直接依赖 java/c++ 源码。当前我们就是直接依赖的 java/c++ 源码

依赖 wertc sdk 方式，在`build.gradle`文件中添加依赖项：

```groovy
implementation 'org.webrtc:google-webrtc:1.0.+'
```

依赖 wertc 源码 方式，在`build.gradle`文件中添加如下设置：

```groovy
    externalNativeBuild {
        cmake {
            version "3.10.2"
            path 'CMakeLists.txt'
        }
    }
```

没错，我们通过编写 cmake 直接依赖的 c++ 源码。好了，依赖方式就不再多说了，可以直接去看项目中的 build.gradle 文件即可。



Android 上的实现步骤流程与 JS 几乎一样，我们来看一下如何实现吧。

#### 1. 获取媒体流并初始化 PeerConnectionFactory

这里我们直接通过 Camera2 来实现相机数据的采集

```java
private VideoCapturer createVideoCapture() {
    final VideoCapturer videoCapturer;
    videoCapturer = createCameraCapturer(new Camera2Enumerator(this));
    return videoCapturer;
}


//设置本地预览窗口
mLocalSurfaceView.init(mRootEglBase.getEglBaseContext(), null);
mLocalSurfaceView.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FILL);
mLocalSurfaceView.setMirror(true);
mLocalSurfaceView.setEnableHardwareScaler(false /* enabled */);

//设置远端预览窗口
mRemoteSurfaceView.init(mRootEglBase.getEglBaseContext(), null);
mRemoteSurfaceView.setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FILL);
mRemoteSurfaceView.setMirror(true);
mRemoteSurfaceView.setEnableHardwareScaler(true /* enabled */);
mRemoteSurfaceView.setZOrderMediaOverlay(true);
callStartedTimeMs = System.currentTimeMillis();
//创建 factory， pc是从factory里获得的
createPeerConnectionFactory();

private void createPeerConnectionFactory() {
        final String fieldTrials = getFieldTrials(mPeerConnectionParameters);
        executor.execute(() -> {
            Log.d(Constants.P2PTAG, "Initialize WebRTC. Field trials: " + fieldTrials);
            PeerConnectionFactory.initialize(
                    PeerConnectionFactory.InitializationOptions.builder(mContext)
                            .setFieldTrials(fieldTrials)
                            .setEnableInternalTracer(true)
                            .createInitializationOptions());
        });
        executor.execute(() -> {
            createPeerConnectionFactoryInternal();
        });
}
```





#### 2. 连接信令服务器并加入到房间中

```java
    public void connectToRoom(RoomConnectionParameters parameters, ISignalEventListener signalEventListener) {
        mRoomConnectParameters = parameters;
        executor.execute(() -> {
            if (mISignalClient != null) {
                try {
                    mISignalClient.connect(parameters.roomUrl, new ISignalEventListener() {
                        @Override
                        public void OnConnecting() {
                            Log.i(Constants.P2PTAG, "OnConnecting");
                            ...
                        }

                        @Override
                        public void OnConnected() {
                            Log.i(Constants.P2PTAG, "OnConnected");
                            Log.i(Constants.P2PTAG, "join:" + parameters.roomId);
                            mISignalClient.join(parameters.roomId);
                            ...
                        }

                        @Override
                        public void OnDisconnected() {
                            if (signalEventListener != null) {
                                signalEventListener.OnConnecting();
                            }
                        }

                        @Override
                        public void OnUserJoined(String roomName, String userId, boolean isInitiator) {
                            if (signalEventListener != null) {
                                signalEventListener.OnUserJoined(roomName, userId, isInitiator);
                            }
                            Log.i(Constants.P2PTAG, "joined:" + roomName + "-" + userId + "-" + isInitiator);
                            Log.i(Constants.P2PTAG, "createPeerConnection");
                             ...
                        }

                        @Override
                        public void OnUserLeaved(String roomName, String userId) {
                             ...
                        }

                        @Override
                        public void OnRemoteUserJoined(String roomName, String userId) {
                            Log.i(Constants.P2PTAG, "createOffer " + roomName + "-" + userId);
                            ...
                        }

                        @Override
                        public void OnRemoteUserLeaved(String roomName, String userId) {
                              ...
                        }

                        @Override
                        public void OnRoomFull(String roomName, String userId) {
                             ...
                        }

                        @Override
                        public void OnMessage(JSONObject message) {
                            ...

                        }
                    });

                } catch (Exception e) {
                    Log.e(TAG, e.getMessage());
                }
            }
        });
    }

```



#### 3. 创建 PeerConnection 并添加媒体轨道

当收到自己加入房间成功的消息后，连接到远程对等方，我们就需要创建一个`PeerConnection`对象，并将本地媒体流添加到其中。然后，您需要创建一个`DataChannel`对象，用于在对等方之间传输数据。

简要代码如下：

```java
    //当连接成功并且进入到房间中执行
    private void createPeerConnection() {
        executor.execute(() -> {
            try {
                createMediaConstraintsInternal();
                createPeerConnectionInternal();
                Log.i(Constants.P2PTAG, "createPeerConnection Succeed");
            } catch (Exception e) {
                Log.e(TAG, "Failed to create peer connection: " + e.getMessage());
                throw e;
            }
        });
    }
    private void createMediaConstraintsInternal() {
        // Create video constraints if video call is enabled.
				...
        // Create audio constraints.
        mAudioConstraints = new MediaConstraints();
        // added for audio performance measurements
        if (mPeerConnectionParameters.noAudioProcessing) {
            Log.d(TAG, "Disabling audio processing");
            mAudioConstraints.mandatory.add(
                    new MediaConstraints.KeyValuePair(AUDIO_ECHO_CANCELLATION_CONSTRAINT, "false"));
            mAudioConstraints.mandatory.add(
                    new MediaConstraints.KeyValuePair(AUDIO_AUTO_GAIN_CONTROL_CONSTRAINT, "false"));
            mAudioConstraints.mandatory.add(
                    new MediaConstraints.KeyValuePair(AUDIO_HIGH_PASS_FILTER_CONSTRAINT, "false"));
            mAudioConstraints.mandatory.add(
                    new MediaConstraints.KeyValuePair(AUDIO_NOISE_SUPPRESSION_CONSTRAINT, "false"));
        }
        // Create SDP constraints.
        mSdpMediaConstraints = new MediaConstraints();
        mSdpMediaConstraints.mandatory.add(
                new MediaConstraints.KeyValuePair("OfferToReceiveAudio", "true"));
        mSdpMediaConstraints.mandatory.add(new MediaConstraints.KeyValuePair(
                "OfferToReceiveVideo", Boolean.toString(isVideoCallEnabled())));

    }

    private void createPeerConnectionInternal() {
        if (mPeerConnectionFactory == null) {
            Log.e(TAG, "Peerconnection factory is not created");
            return;
        }
        Log.d(TAG, "Create peer connection.");
        queuedRemoteCandidates = new ArrayList<>();
        List<PeerConnection.IceServer> iceServers = new ArrayList<>();

        iceServers.add(PeerConnection.IceServer
                .builder("turn:xxx:3478")
                .setPassword("xxx")
                .setUsername("xxx")
                .createIceServer());
        PeerConnection.RTCConfiguration rtcConfig =
                new PeerConnection.RTCConfiguration(iceServers);
        // TCP candidates are only useful when connecting to a server that supports
        // ICE-TCP.
        rtcConfig.tcpCandidatePolicy = PeerConnection.TcpCandidatePolicy.DISABLED;
        rtcConfig.bundlePolicy = PeerConnection.BundlePolicy.MAXBUNDLE;
        rtcConfig.rtcpMuxPolicy = PeerConnection.RtcpMuxPolicy.REQUIRE;
        rtcConfig.continualGatheringPolicy = PeerConnection.ContinualGatheringPolicy.GATHER_CONTINUALLY;
        // Use ECDSA encryption.
        rtcConfig.keyType = PeerConnection.KeyType.ECDSA;
        rtcConfig.sdpSemantics = PeerConnection.SdpSemantics.UNIFIED_PLAN;
        mPeerConnection = mPeerConnectionFactory.createPeerConnection(rtcConfig, pcObserver);

        if (dataChannelEnabled) {
            DataChannel.Init init = new DataChannel.Init();
            init.ordered = mPeerConnectionParameters.dataChannelParameters.ordered;
            init.negotiated = mPeerConnectionParameters.dataChannelParameters.negotiated;
            init.maxRetransmits = mPeerConnectionParameters.dataChannelParameters.maxRetransmits;
            init.maxRetransmitTimeMs = mPeerConnectionParameters.dataChannelParameters.maxRetransmitTimeMs;
            init.id = mPeerConnectionParameters.dataChannelParameters.id;
            init.protocol = mPeerConnectionParameters.dataChannelParameters.protocol;
            mDataChannel = mPeerConnection.createDataChannel("P2P data", init);
        }
        isInitiator = false;
        // Set INFO libjingle logging.
        // NOTE: this _must_ happen while `factory` is alive!
        Logging.enableLogToDebugOutput(Logging.Severity.LS_INFO);
        List<String> mediaStreamLabels = Collections.singletonList("ARDAMS");
        if (isVideoCallEnabled()) {
            mPeerConnection.addTrack(createVideoTrack(mVideoCapture), mediaStreamLabels);
            // We can add the renderers right away because we don't need to wait for an
            // answer to get the remote track.
            remoteVideoTrack = getRemoteVideoTrack();
            remoteVideoTrack.setEnabled(renderVideo);
            //目前就一个
            remoteVideoTrack.addSink(mRemoteSurfaceView);
        }

        mPeerConnection.addTrack(createAudioTrack(), mediaStreamLabels);
        if (isVideoCallEnabled()) {
            findVideoSender();
        }
    }
```

#### 4. 发送 createOffer 数据到远端

当对方加入到房间中，我们需要把当前 UserA 的 SDP 信息告诉 UserB 用户，使用如下代码

```java
public void createOffer() {
        executor.execute(() -> {
            if (mPeerConnection != null) {
                Log.d(Constants.P2PTAG, "PC Create OFFER");
                isInitiator = true;
                //1. create offer
                mPeerConnection.createOffer(sdpObserver, mSdpMediaConstraints);
            }
        });
}

//2. 当 createOffer 成功我们会收到如下回调
@Override
public void onCreateSuccess(final SessionDescription desc) {
  //然后我们需要设置当前的 SDP 
mPeerConnection.setLocalDescription(sdpObserver, newDesc);
}
//3. 当设置成功后，我们会收到 onSetSuccess 回调，然后将 UserA SDP offer 消息发送给对等方
@Override
public void onSetSuccess() {
  JSONObject message = new JSONObject();
        try {
            String type = "offer";
            if (sdp.type == SessionDescription.Type.ANSWER)
                type = "answer";
            message.put("type", type);
            message.put("sdp", sdp.description);
            sendMessage(message);
        } catch (JSONException e) {
            e.printStackTrace();
   }
}
```

#### 5. 发送 answer 消息到对方

当 UserB 收到 UserA offer 消息后的处理

```java
//1.设置 UserA SDP 描述符   
mPeerConnection.setRemoteDescription(sdpObserver, sdpRemote);
if (desc.type == SessionDescription.Type.OFFER) {
    Log.i(Constants.P2PTAG, "Creating ANSWER...");
    //2. 创建 answer 
    mPeerConnection.createAnswer(sdpObserver, mSdpMediaConstraints);
}

//3. answer 创建成功后的处理
mPeerConnection.setLocalDescription(sdpObserver, newDesc);
//4. UserB 设置成功后的处理，将 sdp 发给 UserA
JSONObject message = new JSONObject();
try {
     String type = "offer";
     if (sdp.type == SessionDescription.Type.ANSWER)
         type = "answer";
      message.put("type", type);
      message.put("sdp", sdp.description);
      sendMessage(message);
    } catch (JSONException e) {
      e.printStackTrace();
}
```



#### 6. 接收 answer 消息，并设置 UserB 的 SDP 信息

当我们收到 UserB 发来的 answer sdp 消息后告诉底层

```java
  mPeerConnection.setRemoteDescription(sdpObserver, sdpRemote);
```

#### 7. 交换 ICE 候选 

 SDP 协商完后，UserA / UserB 交换 ice 消息，用于 nat 和转发媒体数据，如果都在局域网其实可以省略这一步

```java
//user A / UserB 收到 onicecandidate 回调然后将 candidate 发送给 UserB
@Override
public void onIceCandidate(final IceCandidate iceCandidate) {
            executor.execute(() -> {
                        Log.i(Constants.P2PTAG, "onIceCandidate: " + iceCandidate);
                        try {
                            JSONObject message = new JSONObject();
                            message.put("type", "candidate");
                            message.put("label", iceCandidate.sdpMLineIndex);
                            message.put("id", iceCandidate.sdpMid);
                            message.put("candidate", iceCandidate.sdp);
                            mISignalClient.sendSignalMessage(mRoomConnectParameters.roomId, message);
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }

                    }
            );
}

//当 UserB / UserA 接收到 UserA / UserB 的candidate 后进行添加
  mPeerConnection.addIceCandidate(candidate, new AddIceObserver() {
    ...
  }
}
```

通过如上核心步骤代码，你已经完成了一个基于 **WebRTC** Android 版的 **P2P** 音视频通话系统。当然，这里展示的代码只是简化版示例，完整版的代码可以点击文末简介处有说明。

到此，你已经可以 JS <-->JS 、Android <--> Android 、JS <-->Android 平台下进行 P2P 的音视频通话了。

## 总结

本文为你介绍了如何基于 WebRTC 实现一个 P2P 音视频通话系统，和提供了一个跨平台的实现方案，主要包括以下三个部分：

1. 服务端：使用 Node.js 和 socket.io 构建的信令服务器，负责协调通信和传递 ICE 候选、SDP 信息。
2. 客户端(跨平台)：基于 WebRTC 的 JavaScript 客户端，实现浏览器端的音视频通话功能。
3. 客户端：Android 客户端，使用 Google 提供的 WebRTC 库构建音视频通话应用。

请注意，本文提供的代码是简化版示例，您可以根据项目需求进行扩展和优化。通过本教程，您应该对如何使用 WebRTC 构建 P2P 音视频通话系统有了更深入的了解，并能将其应用于实际项目中。



到此，P2P 音视频通话系统我们已经实现完了，下一篇我们会介绍视频会议的实现方案，尽请期待吧。