# 音视频学习 \(四\) 交叉编译和动态库、静态库入门

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200112161740.jpeg)

\[TOC\]

## 前言

该篇文章主要介绍 Android 端利用 NDK 工具库来对 C/C++ 进行交叉编译，并通过 makefile 和 cmake 来构建 Android 项目。

## 编译器

了解 c/c++ 编译器的基本使用，能够在后续移植第三方框架进行交叉编译时，清楚的了解应该传递什么参数。

**1. clang**

clang 是一个`C、C++、Object-C`的轻量级编译器。基于`LLVM`（ LLVM是以C++编写而成的构架编译器的框架系统，可以说是一个用于开发编译器相关的库）,对比 gcc，它具有编译速度更快、编译产出更小等优点，但是某些软件在使用 clang 编译时候因为源码中内容的问题会出现错误。

**2. gcc**

GNU C 编译器。原本只能处理 C 语言，但是它很快扩展，变得可处理 C++。\( GNU目标是创建一套完全自由的操作系统\)。

**3. g++**

GNU c++ 编译器，后缀为 .c 的源文件，gcc 把它当作是 C 程序，而 g++ 当作是 C++ 程序；后缀为 .cpp 的，两者都会认为是 c++ 程序，g++ 会自动链接 c++ 标准库 stl ，gcc 不会，gcc 不会定义 \_\_cplusplus 宏，而 g++ 会。

## 编译原理

一个 C/C++ 文件要经过预处理\(preprocessing\)、编译\(compilation\)、汇编\(assembly\)、和链接\(linking\)才能变成可执行文件。

我们先在 linux 系统上创建一个 test.c 文件，编写一个最简单的 c 程序，代码如下:

```c
#include<stdio.h>
int main(){
    printf(" 执行成功 ! \n");
return 19921001;
}
```

1. 预处理阶段

   预处理阶段主要处理 include 和 define 等。它把 \#include 包含进来的 .h 文件插入到 \#include 所在的位置，把源程序中使用到的用 \#define 定义的宏用实际的字符串代替。

   我们可以通过以下命令来对 c/c++ 文件预处理，命令如下:

   ```text
   gcc -E test.c -o test.i //-E 的作用是让 gcc 在预处理结束后停止编译
   ```

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200110202030.png)

   可以看到输入该命令之后就会生成一个 test.i 文件。

2. 编译阶段

   在这个阶段中，gcc 首先要检查代码的规范性、是否有语法错误等，以确定代码的实际要做的工作。

   我们可以通过如下命令来处理 test.i 文件，编译成汇编文件，命令如下:

   ```c
   gcc -S test.i -o test.s//-S 的作用是编译结束生成汇编文件。
   ```

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200111145043.png)

3. 汇编阶段

   汇编阶段把 .S 文件翻译成二进制机器指令文件 .o ，这个阶段接收.c ,.i ,.s 的文件都没有问题。

   下面我们通过以下命令生成二进制机器指令文件 .o 文件:

   ```c
   gcc -c test.s -o test.o
   ```

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200111145443.png)

4. 链接阶段

   链接阶段，链接的是函数库。可以通过以下命令实现:

   ```c
   gcc -C test.o -o test
       ./test
   ```

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200111145916.png)最后我们通过实际操作，对编译有了一定的了解，当然你也可以直接通过如下命令一步到位:

```c
gcc test.c -o test
```

到这里我们成功的在 linux 平台生成了可执行文件，试想一下我们可以将这个可执行文件拷贝到安卓手机上执行吗？我们也不猜想了，实际测试下就行，我们把 test 可执行文件 push 到手机 /data/local/tmp 里面, 如下所示:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200111155247.png)

可以看到 test 在手机 /data/local/tmp 的路径下是有可读可写可执行的权限，但是最后执行不成功，这是为什么呢? 其实 **主要原因是两个平台的 CPU 指令集不一样，根本就无法识别指令**。那么怎么解决这个问题呢? 下面就要用到今天一个比较重要的知识点了， **利用 Android NDK 工具包来对 C/C++ 代码进行交叉编译** 。

## 交叉编译

简单地来说，交叉编译就是程序的编译环境和实际运行环境不一致，即在一个平台上生成另一个平台上的可执行代码。

