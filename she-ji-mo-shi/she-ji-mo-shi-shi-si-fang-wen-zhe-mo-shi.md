# 设计模式 \(十四\) 访问者模式

## 介绍

访问者模式是一种将数据操作与数据结构分离的设计模式，它是 《设计模式》中较为复杂的一个，但它的使用频率并不高，正如《设计模式》的作者 GOF 对访问者模式的描述：大多数情况下，你并不需要使用访问者模式，但是当你一旦需要使用它时，那你就是真正的需要它了。

访问者模式的基本思想是，软件系统中拥有一个由许多对象构成的、比较稳定的对象结构，这些对象的类都拥有一个 accept 方法用来接受访问者对象的访问。访问者是一个接口，它拥有一个 visit 方法，这个方法对访问到的对象结构中不同类型的元素做出不同的处理。在对象结构的一次访问过程中，我们遍历整个对象结构，对每一个元素都实施 accept 方法，在每一个元素的 accept 方法中会调动访问者的 visit 方法，从而使访问者得到以处理对象结构的每一个元素，我们可以针对对象结构设计不同的访问者类来完成不同的操作，达到区别对待的效果。

## 定义

封装一些作用于某种数据结构中的各元素的操作，它可以在不改变这个数据结构的前提下定义作用于这些元素的新的操作。

## 使用场景

1. 对象结构比较稳定，但经常需要在此对象进行很多不同的并且不相关的操作。
2. 需要对一个对象结构中的对象进行很多不同的并且不相关的操作，而需要避免这些操作 “污染” 这些对象的类，也不希望在增加新操作时修改这些类。

## UML 类图

