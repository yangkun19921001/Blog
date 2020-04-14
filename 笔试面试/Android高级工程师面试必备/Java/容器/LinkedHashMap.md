## LinkedHashMap  核心源码解析

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200327170621.jpg)

### 引导语

在熟悉 HashMap 之后，本小节我们来看下 LinkedHashMap  是如何用两种策略进行访问的。

### 1 整体架构

HashMap 是无序的，TreeMap 可以按照 key 进行排序，那有木有 Map 是可以维护插入的顺序的呢？接下来我们一起来看下 LinkedHashMap。



LinkedHashMap 本身是继承 HashMap 的，所以它拥有 HashMap 的所有特性，再此基础上，还提供了两大特性：

- 按照插入顺序进行访问；
- 实现了访问最少最先删除功能，其目的是把很久都没有访问的 key 自动删除。



接着我们来看下上述两大特性。



#### 1.1 按照插入顺序访问

##### 1.1.1 LinkedHashMap 链表结构

我们看下 LinkedHashMap 新增了哪些属性，以达到了链表结构的：

```java
// 链表头
transient LinkedHashMap.Entry<K,V> head;

// 链表尾
transient LinkedHashMap.Entry<K,V> tail;

// 继承 Node，为数组的每个元素增加了 before 和 after 属性
static class Entry<K,V> extends HashMap.Node<K,V> {
    Entry<K,V> before, after;
    Entry(int hash, K key, V value, Node<K,V> next) {
        super(hash, key, value, next);
    }
}

// 控制两种访问模式的字段，默认 false
// true 按照访问顺序，会把经常访问的 key 放到队尾
// false 按照插入顺序提供访问
final boolean accessOrder;
```

从上述 Map 新增的属性可以看到，LinkedHashMap 的数据结构很像是把 LinkedList 的每个元素换成了 HashMap 的 Node，像是两者的结合体，也正是因为增加了这些结构，从而能把 Map 的元素都串联起来，形成一个链表，而链表就可以保证顺序了，就可以维护元素插入进来的顺序。

##### 1.1.2 如何按照顺序新增

LinkedHashMap 初始化时，默认 accessOrder 为 false，就是会按照插入顺序提供访问，插入方法使用的是父类 HashMap 的 put 方法，不过覆写了 put 方法执行中调用的 newNode/newTreeNode 和 afterNodeAccess 方法。

newNode/newTreeNode 方法，控制新增节点追加到链表的尾部，这样每次新节点都追加到尾部，即可保证插入顺序了，我们以 newNode 源码为例：

```java
// 新增节点，并追加到链表的尾部
Node<K,V> newNode(int hash, K key, V value, Node<K,V> e) {
    // 新增节点
    LinkedHashMap.Entry<K,V> p =
        new LinkedHashMap.Entry<K,V>(hash, key, value, e);
    // 追加到链表的尾部
    linkNodeLast(p);
    return p;
}
// link at the end of list
private void linkNodeLast(LinkedHashMap.Entry<K,V> p) {
    LinkedHashMap.Entry<K,V> last = tail;
    // 新增节点等于位节点
    tail = p;
    // last 为空，说明链表为空，首尾节点相等
    if (last == null)
        head = p;
    // 链表有数据，直接建立新增节点和上个尾节点之间的前后关系即可
    else {
        p.before = last;//将上一个尾结点赋值给当前尾结点的前节点
        last.after = p;//将上一个尾结点的后节点指向当前尾结点
    }
}
```

LinkedHashMap 通过新增头节点、尾节点，给每个节点增加 before、after 属性，每次新增时，都把节点追加到尾节点等手段，在新增的时候，就已经维护了按照插入顺序的链表结构了。

##### 1.1.3 按照顺序访问

LinkedHashMap 只提供了单向访问，即按照插入的顺序从头到尾进行访问，不能像 LinkedList 那样可以双向访问。



我们主要通过迭代器进行访问，迭代器初始化的时候，默认从头节点开始访问，在迭代的过程中，不断访问当前节点的 after 节点即可。



Map 对 key、value 和 entity（节点） 都提供出了迭代的方法，假设我们需要迭代 entity，就可使用 `LinkedHashMap.entrySet().iterator()` 这种写法直接返回 LinkedHashIterator ，LinkedHashIterator 是迭代器，我们调用迭代器的 nextNode 方法就可以得到下一个节点，迭代器的源码如下：



