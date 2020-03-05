# 高级 UI 成长之路 \(五\) Canvas 详解

## 前言

上一篇文章介绍了 Paint 的 API 和 [Paint 高级使用](https://juejin.im/post/5de36c43f265da05de5881e8) ，下面再来讲讲有关 Canvas 绘图的知识，Canvas 可以实现很多绘图方式, 该篇就全面介绍 Canvas 的使用。

今天逛 [掘金](https://juejin.im/timeline/android) 发现了一种讲解自定义好的方式，可以去看原文[Android关于Canvas你所知道的和不知道的一切](https://juejin.im/post/5be29aa2e51d45228170ff33)，就是以坐标系的方式来讲解，我觉得应该很容易理解，比如，我想要在屏幕 `x == 500,y == 500 ,radius ==150` 的坐标点上绘制一个圆，那么效果就是如下:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191201205523.png)

感觉是不是很清晰，一目了然就知道该 View 处于什么位置了。

## Canvas

### Canvas 基础使用

#### 绘制背景颜色

```java
//color:使用 0x  样式的十六进制的颜色值 
void drawColor(int color);
//允许传入 a,r,g,b 分量，每个颜色值取值范围为 0~255
void drawARGB(int a, int r, int g, int b)
//只允许传入 R.G.b 颜色的分量，透明度 alpha 的值取 255
void drawRGB(int r, int g, int b)
```

绘制一个红色背景，效果如下

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191201214058.png)

```kotlin
    override fun draw(canvas: Canvas) {
        super.draw(canvas)
        //1.
        canvas.drawColor(Color.RED)
        //2.
//        canvas.drawARGB(0xff,0xff,0,0x00)
        //3.
//        canvas.drawRGB(0xff,0x00,0x00)
    }
```

三个 API 效果一样

#### 绘制直线

```java
//startX,y 起点坐标
//stopX,y 终点坐标
//paint 画笔
void drawLine(float startX, float startY, float stopX, float stopY,
            @NonNull Paint paint)
void drawLines(@Size(multiple = 4) @NonNull float[] pts, int offset, int count,
            @NonNull Paint paint)
void drawLines(@Size(multiple = 4) @NonNull float[] pts, @NonNull Paint paint)
```

```kotlin
    override fun draw(canvas: Canvas) {
        super.draw(canvas)
        mPaint.strokeWidth = 10f
        mPaint.setColor(Color.RED)
        //1.
        canvas.drawLine(100f,100f,600f,600f,mPaint)
        //2.
        canvas.drawLines(floatArrayOf(
            100f,100f,600f,600f
        ),mPaint)
        //3. //第一个参数是一个坐标点组
                  //第二个参数从哪个坐标点开始
                  //第三个参数坐标点是取出 4 个数据
        canvas.drawLines(floatArrayOf(
            100f,100f,600f,600f
        ),0,4,mPaint)
    }
```

效果都一样

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191201214729.png)

#### 绘制点

```java
//x,y 点坐标
void drawPoint(float x, float y, @NonNull Paint paint)
//pts 坐标组，offset 从哪个点开始，count:取多少个点
void drawPoints(@Size(multiple = 2) float[] pts, int offset, int count,
            @NonNull Paint paint)
//pts 坐标组
void drawPoints(@Size(multiple = 2) @NonNull float[] pts, @NonNull Paint paint)
```

```kotlin
        //1
        canvas.drawPoint(100f, 100f, mPaint)

        //2.
        var offset = 0
        var pts = floatArrayOf(
            500f + offset, 100f, 500f + offset, 200f,
            500f + offset, 300f, 500f + offset, 600f,
            500f + offset, 700f, 500f + offset, 800f,
            500f + offset, 900f, 500f + offset, 1000f
        )
        mPaint.setColor(Color.BLUE)
        canvas.drawPoints(pts, 0, 16, mPaint)

        //3.
        mPaint.setColor(Color.GREEN)
        offset = 100
        pts = floatArrayOf(
            500f + offset, 100f, 500f + offset, 200f,
            500f + offset, 300f, 500f + offset, 600f,
            500f + offset, 700f, 500f + offset, 800f,
            500f + offset, 900f, 500f + offset, 1000f
        )
        canvas.drawPoints(pts, mPaint)
```

