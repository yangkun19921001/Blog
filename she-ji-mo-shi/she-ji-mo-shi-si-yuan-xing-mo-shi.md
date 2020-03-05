# 设计模式 \(四\) 原型模式

### 介绍

原型模式是一个创建型的模式。原型二字表明了该模式应该有一个样板实例，用户从这个样板对象中复制出一个内部属性一致的对象，这个过程也就是我们俗称的 "克隆" 。被复制的实例就是我们所称的 “原型” ，这个原型是可定制的。原型模式多用于创建复杂的或者构造耗时的实例，因为这种情况下，复制一个已经存在的实例可使程序运行更高效。

### 定义

用原型实例指定创建对象的种类，并通过复制这些原型创建新的对象。

### 使用场景

1. 类初始化需要消耗非常多的资源，这个资源包括数据、硬件资源等，通过原型复制避免这些消耗。
2. 通过 new 产生一个对象需要非常繁琐的数据准备和访问权限，这时可以使用原型模式。
3. 一个对象需要提供给其它对象访问，而且各个调用者可能都需要修改其值时，可以考虑使用原型模式复制多个对象供调用者使用，既保护性拷贝。

### XML 类图

[![cGAVM.png](https://storage7.cuntuku.com/2019/09/02/cGAVM.png)](https://cuntuku.com/image/cGAVM)

* Client: 客户端用户。
* Prototype: 抽象类或者接口，声明具备 clone 能力。
* ConcreatePrototype: 具体的原型类

### 原型模式的简单实现

下面以简单的文档 copy 为例来演示一下原型模式。

需求：有一个文档，文档中包含了文字和图片，用户经过了长时间的内容编辑后，打算对该文档做进一步的编辑，但是，这个编辑后的文档是否会被采用还不确定，因此，为了安全起见，用户需要将当前文档 copy 一份，然后再在文档副本上进行修改。

```java
/***这里代表是具体原型类*/
public class WordDocument implements Cloneable {

    /**
     * 文本
     */
    private String mTxt;

    /**
     * 图片名列表
     */
    private List<String> mImagePath = new ArrayList<>();


    public String getmTxt() {
        return mTxt;
    }

    public void setmTxt(String mTxt) {
        this.mTxt = mTxt;
    }

    public List<String> getImagePath() {
        return mImagePath;
    }

    public void addImagepath(String imagepath) {
        mImagePath.add(imagepath);
    }

    /**
     * 打印文档内容
     */
    public void println(){

        System.out.println("----------------  start  ----------------");

        System.out.println("txt: " + mTxt);
        System.out.println("mImagePath: ");
        for (String path : mImagePath) {
            System.out.println("path: " + path);
        }

        System.out.println("-----------------  end   ----------------");
    }

    /**
     * 声明具备 clone 能力
     * @return clone 的对象
     */
    @Override
    protected WordDocument clone()  {
        try {
            WordDocument document = (WordDocument)super.clone();
            document.mTxt = this.mTxt;
            document.mImagePath = this.mImagePath;
            return document;
        } catch (CloneNotSupportedException e) {
            e.printStackTrace();
        }
        return null;
    }
}
```

Test:

```java
    @Test
    public  void test4(){
        //1. 构建文档对象
        WordDocument wordDocument = new WordDocument();
        //2. 编辑文档
        wordDocument.setmTxt("今天是一个好天气");
        wordDocument.addImagepath("/sdcard/image.png");
        wordDocument.addImagepath("/sdcard/image2.png");
        wordDocument.addImagepath("/sdcard/image3.png");
        //打印文档内容
        wordDocument.println();


        System.out.println("--------------------开始clone-----\n\n");

        //以原始文档为准，copy 副本
        WordDocument cloneDoc = wordDocument.clone();

        System.out.println(" 打印副本，看看数据  \n\n");
        //打印副本，看看数据
        cloneDoc.println();

        //在副本文档上修改
        cloneDoc.setmTxt("副奔上修改文档：老龙王哭了");
        System.out.println("  打印修改后的副本  \n\n");
        //打印修改后的副本
        cloneDoc.println();
        System.out.println("----看会不会影响原始文档-----\n\n");
        //看会不会影响原始文档？？？？？？？
        wordDocument.println();
      System.out.println("内存地址：\nwordDocument: "+wordDocument.toString() +"\n" + "cloneDoc: "+cloneDoc.toString());

    }
```

Output:

```java
----------------  start  ----------------

txt: 今天是一个好天气
mImagePath: 
path: /sdcard/image.png
path: /sdcard/image2.png
path: /sdcard/image3.png
-----------------  end   ----------------

--------------------开始clone-----


 打印副本，看看数据  


----------------  start  ----------------

txt: 今天是一个好天气
mImagePath: 
path: /sdcard/image.png
path: /sdcard/image2.png
path: /sdcard/image3.png
-----------------  end   ----------------

  打印修改后的副本  


----------------  start  ----------------

txt: 副奔上修改文档：老龙王哭了
mImagePath: 
path: /sdcard/image.png
path: /sdcard/image2.png
path: /sdcard/image3.png
-----------------  end   ----------------

----看会不会影响原始文档-----


----------------  start  ----------------

txt: 今天是一个好天气
mImagePath: 
path: /sdcard/image.png
path: /sdcard/image2.png
path: /sdcard/image3.png
-----------------  end   ----------------

内存地址：
wordDocument: com.devyk.android_dp_code.prototype.WordDocument@48533e64
cloneDoc: com.devyk.android_dp_code.prototype.WordDocument@64a294a6
```

从上面代码跟打印可以看出 cloneDoc 是通过 wordDocument.clone\(\); 创建的并且 cloneDoc 第一次输出和 wordDocument 原始文档数据一样，既 cloneDoc 是 wordDocument 的一份copy ,他们的内容是一样的但是内存地址不一样。而 cloneDoc 修改了内容也不会影响到原始文本内容，这就保证了原始数据安全性。（注意：通过 clone 的对象并不会执行 构造函数！）

### 浅拷贝和深拷贝

上述原型模式的实现实际上只是一个浅拷贝，也称为影子拷贝。这份拷贝实际上并不是将原始文档的所有字段都重新构造了一份，而是副本文档的字段引用原始文档的字段。

[![162bd6d2b1ba06809.png](https://s3.ax2x.com/2019/09/03/162bd6d2b1ba06809.png)](https://free.imgsha.com/i/2f01x)

我们知道 A 引用 B 那么我们可以认为 A,B 都指向同一个地址，当修改 A 时 B 也会随之改变， B 修改时 A 也会随之改变。我们直接看下面代码示例：

```java
    @Test
    public void test4() {
        //1. 构建文档对象
        WordDocument wordDocument = new WordDocument();
        //2. 编辑文档
        wordDocument.setmTxt("今天是一个好天气");
        wordDocument.addImagepath("/sdcard/image.png");
        wordDocument.addImagepath("/sdcard/image2.png");
        wordDocument.addImagepath("/sdcard/image3.png");
        //打印文档内容
        wordDocument.println();


        System.out.println("--------------------开始clone-----\n\n");

        //以原始文档为准，copy 副本
        WordDocument cloneDoc = wordDocument.clone();

        System.out.println(" 打印副本，看看数据  \n\n");
        //打印副本，看看数据
        cloneDoc.println();

        //在副本文档上修改
        cloneDoc.setmTxt("副奔上修改文档：老龙王哭了");
        cloneDoc.addImagepath("/sdcard/副本发生改变");
        System.out.println("  打印修改后的副本  \n\n");
        //打印修改后的副本
        cloneDoc.println();
        System.out.println("----看会不会影响原始文档-----\n\n");
        //看会不会影响原始文档？？？？？？？
        wordDocument.println();

        System.out.println("内存地址：\nwordDocument: " + wordDocument.toString() + "\n" + "cloneDoc: " + cloneDoc.toString());

    }
```

注意看副本文档，我手动调用 addImagepath 添加了一个新的图片地址。那么大家猜原始文档会发生改变吗？请看下面的输出：

```java
----------------  start  ----------------

txt: 今天是一个好天气
mImagePath: 
path: /sdcard/image.png
path: /sdcard/image2.png
path: /sdcard/image3.png
-----------------  end   ----------------

--------------------开始clone-----


 打印副本，看看数据  


----------------  start  ----------------

txt: 今天是一个好天气
mImagePath: 
path: /sdcard/image.png
path: /sdcard/image2.png
path: /sdcard/image3.png
-----------------  end   ----------------

  打印修改后的副本  


----------------  start  ----------------

txt: 副奔上修改文档：老龙王哭了
mImagePath: 
path: /sdcard/image.png
path: /sdcard/image2.png
path: /sdcard/image3.png
path: /sdcard/副本发生改变
-----------------  end   ----------------

----看会不会影响原始文档-----


----------------  start  ----------------

txt: 今天是一个好天气
mImagePath: 
path: /sdcard/image.png
path: /sdcard/image2.png
path: /sdcard/image3.png
path: /sdcard/副本发生改变
-----------------  end   ----------------

内存地址：
wordDocument: com.devyk.android_dp_code.prototype.WordDocument@48533e64
cloneDoc: com.devyk.android_dp_code.prototype.WordDocument@64a294a6
```

注意看我们副本添加的图片地址是不是影响了原始文档的图片地址数据，那么这是怎么回事勒？对 C++ 了解的同学应该有深刻的体会，这是因为上文中 cloneDoc 只是进行了浅拷贝，图片列表 mImagePath 只是单纯的指向了 this.mImagePath,并没有重新构造一个 mImagePath 对象，就像开始介绍浅/深拷贝一样， A，B 对象其实指向的是同一个地址，所以不管 A，B 改了指向地址的数据那么都会随之发生改变，那如何解决这个问题？答案就是采取深拷贝，即在拷贝对象时，对于引用型的字段也要采用拷贝的形式，而不是单纯引用形式，下面我们修改 clone 代码，如下：

```java
    /**
     * 声明具备 clone 能力
     * @return clone 的对象
     */
    @Override
    public WordDocument clone()  {
        try {
            WordDocument document = (WordDocument)super.clone();
            document.mTxt = this.mTxt;
            //进行深拷贝
            document.mImagePath = (ArrayList<String>) this.mImagePath.clone();
            return document;
        } catch (CloneNotSupportedException e) {
            e.printStackTrace();
        }
        return null;
    }
```

再来测试一下，看输出类容：

```java
----------------  start  ----------------

txt: 今天是一个好天气
mImagePath: 
path: /sdcard/image.png
path: /sdcard/image2.png
path: /sdcard/image3.png
-----------------  end   ----------------

--------------------开始clone-----


 打印副本，看看数据  


----------------  start  ----------------

txt: 今天是一个好天气
mImagePath: 
path: /sdcard/image.png
path: /sdcard/image2.png
path: /sdcard/image3.png
-----------------  end   ----------------

  打印修改后的副本  


----------------  start  ----------------

txt: 副奔上修改文档：老龙王哭了
mImagePath: 
path: /sdcard/image.png
path: /sdcard/image2.png
path: /sdcard/image3.png
path: /sdcard/副本发生改变
-----------------  end   ----------------

----看会不会影响原始文档-----


----------------  start  ----------------

txt: 今天是一个好天气
mImagePath: 
path: /sdcard/image.png
path: /sdcard/image2.png
path: /sdcard/image3.png
-----------------  end   ----------------

内存地址：
wordDocument: com.devyk.android_dp_code.prototype.WordDocument@48533e64
cloneDoc: com.devyk.android_dp_code.prototype.WordDocument@64a294a6
```

通过输出类容，深拷贝解决了上述问题。

原型模式是一个非常简单的一个模式，它的核心问题就是对原始对象进行拷贝，在这个模式的使用过程中需要注意一点就是 深/浅拷贝的问题。在实际开发中，为了减少不必要的麻烦，建议大家都使用深拷贝。

### 源码中的原型模式

* ArrayList

  刚刚我们 clone 文档可知，进行的 ArrayList clone ，那么 ArrayList clone 具体是怎么实现的？我们一起来看下：

  ```java
      public Object clone() {
          try {
            //1. 
              ArrayList<?> v = (ArrayList<?>) super.clone();
            //2. 
              v.elementData = Arrays.copyOf(elementData, size);
              v.modCount = 0;
              return v;
          } catch (CloneNotSupportedException e) {
              // this shouldn't happen, since we are Cloneable
              throw new InternalError(e);
          }
      }
  ```

  代码中第一步首先进行自身的 clone ,然后在对自身的数据进行 copy .

* Intent

  下面以 Intent 来分析源码中的原型模式，首先看如下代码

  ```java
      public static Intent toSMS(){
          Uri uri = Uri.parse("smsto:11202");

          Intent preIntent = new Intent(Intent.ACTION_SENDTO,uri);
          preIntent.putExtra("sms_body","test");

          //clone
          return (Intent) preIntent.clone();

      }
  ```

  [![2.png](https://s3.ax2x.com/2019/09/03/2.png)](https://free.imgsha.com/i/2pQVi)

  从代码中可以看到 preIntent.clone\(\); 方法拷贝了一个对象 Intent ,然后执行跳转 Activity,跳转的内容与原型数据一致。

  我们继续看 Intent clone 具体实现：

  ```java
    /***进行 clone **/  
      @Override
      public Object clone() {
          return new Intent(this);
      }
  ```

  ```java
      /**
       * Copy constructor.
       */
      public Intent(Intent o) {
          this.mAction = o.mAction;
          this.mData = o.mData;
          this.mType = o.mType;
          this.mPackage = o.mPackage;
          this.mComponent = o.mComponent;
          this.mFlags = o.mFlags;
          this.mContentUserHint = o.mContentUserHint;
          this.mLaunchToken = o.mLaunchToken;
          if (o.mCategories != null) {
              this.mCategories = new ArraySet<String>(o.mCategories);
          }
          if (o.mExtras != null) {
              this.mExtras = new Bundle(o.mExtras);
          }
          if (o.mSourceBounds != null) {
              this.mSourceBounds = new Rect(o.mSourceBounds);
          }
          if (o.mSelector != null) {
              this.mSelector = new Intent(o.mSelector);
          }
          if (o.mClipData != null) {
              this.mClipData = new ClipData(o.mClipData);
          }
      }
  ```

  可以看到 clone 方法实际上在内部并没有调用 super.clone\(\) 来实现拷贝对象，而是通过 new Intent\(this\)。 在开始我们提到过，使用 clone 和 new 需要根据构造对象的成本来决定，如果对象的构造成本比较高或者构造麻烦，那么使用 clone 函数效率较高，反之可以使用 new 关键字的形式。这就是和 C++ 中的 copy 构造函数完全一致，将原始对象作为构造函数的参数，然后在构造函数内将原始对象数据挨个 copy , 到此，整个 clone 过程就完成了。

### 总结

原型模式本质就是对象 copy ,与 C++ 中的拷贝构造函数相似，他们之前容易出现的问题也都是深拷贝、浅拷贝。使用原型模式可以解决构建复杂对象的资源消耗问题，能够在某些场景下提升创建爱你对象的效率。还有一个重要的用途，就是保护性拷贝，也就是某个对象对外可能只是只读模式。

优点：

原型模式是在内存中二进制流的 copy, 要比 new 一个对象性能好很多，特别是要在一个循环体内产生大量的对象时，原型模式可以更好地体现其优点。

缺点：

这既是它的有点也是缺点，直接在内存中拷贝，构造函数时不会执行的，在实际开发中应该注意这个潜在的问题。

[文章代码地址](https://github.com/yangkun19921001/AndroidDpCode)

## 特别感谢

[《 Android 源码设计模式解析与实战 》](https://item.jd.com/12113187.html)

