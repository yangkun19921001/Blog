

1.如果版本低于1.6，直接去此网址下载
https://developer.android.com/sdk/older_releases.html
2.先去此页面检查要下载的版本号
https://developer.android.com/studio/releases/sdk-tools.html

3.写入对应版本然后下载

```
ADT
http://dl.google.com/android/ADT-XX.0.0.zip

SDK Tools
http://dl.google.com/android/repository/tools_rXX-linux_x86.zip
http://dl.google.com/android/repository/tools_rXX-windows.zip
http://dl.google.com/android/repository/tools_rXX-macosx.zip

Platform Tools
http://dl.google.com/android/repository/platform-tools_rXX-linux_x86.zip
http://dl.google.com/android/repository/platform-tools_rXX-windows.zip
http://dl.google.com/android/repository/platform-tools_rXX-macosx.zip

Build Tools
http://dl.google.com/android/repository/build-tools_rXX-linux.zip
http://dl.google.com/android/repository/build-tools_rXX-windows.zip
http://dl.google.com/android/repository/build-tools_rXX-macosx.zip

Platforms
http://dl.google.com/android/repository/android-XX.zip
```





Android 命令打包

```
android update project -p . -t android-18

cd jni

ndk-build

cd ..

ant debug

adb install -r bin/.._.apk
```