效果如下:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191201221253.png)

#### 绘制矩形

RectF ：保存 float 矩形结构

Rect：保存 int 矩形结构

这里会用到 View 坐标点的知识，对 left,top,right,bottom 还不熟悉的可以参考 [高级 UI 成长之路 \(一\) View 的基础知识你必须知道](https://juejin.im/post/5dcff9d3f265da0bd20af0da)

```java
//1.
void drawRect(@NonNull RectF rect, @NonNull Paint paint) {
        super.drawRect(rect, paint);
//2.
void drawRect(@NonNull Rect r, @NonNull Paint paint)
//3.
void drawRect(float left, float top, float right, float bottom, @NonNull Paint paint)
```

```kotlin
        //1.
        var rect = RectF(100.50f,100.50f,500.50f,500.50f)
        mPaint.style = Paint.Style.FILL
        canvas.drawRect(rect,mPaint)

        //2.

        var rect2 = Rect(300,300,600,600)
        mPaint.style = Paint.Style.FILL
        mPaint.setColor(Color.BLUE)
        mPaint.alpha = 100
        canvas.drawRect(rect2,mPaint)

        //3.
        mPaint.style = Paint.Style.FILL
        mPaint.setColor(Color.YELLOW)
        canvas.drawRect(500f,500f,1000f,1000f,mPaint)
```

效果如下:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191201222732.png)

#### 绘制路径

```java
//根据 path 绘制路径
void drawPath(@NonNull Path path, @NonNull Paint paint)
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191201224815.png)

```kotlin
        /**
         * 1. 绘制路径线
         */
        var path = Path()
        //1. 设置起始点
        path.moveTo(100f, 100f)
        //2. 第二条线的起点就是moveTo 设置的启动
        path.lineTo(100f,300f)
        //3. 第三条线的起点就是第二条的终点，依次类推
        path.lineTo(300f,500f)
        path.lineTo(500f,200f)
        //4. 闭合
        path.close()
        canvas.drawPath(path, mPaint)


        /**
         * 2. 绘制弧度路径
         */
        var path2 = Path()
        //绘制弧度的起始位置
        path2.moveTo(100f,600f)
        var rectF = RectF(100f,600f,600f,1000f)
        //第一个参数生成椭圆的矩形，第二个参数是弧开始的角度以 X 轴正方向为 0 度，第三个参数是弧持续的角度
        path2.arcTo(rectF,0f,90f)
        canvas.drawPath(path2, mPaint)
```

上面注释很详细，就不在解释了

#### 绘制圆/椭圆

```java
//绘制椭圆
void drawOval(@NonNull RectF oval, @NonNull Paint paint)
//绘制圆
void drawCircle(float cx, float cy, float radius, @NonNull Paint paint)
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191201225340.png)

```kotlin
        /**
         * 1. 绘制椭圆
         */
        canvas.drawOval(RectF(100f,500f,600f,800f),mPaint)

        /**
         * 2. 绘制圆
         */
        mPaint.setColor(Color.YELLOW)
        mPaint.alpha = 100
        canvas.drawCircle(400f,400f,200f,mPaint)
```

#### 绘制 Bitmap

```java
//
val bitmap = BitmapFactory.decodeResource(context.resources, R.mipmap.gild_3)
//第二个，第三个参数代表起点位置
canvas.drawBitmap(bitmap,100f,100f,mPaint)
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191201230035.png)

#### 绘制 Text

```java
//1.
void drawText(@NonNull char[] text, int index, int count, float x, float y,
            @NonNull Paint paint)
//2.
void drawText(@NonNull String text, float x, float y, @NonNull Paint paint)
//3.
void drawText(@NonNull String text, int start, int end, float x, float y,
            @NonNull Paint paint)
//4.
void drawText(@NonNull CharSequence text, int start, int end, float x, float y,
            @NonNull Paint paint)
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191201231654.png)

