# 高级 UI 成长之路  \(四\) Paint 高级使用

## 前言

在前面三篇文章中我们学习了 “View 基础”、“事件分发机制”、“自定义 View 入门和 View 工作流程” 那么该篇文章将为大家带来自定义 View 中一个必不可少的类 Paint 画笔。有了它可以让我们绘制出来的图形更加绚丽。该篇主要讲解 Paint 高级使用，基础部分我就大概过一下 API。

## Paint API

```java
// 重置Paint。
void reset();
// 是否抗锯齿
void setAntiAlias(boolean aa);
// 设定是否使用图像抖动处理，会使绘制出来的图片颜色更加平滑和饱满，图像更加清晰  
void setDither(boolean dither);
// 设置线性文本
void setLinearText(boolean linearText);
// 设置该项为true，将有助于文本在LCD屏幕上的显示效果  
void setSubpixelText(boolean subpixelText);
// 设置下划线
void setUnderlineText(boolean underlineText);
// 设置带有删除线的效果 
void setStrikeThruText(boolean strikeThruText);
// 设置伪粗体文本，设置在小字体上效果会非常差  
void setFakeBoldText(boolean fakeBoldText);
// 如果该项设置为true，则图像在动画进行中会滤掉对Bitmap图像的优化操作
// 加快显示速度，本设置项依赖于dither和xfermode的设置  
void setFilterBitmap(boolean filter);
// 设置画笔风格，空心或者实心 FILL，FILL_OR_STROKE，或STROKE
// Paint.Style.STROKE 表示当前只绘制图形的轮廓，而Paint.Style.FILL表示填充图形。  
void setStyle(Style style);
// 设置颜色值
void setColor(int color);
// 设置透明图0~255，要在setColor后面设置才生效
void setAlpha(int a);   
// 设置RGB及透明度
void setARGB(int a, int r, int g, int b);  
// 当画笔样式为STROKE或FILL_OR_STROKE时，设置笔刷的粗细度  
void setStrokeWidth(float width);
void setStrokeMiter(float miter);
// 当画笔样式为STROKE或FILL_OR_STROKE时，设置笔刷末端的图形样式
// 如圆形样式Cap.ROUND,或方形样式Cap.SQUARE  
void setStrokeCap(Cap cap);
// 设置绘制时各图形的结合方式，如平滑效果等  
void setStrokeJoin(Join join);
// 设置图像效果，使用Shader可以绘制出各种渐变效果  
Shader setShader(Shader shader);
// 设置颜色过滤器，可以在绘制颜色时实现不用颜色的变换效果 
ColorFilter setColorFilter(ColorFilter filter);
// 设置图形重叠时的处理方式，如合并，取交集或并集，经常用来制作橡皮的擦除效果 
Xfermode setXfermode(Xfermode xfermode);
// 设置绘制路径的效果，如点画线等 
PathEffect setPathEffect(PathEffect effect);
// 设置MaskFilter，可以用不同的MaskFilter实现滤镜的效果，如滤化，立体等  
MaskFilter setMaskFilter(MaskFilter maskfilter);
// 设置Typeface对象，即字体风格，包括粗体，斜体以及衬线体，非衬线体等  
Typeface setTypeface(Typeface typeface);
// 设置光栅化
Rasterizer setRasterizer(Rasterizer rasterizer);
// 在图形下面设置阴影层，产生阴影效果，radius为阴影的角度，dx和dy为阴影在x轴和y轴上的距离，color为阴影的颜色
// 注意：在Android4.0以上默认开启硬件加速，有些图形的阴影无法显示。关闭View的硬件加速 view.setLayerType(View.LAYER_TYPE_SOFTWARE, null);
void setShadowLayer(float radius, float dx, float dy, int color);
// 设置文本对齐
void setTextAlign(Align align);
// 设置字体大小
void setTextSize(float textSize);
// 设置文本缩放倍数，1.0f为原始
void setTextScaleX(float scaleX);
// 设置斜体文字，skewX为倾斜弧度  
void setTextSkewX(float skewX);
```

## Paint 高级使用

### 渲染

**1. 绘制图像阴影效果 setShadowLayer**

```kotlin
                val paint = Paint()
        paint.setStyle(Paint.Style.FILL)
        paint.setColor(Color.BLACK)
        // 设置透明度，要在setColor后面设置才生效
        paint.setAlpha(80)
         // 如果不关闭硬件加速，setShadowLayer无效
        setLayerType(View.LAYER_TYPE_SOFTWARE, null)
        // (阴影的半径，X轴方向上相对主体的位移，Y轴相对位移)
        paint.setShadowLayer(50f, 10f, 10f, Color.RED)
        paint.setTextSize(50f)

        // cx和cy为圆点的坐标
        val radius = 200
        val offest = 40

        val startX = width / 2 - radius
        val startY = height / 2
        canvas.drawText("画一个圆", width / 2 - 100f, height / 2f - 300, paint)
        canvas.drawCircle(startX.toFloat(), startY.toFloat(), radius.toFloat(), paint)

        paint.setStyle(Paint.Style.STROKE)
        paint.setStrokeWidth(5f)
        paint.setShadowLayer(50f, -20f, 10f, Color.RED)
        canvas.drawCircle(startX + radius * 2 + offest.toFloat(), startY.toFloat(), radius.toFloat(), paint)
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191129223949.png)

**2. 为 Bitmap 设置图形渲染 BitmapShader**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191129234609.png)

```kotlin
class MyGradientView : View {
    private var mPaint: Paint? = null
    private var mBitMap: Bitmap? = null
    private var mWidth: Int = 0
    private var mHeight: Int = 0
    private val mColors = intArrayOf(Color.RED, Color.GREEN, Color.BLUE, Color.YELLOW)
    constructor(context: Context?) : super(context) {
        init()
    }

    constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs) {
        init()
    }
    constructor(context: Context?, attrs: AttributeSet?, defStyleAttr: Int) : super(context, attrs, defStyleAttr)

    private fun init() {
        mBitMap = (resources.getDrawable(R.mipmap.girl_gaitubao) as BitmapDrawable).bitmap
        mPaint = Paint()
        mWidth = mBitMap!!.getWidth()
        mHeight = mBitMap!!.getHeight()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        /**
         * TileMode.CLAMP 拉伸最后一个像素去铺满剩下的地方
         * TileMode.MIRROR 通过镜像翻转铺满剩下的地方。
         * TileMode.REPEAT 重复图片平铺整个画面（电脑设置壁纸）
         * 在图片和显示区域大小不符的情况进行扩充渲染
         */
        /**
         * 位图渲染，BitmapShader(@NonNull Bitmap bitmap, @NonNull TileMode tileX, @NonNull TileMode tileY)
         * Bitmap:构造shader使用的bitmap
         * tileX：X轴方向的TileMode
         * tileY:Y轴方向的TileMode
         */
        val bitMapShader = BitmapShader(
            mBitMap!!, Shader.TileMode.MIRROR,
            Shader.TileMode.MIRROR
        )
        //设置图片效果
        mPaint!!.setShader(bitMapShader)
        //抗锯齿
        mPaint!!.setAntiAlias(true)
        //绘制圆
        canvas.drawCircle(width/2f,height/2f,mHeight.toFloat(),mPaint!!)
    }
}
```

参数的意思我注释很详细，我就不在过多说明了。

**3. 线性渲染 LinearGradient**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191129235319.png)

```kotlin
        /**线性渲染
         * x0, y0, 起始点
         *  x1, y1, 结束点
         * int[]  mColors, 中间依次要出现的几个颜色
         * float[] positions 位置数组，position的取值范围[0,1]，作用是指定几个颜色分别放置在那个位置上，
         * 如果传null，渐变就线性变化。
         *    tile 用于指定控件区域大于指定的渐变区域时，空白区域的颜色填充方法
         */  
            var linearGradient = LinearGradient(
            0f, 0f, 800f, 800f,
            mColors, null, Shader.TileMode.CLAMP
        )
//        var linearGradient = LinearGradient(0f, 0f, 400f, 400f, mColors, null, Shader.TileMode.REPEAT)
        mPaint!!.setShader(linearGradient)
        canvas.drawRect(0f, 0f, 800f, 800f, mPaint!!)
```

**4. 环形渲染 RadialGradient**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191129235915.png)

```kotlin
        /**
         * 
         * 环形渲染
         * centerX ,centerY：shader的中心坐标，开始渐变的坐标
         * radius:渐变的半径
         * centerColor,edgeColor:中心点渐变颜色，边界的渐变颜色
         * colors:渐变颜色数组
         * stops:渐变位置数组，类似扫描渐变的positions数组，取值[0,1],中心点为0，半径到达位置为1.0f
         * tileMode:shader未覆盖以外的填充模式
         */
        val mRadialGradient = RadialGradient(
            width/2f,height/2f,width/3.toFloat(),
            mColors, null, Shader.TileMode.REPEAT
        )
        mPaint!!.setShader(mRadialGradient)
        canvas.drawCircle(width/2f,height/2f,width/3.toFloat(), mPaint!!)
```

**5. 扫描渲染 SweepGradient**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191130000235.png)

```kotlin
        /**
         * 扫描渲染
         * cx,cy 渐变中心坐标
         * color0,color1：渐变开始结束颜色
         * colors，positions：类似LinearGradient,用于多颜色渐变,positions为null时，根据颜色线性渐变
         */
        val mSweepGradient = SweepGradient(width/2f,height/2f, mColors, null)
        mPaint!!.setShader(mSweepGradient)
        canvas.drawCircle(width/2f,height/2f,width/3.toFloat(), mPaint!!)
```

**6. 组合渲染 ComposeShader**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191130000719.png)

```kotlin
        /**
         * 组合渲染，
         * ComposeShader(@NonNull Shader shaderA, @NonNull Shader shaderB, Xfermode mode)
         * ComposeShader(@NonNull Shader shaderA, @NonNull Shader shaderB, PorterDuff.Mode mode)
         * shaderA,shaderB:要混合的两种shader
         * Xfermode mode： 组合两种shader颜色的模式
         * PorterDuff.Mode mode: 组合两种shader颜色的模式
         */
        val bitMapShader = BitmapShader(
            mBitMap!!, Shader.TileMode.REPEAT,
            Shader.TileMode.REPEAT
        )
        val linearGradient = LinearGradient(
            0f, 0f, 800f, 800f,
            mColors, null, Shader.TileMode.CLAMP
        )
        val mComposeShader = ComposeShader(linearGradient, bitMapShader, PorterDuff.Mode.SRC_OVER)
        mPaint!!.setShader(mComposeShader)
        canvas.drawRect(0f, 0f, 800f, 1000f, mPaint!!)
```

**7. 绘制心型 ComposeShader**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191130001448.png)

```kotlin
        //创建BitmapShader，用以绘制心
        val mBitmap = (resources.getDrawable(R.mipmap.heart) as BitmapDrawable).bitmap
        val bitmapShader = BitmapShader(mBitmap, Shader.TileMode.CLAMP, Shader.TileMode.CLAMP)
        //创建LinearGradient，用以产生从左上角到右下角的颜色渐变效果
        val linearGradient = LinearGradient(
            0f, 0f, mWidth.toFloat(), mHeight.toFloat(),
            Color.BLUE, Color.RED, Shader.TileMode.CLAMP
        )
        //bitmapShader对应目标像素，linearGradient对应源像素，像素颜色混合采用MULTIPLY模式
        val composeShader = ComposeShader(linearGradient, bitmapShader, PorterDuff.Mode.MULTIPLY)