```java
// 初始化时，默认从头节点开始访问
LinkedHashIterator() {
    // 头节点作为第一个访问的节点
    next = head;
    expectedModCount = modCount;
    current = null;
}

final LinkedHashMap.Entry<K,V> nextNode() {
    LinkedHashMap.Entry<K,V> e = next;
    if (modCount != expectedModCount)// 校验
        throw new ConcurrentModificationException();
    if (e == null)
        throw new NoSuchElementException();
    current = e;
    next = e.after; // 通过链表的 after 结构，找到下一个迭代的节点
    return e;
}
```

在新增节点时，我们就已经维护了元素之间的插入顺序了，所以迭代访问时非常简单，只需要不断的访问当前节点的下一个节点即可。

#### 1.2 访问最少删除策略

##### 1.2.1 demo

这种策略也叫做 LRU（Least recently used,最近最少使用），大概的意思就是经常访问的元素会被追加到队尾，这样不经常访问的数据自然就靠近队头，然后我们可以通过设置删除策略，比如当 Map 元素个数大于多少时，把头节点删除，我们写个 demo 方便大家理解。demo 如下，完整代码可到 github 上查看：

```java
public void testAccessOrder() {
  // 新建 LinkedHashMap
  LinkedHashMap<Integer, Integer> map = new LinkedHashMap<Integer, Integer>(4,0.75f,true) {
    {
      put(10, 10);
      put(9, 9);
      put(20, 20);
      put(1, 1);
    }

    @Override
    // 覆写了删除策略的方法，我们设定当节点个数大于 3 时，就开始删除头节点
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
      return size() > 3;
    }
  };

  log.info("初始化：{}",JSON.toJSONString(map));
  Assert.assertNotNull(map.get(9));
  log.info("map.get(9)：{}",JSON.toJSONString(map));
  Assert.assertNotNull(map.get(20));
  log.info("map.get(20)：{}",JSON.toJSONString(map));

}
```

打印出来的结果如下：

```java
初始化：{9:9,20:20,1:1}
map.get(9)：{20:20,1:1,9:9}
map.get(20)：{1:1,9:9,20:20}
```

可以看到，map 初始化的时候，我们放进去四个元素，但结果只有三个元素，10 不见了，这个主要是因为我们覆写了 removeEldestEntry 方法，我们实现了如果 map 中元素个数大于 3 时，我们就把队头的元素删除，当 put(1, 1) 执行的时候，正好把队头的 10 删除，这个体现了达到我们设定的删除策略时，会自动的删除头节点。

当我们调用 map.get(9) 方法时，元素 9 移动到队尾，调用 map.get(20) 方法时， 元素 20 被移动到队尾，这个体现了经常被访问的节点会被移动到队尾。

这个例子就很好的说明了访问最少删除策略，接下来我们看下原理。



##### 1.2.2 元素被转移到队尾

我们先来看下为什么 get 时，元素会被移动到队尾：

```java
public V get(Object key) {
    Node<K,V> e;
    // 调用 HashMap  get 方法
    if ((e = getNode(hash(key), key)) == null)
        return null;
    // 如果设置了 LRU 策略
    if (accessOrder)
    // 这个方法把当前 key 移动到队尾
        afterNodeAccess(e);
    return e.value;
}
```

从上述源码中，可以看到，通过 afterNodeAccess 方法把当前访问节点移动到了队尾，其实不仅仅是 get 方法，执行 getOrDefault、compute、computeIfAbsent、computeIfPresent、merge 方法时，也会这么做，通过不断的把经常访问的节点移动到队尾，那么靠近队头的节点，自然就是很少被访问的元素了。

##### 1.2.3 删除策略

上述 demo 我们在执行 put 方法时，发现队头元素被删除了，LinkedHashMap 本身是没有 put 方法实现的，调用的是 HashMap 的 put 方法，但 LinkedHashMap 实现了 put 方法中的调用 afterNodeInsertion 方法，这个方式实现了删除，我们看下源码：

```java
// 删除很少被访问的元素，被 HashMap 的 put 方法所调用
void afterNodeInsertion(boolean evict) { 
    // 得到元素头节点
    LinkedHashMap.Entry<K,V> first;
    // removeEldestEntry 来控制删除策略，如果队列不为空，并且删除策略允许删除的情况下，删除头节点
    if (evict && (first = head) != null && removeEldestEntry(first)) {
        K key = first.key;
        // removeNode 删除头节点
        removeNode(hash(key), key, null, false, true);
    }
}
```

#### 1.3 小结

LinkedHashMap 提供了两个很有意思的功能：按照插入顺序访问和删除最少访问元素策略，简单地通过链表的结构就实现了，设计得非常巧妙。

