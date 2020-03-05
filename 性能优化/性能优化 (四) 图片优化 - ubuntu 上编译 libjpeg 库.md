## 使用方式

1. 在 project/build.gradle 上添加以下代码

   ```java
   allprojects {
   		repositories {
   			...
   			maven { url 'https://jitpack.io' }
   		}
   	}
   ```

   

2. 在 app/build.gradle 添加依赖

  ```java
  dependencies {
          implementation 'com.github.yangkun19921001:LIBJPEG_SAMPLE:v1.0.1'
  }
  ```

  

3. 压缩使用

  ```java
  //bitmap        : 需要压缩的 bitmap
  //q             : 压缩质量 建议 30 - 50
  //outputFilePath: 压缩之后存储的图片地址
  JpegUtils.native_Compress(Bitmap bitmap,int q,String outputFilePath);
  ```

  

JEPG 是什么?

相信有一部分使用 iPhone 手机用微信发送图片的时候，明明图片大小只有 1M ，但清晰度比 Android 手机 5 M 图片大小的还要清晰，那么这是为什么呢 ？。

当时谷歌开发 Android 的时候，考虑了大部分手机的配置并没有那么高，所以对图片处理使用的是 Skia。当然这个库的底层还是用的 jpeg 图片压缩处理。但是为了能够适配低端的手机（这里的低端是指以前的硬件配置不高的手机，CPU 和内存在手机上都非常吃紧，性能差），由于哈夫曼算法比较吃 CPU 并且编解码慢，被迫用了其他的算法。所以 Skia 在进行图片处理在低版本中并没有开启哈弗曼算法。

那么，JEPG 到底是什么？JEPG (全称是 Joint Photographic Experts Group) 是一种常见的一种图像格式，为什么我在这里会提到 JEPG 呢？是因为开源了一个 C/C++ 库底层是基于哈夫曼算法对图片的压缩 (libjpeg)，下面我们就来着重了解下 libjpeg 这个库

### libjpeg 简介

libjpeg-turbo 是一个 JPEG 图像编解码器，它使用 SIMD 指令（MMX，SSE2，AVX2，NEON，AltiVec）来加速 x86，x86-64，ARM 和 PowerPC 系统上的基线 JPEG 压缩和解压缩，以及渐进式JPEG 压缩 x86 和 x86-64 系统。在这样的系统上，libjpeg-turbo 的速度通常是 libjpeg 的 2 - 6 倍，其他条件相同。在其他类型的系统上，凭借其高度优化的霍夫曼编码例程，libjpeg-turbo 仍然可以大大超过 libjpeg。在许多情况下，libjpeg-turbo 的性能可与专有的高速 JPEG 编解码器相媲美。 libjpeg-turbo 实现了传统的 libjpeg API 以及功能较弱但更直接的 TurboJPEG API 。 libjpeg-turbo 还具有色彩空间扩展，允许它从/解压缩到32位和大端像素缓冲区（RGBX，XBGR等），以及功能齐全的 Java 接口。 libjpeg-turbo 最初基于 libjpeg / SIMD，这是由 Miyasaka Masaru 开发的 libjpeg v6b 的 MMX 加速衍生物。 TigerVNC 和 VirtualGL 项目在 2009 年对编解码器进行了大量增强，并且在2010年初，libjpeg-turbo 分拆成一个独立项目，目标是为更广泛的用户提供高速 JPEG压缩/解压缩技术。开发人员。

现在我们大概了解到了 libjpeg 是一个对图像编解码库，现在我们需要准备环境去编译 libjpeg。

## 编译准备工作