//         ComposeShader composeShader2 = new ComposeShader(composeShader, linearGradient, PorterDuff.Mode.MULTIPLY);
        //将组合的composeShader作为画笔paint绘图所使用的shader
        mPaint!!.setShader(composeShader)
        //用composeShader绘制矩形区域
        canvas.drawRect(0f, 0f, mBitmap.width.toFloat(), mBitmap.height.toFloat(), mPaint!!)
        //所谓渲染就是对于我们绘制区域进行按照上诉渲染规则进行色彩的填充
```

**9. 线性渲染-字体渐变 LinearGradient**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191130181950.gif)

```kotlin
class LinearGradientTextView : TextView {

    /**
     * 定义线性渐变
     */
    private var mLinearGradient: LinearGradient? = null

    /**
     * 定义一个矩阵
     */
    private var mGradientatrix: Matrix? = null

    /**
     * 定义一个画笔
     */
    private var mPaint: Paint? = null

    private var mViewWidth = 0
    private var mTranslate = 0

    private var delta = 15



    constructor(context: Context?) : super(context)
    constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs)
    constructor(context: Context?, attrs: AttributeSet?, defStyleAttr: Int) : super(context, attrs, defStyleAttr)


    /**
     * 当字改变的时候回调
     */
    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        if (mViewWidth ==0){
            //拿到当前 text 宽度
            mViewWidth = measuredWidth
            if (mViewWidth > 0){
                //拿到当前画笔
                mPaint = paint
                //拿到 text
                var text = text.toString()
                //mViewWidth除字体总数就得到了每个字的像素    然后*3 表示3个文字的像素
                var size = 0;
                //如果当前 text 长度大于 0
                if (text.length > 0){
                    //拿到当前 3 个文字的像素
                    size = mViewWidth / text.length * 3

                }else{//说明没有文字
                    size = mViewWidth
                }
                /**线性渲染
                 * x0, y0, 起始点
                 *  x1, y1, 结束点
                 * int[]  mColors, 中间依次要出现的几个颜色
                 * float[] positions 位置数组，position的取值范围[0,1]，作用是指定几个颜色分别放置在那个位置上，
                 * 如果传null，渐变就线性变化。
                 *    tile 用于指定控件区域大于指定的渐变区域时，空白区域的颜色填充方法
                 */
                //从左边 size 开始，左边看不见的地方开始，以滚动扫描的形式过来
                mLinearGradient = LinearGradient(-size.toFloat(),0f,0f,0f, intArrayOf(0x33ffffff, -0x1, 0x33ffffff),
                    floatArrayOf(0f, 0.2f, 1f), Shader.TileMode.CLAMP)
                //将线性渐变添加到 paint 中
                mPaint!!.setShader(mLinearGradient)
                //定义一个矩阵
                mGradientatrix = Matrix()
            }
        }
    }

    /**
     * 开始绘制
     */
    override fun draw(canvas: Canvas?) {
        super.draw(canvas)
        val measureWindth = paint.measureText(text.toString())
        mTranslate += delta
        /**
         * 如果位置已经移动到了边界，那么文字就开始往回滚动
         * 但是如果小于 1 那么又开始递增，执行另一个逻辑
         */
        if (mTranslate > measureWindth + 1 || mTranslate < 1){
            delta = -delta
        }

        //将矩阵平移
        mGradientatrix!!.setTranslate(mTranslate.toFloat(),0f)
        mLinearGradient!!.setLocalMatrix(mGradientatrix)
        //paint是textview的所以只需要不断色控制画笔的shader  然后利用矩阵控制位移即可
        postInvalidateDelayed(30)

    }
}
```

**10. 雷达扫描 SweepGradient**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191130192832.gif)

```kotlin
/**
 * <pre>
 *     author  : devyk on 2019-11-30 18:50
 *     blog    : https://juejin.im/user/578259398ac2470061f3a3fb/posts
 *     github  : https://github.com/yangkun19921001
 *     mailbox : yang1001yk@gmail.com
 *     desc    : This is RadarGradientView 渐变渲染/梯度渲染
 * </pre>
 */
class RadarGradientView : View {


    private var mWidth: Int = 0
    private var mHeight: Int = 0

    private val    TAG = javaClass.simpleName

    //五个圆
    private val pots = floatArrayOf(0.05f, 0.1f, 0.15f, 0.2f, 0.25f, 0.3f, 0.35f)

    private var scanShader: Shader? = null // 扫描渲染shader
    private val scanSpeed = 10 // 扫描速度
    private var scanAngle: Int = 0 // 扫描旋转的角度

    private lateinit var mMatrix: Matrix // 旋转需要的矩阵

    private  var mPaintCircle = Paint() // 画圆用到的paint
    private  var mPaintRadar = Paint() // 扫描用到的paint

    private val run = object : Runnable {
        override fun run() {
            scanAngle = (scanAngle + scanSpeed) % 125 //
            Log.d(TAG,"scanAngle:$scanAngle")
            mMatrix.postRotate(scanSpeed.toFloat(), (mWidth / 2).toFloat(), (mHeight / 2).toFloat()) // 旋转矩阵
            invalidate() // 通知view重绘
            postDelayed(this, 50) // 调用自身 重复绘制
        }
    }

    constructor(context: Context) : super(context) {
        init()
    }

    private fun init() {
        mMatrix = Matrix()
        // 画圆用到的paint
        mPaintCircle = Paint()
        mPaintCircle.style = Paint.Style.STROKE // 描边
        mPaintCircle.strokeWidth = 1f // 宽度
        mPaintCircle.alpha = 100 // 透明度
        mPaintCircle.isAntiAlias = true // 抗锯齿
        mPaintCircle.color = Color.parseColor("#B0C4DE") // 设置颜色 亮钢兰色

        // 扫描用到的paint
        mPaintRadar = Paint()
        mPaintRadar.style = Paint.Style.FILL_AND_STROKE // 填充
        mPaintRadar.isAntiAlias = true // 抗锯齿


        post(run)
    }

    constructor(context: Context, attrs: AttributeSet?) : super(context, attrs) {
        init()
    }

