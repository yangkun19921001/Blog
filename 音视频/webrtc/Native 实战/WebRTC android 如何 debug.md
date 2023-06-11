配置 debug

1. 配置 build.gradle

   ```
   android {
   
     buildTypes {
           release {
               // 保留符号
               minifyEnabled false
               debuggable true
               jniDebuggable true
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           }
           debug{
               debuggable true     // 必须设置为 true
               jniDebuggable true  // 必须设置为 true
               minifyEnabled false
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
   
           }
       }
   
       packagingOptions {
           // 如果不设置 doNotStrip，编译出来的安装包还是会丢失调试信息；
           // 因为我们只编译了 arm64-v8a 架构的包，所以只需要配置这一行即可
           doNotStrip "*/arm64-v8a/*.so"
       }
   }
   ```

   

1. 配置描述符号-Symbol Dirrectories

   ```
   /Users/devyk/Data/webrtc/OpenRTCClient/examples/android_gradle/rtc/build/intermediates/cmake/debug/obj/arm64-v8a
   ```

   

2. 配置 LLDB Startup Commands（通过带描述符号的 so 查看） 

   ```
   #通过查看 apk 中 so webrtc 源码路径，将 ../../../../webrtc  替换为真实路径
   settings set target.source-map ../../../../webrtc /Users/devyk/Data/webrtc/OpenRTCClient/webrtc
   ```

   

