## [学习C++应该做点什么项目](https://mp.weixin.qq.com/s/DLQllBnFyA6vt2aFENP-2Q)

### 手撸STL

- [**水平高的可以直接参考gcc源码**](https://github.com/gcc-mirror/gcc)
- [入门](https://github.com/Alinshans/MyTinySTL)

### **手撸Json**

- [高水平-](https://github.com/nlohmann/json )

- [刚入门](https://github.com/dropbox/json11)

### **网络编程**

- [陈硕的muduo](https://github.com/chenshuo/muduo)
- 学网络编程，最好先看C语言的libevent或libuv，学习reactor模式，然后再看muduo，muduo只是用cpp11实现了一遍reactor，当然作者有些说法是有争议的。基于callback的reactor学完了，可以看看协程，协程特别适合异步io，推荐看state_thread，应该是最早的轻量级协程库了，同样是c写的。懂了协程实现原理，再用cpp重新实现一下练练手。如果自己能实现一个基于协程的网络库（底下依然是reactor），网络编程基本上就没啥问题了。注：相比reactor，还有proactor，这是原生支持异步io系统中才会用到，比如Windows。Linux里都是reactor，iouring在网络中的应用还需再看看。



