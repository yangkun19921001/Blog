# Mac 配置adb环境的方法

## Mac 配置adb环境的方法

### 第一种 每次重启终端失效

一、首先需要安装android-sdk，查看sdk目录下是否有tools和platform-tools；

\(注意：android-sdk目录里的system-image是一个模拟器内容目录，如果使用的是真机可以不用下载，如果使用模拟器，下载一个即可，否则占用大量内存；\)

二、安装好android-sdk，回到主目录，检查是否有bash\_profile文件，如果没有需要新建，具体命令和步骤如下：

1. 回到主目录  cd ￥HOME
2. 检查是否有bash\_profile，open -e .bash\_profile; 如果没有，需要新建一个 touch .bash\_profile
3. 进入此文件的编译界面 open -e .bash\_profile，输入如下命令
4. export PATH=${PATH}:/Users/paty/Downloads/android-sdk-macosx/platform-tools;
5. export PATH=${PATH}:/Users/paty/Downloads/android-sdk-macosx/tools;

三、保存文件并关闭

四、刷新文件bash\_profile，输入命令source .bash\_profile

四、输入adb devices 检查是否配置成功

### 第二种 永久

## mac下配置安卓sdk中的adb环境变量\(亲测成功\)

启动终端，可以在Spotlight中搜索“终端”

**一.进入home目录**

cd ～

**二.更新.bash\_profile文件**

注意：有一种情况是.bash\_profile不存在

需要先通过 touch .bash\_profile创建一个

具体更新步骤：

* **\(1\)vim .bash\_profile**
* 通过vim编辑器编辑
* **\(2\)点击键盘上i，编辑**
* **\(3\)在.bash\_profile中添加**
* PATH=$PATH:/Users/ericzhang/Library/Android/sdk/platform-tools:/Users/ericzhang/Library/Android/sdk/tools
* export
* 注意标红的地方改成自己的用户名，“：”表示地址的自增，相当往环境变量数组中不断添加元素，$PATH表示原地址同样有用，是在原数组的基础上继续添加数组元素
* **\(4\)按esc sheft + :,输入wq退出**

三、运行刚刚修改的脚本

source .bash\_profile

验证一下adb是否能用

adb devices

