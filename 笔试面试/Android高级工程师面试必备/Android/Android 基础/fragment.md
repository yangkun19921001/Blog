### Fragment 相关面试题

#### 1. Fragment状态保存

Fragment状态保存入口:

1、Activity的状态保存, 在Activity的onSaveInstanceState()里, 调用了FragmentManger的saveAllState()方法, 其中会对mActive中各个Fragment的实例状态和View状态分别进行保存.

2、FragmentManager还提供了public方法: saveFragmentInstanceState(), 可以对单个Fragment进行状态保存, 这是提供给我们用的。

3、FragmentManager的moveToState()方法中, 当状态回退到ACTIVITY_CREATED, 会调用saveFragmentViewState()方法, 保存View的状态.



**2. Fragment的生命周期和activity如何的一个关系**

这我们引用本知识库里的一张图片：

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200310192733.png)



#### 3. activty和Fragmengt之间怎么通信，Fragmengt和Fragmengt怎么通信？

（一）Handler

（二）广播

（三）事件总线：EventBus、RxBus、Otto

（四）接口回调

（五）Bundle和setArguments(bundle)