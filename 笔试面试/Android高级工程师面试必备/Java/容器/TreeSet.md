## TreeSet 源码解析

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200327170424.jpg)

## 1 TreeSet

TreeSet 大致的结构和 HashSet 相似，底层组合的是 TreeMap，所以继承了 TreeMap key 能够排序的功能，迭代的时候，也可以按照 key 的排序顺序进行迭代，我们主要来看复用 TreeMap 时，复用的两种思路：

#### 1.1 复用 TreeMap 的思路一

场景一： TreeSet 的 add 方法，我们来看下其源码：

```java
public boolean add(E e) {
    return m.put(e, PRESENT)==null;
}
```

可以看到，底层直接使用的是 HashMap 的 put 的能力，直接拿来用就好了。

#### 1.2 复用 TreeMap 的思路二

场景二：需要迭代 TreeSet 中的元素，那应该也是像 add 那样，直接使用 HashMap 已有的迭代能力，比如像下面这样：

```java
// 模仿思路一的方式实现
public Iterator<E> descendingIterator() {
    // 直接使用 HashMap.keySet 的迭代能力
    return m.keySet().iterator();
}
```

这种是思路一的实现方式，TreeSet 组合 TreeMap，直接选择 TreeMap 的底层能力进行包装，但 TreeSet 实际执行的思路却完全相反，我们看源码：

```java
// NavigableSet 接口，定义了迭代的一些规范，和一些取值的特殊方法
// TreeSet 实现了该方法，也就是说 TreeSet 本身已经定义了迭代的规范
public interface NavigableSet<E> extends SortedSet<E> {
    Iterator<E> iterator();
    E lower(E e);
}  
// m.navigableKeySet() 是 TreeMap 写了一个子类实现了 NavigableSet
// 接口，实现了 TreeSet 定义的迭代规范
public Iterator<E> iterator() {
    return m.navigableKeySet().iterator();
}
```

TreeMap 中对 NavigableSet 接口的实现源码截图如下：

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200327171142.jpeg)

从截图中（截图是在 TreeMap 中），我们可以看出 TreeMap 实现了 TreeSet 定义的各种特殊方法。



我们可以看到，这种思路是 TreeSet 定义了接口的规范，TreeMap 负责去实现，实现思路和思路一是相反的。

我们总结下 TreeSet 组合 TreeMap 实现的两种思路：

1. TreeSet 直接使用 TreeMap 的某些功能，自己包装成新的 api。
2. TreeSet 定义自己想要的 api，自己定义接口规范，让 TreeMap 去实现。



方案 1 和 2 的调用关系，都是 TreeSet 调用 TreeMap，但功能的实现关系完全相反，第一种是功能的定义和实现都在 TreeMap，TreeSet 只是简单的调用而已，第二种 TreeSet 把接口定义出来后，让 TreeMap 去实现内部逻辑，TreeSet 负责接口定义，TreeMap 负责具体实现，这样子的话因为接口是 TreeSet 定义的，所以实现一定是 TreeSet 最想要的，TreeSet 甚至都不用包装，可以直接把返回值吐出去都行。

我们思考下这两种复用思路的原因：

1. 像 add 这些简单的方法，我们直接使用的是思路 1，主要是 add 这些方法实现比较简单，没有复杂逻辑，所以 TreeSet 自己实现起来比较简单；
2. 思路 2 主要适用于复杂场景，比如说迭代场景，TreeSet 的场景复杂，比如要能从头开始迭代，比如要能取第一个值，比如要能取最后一个值，再加上 TreeMap 底层结构比较复杂，TreeSet 可能并不清楚 TreeMap 底层的复杂逻辑，这时候让 TreeSet 来实现如此复杂的场景逻辑，TreeSet 就搞不定了，不如接口让 TreeSet 来定义，让 TreeMap 去负责实现，TreeMap 对底层的复杂结构非常清楚，实现起来既准确又简单。

#### 1.3 小结

TreeSet 对 TreeMap 的两种不同复用思路，很重要，在工作中经常会遇到，特别是思路二，比如说 dubbo 的泛化调用，DDD 中的依赖倒置等等，原理都是 TreeSet 第二种的复用思想。