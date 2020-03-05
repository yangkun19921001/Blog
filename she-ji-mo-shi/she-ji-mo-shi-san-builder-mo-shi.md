# 设计模式 \(三\) Builder 模式

## 介绍

Builder 模式是一步一步创建一个复杂对象的创建型模式，它允许用户在不知道内部构建细节的情况下，可以更精细的控制对象的构造流程，该模式是为了将构建复杂对象的过程和它的部件解耦，使得构建过程和创建过程隔离开来。

## 定义

将一个复杂对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示。

## 使用场景

1. 相同的方法，不同的执行顺序，产生不同的事件结果时。
2. 当初始化一个对象特别复杂，如参数多，且很多参数都具有默认值时。

## 简单代码示例

这里比如我们第一次初始化应用的时候，需要初始化一些事物，比如默认记住密码，自动登录，开机登录，崩溃重启等等。

```java
package com.devyk.android_dp_code.builder;

/**
 * <pre>
 *     author  : devyk on 2019-09-01 16:48
 *     blog    : https://juejin.im/user/578259398ac2470061f3a3fb/posts
 *     github  : https://github.com/yangkun19921001
 *     mailbox : yang1001yk@gmail.com
 *     desc    : This is LoginManager
 * </pre>
 */
public class LoginManager {

    /**
     * 记住密码
     */
    public boolean isSavePwd;
    /**
     * 自动登录
     */
    public boolean isAutoLogin;
    /**
     * 开机自启动
     */
    public boolean isBootLauncher;
    /**
     * 崩溃重启
     */
    public boolean isCrashOnRestart;


    public LoginManager(Builder builder){
        this.isAutoLogin = builder.isAutoLogin;
        this.isBootLauncher = builder.isBootLauncher;
        this.isCrashOnRestart = builder.isCrashOnRestart;
        this.isSavePwd = builder.isSavePwd;
    }
    public static class Builder{
        /**
         * 记住密码
         */
         boolean isSavePwd;
        /**
         * 自动登录
         */
         boolean isAutoLogin;
        /**
         * 开机自启动
         */
         boolean isBootLauncher;
        /**
         * 崩溃重启
         */
         boolean isCrashOnRestart;

      //默认属性
        public Builder(){
            this.isSavePwd = false;
            this.isAutoLogin = false;
            this.isBootLauncher = false;
            this.isCrashOnRestart = false;
        }

        public Builder isSavePwd(boolean savePwd){
            this.isSavePwd = savePwd;
            return this;
        }

        public Builder isAutoLogin(boolean autoLogin){
            this.isAutoLogin = autoLogin;
            return this;
        }

        public Builder isBootLauncher(boolean bootLauncher){
            this.isBootLauncher = bootLauncher;
            return this;
        }

        public Builder isCrashOnRestart(boolean onReStartApp){
            this.isCrashOnRestart = onReStartApp;
            return this;
        }

        /**
         * 最后构建出来
         * @return
         */
        public LoginManager build(){
            return new LoginManager(this);
        }
    }
}
```

使用：

```java
//直接链式调用
        LoginManager loginManager = new LoginManager.Builder()
                .isAutoLogin(true)
                .isBootLauncher(true)
                .isCrashOnRestart(true)
                .build();

        System.out.printf("loginManager:"+loginManager.toString());
```

Output:

```java
loginManager:LoginManager{isSavePwd=false, isAutoLogin=true, isBootLauncher=true, isCrashOnRestart=true}
```

上述代码中，通过具体的 Builder 类来具体构建 LoginManager 需要的属性，最后通过链式调用，结构变得更加清晰，更加容易控制。

## Android 源码中 AlertDialog 的 Builder 模式全面解析

在 Android 源码中，最常用之一的 Builder 模式 AlertDialog.Builder, 通过 Builder 来构建复杂的 AlertDialog 对象。请先看它的使用方式:

```java
    private void showAlertDialog(Context context) {
        new AlertDialog.Builder(context)// 以下通过 Builder 链式调用构造数据
                .setIcon(R.drawable.ic_launcher_background)
                .setMessage("测试数据")
                .setTitle("提示")
                .setPositiveButton("取消", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {

                    }
                }).setNegativeButton("确认", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {

            }
        }).create()//最后一步就是在 Builder 中构建出 AlerDialog 对象，并初始化数据
                .show(); // 显示

    }
```

