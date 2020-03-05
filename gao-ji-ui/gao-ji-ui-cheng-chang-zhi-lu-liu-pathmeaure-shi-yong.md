# 高级 UI 成长之路 \(六\) PathMeaure 使用

## 前言

我们来回顾一下前面 5 篇文章我们讲解的内容，先是从 View 基础 ，事件分发，View 工作流程，然后是 Paint, Canvas 讲解，该篇我们还是分 2 个部分讲解，先是 Path, 然后是 PathMeaure ,如果想做出比较炫的动画，那么必不可少是离不开这 2 个类的，下面还是以 API 的使用和 demo 实战来讲解。

## Path

`Path` 又叫路径，它是一个比较重要的概念，在自定义 View 中它的重要程度基本上跟 Paint 差不多，那么它可以用来干什么勒, 可以说 Path 是万能的也不为过，为什么这么说呢，因为只要给我任何一个 Path 路径，我就能把它绘制出来。下面我们下来熟悉一下它有哪些 API 吧，请看下表:

| API | 功能 | 说明 |
| :--- | :--- | :--- |
| moveTo | 移动起点 | 移动下一次操作的起点位置 |
| setLastPoint | 设置终点 | 重置当前 path 中最后一个点位置，如果在绘制之前调用，效果和 moveTo 相同 |
| lineTo | 连接直线 | 添加上一个点到当前点 |
| close | 闭合路径 | 连接第一个点到最后一个点，形成一个闭合区间 |
| addRect,addRoundRect,addOval,addCircle,addPath,addArc,arcTo | 添加内容 | 添加（矩形，圆角矩形，椭圆，圆，路径，圆弧）到当前 Path 中 |
| isEmpty | 是否为空 | 判断当前 Path 是否是空的 |
| isRect | 是否为矩形 | 判断 Path 是否是一个矩形 |
| set | 替换路径 | 用新的路径替换到当前路径的所有内容 |
| offset | 偏移路径 | 对当前路径之前的操作进行偏移（不会影响之后的操作） |
| quadTo,cubicTo | 贝塞尔曲线 | 分别为二次和三次贝塞尔取消的方法 |
| rMoveTo, rLineTo,rQuadTo,rCubicTo | rXXX方法 | 不带 r 的方法时基于远点的坐标系（偏移量），rXXX 方法是基于当前点坐标系（偏移量） |
| setFillType, getFillType,isInverseFilltype,toggleInverseFilltype | 填充模式 | 设置，获取，判断和切换填充模式 |
| incReserve | 提示方法 | 提示 Path 还有多少个点等待加入 |
| op | 布尔操作 | 对2个Path进行布尔运算（取交集并集） |
| computeBounds | 计算Path 的边界 | 计算边界 |
| reset,rewind | 重置路径 | 清除Path中的内容，reset不保留内部数据结构，但会保留 Filltype，rewind会保留内部的数据结构，但不保留 FillType |
| transform | 矩阵操作 | 矩阵变换 |

1. moveTo,lineTo,setLastPoint,close

   ```kotlin
   //从0.0 连接 400，600
   mPath.lineTo(400f,600f)
   //重置上一点相当于 0，0 到 600，200, 设置之前操作的最后一个点位置(会影响之前跟之后的起始点)
   //mPath.setLastPoint(600f,200f)
   //从 400，600 连接 900，100
   mPath.lineTo(900f,100f)
   //开始绘制
   anvas!!.drawPath(mPath,mPathPaint)
   ```

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191203204615.png)

   我们把上面注释放开，如下代码:

   ```kotlin
   //从0.0 连接 400，600
   mPath.lineTo(400f,600f)
   //重置上一点相当于 0，0 到 600，200, 设置之前操作的最后一个点位置(会影响之前跟之后的起始点)
   mPath.setLastPoint(600f,200f)
   //从 600，200 连接 900，100
   mPath.lineTo(900f,100f)
   //开始绘制
   anvas!!.drawPath(mPath,mPathPaint)
   ```

   实现效果如下:

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191203204903.png)

   通过上图我们发现 setLastPoint 在设置了之后改变了之前之后一次的坐标点，可以理解为更新最后一点的坐标，我们发现每次都是从坐标角 \(0,0\) 开始绘制，那么有没有一个方法指定从哪个起点开始绘制，正好，你可以试试 moveTo 它可以指定 path 的起点，如下代码:

   ```kotlin
           //moveTo 设置起点
           mPath.moveTo(600f,200f)
           //从0.0 连接 400，600
           mPath.lineTo(400f,600f)
           mPath.lineTo(800f,300f)
           //最后一点和起点封闭
           mPath.close()
   ```

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191203205407.png)

   通过上图我们先利用 `Path#moveTo` 将 Path 起点设置为 \(400,600\) 开始绘制，最后调用了 `Path#close` 将为闭合的连接线闭合。