    constructor(context: Context, attrs: AttributeSet?, defStyleAttr: Int) : super(context, attrs, defStyleAttr) {}


    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        Log.d(TAG,"onDraw()")
        for (i in pots.indices) {
            canvas.drawCircle((mWidth / 2).toFloat(), (mHeight / 2).toFloat(), mWidth * pots[i], mPaintCircle)
        }

        // 画布的旋转变换 需要调用save() 和 restore()
        canvas.save()

        scanShader = SweepGradient(
            (mWidth / 2).toFloat(), (mHeight / 2).toFloat(),
            intArrayOf(Color.TRANSPARENT, Color.parseColor("#84B5CA")), null
        )
        mPaintRadar.shader = scanShader // 设置着色器
        canvas.concat(mMatrix)
        canvas.drawCircle((mWidth / 2).toFloat(), (mHeight / 2).toFloat(), mWidth * pots[6], mPaintRadar)

        canvas.restore()
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        Log.d(TAG,"onMeasure()")
        // 取屏幕的宽高是为了把雷达放在屏幕的中间
        mWidth = measuredWidth
        mHeight = measuredHeight
        mHeight = Math.min(mWidth, mHeight)
        mWidth = mHeight
    }

}
```

**11. 放大镜 BitmapShader**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191130194800.gif)

```kotlin
class ZoomImageView : View {
    // 原图
    private val mBitmap: Bitmap
    // 放大后的图
    private var mBitmapScale: Bitmap? = null
    // 制作的圆形的图片（放大的局部），盖在Canvas上面
    private val mShapeDrawable: ShapeDrawable

    private val mMatrix: Matrix

    constructor(context: Context?) : super(context)
    constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs)
    constructor(context: Context?, attrs: AttributeSet?, defStyleAttr: Int) : super(context, attrs, defStyleAttr)

    init {

        mBitmap = BitmapFactory.decodeResource(resources, R.mipmap.gild_3)
        mBitmapScale = mBitmap
        //放大后的整个图片
        mBitmapScale = Bitmap.createScaledBitmap(
            mBitmapScale!!, mBitmapScale!!.width * FACTOR,
            mBitmapScale!!.height * FACTOR, true
        )
        val bitmapShader = BitmapShader(
            mBitmapScale!!, Shader.TileMode.CLAMP,
            Shader.TileMode.CLAMP
        )

        mShapeDrawable = ShapeDrawable(OvalShape())
        mShapeDrawable.paint.shader = bitmapShader
        // 切出矩形区域，用来画圆（内切圆）
        mShapeDrawable.setBounds(0, 0, RADIUS * 2, RADIUS * 2)

        mMatrix = Matrix()
    }




    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)


        // 1、画原图
        canvas.drawBitmap(mBitmap, 0f, 0f, null)

        // 2、画放大镜的图
        mShapeDrawable.draw(canvas)
    }


    override fun onTouchEvent(event: MotionEvent): Boolean {
        val x = event.x.toInt()
        val y = event.y.toInt() - RADIUS

        Log.d("onTouchEvent", "x:" + x + "y:" + y)

        // 将放大的图片往相反的方向挪动
        mMatrix.setTranslate((RADIUS - x * FACTOR).toFloat(), (RADIUS - y * FACTOR).toFloat())
        mShapeDrawable.paint.shader.setLocalMatrix(mMatrix)
        // 切出手势区域点位置的圆
        mShapeDrawable.setBounds(x - RADIUS, y - RADIUS, x + RADIUS, y + RADIUS)
//        invalidate()
        postInvalidate()
        return true
    }

    companion object {

        //放大倍数
        private val FACTOR = 3
        //放大镜的半径
        private val RADIUS = 300
    }
}
```

### 滤镜

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191130220253.png)

```kotlin
//平移运算---加法
ColorMatrix colorMartrix = new ColorMatrix(new float[]{
                        1, 0,0,0,0,
                        0,1,0,0,100,
                        0,0,1,0,0,
                        0,0,0,1,0,
                });

//反相效果 -- 底片效果
ColorMatrix colorMartrix = new ColorMatrix(new float[]{
                        -1, 0,0,0,255,
                        0,-1,0,0,255,
                        0,0,-1,0,255,
                        0,0,0,1,0,
                });
//缩放运算---乘法 -- 颜色增强
ColorMatrix colorMartrix = new ColorMatrix(new float[]{
                        1.2f, 0,0,0,0,
                        0,1.2f,0,0,0,
                        0,0,1.2f,0,0,
                        0,0,0,1.2f,0,
});
        /** 黑白照片
         * 是将我们的三通道变为单通道的灰度模式
         * 去色原理：只要把R G B 三通道的色彩信息设置成一样，那么图像就会变成灰色，
         * 同时为了保证图像亮度不变，同一个通道里的R+G+B =1
         */
ColorMatrix colorMartrix = new ColorMatrix(new float[]{
                        0.213f, 0.715f,0.072f,0,0,
                        0.213f, 0.715f,0.072f,0,0,
                        0.213f, 0.715f,0.072f,0,0,
                        0,0,0,1,0,
                });


//发色效果---（比如红色和绿色交换）
ColorMatrix colorMartrix = new ColorMatrix(new float[]{
                        1,0,0,0,0,
                        0, 0,1,0,0,
                        0,1,0,0,0,
                        0,0,0,0.5F,0,
                });
//复古效果
ColorMatrix colorMartrix = new ColorMatrix(new float[]{
                        1/2f,1/2f,1/2f,0,0,
                        1/3f, 1/3f,1/3f,0,0,
                        1/4f,1/4f,1/4f,0,0,
                        0,0,0,1,0,
});
```

```kotlin
class FilterView : View {

    private var paint = Paint()

    lateinit var bitmap: Bitmap

