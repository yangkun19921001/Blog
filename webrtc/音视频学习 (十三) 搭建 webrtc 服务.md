![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200410000914.png)
## 前言

最近折腾了几天 `apprtc` 服务器搭建，搭建的主要目的是为了学习 Android 、WEB 等各端基于 webrtc 音视频通信。

经过这几天的搭建得出了几点结论:

1、非 `https` 协议在 `chrome` 浏览器不支持打开音视频设备。

2、如果想要使各端都能通信，那么必须所有请求访问都使用 `https` 协议，证书可以在购买服务器平台上免费申请。



> 如果你正在找工作, 那么你需要一份 [Android 高级开发面试宝典](https://github.com/yangkun19921001/Blog/blob/master/笔试面试/Android高级工程师面试必备/README.md)



以下是最终效果图(手机跟 `WEB` 互通需要所有 `http` 更换为 `https` 协议，该篇最终结果还未达到各端互通的条件，后续会更新补上)

**搭建环境**
- 服务器: 腾讯云
- 系统: centos

**app2app**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200409234611.gif)

**web2web**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200410000148.gif)

## 介绍

搭建 apprtc 需要用到以下几个服务。

### apprtc

AppRTC 是用来创建和管理通话状态的房间服务器。

### coturn

coturn 是一种 `TURN` 内网穿透服务器（也就是中转服务器），该服务器用于 `VOIP` 或通用数据流的 `NAT` 穿越和数据转发。

### collider

collider 它是用 go 语言实现的基于 WebSocket 的信令服务器。

为了建立一个 webrtc 的通信过程，一般是需要有如下通信信息:

1、会话控制信息，用来开始和结束通话，即开始视频、结束视频这些操作指令。

2、发生错误时用来相互通告的消息

3、元数据，如各自的音视频解码方式、带宽。

4、网络数据，对方的公网 IP、端口、内网 IP 及端口。



## 搭建 AppRTC 服务的基本步骤

1、搭建 AppRTC 房间服务器

2、搭建 Coturn 穿透服务器

3、搭建 Collider 信令服务器

4、搭建 ICE 信息服务器



## 如何搭建 AppRTC

### 1、install JDK

```shell
yum install java-1.8.0-openjdk

#查看 Java 版本
java -version

```

### 2、install node.js

```shell
curl -sL https://rpm.nodesource.com/setup_10.x | bash -
yum install -y nodejs
# 确认是否成功
node --version
npm --version

# 构建 apprtc 用到
npm -g install grunt-cli
grunt --version
```

### 3、安装Python和Python-webtest （python2.7）

```shell
yum -y install epel-release
yum install python python-webtest python-pip
pip install --upgrade pip
```

### 4、安装google_appengine

```shell
wget https://storage.googleapis.com/appengine-sdks/featured/google_appengine_1.9.40.zip
unzip google_appengine_1.9.40.zip

#配置环境变量：在/etc/profile文件最后增加一行：
vim /etc/profile
#添加如下代码
export google_appengine_path=/root/webrtc/google_appengine
export PATH=$PATH:$google_appengine_path

#最后保存，使之生效
source /etc/profile
```

### 5、安装 go 

```shell
yum install golang
#查看是否安装成功
go version 

#创建go工作目录
mkdir -p /root/webrtc/goWorkspace/src
#配置环境变量：在 vim /etc/profile 文件最后增加一行：
export GOPATH=/root/webrtc/goWorkspace
#保存
source /etc/profile
```

### 6、安装libevent

```shell
#当前目录:root/webrtc/
#https://github.com/coturn/coturn/wiki/CoturnConfig
wget https://github.com/downloads/libevent/libevent/libevent-2.0.21-stable.tar.gz
tar xvf libevent-2.0.21-stable.tar.gz
cd libevent-2.0.21-stable
./configure
make install
```

### 7、安装 AppRTC