在音视频开发中了解交叉编译是很有必要的，因为无论在哪一种移动平台下开发，第三方库都是需要进行交叉编译的。下面我们就以之前的例子来讲解如何在 linux 环境下交叉编译出移动平台上的可执行代码。

### 了解 NDK

Android 原生开发包 \(NDK\) 可用于 Android 平台上的 C++ 开发，NDK 不仅仅是一个单一功能的工具，还是一个包含了 API 、交叉编译器、调试器、构建工具等得综合工具集。

下面大致列举了一下经常会用到的组件。

* ARM 交叉编译器
* 构建工具
* Java 原生接口头文件
* C 库
* Math 库
* 最小的 C++ 库
* ZLib 压缩库
* POSIX 线程
* Android 日志库
* Android 原生应用 API
* OpenGL ES 库
* OpenSL ES 库

下面来看一下 Android 所提供的 NDK 跟目录下的结构。

* ndk-build: 该 Shell 脚本是 Android NDK 构建系统的起始点，一般在项目中仅仅执行这一个命令就可以编译出对应的动态链接库了。
* ndk-gdb: 该 Shell 脚本允许用 GUN 调试器调试 Native 代码，并且可以配置到 AS 中，可以做到像调试 Java 代码一样调试 Native 代码。
* ndk-stack: 该 Shell 脚本可以帮组分析 Native 代码崩溃时的堆栈信息。
* build: 该目录包含 NDK 构建系统的所有模块。
* platforms: 该目录包含支持不同 Android 目标版本的头文件和库文件， NDK 构建系统会根据具体的配置来引用指定平台下的头文件和库文件。
* toolchains: 该目录包含目前 NDK 所支持的不同平台下的交叉编译器 - ARM 、X86、MIPS ，目前比较常用的是 ARM 。构建系统会根据具体的配置选择不同的交叉编译器。

下面我们就来为交叉编译的环境变量配置

### 环境变量配置

* ndk 在 Linux 上的环境变量配置:

  ```c
  //1. vim /etc/profile
  #NDK环境变量
  export NDK_HOME=/root/android/ndk/android-ndk-r17c
  export PATH=$PATH:$NDK_HOME

  //2. 保存
  source  /etc/profile

  //3. 测试
  ndk-build -v
  ```

  如果出现如下字样，就证明配置成功了。

  ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200111173932.png)

