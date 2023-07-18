## 介绍

环境: webrtc m98 、Windows

`peerconnection_client` 是一个WebRTC提供的示例程序，主要在Windows平台上演示如何使用WebRTC库来实现点对点的实时音频和视频通话。它是一个客户端应用程序，配合 `peerconnection_server` 信令服务器使用，通过信令服务器进行信令交换，建立并维护两个或者多个客户端之间的P2P连接。通过该示例对于我们去了解WebRTC的整体架构和运行流程有非常大帮助。



## 程序入口和主体框架

找到编译好的 webrtc 示例 VS 程序，通过  VS 打开 all.sln 程序，然后将 peerconnection_client 设置为启动项，如下图所示

![img_v2_67fbd162-8eeb-4f1b-9c18-e1b61936d83g](http://devyk.top/2022/202306181214390.jpg)

启动通话后，效果如下:

![img_v2_77dfb6a9-6c95-4ef0-9983-18b6e03692cg](http://devyk.top/2022/202306181219885.jpg)

如果你是在本地开 2 个客户端调试，那么可以通过开启 OBS 的虚拟摄像头达到上面的效果。

peerconnection_client 主要是由以下几个部分构成

![peerconnection_client UML (1)](http://devyk.top/2022/202306182048748.png)

1. `main.cc`: 这是程序的入口点，它创建并运行应用程序的消息循环，初始化并运行主窗口。它会创建 `PeerConnectionClient` 和 `Conductor` 对象，并且链接他们，使得它们能一起协作。
2. `main_wnd.cc`: 它是主窗口类的实现。这个类负责所有的用户界面操作，如按钮点击、视频显示窗口、状态更新等。它还将用户操作的事件通知到 `Conductor` 对象。
3. `peer_connection_client.cc`: 这个类是一个客户端，它会连接到 `PeerConnectionServer` 信令服务器，然后向服务器注册，并处理来自服务器的信令消息，以及发送到服务器的信令消息。
4. `conductor.cc`: 它是整个程序的核心，负责管理 `PeerConnectionClient` 对象和 `MainWnd` 对象。它还创建并管理WebRTC的 `PeerConnection` 对象，以及处理所有的WebRTC事件。例如，当用户点击"用户列表 item"时，`MainWnd` 对象会将此事件通知给 `Conductor`，`Conductor` 会命令 `PeerConnectionClient` 向信令服务器发送一个信令消息，以便开始一个新的呼叫。

我们来看下 main.cc 中的核心代码，也就是入口函数:

```c++
int PASCAL wWinMain(HINSTANCE instance,
                    HINSTANCE prev_instance,
                    wchar_t* cmd_line,
                    int cmd_show) {
  rtc::WinsockInitializer winsock_init;  // 初始化 Winsock
  CustomSocketServer ss;  // 自定义 Socket 服务器
  rtc::AutoSocketServerThread main_thread(&ss);  // 使用自定义 Socket 服务器创建主线程

  WindowsCommandLineArguments win_args;  // 处理命令行参数
  int argc = win_args.argc();
  char** argv = win_args.argv();

  absl::ParseCommandLine(argc, argv);  // 解析命令行参数

  // InitFieldTrialsFromString 会存储 char*，所以这个字符数组必须比应用程序的生命周期更长
  const std::string forced_field_trials =
      absl::GetFlag(FLAGS_force_fieldtrials);
  webrtc::field_trial::InitFieldTrialsFromString(forced_field_trials.c_str());

  // 如果用户指定的端口超出了允许的范围 [1, 65535]，则中止程序
  if ((absl::GetFlag(FLAGS_port) < 1) || (absl::GetFlag(FLAGS_port) > 65535)) {
    printf("Error: %i is not a valid port.\n", absl::GetFlag(FLAGS_port));
    return -1;
  }

  std::string server = absl::GetFlag(FLAGS_server);  // 获取服务器地址

  MainWnd wnd(server.c_str(), absl::GetFlag(FLAGS_port),  // 创建主窗口
              absl::GetFlag(FLAGS_autoconnect), absl::GetFlag(FLAGS_autocall));
  if (!wnd.Create()) {
    RTC_DCHECK_NOTREACHED();  // 如果窗口创建失败，则终止程序
    return -1;
  }

  rtc::InitializeSSL();  // 初始化 SSL
  PeerConnectionClient client;  // 创建 PeerConnectionClient 对象
  rtc::scoped_refptr<Conductor> conductor(
      new rtc::RefCountedObject<Conductor>(&client, &wnd));  // 创建 Conductor 对象

  // 主循环
  MSG msg;
  BOOL gm;
  while ((gm = ::GetMessage(&msg, NULL, 0, 0)) != 0 && gm != -1) {  // 获取并处理消息，如果获取失败或者程序接收到退出消息，则退出循环
    if (!wnd.PreTranslateMessage(&msg)) {  // 如果消息没有被预处理
      ::TranslateMessage(&msg);  // 翻译消息
      ::DispatchMessage(&msg);  // 分发消息
    }
  }

  if (conductor->connection_active() || client.is_connected()) {  // 如果连接仍然活动，或者客户端仍然连接着
    while ((conductor->connection_active() || client.is_connected()) &&  // 等待连接关闭
           (gm = ::GetMessage(&msg, NULL, 0, 0)) != 0 && gm != -1) {
      if (!wnd.PreTranslateMessage(&msg)) {  // 如果消息没有被预处理
        ::TranslateMessage(&msg);  // 翻译消息
        ::DispatchMessage(&msg);  // 分发消息
      }
    }
  }

  rtc::CleanupSSL();  // 清理 SSL
  return 0; 

```

入口函数的作用，就是初始化并启动WebRTC peerconnection，处理命令行参数，设置窗口界面，并开始接收和处理Windows消息，直到peer connection关闭和程序结束。

## 窗口管理

 窗口管理的工作主要在 main_wnd.cc  create 函数，我们看一下它是如何创建 WebRTC 这个窗口的，

```c++
bool MainWnd::Create() {
  RTC_DCHECK(wnd_ == NULL); // 检查窗口句柄是否为NULL，以确保窗口尚未创建。

  if (!RegisterWindowClass()) // 注册窗口类。如果注册失败，返回false。
    return false;

  ui_thread_id_ = ::GetCurrentThreadId(); // 获取当前线程ID并存储，这将用于后续的UI操作。

  // 创建一个新的窗口实例。这个窗口是一个具有内置子窗口的主窗口，标题为"WebRTC"。
  wnd_ = ::CreateWindowExW(WS_EX_OVERLAPPEDWINDOW, kClassName, L"WebRTC",
                           WS_OVERLAPPEDWINDOW | WS_VISIBLE | WS_CLIPCHILDREN,
                           CW_USEDEFAULT, CW_USEDEFAULT, CW_USEDEFAULT,
                           CW_USEDEFAULT, NULL, NULL, GetModuleHandle(NULL), this);

  // 发送一个消息给新创建的窗口，设置其字体为默认字体。
  ::SendMessage(wnd_, WM_SETFONT, reinterpret_cast<WPARAM>(GetDefaultFont()),
                TRUE);

  CreateChildWindows(); // 创建子窗口，如编辑框、按钮等。

  SwitchToConnectUI(); // 切换到"连接"用户界面状态。

  return wnd_ != NULL; // 如果窗口句柄不为NULL，说明窗口创建成功，返回true；否则返回false。
}

bool MainWnd::RegisterWindowClass() {
  if (wnd_class_) // 如果窗口类已经注册，直接返回true
    return true;

  WNDCLASSEXW wcex = {sizeof(WNDCLASSEX)}; // 初始化窗口类结构体
  wcex.style = CS_DBLCLKS; // 设置窗口样式，这里允许接收双击消息
  wcex.hInstance = GetModuleHandle(NULL); // 获取当前进程的实例句柄
  wcex.hbrBackground = reinterpret_cast<HBRUSH>(COLOR_WINDOW + 1); // 设置窗口背景颜色
  wcex.hCursor = ::LoadCursor(NULL, IDC_ARROW); // 设置窗口光标样式
  wcex.lpfnWndProc = &WndProc; // 设置窗口消息处理函数
  wcex.lpszClassName = kClassName; // 设置窗口类名
  
  // 调用RegisterClassExW函数注册窗口类，注册成功会返回一个窗口类的原子类名，失败返回0
  wnd_class_ = ::RegisterClassExW(&wcex);
  RTC_DCHECK(wnd_class_ != 0); // 检查窗口类是否注册成功
  
  return wnd_class_ != 0; // 如果窗口类注册成功，返回true；否则返回false。
}

void MainWnd::CreateChildWindow(HWND* wnd,
                                MainWnd::ChildWindowID id,
                                const wchar_t* class_name,
                                DWORD control_style,
                                DWORD ex_style) {
  if (::IsWindow(*wnd)) // 如果窗口已存在，直接返回，避免重复创建
    return;

  // 子窗口初始为隐藏状态，在调整大小后显示
  DWORD style = WS_CHILD | control_style; 
  // 创建子窗口，窗口位置和尺寸初始为100*100，实际会在后续调整
  *wnd = ::CreateWindowExW(ex_style, class_name, L"", style, 100, 100, 100, 100,
                           wnd_, reinterpret_cast<HMENU>(id),
                           GetModuleHandle(NULL), NULL); 
  RTC_DCHECK(::IsWindow(*wnd) != FALSE); // 检查窗口是否创建成功

  // 发送消息给窗口，设置默认字体
  ::SendMessage(*wnd, WM_SETFONT, reinterpret_cast<WPARAM>(GetDefaultFont()),
                TRUE);
}

void MainWnd::CreateChildWindows() {
  // 按照 tab 顺序创建子窗口
  CreateChildWindow(&label1_, LABEL1_ID, L"Static", ES_CENTER | ES_READONLY, 0);
  CreateChildWindow(&edit1_, EDIT_ID, L"Edit",
                    ES_LEFT | ES_NOHIDESEL | WS_TABSTOP, WS_EX_CLIENTEDGE);
  CreateChildWindow(&label2_, LABEL2_ID, L"Static", ES_CENTER | ES_READONLY, 0);
  CreateChildWindow(&edit2_, EDIT_ID, L"Edit",
                    ES_LEFT | ES_NOHIDESEL | WS_TABSTOP, WS_EX_CLIENTEDGE);
  CreateChildWindow(&button_, BUTTON_ID, L"Button", BS_CENTER | WS_TABSTOP, 0);

  CreateChildWindow(&listbox_, LISTBOX_ID, L"ListBox",
                    LBS_HASSTRINGS | LBS_NOTIFY, WS_EX_CLIENTEDGE);

  // 初始化 edit1_ 和 edit2_ 的文本内容
  ::SetWindowTextA(edit1_, server_.c_str());
  ::SetWindowTextA(edit2_, port_.c_str());
}

//接收系统发送给窗口的消息
LRESULT CALLBACK MainWnd::WndProc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {
 ...
  return result;
}
```

这个函数的目的是创建一个主窗口，并根据程序的需要进行配置。在这个窗口中，会创建一些子窗口(ip编辑框，连接按钮，用户列表等)，并先设置窗口的UI状态为 "连接" 状态。

最后通过调用 windows api ShowWindow 将创建好的一系列窗口显示

```c++
void MainWnd::LayoutConnectUI(bool show) {
  // 定义窗口布局和属性的结构体
  struct Windows {
    HWND wnd;
    const wchar_t* text;
    size_t width;
    size_t height;
  } windows[] = { // 初始化窗口数组
      {label1_, L"Server"},  {edit1_, L"XXXyyyYYYgggXXXyyyYYYggg"},
      {label2_, L":"},       {edit2_, L"XyXyX"},
      {button_, L"Connect"},
  };

  if (show) { // 如果要显示连接界面
    const size_t kSeparator = 5; // 控件之间的间隔
    size_t total_width = (ARRAYSIZE(windows) - 1) * kSeparator; // 计算所有窗口的总宽度

    // 计算每个窗口的尺寸并更新总宽度
    for (size_t i = 0; i < ARRAYSIZE(windows); ++i) {
      CalculateWindowSizeForText(windows[i].wnd, windows[i].text,
                                 &windows[i].width, &windows[i].height);
      total_width += windows[i].width;
    }

    RECT rc;
    ::GetClientRect(wnd_, &rc); // 获取主窗口的客户区大小
    size_t x = (rc.right / 2) - (total_width / 2); // 计算第一个窗口的水平位置
    size_t y = rc.bottom / 2; // 计算窗口的垂直位置
    // 依次设置每个窗口的位置并显示
    for (size_t i = 0; i < ARRAYSIZE(windows); ++i) {
      size_t top = y - (windows[i].height / 2);
      ::MoveWindow(windows[i].wnd, static_cast<int>(x), static_cast<int>(top),
                   static_cast<int>(windows[i].width),
                   static_cast<int>(windows[i].height), TRUE);
      x += kSeparator + windows[i].width; // 更新下一个窗口的水平位置
      if (windows[i].text[0] != 'X') // 设置窗口的文本内容
        ::SetWindowTextW(windows[i].wnd, windows[i].text);
      ::ShowWindow(windows[i].wnd, SW_SHOWNA); // 显示窗口
    }
  } else { // 如果不显示连接界面，则隐藏所有窗口
    for (size_t i = 0; i < ARRAYSIZE(windows); ++i) {
      ::ShowWindow(windows[i].wnd, SW_HIDE);
    }
  }
}

void MainWnd::SwitchToConnectUI() {
  RTC_DCHECK(IsWindow()); // 确保主窗口存在
  LayoutPeerListUI(false); // 隐藏用户列表界面
  ui_ = CONNECT_TO_SERVER; // 更新到连接状态界面
  LayoutConnectUI(true); // 显示连接服务器界面
  ::SetFocus(edit1_); // 将焦点设置到第一个输入框

  if (auto_connect_) // 如果设置了自动连接，则模拟点击连接按钮
    ::PostMessage(button_, BM_CLICK, 0, 0);
}

```

最后窗口会这样显示:
![img_v2_bba77859-bbe6-4299-b571-1f26366f7b3g](http://devyk.top/2022/202306181452454.jpg)

当我们点击上图中的 Connect 后，系统会发送消息给 WndProc 窗口的接收消息的回调函数上，如果连接成功，就会切换到 用户list UI，核心代码如下:

```c++
void MainWnd::SwitchToPeerList(const Peers& peers) {
  // 关闭连接界面
  LayoutConnectUI(false);

  // 重置列表内容
  ::SendMessage(listbox_, LB_RESETCONTENT, 0, 0);

  // 向列表中添加一行标题
  AddListBoxItem(listbox_, "List of currently connected peers:", -1);
  // 循环遍历对等端列表，将每个对等端添加到列表中
  Peers::const_iterator i = peers.begin();
  for (; i != peers.end(); ++i)
    AddListBoxItem(listbox_, i->second.c_str(), i->first);

  // 设置当前用户界面状态为 LIST_PEERS
  ui_ = LIST_PEERS;
  // 显示对等端列表界面
  LayoutPeerListUI(true);
  // 将焦点设置到列表上
  ::SetFocus(listbox_);

  // 如果 auto_call_ 为 true，并且对等端列表不为空
  if (auto_call_ && peers.begin() != peers.end()) {
    // 获取列表中的项目数量
    LRESULT count = ::SendMessage(listbox_, LB_GETCOUNT, 0, 0);
    if (count != LB_ERR) {
      // 选中列表中的最后一个项目
      LRESULT selection = ::SendMessage(listbox_, LB_SETCURSEL, count - 1, 0);
      // 如果选中成功，发送一个 WM_COMMAND 消息，模拟双击事件
      if (selection != LB_ERR)
        ::PostMessage(wnd_, WM_COMMAND,
                      MAKEWPARAM(GetDlgCtrlID(listbox_), LBN_DBLCLK),
                      reinterpret_cast<LPARAM>(listbox_));
    }
  }
}


```

`SwitchToPeerList`函数首先关闭了连接界面，然后将列表的内容进行了重置，添加了一个标题到列表中，并添加了所有当前在线的对等端到列表中。接着，它将用户界面的状态切换到了显示对等端列表，并设置了列表的焦点。最后，如果设置了自动呼叫并且有对等端在线，它就会选中列表中的最后一个项目，并模拟一次双击事件。

这段代码执行后，对应的用户列表就可以显示出来，比如, 如下所示:

![img_v2_1986c4b8-2db5-4bff-bc5e-813f0ea8b9dg](http://devyk.top/2022/202306181519606.jpg)

当双击用户名称时，双方就会发起 SDP 媒体协商，网络协商等，如果都协商成功就可以传输并显示音视频画面了，这个后面会详细说到。

如果用户主动关闭窗口，窗口会收到退出的消息并关闭 peerconnection 连接。

到这里窗口整个的创建->更新->关闭都分析完了，接下来会分析 peerconnection_client 与 server 的信令交互

## 信令处理

![image-20230618154102953](http://devyk.top/2022/202306181541946.png)

下载 pcapng 包链接: https://pan.baidu.com/s/1wGyyLSxd7_X2p7T8O1nPdg?pwd=frrr 提取码: frrr 

通过抓包我们得到了如下几个信令:

**GET sign_in:** 用户登录消息

**GET sign_out:**用户退出消息

**POST message:** 协商交互消息

**GET wait:** 用户等待消息

这里绘制了一张简要的时序图

![PeerConnection_Client_p2p](http://devyk.top/2022/202306181559390.png)

当用户点击 **Connect** 时，会发起登录信息:

```c++
void Conductor::StartLogin(const std::string& server, int port) {
  if (client_->is_connected())
    return;
  server_ = server;
  //在 PeerConnectionClient 中与 server 发起信令登录连接
  client_->Connect(server, port, GetPeerName());
}
```

调用这行代码后，会执行到 PeerConnectionClient::Connect 函数:

```c++
void PeerConnectionClient::Connect(const std::string& server,
                                   int port,
                                   const std::string& client_name) {
  RTC_DCHECK(!server.empty());
  RTC_DCHECK(!client_name.empty());
	//判断当前的状态是否处于连接
  if (state_ != NOT_CONNECTED) {
    RTC_LOG(LS_WARNING)
        << "The client must not be connected before you can call Connect()";
    callback_->OnServerConnectionFailure();
    return;
  }
	//判断ip和名称是否为空
  if (server.empty() || client_name.empty()) {
    callback_->OnServerConnectionFailure();
    return;
  }
	//如果端口小于 0 使用默认的
  if (port <= 0)
    port = kDefaultServerPort;
	//设置信令服务器 IP 和端口
  server_address_.SetIP(server);
  server_address_.SetPort(port);
  client_name_ = client_name;

  /**
  *if (server_address_.IsUnresolvedIP())：
  检查 server_address_ 是否是一个未解析的 IP 地址
  （也就是说，它实际上是一个域名）。如果是，
  那么需要进行 DNS 解析。在这种情况下，代码会创建一个 rtc::AsyncResolver 对象来进行异步的 DNS 解析，并设置一个回调函数 PeerConnectionClient::OnResolveResult，当解析完成时这个函数会被调用。然后，代码调用 resolver_->Start(server_address_) 来开始解析过程。
  */
  if (server_address_.IsUnresolvedIP()) {
    state_ = RESOLVING;
    resolver_ = new rtc::AsyncResolver();
    resolver_->SignalDone.connect(this, &PeerConnectionClient::OnResolveResult);
    resolver_->Start(server_address_);
  } else {
    DoConnect();//如果域名不需要解析，则直接发起连接
  }
}
```

这里由于我们填的是本机地址，所以不需要 DNS 解析，直接看 DoConnect

```c++
void PeerConnectionClient::DoConnect() {
  //创建一个控制连接（发送和接收命令）
  control_socket_.reset(CreateClientSocket(server_address_.ipaddr().family()));
  //用于 hanging GET 操作（长轮询，用于接收服务器的实时更新）
  hanging_get_.reset(CreateClientSocket(server_address_.ipaddr().family()));
  //初始化套接字信号，包括连接、数据接收等事件的回调处理。
  InitSocketSignals();
  char buffer[1024];
  //准备一个 HTTP GET 请求，用于登录到服务器。这个请求的路径是 "/sign_in"，并且包含一个查询参数，即客户端的名字。
  snprintf(buffer, sizeof(buffer), "GET /sign_in?%s HTTP/1.0\r\n\r\n",
           client_name_.c_str());
  onconnect_data_ = buffer;
  //尝试连接到控制套接字。如果连接成功，ConnectControlSocket() 将返回 true，否则返回 false。
  bool ret = ConnectControlSocket();
  if (ret)
    //如果连接成功，将状态设置为 SIGNING_IN，表示正在进行登录操作
    state_ = SIGNING_IN;
  if (!ret) {//如果连接失败，调用回调函数 OnServerConnectionFailure()，通知其他部分连接失败
    callback_->OnServerConnectionFailure();
  }
  //启动当前线程
  rtc::Thread::Current()->Start();
}
```

PeerConnectionClient 与服务器交互的协议是 **http 短连接**，此处是创建了 2 个 异步的 socket， control_socket_ 主要是主动发起一些信令的操作，比如登录，退出，offer,candide 消息等；而 hanging_get_ 它主要是向信令服务器请求对方的信令消息，比如 answer,candidate,用户列表等，每次是先发一个 wait 信令，等待信令服务器的响应，当信令服务器有响应时，就会执行这些注入的回调，代码如下:

```c++
void PeerConnectionClient::InitSocketSignals() {
  RTC_DCHECK(control_socket_.get() != NULL);
  RTC_DCHECK(hanging_get_.get() != NULL);
  /** close 事件**/
  control_socket_->SignalCloseEvent.connect(this,
                                            &PeerConnectionClient::OnClose);
  hanging_get_->SignalCloseEvent.connect(this, &PeerConnectionClient::OnClose);
  
    /** connect 事件**/
  control_socket_->SignalConnectEvent.connect(this,
                                              &PeerConnectionClient::OnConnect);
  hanging_get_->SignalConnectEvent.connect(
      this, &PeerConnectionClient::OnHangingGetConnect);
  
      /** read 事件**/
  control_socket_->SignalReadEvent.connect(this, &PeerConnectionClient::OnRead);
  hanging_get_->SignalReadEvent.connect(
      this, &PeerConnectionClient::OnHangingGetRead);
}
```

发起登录连接

```c++
bool PeerConnectionClient::ConnectControlSocket() {
  //检查当前的连接状态
  RTC_DCHECK(control_socket_->GetState() == rtc::Socket::CS_CLOSED);
  //向信令服务器发起连接请求
  int err = control_socket_->Connect(server_address_);
  if (err == SOCKET_ERROR) {
    Close();
    return false;
  }
  return true;
}
```

当连接成功

```c++
void PeerConnectionClient::OnConnect(rtc::Socket* socket) {
  //判断发送的信令是否为空
  RTC_DCHECK(!onconnect_data_.empty());
  //发送
  size_t sent = socket->Send(onconnect_data_.c_str(), onconnect_data_.length());
  RTC_DCHECK(sent == onconnect_data_.length());
  onconnect_data_.clear();
}
```

向信令服务器发送的消息及响应

```text
GET /sign_in?devyk@devyk-mwin HTTP/1.0\r\n
 
HTTP/1.1 200 Added\r\n
Server: PeerConnectionTestServer/0.1\r\n
Cache-Control: no-cache\r\n
Connection: close\r\n
Content-Type: text/plain\r\n
Content-Length: 22\r\n
Pragma: 12\r\n
Access-Control-Allow-Origin: *\r\n
Access-Control-Allow-Credentials: true\r\n
Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n
Access-Control-Allow-Headers: Content-Type, Content-Length, Connection, Cache-Control\r\n
Access-Control-Expose-Headers: Content-Length\r\n
\r\n

devyk@devyk-mwin,12,1\n

```

当第二个人连接进来的时候，收到的消息

```
    HTTP/1.1 200 Added\r\n
    Server: PeerConnectionTestServer/0.1\r\n
    Cache-Control: no-cache\r\n
    Connection: close\r\n
    Content-Type: text/plain\r\n
    Content-Length: 44\r\n
    Pragma: 13\r\n
    Access-Control-Allow-Origin: *\r\n
    Access-Control-Allow-Credentials: true\r\n
    Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n
    Access-Control-Allow-Headers: Content-Type, Content-Length, Connection, Cache-Control\r\n
    Access-Control-Expose-Headers: Content-Length\r\n
    \r\n

    devyk@devyk-mwin,13,1\n
    devyk@devyk-mwin,12,1\n

```

解析 Socket 收到的协议

```c++
void PeerConnectionClient::OnRead(rtc::Socket* socket) {
  size_t content_length = 0;
  // 读取服务器发送的数据到 control_data_ 缓冲区，并获取内容长度
  if (ReadIntoBuffer(socket, &control_data_, &content_length)) {
    size_t peer_id = 0, eoh = 0;
    // 解析服务器的响应，获取 peer_id 和 eoh（头部结束的位置）
    bool ok = ParseServerResponse(control_data_, content_length, &peer_id, &eoh);
    if (ok) {
      if (my_id_ == -1) {
        // 如果是第一次响应，存储服务器分配的 ID
        RTC_DCHECK(state_ == SIGNING_IN);
        my_id_ = static_cast<int>(peer_id);
        RTC_DCHECK(my_id_ != -1);

        // 如果响应的主体部分存在内容，则将已经连接的对等方信息添加到 peers_ 列表中
        if (content_length) {
          size_t pos = eoh + 4;
          while (pos < control_data_.size()) {
            size_t eol = control_data_.find('\n', pos);
            if (eol == std::string::npos)
              break;
            int id = 0;
            std::string name;
            bool connected;
            // 解析对等方条目，获取名字、ID以及连接状态
            if (ParseEntry(control_data_.substr(pos, eol - pos), &name, &id, &connected) &&
                id != my_id_) {
              // 如果对等方不是自己，将其添加到对等方列表中，并触发连接事件
              peers_[id] = name;
              callback_->OnPeerConnected(id, name);
            }
            pos = eol + 1;
          }
        }
        RTC_DCHECK(is_connected());
        // 触发已登录事件
        callback_->OnSignedIn();
      } else if (state_ == SIGNING_OUT) {
        // 如果当前状态是正在退出，则关闭连接并触发断开连接事件
        Close();
        callback_->OnDisconnected();
      } else if (state_ == SIGNING_OUT_WAITING) {
        // 如果当前状态是等待退出，则退出
        SignOut();
      }
    }

    // 清空 control_data_ 缓冲区
    control_data_.clear();

    if (state_ == SIGNING_IN) {
      // 如果当前状态是正在登录，则切换到已连接状态，并连接到服务器
      RTC_DCHECK(hanging_get_->GetState() == rtc::Socket::CS_CLOSED);
      state_ = CONNECTED;
      hanging_get_->Connect(server_address_);
    }
  }
}

```

当信令服务器发送登录响应时，会触发 PeerConnectionClient::OnRead() 函数。 首先从 socket 读取响应信息至 control_data_ 中，如果是短连接则需要关闭socket。接着验证响应中的状态码，获取信令服务器分配的peer id。 登录信令的响应中会包含其他登录客户端的信息，这些客户端的信令会显示到peer list界面上。

解析其他客户端的信息后，会触发Conductor::OnPeerConnected函数，在这个函数中会将客户端的信息显示到peer list界面上。

```text
    devyk@devyk-mwin,13,1\n
    devyk@devyk-mwin,12,1\n
```

响应信息的格式是：peer的name，信令服务器分配的peer id，是否处于登录状态，1表示处于登录状态，0表示登出状态。

成功登录信令服务器后，hanging_get socket 也开始登录信令服务器，用于接收信令服务器发送给客户端的信息。

当连接成功后，发送等待消息，如果有新的信令消息，服务端就转发过来

```c++
void PeerConnectionClient::OnHangingGetConnect(rtc::Socket* socket) {
  char buffer[1024];
  snprintf(buffer, sizeof(buffer), "GET /wait?peer_id=%i HTTP/1.0\r\n\r\n",
           my_id_);
  int len = static_cast<int>(strlen(buffer));
  int sent = socket->Send(buffer, len);
  RTC_DCHECK(sent == len);
}
```

```text
//发送的数据

GET /wait?peer_id=12 HTTP/1.0\r\n
```

当有新的信令消息产生时，会以 wait 的响应回来

```http
    HTTP/1.1 200 OK\r\n
    Server: PeerConnectionTestServer/0.1\r\n
    Cache-Control: no-cache\r\n
    Connection: close\r\n
    Content-Type: text/plain\r\n
    Content-Length: 22\r\n
    Pragma: 12\r\n
    Access-Control-Allow-Origin: *\r\n
    Access-Control-Allow-Credentials: true\r\n
    Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n
    Access-Control-Allow-Headers: Content-Type, Content-Length, Connection, Cache-Control\r\n
    Access-Control-Expose-Headers: Content-Length\r\n
    \r\n


    devyk@devyk-mwin,13,1\n

```

然后就会触发下面的函数:

```c++
void PeerConnectionClient::OnHangingGetRead(rtc::Socket* socket) {
  RTC_LOG(LS_INFO) << __FUNCTION__;
  size_t content_length = 0;
  //从指定的socket读取响应信息，并做适当的处理。如果从响应中得知使用的是http短连接，那么需要关闭socket。
  if (ReadIntoBuffer(socket, &notification_data_, &content_length)) {
    size_t peer_id = 0, eoh = 0;
    //解析响应码，并读取信令服务器分配的 peer id
    bool ok =
        ParseServerResponse(notification_data_, content_length, &peer_id, &eoh);

    if (ok) {
      // Store the position where the body begins.
      size_t pos = eoh + 4;

      //检查是否是自己的ID，如果是，那么这个通知可能是有新的成员加入或者有成员断开连接。
      // 然后，它尝试解析主体内容，获取 peer 的 id，名称和连接状态。如果解析成功，
      // 并且 peer 是已连接的，那么就将这个 peer 添加到 peers 列表中，
      //并通知回调有 peer 连接；如果 peer 是断开的，那么就从 peers 列表中移除，并通知回调有 peer 断开连接
      if (my_id_ == static_cast<int>(peer_id)) {
        // A notification about a new member or a member that just
        // disconnected.
        int id = 0;
        std::string name;
        bool connected = false;
        if (ParseEntry(notification_data_.substr(pos), &name, &id,
                       &connected)) {
          if (connected) {
            peers_[id] = name;
            callback_->OnPeerConnected(id, name);
          } else {
            peers_.erase(id);
            callback_->OnPeerDisconnected(id);
          }
        }
      } else {
          //用于处理offer、answer、candidate信令
        OnMessageFromPeer(static_cast<int>(peer_id),
                          notification_data_.substr(pos));
      }
    }

    notification_data_.clear();
  }

  if (hanging_get_->GetState() == rtc::Socket::CS_CLOSED &&
      state_ == CONNECTED) {
    hanging_get_->Connect(server_address_);
  }
}
```

当信令服务器需要主动发送消息给客户端时，会包装成wait信令的响应信息。有其他客户端登录或登出信令服务器时，会通知本端，本端会根据信令服务器反馈的信息更新peer list界面的用户列表。 当收到信令服务器转发的其他客户端的offer、answer、candidate信息时，会进入OnMessageFromPeer()函数处理。

```c++
void PeerConnectionClient::OnMessageFromPeer(int peer_id,
                                             const std::string& message) {
  if (message.length() == (sizeof(kByeMessage) - 1) &&
      message.compare(kByeMessage) == 0) {
    callback_->OnPeerDisconnected(peer_id);
  } else {
    /*收到的是offer、answer、candidate信令*/
    callback_->OnMessageFromPeer(peer_id, message);
  }
}
```

分析完读取和解析 http 协议后，我们看下如何进行 CreateOffer 的，

```c++
void Conductor::ConnectToPeer(int peer_id) {
  RTC_DCHECK(peer_id_ == -1);
  RTC_DCHECK(peer_id != -1);

  if (peer_connection_.get()) {
    main_wnd_->MessageBox(
        "Error", "We only support connecting to one peer at a time", true);
    return;
  }

  //初始化 peer ，成功就创建 CreateOffer
  if (InitializePeerConnection()) {
    peer_id_ = peer_id;
    peer_connection_->CreateOffer(
        this, webrtc::PeerConnectionInterface::RTCOfferAnswerOptions());
  } else {
    main_wnd_->MessageBox("Error", "Failed to initialize PeerConnection", true);
  }
}
```

当点击 peer list 用户中任意一个，会执行到此处，如果 InitializePeerConnection 为 true ，那么就可以 CreateOffer.

```c++
//第一步:
bool Conductor::InitializePeerConnection() {
  // 检查是否已存在 peer_connection_factory_ 或
  // peer_connection_，都应该是空的，否则报错
  RTC_DCHECK(!peer_connection_factory_);
  RTC_DCHECK(!peer_connection_);
  // 没有 signaling_thread_ 的话就创建一个新的
  if (!signaling_thread_.get()) {
    signaling_thread_ = rtc::Thread::CreateWithSocketServer();
    signaling_thread_->Start();
  }

  // 使用 signaling_thread_ 创建 PeerConnectionFactory
  // PeerConnectionFactory 是用于生成 PeerConnections, MediaStreams 和 MediaTracks 的工厂类
  peer_connection_factory_ = webrtc::CreatePeerConnectionFactory(
      nullptr /* network_thread */, 
      nullptr /* worker_thread */,
      signaling_thread_.get(), /* signaling_thread */
      nullptr /* default_adm */,
      webrtc::CreateBuiltinAudioEncoderFactory(),
      webrtc::CreateBuiltinAudioDecoderFactory(),
      webrtc::CreateBuiltinVideoEncoderFactory(),
      webrtc::CreateBuiltinVideoDecoderFactory(), nullptr /* audio_mixer */,
      nullptr /* audio_processing */);

    // 如果 PeerConnectionFactory 初始化失败，清理资源并返回错误
  if (!peer_connection_factory_) {
    main_wnd_->MessageBox("Error", "Failed to initialize PeerConnectionFactory",
                          true);
    DeletePeerConnection();
    return false;
  }

  // 创建 PeerConnection，如果失败，清理资源并返回错误
  if (!CreatePeerConnection()) {
    main_wnd_->MessageBox("Error", "CreatePeerConnection failed", true);
    DeletePeerConnection();
  }
  // 添加音频和视频轨道
  AddTracks();
  // 返回 peer_connection_ 是否已初始化
  return peer_connection_ != nullptr;
}
```

第一步: `InitializePeerConnection()`：这个方法的目标是初始化一个PeerConnectionFactory，并创建一个PeerConnection。首先，它确保PeerConnectionFactory和PeerConnection不存在。如果还没有创建信令线程，就创建一个新的。然后，使用这个信令线程创建一个新的PeerConnectionFactory，用于后续生成PeerConnections, MediaStreams和MediaTracks。如果PeerConnectionFactory创建失败，它将清理资源并返回错误。最后，创建一个PeerConnection，添加音频和视频轨道，并返回是否成功初始化PeerConnection。

```c++
//第二步:
bool Conductor::CreatePeerConnection() {
  // 检查 peer_connection_factory_ 是否存在且 peer_connection_
  // 是否为空，否则报错
  RTC_DCHECK(peer_connection_factory_);
  RTC_DCHECK(!peer_connection_);

  // 创建一个新的 PeerConnection 配置
  webrtc::PeerConnectionInterface::RTCConfiguration config;
  config.sdp_semantics = webrtc::SdpSemantics::kUnifiedPlan;
  webrtc::PeerConnectionInterface::IceServer server;
  server.uri = GetPeerConnectionString();
  config.servers.push_back(server);

  // 使用 PeerConnectionFactory 和配置创建新的 PeerConnection
  peer_connection_ = peer_connection_factory_->CreatePeerConnection(
      config, nullptr, nullptr, this);
  return peer_connection_ != nullptr;
}


```

第二步: `CreatePeerConnection()`：这个方法用于创建一个新的PeerConnection。首先，它会检查PeerConnectionFactory是否存在，且PeerConnection是否为空。然后，创建一个新的PeerConnection配置，设置SDP协议的语义为统一计划，并添加ICE服务器。最后，使用PeerConnectionFactory和刚刚创建的配置来创建一个新的PeerConnection，并返回创建是否成功。

```c++
//第三步:
void Conductor::AddTracks() {
  // 如果已经添加了轨道，则不再添加
  if (!peer_connection_->GetSenders().empty()) {
    return;  // Already added tracks.
  }
  // 创建音频轨道并添加到 PeerConnection
  rtc::scoped_refptr<webrtc::AudioTrackInterface> audio_track(
      peer_connection_factory_->CreateAudioTrack(
          kAudioLabel, peer_connection_factory_->CreateAudioSource(
                           cricket::AudioOptions())));
  auto result_or_error = peer_connection_->AddTrack(audio_track, {kStreamId});
  if (!result_or_error.ok()) {
    RTC_LOG(LS_ERROR) << "Failed to add audio track to PeerConnection: "
                      << result_or_error.error().message();
  }
  // 创建视频源和视频轨道并添加到 PeerConnection
  rtc::scoped_refptr<CapturerTrackSource> video_device =
      CapturerTrackSource::Create();
  if (video_device) {
    rtc::scoped_refptr<webrtc::VideoTrackInterface> video_track_(
        peer_connection_factory_->CreateVideoTrack(kVideoLabel, video_device));
    main_wnd_->StartLocalRenderer(video_track_);

    result_or_error = peer_connection_->AddTrack(video_track_, {kStreamId});
    if (!result_or_error.ok()) {
      RTC_LOG(LS_ERROR) << "Failed to add video track to PeerConnection: "
                        << result_or_error.error().message();
    }
  } else {
    RTC_LOG(LS_ERROR) << "OpenVideoCaptureDevice failed";
  }

  // 将界面切换到流媒体 UI
  main_wnd_->SwitchToStreamingUI();
}
```

第三步: `AddTracks()`：这个方法的目标是向PeerConnection添加音频和视频轨道。首先，它会检查是否已经添加了轨道。如果已经添加了，则不再添加。然后，创建一个音频轨道并添加到PeerConnection。之后，创建一个视频源和一个视频轨道，并添加到PeerConnection。如果添加轨道失败，会记录错误信息。最后，将用户界面切换到流媒体UI。

这些步骤(任意平台)是设置WebRTC通信的关键步骤。在创建并初始化PeerConnectionFactory之后，我们可以创建PeerConnection，然后在PeerConnection上添加音频和视频轨道，这样我们就可以开始进行实时的音视频通信了。

如果这三步执行都没有问题，那么就是发起 offer 了，当 CreateOffer 成功时，会有成功回调
```c++
/** SDP 设置成功回调*/
void Conductor::OnSuccess(webrtc::SessionDescriptionInterface* desc) {
  peer_connection_->SetLocalDescription(
      DummySetSessionDescriptionObserver::Create(), desc);

  std::string sdp;
  desc->ToString(&sdp);

  // For loopback test. To save some connecting delay.
  if (loopback_) {
    // Replace message type from "offer" to "answer"
    std::unique_ptr<webrtc::SessionDescriptionInterface> session_description =
        webrtc::CreateSessionDescription(webrtc::SdpType::kAnswer, sdp);
    peer_connection_->SetRemoteDescription(
        DummySetSessionDescriptionObserver::Create(),
        session_description.release());
    return;
  }

  Json::StyledWriter writer;
  Json::Value jmessage;
  jmessage[kSessionDescriptionTypeName] =
      webrtc::SdpTypeToString(desc->GetType());
  jmessage[kSessionDescriptionSdpName] = sdp;
  SendMessage(writer.write(jmessage));
}

void Conductor::SendMessage(const std::string& json_object) {
  std::string* msg = new std::string(json_object);
  main_wnd_->QueueUIThreadCallback(SEND_MESSAGE_TO_PEER, msg);
}
```

当 CreateOffer 成功时，首先调用 webrtc SetLocalDescription API 设置当前的 SDP，

然后会将 offer sdp 发送给信令服务器，通过抓包，我们拿到了具体的 sdp 信息

```http
POST /message?peer_id=13&to=12 HTTP/1.0\r\n
Content-Length: 5608\r\n
Content-Type: text/plain\r\n
\r\n

{\n
     "sdp" : "v=0\r\no=- 6269511735434714595 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS stream_id\r\nm=audio 9 UDP/TLS/RTP/SAVPF 63 111 103 104 9 0 8 106 105 13 110 1
       "type" : "offer"\n
}\n

```

这是 peer_id=13 发送给 12 的 offer 信令，对应的响应如下:

```http
    HTTP/1.1 200 OK\r\n
    Server: PeerConnectionTestServer/0.1\r\n
    Cache-Control: no-cache\r\n
    Connection: close\r\n
    Content-Type: text/plain\r\n
    Content-Length: 0\r\n
    Access-Control-Allow-Origin: *\r\n
    Access-Control-Allow-Credentials: true\r\n
    Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n
    Access-Control-Allow-Headers: Content-Type, Content-Length, Connection, Cache-Control\r\n
    Access-Control-Expose-Headers: Content-Length\r\n
    \r\n


```

服务端通过转发给另一个 peer wait 的 offer 响应

```http
    HTTP/1.1 200 OK\r\n
    Server: PeerConnectionTestServer/0.1\r\n
    Cache-Control: no-cache\r\n
    Connection: close\r\n
    Content-Type: text/plain\r\n
    Content-Length: 5608\r\n
    Pragma: 13\r\n
    Access-Control-Allow-Origin: *\r\n
    Access-Control-Allow-Credentials: true\r\n
    Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n
    Access-Control-Allow-Headers: Content-Type, Content-Length, Connection, Cache-Control\r\n
    Access-Control-Expose-Headers: Content-Length\r\n
    \r\n

    {\n
        "sdp" : "v=0\r\no=- 6269511735434714595 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS stream_id\r\nm=audio 9 UDP/TLS/RTP/SAVPF 63 111 103 104 9 0 8 106 105 13 110 1
       "type" : "offer"\n
    }\n

```

另一方收到 offer 响应后，会执行刚刚我们分析的 OnMessageFromPeer 函数

```c++
void Conductor::OnMessageFromPeer(int peer_id, const std::string& message) {
  RTC_DCHECK(peer_id_ == peer_id || peer_id_ == -1);
  RTC_DCHECK(!message.empty());
  /*此时被动peer还没有创建PeerConnection对象*/
  if (!peer_connection_.get()) {
    RTC_DCHECK(peer_id_ == -1);
    peer_id_ = peer_id;
    /*创建PeerConnection对象*/
    if (!InitializePeerConnection()) {
      RTC_LOG(LS_ERROR) << "Failed to initialize our PeerConnection instance";
      client_->SignOut();
      return;
    }
  } else if (peer_id != peer_id_) {
    RTC_DCHECK(peer_id_ != -1);
    RTC_LOG(LS_WARNING)
        << "Received a message from unknown peer while already in a "
           "conversation with a different peer.";
    return;
  }
  /*将收到的消息解析成json对象*/
  Json::Reader reader;
  Json::Value jmessage;
  if (!reader.parse(message, jmessage)) {
    RTC_LOG(LS_WARNING) << "Received unknown message. " << message;
    return;
  }
  std::string type_str;
  std::string json_object;
  /*从json消息中解析出消息的类型*/
  rtc::GetStringFromJsonObject(jmessage, kSessionDescriptionTypeName,
                               &type_str);
  if (!type_str.empty()) {
    if (type_str == "offer-loopback") {
      // This is a loopback call.
      // Recreate the peerconnection with DTLS disabled.
      if (!ReinitializePeerConnectionForLoopback()) {
        RTC_LOG(LS_ERROR) << "Failed to initialize our PeerConnection instance";
        DeletePeerConnection();
        client_->SignOut();
      }
      return;
    }
    /*获取消息的类型*/
    absl::optional<webrtc::SdpType> type_maybe =
        webrtc::SdpTypeFromString(type_str);
    if (!type_maybe) {
      RTC_LOG(LS_ERROR) << "Unknown SDP type: " << type_str;
      return;
    }
    /*从json消息中获取sdp，此处为offer。*/
    webrtc::SdpType type = *type_maybe;
    std::string sdp;
    if (!rtc::GetStringFromJsonObject(jmessage, kSessionDescriptionSdpName,
                                      &sdp)) {
      RTC_LOG(LS_WARNING)
          << "Can't parse received session description message.";
      return;
    }
    /*将offer转成webrtc可以理解的对象*/
    webrtc::SdpParseError error;
    std::unique_ptr<webrtc::SessionDescriptionInterface> session_description =
        webrtc::CreateSessionDescription(type, sdp, &error);
    if (!session_description) {
      RTC_LOG(LS_WARNING)
          << "Can't parse received session description message. "
             "SdpParseError was: "
          << error.description;
      return;
    }
    RTC_LOG(LS_INFO) << " Received session description :" << message;
    /*将offer通过SetRemoteDescription设置到PeerConnection中*/
    peer_connection_->SetRemoteDescription(
        DummySetSessionDescriptionObserver::Create(),
        session_description.release());
    /*收到了对端的offer，本端需要产生answer。*/
    if (type == webrtc::SdpType::kOffer) {
      peer_connection_->CreateAnswer(
          this, webrtc::PeerConnectionInterface::RTCOfferAnswerOptions());
    }
  } else { //处理 candidate 消息
    std::string sdp_mid;
    int sdp_mlineindex = 0;
    std::string sdp;
    if (!rtc::GetStringFromJsonObject(jmessage, kCandidateSdpMidName,
                                      &sdp_mid) ||
        !rtc::GetIntFromJsonObject(jmessage, kCandidateSdpMlineIndexName,
                                   &sdp_mlineindex) ||
        !rtc::GetStringFromJsonObject(jmessage, kCandidateSdpName, &sdp)) {
      RTC_LOG(LS_WARNING) << "Can't parse received message.";
      return;
    }
    webrtc::SdpParseError error;
    std::unique_ptr<webrtc::IceCandidateInterface> candidate(
        webrtc::CreateIceCandidate(sdp_mid, sdp_mlineindex, sdp, &error));
    if (!candidate.get()) {
      RTC_LOG(LS_WARNING) << "Can't parse received candidate message. "
                             "SdpParseError was: "
                          << error.description;
      return;
    }
    if (!peer_connection_->AddIceCandidate(candidate.get())) {
      RTC_LOG(LS_WARNING) << "Failed to apply the received candidate";
      return;
    }
    RTC_LOG(LS_INFO) << " Received candidate :" << message;
  }
}
```

这一段代码较长，其实就3个意思

1. 实例化 PeerConnectionFactoy 和 PeerConnectionClient
2. 设置远端的 SDP,并 CreateAnswer 
3. 收到对方发来的 candidate 消息，并添加到 PeerConnectionClient 中



上面第二点中的 CreateAnswer 创建成功后，也会想 CreateOffer 一样，有成功的回调，然后再发送给对方，这里就不再过多描述了。后面我们再看一下 candidate 消息



当 CreateOffer 、CreateAnswer 后，WebRTC 会通过 OnIceCandidate 回调信息将一些候选者的信息通知给我们

```c++
void Conductor::OnIceCandidate(const webrtc::IceCandidateInterface* candidate) {
  RTC_LOG(LS_INFO) << __FUNCTION__ << " " << candidate->sdp_mline_index();
  // For loopback test. To save some connecting delay.
  if (loopback_) {
    if (!peer_connection_->AddIceCandidate(candidate)) {
      RTC_LOG(LS_WARNING) << "Failed to apply the received candidate";
    }
    return;
  }

  Json::StyledWriter writer;
  Json::Value jmessage;

  jmessage[kCandidateSdpMidName] = candidate->sdp_mid();
  jmessage[kCandidateSdpMlineIndexName] = candidate->sdp_mline_index();
  std::string sdp;
  if (!candidate->ToString(&sdp)) {
    RTC_LOG(LS_ERROR) << "Failed to serialize candidate";
    return;
  }
  jmessage[kCandidateSdpName] = sdp;
  SendMessage(writer.write(jmessage));
}
```

这里主要是将 webrtc ice 中收集到的 candidate 组装成 json 然后发送给信令服务器，服务器再转发给另一端

```c++
    POST /message?peer_id=13&to=12 HTTP/1.0\r\n
    Content-Length: 186\r\n
    Content-Type: text/plain\r\n
    \r\n

    {\n
       "candidate" : "candidate:1019731727 1 udp 2122260223 192.168.1.104 53072 typ host generation 0 ufrag IEDW network-id 3 network-cost 10",\n
       "sdpMLineIndex" : 0,\n
       "sdpMid" : "0"\n
    }\n

```

通过抓包得到了如上 candidate 消息，注意 candidate 会存在多个消息，双方收到后并添加到 PeerConnectionClient 中，如果网络协商成功，那么就可以进行采集->编码->传输了。

最后一个信令是 退出信令 ，当关闭窗口时，发送如下格式的信令

```http
request:
GET /sign_out?peer_id=13 HTTP/1.0\r\n

response:
HTTP/1.1 200 OK\r\n
Server: PeerConnectionTestServer/0.1\r\n
Cache-Control: no-cache\r\n
Connection: close\r\n
Content-Type: text/plain\r\n
Content-Length: 0\r\n
Access-Control-Allow-Origin: *\r\n
Access-Control-Allow-Credentials: true\r\n
Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n
Access-Control-Allow-Headers: Content-Type, Content-Length, Connection, Cache-Control\r\n
Access-Control-Expose-Headers: Content-Length\r\n
\r\n


```

到此，所有信令就分析完了，建议大家可以通过抓包去分析对应的流程。

## 媒体流处理

当媒体协商，网络协商完成后，就能进行等待收对方发过来的音视频流了，当有新轨道产生，会执行 OnAddTrack 回调

```c++
void Conductor::OnAddTrack(
    rtc::scoped_refptr<webrtc::RtpReceiverInterface> receiver,
    const std::vector<rtc::scoped_refptr<webrtc::MediaStreamInterface>>&
        streams) {
  RTC_LOG(LS_INFO) << __FUNCTION__ << " " << receiver->id();
  main_wnd_->QueueUIThreadCallback(NEW_TRACK_ADDED,
                                   receiver->track().release());
}
```

经过一系列的线程切换，最后会执行到如下代码:
```c++
void Conductor::UIThreadCallback(int msg_id, void* data) 
{
...
    case NEW_TRACK_ADDED: {
      auto* track = reinterpret_cast<webrtc::MediaStreamTrackInterface*>(data);
      if (track->kind() == webrtc::MediaStreamTrackInterface::kVideoKind) {
        /*获取远端video track*/
        auto* video_track = static_cast<webrtc::VideoTrackInterface*>(track);

        /*送至MainWnd处理*/
        main_wnd_->StartRemoteRenderer(video_track);
      }
      track->Release();
      break;
    }
...
}

void MainWnd::StartRemoteRenderer(webrtc::VideoTrackInterface* remote_video) 
{
  /*生成远端视频渲染器，同时将远端视频渲染器注册到webrtc中。*/
  remote_renderer_.reset(new VideoRenderer(handle(), 1, 1, remote_video));
}
```

最后，当有视频帧产生时，会通过 OnFrame 回调给 ViewRenderer (其实 WebRTC 的接口设计在各平台上基本上一致的。前面我们分析 Android 视频渲染或者采集，也都是通过 OnFrame 虚函数给回调的)

```c++
// OnFrame方法，当接收到新的视频帧时被调用
void MainWnd::VideoRenderer::OnFrame(const webrtc::VideoFrame& video_frame) {
  // 用AutoLock确保同一时刻只有一个线程可以访问此方法
  {
    AutoLock<VideoRenderer> lock(this);

    // 获取视频帧的I420格式的缓冲区
    rtc::scoped_refptr<webrtc::I420BufferInterface> buffer(
        video_frame.video_frame_buffer()->ToI420());
    // 如果视频帧的旋转角度不为0，则将视频帧旋转至指定角度
    if (video_frame.rotation() != webrtc::kVideoRotation_0) {
      buffer = webrtc::I420Buffer::Rotate(*buffer, video_frame.rotation());
    }

    // 设置视频帧的宽度和高度
    SetSize(buffer->width(), buffer->height());

    // 确保image_已经被初始化
    RTC_DCHECK(image_.get() != NULL);
    // 将I420格式的图像数据转换为ARGB格式，然后存储到image_中
    libyuv::I420ToARGB(buffer->DataY(), buffer->StrideY(), buffer->DataU(),
                       buffer->StrideU(), buffer->DataV(), buffer->StrideV(),
                       image_.get(),
                       bmi_.bmiHeader.biWidth * bmi_.bmiHeader.biBitCount / 8,
                       buffer->width(), buffer->height());
  }
  // 使窗口重绘
  InvalidateRect(wnd_, NULL, TRUE);
}

```

这个方法是WebRTC在接收到新的视频帧时的处理过程。它首先获取视频帧的I420格式的缓冲区，然后检查视频帧是否需要旋转，如果需要就进行旋转。接着设置视频帧的宽度和高度，然后将I420格式的图像数据转换为ARGB格式，并存储在image_中。最后，通过调用`InvalidateRect`函数使窗口无效，这会触发窗口的重绘事件，即显示新的视频帧。

接下来窗口会收到 WM_PAINT 消息，标识即需要重新绘制窗口

```c++
// OnPaint方法，当窗口需要重绘时被调用
void MainWnd::OnPaint() {
  PAINTSTRUCT ps;
  // 开始绘制
  ::BeginPaint(handle(), &ps);

  RECT rc;
  // 获取窗口客户区的大小
  ::GetClientRect(handle(), &rc);

  VideoRenderer* local_renderer = local_renderer_.get();
  VideoRenderer* remote_renderer = remote_renderer_.get();
  // 如果正在进行流媒体播放并且本地和远程渲染器都存在
  if (ui_ == STREAMING && remote_renderer && local_renderer) {
    // 使用AutoLock确保同一时刻只有一个线程可以访问这些渲染器
    AutoLock<VideoRenderer> local_lock(local_renderer);
    AutoLock<VideoRenderer> remote_lock(remote_renderer);

    // 获取远程渲染器的视频信息
    const BITMAPINFO& bmi = remote_renderer->bmi();
    int height = abs(bmi.bmiHeader.biHeight);
    int width = bmi.bmiHeader.biWidth;

    // 获取远程渲染器的视频图像
    const uint8_t* image = remote_renderer->image();
    // 如果图像存在，开始进行绘制
    if (image != NULL) {
      // 创建一个设备上下文与ps.hdc兼容的内存设备上下文
      HDC dc_mem = ::CreateCompatibleDC(ps.hdc);
      // 设置位图拉伸模式为HALFTONE
      ::SetStretchBltMode(dc_mem, HALFTONE);

      // 设置映射模式以保持宽高比
      HDC all_dc[] = {ps.hdc, dc_mem};
      for (size_t i = 0; i < arraysize(all_dc); ++i) {
        SetMapMode(all_dc[i], MM_ISOTROPIC);
        SetWindowExtEx(all_dc[i], width, height, NULL);
        SetViewportExtEx(all_dc[i], rc.right, rc.bottom, NULL);
      }

      // 创建一个与ps.hdc兼容的位图
      HBITMAP bmp_mem = ::CreateCompatibleBitmap(ps.hdc, rc.right, rc.bottom);
      // 将新位图选入内存设备上下文，同时保留旧的位图
      HGDIOBJ bmp_old = ::SelectObject(dc_mem, bmp_mem);

      // 将设备上下文坐标转换为逻辑坐标
      POINT logical_area = {rc.right, rc.bottom};
      DPtoLP(ps.hdc, &logical_area, 1);

      // 创建一个黑色的画刷并填充矩形
      HBRUSH brush = ::CreateSolidBrush(RGB(0, 0, 0));
      RECT logical_rect = {0, 0, logical_area.x, logical_area.y};
      ::FillRect(dc_mem, &logical_rect, brush);
      // 删除创建的画刷
      ::DeleteObject(brush);

      // 计算绘制图像的起始位置，以使图
      // 计算绘制图像的起始位置，以使图像位于中心
      int x = (logical_area.x / 2) - (width / 2);
      int y = (logical_area.y / 2) - (height / 2);

      // 使用StretchDIBits函数将视频帧图像画到内存设备上下文
      StretchDIBits(dc_mem, x, y, width, height, 0, 0, width, height, image,
                    &bmi, DIB_RGB_COLORS, SRCCOPY);

      // 如果窗口足够大，就在右下角画一个本地视频流的缩略图
      if ((rc.right - rc.left) > 200 && (rc.bottom - rc.top) > 200) {
        const BITMAPINFO& bmi = local_renderer->bmi();
        image = local_renderer->image();
        int thumb_width = bmi.bmiHeader.biWidth / 4;
        int thumb_height = abs(bmi.bmiHeader.biHeight) / 4;
        StretchDIBits(dc_mem, logical_area.x - thumb_width - 10,
                      logical_area.y - thumb_height - 10, thumb_width,
                      thumb_height, 0, 0, bmi.bmiHeader.biWidth,
                      -bmi.bmiHeader.biHeight, image, &bmi, DIB_RGB_COLORS,
                      SRCCOPY);
      }

      // 使用BitBlt函数将内存设备上下文的内容复制到屏幕设备上下文
      BitBlt(ps.hdc, 0, 0, logical_area.x, logical_area.y, dc_mem, 0, 0,
             SRCCOPY);

      // 清理创建的对象
      ::SelectObject(dc_mem, bmp_old);
      ::DeleteObject(bmp_mem);
      ::DeleteDC(dc_mem);
    } else {
      // 如果还没有接收到视频流，就填充黑色背景，并绘制提示文本
      HBRUSH brush = ::CreateSolidBrush(RGB(0, 0, 0));
      ::FillRect(ps.hdc, &rc, brush);
      ::DeleteObject(brush);

      // 设置字体、文本颜色和背景模式，然后绘制提示文本
      HGDIOBJ old_font = ::SelectObject(ps.hdc, GetDefaultFont());
      ::SetTextColor(ps.hdc, RGB(0xff, 0xff, 0xff));
      ::SetBkMode(ps.hdc, TRANSPARENT);

      std::string text(kConnecting);
      if (!local_renderer->image()) {
        text += kNoVideoStreams;
      } else {
        text += kNoIncomingStream;
      }
      ::DrawTextA(ps.hdc, text.c_str(), -1, &rc,
                  DT_SINGLELINE | DT_CENTER | DT_VCENTER);
      ::SelectObject(ps.hdc, old_font);
    }
  } else {
    // 如果不在流媒体播放状态，就填充白色背景
    HBRUSH brush = ::CreateSolidBrush(::GetSysColor(COLOR_WINDOW));
    ::FillRect(ps.hdc, &rc, brush);
    ::DeleteObject(brush);
  }

  // 结束绘制
  ::EndPaint(handle(), &ps);
}

```

代码有点长，这里做一下总结:

1. 如果正在播放流媒体且本地和远程渲染器都存在，则绘制远程视频流。如果窗口足够大，就在右下角绘制本地视频流的缩略图。
2. 如果还没有接收到视频流，则在黑色背景上显示提示信息。
3. 如果不在播放流媒体的状态，则只填充窗口的背景。



到此，对端视频可以正常的显示出来了。



## 总结

该篇文章详细的分析了 peerconnection_client 客户端的窗口交互、信令交互、和视频渲染等处理，篇幅较长，建议自己先 debug peerconnection_client demo, 如流程上有不懂的再来看该篇对应的处理讲解。下一篇文章会进行 Windows P2P 的实战开发，与之前的 Web 和 Android 可以进行音视频通话。

## 参考

- [WebRTC PeerConnection Client源码分析2-PeerConnectionClient](https://blog.csdn.net/qiuguolu1108/article/details/120588283?spm=1001.2014.3001.5501)