```shell
#当前目录:root/webrtc/
git clone https://github.com/webrtc/apprtc.git
#将collider的源码软连接到go的工作目录下
ln -s /root/webrtc/apprtc/src/collider/collider $GOPATH/src
ln -s /root/webrtc/apprtc/src/collider/collidermain $GOPATH/src
ln -s /root/webrtc/apprtc/src/collider/collidertest $GOPATH/src
#编译collidermain
go get collidermain
go install collidermain

#go get collidermain: 被墙
#报错: package golang.org/x/net/websocket: unrecognized import path "golang.org/x/net/websocket"
#执行: 
#mkdir -p $GOPATH/src/golang.org/x/
#cd $GOPATH/src/golang.org/x/
#git clone https://github.com/golang/net.git net 
#go install net

#再执行编译collidermain
#修改房间服务器为我们前面的房间服务器:
vim $GOPATH/src/collidermain/main.go
var roomSrv = flag.String(“room-server”, “https://49.235.159.44:8080”, “The origin of the room server”)

vim $GOPATH/src/collider/collider.go
#修改放入自己私有证书,目前这里放入腾讯云申请的 证书测试 app -> pc 通不了，固还是用自签名
e = server.ListenAndServeTLS(“/root/key/chat.codecocoa.com.pem”, 		“/root/key/chat.codecocoa.com.key”)

go get collidermain
go install collidermain
```

### 8、安装coturn

```shell
#目录:root/webrtc/
#https://github.com/coturn/coturn/wiki/Downloads
wget http://coturn.net/turnserver/v4.5.0.7/turnserver-4.5.0.7.tar.gz
tar xvfz turnserver-4.5.0.7.tar.gz
cd turnserver-4.5.0.7
#如果没有 openssl-devel 需要安装
yum install openssl-devel
./configure --prefix=./bin
make install
```

### 9、配置并运行 coturn Nat 穿透服务器

```shell
#内网：172.17.0.11 ：DevYk:用户 12345 密码 & ctr+c 不会停止
nohup turnserver -L 172.17.0.11 -a -u DevYK:12345 -v -f -r nort.gov &
#或者 作者用的该方案
nohup turnserver -L 172.17.0.11 -a -u DevYK:12345 -v -f -r www.devyk.cn & 
#netstat -ntulp 查看 5766，3478 端口是否启动
```

### 10、collider 信令服务器

配置防火墙，允许访问8089端口（tcp，用于客户端和collider建立websocket信令通信）

```shell
#创建自签名的数字证书
#如果没有openssl,需要安装
mkdir -p /cert
cd /cert
# CA私钥
openssl genrsa -out key.pem 2048 
# 自签名证书
openssl req -new -x509 -key key.pem -out cert.pem -days 1095

#app 与 app 通信由于 ssl 问题需要将 tls =false
nohup $GOPATH/bin/collidermain -port=8089 -tls=true -room-server="https://49.235.159.44:8080" > /root/webrtc/collidermain.log 2>&1 &

#检查 8089 端口是否启动
netstat -ntulp
```

### 11. apprtc 房间服务器

配置防火墙，允许访问8080端口（tcp，此端口用于web访问）

配置文件修改（主要是配置apprtc对应的conturn和collider相关参数）

```shell
#49.235.159.44 外网ip
vim /root/webrtc/apprtc/src/app_engine/constants.py
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200408153056.png)

```shell
#ICE_SERVER_OVERRIDE = None
# Enable by uncomment below and comment out above, then specify turn and stun
ICE_SERVER_OVERRIDE  = [
   {
     "urls": [
       "turn:49.235.159.44:3478?transport=udp",
       "turn:49.235.159.44:3478?transport=tcp"
     ],
     "username": "DevYK",
     "credential": "12345"
   },
   {
     "urls": [
       "stun:49.235.159.44:8089"
     ]
   }
 ]
#ICE_SERVER_OVERRIDE = None

#pc 必须使用 https
#ICE_SERVER_BASE_URL = 'https://49.235.159.44'
#在 APP 上因为没有 SSL 证书，那么只能用 http
ICE_SERVER_BASE_URL = 'http://49.235.159.44:8088'
ICE_SERVER_URL_TEMPLATE = '%s/v1alpha/iceconfig?key=%s'
ICE_SERVER_API_KEY = os.environ.get('ICE_SERVER_API_KEY')

