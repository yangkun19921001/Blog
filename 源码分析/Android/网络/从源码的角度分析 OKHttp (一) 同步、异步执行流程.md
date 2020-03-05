## 前言

由于之前项目搭建的是 MVP 框架，由` RxJava + Glide + OKHttp +  Retrofit + Dagger ` 等开源框架组合而成，之前也都是停留在使用层面上，没有深入的研究，最近打算把它们全部攻下，还没有关注的同学可以先关注一波，看完这个系列文章，(不管是面试还是工作中处理问题)相信你都在知道原理的情况下，处理问题更加得心应手。



[Android 图片加载框架 Glide 4.9.0 (一) 从源码的角度分析 Glide 执行流程](https://juejin.im/post/5d89e9c051882509662c5620)

[Android 图片加载框架 Glide 4.9.0 (二) 从源码的角度分析 Glide 缓存策略](https://juejin.im/post/5d8c83836fb9a04dec52f19d)

[从源码的角度分析 Rxjava2 的基本执行流程、线程切换原理](https://juejin.im/post/5d9b489251882560e87e620e)



## 介绍

[OKHttp](https://github.com/square/okhttp/) 出至于 [移动支付 Square 公司](https://github.com/square), 适用于` Android`，`Kotlin` 和 `Java` 的 HTTP 客户端，个人认为就目前来说 OKHttp 是最好用之一的网络请求框架。在网络请求中使用 OKhttp 好处也是显而易见的，比如如下几点:

- 1. 支持 HTTP2 / SPDY

- 2. Socket 自动选择最好路线，并支持自动重连

- 3. 拥有自动维护的 Socket 连接池，减少握手次数

- 4. 拥有队列线程池，轻松写并发

- 5. 拥有 Interceptors 轻松处理请求与响应（比如透明 GZIP 压缩）基于 Headers 的缓存策略

- 6. HTTP / 2支持允许对同一主机的所有请求共享一个套接字

- 7. 响应缓存完全避免网络重复请求

  

## 源码分析

在介绍源码之前请先看基本的 `Get`、`Post` 使用

**Get 同步**

```java
public OkHttpClient client = new OkHttpClient();

String run(String url) throws IOException {
  Request request = new Request.Builder()
      .url(url)
      .build();

  try (Response response = client.newCall(request).execute()) {
    return response.body().string();
  }
}
```

 **POST 异步**

```java
public final MediaType JSON = MediaType.get("application/json; charset=utf-8");

public OkHttpClient client = new OkHttpClient();

public void  post(String url, String json) {
	RequestBody body = RequestBody.create(JSON, json);
	Request request = new Request.Builder()
					.url(url)
					.post(body)
					.build();

	client.newCall(request).enqueue(new Callback() {
	@Override
  public void onFailure(Call call, IOException e) {
                
	}

	@Override
  public void onResponse(Call call, Response response) throws IOException {

	}
	});
}
```

**源码分析**

在进入 OKHttp 源码之前先看一下各自执行的流程

**同步时序图**

[![uo7xNn.png](https://s2.ax1x.com/2019/10/10/uo7xNn.png)](https://imgchr.com/i/uo7xNn)

**异步时序图**

[![uTPau9.png](https://s2.ax1x.com/2019/10/10/uTPau9.png)](https://imgchr.com/i/uTPau9)



**代码讲解**

通过上面时序图可以知道，其实不管是异步还是同步，最后都是在 `getResponseWithInterceptorChain();` 函数中处理 `Request `、`Response`  可以说 `getResponseWithInterceptorChain()` 这个函数是整个处理请求和响应的核心，这个我们待会再详细讲解，下面我们来解析 OKHttp 代码执行流程：

1. 根据同步、异步代码示例，首先创建一个 OkHttpClient

   ```java
   //创建 OkHttpClient
   OkHttpClient okHttpClient = new OkHttpClient（）；
   ```

   ```java
   public class OkHttpClient implements Cloneable, Call.Factory, WebSocket.Factory {
     
     ...//省略部分代码
     
     public OkHttpClient() {
       this(new Builder());
     }
       public Builder newBuilder() {
           return new Builder(this);
       }
   
       public static final class Builder {
           Dispatcher dispatcher; //调度器
           /**
            * 代理类，默认有三种代理模式DIRECT(直连),HTTP（http代理）,SOCKS（socks代理）
            */
           @Nullable Proxy proxy;
           /**
            * 协议集合，协议类，用来表示使用的协议版本，比如`http/1.0,`http/1.1,`spdy/3.1,`h2等
            */
           List<Protocol> protocols;
           /**
            * 连接规范，用于配置Socket连接层。对于HTTPS，还能配置安全传输层协议（TLS）版本和密码套件
            */
           List<ConnectionSpec> connectionSpecs;
           //拦截器，可以监听、重写和重试请求等
           final List<Interceptor> interceptors = new ArrayList<>();
           final List<Interceptor> networkInterceptors = new ArrayList<>();
           EventListener.Factory eventListenerFactory;
           /**
            * 代理选择类，默认不使用代理，即使用直连方式，当然，我们可以自定义配置，
            * 以指定URI使用某种代理，类似代理软件的PAC功能
            */
           ProxySelector proxySelector;
           //Cookie的保存获取
           CookieJar cookieJar;
           /**
            * 缓存类，内部使用了DiskLruCache来进行管理缓存，匹配缓存的机制不仅仅是根据url，
            * 而且会根据请求方法和请求头来验证是否可以响应缓存。此外，仅支持GET请求的缓存
            */
           @Nullable Cache cache;
           //内置缓存
           @Nullable InternalCache internalCache;
           //Socket的抽象创建工厂，通过createSocket来创建Socket
           SocketFactory socketFactory;
           /**
            * 安全套接层工厂，HTTPS相关，用于创建SSLSocket。一般配置HTTPS证书信任问题都需要从这里着手。
            * 对于不受信任的证书一般会提示
            * javax.net.ssl.SSLHandshakeException异常。
            */
           @Nullable SSLSocketFactory sslSocketFactory;
           /**
            * 证书链清洁器，HTTPS相关，用于从[Java]的TLS API构建的原始数组中统计有效的证书链，
            * 然后清除跟TLS握手不相关的证书，提取可信任的证书以便可以受益于证书锁机制。
            */
           @Nullable CertificateChainCleaner certificateChainCleaner;
           /**
            * 主机名验证器，与HTTPS中的SSL相关，当握手时如果URL的主机名
            * 不是可识别的主机，就会要求进行主机名验证
            */
           HostnameVerifier hostnameVerifier;
           /**
            * 证书锁，HTTPS相关，用于约束哪些证书可以被信任，可以防止一些已知或未知
            * 的中间证书机构带来的攻击行为。如果所有证书都不被信任将抛出SSLPeerUnverifiedException异常。
            */
           CertificatePinner certificatePinner;
           /**
            * 身份认证器，当连接提示未授权时，可以通过重新设置请求头来响应一个
            * 新的Request。状态码401表示远程服务器请求授权，407表示代理服务器请求授权。
            * 该认证器在需要时会被RetryAndFollowUpInterceptor触发。
            */
           Authenticator proxyAuthenticator;
           Authenticator authenticator;
           /**
            * 连接池
            *
            * 我们通常将一个客户端和服务端和连接抽象为一个 connection，
            * 而每一个 connection 都会被存放在 connectionPool 中，由它进行统一的管理，
            * 例如有一个相同的 http 请求产生时，connection 就可以得到复用
            */
           ConnectionPool connectionPool;
           //域名解析系统
           Dns dns;
           //是否遵循SSL重定向
           boolean followSslRedirects;
           //是否重定向
           boolean followRedirects;
           //失败是否重新连接
           boolean retryOnConnectionFailure;
           //回调超时
           int callTimeout;
           //连接超时
           int connectTimeout;
           //读取超时
           int readTimeout;
           //写入超时
           int writeTimeout;
           //与WebSocket有关，为了保持长连接，我们必须间隔一段时间发送一个ping指令进行保活；
           int pingInterval;
   
           public Builder() {
               dispatcher = new Dispatcher();
   
               protocols = DEFAULT_PROTOCOLS;
   
               connectionSpecs = DEFAULT_CONNECTION_SPECS;
               eventListenerFactory = EventListener.factory(EventListener.NONE);
               /**
                * 代理选择类，默认不使用代理，即使用直连方式，当然，我们可以自定义配置，以指定URI使用某种代理，类似代理软件的PAC功能
                */
               proxySelector = ProxySelector.getDefault();
               if (proxySelector == null) {
                   proxySelector = new NullProxySelector();
               }
               cookieJar = CookieJar.NO_COOKIES;
               socketFactory = SocketFactory.getDefault();
               hostnameVerifier = OkHostnameVerifier.INSTANCE;
               certificatePinner = CertificatePinner.DEFAULT;
               proxyAuthenticator = Authenticator.NONE;
               authenticator = Authenticator.NONE;
               connectionPool = new ConnectionPool();
               dns = Dns.SYSTEM;
               followSslRedirects = true;
               followRedirects = true;
               retryOnConnectionFailure = true;
               callTimeout = 0;
               connectTimeout = 10_000;
               readTimeout = 10_000;
               writeTimeout = 10_000;
               pingInterval = 0;
           }
         
         ....//省略部分代码
   }
   ```

   通过 OkHttpClient 的构造函数`this(new Builder()); ` 看到这里是不是很熟悉，没错就是我们熟悉的建造者模式，那么我们也可以通过如下链式调用进行一些参数配置，

   ```java
           OkHttpClient build = new OkHttpClient.Builder().
                   addInterceptor().
                   addNetworkInterceptor().
                   writeTimeout().
                   build();
   ```

   下面我们接着看 `this(new Builder()); ` 看到 Builder 中的注释我们得知，就是配置一大堆 OKHttp 属性，大家想一想如果这里实现的是 `new OKHttpClient("","","",n+ ...)`有很多参数这样是不是很繁琐，其实大家如果在项目中遇见很多参数需要配置的话，也可以进行 `Builder 模式`进行设计。

2. 构建一个 Request 请求

   ```java
       Request request = new Request.Builder()
               .url(url)
               .build();
   ```
   可以看到上面构建请求也是一个建造者模式，我们看看 Request 类中做了什么

   ```java
   public final class Request {
     ...//部分代码省略
     
     public static class Builder {
       //URL 管理
       @Nullable HttpUrl url;
       //请求类型,支持(GET,HEAD,POST,DELETE,PUT,PATCH)
       String method;
       //Http消息的头字段
       Headers.Builder headers;
       //传给服务器的 body 数据
       @Nullable RequestBody body;
   
   
       Map<Class<?>, Object> tags = Collections.emptyMap();
   
       public Builder() {
         this.method = "GET"; //默认 GET
         this.headers = new Headers.Builder();
       }
   
       Builder(Request request) {
         this.url = request.url;
         this.method = request.method;
         this.body = request.body;
         this.tags = request.tags.isEmpty()
             ? Collections.emptyMap()
             : new LinkedHashMap<>(request.tags);
         this.headers = request.headers.newBuilder();
       }
   
       public Builder url(HttpUrl url) {
         if (url == null) throw new NullPointerException("url == null");
         this.url = url;
         return this;
       }
     
     ....//省略部分代码
       
   }
   ```

   分析完 Request 我们知道，就是封装请求信息。

3. 创建 RealCall

   ```java
   okHttpClient.newCall(request)
   ```

   ```java
     @Override public Call newCall(Request request) {
       return RealCall.newRealCall(this, request, false /* for web socket */);
     }
   
     static RealCall newRealCall(OkHttpClient client, Request originalRequest, boolean forWebSocket) {
       // Safely publish the Call instance to the EventListener.
       RealCall call = new RealCall(client, originalRequest, forWebSocket);
       call.transmitter = new Transmitter(client, call);
       return call;
     }
   ```

   可以看到 newCall 根据 Request 会创建一个 Call 它的实现类也就是 RealCall。

4. 同步执行

   ```java
   okHttpClient.newCall(request).execute();
   ```

   ```java
     @Override public Response execute() throws IOException {
       synchronized (this) {
         //1. 是否已经执行过了
         if (executed) throw new IllegalStateException("Already Executed");
         executed = true;
       }
       transmitter.timeoutEnter();
       transmitter.callStart();
       try {
         //2. 调用 OKHttpClient 的调度器分发给同步执行
         client.dispatcher().executed(this);
         //3. 调用拦截器
         return getResponseWithInterceptorChain();
       } finally {
         //不管是否执行成功都关闭当前请求任务
         client.dispatcher().finished(this);
       }
     }
   ```

   通过 `execute` 函数内部实现，我们知道

   1. 首先判断这个请求是否已经执行了，如果已经执行了就抛出一个异常，很明显这里只允许执行一次。
   2. 调用器分发任务下去
   3. 调用拦截器进行处理请求，响应。

   我们看注释 2 代码实现

   ```java
     synchronized void executed(RealCall call) {
       runningSyncCalls.add(call);
     }
   ```

   将当前执行请求的 call 添加进行同步队列中，这里出现了一个 `runningSyncCalls` 容器，我们具体看下是什么

   ```java
     /** Ready async calls in the order they'll be run. */
     private final Deque<AsyncCall> readyAsyncCalls = new ArrayDeque<>();
   
     /** Running asynchronous calls. Includes canceled calls that haven't finished yet. */
     private final Deque<AsyncCall> runningAsyncCalls = new ArrayDeque<>();
   
     /** Running synchronous calls. Includes canceled calls that haven't finished yet. */
     private final Deque<RealCall> runningSyncCalls = new ArrayDeque<>();
   ```

   根据上面注释可知：

   readyAsyncCalls：准备需要执行的异步任务

   runningAsyncCalls：正在执行的异步任务

   runningSyncCalls：正在执行的同步任务

   注释 3 的代码我们待会跟讲解异步源码一起看，因为它们最后都会调用 `getResponseWithInterceptorChain` 函数

5. 异步处理

   ```java
   okHttpClient.newCall(request).enqueue(new Callback() {
   
   @Override
   public void onFailure(Call call, IOException e) {
   	}
   
   @Override
   public void onResponse(Call call, Response response) throws IOException {
   
   		}
   });
   ```

   因为 Call 的实现类是 RealCall ,所以我们直接看 RealCall 的 enqueue

   ```java
     @Override public void enqueue(Callback responseCallback) {
       synchronized (this) {
         if (executed) throw new IllegalStateException("Already Executed");
         executed = true;
       }
       transmitter.callStart();
       client.dispatcher().enqueue(new AsyncCall(responseCallback));
     }
   ```

   很明显这里跟同步执行的其实都大同小异，也都只允许执行一次，最后调用分发器进行 `enqueue`

6. enqueue

   ```java
     void enqueue(AsyncCall call) {
       synchronized (this) {
         //1. 
         readyAsyncCalls.add(call);
         //2. 
         if (!call.get().forWebSocket) {
           AsyncCall existingCall = findExistingCallWithHost(call.host());
           if (existingCall != null) call.reuseCallsPerHostFrom(existingCall);
         }
       }
       //3. 
       promoteAndExecute();
     }
   ```

   根据注释首先将要执行的异步任务加入准备执行的异步队列中，然后判断是否是 WebSocket 最后调用 `promoteAndExecute` 是要准备执行了，我们看下它的实现：

   ```java
     private int maxRequests = 64;
     private int maxRequestsPerHost = 5;
   
   private boolean promoteAndExecute() {
       assert (!Thread.holdsLock(this));
   
       List<AsyncCall> executableCalls = new ArrayList<>();
       boolean isRunning;
       synchronized (this) {
         //1. 
         for (Iterator<AsyncCall> i = readyAsyncCalls.iterator(); i.hasNext(); ) {
           AsyncCall asyncCall = i.next();
   				//2.
           if (runningAsyncCalls.size() >= maxRequests) break; // Max capacity.
           //3. 
           if (asyncCall.callsPerHost().get() >= maxRequestsPerHost) continue; // Host max capacity.
   				//4. 
           i.remove();
           asyncCall.callsPerHost().incrementAndGet();
           //5. 
           executableCalls.add(asyncCall);
           runningAsyncCalls.add(asyncCall);
         }
         isRunning = runningCallsCount() > 0;
       }
   		//6. 
       for (int i = 0, size = executableCalls.size(); i < size; i++) {
         AsyncCall asyncCall = executableCalls.get(i);
         asyncCall.executeOn(executorService());
       }
   
       return isRunning;
     }
   ```

   根据上面代码标注的注释，我们来分析下具体意思

   1. 首先准备执行的异步任务
   2. 判断正在运行的异步任务数量是否已经操作最大限制 64 。
   3. 判断请求同一个主机 host 不能大于 5（可以通过Get与Set方式自定义设置）
   4. 先删除当前需要准备执行的异步任务
   5. 将当前需要准备执行的异步任务加入到正在运行异步任务的队列中
   6. 遍历当前需要执行的异步任务，拿到异步任务执行。

   我们来看下 ` asyncCall.executeOn(executorService());` 这里的 `executorService()` 是什么了？

   ```java
   //返回一个执行线程池的对象  
   public synchronized ExecutorService executorService() {
       if (executorService == null) {
         executorService = new ThreadPoolExecutor(0, Integer.MAX_VALUE, 60, TimeUnit.SECONDS,
             new SynchronousQueue<>(), Util.threadFactory("OkHttp Dispatcher", false));
       }
       return executorService;
     }
   ```

   根据上面代码可以知道，返回的是一个执行线程池的对象，看下内部参数代表的意思，该方法是一个同步方法，ThreadPoolExecutor() 的核心线程数量为 0 ，如果空闲的话是 60 s 的存活期，第二个参数传入了 Integer 的最大值，即线程池所能容纳的最大线程数为 Integer.MAX_VALUE ，虽然这里设置了很大的值，但是实际情况下并非会达到最大值，因为上面 enqueue() 方法中有做了判断。

7. 既然执行了子线程那么肯定会走 run 函数，我们找一下

   ```java
    final class AsyncCall extends NamedRunnable {
      ....//通过源码查看 AsyncCall 内部没有 run 函数，那么我们找它的父类
    }
   ```

   ```java
   public abstract class NamedRunnable implements Runnable {
     protected final String name;
   
     public NamedRunnable(String format, Object... args) {
       this.name = Util.format(format, args);
     }
   
     @Override public final void run() {
       String oldName = Thread.currentThread().getName();
       Thread.currentThread().setName(name);
       try {
         execute();
       } finally {
         Thread.currentThread().setName(oldName);
       }
     }
   
     protected abstract void execute();
   }
   ```

   在父类找到了 run 函数，并执行了一个抽象函数 `execute`，我们看它的子类 `AsyncCall`

   ```java
       @Override protected void execute() {
         boolean signalledCallback = false;
         transmitter.timeoutEnter();
         try {
           //1. 
           Response response = getResponseWithInterceptorChain();
           signalledCallback = true;
           //2. 
           responseCallback.onResponse(RealCall.this, response);
         } catch (IOException e) {
           if (signalledCallback) {
             // Do not signal the callback twice!
             Platform.get().log(INFO, "Callback failure for " + toLoggableString(), e);
           } else {
             responseCallback.onFailure(RealCall.this, e);
           }
         } finally {
           //3. 
           client.dispatcher().finished(this);
         }
       }
   ```

   通过上面代码注释分析得知：

   1. 通过 `getResponseWithInterceptorChain();` 函数我们可以拿到服务器返回的响应数据
   2. 通过回调把响应数据返回给调用层
   3. 最后 finished,判断是否有需要执行的任务，然后继续删除准备执行的异步任务，开始执行删除的异步任务。

   到了这里 `同步执行`、`异步执行` 最后都调用` getResponseWithInterceptorChain();` 函数，下面我们来看下它的具体实现

8. ` getResponseWithInterceptorChain();`

   ```java
   Response getResponseWithInterceptorChain() throws IOException {
     /**
     * 分类：1、应用拦截器  2、网络拦截器
     */
   	List<Interceptor> interceptors = new ArrayList();
     //用户添加的全局拦截器
   	interceptors.addAll(this.client.interceptors());
     //错误、重定向拦截器
   	interceptors.add(new RetryAndFollowUpInterceptor(this.client));
     //桥接拦截器，桥接应用层与网络层，添加必要的头
   	interceptors.add(new BridgeInterceptor(this.client.cookieJar()));
     //缓存处理，Last-Modified、ETag、DiskLruCache等
   	interceptors.add(new CacheInterceptor(this.client.internalCache()));
     //连接拦截器
   	interceptors.add(new ConnectInterceptor(this.client));
   	if (!this.forWebSocket) {
      //通过okHttpClient.Builder#addNetworkInterceptor()传进来的拦截器只对非网页的请求生效
   		interceptors.addAll(this.client.networkInterceptors());
   	}
     //真正访问服务器的拦截器
   	interceptors.add(new CallServerInterceptor(this.forWebSocket));
     //一个包裹这request的chain
   	Chain chain = new RealInterceptorChain(interceptors, this.transmitter, 		(Exchange)null, 0, this.originalRequest, this, 					this.client.connectTimeoutMillis(), this.client.readTimeoutMillis(), this.client.writeTimeoutMillis());
   	boolean calledNoMoreExchanges = false;
   	Response var5;
   	try {
       //开始执行拦截器
   		Response response = chain.proceed(this.originalRequest);
   		if (this.transmitter.isCanceled()) {
   			Util.closeQuietly(response);
          throw new IOException("Canceled");
               }
               var5 = response;
           } catch (IOException var9) {
               calledNoMoreExchanges = true;
               throw this.transmitter.noMoreExchanges(var9);
           } finally {
               if (!calledNoMoreExchanges) {
                   this.transmitter.noMoreExchanges((IOException)null);
               }
           }
   	return var5;
   }
   ```

   上面代码发现 new了一个 ArrayList ，然后就是不断的 add，然后 new 了 RealInterceptorChain 对象，最后调用了chain.proceed() 方法。先看下RealInterceptorChain 的构造函数。

   ```java
     public RealInterceptorChain(List<Interceptor> interceptors, Transmitter transmitter,
         @Nullable Exchange exchange, int index, Request request, Call call,
         int connectTimeout, int readTimeout, int writeTimeout) {
       this.interceptors = interceptors;
       this.transmitter = transmitter;
       this.exchange = exchange;
       this.index = index;
       this.request = request;
       this.call = call;
       this.connectTimeout = connectTimeout;
       this.readTimeout = readTimeout;
       this.writeTimeout = writeTimeout;
     }
   ```

   构造函数里面其实没有做些什么，就是一些赋值动作。最后看下 chain.proceed() 内部实现

   ```java
   
     public Response proceed(Request request, Transmitter transmitter, @Nullable Exchange exchange)
         throws IOException {
       //如果当前 index 大于总的拦截器数量就抛异常
       if (index >= interceptors.size()) throw new AssertionError();
   		//每调用一次就自增加 1
       calls++;
   
       // 如果我们已经有了一个流，请确认传入的请求将复用它
       if (this.exchange != null && !this.exchange.connection().supportsUrl(request.url())) {
         throw new IllegalStateException("network interceptor " + interceptors.get(index - 1)
             + " must retain the same host and port");
       }
   
       // 如果我们已经有了一个流，请确认这是对chain.proceed（）的唯一调用.
       if (this.exchange != null && calls > 1) {
         throw new IllegalStateException("network interceptor " + interceptors.get(index - 1)
             + " must call proceed() exactly once");
       }
   
       // 内部又创建一个 RealInterceptorChain 对下一个拦截器处理
       RealInterceptorChain next = new RealInterceptorChain(interceptors, transmitter, exchange,
           index + 1, request, call, connectTimeout, readTimeout, writeTimeout);
       //拿到当前的拦截器
       Interceptor interceptor = interceptors.get(index);
       //执行下一个拦截器，返回 response
       Response response = interceptor.intercept(next);
   
       ....
   
       return response;
     }
   ```

   根据上面代码看到在 proceed 方面里面又 new 了一个 RealInterceptorChain 类的 next 对象，这个 next 对象和 chain 最大的区别就是 index 属性值不同 chain 是 0. 而 next 是1，然后取 interceptors 下标为 1 的对象的 interceptor。由从上文可知，如果没有开发者自定义的Interceptor 时，首先调用的 RetryAndFollowUpInterceptor，如果有开发者自己定义的interceptor 则调用开发者interceptor。

   `这里需要说明一下，因为拦截器在 OKHttp 设计中最为重要或是最值得学习之一，我们需要单独写一篇介绍拦截器，所以这里我们着重介绍执行流程`

   后面的流程是在每一个 interceptor 的 intercept 方法里面都会调用 `chain.proceed()` 从而调用下一个 `interceptor` 的 `intercept(next)` 方法，这样就可以实现递归遍历`getResponseWithInterceptorChain` 里面的  `interceptors` ，不知道这种调用方式大家有没有熟悉感，是不是觉得跟 `责任链模式`很相像。没错，它其实就是设计模式当中的责任链模式。每条链处理的任务都是独立的，也实现了解耦功能，它的强大完全在这里体现出来了。缩减后的责任链模式拦截器代码如下：

   ```java
   //RetryAndFollowUpInterceptor.java
   public Response intercept(Chain chain) throws IOException {
    //忽略部分代码
    response = ((RealInterceptorChain) chain).proceed(request, streamAllocation, null, null);
    //忽略部分代码
   }
   ```

   ```java
   //BridgeInterceptor.java
   public Response intercept(Chain chain) throws IOException {
     //忽略部分代码
     Response networkResponse = chain.proceed(requestBuilder.build());
     //忽略部分代码
   }
   ```

   ```java
   //CacheInterceptor.java
   public Response intercept(Chain chain) throws IOException {
      //忽略部分代码
      networkResponse = chain.proceed(networkRequest);
      //忽略部分代码
   }
   ```

   ```java
   //ConnectInterceptor.java
   public Response intercept(Chain chain) throws IOException {
        //忽略部分代码
        return realChain.proceed(request, streamAllocation, httpCodec, connection);
   }
   ```

   读过源码我们知道 `getResponseWithInterceptorChain`里面`interceptors`的最后一个 拦截器 是 `CallServerInterceptor.java`，最后一个 Interceptor (即CallServerInterceptor) 里面是直接返回了response 而不是进行继续递归，具体里面是通过` OKIO `实现的，具体代码，等后面再详细说明，`CallServerInterceptor`返回`response`后, 返回给上一个 interceptor ,一般是开发者自己定义的 networkInterceptor ，然后开发者自己的 networkInterceptor 把他的 response 返回给前一个 interceptor ，依次类推返回给第一个 interceptor，这时候又回到了 realCall 里面的 execute() 里面了，代码如下：

   ```java
       @Override protected void execute() {
        ...
         try {
           Response response = getResponseWithInterceptorChain();
           signalledCallback = true;
           //将 response 返回给调用层
           responseCallback.onResponse(RealCall.this, response);
         } catch (IOException e) {
          .... //省略代码
        
       }
   ```

   最后通过 ` responseCallback.onResponse(RealCall.this, response); ` 回调返回给了调用层，至此，请求 -> 响应流程我们分析完了，最后我们来总结下

## 总结

**同步请求流程:**

- 创建 OKHttpClient 实例，配置属性
- 构建 Request ，配置属性
- 构建 Realcall ，调用 executed
- 执行`Dispatcher.executed()` 中的 `runningSyncCalls`  将 Realcall 添加到同步执行队列中
- 通过 `getResponseWithInterceptorChain()` 内部的责任链调用对 Request 层层处理包装，最后在 `CallServerInterceptor` 拦截器中发起请求和获得 Response
- 通过`Dispatcher.finished()`，把 call 实例从队列中移除，并执行下一次任务。

#####  

**异步请求流程:**

- 创建 OKHttpClient 实例，配置属性
- 构建 Request ，配置属性
- 构建 Realcall，调用 enqueue

- 生成一个`AsyncCall(responseCallback)`实例(实现了Runnable)
- `AsyncCall`实例放入了`Dispatcher.enqueue()`中，并判断 `maxRequests` （最大请求数 64）`maxRequestsPerHost`(最大host请求数 5)是否满足条件，如果满足就把`AsyncCall`添加到`runningAsyncCalls`中，并放入线程池中执行；如果条件不满足，就添加到等待就绪的异步队列，当那些满足的条件的执行时 ，在`Dispatcher.finifshed(this)`中的`promoteCalls();`方法中 对等待就绪的异步队列进行遍历，生成对应的`AsyncCall`实例，并添加到`runningAsyncCalls`中，最后放入到线程池中执行，一直到所有请求都结束。

## 参考

[square OKHttp 官方网站](https://square.github.io/okhttp/)

[OKhttp 源码分析系列](https://www.jianshu.com/p/82f74db14a18)





