## 简介

现在随意在应用市场下载一个 APK 文件然后反编译，95% 以上基本上都是经过混淆，加密，或第三方加固，那么今天我们就对 Dex 来进行加密解密。让反编译无法正常阅读项目源码。

 **加密后的结构**

**APK 分析**

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3n7pgv2gkj31d90gpmyc.jpg)

**反编译效果**

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3n7xea4cqj311c0l00v6.jpg)

## 64 K 问题

想要详细了解 64 k 的问题可以参考[官网](<https://developer.android.google.cn/studio/build/multidex.html#keep>)

随着 Android 平台的持续成长，Android 应用的大小也在增加。当您的应用及其引用的库达到特定大小时，您会遇到构建错误，指明您的应用已达到 Android 应用构建架构的极限。早期版本的构建系统按如下方式报告这一错误：

```java
Conversion to Dalvik format failed:
Unable to execute dex: method ID not in [0, 0xffff]: 65536
```

较新版本的 Android 构建系统虽然显示的错误不同，但指示的是同一问题：

```java
trouble writing output:
Too many field references: 131000; max is 65536.
You may try using --multi-dex option.
```

这些错误状况都会显示下面这个数字：65,536。这个数字很重要，因为它代表的是单个 Dalvik Executable (DEX) 字节码文件内的代码可调用的引用总数。本节介绍如何通过启用被称为 *Dalvik 可执行文件分包*的应用配置来越过这一限制，使您的应用能够构建并读取 Dalvik 可执行文件分包 DEX 文件。

### 关于 64K 引用限制

#### Android 5.0 之前版本的 Dalvik 可执行文件分包支持

Android 5.0（API 级别 21）之前的平台版本使用 Dalvik 运行时来执行应用代码。默认情况下，Dalvik 限制应用的每个 APK 只能使用单个 `classes.dex` 字节码文件。要想绕过这一限制，您可以使用 [Dalvik 可执行文件分包支持库](https://developer.android.com/tools/support-library/features.html?hl=zh-cn#multidex)，它会成为您的应用主要 DEX 文件的一部分，然后管理对其他 DEX 文件及其所包含代码的访问。

#### Android 5.0 及更高版本的 Dalvik 可执行文件分包支持

Android 5.0（API 级别 21）及更高版本使用名为 ART 的运行时，后者原生支持从 APK 文件加载多个 DEX 文件。ART 在应用安装时执行预编译，扫描 `classesN.dex` 文件，并将它们编译成单个 `.oat` 文件，供 Android 设备执行。因此，如果您的 `minSdkVersion` 为 21 或更高值，则不需要 Dalvik 可执行文件分包支持库。

### 解决 64K 限制

1. 如果您的 `minSdkVersion` 设置为 21 或更高值，您只需在模块级 `build.gradle` 文件中将 `multiDexEnabled` 设置为 `true`，如此处所示：

   ```java
   android {
       defaultConfig {
           ...
           minSdkVersion 21 
           targetSdkVersion 28
           multiDexEnabled true
       }
       ...
   }
   ```

   但是，如果您的 `minSdkVersion` 设置为 20 或更低值，则您必须按如下方式使用 [Dalvik 可执行文件分包支持库](https://developer.android.com/tools/support-library/features.html?hl=zh-cn#multidex)：

   - 修改模块级 `build.gradle` 文件以启用 Dalvik 可执行文件分包，并将 Dalvik 可执行文件分包库添加为依赖项，如此处所示

     ```java
     android {
         defaultConfig {
             ...
             minSdkVersion 15 
             targetSdkVersion 28
             multiDexEnabled true
         }
         ...
     }
     
     dependencies {
       compile 'com.android.support:multidex:1.0.3'
     }
     ```

   - 当前 Application extends MultiDexApplication {...} 或者  MultiDex.install(this);

2. 通过混淆 开启 ProGuard 移除未使用的代码，构建代码压缩。

3. 减少第三方库的直接依赖，尽可能下载源码，需要什么就用什么没必要依赖整个项目。

## Dex 加密与解密

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3hgjjypskj30qo0k0mxn.jpg)

**流程: **

1. 拿到 APK 解压得到所有的 dex 文件。
2. 通过 Tools  来进行加密，并把加密后的 dex 和代理应用 class.dex 合并，然后重新签名，对齐，打包。
3. 当用户安装 APK 打开进入代理解密的 Application 时，反射得到 dexElements 并将解密后的 dex 替换 DexPathList 中的 dexElements .

### Dex 文件加载过程

既然要查 Dex 加载过程，那么得先重那个 class 入手勒，既然不知道那么我们就先打印下 ClassLoader ;

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3iilljtd2j30l50c6aas.jpg)

下面就以一个流程图来详细了解下 Dex 加载过程吧

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3ijo26p6nj30uu0m10tl.jpg)