从 AlertDialog.Builder\(context\) 可以看出 AlertDialog 是一个 Builder 建造者模式，通过 Builder 对象，组装 Dialog 的各个部分，将 Dialog 的构造和表示进行分离。下面请看 AlertDialog Builder 的相关源码；

```java
import com.android.internal.R;

public class AlertDialog extends Dialog implements DialogInterface {
    //接收Builder成员变量 P 中的各个参数
    private AlertController mAlert;

     ....代码省略

    protected AlertDialog(Context context, boolean cancelable, OnCancelListener cancelListener) {
        this(context, 0);

        setCancelable(cancelable);
        setOnCancelListener(cancelListener);
    }


    //构造函数
    protected AlertDialog(Context context, @StyleRes int themeResId) {
        this(context, themeResId, true);
    }

    // 构造 AlertDialog
    AlertDialog(Context context, @StyleRes int themeResId, boolean createContextThemeWrapper) {
        super(context, createContextThemeWrapper ? resolveDialogTheme(context, themeResId) : 0,
                createContextThemeWrapper);

        mWindow.alwaysReadCloseOnTouchAttr();
        mAlert = AlertController.create(getContext(), this, getWindow());
    }

    static @StyleRes int resolveDialogTheme(Context context, @StyleRes int themeResId) {
        if (themeResId == THEME_TRADITIONAL) {
            return R.style.Theme_Dialog_Alert;
        } else if (themeResId == THEME_HOLO_DARK) {
            return R.style.Theme_Holo_Dialog_Alert;
        } else if (themeResId == THEME_HOLO_LIGHT) {
            return R.style.Theme_Holo_Light_Dialog_Alert;
        } else if (themeResId == THEME_DEVICE_DEFAULT_DARK) {
            return R.style.Theme_DeviceDefault_Dialog_Alert;
        } else if (themeResId == THEME_DEVICE_DEFAULT_LIGHT) {
            return R.style.Theme_DeviceDefault_Light_Dialog_Alert;
        } else if (ResourceId.isValid(themeResId)) {
            // start of real resource IDs.
            return themeResId;
        } else {
            final TypedValue outValue = new TypedValue();
            context.getTheme().resolveAttribute(R.attr.alertDialogTheme, outValue, true);
            return outValue.resourceId;
        }
    }


    //实际上调用的是 mAlert 的 setTitle 方法
    @Override
    public void setTitle(CharSequence title) {
        super.setTitle(title);
        mAlert.setTitle(title);
    }

    /**
     * @see Builder#setCustomTitle(View)
     *
     *   //实际上调用的是 mAlert 的 setCustomTitle 方法
     */
    public void setCustomTitle(View customTitleView) {
        mAlert.setCustomTitle(customTitleView);
    }

    /**
     * 实际上调用的 mAlert 的 setMessage 方法
     * @param message
     */
    public void setMessage(CharSequence message) {
        mAlert.setMessage(message);
    }


//    ################################ BUilder 为 AlertDialog 构建的内部类 ##############################################
    public static class Builder {
        //存储 AlertDialog 的各个参数，如果 title,message,icon
        private final AlertController.AlertParams P;

        public Builder(Context context) {
            this(context, resolveDialogTheme(context, ResourceId.ID_NULL));
        }

        public Builder(Context context, int themeResId) {
            P = new AlertController.AlertParams(new ContextThemeWrapper(
                    context, resolveDialogTheme(context, themeResId)));
        }


        /**
         *  设置标签头部提示
         */
        public Builder setTitle(@StringRes int titleId) {
            P.mTitle = P.mContext.getText(titleId);
            return this;
        }


      ..... 其它属性先省略 代码都大同小异 看懂一个就基本懂了


        /**
         * Creates an {@link AlertDialog} with the arguments supplied to this
         * builder.
         * 
         * 这里才是真正构建 AlertDialog 的地方，通过 Builder 来构建出来的数据 p 传递参数
         * <p> 
         */
        public AlertDialog create() {
            //实例化 AlertDialog 传参
            final AlertDialog dialog = new AlertDialog(P.mContext, 0, false);
            //将 p 中的参数应用到 dialog 中的 mAlert 对象中
            P.apply(dialog.mAlert);
            dialog.setCancelable(P.mCancelable);
            if (P.mCancelable) {
                dialog.setCanceledOnTouchOutside(true);
            }
            dialog.setOnCancelListener(P.mOnCancelListener);
            dialog.setOnDismissListener(P.mOnDismissListener);
            if (P.mOnKeyListener != null) {
                dialog.setOnKeyListener(P.mOnKeyListener);
            }
            return dialog;
        }
    }

  ...

}
```