2. addXxx 系列

   我们就以 矩形，圆角矩形，椭圆，圆，圆弧 的顺序绘制

   ```java
   //Path.Direction.CW/CCW 顺时针/逆时针

   //1. 添加矩形到 Path
   void addRect (float left, float top, float right, float bottom, Path.Direction dir)
   //2. 添加 圆角矩形到 Path
   void addRoundRect (RectF rect, float[] radii, Path.Direction dir)
   void addRoundRect (RectF rect, float rx, float ry, Path.Direction dir)
   //3. 添加 椭圆 到 Path
   void addOval (RectF oval, Path.Direction dir)
   //4. 添加 圆 到 Path
   void addCircle (float x, float y, float radius, Path.Direction dir)
   //5. 添加 圆弧 到 Path ,直接添加一个圆弧到path中
   void addArc (RectF oval, float startAngle, float sweepAngle)
   //添加一个圆弧到 path，如果圆弧的起点和上次最后一个坐标点不相同，就连接两个点
   void arcTo (RectF oval, float startAngle, float sweepAngle)
   void arcTo (RectF oval, float startAngle, float sweepAngle, boolean forceMoveTo)
   ```

   ```kotlin
           mPathPaint.textSize = 50f
           //1. 添加矩形到 Path
           mPath.addRect(100f,300f,400f,700f,Path.Direction.CW)//顺时针
           canvas!!.drawText("1",200f,500f,mPathPaint)

           //2. 添加 圆角矩形到 Path
           mPath.addRoundRect(100f + 500,300f,1000f ,700f,30f,30f,Path.Direction.CCW)//逆时针
           canvas!!.drawText("2",800f,500f,mPathPaint)

           //3. 添加 椭圆 到 Path
           mPath.addOval(100f,1300f,600f ,1000f,Path.Direction.CCW)//逆时针
           canvas!!.drawText("3",300f,1150f,mPathPaint)

           //4. 添加 圆 到 Path
           mPath.addCircle(850f,1200f ,150f,Path.Direction.CCW)//逆时针
           canvas!!.drawText("4",850f,1200f,mPathPaint)

           //5. 添加 圆弧 到 Path ,直接添加一个圆弧到path中
           //添加一个圆弧到 path，如果圆弧的起点和上次最后一个坐标点不相同，就连接两个点
           mPath.addArc(100f,1500f,600f,1800f,0f,300f)
           canvas!!.drawText("5",300f,1550f,mPathPaint)

           mPath.arcTo(650f,1500f,800f,1800f,0f,180f,true)
           canvas!!.drawText("6",750f,1550f,mPathPaint)

           canvas!!.drawPath(mPath, mPathPaint)
   ```

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191203213842.png)

   这里注意一点 addTo 最后一个参数 **forceMoveTo** 它的意思为“是否强制使用 moveTo ”，也就是说，是否使用 moveTo 将变量移动到圆弧的起点位移 ，也就意味着：

   | forceMoveTo | 含义 | 等价方法 |
   | :--- | :--- | :--- |
   | true | 将最后一个点移动到圆弧起点，即不连接最后一个点与圆弧起点 | public void addArc \(RectF oval, float startAngle, float sweepAngle\) |
   | false | 不移动，而是连接最后一个点与圆弧起点 | public void arcTo \(RectF oval, float startAngle, float sweepAngle\) |

