# Stack 源码分析

## 简介

![&#x6808;&#x7684;&#x7EE7;&#x627F;&#x5173;&#x7CFB;.png](http://pm1dr7anq.bkt.clouddn.com/栈的继承关系.png)

栈是数据结构中一种很重要的数据结构类型，因为栈的后进先出功能是实际的开发中有很多的应用场景。Java API中提供了栈（Stacck\)的实现。Stack类继承了Vector类，而Vector类继承了AbstractList抽象类，实现了List类，Cloneable接口，RandomAcces接口以及Serializable接口。

## 源码阅读

* 构造函数

  创建一个空的栈

```java
/**
 * Creates an empty Stack.
 */
public Stack() {
}
```

* 入栈

```java
public E push(E item) {
    addElement(item);

    return item;
}
```

这里的 addElement\( E item\) 方法是 Vector 中的方法，点开此方法可以看到 是在检查当前的容量是否满足如果不满足就去开辟一个新的容量。

* 出栈

```java
public synchronized E pop() {
    E       obj;
    // 拿到当前栈里面的长度
    int     len = size();
    // 获取到 len - 1 也就是 Vector 中尾部数据
    obj = peek();
    // 也是调用 Vector 中 删除元素的函数
    removeElementAt(len - 1);

    return obj;
}
```

* 检查栈里面的数据

```java
/**
 * Tests if this stack is empty.
 *
 * @return  <code>true</code> if and only if this stack contains
 *          no items; <code>false</code> otherwise.
 */
public boolean empty() {
    return size() == 0;
}
```

主要检查栈里面是否是空数据

* 查找元素到栈顶的位置

```java
public synchronized int search(Object o) {
    //调用父类的方法，根据元素对象获取存在数组中的索引位置
    int i = lastIndexOf(o);

    if (i >= 0) {
        return size() - i;
    }
    return -1;
}
```

## 总结

通过 Stack 的源码可以查看到 它的父类 Vector 底层是一个数组结构，Vector 是 JDK 1.0 的基本上很多方法都是同步线程安全的，在多线程中使用是安全的，但是效率会降低。