* 交叉编译在 Linux 上的环境变量配置\(做一个参考，采坑之后的环境配置\):

  ```c
  export NDK_GCC_x86="/root/android/ndk/android-ndk-r17c/toolchains/x86-4.9/prebuilt/linux-x86_64/bin/i686-linux-android-gcc"
  export NDK_GCC_x64="/root/android/ndk/android-ndk-r17c/toolchains/x86_64-4.9/prebuilt/linux-x86_64/bin/x86_64-linux-android-gcc"
  export NDK_GCC_arm="/root/android/ndk/android-ndk-r17c/toolchains/arm-linux-androideabi-4.9/prebuilt/linux-x86_64/bin/arm-linux-androideabi-gcc"
  export NDK_GCC_arm_64="/root/android/ndk/android-ndk-r17c/toolchains/aarch64-linux-android-4.9/prebuilt/linux-x86_64/bin/aarch64-linux-android-gcc"

  export NDK_CFIG_x86="--sysroot=/root/android/ndk/android-ndk-r17c/platforms/android-21/arch-x86 -isystem /root/android/ndk/android-ndk-r17c/sysroot/usr/include -isystem /root/android/ndk/android-ndk-r17c/sysroot/usr/include/i686-linux-android"
  export NDK_CFIG_x64="--sysroot=/root/android/ndk/android-ndk-r17c/platforms/android-21/arch-x86_64 -isystem /root/android/ndk/android-ndk-r17c/sysroot/usr/include -isystem /root/android/ndk/android-ndk-r17c/sysroot/usr/include/x86_64-linux-android"
  export NDK_CFIG_arm="--sysroot=/root/android/ndk/android-ndk-r17c/platforms/android-21/arch-arm -isystem /root/android/ndk/android-ndk-r17c/sysroot/usr/include -isystem /root/android/ndk/android-ndk-r17c/sysroot/usr/include/arm-linux-androideabi"
  export NDK_CFIG_arm_64="--isysroot=/root/android/ndk/android-ndk-r17c/platforms/android-21/arch-arm64 -isystem /root/android/ndk/android-ndk-r17c/sysroot/usr/include -isystem -isystem /root/android/ndk/android-ndk-r17c/sysroot/usr/include/aarch64-linux-android"

  export NDK_AR_x86="/root/android/ndk/android-ndk-r17c/toolchains/x86-4.9/prebuilt/linux-x86_64/bin/i686-linux-android-ar"
  export NDK_AR_x64="/root/android/ndk/android-ndk-r17c/toolchains/aarch64-linux-android-4.9/prebuilt/linux-x86_64/bin/aarch64-linux-android-ar"
  export NDK_AR_arm="/root/android/ndk/android-ndk-r17c/toolchains/arm-linux-androideabi-4.9/prebuilt/linux-x86_64/bin/arm-linux-androideabi-ar"
  export NDK_AR_arm_64="/root/android/ndk/android-ndk-r17c/toolchains/aarch64-linux-android-4.9/prebuilt/linux-x86_64/bin/aarch64-linux-android-ar"
  ```

  你可以根据自己的 ndk 路径对应我的环境变量来进行配置。下面我们就用 ndk gcc 来对 test.c 进行交叉编译，步骤如下:

  1. 首先找到 /root/android/ndk/android-ndk-r17c/toolchains/arm-linux-androideabi-4.9/prebuilt/linux-x86\_64/bin/arm-linux-androideabi-gcc

     ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200111183926.png)

     执行如下命令:

     ```text
     /root/android/ndk/android-ndk-r17c/toolchains/arm-linux-androideabi-4.9/prebuilt/linux-x86_64/bin/arm-linux-androideabi-gcc -o test test.c
     ```

     ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200111184256.png)

     这种错误是说在我们编得时候编译器找不到我们引入的 stdio.h 头文件，那怎么告诉编译器 stdio.h 头文件在哪里呢? 下面知识点说明怎么指定这些报错的头文件

     \*\*

  2. 指定头文件代码

     ```text
     /root/android/ndk/android-ndk-r17c/toolchains/arm-linux-androideabi-4.9/prebuilt/linux-x86_64/bin/arm-linux-androideabi-gcc --sysroot=/root/android/ndk/android-ndk-r17c/platforms/android-21/arch-arm -isystem /root/android/ndk/android-ndk-r17c/sysroot/usr/include -pie -o test test.c
     ```

     上面出现了几个命令符号，不了解了可以看一下如下解释:

     **--sysroot=?:** 使用 ？作为这一次编译的头文件与库文件的查找目录，查找下面的 usr/include 目录。

     **-isystem ?\(主要中间有一个英文空格\)** : 使用头文件查找目录，覆盖 --sysroot, 查找 ?/usr/include 目录下面的头文件。

     **-isystem ?\(主要中间有一个英文空格\):**  指定头文件的查找路径。

     **-I?:** 头文件的查找目录，I 是大写。

```text
 这样编译之后还是会报一个 asm/types.h 文件找不到，我们还要继续修改一下路径，如下

 ```
 /root/android/ndk/android-ndk-r17c/toolchains/arm-linux-androideabi-4.9/prebuilt/linux-x86_64/bin/arm-linux-androideabi-gcc --sysroot=/root/android/ndk/android-ndk-r17c/platforms/android-21/arch-arm -isystem /root/android/ndk/android-ndk-r17c/sysroot/usr/include -isystem /root/android/ndk/android-ndk-r17c/sysroot/usr/include/arm-linux-androideabi -pie -o test test.c
 ```

 这样就能编译成一个 Android 平台可执行的文件了，这样看起来路径太多不易阅读，大家可以参考我提供的全局变量配置来进行设置，最后一行命令解决，如下:

 ```c
 $NDK_GCC_arm $NDK_CFIG_arm -pie -o test test.c
 ```

 ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200111191038.gif)

 可以看到，我们使用 Android NDK 编译出来的可执行文件已经在 Linux 平台下不可执行了。下面我们将 test 文件导入到 手机  /data/local/tmp 目录。
```