3. computeBounds,set,setPath
   1. 先绘制一个 圆和矩形

      \`\`\`kotlin mPath.addCircle\(500f, 500f, 150f, Path.Direction.CW\)

```text
  canvas!!.drawPath(mPath, mPathPaint)    // 绘制Path


  canvas.drawRect(300f,800f,800f,1300f ,mPathPaint)   // 绘制矩形
  ```
```

1. 重写 onTouchEvent 实现点击事件

   ```kotlin
   override fun onTouchEvent(event: MotionEvent): Boolean {
       when (event.action) {
             //需要按下事件
           MotionEvent.ACTION_DOWN -> return true
           MotionEvent.ACTION_UP -> {
               val rectF = RectF()
                 //计算 Path 边界
               mPath.computeBounds(rectF, true)
                 //将边界放入矩形区域内
               region.setPath(
                   mPath,
                   Region(rectF.left.toInt(), rectF.top.toInt(), rectF.right.toInt(), rectF.bottom.toInt())
               )
               if (region.contains(event.x.toInt(), event.y.toInt())) {
                   Toast.makeText(context, "点击了圆", Toast.LENGTH_SHORT).show()
               }
                           //用新的路径替换到当前路径所有内容
               region.set(300, 800, 800, 1300)
               if (region.contains(event.x.toInt(), event.y.toInt())) {
                   Toast.makeText(context, "点击了矩形", Toast.LENGTH_SHORT).show()
               }
           }
       }
       return super.onTouchEvent(event)
   }
   ```

2. 效果

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191203215128.gif)

Path 我们就先学习到这里，该篇文章后面会有 Path 实战。

## PathMeasure

上部分我们讲解了 Path 路径的知识，现在来看 Path 除了绘制图形好像也没什么作用，当然如果只是单纯显示 Path 绘制的图形，那我也就不介绍该篇的重点了。Android SDK 提供了一个非常有用的 API 来帮组开发者实现一个 Path 路径追踪，这个 API 就是 `PathMeasure` , 通过它可以实现复杂切绚丽的效果。

### 概念

PathMeasure 类似一个计算器，可以计算出指定路径的一些信息，比如路径总长、指定长度所对应的坐标点等。

### API 使用

**构造方法**

```kotlin
//1.空参
 public PathMeasure()
//2.path 代表一个已经完成的 Path,forceClosed 代表是否最后闭合
 public PathMeasure(Path path, boolean forceClosed)
```

**简单函数使用**

1. getLength\(\) 函数

   `PathMeasure#getLength()` 函数的使用非常广泛，其作用就是获取计算的路径长度，下面以一个例子来看下它的用法。

   效果:

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191203222227.png)

   代码:

   ```kotlin
       override fun draw(canvas: Canvas) {
           super.draw(canvas)
           /**
            * 1. getLength
            */
           //将起点移动到 100，100 的位置
           mPath.moveTo(100f,100f)
           //绘制连接线
           mPath.lineTo(100f,450f)
           mPath.lineTo(450f,500f)
           mPath.lineTo(500f,100f)
           mPathMeasure.setPath(mPath,false)//不被闭合
           mPathMeasure2.setPath(mPath,true)//闭合
           println("forceClosed false pathLength =${mPathMeasure.length}")
           println("forceClosed true pathLength =${mPathMeasure2.length}")
           canvas.drawPath(mPath,mPathPaint)
       }
   ```

   输出:

   ```kotlin
   System.out: forceClosed false pathLength =1106.6663
   System.out: forceClosed true pathLength =1506.6663
   ```

   可以看见，如果 forceClosed 设置为 true/false 测量的是各自的 path 。

2. isClosed\(\) 函数

   该函数用于判断测量 Path 时是否计算闭合。所以，如果在关联 Path 的时候设置 forceClosed 为 true ，那么这个函数的返回值也一定为 true.

