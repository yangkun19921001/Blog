## ProGuard

### ProGuard 是什么？

可以把 ProGuard 理解为是对代码和资源压缩的一个工具，它能够提供对 Java 类文件的压缩、优化、混淆，和预校验。压缩的步骤是检测并移除未使用的类、字段、方法和属性。优化的步骤是分析和优化方法的字节码。混淆的步骤是使用短的毫无意义的名称重命名剩余的类、字段和方法。压缩、优化、混淆使得代码更小，更高效。

### AndroidStudio 怎么使用 ProGuard ？

#### 代码压缩

要通过 ProGuard 启用代码压缩，请在 `build.gradle` 文件内相应的构建类型中添加 `minifyEnabled true`。

```java
android {
    ...
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'),
                   'proguard-rules.pro'
        }
    }
```

ProGuard 会移除所有 (并且只会移除) 未使用的代码。不过 , ProGuard 难以对许多情况进行正确分析，可能会移除应用真正需要的代码。比如需要反射、动态加载所引用的类等情况，可能因为ProGuard 移除或者混淆了这部分没使用的类，而导致错误。所以有时需要编写混淆优化配置文件。在 gradle 中的 proguardFiles 能够让我们传递File文件或者文件路径交给 proguard 来执行。

##### 配置 ProGuard 规则

现在我们开启了混淆，但是还没有配置混淆，我们可以在 `build/intermediates/proguard-files/proguard-defaults.txt` 来查看默认的配置，现在我们可以根据默认的配置来进行我们项目的配置。

