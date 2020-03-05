## Google 提供编译 C/C++ 的方式

### ndk - build

![1558885509273](C:\Users\yangk\AppData\Roaming\Typora\typora-user-images\1558885509273.png)

1. project_dir / app / src / main / 新建 jni 文件

2. AS 中配置自动成功头文件

   1. Program 

      ```java
      $JDKPath$/bin/javah
      ```

   2. Arguments

      ```java
      -jni -encoding UTF-8 -d $ModuleFileDir$\src\main\jni $FileClass$
      ```

   3. Working directory

      ```java
      $ModuleFileDir$\src\main\java
      ```

3. ndk - build 配置

   ![1558885781201](C:\Users\yangk\AppData\Roaming\Typora\typora-user-images\1558885781201.png)

   1. Program 

      ```java
      D:\Android\AndroidDeveloper-sdk\Android_NDK\android-ndk-r17b\ndk-build.cmd
      ```

   2. Arguments

      ```javascript
      
      ```

   3. Working directory

      ```java
      $ModuleFileDir$\src\main
      ```

   4. ndk - build 之前需要编写 Android.mk 文件 

      **[属性意思:](<https://developer.android.com/ndk/guides/android_mk?hl=zh-CN>)**

      ```makefile
      //此变量表示源文件在开发树中的位置。在这行代码中，编译系统提供的宏函数 my-dir 将返回当前目录（Android.mk 文件本身所在的目录）的路径
      LOCAL_PATH := $(call my-dir)
      
      //CLEAR_VARS 变量指向一个特殊的 GNU Makefile，后者会清除许多 LOCAL_XXX 变量，例如 LOCAL_MODULE、LOCAL_SRC_FILES 和 LOCAL_STATIC_LIBRARIES。请注意，GNU Makefile 不会清除 LOCAL_PATH。此变量必须保留其值，因为系统在单一 GNU Make 执行环境（其中的所有变量都是全局变量）中解析所有编译控制文件。在描述每个模块之前，必须声明（重新声明）此变量
      include $(CLEAR_VARS)
      
      //每个模块名称必须唯一，且不含任何空格。编译系统在生成最终共享库文件时，会对您分配给 LOCAL_MODULE 的名称自动添加正确的前缀和后缀。例如，上述示例会生成名为 libhello-jni.so 的库
      LOCAL_MODULE := hello-jni
      
      //LOCAL_SRC_FILES 变量必须包含要编译到模块中的 C 和/或 C++ 源文件列表。
      以空格分隔多个文件：
      LOCAL_SRC_FILES := hello-jni.c
      
      //可以使用此可选变量指定相对于 NDK root 目录的路径列表，以便在编译所有源文件（C、C++ 和 Assembly）时添加到 include 搜索路径
      LOCAL_C_INCLUDES := $(LOCAL_PATH)/<subdirectory>/foo
      
      //此变量列出了编译系统在编译共享库或可执行文件时使用的其他链接器标记。例如，要在 ARM/X86 上使用 ld.bfd 链接器：
      LOCAL_LDFLAGS += -fuse-ld=bfd
      
      //默认情况下，编译系统会在 thumb 模式下生成 ARM 目标二进制文件，其中每条指令都是 16 位宽，并与 thumb/ 目录中的 STL 库关联。将此变量定义为 arm 会强制编译系统在 32 位 arm 模式下生成模块的对象文件。以下示例演示了如何执行此操作：
      LOCAL_ARM_MODE := arm
      
      //最后用来编译成功 动态 .so、静态 .a、可执行 的库
      //静态 BUILD_STATIC_LIBRARY 
      include $(BUILD_SHARED_LIBRARY)
      ```



### cmake

1. 生成头文件参考 mk 生成方式
2. 