3. nextContour\(\) 函数

   我们知道，Path 可以由多条曲线构成，但无论是 getLength（）、getSegment\(\) 还是其它函数，都只会对针对其中第一条线段进行计算。而 **nextContour** 就是用于跳转到下一条曲线的函数，如果跳转成功，则返回 true ; 如果跳转失败，则返回 false.下面看一个示例，分别创建 3 条闭合 Path,然后利用 PathMeasure 来依次测量。

   效果:

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191203223928.png)

   代码:

   ```kotlin
           /**
            * 2. nextContour
            */
           mPath.addCircle(500f,500f,10f,Path.Direction.CW)
           mPath.addCircle(500f,500f,80f,Path.Direction.CW)
           mPath.addCircle(500f,500f,150f,Path.Direction.CW)
           mPath.addCircle(500f,500f,200f,Path.Direction.CW)

           mPathMeasure.setPath(mPath,false)//不被闭合

           canvas.drawPath(mPath,mPathPaint)

           do {
               println("forceClosed  pathLength =${mPathMeasure.length}")
           }while (mPathMeasure.nextContour())
   ```

   输出:

   ```kotlin
   2019-12-03 22:37:22.340 18501-18501/? I/System.out: forceClosed  pathLength =62.42697
   2019-12-03 22:37:22.341 18501-18501/? I/System.out: forceClosed  pathLength =501.84265
   2019-12-03 22:37:22.341 18501-18501/? I/System.out: forceClosed  pathLength =942.0967
   2019-12-03 22:37:22.341 18501-18501/? I/System.out: forceClosed  pathLength =1256.1292
   ```

   在这里，我们通过 do...while 循环和 measure.nextContour\(\) 函数相结合，依次拿到 Path 中所有的曲线

   通过这个例子我们可以知道，通过 `PathMeasure#nextContour` 函数得到的曲线顺序与 Path 添加的顺序相同

#### getSegment\(\) 函数

```java
//startD：开始截取位置距离 Path 起始点的长度
//stopD: 结束截取位置距离 Path 起始点的长度
//dst: 截取的 Path 将会被添加到 dst 中，注意是添加，而不是替换
//startWithMoveTo: 起始点是否使用 moveTo
boolean getSegment(float startD, float stopD, Path dst, boolean startWithMoveTo)
```

getSegment 用于截取整个 Path 中的某个片段，通过参数 startD 和 stopD 来控制截取的长度，并将截取后的 Path 保存到参数 dst 中。最后一个参数 startWithMoveTo 表示起始点是否使用 moveTo 将路径的新起始点移到结果 Path 的起始点，通常设置为 true ,以保证每次截取的 Path 都是正常完整的，通常和 dst 一起使用，因为 dst 中保存的 Path 是被不断添加的，而不是每次被覆盖的；如果设置为 false ，则新增的片段会从上一次 Path 终点开始计算，这样可以保证截取的 Path 片段是连续的。

注意:

* 如果 startD ，stopD 数值不在取值范围内，或者 startD == stopD ，那么就会返回 false ,并且 dst 不会有 Path 数据。
* 开启硬件加速后，绘图会出现问题，因此，在使用 getSegment 是需要 在构造函数中调用 `setLayerType(LAYER_TYPE_SOFTWARE,null)` 函数来禁用硬件加速

getSegment 举例:

```kotlin
        /**
         * 3. getSegment
         */
        mPath.addCircle(500f,500f,200f,Path.Direction.CCW)
        mPathMeasure.setPath(mPath,false)//不被闭合
        val segment = mPathMeasure.getSegment(50f, 500f, mTempPath, true)
        println("是否截取成功:$segment")
        canvas.drawPath(mTempPath,mPathPaint)
```

效果:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191203231421.png)

注意:

如果 startWithMoveTo 为 true,则被截取出来的 path 片段保持原状；如果 startWithMoveTo 为 false ，则会将截取出来的 Path 片段的起始点移动到 dst 的最后一个点，以保证 dst 路径的连续性。

实现一个实时截取的动画:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191203233740.gif)

代码实现:

