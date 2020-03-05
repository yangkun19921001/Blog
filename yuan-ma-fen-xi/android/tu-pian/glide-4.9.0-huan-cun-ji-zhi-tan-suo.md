# Glide 4.9.0 缓存机制探索

## 介绍

在上一篇中，我们知道了 Glide 框架的最基本的执行流程，那么只知道基本执行流程，这显然是不够的，我们要深挖 Glide 框架的细节处理原理，比如缓存机制，图片处理等，这一篇我们就一起去探索 Glide 的缓存机制。

Glide 缓存机制可以说是设计的非常完美，考虑的非常周全，下面就以一张表格来说明下 Glide 缓存。

| 缓存类型 | 缓存代表 | 说明 |
| :--- | :--- | :--- |
| 活动缓存 | ActiveResources | 如果当前对应的图片资源是从内存缓存中获取的，那么会将这个图片存储到活动资源中。 |
| 内存缓存 | LruResourceCache | 图片解析完成并最近最近被加载过，则放入内存中 |
| 磁盘缓存-资源类型 | DiskLruCacheWrapper | 被解码后的图片写入磁盘文件中 |
| 磁盘缓存-原始数据 | DiskLruCacheWrapper | 网络请求成功后将原始数据在磁盘中缓存 |

如果对 Glide 执行流程不明白的可以先看 [Android 图片加载框架 Glide 4.9.0 \(一\) 从源码的角度分析一次最简单的执行流程](https://juejin.im/post/5d89e9c051882509662c5620)

在介绍缓存原理之前，先来看一张加载缓存执行顺序，先有个印象。

[![uZ8gmR.png](https://s2.ax1x.com/2019/09/25/uZ8gmR.png)](https://imgchr.com/i/uZ8gmR)

## 缓存 key 生成

不管是内存缓存还是磁盘缓存，存储的时候肯定需要一个唯一 key 值，那么 Glide cache key 是怎么生成的？通过上一篇源码加载流程介绍，我们知道在 Engine 的 load 函数中进行对 key 的生成。下面我们就通过代码来看一下。

```java
public class Engine implements EngineJobListener,
    MemoryCache.ResourceRemovedListener,
    EngineResource.ResourceListener {

      ...

public synchronized <R> LoadStatus load(
      GlideContext glideContext,
      Object model,
      Key signature,
      int width,
      int height,
      Class<?> resourceClass,
      Class<R> transcodeClass,
      Priority priority,
      DiskCacheStrategy diskCacheStrategy,
      Map<Class<?>, Transformation<?>> transformations,
      boolean isTransformationRequired,
      boolean isScaleOnlyOrNoTransform,
      Options options,
      boolean isMemoryCacheable,
      boolean useUnlimitedSourceExecutorPool,
      boolean useAnimationPool,
      boolean onlyRetrieveFromCache,
      ResourceCallback cb,
      Executor callbackExecutor) {
       ....
     //1. 生成缓存唯一 key 值，model 就是图片地址
     EngineKey key = keyFactory.buildKey(model, signature, width, height, transformations,
        resourceClass, transcodeClass, options);  

       ....

      }
      ...     
    }

    //生成 key
  EngineKey buildKey(Object model, Key signature, int width, int height,
      Map<Class<?>, Transformation<?>> transformations, Class<?> resourceClass,
      Class<?> transcodeClass, Options options) {
    return new EngineKey(model, signature, width, height, transformations, resourceClass,
        transcodeClass, options);
  }
```

```java
class EngineKey implements Key {
 ...

   @Override
  public boolean equals(Object o) {
    if (o instanceof EngineKey) {
      EngineKey other = (EngineKey) o;
      return model.equals(other.model)
          && signature.equals(other.signature)
          && height == other.height
          && width == other.width
          && transformations.equals(other.transformations)
          && resourceClass.equals(other.resourceClass)
          && transcodeClass.equals(other.transcodeClass)
          && options.equals(other.options);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashCode == 0) {
      hashCode = model.hashCode();
      hashCode = 31 * hashCode + signature.hashCode();
      hashCode = 31 * hashCode + width;
      hashCode = 31 * hashCode + height;
      hashCode = 31 * hashCode + transformations.hashCode();
      hashCode = 31 * hashCode + resourceClass.hashCode();
      hashCode = 31 * hashCode + transcodeClass.hashCode();
      hashCode = 31 * hashCode + options.hashCode();
    }
    return hashCode;
  }

 ...

}
```

根据注释和代码可以看到传入的参数之多，主要是根据 url ，签名，宽高等，其内部重写了 hashCode，equals，来保证对象的唯一性。

## 内存缓存

通过下面代码开启内存缓存，当然 Glide 默认是为我们开启了内存缓存所以不需要我们调用 skipMemoryCache

```java
//在 BaseRequestOptions 成员变量中默认为内存缓存开启。
private boolean isCacheable = true;

//调用层调用
Glide.
      with(MainActivity.this.getApplication()).
      //开启使用内存缓存
      skipMemoryCache(true).
      into(imageView);
```

现在缓存 key 有了之后，就可以根据 key 拿到对应的缓存了，通过文章开始的介绍，我们知道先加载活动缓存，如果活动缓存没有在加载内存缓存，先看下代码；

```java
public class Engine implements EngineJobListener,
    MemoryCache.ResourceRemovedListener,
    EngineResource.ResourceListener {

      ...

public synchronized <R> LoadStatus load(
      ....//参数
      ) {
       ....
     //1. 生成缓存唯一 key 值，model 就是图片地址
     EngineKey key = keyFactory.buildKey(model, signature, width, height, transformations,
        resourceClass, transcodeClass, options);  

     //2. 优先加载内存中的活动缓存 - ActiveResources
    EngineResource<?> active = loadFromActiveResources(key, isMemoryCacheable);
    if (active != null) {
      cb.onResourceReady(active, DataSource.MEMORY_CACHE);
      if (VERBOSE_IS_LOGGABLE) {
        logWithTimeAndKey("Loaded resource from active resources", startTime, key);
      }
      return null;
    }

       //3. 如果活动缓存中没有，就加载 LRU 内存缓存中的资源数据。
    EngineResource<?> cached = loadFromCache(key, isMemoryCacheable);
    if (cached != null) {
      cb.onResourceReady(cached, DataSource.MEMORY_CACHE);
      if (VERBOSE_IS_LOGGABLE) {
        logWithTimeAndKey("Loaded resource from cache", startTime, key);
      }
      return null;
    }

      ...     

    }
```

### Glide 为什么会设计 2 个内存缓存

不知道大家通过上面代码跟注释\(2，3 \) , 有没有发现为什么 Glide 会弄 2 个内存缓存（一个 Map + 弱引用，一个 LRU 内存缓存），大家有没有想过为什么？在看 [郭霖大神对 Glide 缓存机制分析](https://blog.csdn.net/guolin_blog/article/details/54895665) 中说道， `ActiveResources 就是一个弱引用的 HashMap ，用来缓存正在使用中的图片,使用 ActiveResources 来缓存正在使用中的图片，可以保护这些图片不会被 LruCache 算法回收掉` ，起初当我看见这句话的时候，我是真的很不理解，因为 Lru 是最近最少时候才会回收尾端数据，那么这里的 `ActiveResources 来缓存正在使用中的图片，可以保护这些图片不会被 LruCache 算法回收掉` ，我是越想越觉得矛盾，后来中午吃饭的时候，灵光一闪突然想到了一种情况，我也不知道是不是这样，先看下面一张图。

![uZdRJI.png](https://s2.ax1x.com/2019/09/25/uZdRJI.png)

**详细举例说明：**比如我们 Lru 内存缓存 size 设置装 99 张图片，在滑动 RecycleView 的时候，如果刚刚滑动到 100 张，那么就会回收掉我们已经加载出来的第一张，这个时候如果返回滑动到第一张，会重新判断是否有内存缓存，如果没有就会重新开一个 Request 请求，很明显这里如果清理掉了第一张图片并不是我们要的效果。所以在从内存缓存中拿到资源数据的时候就主动添加到活动资源中，并且清理掉内存缓存中的资源。这么做很显然好处是 `保护不想被回收掉的图片不被 LruCache 算法回收掉,充分利用了资源。` 我也不知道这样理解是否正确，希望如果有其它的含义，麻烦告知一下，谢谢 ！

上面我们说到了 Glide 为什么会设计 2 个内存缓存，下面我们就对这 2 个缓存的 存/取/删 来具体说明下。

### ActiveResources 活动资源

**获取活动资源**

通过之前的介绍我们知道，活动缓存是在`Engine load`中获取

```java
public synchronized <R> LoadStatus load(
      ....//参数
      ) {

     //1. 优先加载内存中的活动缓存 - ActiveResources
    EngineResource<?> active = loadFromActiveResources(key, isMemoryCacheable);
    if (active != null) {
      // 如果找到获取资源，就返回上层
      cb.onResourceReady(active, DataSource.MEMORY_CACHE);
      return null;
    }       
      ...     

    }


  @Nullable
  private EngineResource<?> loadFromActiveResources(Key key, boolean isMemoryCacheable) {
    if (!isMemoryCacheable) {
      return null;
    }
         // 通过 活动资源的 get 函数拿到活动资源的缓存
    EngineResource<?> active = activeResources.get(key);
    if (active != null) {
      //正在使用，引用计数 +1
      active.acquire();
    }

    return active;
  }
```

继续看 get 的具体实现

```java
final class ActiveResources {

  //
  @VisibleForTesting
  final Map<Key, ResourceWeakReference> activeEngineResources = new HashMap<>();
  private final ReferenceQueue<EngineResource<?>> resourceReferenceQueue = new ReferenceQueue<>();

  ...

  //外部调用 get 函数拿到活动资源缓存
  @Nullable
  synchronized EngineResource<?> get(Key key) {
    //通过 HashMap + WeakReference 的存储结构
    //通过 HashMap 的 get 函数拿到活动缓存
    ResourceWeakReference activeRef = activeEngineResources.get(key);
    if (activeRef == null) {
      return null;
    }

    EngineResource<?> active = activeRef.get();
    if (active == null) {
      cleanupActiveReference(activeRef);
    }
    return active;
  }

  //继承 WeakReference 弱引用，避免内存泄漏。
    @VisibleForTesting
  static final class ResourceWeakReference extends WeakReference<EngineResource<?>> {
  ....
}
```

通过上面代码我们知道活动缓存是 Map + WeakReference 来进行维护的，这样做的好处是避免图片资源内存泄漏。

**存储活动资源**

通过文章开头表格中提到，活动资源是加载内存资源之后存储的，那么我们就来看下何时加载内存资源，看下面代码。

还是在`Engine load`函数中

```java
        //1. 如果活动缓存中没有，就加载 LRU 内存缓存中的资源数据。
    EngineResource<?> cached = loadFromCache(key, isMemoryCacheable);
    if (cached != null) {
      cb.onResourceReady(cached, DataSource.MEMORY_CACHE);
      if (VERBOSE_IS_LOGGABLE) {
        logWithTimeAndKey("Loaded resource from cache", startTime, key);
      }
      return null;
    }

    // 加载内存中图片资源
  private EngineResource<?> loadFromCache(Key key, boolean isMemoryCacheable) {
    if (!isMemoryCacheable) {
      return null;
    }
        //2. 拿到内存缓存，内部将当前的 key 缓存 remove 了
    EngineResource<?> cached = getEngineResourceFromCache(key);
    if (cached != null) {
      // 3. 如果内存缓存不为空，则引用计数器 +1
      cached.acquire();
      //4. 添加进活动缓存中
      activeResources.activate(key, cached);
    }
    return cached;
  }
```

通过注释 4 ，我们知道在拿到内存缓存的时候，先将内存缓存的当前 key 删除了，然后添加到活动缓存中。

**清理活动资源**

通过上一篇 [Android 图片加载框架 Glide 4.9.0 \(一\) 从源码的角度分析一次最简单的执行流程](https://juejin.im/post/5d89e9c051882509662c5620) 中得知，我们是在`EngineJob`中发出的通知回调，告知`Engine onResourceReleased`来删除 活动资源。下面我们在回顾一下执行流程，那么我们就从 EngineJob 发出通知开始看吧:

```java
class EngineJob<R> implements DecodeJob.Callback<R>,
    Poolable {

      ....

@Override
  public void onResourceReady(Resource<R> resource, DataSource dataSource) {
    synchronized (this) {
      this.resource = resource;
      this.dataSource = dataSource;
    }
    notifyCallbacksOfResult();
  }


  @Synthetic
  void notifyCallbacksOfResult() {
          .....

    //回调上层 Engine 任务完成了
    listener.onEngineJobComplete(this, localKey, localResource);

    //遍历资源回调给 ImageViewTarget ,并显示
    for (final ResourceCallbackAndExecutor entry : copy) {
      entry.executor.execute(new CallResourceReady(entry.cb));
    }
    //这里是通知发出上层删除活动资源数据
    decrementPendingCallbacks();
  }


 ....

    }

    //重要的就是这里了
  @Synthetic
  synchronized void decrementPendingCallbacks() {
    if (decremented == 0) {
      if (engineResource != null) {
                //如果不为空，那么就调用内部 release 函数
                engineResource.release();
      }
    }
  }
```

看一下 EngineResource 的 release 函数

```java
class EngineResource<Z> implements Resource<Z> {
  ...


    void release() {
    synchronized (listener) {
      synchronized (this) {
        if (acquired <= 0) {
          throw new IllegalStateException("Cannot release a recycled or not yet acquired resource");
        }
        //这里每次调用一次 release 内部引用计数法就会减一，到没有引用也就是为 0 的时候 ，就会通知上层
        if (--acquired == 0) {
          //回调出去，Engine 来接收
          listener.onResourceReleased(key, this);
        }
      }
    }
  }

  ...

}
```

根据注释，我们知道这里用了引用计数法，有点像 GC 回收的 引用计数法的影子。也就是说，当完全没有使用这样图片的时候，就会把活动资源清理掉，接着往下看，会调用 Engine 的 onResourceReleased 函数。

```java
public class Engine implements EngineJobListener,
    MemoryCache.ResourceRemovedListener,
    EngineResource.ResourceListener {

   。。。

  //接收来自 EngineResource 的调用回调
  @Override
  public synchronized void onResourceReleased(Key cacheKey, EngineResource<?> resource) {
   //1. 收到当前图片没有引用，清理图片资源
    activeResources.deactivate(cacheKey);
   //2. 如果开启了内存缓存
    if (resource.isCacheable()) {
      //3. 将缓存存储到内存缓存中。
      cache.put(cacheKey, resource);
    } else {
      resourceRecycler.recycle(resource);
    }
  }
  。。。
    }
```

通过上面注释 1 可以知道，这里首先会将缓存图片从 activeResources 中移除，然后再将它 put 到 LruResourceCache 内存缓存当中。这样也就实现了正在使用中的图片使用弱引用来进行缓存，不在使用中的图片使用 LruCache 来进行缓存的功能，设计的真的很巧妙。

### LruResourceCache 内存资源

**获取内存资源**

不知道有没有小伙伴注意到，其实在讲活动资源存储的时候已经涉及到了内存缓存的存储，下面我们在来看一下，具体代码如下:

```java
public class Engine implements EngineJobListener,
    MemoryCache.ResourceRemovedListener,
    EngineResource.ResourceListener {

    ...//忽略一些成员变量跟构造函数
     public synchronized <R> LoadStatus load(
    ...//忽略参数
    ) {   

    ....
        //1. 加载内存缓存
    EngineResource<?> cached = loadFromCache(key, isMemoryCacheable);
    if (cached != null) {
      //如果内存缓存中有，就通知上层，最后在 SingleRequest 接收
      cb.onResourceReady(cached, DataSource.MEMORY_CACHE);
      if (VERBOSE_IS_LOGGABLE) {
        logWithTimeAndKey("Loaded resource from cache", startTime, key);
      }
      return null;
    }

    }

    ...
 }

  private EngineResource<?> loadFromCache(Key key, boolean isMemoryCacheable) {
    if (!isMemoryCacheable) {
      return null;
    }
        //2. 通过 getEngineResourceFromCache 获取内存资源
    EngineResource<?> cached = getEngineResourceFromCache(key);
    if (cached != null) {//如果内存资源存在
      //则引用计数 +1
      cached.acquire();
      //3. 将内存资源存入活动资源
      activeResources.activate(key, cached);
    }
    return cached;
  }


  private EngineResource<?> getEngineResourceFromCache(Key key) {
    //通过 Engine load 中传参可知，cache 就是 Lru 内存资源缓存
    //2.1 这里是通过 remove 删除来拿到缓存资源
    Resource<?> cached = cache.remove(key);
    final EngineResource<?> result;
    if (cached == null) {
      result = null;
    } else if (cached instanceof EngineResource) {
      result = (EngineResource<?>) cached;
    } else {
      result = new EngineResource<>(cached, true /*isMemoryCacheable*/, true /*isRecyclable*/);
    }
    return result;
  }
```

通过注释1得知，这里是开始加载内存缓存中的资源；

通过注释2.1 可知，这里通过 Lru 内存缓存的 remove 来拿到内存缓存

最后将内存存储到活动缓存中，并缓存当前找到的内存缓存。

这里的活动缓存跟内存缓存紧密联系在一起，环环相扣，就像之前我们的疑问，为什么 Glide 会设计 2 个内存缓存的原因了。

**存储内存资源**

通过 EngineResource 的引用计数法机制 release 函数，只要没有引用那么就回调，请看下面代码：

```java
class EngineJob<R> implements DecodeJob.Callback<R>,
    Poolable {

      ....

@Override
  public void onResourceReady(Resource<R> resource, DataSource dataSource) {
    synchronized (this) {
      this.resource = resource;
      this.dataSource = dataSource;
    }
    notifyCallbacksOfResult();
  }


  @Synthetic
  void notifyCallbacksOfResult() {
          .....

    //这里是通知发出上层删除活动资源数据
    decrementPendingCallbacks();
  }  

 ....

    }

    //重要的就是这里了
  @Synthetic
  synchronized void decrementPendingCallbacks() {
    if (decremented == 0) {
      if (engineResource != null) {
                //如果不为空，那么就调用内部 release 函数
                engineResource.release();
      }
    }
  }

  void release() {
    synchronized (listener) {
      synchronized (this) {
        //引用计数为 0 的时候，回调。
        if (--acquired == 0) {
          listener.onResourceReleased(key, this);
        }
      }
    }
  }
```

最后会回调到 `Engine 的 onResourceReleased` 函数：

```java
  @Override
  public synchronized void onResourceReleased(Key cacheKey, EngineResource<?> resource) {
    //1. 清理活动缓存
    activeResources.deactivate(cacheKey);
    //如果开启了内存缓存
    if (resource.isCacheable()) {
      //2. 清理出来的活动资源，添加进内存缓存
      cache.put(cacheKey, resource);
    } else {
      resourceRecycler.recycle(resource);
    }
  }
```

到了这里我们知道，在清理活动缓存的时候添加进了内存缓存。

**清理内存缓存**

这里的清理是在获取内存缓存的时候通过 remove 清理掉的，详细可以看内存缓存获取的方式。

### 内存缓存小结

通过上面分析可知，内存缓存有活动缓存和内存资源缓存，下面看一个图来总结下它们相互之间是怎么配合交换数据的。

![&#x5185;&#x5B58;&#x7F13;&#x5B58;&#x52A0;&#x8F7D;&#x673A;&#x5236;](http://tva1.sinaimg.cn/large/007X8olVly1g7cqwelcfej30u00uv49z.jpg)

总结下步骤:

1. 第一次加载没有获取到活动缓存。
2. 接着加载内存资源缓存，先清理掉内存缓存，在添加进行活动缓存。
3. 第二次加载活动缓存已经存在。
4. 当前图片引用为 0 的时候，清理活动资源，并且添加进内存资源。
5. 又回到了第一步，然后就这样环环相扣。

## 磁盘缓存

在介绍磁盘缓存之前先看一张表格

| 缓存表示 | 说明 |
| :--- | :--- |
| DiskCacheStrategy.NONE | 表示不开启磁盘缓存 |
| DiskCacheStrategy.RESOURCE | 表示只缓存转换之后的图片。 |
| DiskCacheStrategy.ALL | 表示既缓存原始图片，也缓存转换过后的图片。 |
| DiskCacheStrategy.DATA | 表示只缓存原始图片 |
| DiskCacheStrategy.AUTOMATIC | 根据数据源自动选择磁盘缓存策略（默认选择） |

上面这 4 中参数其实很好理解，这里有一个概念需要记住，就是当我们使用 Glide 去加载一张图片的时候，Glide 默认并不会将原始图片展示出来，而是会对图片进行压缩和转换，总之就是经过种种一系列操作之后得到的图片，就叫转换过后的图片。而 Glide 默认情况下在硬盘缓存的就是 `DiskCacheStrategy.AUTOMATIC`

以下面的代码来开启磁盘缓存:

```java
Glide.
      with(MainActivity.this.getApplication()).
      //使用磁盘资源缓存功能
      diskCacheStrategy(DiskCacheStrategy.RESOURCE).
      into(imageView);
```

知道了怎么开启，下面我们就来看一下磁盘缓存的的加载与存储。

这 2 个加载流程几乎一模一样，只是加载的数据源不同，下面我们具体来看一下

### DiskCacheStrategy.RESOURCE 资源类型

**获取资源数据**

通过上一篇[Glide 加载流程](https://juejin.im/post/5d89e9c051882509662c5620) 我们知道，如果在活动缓存、内存缓存中没有找数据，那么就重新开启一个 GlideExecutor 线程池在 DecodeJob run 执行新的请求，下面我们就直接来看 DecodeJob run 函数，跟着它去找 资源数据的加载:

```java
class DecodeJob<R> implements DataFetcherGenerator.FetcherReadyCallback,
    Runnable,
    Comparable<DecodeJob<?>>,
    Poolable {

   ...

   @Override
  public void run() {
     ...
    try {
      //如果取消就通知加载失败
      if (isCancelled) {
        notifyFailed();
        return;
      }
      //1. 执行runWrapped
      runWrapped();
    } catch (CallbackException e) {
    ...
    }
  }
   ... 
 }

  private void runWrapped() {
    switch (runReason) {
      case INITIALIZE:
        //2. 找到执行的状态
        stage = getNextStage(Stage.INITIALIZE);
        //3. 找到具体执行器
        currentGenerator = getNextGenerator();
        //4. 开始执行
        runGenerators();
        break;
     ...
    }
  }
  private DataFetcherGenerator getNextGenerator() {
    switch (stage) {
      case RESOURCE_CACHE: //3.1解码后的资源执行器
        return new ResourceCacheGenerator(decodeHelper, this);
      case DATA_CACHE://原始数据执行器
        return new DataCacheGenerator(decodeHelper, this);
      case SOURCE://新的请求，http 执行器
        return new SourceGenerator(decodeHelper, this);
      case FINISHED:
        return null;
      default:
        throw new IllegalStateException("Unrecognized stage: " + stage);
    }
  }
```

通过上面分析的代码跟注释，我们知道这里是在找具体的执行器，找完了之后注释 4 开始执行，现在我们直接看注释 4。先提一下 注释 3.1 因为外部我们配置的是 RESOURCE 磁盘资源缓存策略，所以直接找到的是 `ResourceCacheGenerator` 执行器。

```java
  private void runGenerators() {
    //如果当前任务没有取消，执行器不为空，那么就执行 currentGenerator.startNext() 函数
    while (!isCancelled && currentGenerator != null
        && !(isStarted = currentGenerator.startNext())) {
      stage = getNextStage(stage);
      currentGenerator = getNextGenerator();
      if (stage == Stage.SOURCE) {
        reschedule();
        return;
      }
    }
    ..
  }
```

通过上面代码可知，主要是执行 `currentGenerator.startNext()` 就句代码，currentGerator 是一个接口，通过注释 3.1 我们知道这里它的实现类是 `ResourceCacheGenerator` ,那么我们具体看下 `ResourceCacheGenerator` 的 startNext 函数；

```java
class ResourceCacheGenerator implements DataFetcherGenerator,
    DataFetcher.DataCallback<Object> {

    ...

      @Override
  public boolean startNext() {

    ...

    while (modelLoaders == null || !hasNextModelLoader()) {
      resourceClassIndex++;

      ...
      //1. 拿到资源缓存 key
      currentKey =
          new ResourceCacheKey(// NOPMD AvoidInstantiatingObjectsInLoops
              helper.getArrayPool(),
              sourceId,
              helper.getSignature(),
              helper.getWidth(),
              helper.getHeight(),
              transformation,
              resourceClass,
              helper.getOptions());
      //2. 通过 key 获取到资源缓存
      cacheFile = helper.getDiskCache().get(currentKey);
      if (cacheFile != null) {
        sourceKey = sourceId;
        modelLoaders = helper.getModelLoaders(cacheFile);
        modelLoaderIndex = 0;
      }
    }

        loadData = null;
    boolean started = false;
    while (!started && hasNextModelLoader()) {
      //3. 获取一个数据加载器
      ModelLoader<File, ?> modelLoader = modelLoaders.get(modelLoaderIndex++);
      //3.1 为资源缓存文件，构建一个加载器，这是构建出来的是 ByteBufferFileLoader 的内部类 ByteBufferFetcher
      loadData = modelLoader.buildLoadData(cacheFile,
          helper.getWidth(), helper.getHeight(), helper.getOptions());
      if (loadData != null && helper.hasLoadPath(loadData.fetcher.getDataClass())) {
        started = true;
        //3.2 利用 ByteBufferFetcher 加载，最后把结果会通过回调给 DecodeJob 的 onDataFetcherReady 函数
        loadData.fetcher.loadData(helper.getPriority(), this);
      }
    }

    ...


    }
```

通过上面注释可以得到几点信息

1. 首先根据 资源 ID 等一些信息拿到资源缓存 Key
2. 通过 key 拿到缓存文件
3. 构建一个 ByteBufferFetcher 加载缓存文件
4. 加载完成之后回调到 DecodeJob 中。

**存储资源数据**

先来看下面一段代码:

```java
class DecodeJob<R> implements DataFetcherGenerator.FetcherReadyCallback,
    Runnable,
    Comparable<DecodeJob<?>>,
    Poolable {

    ...


     private void notifyEncodeAndRelease(Resource<R> resource, DataSource dataSource) {

      ....

    stage = Stage.ENCODE;
    try {
      //1. 是否可以将转换后的图片缓存
      if (deferredEncodeManager.hasResourceToEncode()) {
        //1.1 缓存入口
        deferredEncodeManager.encode(diskCacheProvider, options);
      }
    } finally {
        ...
    }
    onEncodeComplete();
  }     
    }

    void encode(DiskCacheProvider diskCacheProvider, Options options) {
      GlideTrace.beginSection("DecodeJob.encode");
      try {
        //1.2 将 Bitmap 缓存到资源磁盘
        diskCacheProvider.getDiskCache().put(key,
            new DataCacheWriter<>(encoder, toEncode, options));
      } finally {
        toEncode.unlock();
        GlideTrace.endSection();
      }
    }
```

通过上面我们知道 http 请求到图片输入流之后经过一系列处理，转换得到目标 Bitmap 资源，最后通过回调到 DecodeJob 进行缓存起来。

**清理资源缓存**

1. 用户主动通过系统来清理
2. 卸载软件
3. 调用 DisCache.clear\(\);

### DiskCacheStrategy.DATA 原始数据类型

**获取原始数据**

参考上小节`DiskCacheStrategy.RESOURCE` 获取资源，不同的是把 ResourceCacheGenerator 换成 DataCacheGenerator 加载了。

**存储原始数据**

这里既然存的是原始数据那么我们直接从 http 请求之后的响应数据开始查看，通过上一篇我们知道是在 HttpUrlFetcher 中请求网络，直接定位到目的地：

```java
public class HttpUrlFetcher implements DataFetcher<InputStream> {

    @Override
  public void loadData(@NonNull Priority priority,
      @NonNull DataCallback<? super InputStream> callback) {
    long startTime = LogTime.getLogTime();
    try {
      //1. 通过 loadDataWithRedirects 来进行http 请求，返回 InputStream
      InputStream result = loadDataWithRedirects(glideUrl.toURL(), 0, null, glideUrl.getHeaders());
      //2. 将请求之后的数据返回出去
      callback.onDataReady(result);
    } catch (IOException e) {
          ...
    } finally {
            ...
    }
  }
}
```

根据注释可以得知，这里主要用于网络请求，请求响应数据回调给 MultiModelLoader 中。我们看下 它具体实现：

```java
class MultiModelLoader<Model, Data> implements ModelLoader<Model, Data> {  
  ...
@Override
    public void onDataReady(@Nullable Data data) {
    //如果数据不为空，那么就回调给 SourceGenerator
      if (data != null) {
        callback.onDataReady(data);
      } else {
        startNextOrFail();
      }
    }
 .... 
}
```

这里的 callback 指的是 SourceGenerator ，继续跟

```java
class SourceGenerator implements DataFetcherGenerator,
    DataFetcher.DataCallback<Object>,
    DataFetcherGenerator.FetcherReadyCallback {
    ....



      @Override
  public void onDataReady(Object data) {
    DiskCacheStrategy diskCacheStrategy = helper.getDiskCacheStrategy();
    if (data != null && diskCacheStrategy.isDataCacheable(loadData.fetcher.getDataSource())) {
      //1. 收到网络下载好的图片原始数据，赋值给成员变量 dataToCache
      dataToCache = data;
      //2. 交给 EngineJob 
      cb.reschedule();
    } else {
      cb.onDataFetcherReady(loadData.sourceKey, data, loadData.fetcher,
          loadData.fetcher.getDataSource(), originalKey);
    }
  }      
   ....       
    }
```

通过上面注释可以知道 cb.reschedule\(\); 最后回调到 EngineJob 类，会执行 reschedule\(DecodeJob&lt;?&gt; job\) 函数的 getActiveSourceExecutor\(\).execute\(job\); 用线程池执行任务，最后又回到了 DecodeJob 的 run 函数 拿到执行器`DataCacheGenerator` ,最终会在 SourceGenerator 的 startNext\(\) 函数，之前流程代码我就不贴了，上面讲了很多次了，相信大家应该记得了，我们直接看 startNext\(\) 函数吧：

```java
class SourceGenerator implements DataFetcherGenerator,
    DataFetcher.DataCallback<Object>,
    DataFetcherGenerator.FetcherReadyCallback {

  /**这个临时的变量就是 http 请求回来的图片原始数据
  */
  private Object dataToCache;


@Override
  public boolean startNext() {
   ....

    if (dataToCache != null) {
      Object data = dataToCache;
      dataToCache = null;
      //放入缓存
      cacheData(data);
    }

    ...
    }
    return started;
  }


  private void cacheData(Object dataToCache) {
    long startTime = LogTime.getLogTime();
    try {
      Encoder<Object> encoder = helper.getSourceEncoder(dataToCache);

      DataCacheWriter<Object> writer =
          new DataCacheWriter<>(encoder, dataToCache, helper.getOptions());
      originalKey = new DataCacheKey(loadData.sourceKey, helper.getSignature());
      //存储原始数据
      //通过 StreamEncoder encode 写入文件
      helper.getDiskCache().put(originalKey, writer);

    } finally {
      loadData.fetcher.cleanup();
    }

    sourceCacheGenerator =
        new DataCacheGenerator(Collections.singletonList(loadData.sourceKey), helper, this);
  }
```

通过上面代码得知，这里将原始数据写入文件中了。

**清理资源缓存**

1. 用户主动通过系统来清理
2. 卸载软件
3. 调用 DisCache.clear\(\);

### 磁盘缓存小节

存储

1. 资源缓存是在把图片转换完之后才缓存；
2. 原始数据是网络请求成功之后就写入缓存；

获取

1. 资源缓存跟原始数据都是在 GlideExecutor 线程池中，Decodejob 中检查获取数据。

这里我们看一张流程图吧

![](http://tva1.sinaimg.cn/large/007X8olVly1g7czr96t5oj30u013xjzt.jpg)

## 复用池

Glide 中复用池也起了一个很大的作用，这里我就不贴代码了，因为这个很好理解，大家可以去 Glide 中的 Downsample 详细了解。在这里我就简单说一下 Glide 中复用池的处理。

在 Glide 中，在每次解析一张图片为 Bitmap 的时候不管是内存缓存还是磁盘缓存，都会从其BitmapPool 中查找一个可被复用的 Bitmap ，之后在将此块的内存缓存起来。

注意:`在使用复用池的时候，如果存在能被复用的图片会重复使用该图片的内存。 所以复用并不能减少程序正在使用的内存大小。Bitmap 复用，解决的是减少频繁申请内存带来的性能(抖动、碎片)问题。`

## 总结

可以看到 Glide 在性能优化方面可谓是达到了极致，不光设计了多级复杂的缓存策略，就连开销较大的 Bitmap 内存也利用了复用池进行了管理，所以就算用户在没有开启所有缓存的情况下， Bitmap 也保证了内存的合理使用，避免 OOM。尽可能的减少了对象的创建开销，保证了 Glide 加载的流畅性。

到这里 Glide 4.9.0 版本的缓存机制也已经讲完了，相信在看完之后，你将对 Glide 缓存机制有了一定了解。

感谢你的阅读，文章中如有误，还请指出，谢谢！

## 参考

* [郭霖大神的 Glide 源码分析](https://blog.csdn.net/sinyu890807/article/category/9268670)