- 分析默认配置文件 `proguard-defaults.txt-3.4.0`

  ```java
  # This is a configuration file for ProGuard.
  # http://proguard.sourceforge.net/index.html#manual/usage.html
  #
  # Starting with version 2.2 of the Android plugin for Gradle, this file is distributed together with
  # the plugin and unpacked at build-time. The files in $ANDROID_HOME are no longer maintained and
  # will be ignored by new version of the Android plugin for Gradle.
  
  # Optimizations can be turned on and off in the 'postProcessing' DSL block.
  # The configuration below is applied if optimizations are enabled.
  # Adding optimization introduces certain risks, since for example not all optimizations performed by
  # ProGuard works on all versions of Dalvik.  The following flags turn off various optimizations
  # known to have issues, but the list may not be complete or up to date. (The "arithmetic"
  # optimization can be used if you are only targeting Android 2.0 or later.)  Make sure you test
  # thoroughly if you go this route.
  
  ####################### START #######################
  
  # 混淆时所采用的算法(谷歌推荐算法)
  -optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
  
  # 指定代码的压缩级别(在0~7之间，默认为5)
  -optimizationpasses 5
  
  # 提高优化步骤
  -allowaccessmodification
  
  # 包名不混合大小写
  -dontusemixedcaseclassnames
  
  # 不忽略非公共的库类
  -dontskipnonpubliclibraryclasses
  
  # 输出混淆日志
  -verbose
  
  # 保持 Google 原生服务需要的类不被混淆
  -keep public class com.google.vending.licensing.ILicensingService
  -keep public class com.android.vending.licensing.ILicensingService
  -keep public class com.google.android.vending.licensing.ILicensingService
  -dontnote com.android.vending.licensing.ILicensingService
  -dontnote com.google.vending.licensing.ILicensingService
  -dontnote com.google.android.vending.licensing.ILicensingService
  
  # For native methods, see http://proguard.sourceforge.net/manual/examples.html#native
  # 混淆注意事项第二条，保持 native 方法不被混淆
  -keepclasseswithmembernames class * {
      native <methods>;
  }
  
  # Keep setters in Views so that animations can still work.
  # 保留自定义控件(继承自View)不被混淆
  -keepclassmembers public class * extends android.view.View {
      void set*(***);
      *** get*();
  }
  
  # We want to keep methods in Activity that could be used in the XML attribute onClick.
  # 保留在 Activity 中的方法参数是 view 的方法(避免布局文件里面 onClick 被影响)
  -keepclassmembers class * extends android.app.Activity {
      public void *(android.view.View);
  }
  
  # For enumeration classes, see http://proguard.sourceforge.net/manual/examples.html#enumerations
  # 保持枚举 enum 类不被混淆
  -keepclassmembers enum * {
      public static **[] values();
      public static ** valueOf(java.lang.String);
  }
  
  # 保持 Parcelable 序列化的类不被混淆(注：aidl 文件不能去混淆)
  -keepclassmembers class * implements android.os.Parcelable {
      public static final ** CREATOR;
  }
  
  # 保持R(资源)下的所有类及其方法不能被混淆
  -keepclassmembers class **.R$* {
      public static <fields>;
  }
  
  # Preserve annotated Javascript interface methods.
  -keepclassmembers class * {
      @android.webkit.JavascriptInterface <methods>;
  }
  
  # 支持库包含对较新版本版本的引用。
  # 不要警告那些情况下,这个应用程序链接到旧的
  # 平台版本。我们知道他们是安全的。
  -dontnote android.support.**
  -dontnote androidx.**
  -dontwarn android.support.**
  -dontwarn androidx.**
  
  # 此类已弃用,但仍保留向后兼容性。
  -dontwarn android.util.FloatMath
  
  # Support包规则
  # Understand the @Keep support annotation.
  -keep class android.support.annotation.Keep
  -keep class androidx.annotation.Keep
  
  -keep @android.support.annotation.Keep class * {*;}
  -keep @androidx.annotation.Keep class * {*;}
  
  # 保持 support Keep 类成员不被混淆
  -keepclasseswithmembers class * {
      @android.support.annotation.Keep <methods>;
  }
  
  # 保持 androidx Keep 类成员不被混淆
  -keepclasseswithmembers class * {
      @androidx.annotation.Keep <methods>;
  }
  
  # 保持 support Keep 类成员不被混淆
  -keepclasseswithmembers class * {
      @android.support.annotation.Keep <fields>;
  }
  
  # 保持 androidx Keep 类成员不被混淆
  -keepclasseswithmembers class * {
      @androidx.annotation.Keep <fields>;
  }
  
  # 不混淆所有类及其类成员中的使用注解的初始化方法
  -keepclasseswithmembers class * {
      @android.support.annotation.Keep <init>(...);
  }
  
  # 不混淆所有类及其类成员中的使用注解的初始化方法
  -keepclasseswithmembers class * {
      @androidx.annotation.Keep <init>(...);
  }
  
  # 排除 android.jar 和 org.apache.http.legacy.jar 之间重复
  -dontnote org.apache.http.**
  -dontnote android.net.http.**
  
  # 排除 android.jar 和核心-lambda-stubs.jar 之间重复。
  -dontnote java.lang.invoke.**
  
  ```

  以上就是默认配置文件那么这样生成出来的 APK 到底是什么样的勒？下面放上一张图片来看下。

  ![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g424glgpj1j30w90963yq.jpg)

  发现上面的 类 已经变成不易阅读的类了。下面我们就来单独分析下 Proguard 的配置

  

###### 基本指令

- 指定代码的压缩级别(在0~7之间，默认为5)

  ```java
  -optimizationpasses 5
  ```

- 是否使用大小写混合(windows大小写不敏感，建议加入)

  ```java
  -dontusemixedcaseclassnames
  ```

- 是否混淆非公共的库的类

  ```java
  -dontskipnonpubliclibraryclasses
  ```

- 是否混淆非公共的库的类的成员

  ```java
  -dontskipnonpubliclibraryclassmembers
  ```

- 混淆时是否做预校验(Android不需要预校验，去掉可以加快混淆速度)

  ```java
  -dontpreverify
  ```

- 混淆时是否记录日志(混淆后会生成映射文件)

  ```java
  -verbose
  ```

- 指定外部模糊字典

  ```java
  -obfuscationdictionary dictionary_path
  ```

- 指定 class 模糊字典

  ```java
  -classobfuscationdictionary dictionary_path
  ```

- 指定 package 模糊字典

  ```java
  -packageobfuscationdictionary dictionary_path
  ```

- 混淆时所采用的算法(谷歌推荐算法)

  ```java
  -optimizations !code/simplification/arithmetic,!field/,!class/merging/,!code/allocation/variable
  ```

- 添加支持的jar(引入libs下的所有jar包)

  ```java
  -libraryjars libs(*.jar;)
  ```