1. 将 NDK 交叉编译出来的 test 可执行文件，导入 Android 手机中并执行 test 文件。

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200111191810.gif)

   根据上面的录屏，我们知道已经成功的在 Android 设备下执行了 NDK 交叉编译后的 test 文件了。

   下面我们利用 NDK 工具交叉编译 test.c 输出静态动态库。

## 动态库 & 静态库

### 编译静态库

1. 将 test.c 使用 NDK GCC 编译为 .o 文件 ,命令如下:

   ```c
   $NDK_GCC_arm $NDK_CFIG_arm -fpic -c test.c -o test.o
   ```

   如果出现如下文件，证明已经成功了。

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200111193923.png)

2. 使用 NDK arm-linux-androideabi-ar 工具将 test.o 文件生成 test.a 静态库，命令如下:

   ```c
   $NDK_AR_arm r test.a test.o
   ```

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200111194141.png)

   之后我们把 test.a 文件导入到 AS 中，来对 .a 的使用。

### 编译动态库

在编译动态库的时候我们需要指定 -fPIC -shared 额外参数给编译器，完整命令如下：

```text
$NDK_GCC_arm $NDK_CFIG_arm -fpic -shared test.c -o libTest.so
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200111194822.png)

### 动态库与静态库的区别

在平时工作中我们经常把一些常用的函数或者功能封装为一个个库供给别人使用，java开发我们可以封装为 ja r包提供给别人用，安卓平台后来可以打包成 aar 包，同样的，C/C++ 中我们封装的功能或者函数可以通过静态库或者动态库的方式提供给别人使用。

Linux 平台静态库以 .a 结尾，而动态库以 .so 结尾。

那静态库与动态库有什么区别呢？

**1. 静态库**

与静态库连接时，静态库中所有被使用的函数的机器码在**编译**的时候都被拷贝到最终的可执行文件中，并且会被添加到和它连接的每个程序中：

**优点**：运行起来会快一些，不用查找其余文件的函数库了。

**缺点**：导致最终生成的可执行代码量相对变多,运行时, 都会被加载到内存中. 又多消耗了内存空间。

**2. 动态库**

与动态库连接的可执行文件只包含需要的函数的引用表，而不是所有的函数代码，只有在程序**执行**时, 那些需要的函数代码才被拷贝到内存中。

优点：生成可执行文件比较小, 节省磁盘空间，一份动态库驻留在内存中被多个程序使用，也同时节约了内存。

缺点：由于运行时要去链接库会花费一定的时间，执行速度相对会慢一些。

**静态库是时间换空间，动态库是空间换时间，二者均有好坏。**

如果我们要修改函数库，使用动态库的程序只需要将动态库重新编译就可以了，而使用静态库的程序则需要将静态库重新编译好后，将程序再重新编译一遍。

## mk & cmake

上一小节我们通过 NDK 交叉编译了 test.c 为动态静态库，那么该小节我们就基于 makefile 和 cmake 来构建一个 C/C++ 的 Android 程序, 并使用 test .a /libTest.so

### mk

Android.mk 是在 Android 平台上构建一个 C 或者 C ++ 语言编写的程序系统的 Makefile 文件，不同的是， Android 提供了一些列内置变量来提供更加方便的构建语法规则。Application.mk 文件实际上是对应用程序本身进行描述的文件，它描述了应用程序要针对哪些 CPU 架构打包动态 so 包、要构建的是 release 包还是 debug 包以及一些编译和链接参数等。

#### 语法基础

**1. Android.mk**

* LOCAL\_PATH :=$\(call my-dir\)

  返回当前文件在系统中路径，Android.mk 文件开始时必须定义该变量。

* include $\(CLEAR\_VARS\), 表明清楚上一次构建过程的所有全局变量，因为在一个 Makefile 编译脚本中，会使用大量的全局变量，使用这行脚本表明需要清除掉所有的全局变量。
* LOCAL\_SRC\_FILES, 要编译的 C 或者 CPP 的文件，注意这里不需要列举头文件，构建系统会自动帮组开发者依赖这些文件。
* LOCAL\_LDLIBS:= -L$\(SYSROOT\)/usr/lib -Ilog -IOpenSLES -IGLESv2 -IEGL -Iz,定编译过程所依赖的 NDK 提供的动态静态库， SYSROOT 变量代表的是 NDK\_ROOT 下面的目录 $NDK 提供的动态与静态库，SYSROOT 变量代表的是 NDK\_ROOT 下面目录 $NDK\_ROOT/platforms/android-21/arch-arm, 而在这个目录的 usr/lib/ 目录下有很多对应的 so 的动态库以及 .a 的静态库。
* LOCAL\_CFLAGS , 编译 C 或者 CPP 的编译标志，在实际编译的时候会发送给编译器。比如常用的实例是加上 -DAUTO\_TEST , 然后在代码中就可以利用条件判断 \#ifdef AUTO\_TEST 来做一些与自动化测试相关的事情。
* LOCAL\_LDFLAGS, 链接标志的可选列表，当对目标文件进行链接以生成输出文件的时候，将这些标志带给链接器。该指令与 LOCAL\_LDLIBS 有些类似，一般情况下，该选项会用于指定第三方编译的静态库，LOCAL\_LDLIBS 经常用于指定系统的库\(比如 log、OpenGLES、EGL 等\)。
* LOCAL\_MODULE, 该模块的编译的目标名，用于区分各个模块，名字必须是唯一并不包含空格的，如果编译目标是 so 库，那么该 so 库的名称就是 lib 项目名 .so。
* include $\(BUILD\_SHARED\_LIBRARY\) ，其实类似的 include 还有很多，都是构建系统提供的内置变量，该变量的意义是构建动态库，其他的内置变量还包括如下几种。
  * ---BUILD\_STATIC\_LIBRARY: 构建静态库
  * ---PREBUILT\_STATIC\_LIBRARY: 对已有的静态库进行包装，使其成为一个模块。
  * ---PREBUILT\_SHARED\_LIBRARY: 对已有的静态库进行包装，使其成为一个模块。
  * ---BUILD\_EXECUTABLE: 构建可执行文件。

**2. Application.mk**

* APP\_ABI := XXX ,这里的 XXX 是指不同平台，可以选填的有 x86 、mips 、armeabi、armeabi-v7a、all 等，值得一提的是，若选择 all 则会构建构建出所有平台的 so ,如果不填写该项，那么将默认构建为 armeabi 平台下的库。
* APP\_STL := gnustl\_static ,NDK 构建系统提供了由 Android 系统给出的最小 C++ 运行时库 （、system/lib/libstdc++.so）的 C++ 头文件。
* APP\_CPPFLAGS :=-std=gnu++11 -fexceptions, 指定编译过程的 flag ,可以在该选项中开启 exception rtti 等特性，但是为了效率考虑，最好关闭 rtti。
* NDK\_TOOLCHAIN\_VERSION = 4.8，指定交叉工具编译链里面的版本号，这里指定使用 4.8。
* APP\_PLATFORM :=android-9,指定创建的动态库的平台
* APP\_OPTIM := release,该变量是可选的，用来定义 “release” 或者 “debug” ,"release" 模式是默认的，并且会生成高度优化的二进制代码；“debug” 模式生成的是未优化的二进制代码，但是可以检测出很多的 BUG, 经常用于调试阶段，也相当于在 ndk-build 指令后边直接加上参数 NDK\_DEBUG=1。

#### 构建 C/C++ Android 项目

[项目源代码](https://github.com/yangkun19921001/ndk_study/tree/master/mk_application)

**效果:**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200111222928.png)

Makefile 的方式我们只做一个了解，因为以后我们构建 C/C++ 的 Android 项目都是用 cmake 方式来构建，所以我们重点掌握 cmake 就行。

### cmake

之前做 NDK 开发或者老的项目都是基于 Android.mk、Application.mk 来构建项目的，但从 AS 2.2 之后便开始采用 CMake 的方式来构建 C/C++ 项目，采用 CMake 相比与之前的 Android.mk、Application.mk 方便简单了许多。下面我们简单的来介绍下 cmake 基础语法吧。

#### 语法基础

```text
#1. 指定 cmake 的最小版本
cmake_minimum_required(VERSION 3.4.1)