    constructor(context: Context?) : super(context)
    constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs)
    constructor(context: Context?, attrs: AttributeSet?, defStyleAttr: Int) : super(context, attrs, defStyleAttr)

    /**
     * 显示的高
     */
    var showHeight = 0

    init {

        init()
    }

    private fun init() {

        paint = Paint(Paint.ANTI_ALIAS_FLAG)
        paint.color = Color.RED

        bitmap = BitmapFactory.decodeResource(resources, R.mipmap.gild_3)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
//        //关闭单个View的硬件加速功
//        //        setLayerType(View.LAYER_TYPE_SOFTWARE,null);




        //1. 缩放运算---乘法 -- 颜色增强
        val colorMartrix = ColorMatrix(
            floatArrayOf(
                1.2f, 0f, 0f, 0f, 0f,
                0f, 1.2f, 0f, 0f, 0f,
                0f, 0f, 1.2f, 0f, 0f,
                0f, 0f, 0f, 1.2f, 0f
            )
        )
        val rectF = RectF(
                0f,
            showHeight.toFloat() ,
                (bitmap.width / 2).toFloat(),
                (bitmap.height / 4).toFloat()
            )
        drawFilterBitmap(colorMartrix, canvas,rectF)

        showHeight += bitmap.height / 4



        //2 平移运算---加法
     var colorMartrix2 = ColorMatrix(floatArrayOf(
                        1f, 0f,0f,0f,0f,
                        0f,1f,0f,0f,100f,
                        0f,0f,1f,0f,0f,
                        0f,0f,0f,1f,0f
                    ))

        val rectF2 = RectF(
            0f,
            showHeight.toFloat(),
            (bitmap.width / 2).toFloat(),
            (bitmap.height /4) * 2.toFloat()
        )
        drawFilterBitmap(colorMartrix2, canvas,rectF2)


        showHeight += bitmap.height / 4



        //3. 反相效果 -- 底片效果
               var colorMartrix3 =  ColorMatrix(floatArrayOf(
                        -1f, 0f,0f,0f,255f,
                        0f,-1f,0f,0f,255f,
                        0f,0f,-1f,0f,255f,
                        0f,0f,0f,1f,0f
                   ));

        val rectF3 = RectF(
            0f,
            showHeight.toFloat(),
            (bitmap.width / 2).toFloat(),
            (bitmap.height /4) * 3.toFloat()
        )
        drawFilterBitmap(colorMartrix3, canvas,rectF3)


        /**
         * 4.黑白照片
         * 是将我们的三通道变为单通道的灰度模式
         * 去色原理：只要把R G B 三通道的色彩信息设置成一样，那么图像就会变成灰色，
         * 同时为了保证图像亮度不变，同一个通道里的R+G+B =1
         */
                var colorMartrix4 =  ColorMatrix(floatArrayOf(
                        0.213f, 0.715f,0.072f,0f,0f,
                        0.213f, 0.715f,0.072f,0f,0f,
                        0.213f, 0.715f,0.072f,0f,0f,
                        0f,0f,0f,1f,0f
            ));


        showHeight += bitmap.height / 4
        val rectF4 = RectF(
            bitmap.width/2f,
            bitmap.height /2f,
            (bitmap.width).toFloat(),
            (bitmap.height /4) * 3.toFloat()
        )
        drawFilterBitmap(colorMartrix4, canvas,rectF4)



         //5.发色效果---（比如红色和绿色交换）
                var colorMartrix5 =  ColorMatrix(floatArrayOf(
                        1f,0f,0f,0f,0f,
                        0f, 0f,1f,0f,0f,
                        0f,1f,0f,0f,0f,
                        0f,0f,0f,0.5F,0f
                    ));

        val rectF5 = RectF(
            bitmap.width / 2f,
            0f,
            (bitmap.width / 2 * 2).toFloat(),
            (bitmap.height /4) .toFloat()
        )
        drawFilterBitmap(colorMartrix5, canvas,rectF5)



        //6.复古效果
       var colorMartrix6=  ColorMatrix(floatArrayOf(
                        1/2f,1/2f,1/2f,0f,0f,
                        1/3f, 1/3f,1/3f,0f,0f,
                        1/4f,1/4f,1/4f,0f,0f,
                        0f,0f,0f,1f,0f
                    ));

        val rectF6 = RectF(
            bitmap.width / 2f,
            bitmap.height /4f,
            (bitmap.width / 2 * 2).toFloat(),
            (bitmap.height /4 * 2) .toFloat()
        )
        drawFilterBitmap(colorMartrix6, canvas,rectF6)



    }

    private fun drawFilterBitmap(colorMartrix: ColorMatrix, canvas: Canvas,rectF: RectF) {

        paint.colorFilter = ColorMatrixColorFilter(colorMartrix)
        canvas.drawBitmap(bitmap, null, rectF, paint)
    }


}
```

### xfermode

```php
    private static final Xfermode[] sModes = {
        new PorterDuffXfermode(PorterDuff.Mode.CLEAR),      // 清空所有，要闭硬件加速，否则无效
        new PorterDuffXfermode(PorterDuff.Mode.SRC),        // 显示前都图像，不显示后者
        new PorterDuffXfermode(PorterDuff.Mode.DST),        // 显示后者图像，不显示前者
        new PorterDuffXfermode(PorterDuff.Mode.SRC_OVER),   // 后者叠于前者
        new PorterDuffXfermode(PorterDuff.Mode.DST_OVER),   // 前者叠于后者
        new PorterDuffXfermode(PorterDuff.Mode.SRC_IN),     // 显示相交的区域，但图像为后者
        new PorterDuffXfermode(PorterDuff.Mode.DST_IN),     // 显示相交的区域，但图像为前者
        new PorterDuffXfermode(PorterDuff.Mode.SRC_OUT),    // 显示后者不重叠的图像
        new PorterDuffXfermode(PorterDuff.Mode.DST_OUT),    // 显示前者不重叠的图像
        new PorterDuffXfermode(PorterDuff.Mode.SRC_ATOP),   // 显示前者图像，与后者重合的图像
        new PorterDuffXfermode(PorterDuff.Mode.DST_ATOP),   // 显示后者图像，与前者重合的图像
        new PorterDuffXfermode(PorterDuff.Mode.XOR),        // 显示持有不重合的图像
        new PorterDuffXfermode(PorterDuff.Mode.DARKEN),     // 后者叠于前者上，后者与前者重叠的部份透明。要闭硬件加速，否则无效
        new PorterDuffXfermode(PorterDuff.Mode.LIGHTEN),    // 前者叠于前者，前者与后者重叠部份透明。要闭硬件加速，否则无效
        new PorterDuffXfermode(PorterDuff.Mode.MULTIPLY),   // 显示重合的图像，且颜色会合拼
        new PorterDuffXfermode(PorterDuff.Mode.SCREEN)    // 显示持有图像，重合的会变白
    };
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191130220749.png)

