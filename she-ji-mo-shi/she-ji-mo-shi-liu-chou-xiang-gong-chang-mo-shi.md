# 设计模式 \(六\) 抽象工厂模式

### 介绍

抽象工厂模式 \(Abstract Factory Pattern\) 也是创建型设计模式之一。上一篇讲解了 [工厂方法模式](https://juejin.im/post/5d7125d5f265da03d7283ce9) ,那么这个抽象工厂又是怎么一回事呢？大家联想一下像是生活中的工厂肯定都是具体的，也就是说每个工厂都会生产某一种具体的产品，那么抽象工厂意味着生产出来的产品是不确定的，那这岂不是很奇怪？抽象工厂模式起源于以前对不同操作系统的图形化解决方案，如不同操作系统中的按钮和文本框控件其实现不同，展示效果也不一样，对于每一个操作系统，其本身就构成一个产品类，而按钮与文本框控件也构成一个产品类，两种产品类两种变化，各自有自己的特性，如 Android 中的 Button 和 TextView 、IOS 中的 Button 、和 TextView 、 Window Phone 中的 Button 和 TextView 等。

### 定义

为创建一组相关或者相互依赖的对象提供一个借口，而不需要制定它们的具体类。

### 使用场景

一个对象如有相同的约束时可以使用抽象工厂模式。是不是听起来很抽象 ？ 举个例子，Android 、IOS 、Window Phone 下都有短信软件和拨号软件，两者都属于软件的范畴，但是，它们所在的操作系统平台不一样，即便是同一家公司出品的软件，其代码实现逻辑也是不同的，这时候就可以考虑使用抽象工厂方法模式来产生 Android 、IOS 、Window Phone 下短信软件和拨号软件。

### 类图

[![A.png](https://s3.ax2x.com/2019/09/05/A.png)](https://free.imgsha.com/i/E9w9P)

* AbstractFactory ：抽象工厂角色，它声明了一组用于创建一种产品的方法，每一个方法对应一种产品，如上图中的 AbstractFactory 中就定义了两个方法，分别创建产品 A 和产品 B 。
* ConcreteFactory : 具体工厂角色，它实现了在抽象工厂中定义的创建产品的方法，生成一组具体产品，这些产品构成了一个产品种类，每一个产品都位于某个产品等级结构中，如上述类图中的 ConcreteFactory1 、ConcreteFactory2。
* AbstractProduct: 抽象产品角色，它为每种产品声明接口，比如上述类图中的 AbstractProduct A, AbstractProduct B。
* ConcreteProduct: 具体产品角色，它定义具体工厂生产的具体产品对象，实现抽象产品接口中声明的业务方法，如上图的 ConcreteProductA1 , ConcreteProductA2 , ConcreteProductB1 ,ConcreteProductB2.

### 代码示例

其实我们平时在开发中应该很少用到抽象工厂模式，一个很重要的原因是，其相对于其他两种工厂模式来说略显复杂，对于整体架构而言修改较大且不易施展。一个很典型的例子适用于数据库模型的构建，不过对于这块来讲，大多说设计模式都能应用到其中，对于 Android 开发者来说，抽象工厂的一个更好地应用是在主题修改上，假如在项目中需要引入一套主题切换的功能，那么使用抽象工厂来构建主题框架再适合不过了，下面就以一个代码示例在说明吧：

```java
/**抽象主题工厂类*/
public abstract class AbstractThemeFactory {

    protected Context mContext;

    public AbstractThemeFactory(Context mContext) {
        this.mContext = mContext;
    }

    /**
     * 创建主题按钮
     */
    public  abstract ThemeButton createButton();

    /**
     * 创建主题标题栏
     */
    public abstract  ThemeToolbar createToolbar();
}
```

抽象主题工厂中只定义了创建 UI 元素的抽象方法，而具体实现则由不同的子类去完成。

```java
/**暗色系主题工厂*/
public class DarkThemeFactory extends AbstractThemeFactory {
    public DarkThemeFactory(Context mContext) {
        super(mContext);
    }

    @Override
    public ThemeButton createButton() {
        return new ButtonDrak(mContext);
    }

    @Override
    public ThemeToolbar createToolbar() {
        return new ToolbarDrak(mContext);
    }
}
```

```java
/**亮色系主题工厂*/
public class LightThemeFactory extends AbstractThemeFactory {
    public LightThemeFactory(Context mContext) {
        super(mContext);
    }

    @Override
    public ThemeButton createButton() {
        return new ButtonLight(mContext);
    }

    @Override
    public ThemeToolbar createToolbar() {
        return new ToolbarLight(mContext);
    }
}
```

对于 Dark ， Light 都实现了各自的主题元素，下面我们看下 UI 元素抽象类

```java
//抽象主题标题栏颜色
abstract class ThemeToolbar extends Toolbar {
    public ThemeToolbar(Context context) {
        super(context);


        initIcon();

        initTextColor();

        initBackgroundColor()
        ;
    }

    /**
     * 初始化图标
     */
    public abstract void initIcon();

    /**
     * 初始话按钮颜色
     */
    public abstract void initTextColor();


    /**
     * 初始化按钮颜色
     */
    public abstract void initBackgroundColor();
}
```

```java
//抽象主题按钮类
abstract class ThemeButton extends Button {
    public ThemeButton(Context context) {
        super(context);

        initTextColor();

        initBackgroundColor()
        ;
    }

    /**
     * 初始话按钮颜色
     */
    public abstract void initTextColor();


    /**
     * 初始化按钮颜色
     */
    public abstract void initBackgroundColor();
}
```

主题颜色实现类，我这里就那一个举例

```java
class ButtonDark extends ThemeButton {
    public ButtonDark(Context mContext) {
        super(mContext);
    }

    @Override
    public void initTextColor() {        setTextColor(mContext.getResources().getColor(R.color.dark_color));

    }

    @Override
    public void initBackgroundColor() {              setBackgroundColor(mContext.getResources().getColor(R.color.dark_color));
    }
}
```

使用：

```java
DarkThemeFactory darkThemeFactory = new DarkThemeFactory(getContext();
//创建暗色主题按钮
ThemeButton button = darkThemeFactory.createButton();
//创建亮色主题标题栏
ThemeToolbar toolbar = darkThemeFactory.createToolbar();
```

大家可以看到，抽象工厂模式的结构相对于简单工厂和工厂方法模式来说要复杂的多，但是其本身也是应用于较为复杂场景的解耦，比如上述事例中，我们就应对了多个层面的变化，因此在实际项目开发中是否使用抽象工厂模式还需要看具体情况。

### 总结

优点：

一个显著的优点是分离接口与实现，客户端使用抽象工厂来创建需要的对象，而客户端根本就不知道具体实现是谁，客户端只是面向产品接口编程而已，使其从具体的产品实现中解耦，同时基于接口与实现的分离，使抽象工厂方法模式在切换产品类时更加灵活，容易。

缺点：

随着产品类的增加，抽象工厂也得修改，相当于所有的具体工厂都得修改，不易扩展新的产品。

[文章代码地址](https://github.com/yangkun19921001/AndroidDpCode)

## 特别感谢

[《 Android 源码设计模式解析与实战 》](https://item.jd.com/12113187.html)