#2. 设置项目名称
project(demo)

#3. 设置编译类型
add_executable(demo test.cpp) # 生成可执行文件
add_library(common STATIC test.cpp) # 生成静态库
add_library(common SHARED test.cpp) # 生成动态库或共享库

#4. 明确指定包含哪些源文件
add_library(demo test.cpp test1.cpp test2.cpp)

#5. 自定义搜索规则并加载文件
file(GLOB SRC_LIST "*.cpp" "protocol/*.cpp")
add_library(demo ${SRC_LIST}) //加载当前目录下所有的 cpp 文件
## 或者
file(GLOB SRC_LIST "*.cpp")
file(GLOB SRC_PROTOCOL_LIST "protocol/*.cpp")
add_library(demo ${SRC_LIST} ${SRC_PROTOCOL_LIST})
## 或者
aux_source_directory(. SRC_LIST)//搜索当前目录下的所有.cpp文件
aux_source_directory(protocol SRC_PROTOCOL_LIST) 
add_library(demo ${SRC_LIST} ${SRC_PROTOCOL_LIST})

#6. 查找指定库文件
find_library(
              log-lib //为 log 定义一个变量名称
              log ) //ndk 下的 log 库

#7. 设置包含的目录
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_BINARY_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

#8. 设置链接库搜索目录
link_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/libs
)

