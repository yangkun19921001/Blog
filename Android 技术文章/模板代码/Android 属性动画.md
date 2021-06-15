## 属性动画

###代码形式

- 透明: **alpha**

  ```
  ObjectAnimator animator = ObjectAnimator.ofFloat(imageView, "alpha", 1f, 0f, 1f);
  animator.setDuration(2000);
  animator.start();
  ```

- 旋转: **rotation**

  ```
  ObjectAnimator animator = ObjectAnimator.ofFloat(imageView, "rotation", 0f, 360f, 0f);
  animator.setDuration(2000);
  animator.start();
  ```

- 平移: **translationX**

  ```
  ObjectAnimator animator = ObjectAnimator.ofFloat(imageView, "translationX", 0f, -300f, 0f);
  animator.setDuration(2000);
  animator.start();
  ```

- 缩放: **scaleX**

  ```
  ObjectAnimator animator = ObjectAnimator.ofFloat(imageView, "scaleX", 1f, 2f, 1f);
  animator.setDuration(2000);
  animator.start();
  ```

- 组合动画

  ```java
  //沿x轴放大
  ObjectAnimator scaleXAnimator = ObjectAnimator.ofFloat(imageView, "scaleX", 1f, 2f, 1f);
  //沿y轴放大
  ObjectAnimator scaleYAnimator = ObjectAnimator.ofFloat(imageView, "scaleY", 1f, 2f, 1f);
  //移动
  ObjectAnimator translationXAnimator = ObjectAnimator.ofFloat(imageView, "translationX", 0f, 200f, 0f);
  //透明动画
  ObjectAnimator animator = ObjectAnimator.ofFloat(imageView, "alpha", 1f, 0f, 1f);
  AnimatorSet set = new AnimatorSet();
  //同时沿X,Y轴放大，且改变透明度，然后移动
  set.play(scaleXAnimator).with(scaleYAnimator).with(animator).before(translationXAnimator);
  //都设置3s，也可以为每个单独设置
  set.setDuration(3000);
  set.start();
  ```

  

### XML 形式

- 透明

  ```xml
  <?xml version="1.0" encoding="utf-8"?>
  <objectAnimator xmlns:android="http://schemas.android.com/apk/res/android"
      android:duration="2000"
      android:propertyName="alpha"
      android:repeatCount="-1"
      android:repeatMode="reverse"
      android:valueFrom="0.5"
      android:valueTo="1"
      android:valueType="floatType" />
  ```

- 旋转

  ```xml
  <objectAnimator xmlns:android="http://schemas.android.com/apk/res/android"
      android:valueFrom="0"
      android:valueTo="360"
      android:duration="2000"
      android:propertyName="rotation"
      android:valueType="floatType"/>
  ```

  

- 平移

  ```xml
  <objectAnimator xmlns:android="http://schemas.android.com/apk/res/android"
      android:duration="2000"
      android:propertyName="translationX"
      android:repeatCount="-1"
      android:repeatMode="reverse"
      android:valueFrom="0"
      android:valueTo="200" 
      android:valueType="floatType"/>
  ```

  

- 缩放

  ```xml
  <objectAnimator xmlns:android="http://schemas.android.com/apk/res/android"
      android:duration="2000"
      android:propertyName="scaleX"
      android:valueFrom="1"
      android:valueTo="1.5"
      android:valueType="floatType" />
  ```

  

- 组合

  ```xml
  <?xml version="1.0" encoding="utf-8"?>
  <set xmlns:android="http://schemas.android.com/apk/res/android"
      android:ordering="sequentially">
      <set>
          <objectAnimator
              android:duration="4000"
              android:propertyName="rotation"
              android:repeatMode="reverse"
              android:valueFrom="0"
              android:valueTo="360" />
          <set android:ordering="sequentially">
              <objectAnimator
                  android:duration="2000"
                  android:propertyName="translationX"
                  android:repeatMode="reverse"
                  android:valueFrom="0"
                  android:valueTo="200" />
              <objectAnimator
                  android:duration="2000"
                  android:propertyName="translationX"
                  android:repeatMode="reverse"
                  android:valueFrom="200"
                  android:valueTo="0" />
          </set>
      </set>
      <set >
          <objectAnimator
              android:duration="4000"
              android:propertyName="rotation"
              android:repeatMode="reverse"
              android:valueFrom="0"
              android:valueTo="360" />
          <set android:ordering="sequentially">
              <objectAnimator
                  android:duration="2000"
                  android:propertyName="translationX"
                  android:repeatMode="reverse"
                  android:valueFrom="0"
                  android:valueTo="-200" />
              <objectAnimator
                  android:duration="2000"
                  android:propertyName="translationX"
                  android:repeatMode="reverse"
                  android:valueFrom="-200"
                  android:valueTo="0" />
          </set>
      </set>
  </set>
  ```

  

Java 调用统一为:

```java
Animator animator = AnimatorInflater.loadAnimator(this, R.animator.alpha);
animator.setTarget(imageView);
animator.start();
```