- 将文件来源重命名为  `SourceFile`”`字符串

  ```java
  -renamesourcefileattribute SourceFile
  ```

- 保持注解不被混淆

  ```java
  -keepattributes Annotation
  -keep class * extends java.lang.annotation.Annotation {*;}
  -keep interface * extends java.lang.annotation.Annotation { *; }
  ```

- 保持泛型不被混淆

  ```java
  -keepattributes Signature-keep class * extends java.lang.annotation.Annotation {*;}
  ```

- 保持反射不被混淆

  ```java
  -keepattributes EnclosingMethod
  ```

- 保持异常不被混淆

  ```java
  -keepattributes Exceptions
  ```

- 保持内部类不被混淆

  ```java
  -keepattributes InnerClasses
  ```

- 抛出异常时保留代码行号

  ```java
  -keepattributes SourceFile,LineNumberTable
  ```

###### keep 命令说明

| 指令                        | 说明                                             |
| --------------------------- | ------------------------------------------------ |
| -keep                       | 保持类和类成员，防止被移除或者被重命名           |
| -keepnames                  | 保持类和类成员，防止被重命名                     |
| -keepclassmembers           | 保持类成员，防止被移除或者被重命名               |
| -keepclassmembernames       | 保持类成员，防止被重命名                         |
| -keepclasseswithmembers     | 保持拥有该成员的类和成员，防止被移除或者被重命名 |
| -keepclasseswithmembernames | 保持拥有该成员的类和成员，防止被重命名           |

- 保持元素不参与混淆的规则的命令格式：

  ```java
  [保持命令] [类] {
      [成员]
  }
  
  具体的类
  访问修饰符（public、protected、private）
  通配符*，匹配任意长度字符，但不含包名分隔符(.)
  通配符**，匹配任意长度字符，并且包含包名分隔符(.)
  extends，即可以指定类的基类
  implement，匹配实现了某接口的类
  $，内部类
  “成员”代表类成员相关的限定条件，它将最终定位到某些符合该限定条件的类成员。它的内容可以使用：
  <init> 匹配所有构造器
  <fields> 匹配所有域
  <methods> 匹配所有方法
  通配符*，匹配任意长度字符，但不含包名分隔符(.)
  通配符**，匹配任意长度字符，并且包含包名分隔符(.)
  通配符***，匹配任意参数类型
  …，匹配任意长度的任意类型参数。比如void test(…)就能匹配任意 void test(String a) 或者是 void test(int a, String b) 这些方法。
  访问修饰符（public、protected、private）
  
  ```

- 不混淆某个类

  ```java
  -keep public class com.example.proxy_core.ProxyApplication { *; }
  ```

-  不混淆某个包所有的类

  ```java
  -keep public class com.example.proxy_core.** { *; }
  ```

- 不混淆某个类的子类

  ```java
  -keep public class * extends class com.example.proxy_core.ProxyApplication { *; }
  ```

- 不混淆所有类名中包含了 `model `的类及其成员

  ```java
  -keep public class **.*model*.** {*;}
  ```

- 不混淆某个接口的实现

  ```java
  -keep class * implements com.example.proxy_core.LoadCallBack { *; }
  ```

- 不混淆某个类的特定的方法

  ```java
  -keepclassmembers class com.example.proxy_core.ProxyApplication {
       public void getVersion(java.lang.String);
  }
  ```

- 不混淆某个类的内部类

  ```java
  -keep class com.example.proxy_core.ProxyApplication$* {
         *;
  }
  ```

###### Proguard 注意事项

- 基本组件不被混淆

  ```java
  -keep public class * extends android.app.Fragment
  -keep public class * extends android.app.Activity
  -keep public class * extends android.app.Application
  -keep public class * extends android.app.Service
  -keep public class * extends android.content.BroadcastReceiver
  -keep public class * extends android.content.ContentProvider
  -keep public class * extends android.app.backup.BackupAgentHelper
  -keep public class * extends android.preference.Preference
  
  ```

- 保持 Google 原生服务需要的类不被混淆

  ```java
  -keep public class com.google.vending.licensing.ILicensingService
  -keep public class com.android.vending.licensing.ILicensingService
  
  ```

- Support 包规则

  ```java
  -dontwarn android.support.**
  -keep public class * extends android.support.v4.**
  -keep public class * extends android.support.v7.**
  -keep public class * extends android.support.annotation.**
  
  ```

- 保持 native 方法不被混淆

  ```java
  -keepclasseswithmembernames class * {
      native <methods>;
  }
  ```

- 保留自定义控件 ( 继承自 View ) 不被混淆

  ```java
  -keep public class * extends android.view.View {
       *** get*();
       void set*(***);
       public <init>(android.content.Context);
       public <init>(android.content.Context, android.util.AttributeSet);
       public <init>(android.content.Context, android.util.AttributeSet, int);
      }
  ```

- 保留指定格式的构造方法不被混淆

  ```java
  -keepclasseswithmembers class * {
      public <init>(android.content.Context, android.util.AttributeSet);
      public <init>(android.content.Context, android.util.AttributeSet, int);
      }
  
  ```

- 保留在 Activity 中的方法参数是 view 的方法(避免布局文件里面 onClick 被影响)

  ```java
  -keepclassmembers class * extends android.app.Activity {
      public void *(android.view.View);
  }
  ```

- 保持枚举 enum 类不被混淆

  ```java
  -keepclassmembers enum * {
      public static **[] values();
      public static ** valueOf(java.lang.String);
  }
  ```

- 保持 R (资源)下的所有类及其方法不能被混淆

  ```java
  -keep class **.R$* { *; }
  ```

- 保持 Parcelable 序列化的类不被混淆(注：aidl 文件不能去混淆)

  ```java
  -keep class * implements android.os.Parcelable {
       public static final android.os.Parcelable$Creator *;
  }
  ```

- 需要序列化和反序列化的类不能被混淆(注：Java 反射用到的类也不能被混淆)

  ```java
  -keepnames class * implements java.io.Serializable
  ```

- 保持 Serializable 序列化的类成员不被混淆

  ```java
  -keepclassmembers class * implements java.io.Serializable {
      static final long serialVersionUID;
      private static final java.io.ObjectStreamField[] serialPersistentFields;
      !static !transient <fields>;
      !private <fields>;
      !private <methods>;
      private void writeObject(java.io.ObjectOutputStream);
      private void readObject(java.io.ObjectInputStream);
      java.lang.Object writeReplace();
      java.lang.Object readResolve();
  }
  
  ```

- 保持 Adapter 类不被混淆

  ```java
  -keep public class * extends android.widget.BaseAdapter { *; }
  ```

- 保持 CusorAdapter 类不被混淆

  ```java
  -keep public class * extends android.widget.CusorAdapter{ *; }
  ```

###### 编写基础通用版本混淆规则

```java
# This is a configuration file for ProGuard.
# http://proguard.sourceforge.net/index.html#manual/usage.html
#
# Starting with version 2.2 of the Android plugin for Gradle, this file is distributed together with
# the plugin and unpacked at build-time. The files in $ANDROID_HOME are no longer maintained and
# will be ignored by new version of the Android plugin for Gradle.