#9. 设置 target 需要链接的库
target_link_libraries( # 目标库
                       demo

                       # 目标库需要链接的库
                       # log-lib 是上面 find_library 指定的变量名
                       ${log-lib} )

#10. 指定链接动态库或者静态库
target_link_libraries(demo libtest.a) # 链接libtest.a
target_link_libraries(demo libtest.so) # 链接libtest.so

#11. 根据全路径链接动态静态库
target_link_libraries(demo ${CMAKE_CURRENT_SOURCE_DIR}/libs/libtest.a)
target_link_libraries(demo ${CMAKE_CURRENT_SOURCE_DIR}/libs/libtest.so)

#12. 指定链接多个库
target_link_libraries(demo
    ${CMAKE_CURRENT_SOURCE_DIR}/libs/libtest.a
    test.a
    boost_thread
    pthread)
```

#### 常用变量

| 预定义变量 | 说明 |
| :--- | :--- |
| **PROJECT\_SOURCE\_DIR** | 工程的根目录 |
| **PROJECT\_BINARY\_DIR** | 运行 cmake 命令的目录，通常是 ${PROJECT\_SOURCE\_DIR}/build |
| **PROJECT\_NAME** | 返回通过 project 命令定义的项目名称 |
| **CMAKE\_CURRENT\_SOURCE\_DIR** | 当前处理的 CMakeLists.txt 所在的路径 |
| **CMAKE\_CURRENT\_BINARY\_DIR** | target 编译目录 |
| **CMAKE\_CURRENT\_LIST\_DIR** | CMakeLists.txt 的完整路径 |
| **CMAKE\_CURRENT\_LIST\_LINE** | 当前所在的行 |
| **CMAKE\_MODULE\_PATH** | 定义自己的 cmake 模块所在的路径，SET\(CMAKE\_MODULE\_PATH ${PROJECT\_SOURCE\_DIR}/cmake\)，然后可以用INCLUDE命令来调用自己的模块 |
| **EXECUTABLE\_OUTPUT\_PATH** | 重新定义目标二进制可执行文件的存放位置 |
| **LIBRARY\_OUTPUT\_PATH** | 重新定义目标链接库文件的存放位置 |

#### 构建 C/C++ Android 项目

1. 以静态库构建项目
   * 定义 native 接口

     ```java
     public class MainActivity extends AppCompatActivity {

         static {
             System.loadLibrary("native-lib");
         }

         @Override
         protected void onCreate(Bundle savedInstanceState) {
             super.onCreate(savedInstanceState);
             setContentView(R.layout.activity_main);
             testCmake();
         }

         /**
          * 测试 cmake 构建程序
          */
         public native static void testCmake();
     }
     ```

   * 编写 cpp

     ```text
     // extern int main();  这样写有坑，因为 main 方法是属于 c 的，而当前是 CPP

     extern "C" { //必须这样定义
         int main();
     }

     extern "C" JNIEXPORT void JNICALL
     Java_com_devyk_cmake_1application_MainActivity_testCmake(
             JNIEnv *env,
             jobject /* this */) {
         std::string hello = "Hello from C++";

         __android_log_print(ANDROID_LOG_DEBUG, "DevYK", "main--->:%d", main());

     }
     ```

   * 编写 CmakeLists.txt 文件

     ```text
     cmake_minimum_required(VERSION 3.4.1)

     # 打印日志
     message("当前CMake的路径是：${CMAKE_SOURCE_DIR}")
     message("当前 CMAKE_ANDROID_ARCH_ABI 的路径是：${CMAKE_ANDROID_ARCH_ABI}")

     # 批量引入源文件
     file(GLOB allCpp *.cpp)

     # 加入cpp源文件
     add_library(
             native-lib
             SHARED
             # native-lib.cpp 替换  ${allCpp} 批量导入文件
             ${allCpp}
     )

     # 导入静态库
     add_library(test_a STATIC IMPORTED)
     # 开始真正的导入
     set_target_properties(test_a PROPERTIES IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/libtest.a)

     # 只能找系统的
     find_library(
             log-lib
             log)

     message("当前的log路径在哪里啊 >>>>>>>>>>>>>>>>> ${log-lib}")

     #开始链接指定的库
     target_link_libraries(
             native-lib
             ${log-lib}
             test_a
     )
     ```

   * app/build.gradle cmake 配置

     \`\`\`groovy android { ...

```text
     defaultConfig {
 ...

         externalNativeBuild {
             cmake {
                 // cppFlags "" // 默认包含四大平台
                 abiFilters 'armeabi-v7a'//编译armeabi-v7a平台
             }
         }


         ndk {
             //过滤，只使用这个版本的库,否则默认的可是4个平台
             abiFilters 'armeabi-v7a'
         }

     }

 ...
     externalNativeBuild {
         cmake {
             path "src/main/cpp/CMakeLists.txt" //指定 CMakeLists 路径
         }
     }

 }
 ```
```

