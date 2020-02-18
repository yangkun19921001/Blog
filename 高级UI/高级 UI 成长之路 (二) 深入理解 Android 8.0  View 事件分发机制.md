## 前言

在上一篇文章中我们介绍了 View 的基础知识以及 View 滑动的实现，本篇将为大家带来 View 的一个核心知识点 **事件分发机制**。事件分发机制不仅仅是核心知识点也是 Android 中的一个难点，下面我们就从源码的角度来分析事件的传递还有最后是如何解决滑动冲突的。

## 事件分发机制

### 点击事件的传递规则

在介绍事件传递规则之前，首先我们要明白要分析的对象就是 MotionEvent , 关于 MotionEvent 在上一篇文章介绍滑动的时候咱们已经用过了。其实所谓的点击事件分发就是对 MotionEvent 事件的分发过程，点击事件的分发过程由三个很重要的方法共同完成，如下:

**1. dispatchTouchEvent(MotionEvent ev)**

用来进行事件的分发。如果事件能够传递给当前的 View ，那么此方法一定会被调用，返回结果受当前 View 的 onTouchEvent 和下级 View 的 dispatchTouchEvent 方法的影响，表示是否消耗当前事件。

**2. onInterceptTouchEvent(MotionEvent ev)**

在上述内部方法调用，用来判断是否拦截某个事件，如果当前 View 拦截了某个事件，那么在同一个事件序列中，此方法不会被再次调用，返回结果表示是否拦截当前事件。

**3. onTouchEvent(MotionEvent ev)**

在第一个方法中调用，用来处理点击事件，返回结果表示是否消耗此事件，如果不消耗，当前 View 就无法再次接收到事件。

下面我画了一个图来具体说明下上面 3 个方法之间的关系

