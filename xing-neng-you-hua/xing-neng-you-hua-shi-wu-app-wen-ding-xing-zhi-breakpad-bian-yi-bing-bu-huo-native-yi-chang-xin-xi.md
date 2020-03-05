# 性能优化 \(十五\) APP 稳定性之 breakpad 编译并捕获 Native 异常信息

## 介绍

现在 Android 日常开发中，多多少少会用到 so 动态库，特别是一些第三方的 so 比如（地图 SDK，音视频 SDK）还有自研 SDK，不知道大家有没有想过这样的一个问题，用户反馈我们的 APP 崩溃，这个时候后台也没有收到具体的日志，我们也不知道从哪里分析，这是最可怕的。如果有日志，一切就好办了，下面我们就来分析 Android 端怎么获取不同情况下的崩溃信息。

## [框架使用](https://github.com/yangkun19921001/YKCrash)

```java
//1. 配置 project/build.gradle

allprojects {
        repositories {
            ...
            maven { url 'https://jitpack.io' }
        }
    }
```

```java
//2. app/build.gradle

    dependencies {
      implementation 'com.github.yangkun19921001:YKCrash:1.0.1'
    }
```

```java
//3. application 中初始化
//nativePath: 保存的 dmp 日志
CrashUtils.initNativeCrash(getApplicationContext(), nativePath);
```

## 产生崩溃的原因

### 哪些情况会崩溃

1. Java 崩溃；

   Java 崩溃就是在 Java 代码中，出现了未捕获异常，导致程序异常退出。

2. native 崩溃；

   一般都是因为在 Native 代码中访问非法地址，也可能是地址对齐出现了问题，，或者发生了程序主动 abort , 这些都会产生相应的 signal 信号，导致程序异常退出。

3. ANR；
   1. 死锁；
   2. IO 问题；
   3. 主线程耗时操作；
   4. 频繁大量 GC. 

## breakpad 编译及使用\(MAC\)

### 介绍

