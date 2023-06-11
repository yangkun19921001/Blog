# WebRTC 实战: P2P 架构的多人音视频通话解决方案

## 简介

### 背景

随着互联网技术的飞速发展，实时音视频通话已经成为在线教育、远程办公、社交媒体、云游戏等领域的核心功能。WebRTC（Web Real-Time Communication）作为一项开放的实时通信标准，为开发者提供了快速构建实时音视频通话系统的能力。在本文中，我们将深入探讨如何使用 WebRTC 构建一个基于 P2P 架构的多人音视频通话解决方案。

### P2P 架构的优势

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7685eedcbc694aa5a5313305e3c2816a~tplv-k3u1fbpfcp-zoom-1.image)

P2P（Peer-to-Peer）架构的优势在于它可以直接在参与者之间建立连接，而无需经过中心服务器。这可以减少通信延迟，提高音视频质量，降低服务器带宽和计算资源消耗。同时，P2P 架构在很大程度上提高了系统的可扩展性和容错能力。



本文将从理论和实践两个层面深入探讨 WebRTC 的 P2P 多人音视频通话解决方案. 核心的多人音视频通话代码我已经封装起来了，现在你可以很方便的实现 P2P 多人音视频聊天了。代码地址: https://github.com/yangkun19921001/OpenRTCProject ,运行后 web 与 android 端就可以进行通话了，效果如下:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fd3df21ddc534d349410fc6e82c69d91~tplv-k3u1fbpfcp-zoom-1.image)


## WebRTC基本概念

在深入了解 WebRTC 的 P2P 多人音视频通话解决方案之前，我们首先需要了解一些 WebRTC 的基本概念。

### 基本组件

这个小点的内容可以移步这里: https://juejin.cn/post/7213307533279576124 

### 信令

信令是指在通话过程中协调通信双方的过程。在 WebRTC 中，信令主要负责以下几个方面：

1. 协商通信参数：通信双方需要协商一些通信参数，例如音视频编码格式、分辨率等。这些参数被封装在 SDP（会话描述协议）中，并通过信令服务器进行交换。
2. 发现和交换网络地址：由于 NAT（网络地址转换）的存在，通信双方需要发现并交换其公共网络地址。这一过程通过 ICE（Interactive Connectivity Establishment）协议来实现。

### SDP（会话描述协议）

SDP 是一种文本格式的协议，用于描述多媒体会话的属性，例如音视频编码格式、分辨率、帧率等。在 WebRTC 中，SDP 主要用于在通信双方之间协商通信参数。



### NAT穿越和ICE

由于 NAT 的存在，通信双方的私有网络地址通常无法直接访问。为了解决这个问题，WebRTC 引入了 ICE（Interactive Connectivity Establishment）协议。ICE 协议通过一系列的技术（如 STUN、TURN 服务器）帮助通信双方发现和协商可用的公共网络地址，从而实现 NAT 穿越。

ICE 的工作原理如下：

1. 首先，通信双方收集本地网络地址（包括私有地址和公共地址）以及通过 STUN 和 TURN 服务器获取的候选地址。
2. 接下来，双方通过信令服务器交换这些候选地址。
3. 通信双方使用这些候选地址进行连接测试，确定最佳的可用地址。
4. 一旦找到可用的地址，通信双方就可以开始实时音视频通话。



## 信令服务器

### 信令服务器的作用

信令服务器负责协调客户端之间的通信，主要包括交换 SDP 信息和 ICE 候选（NAT 穿越信息）。信令服务器可以使用 WebSocket、Socket.IO 等技术来实现。（咱们选择的是 Socket.io）。

### 选择合适的信令服务器

在选择信令服务器时，开发者需要考虑以下几个方面：

1. 可靠性：信令服务器需要具有高可靠性，以确保通话过程中的信令消息能够准确无误地传输。
2. 延迟：信令服务器的延迟应尽可能低，以减少通话建立过程中的等待时间。
3. 扩展性：随着用户数量的增长，信令服务器需要具有良好的扩展性，以满足更高的并发需求。
4. 安全性：信令服务器应提供安全机制，例如 SSL/TLS 加密，以防止信令消息被窃听或篡改。

## 实现多人音视频通话

在了解了 WebRTC 的基本概念和信令服务器之后，我们现在可以开始实现多人音视频通话功能。

### 设计考虑

在设计多人音视频通话解决方案时，需要考虑以下几个方面：

