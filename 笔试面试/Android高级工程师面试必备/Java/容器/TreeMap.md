##TreeMap  核心源码解析

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200327170621.jpg)

### 引导语

在熟悉 HashMap 之后，本小节我们来看下 TreeMap 是如何根据 key 进行排序的。



### 1 知识储备

在了解 TreeMap 之前，我们来看下日常工作中排序的两种方式，作为我们学习的基础储备，两种方式的代码如下：

```java
public class TreeMapDemo {

  @Data
  // DTO 为我们排序的对象
  class DTO implements Comparable<DTO> {
    private Integer id;
    public DTO(Integer id) {
      this.id = id;
    }

    @Override
    public int compareTo(DTO o) {
      //默认从小到大排序
      return id - o.getId();
    }
  }

  @Test
  public void testTwoComparable() {
    // 第一种排序，从小到大排序，实现 Comparable 的 compareTo 方法进行排序
    List<DTO> list = new ArrayList<>();
    for (int i = 5; i > 0; i--) {
      list.add(new DTO(i));
    }
    Collections.sort(list);
    log.info(JSON.toJSONString(list));

    // 第二种排序，从大到小排序，利用外部排序器 Comparator 进行排序
    Comparator comparator = (Comparator<DTO>) (o1, o2) -> o2.getId() - o1.getId();
    List<DTO> list2 = new ArrayList<>();
    for (int i = 5; i > 0; i--) {
      list2.add(new DTO(i));
    }
    Collections.sort(list,comparator);
    log.info(JSON.toJSONString(list2));
  }
}
```

> 第一种排序输出的结果从小到大，结果是：[{“id”:1},{“id”:2},{“id”:3},{“id”:4},{“id”:5}]；

> 第二种输出的结果恰好相反，结果是：[{“id”:5},{“id”:4},{“id”:3},{“id”:2},{“id”:1}]。

以上两种就是分别通过 Comparable 和 Comparator 两者进行排序的方式，而 TreeMap 利用的也是此原理，从而实现了对 key 的排序，我们一起来看下。



### 2 TreeMap 整体架构

TreeMap 底层的数据结构就是红黑树，和 HashMap 的红黑树结构一样。

不同的是，TreeMap 利用了红黑树左节点小，右节点大的性质，根据 key 进行排序，使每个元素能够插入到红黑树大小适当的位置，维护了 key 的大小关系，适用于 key 需要排序的场景。

因为底层使用的是平衡红黑树的结构，所以 containsKey、get、put、remove 等方法的时间复杂度都是 log(n)。



#### 2.1 属性

TreeMap 常见的属性有：

```java
//比较器，如果外部有传进来 Comparator 比较器，首先用外部的
//如果外部比较器为空，则使用 key 自己实现的 Comparable#compareTo 方法
//比较手段和上面日常工作中的比较 demo 是一致的
private final Comparator<? super K> comparator;

//红黑树的根节点
private transient Entry<K,V> root;

//红黑树的已有元素大小
private transient int size = 0;

//树结构变化的版本号，用于迭代过程中的快速失败场景
private transient int modCount = 0;

//红黑树的节点
static final class Entry<K,V> implements Map.Entry<K,V> {}
```

#### 2.2 新增节点

我们来看下 TreeMap 新增节点的步骤：

1. 判断红黑树的节点是否为空，为空的话，新增的节点直接作为根节点，代码如下：

   ```java
   Entry<K,V> t = root;
   //红黑树根节点为空，直接新建
   if (t == null) {
       // compare 方法限制了 key 不能为 null
       compare(key, key); // type (and possibly null) check
       // 成为根节点
       root = new Entry<>(key, value, null);
       size = 1;
       modCount++;
       return null;
   }
   ```

2. 根据红黑树左小右大的特性，进行判断，找到应该新增节点的父节点，代码如下：

   ```java
   Comparator<? super K> cpr = comparator;
   if (cpr != null) {
       //自旋找到 key 应该新增的位置，就是应该挂载那个节点的头上
       do {
           //一次循环结束时，parent 就是上次比过的对象
           parent = t;
           // 通过 compare 来比较 key 的大小
           cmp = cpr.compare(key, t.key);
           //key 小于 t，把 t 左边的值赋予 t，因为红黑树左边的值比较小，循环再比
           if (cmp < 0)
               t = t.left;
           //key 大于 t，把 t 右边的值赋予 t，因为红黑树右边的值比较大，循环再比
           else if (cmp > 0)
               t = t.right;
           //如果相等的话，直接覆盖原值
           else
               return t.setValue(value);
           // t 为空，说明已经到叶子节点了
       } while (t != null);
   }
   ```

3. 在父节点的左边或右边插入新增节点，代码如下：

   ```java
   //cmp 代表最后一次对比的大小，小于 0 ，代表 e 在上一节点的左边
   if (cmp < 0)
       parent.left = e;
   //cmp 代表最后一次对比的大小，大于 0 ，代表 e 在上一节点的右边，相等的情况第二步已经处理了。
   else
       parent.right = e;
   ```

4. 着色旋转，达到平衡，结束。



从源码中，我们可以看到：

1. 新增节点时，就是利用了红黑树左小右大的特性，从根节点不断往下查找，直到找到节点是 null 为止，节点为 null 说明到达了叶子结点；
2. 查找过程中，发现 key 值已经存在，直接覆盖；
3. TreeMap 是禁止 key 是 null 值的。



类似的，TreeMap 查找也是类似的原理，有兴趣的同学可以去 github 上面去查看源码。

#### 2.3 小结

TreeMap 相对来说比较简单，红黑树和 HashMap 比较类似，比较关键的是通过 compare 来比较 key 的大小，然后利用红黑树左小右大的特性，为每个 key 找到自己的位置，从而维护了 key 的大小排序顺序。



### 