```kotlin
        /**
         * 1.
         * 取 0 ~ 5  位置的 text 进行绘制
         */
        mPaint.textSize = 100f
        canvas.drawText(charArrayOf('1','2','3','4','5'),0,5,200f,200f,mPaint)

        /**
         * 2.
         */
        canvas.drawText("12345",300f,300f,mPaint)

        /**
         * 3.取 0 ~ 5  位置的 text 进行绘制
         */
        canvas.drawText("12345",0,5,400f,400f,mPaint)
```

#### 根据路径绘制 Text

```java
//从 hOffset 向外偏移 vOffset px 来绘制 text
void drawTextOnPath(@NonNull String text, @NonNull Path path, float hOffset,
            float vOffset, @NonNull Paint paint)
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191201232431.png)

```kotlin
        mPaint.setColor(Color.GREEN)
        mPaint.alpha = 100

        mPaint.textSize = 100f
        var path = Path()
        //1. 设置起始点
        path.moveTo(300f, 300f)
        //2. 第二条线的起点就是moveTo 设置的启动
        path.lineTo(300f,500f)
        //3. 第三条线的起点就是第二条的终点，依次类推
        path.lineTo(500f,800f)
        path.lineTo(800f,200f)
        //4. 闭合
        path.close()
        canvas.drawPath(path,mPaint)
        //从0偏移100px的像素
        canvas.drawTextOnPath("12345asodnaspdnfpoashfeuinfapjn",path,0f,100f,mPaint)
```

#### 绘制 弧/扇形

```java
//1.
void drawArc(@NonNull RectF oval, float startAngle, float sweepAngle, boolean useCenter,
            @NonNull Paint paint)
//2.
void drawArc(float left, float top, float right, float bottom, float startAngle,
            float sweepAngle, boolean useCenter, @NonNull Paint paint)
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191202100727.png)

```kotlin
        var rectF = RectF(100f, 100f, 500f, 500f)
        /**
         * 1. 绘制弧
         * @param ovar : 矩形坐标
         * @param startAngle : 开始的角度
         * @param sweepAngle : 结束的角度
         * @param userCenter : 如果为true，则将椭圆的中心包括在圆弧中
         * @param paint : 画笔
         */
        canvas.drawArc(rectF, 0f, 90f, true, mPaint)

        /**
         * 2. 绘制弧
         */
        canvas.drawArc(100f,500f,500f,900f,0f,90f,false,mPaint)
```

#### 绘制圆角矩形

```java
//1.
void drawRoundRect(@NonNull RectF rect, float rx, float ry, @NonNull Paint paint)
//2.
void drawRoundRect(float left, float top, float right, float bottom, float rx, float ry,
            @NonNull Paint paint)
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191202101510.png)

```kotlin
        /**
         * 1. 根据 RectF 绘制圆角矩形
         * @param rx: x 轴上的圆角半径
         * @param ry: y 轴上的圆角半径
         */
        canvas.drawRoundRect(rectF,50f,50f,mPaint)
        /**
         * 2. 根据输入矩形位置绘制圆角矩形
         */
        canvas.drawRoundRect(100f,600f,500f,900f,100f,100f,mPaint)
```

#### Canvas 变换

**translate - 图层平移**

```java
//dx/dy:x/y 点新位置
void translate(float dx, float dy)
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191202102421.png)

**scale- 图层缩小 0~1**

```java
//x,y 缩小系数 0~1 之间  越大说明越接近原始图像
void scale(float sx, float sy)
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191202103343.png)

```kotlin
        /**
         * 1. 原始矩形
         */
        mPaint.color = Color.RED
        mPaint.alpha = 100
        canvas.drawRoundRect(rectF,50f,50f,mPaint)


        /**
         * 2.将原始图形缩小 0.5 倍
         */
        var rectF2 = RectF(100f, 100f, 500f, 500f)
        mPaint.color = Color.BLUE
        mPaint.alpha = 100
        canvas.scale(0.5f,0.5f)
        canvas.drawRoundRect(rectF2,50f,50f,mPaint)