![](https://pic.superbed.cn/item/5dd0f7d28e0e2e3ee99f891b.png)

也可以用一段伪代码来说明，如下:

```kotlin
fun dispatchTouchEvent(MotionEvent ev):Boolean{
  var consume = false
  //父类是否拦截
  if(onInterceptTouchEvent(ev)){
    //如果拦截将执行自身的 onTouchEvent 方法
    consume = onTouchEvent(ev)
  }else{
    //如果事件在父类不拦截，将继续分发给子类
    consume = child.dispatchTouchEvent(ev)
  }
  reture consume
}
```

上图跟伪代码意思一样，特别是伪代码已经将它们三者的关系表现得非常到位，通过上面伪代码我们可以大致了解到点击事件的一个传递规则，对应一个根 ViewGroup 来说，点击事件产生后，首先会传递给它, 这时它的 dispatchTouchEvent 就会被调用，如果这个 ViewGroup 的 onInterceptTouchEvent 方法返回 true 就表示它要拦截当前事件，接着事件就会交给这个 ViewGroup 处理，即它的onTouchEvent 方法就会被调用；如果这个 ViewGroup 的 onInterceptTouchEvent 返回 false 就表示它不拦截当前事件，这时当前事件就会传递给它的子元素，接着子元素的  dispatchTouchEvent 方法就会被调用，如此反复直到事件被最终处理。

当一个 View 需要处理事件时的调用规则,如下伪代码:

```kotlin
fun  dispatchTouchEvent(MotionEvent event): boolean{
  //1. 如果当前 View 设置 onTouchListener
if（onTouchListener != null）{
  //2. 那么自身的 onTouch 就会被调用，如果返回 false 其自身的 onTouchEvent 被调用
  if(!onTouchListener.onTouch(v: View?, event: MotionEvent?)){
       //3. onTouch 返回了 false ，onTouchEvent 调用,并且会调用内部的 onClick 事件
    if(!onTouchEvent(event)){
        //4. 如果也设置了 onClickListener 那么 onClick 也会被调用
       onClickListener.onClick()
    }
  }
 }
}
```

上面的伪代码的逻辑总结一下就是如果当前 View 设置了 onTouchListener 那么自身的 onTouch 就会执行，如果 onTouch 返回值是 false ，其自身的 onTouchEvent 会被调用。如果 onTouchEvent 返回也为 false 那么 onClick 就会执行 。优先级为 onTouch > onTouchEvent > onClick。

当一个点击事件产生后，它的传递过程遵循如下顺序：**Activity -> Window -> View** ,即事件总是先传递给 Activity , Activity 再传递给 Window , 最后 Window 再传递给顶级 View 。顶级 View 接收到事件后，就会按照事件分发机制去分发事件。考虑一种情况，如果一个 View 的 onTouchEvent 返回 false ，那么它的父容器的 onTouchEvent 将会被调用，依次类推。如果所有的元素都不处理这个事件，那么这个事件将会最终传递给 Activity 处理，即 Activity 的 onTouchEvent 方法会被调用。下面我们就以一段代码示例来演示一下这种场景，代码如下：

1. 重写 Activity dispatchTouchEvent 分发和 onTouchEvent 事件处理

   ```kotlin
   class MainActivity : AppCompatActivity() { 
   		override fun dispatchTouchEvent(ev: MotionEvent?): Boolean {
         if (ev.action == MotionEvent.ACTION_DOWN)
           println("事件分发机制开始分发 ----> Activity  dispatchTouchEvent")
           return super.dispatchTouchEvent(ev)
       }
   
   
       override fun onTouchEvent(event: MotionEvent?): Boolean {
         if (event.action == MotionEvent.ACTION_DOWN)
           println("事件分发机制处理 ----> Activity onTouchEvent 执行")
           return super.onTouchEvent(event)
       }
   }
   ```

2. 重写根 ViewGroup dispatchTouchEvent 分发和 onTouchEvent 事件处理

   ```kotlin
   public class GustomLIn(context: Context?, attrs: AttributeSet?) : LinearLayout(context, attrs) {
   
       override fun onTouchEvent(event: MotionEvent?): Boolean {
          if (event.action == MotionEvent.ACTION_DOWN)
           println("事件分发机制处理 ----> 父容器 LinearLayout onTouchEvent")
           return false
       }
   
       override fun dispatchTouchEvent(ev: MotionEvent?): Boolean {
          if (ev.action == MotionEvent.ACTION_DOWN)
           println("事件分发机制开始分发 ----> 父容器  dispatchTouchEvent")
           return super.dispatchTouchEvent(ev)
       }
   
       override fun onInterceptTouchEvent(ev: MotionEvent?): Boolean {
         if (ev.action == MotionEvent.ACTION_DOWN)
           println("事件分发机制开始分发 ----> 父容器是否拦截  onInterceptTouchEvent")
           return super.onInterceptTouchEvent(ev)
       }
   }
   ```

3. 重写子 View dispatchTouchEvent 分发和 onTouchEvent 事件处理

   ```kotlin
   public class Button(context: Context?, attrs: AttributeSet?) : AppCompatButton(context, attrs) {
       override fun dispatchTouchEvent(event: MotionEvent?): Boolean {
         if (event.action == MotionEvent.ACTION_DOWN)
           println("事件分发机制开始分发 ----> 子View  dispatchTouchEvent")
           return super.dispatchTouchEvent(event)
       }
   
       override fun onTouchEvent(event: MotionEvent?): Boolean {
         if (event.action == MotionEvent.ACTION_DOWN)
           println("事件分发机制处理 ----> 子View onTouchEvent")
           return false
       }
   
   }
   ```

输出:

```java
System.out: 事件分发机制开始分发 ----> Activity  		 dispatchTouchEvent
System.out: 事件分发机制开始分发 ----> 父容器  			 dispatchTouchEvent
System.out: 事件分发机制开始分发 ----> 父容器是否拦截  onInterceptTouchEvent
System.out: 事件分发机制开始分发 ----> 子View  			dispatchTouchEvent
System.out: 事件分发机制开始处理 ----> 子View 				onTouchEvent
System.out: 事件分发机制开始处理 ----> 父容器 				 LinearLayout onTouchEvent
System.out: 事件分发机制开始处理 ----> Activity 		 onTouchEvent 执行
```

得出的结论跟之前的描述完全一致，这就说明了如果子 View ，父 ViewGroup 都不处理事件的话，最后交于 Activity 的 onTouchEvent 方法。也可以从上面的结果看出来事件传递是由外向内传递的，即事件总是先传递给父元素，然后再由父元素分发给子 View 。

### 事件分发源码解析

上一小节我们分析了 View 的事件分发机制，本节将从源码的角度进一步去分析。

1. Activity 对点击事件的分发过程

   点击事件用 MotionEvent 来表示，当一个点击操作发生时，事件最先传递给当前 Activity ，由 Activity 的 dispatchTouchEvent 来进行事件派发，具体的工作是由 Activity 内部的 Window 来完成的。Window 会将事件传递给 DecorView ,DecorView 一般就是当前界面的底层容器也就是**setContentView 所设置的父容器**，它继承自 **FrameLayout** ，它在 Activity 中可以通过 **getWindow().getDecorView()获得** ，由于事件最先由 Activity 开始进行分发，那么我们就直接看它的 **dispactchTouchEvent** 方法，代码如下:

   ```java
   //Activity.java
       public boolean dispatchTouchEvent(MotionEvent ev) {
           /**
            * 首先按下的触发的是 ACTION_DOWN 事件
            */
           if (ev.getAction() == MotionEvent.ACTION_DOWN) {
               onUserInteraction();
           }
           /**
            * 拿到当前 Window 调用 superDispatchTouchEvent 方法
            */
           if (getWindow().superDispatchTouchEvent(ev)) {
               return true;
           }
           /**
            * 如果所有的 View 都没有处理，那么最终会执行到 Activity onTouchEvent 方法中。
            */
           return onTouchEvent(ev);
       }
   ```

   通过上面的代码我们知道首先执行的是 ACTION_DOWN 按下事件执行 **onUserInteraction** 空方法，然后调用 getWindow() 的 superDispatchTouchEvent 方法，这里的 getWindow  其实就是它的唯一子类 PhoneWindow 我们看它的具体调用实现，代码如下:

   ```java
   //PhoneWindow.java
   public class PhoneWindow extends Window implements MenuBuilder.Callback {
     ...
   		private DecorView mDecor;	
       @Override
       public boolean superDispatchTouchEvent(MotionEvent event) {
           return mDecor.superDispatchTouchEvent(event);
       }
     ...
   }
   ```

   在 PhoneWindow 的 superDispatchTouchEvent 函数中又交于了 DecorView 来处理，那么 DecorView 是什么呢？

   ```java
   //DecorView.java
   
   public class DecorView extends FrameLayout implements RootViewSurfaceTaker, WindowCallbacks {
     ...
           DecorView(Context context, int featureId, PhoneWindow window,
               WindowManager.LayoutParams params) {
           super(context);
      ...
        
            @Override
       public final View getDecorView() {
           if (mDecor == null || mForceDecorInstall) {
               installDecor();
           }
           return mDecor;
       }
       }
     ...
       
   }
   ```

   我们看到 DecorView 它其实就是继承的 FrameLayout ，我们知道在 Activity 中我们可以通过 getWindow().getDecorView().findViewById() 拿到对应在 XML 中的 View 对象 , 那么 DecorView 又是什么时候进行实例化呢？还有 PhoneWindow 又是何时进行实例化的呢？因为这些不是咱们今天讲解的主要内容，感兴趣的可以看我之前对 [Activity 启动源码分析该篇中有讲过](https://juejin.im/post/5db85da4e51d4529f73e27fb) 它们其实都是在 Activity 启动的时候进行各自的实例化。好了，DecorView 实例化就将到这里。目前事件传递到了 DecorView 这里，我们看它的内部源码实现，代码如下:

   ```java
     //  DecorView.java
   public class DecorView extends FrameLayout implements RootViewSurfaceTaker, WindowCallbacks {
   	public boolean superDispatchTouchEvent(MotionEvent event) {
           return super.dispatchTouchEvent(event);
       }
   ```

   我们看到内部又调用了父类 dispatchTouchEvent 方法， 所以最终是交给 ViewGroup 顶级 View 来处理分发了。

2. 顶级 View 对点击事件的分发过程

   在上一小节中我们知道了一个事件的传递流程，这里我们就大致在回顾一下。首先点击事件到达顶级 ViewGroup 之后，会调用自身的 dispatchTouchEvent 方法，之后如果自身的拦截方法 onInterceptTouchEvent 返回 true ，则事件不会继续下发给子类，如果自身设置了 mOnTouchListener 监听，则 onTouch 会被调用，否则 onTouchEvent 会被调用，如果 onTouchEvent 中设置了 mOnClickListener 那么 onClick 会调用。如果 ViewGroup 的 onInterceptTouchEvent 返回 false,则事件会传递到所点击的子 View 中，这时子 View 的 dispatchTouchEvent 会被调用。到此为止，事件已经从顶级 View 传递给了下一层 View ,接下来的传递过程和顶级 ViewGroup 一样，如此循环就完成了整个事件的分发。

   在该小节的第一点中我们知道，在 DecorView 中的 superDispatchTouchEvent 方法内部调用了父类的 dispatchTouchEvent 方法，我们看它的实现，代码如下:

   ```java
   //ViewGroup.java
       @Override
       public boolean dispatchTouchEvent(MotionEvent ev) {
        ...
   
               if (actionMasked == MotionEvent.ACTION_DOWN) {
                   //这里主要是在新事件开始时处理完上一个事件
                   cancelAndClearTouchTargets(ev);
                   resetTouchState();
               }
          
               /** 检查事件拦截,表示事件是否拦截*/
               final boolean intercepted;
               /**
                * 1. 判断当前是否是按下
                */
               if (actionMasked == MotionEvent.ACTION_DOWN
                       || mFirstTouchTarget != null) {
                   final boolean disallowIntercept = (mGroupFlags & FLAG_DISALLOW_INTERCEPT) != 0;
                 //2. 子类可以通过 requestDisallowInterceptTouchEvent 方法来设置父类不要拦截
                   if (!disallowIntercept) {
                     //3
                       intercepted = onInterceptTouchEvent(ev);
                       //恢复事件防止其改变
                       ev.setAction(action); 
                   } else {
                       intercepted = false;
                   }
               } else {
                   intercepted = true;
               }
        ...
       }
         
   ```

   从上面代码我们可以看出如果 actionMasked == MotionEvent.ACTION_DOWN 或者 mFirstTouchTarget != null 成立的话会执行注释 2 的判断（mFirstTouchTarget 的意思如果当前事件被子类消费了，就不成立，后面会提高），disallowIntercept 可以在子类中通过调用父类的 requestDisallowInterceptTouchEvent(true)  请求父类不要拦截分发事件，也就是阻止执行注释 3 的拦截子类接收按下的事件，反之执行 onInterceptTouchEvent(ev); 如果返回 true 说明拦截了事件 。

   上面介绍了注释 1，2，3  onInterceptTouchEvent 返回 true 的情况，说明拦截了事件，下面我们来讲解 intercepted = false 当前 ViewGroup 不拦截事件的时候，事件会下发给它的子 View 进行处理，下面看子 View 处理的源码，代码如下:

   ```java
   //ViewGroup.java
   public boolean dispatchTouchEvent(MotionEvent ev) {
    ... 
      
      if (!canceled && !intercepted) {
                               final View[] children = mChildren;
                           for (int i = childrenCount - 1; i >= 0; i--) {
                               final int childIndex = getAndVerifyPreorderedIndex(
                                       childrenCount, i, customOrder);
                               final View child = getAndVerifyPreorderedView(
                                       preorderedList, children, childIndex);
                               if (childWithAccessibilityFocus != null) {
                                   if (childWithAccessibilityFocus != child) {
                                       continue;
                                   }
                                   childWithAccessibilityFocus = null;
                                   i = childrenCount - 1;
                               }
   
                               if (!canViewReceivePointerEvents(child)
                                       || !isTransformedTouchPointInView(x, y, child, null)) {
                                   ev.setTargetAccessibilityFocus(false);
                                   continue;
                               }
   
                               newTouchTarget = getTouchTarget(child);
                               if (newTouchTarget != null) {
                                   newTouchTarget.pointerIdBits |= idBitsToAssign;
                                   break;
                               }
   
                               resetCancelNextUpFlag(child);
                               if (dispatchTransformedTouchEvent(ev, false, child, idBitsToAssign)) {
                                   mLastTouchDownTime = ev.getDownTime();
                                   if (preorderedList != null) {
                                       for (int j = 0; j < childrenCount; j++) {
                                           if (children[childIndex] == mChildren[j]) {
                                               mLastTouchDownIndex = j;
                                               break;
                                           }
                                       }
                                   } else {
                                       mLastTouchDownIndex = childIndex;
                                   }
                                   mLastTouchDownX = ev.getX();
                                   mLastTouchDownY = ev.getY();
                                   newTouchTarget = addTouchTarget(child, idBitsToAssign);
                                   alreadyDispatchedToNewTouchTarget = true;
                                   break;
                               }
                               ev.setTargetAccessibilityFocus(false);
                           } 
        
      }
     
    ...
   }
   ```

   上面这段代码也很好理解，首先遍历 ViewGroup 子孩子，然后判断子元素是否在播放动画和点击事件是否落在了子元素的区域内。如果某个子元素满足这 2 个条件，那么事件就会传递给该子类来处理，可以看到 ，**dispatchTransformedTouchEvent** 实际上调用的就是子类的 **dispatchTouchEvent** 方法，在它的内部有如下一段内容，而在上面的代码中 child 传递不是 null ,因此它会直接调用子元素的 dispatchTouchEvent 方法，这样事件就交由子元素处理，从而完成了一轮事件分发。

   ```java
   //ViewGroup.java
       private boolean dispatchTransformedTouchEvent(MotionEvent event, boolean cancel,
               View child, int desiredPointerIdBits) {
        ...
         if (child == null) {
                   handled = super.dispatchTouchEvent(event);
               } else {
                   handled = child.dispatchTouchEvent(event);
               }
          
        ...
         
         
       }
   ```

   这里如果 child.dispatchTouchEvent(event) 返回 true , 那么 mFirstTouchTarget 就会被赋值同时跳出 for 循环，如下所示:

   ```java
   //ViewGroup.java
   public boolean dispatchTouchEvent(MotionEvent ev) {
     ...
   newTouchTarget = addTouchTarget(child, idBitsToAssign);
   alreadyDispatchedToNewTouchTarget = true;
     ...
   }
   
   private TouchTarget addTouchTarget(@NonNull View child, int pointerIdBits) {
           final TouchTarget target = TouchTarget.obtain(child, pointerIdBits);
           target.next = mFirstTouchTarget;
     			//这个时候 mFirstTouchTarget 就代表子 View 成功处理了事件
           mFirstTouchTarget = target;
           return target;
   }
   ```

   这几行代码完成了 mFirstTouchTarget 的赋值并终止了对子元素的遍历。如果子元素的 dispatchTouchEvent 返回 false ，ViewGroup 会继续遍历进行事件分发给下一个子元素。

   如果遍历所有的子元素后事件都没有被处理的时候，那么 ViewGroup 就会自己处理点击事件，这里包含 2 种情况下 ViewGroup 会自己处理事件 (其一: ViewGroup 没有子元素，其二：子元素处理了点击事件，但是在 dispatchTouchEvent 中返回了false,这一般是在子元素的 onTouchEvent 中返回了 false ) 

   代码如下:

   ```java
   public boolean dispatchTouchEvent(MotionEvent ev) {
     ...
      if (mFirstTouchTarget == null) {
                  
       handled = dispatchTransformedTouchEvent(ev, canceled, null,
                           TouchTarget.ALL_POINTER_IDS);
        }
     ...
       
       
   }
   ```

   可以看到如果 mFirstTouchTarget == null 的时候，那么就是代表 ViewGroup 的子 View 没有被消费点击事件，将调用自身的 dispatchTransformedTouchEvent 方法。注意上面这段代码这里的第三个参数 child 为 null ，从前面的分析可以知道，它会调用 super.dispatchTouchEvent(event) ，显然，这里就会调用父类 View 的 dispatchTouchEvent 方法，即点击事件开始交由 View 处理，请看下面的分析：

   

3. View 对点击事件的处理过程

   其实 View 对点击事件的处理过程稍微简单一些，注意这里的 View 不包含 ViewGroup 。先看它的 dispatchTouchEvent 方法，代码如下:

   ```java
   //View.java
       public boolean dispatchTouchEvent(MotionEvent event) {
           ...
   
           if (onFilterTouchEventForSecurity(event)) {
               if ((mViewFlags & ENABLED_MASK) == ENABLED && handleScrollBarDragging(event)) {
                   result = true;
               }
   
               ListenerInfo li = mListenerInfo;
             //1. 
               if (li != null && li.mOnTouchListener != null
                       && (mViewFlags & ENABLED_MASK) == ENABLED
                       && li.mOnTouchListener.onTouch(this, event)) {
                   result = true;
               }
   					//2. 
               if (!result && onTouchEvent(event)) {
                   result = true;
               }
           }
   
           ....
   
           return result;
       }
   ```

    View 中的事件处理逻辑比较简单，我们先看注释 1 处，如果我们外部设置了 mOnTouchListener 点击事件，那么就会执行 onTouch 回调，如果该回调的返回值为 false ，那么才会执行 onTouchEvent 方法，可见onTouchListener 优先级高于 onTouchEvent 方法，下面我们来分析 onTouchEvent 方法实现，代码如下:

   ```java
   //View.java
    public boolean onTouchEvent(MotionEvent event) {
           final float x = event.getX();
           final float y = event.getY();
           final int viewFlags = mViewFlags;
           final int action = event.getAction();
   
           final boolean clickable = ((viewFlags & CLICKABLE) == CLICKABLE
                   || (viewFlags & LONG_CLICKABLE) == LONG_CLICKABLE)
                   || (viewFlags & CONTEXT_CLICKABLE) == CONTEXT_CLICKABLE;
   
           /**
            * 1. View 处于不可用状态下的点击事件的处理过程
            */
           if ((viewFlags & ENABLED_MASK) == DISABLED) {
               if (action == MotionEvent.ACTION_UP && (mPrivateFlags & PFLAG_PRESSED) != 0) {
                   setPressed(false);
               }
               mPrivateFlags3 &= ~PFLAG3_FINGER_DOWN;
               // A disabled view that is clickable still consumes the touch
               // events, it just doesn't respond to them.
               return clickable;
           }
   
           /**
            * 2. 如果 View 设置了代理，那么还会执行 TouchDelegate 的 onTouchEvent 方法。
            */
           if (mTouchDelegate != null) {
               if (mTouchDelegate.onTouchEvent(event)) {
                   return true;
               }
           }
   
           /**
            * 3. 如果  clickable 或 (viewFlags & TOOLTIP) == TOOLTIP 有一个成立那么就会处理该事件
            */
              if (clickable || (viewFlags & TOOLTIP) == TOOLTIP) {
               switch (action) {
                   case MotionEvent.ACTION_UP:
                       mPrivateFlags3 &= ~PFLAG3_FINGER_DOWN;
                       if ((viewFlags & TOOLTIP) == TOOLTIP) {
                           handleTooltipUp();
                       }
                       if (!clickable) {
                           removeTapCallback();
                           removeLongPressCallback();
                           mInContextButtonPress = false;
                           mHasPerformedLongPress = false;
                           mIgnoreNextUpEvent = false;
                           break;
                       }
                       // 用于识别快速按下
                       boolean prepressed = (mPrivateFlags & PFLAG_PREPRESSED) != 0;
                       if ((mPrivateFlags & PFLAG_PRESSED) != 0 || prepressed) {
   
                           boolean focusTaken = false;
                           if (isFocusable() && isFocusableInTouchMode() && !isFocused()) {
                               focusTaken = requestFocus();
                           }
   
                           if (prepressed) {
                               setPressed(true, x, y);
                           }
   
                           if (!mHasPerformedLongPress && !mIgnoreNextUpEvent) {
                               removeLongPressCallback();
                               if (!focusTaken) {
                                   if (mPerformClick == null) {
                                       mPerformClick = new PerformClick();
                                   }
                                   /**
                                    * 如果设置了点击事件 mOnClickListener 就会执行内部回调
                                    */
                                   if (!post(mPerformClick)) {
                                       performClick();
                                   }
                               }
                           }
   
                           if (mUnsetPressedState == null) {
                               mUnsetPressedState = new UnsetPressedState();
                           }
   
                           if (prepressed) {
                               postDelayed(mUnsetPressedState,
                                       ViewConfiguration.getPressedStateDuration());
                           } else if (!post(mUnsetPressedState)) {
                               // If the post failed, unpress right now
                               mUnsetPressedState.run();
                           }
   
                           removeTapCallback();
                       }
                       mIgnoreNextUpEvent = false;
                       break;
   
                   case MotionEvent.ACTION_DOWN:
                      ...
                       //判断是否是在滚动容器中
                       boolean isInScrollingContainer = isInScrollingContainer();
                       if (isInScrollingContainer) {
                           mPrivateFlags |= PFLAG_PREPRESSED;
                           if (mPendingCheckForTap == null) {
                               mPendingCheckForTap = new CheckForTap();
                           }
                           mPendingCheckForTap.x = event.getX();
                           mPendingCheckForTap.y = event.getY();
                         	//发送一个延迟执行长按事件的操作
                           postDelayed(mPendingCheckForTap, ViewConfiguration.getTapTimeout());
                       } else {
                           // Not inside a scrolling container, so show the feedback right away
                           setPressed(true, x, y);
                           checkForLongClick(0, x, y);
                       }
                       break;
   
                   case MotionEvent.ACTION_CANCEL:
                       if (clickable) {
                           setPressed(false);
                       }
                   //移除一些回调比如长按事件
                       removeTapCallback();
                       removeLongPressCallback();
                       mInContextButtonPress = false;
                       mHasPerformedLongPress = false;
                       mIgnoreNextUpEvent = false;
                       mPrivateFlags3 &= ~PFLAG3_FINGER_DOWN;
                       break;
   
                   case MotionEvent.ACTION_MOVE:
                       if (clickable) {
                           drawableHotspotChanged(x, y);
                       }
                       if (!pointInView(x, y, mTouchSlop)) {
                         	//移除一些回调比如长按事件
                           removeTapCallback();
                           removeLongPressCallback();
                           if ((mPrivateFlags & PFLAG_PRESSED) != 0) {
                               setPressed(false);
                           }
                           mPrivateFlags3 &= ~PFLAG3_FINGER_DOWN;
                       }
                       break;
               }
   
               return true;
           }
   
           return false;
       }
   ```

   上面代码虽然比较多，但是逻辑还是很清楚的，我们来分析一下

   1. 判断 View 是否处于不可用的状态下使用，返回一个 clickable 。
   2. 判断 View 是否设置了代理，如果设置了代理将会执行 代理的 onTouchEvent 方法。
   3. 如果  clickable 或 (viewFlags & TOOLTIP) == TOOLTIP 有一个成立那么就会处理 MotionEvent 事件。
   4. 在 MotionEvent 事件中分别会在 up 和 down 中会执行点击 onClick 和 onLongClick 回调。

   到这里点击事件的分发机制源码实现已经分析完了，结合之前分析的传递规则和下面这张图，然后结合源码相信你应该理解了事件分发跟事件处理机制了。

   ![](https://pic3.superbed.cn/item/5dd2b94a8e0e2e3ee9ea34c4.png)

   

## 滑动冲突

本小节将介绍 View 体系中一个非常重要的知识点**滑动冲突**，相信在开发中特别是做一些滑动效果处理的时候而且还不止一层滑动，又的是嵌套好几层的滑动，那么它们之间如果不解决滑动冲突必定是不可行的，下面我们先来看看造成滑动冲突的场景。

### 滑动冲突场景及处理规则

**1. 外部滑动方向和内部滑动方向不一致**

![](https://pic3.superbed.cn/item/5dd2bbe28e0e2e3ee9ea8659.png)

主要是将 ViewPager 和 Fragment 配合使用所组成的页面滑动效果，主流应用几乎都会使用这个效果。在这种效果中，可以通过左右滑动来切换页面，而每个页面内部往往是一个 RecyclerView 。本来这种情况下是有滑动冲突的，但是 ViewPager 内部处理了这种滑动冲突，因此采用 ViewPager 时我们无须关注这个问题，但是如果我们采用的是 ScrollView 等滑动控件，那就必须手动处理滑动冲突了，否则造成的后果就是内外两层只能由一层能够滑动，这是因为两者之间的滑动事件有冲突。

`它的处理规则是：`

当用户左右滑动时，需要让外部的 View 拦截点击事件，当用户上下滑动的时候，需要让内部的 View 拦截点击事件。这个时候我们就可以根据他们的特征来解决滑动冲突。具体来说就是可以通过判断滑动手势是水平方向还是竖直方向具体来对应拦截事件。

**2. 外部滑动方向和内部滑动方向一致**

![](https://pic2.superbed.cn/item/5dd2bdf58e0e2e3ee9eab903.png)

这种情况就稍微复杂一些，当内外两层都在同一个方向可以滑动的时候，显然存在逻辑问题。因为当手指开始滑动的时候，系统无法知道用户到底是想让那一层滑动，所以当手指滑动的时候就会出现问题，要么只有一层能滑动，要么就是内外两层都滑动得很卡顿。在实际的开发中，这种场景主要是指内外两层同时能上下滑动或者内外两层同时能左右滑动。

`它的处理规则是:`

这种事比较特殊的，因为它无法根据滑动的角度、距离差以及速度差来做判断，但是这个时候一般都能在业务上找到突破点，比如业务有规定，当处理某种状态的时候需要外部 View 响应用户的滑动，而处于另外一种状态时则需要内部 View 来响应 View 的滑动，根据这种业务上的需求我们也能得出相应的处理规则，有了处理规则同样可以进行下一步处理。这种场景通过文字描述可能比较抽象，在下一小节中我们会通过实际例子来演示这种情况。

**3. 1 + 2 场景的嵌套**

![](https://pic1.superbed.cn/item/5dd2bed58e0e2e3ee9ead086.png)

场景三是场景一和场景二两种情况的嵌套，因此场景三的滑动冲突看起来就更加复杂了。比如在许多应用中会有这么一个效果：内层有一个场景 1 中的滑动效果，然后外层又有一个场景 2 中的滑动效果。虽然说场景三的滑动冲突看起来是比较复杂的，但是它是几个单一的滑动冲突的叠加，所以只需要分别处理内中外层之间的冲突就行了，处理方式跟场景 1 和 2 一致。

下面我们就来看一下滑动冲突的处理规则。

`它的处理规则是:`

它的滑动规则就更复杂了，和场景 2 一样，它也无法直接根据滑动的角度、距离以及速度差来做判断，同样还是只能从业务员上找到突破点，具体方法和场景 2 一样，都是从业务的需求上得出相应的处理规则，在下一节中同样会给出代码示例来进行演示。

### 滑动冲突的解决方式

上面说过针对场景 1 中的滑动，我们可以根据滑动的距离差来进行判断，这个距离差就是所谓的滑动规则。如果用 ViewPager 去实现场景 1 中的效果，我们不需要手动处理滑动冲突，因为 ViewPager 已经帮我们做了，但是这里为了更好的演示滑动冲突解决思想，没有采用 ViewPager 。其实在滑动过程中得到滑动的角度这个是相当简单的，但是到底要怎么做才能将点击事件交给合适的 View 去处理呢？这时就要用到 3.4 节所讲述的事件分发机制了。针对滑动冲突，这里给出 2 种解决滑动冲突的方式，外部拦截和内部拦截发。

1. 外部拦截法

   所谓外部拦截就是指点击事件先经过父容器的拦截处理，如果父容器需要此事件就拦截，如果不需要此事件就不拦截，这样就可以解决滑动冲突的问题，这种方法比较符合点击事件的分发机制。外部拦截法需要重写 onInterceptTouchEvent方法，在内部做响应的拦截即可，可以参考下面代码:

   ```kotlin
       override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
           when (ev.action) {
               MotionEvent.ACTION_DOWN -> {
                   isIntercepted = false
               }
               MotionEvent.ACTION_MOVE -> {
                   //拦截子类的移动事件
                   if (true) {
                       println("事件分发机制开始分发 ----> 拦截子类的移动事件  onInterceptTouchEvent")
                       isIntercepted = true
                   } else {
                       isIntercepted = false
                   }
   
               }
               MotionEvent.ACTION_UP -> {
                   isIntercepted = false
               }
           }
           return isIntercepted
       }
   ```

   上述代码是外部拦截的典型逻辑，针对不同的滑动冲突只需要修改父容器需要当前点击事件这个条件即可，其它均不做修改也不能修改。这里对上述代码再描述一下，在 onInterceptTouchEvent 方法中，首先是 ACTION_DOWN 这个事件，父容器必须返回 false 。既不拦截 ACTION_DOWN 事件，这是因为一旦父容器拦截了 ACTION_DOWN , 这是因为一旦父容器拦截 ACTION_DOWN, 那么后续的 ACTION_DOWN, 那么后续的 ACTION_MOVE 和 ACTION_UP 事件都会直接交由父容器处理，这个时候事件没法再传递给子元素了；其次是 ACTION_MOVE 事件，这个事件可以根据需要来决定是否拦截，如果是 ACTION_UP 事件，这里必须要返回 false , 因为 ACTION_UP 事件本身没有太多意义。

   考虑一种情况，假设事件交由子元素处理，如果父容器在 ACTION_UP 时返回了 true ，就会导致子元素无法接收到 ACTION_UP 事件，这个时候子元素中的 onClick 事件就无法触发，但是父容器比较特殊，一旦它开始拦截任何一个事件，那么后续的事件都会交给它来处理，而 ACTION_UP 作为最后一个事件也必定可以传递给父容器，即便父容器的 onInterceptTouchEvent 方法在 ACTION_UP 时返回了 false.

2. 内部拦截法

   内部拦截法是指父容器不拦截任何事件，所有的事件都传递给子元素，如果子元素需要此事件就直接消耗掉，否则就交由父容器进行处理，这种方法和 Android 中的事件分发机制不一致，在讲解源码的时候，我们讲解了 ，可以通过 requestDisalloWInterceptTouchEvent 方法才能正常工作，使用起来较外部拦截法稍显复杂，我们需要重写子元素的 dispatchTouchEvent 方法

   ```kotlin
       override fun dispatchTouchEvent(event: MotionEvent): Boolean {
           when (event.action) {
               MotionEvent.ACTION_DOWN -> {
                   println("事件分发机制开始分发 ----> 子View  dispatchTouchEvent ACTION_DOWN")
                   parent.requestDisallowInterceptTouchEvent(true)
               }
               MotionEvent.ACTION_MOVE -> {
                   println("事件分发机制开始分发 ----> 子View  dispatchTouchEvent ACTION_MOVE")
                   if (true){
                       parent.requestDisallowInterceptTouchEvent(false)
                   }
               }
               MotionEvent.ACTION_UP -> {
                   println("事件分发机制开始分发 ----> 子View  dispatchTouchEvent ACTION_UP")
               }
           }
           return super.dispatchTouchEvent(event)
       }
   ```

   上述代码是内部拦截法的典型代码，当面对不同的滑动策略时只需要修改里面的条件即可，其它不需要做改动而且也不能有改动，除了子元素需要做处理以外，父元素也要默认拦截除了 ACTION_DOWN 以外的其它事件，这样当子元素调用 parent.requestDisallowInterceptTouchEvent(false) ，父元素才能继续拦截所需的事件。

   下面就以实战的 demo 具体来说明一下。

## 实战

**场景一 滑动冲突案例**

我们自定义一个 ViewPager + RecyclerView 包含左右 + 上下滑动，这样就满足了我们场景一的滑动冲突，我们先来看一下完整的效果图:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191121213554.gif)

上面录屏的效果解决了上下滑动跟左右滑动冲突，实现方式就是自定义 ViewGroup 利用 Scroller 达到像 ViewPager 一样丝滑般的感觉 ，然后内部添加了 3 个 RecyclerView  。

我们看一下自定义 ViewGroup 实现：

```kotlin
class ScrollerViewPager(context: Context?, attrs: AttributeSet?) : ViewGroup(context, attrs) {
    /**
     * 定义 Scroller 实例
     */
    private var mScroller = Scroller(context)

    /**
     * 判断拖动的最小移动像素点
     */
    private var mTouchSlop = 0

    /**
     * 手指按下屏幕的 x 坐标
     */
    private var mDownX = 0f

    /**
     * 手指当前所在的坐标
     */
    private var mMoveX = 0f

    /**
     * 记录上一次触发 按下是的坐标
     */
    private var mLastMoveX = 0f

    /**
     * 界面可以滚动的左边界
     */
    private var mLeftBorder = 0

    /**
     * 界面可以滚动的右边界
     */
    private var mRightBorder = 0

    /**
     * 记录下一次拦截的 X,y
     */
    private var mLastXIntercept = 0
    private var mLastYIntercept = 0

    /**
     * 是否拦截
     */
    private var interceptor = false


    init {
        init()
    }

    constructor(context: Context?) : this(context, null) {
    }


    private fun init() {
        /**
         * 通过 ViewConfiguration 拿到认为手指滑动的最短的移动 px 值
         */
        mTouchSlop = ViewConfiguration.get(context).scaledPagingTouchSlop


    }


    /**
     * 测量 child 宽高
     */
    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        //拿到子View 个数
        val childCount = childCount
        for (index in 0..childCount - 1) {
            val childView = getChildAt(index)
            //为 ScrollerViewPager 中的每一个子控件测量大小
            measureChild(childView, widthMeasureSpec, heightMeasureSpec)

        }
    }

    /**
     * 测量完之后，拿到 child 的大小然后开始对号入座
     */
    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        if (changed) {
            val childCount = childCount
            for (child in 0..childCount - 1) {
                //拿到子View
                val childView = getChildAt(child)
                //开始对号入座
                childView.layout(
                    child * childView.measuredWidth, 0,
                    (child + 1) * childView.measuredWidth, childView.measuredHeight
                )
            }
            //初始化左右边界
            mLeftBorder = getChildAt(0).left
            mRightBorder = getChildAt(childCount - 1).right

        }

    }


    /**
     * 外部解决 1.  根据垂直或水平的距离来判断
     */
//    override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
//         interceptor = false
//        var x = ev.x.toInt()
//        var y = ev.y.toInt()
//        when (ev.action) {
//            MotionEvent.ACTION_DOWN -> {
//                interceptor = false
//            }
//            MotionEvent.ACTION_MOVE -> {
//                var deltaX = x - mLastXIntercept
//                var deltaY = y - mLastYIntercept
//                interceptor = Math.abs(deltaX) > Math.abs(deltaY)
//                if (interceptor) {
//                    mMoveX = ev.getRawX()
//                    mLastMoveX = mMoveX
//                }
//            }
//            MotionEvent.ACTION_UP -> {
//                //拿到当前移动的 x 坐标
//                interceptor = false
//                println("onInterceptTouchEvent---ACTION_UP")
//
//            }
//        }
//        mLastXIntercept = x
//        mLastYIntercept = y
//        return interceptor
//    }

    /**
     * 外部解决 2.  根据第二点坐标 - 第一点坐标 如果差值大于 TouchSlop 就认为是在左右滑动
     */
    override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
        interceptor = false
        when (ev.action) {
            MotionEvent.ACTION_DOWN -> {
                //拿到手指按下相当于屏幕的坐标
                mDownX = ev.getRawX()
                mLastMoveX = mDownX
                interceptor = false
            }
            MotionEvent.ACTION_MOVE -> {
                //拿到当前移动的 x 坐标
                mMoveX = ev.getRawX()
                //拿到差值
                val absDiff = Math.abs(mMoveX - mDownX)
                mLastMoveX = mMoveX
                //当手指拖动值大于 TouchSlop 值时，就认为是在滑动，拦截子控件的触摸事件
                if (absDiff > mTouchSlop)
                    interceptor =   true
            }
        }
        return interceptor
    }


    /**
     * 父容器没有拦截事件，这里就会接收到用户的触摸事件
     */
    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_MOVE -> {
                println("onInterceptTouchEvent---onTouchEvent--ACTION_MOVE ")
                mLastMoveX = mMoveX
                //拿到当前滑动的相对于屏幕左上角的坐标
                mMoveX = event.getRawX()
                var scrolledX = (mLastMoveX - mMoveX).toInt()
                if (scrollX + scrolledX < mLeftBorder) {
                    scrollTo(mLeftBorder, 0)
                    return true
                } else if (scrollX + width + scrolledX > mRightBorder) {
                    scrollTo(mRightBorder - width, 0)
                    return true

                }
                scrollBy(scrolledX, 0)
                mLastMoveX = mMoveX
            }
            MotionEvent.ACTION_UP -> {
                //当手指抬起是，根据当前滚动值来判定应该回滚到哪个子控件的界面上
                var targetIndex = (scrollX + width / 2) / width
                var dx = targetIndex * width - scrollX
                /** 第二步 调用 startScroll 方法弹性回滚并刷新页面*/
                mScroller.startScroll(scrollX, 0, dx, 0)
                invalidate()
            }
        }
        return super.onTouchEvent(event)
    }

    override fun computeScroll() {
        super.computeScroll()
        /**
         * 第三步 重写 computeScroll 方法，并在其内部完成平滑滚动的逻辑
         */
        if (mScroller.computeScrollOffset()) {
            scrollTo(mScroller.currX, mScroller.currY)
            postInvalidate()
        }
    }
}
```

上面代码很简单，通过 2 种方式处理了外部拦截法冲突，分别是:

- 根据垂直或水平的距离来判断
- 根据第二点坐标 - 第一点坐标 如果差值大于 TouchSlop 就认为是在左右滑动

当然我们也可以用内部拦截法来解决，按照我们前面对内部拦截法的分析，我们只需要修改自定义 RecylerView 的 分发事件 dispatchTouchEvent 方法中的父容器的拦截逻辑，下面请看代码实现:

```kotlin
class MyRecyclerView(context: Context, attrs: AttributeSet?) : RecyclerView(context, attrs) {
    /**
     * 分别记录我们上次滑动的坐标
     */
    private var mLastX = 0;
    private var mLastY = 0;

    constructor(context: Context) : this(context, null)


    /**
     * 重写分发事件
     */
    override fun dispatchTouchEvent(ev: MotionEvent): Boolean {
        val x = ev.getX().toInt()
        val y = ev.getY().toInt()

        when (ev.action) {
            MotionEvent.ACTION_DOWN -> {
            var par =    parent as ScrollerViewPager
                //请求父类不要拦截事件
                par.requestDisallowInterceptTouchEvent(true)
                Log.d("dispatchTouchEvent", "---》子ACTION_DOWN");
            }
            MotionEvent.ACTION_MOVE -> {
                val deltaX = x - mLastX
                val deltaY = y - mLastY

                if (Math.abs(deltaX) > Math.abs(deltaY)){
                    var par =    parent as ScrollerViewPager
                    Log.d("dispatchTouchEvent", "dx:" + deltaX + " dy:" + deltaY);
                    //交于父类来处理
                    par.requestDisallowInterceptTouchEvent(false)
                }
            }
            MotionEvent.ACTION_UP -> {
            }
        }
        mLastX = x
        mLastY = y
        return super.dispatchTouchEvent(ev)
    }

}
```

还需要改父类 onInterceptTouchEvent 方法

```kotlin
    /**
     * 子类请求父类也叫做内部拦截法
     */
    override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
        interceptor = false
        when (ev.action) {
            MotionEvent.ACTION_DOWN -> {
                //拿到手指按下相当于屏幕的坐标
                mDownX = ev.getRawX()
                mLastMoveX = mDownX
                if (!mScroller.isFinished) {
                    mScroller.abortAnimation()
                    interceptor = true
                }
                Log.d("dispatchTouchEvent", "--->onInterceptTouchEvent,    ACTION_DOWN" );
            }
            MotionEvent.ACTION_MOVE -> {
                //拿到当前移动的 x 坐标
                mMoveX = ev.getRawX()
                //拿到差值
                mLastMoveX = mMoveX
              	//父类消耗移动事件，那么自身 onTouchEvent 会被调用
                interceptor = true
                Log.d("dispatchTouchEvent", "--->onInterceptTouchEvent,    ACTION_MOVE" );
            }
        }
        return interceptor
    }
```

```kotlin
<?xml version="1.0" encoding="utf-8"?>
<com.devyk.customview.sample_1.ScrollerViewPager //父节点
        xmlns:android="http://schemas.android.com/apk/res/android"
        xmlns:tools="http://schemas.android.com/tools"
        android:id="@+id/viewPager"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        tools:context=".MainActivity">

		//子节点
    <com.devyk.customview.sample_1.MyRecyclerView
            android:id="@+id/recyclerView" 
						android:layout_width="match_parent"
            android:layout_height="match_parent">

    </com.devyk.customview.sample_1.MyRecyclerView>

    <com.devyk.customview.sample_1.MyRecyclerView
            android:id="@+id/recyclerView2" 
						android:layout_width="match_parent"
            android:layout_height="match_parent">

    </com.devyk.customview.sample_1.MyRecyclerView>

    <com.devyk.customview.sample_1.MyRecyclerView
            android:id="@+id/recyclerView3" 
						android:layout_width="match_parent"
            android:layout_height="match_parent">

    </com.devyk.customview.sample_1.MyRecyclerView>
</com.devyk.customview.sample_1.ScrollerViewPager>
```



这里解释一下上面代码的含义，首先在 MyRecylerView 中重写 dispatchTouchEvent 事件分发事件，分别对 DOWN, MOVE 做处理。

**DOWN: **当我们手指按下的时候会执行到ViewGroup 的 dispatchTouchEvent 方法，并且会执行 ViewGroup 的 onInterceptTouchEvent 拦截事件方法，由于在 ScrollerViewPager 中重写了 onInterceptTouchEvent 事件，可以看到上面 DOWN 只有再滑动没有结束的情况下事件会由父类拦截，那么一般情况下返回的就是 false 父类不拦截，当父类不拦截 DOWN 事件的时候，子节点 MyRecylerView 的 dispatchTouchEvent 的 DOWN 事件就会被触发，大家注意看，在 DOWN 事件中，我调用了当前根节点 ScrollerViewPager 的 requestDisallowInterceptTouchEvent(true) 方法，其意思就是不让父类执行 onInterceptTouchEvent 方法。

**MOVE:** 当我们手指滑动的时候由于我们请求父类不拦截子节点事件，ViewGroup 的 onInterceptTouchEvent 就不会执行，现在就执行到子节点的 MOVE  方法，如果当前按下的 x,y 坐标减去上一次 x,y 坐标 只要 deltaX 的绝对值 > deltaY 那么就认为是在 左右滑动，现在就要拦截子节点 MOVE 事件交于父节点来处理，从而在 ScrollerViewPager 就可以了左右滑动。反之就认为在上下滑动，子节点来处理。

可以看到内部拦截法比较复杂，不仅要修改子节点内部代码，还要修改父节点方法，其稳定和可维护性明显不如外部拦截法，所以还是推荐大家使用外部拦截法来解决时间冲突。

下面看一个 APP 常用功能，侧滑删除实现，一般侧滑是由一个 RecyclerView + 侧滑自定义 ViewGroup 来实现：

**实战**

参考该 Demo 中的实现，从中你可以学到自定义 ViewGroup 、滑动冲突解决等技术。

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191122165859.gif)

[史上最简单侧滑菜单](https://github.com/mcxtzhang/SwipeDelMenuLayout)

## 参考

- 《Android 艺术开发探索》