# Dictionary keys in the collider instance info constant.
WSS_INSTANCE_HOST_KEY = '49.235.159.44:8089'
WSS_INSTANCE_NAME_KEY = 'vm_name'
WSS_INSTANCE_ZONE_KEY = 'zone'
WSS_INSTANCES = [{
    WSS_INSTANCE_HOST_KEY: '49.235.159.44:8089',
    WSS_INSTANCE_NAME_KEY: 'wsserver-std',
    WSS_INSTANCE_ZONE_KEY: 'us-central1-a'
}
#,{
#    WSS_INSTANCE_HOST_KEY: '49.235.159.44:8089',
#    WSS_INSTANCE_NAME_KEY: 'wsserver-std-2',
#    WSS_INSTANCE_ZONE_KEY: 'us-central1-f'
#}
]
```



```shell
#编译
cd /root/webrtc/apprtc
npm install
grunt build

#如果出现下面错误,使用 cnpm 编译
/root/webrtc/apprtc/node_modules/mkdirp/lib/opts-arg.js 
...

#npm 安装出现问题 使用 cnpm 安装
npm install -g cnpm --registry=https://registry.npm.taobao.org
cnpm install
grunt build
```

启动:

```shell
#172.31.247.136 : 内网ip
nohup dev_appserver.py --host=172.17.0.11 --port 8080 /root/webrtc/apprtc/out/app_engine --skip_sdk_update_check > /root/webrtc/apprtc.log 2>&1 &


#检查 8080 Python 是否起来
netstat -ntulp
```

### 12、 配置 ICE Service

mkdir /root/webrtc/iceService

vim ice.js

```js
var http = require('http');
var crypto = require('crypto')
var hmac = function(key, content) {
  var method = crypto.createHmac('sha1', key)
  method.setEncoding('base64')
  method.write(content)
  method.end()
  return method.read()
}
http.createServer(function(request, response) {
  //账户
  var timestamp = Math.floor(Date.now() / 1000)
  var turn_username = timestamp + ':DevYK'
  //密码
  var key = '12345'
  var password = hmac(key, turn_username)
  // 发送 HTTP 头部 
  // HTTP 状态值: 200 : OK
  // 内容类型: text/plain
  response.writeHead(200, {'Content-Type': 'text/plain'});
  console.log(turn_username);
  console.log(password);
  // 发送响应数据 "ice服务器"
  response.end('{"iceServers":[{"username":"'+turn_username+'","credential":"'+password+'","urls":["stun:49.235.159.44:3478","turn:49.235.159.44:3478"]}]}\n');
  }).listen(8088);
  // 终端打印如下信息
  console.log('ICE Server running');
```

**启动 ICE REST API 服务**

```shell
nohup node ice.js &

#检查 8088 服务是否启动
netstat -ntulp
```



### 13、nginx 设置反向代理

#### nginx 已存在进行配置

11.1 配置反向代理

```shell
events {
        worker_connections 1024;
		}
		http{
			#apprtc 服务
        upstream roomserver {
        server 49.235.159.44:8080;
        }
        server {
                listen 80;
                server_name 49.235.159.44;
                return  301 https://$server_name$request_uri;
        }
        server {
                root /root/webrtc/nginx-1.17.8/html;
                index index.php index.html index.htm;
                listen      443 ssl;
                #腾讯云证书
                #ssl_certificate /root/ssl/1_www.devyk.cn_bundle.crt;
                #ssl_certificate_key /root/ssl/2_www.devyk.cn.key;
                #ssl_session_timeout 5m;
                 #请按照以下协议配置
                #ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
                #请按照以下套件配置，配置加密套件，写法遵循 openssl 标准。
                #ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
                #ssl_prefer_server_ciphers on;
                #自签名
                ssl_certificate /cert/cert.pem;
                ssl_certificate_key /cert/key.pem;
                server_name 49.235.159.44;
                location / {
                        proxy_pass http://roomserver$request_uri;
                        proxy_set_header Host $host;
                }
                location ~ .php$ {
                        fastcgi_pass unix:/var/run/php5-fpm.sock;
                        fastcgi_index index.php;
                        include fastcgi_params;
                }
        }
}
```

11.1.1已安装但是没有配置 ssl

```shell
#开启 nginx 服务 error
nginx: [emerg] the "ssl" parameter requires ngx_http_ssl_module in 
/bin/conf/nginx.conf
```

解决:

```shell
#切换到源码包：
cd /nginx/nginx-1.17.9