```kotlin
class XfermodeView : View {

    lateinit var mPaint: Paint
    internal var mItemSize = 0f
    internal var mItemHorizontalOffset = 0f
    internal var mItemVerticalOffset = 0f
    internal var mCircleRadius = 0f
    internal var mRectSize = 0f
    internal var mCircleColor = -0x33bc//黄色
    internal var mRectColor = -0x995501//蓝色
    internal var mTextSize = 25f

    constructor(context: Context) : super(context) {
        init(null, 0)
    }

    constructor(context: Context, attrs: AttributeSet) : super(context, attrs) {
        init(attrs, 0)
    }

    constructor(context: Context, attrs: AttributeSet, defStyle: Int) : super(context, attrs, defStyle) {
        init(attrs, defStyle)
    }

    private fun init(attrs: AttributeSet?, defStyle: Int) {
        if (Build.VERSION.SDK_INT >= 11) {
            setLayerType(View.LAYER_TYPE_SOFTWARE, null)
        }
        mPaint = Paint(Paint.ANTI_ALIAS_FLAG)
        mPaint.textSize = mTextSize
        mPaint.textAlign = Paint.Align.CENTER
        mPaint.strokeWidth = 2f
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        //设置背景色
        //        canvas.drawARGB(255, 139, 197, 186);

        val canvasWidth = canvas.width
        val canvasHeight = canvas.height

        for (row in 0..3) {
            for (column in 0..3) {
                canvas.save()
                val layer =
                    canvas.saveLayer(0f, 0f, canvasWidth.toFloat(), canvasHeight.toFloat(), null, Canvas.ALL_SAVE_FLAG)
                mPaint.xfermode = null
                val index = row * 4 + column
                val translateX = (mItemSize + mItemHorizontalOffset) * column
                val translateY = (mItemSize + mItemVerticalOffset) * row
                canvas.translate(translateX, translateY)
                //画文字
                val text = sLabels[index]
                mPaint.color = Color.BLACK
                val textXOffset = mItemSize / 2
                val textYOffset = mTextSize + (mItemVerticalOffset - mTextSize) / 2
                canvas.drawText(text, textXOffset, textYOffset, mPaint)
                canvas.translate(0f, mItemVerticalOffset)
                //画边框
                mPaint.style = Paint.Style.STROKE
                mPaint.color = -0x1000000
                canvas.drawRect(2f, 2f, mItemSize - 2, mItemSize - 2, mPaint)
                mPaint.style = Paint.Style.FILL
                //画圆
                mPaint.color = mCircleColor
                val left = mCircleRadius + 3
                val top = mCircleRadius + 3
                canvas.drawCircle(left, top, mCircleRadius, mPaint)
                mPaint.xfermode = sModes[index]
                //画矩形
                mPaint.color = mRectColor
                val rectRight = mCircleRadius + mRectSize
                val rectBottom = mCircleRadius + mRectSize
                canvas.drawRect(left, top, rectRight, rectBottom, mPaint)
                mPaint.xfermode = null
                //canvas.restore();
                canvas.restoreToCount(layer)
            }
        }
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        mItemSize = w / 4.5f
        mItemHorizontalOffset = mItemSize / 6
        mItemVerticalOffset = mItemSize * 0.426f
        mCircleRadius = mItemSize / 3
        mRectSize = mItemSize * 0.6f
    }

    companion object {

        private val sModes = arrayOf<Xfermode>(
            PorterDuffXfermode(PorterDuff.Mode.CLEAR),
            PorterDuffXfermode(PorterDuff.Mode.SRC),
            PorterDuffXfermode(
                PorterDuff.Mode.DST
            ),
            PorterDuffXfermode(PorterDuff.Mode.SRC_OVER),
            PorterDuffXfermode(PorterDuff.Mode.DST_OVER),
            PorterDuffXfermode(
                PorterDuff.Mode.SRC_IN
            ),
            PorterDuffXfermode(PorterDuff.Mode.DST_IN),
            PorterDuffXfermode(PorterDuff.Mode.SRC_OUT),
            PorterDuffXfermode(
                PorterDuff.Mode.DST_OUT
            ),
            PorterDuffXfermode(PorterDuff.Mode.SRC_ATOP),
            PorterDuffXfermode(PorterDuff.Mode.DST_ATOP),
            PorterDuffXfermode(
                PorterDuff.Mode.XOR
            ),
            PorterDuffXfermode(PorterDuff.Mode.DARKEN),
            PorterDuffXfermode(PorterDuff.Mode.LIGHTEN),
            PorterDuffXfermode(
                PorterDuff.Mode.MULTIPLY
            ),
            PorterDuffXfermode(PorterDuff.Mode.SCREEN)
        )

        private val sLabels = arrayOf(
            "Clear",
            "Src",
            "Dst",
            "SrcOver",
            "DstOver",
            "SrcIn",
            "DstIn",
            "SrcOut",
            "DstOut",
            "SrcATop",
            "DstATop",
            "Xor",
            "Darken",
            "Lighten",
            "Multiply",
            "Screen"
        )
    }
}
```

**1. 画圆角 PorterDuff.Mode.DST\_IN**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191201135601.png)

