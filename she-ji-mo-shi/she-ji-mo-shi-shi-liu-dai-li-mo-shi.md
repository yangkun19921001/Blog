# 设计模式 \(十六\) 代理模式

## 介绍

代理模式 \(Proxy Pattren\) 也称为委托模式，是属于结构型设计模式，其重要性不言而喻，相信在看过本篇文章之后会发现不少设计模式中都有代理模式的影子。那么何为代理模式？其实代理在我们日常生活中并不少见，对于程序员来说最常接触的莫过于代理上网了，连上代理服务器地址，就可以轻松畅游全世界的网络；总而言之，也许你并不留意，但是代理是无处不在，现实生活如此，我们的 Code 世界里也是如此！既然这样，我们来探究下代理模式倒是有多普遍。下面首先看下代理模式的定义吧。

## 定义

为其它对象提供一种代理以控制对这个对象的访问。

## 使用场景

当无法或不想直接访问某个对象存在困难时可以通过一个代理对象来间接访问，为了保证客户端使用的透明性，委托对象与代理对象需要实现相同的接口。

## UML 类图

[![hfM0o.png](https://storage1.cuntuku.com/2019/09/14/hfM0o.png)](https://cuntuku.com/image/hfM0o)

* Subject: 抽象主题类；该类的主要职责是声明真实主题与代理的共同接口方法，该类既可以是一个抽象类也可以是一个接口。
* RealSubject: 真实主题类；该类也称为被委托类或被代理类，该类定义了代理所表示的真实对象，由其执行具体的业务逻辑方法，而客户类则通过代理类间接地调用真实主题中定义的方法。
* ProxySubject: 代理类；该类也称为委托类或代理类，该类持有一个对真实主题类的引用，在其所实现的接口方法中调用真实主题类中相应的接口方法执行，以此起到代理的作用。
* Client: 客户类，即使用代理类的类型。

## 代码示例

代理模式可以大致分为两大部分，一是静态代理，而是动态代理。静态代理是只有具体的代理对象，而动态代理则与静态代理相反，通过反射机制动态地生成代理者的对象，也就是说我们在 code 阶段压根不需要知道代理对象是谁，代理谁将会在执行阶段决定。下面我们就来看下吧

### 简单示例

#### 静态代理

**业务背景:** X 程序员在公司上班时，遇见了公司拖欠工资甚至克扣工资的情况，这种情况下 X 程序员还是通过法律途径来解决问题，这个时候就需要请一个律师来作为自己的诉讼代理人，先看下面的代码示例吧

**诉讼接口类:**

```java
public interface ILawsuit {

    /**
     * 提交申请
     */
    void submit();

    /**
     * 举行举证
     */
    void burden();

    /**
     * 开始辩护
     */
    void defend();

    /**
     * 诉讼完成
     */
    void finish();
}
```

**具体诉讼人（X程序员）:**

```java
public class XProgrammer implements ILawsuit {
    @Override
    public void submit() {
        System.out.println("老板欠 X 程序员工资，申请仲裁!");

    }

    @Override
    public void burden() {
        System.out.println("这是合同书和过去一年的银行工资流水");

    }

    @Override
    public void defend() {
        System.out.println("证据确凿！不需要再说什么了！");

    }

    @Override
    public void finish() {
        System.out.println("诉讼成功！判决老板即日起 7 天内结算工资！");
    }
}
```

**X程序员请的律师（代理对象）:**

```java
public class ProxyLawyer implements ILawsuit {
    /**
     * 持有一个具体被代理者的引用，这里就是 X 程序员，也可以是其它 Y 程序员 只是具体说明。
     */
    private ILawsuit mLawsuit;

    public ProxyLawyer(ILawsuit lawsuit) {
        mLawsuit = lawsuit;
    }

    @Override
    public void submit() {
        mLawsuit.submit();
    }

    @Override
    public void burden() {
        mLawsuit.burden();
    }

    @Override
    public void defend() {
        mLawsuit.defend();
    }

    @Override
    public void finish() {
        mLawsuit.finish();
    }
}
```

**test:**

```java
    @Test
    public void testProxy(){

        //X 程序员
        ILawsuit lawsuit = new XProgrammer();

        //程序员请的律师，把自己的事务交于律师来处理
        ILawsuit proxyLawyer = new ProxyLawyer(lawsuit);

        //律师开始处理
        proxyLawyer.submit();
        proxyLawyer.burden();
        proxyLawyer.defend();
        proxyLawyer.finish();
    }
```

**output:**

```java
老板欠 X 程序员工资，申请仲裁!
这是合同书和过去一年的银行工资流水
证据确凿！不需要再说什么了！
诉讼成功！判决老板即日起 7 天内结算工资！
```

#### 动态代理

动态代理其实也很简单，Java 给我们提供了一个很便捷的动态代理接口 InvocationHandler ,实现该接口需要重写其调用方法 invoke。

下面我们就上面的示例来稍加改动一下:

**动态代理类\(这里可以理解为律师对象\)**

```java
public class DynamicProxy implements InvocationHandler {

    /**
     * 代理者的引用（这里可以理解为 X 程序员）
     */
    private Object object;

    public DynamicProxy(Object object) {
        this.object = object;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        //通过反射调用其代理者的方法
        return method.invoke(object,args);
    }
}
```

**test:**

```java
    @Test
    public void testDynamicProxy(){

        //X 程序员
        ILawsuit lawsuit = new XProgrammer();

        //构造一个动态代理对象（程序员请的律师，把自己的事务交于律师来处理）
        DynamicProxy dynamicProxy = new DynamicProxy(lawsuit);

        //拿到代理者身上的 ClassLoader
        ClassLoader classLoader = lawsuit.getClass().getClassLoader();

        //动态的构造一个代理者律师出来
        ILawsuit proxyLawyer = (ILawsuit) Proxy.newProxyInstance(classLoader, new Class[]{ILawsuit.class}, dynamicProxy);

        //律师开始处理
        proxyLawyer.submit();
        proxyLawyer.burden();
        proxyLawyer.defend();
        proxyLawyer.finish();
    }
```

**output:**

```java
老板欠 X 程序员工资，申请仲裁!
这是合同书和过去一年的银行工资流水
证据确凿！不需要再说什么了！
诉讼成功！判决老板即日起 7 天内结算工资！
```

运行结果和静态代理一样，由此可见动态代理通过一个代理类来代理 N 多个被代理类，其本质是对代理者与被代理者进行解耦，使两者没有直接的耦合关系。相对而言静态代理则是能为给定接口下的实现类做代理，如果接口不同那么就需要重新定义不同的代理类，最为复杂，但是静态代理更符合面向对象原则。在开发时具体使用哪种方式来实现代理，就看自己的偏好了。

## 总结

代理模式应用广泛，在后面的结构型模式中，你都可以看到代理模式的影子，有些模式单独作为一种设计模式，倒不如说是对代理模式的一种针对性优化。而且代理模式几乎没有缺点可言，它是细分化至很小的一种模式，如果非得说一个缺点的话，那么就是设计模式的通病，对类的增加。不过在这种孰优孰劣的局势下，就算对类的稍微增加又有什么问题呢，是吧？

[文章代码地址](https://github.com/yangkun19921001/AndroidDpCode)

## 特别感谢

[《 Android 源码设计模式解析与实战 》](https://item.jd.com/12113187.html)

感谢你的阅读，谢谢！

