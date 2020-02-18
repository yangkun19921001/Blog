## 性能优化系列

[APP 启动优化](<https://juejin.im/post/5cc19374e51d456e781f2036>)

[UI 绘制优化](<https://juejin.im/post/5cc2dfc7e51d456e845b4260>)

[内存优化](<https://juejin.im/post/5cd82a3ee51d456e781f20ce>)

[图片压缩](<https://juejin.im/post/5ce15d0ce51d45106e5e6dac>)

[长图优化](<https://juejin.im/post/5ce96da06fb9a07ee4633f50>)

[电量优化](<https://juejin.im/post/5ce9088f6fb9a07ee4633ef3>)

[Dex 加解密](<https://juejin.im/post/5cf3ee295188256aa76bb1e1>)

[动态替换 Application](<https://juejin.im/post/5cf69d30f265da1b897abd53>)

[APP 稳定性之热修复原理探索](<https://juejin.im/post/5cfce989f265da1b6c5f6991>)

[APP 持续运行之进程保活实现](<https://juejin.im/post/5cffe4d4f265da1b695d55d4>)

[ProGuard 对代码和资源压缩](<https://juejin.im/post/5d05dab06fb9a07ea9446e21>)

[APK 极限压缩](<https://juejin.im/post/5d0627f7f265da1bd4247e76>)

## 简介

性能优化的目的不是为了优化而优化，而且为了以后不再优化, 给自己统一 一个标准。

**这里也许会有人问 APP 启动还需要优化吗？启动又不是我们自己写的代码，难道 Google 工程师会犯这么低级的错吗？其实这还真不是 Google 的错，应该说是给我们开发者留了一个坑吧。应该有的同学知道是怎么一回事儿了，当我们在系统桌面任意点击一个 APP 是不是会发现启动的时候有一瞬间有白屏出现(以前老版本是黑屏) 那么我们怎么来优化这个黑白屏的问题勒，现在我们先来了解一下 Android 手机重开机到启动 APP 的过程吧。**

## APP 启动流程

**这里会设计到 Android 系统源码的知识，但并不会深入解析源码，我们只是了解一个过程，因为太深入我自己也懵。**

### 系统的启动

**我在这里大致分为了 6 个步骤，下面以流程图为准**

![](https://user-gold-cdn.xitu.io/2019/4/25/16a5427ea2abc5d1?w=960&h=720&f=jpeg&s=68769)

**启动步骤**

1. 首先拿到一部 Android 系统的手机打开电源，引导芯片代码加载引导程序 BootLoader 到 RAM 中去执行。
2. BootLoader 把操作系统拉起来。
3. Linux 内核启动开始系统设置，找到一个 init.rc 文件启动初始化进程。
4. init 进程初始化和启动属性服务，之后开启 Zygote 进程。
5. Zygote 开始创建 JVM 并注册 JNI 方法，开启 SystemServer。
6. 启动 Binder 线程池和 SystemServiceManager,并启动各种服务。

### Launcher 启动

#### App Appcation 启动

1. 手机回到系统桌面, 通过 adb shell dumpsys window w |findstr \/ |findstr name= 来查看当前的进程和 Activity 名。

   ![](https://user-gold-cdn.xitu.io/2019/4/25/16a5427ea2f4e64a?w=1356&h=857&f=gif&s=195034)

2. 当点击桌面 APP 图标的时候会走 Launcher . java 的 onClick (View view) 方法，详细见下图。

   ![](https://user-gold-cdn.xitu.io/2019/4/25/16a5427ea271d347?w=1108&h=924&f=gif&s=589577)

   **startActivity(intent) 会开启一个 APP 进程**

3. AcitivityThread main() 调用执行流程，见下图。

   ![](https://user-gold-cdn.xitu.io/2019/4/25/16a5427ea2b858e1?w=1221&h=943&f=jpeg&s=182668)

   **最后 ActivityThread main() 是通过反射来进行初始化的**

4. ActivityThread.java 做为入口，详细解说 main() 函数，还是以一个动画来演示一下吧;

   ![](https://user-gold-cdn.xitu.io/2019/4/25/16a5427ea2c1b66a?w=1108&h=924&f=gif&s=696342)

   

   **根据上面的动画，大家应该已经明白 ActivityThread.java main() 方法中 Appcation onCreate() 的是怎么被调用起来的吧。**

   **注意:**

   不知道大家有没有注意 ActivityThread main() 中 *Looper.prepareMainLooper();* 其实咱们为什么能够在 Main Thread 中创建 Handler 不会报错了吧，是因为 Activity 启动的时候在这里已经默认开启了 Looper。

## APP 启动黑白屏问题

终于到了正题了，下面我们就来说下启动黑白屏的问题，还是先来看一个 GIF 吧。

### 市面上 APP 黑白屏

![](https://user-gold-cdn.xitu.io/2019/4/25/16a5427ea2e46478?w=404&h=845&f=gif&s=10436022)

	从上面的一段录屏我们可以发现市面上常见的 APP 启动有的是白屏有的是做了优化。黑屏只有在 Android 4.n 具体是哪个版本我也忘了。那么现在我们就以我现在的真实项目来优化一下启动。

### 真实项目中优化

### 简介

首先为什么会造成白屏勒我们来看一段源码

![](https://user-gold-cdn.xitu.io/2019/4/25/16a5427f0f9dd7d8?w=1144&h=845&f=gif&s=1364566)

![](https://user-gold-cdn.xitu.io/2019/4/25/16a5427f5bae8e22?w=409&h=867&f=gif&s=2240790)

最后就是这个 windowBackground 搞的鬼，知道了是这个搞的鬼那么我们就可以来进行优化了。

### 优化方案 一

```java
在自己的 AppTheme 中加入 windowBackground 
```

### 优化方案 二

设置 windowbackgroud 为透明的

```java
<item name="android:windowIsTranslucent">true</item>
```

但是：

	这 2 中方法会有一个问题，就是所有的 Activity 启动都会显示。

### 优化方案 三

1. **单独做成一个 AppTheme.Launcher**

```dart
    <style name="AppTheme.Launcher">
        <item name="android:windowFullscreen">true</item>
        <!--<item name="android:windowDisablePreview">true</item>-->
        <item name="android:windowBackground">@color/colorAccent</item>
    </style>
```

2. **在清单文件中 启动 Activity 加入该 主题**

   ```java
           <activity
               android:name="com.t01.android.dida_login.mvp.ui.activity.LoginActivity"
               android:configChanges="keyboardHidden|orientation|screenSize"
               android:theme="@style/AppTheme.Launcher"
               android:windowSoftInputMode="adjustUnspecified|stateHidden">
               <intent-filter>
                   <action android:name="android.intent.action.MAIN" />
                   <category android:name="android.intent.category.LAUNCHER" />
               </intent-filter>
           </activity>
   ```

   

3. 在启动 Activity 页面中加入

   ```java
     setTheme(R.style.AppTheme_Launcher);
   ```

**最后这样做只有启动的 UI 才能见到自己的样式**

4. 最后效果，因为我这里没有背景图，故弄了一个主题颜色，如果想要设置一张背景图片可以参考下面的示例，不然有可能会引起图片拉伸效果。

   我这里启动时间大概在 500 ms ~ 800 ms 左右。

   ![](https://user-gold-cdn.xitu.io/2019/4/25/16a5427f4a9aa1cd?w=1911&h=867&f=gif&s=6026761)

   ```java
   <?xml version="1.0" encoding="utf-8"?>
   <layer-list xmlns:android="http://schemas.android.com/apk/res/android">
       <item>
           <bitmap android:src="@mipmap/app_bg"
               android:gravity="fill"/>
       </item>
   </layer-list>
   ```

   最后在清单 启动 Activity 的 Theme 中修改为

   ```java
   <item name="android:windowBackground">@drawable/app_theme_bg</item>
   ```

5. 据说 QQ 的实现方法是(这里只做参考，感兴趣的同学可以自己试试。)

   ```java
    <item name="android:windowDisablePreview">true</item>
    <item name="android:windowBackground">@null</item>
   ```

## 启动时间查看

### 4.4 以前版本查看

```java
adb shell am start -W packName/activity 全路径
```



### 4.4 版本以后查看方式

**通过关键字 Displayed 并筛选为 No Filters**

```java
2019-04-25 18:35:57.629 508-629/? I/ActivityManager: Displayed com.lingyi.autiovideo.lykj/com.t01.android.dida_login.mvp.ui.activity.LoginActivity: +844ms
```



## 工具分析代码执行

### Appcation 中查看耗时通过（如果有的同学还用 Log 打印系统时间来相减来查看 耗时的话，看完我这篇文章就可以换成下面方法了，不然就有点 LOW 了哈）

```java
//开始计时
Debug.startMethodTracing(filePath);
     中间为需要统计执行时间的代码
//停止计时
Debug.stopMethodTracing();
```

**还是通过一组动画来看我怎么操作的吧。（注意这里的时间是 微妙  微妙/10^6 = s 应该是这样，忘了）**

![](https://user-gold-cdn.xitu.io/2019/4/25/16a5427f61a92a2b?w=1922&h=1008&f=gif&s=2220787)
**这个工具可以很友好的提示每个函数具体在内部执行了多少时间，卡顿其实也可以用这个方法来进行监测**

**导出 trace 文件命令**

```java
adb pull /storage/emulated/0/appcation_launcher_time.trace
```

我这里耗时还不算太大 大概在 0.2 - 0.3 s 左右。

## Appcation 中优化方案(并不绝对，优化思路差不多)

1. 开子线程
   - 线程中没有创建 Handler、没有操作 UI 、对异步要求不高
2. 懒加载
   - 用到的时候在初始化，如网络，数据库，图片库，或一些三方库。
3. 使用 IntentService onHandleIntent () 方法来进行初始化一些比较耗时的操作 

## 总结

最后启动优化可以配合上面的 3 点优化方案 + Appcation 优化方案 = 你自己最优方案。