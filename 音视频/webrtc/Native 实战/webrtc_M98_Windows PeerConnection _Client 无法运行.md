1. 在peerconnection_client下 main.cc 内新增类

   ```
   class CustomSocketServer:public rtc::PhysicalSocketServer {
   public:
       bool Wait(int cms, bool process_io) override {
           if (!process_io) 
               return true;
   
           return rtc::PhysicalSocketServer::Wait(1, process_io);
       }
   
   };
   
   }  // namespace
   ```



2. 注释rtc::PhysicalSocketServer ss 使用CustomSocketServer ss：

```
}  // namespace
int PASCAL wWinMain(HINSTANCE instance,
                    HINSTANCE prev_instance,
                    wchar_t* cmd_line,
                    int cmd_show) {
  rtc::WinsockInitializer winsock_init;
  //rtc::PhysicalSocketServer ss;
  CustomSocketServer ss;
  rtc::AutoSocketServerThread main_thread(&ss);

```



3. 启动连接线程

```


 main_thread.Start();
  // Main loop.
  MSG msg;
  BOOL gm;
```

