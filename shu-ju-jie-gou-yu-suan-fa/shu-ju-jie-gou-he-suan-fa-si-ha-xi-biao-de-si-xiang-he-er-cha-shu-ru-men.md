# 数据结构和算法 \( 四 \) 哈希表的思想和二叉树入门

### 哈希表

#### 特点

* 数组\(顺序表\)：寻址容易
* 链表：插入与删除容易
* 哈希表：寻址容易，插入删除也容易的数据结构

#### HashTable

* 哈希表（HashTable, 也叫散列表）

  是根据关键码值\(Key value\)而直接进行访问的数据结构，它通过把关键码值映射到表中一个位置来访问记录，以加快查找的速度。

* 关键码值\(Key value\)也可以当成是key的hash值

  这个映射函数叫做散列函数

* 存放记录的数组叫做散列表

#### HashTable 例子

![slb.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a3754b1ed3894?w=149&h=229&f=png&s=21535)

* Key : {14, 19, 5, 7, 21, 1, 13, 0, 18} 散列表: 大小为13 的数组 a\[13\]; 散列函数: f\(x\) = x mod 13;
* hashtable 需要自定义的内容

  散列函数与散列表大小 hash 冲突的解决方案 装填因子：为什么需要这个值？因为数据越接近数组最大值，可能产生冲突的情况就越多

#### 缺点

* 扩容需要大量的空间和性能

#### 应用

* 电话号码、字典、点歌系统、QQ、微信的好友等

### 设计（拉链法）

* JDK 1.8 以前

![llsj.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a376b99aa3072?w=351&h=295&f=png&s=30677)

* JDK 1.8 开始

  当链表长度超过阈值，就转成红黑树

  ![hhs.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a3778f539f37d?w=273&h=302&f=png&s=95769)

### 树

#### 什么是树

![smss.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a3789a8702dc2?w=989&h=213&f=png&s=105148)

![sdgn.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a37939b88f61f?w=883&h=203&f=png&s=59568)

#### 树的概念

**节点与树的度**

* 结点拥有的子树数称为结点的度。

  度为0的结点称为叶子结点或终端结点，度不为0的结点称为非终端结点或分支结点。

  除根结点以外，分支结点也称为内部结点。

  树的度是树内各结点的度的最大值。

![jdysdsd.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a379c3444b201?w=681&h=247&f=png&s=54699)

**层次和深度**

![sdsd.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a37a3f277374d?w=1200&h=253&f=png&s=208548)

![sdsd2.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a37ab33fd4ab2?w=413&h=260&f=png&s=52902)

#### 森林

![sl.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a37b3023256c2?w=668&h=73&f=png&s=29033)

#### 树的存储结构

**双亲表示法**

![sqbsf.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a37bdc04ab60a?w=839&h=375&f=png&s=145108)

**孩子表示法**

![hzbsf.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a37c5b33956d3?w=1024&h=304&f=png&s=114114)

**双亲孩子表示法**

* 把每个结点的孩子结点排列起来，以单链表作为存储结构，

  则n个结点有n个孩子链表，如果是叶子结点则此单链表为空，

  然后n个头指针又组成一个线性表，采用顺序存储结构，存放在一个一维数组中

![sqhzbsf.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a37cd65f869a8?w=754&h=362&f=png&s=49697)

**孩子兄弟表示法**

* 孩子兄弟表示法为每个节点设计三个域：

  一个数据域，一个该节点的第一个孩子节点域，一个该节点的下一个节点的兄弟指针域

![hzxdbsf.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a37d98054a516?w=693&h=323&f=png&s=30679)

### 二叉树

![ecsgnt.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a37e354225184?w=1024&h=332&f=png&s=452626)

#### 概念

![ecstc.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a37eaad9865a8?w=813&h=153&f=png&s=135819)

#### 斜树

![xs.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a37f1165ee2fd?w=278&h=237&f=png&s=15703)

#### 满二叉树

![mecs.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a37fae7ec9e3b?w=806&h=280&f=png&s=92229)

#### 完全二叉树

![wqecs2.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a3804d1ad51c8?w=539&h=266&f=png&s=70657)

定义：