# Optimizations can be turned on and off in the 'postProcessing' DSL block.
# The configuration below is applied if optimizations are enabled.
# Adding optimization introduces certain risks, since for example not all optimizations performed by
# ProGuard works on all versions of Dalvik.  The following flags turn off various optimizations
# known to have issues, but the list may not be complete or up to date. (The "arithmetic"
# optimization can be used if you are only targeting Android 2.0 or later.)  Make sure you test
# thoroughly if you go this route.
# --------------------------------------------基本指令区-------------------------------------------# 指定代码的压缩级别(在0~7之间，默认为5)
-optimizationpasses 5
# 是否使用大小写混合(windows大小写不敏感，建议加入)
-dontusemixedcaseclassnames
 # 是否混淆非公共的库的类
-dontskipnonpubliclibraryclasses
# 是否混淆非公共的库的类的成员
-dontskipnonpubliclibraryclassmembers
# 混淆时是否做预校验(Android不需要预校验，去掉可以加快混淆速度)
-dontpreverify
# 混淆时是否记录日志(混淆后会生成映射文件)
-verbose

###################################### 如果有就添加 ############################################
#指定外部模糊字典
-obfuscationdictionary dictionary1.txt
#指定class模糊字典
-classobfuscationdictionary dictionary1.txt
#指定package模糊字典
-packageobfuscationdictionary dictionary2.txt
#########################################################################################

