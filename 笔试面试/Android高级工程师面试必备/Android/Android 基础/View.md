### View 面试题

#### 1. Canvas.save()跟Canvas.restore()的调用时机

save：用来保存Canvas的状态。save之后，可以调用Canvas的平移、放缩、旋转、错切、裁剪等操作。

restore：用来恢复Canvas之前保存的状态。防止save后对Canvas执行的操作对后续的绘制有影响。

save和restore要配对使用（restore可以比save少，但不能多），如果restore调用次数比save多，会引发Error。save和restore操作执行的时机不同，就能造成绘制的图形不同。



#### 2. 自定义view效率高于xml定义吗？说明理由。

自定义view效率高于xml定义：

1、少了解析xml。

2.、自定义View 减少了ViewGroup与View之间的测量,包括父量子,子量自身,子在父中位置摆放,当子view变化时,父的某些属性都会跟着变化。



#### 3. ListView卡顿原因

Adapter的getView方法里面convertView没有使用setTag和getTag方式；

在getView方法里面ViewHolder初始化后的赋值或者是多个控件的显示状态和背景的显示没有优化好，抑或是里面含有复杂的计算和耗时操作；

在getView方法里面 inflate的row 嵌套太深（布局过于复杂）或者是布局里面有大图片或者背景所致；

Adapter多余或者不合理的notifySetDataChanged；

listview 被多层嵌套，多次的onMessure导致卡顿，如果多层嵌套无法避免，建议把listview的高和宽设置为match_parent. 如果是代码继承的listview，那么也请你别忘记为你的继承类添加上LayoutPrams，注意高和宽都mactch_parent的；



#### 4. 计算一个view的嵌套层级

```
private int getParents(ViewParents view){
    if(view.getParents() == null)
        return 0;
    } else {
    return (1 + getParents(view.getParents));
   }
}
```



#### 5. LinearLayout、FrameLayout、RelativeLayout性能对比，为什么？

RelativeLayout会让子View调用2次onMeasure，LinearLayout 在有weight时，也会调用子 View 2次onMeasure

RelativeLayout的子View如果高度和RelativeLayout不同，则会引发效率问题，当子View很复杂时，这个问题会更加严重。如果可以，尽量使用padding代替margin。

在不影响层级深度的情况下,使用LinearLayout和FrameLayout而不是RelativeLayout。



####6. [Android UI 线程和非 UI 线程的交互方式有哪些？]([参考]https://www.cnblogs.com/carlo/articles/4986734.html)

####7. **Android 中 getRawX()和 getX()区别**

【参考】

getRawX( )即表示的是点击的位置距离屏幕的坐标

getX( )即表示的点击的位置相对于本身的坐标 

####8. 怎么自定义RecyclerView.LayoutManager

【参考】https://www.jianshu.com/p/1837a801e599



#### 9. **Android 在 MotionEvent 手势事件**

【参考】其中包括：

- MotionEvent.ACTION_DOWN：当屏幕检测到第一个触点按下之后就会触发到这个事件。

- MotionEvent.ACTION_MOVE：当触点在屏幕上移动时触发，触点在屏幕上停留也是会触发

的，主要是由于它的灵敏度很高，而我们的手指又不可能完全静止（即使我们感觉不到移动，

但其实我们的手指也在不停地抖动）。

- MotionEvent.ACTION_POINTER_DOWN：当屏幕上已经有触点处于按下的状态的时候，再有

新的触点被按下时触发。

- MotionEvent.ACTION_POINTER_UP：当屏幕上有多个点被按住，松开其中一个点时触发（即

非最后一个点被放开时）触发。

- MotionEvent.ACTION_UP：当最后一个触点松开时被触发。

- MotionEvent.ACTION_SCROLL：非触摸滚动，主要是由鼠标、滚轮、轨迹球触发。

- MotionEvent.ACTION_CANCEL：不是由用户直接触发，有系统再需要的时候触发，例如当父

  view 通过使函数 onInterceptTouchEvent()返回 true,从子 view 拿回处理事件的控制权是，就

  会给子 view 发一个 ACTION_CANCEL 事件，这里了 view 就再也不会收到事件了。可以将其

  视为 ACTION_UP 事件对待。