```

**rotate - 图层旋转**

```java
//1. 
void rotate(float degrees)
//2.
void rotate(float degrees, float px, float py)
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191202104541.png)

```java
        /**
         * 1. 原始矩形
         */
        mPaint.color = Color.RED
        mPaint.alpha = 100
        canvas.drawRoundRect(rectF,50f,50f,mPaint)


        /**
         * 2.将原始图形旋转 45°
         */
        mPaint.color = Color.BLUE
        mPaint.alpha = 100
        canvas.rotate(45f)
        canvas.drawRoundRect(rectF,50f,50f,mPaint)

        /**
         * 3.将原始图形旋转 280°
         * 以 坐标点 500，100 顺时针旋转 280°
         */
        mPaint.color = Color.YELLOW
        mPaint.alpha = 100
        canvas.rotate(280f,500f,100f)
        canvas.drawRoundRect(rectF,50f,50f,mPaint)
```

**skew - 图层错切**

```java
//错切是在某方向上，按照一定的比例对图形的每个点到某条平行于该方向的直线的有向距离做放缩得到的平面图形。水平错切（或平行于X轴的错切）是一个将任一点(x,y)映射到点(x+my,y)的操作,m是固定参数，称为错切因子
//sx和sy分就是错切因子，为倾斜角度tan值，这里倾斜45度值为1
void skew (float sx, float sy)
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191202105220.png)

```kotlin
        /**
         * 1. 原始图形
         */
        mPaint.color = Color.RED
        mPaint.alpha = 100
        canvas.drawRoundRect(rectF,50f,50f,mPaint)
        /**
         * 2.图层开始错切
         */
        canvas.skew(0f,0.5f)
        mPaint.color = Color.BLUE
        mPaint.alpha = 100
        canvas.drawRoundRect(rectF,50f,50f,mPaint)
```

**Matrix**

[api详细使用](https://blog.csdn.net/xx326664162/article/details/60142947)

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191202112112.png)

```kotlin
        /**
         * 原始图形
         */
        canvas.drawBitmap(mBitmap,100f,100f,mPaint)
        /**
         *1. 矩阵平移 500，500
         */
        var matrix = Matrix()
        matrix.setTranslate(500f,500f)
        canvas.drawBitmap(mBitmap,matrix,mPaint)

        /**
         * 2. 矩阵缩放 0.5 倍
         */
        var matrix2 = Matrix()
        matrix2.setScale(0.5f,0.5f)
        canvas.drawBitmap(mBitmap,matrix2,mPaint)

        /**
         * 3. 矩阵旋转 125°
         */
        var matrix3 = Matrix()
        matrix3.setRotate(125f,500f,500f)
        canvas.drawBitmap(mBitmap,matrix3,mPaint)

        /**
         * 4. 错切
         */
        var matrix4 = Matrix()
        matrix4.setSkew(0.5f,0.5f)
        canvas.drawBitmap(mBitmap,matrix4,mPaint)
```

#### 裁剪画布

```java
//裁剪
boolean clipRect(RectF rect, Region.Op op);
boolean clipRect(Rect rect, Region.Op op);
boolean clipRect(RectF rect);
boolean clipRect(Rect rect);
boolean clipRect(float left, float top, float right, float bottom, Region.Op op);
boolean clipRect(float left, float top, float right, float bottom);
boolean clipRect(int left, int top, int right, int bottom);
boolean clipPath(Path path, Region.Op op);
boolean clipPath(Path path);
boolean clipRegion(Region region, Region.Op op);
boolean clipRegion(Region region);
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191202141350.png)

上图中的 1 代表原始的图层，未被裁剪；2 代表已经裁剪了的图层；3，不管怎么绘制只能在该区域内部绘制。