1. 通话连接方式：考虑到 P2P 架构的优势，本文将采用全网状连接方式，即每个客户端都直接与其他客户端建立连接。
2. 房间管理：为了实现多人音视频通话，需要引入房间的概念。每个房间可以容纳多个客户端，客户端之间可以互相通话。
3. 动态连接和断开：在多人通话过程中，新的客户端可能加入房间，而原有客户端可能离开房间。解决方案需要能够灵活地处理这些情况。



### 服务端实现: nodejs+socket.io

在上一篇文章中我们实现了[P2P 1v1 通话的解决方案](https://juejin.cn/post/7214427834994917435)，如果要实现多人的，信令服务器需要有点改动,改动不是很大，主要还是由以下几个信令组成:

#### 1. 加入房间

加入房间的回调跟之前有点不一样，当有新用户加入进来时，信令服务器需要将房间内除自己的 remoteId 告知当前用户，并且再把当前加入进来的用户告知其它用户。因为各自需要根据 remoteId 去创建 PeerConnection.

核心代码如下:

```js
socket.on('join', (room) => {
    socket.join(room);
    console.log(`Socket ID ${socket.id} joined room ${room}`);
  
    const clientsInRoom = io.sockets.adapter.rooms[room];
    const clientsCount = Object.keys(clientsInRoom.sockets).length;
  
    // 获取房间中的所有客户端 ID，除了当前加入的客户端
    const otherClientIds = Object.keys(clientsInRoom.sockets).filter(id => id !== socket.id);
  
    // 发送包含所有其他客户端 ID 的 join 消息给新加入的客户端
    socket.emit('joined',  room, socket.id, otherClientIds );
  
    // 如果房间中有多个客户端，将 join 消息发送给房间中的其他客户端
    if (clientsCount > 1) {
      socket.to(room).emit('joined',  room,  socket.id );
    }
  });
```

#### 2. 离开房间

当有用户离开时，我们需要将消息转发给同房间内的其它客户端。

```js
  socket.on('leave', (room) => {
    console.log(`User ${socket.id} left room ${room}`);

    // 发送 leave 消息给自己和房间中的其他客户端
    io.to(room).emit('leaved',  room, socket.id );

    socket.leave(room);
    console.log(`Socket ID ${socket.id} left room ${room}`);
  });
```



#### 3. 媒体信息和 ICE 交换

sdp 消息和  ice 我们通过 “message” 信令进行交换

```js
  // 发送消息到指定的房间和 socket.id
  socket.on('message', ( room, id, msg ) => {
    const sender = socket.id;
    const clientsInRoom = io.sockets.adapter.rooms[room];
    if (clientsInRoom && clientsInRoom.sockets.hasOwnProperty(id)) {
      socket.to(id).emit('message', sender, id, msg);
    } else {
      console.log(`Socket ID ${id} is not in room ${room}`);
    }
  });
```



对流程不太明白的可以看下这张图，其它的交互与上一篇的信令流程一样。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9799b7aa42394a2e85bd948c2542fdb1~tplv-k3u1fbpfcp-zoom-1.image)



### 客户端实现：Web

在本节中，我们将介绍如何基于WebRTC 实现 Web 端的多人音视频通话客户端。具体内容包括：

#### 网页布局

首先，创建一个简单的网页布局，包括以下几个部分：

1. 本地音视频预览窗口
2. 远程音视频窗口列表
3. 加入房间按钮
4. 离开房间按钮
5. 输入信令服务器地址框

```html
<!-- 本地音视频预览窗口 -->
<video id="localVideo" autoplay muted playsinline></video>

<!-- 远程音视频窗口列表 -->
<div id="remoteVideos"></div>

<!-- 加入房间按钮 -->
<button id="joinBtn">Join Room</button>

<!-- 离开房间按钮 -->
<button id="leaveBtn">Leave Room</button>

<!-- 信令服务器地址 -->
<input type="text" id="serverUrl" value="https://xxx.xxx">
```



#### 获取本地音视频流

使用 `getUserMedia` API 获取本地音视频流，并将其显示在本地预览窗口上：

```js
navigator
  .mediaDevices
  .getUserMedia({ audio: true, video: true })
  .then(stream => { 
  const localVideo = document
  .getElementById('localVideo'); 
  localVideo.srcObject = stream;   
  }).catch(error => { 
  console.error('Error accessing media devices.', error); 
});
```

#### 与信令服务器交互

与信令服务器交互的基本步骤如下：

