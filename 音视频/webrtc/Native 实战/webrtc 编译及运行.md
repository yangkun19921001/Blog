代码分支：https://chromiumdash.appspot.com/branches

df -hl 查看磁盘大小

## Docker centos 安装

 ```shell
 sudo yum install -y yum-utils
 
 sudo yum-config-manager \
     --add-repo \
     https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
 
 sudo sed -i 's/download.docker.com/mirrors.aliyun.com\/docker-ce/g' /etc/yum.repos.d/docker-ce.repo
 
 # 官方源
 # $ sudo yum-config-manager \
 #     --add-repo \
 #     https://download.docker.com/linux/centos/docker-ce.repo
 
 sudo yum install docker-ce docker-ce-cli containerd.io
 ```



启动:

```shell
# 先切换到root用户, 再执行以下命令
su root 
# 开机自动启动docker
systemctl enable docker 
# 启动docker
systemctl start docker 
# 重启dokcer
systemctl restart docker 
```



### Docker ubuntu18.04 安装

```
https://www.jianshu.com/p/03e49ebc05ea
```





## 配置 VPN 代理



###1. 配置 shadowsocks 客户端

```shell
yum install python-setuptools && easy_install pip
pip install shadowsocks

vim /etc/shadowsocks.json 

{ 
   "server":"pvcc01.nachoneko.shop", 
   "server_port":35620, 
   "local_address": "127.0.0.1", 
   "local_port":1080, 
   "password":"Z907mR",
    "timeout":300, 
   "method":"rc4-md5", 
   "fast_open": true
} 
```

配置自启动

新建启动脚本文件 **vim /etc/systemd/system/shadowsocks.service**，内容如下：

```shell
[Unit]
Description=Shadowsocks

[Service]
TimeoutStartSec=0
ExecStart=/usr/bin/sslocal -c /etc/shadowsocks.json

[Install]
WantedBy=multi-user.target
```

配置加密

```
sudo yum install mbedtls mbedcrypto mbedtls-devel
```



启动Shadowsocks客户端

```shell
systemctl enable shadowsocks.service
systemctl start shadowsocks.service
systemctl stop shadowsocks.service
systemctl status shadowsocks.service
```

验证Shadowsocks客户端是否正常运行

```
curl --socks5 127.0.0.1:1080 http://httpbin.org/ip
```

若Shadowsock客户端已正常运行，则结果如下：

```
{
"origin": "x.x.x.x" #你的Shadowsock服务器IP
}
```

### 2.配置 privoxy

```
sudo yum -y install privoxy
```

启动Privoxy

```shell
systemctl enable privoxy
systemctl start/stop privoxy
systemctl status privoxy
```

配置Privoxy

```
sudo vi /etc/privoxy/config

#增加
listen-address 127.0.0.1:8118 # 8118 是默认端口，不用改
forward-socks5t / 127.0.0.1:1080 . #转发到本地端口
```

设置http/https代理

```
sudo vi /etc/profile
```

添加如下信息

```shell
export http_proxy=http://127.0.0.1:8118
export https_proxy=http://127.0.0.1:8118
source /etc/profile
```

验证是否可用

`curl www.google.com`



## 编译 webrtc

### ubuntu

```
docker pull piasy/webrtc-build

docker run --rm \
  -e ENABLE_SHADOW_SOCKS=true \
  -e SHADOW_SOCKS_SERVER_ADDR=ca01.mellanox.info \
  -e SHADOW_SOCKS_SERVER_PORT=35620 \
  -e SHADOW_SOCKS_ENC_METHOD=rc4-md5 \
  -e SHADOW_SOCKS_ENC_PASS=Z907mR \
  -v /home/ecs-assist-user/Data/android_rtc:/webrtc \
  -t -i piasy/webrtc-build

cd /depot_tools && git pull
cd /webrtc

fetch --nohooks webrtc_android

gclient sync -r be99ee8f17f93e06c81e3deb4897dfa8253d3211 --force

sudo ./src/build/install-build-deps.sh
sudo ./src/build/install-build-deps-android.sh

cd src
source build/android/envsetup.sh
gn gen out/android_arm64 --args='target_os="android" target_cpu="arm64" is_debug=false'

ninja -C out/android_arm64

//生成 aar
tools_webrtc/android/build_aar.py --build-dir out --arch "armeabi-v7a" "arm64-v8a"

python tools_webrtc/android/build_aar.py --output "libwebrtc.aar" --arch "arm64-v8a" --build-dir out/release

jni 自动生成的源码 头文件
webrtc_android/src/out/release/gen/sdk/android
jni .cc 
webrtc_android/src/sdk/android/src/jni

gn clean out/Release_arm64
```



### Linux

启动 piasy/webrtc-build docker 环境