```kotlin
public class RoudImageView : View {

    constructor(context: Context?) : super(context)
    constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs) {
        init()
    }
    var mBitPaint =  Paint()
    private lateinit var mBmpDST: Bitmap
    private lateinit var mBmpSRC: Bitmap
    private fun init() {
        setLayerType(View.LAYER_TYPE_SOFTWARE, null)
        mBmpDST = changeBitmapSize(R.mipmap.gild_3)
        mBmpSRC = changeBitmapSize(R.drawable.shade)
    }

    constructor(context: Context?, attrs: AttributeSet?, defStyleAttr: Int) : super(context, attrs, defStyleAttr)


    override fun draw(canvas: Canvas) {
        super.draw(canvas)
        val saveLayer = canvas.saveLayer(0f, 0f, width.toFloat(), height.toFloat(), null, Canvas.ALL_SAVE_FLAG)
        canvas.drawBitmap(mBmpDST,0f,0f,mBitPaint)
        mBitPaint.setXfermode(PorterDuffXfermode(PorterDuff.Mode.DST_IN))
        canvas.drawBitmap(mBmpSRC,0f,0f,mBitPaint)

        mBitPaint.setXfermode(null)
        canvas.restoreToCount(saveLayer)
    }
    private fun  changeBitmapSize(res: Int) : Bitmap {
        var bitmap = BitmapFactory.decodeResource(getResources(), res);
        var width = bitmap.getWidth();
        var height = bitmap.getHeight();
        Log.e("width","width:"+width);
        Log.e("height","height:"+height);
        //设置想要的大小
        var newWidth=500;
        var newHeight=500;

        //计算压缩的比率
        var scaleWidth=(newWidth)/width .toFloat()
        var scaleHeight=(newHeight)/height.toFloat();

        //获取想要缩放的matrix
        var matrix =  Matrix();
        matrix.postScale(scaleWidth,scaleHeight.toFloat());

        //获取新的bitmap
        bitmap=Bitmap.createBitmap(bitmap,0,0,width,height,matrix,true);
        bitmap.getWidth();
        bitmap.getHeight();
        Log.e("newWidth","newWidth"+bitmap.getWidth());
        Log.e("newHeight","newHeight"+bitmap.getHeight());
        return bitmap;
    }

}
```

**2. 倒影 PorterDuff.Mode.DST\_IN**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191201141716.png)

```kotlin
class InvertedImageView(context: Context, attrs: AttributeSet) : View(context, attrs) {
    private val mBitPaint: Paint
    private val BmpDST: Bitmap
    private val BmpSRC: Bitmap
    private val BmpRevert: Bitmap

    init {
        setLayerType(View.LAYER_TYPE_SOFTWARE, null)
        mBitPaint = Paint()
        BmpDST = BitmapUtis.changeBitmapSize(context,R.mipmap.gild_3)
        BmpSRC = BitmapUtis.changeBitmapSize(context,R.drawable.invert_shade)

        val matrix = Matrix()
        matrix.setScale(1f, -1f)
        // 生成倒影图
        BmpRevert = Bitmap.createBitmap(BmpDST, 0, 0, BmpDST.width, BmpDST.height, matrix, true)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        canvas.drawColor(Color.BLACK)


        //先画出原始图片
        canvas.drawBitmap(BmpDST, 0f, 0f, mBitPaint)

        //再画出倒影
        val layerId = canvas.saveLayer(0f, 0f, width.toFloat(), height.toFloat(), null, Canvas.ALL_SAVE_FLAG)
        canvas.translate(0f, BmpSRC.height.toFloat())

        canvas.drawBitmap(BmpRevert, 0f, 0f, mBitPaint)
        mBitPaint.xfermode = PorterDuffXfermode(PorterDuff.Mode.DST_IN)
        canvas.drawBitmap(BmpSRC, 0f, 0f, mBitPaint)

        mBitPaint.xfermode = null

        canvas.restoreToCount(layerId)
    }
}
```

**4. 不规则波浪 PorterDuff.Mode.DST\_IN**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191201143513.gif)

```kotlin
class IrregularWaveView(context: Context, attrs: AttributeSet) : View(context, attrs) {

    private val mPaint: Paint
    private var mItemWaveLength = 0
    private var dx = 0

    private val BmpSRC: Bitmap
    private val BmpDST: Bitmap

    init {
        mPaint = Paint()

        BmpDST = BitmapFactory.decodeResource(resources, R.drawable.wav, null)
        BmpSRC = BitmapFactory.decodeResource(resources, R.drawable.circle_shape, null)
        //不要让它超出边界
        mItemWaveLength = BmpDST.width - BmpSRC.width

        startAnim()
    }


    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        //先画上圆形
        canvas.drawBitmap(BmpSRC, 0f, 0f, mPaint)

        //再画上结果
        val layerId = canvas.saveLayer(0f, 0f, width.toFloat(), height.toFloat(), null, Canvas.ALL_SAVE_FLAG)
        canvas.drawBitmap(
            BmpDST,
            Rect(dx, 0, dx + BmpSRC.width, BmpSRC.height),
            Rect(0, 0, BmpSRC.width, BmpSRC.height),
            mPaint
        )
        mPaint.xfermode = PorterDuffXfermode(PorterDuff.Mode.DST_IN)
        canvas.drawBitmap(BmpSRC, 0f, 0f, mPaint)
        mPaint.xfermode = null
        canvas.restoreToCount(layerId)


    }


    fun startAnim() {
        val animator = ValueAnimator.ofInt(0, mItemWaveLength)
        animator.duration = 2000
        animator.repeatCount = ValueAnimator.INFINITE
        animator.interpolator = LinearInterpolator()
        animator.addUpdateListener { animation ->
            dx = animation.animatedValue as Int
            postInvalidate()
        }
        animator.start()
    }
}
```

**5.心电图 PorterDuff.Mode.DST\_IN**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191201145258.gif)