最后我们得知在 **findClass(String name,List<Throwable> sup)** 遍历 **dexElements** 找到 Class 并交给 Android 加载。

### Dex 解密

现在我们知道 dex 加载流程了 , 那么我们怎么进行来对 dex 解密勒，刚刚我们得知需要遍历 dexElements 来找到 Class 那么我们是不是可以在遍历之前 ，初始化 dexElements 的时候。反射得到 dexElements 将我们解密后的 dex 交给 dexElements 。下面我们就通过代码来进行解密 dex 并替换 DexPathList 中的 dexElements;

1. 得到当前加密了的 APK 文件 并解压

   ```java
   //得到当前加密了的APK文件
   File apkFile=new File(getApplicationInfo().sourceDir);
   //把apk解压   app_name+"_"+app_version目录中的内容需要boot权限才能用
   File versionDir = getDir(app_name+"_"+app_version,MODE_PRIVATE);
   File appDir=new File(versionDir,"app");
   File dexDir=new File(appDir,"dexDir");
   ```

2. 得到我们需要加载的 Dex 文件

   ```java
   //把apk解压到appDir
   Zip.unZip(apkFile,appDir);
   //获取目录下所有的文件
   File[] files=appDir.listFiles();
   for (File file : files) {
        String name=file.getName();
        if(name.endsWith(".dex") && !TextUtils.equals(name,"classes.dex")){
        try{
           AES.init(AES.DEFAULT_PWD);
           //读取文件内容
           byte[] bytes=Utils.getBytes(file);
           //解密
           byte[] decrypt=AES.decrypt(bytes);
           //写到指定的目录
           FileOutputStream fos=new FileOutputStream(file);
           fos.write(decrypt);
           fos.flush();
           fos.close();
           dexFiles.add(file);
   
        }catch (Exception e){
            e.printStackTrace();
        }
     }
   }
   ```

3. 把解密后的 dex 加载到系统

   ```java
   private void loadDex(List<File> dexFiles, File versionDir) throws Exception{
           //1.获取pathlist
           Field pathListField = Utils.findField(getClassLoader(), "pathList");
           Object pathList = pathListField.get(getClassLoader());
           //2.获取数组dexElements
           Field dexElementsField=Utils.findField(pathList,"dexElements");
           Object[] dexElements=(Object[])dexElementsField.get(pathList);
           //3.反射到初始化dexElements的方法
           Method makeDexElements=Utils.findMethod(pathList,"makePathElements",List.class,File.class,List.class);
   
           ArrayList<IOException> suppressedExceptions = new ArrayList<IOException>();
           Object[] addElements=(Object[])makeDexElements.invoke(pathList,dexFiles,versionDir,suppressedExceptions);
   
           //合并数组
           Object[] newElements= (Object[])Array.newInstance(dexElements.getClass().getComponentType(),dexElements.length+addElements.length);
           System.arraycopy(dexElements,0,newElements,0,dexElements.length);
           System.arraycopy(addElements,0,newElements,dexElements.length,addElements.length);
   
           //替换classloader中的element数组
           dexElementsField.set(pathList,newElements);
       }
   ```

   解密已经完成了，下面来看看加密吧，这里为什么先说解密勒，因为 加密涉及到 签名，打包，对齐。所以留到最后讲。

### Dex 加密

