# 设计模式 \(十一\) 备忘录模式

## 介绍

`备忘录模式`属于行为模式，该模式用于保存对象当前状态，并且在之后可以再次恢复到此状态，这有点像我们平时口头禅 ”有没有后悔药“ 。备忘录模式实现的方式需要保证被保存的对象状态不能被对象外部访问，目的是为了保护好被保存的这些对象状态的完整性以及内部实现不向外暴露。

## 定义

在不破坏封闭的前提下，捕获一个对象的内部状态，并在该对象之外保存这个状态，这样，以后就可将该对象恢复到原先保存的状态。

## 使用场景

1. 需要保存一个对象在某一个时刻的状态或部分状态。
2. 如果用一个接口来让其他对象得到这些状态，将会暴露对象的实现细节并破坏对象的封装性，一个对象不希望外界直接访问其内部状态，通过中间对象可以间接访问其内部状态。

## UML 类图

[![7d475590aeb40975fc935378daf301cb.png](https://s5.ex2x.com/2019/09/09/7d475590aeb40975fc935378daf301cb.png)](https://free.imgsha.com/i/OUGVi)

* Originator: 负责创建一个备忘录，可以记录、恢复自身的内部状态。同时 Originator 还可以根据需要决定 Memento 存储自身的哪些内部状态。
* Memento: 备忘录角色，用于存储 Originator 的内部状态，并且可以防止 Originator 以外的对象访问 Memento。
* Caretaker: 负责存储备忘录，不能对备忘录的内容进行操作和访问，只能够将备忘录传递给其它对象。

## 代码示例

**需求:** 开发一款简单记事本, 包括撤销、重做功能。

先来看一个效果：

[![hfkRo.gif](https://storage6.cuntuku.com/2019/09/10/hfkRo.gif)](https://cuntuku.com/image/hfkRo)

**代码:**

负责管理记事本的对象

```java
public class NoteCaretaker {

    /**
     * 最大存储容量
     */
    private static final int MAX = 50;

    /**
     * 初始化 50 个容量
     */
    private List<Memorandum> mMemorandumLists = new ArrayList<>(MAX);

    /**
     * 存档位置
     */
    private int mIndex = 0;


    /**
     * 保存备忘录到记录列表中
     */
    public void saveMemorandum(Memorandum memorandum) {
        if (mMemorandumLists.size() > MAX){
            mMemorandumLists.remove(0);
        }
        mMemorandumLists.add(memorandum);
        mIndex = mMemorandumLists.size() - 1;
    }

    /**
     * 获取上一个存档信息，相当于撤销功能
     */
    public Memorandum getPrevMemorandum(){
        mIndex = mIndex > 0 ? --mIndex : mIndex;
        return mMemorandumLists.get(mIndex);
    }

    /**
     * 获取下一个存档信息
     */
    public Memorandum getNextMemorandum(){
        mIndex = mIndex < mMemorandumLists.size() - 1? ++mIndex : mIndex;
        return mMemorandumLists.get(mIndex);
    }
}
```

在 NodeCaretaker 中会维护一个备忘录列表，然后使用 mIndex 标识编辑器当前所在的记录点，通过 getPrev getNext 分别获取上一个、下一个记录点的备忘录，以此来达到撤销、重做的功能。

```java
public class NodeEditText extends EditText {
    public NodeEditText(Context context) {
        super(context);
    }

    public NodeEditText(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public NodeEditText(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    /**
     * 创建备忘录对象，即存储编辑器的指定数据
     * @return
     */
    public Memorandum createMemorandum(){
        Memorandum memorandum = new Memorandum();
        memorandum.text = getText().toString().trim();
        memorandum.cursor = getSelectionStart();
        return memorandum;

    }

    /**
     * 从备忘录中恢复数据
     */
    public void restore(Memorandum memorandum){
        setText(memorandum.text);
        setSelection(memorandum.cursor);
    }


}
```

自定义一个记事本编辑器，添加2个函数，分别是 createMemorandum 、restore 函数。createMemorandum 函数是创建一个存储了编辑器文本，光标位置数据的 Memorandum 对象，并且返回给客户端；restore 函数是从 Memorandum 对象中恢复编辑器的文本和光标位置。

备忘录模式就介绍到这里了，主要还是要明确每个类的职责，遵从面向对象六大原则开发。

## 总结

优点：

* 给用户提供了一种可以恢复状态的机制，可以使用户能够比较方便的回到某个历史的状态。
* 实现了信息的封装，使得用户不需要关心状态的保存细节。

缺点：

* 消耗资源，如果类的成员变量过多，势必会占用比较大的资源，而且每一次保存都会消耗一定的内存。

[文章代码地址](https://github.com/yangkun19921001/AndroidDpCode)

## 特别感谢

[《 Android 源码设计模式解析与实战 》](https://item.jd.com/12113187.html)

感谢你的阅读，谢谢！