```kotlin
class HeartView(context: Context, attrs: AttributeSet) : View(context, attrs) {

    private val mPaint: Paint
    private var mItemWaveLength = 0
    private var dx = 0

    private val BmpSRC: Bitmap
    private val BmpDST: Bitmap

    init {

        mPaint = Paint()
        mPaint.color = Color.RED

        BmpDST = BitmapFactory.decodeResource(resources, R.drawable.heartmap, null)
        BmpSRC = Bitmap.createBitmap(BmpDST.width, BmpDST.height, Bitmap.Config.ARGB_8888)

        mItemWaveLength = BmpDST.width

        startAnim()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val c = Canvas(BmpSRC)
        //清空bitmap
        c.drawColor(Color.RED, PorterDuff.Mode.CLEAR)
        Log.d("onDraw","左移动:${BmpDST.width - dx}");

        //画上矩形
        c.drawRect((BmpDST.width - dx).toFloat(), 0f, BmpDST.width.toFloat(), BmpDST.height.toFloat(), mPaint)

        //模式合成
        val layerId = canvas.saveLayer(0f, 0f, width.toFloat(), height.toFloat(), null, Canvas.ALL_SAVE_FLAG)
        canvas.drawBitmap(BmpDST, 0f, 0f, mPaint)
        mPaint.xfermode = PorterDuffXfermode(PorterDuff.Mode.DST_IN)
        canvas.drawBitmap(BmpSRC, 0f, 0f, mPaint)
        mPaint.xfermode = null
        canvas.restoreToCount(layerId)
    }


    fun startAnim() {
        val animator = ValueAnimator.ofInt(0, mItemWaveLength)
        animator.duration = 6000
        animator.repeatCount = ValueAnimator.INFINITE
        animator.interpolator = LinearInterpolator()
        animator.addUpdateListener { animation ->
            dx = animation.animatedValue as Int
            postInvalidate()
        }
        animator.start()
    }
}
```

**6. PorterDuff.Mode.MULTIPLY**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191201145939.png)

```kotlin
class TwitterView(context: Context, attrs: AttributeSet) : View(context, attrs) {
    private val mBitPaint: Paint
    private val BmpDST: Bitmap
    private val BmpSRC: Bitmap

    init {
        setLayerType(View.LAYER_TYPE_SOFTWARE, null)
        mBitPaint = Paint()
        //目标图像
        BmpDST = BitmapFactory.decodeResource(resources, R.drawable.twiter_bg, null)
        //原图像
        BmpSRC = BitmapFactory.decodeResource(resources, R.drawable.twiter_light, null)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val layerId = canvas.saveLayer(0f, 0f, width.toFloat(), height.toFloat(), null, Canvas.ALL_SAVE_FLAG)

        canvas.drawBitmap(BmpDST, 0f, 0f, mBitPaint)
        mBitPaint.xfermode = PorterDuffXfermode(PorterDuff.Mode.MULTIPLY)
        canvas.drawBitmap(BmpSRC, 0f, 0f, mBitPaint)

        mBitPaint.xfermode = null
        canvas.restoreToCount(layerId)
    }
}
```

**7. PorterDuff.Mode.SRC\_OUT**

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191201150824.gif)

```kotlin
class GuaGuaCardView(context: Context, attrs: AttributeSet) : View(context, attrs) {
    private val mBitPaint: Paint
    private val BmpDST: Bitmap
    private val BmpSRC: Bitmap
    private val BmpText: Bitmap
    private val mPath: Path
    private var mPreX: Float = 0.toFloat()
    private var mPreY: Float = 0.toFloat()

    init {

        setLayerType(View.LAYER_TYPE_SOFTWARE, null)
        mBitPaint = Paint()
        mBitPaint.color = Color.RED
        mBitPaint.style = Paint.Style.STROKE
        mBitPaint.strokeWidth = 45f

        BmpText = BitmapFactory.decodeResource(resources, R.drawable.guaguaka_text1, null)
        BmpSRC = BitmapFactory.decodeResource(resources, R.drawable.guaguaka, null)
        BmpDST = Bitmap.createBitmap(BmpSRC.width, BmpSRC.height, Bitmap.Config.ARGB_8888)
        mPath = Path()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        canvas.drawBitmap(BmpText, 0f, 0f, mBitPaint)

        val layerId = canvas.saveLayer(0f, 0f, width.toFloat(), height.toFloat(), null, Canvas.ALL_SAVE_FLAG)

        //先把手指轨迹画到目标Bitmap上
        val c = Canvas(BmpDST)
        c.drawPath(mPath, mBitPaint)

        //然后把目标图像画到画布上
        canvas.drawBitmap(BmpDST, 0f, 0f, mBitPaint)

        //计算源图像区域
        mBitPaint.xfermode = PorterDuffXfermode(PorterDuff.Mode.SRC_OUT)
        canvas.drawBitmap(BmpSRC, 0f, 0f, mBitPaint)

        mBitPaint.xfermode = null
        canvas.restoreToCount(layerId)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                mPath.moveTo(event.x, event.y)
                mPreX = event.x
                mPreY = event.y
                return true
            }
            MotionEvent.ACTION_MOVE -> {
                val endX = (mPreX + event.x) / 2
                val endY = (mPreY + event.y) / 2
                mPath.quadTo(mPreX, mPreY, endX, endY)
                mPreX = event.x
                mPreY = event.y
            }
            MotionEvent.ACTION_UP -> {
            }
        }
        postInvalidate()
        return super.onTouchEvent(event)
    }
}
```

## 总结

可以发现 Paint 其实也能干很多事儿，上面代码已上传至 [GitHub](https://github.com/yangkun19921001/CustomViewSample)

## 参考

* [http://wuxiaolong.me/2016/08/20/Paint/](http://wuxiaolong.me/2016/08/20/Paint/)
* [https://blog.csdn.net/shell812/article/details/49781397?ref=myread](https://blog.csdn.net/shell812/article/details/49781397?ref=myread)