```
docker run --rm \
  -e ENABLE_SHADOW_SOCKS=true \
  -e SHADOW_SOCKS_SERVER_ADDR=ca01.mellanox.info \
  -e SHADOW_SOCKS_SERVER_PORT=35620 \
  -e SHADOW_SOCKS_ENC_METHOD=rc4-md5 \
  -e SHADOW_SOCKS_ENC_PASS=Z907mR \
  -v /home/ecs-assist-user/Data/android_rtc:/webrtc \
  -t -i piasy/webrtc-build
  
  
  docker run --rm \
  -e ENABLE_SHADOW_SOCKS=true \
  -e SHADOW_SOCKS_SERVER_ADDR=<your shadowsocks server ip> \
  -e SHADOW_SOCKS_SERVER_PORT=<your shadowsocks server port> \
  -e SHADOW_SOCKS_ENC_METHOD=<your shadowsocks encrypt method> \
  -e SHADOW_SOCKS_ENC_PASS=<your shadowsocks encrypt password> \
  -v <path to place webrtc source>:/webrtc \
  -t -i piasy/webrtc-build
```



```
cd /depot_tools && git pull
cd /webrtc
fetch --nohooks webrtc_android

失败再次执行
gclient sync --nohooks

#上条命令执行完成之后，可以在当前目录下编辑 .gclient 文件
#在 target_os 里面加上 linux ,这套代码就可以用于 linux 开发了
gclient sync
```



### Android for macos

```
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git

fetch --help

fetch --nohooks webrtc_ios/webrtc_android

m89-c50097798342271431bac0ee1abf0b5ce7d61dfb

git checkout be99ee8f17f93e06c81e3deb4897dfa8253d3211

如果 fetch 中途失败则执行
gclient sync --nohooks

成功之后再次执行
gclient sync

```



or

```
docker run --rm \
  -e ENABLE_SHADOW_SOCKS=true \
  -e SHADOW_SOCKS_SERVER_ADDR=pvcc01.mellanox.info \
  -e SHADOW_SOCKS_SERVER_PORT=35620 \
  -e SHADOW_SOCKS_ENC_METHOD=rc4-md5 \
  -e SHADOW_SOCKS_ENC_PASS=Z907mR \
  -v /Users/devyk/Data/webrtc/webrtc_repo:/webrtc \
  -t -i piasy/webrtc-build
```



./gn gen out/android-debug-arm64 --args='target_os="android" target_cpu="arm64"'

### ios

```shell
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git

fetch --help

fetch --nohooks webrtc_ios/webrtc_android

git checkout be99ee8f17f93e06c81e3deb4897dfa8253d3211



# 查看可用版本分支
git branch -r
# 切换到m79分支
git checkout branch-heads/m79

如果 fetch 中途失败则执行
gclient sync --nohooks

gclient sync
# 或者强制切换到指定commit（b484ec0082948ae086c2ba4142b4d2bf8bc4dd4b是m79最后一次提交的commit id）
gclient sync -r be99ee8f17f93e06c81e3deb4897dfa8253d3211 --force

#如果报错
vim src/DEPS

  'src/tools/luci-go': {
      'packages': [
        {
          'package': 'infra/tools/luci/isolate/${{platform}}',
          'version': 'git_revision:60378cc9a42acddf1f780fcda449e9cdccb49485',
        },
        {
          'package': 'infra/tools/luci/isolated/${{platform}}',
          'version': 'git_revision:dc3a3dc4272aeef30698752d137ccd4f09526d69',
        },
        {
          'package': 'infra/tools/luci/swarming/${{platform}}',
          'version': 'git_revision:60378cc9a42acddf1f780fcda449e9cdccb49485',
        },
      ],
      'dep_type': 'cipd',
  },
  
  gn gen out/xcode_ios_arm64 --args='target_os="ios" target_cpu="arm64" rtc_include_tests=false'  --ide=xcode 
```



### Windows

```

set vs2019_install=C:\Program Files (x86)\Microsoft Visual Studio\2019\Community
set GYP_GENERATORS=msvs-ninja,ninja
set WINDOWSSDKDIR=C:\Program Files (x86)\Windows Kits\10
set DEPOT_TOOLS_WIN_TOOLCHAIN=0
```





## 运行 Demo

### 部署 AppRTC Server

```
docker run --rm --net=host \
  -e PUBLIC_IP=192.144.201.2 \
  -it piasy/apprtc-server
```

### 运行 IOS AppRTCMobile

macOS 终端配置 代理

```shell

vim ~/.bash_profile

function proxy_on(){
    export http_proxy=http://127.0.0.1:7890
    export https_proxy=http://127.0.0.1:7890
    echo -e "已开启代理"
}
function proxy_off(){
    unset http_proxy
    unset https_proxy
    echo -e "已关闭代理"
}

source ~/.bash_profile


#开启代理
proxy_on
#关闭代理
proxy_off
#查看是否否配置成功
curl www.google.com

```



