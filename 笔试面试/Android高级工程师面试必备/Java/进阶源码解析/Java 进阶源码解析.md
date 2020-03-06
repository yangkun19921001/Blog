# 基础

- String ， Long 源码解析和面试题
  - String, Long 源码这里不做讲解
  - 1. 为什么适用 Long 时，大家推荐多使用 valueOf 方法，少使用 parseLong 方法
    2. 如何解决 String 乱码问题
    3. 为什么大家都说 String 是不可变的
    4. String 一些常用操作问题，问如何分割、合并、替换、删除、截取等等问题。
- Java 常用关键字理解
  - 1. 如果证明 static 静态变量和 类无关？
    2. 常常看见变量和方法被 static 和 final 2 个关键字修饰？为什么要这么做？
    3. catch 中发生了未知异常，finally 还会执行吗？
    4. volatile 关键字的作用和原理。
- Arrays,Collections, Objects 源码解析
  - 1. 工作中有没有遇到特别好用的工具类，如何写好一个工具类
    2. 写一个二分查找算法
    3. 如果我希望 ArrayList 初始化之后，不能为修改，该怎么办？

# 集合

- ArrayList 源码解析和设计思路([推荐付费看源码的链接](https://www.imooc.com/read/47/article/847))

  - 整体架构
  - 源码解析 - ArrayList 初始化
  - 源码解析 - ArrayList 新增和扩容实现
  - 源码解析 - ArrayList 扩容本质
  - 源码解析 - ArrayList 删除
  - 源码解析 - ArrayList 迭代器
  - 源码解析 - ArrayList add、删除 时间复杂度
  - 源码解析 - ArrayList 线程安全问题和解决方案
  
- LinkedList 源码解析([推荐付费看源码的链接](https://www.imooc.com/read/47/article/848))

  - 整体架构
  - 源码解析 - 尾部/头部 添加
  - 源码解析 - 尾部/头部 删除
  - 源码解析 - 查询
  
- List 源码解析会问哪些面试题
  - 说说你对 ArrayList 理解？
    1. 扩容类问题
       1. ArrayList 无参数构造器构造，现在 add 一个值进去，此时数组的大小是多少，下一次扩容前最大可用大小是多少？
       2. 如果我连续往 list 里面新增值，增加到 11 个的时候，数组大小是多少？
       3. 数组初始化，被加入一个值后，如果我使用 addAll 方法，一下子加入 15 个值，那么最终数组的大小是多少？
       4. 现在我有一个很大的数组需要拷贝，原数组大小是 5K ，请问如何快速拷贝？
       5. 为什么说扩容会消耗性能？
       6. 源码扩容过程中有什么值得借鉴的地方？
    2. 删除类问题
       1. 有一个 ArrayList, 数据是 2、3、3、3、4，中间有三个 3 ，现在我通过 fori 的方式，想把值时 3 的元素删除，请问可以删除干净吗？最终删除额结果时什么？为什么？
       2. 通过 for 增强循环进行删除，可以吗？
       3. 如果使用 Iterator.remove() 方法可以删除么？为什么？
       4. 以上问题 LinkedList 也是同样的结果么？
    3. 对比类问题
       1. ArrayList 和 LinkedList 有何不同？
       2. ArrayList 和 LinkedList 应用场景有何不同？
       3. ArrayList 和 LinkedList 有没有最大容量？
       4. ArrayList 和 LinkedList 是如何对 null 值进行处理的？
       5. ArrayList 和 LinkedList 是线程安全的么，为什么？
       6. 如何解决线程安全问题？
    4. 其它扩展问题
       1. 描述下双向链表
       2. 描述下双向链表的新增和删除
  
- HashMap 源码解析([推荐付费看源码解析](https://www.imooc.com/read/47/article/850))

  - [ 吊打面试官》系列-HashMap](https://juejin.im/post/5dee6f54f265da33ba5a79c8)
  - 整体架构
  - 源码解析 - put
  - 源码解析 - 链表新增
  - 源码解析 - 红黑树新增节点过程
  - 源码解析 - get
  
- ThreeMap 和 LinkedHashMap 核心源码解析

- Map 源码会问哪些面试题
  - Map 整体数据结构问题
    1. 说说 HashMap 底层数据结构
    2. HashMap、TreeMap、LinkedHashMap 相同点，不同点。
    3. 说一下 Map 的hash 算法。
       1. 为什么不用 key % 数组大小，而是需要用key 的 hash 值 % 数值大小。
       2. 计算 hash 值时，为什么需要右移 16 位？
       3. 为什么把取模操作换成了 & 操作？
       4. 为什么提倡数组大小是 2 的幂次方？
    4. 为解决 hash 冲突，大概有哪些办法解决
  - HashMap 源码细节问题
    1. HashMap 是如何扩容的？
    2. hash 冲突时怎么办？
    3. 为什么链表个数大于 8 时，链表要转化成红黑树？
    4. HashMap 在 put 时，如果数组中已经有了这个 key, 我不想把 value 覆盖，怎么办？取值时，如果得到的 value 是空时，想反回默认值怎么办？
    5. 描述下 HashMap put,get 过程？
  - 其它 Map 面试题
    1. DTO 作为 Map key 时，有无需要注意的点？
    2. LinkedHashMap 中的 LRU 是什么意思，如何实现的？
    3. 为什么推荐 TreeMap 的元素最好都实现 Comparable 接口？但是 key 是 String 的时候，我们却没有格外的工作勒？
  
- HashSet , TreeSet 源码解析

  - TreeSet 有用过么，平时都在什么场景下使用？
  - 如果我想实现根据 Key 的新增顺序进行遍历怎么办？(LinkedHashSet)
  - 如果我想对 Key 进行去重，有什么好的办法？(TreeSet)
  - 说说 TreeSet 和 HashSet 两个 Set 的内部实现结构和原理?

- 集合在工作中的帮组和应用

- 集合在 Java7、8 有何不同和改进

  **共同点:**

  - 所有集合都新增了 forEach 方法

  **List 区别:**

  - ArrayList 无参初始化 初始化不同。

  **Map 区别:**

  - HashMap
  - LinkedHashMap

- Guava 在工作中运用和源码

# 并发集合类

- CopyOnWriteArrayList 源码解析和设计思路

- ConcurrentHashMap 源码解析和设计思路

- 并发 List 、Map 源码面试题

  **CopyInWriteArrayList 相关**

  - 和 ArrayList 相比有哪些相同点和不同点？
  - CopyInWriteArrayList 通过哪些手段实现了线程安全？
  - 在 add 方法中，对数组进行加锁后，不是已经是线程安全了么，为什么还需要对老数组进行拷贝？
  - 对老数组进行 copy ，会有性能损耗，我们平时使用需要注意什么？
  - 为什么 CopyInWriteArrayList 迭代过程中，数组结构变动，不会抛出 ConcurrentModificationException 了
  - 插入的数据正好在 List 的中间，请问两种 List 分别拷贝数组几次 ？ 为什么 ？

  **ConcurrentHashMap 相关**

  - ConcurrentHashMap 和 HashMap 的相同点和不同点
  - ConcurrentHashMap 通过哪些手段保证了线程安全
  - 描述一下 CAS 算法在 ConcurrentHashMap 中的应用？
  - ConcurrentHashMap 是如何发现当前槽点正在扩容的？
  - 发现槽点正在扩容时，put 操作会怎么办？
  - 两种 Map 扩容时，有哈区别？
  - ConcurrentHashMap 在 Java 7 和 Java 8 中关于线程安全的做法有哈不同？

- 并发 List 、Map 的应用场景

# 队列

- LinkedBlockingQueue 源码解析
- SynchronousQueue 源码解析
- DelayQueue 源码解析
- ArrayBlockingQueue 源码解析
- 队列在源码方面的面试题
  - 说说你对队列的理解，队列和集合的区别？
  - 哪些队列具有阻塞的功能，大概是如何阻塞的？
  - 底层是如何实现阻塞的？
  - LinkedBlockingQueue 和 ArrayBlockingQueue 区别？
  - 往队列里面 put 数据线程安全吗？为什么？
  - take 的时候也会加锁吗？既然 put 和 take 都会加锁，是不是同一时间只能运行其中一个方法。
  - 工作中经常使用队列的 put、take 方法有什么危害，如何避免？
  - 把数据放入队列中，有没有办法让队列过一会再执行 ？
  - DelayQueue 对元素有什么要求么，我把 String 放入队列中去可以吗？
  - DelayQueue 如何让快过期的元素先执行的？
  - 如何查看 SynchronousQueue 队列的大小 ？
  - SynchronousQueue 底层有几种数据结构，两者有何不同？
  - 如果想使用固定大小的队列，有几种队列可以选择，有何不同？
  - ArrayBlockingQueue 可以动态扩容吗？用到数组最后一个位置时怎么办？
  - ArrayBlockingQueue take 和 put 都是怎么找到索引位置的？是利用 hash 算法计算得到的么？
- 队列在 Java 其它源码中的应用
- 队列设计思想 、工作中使用场景
- 由浅入深写队列

# 线程

- Thread 源码解析

  - Thread 的状态
  - 优先级
  - 守护线程
  - Thread 的两种初始化方式
  - join
  - yield
  - sleep
  - interrupt

- Future 、ExecutorService 源码解析

- 线程源码面试题

  - 创建子线程时，子线程是得不到父线程的 ThreadLocal ，有什么办法可以解决这个问题？

  - 线程创建有几种实现方式？

  - 子线程 1 去等待子线程 2 执行完成之后才能执行，如何实现？

  - 守护线程和非守护线程的区别？如果我想在项目启动的时候收集代码信息，请问

    是守护线程好，还是非守护线程好，为什么？

  - 线程 start 和 run 之间的区别

  - Thread、Runnable、Callable 三者之间的区别

  - 线程池 submit 有两个方法，方法一可接受 Runnable, 方法二可接受 Callable , 但两个方法底层逻辑却是同一套，这是如何适配的？

  - Callable 能否丢给 Thread 去执行？

  - FutureTask 有什么作用（谈谈对 FutureTask 的理解）

  - Thread.yield 方法在工作中有什么作用？

  - wait() 和 sleep() 的相同点和区别？

  - 写一个简单的死锁 demo

  - 

# 锁

- AbstractQueueSynchronizer 源码解析（上）
- AbstractQueueSynchronizer 源码解析（下）
- ReentrantLock 源码解析
- CountDownLatch 、Atomic 等其它源码解析
- 连环相扣系列锁面试题
  - 说说自己对 AQS 的理解？
  - 多个线程通过锁请求共享资源，获取不到锁的线程怎么办？
- 各种锁在工作中使用场景和细节
- 重写锁的设计结构和细节

# 线程池

- ThreadPoolExecutor 源码解析
- 线程池源码面试题
  - 说说你对线程池的理解？
  - ThreadPoolExecutor、Executor、ExecutorService、Runnable、Callable、FutureTask 之间的关系？
  - 说一说队列在线程池中起的作用？
  - 结合请求不断增加时，说一说线程池构造器参数的含义和表现？
  - coreSize 和 maxSize 可以动态设置么，有没有规则限制？
  - 说一说对于线程空闲回收的理解，源码中如何体现的？
  - 如果我想在线程池任务执行之前和之后，做一些资源清理的工作，可以么，如何做？
  - 线程池中的线程创建，拒绝请求可以自定义实现么？如何自定义？
  - 说说你对 Worker 的理解？
  - 说一说 submit 方法执行的过程？
  - 说一说线程执行任务之后，都在干啥？
  - keepAliveTime 设置成负数或者是 0，表示无限阻塞？
- 不同场景，如何使用线程池
- 线程池流程编排中的运用实战

# Lambda 流

- 如何看 Lambda 源码
- 常用的 Lambda 表达式使用场景解析和应用

# 其它

- ThreadLocal 源码解析
- ThreadLocal 实战
- Socket 源码解析及面试题
- ServerSocket 源码解析及面试题
- Socket 结合线程池的使用

# 总结

- 一起看过的 Java 源码和面试真题