1. 定义一个值动画

   ```kotlin
           val valueAnimator = ValueAnimator.ofFloat(0f, 1f)
           valueAnimator.addUpdateListener {
               animation -> stopValues = animation.animatedValue as Float
               invalidate()
           }
           valueAnimator.repeatCount  = ValueAnimator.INFINITE
           valueAnimator.setDuration(1500)
           valueAnimator.start()
   ```

2. 实时截取绘制

   ```kotlin
           mPath.addCircle(500f,500f,200f,Path.Direction.CCW)
           mPathMeasure.setPath(mPath,false)//不被闭合
           mTempPath.rewind()
           stop =   mPathMeasure.length * stopValues
           val start = (stop - (0.5 - Math.abs(stopValues - 0.5)) * mPathMeasure.length).toFloat()
           val segment = mPathMeasure.getSegment(start, stop, mTempPath, true)
           println("总长度：${mPathMeasure.length} 是否截取成功:$segment + start:$start  stop:$stop")
           canvas.drawPath(mTempPath,mPathPaint)
   ```

#### getPosTan

这个方法是用于得到路径上某一长度的位置以及该位置的正切值

```java
//distance：距离 Path 起点的长度,取值范围: 0 <= distance <= getLength
//pos:该点的坐标值 , 当前点在画布上的位置，有两个数值，分别为x，y坐标。
//tan:该点的正切值, 当前点在曲线上的方向，使用 Math.atan2(tan[1], tan[0]) 获取到正切角的弧度值。
boolean getPosTan (float distance, float[] pos, float[] tan)
```

下面以一个 demo 来讲解 getPosTan 具体使用，先来看一个效果图:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191204131224.gif)

感觉是不是很炫，那么我们是怎么实现的呢？先来看一下核心代码，如下:

```kotlin
    override fun onDraw(canvas: Canvas?) {
        super.onDraw(canvas)
        //清楚 path 数据
        mTempPath.rewind()
        //绘制一个模拟公路
        addLineToPath()
        //测量 path,闭合
        mPathMeasure!!.setPath(mTempPath, true)
        //动态变化的值
        mCurValues += 0.002f
        if (mCurValues >= 1) mCurValues = 0f
        //拿到当前点上的 正弦值坐标
        mPathMeasure!!.getPosTan(mPathMeasure!!.length * mCurValues, pos, tan)
        //通过正弦值拿到当前角度
        val y = tan!![1].toDouble()
        val x = tan!![0].toDouble()
        var degrees = (Math.atan2(y, x) * 180f / Math.PI).toFloat()
        println("角度：$degrees")
        mMatrix!!.reset()
      //拿到 bitmap 需要旋转的角度，之后将矩阵旋转
        mMatrix!!.postRotate(degrees, mBitmap!!.width / 2.toFloat(), mBitmap!!.height / 2.toFloat())
          //拿到 path 上的 pos 点随着点移动
        mMatrix!!.postTranslate(pos!![0] - mBitmap!!.getWidth() / 2, pos!![1] - mBitmap!!.getHeight() / 2)
        //绘制Bitmap和path
        canvas!!.drawPath(mTempPath, mTempPaint)
        canvas!!.drawBitmap(mBitmap!!, mMatrix!!, mTempPaint)

        //重绘
        postInvalidate()
    }
```

这里涉及到了初中数学，正弦值，当然 Android SDK API 也给我们封装了一个求正弦值的类 Math ,我们可以根据 `PathMeasure#getPosTan` 拿到当前点上的坐标 tan\[\] ，然后根据 `Math#atan` 求出 tan ,最后根据 `degrees * 180 / π` 公式来求出角度。然后矩阵旋转得到一个旋转之后的 car 不断重绘就是现在这个效果了。还是很简单把。

这里我们简单回顾下三角函数的计算吧

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191204132444.png)

