# 什么是 HTTPS 协议？

原创：[程序员小灰](https://juejin.im/user/5a144d196fb9a045211e5618)


![img](https://user-gold-cdn.xitu.io/2019/3/13/169759631dd9f8b5?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

![img](https://user-gold-cdn.xitu.io/2019/3/13/169759631ee658ba?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

![img](https://user-gold-cdn.xitu.io/2019/3/13/169759631e0e0d75?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



![img](https://user-gold-cdn.xitu.io/2019/3/13/169759631e5d5c7b?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





![img](https://user-gold-cdn.xitu.io/2019/3/13/169759631e2f7cca?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





![img](https://user-gold-cdn.xitu.io/2019/3/13/169759631dee296c?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



![img](https://user-gold-cdn.xitu.io/2019/3/13/169759633db910da?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

![img](https://user-gold-cdn.xitu.io/2019/3/13/169759633da72e12?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

![img](https://user-gold-cdn.xitu.io/2019/3/13/1697596346bc4faf?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





什么是HTTP协议？



HTTP协议全称Hyper Text Transfer Protocol，翻译过来就是超文本传输协议，位于TCP/IP四层模型当中的应用层。



![img](https://user-gold-cdn.xitu.io/2019/3/13/1697596346a4dbad?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





HTTP协议通过请求/响应的方式，在客户端和服务端之间进行通信。



![img](https://user-gold-cdn.xitu.io/2019/3/13/16975963470b7d09?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





这一切看起来很美好，但是HTTP协议有一个致命的缺点：**不够安全**。



HTTP协议的信息传输完全以明文方式，不做任何加密，相当于是在网络上“裸奔”。这样会导致什么问题呢？让我们打一个比方：



小灰是客户端，小灰的同事小红是服务端，有一天小灰试图给小红发送请求。



![img](https://user-gold-cdn.xitu.io/2019/3/13/1697596347a072f3?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



但是，由于传输信息是明文，这个信息有可能被某个中间人恶意截获甚至篡改。这种行为叫做**中间人攻击**。



![img](https://user-gold-cdn.xitu.io/2019/3/13/169759635a6aadcc?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





![img](https://user-gold-cdn.xitu.io/2019/3/13/169759636171e9af?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

![img](https://user-gold-cdn.xitu.io/2019/3/13/1697596364813ea9?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



如何进行加密呢？



小灰和小红可以事先约定一种**对称加密**方式，并且约定一个随机生成的密钥。后续的通信中，信息发送方都使用密钥对信息加密，而信息接收方通过同样的密钥对信息解密。





![img](https://user-gold-cdn.xitu.io/2019/3/13/16975963665dfcc5?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





![img](https://user-gold-cdn.xitu.io/2019/3/13/16975964b723e7d2?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





这样做是不是就绝对安全了呢？并不是。



虽然我们在后续的通信中对明文进行了加密，但是第一次约定加密方式和密钥的通信仍然是明文，如果第一次通信就已经被拦截了，那么密钥就会泄露给中间人，中间人仍然可以解密后续所有的通信内容。





![img](https://user-gold-cdn.xitu.io/2019/3/13/169759636a087b55?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





这可怎么办呢？别担心，我们可以使用**非对称加密**，为密钥的传输做一层额外的保护。



非对称加密的一组秘钥对中，包含一个公钥和一个私钥。明文既可以用公钥加密，用私钥解密；也可以用私钥加密，用公钥解密。



在小灰和小红建立通信的时候，小红首先把自己的公钥Key1发给小灰：



![img](https://user-gold-cdn.xitu.io/2019/3/13/169759637c8cad2f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



收到小红的公钥以后，小灰自己生成一个用于对称加密的密钥Key2，并且用刚才接收的公钥Key1对Key2进行加密（这里有点绕），发送给小红：



![img](https://user-gold-cdn.xitu.io/2019/3/13/169759637e7c5a3f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



小红利用自己非对称加密的私钥，解开了公钥Key1的加密，获得了Key2的内容。从此以后，两人就可以利用Key2进行对称加密的通信了。





![img](https://user-gold-cdn.xitu.io/2019/3/13/169759637f381ee4?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



在通信过程中，即使中间人在一开始就截获了公钥Key1，由于不知道私钥是什么，也无从解密。



![img](https://user-gold-cdn.xitu.io/2019/3/13/1697596388150ce3?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



![img](https://user-gold-cdn.xitu.io/2019/3/13/169759638d0d6284?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



是什么坏主意呢？中间人虽然不知道小红的私钥是什么，但是在截获了小红的公钥Key1之后，却可以偷天换日，自己另外生成一对公钥私钥，把自己的公钥Key3发送给小灰。



![img](https://user-gold-cdn.xitu.io/2019/3/13/1697596390efee08?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





小灰不知道公钥被偷偷换过，以为Key3就是小红的公钥。于是按照先前的流程，用Key3加密了自己生成的对称加密密钥Key2，发送给小红。



这一次通信再次被中间人截获，中间人先用自己的私钥解开了Key3的加密，获得Key2，然后再用当初小红发来的Key1重新加密，再发给小红。



![img](https://user-gold-cdn.xitu.io/2019/3/13/169759639ad79de8?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



这样一来，两个人后续的通信尽管用Key2做了对称加密，但是中间人已经掌握了Key2，所以可以轻松进行解密。



![img](https://user-gold-cdn.xitu.io/2019/3/13/16975963a0fbfbe4?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

![img](https://user-gold-cdn.xitu.io/2019/3/13/169759639fdb6435?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





是什么解决方案呢？难道再把公钥进行一次加密吗？这样只会陷入鸡生蛋蛋生鸡，永无止境的困局。



这时候，我们有必要引入第三方，一个权威的证书颁发机构（CA）来解决。



到底什么是证书呢？证书包含如下信息：



![img](https://user-gold-cdn.xitu.io/2019/3/13/16975963aa1841c5?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





为了便于说明，我们这里做了简化，只列出了一些关键信息。至于这些证书信息的用处，我们看看具体的通信流程就能够弄明白了。



流程如下：



1.作为服务端的小红，首先把自己的公钥发给证书颁发机构，向证书颁发机构申请证书。





![img](https://user-gold-cdn.xitu.io/2019/3/13/16975963a912a240?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





2.证书颁发机构自己也有一对公钥私钥。机构利用自己的私钥来加密Key1，并且通过服务端网址等信息生成一个证书签名，证书签名同样经过机构的私钥加密。证书制作完成后，机构把证书发送给了服务端小红。





![img](https://user-gold-cdn.xitu.io/2019/3/13/16975963b7f5d211?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



3.当小灰向小红请求通信的时候，小红不再直接返回自己的公钥，而是把自己申请的证书返回给小灰。



![img](https://user-gold-cdn.xitu.io/2019/3/13/16975963bfebae4d?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





4.小灰收到证书以后，要做的第一件事情是验证证书的真伪。需要说明的是，**各大浏览器和操作系统已经维护了所有权威证书机构的名称和公钥**。所以小灰只需要知道是哪个机构颁布的证书，就可以从本地找到对应的机构公钥，解密出证书签名。



接下来，小灰按照同样的签名规则，自己也生成一个证书签名，如果两个签名一致，说明证书是有效的。



验证成功后，小灰就可以放心地再次利用机构公钥，解密出服务端小红的公钥Key1。





![img](https://user-gold-cdn.xitu.io/2019/3/13/16975963c05ce7a5?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





5.像之前一样，小灰生成自己的对称加密密钥Key2，并且用服务端公钥Key1加密Key2，发送给小红。



![img](https://user-gold-cdn.xitu.io/2019/3/13/16975963cff2ec31?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





6.最后，小红用自己的私钥解开加密，得到对称加密密钥Key2。于是两人开始用Key2进行对称加密的通信。



![img](https://user-gold-cdn.xitu.io/2019/3/13/16975963cd964fe4?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)







在这样的流程下，我们不妨想一想，中间人是否还具有使坏的空间呢？



![img](https://user-gold-cdn.xitu.io/2019/3/13/16975963d315effe?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





![img](https://user-gold-cdn.xitu.io/2019/3/13/16975963dc2e5dc5?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



![img](https://user-gold-cdn.xitu.io/2019/3/13/16975963e5d39d0f?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)







![img](https://user-gold-cdn.xitu.io/2019/3/13/16975963ecf65896?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

![img](data:image/svg+xml;utf8,<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="650" height="400"></svg>)



![img](data:image/svg+xml;utf8,<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="650" height="400"></svg>)



![img](https://user-gold-cdn.xitu.io/2019/3/13/169759640707ca8a?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)





注：最新推出的TLS协议，是SSL 3.0协议的升级版，和SSL协议的大体原理是相同的。





![img](https://user-gold-cdn.xitu.io/2019/3/13/16975963f5f0268a?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)