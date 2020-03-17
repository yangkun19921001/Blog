### Bitmap 基础

#### 1. Bitmap 使用时候注意什么？

1、要选择合适的图片规格（bitmap类型）：

```
ALPHA_8   1byte
ARGB_4444 2byte
ARGB_8888 4byte
RGB_565  2byte

```

2、降低采样率。BitmapFactory.Options 参数inSampleSize的使用，先把options.inJustDecodeBounds设为true，只是去读取图片的大小，在拿到图片的大小之后和要显示的大小做比较通过calculateInSampleSize()函数计算inSampleSize的具体值，得到值之后。options.inJustDecodeBounds设为false读图片资源。

3、复用内存。即，通过软引用(内存不够的时候才会回收掉)，复用内存块，不需要再重新给这个bitmap申请一块新的内存，避免了一次内存的分配和回收，从而改善了运行效率。

4、使用recycle()方法及时回收内存。

5、压缩图片。



#### 2. bitmap recycler 相关

在Android中，Bitmap的存储分为两部分，一部分是Bitmap的数据，一部分是Bitmap的引用。 在Android2.3时代，Bitmap的引用是放在堆中的，而Bitmap的数据部分是放在栈中的，需要用户调用recycle方法手动进行内存回收，而在Android2.3之后，整个Bitmap，包括数据和引用，都放在了堆中，这样，整个Bitmap的回收就全部交给GC了，这个recycle方法就再也不需要使用了。

bitmap recycler引发的问题：当图像的旋转角度小余两个像素点之间的夹角时，图像即使旋转也无法显示，因此，系统完全可以认为图像没有发生变化。这时系统就直接引用同一个对象来进行操作，避免内存浪费。



#### 3. 如何计算一个Bitmap占用内存的大小，怎么保证加载Bitmap不产生内存溢出？

[一般我们所说的 Bitmap 究竟占用多大内存](https://blog.csdn.net/lsyz0021/article/details/51356670)

注：这里inDensity表示目标图片的dpi（放在哪个资源文件夹下），inTargetDensity表示目标屏幕的dpi，所以你可以发现inDensity和inTargetDensity会对Bitmap的宽高进行拉伸，进而改变Bitmap占用内存的大小。

在Bitmap里有两个获取内存占用大小的方法。

getByteCount()：API12 加入，代表存储 Bitmap 的像素需要的最少内存。 getAllocationByteCount()：API19 加入，代表在内存中为 Bitmap 分配的内存大小，代替了 getByteCount() 方法。 在不复用 Bitmap 时，getByteCount() 和 getAllocationByteCount 返回的结果是一样的。在通过复用 Bitmap 来解码图片时，那么 getByteCount() 表示新解码图片占用内存的大 小，getAllocationByteCount() 表示被复用 Bitmap 真实占用的内存大小（即 mBuffer 的长度）。

为了保证在加载Bitmap的时候不产生内存溢出，可以使用BitmapFactory进行图片压缩，主要有以下几个参数：

BitmapFactory.Options.inPreferredConfig：将ARGB_8888改为RGB_565，改变编码方式，节约内存。 BitmapFactory.Options.inSampleSize：缩放比例，可以参考Luban那个库，根据图片宽高计算出合适的缩放比例。 BitmapFactory.Options.inPurgeable：让系统可以内存不足时回收内存。



#### 4. **如何获取一个图片的宽高？**

```java
public static int[] getImageWidthHeight(String path){
BitmapFactory.Options options = new BitmapFactory.Options();
/**
* 最关键在此，把 options.inJustDecodeBounds = true;
* 这里再 decodeFile()，返回的 bitmap 为空，但此时调用 options.outHeight 时，已经
包含了图片的高了
*/
options.inJustDecodeBounds = true;
Bitmap bitmap = BitmapFactory.decodeFile(path, options); // 此时返回的 bitmap 为 null
/**
*options.outHeight 为原始图片的高
*/
return new int[]{options.outWidth,options.outHeight};
}
```

通过 BitmapFactory 从不同位置获取 Bitmap：

```java
1.资源文件(drawable/mipmap/raw)
BitmapFactory.decodeResource(getResources(), 
R.mipmap.slim_lose_weight_plan_copenhagen,options);
2.资源文件(assets)
InputStream is = getActivity().getAssets().open("bitmap.png");
BitmapFactory.decodeStream(is);
3.内存卡文件
bitmap = BitmapFactory.decodeFile("/sdcard/bitmap.png");
4.网络文件
bitmap = BitmapFactory.decodeStream(is);
可根据 BitmapFactory 获取图片时传入 option，通过上述方法获取图片的宽高
```



####5. **一张图片加载到手机内存中真正的大**小是怎么计算的

参考】 https://www.cnblogs.com/dasusu/p/9789389.html



####6. [01Android媒体开发：Bitmap实践指南](https://github.com/guoxiaoxing/android-open-source-project-analysis/blob/master/doc/Android应用开发实践篇/Android媒体开发/01Android媒体开发：Bitmap实践指南.md)

####7. [推荐:Bitmap 比你想的更费内存 | 吊打 OOM](https://mp.weixin.qq.com/s?__biz=MzIxNjc0ODExMA==&mid=2247484679&idx=1&sn=d738f5ec092c8490484b66cb1ab80eab&chksm=97851c26a0f29530c2359cec1bbe74d93b90e4a1ba8df751dd6469734c8e58280fb265442d0c&scene=21#wechat_redirect)