* 测试结果

  ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200112141122.png)

1. 以动态库构建项目
   * 代码加载 so 库到手机中

     ```java
         static {
             System.loadLibrary("Test");
             System.loadLibrary("native-lib");
         }
     ```

* so 库导入在 main/jniLibs 下

  ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200112154348.png)

* CmakeLists.txt 配置

  ```text
  cmake_minimum_required(VERSION 3.4.1)

  # 打印日志
  message("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA>>>")
  message("当前CMake的路径是：${CMAKE_SOURCE_DIR}")
  message("当前 CMAKE_ANDROID_ARCH_ABI 的路径是：${CMAKE_ANDROID_ARCH_ABI}")

  # 批量引入源文件
  file(GLOB allCpp *.cpp)

  # 加入cpp源文件
  add_library(
          native-lib
          SHARED
          # native-lib.cpp
          ${allCpp}
  )

  # 导入静态库
  #add_library(test_a STATIC IMPORTED)
  # 开始真正的导入
  #set_target_properties(test_a PROPERTIES IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/libtest.a)

  # 导入动态库
  add_library(test_so SHARED IMPORTED)
  # 早起的cmake ANDROID_ABI == 当前CPU平台
  set_target_properties(test_so PROPERTIES IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/../jniLibs/${CMAKE_ANDROID_ARCH_ABI}/libTest.so)

  # 只能找系统的
  find_library(
          log-lib
          log)
  message("当前的log路径在哪里啊 >>>>>>>>>>>>>>>>> ${log-lib}")

  # CMAKE_SOURCE_DIR == D:\NDK\CoursewareCreate\ndk_12\project\ndk12_cmake\app\src\main\cpp\CMakeLists.txt

  target_link_libraries(
          native-lib
          ${log-lib}
          test_so
  )
  ```

* 测试

  ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200112154632.png)

到这里，mk 和 cmake 入门基础知识就讲完了，想要全部掌握还需要自己多动手实践一翻。

## 总结

该篇文章主要讲解了如何利用 NDK 对 C 程序进行交叉编译，以及交叉编译后的动态静态库在 Android 项目中的使用，还有 makefile 和 cmake 在 Android 的使用，本篇文章也是比较基础的，对于后续使用或者编译 FFmpeg 打下基础。

[文章中所有代码已上传 GitHub 仓库](https://github.com/yangkun19921001/ndk_study)