cd src/

```
ERROR at //webrtc.gni:504:32: Assignment had no effect.
        xctest_module_target = "//base/test:google_test_runner"
                               ^-------------------------------
You set the variable "xctest_module_target" here and it was unused before it went
out of scope.
See //testing/test.gni:703:5: whence it was called.
    target(ios_test_target_type, _test_target) {
    ^-------------------------------------------
See //webrtc.gni:463:3: whence it was called.
  test(target_name) {
  ^------------------
See //BUILD.gn:544:3: whence it was called.
  rtc_test("rtc_unittests") {

```

```shell
gn gen out/xcode_ios_arm64 --args='target_os="ios" target_cpu="arm64" rtc_include_tests=false'  --ide=xcode 


```



### 运行 Android AppRTCMobile



### 运行 MACOS AppRTCMobile

```shell
gn gen out/xcode_macos_x64 --args='target_os="mac" target_cpu="x64"' --ide=xcode
```

git checkout be99ee8f17f93e06c81e3deb4897dfa8253d3211

查看端口 netstat -ntpl | grep 8080

git checkout be99ee8f17f93e06c81e3deb4897dfa8253d3211





## 问题记录

- Exception: No 11.0+ SDK found

  1. 通过命令`xcrun --show-sdk-version`可以知道当前SDK的版本

  2. 修改`.gn`文件的`mac_sdk_min`选项为当前系统版本：`12.3`

  3. 打开`find_sdk.py`阅读代码发现了只支持`10.xx`的系统，修改`12`即可

     ```shell
     -  sdks = [re.findall('^MacOSX(10\.\d+)\.sdk$', s) for s in os.listdir(sdk_dir)]
     
     +  sdks = [re.findall('^MacOSX(11\.\d+)\.sdk$', s) for s in os.listdir(sdk_dir)]
     ```

- ERROR at //build/config/ios/ios_sdk.gni:155:7: Assertion failed. assert(false)

  ```shell
  可以尝试编辑 build/config/ios/ios_sdk.gni，把 ios_code_signing_identity_description = "iPhone
  Developer"修改为 ios_code_signing_identity_description = "Apple Development"。
  ```

- You can often set treat_warnings_as_errors=false to not treat output as failure (useful when developing locally).

  解决方法：
  
  ```
  gn gen out/Debug --args='target_os="android" target_cpu="arm64" treat_warnings_as_errors=false' 
  
  ```



### jni_generator.py

```
python3 jni_generator.py --input_file PcgEngineConfig.java --output_file PcgEngineConfig_jni.h
```

### Gradle task

```gradle
//click this genGameSdkJni gen jni header file
task genGameSdkJni(type: Exec) {
    if (!new File(jni_generator_path).exists()) {
        throw new IllegalArgumentException("jni_generator_path doesn't exist: ${jni_generator_path}")
    }
    if (!new File(gaming_sdk_jni_path).exists()) {
        throw new IllegalArgumentException("gaming_sdk_jni_path doesn't exist: ${gaming_sdk_jni_path}")
    }
    def gen_jni_header =
            "python3 ${jni_generator_path}"  + " -n pprtc::jni " + " --input_file " + " src/main/java/com/ppio/cloudgame/mobile/sdk/api/impl/PcgEngineConfig.java " +
                    " --output_file ${gaming_sdk_jni_path}/PcgEngineConfig_jni.h"
    def cmd = ['sh', '-c', "${gen_jni_header}"]
    commandLine cmd
}
```



## 参考

- https://github.com/Piasy/WebRTC-Docker

- https://github.com/HackWebRTC/webrtc

- http://tup.com.cn/upload/books/yz/087915-01.pdf

- [macos py2 install](https://stackoverflow.com/questions/64325721/cannot-install-python2-using-brew-install-python2)

- [Mac下编译WebRTC（Mac和iOS版本)](https://juejin.cn/post/7045568744088666120)

- [强烈推荐-在 Mac 上为 Android 编译 WebRTC](https://www.jianshu.com/p/981c44cb9614)

- [webrtc 版本号](https://chromiumdash.appspot.com/branches)

- [前提-需要在 ubuntu 下编译成功----在 macOS 中编译 webrtc android 端代码](https://blog.csdn.net/liuwenchang1234/article/details/107559530?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522166070537616780366550969%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=166070537616780366550969&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~baidu_landing_v2~default-2-107559530-null-null.142^v41^pc_search_integral,185^v2^control&utm_term=mac%20%E7%BC%96%E8%AF%91%20webrtc%20android&spm=1018.2226.3001.4187)

- [在 Mac 上为 Android 编译 WebRTC](https://blog.csdn.net/tq08g2z/article/details/124110454)

  