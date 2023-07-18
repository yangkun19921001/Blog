## 简介

在经过前面几篇文章对 [WebRTC](https://chromiumdash.appspot.com/branches)  的描述，相信已经不需再过多对它介绍了。前面几篇文章我们实现了 Web 、Android 端的音视频通话项目，该篇我们使用 QT UI 框架搭建 Windows 端的多 P2P 音视频通话实战项目。

项目地址:https://github.com/yangkun19921001/OpenRTCClient/tree/develop/examples/p2ps/p2ps

最终与 Android、Web 端运行后的效果如下:

![img_v2_2460f4ab-2447-4694-9771-45d5846f471g](http://devyk.top/2022/202307161407292.jpg)

## 环境搭建

### 1. QT 环境准备

首选我们去下载 QT 6.6.0 最新版本，下载地址为: https://www.qt.io/download ,安装好后选择 cmake 进行构建项目

### 2. 信令服务器准备

**2.1 clone 信令服务器代码**

```shell
git clone https://github.com/yangkun19921001/OpenRTCProject.git
```

**2.2 启动信令服务器**

```js
cd p2ps/server

//修改你自己的证书
const server = process.env.HTTPS === 'true' ? http.createServer({
    key : fs.readFileSync('./cert/rtcmedia.top.key'),
    cert: fs.readFileSync('./cert/rtcmedia.top_bundle.pem')
  }, app): http.createServer(app);

//执行启动命令
./server_run.js
./proxy_server_run.js

//查看是否启动成功
lsof -i:8880 和 443

```

### 3. webrtc 静态库准备

1.  clone webrtc(m98) develop 代码

   ```
   git clone https://github.com/yangkun19921001/OpenRTCClient.git
   ```

2. 按照 README 进行编译，编译完成后拿到静态库 build/win/debug/obj/webrtc.lib

### 4. socketio-client-cpp 2.0.0 静态库准备

按照官方文档进行编译，可参考:https://github.com/socketio/socket.io-client-cpp/blob/2.0.0/INSTALL.md#with-cmake



### 5. QT cmake 编写

上序 4 步如果都准备好，那么就可以通过 cmake 进行将其依赖进来，如下所示:

```cmake
cmake_minimum_required(VERSION 3.5)
project(p2ps VERSION 0.1 LANGUAGES CXX)
set(CMAKE_AUTOUIC ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(BUILD_TYPE debug)
if(MSVC)
    if(CMAKE_BUILD_TYPE MATCHES Debug)
        set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} /MTd")
        set(CMAKE_C_FLAGS_DEBUG "${CMAKE_C_FLAGS_DEBUG} /MTd")
    elseif(CMAKE_BUILD_TYPE MATCHES Release)
        set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} /MT")
        set(CMAKE_C_FLAGS_RELEASE "${CMAKE_C_FLAGS_RELEASE} /MT")
        #set(BUILD_TYPE release)
    endif()
endif()
set(WEBRTC_THIRD_PARTY_PATH ${CMAKE_CURRENT_SOURCE_DIR}/../../../webrtc/third_party)
set(LIBWEBRTC_INCLUDE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/../../../webrtc)
set(LIBWEBRTC_BINARY_PATH ${CMAKE_CURRENT_SOURCE_DIR}/../../../build_system/build/win/x64/${BUILD_TYPE}/obj)

set(DEPS_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR}/deps)
set(SOCKET_IO_BINARY_PATH  ${DEPS_ROOT_PATH}/socketio/win/x64/${BUILD_TYPE})
set(SOCKET_IO_INCLUDE_PATH  ${DEPS_ROOT_PATH}/socketio/include)

set(JSONCPP_SOURCE
    "${WEBRTC_THIRD_PARTY_PATH}/jsoncpp/source/src/lib_json/json_reader.cpp"
    "${WEBRTC_THIRD_PARTY_PATH}/jsoncpp/source/src/lib_json/json_tool.h"
    "${WEBRTC_THIRD_PARTY_PATH}/jsoncpp/source/src/lib_json/json_value.cpp"
    "${WEBRTC_THIRD_PARTY_PATH}/jsoncpp/source/src/lib_json/json_writer.cpp"
)


target_include_directories(${PROJECT_NAME} PUBLIC
        "${LIBWEBRTC_INCLUDE_PATH}"
        "${LIBWEBRTC_INCLUDE_PATH}/third_party/abseil-cpp"
        "${LIBWEBRTC_INCLUDE_PATH}/third_party/jsoncpp/source/include"
        "${LIBWEBRTC_INCLUDE_PATH}/third_party/jsoncpp/generated"
        "${LIBWEBRTC_INCLUDE_PATH}/third_party/libyuv/include"
        "${SOCKET_IO_INCLUDE_PATH}"
)

add_definitions(
        #webrtc & qt 冲突
        -DQT_DEPRECATED_WARNINGS
        -DQT_NO_KEYWORDS

        #jsoncpp
        -DJSON_USE_EXCEPTION=0
        -DJSON_USE_NULLREF=0

        #socketio
        #-DSIO_TLS

        -DUSE_AURA=1
        -D_HAS_EXCEPTIONS=0
        -D__STD_C
        -D_CRT_RAND_S
        -D_CRT_SECURE_NO_DEPRECATE
        -D_SCL_SECURE_NO_DEPRECATE
        -D_ATL_NO_OPENGL
        -D_WINDOWS
        -DCERT_CHAIN_PARA_HAS_EXTRA_FIELDS
        -DPSAPI_VERSION=2
        -DWIN32
        -D_SECURE_ATL
        -DWINUWP
        -D__WRL_NO_DEFAULT_LIB__
 #       -DWINAPI_FAMILY=WINAPI_FAMILY_PC_APP
        -DWIN10=_WIN32_WINNT_WIN10
        -DWIN32_LEAN_AND_MEAN
        -DNOMINMAX
        -D_UNICODE
        -DUNICODE
        -DNTDDI_VERSION=NTDDI_WIN10_RS2
        -D_WIN32_WINNT=0x0A00
        -DWINVER=0x0A00
        -DDEBUG
        -DNVALGRIND
        -DDYNAMIC_ANNOTATIONS_ENABLED=0
        -DWEBRTC_ENABLE_PROTOBUF=0
        -DWEBRTC_INCLUDE_INTERNAL_AUDIO_DEVICE
        -DRTC_ENABLE_VP9
        -DHAVE_SCTP
        -DWEBRTC_LIBRARY_IMPL
        -DWEBRTC_NON_STATIC_TRACE_EVENT_HANDLERS=0
        -DWEBRTC_WIN
        -DABSL_ALLOCATOR_NOTHROW=1
        -DHAVE_SCTP
        -DWEBRTC_VIDEO_CAPTURE_WINRT)
        
        target_link_libraries(p2ps PRIVATE
        ...
        ${SOCKET_IO_BINARY_PATH}/sioclient.lib ${SOCKET_IO_BINARY_PATH}/sioclient_tls.lib

        ${LIBWEBRTC_BINARY_PATH}/webrtc.lib
        winmm.lib iphlpapi.lib wbemuuid.lib secur32.lib advapi32.lib Mmdevapi.lib
        Mfuuid.lib msdmo.lib dmoguids.lib wmcodecdspuuid.lib  comdlg32.lib dbghelp.lib
        dnsapi.lib gdi32.lib msimg32.lib odbc32.lib odbccp32.lib oleaut32.lib shell32.lib
        shlwapi.lib user32.lib usp10.lib uuid.lib version.lib wininet.lib winmm.lib   
        winspool.lib ws2_32.lib delayimp.lib kernel32.lib ole32.lib crypt32.lib
        amstrmid.lib strmiids.lib
)
```

 

到此，在 QT 项目中的 WebRTC 和 SocketIO 环境已经搭建完成了，这里为什么要搭建 SocketIO 呢？因为在之前的  web 、server、Android 都使用的是 socketio 开源库来做的信令通信，正好它又是跨平台的，所以就不再更换了。

## 如何构建多人音视频通话?

要在 QT 中构建一个多人的音视频通话项目，必定要经过如下几个步骤

### 1. 信令交互协议

server 端的信令其实设计的很简单，就三组信令，如下所示:

join > joined ：加入房间和加入成功的通知
leave > leaved：离开房间和离开成功的通知
message：交换 offer ,candidate 

更加详细的流程可以参考下面的流程图
![](http://devyk.top/2022/202303221325023.png) 



### 2. 本地信令交互封装

首先定义 ISinnalClient.h 抽象接口

```c++
namespace PCS{
class ISignalClient {
public:
    enum class SignalEvent {
        JOINED = 0,
        JOIN,
        LEAVED,
        LEAVE,
        MESSAGE
    };

    static std::string SignalEventToString(SignalEvent event) {
        switch(event) {
        case SignalEvent::JOINED:  return "joined";
        case SignalEvent::LEAVED:  return "leaved";
        case SignalEvent::JOIN:    return "join";
        case SignalEvent::LEAVE:   return "leave";
        case SignalEvent::MESSAGE: return "message";
        default: return "unknown";
        }
    }

    /*连接服务端*/
    virtual bool connect(const std::string url,OnSignalEventListener* listener) = 0;
    /*加入会话*/
    virtual void join(const std::string roomId) = 0;
    /*离开会话*/
    virtual void leave(const std::string roomId) = 0;
    /*销毁 client */
    virtual void release() = 0;
    /*发送消息*/
    virtual void sendMessage(const std::string roomId, const std::string remoteId, const std::string message) = 0;

    virtual std::string getSocketId() = 0;
    virtual ~ISignalClient() = default;
};

}
```

然后 socketio 根据对应的 api 去封装实现即可，详细的使用，可以参考 https://github.com/yangkun19921001/OpenRTCClient/blob/develop/examples/p2ps/p2ps/src/common/SocketIoSignalClientImpl.cpp

### 3. 多 PeerConnection 管理

多 PeerConnection 管理其实就是把每次加入房间的 Peer 添加到一个容器中，管理起来。这里我们可以定义一个 map 结构进行管理，核心 api 如下

**3.1 定义一个 PeerConnection 管理结构体**

```c++
struct Peer
{
    Peer() {}
    rtc::scoped_refptr<webrtc::PeerConnectionInterface> peer_conn_inter_;
    std::unique_ptr<PeerConnectionObserverImpl> peer_conn_obser_impl_;
    std::unique_ptr<CreateSessionDescriptionObserImpl> create_offer_sess_des_impl_;
    std::unique_ptr<CreateSessionDescriptionObserImpl> create_answer_sess_des_impl_;
};
```

内部主要包含每个 PeerConnection 所需要的成员，然后通过 std::map 进行管理，如下所示

```c++
std::map<std::string ,std::unique_ptr<Peer>> peers_;
```

map 中的key 就是连接到房间中的 id

**3.2 创建 PeerConnectionFactory**

通过如下核心代码即可创建出 PeerConnectionFactory

```c++
       peer_connection_factory_ = webrtc::CreatePeerConnectionFactory(
           this->network_thread_.get() /* network_thread */,
           this->worker_thread_.get() /* worker_thread */,
           this->signaling_thread_.get(), /* signaling_thread */
           nullptr /* default_adm */,
           webrtc::CreateBuiltinAudioEncoderFactory(),
           webrtc::CreateBuiltinAudioDecoderFactory(),
           webrtc::CreateBuiltinVideoEncoderFactory(),
           webrtc::CreateBuiltinVideoDecoderFactory(), nullptr /* audio_mixer */,
           nullptr /* audio_processing */);
```

当创建成功后，再创建本地音视频轨道，后续会将本地音视频轨道添加到 PeerConnection 中

```c++
//音频轨道
 audio_track_  = peer_connection_factory_->CreateAudioTrack(
        kAudioLabel, peer_connection_factory_->CreateAudioSource(
            cricket::AudioOptions()));
 //视频轨道
  rtc::scoped_refptr<CameraCapturerTrackSource> video_device =
      CameraCapturerTrackSource::Create(1280,720,30);
  video_track_ =
      peer_connection_factory_->CreateVideoTrack(kVideoLabel, video_device);
```



**3.3 创建 PeerConnection**

```c++
bool PeerManager::createPeerConnection(const std::string &peerId, const webrtc::PeerConnectionInterface::RTCConfiguration &config
                                       ,  OnPeerManagerEvents* ets)
{
  RTC_LOG(LS_INFO) <<__FUNCTION__ <<" peerId:"<<peerId;
  RTC_DCHECK(peer_connection_factory_);
      std::unique_ptr<PeerConnectionObserverImpl> peer_conn_obimpl =
          std::make_unique<PeerConnectionObserverImpl>(peerId,ets);
      auto peerConnection = peer_connection_factory_->CreatePeerConnection(
          config,
          nullptr,
          nullptr,
          peer_conn_obimpl.get());
      if (peerConnection) {
          auto peer_ptr = std::make_unique<Peer>();
          peer_ptr->peer_conn_inter_ = peerConnection;
          peer_ptr->peer_conn_obser_impl_ =std::move(peer_conn_obimpl);
          peers_[peerId] = std::move(peer_ptr);
          if(video_track_)
           peerConnection->AddTrack(video_track_, { kVideoLabel });
           if(audio_track_)
          peerConnection->AddTrack(audio_track_, { kAudioLabel });
          return true;
      }
      return false;
}
```

由上面的代码得知，我们通过 `peer_connection_factory_->CreatePeerConnection` 就可以构建一个 PeerConnection ，并把之前创建出来的本地音视频轨道添加到 PeerConnection 中，最后我们将构建出来的 PeConn 缓存到 map 中，便于后续的处理。

**3.4 创建 offer**

```c++
void PeerManager::createOffer(const std::string &peerId, OnPeerManagerEvents* ets)
{
  RTC_LOG(LS_INFO) <<__FUNCTION__ <<" peerId:"<<peerId;
  auto it = peers_.find(peerId);
  if (it != peers_.end() && it->second->peer_conn_inter_ != nullptr) {
      auto obs = std::make_unique<CreateSessionDescriptionObserImpl>(true,peerId,ets);
      it->second->peer_conn_inter_->CreateOffer(obs.get(), webrtc::PeerConnectionInterface::RTCOfferAnswerOptions());
      it->second->create_offer_sess_des_impl_ = std::move(obs);
  }else {
      RTC_LOG(LS_ERROR) << __FUNCTION__ <<  " peers_ not found id:"<<peerId;

  }
}
```

上面的代码，首先根据 peerId 从缓存中拿到对应的 PeerConnection ,然后再调用它内部的 api 来进行 CreateOffer

**3.5 设置本地/远端 SDP**

```c++
void PeerManager::setLocalDescription(const std::string &peerId,webrtc::SessionDescriptionInterface *desc_ptr)
{
  RTC_LOG(LS_INFO) <<__FUNCTION__ <<" peerId:"<<peerId;
  auto pt = peers_.find(peerId);
  if (pt != peers_.end()) {
      pt->second->peer_conn_inter_->SetLocalDescription(SetSessionDescriptionObserverImpl::Create(),desc_ptr);

  }else {
      RTC_LOG(LS_ERROR) << __FUNCTION__ <<  " peers_ not found id:"<<peerId;

  }
}

void PeerManager::setRemoteDescription(const std::string &peerId,webrtc::SessionDescriptionInterface *desc_ptr)
{
  RTC_LOG(LS_INFO) <<__FUNCTION__ <<" peerId:"<<peerId;
  auto pt = peers_.find(peerId);
  if (pt != peers_.end()) {
  pt->second->peer_conn_inter_->SetRemoteDescription(SetSessionDescriptionObserverImpl::Create(),desc_ptr);
  }else {
  RTC_LOG(LS_ERROR) << __FUNCTION__ <<  " peers_ not found id:"<<peerId;

  }
}
```

从缓存中拿到对应的 `PeerConnection` ,然后设置本地或远端的 sdp 描述信息

**3.6 创建 answer**

```c++
void PeerManager::createAnswer(const std::string &peerId, OnPeerManagerEvents* ets)
{
 RTC_LOG(LS_INFO) <<__FUNCTION__ <<" peerId:"<<peerId;
  auto it = peers_.find(peerId);
  if (it != peers_.end() && it->second->peer_conn_inter_ != nullptr) {
      auto obs = std::make_unique<CreateSessionDescriptionObserImpl>(false,peerId,ets);
      it->second->peer_conn_inter_->CreateAnswer(obs.get(), webrtc::PeerConnectionInterface::RTCOfferAnswerOptions());
      it->second->create_answer_sess_des_impl_ = std::move(obs);
  }else {
      RTC_LOG(LS_ERROR) << __FUNCTION__ <<  " peers_ not found id:"<<peerId;

  }
}
```

此处与上一步逻辑一样

**3.7 处理 ice**

```c++
void PeerManager::handleCandidate(std::string peerId, std::unique_ptr<webrtc::IceCandidateInterface> candidate)
{
      RTC_LOG(LS_INFO) << __FUNCTION__ <<" peerId:"<<peerId;
      auto pt = peers_.find(peerId);
      if (pt != peers_.end()) {
          pt->second->peer_conn_inter_->AddIceCandidate(
              std::move(candidate),
              [peerId](webrtc::RTCError error){
                  if (error.ok()) {
                      RTC_LOG(LS_INFO) <<" peerId:"<< peerId << " AddIceCandidate success.";
                  } else {
                      RTC_LOG(LS_INFO) <<" peerId:"<< peerId << "AddIceCandidate failed, error: " << error.message();
                  }
       });
    }else {
          RTC_LOG(LS_ERROR) << __FUNCTION__ <<  " peers_ not found id:"<<peerId;

    }
}
```

也是从缓存中拿到对应的 PeerConnection ，然后将对方的候选者地址添加进去。

### 4. 房间管理

定义 RTCRoomManager ，实现信令回调和PeerManager 回调，定义的核心 API 如下

```c++

namespace PCS{

class RTCRoomManager : public OnSignalEventListener,public OnPeerManagerEvents {
public:
    RTCRoomManager();
    virtual ~RTCRoomManager();

    //连接服务器
    void connect(const std::string url,OnRoomStateChangeCallback* callback);
    //设置本地轨道的回调监听
    void setLocalTrackCallback(std::function<void(std::string,int,int,rtc::scoped_refptr<webrtc::VideoTrackInterface>)> localVideoTrack);
    //加入房间
    void join(const std::string roomId);
    //离开房间
    void leave(const std::string roomId);
    //销毁
    void release();
    //处理 ui 传递过来的 消息
    void onUIMessage(Message msg);

private:
    //实现连接成功的处理代码
    void onConnectSuccessful() override;
    //实现正在连接的处理代码
    void onConnecting() override ;
    //实现连接错误的处理代码
    void onConnectError(const std::string& error) override ;
    //实现已加入房间的处理代码
    void onJoined(const std::string& room, const std::string& id, const std::vector<std::string>& otherClientIds) override;
    //实现离开房间的处理代码
    void onLeaved(const std::string& room, const std::string& id) override ;
    //实现接收到消息的处理代码
    void onMessage(const std::string& from, const std::string& to, const std::string& message) override ;

    //当需要添加远端的轨道
     void OnAddTrack(std::string peerid,
                            rtc::scoped_refptr<webrtc::RtpReceiverInterface> receiver,
                            const std::vector<rtc::scoped_refptr<webrtc::MediaStreamInterface>>&
                                streams)override;
    //当删除远端的轨道
     void OnRemoveTrack(std::string peerid,
                               rtc::scoped_refptr<webrtc::RtpReceiverInterface> receiver) override;
     // datachannel 消息
     void OnDataChannel(std::string peerid,
                               rtc::scoped_refptr<webrtc::DataChannelInterface> channel) override;
     //ice 消息                          
     void OnIceCandidate(std::string peerid,const webrtc::IceCandidateInterface* candidate) override;
     //offer or answer create 成功
     void OnCreateSuccess(bool offer,std::string peerid,webrtc::SessionDescriptionInterface* desc) override;
     //offer or answer create 失败
     void OnCreateFailure(bool offer,std::string peerid,webrtc::RTCError error) override;




private:
    std::unique_ptr<ISignalClient> socket_signal_client_imp_;
    std::unique_ptr<PeerManager> peer_manager_;
    OnRoomStateChangeCallback * room_state_change_callback_;
    std::function<void(std::string,int,int,rtc::scoped_refptr<webrtc::VideoTrackInterface>)> local_track_callback_;
    std::string room_id_;

};

} // end namespace PCS
```

这就是核心 API, 它持有 `peer_manager`_、`socket_signal_client_imp_` ，分别是对 PeerConnection 和信令的交互。

比如现在 A 用户先进入房间，B 后进入房间，然后对它们的管理流程是这样的

1. A 用户连接服务器 -> 连接成功 ->发起 join 信令->收到 joined 信令->createPeerConnectionFactory->摄像头开始采集->等待预览
2. B 用户连接服务器 -> 连接成功 ->发起 join 信令 ->收到joined 信令(并带上了 A 用户在房间中的信息) ->createPeerConnectionFactory->等待本地预览->createPeerConnection(A用户)
3. A 用户收到 B 用户 joined 加入房间的信令 -> createOffer -> 设置本地 SDP -> 发送 本地 SDP offer 信令到服务器
4. B 用户收到 服务器转发过来的 A 用户的 offer 信令 -> 设置远端的 SDP 信息 ->CreateAnswer(A用户)->设置本地 SDP 信息 -> 发送 answer 消息给 A
5. A 收到 B 发送的 answer 信令消息，调用 setRemoteDescription  函数将 B 的 SDP 设置进去
6. A,B 交换 candidate 消息，并将对方的 candidate 调用 AddIceCandidate 添加进去
7. 到这一步后，就等待 onAddTrack 回调了，下一步就是如何将对方和本地的画面进行显示了 

### 5. 如何显示 

在 webrtc 架构中，是通过 `rtc::VideoSinkInterface<webrtc::VideoFrame>` 的 `onFrame` 虚函数进行通知需要新视频数据的渲染。

我们定义一个 VideoRendererWidget 然后实现 `rtc::VideoSinkInterface<webrtc::VideoFrame>` 的 onFrame 函数，如下所示:

```c++
namespace PCS {
class VideoRendererWidget : public QOpenGLWidget, protected QOpenGLFunctions,
                            public rtc::VideoSinkInterface<webrtc::VideoFrame>
{
    Q_OBJECT

public:
    VideoRendererWidget(std::string peerId ="",QWidget* parent = nullptr,webrtc::VideoTrackInterface *track =nullptr);
    ~VideoRendererWidget();

public Q_SLOTS:
    void PlayOneFrame();

protected:
    void initializeGL() Q_DECL_OVERRIDE;
    void resizeGL(int w, int h) Q_DECL_OVERRIDE;
    void paintGL() Q_DECL_OVERRIDE;



public:
    // VideoSinkInterface implementation
    void OnFrame(const webrtc::VideoFrame& frame) override;


private:
...

public:
   webrtc::VideoTrackInterface*  video_track_;
};

}

void VideoRendererWidget::OnFrame(const webrtc::VideoFrame &video_frame)
{
    std::lock_guard<std::mutex> guard(renderer_mutex_);
    rtc::scoped_refptr<webrtc::I420BufferInterface> buffer(
        video_frame.video_frame_buffer()->ToI420());
    if (video_frame.rotation() != webrtc::kVideoRotation_0) {
        buffer = webrtc::I420Buffer::Rotate(*buffer, video_frame.rotation());
    }

    int width = buffer->width();
    int height = buffer->height();

    int ySize = width * height;
    int uvSize = ySize / 4;  // For each U and V component

    if(m_nVideoW == 0 && m_nVideoH ==0)
    {
       if(!peer_id_.empty())  RTC_LOG(LS_INFO) << __FUNCTION__ << " init w:"<<width<<" height:"<<height << " peerId:" <<peer_id_;
    }

    if(width != m_nVideoW && height != m_nVideoH && video_data_ != nullptr)
    {
         video_data_ .reset();

        if(!peer_id_.empty()) RTC_LOG(LS_INFO) << __FUNCTION__ << " change w:"<<width<<" height:"<<height << " peerId:" <<peer_id_;

    }

    if(video_data_ == nullptr){
      video_data_ = std::make_unique<uint8_t[]>(width * height * 1.5); // Use make_unique to allocate array
      if(!peer_id_.empty())
      RTC_LOG(LS_INFO) << __FUNCTION__ << " malloc Id:"<<peer_id_<<" width:" << width <<" height:"<<height;
    }
    memcpy(video_data_.get(), buffer->DataY(), ySize);
    memcpy(video_data_.get() + ySize, buffer->DataU(), uvSize);
    memcpy(video_data_.get() + ySize + uvSize, buffer->DataV(), uvSize);
    m_nVideoW = width;
    m_nVideoH = height;


    // 刷新界面,触发paintGL接口
    Q_EMIT PlayOneFrame();

}

```

当我们调用 PlayOneFrame 时，就可以通过 QOpenGL 来进行渲染 I420 YUV 数据了。

### 6. 如何管理多个窗口的创建和销毁的

可以通过管理 PeerConnection 那样管理 VideoRendererWidget ,还是定义一个 map
```c++
std::map<std::string, std::unique_ptr<PCS::VideoRendererWidget>> video_renderer_widgets_;
```

根据对方的 peerid 来进行缓存窗口，

当需要添加窗口时:
```c++
void MainWindow::addVideoRendererWidgetToMainWindow(std::string id, std::unique_ptr<PCS::VideoRendererWidget> renderer)
{

     const int itemsPerRow = 3;
     std::unique_ptr<PCS::VideoRendererWidget> videoRenderer;
     if(renderer == nullptr)
        videoRenderer =  std::make_unique<PCS::VideoRendererWidget>();
     else {
        videoRenderer = std::move(renderer);
     }
     videoRenderer->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
     // 计算新的位置
     int count = ui->gridLayout->count();
     int row = count / itemsPerRow;
     int column = count % itemsPerRow;

     // 添加到 gridLayout 中
     ui->gridLayout->addWidget(videoRenderer.get(),row,column);
     //videoRenderer->setFixedSize(1280/3,720/3);
     // 将 widget 添加到 map 中
     video_renderer_widgets_.insert({id, std::move(videoRenderer)});

}
```

当需要删除窗口时:
```c++
void MainWindow::removeVideoRendererWidgetFromMainWindow(std::string id)
    {
     // 从 layout 中移除 widget，并删除它
     // 查找 widget
     auto it = video_renderer_widgets_.find(id);
     if (it != video_renderer_widgets_.end())
     {
        // 从 layout 中移除 widget
        ui->gridLayout->removeWidget(it->second.get());

        // 从 map 中移除并删除 widget
        video_renderer_widgets_.erase(it);
     }
    }
```



## 总结

我们通过简短的描述和一些基础的 api 来介绍了如何通过 QT webrtc 来构建一个多人的音视频通话的项目。由于本人对 QT 不是太熟悉，所以 UI 上还有少许 Bug 。但不影响核心 API 调用。

到此，通过本篇文章和之前的几篇文章我们已经实现了 Web 、Android 、Windows 之前的互通，后续会继续介绍 WebRTC 源码分析和实战项目的开发。