这里推荐大家使用 Chromium 的 [Breakpad](https://github.com/google/breakpad), 为什么呢？因为它是目前 Native 崩溃捕获中最为成熟的方案，但是很多人都觉得 Breakpad 过于复杂。其实我认为 Native 崩溃捕获这件事儿就本来不容易。

如果你对 Native 崩溃机制的一些基本知识还不是很熟悉，可以看一下[Android 平台 Native 代码的崩溃捕获机制及实现](https://mp.weixin.qq.com/s/g-WzYF3wWAljok1XjPoo7w)

### **1. 获取 breakpad 源码**

* [官网获取](https://chromium.googlesource.com/breakpad/breakpad/+/master)

  [![breakpad.jpg](https://s5.ex2x.com/2019/09/17/breakpad.jpg)](https://free.imgsha.com/i/1EAoP)

* [GitHub 下载](https://github.com/google/breakpad)

### **2. 执行安装 breakpad**

```java
1. cd breakpad 目录
2. 直接命令窗口输入：
    ./configure && make
```

执行完之后会生成 src/processor/minidump\_stackwalk 文件，待会 dmp -&gt; txt 会用到这个文件。

### **3. CMake** 编译源码

[![breakpad\_build.jpg](https://s5.ex2x.com/2019/09/17/breakpad_build.jpg)](https://free.imgsha.com/i/1Ewg1)

**build 配置**

```java
apply plugin: 'com.android.library'

android {
        .....

    defaultConfig {
            ....
        externalNativeBuild {
            cmake {
                cppFlags "-std=c++11"
            }
        }

        ndk {
            abiFilters "armeabi-v7a", "arm64-v8a", "x86"
        }
    }
        ....

    externalNativeBuild {
        cmake {
            path "src/main/cpp/CMakeLists.txt"
        }
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
}
```

把 breakpad/src 源码导致 AS 中 [CMake](https://developer.android.com/ndk/guides/cmake) 配置好之后直接在 AS/Build/make break-build 之后就能生成动态 so 库了。

注意：下载的源码缺少 `lss` 目录，可以点击[下载](https://github.com/yangkun19921001/YKCrash)获取

### **4. 编写初始化 breakpad**

```java
#include <stdio.h>
#include <jni.h>
#include <android/log.h>

#include "client/linux/handler/exception_handler.h"
#include "client/linux/handler/minidump_descriptor.h"

#define LOG_TAG "dodoodla_crash"

#define ALOGV(...) __android_log_print(ANDROID_LOG_VERBOSE, LOG_TAG, __VA_ARGS__)
#define ALOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)
#define ALOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define ALOGW(...) __android_log_print(ANDROID_LOG_WARN, LOG_TAG, __VA_ARGS__)
#define ALOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)


bool DumpCallback(const google_breakpad::MinidumpDescriptor &descriptor,
                  void *context,
                  bool succeeded) {
    ALOGD("===============crrrrash================");
    ALOGD("Dump path: %s\n", descriptor.path());
    return succeeded;
}

/** java 代码中调用*/
extern "C"
JNIEXPORT void JNICALL
Java_com_devyk_crash_1module_CrashUtils_initBreakpadNative(JNIEnv *env, jclass type,
                                                           jstring path_) {
    const char *path = env->GetStringUTFChars(path_, 0);

    // TODO
    google_breakpad::MinidumpDescriptor descriptor(path);
    static google_breakpad::ExceptionHandler eh(descriptor, NULL, DumpCallback, NULL, true, -1);

    env->ReleaseStringUTFChars(path_, path);
}

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *reserved) {
    JNIEnv *env;
    if (vm->GetEnv((void **) &env, JNI_VERSION_1_6) != JNI_OK) {
        return JNI_ERR;
    }
    return JNI_VERSION_1_6;
}
```

## 生成 dmp 文件并定位 crash

### 1. 在 app 模块中故意编写崩溃代码

```java
/**
 * 引起 crash
 */
void Crash() {
    volatile int *a = (int *) (NULL);
    *a = 1;
}

extern "C"
JNIEXPORT void JNICALL
Java_com_devyk_ykcrash_MainActivity_testCrash(JNIEnv *env, jclass type) {

    // TODO
    Crash();
}
```

### 2. init native crash 捕获

```java
//配置 native 崩溃捕获
CrashUtils.initCrash(String nativeCrashPath);
```

### 3. 制造 Crash 并生成 xxx.dmp 文件

[![no1Exe.gif](https://s2.ax1x.com/2019/09/17/no1Exe.gif)](https://imgchr.com/i/no1Exe)

这里看到了生成了的 xxx.dmp 文件，下面就需要将 dmp to txt 文件稍微我们能看的懂的。

### 4. dmp to txt

1. 将 breakpad/src/processor/minidump\_stackwalk copy 到一个单独的文件下
2. 执行命令 to txt

   ```java
   //格式 
   ./minidump_stackwalk xxx.dmp >xxx.txt

   //例子
   ./minidump_stackwalk /Users/devyk/Data/Project/sample/tempFile/nativeCrash.dmp >crashLog2.txt
   ```

   [![no3qcF.gif](https://s2.ax1x.com/2019/09/18/no3qcF.gif)](https://imgchr.com/i/no3qcF)

3. 查看 txt 文件到底是什么？

   ```java
   Operating system: Android
                     0.0.0 Linux 4.9.148 #1 SMP PREEMPT Wed Jun 26 04:38:26 CST 2019 aarch64
   CPU: arm64
        8 CPUs

   GPU: UNKNOWN

   Crash reason:  SIGSEGV /SEGV_MAPERR
   Crash address: 0x0
   Process uptime: not available

   //crash 发生线程
   Thread 0 (crashed)
     //这里的 libcrash-lib.so + 0x5f0 很重要。告诉了我们在哪个 so 发生崩溃，在具体哪个位置发生崩溃。这里先记住 0x5f0 这个值。
    0  libcrash-lib.so + 0x5f0 
        x0 = 0x00000078d4ac5380    x1 = 0x0000007fe01fd9d4
        x2 = 0x0000007fe01fda00    x3 = 0x00000078d453ecb8
        x4 = 0x0000000000000000    x5 = 0x00000078d4586b94
        x6 = 0x0000000000000001    x7 = 0x0000000000000001
        x8 = 0x0000000000000001    x9 = 0x0000000000000000
       x10 = 0x0000000000430000   x11 = 0x00000078d49396d8
       x12 = 0x000000795afcb630   x13 = 0x0ef1a811d0863271
       x14 = 0x000000795aede000   x15 = 0xffffffffffffffff
       x16 = 0x00000078b8cb5fe8   x17 = 0x00000078b8ca55dc
       x18 = 0x0000000000000000   x19 = 0x00000078d4a15c00
       x20 = 0x0000000000000000   x21 = 0x00000078d4a15c00
       x22 = 0x0000007fe01fdc90   x23 = 0x00000079552cb12a
       x24 = 0x0000000000000000   x25 = 0x000000795b3125e0
       x26 = 0x00000078d4a15ca0   x27 = 0x0000000000000000
       x28 = 0x0000007fe01fd9d0    fp = 0x0000007fe01fd9a0
        lr = 0x00000078b8ca5614    sp = 0x0000007fe01fd980
   ```

4. 基于 dmp to txt 里面的 libcrash-lib.so + 0x5f0 信息，转换为具体哪个函数，哪行报的错。

   1. 根据 txt 提示的信息 aarch64 CPU: arm64 那么我们就在当前使用的 NDK 版本找到 `/Users/devyk/Data/Android/NDK/android-ndk-r17c/toolchains/aarch64-linux-android-4.9/prebuilt/darwin-x86_64/bin/aarch64-linux-android-addr2line` 这个路径，使用下面的命令找到具体报错的地方

      ```java
      //1. 格式
      aarch64-linux-android-addr2line -f -C -e [根据 txt 信息拿到具体报错的 so] [根据 txt 文件信息拿到具体报错的值]

      //2. 示例
      /Users/devyk/Data/Android/NDK/android-ndk-r17c/toolchains/aarch64-linux-android-4.9/prebuilt/darwin-x86_64/bin/aarch64-linux-android-addr2line -f -C -e /Users/devyk/Data/Project/sample/github_code/YKCrash/app/build/intermediates/transforms/mergeJniLibs/debug/0/lib/arm64-v8a/libcrash-lib.so 0x5f0
      ```

      下面录像就是输入命令之后的效果。

   [![noG7yF.gif](https://s2.ax1x.com/2019/09/18/noG7yF.gif)](https://imgchr.com/i/noG7yF)

   根据上面录像我们拿到了重要信息如下：

   ```java
   //报错的函数
   Crash()
   //当前 cpp 报错的行数
   /Users/devyk/Data/Project/sample/github_code/YKCrash/app/src/main/cpp/crash.cpp:10
   ```

   我们看下 cpp 10 行具体是什么。

   [![noJh0H.jpg](https://s2.ax1x.com/2019/09/18/noJh0H.jpg)](https://imgchr.com/i/noJh0H)

   这里不用想，肯定会 crash。

   到这里我们已经捕获到了 native 层崩溃日志，相信大家已经会了。

## 总结

在之前我是真不知道 [breakpad](https://github.com/google/breakpad) 这个开源库，而且还是 Google 开源的。因为项目中用到 C++ 代码比较多，崩溃捕获是必须的。在不知道 [breakpad](https://github.com/google/breakpad) 之前一直用的 [腾讯 Bugly](https://bugly.qq.com/v2/) ，由于Bugly 只支持互联网环境，最后我也就止步了，为什么呢？因为公司开发出来的产品是给政府部分用的（政府部门有专门的网络属于局域网\)。

最后我把 [breakpad](https://github.com/google/breakpad) 编译及使用记录下来，以供后来使用者提供方便之路，并把它封装成了一个 [crash\_build\_module](https://github.com/yangkun19921001/YKCrash) 需要可以点击进行下载。

## 非常感谢

* [Android 开发高手课 - 张绍文 \(Tinker负责人\)](https://time.geekbang.org/column/article/70602)

