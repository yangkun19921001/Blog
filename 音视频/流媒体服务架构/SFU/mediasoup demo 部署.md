下载 demo 源码

```shell
git clone https://github.com/versatica/mediasoup-demo.git
cd mediasoup-demo
git checkout v3
```

配置服务端

```
cd server
npm install
cp config.example.js config.js


                webRtcTransportOptions :
                {
        https  :
        {
                listenIp   : '0.0.0.0',
                // NOTE: Don't change listenPort (client app assumes 4443).
                listenPort : process.env.PROTOO_LISTEN_PORT || http 端口,
                // NOTE: Set your own valid certificate files.
                tls        :
                {
                        cert : process.env.HTTPS_CERT_FULLCHAIN || `/root/cert/rtcmedia.top_apache/rtcmedia.top_bundle.pem`,
                        key  : process.env.HTTPS_CERT_PRIVKEY || `/root/cert/rtcmedia.top_apache/rtcmedia.top.key`
                }
        },
                        listenIps :
                        [
                                {
                                        ip          : process.env.MEDIASOUP_LISTEN_IP || '内网服务IP',
                                        announcedIp : '公网服务IP'
                                }
                        ],
                        initialAvailableOutgoingBitrate : 1000000,
                        minimumAvailableOutgoingBitrate : 600000,
                        maxSctpMessageSize              : 262144,
                        // Additional options that are not part of WebRtcTransportOptions.
                        maxIncomingBitrate              : 1500000
                },
                // mediasoup PlainTransport options for legacy RTP endpoints (FFmpeg,
                // GStreamer).
                // See https://mediasoup.org/documentation/v3/mediasoup/api/#PlainTransportOptions
                plainTransportOptions :
                {
                        listenIp :
                        {
                                ip          : process.env.MEDIASOUP_LISTEN_IP || '公网服务IP',
                                announcedIp : process.env.MEDIASOUP_ANNOUNCED_IP
                        },
                        maxSctpMessageSize : 262144
                }
                                
后台启动:
pm2  start server/server.js 
or
nohup start server.js  > output.log 2>&1 &
```

配置客服端

```shell
cd app
npm install
#如果报错，npm ERR! Invalid tag name ">=^16.0.0": Tags may not have any characters that encodeURIComponent encodes.执行下面这句

npm install --legacy-peer-deps


vim lib/urlFactory.js 修改对应的端口

#后台执行
nohup gulp live > output.log 2>&1 &
```



![image-20230510232343169](http://devyk.top/2022/202305102323953.png)



- [mediasoup 源码分析](https://blog.csdn.net/lcalqf/category_10259877.html)
