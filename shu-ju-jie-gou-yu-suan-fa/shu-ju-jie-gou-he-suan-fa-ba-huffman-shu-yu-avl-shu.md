# 二叉树

## Huffman 树

### 概念

![&#x6982;&#x5FF5;1.jpg](http://pntnlt1wq.bkt.clouddn.com/概念1.jpg)

![&#x6982;&#x5FF5;2.jpg](http://pntnlt1wq.bkt.clouddn.com/概念2.jpg)

![&#x6811;&#x7684;&#x6784;&#x9020;.jpg](http://pntnlt1wq.bkt.clouddn.com/树的构造.jpg)

### 树的构造

![&#x6811;&#x7684;&#x6784;&#x9020;.jpg](http://pntnlt1wq.bkt.clouddn.com/树的构造.jpg)

![&#x6811;&#x7684;&#x6784;&#x9020;2.jpg](http://pntnlt1wq.bkt.clouddn.com/树的构造2.jpg)

![&#x6811;&#x7684;&#x6784;&#x9020;3.jpg](http://pntnlt1wq.bkt.clouddn.com/树的构造3.jpg)

### Huffman 源码

![hufuman1.jpg](http://pntnlt1wq.bkt.clouddn.com/hufuman1.jpg)

![hufuman2.jpg](http://pntnlt1wq.bkt.clouddn.com/hufuman2.jpg)

## AVL 树\(平衡二叉树\)

### 概念

![&#x5E73;&#x8861; AVL &#x6811;.jpg](http://pntnlt1wq.bkt.clouddn.com/平衡%20AVL%20树.jpg)

![&#x5E73;&#x8861; AVL 2.jpg](http://pntnlt1wq.bkt.clouddn.com/平衡%20AVL%202.jpg)

* 平衡因子 二叉树上节点的左子树深度减去右子树深度的值称为平衡因子BF（Balance Factor）
* 最小不平衡树

  ![&#x6700;&#x5C0F;&#x5E73;&#x8861;&#x6811;.jpg](http://pntnlt1wq.bkt.clouddn.com/最小平衡树.jpg)

### 构建 AVL 树

![&#x4E8C;&#x53C9;&#x5E73;&#x8861;&#x6811;.jpg](http://pntnlt1wq.bkt.clouddn.com/二叉平衡树.jpg)

![AVL 2.jpg](http://pntnlt1wq.bkt.clouddn.com/AVL%202.jpg)

![AVL 4.jpg](http://pntnlt1wq.bkt.clouddn.com/AVL%204.jpg)

![112.jpg](http://pntnlt1wq.bkt.clouddn.com/112.jpg)

![AVL5.jpg](http://pntnlt1wq.bkt.clouddn.com/AVL5.jpg)

* 左旋

  ![&#x5DE6;&#x65CB;.jpg](http://pntnlt1wq.bkt.clouddn.com/左旋.jpg)

* 右旋

  ![&#x53F3;&#x65CB;.jpg](http://pntnlt1wq.bkt.clouddn.com/右旋.jpg)

### 代码

### Huffman 树

```text
public class HuffmanTree {
    TreeNode root;
public TreeNode createHuffManTree(ArrayList<TreeNode> list) {
    while (list.size() > 1) {
        Collections.sort(list);
        TreeNode left = list.get(list.size() - 1);
        TreeNode right = list.get(list.size() - 2);
        TreeNode parent = new TreeNode("p", left.weight + right.weight);
        parent.leftChild = left;
        left.parent = parent;
        parent.rightChild = right;
        right.parent = parent;
        list.remove(left);
        list.remove(right);
        list.add(parent);
    }
    root = list.get(0);
    return list.get(0);
}

public void showHuffman(TreeNode root) {
    LinkedList<TreeNode> list = new LinkedList<>();
    list.offer(root);//入队
    while (!list.isEmpty()) {
        TreeNode node = list.pop();
        System.out.println(node.data);
        if (node.leftChild != null) {
            list.offer(node.leftChild);
        }
        if (node.rightChild != null) {
            list.offer(node.rightChild);
        }
    }
}

@Test
public void test() {
    ArrayList<TreeNode> list = new ArrayList<>();
    TreeNode<String> node = new TreeNode("good", 50);
    list.add(node);
    list.add(new TreeNode("morning", 10));
    TreeNode<String> node2 =new TreeNode("afternoon", 20);
    list.add(node2);
    list.add(new TreeNode("hell", 110));
    list.add(new TreeNode("hi", 200));
    HuffmanTree tree = new HuffmanTree();
    tree.createHuffManTree(list);
    tree.showHuffman(tree.root);
    getCode(node2);
}

/**
 * 编码
 */
public void getCode(TreeNode node) {
    TreeNode tNode = node;
    Stack<String> stack = new Stack<>();
    while (tNode != null && tNode.parent != null) {
        //left 0  right 1
        if (tNode.parent.leftChild == tNode) {
            stack.push("0");
        } else if (tNode.parent.rightChild == tNode) {
            stack.push("1");
        }
        tNode = tNode.parent;
    }
    System.out.println();
    while (!stack.isEmpty()) {
        System.out.print(stack.pop());
    }
}

/**
 * 结点
 *
 * @param <T>
 */
public static class TreeNode<T> implements Comparable<TreeNode<T>> {
    T data;
    int weight;
    TreeNode leftChild;
    TreeNode rightChild;
    TreeNode parent;

    public TreeNode(T data, int weight) {
        this.data = data;
        this.weight = weight;
        leftChild = null;
        rightChild = null;
        parent = null;
    }

    @Override
    public int compareTo(@NonNull TreeNode<T> o) {
        if (this.weight > o.weight) {
            return -1;
        } else if (this.weight < o.weight) {
            return 1;
        }
        return 0;
    }
}
}
```

### 平衡二叉树

* 左旋转

  ```java
  public class AVLBTree<E extends Comparable<E>> {
      Node<E> root;
      int size;
      public class Node<E extends Comparable<E>>{
          E element;
          int balance=0;//平衡因子
          Node<E> left;
          Node<E> right;
          Node<E> parent;
          public Node(E element,Node<E> parent){
              this.element=element;
              this.parent=parent;
          }
      }
      public void left_rotate(Node<E> x){
          if(x!=null){
              Node<E> y=x.right;//先取到Y
              //1.把贝塔作为X的右孩子
              x.right=y.left;
              if(y.left!=null){
                  y.left.parent=x;
              }
              //2。把Y移到原来X的位置上
              y.parent=x.parent;
              if(x.parent==null){
                  root=y;
              }else{
                  if(x.parent.left==x){
                      x.parent.left=y;
                  }else if(x.parent.right==x){
                      x.parent.right=y;
                  }
              }
              //3.X作为Y的左孩子
              y.left=x;
              x.parent=y;
          }
      }
  }
  ```