还不会的可以参考这个文章[正弦，余弦，正切值计算](https://www.shuxuele.com/sine-cosine-tangent.html)

#### getMatrix

这个方法是用于得到路径上某一长度的位置以及该位置的正切值的矩阵：

| 参数 | 作用 | 备注 |
| :--- | :--- | :--- |
| 返回值\(boolean\) | 判断获取是否成功 | true表示成功，数据会存入matrix中，false 失败，matrix内容不会改变 |
| distance | 距离 Path 起点的长度 | 取值范围: 0 &lt;= distance &lt;= getLength |
| matrix | 根据 falgs 封装好的matrix | 会根据 flags 的设置而存入不同的内容 |
| flags | 规定哪些内容会存入到matrix中 | 可选择 POSITION\_MATRIX\_FLAG\(位置\) ANGENT\_MATRIX\_FLAG\(正切\) |

其实这个方法就相当于我们在前一个例子中封装 `matrix` 的过程由 `getMatrix` 替我们做了，我们可以直接得到一个封装好到 `matrix`，岂不快哉。

但是我们看到最后到 `flags` 选项可以选择 `位置` 或者 `正切` ,如果我们两个选项都想选择怎么办？

如果两个选项都想选择，可以将两个选项之间用 `|` 连接起来，如下：

```java
measure.getMatrix(distance, matrix, PathMeasure.TANGENT_MATRIX_FLAG | PathMeasure.POSITION_MATRIX_FLAG);
```

我们可以将上面都例子中 `getPosTan` 替换为 `getMatrix`， 看看是不是会显得简单很多:

```kotlin
    override fun onDraw(canvas: Canvas?) {
        super.onDraw(canvas)

        //清除 path 数据
        mTempPath.rewind()
        //绘制一个模拟公路
        addLineToPath()
        //测量 path,闭合
        mPathMeasure!!.setPath(mTempPath, true)
        //动态变化的值
        mCurValues += 0.002f
        if (mCurValues >= 1) mCurValues = 0f


        // 获取当前位置的坐标以及趋势的矩阵
        mPathMeasure!!.getMatrix(mPathMeasure!!.getLength() * mCurValues, mMatrix!!,
            (PathMeasure.TANGENT_MATRIX_FLAG or PathMeasure.POSITION_MATRIX_FLAG))
        // 将图片绘制中心调整到与当前点重合(偏移加旋转)
        mMatrix!!.preTranslate(-mBitmap!!.getWidth() / 2f, -mBitmap!!.getHeight() / 2f);



        //绘制Bitmap和path
        canvas!!.drawPath(mTempPath, mTempPaint)
        canvas!!.drawBitmap(mBitmap!!, mMatrix!!, mTempPaint)

        //重绘
        postInvalidate()

    }
```

实现效果这里跟上图一样就不在贴图了，这里不用在求 tan 角度 什么的，看起来比第一种简单把，具体使用哪一种看实际需求场景吧。

## 实战

### 蜘蛛网

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191204171232.png)

[详细代码 SpiderWebView.kt 请移步 GitHub](https://github.com/yangkun19921001/CustomViewSample/blob/master/custom_view/src/main/java/com/devyk/custom_view/canvas/path_measure/SpiderWebView.kt)

### 笑脸加载进度

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191204154915.gif)

实现原理:

利用 Path 路径绘制眼睛 ，嘴巴，然后在通过`Path#computeBounds` 拿到 RectF 矩形边界并绘制出来，最后通过动画来执行不断重绘截取，就形成了上面效果了。

\(Ps: 上面效果只是一个练习 demo 不建议直接在项目中使用。\)

[详细代码 FaceLoadingView 请移步 GitHub](https://github.com/yangkun19921001/CustomViewSample/blob/master/custom_view/src/main/java/com/devyk/custom_view/canvas/path_measure/FacLoadingView.kt)

### 车随路径行驶

[详细代码 CarRotate 请移步 GitHub ](https://github.com/yangkun19921001/CustomViewSample/blob/master/custom_view/src/main/java/com/devyk/custom_view/canvas/path_measure/CarRotate.kt)

## 参考

* [https://www.gcssloop.com/customview/Path\_Basic/](https://www.gcssloop.com/customview/Path_Basic/)
* [自定义 View - 一起来撸一个蜘蛛网](https://juejin.im/entry/58dfbdca61ff4b006b166207)

