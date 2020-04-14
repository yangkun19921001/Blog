#openssl 1.1.1b for Android 的编译步骤

### 1.准备NDK环境

```shell
当前使用android-ndk-14b linux版本
windows10 WSL环境下
```

### 2.准备openssl源码

```shell
cd /mnt/d/openssl-build/openssl1.1.1b-build
wget https://www.openssl.org/source/openssl-1.1.1b.tar.gz
 
# 解压
tar -zxvf openssl-1.1.1b.tar.gz
 
# 拉取Setenv-android.sh，我们需要这个脚本来给我们配置环境
cd openssl-1.1.1b/
wget https://wiki.openssl.org/images/7/70/Setenv-android.sh
 
```

### 3.准备编译脚本Setenv-android.sh

```shell
##########编译x86版本的库##############
# 选择NDK的版本
_ANDROID_NDK="android-ndk-r14b"
# 选择使用的EABI 交叉编译链
_ANDROID_EABI="x86-4.9"
# 选择目标架构
_ANDROID_ARCH=arch-x86
# 在Android4.0及以上
_ANDROID_API="android-14"
##########编译x86版本的库##############
 
##########编译armeabi-v7a的库##############
# 选择NDK的版本
_ANDROID_NDK="android-ndk-r14b"
# 选择使用的EABI 交叉编译链
_ANDROID_EABI="arm-linux-androideabi-4.9"
# 选择目标架构
_ANDROID_ARCH=arch-arm
# 在Android4.0及以上
_ANDROID_API="android-14"
##########编译armeabi-v7a的库##############
 
##########编译arm64-v8a的库##############
# 选择NDK的版本
_ANDROID_NDK="android-ndk-r14b"
# 选择使用的EABI 交叉编译链
_ANDROID_EABI="aarch64-linux-android-4.9"
# 选择目标架构
_ANDROID_ARCH=arch-arm64
# 在Android5.0及以上，因为5.0后支持arm64
_ANDROID_API="android-21"
##########编译armeabi-v7a的库##############
 
使用Notepad++ 进行全局替换\r\n 为 \n
```

### 4.准备编译

```shell
# 设置局部环境变量
export ANDROID_NDK_HOME=/mnt/e/android-ndk-r14b
source ./Setenv-android.sh
# 显示如下：
Error: FIPS_SIG does not specify incore module. Please edit this script.
ANDROID_NDK_ROOT: /mnt/e/android-ndk-r14b
ANDROID_ARCH: arch-x86
ANDROID_EABI: x86-4.9
ANDROID_API: android-14
ANDROID_SYSROOT: /mnt/e/android-ndk-r14b/platforms/android-14/arch-x86
ANDROID_TOOLCHAIN: /mnt/e/android-ndk-r14b/toolchains/x86-4.9/prebuilt/linux-x86_64/bin
FIPS_SIG:
CROSS_COMPILE: i686-linux-android-
ANDROID_DEV: /mnt/e/android-ndk-r14b/platforms/android-14/arch-x86/usr
```

### 5.开始编译

```shell
# 创建编译文件存储目录(不同cpu架构只需要执行一条)
# ./config -fPIC no-shared   //配置静态编译

mkdir /mnt/d/openssl-build/openssl1.1.1b-build/openssl-output-x86
mkdir /mnt/d/openssl-build/openssl1.1.1b-build/openssl-output-armv7a
mkdir /mnt/d/openssl-build/openssl1.1.1b-build/openssl-output-arm64
# 配置openssl
# x86
./config shared no-ssl2 no-ssl3 no-comp no-hw no-engine \
     --openssldir=/mnt/d/openssl-build/openssl1.1.1b-build/openssl-output-x86/$ANDROID_API --prefix=/mnt/d/openssl-build/openssl1.1.1b-build/openssl-output-x86/$ANDROID_API
 
# armeabi-v7a
./config shared no-ssl2 no-ssl3 no-comp no-hw no-engine \
     --openssldir=/mnt/d/openssl-build/openssl1.1.1b-build/openssl-output--armv7a/$ANDROID_API --prefix=/mnt/d/openssl-build/openssl1.1.1b-build/openssl-output--armv7a/$ANDROID_API
 
# arm64-v8a
# 需要修改源码目录中的config文件，否则不支持，以下是修改后的部分，通过查找定位到位置，对比后改成下面
# 增加了aarch64-*-android) OUT="android-arm64";; x86_64-*-android) OUT="android-x86_64";;
x86-*-android|i?86-*-android) OUT="android-x86" ;;
armv[7-9]*-*-android)
    OUT="android-armeabi"
    __CNF_CFLAGS="$__CNF_CFLAGS -march=armv7-a"
    __CNF_CXXFLAGS="$__CNF_CXXFLAGS -march=armv7-a";;
aarch64-*-android) OUT="android-arm64";;
x86_64-*-android) OUT="android-x86_64";;
arm*-*-android) OUT="android-armeabi" ;;
 
 
./config shared no-ssl2 no-ssl3 no-comp no-hw no-engine \
     --openssldir=/mnt/d/openssl-build/openssl1.1.1b-build/openssl-output-arm64/$ANDROID_API --prefix=/mnt/d/openssl-build/openssl1.1.1b-build/openssl-output-arm64/$ANDROID_API
     
     
make
 
make install
 
```

### 6.库的名称替换

```shell
cd /mnt/d/openssl-build/openssl1.1.1b-build/openssl-output/android-14/lib
 
rpl -R -e .so.1.1 "_1_1.so" ./libcrypto.so.1.1
rpl -R -e .so.1.1 "_1_1.so" ./libssl.so.1.1
```