```java
        /**
         * 1. 原始图形
         */
        mPaint.color = Color.RED
        mPaint.alpha = 100
        canvas.drawRect(300f,300f,700f,700f,mPaint)
        canvas.drawText("1.原始",400f,600f,Paint(Paint.ANTI_ALIAS_FLAG).also {
            it.textSize = 100f
            it.color = Color.WHITE
        })
        /**
         * 2. 在 RectF 矩形区域裁剪一块画布，绘制图形只能在该区域中绘制
         */
        var rectf2 = RectF(100f, 100f , 500f, 500f);
        canvas.clipRect(rectf2)
        mPaint.color = Color.BLUE
        mPaint.alpha = 100
        canvas.drawColor(mPaint.color)
        canvas.drawText("2.clip",200f,200f,Paint(Paint.ANTI_ALIAS_FLAG).also {
            it.textSize = 100f
            it.color = Color.WHITE
        })

        /**
         * 3. 在 300，300；700，700 坐标点上绘制矩形
         */
        mPaint.color = Color.YELLOW
        mPaint.alpha = 100
        canvas.drawRect(300f,300f,700f,700f,mPaint)
        canvas.drawText("3.裁剪之后",350f,400f,Paint(Paint.ANTI_ALIAS_FLAG).also {
            it.textSize = 30f
            it.color = Color.WHITE
        })
```

#### 画布的保存与恢复

save 和 restore 一般成对的出现，save 可以保存 canvas 当前的状态，随后进行平移，裁剪等一系列改变 canvas的操作，最后使用 restore 将 canvas 还原成 save 时候的状态。

```java
int save()      //每次调用该函数，都会保存当前画布状态，将其放入特定的栈中
void restore()  //从栈顶去除这个状态，对画布进行恢复
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191202142702.png)

通过在未裁剪的时候先调用 canvas.save 保存图层，裁剪完之后在调用 canvas.restore 来恢复之前的图层

```kotlin
        /**
         * 1. 原始图形
         */
        mPaint.color = Color.RED
        mPaint.alpha = 100
        canvas.drawRect(300f,300f,700f,700f,mPaint)
        canvas.drawText("1.原始",400f,600f,Paint(Paint.ANTI_ALIAS_FLAG).also {
            it.textSize = 100f
            it.color = Color.WHITE
        })
        /**
         * 2. 在 RectF 矩形区域裁剪一块画布，绘制图形只能在该区域中绘制
         */
        var rectf2 = RectF(100f, 100f , 500f, 500f);
        //将未裁剪的图层先进行保存
        canvas.save()
        canvas.clipRect(rectf2)
        mPaint.color = Color.BLUE
        mPaint.alpha = 100
        canvas.drawColor(mPaint.color)
        canvas.drawText("2.clip",200f,200f,Paint(Paint.ANTI_ALIAS_FLAG).also {
            it.textSize = 100f
            it.color = Color.WHITE
        })

        /**
         * 3. 在 300，300；700，700 坐标点上绘制矩形
         */
        //裁剪完之后出栈
        canvas.restore()
        mPaint.color = Color.YELLOW
        mPaint.alpha = 100
        canvas.drawRect(300f,300f,600f,600f,mPaint)
        canvas.drawText("3.裁剪之后",350f,400f,Paint(Paint.ANTI_ALIAS_FLAG).also {
            it.textSize = 30f
            it.color = Color.WHITE
        })
```

#### Canvas 与图层

上一小节介绍了 save,restore 可以用来保存图层，下面在来介绍几个 API 同样也可以用于保存图层

```java
//bounds:要保存的区域所对应的举行对象
//saveFlags：取值 ALL_SAVE_FLAG 表示保存全部内容
public int saveLayer(RectF bounds,Paint paint,int saveFlags)
public int saveLayer(float left,float top,float right,float bottom,Paint paint,int saveFlags)
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191202151356.png)

上图的意思是绘制一个以红色的裁剪区域，然后在绘制一个圆可看图中注释 2 ，发现只能在裁剪区域绘制了，但是如果调用 canvas.restoreToCount 之后在绘制，就不会受影响了可看图中注释 3 区域。