1. 制作只包含解密代码的 dex

   ```java
   1. sdk\build-tools 中执行下面命令 会得到包含 dex 的 jar
   dx --dex --output out.dex in.jar
   2. 通过 exec 执行
   File aarFile=new File("proxy_core/build/outputs/aar/proxy_core-debug.aar");
           File aarTemp=new File("proxy_tools/temp");
           Zip.unZip(aarFile,aarTemp);
           File classesJar=new File(aarTemp,"classes.jar");
           File classesDex=new File(aarTemp,"classes.dex");
           String absolutePath = classesDex.getAbsolutePath();
           String absolutePath1 = classesJar.getAbsolutePath();
           //dx --dex --output out.dex in.jar
           //dx --dex --output //D:\Downloads\android_space\DexDEApplication\proxy_tools\temp\classes.dex //D:\Downloads\android_space\DexDEApplication\proxy_tools\temp\classes.jar
           Process process=Runtime.getRuntime().exec("cmd /c dx --dex --output "+classesDex.getAbsolutePath()
                                       +" "+classesJar.getAbsolutePath());
           process.waitFor();
           if(process.exitValue()!=0){
               throw new RuntimeException("dex error");
           }
   ```

2. 加密 apk 中的 dex 文件

   ```java
    File apkFile=new File("app/build/outputs/apk/debug/app-debug.apk");
           File apkTemp=new File("app/build/outputs/apk/debug/temp");
           Zip.unZip(apkFile,apkTemp);
           //只要dex文件拿出来加密
           File[] dexFiles=apkTemp.listFiles(new FilenameFilter() {
               @Override
               public boolean accept(File file, String s) {
                   return s.endsWith(".dex");
               }
           });
           //AES加密了
           AES.init(AES.DEFAULT_PWD);
           for (File dexFile : dexFiles) {
               byte[] bytes = Utils.getBytes(dexFile);
               byte[] encrypt = AES.encrypt(bytes);
               FileOutputStream fos=new FileOutputStream(new File(apkTemp,
                       "secret-"+dexFile.getName()));
               fos.write(encrypt);
               fos.flush();
               fos.close();
               dexFile.delete();
   }
   ```

3. 把 dex 放入 apk 加压目录，重新压成 apk 文件

   ```java
    File apkTemp=new File("app/build/outputs/apk/debug/temp");
           File aarTemp=new File("proxy_tools/temp");
           File classesDex=new File(aarTemp,"classes.dex");
           classesDex.renameTo(new File(apkTemp,"classes.dex"));
           File unSignedApk=new File("app/build/outputs/apk/debug/app-unsigned.apk");
           Zip.zip(apkTemp,unSignedApk);
   ```

   **现在可以看下加密后的文件，和未加密的文件**

   未加密 apk:

   ![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3imjf14wtg316z0lxjzg.jpg)

   加密后的 apk (app 项目里面的代码全部看不见了，现在只能看见代理 Application )

   ![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3imlkzgpsg316z0lx7dz.jpg)

### 打包

#### [对齐](https://developer.android.google.cn/studio/command-line/zipalign.html)

```java
//apk整理对齐工具 未压缩的数据开头均相对于文件开头部分执行特定的字节对齐，减少应用运行内存。
zipalign -f 4 in.apk out.apk 

//比对 apk 是否对齐
zipalign -c -v 4 output.apk

//最后提示 Verification succesful 说明对齐成功了
  236829 res/mipmap-xxxhdpi-v4/ic_launcher.png (OK - compressed)
  245810 res/mipmap-xxxhdpi-v4/ic_launcher_round.png (OK - compressed)
  260956 resources.arsc (OK - compressed)
  317875 secret-classes.dex (OK - compressed)
 2306140 secret-classes2.dex (OK - compressed)
 2477544 secret-classes3.dex (OK - compressed)
Verification succesful
```

#### 签名打包  apksigner

```java
//sdk\build-tools\24.0.3 以上，apk签名工具
apksigner sign  --ks jks文件地址 --ks-key-alias 别名 --ks-pass pass:jsk密码 --key-pass pass:别名密码 --out  out.apk in.apk
```

## 总结

其实原理就是把主要代码通过命令 *dx* 生成 dex 文件，然后把加密后的 dex 合并在代理 class.dex 中。这样虽然还是能看见代理中的代码，但是主要代码已经没有暴露出来了，就已经实现了我们想要的效果。如果封装的好的话（JNI 中实现主要解密代码），基本上就哈也看不见了。ClassLoader 还是很重要的，热修复跟热加载都是这原理。学到这里 DEX 加解密已经学习完了，如果想看自己试一试可以参考我的代码

[代码传送阵](<https://github.com/yangkun19921001/DexEncryptionDecryption>)



