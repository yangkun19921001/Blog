1. openCV420  java.lang.UnsatisfiedLinkError: dlopen failed: library "libc++_shared.so" 

   ```java
   2020-03-28 21:37:27.735 5127-5127/? E/AndroidRuntime: FATAL EXCEPTION: main
       Process: com.devyk.opencv_face_detect, PID: 5127
       java.lang.UnsatisfiedLinkError: dlopen failed: library "libc++_shared.so" not found
           at java.lang.Runtime.loadLibrary0(Runtime.java:1016)
           at java.lang.System.loadLibrary(System.java:1672)
           at com.devyk.opencv_face_detect.MainActivity.<clinit>(MainActivity.java:113)
           at java.lang.Class.newInstance(Native Method)
           at android.app.AppComponentFactory.instantiateActivity(AppComponentFactory.java:69)
           at androidx.core.app.CoreComponentFactory.instantiateActivity(CoreComponentFactory.java:43)
           at android.app.Instrumentation.newActivity(Instrumentation.java:1224)
           at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:3340)
           at android.app.ActivityThread.handleLaunchActivity(ActivityThread.java:3614)
           at android.app.servertransaction.LaunchActivityItem.execute(LaunchActivityItem.java:86)
           at android.app.servertransaction.TransactionExecutor.executeCallbacks(TransactionExecutor.java:108)
           at android.app.servertransaction.TransactionExecutor.execute(TransactionExecutor.java:68)
           at android.app.ActivityThread$H.handleMessage(ActivityThread.java:2199)
           at android.os.Handler.dispatchMessage(Handler.java:112)
           at android.os.Looper.loop(Looper.java:216)
           at android.app.ActivityThread.main(ActivityThread.java:7625)
           at java.lang.reflect.Method.invoke(Native Method)
           at com.android.internal.os.RuntimeInit$MethodAndArgsCaller.run(RuntimeInit.java:524)
           at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:987)
   ```

   在 app/build.gradle 下面加入

   ```java
          externalNativeBuild {
               cmake {
                   cppFlags ""
                   abiFilters "armeabi-v7a","arm64-v8a"
   								//加入该行代码
                   arguments "-DANDROID_STL=c++_shared"
   
               }
               ndk{
                   abiFilters 'armeabi-v7a',"arm64-v8a"
               }
           }
   ```

   

2. 找不到 so

   检查 `set_target_properties` 是否设置正确

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200412214345.png)

   

   

   ```
   
   FAILURE: Build failed with an exception.
   
   * What went wrong:
   Execution failed for task ':utils:externalNativeBuildDebug'.
   > Build command failed.
     Error while executing process /Users/devyk/Data/Android/SDK/cmake/3.6.4111459/bin/cmake with arguments {--build /Users/devyk/Data/Project/sample/github_code/DexEncryptionDecryption/utils/.externalNativeBuild/cmake/debug/arm64-v8a --target aes}
     
     ninja: error: '/Users/devyk/Data/Project/sample/github_code/DexEncryptionDecryption/utils../libs/lib/arm64-v8a/libcrypto.so', needed by '../../../../build/intermediates/cmake/debug/obj/arm64-v8a/libaes.so', missing and no known rule to make it
   
   
   * Try:
   Run with --stacktrace option to get the stack trace. Run with --info or --debug option to get more log output. Run with --scan to get full insights.
   
   * Get more help at https://help.gradle.org
   ```

   

   

3. needed or dlopened by "/vendor/lib64/libnativeloader.so" is not accessible for the namespace "classloader-namespace"

   版本过高导致，小于 <= 23 就行

   https://stackoverflow.com/questions/52515309/libraries-not-accessible-for-classloader-namespace-when-loading-dl4j-model-us

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200412215011.png)

4. 缺少 c++_shared 动态库

   ```groovy
   externalNativeBuild {
       cmake {
   	//java.lang.UnsatisfiedLinkError: dlopen failed: library "libc++_shared.so" not found
          //加上这句解决
          arguments "-DANDROID_STL=c++_shared"
           
       }
   }
   ```

5. 解决 " lib64 libc so 6 version `GLIBC_2 18' not found (required by lib

   ```
   curl -O http://ftp.gnu.org/gnu/glibc/glibc-2.18.tar.gz
   tar zxf glibc-2.18.tar.gz 
   cd glibc-2.18/
   mkdir build
   cd build/
   ../configure --prefix=/usr --disable-profile --enable-add-ons --with-headers=/usr/include --with-binutils=/usr/bin
   
   
   make 
   make install
   
   安装完成后，查看是否成功
   ll /lib64/libc*
   然后可以继续查看 glibc支持的版本
   strings /lib64/libc.so.6 | grep GLIBC
   
   //ll cp 等命令失效请用以下进行软连接   
   LD_PRELOAD=/lib64/libc-2.17.so ln -s /lib64/libc-2.17.so /lib64/libc.so.6
   
   //升级glibc 版本
   LD_PRELOAD=/opt/glibc-2.18/lib/libc-2.18.so ln -s /opt/glibc-2.18/lib/libc-2.18.so /lib64/libc.so.6
   
   //删除配置的环境变量
   unset LD_LIBRARY_PATH
   ```

6、在make install过程中出现如下错误：
   find / -name "ld.so.conf"

   cp /etc/ld.so.conf / opt/glibc-2.14/etc/

   make install

   //查看 glibc 版本
   ll /lib64/libc.so.6

7、 undefined reference to

CMakeFiles/audio.dir/native_audio.cpp.o: In function `Android_JNI_start(_JNIEnv*, _jobject*)':
/Users/devyk/Data/Project/sample/github_code/audioplayer/audio_library/src/main/cpp/native_audio.cpp:52: undefined reference to `AudioPlayer::AudioPlayer(Status*)'
clang++: error: linker command failed with exit code 1 (use -v to see invocation)
ninja: build stopped: subcommand failed.

检查是否有定义 cpp/c 文件 是否有链接到库里面