上述代码中，Builder 类可以设置 AlertDialog 中的 title , message , buttom 等参数，这些参数都存储在 Builder 成员变量 p 中，p 中包含了与 AlertDialog 视图中对应的成员变量。在调用 Builder 类的 create 函数时，此时才真正的创建 AlertDialog,并且将 Builder p 保存的参数交于 AlertDialog mAlert 对象中，既 p.apply\(mAlert\);我们可以看下 apply 源码：

```java
        public void apply(AlertController dialog) {
            if (mCustomTitleView != null) {
                dialog.setCustomTitle(mCustomTitleView);
            } else {
                if (mTitle != null) {
                    dialog.setTitle(mTitle);
                }
                if (mIcon != null) {
                    dialog.setIcon(mIcon);
                }
                if (mIconId != 0) {
                    dialog.setIcon(mIconId);
                }
                if (mIconAttrId != 0) {
                    dialog.setIcon(dialog.getIconAttributeResId(mIconAttrId));
                }
            }
          //赋值
            if (mMessage != null) {
                dialog.setMessage(mMessage);
            }

 ....

            // 如果设置了 ListView 则表示多选列表，此时创建一个 ListView
            if ((mItems != null) || (mCursor != null) || (mAdapter != null)) {
                createListView(dialog);
            }

            //最后将 mView Dialog 中
            if (mView != null) {
                if (mViewSpacingSpecified) {
                    dialog.setView(mView, mViewSpacingLeft, mViewSpacingTop, mViewSpacingRight,
                            mViewSpacingBottom);
                } else {
                    dialog.setView(mView);
                }
            } else if (mViewLayoutResId != 0) {
                dialog.setView(mViewLayoutResId);
            }

        }
```

在 apply 函数中，只是将 AlertParams 参数设置到 AlertControler 中，当我们调用 show 就能显示对话框了，我们具体来看下 show 的源码实现:

```java
    /**
     * 开始显示 Dialog 
     */
    public void show() {
        //如果已经显示出来了 则返回
        if (mShowing) {
            if (mDecor != null) {
                if (mWindow.hasFeature(Window.FEATURE_ACTION_BAR)) {
                    mWindow.invalidatePanelMenu(Window.FEATURE_ACTION_BAR);
                }
                mDecor.setVisibility(View.VISIBLE);
            }
            return;
        }

        mCanceled = false;

        // 1. onCreate 生命周期方法
        if (!mCreated) {
            dispatchOnCreate(null);
        } else {
            final Configuration config = mContext.getResources().getConfiguration();
            mWindow.getDecorView().dispatchConfigurationChanged(config);
        }

        // 2. onStart 生命周期方法
        onStart();
        //3. 获取 Window DecorView
        mDecor = mWindow.getDecorView();

        if (mActionBar == null && mWindow.hasFeature(Window.FEATURE_ACTION_BAR)) {
            final ApplicationInfo info = mContext.getApplicationInfo();
            mWindow.setDefaultIcon(info.icon);
            mWindow.setDefaultLogo(info.logo);
            mActionBar = new WindowDecorActionBar(this);
        }

        //4. 获取布局参数
        WindowManager.LayoutParams l = mWindow.getAttributes();
        if ((l.softInputMode
                & WindowManager.LayoutParams.SOFT_INPUT_IS_FORWARD_NAVIGATION) == 0) {
            WindowManager.LayoutParams nl = new WindowManager.LayoutParams();
            nl.copyFrom(l);
            nl.softInputMode |=
                    WindowManager.LayoutParams.SOFT_INPUT_IS_FORWARD_NAVIGATION;
            l = nl;
        }

        //5. 将 mDecor 添加到 WindowManager 中
        mWindowManager.addView(mDecor, l);
        mShowing = true;

        //通知可以显示了
        sendShowMessage();
    }
```