1. 建立与信令服务器的 SocketIO 连接。

   ```js
     // 连接信令服务器
     socket = io.connect(serverUrl.value);
   ```

2. 监听信令服务器发来的消息，并根据消息类型进行处理。

   ```js
     // 处理消息事件
     socket.on('message', (sender, receiver, msg) => {
       const message = msg;
       const peer = peers[sender];
   
       if (message.type == 'offer') {
           // 添加对方 SDP
           // createAnswer -> 设置本地 SDP 
       }else if(message.type == 'answer'){
           // 添加对方 SDP
       }else if(message.type == 'candidate')
       {
           //添加 candidate 
       }
     });
   ```

   

3. 发送消息给信令服务器，例如加入房间 join、发送 Offer、发送 Answer 等。

 ```js
 // 加入房间
 socket.emit('join', roomInput.value);
 //发送 answer sdp
 socket.emit('message', roomInput.value, sender, { type:'answer',sdp:    peer.localDescription.sdp });
 //发送 offer sdp 消息
socket.emit('message', room, remoteId, { type:'offer',sdp: peer.localDescription.sdp });
//发送 ice candidate 消息
socket.emit('message', room, remoteId, {
           type: 'candidate',
           label:event.candidate.sdpMLineIndex, 
           id:event.candidate.sdpMid, 
           candidate: event.candidate.candidate
       });
 ```



#### 创建和管理 RTCPeerConnection

为了实现多人音视频通话，需要为每个远程客户端创建一个 `RTCPeerConnection` 实例，并执行信令流程。同时，需要管理这些实例，以便在客户端加入或离开房间时进行相应的操作。

```js
//管理多个 peer 对象
let peers = {};
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const peer = new RTCPeerConnection(configuration);

```



#### 展示远程音视频流

将收到的远程音视频流显示在页面上，可以使用以下方法：

1. 为每个远程客户端创建一个 `<video>` 元素。
2. 将远程音视频流设置为 `<video>` 元素的 `srcObject` 属性。
3. 将 `<video>` 元素添加到远程音视频窗口列表中。

```js
function addRemoteVideo(peerId, stream) {
  const remoteVideos = document.getElementById('remoteVideos');
  const video = document.createElement('video');
  video.id = peerId;
  video.srcObject = stream;
  video.autoplay = true;
  video.playsinline = true;
  remoteVideos.appendChild(video);
}

function removeRemoteVideo(peerId) {
  const remoteVideos = document.getElementById('remoteVideos');
  const video = document.getElementById(peerId);
  if (video) {
    remoteVideos.removeChild(video);
  }
}
```



#### 实现房间管理

为了实现房间管理，需要处理以下几个操作：

1. 加入房间：当用户点击“加入房间”按钮时，发送加入房间的消息给信令服务器。
2. 离开房间：当用户点击“离开房间”按钮时，发送离开房间的消息给信令服务器，并关闭所有 `RTCPeerConnection` 实例。

```js
const joinBtn = document.getElementById('joinBtn');
const leaveBtn = document.getElementById('leaveBtn');

joinBtn.addEventListener('click', () => {
  // 发送加入房间的消息给信令服务器
  const message = { type: 'join', roomId: 'your-room-id' };
  socket.send(JSON.stringify(message));
});

leaveBtn.addEventListener('click', () => {
  // 发送离开房间的消息给信令服务器
  const message = { type: 'leave', roomId: 'your-room-id' };
  socket.send(JSON.stringify(message));

  // 关闭并删除所有 RTCPeerConnection 实例
  peerConnections.forEach((peerConnection, peerId) => {
    removePeerConnection(peerId);
  });
});
```



### 客户端实现：Android

在本节中，我们将介绍如何实现一个基于 WebRTC Android 的多人音视频通话客户端。具体内容包括：

1. Android WebRTC 源码 / SDK 依赖集成
2. 获取本地音视频流
3. 与信令服务器交互
4. 创建和管理 `RTCPeerConnection`
5. 展示远程音视频流
6. 实现房间管理



#### Android WebRTC 集成

