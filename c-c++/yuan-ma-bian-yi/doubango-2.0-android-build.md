# Doubango 2.0 Android 编译

* 前言
* 官方提供的编译方式
* 需要用到的环境
* linux file to windows
* 遇见的坑
* 总结

## 前言

* 最近由于工作需求和项目优化需要，要改动 Doubango 中的源码，需要进行二次编译，本人对 C/C++ 、Linux 真的是小白啊（可苦了咱啊，不过这怎么能难到我们开发小哥哥勒），在 Linux 下编译 Doubango 折腾了有一会儿，不过最终还是解决了，在这里记录一下，为自己和后来者提供方便吧！

## 官方提供的编译方式

1. IMSDroid 在 Github 上面提供的编译方式 [https://github.com/DoubangoTelecom/imsdroid/blob/master/Building\_Doubango.md](https://github.com/DoubangoTelecom/imsdroid/blob/master/Building_Doubango.md)
2. Dougango 在 Github 上面的地址[https://github.com/DoubangoTelecom/doubango](https://github.com/DoubangoTelecom/doubango)

## 需要用到的环境

* 本人建议最好跟 IMSDroid 中提供的编译环境和方式来进行编译，以下是我的环境。
* 虚拟机使用的是 VMware player 12 ，下载地址:[http://www.vmware.com/products/player/](http://www.vmware.com/products/player/)。
* Linux 镜像是Ubuntu 13.04 的32 位，进入 root 或登录密码都是 password,下载地址:[http://www.traffictool.net/vmware/ubuntu1304.html](http://www.traffictool.net/vmware/ubuntu1304.html)。
* Android NDK 用的是 32 位 r10e 下载地址为：[https://blog.csdn.net/shuzfan/article/details/52690554](https://blog.csdn.net/shuzfan/article/details/52690554)

## 编译工作

1. 启动虚拟机将 windows 下的 doubango、Android NDK,的文件夹设置文件共享，安装 VMwate Tool 工具就可以了，然后添加共享的文件，如有不懂参考下图。

   ![img](https://img-blog.csdn.net/20180622184645777?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2l0X3lhbmdrdW4=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)![&#x70B9;&#x51FB;&#x5E76;&#x62D6;&#x62FD;&#x4EE5;&#x79FB;&#x52A8;](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

2. 将ndk和doubango拷贝到 /home目录下，也可按照Building\_Doubango文档中的来，在虚拟机中直接check out Doubango的源码。在图形界面中登陆的user用户是没有权限读写 /home目录的，使用ctrl+alt+t调出命令行终端，使用su命名切换到root用户。
   * 在linux 下命令进入 /home

     cd /home

     cp /mnt/hgfs/共享文件夹名称/ndkFileName.bin/tar.gz.bz2 copy到 home 下的名称（最好跟 NDK 名称一样。

     cp -rf /mnt/hgfs/共享文件夹名称/doubango doubango

   * 递归删除文件夹

     rm -r fileName
3. 配置NDK 环境

   命令输入 sudo gedit ~/.bashrc 会弹出一个框，在末尾输入

   export NDK=/home/user/android-ndk-r10e

   export PATH=${PATH}:$NDK 保存关闭。

   命令再次输入 source ~/.bashrc使其修改的文件生效。

   命令输入 export 查看配置的 NDK 变量或者 命令输入 ndk-build 如果没有出现 目录未找到的话，就说明配置成功了

4. 最后进入 doubango 目录

   cd /home

   cd ./dougango

   ./autogen.sh

如果出现这些错误的话说明没有安装一些打包制作工具

![img](https://img-blog.csdn.net/20180622184739897?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2l0X3lhbmdrdW4=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)![&#x70B9;&#x51FB;&#x5E76;&#x62D6;&#x62FD;&#x4EE5;&#x79FB;&#x52A8;](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

之后再进入到 /home 这个目录下输入

/_要先安装m4，否则libtool安装不了_/ wget [http://mirrors.kernel.org/gnu/m4/m4-1.4.17.tar.gz](http://mirrors.kernel.org/gnu/m4/m4-1.4.17.tar.gz) tar -xzvf m4-1.4.17.tar.gz cd m4-1.4.17 ./configure --prefix=/usr/local make && make install

/_安装libtool，包含libtoolize命令_/ wget [http://mirrors.kernel.org/gnu/libtool/libtool-2.4.6.tar.gz](http://mirrors.kernel.org/gnu/libtool/libtool-2.4.6.tar.gz) tar xzvf libtool-2.4.6.tar.gz cd libtool-2.4.6 ./configure --prefix=/usr/local make && make install

/_安装autoconf，包含autoheader和autoreconf命令_/ wget [http://mirrors.kernel.org/gnu/autoconf/autoconf-2.69.tar.gz](http://mirrors.kernel.org/gnu/autoconf/autoconf-2.69.tar.gz) tar -xzvf autoconf-2.69.tar.gz cd autoconf-2.69 ./configure --prefix=/usr/local make && make install cd

/_安装automake，包含aclocal和automake命令_/ wget [http://mirrors.kernel.org/gnu/automake/automake-1.15.tar.gz](http://mirrors.kernel.org/gnu/automake/automake-1.15.tar.gz) tar xzvf automake-1.15.tar.gz cd automake-1.15 ./configure --prefix=/usr/local make && make install cd ..

如果中途有安装不上的自行百度把工具下载下来 copy 到共享文件中，cp 到 /home 下解压安装，在进入到 ./doubango 目录下运行 ./autogen.sh

然后就等它生成配置文件。然后在输入

./android\_build.sh gpl

输完这个命令之后大概会等 10- 20 分钟左右然后会自动把 so 库输入到 doubango/android-projects/out/..../lib/下 如下图

![img](https://img-blog.csdn.net/20180622184756732?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2l0X3lhbmdrdW4=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)![&#x70B9;&#x51FB;&#x5E76;&#x62D6;&#x62FD;&#x4EE5;&#x79FB;&#x52A8;](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

![img](https://img-blog.csdn.net/20180622184810481?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2l0X3lhbmdrdW4=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)![&#x70B9;&#x51FB;&#x5E76;&#x62D6;&#x62FD;&#x4EE5;&#x79FB;&#x52A8;](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

## linux file to windows

命令：linux 中压缩 so 文件以便 copy to windows

​ tar jcvf doubangoLib.tar.bz2 output tar jcvf FileName.tar.bz2 DirName

copy: cp -rf doubangoLib.tar.bz2 /mnt/hgfs/共享文件目录

## 遇见的坑

* 编译期间遇见过 NDK 配置环境未成功，编译 doubango 输出 找不到目录，还有一些 linux 命令不熟悉等等。不过经过晚上加班还是弄出来了，所以遇见事儿别放弃。加油！

## 总结

* 个人建议一定要按照官方提供的资料来进行编译 最好是在 linux 下编译用 10e 版本的 ndk ,我试用r9c 和 17版本的编译 结果都不如意，最后换成跟作者一样的版本就 OK 了。

## 感谢

* 最后感谢 doubango 团队提供的开源项目
* 提供一个 linux 解压压缩命令[http://alex09.iteye.com/blog/647128](http://alex09.iteye.com/blog/647128)
* [linux 常用cp的命令](https://gywbd.github.io/posts/2014/8/50-linux-commands.html)