* 若设二叉树的深度为h，除第 h 层外，其它各层 \(1～h-1\) 的结点数都达到最大个数，第 h 层所有的结点都连续集中在最左边，这就是完全二叉树。

  完全二叉树是由[满二叉树](https://baike.baidu.com/item/%E6%BB%A1%E4%BA%8C%E5%8F%89%E6%A0%91)而引出来的。对于深度为K的，有n个结点的二叉树，当且仅当其每一个结点都与深度为K的满二叉树中编号从1至n的结点一一对应时称之为完全二叉树。

  1. 所有的叶结点都出现在第k层或k-l层（层次最大的两层）
  2. 对任一结点，如果其右子树的最大层次为L，则其左子树的最大层次为L或L+l。

  一棵二叉树至多只有最下面的两层上的结点的度数可以小于2，并且最下层上的结点都集中在该层最左边的若干位置上，则此二叉树成为完全二叉树，并且最下层上的结点都集中在该层最左边的若干位置上，而在最后一层上，右边的若干结点缺失的二叉树，则此二叉树成为完全二叉树。

### 二叉树的存储结构

#### 顺序存储

![ecssx.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a380fe64e8fb5?w=959&h=459&f=png&s=177227)

#### 链式存储

![lscc.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a3817a8d43048?w=780&h=447&f=png&s=118609)

### 二叉树的遍历

#### 前序 \( DLR \)

* 规则是若二叉树为空，则空操作返回，否则先访问跟结点，然后前序遍历左子树，再前序遍历右子树

![qx.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a381e3941b471?w=670&h=412&f=png&s=105384)

#### 中序 \( LDR \)

* 规则是若树为空，则空操作返回，否则从根结点开始（注意并不是先访问根结点），

  中序遍历根结点的左子树，然后是访问根结点，最后中序遍历右子树

![zx.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a38245013ee17?w=667&h=401&f=png&s=97677)

#### 后续 \( LRD \)

* 规则是若树为空，则空操作返回，否则从左到右先叶子后结点的方式遍历访问左右子树，最后是访问根结点

![hx.jpg](https://user-gold-cdn.xitu.io/2019/3/22/169a382bd27bf0ae?w=706&h=421&f=png&s=103239)

## 二叉树简单代码实现

```java
public class BinarayTree {

    Node<String> root;

    public BinarayTree(String data){

        root=new Node<>(data,null,null);

    }

    public void createTree(){

        Node<String> nodeB=new Node<String>("B",null,null);

        Node<String> nodeC=new Node<String>("C",null,null);

        Node<String> nodeD=new Node<String>("D",null,null);

        Node<String> nodeE=new Node<String>("E",null,null);

        Node<String> nodeF=new Node<String>("F",null,null);

        Node<String> nodeG=new Node<String>("G",null,null);

        Node<String> nodeH=new Node<String>("H",null,null);

        Node<String> nodeJ=new Node<String>("J",null,null);

        Node<String> nodeI=new Node<String>("I",null,null);

        root.leftChild=nodeB;

        root.rightChild=nodeC;

        nodeB.leftChild=nodeD;

        nodeC.leftChild=nodeE;

        nodeC.rightChild=nodeF;

        nodeD.leftChild=nodeG;

        nodeD.rightChild=nodeH;

        nodeE.rightChild=nodeJ;

        nodeH.leftChild=nodeI;


}

/**
 * 中序访问树的所有节点
 */
public void midOrderTraverse(Node root){//逻辑
    if(root==null){
        return;
    }
    midOrderTraverse(root.leftChild);//逻辑
    System.out.println("mid:"+root.data);//输出
    midOrderTraverse(root.rightChild);//逻辑
}
/**
 * 前序访问树的所有节点  Arrays.sort();
 */
public void preOrderTraverse(Node root){
    if(root==null){
        return;
    }
    System.out.println("pre:"+root.data);
    preOrderTraverse(root.leftChild);
    preOrderTraverse(root.rightChild);
}
/**
 * 后序访问树的所有节点
 */
public void postOrderTraverse(Node root){
    if(root==null){
        return;
    }
    postOrderTraverse(root.leftChild);
    postOrderTraverse(root.rightChild);
    System.out.println("post:"+root.data);
}
/**
 * 节点
 */
public class Node<T>{
    T data;
    Node<T> leftChild;
    Node<T> rightChild;

    public Node(T data, Node<T> leftChild, Node<T> rightChild) {
        this.data = data;
        this.leftChild = leftChild;
        this.rightChild = rightChild;
    }
}
}
```