[![hfwI0.png](https://storage6.cuntuku.com/2019/09/13/hfwI0.png)](https://cuntuku.com/image/hfwI0)

* Visitor：接口或者抽象类，它定义了对每一个元素 \(Element\) 访问的行为，它的参数就是可以访问的元素，它的方法个数理论上来讲与元素个数是一样的，因此，访问者模式要求元素的类族要稳定，如果经常添加、移除元素类，必然会导致频繁地修改 Visitor 接口，如果出现这种情况，则说明不适合使用访问者模式。
* ConcreteVisitor: 具体的访问者，它需要给出对每一个元素类访问时所产生的具体行为。
* ElementA、ElementB: 具体的元素类，它提供接受访问方法的具体实现，而这个具体的实现，通常情况下是使用访问者提供的访问该元素类的方法。
* ObjectStructure: 定义当中所提到的对象结构，对象结构是一个抽象表述，它内部管理了元素集合，并且可以迭代这些元素供访问者访问。

## 代码示例

访问者模式是一个结构、概念都较为复杂的模式，使用频率也不高，但是并不代表可以将它的作用忽略，当有合适的场景时，访问者模式会带来意向不到的灵活性，下面我们就以一个简单的示例说明下：

### 简单示例

**需求：**公司的领导层对员工进行绩效考核，但是每个领导对于员工的关注点不同，所以要不同的处理。

_员工抽象类_

```java
public abstract class Staff {
    public String  name;

    /**
     * 员工 kpi
     */
    public int kpi;

    public Staff(String name) {
        this.name = name;
        kpi = new Random().nextInt(10);
    }

    /**
     * 接受公司领导层对员的访问
     * @param visitor
     */
    public abstract  void accept(Visitor visitor);
}
```

Staff 类定义了员工的基本信息及一个 accept 方法，表示接受公司领导的访问，由子类具体实现，下面来看看，具体实现。

_程序员：_

```java
public class Engineer extends Staff {
    public Engineer(String name) {
        super(name);
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }


    /**
     * 工程师这一年写的代码量
     */
    public int getCodeLines(){
        return new Random().nextInt(10 * 10000);
    }
}
```

_经理:_

```java
public class Manager extends Staff{

    public Manager(String name) {
        super(name);
    }

    @Override
    public void accept(Visitor visitor) {
        visitor.visit(this);
    }

    /**
     * 一年做的产品数量
     * @return
     */
    public int getProducts(){
        return new Random().nextInt(10);
    }

}
```

在程序员、经理类中添加了各自的实现，因为他们的差异性才能使得访问者模式发挥它的工作。Staff、Engineer、Manager 这 3 个类就是对象结构，这些类相对稳定，不会发生变化。

_员工报表:_

```java
public class BusinesssReport {

    private List<Staff> mStaff = new ArrayList<>();

    public BusinesssReport(){
        mStaff.add(new Manager("DevYK 经理"));
        mStaff.add(new Engineer("IOS 工程师"));
        mStaff.add(new Engineer("Android 工程师"));
        mStaff.add(new Engineer("Java 工程师"));
        mStaff.add(new Engineer("C++ 工程师"));
    }

    /**
     * 为访问者展示报表
     */
    public void showReport(Visitor visitor){
        for (Staff staff : mStaff) {
            staff.accept(visitor);
        }
    }
}
```

_公司领导层抽象访问者封装:_

```java
public interface Visitor {

    /**
     * 访问工程师类型
     */
    public void visit(Engineer engineer);

    /**
     * 访问经理类型
     */
    public void visit(Manager leader);
}
```

_CEO 访问员工实现:_

```java
public class CEOVisitor implements Visitor {
    @Override
    public void visit(Engineer engineer) {
        System.out.println("engineer = [" + "name: " + engineer.name + " kpi: " + engineer.kpi + "]");
    }

    @Override
    public void visit(Manager leader) {
        System.out.println("leader = [" + "name: " + leader.name + " kpi: " + leader.kpi + " 产品数量：" + leader.getProducts() + "]");

    }
}
```

_CTO 访问员工实现_

```java
public class CTOVisitor implements Visitor {
    @Override
    public void visit(Engineer engineer) {
        System.out.println("engineer = [" + engineer.name + " 代码行数："+engineer.getCodeLines()+"]");
    }

    @Override
    public void visit(Manager leader) {
        System.out.println("leader = [" + leader.name + " 产品数量："+leader.getProducts()+"]");
    }
}
```

_Client 客户端代码 --》年总进行访问_

```java
    @Test
    public void textVisitor(){
        //构建报表
        BusinesssReport businesssReport = new BusinesssReport();
        //给 CEO 汇报的报表
        System.out.println(">>>>>>>给 CEO 汇报的报表");
        businesssReport.showReport(new CEOVisitor());
        //给 CTO 汇报的报表
        System.out.println(">>>>>>>给 CTO 汇报的报表");
        businesssReport.showReport(new CTOVisitor());
    }
```

客户端代码中，首先构建了一个报表对象，该对象中维护了所有员工的集合，然后通过报表类的 showReport 函数为 Visitor 对象提供一个访问接口，在这个函数中查看所有员工信息，然后调用员工的 accept 函数接受公司领导层的访问，每个访问者对不同职位的员工调用对应的 visit 函数实现不同的操作。绩效如下：

_ouput:_

```java
>>>>>>>给 CEO 汇报的报表
leader = [name: DevYK 经理 kpi: 6 产品数量：6]
engineer = [name: IOS 工程师 kpi: 3]
engineer = [name: Android 工程师 kpi: 1]
engineer = [name: Java 工程师 kpi: 3]
engineer = [name: C++ 工程师 kpi: 9]

>>>>>>>给 CTO 汇报的报表
leader = [DevYK 经理 产品数量：4]
engineer = [IOS 工程师 代码行数：81491]
engineer = [Android 工程师 代码行数：25627]
engineer = [Java 工程师 代码行数：61337]
engineer = [C++ 工程师 代码行数：51714]
```

在上述示例中， Staff 扮演了 Element 角色，而 Engineer 和 Manager 都是 ConcreteElement; CEOVisitor 和 CTOVisitor 都是具体的访问者 Visitor 对象实现；而 BusinessReport 就是 ObjectStructure; Client 就是客户端代码，详细结构可以下下面的 UML 类图

[![hf7iz.png](https://storage7.cuntuku.com/2019/09/13/hf7iz.png)](https://cuntuku.com/image/hf7iz)

## 总结

[文章代码地址](https://github.com/yangkun19921001/AndroidDpCode)

## 特别感谢

[《 Android 源码设计模式解析与实战 》](https://item.jd.com/12113187.html)

感谢你的阅读，谢谢！