```kotlin
        /**
         * 1. 原始图像
         */
        mPaint.color = Color.RED
        mPaint.alpha = 200
        canvas.drawRect(300f,300f,1000f,1000f,mPaint)
        canvas.drawText("1. 裁剪图层",750f,750f,Paint(Paint.ANTI_ALIAS_FLAG).also {
            it.textSize = 30f
            it.color = Color.WHITE
        })
        /**
         * 2. 保存
         */
        val saveLayer = canvas.saveLayer(300f, 300f, 1000f, 1000f, mPaint,ALL_SAVE_FLAG)
        mPaint.color = Color.BLUE
        mPaint.alpha = 100
        canvas.drawCircle(500f,500f,300f,mPaint)
        canvas.drawText("2. 绘制圆",350f,700f,Paint(Paint.ANTI_ALIAS_FLAG).also {
            it.textSize = 30f
            it.color = Color.WHITE
        })

        /**
         * 3.恢复图层
         */
        canvas.restoreToCount(saveLayer)
        /**
         *
         */
        mPaint.color = Color.BLUE
        mPaint.alpha = 100
        canvas.drawCircle(400f,400f,200f,mPaint)
        canvas.drawText("3. 恢复",350f,250f,Paint(Paint.ANTI_ALIAS_FLAG).also {
            it.textSize = 30f
            it.color = Color.WHITE
        })
```

Canvas 基础常用的 API 这里都练习了一遍，下面就进行该篇最后的环节了，以一个示例 demo 结束 Canvas 的讲解。

### Canvas 实战

1. 绘制简易时钟

   先来看一下效果，如下:

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191202194703.gif)

   代码绘制结构:

   ```kotlin
       override fun onDraw(canvas: Canvas) {
           super.onDraw(canvas)
           //1. 绘制外圆
           canvas.drawCircle(mX, mY, mR.toFloat(), mPaint!!)

           //2. 绘制圆心
           canvas.drawCircle(mX, mY, 15f, mPaintMinute!!)

           //3. 绘制刻度
           drawLines(canvas)

           //4. 绘制整点
           drawText(canvas)

           //5. 更新时间
           updateCurrentTime(canvas)
       }
   ```

   这里我们看一下第 5 步怎么实现:

   \`\`\`kotlin

   / __

   * 获取当前系统时间

     \*

   * @param canvas 画布\*/

     private fun updateCurrentTime\(canvas: Canvas\) { //获取系统当前时间 val format = SimpleDateFormat\("HH-mm-ss"\) val time = format.format\(Date\(System.currentTimeMillis\(\)\)\) val split = time.split\("-".toRegex\(\)\).dropLastWhile { it.isEmpty\(\) }.toTypedArray\(\) val hour = Integer.parseInt\(split\[0\]\) val minute = Integer.parseInt\(split\[1\]\) val second = Integer.parseInt\(split\[2\]\) //时针走过的角度 val hourAngle = hour  _30 + minute / 2 //分针走过的角度 val minuteAngle = minute_  6 + second / 10 //秒针走过的角度 val secondAngle = second \* 6

     //绘制时钟,以12整点为0°参照点 drawLine\(canvas, hourAngle, 170, mPaintHour\)

     //绘制分钟 drawLine\(canvas, minuteAngle, 60, mPaintMinute\)

     //绘制秒钟 canvas.rotate\(secondAngle.toFloat\(\), mX, mY\) canvas.drawLine\(mX, mY, mX, mY - mR + 80, mPaintSecond!!\)

     //每隔1s刷新界面 postInvalidateDelayed\(1000\) }

```text
   fun drawLine(canvas: Canvas, angle: Int, length: Int, mPaint: Paint?) {
       canvas.rotate(angle.toFloat(), mX, mY)
       canvas.drawLine(mX, mY, mX, mY - mR + length, mPaint!!)
       canvas.save()
       canvas.restore()
       //这里画好了时钟，我们需要再将画布转回来,继续以12整点为0°参照点
       canvas.rotate((-angle).toFloat(), mX, mY)
   }
```

```text
   其实也很简单，详细代码请看[ClockView.kt](https://github.com/yangkun19921001/CustomViewSample/blob/master/custom_view/src/main/java/com/devyk/custom_view/canvas/ClockView.kt)

2. 滑动切换彩色图片

   先来看一个最终效果，然后我们在来说它怎么实现，请看下面录屏:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191202162925.gif)

