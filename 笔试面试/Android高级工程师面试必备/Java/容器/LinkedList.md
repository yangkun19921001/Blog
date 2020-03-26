06 LinkedList 源码解析

更新时间：2019-11-26 09:44:59

![img](https://img4.sycdn.imooc.com/5d63560c0001044d06400359.jpg)

![img](https://www.imooc.com/static/img/column/bg-l.png)![img](https://www.imooc.com/static/img/column/bg-r.png)



## 引导语





## 1 整体架构


![图片描述](https://img1.sycdn.imooc.com/5d5fc67a0001f59212400288.png)

- 链表每个节点我们叫做 Node，Node 有 prev 属性，代表前一个节点的位置，next 属性，代表后一个节点的位置；
- first 是双向链表的头节点，它的前一个节点是 null。
- last 是双向链表的尾节点，它的后一个节点是 null；
- 当链表中没有数据时，first 和 last 是同一个节点，前后指向都是 null；
- 因为是个双向链表，只要机器内存足够强大，是没有大小限制的。



```java

```



## 2 源码解析



### 2.1 追加（新增）





```java

```


![图片描述](https://img1.sycdn.imooc.com/5d5fc6a300013e4803600240.gif)

```java

```





### 2.2 节点删除





```java

```







### 2.3 节点查询



```java

```





### 2.4 方法对比



| 方法含义 | 返回异常  | 返回特殊值 | 底层实现                                         |
| :------- | :-------- | :--------- | :----------------------------------------------- |
| 新增     | add(e)    | offer(e)   | 底层实现相同                                     |
| 删除     | remove()  | poll(e)    | 链表为空时，remove 会抛出异常，poll 返回 null。  |
| 查找     | element() | peek()     | 链表为空时，element 会抛出异常，peek 返回 null。 |





### 2.5 迭代器



| 迭代顺序         | 方法                                 |
| :--------------- | :----------------------------------- |
| 从尾到头迭代方法 | hasPrevious、previous、previousIndex |
| 从头到尾迭代方法 | hasNext、next、nextIndex             |



```java

```



```java

```



```java

```







```java

```



## 总结