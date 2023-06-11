### 下载 ssr

http://claude-ray.com/2018/12/01/ss-local/

```
sudo apt update
sudo apt install shadowsocks-libev

sudo cp /etc/shadowsocks-libev/config.json /etc/shadowsocks-libev/local.json
sudo vim /etc/shadowsocks-libev/local.json

{
    "server":"pvcc01.mellanox.info",
    "server_port":35620,
    "local_address":"127.0.0.1",
    "local_port":1080,
    "password":"Z907mR",
    "timeout":60,
    "method":"rc4-md5",
    "fast_open":false,
    "workers":1
}

sudo vi /lib/systemd/system/shadowsocks-libev-local@.service

ExecStart=/usr/bin/ss-local -c /etc/shadowsocks-libev/local.json

```



启动服务

```
#启动
sudo systemctl start shadowsocks-libev-local@.
#或 $ sudo service shadowsocks-libev-local@.service start
#查看运行情况
sudo systemctl status shadowsocks-libev-local@.
#配置开机自启
sudo systemctl enable shadowsocks-libev-local@.


sudo service shadowsocks-libev restart
sudo service shadowsocks-libev start
sudo service shadowsocks-libev stop
```

### 终端代理

vim ~/.bashrc

export ALL_PROXY=socks5://127.0.0.1:1080

source ~/.bashrc

### git 代理

git config --global http.proxy 'socks5://127.0.0.1:1081' 

git config --global https.proxy 'socks5://127.0.0.1:1081'



测试验证：

使用`curl ifconfig.me`会返回出口的公网IP

使用`curl www.google.com`