#查看nginx原有的模块
/bin/sbin/nginx -V
#在configure arguments:后面显示的原有的configure参数如下：
--prefix=./bin
```

重新编译, 加入 `--with-http_ssl_module`

```shell
./configure --prefix=./bin  --with-http_ssl_module

#编译
make
```

ps: 这里千万别 make install 覆盖安装，因为之前还有 nginx 配置。

将之前的 nginx rm 替换为 objs/nginx

```shell
#在 nginx/1.17 模块下

rm -rf bin/sbin/nginx

cp objs/nginx bin/sbin/
```

最后重启服务

```shell
#启动
bin/sbin/nginx
#重启
bin/sbin/nginx -s reload
```



#### nginx 未安装配置

11.2 下载 nginx

```shell
wget http://nginx.org/download/nginx-1.17.9.tar.gz
tar -zxvf nginx-1.17.9.tar.gz
```

11.2.1编译 nginx

```shell
./configure --prefix=./bin --with-http_ssl_module

make install
```

11.2.2 配置 nginx.conf

```shell
vim /root/webrtc/nginx-1.17.8/bin/conf/nginx.conf
```

```shell
#apprtc 服务
		events {
 			worker_connections 1024;
		}
		http{
        upstream roomserver {
        server 49.235.159.44:8080;
        }
        server {
                listen 80;
                server_name www.devyk.cn;
                return  301 https://$server_name$request_uri;
        }
        server {
                root /root/nginx/nginx-1.17.8/html;
                index index.php index.html index.htm;
                listen      443 ssl;
                #腾讯云证书
                #ssl_certificate /root/nginx/nginx-1.17.8-http-rtmp/ssl/rtc.crt;
                #ssl_certificate_key /root/nginx/nginx-1.17.8-http-rtmp/ssl/rtc.key;
                #自签名证书
                ssl_certificate /cert/cert.pem;
                ssl_certificate_key /cert/key.pem;
                server_name 49.235.159.44;
                location / {
                        proxy_pass http://roomserver$request_uri;
                        proxy_set_header Host $host;
                }
                location ~ .php$ {
                        fastcgi_pass unix:/var/run/php5-fpm.sock;
                        fastcgi_index index.php;
                        include fastcgi_params;
                }
        }
        }

```

11.2.3 启动 nginx

```shell
#启动
bin/sbin/nginx
#重启
bin/sbin/nginx -s reload
```



### 搭建中遇见的问题

- 浏览器通话跨域问题 :pushState

  ```shell
  vim /root/webrtc/apprtc/out/app_engine/js/apprtc.debug.js
  #全局搜索  pushState 增加:
  roomLink=roomLink.substring("http","https");
  ```

  ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200406213309.png)

- Websocket open error：

  ```shell
  Messages:  
  WebSocket open error: WebSocket error.
  WebSocket register error: WebSocket error.
  ```

  ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200406213428.png)

   PC 上如果遇见这个问题，一般需要检查 apprtc 、 constants.py 、签名的配置信息。

- 自签名证书只能在浏览器上使用，不能用于浏览器与 Android 等端进行通信。



## 总结

整个服务搭建下来，坑确实太多了。目前由于没有证书，所以只能用于 app2app 、web2web 测试了，等证书申请下来在来更新替换过程。

以上搭建只要按照文中步骤肯定是可以成功的，希望可以帮助到你。



## 参考

- [https://zhuanlan.zhihu.com/p/91289458](https://zhuanlan.zhihu.com/p/91289458)
- [AppRTC(WebRTC)服务器搭建](https://www.jianshu.com/p/a19441034f17)



## 关于我

- Email: yang1001yk@gmail.com
- 个人博客: [https://www.devyk.top](https://www.devyk.top)
- GitHub: [https://github.com/yangkun19921001](https://github.com/yangkun19921001)
- 掘金博客: [https://juejin.im/user/578259398ac2470061f3a3fb/posts](https://juejin.im/user/578259398ac2470061f3a3fb)

**扫码关注我的公众号，让我们离得更进一些!**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200315232530.jpg)