# 混淆时所采用的算法(谷歌推荐算法)
-optimizations !code/simplification/arithmetic,!field/*,!class/merging/*,!code/allocation/variable

# 添加支持的jar(引入libs下的所有jar包)
-libraryjars libs(*.jar;)

# 将文件来源重命名为“SourceFile”字符串
-renamesourcefileattribute SourceFile

# 保持注解不被混淆
-keepattributes *Annotation*
-keep class * extends java.lang.annotation.Annotation {*;}

# 保持泛型不被混淆
-keepattributes Signature
# 保持反射不被混淆
-keepattributes EnclosingMethod
# 保持异常不被混淆
-keepattributes Exceptions
# 保持内部类不被混淆
-keepattributes Exceptions,InnerClasses
# 抛出异常时保留代码行号
-keepattributes SourceFile,LineNumberTable

# --------------------------------------------默认保留区--------------------------------------------#
# 保持基本组件不被混淆
-keep public class * extends android.app.Fragment
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider
-keep public class * extends android.app.backup.BackupAgentHelper
-keep public class * extends android.preference.Preference

# 保持 Google 原生服务需要的类不被混淆
-keep public class com.google.vending.licensing.ILicensingService
-keep public class com.android.vending.licensing.ILicensingService

# Support包规则
-dontwarn android.support.**
-keep public class * extends android.support.v4.**
-keep public class * extends android.support.v7.**
-keep public class * extends android.support.annotation.**

# 保持 native 方法不被混淆
-keepclasseswithmembernames class * {
    native <methods>;
}

# 保留自定义控件(继承自View)不被混淆
-keep public class * extends android.view.View {
    *** get*();
    void set*(***);
    public <init>(android.content.Context);
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# 保留指定格式的构造方法不被混淆
-keepclasseswithmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# 保留在Activity中的方法参数是view的方法(避免布局文件里面onClick被影响)
-keepclassmembers class * extends android.app.Activity {
    public void *(android.view.View);
}

# 保持枚举 enum 类不被混淆
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# 保持R(资源)下的所有类及其方法不能被混淆
-keep class **.R$* { *; }

# 保持 Parcelable 序列化的类不被混淆(注：aidl文件不能去混淆)
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# 需要序列化和反序列化的类不能被混淆(注：Java反射用到的类也不能被混淆)
-keepnames class * implements java.io.Serializable

# 保持 Serializable 序列化的类成员不被混淆
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    !private <fields>;
    !private <methods>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# 保持 BaseAdapter 类不被混淆
-keep public class * extends android.widget.BaseAdapter { *; }
# 保持 CusorAdapter 类不被混淆
-keep public class * extends android.widget.CusorAdapter{ *; }

# --------------------------------------------webView区--------------------------------------------#
# WebView处理，项目中没有使用到webView忽略即可
# 保持Android与JavaScript进行交互的类不被混淆
-keep class **.AndroidJavaScript { *; }
-keepclassmembers class * extends android.webkit.WebViewClient {
     public void *(android.webkit.WebView,java.lang.String,android.graphics.Bitmap);
     public boolean *(android.webkit.WebView,java.lang.String);
}
-keepclassmembers class * extends android.webkit.WebChromeClient {
     public void *(android.webkit.WebView,java.lang.String);
}

# 网络请求相关
-keep public class android.net.http.SslError

# --------------------------------------------删除代码区--------------------------------------------#
# 删除代码中Log相关的代码
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}
```



###### 第三方需要的混淆规则

```java

################alipay###############

-keep class com.alipay.android.app.IAlixPay{*;}
-keep class com.alipay.android.app.IAlixPay$Stub{*;}
-keep class com.alipay.android.app.IRemoteServiceCallback{*;}
-keep class com.alipay.android.app.IRemoteServiceCallback$Stub{*;}
-keep class com.alipay.sdk.app.PayTask{ public *;}
-keep class com.alipay.sdk.app.AuthTask{ public *;}

################retrofit###############
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }
-keepattributes Signature
-keepattributes Exceptions

################butterknife###############
-keep class butterknife.** { *; }
-dontwarn butterknife.internal.**
-keep class **$$ViewBinder { *; }
-keepclasseswithmembernames class * {
   @butterknife.* <fields>;
}
-keepclasseswithmembernames class * {
 @butterknife.* <methods>;
}


################gson###############
-keepattributes Signature
-keepattributes *Annotation*
-keep class sun.misc.Unsafe { *; }
-keep class com.google.gson.stream.** { *; }
# Application classes that will be serialized/deserialized over Gson
-keep class com.sunloto.shandong.bean.** { *; }


################glide###############
-keep public class * implements com.bumptech.glide.module.AppGlideModule
-keep public class * implements com.bumptech.glide.module.LibraryGlideModule
-keep class com.bumptech.glide.** { *; }
-keep public enum com.bumptech.glide.load.resource.bitmap.ImageHeaderParser$** {
    **[] $VALUES;
    public *;
}

################okhttp###############
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.squareup.okhttp.** { *; }
-keep interface com.squareup.okhttp.** { *; }
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn com.squareup.okhttp.**


################androidEventBus###############
-keep class org.simple.** { *; }
-keep interface org.simple.** { *; }
-keepclassmembers class * {
    @org.simple.eventbus.Subscriber <methods>;
}
-keepattributes *Annotation*


################EventBus###############
-keepclassmembers class * {
    @org.greenrobot.eventbus.Subscribe <methods>;
}
-keep class org.greenrobot.eventbus.EventBus { *; }
-keep enum org.greenrobot.eventbus.ThreadMode { *; }

-keepclassmembers class * extends org.greenrobot.eventbus.util.ThrowableFailureEvent {
    <init>(java.lang.Throwable);
}

################autolayout###############
-keep class com.zhy.autolayout.** { *; }
-keep interface com.zhy.autolayout.** { *; }


################RxJava and RxAndroid###############
-dontwarn org.mockito.**
-dontwarn org.junit.**
-dontwarn org.robolectric.**

-keep class io.reactivex.** { *; }
-keep interface io.reactivex.** { *; }

-keepattributes Signature
-keepattributes *Annotation*
-keep class com.squareup.okhttp.** { *; }
-dontwarn okio.**
-keep interface com.squareup.okhttp.** { *; }
-dontwarn com.squareup.okhttp.**

-dontwarn io.reactivex.**
-dontwarn retrofit.**
-keep class retrofit.** { *; }
-keepclasseswithmembers class * {
    @retrofit.http.* <methods>;
}

-keep class sun.misc.Unsafe { *; }

-dontwarn java.lang.invoke.*

-keep class io.reactivex.schedulers.Schedulers {
    public static <methods>;
}
-keep class io.reactivex.schedulers.ImmediateScheduler {
    public <methods>;
}
-keep class io.reactivex.schedulers.TestScheduler {
    public <methods>;
}
-keep class io.reactivex.schedulers.Schedulers {
    public static ** test();
}
-keepclassmembers class io.reactivex.internal.util.unsafe.*ArrayQueue*Field* {
    long producerIndex;
    long consumerIndex;
}
-keepclassmembers class io.reactivex.internal.util.unsafe.BaseLinkedQueueProducerNodeRef {
    long producerNode;
    long consumerNode;
}

-keepclassmembers class io.reactivex.internal.util.unsafe.BaseLinkedQueueProducerNodeRef {
    io.reactivex.internal.util.atomic.LinkedQueueNode producerNode;
}
-keepclassmembers class io.reactivex.internal.util.unsafe.BaseLinkedQueueConsumerNodeRef {
    io.reactivex.internal.util.atomic.LinkedQueueNode consumerNode;
}

-dontwarn io.reactivex.internal.util.unsafe.**



################espresso###############
-keep class android.support.test.espresso.** { *; }
-keep interface android.support.test.espresso.** { *; }



################annotation###############
-keep class android.support.annotation.** { *; }
-keep interface android.support.annotation.** { *; }


################RxLifeCycle#################
-keep class com.trello.rxlifecycle2.** { *; }
-keep interface com.trello.rxlifecycle2.** { *; }


################RxPermissions#################
-keep class com.tbruyelle.rxpermissions2.** { *; }
-keep interface com.tbruyelle.rxpermissions2.** { *; }

################RxCache#################
-dontwarn io.rx_cache2.internal.**
-keep class io.rx_cache2.internal.Record { *; }
-keep class io.rx_cache2.Source { *; }

-keep class io.victoralbertos.jolyglot.** { *; }
-keep interface io.victoralbertos.jolyglot.** { *; }

################RxErrorHandler#################
 -keep class me.jessyan.rxerrorhandler.** { *; }
 -keep interface me.jessyan.rxerrorhandler.** { *; }

################Timber#################
-dontwarn org.jetbrains.annotations.**


################Canary#################
-dontwarn com.squareup.haha.guava.**
-dontwarn com.squareup.haha.perflib.**
-dontwarn com.squareup.haha.trove.**
-dontwarn com.squareup.leakcanary.**
-keep class com.squareup.haha.** { *; }
-keep class com.squareup.leakcanary.** { *; }

# Marshmallow removed Notification.setLatestEventInfo()
-dontwarn android.app.Notification

```

###### 混淆后的代码错误栈恢复方法

1. 把 outputs/mapping/debug/mapping.txt 文件保存 (保存了混淆前后的对应关系)。
2. 使用工具 sdk/tools/groguard/bin/retrace.bat
   先配置  -keepattributes SourceFile,LineNumberTable
   再执行  retrace.bat  -verbose mappint 文件  bug 文件

#### 资源压缩

资源压缩只与代码压缩协同工作。代码压缩器移除所有未使用的代码后，资源压缩器便可确定应用仍然使用的资源。这在您添加包含资源的代码库时体现得尤为明显 - 您必须移除未使用的库代码，使库资源变为未引用资源，才能通过资源压缩器将它们移除

要启用资源压缩，请在 `build.gradle` 文件中将 `shrinkResources` 属性设置为 `true`（在用于代码压缩的 `minifyEnabled` 旁边）。例如：

```java
android {
    ...
    buildTypes {
        release {
            shrinkResources true
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'),
                    'proguard-rules.pro'
        }
    }
}
```

如果您尚未使用代码压缩用途的 `minifyEnabled` 构建应用，请先尝试使用它，然后再启用 `shrinkResources`，因为您可能需要编辑 `proguard-rules.pro` 文件以保留动态创建或调用的类或方法，然后再开始移除资源。

##### 移除未使用的备用资源

- 移除仅支持中文和英语

  ```java
  android {
      defaultConfig {
          ...
          resConfigs "zh","en"
      }
  }
  ```

- 合并重复资源

  默认情况下，Gradle 还会合并同名资源，例如可能位于不同资源文件夹中的同名可绘制对象。这一行为不受 `shrinkResources` 属性控制，也无法停用，因为在有多个资源匹配代码查询的名称时，有必要利用这一行为来避免错误。

  只有在两个或更多个文件具有完全相同的资源名称、类型和限定符时，才会进行资源合并。Gradle 会在重复项中选择其视为最佳选择的文件（根据下述优先顺序），并只将这一个资源传递给 AAPT，以供在 APK 文件中分发。

  Gradle 会在下列位置寻找重复资源：

  - 与主源集关联的主资源，一般位于 `src/main/res/` 中。
  - 变体叠加，来自构建类型和构建风味。
  - 库项目依赖项。

  Gradle 会按以下级联优先顺序合并重复资源：

  依赖项 → 主资源 → 构建风味 → 构建类型

  例如，如果某个重复资源同时出现在主资源和构建风味中，Gradle 会选择构建风味中的重复资源。

  如果完全相同的资源出现在同一源集中，Gradle 无法合并它们，并且会发出资源合并错误。如果您在 `build.gradle` 文件的 `sourceSet` 属性中定义了多个源集，则可能会发生这种情况，例如，如果 `src/main/res/` 和 `src/main/res2/` 包含完全相同的资源，就可能会发生这种情况。

- 排查资源压缩问题

  当您压缩资源时，Gradle Console 会显示它从应用软件包中移除的资源的摘要。例如：

  ```java
  :android:shrinkDebugResources Removed unused resources: Binary resource data reduced from 2570KB to 1711KB: Removed 33% :android:validateDebugSigning
  ```

  Gradle 还会在 `<module-name>/build/outputs/mapping/release/`（ProGuard 输出文件所在的文件夹）中创建一个名为 `resources.txt 的诊断文件。该文件包括诸如哪些资源引用了其他资源以及使用或移除了哪些资源等详情。`

### 感谢:

[压缩代码和资源](<https://developer.android.com/studio/build/shrink-code.html?hl=zh-cn>)





