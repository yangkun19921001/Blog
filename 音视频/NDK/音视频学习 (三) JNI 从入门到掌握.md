![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200109003933.png)

## 前言

音视频系列文章已经发布 2 篇了，C/C++ 基础咱们也已经学完了，那么该篇文章开始就真正进入 NDK 学习了，在进入 NDK 学习之前我们还要学习 JNI 基础。为了保证该系列文章输出，以后尽量一周一篇。

## 介绍

JNI 是 Java 程序设计语言功能功能最强的特征，它允许 Java 类的某些方法原生实现，同时让它们能够像普通 Java 方法一样被调用和使用。这些原生方法也可以使用 Java 对象，使用方法与 Java 代码调用 Java 对象的方法相同。原生方法可以创建新的 Java 对象或者使用 Java 应用程序创建的对象，这些 Java 应用程序可以检查、修改和调用这些对象的方法以执行任务。

## 环境配置

安装 AS + NDK + CMake + LLDB

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200107194733.png)

- AS: Android 开发工具。
- NDK：这套工具集允许为 Android 使用 C 和 C++ 代码。
- CMake：一款外部构建工具，可与 Gradle 搭配使用来构建原生库。如果只计划使用 ndk-build，则不需要此组件。
- LLDB：debug 调式。

**local.properties 配置:**

```properties
ndk.dir=/Users/devyk/Data/Android/SDK/ndk-bundle
sdk.dir=/Users/devyk/Data/Android/SDK
```

**build.gradle 配置:**

```java
android {
...
    externalNativeBuild {
        cmake {
            path "src/main/cpp/CMakeLists.txt"
            version "3.10.2"
        }
    }
}
```

## 简单示例

1. 创建 native c++ 工程

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200107202203.png)

   根据提示点击 next

2. 基本代码生成

   ```java
   
   public class MainActivity extends AppCompatActivity {
   
       /**
        * 1. 加载 native 库
        */
       static {
           System.loadLibrary("native-lib");
       }
   
       @Override
       protected void onCreate(Bundle savedInstanceState) {
           super.onCreate(savedInstanceState);
           setContentView(R.layout.activity_main);
   
           TextView tv = findViewById(R.id.sample_text);
           /**3.调用 native c++ 函数*/
           tv.setText(stringFromJNI());
       }
   
       /**
        * 2. 定义 native 函数
        */
       public native String stringFromJNI();
   }
   ```

   Native-lib.cpp 代码：

   ```c++
   #include <jni.h>
   #include <string>
   
   extern "C" JNIEXPORT jstring JNICALL
   Java_com_devyk_ndk_1sample_MainActivity_stringFromJNI(
           JNIEnv* env,
           jobject /* this */) {
       std::string hello = "Hello from C++";
       return env->NewStringUTF(hello.c_str());
   }
   ```

   运行之后屏幕就会出现  "Hello from C++" 字符串，一个最简单的 native 项目就创建完成了。

## JNI 入门学习

### 1. 数据类型和类型描述符

Java 中有两种数据类型:

- 基本数据类型: boolean 、char、byte、int、short、long、float、double。
- 引用数据类型: String、Object[]、Class、Object 及其它类。

**1.1 基本数据类型**

基本数据类型可以直接与 C/C++ 的相应基本数据类型映射，如下表所示。JNI 用类型定义使得这种映射对开发人员透明。

| Java 类型 | JNI 类型 | C/C++ 类型      | size 位 |
| --------- | -------- | --------------- | ------- |
| boolean   | jboolean | unsigned char   | 8       |
| byte      | jbyte    | char            | 8       |
| char      | jchar    | unsingned short | 16      |
| short     | jshort   | short           | 16      |
| int       | jint     | int             | 32      |
| long      | jlong    | long            | 64      |
| float     | jfloat   | float           | 32      |
| double    | jdouble  | double          | 64      |

**1.2 引用类型:**

与基本数据类型不同，引用类型对原生方法时不透明的，引用类型映射如下表所示。它们的内部数据结构并不直接向原生代码公开。

| Java 类型           | 原生类型      |
| ------------------- | ------------- |
| Java.lang.Class     | jclass        |
| Java.lang.Throwable | jthrowable    |
| Java.lang.String    | jstring       |
| Other objects       | jobjects      |
| Java.lang.Object[]  | jobjectArray  |
| boolean[]           | jbooleanArray |
| byte[]              | jbyteArray    |
| char[]              | jcharArray    |
| short[]             | jshortArray   |
| int[]               | jintArray     |
| long[]              | jlongArray    |
| float[]             | jfloatArray   |
| double[]            | jdoubleArray  |
| Other arrays        | jarray        |

**1.3 数据类型描述符**

在 JVM 虚拟机中，存储数据类型的名称时，是使用指定的描述符来存储，而不是我们习惯的 int，float 等。