在 show\(\) 中主要做了如下几个事儿：

1. 通过dispatchOnCreate 函数调用 AlertDialog 生命周期 onCreate 函数；
2. 然后在调用 onStart
3. 最后通过 windowManager 把 Dialog 的 DecorView 添加进去

那么按照构建，内容视图应该是在生命周期的 onCreate 里面

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mAlert.installContent();
    }

public void installContent() {
        int contentView = selectContentView();
        //设置框口内容视图
        mWindow.setContentView(contentView);
        //初始化 AlertDialog 其它子视图的内容
        setupView();
    }
```

虽然 installContent 代码少，但是及其重要，它调用了 Window 对象的 setContentView, 此处的 setContentView 与 Activity setContentView 中的实现一模一样，都是调用 window 的方法。

最后 setupView 就是初始化 AlertDialog 布局中各个参数，在调用完该函数之后 Dialog 的视图内容就全部显示完毕了，而这些各区域的视图都属于 mAlertDialogLayout 布局中的子 View ,Window 对象关联了mAlertDialogLayout 的整个布局树，当调用完 setupView 之后整个视图树的数据也就填充完毕，当用户调用 show 函数时， WindowManager 会将 window 对象的 DecorView \(也就是 mAlertDialogLayout 对应的视图\)添加到用户的窗口上，并且显示出来。到这里 Dialog 就出现在了手机屏幕中。

Ps：在调用 show 函数的中，最后的视图是通过 WM 显示到手机屏幕上的，那么 WM 背后的原理是怎么样的了？还不知道的可以看下我另一篇文章[Android 全面解析 WindowManager](she-ji-mo-shi-san-builder-mo-shi.md)

## 实战

经过简单示例与分析源码中的 Builder 模式，相信大家对建造者模式已经有了一定了解了，现在我们就 Builder 模式来对[ImageLoader 示例](https://juejin.im/post/5d669bfc6fb9a06b1b19d25e) 改造。请看改造后的 ImageLoader

```java
//增加了 Builder 配置类

/**
 * <pre>
 *     author  : devyk on 2019-09-01 19:03
 *     blog    : https://juejin.im/user/578259398ac2470061f3a3fb/posts
 *     github  : https://github.com/yangkun19921001
 *     mailbox : yang1001yk@gmail.com
 *     desc    : This is ImageLoaderConfig
 * </pre>
 */
public class ImageLoaderConfig {
    /**
     * 图片缓存对象
     */
    public IImageCache imageCache = new MemoryCache();

    /**
     * 允许最大线程数量
     */
    public int threadCount = -1;

    /**
     * 失败显示的图片配置
     */
    public int errorIcon = -1;

    /**
     * 图片下载
     */
    public IDownloader downloader = new HttpURLConnectionDownloaderImp();


    private ImageLoaderConfig() {
    }

    /**
     * 配置 Builder
     */
    public static class Builder {
        /**
         * 图片缓存对象
         */
        IImageCache imageCache = new MemoryCache();

        /**
         * 允许最大线程数量
         */
        int threadCount = Runtime.getRuntime().availableProcessors() + 1;

        /**
         * 失败显示的图片配置
         */
        int errorIcon = -1;

        /**
         * 图片下载
         */
        IDownloader downloader = new HttpURLConnectionDownloaderImp();


        //设置线程数量
        public Builder setThreadCount(int threadCount) {
            this.threadCount = threadCount;
            return this;
        }

        //设置缓存
        public Builder setCache(IImageCache iImageCache) {
            this.imageCache = iImageCache;
            return this;
        }

        //图片下载
        public Builder setDownLoader(IDownloader iDownloader) {
            this.downloader = iDownloader;
            return this;
        }

        //设置显示失败的图片
        public Builder setLoaderErrorIcon(int icon) {
            this.errorIcon = icon;
            return this;
        }


        private void applyConfig(ImageLoaderConfig config) {
            config.errorIcon = this.errorIcon;
            config.imageCache = this.imageCache;
            config.threadCount = this.threadCount;
            config.downloader = this.downloader;
        }