首先，需要在 Android 项目中集成 WebRTC 库。可以参考 [WebRTC 官方文档](https://webrtc.github.io/webrtc-org/native-code/android/) 进行集成, 也可以看 [webrtc_android_gradle](https://github.com/yangkun19921001/OpenRTCClient/blob/develop/examples/android_gradle/p2ps)。



#### 获取本地音视频流

在 Android 应用中，使用 `MediaStream` API 获取本地音视频流。以下是一个简单的示例：

```java
// 创建音视频流
MediaStream localStream = peerConnectionFactory.createLocalMediaStream("localStream");

// 获取音频设备并创建音频轨道
AudioSource audioSource = peerConnectionFactory.createAudioSource(new MediaConstraints());
AudioTrack audioTrack = peerConnectionFactory.createAudioTrack("audioTrack", audioSource);
localStream.addTrack(audioTrack);

// 获取视频设备并创建视频轨道
VideoCapturer videoCapturer = createVideoCapturer(); // 创建 VideoCapturer 实例的方法
VideoSource videoSource = peerConnectionFactory.createVideoSource(videoCapturer.isScreencast());
VideoTrack videoTrack = peerConnectionFactory.createVideoTrack("videoTrack", videoSource);
localStream.addTrack(videoTrack);

// 将本地音视频流显示在 SurfaceViewRenderer 上
localVideoTrack.addSink(localVideoRenderer);
```



#### 与信令服务器交互

与信令服务器交互的基本步骤类似于 Web 客户端。在 Android 应用中，我们还是使用 Socket.io 与信令服务器建立连接，并处理相关消息。

```java
    @Override
    public void connect(String url, ISignalEventListener listener) {
        try {
            this.events = listener;
            IO.Options options = new IO.Options();
            SocketSSL.set(options);
            socket = IO.socket(url, options);
            setSocketListener();
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
        socket.connect();
    }
```



#### 创建和管理 RTCPeerConnection

在 Android 应用中创建和管理 `RTCPeerConnection` 的方法与 Web 客户端类似。需要为每个远程客户端创建一个 `RTCPeerConnection` 实例，并执行信令流程。同时，需要管理这些实例，以便在客户端加入或离开房间时进行相应的操作。

```java
//为每个 remoteId 管理 RTCPeerConnection 
private Map<String, RTCPeerConnection> peerConnections = new HashMap<>();

//处理远端用户加入的流程
@Override
public void onJoined(String room, String remoteId, JSONArray otherClientIds) {
        if (remoteId.equals(socket.getSocketId())) {
            Log.d(Constants.P2PSTAG, "Joined room " + room + " with ID " + remoteId);
            if (otherClientIds == null || otherClientIds.length() == 0) {
                Log.d(Constants.P2PSTAG, "Joined room " + room + " with ID " + remoteId + " joom other size:" + 0);
                return;
            }
            // 遍历 otherClientIds 并为每个客户端创建一个新的 PeerConnection
            for (int i = 0; i < otherClientIds.length(); i++) {
                try {
                    String otherClientId = otherClientIds.getString(i);
                    pm.createPeerConnection(otherClientId, false);
                    Log.d(Constants.P2PSTAG, "createPeerConnection Remote joined room " + room + " with ID " + otherClientId);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        } else {
            Log.d(Constants.P2PSTAG, "Remote client joined room " + room + " with ID " + remoteId);
            pm.createPeerConnection(remoteId, true);
        }
    }

    public void removePeerConnection(String room, String remoteId) {
        executor.execute(() -> {
            // 移除 PeerConnection
            PeerConnection peerConnection = peerConnections.remove(remoteId);
            if (peerConnection != null) {
                peerConnection.close();
            }

            if (peerEventListener != null) {
                peerEventListener.onRemoveRemoteStream(remoteId);
            }
        });
    }
```

这里有一点需要特别注意一下，就是 **createPeerConnection** 的创建时机，当远端用户加入进来时我们需要根据加入进来的 remoteId 来判断是否是自己，如果是自己我们需要根据 otherClientIds 字段遍历房间中已经存在的 remoteId ，然后为其创建对应的 PeerConnection 对象。如果当前加入进来的 remoteId 与自己不相同，说明自己是已经在房间中了，这个时候也需要根据 remoteId 来创建 PeerConnection 并 createOffer 。 这样我们就比较容易管理多个 PeerConnection 对象了。

#### 展示远程音视频流

在 Android 应用中展示远程音视频流，可以使用 `SurfaceViewRenderer` 控件。将收到的远程音视频流添加到 `SurfaceViewRenderer` 控件上，以显示远程画面。

```java
            @Override
            public void onAddStream(MediaStream mediaStream) {
                super.onAddStream(mediaStream);
                Log.d(Constants.P2PSTAG, "onAddStream UserId:" + getUserId());
                if (mediaStream.videoTracks.size() > 0) {
                    VideoTrack remoteVideoTrack = mediaStream.videoTracks.get(0);
                    if (peerEventListener != null) {
                        peerEventListener.onAddRemoteStream(remoteVideoTrack, getUserId());
                    }
                }
            }
```

当我们收到 onAddStream 回调时，通知 UI 线程 创建 VideoSink ，让后将其添加到 remoteVideoTrack 轨道中，可以参考其代码:

```java
    @Override
    public void addRemoteStream(VideoTrack track, String remoteId) {
        runOnUiThread(() -> {
            SurfaceViewRenderer videoRenderer = createVideoRenderer();
            addSurfaceView(videoRenderer);
            track.addSink(videoRenderer);
            videoRenderers.put(remoteId, videoRenderer);
        });
    }
```

当收到 leaved 信令消息时，我们需要将远端的视频窗口删除掉，代码如下:

```java
    @Override
    public void removeRemoteStream(String remoteId) {
        runOnUiThread(() -> {
            SurfaceViewRenderer renderer = videoRenderers.get(remoteId);
            if (renderer != null) {
                mGridLayout.removeView(renderer);
                renderer.release();
                renderer = null;
            }
        });
    }
```



#### 实现房间管理

为了实现房间管理，需要处理以下几个操作：

1. 加入房间：当用户点击“加入房间”按钮时，发送加入房间的消息给信令服务器。
2. 离开房间：当用户点击“离开房间”按钮时，发送离开房间的消息给信令服务器，并关闭所有 `RTCPeerConnection` 实例。

```java
joinBtn.setOnClickListener(view -> {
  // 发送加入房间的消息给信令服务器
  JSONObject message = new JSONObject();
  message.put("type", "join");
  message.put("roomId", "your-room-id");
  socket.send(message.toString());
});

leaveBtn.setOnClickListener(view -> {
  // 发送离开房间的消息给信令服务器
  JSONObject message = new JSONObject();
  message.put("type", "leave");
  message.put("roomId", "your-room-id");
  socket.send(message.toString());

  // 关闭并删除所有 RTCPeerConnection 实例
  for (Map.Entry<String, RTCPeerConnection> entry : peerConnections.entrySet()) {
    removePeerConnection(entry.getKey());
  }
});
```

## 优化和扩展

在实现多人音视频通话的基础上，还可以进行优化和扩展，以提高音视频质量和用户体验。

### 优化音视频质量

1. 限制分辨率和帧率：可以根据网络状况和设备性能，限制音视频流的分辨率和帧率。这可以降低带宽消耗和计算需求，从而提高音视频质量。

2. 使用合适的编解码器：选择合适的编解码器（如 H.264 或 VP8）可以显著影响音视频质量。根据应用场景和设备兼容性，选择最合适的编解码器。

### 网络适应性

WebRTC 提供了网络适应性功能，可以根据网络状况自动调整音视频质量。这有助于在网络不稳定时维持良好的音视频体验。可以在创建 `RTCPeerConnection` 时，通过配置 `RTCConfiguration` 启用网络适应性。

### 安全性和隐私保护

1. 使用安全的传输协议：在实现多人音视频通话时，务必使用安全的传输协议（如 HTTPS 和 WSS）保护数据传输的安全。
2. 对信令数据进行加密：为了保护用户隐私，可以对信令服务器传输的数据进行加密，以防止数据泄露。

### 集成其他 WebRTC 功能

1. 屏幕共享：在多人音视频通话的基础上，可以增加屏幕共享功能，使用户能够共享屏幕内容。WebRTC web 端提供了 `getDisplayMedia` API，android 端可以通过`MediaProjectionManager` 方便地实现屏幕共享功能。
2. 数据通道：WebRTC 的 `RTCDataChannel` API 允许在 P2P 连接中传输任意数据。可以利用数据通道实现聊天、文件传输等功能。

## 总结

> 文章中的代码部分不是完整的，有些甚至是伪代码，详细代码还是建议把源码 clone 下来看。

本文介绍了如何使用 WebRTC 实现多人音视频通话，重点讲解了 WebRTC 的基本概念、信令服务器的编写、以及 Web 和 Android 客户端的实现。通过 P2P 架构，WebRTC 可以为实时通信提供低延迟、高质量的音视频体验。

在实现多人音视频通话的基础上，还可以进行优化和扩展，以提高音视频质量、网络适应性、安全性和隐私保护。此外，可以集成其他 WebRTC 功能，如屏幕共享和数据通道，实现更丰富的实时通信应用。