| Java 类型    | 签名 (描述符)   |
| ------------ | --------------- |
| boolean      | Z               |
| byte         | B               |
| char         | C               |
| short        | S               |
| int          | I               |
| long         | J               |
| float        | F               |
| double       | D               |
| void         | V               |
| 其它引用类型 | L + 全类名 + ； |
| type[]       | [               |
| method type  | (参数)返回值    |

示例:

> - 表示一个 String
>
>   Java 类型 :  java.lang.String
>
>   JNI 描述符: Ljava/lang/String;  (L + 类全名 + ；)
>
>   
>
> - 表示一个数组
>
>   Java 类型: String[]
>   JNI 描述符:  [Ljava/lang/String;
>   Java 类型: int [] []
>   JNI 描述符: [[I
>
>   
>
> - 表示一个方法
>
>   Java 方法: long func(int n, String s, int[] arr);
>   JNI 描述符: (ILjava/lang/String;[I)J
>
>   Java 方法: void func();
>   JNI 描述符: ()V

也可以使用命令 : **javap -s 全路径** 来获取方法签名

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200108204504.png)

### 2. JNIEnv 和 JavaVm 介绍

**2.1 JNIEnv :**

JNIEnv 表示 Java 调用 native 语言的环境，是一个封装了几乎全部 JNI 方法的指针。

JNIEnv 只在创建它的线程生效，不能跨线程传递，不同线程的 JNIEnv 彼此独立。

native 环境中创建的线程，如果需要访问 JNI，必须要调用 AttachCurrentThread 关联，并使用 DetachCurrentThread 解除链接。

**2.2 JavaVm :**

JavaVM 是虚拟机在 JNI 层的代表，**一个进程只有一个 JavaVM**，所有的线程共用一个 JavaVM。

**2.3 代码风格 (C/C++)**

```
C: (*env)->NewStringUTF(env, “Hellow World!”);

C++: env->NewStringUTF(“Hellow World!”);
```

### 3. JNI API 

参考[官方 API 文档](https://docs.oracle.com/javase/10/docs/specs/jni/index.html) 或者 [JNI 方法大全及使用示例](https://blog.csdn.net/afei__/article/details/81016413)

### 4. 对数据类型的操作

**JNI 处理 Java 传递过来的数据**

1. 定义 native 函数

   ```java
   public class MainActivity extends AppCompatActivity {
   
       /**
        * 1. 加载 native 库
        */
       static {
           System.loadLibrary("native-lib");
       }
   
       @Override
       protected void onCreate(Bundle savedInstanceState) {
           super.onCreate(savedInstanceState);
           setContentView(R.layout.activity_main);
   
           /** 1. Java 数据传递给 native */
           test1(true,
                   (byte) 1,
                   ',',
                   (short) 3,
                   4,
                   3.3f,
                   2.2d,
                   "DevYK",
                   28,
                   new int[]{1, 2, 3, 4, 5, 6, 7},
                   new String[]{"1", "2", "4"},
                   new Person("阳坤"),
                   new boolean[]{false, true}
                   );
       }
   
       /**
        * Java 将数据传递到 native 中
        */
       public native void test1(
               boolean b,
               byte b1,
               char c,
               short s,
               long l,
               float f,
               double d,
               String name,
               int age,
               int[] i,
               String[] strs,
               Person person,
               boolean[] bArray
       );
   }
   ```

2. jni 处理 Java 传递过来的数据

   ```c++
   #include <jni.h>
   #include <string>
   #include <android/log.h>
   
   #include <iostream>
   
   #define TAG "native-lib"
   // __VA_ARGS__ 代表 ...的可变参数
   #define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, TAG,  __VA_ARGS__);
   #define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, TAG,  __VA_ARGS__);
   #define LOGI(...) __android_log_print(ANDROID_LOG_INFO, TAG,  __VA_ARGS__);
   
   
   
   extern "C"//支持 C 语言代码
   JNIEXPORT void JNICALL
   Java_com_devyk_ndk_1sample_MainActivity_test1(JNIEnv *env, jobject instance,
                                                 jboolean jboolean1,
                                                 jbyte jbyte1,
                                                 jchar jchar1,
                                                 jshort jshort1,
                                                 jlong jlong1,
                                                 jfloat jfloat1,
                                                 jdouble jdouble1,
                                                 jstring name_,
                                                 jint age,
                                                 jintArray i_,
                                                 jobjectArray strs,
                                                 jobject person,
                                                 jbooleanArray bArray_
                                                ) {
   
   
       //1. 接收 Java 传递过来的 boolean 值
       unsigned char b_boolean = jboolean1;
       LOGD("boolean-> %d", b_boolean);
   
       //2. 接收 Java 传递过来的 boolean 值
       char c_byte = jbyte1;
       LOGD("jbyte-> %d", c_byte);
   
   
       //3. 接收 Java 传递过来的 char 值
       unsigned short c_char = jchar1;
       LOGD("char-> %d", c_char);
   
   
       //4. 接收 Java 传递过来的 short 值
       short s_short = jshort1;
       LOGD("short-> %d", s_short);
   
       //5. 接收 Java 传递过来的 long 值
       long l_long = jlong1;
       LOGD("long-> %d", l_long);
   
       //6. 接收 Java 传递过来的 float 值
       float f_float = jfloat1;
       LOGD("float-> %f", f_float);
   
       //7. 接收 Java 传递过来的 double 值
       double d_double = jdouble1;
       LOGD("double-> %f", d_double);
   
       //8. 接收 Java 传递过来的 String 值
       const char *name_string = env->GetStringUTFChars(name_, 0);
       LOGD("string-> %s", name_string);
   
       //9. 接收 Java 传递过来的 int 值
       int age_java = age;
       LOGD("int:%d", age_java);
   
       //10. 打印 Java 传递过来的 int []
       jint *intArray = env->GetIntArrayElements(i_, NULL);
       //拿到数组长度
       jsize intArraySize = env->GetArrayLength(i_);
       for (int i = 0; i < intArraySize; ++i) {
           LOGD("intArray->%d：", intArray[i]);
       }
       //释放数组
       env->ReleaseIntArrayElements(i_, intArray, 0);
   
       //11. 打印 Java 传递过来的 String[]
       jsize stringArrayLength = env->GetArrayLength(strs);
       for (int i = 0; i < stringArrayLength; ++i) {
           jobject jobject1 = env->GetObjectArrayElement(strs, i);
           //强转 JNI String
           jstring stringArrayData = static_cast<jstring >(jobject1);
   
           //转 C  String
           const char *itemStr = env->GetStringUTFChars(stringArrayData, NULL);
           LOGD("String[%d]: %s", i, itemStr);
           //回收 String[]
           env->ReleaseStringUTFChars(stringArrayData, itemStr);
       }
   
   
   
       //12. 打印 Java 传递过来的 Object 对象
       //12.1 获取字节码
       const char *person_class_str = "com/devyk/ndk_sample/Person";
       //12.2 转 jni jclass
       jclass person_class = env->FindClass(person_class_str);
       //12.3 拿到方法签名 javap -a
       const char *sig = "()Ljava/lang/String;";
       jmethodID jmethodID1 = env->GetMethodID(person_class, "getName", sig);
   
       jobject obj_string = env->CallObjectMethod(person, jmethodID1);
       jstring perStr = static_cast<jstring >(obj_string);
       const char *itemStr2 = env->GetStringUTFChars(perStr, NULL);
       LOGD("Person: %s", itemStr2);
       env->DeleteLocalRef(person_class); // 回收
       env->DeleteLocalRef(person); // 回收
   
   
       //13. 打印 Java 传递过来的 booleanArray
       jsize booArrayLength = env->GetArrayLength(bArray_);
       jboolean *bArray = env->GetBooleanArrayElements(bArray_, NULL);
       for (int i = 0; i < booArrayLength; ++i) {
           bool b =  bArray[i];
           jboolean b2 =  bArray[i];
           LOGD("boolean:%d",b)
           LOGD("jboolean:%d",b2)
       }
       //回收
       env->ReleaseBooleanArrayElements(bArray_, bArray, 0);
   
   }
   ```

   输出:
   
   ```
      > **输出:**
      >
      > native-lib: boolean-> 1
      > native-lib: jbyte-> 1
      > native-lib: char-> 44
      > native-lib: short-> 3
      > native-lib: long-> 4
      > native-lib: float-> 3.300000
      > native-lib: double-> 2.200000
      > native-lib: string-> DevYK
      > native-lib: int:28
      > native-lib: intArray->1：
      > native-lib: intArray->2：
      > native-lib: intArray->3：
      > native-lib: intArray->4：
      > native-lib: intArray->5：
      > native-lib: intArray->6：
      > native-lib: intArray->7：
      > native-lib: String[0]: 1
      > native-lib: String[1]: 2
      > native-lib: String[2]: 4
      > native-lib: Person: 阳坤
      > native-lib: boolean:0
      > native-lib: jboolean:0
      > native-lib: boolean:1
      > native-lib: jboolean:1
   ```
   
   

​		

**JNI 处理 Java 对象**

1. 定义一个 Java 对象

   ```java
   public class Person {
     private String name;
     private int age;
   
   
       public int getAge() {
           return age;
       }
   
       public void setAge(int age) {
           this.age = age;
       }
   
       public Person(String name, int age) {
           this.name = name;
           this.age = age;
       }
   
       public void setName(String name){
           this.name = name;
       }
   
       public String getName(){
           return name;
       }
   
       @Override
       public String toString() {
           return "Person{" +
                   "name='" + name + '\'' +
                   ", age=" + age +
                   '}';
       }
   }
   ```

2. 定义 native 接口

   ```c++
   public class MainActivity extends AppCompatActivity {
   
       private String TAG = this.getClass().getSimpleName();
   
       /**
        * 1. 加载 native 库
        */
       static {
           System.loadLibrary("native-lib");
       }
   
       @Override
       protected void onCreate(Bundle savedInstanceState) {
           super.onCreate(savedInstanceState);
           setContentView(R.layout.activity_main);
           TextView text = findViewById(R.id.sample_text);
           /**处理 Java 对象*/
           String str = getPerson().toString();
           text.setText(str);
       }
       public native Person getPerson();
   }
   ```

   根据上面代码我们知道，如果获取成功，手机屏幕上肯定会打印会显示数据。

3. JNI 的处理

   ````c++
   extern "C"
   JNIEXPORT jobject JNICALL
   Java_com_devyk_ndk_1sample_MainActivity_getPerson(JNIEnv *env, jobject instance) {
   
       //1. 拿到 Java 类的全路径
       const char *person_java = "com.devyk.ndk_sample.Person";
       const char *method = "<init>"; // Java构造方法的标识
       
       //2. 找到需要处理的 Java 对象 class
       jclass j_person_class = env->FindClass(person_java);
       
       //3. 拿到空参构造方法
       jmethodID person_constructor = env->GetMethodID(j_person_class, method, "()V");
       
       //4. 创建对象
       jobject person_obj = env->NewObject(j_person_class, person_constructor);
   
       //5. 拿到 setName 方法的签名，并拿到对应的 setName 方法
       const char *nameSig = "(Ljava/lang/String;)V";
       jmethodID nameMethodId = env->GetMethodID(j_person_class, "setName", nameSig);
      
      //6. 拿到 setAge 方法的签名，并拿到 setAge 方法
       const char *ageSig = "(I)V";
       jmethodID ageMethodId = env->GetMethodID(j_person_class, "setAge", ageSig);
   
       //7. 正在调用 Java 对象函数
       const char *name = "DevYK";
       jstring newStringName = env->NewStringUTF(name);
       env->CallVoidMethod(person_obj, nameMethodId, newStringName);
       env->CallVoidMethod(person_obj, ageMethodId, 28);
   
       const char *sig = "()Ljava/lang/String;";
       jmethodID jtoString = env->GetMethodID(j_person_class, "toString", sig);
       jobject obj_string = env->CallObjectMethod(person_obj, jtoString);
       jstring perStr = static_cast<jstring >(obj_string);
       const char *itemStr2 = env->GetStringUTFChars(perStr, NULL);
       LOGD("Person: %s", itemStr2);
       return person_obj;
   }
   ````

   输出:

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200108154952.gif)

   可以看到 native 返回数据给 Java 了。

### 5. JNI 动态注册

前面咱们学习的都是静态注册，静态注册虽然简单方便，但是也面临一个较大的问题，如果当前类定义的 native 方法名称改变或者包名改变，那么这一改也就面临在 cpp 中实现的也将改动，如果将要面临这种情况你可以试试 JNI 动态注册，如下代码所示:

```java
public class MainActivity extends AppCompatActivity {

    private String TAG = this.getClass().getSimpleName();

    /**
     * 1. 加载 native 库
     */
    static {
        System.loadLibrary("native-lib");
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        TextView text = findViewById(R.id.sample_text);

        /**动态注册的 native */
        dynamicRegister("我是动态注册的");
    }




    /**
     * 动态注册
     */
    public native void dynamicRegister(String name);
}
```

cpp：

```c++
#include <jni.h>
#include <string>
#include <android/log.h>

#include <iostream>

#define TAG "native-lib"
// __VA_ARGS__ 代表 ...的可变参数
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, TAG,  __VA_ARGS__);
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, TAG,  __VA_ARGS__);
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, TAG,  __VA_ARGS__);


/**
 * TODO 动态注册
*/

/**
 * 对应java类的全路径名，.用/代替
 */
const char *classPathName = "com/devyk/ndk_sample/MainActivity";

extern "C"  //支持 C 语言
JNIEXPORT void JNICALL //告诉虚拟机，这是jni函数
native_dynamicRegister(JNIEnv *env, jobject instance, jstring name) {
    const char *j_name = env->GetStringUTFChars(name, NULL);
    LOGD("动态注册: %s", j_name)
    //释放
    env->ReleaseStringUTFChars(name, j_name);
}


/* 源码结构体
 * typedef struct {
    const char* name;
    const char* signature;
    void*       fnPtr;
    } JNINativeMethod;
 */
static const JNINativeMethod jniNativeMethod[] = {
        {"dynamicRegister", "(Ljava/lang/String;)V", (void *) (native_dynamicRegister)}
};


/**
 * 该函数定义在jni.h头文件中，System.loadLibrary()时会调用JNI_OnLoad()函数
 */
JNIEXPORT jint JNICALL
JNI_OnLoad(JavaVM *javaVm, void *pVoid) {
    //通过虚拟机 创建爱你全新的 evn
    JNIEnv *jniEnv = nullptr;
    jint result = javaVm->GetEnv(reinterpret_cast<void **>(&jniEnv), JNI_VERSION_1_6);
    if (result != JNI_OK) {
        return JNI_ERR; // 主动报错
    }
    jclass mainActivityClass = jniEnv->FindClass(classPathName);
    jniEnv->RegisterNatives(mainActivityClass, jniNativeMethod,
                            sizeof(jniNativeMethod) / sizeof(JNINativeMethod));//动态注册的数量

    return JNI_VERSION_1_6;
}
```

> **输出:**
>
> 动态注册: 我是动态注册的

### 6. 异常处理

异常处理是 Java 程序设计语言的重要功能， JNI 中的异常行为与 Java 中的有所不同，在 Java 中，当抛出一个异常时，虚拟机停止执行代码块并进入调用栈反向检查能处理特定类型异常的异常处理程序代码块，这也叫捕获异常。虚拟机清除异常并将控制权交给异常处理程序。相比之下， JNI 要求开发人员在异常发生后显式地实现异常处理流。

**捕获异常:**

JNIEvn 接口提供了一组与异常相关的函数集，在运行过程中可以使用 Java 类查看这些函数，比如代码如下:

```java
    public native void dynamicRegister2(String name);


    /**
     * 测试抛出异常
     *
     * @throws NullPointerException
     */
    private void testException() throws NullPointerException {
        throw new NullPointerException("MainActivity testException NullPointerException");
    }
```

当调用 testException 方法时，dynamicRegister2 该原生方法需要显式的处理异常信息，JNI 提供了 ExceptionOccurred 函数查询虚拟机中是否有挂起的异常。在使用完之后，异常处理程序需要用 ExceptionClear 函数显式的清除异常，如下代码:

```c++
 jthrowable exc = env->ExceptionOccurred(); // 检测是否发生异常
    if (exc) {//如果发生异常
        env->ExceptionDescribe(); // 打印异常信息
        env->ExceptionClear(); // 清除掉发生的异常
    }
```

**抛出异常:**

JNI 也允许原生代码抛出异常。因为异常是 Java 类，应该先用 FindClass 函数找到异常类，用 ThrowNew 函数可以使用化且抛出新的异常，如下代码所示:

```c++
 jthrowable exc = env->ExceptionOccurred(); // 检测是否发生异常
    if (exc) {//如果发生异常
        jclass newExcCls = env->FindClass("java/lang/IllegalArgumentException");
        env->ThrowNew(newExcCls, "JNI 中发生了一个异常信息"); // 返回一个新的异常到 Java
    }
```

因为原生函数的代码执行不受虚拟机的控制，因此抛出异常并不会停止原生函数的执行并把控制权交给异常处理程序。到抛出异常时，原生函数应该释放所有已分配的原生资源，例如内存及合适的返回值等。通过 JNIEvn 接口获得的引用是局部引用且一旦返回原生函数，它们自动地被虚拟机释放。

**示例代码:**

```java

public class MainActivity extends AppCompatActivity {

    private String TAG = this.getClass().getSimpleName();

    /**
     * 1. 加载 native 库
     */
    static {
        System.loadLibrary("native-lib");
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        dynamicRegister2("测试异常处理");
    }


    public native void dynamicRegister2(String name);


    /**
     * 测试抛出异常
     *
     * @throws NullPointerException
     */
    private void testException() throws NullPointerException {
        throw new NullPointerException("MainActivity testException NullPointerException");
    }

}
```

native-lib.cpp 文件

```c++
#include <jni.h>
#include <string>
#include <android/log.h>

#include <iostream>

#define TAG "native-lib"
// __VA_ARGS__ 代表 ...的可变参数
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, TAG,  __VA_ARGS__);
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, TAG,  __VA_ARGS__);
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, TAG,  __VA_ARGS__);


/**
 * TODO 动态注册
*/

....

...

extern "C"  //支持 C 语言
JNIEXPORT void JNICALL //告诉虚拟机，这是jni函数
native_dynamicRegister2(JNIEnv *env, jobject instance, jstring name) {
    const char *j_name = env->GetStringUTFChars(name, NULL);
    LOGD("动态注册: %s", j_name)

    jclass clazz = env->GetObjectClass(instance);//拿到当前类的class
    jmethodID mid =env->GetMethodID(clazz, "testException", "()V");//执行 Java 测试抛出异常的代码
    env->CallVoidMethod(instance, mid); // 执行会抛出一个异常
    jthrowable exc = env->ExceptionOccurred(); // 检测是否发生异常
    if (exc) {//如果发生异常
        env->ExceptionDescribe(); // 打印异常信息
        env->ExceptionClear(); // 清除掉发生的异常
        jclass newExcCls = env->FindClass("java/lang/IllegalArgumentException");
        env->ThrowNew(newExcCls, "JNI 中发生了一个异常信息"); // 返回一个新的异常到 Java
    }

    //释放
    env->ReleaseStringUTFChars(name, j_name);
}

...
```

这里还是使用的动态注册。

最后效果如下:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200108222721.png)

可以看见这里即捕获到了 Java 抛出的异常，也抛出了一个 JNI 新的异常信息。

### 7. 局部与全局引用

引用在 Java 程序设计中扮演非常重要的角色。虚拟机通过追踪类实例的引用并收回不在引用的垃圾来管理类实例的使用期限。因为原生代码不是一个管理环境，因此 JNI 提供了一组函数允许原生代码显式地管理对象引用及使用期间原生代码。 JNI 支持三种引用: 局部引用、全局引用和弱全局引用。下面将介绍这几类引用。

**局部引用:**

大多数 JNI 函数返回局部引用。局部应用不能在后续的调用中被缓存及重用，主要是因为它们的使用期限仅限于原生方法，一旦原生方法返回，局部引用即被释放。例如: FindClass 函数返回一个局部引用，当原生方法返回时，它被自动释放，也可以用 DeleteLocalRef 函数显式的释放原生代码。如下代码所示:

```c++

jclass personClass;
extern "C"  //支持 C 语言
JNIEXPORT void JNICALL //告诉虚拟机，这是jni函数
native_test4(JNIEnv *env, jobject instance) {
    LOGD("测试局部引用")
    if (personClass == NULL) {
        const char *person_class = "com/devyk/ndk_sample/Person";
        personClass = env->FindClass(person_class);
        LOGD("personClass == null 执行了。")
    }
    //Java Person 构造方法实例化
    const char *sig = "()V";
    const char *method = "<init>";//Java 构造方法标识
    jmethodID init = env->GetMethodID(personClass, method, sig);
    //创建出来
    env->NewObject(personClass, init);
}

```

效果:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200108231036.gif)

跟介绍的一样的吧。局部引用不能再后续的调用中重复使用，那么怎么解决这个问题勒，其实只要把局部引用提升为全局引用或者调用 DeleteLocalRef 显式释放就行了。这个我们在全局引用中演示。

**全局引用:**

全局引用在原生方法的后续调用过程中依然有效，除非它们被原生代码显式释放。

1. 创建全局引用

   可以使用 NewGlobalRef 函数将局部引用初始化为全局引用，如下代码所示:

   ```c++
   jclass personClass;
   extern "C"  //支持 C 语言
   JNIEXPORT void JNICALL //告诉虚拟机，这是jni函数
   native_test4(JNIEnv *env, jobject instance) {
       LOGD("测试局部引用")
   
   
       if (personClass == NULL) {
           //1. 提升全局解决不能重复使用问题
    				const char *person_class = "com/devyk/ndk_sample/Person";
           jclass jclass1 = env->FindClass(person_class);
           personClass = static_cast<jclass>(env->NewGlobalRef(jclass1));
           LOGD("personClass == null 执行了。")
       }
   
       //Java Person 构造方法实例化
       const char *sig = "()V";
       const char *method = "<init>";//Java 构造方法标识
       jmethodID init = env->GetMethodID(personClass, method, sig);
       //创建出来
       env->NewObject(personClass, init);
   
       //2. 显式释放主动删除全局引用
       env->DeleteLocalRef(personClass);
       personClass = NULL;
   }
   ```

   ![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200108232508.gif)

2. 删除全局引用

   当原生代码不再需要一个全局引用时，可以随时用 DeleteGlobalRef 函数释放它，如下代码所示:

   ```c++
       env->DeleteLocalRef(personClass);
       personClass = NULL;
   ```

**弱全局引用**

全局引用的另一种类型是弱全局引用。与全局引用一样，弱全局引用在原生方法的后续调用依然有效。与全局引用不同，弱全局引用并不阻止潜在的对象被垃圾收回。

1. 创建弱全局引用

   可以使用 NewWeakGlobalRef 函数对弱全局引用进行初始化，如下所示:

   ```c++
   jclass personClass;
   extern "C"  //支持 C 语言
   JNIEXPORT void JNICALL //告诉虚拟机，这是jni函数
   native_test4(JNIEnv *env, jobject instance) {
       LOGD("测试局部引用")
   
   
       if (personClass == NULL) {
           //1. 提升全局解决不能重复使用问题
           const char *person_class = "com/devyk/ndk_sample/Person";
           jclass jclass1 = env->FindClass(person_class);
   //        personClass = static_cast<jclass>(env->NewGlobalRef(jclass1));
           personClass = static_cast<jclass>(env->NewWeakGlobalRef(jclass1));
           LOGD("personClass == null 执行了。")
       }
   
       //Java Person 构造方法实例化
       const char *sig = "()V";
       const char *method = "<init>";//Java 构造方法标识
       jmethodID init = env->GetMethodID(personClass, method, sig);
       //创建出来
       env->NewObject(personClass, init);
   
       //2. 显式释放主动删除局部引用
   //    env->DeleteLocalRef(personClass);
       env->DeleteWeakGlobalRef(personClass);
       personClass = NULL;
   
   }
   ```

2. 弱全局引用的有效性检验

   可以用 IsSameObject 函数来检验一个弱全局引用是否仍然指向活动的类实例.

3. 删除弱全局引用

   ```c++
    env->DeleteWeakGlobalRef(personClass);
   ```

   全局引用显示释放前一直有效，它们可以被其它原生函数及原生线程使用。

### 8. JNI 线程操作

作为多线程环境的一部分，虚拟机支持运行的原生代码。在开发构件时要记住 JNI 技术的一些约束:

- 只有再原生方法执行期间及正在执行原生方法的线程环境下局部引用是有效的，局部引用不能再多线程间共享，只有全局可以被多个线程共享。
- 被传递给每个原生方法的 JNIEvn 接口指针在与方法调用相关的线程中也是有效的，它不能被其它线程缓存或使用。

**同步:**

同步是多线程程序设计最终的特征。与 Java 同步类似， JNI 的监视器允许原生代码利用 Java 对象同步，虚拟机保证存取监视器的线程能够安全执行，而其他线程等待监视器对象变成可用状态。 

```c++
jint MonitorEnter(jobject obj)
```

对 MonitorEnter 函数的调用应该与对 MonitorExit 的调用相匹配，从而避免代码出现死锁。

例子:

```java
    public void test4(View view) {
        for (int i = 0; i < 10; i++) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    count();
                    nativeCount();
                }
            }).start();
        }
    }

    private void count() {
        synchronized (this) {
            count++;
            Log.d("Java", "count=" + count);
        }
    }

    public native void nativeCount();
```

native 代码:

```c++
extern "C"  //支持 C 语言
JNIEXPORT void JNICALL //告诉虚拟机，这是jni函数
native_count(JNIEnv *env, jobject instance) {

    jclass cls = env->GetObjectClass(instance);
    jfieldID fieldID = env->GetFieldID(cls, "count", "I");

    /*if (env->MonitorEnter(instance) != JNI_OK) {
        LOGE("%s: MonitorEnter() failed", __FUNCTION__);
    }*/

    /* synchronized block */
    int val = env->GetIntField(instance, fieldID);
    val++;
    LOGI("count=%d", val);
    env->SetIntField(instance, fieldID, val);

    /*if (env->ExceptionOccurred()) {
        LOGE("ExceptionOccurred()...");
        if (env->MonitorExit(instance) != JNI_OK) {
            LOGE("%s: MonitorExit() failed", __FUNCTION__);
        };
    }

    if (env->MonitorExit(instance) != JNI_OK) {
        LOGE("%s: MonitorExit() failed", __FUNCTION__);
    };*/

}
```

在 native 中没有进行同步，打印如下:

> **输出:**
>
> 2020-01-09 00:02:29.637 17573-17707/com.devyk.ndk_sample D/Java: 		count=1
> 2020-01-09 00:02:29.637 17573-17707/com.devyk.ndk_sample I/native-lib:  count=2
> 2020-01-09 00:02:29.641 17573-17708/com.devyk.ndk_sample D/Java: 		count=3
> 2020-01-09 00:02:29.641 17573-17708/com.devyk.ndk_sample I/native-lib:  count=4
> 2020-01-09 00:02:29.641 17573-17709/com.devyk.ndk_sample D/Java: 		count=5
> 2020-01-09 00:02:29.641 17573-17709/com.devyk.ndk_sample I/native-lib: count=6
> 2020-01-09 00:02:29.641 17573-17710/com.devyk.ndk_sample D/Java: 		count=7
> 2020-01-09 00:02:29.642 17573-17710/com.devyk.ndk_sample I/native-lib: count=8
> 2020-01-09 00:02:29.643 17573-17711/com.devyk.ndk_sample D/Java: 		count=9
> 2020-01-09 00:02:29.643 17573-17711/com.devyk.ndk_sample I/native-lib: count=10
> 2020-01-09 00:02:29.643 17573-17712/com.devyk.ndk_sample D/Java: 		count=11
> 2020-01-09 00:02:29.643 17573-17712/com.devyk.ndk_sample I/native-lib: count=12
> 2020-01-09 00:02:29.645 17573-17715/com.devyk.ndk_sample D/Java: 		count=13
> 2020-01-09 00:02:29.646 17573-17715/com.devyk.ndk_sample I/native-lib: count=15
> 2020-01-09 00:02:29.646 17573-17714/com.devyk.ndk_sample D/Java: 		count=15
> 2020-01-09 00:02:29.646 17573-17714/com.devyk.ndk_sample I/native-lib: count=16
> 2020-01-09 00:02:29.648 17573-17713/com.devyk.ndk_sample D/Java:		count=17
> 2020-01-09 00:02:29.648 17573-17713/com.devyk.ndk_sample I/native-lib: count=18
> 2020-01-09 00:02:29.648 17573-17716/com.devyk.ndk_sample D/Java: 		count=19
> 2020-01-09 00:02:29.648 17573-17716/com.devyk.ndk_sample I/native-lib: count=20

通过多线程对 count 字段操作，可以看见已经无法保证 count 的可见性了。这就需要 JNI 本地实现也要同步。

我们把注释放开:

打印如下:

> **输出:**
>
> 2020-01-09 00:07:10.579 18225-18385/com.devyk.ndk_sample D/Java: 			count=1
> 2020-01-09 00:07:10.579 18225-18385/com.devyk.ndk_sample I/native-lib: 	count=2
> 2020-01-09 00:07:10.581 18225-18386/com.devyk.ndk_sample D/Java: 			count=3
> 2020-01-09 00:07:10.581 18225-18386/com.devyk.ndk_sample I/native-lib: 	count=4
> 2020-01-09 00:07:10.582 18225-18387/com.devyk.ndk_sample D/Java: 			count=5
> 2020-01-09 00:07:10.582 18225-18387/com.devyk.ndk_sample I/native-lib: 	count=6
> 2020-01-09 00:07:10.584 18225-18388/com.devyk.ndk_sample D/Java: 			count=7
> 2020-01-09 00:07:10.584 18225-18388/com.devyk.ndk_sample I/native-lib: 	count=8
> 2020-01-09 00:07:10.586 18225-18390/com.devyk.ndk_sample D/Java: 			count=9
> 2020-01-09 00:07:10.586 18225-18390/com.devyk.ndk_sample I/native-lib: 	count=10
> 2020-01-09 00:07:10.586 18225-18391/com.devyk.ndk_sample D/Java: 			count=11
> 2020-01-09 00:07:10.586 18225-18391/com.devyk.ndk_sample I/native-lib: 	count=12
> 2020-01-09 00:07:10.586 18225-18393/com.devyk.ndk_sample D/Java: 			count=13
> 2020-01-09 00:07:10.587 18225-18389/com.devyk.ndk_sample D/Java: 			count=14
> 2020-01-09 00:07:10.587 18225-18389/com.devyk.ndk_sample I/native-lib: 	count=15
> 2020-01-09 00:07:10.587 18225-18393/com.devyk.ndk_sample I/native-lib:	 count=16
> 2020-01-09 00:07:10.587 18225-18394/com.devyk.ndk_sample D/Java: 			count=17
> 2020-01-09 00:07:10.588 18225-18394/com.devyk.ndk_sample I/native-lib: 	count=18
> 2020-01-09 00:07:10.588 18225-18392/com.devyk.ndk_sample D/Java: 			count=19
> 2020-01-09 00:07:10.588 18225-18392/com.devyk.ndk_sample I/native-lib: 	count=20

现在保证了count 的可见性了。

**原生线程:**

为了执行特定任务，这些原生构建可以并行使用原生线程。因为虚拟机不知道原生线程，因此它们不能与 Java 构建直接通信。为了与应用的依然活跃部分交互，原生线程应该先附着在虚拟机上。

JNI 通过 JavaVM 接口指针提供了 AttachCurrentThread 函数以便于让原生代码将原生线程附着到虚拟机上，如下代码所示, JavaVM 接口指针应该尽早被缓存，否则的话它不能被获取。

```c++
JavaVM* jvm；
...
JNIEnv* env = NULL；
...
jvm->AttachCurrentThread(&env,0);//把 native 线程附着到 JVM 上
...
jvm->DetachCurrentThread();//解除 附着 到 JVM 的 native 线程
```

对 AttachCurrentThread 函数的调用允许应用程序获得对当前线程有效的 JNIEnv 接口指针。将一个已经附着的原生线程再次附着不会有任何副作用。当原生线程完成时，可以用 DetachCurrentThread 函数将原生线程与虚拟机分离。

例子:

MainActivity.java

```java
    public void test5(View view) {
        testThread();
    }

    // AndroidUI操作，让C++线程里面来调用
    public void updateUI() {
        if (Looper.getMainLooper() == Looper.myLooper()) {
            new AlertDialog.Builder(MainActivity.this)
                    .setTitle("UI")
                    .setMessage("native 运行在主线程，直接更新 UI ...")
                    .setPositiveButton("确认", null)
                    .show();
        } else {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    new AlertDialog.Builder(MainActivity.this)
                            .setTitle("UI")
                            .setMessage("native运行在子线程切换为主线程更新 UI ...")
                            .setPositiveButton("确认", null)
                            .show();
                }
            });
        }
    }
    public native void testThread();
    public native void unThread();

    @Override
    protected void onDestroy() {
        super.onDestroy();
        unThread();
    }
```

native-lib.cpp

```c++
JavaVM * jvm;
jobject instance;
void * customThread(void * pVoid) {
    // 调用的话，一定需要JNIEnv *env
    // JNIEnv *env 无法跨越线程，只有JavaVM才能跨越线程

    JNIEnv * env = NULL; // 全新的env
    int result = jvm->AttachCurrentThread(&env, 0); // 把native的线程，附加到JVM
    if (result != 0) {
        return 0;
    }

    jclass mainActivityClass = env->GetObjectClass(instance);

    // 拿到MainActivity的updateUI
    const char * sig = "()V";
    jmethodID updateUI = env->GetMethodID(mainActivityClass, "updateUI", sig);

    env->CallVoidMethod(instance, updateUI);

    // 解除 附加 到 JVM 的native线程
    jvm->DetachCurrentThread();

    return 0;
}

extern "C"  //支持 C 语言
JNIEXPORT void JNICALL //告诉虚拟机，这是jni函数
native_testThread(JNIEnv *env, jobject thiz) {
    instance = env->NewGlobalRef(thiz); // 全局的，就不会被释放，所以可以在线程里面用
    // 如果是非全局的，函数一结束，就被释放了
    pthread_t pthreadID;
    pthread_create(&pthreadID, 0, customThread, instance);
    pthread_join(pthreadID, 0);

}

extern "C"  //支持 C 语言
JNIEXPORT void JNICALL //告诉虚拟机，这是jni函数
native_unThread(JNIEnv *env, jobject thiz) {

    if (NULL != instance) {
        env->DeleteGlobalRef(instance);
        instance = NULL;
    }

}
```

效果:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200109003303.gif)



## 总结

该篇文件全面介绍了 JNI 技术实现 Java 应用程序与原生代码之间通信的方式，关于更多 JNI 技术可以下载  [JNI 使用手册](https://pan.baidu.com/s/1HudsXKOghlmHEcMMlp1W6g) 。

