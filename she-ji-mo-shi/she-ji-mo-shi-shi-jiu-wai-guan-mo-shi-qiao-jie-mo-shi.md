# 设计模式 \(十九\) 外观模式、桥接模式

## 外观模式

### 介绍

外观模式 \(Facade\) 在开发过程中的运用评率非常高，尤其是在现阶段，各种第三方 SDK “充斥” 在我们周边，而这些 SDK 大多会使用外观模式。通过一个外观类使得整个系统的接口只有一个统一的高层接口，这样能够降低用户的使用成本，也对用户屏蔽了很多实现细节。当然，在我们的开发过程中，外观模式也是我们封装 API 的常用手段，例如，网路模块、图片模块，可能你已经在开发中运用无数次外观模式，只是没有在理论中认识它，下面我们就来学习它。

### 定义

要求一个子系统的外部与其内部的通信必须通过一个统一的对象进行。门面模式提供一个高层次的接口，使得子系统更易于使用。

### 使用场景

1. 为一个复杂子系统提供一个简单接口。子系统往往因为不断演化而变得越来越复杂，甚至可能被替换。大多数模式使用时都会产生更多、更小的类，这使子系统更具可重用性的同时也更容易对子系统进行定制、修改，这种易变性使得隐藏子系统的具体实现变得尤为重要。Facade 可以提供一个简单统一的接口，对外隐藏子系统的具体实现、隔离变化。
2. 当你需要构建一个层次结构的子系统时，使用 Facade 模式定义子系统中每层的入口点。如果子系统之间是相互依赖的，你可以让它们仅通过 Facade 接口进行通信，从而简化了它们之间的依赖关系。

### UML 类图

