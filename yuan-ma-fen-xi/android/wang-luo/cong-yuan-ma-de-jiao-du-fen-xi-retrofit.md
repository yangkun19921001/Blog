# 从源码的角度分析 Retrofit

## 前言

由于之前项目搭建的是 MVP 架构，由`RxJava + Glide + OKHttp + Retrofit + Dagger` 等开源框架组合而成，之前也都是停留在使用层面上，没有深入的研究，最近打算把它们全部攻下，还没有关注的同学可以先关注一波，看完这个系列文章，\(不管是面试还是工作中处理问题\)相信你都在知道原理的情况下，处理问题更加得心应手。

[Android 图片加载框架 Glide 4.9.0 \(一\) 从源码的角度分析 Glide 执行流程](https://juejin.im/post/5d89e9c051882509662c5620)

[Android 图片加载框架 Glide 4.9.0 \(二\) 从源码的角度分析 Glide 缓存策略](https://juejin.im/post/5d8c83836fb9a04dec52f19d)

[从源码的角度分析 Rxjava2 的基本执行流程、线程切换原理](https://juejin.im/post/5d9b489251882560e87e620e)

[从源码的角度分析 OKHttp3 \(一\) 同步、异步执行流程](https://juejin.im/post/5d9ef57c51882514316fe33a)

[从源码的角度分析 OKHttp3 \(二\) 拦截器的魅力](https://juejin.im/post/5da306965188252ba420a15d)

[从源码的角度分析 OKHttp3 \(二\) 缓存策略](https://juejin.im/post/5da306965188252ba420a15d)

[从源码的角度分析 Retrofit 网络请求，包含 RxJava + Retrofit + OKhttp 网络请求执行流程](https://juejin.im/post/5da306965188252ba420a15d)

## 介绍

[Retrofit](https://github.com/square/retrofit) 跟之前介绍的 `OKHttp` 都是来自 `Square` 公司开源的项目，`Retrofit` 跟 `OKHttp` 也都属于 `HTTP` 网络请求框架，既然都是属于网络框架为什么我们都要分析它呢？有使用过 `Retrofit` 框架的知道，它的底层其实就是基于 OKHttp 来进行网络访问的。按照严格来说我个人认为 Retrofit 是基于 OKHttp 二次封装，目的就是为了使用更加简单明了。

## 简单使用

下面我们就简单以一个网络请求来举例说明一下，本章重点在于分析 Retrofit 源码，所以如果对使用有不清楚的可以看[Retrofit API](https://square.github.io/retrofit/) ，下面就以鸿洋大神 [wanandroid](https://wanandroid.com/blog/show/2) 的开放 API :[https://wanandroid.com/wxarticle/chapters/json](https://wanandroid.com/wxarticle/chapters/json) 来进行网络请求:

**定义 Retrofit 网络请求接口**

```java
public interface APIService {

      //按照 Retrofit 要求定义接口   Retrofit + OKHttp 网络访问
    @GET("/wxarticle/chapters/json")
    Call<JsonObject> getWXarticle();

      //按照 Retrofit 要求定义接口   RxJava + Retrofit + OKHttp 网络访问
    @GET("/wxarticle/chapters/json")
    Observable<JsonObject> getWXarticle();
}
```

**初始化 Retrofit 实例**

```java
  public static final String API_URL = "https://wanandroid.com";

    //1. 配置 OKHttpClient 添加查看 Request / Response 数据拦截器
    OkHttpClient okHttpClient = new OkHttpClient.Builder().addInterceptor(new Interceptor() {
            @Override
            public Response intercept(Chain chain) throws IOException {
                  //打印请求前的请求数据
                Request request = chain.request();
                Log.d(TAG, request.toString());

                  //打印服务端响应数据
                Response response = chain.proceed(request);
                MediaType mediaType = response.body().contentType();
                String content = response.body().string();
                Log.d("JSON：", content);
                Log.d("MediaType：", mediaType.toString());
                return response.newBuilder().
                        body(ResponseBody.create(mediaType, content)).
                        build();
            }
        }).build();

        //2. 构建 Retrofit 对象
        Retrofit retrofit = new Retrofit.Builder()
            .baseUrl(API_URL) //http API
            .addConverterFactory(GsonConverterFactory.create()) //配置 GSON 转换
            .addCallAdapterFactory(RxJava2CallAdapterFactory.createAsync()) //配置 RxJava ，支持异步访问 create 同步
            .client(okHttpClient)//主动配置 OKhttpClient
            .build();

    //3. 拿到 Retrofit 请求对象
    APIService api = retrofit.create(APIService.class);
```

**Retrofit + OKHttp** 

```java
  Call<JsonObject> call = api.getWXarticles();
    //OKHttp 异步访问网络
  call.enqueue(new Callback<JsonObject>() {
  @Override
  public void onResponse(Call<JsonObject> call, retrofit2.Response<JsonObject> response) {
      Log.d(TAG, "Retrofit + OKHttp "+response.body().toString());
  }

  @Override
  public void onFailure(Call<JsonObject> call, Throwable t) {
      Log.d(TAG, "Retrofit + OKHttp "+t.getMessage());
  }
});
```

**RxJava + Retrofit + OKHttp**

```java
  Observable<JsonObject> observable = api.getWXarticle();
  observable.subscribeOn(Schedulers.io())
                .subscribeOn(AndroidSchedulers.mainThread())
                .subscribe(new Observer<JsonObject>() {
                    @Override
                    public void onSubscribe(Disposable d) {
                        Log.d(TAG, "RxJava + Retrofit + OKHttp 订阅成功");
                    }

                    @Override
                    public void onNext(JsonObject s) {
                        Log.d(TAG, "RxJava + Retrofit + OKHttp "+s.toString());
                    }

                    @Override
                    public void onError(Throwable e) {
                        Log.d(TAG, "RxJava + Retrofit + OKHttp "+e.getMessage());
                    }

                    @Override
                    public void onComplete() {
                        Log.d(TAG, "RxJava + Retrofit + OKHttp onComplete");
                    }
                });
```

**输出结果:**

```java
//请求地址
com.dn_alan.myapplication.MainActivity: https://wanandroid.com/wxarticle/chapters/json

//请求 Request 信息
com.dn_alan.myapplication.MainActivity: Request{method=GET, url=https://wanandroid.com/wxarticle/chapters/json, tags={class retrofit2.Invocation=com.dn_alan.myapplication.APIService.getWXarticles() []}}；

//Rxjava 订阅成功                                                
com.dn_alan.myapplication.MainActivity: RxJava + Retrofit + OKHttp 订阅成功

//RxJava + Retrofit + OKHttp 服务端返回的数据
D/com.dn_alan.myapplication.MainActivity: RxJava + Retrofit + OKHttp {"data":[{"children":[],"courseId":13,"id":408,"name":"鸿....}

//RxJava + Retrofit + OKHttp 网络请求完成
D/com.dn_alan.myapplication.MainActivity: RxJava + Retrofit + OKHttp onComplete

//Retrofit + OKHttp 网络请求完成
D/com.dn_alan.myapplication.MainActivity: Retrofit + OKHttp {"data":[{"children":.....}
```

通过打印我们能够看出来 `RxJava + Retrofit + OKHttp` , `Retrofit + OKHttp` 都请求成功了，通过请求地址 我们发现最后 Retrofit 会拼接在一起的。这样使用是不是非常的爽。如果对 RxJava , OKHttp 源码还不了解的建议看下我之前的文章先复习下，因为本章会涉及到它们源码，这里不会细讲都是初略带过，因为重点是 `Retrofit`。

下面就是真正开始分析 Retrofit 怎么配合 OKHttp 还有 RxJava 进行网络访问的。

## 源码分析

### Retrofit 类介绍

```java
package retrofit2;

...

public final class Retrofit {

  ....//省略代码

  Retrofit(okhttp3.Call.Factory callFactory, HttpUrl baseUrl,
      List<Converter.Factory> converterFactories, List<CallAdapter.Factory> callAdapterFactories,
      @Nullable Executor callbackExecutor, boolean validateEagerly) {
    this.callFactory = callFactory; //配置的 OKhttp
    this.baseUrl = baseUrl;//配置的 Http 地址
    this.converterFactories = converterFactories; // 配置的转换功能 比如 GSON,
    this.callAdapterFactories = callAdapterFactories; // 配置的 RxJava 
    this.callbackExecutor = callbackExecutor;
    this.validateEagerly = validateEagerly;
  }

  @SuppressWarnings("unchecked") // Single-interface proxy creation guarded by parameter safety.
  public <T> T create(final Class<T> service) {

    ....//动态代理主要代码 后面讲解
  }

  ....//省略部分代码

  public static final class Builder {
    private final Platform platform;
    private @Nullable okhttp3.Call.Factory callFactory;
    private @Nullable HttpUrl baseUrl;
    private final List<Converter.Factory> converterFactories = new ArrayList<>();
    private final List<CallAdapter.Factory> callAdapterFactories = new ArrayList<>();
    private @Nullable Executor callbackExecutor;
    private boolean validateEagerly;

    Builder(Platform platform) {
      this.platform = platform;
    }

    public Builder() {
      this(Platform.get());
    }


    ....//省略部分代码

    /**
     * 
     * 
     * 构建 OKHttpClient
     */
    public Builder client(OkHttpClient client) {
      return callFactory(checkNotNull(client, "client == null"));
    }

    /**
     * 
     * 构建 OKHttpClient call
     */
    public Builder callFactory(okhttp3.Call.Factory factory) {
      this.callFactory = checkNotNull(factory, "factory == null");
      return this;
    }



    /**
     * Set the API base URL.
     *
     * @see #baseUrl(HttpUrl) 构建 URL
     */
    public Builder baseUrl(String baseUrl) {
      checkNotNull(baseUrl, "baseUrl == null");
      return baseUrl(HttpUrl.get(baseUrl));
    }


    /** 构建 GSON */
    public Builder addConverterFactory(Converter.Factory factory) {
      converterFactories.add(checkNotNull(factory, "factory == null"));
      return this;
    }

    /**
     * 构建 RXJava {@link Call}.
     */
    public Builder addCallAdapterFactory(CallAdapter.Factory factory) {
      callAdapterFactories.add(checkNotNull(factory, "factory == null"));
      return this;
    }




    public Retrofit build() {
      // url 
      if (baseUrl == null) {
        throw new IllegalStateException("Base URL required.");
      }
            //拿到 OKHttpClient
      okhttp3.Call.Factory callFactory = this.callFactory;
      if (callFactory == null) {
        callFactory = new OkHttpClient();
      }

      Executor callbackExecutor = this.callbackExecutor;
      if (callbackExecutor == null) {
        callbackExecutor = platform.defaultCallbackExecutor();
      }

      // 初始化一个容器
      List<CallAdapter.Factory> callAdapterFactories = new ArrayList<>(this.callAdapterFactories);
      //添加了一个默认的 DefaultCallAdapterFactory 用于进行协助 OKHttp 网络请求
      callAdapterFactories.addAll(platform.defaultCallAdapterFactories(callbackExecutor));

      // 初始化默认数据转换器
      List<Converter.Factory> converterFactories = new ArrayList<>(
          1 + this.converterFactories.size() + platform.defaultConverterFactoriesSize());

      converterFactories.add(new BuiltInConverters());
      converterFactories.addAll(this.converterFactories);
      converterFactories.addAll(platform.defaultConverterFactories());

      //构建 Retrofit 对象
      return new Retrofit(callFactory, baseUrl, unmodifiableList(converterFactories),
          unmodifiableList(callAdapterFactories), callbackExecutor, validateEagerly);
    }
  }
}
```

根据 Retrofit 内部代码实现，我们可以知道主要做了 2 件事儿

1. create 动态代理执行定义的注解接口函数\(内部具体实现我们下一小节细讲\)
2. 构建一些比如适配 RxJava ，转换 GSON ,网络请求 OKHTTP 配置等等。

下面分析 retrofit create 可以说是核心方法了。

### Retrofit create 动态代理实现

```java
  public <T> T create(final Class<T> service) {
    //1. 检查 service
    Utils.validateServiceInterface(service);
    if (validateEagerly) {
      eagerlyValidateMethods(service);
    }
    //执行动态代理
    return (T) Proxy.newProxyInstance(service.getClassLoader(), new Class<?>[] { service },
        new InvocationHandler() {
          private final Platform platform = Platform.get();
          private final Object[] emptyArgs = new Object[0];

          @Override public @Nullable Object invoke(Object proxy, Method method,
              @Nullable Object[] args) throws Throwable {
            // 是否是 Object 类型
            if (method.getDeclaringClass() == Object.class) {
              return method.invoke(this, args);
            }
            if (platform.isDefaultMethod(method)) {//一般不会执行这里
              return platform.invokeDefaultMethod(method, service, proxy, args);
            }
            //2. 真正执行定义接口中的具体函数
            //2.1 拿到 ServiceMethod 执行内部的 invoke 函数
            return loadServiceMethod(method).invoke(args != null ? args : emptyArgs);
          }
        });
  }
```

对 JAVA 设计模式很熟的应该知道，这里用到了动态代理模式，如果还有对动态代理或者其它设计模式不懂的可以看我以前写的[设计模式系列文章](https://juejin.im/post/5d7c6bc7f265da03f3338254) , 先看注释 2 `loadServiceMethod` 函数

```java
 private final Map<Method, ServiceMethod<?>> serviceMethodCache = new ConcurrentHashMap<>();  

    ServiceMethod<?> loadServiceMethod(Method method) {
    //1. 拿到缓存中的 ServiceMethod
    ServiceMethod<?> result = serviceMethodCache.get(method);
    if (result != null) return result;//1.1 如果存在就返回 
        //加了一个同步锁
    synchronized (serviceMethodCache) {
      //在锁里面又获取了一次
      result = serviceMethodCache.get(method);
      if (result == null) {//如果还是为空
        result = ServiceMethod.parseAnnotations(this, method); //开始解析接口上的注解
        //解析完成 存入缓存，避免下次再次解析相同的数据
        serviceMethodCache.put(method, result);
      }
    }
    return result;
  }
```

通过上面代码我们知道就是从 Map 中拿到 ServiceMethod 对象，如果缓存中没有就进行解析定义 Retrofit 网络请求接口从而构建 ServiceMethod ，这里如果有对 ConcurrentHashMap 不熟悉的推荐看下这篇文章[ConcurrentHashMap 解析](https://zhuanlan.zhihu.com/p/31614308) 。

下面我们看下 ServiceMethod.parseAnnotations

```java
  static <T> ServiceMethod<T> parseAnnotations(Retrofit retrofit, Method method) {
    //1. 通过 retrofit 实例和 接口中的函数方法拿到一个 Retrofit 请求对象
    RequestFactory requestFactory = RequestFactory.parseAnnotations(retrofit, method);
        //2. 拿到注解中的返回对象 ：http://loveshisong.cn/%E7%BC%96%E7%A8%8B%E6%8A%80%E6%9C%AF/2016-02-16-Type%E8%AF%A6%E8%A7%A3.html
    Type returnType = method.getGenericReturnType();
    //内部判断 type
    if (Utils.hasUnresolvableType(returnType)) {
      ...//属于抛一个异常
    }
    if (returnType == void.class) {
      throw methodError(method, "Service methods cannot return void.");
    }
        //3. 执行 HttpServiceMethod 解析
    return HttpServiceMethod.parseAnnotations(retrofit, method, requestFactory);
  }
```

上面代码我们知道主要做了 3 件事儿

1. 拿到请求对象
2. 判断调用接口中函数的返回值类型
3. 执行解析动作

我们来看下 `RequestFactory.parseAnnotations(retrofit, method)` 内部实现

```java
//定义为 final 不能为继承
final class RequestFactory {
  static RequestFactory parseAnnotations(Retrofit retrofit, Method method) {
    return new Builder(retrofit, method).build();
  }

static final class Builder {
 ....//省略部分代码
  Builder(Retrofit retrofit, Method method) {
      this.retrofit = retrofit; //拿到 retrofit 对象
      this.method = method; //拿到调动的方法
      this.methodAnnotations = method.getAnnotations();//获取方法上面的所有注解
      this.parameterTypes = method.getGenericParameterTypes();//获取所有参数类型
      this.parameterAnnotationsArray = method.getParameterAnnotations();//获取参数中定义的注解
  }


    RequestFactory build() {
      for (Annotation annotation : methodAnnotations) {
        //1. 解析方法上的注解
        parseMethodAnnotation(annotation);
      }

      ...//省略属性判断

      //拿到参数注解的数量，遍历做一些处理
      int parameterCount = parameterAnnotationsArray.length;
      parameterHandlers = new ParameterHandler<?>[parameterCount];
      for (int p = 0, lastParameter = parameterCount - 1; p < parameterCount; p++) {
        parameterHandlers[p] =
            parseParameter(p, parameterTypes[p], parameterAnnotationsArray[p], p == lastParameter);
      }

      ...//省略属性判断
            //2 . 实例化一个 RequestFactory 对象
      return new RequestFactory(this);
    }
}
```

我们先来看下 `parseMethodAnnotation`

```java
    private void parseMethodAnnotation(Annotation annotation) {
      if (annotation instanceof DELETE) {
        parseHttpMethodAndPath("DELETE", ((DELETE) annotation).value(), false);
      } else if (annotation instanceof GET) {
        parseHttpMethodAndPath("GET", ((GET) annotation).value(), false);
      } else if (annotation instanceof HEAD) {
        parseHttpMethodAndPath("HEAD", ((HEAD) annotation).value(), false);
      } else if (annotation instanceof PATCH) {
        parseHttpMethodAndPath("PATCH", ((PATCH) annotation).value(), true);
      } else if (annotation instanceof POST) {
        parseHttpMethodAndPath("POST", ((POST) annotation).value(), true);
      } else if (annotation instanceof PUT) {
        parseHttpMethodAndPath("PUT", ((PUT) annotation).value(), true);
      } else if (annotation instanceof OPTIONS) {
        parseHttpMethodAndPath("OPTIONS", ((OPTIONS) annotation).value(), false);
      } else if (annotation instanceof HTTP) {
        HTTP http = (HTTP) annotation;
        parseHttpMethodAndPath(http.method(), http.path(), http.hasBody());
      } else if (annotation instanceof retrofit2.http.Headers) {
        String[] headersToParse = ((retrofit2.http.Headers) annotation).value();
        if (headersToParse.length == 0) {
          throw methodError(method, "@Headers annotation is empty.");
        }
        headers = parseHeaders(headersToParse);
      } else if (annotation instanceof Multipart) {
        if (isFormEncoded) {
          throw methodError(method, "Only one encoding annotation is allowed.");
        }
        isMultipart = true;
      } else if (annotation instanceof FormUrlEncoded) {
        if (isMultipart) {
          throw methodError(method, "Only one encoding annotation is allowed.");
        }
        isFormEncoded = true;
      }
    }
```

这里不用注释都知道干嘛了吧，就是拿到当前函数上是否有请求的注解比如 `GET,POST，....` ，我们看一下内部实现

```java
    private void parseHttpMethodAndPath(String httpMethod, String value, boolean hasBody) {
      if (this.httpMethod != null) {
        throw methodError(method, "Only one HTTP method is allowed. Found: %s and %s.",
            this.httpMethod, httpMethod);
      }
      this.httpMethod = httpMethod;
      this.hasBody = hasBody;

      if (value.isEmpty()) {
        return;
      }

      // Get the relative URL path and existing query string, if present.
      int question = value.indexOf('?');
      if (question != -1 && question < value.length() - 1) {
        // Ensure the query string does not have any named parameters.
        String queryParams = value.substring(question + 1);
        Matcher queryParamMatcher = PARAM_URL_REGEX.matcher(queryParams);
        if (queryParamMatcher.find()) {
          throw methodError(method, "URL query string \"%s\" must not have replace block. "
              + "For dynamic query parameters use @Query.", queryParams);
        }
      }

      this.relativeUrl = value;
      this.relativeUrlParamNames = parsePathParameters(value);
    }
```

内部就是做一些请求链接的预处理，和最后一行代码是对注解中的数据做一些处理返回一个 set 集合。

现在回到 `ServiceMethod` 类中 的 `HttpServiceMethod.parseAnnotations(retrofit, method, requestFactory);`

```java
  static <ResponseT, ReturnT> HttpServiceMethod<ResponseT, ReturnT> parseAnnotations(
      Retrofit retrofit, Method method, RequestFactory requestFactory) {
    boolean isKotlinSuspendFunction = requestFactory.isKotlinSuspendFunction; //是否支持 Kotlin
    boolean continuationWantsResponse = false;
    boolean continuationBodyNullable = false;
        //拿到当前网络请求函数中的所有注解
    Annotation[] annotations = method.getAnnotations();
    Type adapterType;
    if (isKotlinSuspendFunction) { //暂时没有支持 所有先不管内部实现
     ...//
    } else {
      //返回接口中注解的返回类型
      adapterType = method.getGenericReturnType();
    }
        //1. 创建 createCallAdapter 就是返回的是 RxJava 被观察者对象或者是 OKHttp 的 默认 DefaultCallAdapterFactory 对象，根据注解返回值来判断
    CallAdapter<ResponseT, ReturnT> callAdapter =
        createCallAdapter(retrofit, method, adapterType, annotations);
    Type responseType = callAdapter.responseType();
    if (responseType == okhttp3.Response.class) {
      throw methodError(method, "'"
          + getRawType(responseType).getName()
          + "' is not a valid response body type. Did you mean ResponseBody?");
    }
    ....//省略判断
        //2. 创建一个数据响应转换 返回 GSON
    Converter<ResponseBody, ResponseT> responseConverter =
        createResponseConverter(retrofit, method, responseType);
        //3. 拿到 OKHttp call Factory
    okhttp3.Call.Factory callFactory = retrofit.callFactory;
    if (!isKotlinSuspendFunction) {
      //4. 创建一个 callAdapted
      return new CallAdapted<>(requestFactory, callFactory, responseConverter, callAdapter);
    } else if (continuationWantsResponse) {
      //noinspection unchecked Kotlin compiler guarantees ReturnT to be Object.
      return (HttpServiceMethod<ResponseT, ReturnT>) new SuspendForResponse<>(requestFactory,
          callFactory, responseConverter, (CallAdapter<ResponseT, Call<ResponseT>>) callAdapter);
    } else {
      //noinspection unchecked Kotlin compiler guarantees ReturnT to be Object.
      return (HttpServiceMethod<ResponseT, ReturnT>) new SuspendForBody<>(requestFactory,
          callFactory, responseConverter, (CallAdapter<ResponseT, Call<ResponseT>>) callAdapter,
          continuationBodyNullable);
    }
  }
```

上面还是做一些对注解的预处理，处理完之后返回一个 ServiceMethod 对象。

从上面注释 1 我们可以知道这里根据注解解析返回的是一个 `RxJava2CallAdapter` 对象或者是 Retrofit 中 Builder 中默认的 DefaultCallAdapterFactory

当返回了 `ServiceMethod` 对象的时候又继续执行了一个 invoke 函数，我们直接看 `HttpServiceMethod` 的函数，因为它继承于 `ServiceMethod`

```java
  @Override final @Nullable ReturnT invoke(Object[] args) {
    Call<ResponseT> call = new OkHttpCall<>(requestFactory, args, callFactory, responseConverter);
    return adapt(call, args);
  }

  protected abstract @Nullable ReturnT adapt(Call<ResponseT> call, Object[] args);
```

上面拿到 OKHttpCall 然后执行一个 adapt 抽象函数，由于直接解析注解我们知道在其内部实例化的是 `CallAdapter` 对象，所以找它内部的 adapt 实现

```java
  static final class CallAdapted<ResponseT, ReturnT> extends HttpServiceMethod<ResponseT, ReturnT> {
    private final CallAdapter<ResponseT, ReturnT> callAdapter;

    CallAdapted(RequestFactory requestFactory, okhttp3.Call.Factory callFactory,
        Converter<ResponseBody, ResponseT> responseConverter,
        CallAdapter<ResponseT, ReturnT> callAdapter) {
      super(requestFactory, callFactory, responseConverter);
      this.callAdapter = callAdapter;
    }

    @Override protected ReturnT adapt(Call<ResponseT> call, Object[] args) {
      //调用 CallAdapter 的 adapt 函数
      return callAdapter.adapt(call);
    }
  }
```

到了这里我们可以知道 callAdapter.adapt 分别就目前知道实现了 2 个类，`RxJava2CallAdapter`,和 `DefaultCallAdapterFactory`,下面分别分析各自实现的 adapt\(Call call\) 函数

* RxJava2CallAdapter adapt

```java
final class RxJava2CallAdapter<R> implements CallAdapter<R, Object> {

  @Override public Object adapt(Call<R> call) {
    //这里的 isAsync 就是配置 RxJava2CallAdapterFactory.createAsync() 内部有一个 布尔记录
    //1. 由于我们配置的是异步所以这里返回 CallEnqueueObservable 被观察者对象
    Observable<Response<R>> responseObservable = isAsync
        ? new CallEnqueueObservable<>(call)
        : new CallExecuteObservable<>(call);

    Observable<?> observable;
    //2. 只要请求接口中泛型参数不是 Result 一般情况下执行 isBody 返回 BodyObservable 内部持有一个 CallEnqueueObservable 被观察者对象
    if (isResult) {//如果泛型参数是 Result
      observable = new ResultObservable<>(responseObservable);
    } else if (isBody) { 
      observable = new BodyObservable<>(responseObservable);
    } else {
      observable = responseObservable;
    }

    //这里没有指定所以为空，也是在 RxJava2CallAdapterFactory 配置的时候指定
    if (scheduler != null) {
      observable = observable.subscribeOn(scheduler);
    }
        //定义的是否是 Flowable 被观察者
    if (isFlowable) {
      return observable.toFlowable(BackpressureStrategy.LATEST);
    }
    //定义的是否是 Single 被观察者
    if (isSingle) {
      return observable.singleOrError();
    }
     //定义的是否是 Maybe 被观察者
    if (isMaybe) {
      return observable.singleElement();
    }
    //定义的是否是 Completable 被观察者
    if (isCompletable) {
      return observable.ignoreElements();
    }
    //如果都不是的话 直接返回 BodyObservable
    return RxJavaPlugins.onAssembly(observable);
  }  
}
```

到了这里 `api.getWXarticle();` 如果定义的是被观察者对象，那么返回的就是 `BodyObservable 内部持有一个 CallEnqueueObservable` 的被观察者对象。

* DefaultCallAdapterFactory adapt

```java
final class DefaultCallAdapterFactory extends CallAdapter.Factory {
  private final @Nullable Executor callbackExecutor;

  DefaultCallAdapterFactory(@Nullable Executor callbackExecutor) {
    this.callbackExecutor = callbackExecutor;
  }

  @Override public @Nullable CallAdapter<?, ?> get(
      Type returnType, Annotation[] annotations, Retrofit retrofit) {

        ...//省略部分代码

    return new CallAdapter<Object, Call<?>>() {
      @Override public Type responseType() {
        return responseType;
      }

      @Override public Call<Object> adapt(Call<Object> call) {
        return executor == null
            ? call
            : new ExecutorCallbackCall<>(executor, call);
      }
    };
  }

  static final class ExecutorCallbackCall<T> implements Call<T> {
    final Executor callbackExecutor;
    final Call<T> delegate;

    ExecutorCallbackCall(Executor callbackExecutor, Call<T> delegate) {
      this.callbackExecutor = callbackExecutor;
      this.delegate = delegate;
    }

    @Override public void enqueue(final Callback<T> callback) {
      checkNotNull(callback, "callback == null");

      delegate.enqueue(new Callback<T>() {
        @Override public void onResponse(Call<T> call, final Response<T> response) {
          callbackExecutor.execute(new Runnable() {
            @Override public void run() {
              if (delegate.isCanceled()) {
                // Emulate OkHttp's behavior of throwing/delivering an IOException on cancellation.
                callback.onFailure(ExecutorCallbackCall.this, new IOException("Canceled"));
              } else {
                callback.onResponse(ExecutorCallbackCall.this, response);
              }
            }
          });
        }

        @Override public void onFailure(Call<T> call, final Throwable t) {
          callbackExecutor.execute(new Runnable() {
            @Override public void run() {
              callback.onFailure(ExecutorCallbackCall.this, t);
            }
          });
        }
      });
    }

   ...//省略部分代码
  }
}
```

可以看到如果我们网络请求接口函数返回值定义的是 Call 的话，那么返回的就是实际返回的就是 `ExecutorCallbackCall` 对象

**本章小结**

可以看到 create 函数主要通过动态代理来实现了调用接口中的函数，首先解析注解数据，然后解析函数返回值，最后根据函数返回值创建对应的实现类。

下一小节就实际介绍调用了

### Retrofit + OKHttp

通过上一小节我们知道 `Call call = api.getWXarticles();` call 其实就是`ExecutorCallbackCall` 对象，那么根据调用

```java
        Call<JsonObject> call = api.getWXarticles();
        call.enqueue(new Callback<JsonObject>() {
            @Override
            public void onResponse(Call<JsonObject> call, retrofit2.Response<JsonObject> response) {
                Log.d(TAG, "Retrofit + OKHttp " + response.body().toString());
            }

            @Override
            public void onFailure(Call<JsonObject> call, Throwable t) {
                Log.d(TAG, "Retrofit + OKHttp " + t.getMessage());
            }
        });
```

我们直接看 ExecutorCallbackCall 的 enqueue 函数

```java
  static final class ExecutorCallbackCall<T> implements Call<T> {
    final Executor callbackExecutor;
    final Call<T> delegate;

    ExecutorCallbackCall(Executor callbackExecutor, Call<T> delegate) {
      this.callbackExecutor = callbackExecutor;
      this.delegate = delegate;
    }

    @Override public void enqueue(final Callback<T> callback) {
      //1. 检查 callBack 是否为空的状态
      checkNotNull(callback, "callback == null");
            //2. 这里的 delegate 其实就是 OKHttpClient 中的 Call
      delegate.enqueue(new Callback<T>() {
        @Override public void onResponse(Call<T> call, final Response<T> response) {
          callbackExecutor.execute(new Runnable() {
            @Override public void run() {
              if (delegate.isCanceled()) {
                // Emulate OkHttp's behavior of throwing/delivering an IOException on cancellation.
                callback.onFailure(ExecutorCallbackCall.this, new IOException("Canceled"));
              } else {
                callback.onResponse(ExecutorCallbackCall.this, response);
              }
            }
          });
        }

        @Override public void onFailure(Call<T> call, final Throwable t) {
          callbackExecutor.execute(new Runnable() {
            @Override public void run() {
              callback.onFailure(ExecutorCallbackCall.this, t);
            }
          });
        }
      });
    }
   ....//省略部分代码 
  }
```

根据上面注释 2 我们知道 delegate 就是 通过上层 HttpServiceMethod invoke 函数传进来的

```java
  @Override final @Nullable ReturnT invoke(Object[] args) {
    Call<ResponseT> call = new OkHttpCall<>(requestFactory, args, callFactory, responseConverter);
    return adapt(call, args);
  }
```

没错就是我们熟悉的 OKHttpCall 对象，那么我们直接看 OkHttpCall.enqueue\(new Callback\(\)\) 函数具体实现

```java
//继承自 OKHttp 中的 Call
final class OkHttpCall<T> implements Call<T> {

  @Override public void enqueue(final Callback<T> callback) {
    checkNotNull(callback, "callback == null");
        //拿到 OKHttp 中的 Call
    okhttp3.Call call;
    Throwable failure;

    synchronized (this) {
      if (executed) throw new IllegalStateException("Already executed.");
      executed = true;

      call = rawCall;
      failure = creationFailure;
      if (call == null && failure == null) {
        try {
          //1. 创建一个 RealCall 对象
          call = rawCall = createRawCall();
        } catch (Throwable t) {
          throwIfFatal(t);
          failure = creationFailure = t;
        }
      }
    }

    if (failure != null) {
      callback.onFailure(this, failure);
      return;
    }

    if (canceled) {
      call.cancel();
    }
        //2. 通过 RealCall 对象执行 enqueue 异步网络请求
    call.enqueue(new okhttp3.Callback() {
      @Override public void onResponse(okhttp3.Call call, okhttp3.Response rawResponse) {
        Response<T> response;
        try {
          response = parseResponse(rawResponse);
        } catch (Throwable e) {
          throwIfFatal(e);
          callFailure(e);
          return;
        }

        try {
          callback.onResponse(OkHttpCall.this, response);
        } catch (Throwable t) {
          throwIfFatal(t);
          t.printStackTrace(); // TODO this is not great
        }
      }

      @Override public void onFailure(okhttp3.Call call, IOException e) {
        callFailure(e);
      }

      private void callFailure(Throwable e) {
        try {
          callback.onFailure(OkHttpCall.this, e);
        } catch (Throwable t) {
          throwIfFatal(t);
          t.printStackTrace(); // TODO this is not great
        }
      }
    });
  } 
}
```

这里主要做了 2 件事儿

1. 创建 OKHttp call 也就是 RealCall 
2. 执行 RealCall enqueue 异步函数

我们看一下注释 1 因为 OKHttp 请求还需要 Request 对象，这里我们还没看见所以，继续在找

```java
  private okhttp3.Call createRawCall() throws IOException {
    //1. 
    okhttp3.Call call = callFactory.newCall(requestFactory.create(args));
    if (call == null) {
      throw new NullPointerException("Call.Factory returned null.");
    }
    return call;
  }
```

通过注释 1 . 我们知道 callFactory.newCall\(requestFactory.create\(args\)\) 返回的是 OKHTTP.call 对象，但是熟悉 OKHTTP 的知道 newCall 中需要传入一个 Request 对象

```java
//OKHttpClient.java
@Override public Call newCall(Request request) {
    return RealCall.newRealCall(this, request, false /* for web socket */);
}
```

所以我们直接看 requestFactory.create\(args\)

```java
//1. 返回一个 Request 对象  
okhttp3.Request create(Object[] args) throws IOException {
    @SuppressWarnings("unchecked") // It is an error to invoke a method with the wrong arg types.
    ParameterHandler<Object>[] handlers = (ParameterHandler<Object>[]) parameterHandlers;

    int argumentCount = args.length;
    if (argumentCount != handlers.length) {
      ...//省略抛异常代码
    }
        //构建一个 Retrofit Request 对象
    RequestBuilder requestBuilder = new RequestBuilder(httpMethod, baseUrl, relativeUrl,
        headers, contentType, hasBody, isFormEncoded, isMultipart);

    if (isKotlinSuspendFunction) {

      argumentCount--;
    }

    List<Object> argumentList = new ArrayList<>(argumentCount);
    for (int p = 0; p < argumentCount; p++) {
      argumentList.add(args[p]);
      handlers[p].apply(requestBuilder, args[p]);
    }
        //2. 
    return requestBuilder.get()
        .tag(Invocation.class, new Invocation(method, argumentList))
        .build();
  }
```

通过上面代码我们知道内部构建了一个 Retrofit 的 Request 对象，最后调用注释 2 代码，我们继续跟

```java
    // requestBuilder.get()
  Request.Builder get() {
    HttpUrl url;
    HttpUrl.Builder urlBuilder = this.urlBuilder;
    if (urlBuilder != null) { //如果 URL 为空 重新构建一个
      url = urlBuilder.build();
    } else {
      //这里正在把 一个连接完整拼接在一起 "https://wanandroid.com/wxarticle/chapters/json"
      url = baseUrl.resolve(relativeUrl);
      if (url == null) {
        throw new IllegalArgumentException(
            "Malformed URL. Base: " + baseUrl + ", Relative: " + relativeUrl);
      }
    }
        //构建请求体
    RequestBody body = this.body;
    if (body == null) {
      // Try to pull from one of the builders.
      if (formBuilder != null) {
        body = formBuilder.build();
      } else if (multipartBuilder != null) {
        body = multipartBuilder.build();
      } else if (hasBody) {
        // Body is absent, make an empty body.
        body = RequestBody.create(null, new byte[0]);
      }
    }
        //构建请求数据类型
    MediaType contentType = this.contentType;
    if (contentType != null) {
      if (body != null) {
        body = new ContentTypeOverridingRequestBody(body, contentType);
      } else {
        headersBuilder.add("Content-Type", contentType.toString());
      }
    }
        //构建一个 Request 对象包含 url,headers,body
    return requestBuilder
        .url(url)
        .headers(headersBuilder.build())
        .method(method, body);
  }
```

这里 get 函数就是 Retrofit Request - &gt; OKHttp Request 的一个过程。

现在 OKHttp Request ,RealCall 对象都有了 就可以执行对应的异步函数，最后回调给调用层数据了。这里如果对 OKHttp 运行机制不了解的可以看根据 **本文章前言** 来进行阅读。

### RxJava + Retrofit + OKHttp

通过 Retrofit create 小节讲解，我们知道 `Observable<JsonObject> observable = api.getWXarticle();` Observable 其实就是 `BodyObservable 它的上游是 CallEnqueueObservable 异步观察者对象` 对象，那么根据调用

```java
                Observable<JsonObject> observable = api.getWXarticle();
                //这里的 observable 就是 BodyObservable 内部持有一个上游 CallEnqueueObservable 被观察者
        observable.subscribeOn(AndroidSchedulers.mainThread())
                .subscribe(new Observer<JsonObject>() {
                    @Override
                    public void onSubscribe(Disposable d) {
                        Log.d(TAG, "RxJava + Retrofit + OKHttp 订阅成功");
                    }

                    @Override
                    public void onNext(JsonObject s) {
                        Log.d(TAG, "RxJava + Retrofit + OKHttp " + s.toString());
                    }

                    @Override
                    public void onError(Throwable e) {
                        Log.d(TAG, "RxJava + Retrofit + OKHttp " + e.getMessage());
                    }

                    @Override
                    public void onComplete() {
                        Log.d(TAG, "RxJava + Retrofit + OKHttp onComplete");
                    }
                });
```

由于这里返回的是 `BodyObservable` 被观察者，那么根据执行流程在`ObservableSubscribeOn.subscribeActual 的 s.onSubscribe(parent);` 函数中订阅成功。根据 RxJava 订阅成功执行流程可以知道下游会往上游走，最后会回调到 `BodyObservable.subscribeActual` 函数中，具体实现如下

```java
  @Override protected void subscribeActual(Observer<? super T> observer) {
    upstream.subscribe(new BodyObserver<T>(observer));
  }
```

根据 RxJava 源码中的调用执行流程这里的 upstream 就是上游 `CallEnqueueObservable` 异步被观察者对象，也直接看它的 `subscribeActual` 函数具体实现

```java
    //CallEnqueueObservable.java
  @Override protected void subscribeActual(Observer<? super Response<T>> observer) {
    // 1. 
    Call<T> call = originalCall.clone();
    //2. 
    CallCallback<T> callback = new CallCallback<>(call, observer);
    //3. 
    observer.onSubscribe(callback);
    if (!callback.isDisposed()) {
      //4. 
      call.enqueue(callback);
    }
  }
```

总结下上面注解意思

1. 拿到 OKhttpCall Call 对象
2. 对 call 和 observer 再次包装
3. 调用下层观察者对象也就是 BodyObserver
4. 最后才是执行 OKHttp 异步网络请求，把封装好的 CallCallback 传给 OKHttpCall 对象

我们直接看 OKHttpCall enqueue 函数具体实现

```java
  @Override public void enqueue(final Callback<T> callback) {
    checkNotNull(callback, "callback == null");

         ...//省略部分代码

    call.enqueue(new okhttp3.Callback() {
      @Override public void onResponse(okhttp3.Call call, okhttp3.Response rawResponse) {
        Response<T> response;
        try {
          response = parseResponse(rawResponse);
        } catch (Throwable e) {
          throwIfFatal(e);
          callFailure(e);
          return;
        }

        try {
          callback.onResponse(OkHttpCall.this, response);
        } catch (Throwable t) {
          throwIfFatal(t);
          t.printStackTrace(); // TODO this is not great
        }
      }

      @Override public void onFailure(okhttp3.Call call, IOException e) {
        callFailure(e);
      }

      private void callFailure(Throwable e) {
        try {
          callback.onFailure(OkHttpCall.this, e);
        } catch (Throwable t) {
          throwIfFatal(t);
          t.printStackTrace(); // TODO this is not great
        }
      }
    });
  }
```

这里看到如果请求成功就直接回调到 `OKhttp.callback.onResponse` 中然后回调给 CallCallback 的 onResponse 函数，下面是具体实现

```java
    @Override public void onResponse(Call<T> call, Response<T> response) {
      if (disposed) return;

      try {
        observer.onNext(response);

        if (!disposed) {
          terminated = true;
          observer.onComplete();
        }
      } catch (Throwable t) {
        Exceptions.throwIfFatal(t);
        if (terminated) {
          RxJavaPlugins.onError(t);
        } else if (!disposed) {
          try {
            observer.onError(t);
          } catch (Throwable inner) {
            Exceptions.throwIfFatal(inner);
            RxJavaPlugins.onError(new CompositeException(t, inner));
          }
        }
      }
    }
```

通过 `observer.onNext(response);` 一层传一层最后传递到 `ObservableSubscribeOn#SubscribeOnObserver.onNext()`函数中到这里整个请求算是完成了。

## 总结

到这里 Retrofit 网络请求的源码已经分析完了 ，其中包括 Retrofit + OKHttp ，RxJava + Retrofit + OKHttp 相互之间怎么配合网络请求，也都进行讲解了一遍。建议在学习 Retrofit 网络请求之前，一定要知道 OKHttp 和 RxJava 的基本原理，不然 Retrofit 是看不下去的。

## 参考

[从动态代理角度看Retrofit，这才是Retrofit的精髓！](https://mp.weixin.qq.com/s/_UqjC-fuDptjJCRvDsDlwQ)