        /**
         * 根据已经设置好的属性创建配置好对象
         */
        public ImageLoaderConfig create() {
            ImageLoaderConfig config = new ImageLoaderConfig();
            applyConfig(config);
            return config;
        }
    }

}
```

通过上面代码可以看到 ImageLoader 需要的业务，都可以在 ImageLoaderConfig Builder 配置。

```java
/**
 * <pre>
 *     author  : devyk on 2019-08-27 00:11
 *     blog    : https://juejin.im/user/578259398ac2470061f3a3fb/posts
 *     github  : https://github.com/yangkun19921001
 *     mailbox : yang1001yk@gmail.com
 *     desc    : This is ImageLoader
 * </pre>
 */
public class ImageLoader {
    private String TAG = getClass().getSimpleName();
    /**
     * 默认内存缓存
     */
    private IImageCache mCache;

    /**
     * 图片下载
     */
    private IDownloader mImageDownloader;

    /**
     * 线程池
     */
    private ExecutorService mExecutorService;

    /**
     * 主线程管理
     */
    private Handler mHandler = new Handler(Looper.getMainLooper());

    /**
     * 显示失败的图片
     */
    private int mErrorIcon ;

    private static ImageLoader instance;
    private ImageLoaderConfig imageLoaderConfig;

    public static ImageLoader getInstance() {
        if (instance == null)
            instance = new ImageLoader();
        return instance;
    }

    private ImageLoader() {

    }

    public void init(ImageLoaderConfig imageLoaderConfig) {
        this.imageLoaderConfig = imageLoaderConfig;
        checkConfig();
    }

    private void checkConfig() {
        if (imageLoaderConfig == null) return;

        if (imageLoaderConfig.imageCache == null) {
            //图片缓存
            this.mCache = new MemoryCache();
        } else {
            this.mCache = imageLoaderConfig.imageCache;
        }

        if (imageLoaderConfig.threadCount != -1) {
            //线程池，线程数据量为 CPU 的数量
            this.mExecutorService = Executors.newFixedThreadPool(imageLoaderConfig.threadCount);
        }

        if (imageLoaderConfig.errorIcon != -1)
            this.mErrorIcon = imageLoaderConfig.errorIcon;

        //图片下载
        this.mImageDownloader = imageLoaderConfig.downloader;
    }


    /**
     * 加载图片
     */
    public void loadImage(final String url, final ImageView imageView) {
        Bitmap bitmap = mCache.get(url);
        if (bitmap != null) {
            imageView.setImageBitmap(bitmap);
            return;
        }

        imageView.setTag(url);

        //如果内存缓存中没有图片，就开启网络请求去下载
        mExecutorService.submit(new Runnable() {
            @Override
            public void run() {
                Bitmap imager = mImageDownloader.downLoader(url);
                if (imager == null) return;
                if (imageView.getTag().equals(url)) {
                    displayImage(imager, imageView);
                }
                mCache.put(url, imager);
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
                Log.i(TAG, "下载图片");
                imageView.setImageBitmap(downBitmap);
            }
        });
    }
}
```

使用：

```java
    /**
     * 初始化配置
     */
    public void config() {
        ImageLoaderConfig config = new ImageLoaderConfig.Builder()
                .setCache(new DoubleCache(getApplicationContext()))
                .setLoaderErrorIcon(R.drawable.ic_launcher_background)
                .setThreadCount(10)
                .setDownLoader(new HttpURLConnectionDownloaderImp())
                .create();
        ImageLoader.getInstance().init(config);
    }
```

通过配置之后就可以正常使用了，各种 setter 函数不会再用户调用 ImageLoader 方法时出现在视野中，它已经被隔离到了 Builder 模式中。清晰、简单的 API 也是一个开源库必须要保证的地方。

## 总结

Builder 模式在 Android 源码，开源库（Okhttp...等）常用，将配置的构建和表示分离开来，同时也是将配置从目标类中隔离出来，避免过多的 setter,Builder 模式比较常见的实现形式就是链式调用，这样使得代码更加简洁，易懂。

优点：

1. 良好的封装性，使用建造者模式可以是客服端不必知道产品内部组成细节。
2. 独立，易扩展。

缺点：

1. 会产生多余的 Builder 对象，消耗内存。

[文章中所有代码地址](https://github.com/yangkun19921001/AndroidDpCode)