- onInterceptTouchEvent()函数与 onTouchEvent()的区别：

  1、onInterceptTouchEvent()是用于处理事件（类似于预处理，当然也可以不处理）并改变事件的传递方向，也就是决定是否允许 Touch 事件继续向下（子 view）传递，一但返回 True 代表事件在当前的 viewGroup 中会被处理），则向下传递之路被截断（所有子 view 将没有机会参与 Touch 事件），同时把事件传递给当前的 view 的 onTouchEvent()处理；返回 false，则把事件交给子 view 的 onInterceptTouchEvent()

  2、onTouchEvent()用于处理事件，返回值决定当前 view 是否消费（consume）了这个事件，

  也就是说在当前 view 在处理完 Touch 事件后，是否还允许 Touch 事件继续向上（父 view）

  传递，一但返回 True，则父 view 不用操心自己来处理 Touch 事件。返回 true，则向上传递

  给父 view（注：可能你会觉得是否消费了有关系吗，反正我已经针对事件编写了处理代码？

  答案是有区别！比如 ACTION_MOVE 或者 ACTION_UP 发生的前提是一定曾经发生了

  ACTION_DOWN，如果你没有消费 ACTION_DOWN，那么系统会认为 ACTION_DOWN 没有

  发生过，所以 ACTION_MOVE 或者 ACTION_UP 就不能被捕获。）



####10. **View.getLocationInWindow 和**View.getLocationOnScreen 区别？

【参考】一个控件在其父窗口中的坐标位置 View.getLocationInWindow(int[] location)一个控件在其整个屏幕上的坐标位置 View.getLocationOnScreen(int[] location)



####11. RelativeLayout 的 onMeasure 方法，怎么 Measure 的？

【参考】发现 RelativeLayout 会根据 2 次排列的结果对子 View 各做一次 measure。

而在做横向的测量时，纵向的测量结果尚未完成，只好暂时使用 myHeight 传入子 View 系

统。这样必然会导致子 View 的高度和 RelativeLayout 的高度不同时，第 3 点中所说的优化会失

效，在 View 系统足够复杂时，效率问题就会出现。



####12. **RemoteView 内部机制**

【参考】：

1、通过 View 的 id 值获取对应的 view(target)。 

2、SetOnClickPendingIntent 类中的成员变量 pendingIntent 生成相应的 OnClickListener。 

3、为 target 设置监听。

https://blog.csdn.net/a15129095654/article/details/72814528



#### 13.**onWindowFocusChanged 执行时机**

【参考】

真正的 visible 时间点是 onWindowFocusChanged()函数被执行时，当前窗体得到

或失去焦点的时候的时候调用。这是这个活动是否是用户可见的最好的指标。



####14. viewstub 可以多次 inflate 么？多次inflate 会怎样

【参考】在使用 viewstub 的时候要注意一点，viewstub 只能 inflate 一次，而且 setVisibility

也会间接的调用到 inflate，重复 inflate 会抛出异常：

java.lang.IllegalStateException:ViewStub must have a non-null ViewGroup viewParent

解决方法为设置一个 Boolean 类型的变量，标记 viewstub 是否已经 inflate，如果 viewstub

还未 inflate 则执行初始化操作，反之则不进行操作。其中要使用 ViewStub 中的

OnInflateListener()监听事件来判断是否已经填充,从而保证 viewstub 不重复的 inflate。

解决方法：

1.定义 boolean 变量和 ViewStub

boolean isInflate = false;

ViewStub mViewStub; 

2.初始化 ViewStub，并为 ViewStub 添加 OnInflateListener()监听事件

```java
mViewStub = (ViewStub)findViewById(R.id.viewstub_match_single);

mViewStub.setOnInflateListener(new OnInflateListener() {

@Overridepublic void onInflate(ViewStub stub, View inflated) {

isInflate = true;

}

});
```

3.填充 ViewStub

```java
private void initViewStub(){//填充 ViewStub 的方法

if(!isInflate){//如果没有填充则执行 inflate 操作

View view = stubMatchSingle.inflate();

//初始化 ViewStub 的 layout 里面的控件

TextView mTv = (TextView) view.findViewById(R.id.txt_url);

mTv.setOnClickListener(this);

} 
  } 
```



### 15. 自定义 View

- [01Android界面开发：View自定义实践概览](https://github.com/guoxiaoxing/android-open-source-project-analysis/blob/master/doc/Android应用开发实践篇/Android界面开发/01Android界面开发：View自定义实践概览.md)
- [02Android界面开发：View自定义实践布局篇](https://github.com/guoxiaoxing/android-open-source-project-analysis/blob/master/doc/Android应用开发实践篇/Android界面开发/02Android界面开发：View自定义实践布局篇.md)
- [03Android界面开发：View自定义实践绘制篇](https://github.com/guoxiaoxing/android-open-source-project-analysis/blob/master/doc/Android应用开发实践篇/Android界面开发/03Android界面开发：View自定义实践绘制篇.md)
- [04Android界面开发：View自定义实践交互篇](https://github.com/guoxiaoxing/android-open-source-project-analysis/blob/master/doc/Android应用开发实践篇/Android界面开发/04Android界面开发：View自定义实践交互篇.md)