[![b124e125978b9d966f4427a0e52bf59e.png](https://s5.ex2x.com/2019/09/15/b124e125978b9d966f4427a0e52bf59e.png)](https://free.imgsha.com/i/vau1d)

* Facade: 系统对外的统一接口，系统内部系统地工作。

### 简单示例

**需求背景:**手机的外观模式（电话功能，短信功能，GPS, 拍照）

**手机抽象类:**

```java
public abstract class AbstractMobile {
    /**
     * 定义一个打电话功能
     */
    protected Phone phone = null;

    /**
     * 定义一个拍照功能
     */
    protected ICamera camera = null;

    public AbstractMobile(Phone phone, ICamera camera) {
        this.phone = phone;
        this.camera = camera;
    }

    public abstract void dail();

    public abstract void videoChat();

    public abstract void hangup();

    public abstract void takePicture();

    public abstract void stop();
}
```

**手机实现类:**

```java
public class MobilePhone extends AbstractMobile {


    public MobilePhone(Phone phone, ICamera camera) {
        super(phone, camera);
    }

    public void dail() {
        phone.dail();

    }

    ;

    @Override
    public void videoChat() {
        System.out.println("视频聊天呼叫中...");
        camera.openCamera();
    }

    @Override
    public void hangup() {
        phone.hangup();
    }

    @Override
    public void takePicture() {
        camera.takePicture();
    }

    @Override
    public void stop() {
        camera.stop();
        phone.hangup();
    }

}
```

**功能接口类**

```java
public interface Phone {
    /**
     * 打电话
     */
    public void dail();

    /**
     * 挂断
     */
    public void hangup();
}
```

```java
public interface ICamera {

    /**
     * 打开相机预览
     */
    public void openCamera();

    /**
     * 拍照
     */
    public void takePicture();

    /**
     * 关闭相机
     */
    public void stop();
}
```

**功能实现类:**

```java
public class CameraImpl implements ICamera {
    @Override
    public void openCamera() {
        System.out.println("打开相机");
    }

    @Override
    public void takePicture() {
        System.out.println("拍照");
    }

    @Override
    public void stop() {
        System.out.println("关闭相机");
    }
}
```

```java
public class PhoneImpl implements Phone {
    @Override
    public void dail() {
        System.out.println("打电话");
    }

    @Override
    public void hangup() {
        System.out.println("挂断电话");
    }
}
```

**test:**

```java
    @Test
    public void testFacade(){

        Phone phone = new PhoneImpl();
        ICamera camera = new CameraImpl();
        MobilePhone mobilePhone = new MobilePhone(phone,camera);

        mobilePhone.dail();
        mobilePhone.videoChat();
        mobilePhone.takePicture();
        mobilePhone.stop();
    }
```

**output:**

```java
打电话
视频聊天呼叫中...
打开相机
拍照
关闭相机
挂断电话
```

从上述代码可以看到，外观模式就是统一接口封装。将子系统的逻辑、交互隐藏起来，为用户提供一个高层次的接口，是的系统更加易用，同时也对外隐藏了具体的实现，这样即使具体的子系统发生了变化，用户也不会知道，因为用户使用的是 Facade 高层次接口，内部的变化对于用户来说并不可见。这样一来就将变化隔离开来，使得系统更为灵活。

### 总结

外观模式是一个使用频率较高的设计模式，它的精髓就在于 ”封装“ 二字。通过一个高层次结构为用户提供统一的 API 入口，使得用户通过一个类型就基本能够操作整个系统，这样减少了用户的成本，也能够提升系统的灵活性。

**优点:**

1. 对客户程序隐藏子系统细节，因而减少了客户对于子系统的耦合，能够拥抱变化。
2. 外观类对子系统的接口封装，使得系统更易于使用。

**缺点:**

1. 外观类接口膨胀。由于子系统的接口都有外观类统一对外暴露，使得外观类的 API 接口较多，在一定程度上增加了用户使用成本。
2. 外观类没有遵循开闭原则，当业务出现更换时，可能需要直接修改外观类。

## 桥接模式

### 介绍

桥接模式（BridgePattern）也称为桥梁模式，是结构型模式之一。在现实生活中大家都知道 ”桥梁“ 是连接河道两岸的主要交通枢纽，简而言之其作用就是连接河的两边，而我们的桥接模式与现实中的情况很相似，也是承担着连接 ”两边“ 的作用，那么具体是哪两边呢？这里先不着急，我们先来看看定义吧。

### 定义

将抽象部分与实现部分分离，使它们都可以独立地进行变化。

### 使用场景

从模式的定义中我们大致可以了解到，这里的 ”桥梁“ 的作用其实就是连接 ”抽象部分“ 与 "实现部分"，但是事实上，任何多维度变化类或者说多个树状类之间的耦合都可以使用桥接模式来实现解耦。

### UML 类图

[![acf7849a49d5fbac3faf1ebcf2a98f94.png](https://s5.ex2x.com/2019/09/15/acf7849a49d5fbac3faf1ebcf2a98f94.png)](https://free.imgsha.com/i/viEaZ)

* Abstraction: 抽象部分
* RefinedAbstraction: 优化的抽象部分
* Implementor: 实现部分
* ConcreteImplementorA/B: 实现部分的具体实现。
* Client: 客户类，客户端程序。

### 简单示例

**需求背景:** 我们去店里面买咖啡，对不同的咖啡不同的定义。

**咖啡抽象类:**

```java
public abstract class coffee {


    protected CoffeeAdditives impl;

    public coffee(CoffeeAdditives impl) {
        this.impl = impl;
    }

    /**
     * 制作什么得咖啡由子类决定
     */
    public abstract void makeCoffee();
}
```

**大杯咖啡制作具体类:**

```java
public class LargeCoffee  extends coffee{
    public LargeCoffee(CoffeeAdditives impl) {
        super(impl);
    }

    @Override
    public void makeCoffee() {
        System.out.println("制作大杯咖啡->" + impl.addSomething());

    }
}
```

**小杯咖啡制作具体类:**

```java
public class SmallCoffee extends coffee {
    public SmallCoffee(CoffeeAdditives impl) {
        super(impl);
    }

    @Override
    public void makeCoffee() {
        System.out.println("制作小杯咖啡"+ impl.addSomething());
    }
}
```

**咖啡加糖/原味抽象类:**

```java
public interface CoffeeAdditives {

    public String addSomething();
}
```

**咖啡加糖/原味具体类:**

```java
public class Ordinary implements CoffeeAdditives {
    @Override
    public String addSomething() {
        return "原味";
    }
}
```

```java
public class Sugar implements CoffeeAdditives {
    @Override
    public String addSomething() {
        return "加糖";
    }
}
```

**test:**

```java
    @Test
    public void testBridge(){
        //原味
        CoffeeAdditives coffeeAdditives = new Ordinary();
        //加糖
        CoffeeAdditives coffeeAdditives1 = new Sugar();
        //大杯原味
        LargeCoffee largeCoffee = new LargeCoffee(coffeeAdditives);
        largeCoffee.makeCoffee();
        //小杯原味
        SmallCoffee smallCoffee = new SmallCoffee(coffeeAdditives);
        smallCoffee.makeCoffee();

        //大杯加糖
        LargeCoffee largeCoffee2 = new LargeCoffee(coffeeAdditives1);
        largeCoffee2.makeCoffee();
        //小杯加糖
        SmallCoffee smallCoffee3 = new SmallCoffee(coffeeAdditives1);
        smallCoffee3.makeCoffee();
    }
```

**output:**

```java
制作大杯咖啡->原味
制作小杯咖啡原味
制作大杯咖啡->加糖
制作小杯咖啡加糖
```

从上面代码可以知道，不管 Coffee 变化了还是 CoffeeAdditives 变化了，其相对于对方而言都是独立的没有什么过多的交集，两者之间唯一的联系就是 Coffee 中保持的对 Coffeeadditives 的引用，就是开头介绍所说的枢纽，这就是桥接模式的简单示例。

### 总结

**优点:**

* 分离抽象与实现、灵活的扩展。

**缺点:**

* 不容易设计。

[文章代码地址](https://github.com/yangkun19921001/AndroidDpCode)

## 特别感谢

[《 Android 源码设计模式解析与实战 》](https://item.jd.com/12113187.html)

感谢你的阅读，谢谢！