通过该练习你可以学到:

1. 自定义 Drawable
2. Canvas 图层处理

下面先说一下实现上图效果的原理:

1. 抠图 
2. 拼接图
3. 随着根据滑动拿到需要裁剪的 w,h 动态拼接

下面先看一段自定义 Drawable 代码示例

```kotlin
public class CustomDrawable : Drawable {

    lateinit var unseleter: Drawable
    lateinit var selecter: Drawable

    constructor(unseleter: Drawable, selecter: Drawable) : super() {
        this.selecter = selecter
        this.unseleter = unseleter

    }


    override fun draw(canvas: Canvas) {
        //得到当前自身 Drawable 的矩形区域
        val bounds = bounds
        //1. 绘制灰色部分
        drawGrayDraw(bounds,canvas)
        //2. 绘制彩色部分
        drawColorDraw(bounds,canvas)
    }


    /**
     * 绘制灰色区域
     * @link Gravity 不懂的可以参考https://www.cnblogs.com/over140/archive/2011/12/14/2287179.html
     */
    private fun drawGrayDraw(bound: Rect, canvas: Canvas) {
        val rect = Rect()
        Gravity.apply(
            Gravity.LEFT,//开始从左边或者右边开始抠图
            bound.width(),  //目标矩形的宽
            bound.height(), //目标矩形的高
            bound,//被扣出来的 rect
            rect //目标 rect
        )
        canvas.save() //保存当前画布
        canvas.clipRect(rect)
        unseleter.draw(canvas)
        canvas.restore()

    }

    /**
     * 绘制彩色区域
     */
    private fun drawColorDraw(bounds: Rect, canvas: Canvas) {
        val rect = Rect()
        Gravity.apply(
            Gravity.RIGHT,//开始从左边或者右边开始抠图
            bounds.width()/3,  //目标矩形的宽
            bounds.height(), //目标矩形的高
            bounds,//被扣出来的 rect
            rect //目标 rect
        )
        canvas.save() //保存当前画布
        canvas.clipRect(rect)
        selecter.draw(canvas)
        canvas.restore()

    }


    override fun setAlpha(alpha: Int) {
    }

    override fun getOpacity(): Int  = 0

    override fun setColorFilter(colorFilter: ColorFilter?) {
    }

    override fun onBoundsChange(bounds: Rect) {
        super.onBoundsChange(bounds)
        //改变之后重新赋值
        unseleter.bounds = bounds
        selecter.bounds = bounds
    }

    override fun getIntrinsicHeight(): Int {
        return Math.max(selecter.intrinsicHeight, unseleter.intrinsicHeight)
    }

    override fun getIntrinsicWidth(): Int {
        return Math.max(selecter.intrinsicWidth, unseleter.intrinsicWidth)
    }

    override fun onLevelChange(level: Int): Boolean {
        //如果 level 改变，提醒自己需要重绘
        invalidateSelf()
        return super.onLevelChange(level)

    }

}
```

运行效果如下:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191202182003.png)

这个就是一个静态的抠图 + 拼接，如果我们动态滑动然后计算裁剪宽高是不是就实现了根据滑动来显示对应的彩色图片了。[demo 代码](https://github.com/yangkun19921001/CustomViewSample/blob/master/custom_view/src/main/java/com/devyk/custom_view/canvas/GallaryHorizonalScrollView.kt) 。

## 总结

Canvas 基础 API 绘制和实战示例，到这里就已经全部结束，这些 API 其实不用背，你只要知道你需要绘制什么，然后根据 AS 自动提示，看看参数具体需要什么然后来填入，参数意思实在不清楚的就百度，不要一上绘制一个圆，矩形等就百度，这样根本是记不住了，一定要多练。我们下期再会！

感谢你的阅读，希望能带给你帮助！

## 参考

* [https://juejin.im/post/5be29aa2e51d45228170ff33](https://juejin.im/post/5be29aa2e51d45228170ff33)
* [https://www.cnblogs.com/over140/archive/2011/12/14/2287179.html](https://www.cnblogs.com/over140/archive/2011/12/14/2287179.html)

