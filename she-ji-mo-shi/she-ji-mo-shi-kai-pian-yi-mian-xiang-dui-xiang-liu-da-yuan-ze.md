# 设计模式开篇 \(一\) 面向对象六大原则

## 面向对象的六大原则

或许有的掘友们发现了，在阅读 Android 系统底层源码或者开源框架源码时，发现内部大量的设计模式，如果你对设计模式不懂的话，那么阅读源码真的是寸步难行。那么这篇文章我们先来学习面向对象的六大原则，设计模式大概 23 种，后面我们一步一步来学习它。

### 单一职责原则

单一职责原则的英文名称是 Single Responsibility Principle ，缩写是 SRP 。 SRP 的定义是：就一个类而言，应该仅有一个引起变化的原因。简单的来说，就是一个类中应该是一组相关性很高的函数、数据的封装。单一职责的划分界限也并不是那么的清晰，很多时候都是靠个人经验来给定界限，当然，最大的的问题就是对职责的定义，什么是类的职责，以及怎么划分类的职责。

下面我们就以 `图片加载库` 的例子代码来对类的职责简单说明下，在设计一个图片加载库之前，我们需要先大概画下 UML 类图，有了 UML 图之后写代码就能更加的清晰。

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g6dj0xak89j30yt0ksq3x.jpg)

从上面 UML 类图可以看出 ImageLoader 只负责加载图片，MemoryCache 实现 IImageCache 负责往内存中存/取缓存，到这里也许有的同学对单一职责有了一定概念了，相信看完下面的代码，你已经对单一职责掌握了，好了上代码

```java
public class ImageLoader {


    /**
     * 内存缓存
     */
    private IImageCache mMemoryCache;

    /**
     * 线程池
     */
    private ExecutorService mExecutorService;

    /**
     * 主线程管理
     */
    private Handler mHandler = new Handler(Looper.getMainLooper());

    private static ImageLoader instance;

    public static ImageLoader getInstance() {
        if (instance == null)
            instance = new ImageLoader();

        return instance;
    }

    public ImageLoader() {
        mMemoryCache = new MemoryCache();
        //线程池，线程数据量为 CPU 的数量
        mExecutorService = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());
    }

    /**
     * 加载图片
     */
    public void loadImage(final String url, final ImageView imageView) {
        Bitmap bitmap = mMemoryCache.get(url);
        if (bitmap != null) {
            imageView.setImageBitmap(bitmap);
            return;
        }

        imageView.setTag(url);

        //如果内存缓存中没有图片，就开启网络请求去下载
        mExecutorService.submit(new Runnable() {
            @Override
            public void run() {
                Bitmap downBitmap = downloadImage(url);
                if (downBitmap == null) return;
                if (imageView.getTag().equals(url)) {
                    displayImage(downBitmap, imageView);
                }
                //将图片缓存
                mMemoryCache.put(url, downBitmap);
            }
        });

    }

    /**
     * 显示图片
     *
     * @param downBitmap
     * @param imageView
     */
    private void displayImage(final Bitmap downBitmap, final ImageView imageView) {
        mHandler.post(new Runnable() {
            @Override
            public void run() {
                imageView.setImageBitmap(downBitmap);
            }
        });
    }

    /**
     * 下载图片
     *
     * @param imageUrl
     * @return
     */
    private Bitmap downloadImage(String imageUrl) {
        Bitmap bitmap = null;
        try {
            URL url = new URL(imageUrl);
            HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
            //拿到请求到图片输入流
            InputStream inputStream = urlConnection.getInputStream();
            Bitmap downBitmap = BitmapFactory.decodeStream(inputStream);
            //关闭连接
            urlConnection.disconnect();
            return downBitmap;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
```

```java
public class MemoryCache implements IImageCache {

    /**
     * 初始化内存缓存
     */
    private LruCache<String, Bitmap> mMemoryLru;

    public MemoryCache() {
        init();
    }

    private void init() {
        int currentMaxMemory = (int) (Runtime.getRuntime().maxMemory() / 1024);
        //内存缓存的大小
        int cacheSize = currentMaxMemory / 4;
        mMemoryLru = new LruCache<String, Bitmap>(cacheSize) {
            @Override
            protected int sizeOf(String key, Bitmap value) {
                return value.getRowBytes() * value.getHeight() / 1024;
            }
        };
    }

    @Override
    public void put(String url, Bitmap bitmap) {
        mMemoryLru.put(url,bitmap);
    }

    @Override
    public Bitmap get(String url) {
        return mMemoryLru.get(url);
    }
}
```