**系统:**      [Ubuntu 18.04](<http://www.ubuntu.org.cn/download>)  [也可以使用我下载好的 提取码：biyt](https://pan.baidu.com/s/1PkcNn2Oh_fp698zdCuuyow)

**libjpeg:**  [libjepg 2.0.2](https://github.com/libjpeg-turbo/libjpeg-turbo/archive/2.0.2.tar.gz)

**cmake**: [cmake-3.14.4-Linux-x86_64.tar.gz](https://github.com/Kitware/CMake/releases/download/v3.14.4/cmake-3.14.4.tar.gz)

**ndk:**      [android-ndk-r17c](https://dl.google.com/android/repository/android-ndk-r17c-linux-x86_64.zip)

**开始发车准备编译**

1. ubuntu 中下载 [libjpeg](<https://github.com/libjpeg-turbo/libjpeg-turbo>)

   1. 使用 wget 命令直接下载

      ```java
      wget https://github.com/libjpeg-turbo/libjpeg-turbo/archive/2.0.2.tar.gz
      ```

   2. 解压  tar xvf 2.0.2.tar.gz

   3. [编译参考)(<https://github.com/libjpeg-turbo/libjpeg-turbo/blob/master/BUILDING.md>)

       

2. ubuntu 中安装 cmake

   1. 删除原来的 apt-get autoremove cmake

   2. 使用 wget 命令直接下载

      ```java
      wget https://github.com/Kitware/CMake/releases/download/v3.14.4/cmake-3.14.4.tar.gz
      ```

   3. 解压 tar zxvf cmake-3.14.3.tar.gz

   4. 创建软连接

      1. mv cmake-3.14.3-Linux-x86_64 /opt/cmake-3.14.3
      2. ln -sf /opt/cmake-3.14.3/bin/*  /usr/bin/

      输入 cmake -- version 如果有这样的显示代表安装成功

      ![](https://user-gold-cdn.xitu.io/2019/5/19/16ad056da20c96b0?w=732&h=160&f=jpeg&s=39209)

      

3. 进入到 libjpeg 目录，生成 shell 脚本

   1. vim build.sh 新建一个文件

      ```java
      # lib-name
      MY_LIBS_NAME=libjpeg-turbo_2.0.2
      # 源码目录
      MY_SOURCE_DIR=/home/yangkun/libjpeg-turbo-2.0.2
      MY_BUILD_DIR=yangkun
      
      # android-cmake
      CMAKE_PATH=/opt/cmake-3.14.4/bin
      
      export PATH=${CMAKE_PATH}/bin:$PATH
      
      NDK_PATH=/home/yangkun//android-ndk-r17c
      BUILD_PLATFORM=linux-x86_64
      TOOLCHAIN_VERSION=4.9
      ANDROID_VERSION=24
      
      ANDROID_ARMV5_CFLAGS="-march=armv5te"
      ANDROID_ARMV7_CFLAGS="-march=armv7-a -mfloat-abi=softfp -mfpu=neon"  # -mfpu=vfpv3-d16  -fexceptions -frtti
      ANDROID_ARMV8_CFLAGS="-march=armv8-a"  	# -mfloat-abi=softfp -mfpu=neon -fexceptions -frtti
      ANDROID_X86_CFLAGS="-march=i386 -mtune=intel -mssse3 -mfpmath=sse -m32"
      ANDROID_X86_64_CFLAGS="-march=x86-64 -msse4.2 -mpopcnt -m64 -mtune=intel"
      
      # params($1:arch,$2:arch_abi,$3:host,$4:compiler,$5:cflags,$6:processor)
      build_bin() {
      
          echo "-------------------star build $2-------------------------"
      
          ARCH=$1                # arm arm64 x86 x86_64
          ANDROID_ARCH_ABI=$2    # armeabi armeabi-v7a x86 mips
          # 最终编译的安装目录
          PREFIX=$(pwd)/dist/${MY_LIBS_NAME}/${ANDROID_ARCH_ABI}/
          HOST=$3
          COMPILER=$4
          PROCESSOR=$6
          SYSROOT=${NDK_PATH}/platforms/android-${ANDROID_VERSION}/arch-${ARCH}
          CFALGS="$5"
          TOOLCHAIN=${NDK_PATH}/toolchains/${HOST}-${TOOLCHAIN_VERSION}/prebuilt/${BUILD_PLATFORM}
          
          # build 中间件
          BUILD_DIR=./${MY_BUILD_DIR}/${ANDROID_ARCH_ABI}
      
          export CFLAGS="$5 -Os -D__ANDROID_API__=${ANDROID_VERSION} --sysroot=${SYSROOT} \
                         -isystem ${NDK_PATH}/sysroot/usr/include \
                         -isystem ${NDK_PATH}/sysroot/usr/include/${HOST} "
          export LDFLAGS=-pie
      
          echo "path==>$PATH"
          echo "build_dir==>$BUILD_DIR"
          echo "ARCH==>$ARCH"
          echo "ANDROID_ARCH_ABI==>$ANDROID_ARCH_ABI"
          echo "HOST==>$HOST"
          echo "CFALGS==>$CFALGS"
          echo "COMPILER==>$COMPILER-gcc"
          echo "PROCESSOR==>$PROCESSOR"
      
          mkdir -p ${BUILD_DIR}   #创建当前arch_abi的编译目录,比如:binary/armeabi-v7a
          cd ${BUILD_DIR}         #此处 进了当前arch_abi的2级编译目录
      
      #运行时创建临时编译链文件toolchain.cmake
      cat >toolchain.cmake << EOF 
      set(CMAKE_SYSTEM_NAME Linux)
      set(CMAKE_SYSTEM_PROCESSOR $6)
      set(CMAKE_C_COMPILER ${TOOLCHAIN}/bin/${COMPILER}-gcc)
      set(CMAKE_FIND_ROOT_PATH ${TOOLCHAIN}/${COMPILER})
      EOF
      
          cmake -G"Unix Makefiles" \
                -DCMAKE_TOOLCHAIN_FILE=toolchain.cmake \
                -DCMAKE_POSITION_INDEPENDENT_CODE=1 \
                -DCMAKE_INSTALL_PREFIX=${PREFIX} \
                -DWITH_JPEG8=1 \
                ${MY_SOURCE_DIR}
      
          make clean
          make
          make install
      
          #从当前arch_abi编译目录跳出，对应上面的cd ${BUILD_DIR},以便function多次执行
          cd ../../
      
          echo "-------------------$2 build end-------------------------"
      }
      
      # build armeabi
      build_bin arm armeabi arm-linux-androideabi arm-linux-androideabi "$ANDROID_ARMV5_CFLAGS" arm
      
      #build armeabi-v7a
      build_bin arm armeabi-v7a arm-linux-androideabi arm-linux-androideabi "$ANDROID_ARMV7_CFLAGS" arm
      
      #build arm64-v8a
      build_bin arm64 arm64-v8a aarch64-linux-android aarch64-linux-android "$ANDROID_ARMV8_CFLAGS" aarch64
      
      #build x86
      build_bin x86 x86 x86 i686-linux-android "$ANDROID_X86_CFLAGS" i386
      
      #build x86_64
      build_bin x86_64 x86_64 x86_64 x86_64-linux-android "$ANDROID_X86_64_CFLAGS" x86_64
      ```

   2. 如果编译遇见 权限问题

      ![](https://user-gold-cdn.xitu.io/2019/5/19/16ad0568e451867d?w=816&h=673&f=jpeg&s=216141)

      给它一个 可执行文件的权限 chmod +x build.sh

   3. 继续执行

      ![](https://user-gold-cdn.xitu.io/2019/5/19/16ad0565d2e01fea)

   4. 编译完成

      ![](https://user-gold-cdn.xitu.io/2019/5/19/16ad055fc25cbb9b?w=800&h=600&f=jpeg&s=210778)

      这里我们发现 已经有我们需要的 静态库 .a 和 动态库 .so

   5. 在 AndroidStudio 中创建一个简单的项目 用于测试是否压缩成功

      1. 结构目录

      ![](https://user-gold-cdn.xitu.io/2019/5/19/16ad0578463b6131?w=829&h=866&f=jpeg&s=83392)

      标红的都是重要的文件，include 头文件和 libs/armeabi-v7a 是我们刚刚编译出来的文件

      下面我们就来运行一下看看压缩效果

      2. 压缩主要代码

         **jni 代码**

         ```c++
         #include <jni.h>
         #include <string>
         #include "../include/jpeglib.h"
         #include <malloc.h>
         #include <android/bitmap.h>
         
         
         void write_JPEG_file(uint8_t *data, int w, int h, jint q, const char *path) {
         //    3.1、创建jpeg压缩对象
             jpeg_compress_struct jcs;
             //错误回调
             jpeg_error_mgr error;
             jcs.err = jpeg_std_error(&error);
             //创建压缩对象
             jpeg_create_compress(&jcs);
         //    3.2、指定存储文件  write binary
             FILE *f = fopen(path, "wb");
             jpeg_stdio_dest(&jcs, f);
         //    3.3、设置压缩参数
             jcs.image_width = w;
             jcs.image_height = h;
             //bgr
             jcs.input_components = 3;
             jcs.in_color_space = JCS_RGB;
             jpeg_set_defaults(&jcs);
             //开启哈夫曼功能
             jcs.optimize_coding = true;
             jpeg_set_quality(&jcs, q, 1);
         //    3.4、开始压缩
             jpeg_start_compress(&jcs, 1);
         //    3.5、循环写入每一行数据
             int row_stride = w * 3;//一行的字节数
             JSAMPROW row[1];
             while (jcs.next_scanline < jcs.image_height) {
                 //取一行数据
                 uint8_t *pixels = data + jcs.next_scanline * row_stride;
                 row[0] = pixels;
                 jpeg_write_scanlines(&jcs, row, 1);
             }
         //    3.6、压缩完成
             jpeg_finish_compress(&jcs);
         //    3.7、释放jpeg对象
             fclose(f);
             jpeg_destroy_compress(&jcs);
         }
         
         
         extern "C"
         JNIEXPORT void JNICALL
         Java_com_yk_libjpeg_1sample_libjpeg_JpegUtils_native_1Compress__Landroid_graphics_Bitmap_2ILjava_lang_String_2(
                 JNIEnv *env, jclass type, jobject bitmap, jint q, jstring path_) {
             const char *path = env->GetStringUTFChars(path_, 0);
             //从bitmap获取argb数据
             AndroidBitmapInfo info;//info=new 对象();
             //获取里面的信息
             AndroidBitmap_getInfo(env, bitmap, &info);//  void method(list)
             //得到图片中的像素信息
             uint8_t *pixels;//uint8_t char    java   byte     *pixels可以当byte[]
             AndroidBitmap_lockPixels(env, bitmap, (void **) &pixels);
             //jpeg argb中去掉他的a ===>rgb
             int w = info.width;
             int h = info.height;
             int color;
             //开一块内存用来存入rgb信息
             uint8_t *data = (uint8_t *) malloc(w * h * 3);//data中可以存放图片的所有内容
             uint8_t *temp = data;
             uint8_t r, g, b;//byte
             //循环取图片的每一个像素
             for (int i = 0; i < h; i++) {
                 for (int j = 0; j < w; j++) {
                     color = *(int *) pixels;//0-3字节  color4 个字节  一个点
                     //取出rgb
                     r = (color >> 16) & 0xFF;//    #00rrggbb  16  0000rr   8  00rrgg
                     g = (color >> 8) & 0xFF;
                     b = color & 0xFF;
                     //存放，以前的主流格式jpeg    bgr
                     *data = b;
                     *(data + 1) = g;
                     *(data + 2) = r;
                     data += 3;
                     //指针跳过4个字节
                     pixels += 4;
                 }
             }
             //把得到的新的图片的信息存入一个新文件 中
             write_JPEG_file(temp, w, h, q, path);
         
             //释放内存
             free(temp);
             AndroidBitmap_unlockPixels(env, bitmap);
             env->ReleaseStringUTFChars(path_, path);
         }
         ```

         **调用代码**

         ```java
         public class JpegUtils {
             static {
                 System.loadLibrary("jpeg-yk");
             }
         
             /**
              * A native method that is implemented by the 'native-lib' native library,
              * which is packaged with this application.
              */
             public native  static void native_Compress(Bitmap bitmap, int q, String path);
         
         }
         ```

## 效果

1. 开始压缩

   ```java
       public void click(View view) {
           File input = new File(Environment.getExternalStorageDirectory(), "/girl.jpg");
           ImageView preImg = findViewById(R.id.pre);
           mNextImg = findViewById(R.id.next);
           inputBitmap = BitmapFactory.decodeFile(input.getAbsolutePath());
           preImg.setImageBitmap(inputBitmap);
          JpegUtils .native_Compress(inputBitmap, 10, Environment.getExternalStorageDirectory() + "/girl4.jpg");
           Toast.makeText(this, "执行完成", Toast.LENGTH_SHORT).show();
           String filePath = Environment.getExternalStorageDirectory() + "/girl4.jpg";
           mNextImg.setImageBitmap(BitmapFactory.decodeFile(filePath));
       }
   ```

2. 动画效果

   ![](https://user-gold-cdn.xitu.io/2019/5/19/16ad0559370744f9?w=365&h=740&f=gif&s=2617424)

   **压缩效果:** 压缩质量在 10 的时候用压缩出来的质量也还是挺好了，只有周围有点点模糊，但是建议压缩质量在 30 -50 之间。

   **压缩率:** 大约压缩后的图片大小是原图的缩小 6 倍的样子。



## 资料

### [更多代码信息请移步 GitHub](<https://github.com/yangkun19921001/LIBJPEG_SAMPLE>)

### [提供 libjpeg 编译脚本](<https://github.com/yangkun19921001/LIBJPEG_SAMPLE/blob/master/jpeg_build.sh>)

### [libjpeg 编译的源码和动态/静态库 在 dist 目录 提取码：b0cs](https://pan.baidu.com/s/1WshwS4GjYl3bbzXD4RX_pg )

## 计划

**图片优化计划出三篇文章** 

1. libjpeg 编译及使用 
2. 长图巨图优化 
3. bitmap 内存管理 三级缓存