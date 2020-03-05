# Flutter 环境搭建

## 环境配置

* Google Flutter 中文官网：[https://flutterchina.club/setup-windows/](https://flutterchina.club/setup-windows/)

## 问题

* 问题引入 Mac上搭建Flutter开发环境文章中，在使用flutter doctor查看是否需要安装其它依赖项时，检测出三个问题! Doctor found issues in 3 categories.，其中有关Android平台的报错如下：

  Android toolchain - develop for Android devices \(Android SDK 27.0.3\) ✗ Android license status unknown.

  * 问题解决

    从报错提示来看，需要添加Android license。

    执行命令：

  flutter doctor --android-licenses 1 当提示是否接受许可时，输入y确认即可，如下：

  Review licenses that have not been accepted \(y/N\)? y All SDK package licenses accepted 1 2 如果执行该命令时，报错，提示如下时：

  A newer version of the Android SDK is required. To update, run: /Users/_\*_/Android/sdk/tools/bin/sdkmanager --update

  /Users/_\*_/Android/sdk/tools/bin/sdkmanager --update 1 该命令执行完毕后，再执行flutter doctor --android-licenses。

  验证

  再次执行flutter doctor，可以看到关于Android license的报错已经没有了。