通过上面代码可以看出 ImageLoader 负责图片加载的逻辑，而 MemoryCache 负责缓存，这2 个类职责分明，就像公司里面不同部门干不同的活一样。但是，如果这 2 类写在一起的话，缺点一下就出来了，不仅功能职责不分明，而且代码也比较臃肿，耦合太重。

现在虽然代码结构变得清晰，职责也分明了，但是可扩展性还需要进一步优化，下面我们就来慢慢优化吧。

### 开闭原则

开闭原则英文全称是 Open Close Principle,缩写 OCP ，它是 Java 世界里最基础的设计原则，它指导我们如何建立一个稳定的、灵活的系统。

开闭原则的定义是：软件中的对象 \(类、模块、函数等\) 应该对于扩展是开放的，但是，对于修改是封闭的 这就是开放-关闭原则。

上一小节的 ImageLoader 职责单一，结构清晰，应该算是一个不错的开始了，但是 Android 中应用内存是有限制的，当应用重新启动，那么原有的缓存就不在了。现在我们加上本地磁盘缓存，为了遵从开闭原则的思想，我又对 ImageLoader 重新设计了。

[![cVE3M.png](https://storage7.cuntuku.com/2019/08/27/cVE3M.png)](https://cuntuku.com/image/cVE3M)

```java
public class ImageLoader {
    private String TAG = getClass().getSimpleName();


    /**
     * 默认内存缓存
     */
    private IImageCache mMemoryCache;

    /**
     * 线程池
     */
    private ExecutorService mExecutorService;

    /**
     * 主线程管理
     */
    private Handler mHandler = new Handler(Looper.getMainLooper());

    private static ImageLoader instance;

    public static ImageLoader getInstance() {
        if (instance == null)
            instance = new ImageLoader();

        return instance;
    }

    public ImageLoader() {
        mMemoryCache = new MemoryCache();
        //线程池，线程数据量为 CPU 的数量
        mExecutorService = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());
    }

    /**
     * 用户配置缓存策略
     *
     * @param imageCache
     */
    public void setImageCache(IImageCache imageCache) {
        this.mMemoryCache = imageCache;
    }

    /**
     * 加载图片
     */
    public void loadImage(final String url, final ImageView imageView) {
       .....

    }

    /**
     * 显示图片
     *
     * @param downBitmap
     * @param imageView
     */
    private void displayImage(final Bitmap downBitmap, final ImageView imageView) {
     .....

    }

    /**
     * 下载图片
     *
     * @param imageUrl
     * @return
     */
    private Bitmap downloadImage(String imageUrl) {
       .....
    }
}
```

```java
//磁盘缓存
public class DiskCache implements IImageCache {

    private DiskLruCache mDiskLruCache;

    private static final int MAX_SIZE = 10 * 1024 * 1024;//10MB
    //IO缓存流大小
    private static final int IO_BUFFER_SIZE = 8 * 1024;

    //缓存个数
    private static final int DISK_CACHE_INDEX = 0;

    public DiskCache(Context context) {
        try {
            File cacheDir = CacheUtils.getDiskCacheDir(context, "bitmapCache");
            if (!cacheDir.exists()) {
                cacheDir.mkdirs();
            }
            mDiskLruCache = DiskLruCache.open(cacheDir, ImageLoaderUtils.getAppVersion(context), 1, MAX_SIZE);
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    @Override
    public void put(String url, Bitmap bitmap) {
        OutputStream outputStream = null;
        DiskLruCache.Snapshot snapshot = null;
        BufferedOutputStream out = null;
        BufferedInputStream in = null;
        String key = ImageLoaderUtils.hashKeyForDisk(url);
        try {
            snapshot = mDiskLruCache.get(key);
            if (snapshot != null) {
                DiskLruCache.Editor editor = mDiskLruCache.edit(key);
                if (editor != null) {
                    outputStream = editor.newOutputStream(DISK_CACHE_INDEX);

                    InputStream inputStream = ImageLoaderUtils.bitmap2InputStream(bitmap, 50);

                    in = new BufferedInputStream(inputStream, IO_BUFFER_SIZE);
                    out = new BufferedOutputStream(outputStream, IO_BUFFER_SIZE);
                    int b;
                    while ((b = in.read()) != -1) {
                        out.write(b);
                    }
                    editor.commit();
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (snapshot != null) {
                    snapshot.close();
                }
                if (out != null) {
                    out.close();
                }
                if (in != null) {
                    in.close();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }

        }
    }

    @Override
    public Bitmap get(String url) {
        //通过key值在缓存中找到对应的Bitmap
        Bitmap bitmap = null;
        String key = ImageLoaderUtils.hashKeyForDisk(url);
        try {
            DiskLruCache.Snapshot snapshot = mDiskLruCache.get(key);
            if (snapshot == null) return null;
            //得到文件输入流
            InputStream fileInputStream = snapshot.getInputStream(DISK_CACHE_INDEX);
            if (fileInputStream != null)
                bitmap = BitmapFactory.decodeStream(fileInputStream);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return bitmap;
    }


}
```

```text
public class DoubleCache implements IImageCache {

    private String TAG = getClass().getSimpleName();

    /**
     * 内存缓存
     */
    private IImageCache mMemoryCache;

    /**
     * 磁盘缓存
     */
    private IImageCache mDiskCache;

    public DoubleCache(Context context) {
        this.mMemoryCache = new MemoryCache();
        this.mDiskCache = new DiskCache(context);
    }

    @Override
    public void put(String key, Bitmap bitmap) {
        mMemoryCache.put(key, bitmap);
        mDiskCache.put(key, bitmap);
    }

    @Override
    public Bitmap get(String url) {
        Bitmap bitmap = mMemoryCache.get(url);
        if (bitmap != null) {
            Log.i(TAG,"使用内存缓存");
            return bitmap;
        }
        Log.i(TAG,"使用磁盘缓存");
        return mDiskCache.get(url);
    }
}
```

```java
public interface IImageCache {

    /**
     * 存图片
     */
    void put(String url, Bitmap bitmap);

    /**
     * 获取图片
     */
    Bitmap get(String url);
}
```

IImageCache 接口简单定义了 存储/获取 两个函数，缓存的 url 就是图片网络地址，值就是缓存的图片，经过这次重构我们扩展了内存/磁盘缓存，细心的同学可能注意到了， ImageLoader 类中增加了一个 setImageCache \(IImageCache cache\) 函数，用户可以通过该函数来设置缓存，也就是通常说的依赖注入。下面看看怎么配置:

```java
public void config() {
        //使用双缓存
  ImageLoader.getInstance().setImageCache(new DoubleCache(getApplicationContext()));

        //用户自定义
  ImageLoader.getInstance().setImageCache(new IImageCache() {
            @Override
    public void put(String url, Bitmap bitmap) {

    }

            @Override
    public Bitmap get(String url) {
     return null;
     }
        });
    }
```

在上述代码中，通过 setImageCache\(\) 方法注入不同的缓存实现，这样不仅能够使 ImageLoader 更简单，健壮，也使得 ImageLoader 的可扩展性，灵活性能高，MemoryCache 、DiskCache 、DoubleCache 缓存图片的具体实现完全一样，但是，他们的一个特点是都实现了 ImageCache 接口，并且通过 setImageCache\(\) 注入到 IImageCache 中，这样就实现了千变万化的缓存策略，且扩展不会导致内部的修改，哈哈，这就是我们之前所说的开闭原则。

### 里氏替换原则

里氏替换原则英文全称是 Liskov Substitution Principle , 缩写是 LSP。LSP 的第一种定义是：如果对每一个类型为 S 的对象 O1, 都有类型为 T 的对象 O2, 使得以 T 定义的所有程序 P 在所有的对象 O1都替换成 O2 时，程序 P 的行为没有发生变化，那么类型 S 是类型 T 的子类型。上面这种描述确实有点不好理解，我们再来看第二种里氏替换原则定义：所有引用基类的地方必须能透明地使用其子类的对象。

我们知道，面向对象语言的三大特点是 继承，封装，多态，里氏替换原则就是依赖于 继承，多态这两大特性。里氏替换原则通俗来说的话就是，只要父类能出现的地方子类就可以出现，而且替换为子类也不会产生任何错误或异常，使用者可能根本不用知道是父类还是子类，但是反过来就不行了，有子类出现的地方，父类就不一定能适应，说了这么多，其实最终总结就两个字：抽象。

为了我们能够深入理解直接看下面代码示例吧:

[![cV5lU.png](https://storage6.cuntuku.com/2019/08/27/cV5lU.png)](https://cuntuku.com/image/cV5lU)

```java
//框口类
public class Window{
  public void show(View view){
    view.draw();
  }
}

//建立视图对象，测量视图的宽高为公用代码，绘制实现交给具体的子类
pubic abstract class View{
  public abstract void draw();
  public vid measure(int width,int height){
    //测量视图大小
  }
}

public class ImageView extends View{
  draw{
    //绘制图片
  }
}

... extends View{
  ...
}
```

上述示例代码中， Window 依赖于 View , 而 View 定义了一个视图抽象， measure 是各个子类共享的方法，子类通过重写 View 的draw 方法实现具有各自特色的功能，在这里，这个功能就是绘制自身的内容，在任何继承 View 类的子类都可以传递给 show 函数，这就是所说的里氏替换。

里氏替换原则的核心原理是抽象，抽象又依赖于继承这个特性，在 OOP 当中，继承的优缺点都相当明显，优点：

1. 代码复用，减少创建类的成本，每个子类都拥有父类的方法和属性；
2. 子类于父类基本相似，但又与父类有所区别；
3. 提高代码的可扩展性；

继承的缺点：

1. 继承是侵入性的，只要继承就必须拥有父类的所有属性和方法；
2. 可能造成子类代码冗余，灵活性降低，因为子类必须拥有父类的属性和方法。

事务都是都利和弊，须合理利用。

继续拿上面的 ImageLoader 缓存策略来说明里氏替换原则，用户只需要指定具体的缓存对象就可以通过 ImageCache 的 setImageCache\(\) 函数就可以替换 ImageLoader 的缓存策略，这就使得 ImageLoader 的缓存系统有了无限的可能性，也保证了可扩展性。

开闭和里氏往往是生世相依，不离不弃，通过里氏替换来达到程序的扩展，对修改的关闭效果。然而，这两个原则都同时强调了一个 OOP 的重要性 - 抽象，因此，在开发过程中，运用抽象是走向代码优化的重要一步。

### 依赖倒置原则

依赖倒置原则英文全称是 Dependence Inversion Principle, 简写 DIP 。依赖倒置原则指代了一种特定的解耦形式，使得高层次的模块不依赖于底层次模块的实现细节的目的，依赖模块被颠倒了。这个概念有点不好理解，这到底是什么意思勒？

依赖倒置有几个关键点：

1. 高层模块不应该依赖底层模块，两者都应该依赖起抽象；
2. 抽象不应该依赖细节；
3. 细节应该依赖抽象；

在 Java 语言中，抽象就是接口或抽象类，两者都是不能直接被实例化的；细节就是实现类，其特点就是可以直接实例化，也就是可以加上一个 new 关键字产生一个对象。高层模块就是调用端，底层模块就是具体实现类。依赖倒置原则在 Java 语言中的表现就是: `模块间的依赖通过抽象发生，实现类之间不发生直接的依赖关系，其依赖关系是通过接口或抽象类产生的`这又是一个将理论抽象化的实例，其实一句话可以概括：面向接口编程，或者说是面向抽象编程，面向接口编程是面向对象精髓之一，也就是上面两节强调的抽象。

这里我们还是以 ImageLoader 来说明，先看下面代码：

```java
public class ImageLoader {
    private String TAG = getClass().getSimpleName();


    /**
     * 默认内存缓存(直接依赖于细节，而不是抽象)
     */
    private MemoryCache mMemoryCache;

    /**
     * 线程池
     */
    private ExecutorService mExecutorService;

    /**
     * 主线程管理
     */
    private Handler mHandler = new Handler(Looper.getMainLooper());

    private static ImageLoader instance;

    public static ImageLoader getInstance() {
        if (instance == null)
            instance = new ImageLoader();

        return instance;
    }

    public ImageLoader() {
        mMemoryCache = new MemoryCache();
        //线程池，线程数据量为 CPU 的数量
        mExecutorService = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());
    }

    /**
     * 用户配置缓存策略
     *
     * @param imageCache
     */
    public void setImageCache(MemoryCache imageCache) {
        this.mMemoryCache = imageCache;
    }

...
}
```

上面代码 ImageLoader 直接依赖于细节 MemoryCache ，如果框架升级需有多级缓存也就是内存 + SD 卡缓存策略，那么就又需要改 ImageLoader 中的代码，如下：

```java
public class ImageLoader {
    private String TAG = getClass().getSimpleName();


    /**
     * 默认内存缓存(直接依赖于细节，而不是抽象)
     */
    private DoubleCache mMemoryCache;

    /**
     * 线程池
     */
    private ExecutorService mExecutorService;

    /**
     * 主线程管理
     */
    private Handler mHandler = new Handler(Looper.getMainLooper());

    private static ImageLoader instance;

    public static ImageLoader getInstance() {
        if (instance == null)
            instance = new ImageLoader();

        return instance;
    }

    public ImageLoader() {
        mMemoryCache = new DoubleCache();
        //线程池，线程数据量为 CPU 的数量
        mExecutorService = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors());
    }

    /**
     * 用户配置缓存策略
     *
     * @param imageCache
     */
    public void setImageCache(DoubleCache imageCache) {
        this.mMemoryCache = imageCache;
    }

...
}
```

在 ImageLoader 中我们把默认内存缓存改成了双缓存，这样不仅违背了没有开闭原则，也没有依赖于抽象，所以下面的代码才是正确的：

```java
public class ImageLoader {
    private String TAG = getClass().getSimpleName();
    /**
     * 默认内存缓存 默认依赖于抽象
     */
    private IImageCache mMemoryCache;

    private static ImageLoader instance;

    public static ImageLoader getInstance() {
        if (instance == null)
            instance = new ImageLoader();

        return instance;
    }

    public ImageLoader() {
     ...
    }

    /**
     * 用户配置缓存策略 注入抽象类
     *
     * @param imageCache
     */
    public void setImageCache(IImageCache imageCache) {
        this.mMemoryCache = imageCache;
    }
}
```

在这里实现类没有发生直接的依赖，而是通过抽象发生的依赖。满足了依赖倒置基本原则，想要让程序更为灵活，那么抽象就是迈出灵活的第一步。

### 接口隔离原则

`接口隔离原则英文全称是` InterfaceSegregation Principles, 缩写 ISP 。接口隔离原则的目的是系统解耦，从而容易重构、更改和重新部署。说白了就是让客服端依赖的接口尽可能地小，这样说可能还有点抽象，还是以一个示例说明一下

未优化的接口

```java
public class DiskCache implements IImageCache {

    private DiskLruCache mDiskLruCache;

    private static final int MAX_SIZE = 10 * 1024 * 1024;//10MB
    //IO缓存流大小
    private static final int IO_BUFFER_SIZE = 8 * 1024;

    //缓存个数
    private static final int DISK_CACHE_INDEX = 0;


    @Override
    public void put(String url, Bitmap bitmap) {
       .....
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (snapshot != null) {
                    snapshot.close();
                }
                if (out != null) {
                    out.close();
                }
                if (in != null) {
                    in.close();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }

        }
    }
}
```

可以看见上面一段代码虽然功能达到了要求，但是各种 try...catch 嵌套，不经影响代码美观，而且可读性差。我们可以看 Cloaseable 这个类的实现差不多 160 多个实现类，如果每个类都 close 那不的疯了，我们直接抽取一个 CloseUtils 如下：

```java
public class CloaseUtils {

    public static void close(Closeable... closeable) {
        if (closeable != null) {
            try {
                if (closeable.length == 1){
                    closeable[0].close();
                    return;
                }
                for (int i = 0; i < closeable.length; i++) {
                    closeable[i].close();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
```

支持同时关闭一个，或多个实现类的 close。

改造之后的代码：

```java
public class DiskCache implements IImageCache {

    private DiskLruCache mDiskLruCache;

    private static final int MAX_SIZE = 10 * 1024 * 1024;//10MB
    //IO缓存流大小
    private static final int IO_BUFFER_SIZE = 8 * 1024;

    //缓存个数
    private static final int DISK_CACHE_INDEX = 0;


    @Override
    public void put(String url, Bitmap bitmap) {
       .....
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
               CloaseUtils.close(snapshot,out,in);
        }
    }
}
```

是不是清爽多了，一行代码解决了刚刚差不多 10 行代码的逻辑。而且这里基本原理就是依赖于Closeable 抽象，而不是具体实现类（这不就是我们刚刚才说了的依赖倒置原则嘛），并且建立在最小化依赖原则的基础上，它只需要知道这个对象是否关闭，其它一概不关心，也就是这里的接口隔离原则。

### 迪米特原则

迪米特原则英文的全称为 Law of Demeter , 缩写是 LOD , 也称为最少知识原则。虽然名字不同，但描述的是同一个原则：**一个对象应该对其他对象有最少的的了解**。通俗的将，一个类应该对自己需要耦合或调用的类知道的最少，类的内部如何实现与调用者或者依赖者没有关系，调用者或者依赖着只需要知道它需要的方法即可，其他的可一概不用管。类与类之间关系密切，耦合度就越大，当一个类发生改变时，对另一个类的影响也越大。

下面以一个租房例子说明:

[![cZ85X.png](https://storage1.cuntuku.com/2019/08/28/cZ85X.png)](https://cuntuku.com/image/cZ85X)

```java
/**房子*/
public class Room {
  //面积
  public float area;
  //价钱
  public float price;

  public Room(float area,float price){
    this.area = area;
    this.price = price;
  }
}
```

```java
/**中介*/
public class Mediator{
  List <Room> mRooms = new ArrayList<Room>();

  public Mediator(){
    for(i = 0; i < 5 ; i ++){
      mRoom.add(new Room(14 + i,(14 + i) * 150));
    }
  }

  public List<Room> getAllRooms(){
    return mRooms;
  }
}
```

```java
/**租客**/
public class Tenant {
  public void rentRoom(float roomArea,float roomPrice,Mediator mediator){
    List<Room> rooms = mediator.getAllRooms();
      for(Room room : rooms){
      if(isSuitable(roomArea,roomPrice,room)){
        Log.i(TAG,"租到房子了");
      bread;
      }
    }
  }

  //租金要小于等于指定的值，面积要大于等于指定的值
  public boolean isSuitable(float roomArea,float roomPrice,Room room){
    return room.price <= roomPrice && room.area >= roomArea;
  }
}
```

上面的代码中可以看到，Tenant 不仅依赖了 Mediator 类，还需要频繁得于 Room 类打交道。租客只是找一个房子而已，如果把这些功能都放在 Tenant 类里面，那中介都没有存在感了吧？耦合太重了，我们只需要跟中介通信就行了，继续重构代码；

[![-2.png](https://s3.ax2x.com/2019/08/28/-2.png)](https://free.imgsha.com/i/tb4wZ)

```java
//中介
public class Mediator{
  List<Room> mRooms = new ArrayList<Room>();

  /**构造房子**/
  public Mediator(){
    for(i = 0; i < 5 ; i ++){
      mRoom.add(new Room(14 + i,(14 + i) * 150));
    }
  }

  public Room rentOut(float area,float price){
    for(Room room : mRooms){
      if(isSuitable(area,price,room)){
        return room;
      }
    }
    return null;
  }
public boolean isSuitable(float area,float price ,Room room){
  return room.price <= price && room.area >= area
    }
}
```

```java
//租客
public class Tenant{
  /**是否租到房子了*/
  public Room rentRoom(float roomArea,float roomPrice,Mediator mediator){
    return mediator.rentOut(roomArea,roomPrice);
  }
}
```

根据上面的重构优化，我们得出结构，租客只需要跟中介通信，主要关心中介那里有没有我需要的房子，而中介勒就去他的资源库里面去找，有没有租客需要的房子，每个对象做的事儿明确。“只与直接有关系的联系” 这简单的几个字就能够将我们从复杂的关系网中抽离出来，使程序耦合度更低，稳定性更好。

## 总结

从六大原则中我们得出了重要的结论，就是一定要有抽象的思维，面向抽象或面向接口编程。在应用开发过程中，最难的不是完成开发工作，而是后续的维护和迭代工作是否拥有可变性，扩展性，在不破坏系统的稳定性前提下依然保持 **二高一低原则（高扩展，高内聚，低耦合）** 在经历多个版本的迭代项目依然保持清晰，灵活，稳定的系统架构。当然这是我们一个比较理想的情况，但是我们需要往这个方向去实现努力，就相当于接口（想法）出来了，我们要去实现（接口实现类）它，遵循面向对象六大原则就是我们走向灵活软件之路所迈出的第一步，加油！

[代码地址](https://github.com/yangkun19921001/AndroidDpCode)

## 特别感谢

[《 Android 源码设计模式解析与实战 》](https://item.jd.com/12113187.html)

