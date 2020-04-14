


#App 黑白化实现探索，有一行代码实现的方案吗？

> 本文已授权公众号 hongyangAndroid 原创首发。

[原文地址](https://juejin.im/post/5e88937951882573c66cf99d?utm_source=gold_browser_extension)

4 月 4 日这一天，不少 网站、App 都通过黑白化，表达了深切的哀悼。

这篇文章我们纯谈技术。

我在当天，也给wanandroid.com上线了黑白化效果:

![](https://user-gold-cdn.xitu.io/2020/4/4/1714580fa35b30e3?imageslim)

大家可能做 app 比较多，网页端全站实现这一的效果，只需要一句话：

```
html {filter:progid:DXImageTransform.Microsoft.BasicImage(grayscale=1);-webkit-filter: grayscale(100%);}

```

只要给 html 加一句css 样式就可以了，你可以理解为给整个页面添加了一个灰度效果。

就完成了，真的很方便。

回头看 app，大家都觉得开发起来比较麻烦，大家普遍的思路就是：

1. 换肤；
2. 展现 server 下发的图片，还需要单独做灰度处理；

这么看起来工作量还是很大的。

后来我就在思考，既然 web 端可以这么给整个页面加一个灰度的效果，我们 app 应该也可以呀？

那我们如何给app页面加一个灰度效果呢？

我们的 app 页面正常情况下，其实也是 Canvas 绘制出来的对吧？

Canvas 对应的相关 API 肯定也是支持灰度的。

那么是不是我们在控件绘制的时候，比如 draw 之前设置个灰度效果就可以呢？

好像发现了什么玄机。

## 1. 尝试给 ImageView 上个灰度效果

那么我们首先通过 ImageView 来验证一下灰度效果的可行性。

我们编写个自定义的 ImageView，叫做：GrayImageView

布局文件是这样的：

```
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    tools:context=".TestActivity">

    <ImageView
        android:layout_width="100dp"
        android:layout_height="wrap_content"
        android:src="@mipmap/logo">

    </ImageView>

    <com.imooc.imooc_wechat_app.view.GrayImageView
        android:layout_width="100dp"
        android:layout_height="wrap_content"
        android:src="@mipmap/logo" />

</LinearLayout>

```

很简单，我们放了一个 ImageView 用来做对比。

看下 GrayImageView 的代码：

```
public class GrayImageView extends AppCompatImageView {
    private Paint mPaint = new Paint();

    public GrayImageView(Context context, AttributeSet attrs) {
        super(context, attrs);

        ColorMatrix cm = new ColorMatrix();
        cm.setSaturation(0);
        mPaint.setColorFilter(new ColorMatrixColorFilter(cm));
    }

    @Override
    public void draw(Canvas canvas) {
        canvas.saveLayer(null, mPaint, Canvas.ALL_SAVE_FLAG);
        super.draw(canvas);
        canvas.restore();
    }

}


```

在分析代码之前，我们看下效果图：

![](https://user-gold-cdn.xitu.io/2020/4/4/171458144c8df964?imageslim)

很完美，我们成功把 wanandroid图标搞成了灰色。

看一眼代码，代码非常简单，我们复写了draw 方法，在该方法中给canvas 做了一下特殊处理。

什么特殊处理呢？其实就是设置了一个灰度效果。

在 App中，我们对于颜色的处理很多时候会采用颜色矩阵，是一个4*5的矩阵，原理是这样的：

```
R’ = a*R + b*G + c*B + d*A + e;
G’ = f*R + g*G + h*B + i*A + j;
B’ = k*R + l*G + m*B + n*A + o;
A’ = p*R + q*G + r*B + s*A + t;

```

应用到一个具体的颜色[R, G, B, A]上，最终颜色的计算是这样的：

```
R’ = a*R + b*G + c*B + d*A + e;
G’ = f*R + g*G + h*B + i*A + j;
B’ = k*R + l*G + m*B + n*A + o;
A’ = p*R + q*G + r*B + s*A + t;

```

是不是看起来很难受，没错我也很难受，看到代数就烦。

既然大家都难受，那么Android 就比较贴心了，给我们搞了个ColorMartrix类，这个类对外提供了很多 API，大家直接调用 API 就能得到大部分想要的效果了，除非你有特别特殊的操作，那么可以自己通过矩阵去运算。

像灰度这样的效果，我们可以通过饱和度 API来操作：

```
setSaturation(float sat)

```

传入 0 就可以了，你去看源码，底层传入了一个特定的矩阵去做的运算。

ok，好了，忘掉上面说的，就记得你有个 API 能把 canvas 绘制出来的东西搞成灰的就行了。

那么我们已经实现了把 ImageView 弄成了灰度，TextView 可以吗？Button可以吗？

## 2. 尝试举一反三

我们来试试TextView、Button。

代码完全一样哈，其实就是换了个实现类，例如 GrayTextView:

```
public class GrayTextView extends AppCompatTextView {
    private Paint mPaint = new Paint();

    public GrayTextView(Context context, AttributeSet attrs) {
        super(context, attrs);

        ColorMatrix cm = new ColorMatrix();
        cm.setSaturation(0);
        mPaint.setColorFilter(new ColorMatrixColorFilter(cm));
    }

    @Override
    public void draw(Canvas canvas) {
        canvas.saveLayer(null, mPaint, Canvas.ALL_SAVE_FLAG);
        super.draw(canvas);
        canvas.restore();
    }
}

```

没任何区别，GrayButton 就不贴了，我们看布局文件：

```
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    tools:context=".TestActivity">

    <ImageView
        android:layout_width="100dp"
        android:layout_height="wrap_content"
        android:src="@mipmap/logo">

    </ImageView>

    <com.imooc.imooc_wechat_app.view.GrayImageView
        android:layout_width="100dp"
        android:layout_height="wrap_content"
        android:src="@mipmap/logo" />

    <TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="鸿洋真帅"
    android:textColor="@android:color/holo_red_light"
    android:textSize="30dp" />


    <com.imooc.imooc_wechat_app.view.GrayTextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="鸿洋真帅"
        android:textColor="@android:color/holo_red_light"
        android:textSize="30dp" />


    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="鸿洋真帅"
        android:textColor="@android:color/holo_red_light"
        android:textSize="30dp" />


    <com.imooc.imooc_wechat_app.view.GrayButton
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="鸿洋真帅"
        android:textColor="@android:color/holo_red_light"
        android:textSize="30dp" />

</LinearLayout>

```

对应的效果图：

![](https://user-gold-cdn.xitu.io/2020/4/4/1714581a54b2a078?imageslim)

可以看到 TextView，Button 也成功的把红色的字体换成了灰色。

这个时候你是不是忽然感觉自己会了？

其实我们只要把各种相关的 View 换成这种自定义 View，利用 appcompat换肤那一套，不需要 Server 参与了，客户端搞搞就行了。

是吗？我们需要把所有的 View 都换成自定义的 View吗？

这听起来成本也挺高呀。

再想想还有更简单的吗？

## 3. 往上看一眼

虽然刚才的布局文件很简单，但是邀请你再去看一眼刚才的布局文件，我要问你问题了：

看好了吧。

1. 请问上面的 xml 中，ImageView的父 View 是谁？
2. TextView 的父 View 是谁？
3. Button 的父 View 是谁？

有没有一点茅塞顿开！

我们需要一个个自定义吗？

父 View 都是 LinearLayout，我们搞个 GrayLinearLayout 不就行了，其内部的 View 都会变成灰色，毕竟 Canvas 对象是往下传递的。

我们来试试：

GrayLinearLayout：

```
public class GrayLinearLayout extends LinearLayout {
    private Paint mPaint = new Paint();

    public GrayLinearLayout(Context context, AttributeSet attrs) {
        super(context, attrs);

        ColorMatrix cm = new ColorMatrix();
        cm.setSaturation(0);
        mPaint.setColorFilter(new ColorMatrixColorFilter(cm));
    }

    @Override
    public void draw(Canvas canvas) {
        canvas.saveLayer(null, mPaint, Canvas.ALL_SAVE_FLAG);
        super.draw(canvas);
        canvas.restore();
    }

    @Override
    protected void dispatchDraw(Canvas canvas) {
        canvas.saveLayer(null, mPaint, Canvas.ALL_SAVE_FLAG);
        super.dispatchDraw(canvas);
        canvas.restore();
    }

}

```

代码很简单，但是注意有个细节，我们也复写了 dispatchDraw，为什么呢？自己思考：

我们更换下 xml：

```
<?xml version="1.0" encoding="utf-8"?>
<com.imooc.imooc_wechat_app.view.GrayLinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    tools:context=".TestActivity">

    <ImageView
        android:layout_width="100dp"
        android:layout_height="wrap_content"
        android:src="@mipmap/logo" />

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="鸿洋真帅"
        android:textColor="@android:color/holo_red_light"
        android:textSize="30dp" />

    <Button
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="鸿洋真帅"
        android:textColor="@android:color/holo_red_light"
        android:textSize="30dp" />

</com.imooc.imooc_wechat_app.view.GrayLinearLayout>

```

我们放了蓝色 Logo 的 ImageView，红色字体的 TextView 和 Button，看一眼效果：

![](https://user-gold-cdn.xitu.io/2020/4/4/1714581d299f522b?imageslim)

完美！

是不是又有点茅塞顿开！

只要我们换了 我们设置的Activity 的根布局就可以了！

Activity 的根布局可能是 LinearLayout,FrameLayout,RelativeLayout,ConstraintLayout...

换个鸡儿...这得换到啥时候，跟刚才有啥区别。

还有思路吗，没什么确定的 View 吗？

再想想。

我们的设置的 Activity 的根布局会放在哪？

```
android.id.content
```

是不是这个 Content View 上面？

这个 content view 目前一直是 FrameLayout ！

那么我们只要在生成这个android.id.content 对应的 FrameLayout，换成 GrayFrameLayout 就可以了。

怎么换呢？

appcompat 那一套？去搞 LayoutFactory?

确实可以哈，但是那样要设置 LayoutFactory，还需要考虑 appcompat 相关逻辑。

有没有那种不需要去修改什么流程的方案？

## 4. LayoutInflater 中的细节

还真是有的。

我们的 AppCompatActivity，可以复写 onCreateView 的方法，这个方法其实也是LayoutFactory在构建 View 的时候回调出来的，一般对应其内部的mPrivateFactory。

他的优先级低于 Factory、Factory2，相关代码：

```
if (mFactory2 != null) {
    view = mFactory2.onCreateView(parent, name, context, attrs);
} else if (mFactory != null) {
    view = mFactory.onCreateView(name, context, attrs);
} else {
    view = null;
}

if (view == null && mPrivateFactory != null) {
    view = mPrivateFactory.onCreateView(parent, name, context, attrs);
}

if (view == null) {
    final Object lastContext = mConstructorArgs[0];
    mConstructorArgs[0] = context;
    try {
        if (-1 == name.indexOf('.')) {
            view = onCreateView(parent, name, attrs);
        } else {
            view = createView(name, null, attrs);
        }
    } finally {
        mConstructorArgs[0] = lastContext;
    }
}   

```

但是目前对于 FrameLayout，appcompat 并没有特殊处理，也就是说你可以在 onCreateView 回调中去构造 FrameLayout 对象。

很简单，就复写 Activity 的 onCreateView 方法即可：

```
public class TestActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_test);
    }

    @Override
    public View onCreateView(String name, Context context, AttributeSet attrs) {
        return super.onCreateView(name, context, attrs);
    }
}


```

我们在这个方法中把content view 对应的 FrameLayout 换成 GrayFrameLayout.

```
@Override
public View onCreateView(String name, Context context, AttributeSet attrs) {
    try {
        if ("FrameLayout".equals(name)) {
            int count = attrs.getAttributeCount();
            for (int i = 0; i < count; i++) {
                String attributeName = attrs.getAttributeName(i);
                String attributeValue = attrs.getAttributeValue(i);
                if (attributeName.equals("id")) {
                    int id = Integer.parseInt(attributeValue.substring(1));
                    String idVal = getResources().getResourceName(id);
                    if ("android:id/content".equals(idVal)) {
                        GrayFrameLayout grayFrameLayout = new GrayFrameLayout(context, attrs);
//                            grayFrameLayout.setWindow(getWindow());
                        return grayFrameLayout;
                    }
                }
            }
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
    return super.onCreateView(name, context, attrs);
}

```

代码应该都能看明白吧，我们找到 id 是 android:id/content 的，换成了我们的 GrayFrameLayout,这块代码逻辑我没细测，可能会有一些异常，大家自己整理下。

最后看一眼GrayFrameLayout：

```
public class GrayFrameLayout extends FrameLayout {
    private Paint mPaint = new Paint();

    public GrayFrameLayout(Context context, AttributeSet attrs) {
        super(context, attrs);

        ColorMatrix cm = new ColorMatrix();
        cm.setSaturation(0);
        mPaint.setColorFilter(new ColorMatrixColorFilter(cm));
    }

    @Override
    protected void dispatchDraw(Canvas canvas) {
        canvas.saveLayer(null, mPaint, Canvas.ALL_SAVE_FLAG);
        super.dispatchDraw(canvas);
        canvas.restore();
    }


    @Override
    public void draw(Canvas canvas) {
        canvas.saveLayer(null, mPaint, Canvas.ALL_SAVE_FLAG);
        super.draw(canvas);
        canvas.restore();
    }

}

```

好了，运行一下，看下效果：

![](https://user-gold-cdn.xitu.io/2020/4/4/171458205d7bb5fa?imageslim)

效果 ok。

然后把onCreateView 这坨代码，放到你的 BaseActivity里面就行了。

什么，没有 BaseActivity？

...

## 5. 找个 App验证下

说到现在，都没有脱离出一个 Activity。

我们找个复杂点的项目验证下好吧。

我去 github 找个 wanandroid 的 Java 开源项目：

选中了：

[github.com/jenly1314/W…](https://github.com/jenly1314/WanAndroid)

导入后，只要在 BaseActivity 里面添加我们刚才的代码就可以了。

运行效果图:

![](https://user-gold-cdn.xitu.io/2020/4/4/171458226cb56878?imageslim)

恩，没错，webview 里面的文字，图片都黑白化了。

没发现啥问题，这样一个 app 就完全黑白化了。

等等，我发现状态栏没变，状态栏是不是有 API，自己在 BaseActivity 里面调用一行代码处理哈。

号内回复：「文章写的真好」，获取黑白化后的 apk，自己体验。

## 6. 真的没问题了吗？

其实没运行出来问题有些遗憾。

那我自爆几个问题吧。

**1. 如果 Activity的 Window 设置了 background，咋办呢？**

因为我们处理的是 content view，肯定在 window 之下，肯定覆盖不到 window 的 backgroud。

咋办咋办？

不要慌。

我们生成的GrayFrameLayout也是可以设置 background 的？

```
if ("android:id/content".equals(idVal)) {
    GrayFrameLayout grayFrameLayout = new GrayFrameLayout(context, attrs);
    grayFrameLayout.setBackgroundDrawable(getWindow().getDecorView().getBackground());
    return grayFrameLayout;
}

```

> 注意如果你的getWindow().setBackgroundDrawable调用过早，可能会导致getDecorView().getBackground()取不到，那么可以让grayFrameLayout.setBackgroundDrawable在实际绘制之前调用。

如果你是theme 中设置的 windowBackground，那么需要从 theme 里面提取 drawable，参考代码如下：

```
TypedValue a = new TypedValue();
getTheme().resolveAttribute(android.R.attr.windowBackground, a, true);
if (a.type >= TypedValue.TYPE_FIRST_COLOR_INT && a.type <= TypedValue.TYPE_LAST_COLOR_INT) {
    // windowBackground is a color
    int color = a.data;
} else {
    // windowBackground is not a color, probably a drawable
    Drawable c = getResources().getDrawable(a.resourceId);
}

```

> 来源搜索的 stackoverflow.

**2.Dialog 支持吗？**

这个方案默认就已经支持了 Dialog 黑白化，为什么？自己撸一下 Dialog 相关源码，看看 Dialog 内部的 View 结构是什么样子的。

**3. 如果 android.R.id.content 不是 FrameLayout 咋办？**

确实有这个可能。

想必你也有办法把PhoneWindow 的内部 View 搞成这个样子：

```
decorView
	GrayFrameLayout
		android.R.id.content
			activity rootView


```

或者这个样子：

```
decorView
	android.R.id.content
		GrayFrameLayout
			activity rootView

```

可以吧。

**4. 目前已知的问题**

本来我测试webview以为是正常的，没想到在部分app上，webview效果确实异常...

还要反馈视频播放异常的。

暂时没找到好的方案解决。

先收尾了。

建议大家跟着文章做些实验，以学习知识为目的；因为一般博客都搞的屌一点，觉得一键换掉整个app感觉很帅。

实际上在真实项目中，即使确定了技术方案，也是尽可能的定制，追求影响越小越好，所以这类动不动更换全局View的做法，一般风险都很高，在实际项目开发中并不推荐。

> 本文仅为app黑白化的方案探索，如果用于线上项目一定要充分测试，针对一些问题，后续有进展我再更新，公众号是无法修改了。

希望你能从中获取到足够的知识，拜了个拜!