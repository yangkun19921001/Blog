## 前言

由于之前项目搭建的是 MVP 架构，由` RxJava + Glide + OKHttp +  Retrofit + Dagger ` 等开源框架组合而成，之前也都是停留在使用层面上，没有深入的研究，最近打算把它们全部攻下，还没有关注的同学可以先关注一波，看完这个系列文章，(不管是面试还是工作中处理问题)相信你都在知道原理的情况下，处理问题更加得心应手。



[Android 图片加载框架 Glide 4.9.0 (一) 从源码的角度分析 Glide 执行流程](https://juejin.im/post/5d89e9c051882509662c5620)

[Android 图片加载框架 Glide 4.9.0 (二) 从源码的角度分析 Glide 缓存策略](https://juejin.im/post/5d8c83836fb9a04dec52f19d)

[从源码的角度分析 Rxjava2 的基本执行流程、线程切换原理](https://juejin.im/post/5d9b489251882560e87e620e)

[从源码的角度分析 OKHttp3 (一) 同步、异步执行流程](https://juejin.im/post/5d9ef57c51882514316fe33a)

[从源码的角度分析 OKHttp3 (二) 拦截器的魅力](https://juejin.im/post/5da306965188252ba420a15d)

[从源码的角度分析 OKHttp3 (二) 缓存策略](https://juejin.im/post/5da306965188252ba420a15d)



## Http 缓存基础

### 1. 什么是缓存

缓存是一种保存资源副本并在下次请求时直接使用该副本的技术。说白了，其实就是一种存储方式。

### 2. 为什么使用缓存

通过网络提取内容既速度缓慢又开销巨大。 较大的响应需要在客户端与服务器之间进行多次往返通信，这会延迟客户端获得和处理内容的时间，还会增加访问者的流量费用。 因此，缓存并重复利用之前获取的资源的能力成为性能优化的一个关键方面。

### 3. Http 缓存控制

HTTP/1.1定义的 [`Cache-Control`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Cache-Control) 头用来区分对缓存机制的支持情况， 请求头和响应头都支持这个属性。通过它提供的不同的值来定义缓存策略。

#### 语法

指令不区分大小写，并且具有可选参数，可以用令牌或者带引号的字符串语法。多个指令以逗号分隔。

- **缓存请求指令**: 客户端可以在HTTP请求中使用的标准 Cache-Control 指令。

  | Cache-Control         |     功能     | 说明                                                         |
  | --------------------- | :----------: | :----------------------------------------------------------- |
  | max-age=<seconds>     |     到期     | 设置缓存存储的最大周期，超过这个时间缓存被认为过期(单位秒)。与`Expires`相反，时间是相对于请求的时间。 |
  | max-stale[=<seconds>] | 缓存到期时间 | 表明客户端愿意接收一个已经过期的资源。可以设置一个可选的秒数，表示响应不能已经过时超过该给定的时间。 |
  | min-fresh=<seconds>   | 缓存到期时间 | 表示客户端希望获取一个能在指定的秒数内保持其最新状态的响应   |
  | no-cache              |   可缓存性   | 在发布缓存副本之前，强制要求缓存把请求提交给原始服务器进行验证。 |
  | no-store              |   可缓存性   | 缓存不应存储有关客户端请求或服务器响应的任何内容。           |
  | no-transform          |     其它     | 不得对资源进行转换或转变。`Content-Encoding`、`Content-Range`、`Content-Type`等HTTP头不能由代理修改。例如，非透明代理或者如[Google's Light Mode](https://support.google.com/webmasters/answer/6211428?hl=en)可能对图像格式进行转换，以便节省缓存空间或者减少缓慢链路上的流量。`no-transform`指令不允许这样做。 |
  | only-if-cached        |     其它     | 表明客户端只接受已缓存的响应，并且不要向原始服务器检查是否有更新的拷贝 |

  

- **缓存响应指令:** 服务器可以在响应中使用的标准 Cache-Control 指令

  | Cache-Control      | 指令               | 说明                                                         |
  | ------------------ | ------------------ | ------------------------------------------------------------ |
  | must-revalidate    | 重新验证和重新加载 | 一旦资源过期（比如已经超过`max-age`），在成功向原始服务器验证之前，缓存不能用该资源响应后续请求。 |
  | no-cache           | 可缓存性           | 在发布缓存副本之前，强制要求缓存把请求提交给原始服务器进行验证。 |
  | no-store           | 可缓存性           | 缓存不应存储有关客户端请求或服务器响应的任何内容。           |
  | no-transform       | 其它               | 不得对资源进行转换或转变。`Content-Encoding`、`Content-Range`、`Content-Type`等HTTP头不能由代理修改。例如，非透明代理或者如[Google's Light Mode](https://support.google.com/webmasters/answer/6211428?hl=en)可能对图像格式进行转换，以便节省缓存空间或者减少缓慢链路上的流量。`no-transform`指令不允许这样做。 |
  | public             | 可缓存性           | 表明响应可以被任何对象（包括：发送请求的客户端，代理服务器，等等）缓存，即使是通常不可缓存的内容（例如，该响应没有`max-age`指令或`Expires`消息头） |
  | private            | 可缓存性           | 表明响应只能被单个用户缓存，不能作为共享缓存（即代理服务器不能缓存它）。私有缓存可以缓存响应内容。 |
  | proxy-revalidate   | 重新验证和重新加载 | 与must-revalidate作用相同，但它仅适用于共享缓存（例如代理），并被私有缓存忽略。 |
  | max-age=<seconds>  | 缓存到期           | 设置缓存存储的最大周期，超过这个时间缓存被认为过期(单位秒)。与`Expires`相反，时间是相对于请求的时间。 |
  | s-maxage=<seconds> | 缓存到期           | 覆盖`max-age`或者`Expires`头，但是仅适用于共享缓存(比如各个代理)，私有缓存会忽略它。 |
  | immutable          | 重新验证和重新加载 | 表示响应正文不会随时间而改变。资源（如果未过期）在服务器上不发生改变，因此客户端不应发送重新验证请求头（例如`If-None-Match`或I`f-Modified-Since`）来检查更新，即使用户显式地刷新页面。在Firefox中，immutable只能被用在 `https://` transactions. 有关更多信息，请参阅[这里](http://bitsup.blogspot.de/2016/05/cache-control-immutable.html) |

  

- #### 示例

  1. **禁止缓存**

  ```java
  //发送如下指令可以关闭缓存。此外，可以参考Expires和Pragma消息头
  Cache-Control: no-cache, no-store, must-revalidate
  ```

  2. **缓存静态资源**

  ```java
  Cache-Control:public, max-age=120
  ```

  

## OKHttp 缓存策略

前面我们学习了一些最基本的 Http 缓存基础，下面我们来分析 Okhttp 缓存实现，先来分析涉及到的几个类，最后在以一个实际示例来演示 OKHttp 中的缓存。

### 1. CacheControl 详解

OKHttp 里面的 CacheControl 对应的是 HTTP 里面的 CacheControl，只不过 OKHTTP 对缓存指令封装了一层，下面我们看它的源码实现:

```java
public final class CacheControl {

  public static final CacheControl FORCE_NETWORK = new Builder().noCache().build();

  public static final CacheControl FORCE_CACHE = new Builder()
      .onlyIfCached()
      .maxStale(Integer.MAX_VALUE, TimeUnit.SECONDS)
      .build();
  
  private final boolean noCache; //对应 HTTP 控制缓存指令的 “no-cache”
  private final boolean noStore; //对应 HTTP 控制缓存指令的 “no-store”
  private final int maxAgeSeconds;//对应 HTTP 控制缓存指令的 “max-age”
  private final int sMaxAgeSeconds;//对应 HTTP 控制缓存指令的 “s-maxage”
  private final boolean isPrivate;//对应 HTTP 控制缓存指令的 “private”
  private final boolean isPublic;//对应 HTTP 控制缓存指令的 “public”
  private final boolean mustRevalidate;//对应 HTTP 控制缓存指令的 “must-revalidate”
  private final int maxStaleSeconds;//对应 HTTP 控制缓存指令的 “max-stale”
  private final int minFreshSeconds;//对应 HTTP 控制缓存指令的 “min-fresh”
  private final boolean onlyIfCached;//对应 HTTP 控制缓存指令的 “only-if-cached”
  private final boolean noTransform;//对应 HTTP 控制缓存指令的 “no-transform”
  private final boolean immutable;//对应 HTTP 控制缓存指令的 “immutable”

  @Nullable String headerValue; 

  private CacheControl(boolean noCache, boolean noStore, int maxAgeSeconds, int sMaxAgeSeconds,
      boolean isPrivate, boolean isPublic, boolean mustRevalidate, int maxStaleSeconds,
      int minFreshSeconds, boolean onlyIfCached, boolean noTransform, boolean immutable,
      @Nullable String headerValue) {
    this.noCache = noCache;
    this.noStore = noStore;
    this.maxAgeSeconds = maxAgeSeconds;
    this.sMaxAgeSeconds = sMaxAgeSeconds;
    this.isPrivate = isPrivate;
    this.isPublic = isPublic;
    this.mustRevalidate = mustRevalidate;
    this.maxStaleSeconds = maxStaleSeconds;
    this.minFreshSeconds = minFreshSeconds;
    this.onlyIfCached = onlyIfCached;
    this.noTransform = noTransform;
    this.immutable = immutable;
    this.headerValue = headerValue;
  }

...//省略构造函数
  
  //主要根据 Request 、 Response Headers 来匹配控制缓存数据的策略
   public static CacheControl parse(Headers headers) {
     
     ...//省略一些 指令匹配
   }
  ....//省略一些 set,get 
}
```

通过上面的注释就可以知道 CacheControl 就是对 Http 中的控制缓存的指令进行封装.

### 2. CacheStrategy 详解

OKHTTP 使用了 CacheStrategy 实现了上面的缓存流程，它根据之前缓存的结果与当前将要发送 Request 的header 进行策略，并得出是否进行请求的结果。

根据 CacheInterceptor 类中的调用我们先看 `CacheStrategy.Factory` 函数具体实现

```java
//CacheStrategy.java    
public Factory(long nowMillis, Request request, Response cacheResponse) {
      this.nowMillis = nowMillis; //当前请求的时间戳
      this.request = request;//当前的请求
      this.cacheResponse = cacheResponse;//根据当前请求拿到的响应缓存

      if (cacheResponse != null) {//如果缓存不为空
        this.sentRequestMillis = cacheResponse.sentRequestAtMillis();
        this.receivedResponseMillis = cacheResponse.receivedResponseAtMillis();
        Headers headers = cacheResponse.headers();//拿到缓存的响应头
        for (int i = 0, size = headers.size(); i < size; i++) { 
          String fieldName = headers.name(i); //拿到指 令的 key
          String value = headers.value(i);    //拿到指令具体的值
          if ("Date".equalsIgnoreCase(fieldName)) { //根据 header 来匹配
            servedDate = HttpDate.parse(value);
            servedDateString = value;
          } else if ("Expires".equalsIgnoreCase(fieldName)) {
            expires = HttpDate.parse(value);
          } else if ("Last-Modified".equalsIgnoreCase(fieldName)) {
            lastModified = HttpDate.parse(value);
            lastModifiedString = value;
          } else if ("ETag".equalsIgnoreCase(fieldName)) {
            etag = value;
          } else if ("Age".equalsIgnoreCase(fieldName)) {
            ageSeconds = HttpHeaders.parseSeconds(value, -1);
          }
        }
      }
    }
```

通过上面代码我们知道  `CacheStrategy.Factory`  函数主要对缓存的响应 header 做一些初始化解析匹配，下面我们在来看其他函数。

```java
    public CacheStrategy get() {
      //拿到缓存策略
      CacheStrategy candidate = getCandidate();
			//如果当前网络请求不为空，并且请求里面缓存控制配置的是只用缓存，那么返回一个请求，缓存都为空的策略
      if (candidate.networkRequest != null && request.cacheControl().onlyIfCached()) {
        return new CacheStrategy(null, null);
      }
			//返回
      return candidate;
    }		
		//拿到缓存策略
    private CacheStrategy getCandidate() {
      // 返回没有缓存的策略
      if (cacheResponse == null) {
        return new CacheStrategy(request, null);
      }

      // 如果当前的请求是 HTTPS 并且当前请求的缓存也流失的握手，则返回一个没有缓存的策略
      if (request.isHttps() && cacheResponse.handshake() == null) {
        return new CacheStrategy(request, null);
      }

      //如果响应不能被缓存，则返回一个没有缓存的策略
      if (!isCacheable(cacheResponse, request)) {
        return new CacheStrategy(request, null);
      }
			//拿到当前请求头的控制缓存指令
      CacheControl requestCaching = request.cacheControl();
      //如果请求头设置了 “no_cache” 则不缓存
      if (requestCaching.noCache() || hasConditions(request)) {
        return new CacheStrategy(request, null);
      }
			//根据当前请求拿到的响应缓存指令对象
      CacheControl responseCaching = cacheResponse.cacheControl();
			//获取缓存响应的时长
      long ageMillis = cacheResponseAge();
      //获取上一次响应的刷新时间
      long freshMillis = computeFreshnessLifetime();
			//如果请求中拿到了缓存的最大存活时间
      if (requestCaching.maxAgeSeconds() != -1) {
        //那么选取 2 则最短的时间赋值给最后刷新的时间
        freshMillis = Math.min(freshMillis, SECONDS.toMillis(requestCaching.maxAgeSeconds()));
      }
			//定义一个局部最小刷新时间
      long minFreshMillis = 0;
      //如果请求中有最小刷新时间的限制
      if (requestCaching.minFreshSeconds() != -1) {
        //那么就用请求中最小更新时间来更新
        minFreshMillis = SECONDS.toMillis(requestCaching.minFreshSeconds());
      }
			//定义一个缓存存活最大时间值
      long maxStaleMillis = 0;
      //如果响应(服务器)那边不是必须验证并且存在最大验证秒数
      if (!responseCaching.mustRevalidate() && requestCaching.maxStaleSeconds() != -1) {
         //更新最大验证时间
        maxStaleMillis = SECONDS.toMillis(requestCaching.maxStaleSeconds());
      }
			//如果响应缓存中没有配置 “no-cache”,并且 持续时间+最短刷新时间 < 上次刷新时间+最大验证时间 如果都满足条件的话则可以缓存
      if (!responseCaching.noCache() && ageMillis + minFreshMillis < freshMillis + maxStaleMillis) {
        //拿到缓存响应
        Response.Builder builder = cacheResponse.newBuilder();
        if (ageMillis + minFreshMillis >= freshMillis) {
          builder.addHeader("Warning", "110 HttpURLConnection \"Response is stale\"");
        }
        long oneDayMillis = 24 * 60 * 60 * 1000L;
        if (ageMillis > oneDayMillis && isFreshnessLifetimeHeuristic()) {
          builder.addHeader("Warning", "113 HttpURLConnection \"Heuristic expiration\"");
        }
        //返回可用的缓存策略
        return new CacheStrategy(null, builder.build());
      }
			//如果想缓存 Request 就要满足一些条件
      String conditionName;
      String conditionValue;
      if (etag != null) {
        conditionName = "If-None-Match";
        conditionValue = etag;
      } else if (lastModified != null) {
        conditionName = "If-Modified-Since";
        conditionValue = lastModifiedString;
      } else if (servedDate != null) {
        conditionName = "If-Modified-Since";
        conditionValue = servedDateString;
      } else {
        //返回不满足条件
        return new CacheStrategy(request, null); // No condition! Make a regular request.
      }

      Headers.Builder conditionalRequestHeaders = request.headers().newBuilder();
      Internal.instance.addLenient(conditionalRequestHeaders, conditionName, conditionValue);

      Request conditionalRequest = request.newBuilder()
          .headers(conditionalRequestHeaders.build())
          .build();
      //返回满足条件的缓存 Request 策略
      return new CacheStrategy(conditionalRequest, cacheResponse);
    }

		...//省略部分代码
      
  }
```

上面 `CacheStrategy get()` 代码，可以说是整个缓存策略中的缓存核心，但是呢？其实这些缓存都是 [RFC](https://zh.wikipedia.org/wiki/RFC) 标准文档中定义好的。

通过上面的大量注释，不用我来总结下流程了吧，相信根据注释还一遍代码还是很容易懂的。

### 3. CacheInterceptor 拦截器分析

由于上一篇文章我们简单的介绍了 **缓存拦截器执行流程**，还没有看过了可以先去看一下[从源码的角度分析 OKHttp3 (二) 拦截器的魅力](https://juejin.im/post/5da306965188252ba420a15d) ，下面我们就来讲解缓存拦截器中的缓存怎么 增删改插

```java
public final class CacheInterceptor implements Interceptor {
  final @Nullable InternalCache cache;

	...//构造函数省略

  @Override public Response intercept(Chain chain) throws IOException {
    //1. get 如果 OKhttpClient 配置了 Cache 那么就根据当前 Request 的 URL 来进行缓存
    Response cacheCandidate = cache != null
        ? cache.get(chain.request())
        : null;
		//拿到当前时间戳
    long now = System.currentTimeMillis();
		//根据当前请求和缓存数据拿到一个缓存策略对象
    CacheStrategy strategy = new CacheStrategy.Factory(now, chain.request(), cacheCandidate).get();
    //拿到网络请求
    Request networkRequest = strategy.networkRequest;
    //拿到缓存响应
    Response cacheResponse = strategy.cacheResponse;
    
		...//省略部分代码
    //如果网络请求跟缓存响应为空的话，就强制返回一个无效缓存，错误码为 504
    if (networkRequest == null && cacheResponse == null) {
      return new Response.Builder()
          .request(chain.request())
          .protocol(Protocol.HTTP_1_1) //
          .code(504)
          .message("Unsatisfiable Request (only-if-cached)")
          .body(Util.EMPTY_RESPONSE)
          .sentRequestAtMillis(-1L)
          .receivedResponseAtMillis(System.currentTimeMillis())
          .build();
    }

    // 如果 networkRequest 为空的话，但是响应缓存有效就返回响应缓存
    if (networkRequest == null) {
      return cacheResponse.newBuilder()
          .cacheResponse(stripBody(cacheResponse))
          .build();
    }

    //到这里如果缓存都不满足条件的话，需要重新执行网络请求
    Response networkResponse = null;
    try {
      //调用下一个拦截器，进行网络请求
      networkResponse = chain.proceed(networkRequest);
    } finally {
     ...
    }

    // 如果缓存不为空
    if (cacheResponse != null) {
      //并且响应码 == 之前定义的 304
      if (networkResponse.code() == HTTP_NOT_MODIFIED) {
        //生成一个缓存响应
        Response response = cacheResponse.newBuilder()
            .headers(combine(cacheResponse.headers(), networkResponse.headers()))
            .sentRequestAtMillis(networkResponse.sentRequestAtMillis())
            .receivedResponseAtMillis(networkResponse.receivedResponseAtMillis())
            .cacheResponse(stripBody(cacheResponse))
            .networkResponse(stripBody(networkResponse))
            .build();
        
        networkResponse.body().close();

      
        cache.trackConditionalCacheHit();
        //2. cache update 如果满足 cacheResponse ！= nul 并且网络请求的响应码为 304 就更新缓存
        cache.update(cacheResponse, response);
        return response;
      } else {
        closeQuietly(cacheResponse.body());
      }
    }

    //没有缓存使用，读取网络响应
    Response response = networkResponse.newBuilder()
        .cacheResponse(stripBody(cacheResponse))
        .networkResponse(stripBody(networkResponse))
        .build();

    if (cache != null) {
      if (HttpHeaders.hasBody(response) && CacheStrategy.isCacheable(response, networkRequest)) {
        //3.cache put 存入缓存
        CacheRequest cacheRequest = cache.put(response);
        return cacheWritingResponse(cacheRequest, response);
      }
			
      //检查缓存是否有效
      if (HttpMethod.invalidatesCache(networkRequest.method())) {
        try {
          //4. cache put 删除无效缓存
          cache.remove(networkRequest);
        } catch (IOException ignored) {
          
        }
      }
    }
    return response;
  }
```

那么根据上面的注释 1，2，3，4 我们知道了缓存的增删查改，这里总结下流程

1、如果在 OKHttpClient 中配置了 cache，则从缓存中获取，但是不保证就存在
2、拿到当前请求，缓存拿到缓存策略对象
3、缓存检测
4、禁止使用网络（根据缓存策略），缓存又无效，直接返回
5、缓存有效，不使用网络
6、缓存无效，执行下一个拦截器
7、本地有缓存，根具条件选择使用哪个响应
8、使用网络响应
9、 缓存到本地

上面判断比较多，总结了一张图表或许会清晰一点

| networkRequest   | cacheResponse | result                                                       |
| ---------------- | ------------- | ------------------------------------------------------------ |
| Null             | null          | only-if-cached (表明不进行网络请求，且缓存不存在或者过期，一定会返回503错误) |
| Null             | non-null      | 不进行网络请求，直接返回缓存，不请求网络                     |
| non-null（非空） | null          | 需要进行网络请求，而且缓存不存在或者过去，直接访问网络       |
| non-null         | non-null      | Header中包含ETag/Last-Modified标签，需要在满足条件下请求，还是需要访问网络 |

OKHTTP 缓存策略到这里就基本讲解完了，下面我们就以一个示例来实际看下缓存

###4. OKHttp 缓存实战

#### 有网缓存拦截器

```java
    /**
     * 有网时候的缓存
     */
    final Interceptor netWorkCacheInterceptor = new Interceptor() {
        @Override
        public Response intercept(Chain chain) throws IOException {
            Request request = chain.request();
            Response response = chain.proceed(request);
            int onlineCacheTime = 30;//在线的时候的缓存过期时间，如果想要不缓存，直接时间设置为0
            return response.newBuilder()
              			//缓存存活时间的最大限制,最后会根据 CacheControl.parse(headers) 生成一个 													//CacheControl
                    .header("Cache-Control", "public, max-age="+onlineCacheTime) 
                    .removeHeader("Pragma")
                    .build();
        }
    };
```

#### 无网络缓存拦截器

```java
    /**
     * 没有网时候的缓存
     */
    final Interceptor OfflineCacheInterceptor = new Interceptor() {
        @Override
        public Response intercept(Chain chain) throws IOException {
            Request request = chain.request();
            if (!isNetworkAvailable(getApplicationContext())) {
                int offlineCacheTime = 60;//离线的时候的缓存的过期时间
                request = request.newBuilder()
                        .cacheControl(new CacheControl
                                .Builder()
                                .maxStale(offlineCacheTime, TimeUnit.SECONDS)
                                .onlyIfCached()
                                .build()
                        ) //两种方式结果是一样的，写法不同
//                        .header("Cache-Control", "public, only-if-cached, max-stale=" + offlineCacheTime)
                        .build();
            }
            return chain.proceed(request);
        }
    };
```

#### 测试

```java
    public void okhttp() {
        String url = "https://wanandroid.com/wxarticle/chapters/json";
        File file = new File(getCacheDir() ,"okhttpCache");
        Cache cache = new Cache(file, 1024 * 1024 * 10);
        OkHttpClient okHttpClient =
                new OkHttpClient.Builder().
                        addInterceptor(OfflineCacheInterceptor).
                        addNetworkInterceptor(netWorkCacheInterceptor).
                        cache(cache).
                        build();

        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();

        okHttpClient.newCall(request).enqueue(new Callback() {

            @Override
            public void onFailure(Call call, IOException e) {
                Log.d(TAG, "responseFail : " + e.getMessage());

            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                Log.d(TAG, "responseBody ： " + response.body().string());
            }
        });

    }
```

上面的代码就是 OKHttp 的异步 GET 请求，配置了应用、网络拦截器，下面看下实际效果吧，

[![KPrHIS.gif](https://s2.ax1x.com/2019/10/15/KPrHIS.gif)](https://imgchr.com/i/KPrHIS)

**（ps:由于这里无网络不能远程，就不给动图了，大家可以直接拿这  2 个拦截器直接测试）**

**这里解释一下为什么这里配置两个拦截器，而不直接一个拦截器在内部判断就行了**，我个人给出的看法是没有网络的请况下，应用拦截器在 **List** 容器的第一个位置，固添加到应用拦截器是为了避免不执行不必要的代码，而有网路的情况下，我添加到了网络拦截器，为了就是可以在重定向或者添加请求头之后拿到更加完整的 Request  对象，从而可以缓存和更新更多可用的信息。

## 总结 

到这里 OKHttp 缓存机制分析的差不多了，总结一下吧，其实有看过这块源码的知道 OKHttp 缓存其实不属于 自己单独实现，而是用的 JK 大神的 `DiskLruCache` 开源库作为基础 + OKHttp 设计的缓存策略 = 从而实现了底层缓存技术。

## 参考

[OKHttp源码解析(六)--中阶之缓存基础 ](https://www.jianshu.com/p/b32d13655be7)

[Http 缓存](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching?hl=zh-cn)

[Cache-Control 指令](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9)