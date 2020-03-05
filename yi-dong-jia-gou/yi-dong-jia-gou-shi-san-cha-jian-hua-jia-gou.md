# 移动架构 \(十三\) 插件化架构

## 基本概念

插件化其实也就是 模块化-&gt;组件化 演变而来, 属于动态加载技术，主要用于解决应用越来越庞大以及功能模块的解耦，小项目中一般用的不多。

原理: 插件化的原理其实就是在 APP 壳运行过程中，动态加载一些程序中原本不存在的可执行文件并运行这些文件中的代码逻辑。可执行文件总的来说分为两个，其一是动态链接库 so,其二是 dex 相关文件包括 jar/apk 文件。

## 发展历史

很早以前插件化这项技术已经有公司在研究了，淘宝，支付宝做的是比较早，但是淘宝这项技术一直都是保密的，直到 2015 年左右市面上才出现了一些关于插件化的框架，Android 插件化分为很多技术流派，实现的方式都不太一样。下面我就简单以时间线来举例几个比较有代表性的插件框架:

| 时间 | 框架名称 | 作者 | 框架简介 |
| :--- | :--- | :--- | :--- |
| 2014年底 | [dynamic-load-apk](https://github.com/singwhatiwanna/dynamic-load-apk) | 主席任玉刚 | 动态加载技术 + 代理实现 |
| 2015年 8 月 | [DroidPlugin](https://github.com/DroidPluginTeam/DroidPlugin) | 360 手机助手 | 可以直接运行第三方的独立 APK 文件，完全不需要对 APK 进行修改或安装。一种新的插件机制，一种免安装的运行机制，是一个沙箱（但是不完全的沙箱。就是对于使用者来说，并不知道他会把 apk 怎么样）， 是模块化的基础。 |
| 2015年底 | [Small](https://github.com/wequick/Small) | wequick | Small 是一种实现轻巧的跨平台插件化框架，基于“轻量、透明、极小化、跨平台”的理念 |
| 2017年 6 月 | [VirtualAPK](https://github.com/didi/VirtualAPK) | 滴滴 | VirtualAPK 对插件没有额外的约束，原生的 apk 即可作为插件。插件工程编译生成 apk 后，即可通过宿主 App 加载，每个插件 apk 被加载后，都会在宿主中创建一个单独的 LoadedPlugin 对象。通过这些 LoadedPlugin 对象，VirtualAPK 就可以管理插件并赋予插件新的意义，使其可以像手机中安装过的 App 一样运行。 |
| 2017年 7 月 | [RePlgin](https://github.com/Qihoo360/RePlugin) | 360手机卫士 | RePlugin 是一套完整的、稳定的、适合全面使用的，占坑类插件化方案，由 360 手机卫士的RePlugin Team 研发，也是业内首个提出”全面插件化“（全面特性、全面兼容、全面使用）的方案。 |
| 2019 | [Shadow](https://github.com/Tencent/Shadow) | 腾讯 | Shadow 是一个腾讯自主研发的 Android 插件框架，经过线上亿级用户量检验。 Shadow 不仅开源分享了插件技术的关键代码，还完整的分享了上线部署所需要的所有设计（零反射） |

## 插件化必备知识

1. Binder
2. APP 打包流程
3. APP 安装流程
4. APP 启动流程
5. 资源加载机制
6. 反射，ClassLoader
7. ...

## 实现简易版本插件化框架

今天我们这里就以动态加载技术，ClassLoader + 反射 + 代理模式 等基本技术来实现动态加载 APK 中的（Activity, Broadcast, Service ,资源）[项目地址](https://github.com/yangkun19921001/YKPluginAPK)

先来看一个我们最终实现的效果

[![cFKq7.gif](https://user-gold-cdn.xitu.io/2019/8/25/16cc7e47b3b29891?w=568&h=1090&f=gif&s=3758802)](https://cuntuku.com/image/cFKq7)

### 加载插件 APK

在加载 APK 之前我们先来了解下 ClassLoader 家族，继承关系图

[![cFg8c.png](https://user-gold-cdn.xitu.io/2019/8/25/16cc7e47a9317f0e?w=1407&h=578&f=png&s=30737)](https://cuntuku.com/image/cFg8c)

**DexClassLoader 加载流程**

[![DexClassLoader.png](https://user-gold-cdn.xitu.io/2019/8/25/16cc7e4757c8f61a?w=1026&h=1266&f=png&s=40791)](https://free.imgsha.com/i/shI6Y)

从上面 2 张图中，我们得知动态加载 APK 需要用到 DexClassLoader ，既然知道了用 DexClassLoader 来加载 APK , 那么native 中将 apk -&gt; dex 解析出来，class 又怎么加载勒？ 通过 DexClassLoader 流程图得知可以直接调用 loadClass\(String classPath\) 来加载，下面我们就正式进行今天的主题了。

**代码实现加载 APK**

```java
    /**
     * 加载插件 APK 
     */
    public boolean loadPlugin(Context context, String filePath) {
        if (context == null || filePath == null || filePath.isEmpty())
            throw new NullPointerException("context or filePath is null ?");
        this.mContext = context.getApplicationContext();
        this.apkFilePath = filePath;
        //拿到 包管理
        packageManager = mContext.getPackageManager();

        if (getPluginPackageInfo(apkFilePath) == null) {
            return false;
        }
        //从包里获取 Activity
        pluginPackageInfo = getPluginPackageInfo(apkFilePath);

        //存放 DEX 路径
        mDexPath = new File(Constants.IPluginPath.PlugDexPath);
        if (mDexPath.exists())
            mDexPath.delete();
        else
            mDexPath.mkdirs();

        //通过 DexClassLoader 加载 apk 并通过 native 层解析 apk 输出 dex
        //第二个参数可以为 null
        if (getPluginClassLoader(apkFilePath, mDexPath.getAbsolutePath()) == null || getPluginResources(filePath) == null)
            return false;
        this.mDexClassLoader = getPluginClassLoader(apkFilePath, mDexPath.getAbsolutePath());
        this.mResources = getPluginResources(filePath);
        return true;

    }
```

```text
/**
 * @return 得到对应插件 APK 的 Resource 对象
 */
public Resources getPluginResources() {
    return getPluginResources(apkFilePath);
}

/**
 * 得到对应插件 APK 中的 加载器
 *
 * @param apkFile
 * @param dexPath
 * @return
 */
public DexClassLoader getPluginClassLoader(String apkFile, String dexPath) {
    return new DexClassLoader(apkFile, dexPath, null, mContext.getClassLoader());
}


/**
 * 得到对应插件 APK 中的 加载器
 *
 * @return
 */
public DexClassLoader getPluginClassLoader() {
    return getPluginClassLoader(apkFilePath, mDexPath.getAbsolutePath());
}


/**
 * 得到插件 APK 中 包信息
 */
public PackageInfo getPluginPackageInfo(String apkFilePath) {
    if (packageManager != null)
        return packageManager.getPackageArchiveInfo(apkFilePath, PackageManager.GET_ACTIVITIES);
return null;
}

/**
 * 得到插件 APK 中 包信息
 */
public PackageInfo getPluginPackageInfo() {
    return getPluginPackageInfo(apkFilePath);
}
```

### 加载插件中 Activity

**实现流程**

[![--APK.png](https://user-gold-cdn.xitu.io/2019/8/25/16cc7e475926a994?w=1740&h=1202&f=png&s=72425)](https://free.imgsha.com/i/shN4P)

**代码实现流程**

1. 代理类 ProxyActivity 实现

   ```java
   public class ProxyActivity extends AppCompatActivity {

       /**
        * 需要加载插件的全类名
        */
       protected String activityClassName;

       private String TAG = this.getClass().getSimpleName();
       private IActivity iActivity;
       private ProxyBroadcast receiver;

       @Override
       protected void onCreate(@Nullable Bundle savedInstanceState) {
           super.onCreate(savedInstanceState);

           activityClassName = getLoadClassName();

           //拿到加载插件的的全类名 通过反射实例化
           try {
               Class<?> pluginClassName = getClassLoader().loadClass(activityClassName);
               //拿到构造函数
               Constructor<?> constructor = pluginClassName.getConstructor(new Class[]{});
               //实例化 拿到插件 UI
               Object pluginObj = constructor.newInstance(new Object[]{});
               if (pluginObj != null) {
                   iActivity = (IActivity) pluginObj;
                   iActivity.onActivityCreated(this, savedInstanceState);
               }
           } catch (Exception e) {
               Log.e(TAG, e.getMessage());
           }
       }
   }
   ```

2. 重写代理类中的 startActivity

   ```java
       /**
        * 这里的 startActivity 是插件促使调用的
        */
       @Override
       public void startActivity(Intent intent) {
             //需要开启插件 Activity 的全类名
           String className = getLoadClassName(intent);
           Intent proxyIntent = new Intent(this, ProxyActivity.class);
           proxyIntent.putExtra(Constants.ACTIVITY_CLASS_NAME, className);
           super.startActivity(proxyIntent);
       }
   ```

3. 插件 Activity 实现 IActivity 的生命周期并且重写一些重要函数，都交于插件中处理

   \`\`\`java public class BaseActivityImp extends AppCompatActivity implements IActivity {

   ```text
   private final String TAG = getClass().getSimpleName();

   /**
    * 代理 Activity
    */
   protected Activity that;

   @Override
   public void onActivityCreated(@NonNull Activity activity, @Nullable Bundle bundle) {
       this.that = activity;

       Log.i(TAG, "  onActivityCreated");
       onCreate(bundle);
   }

   /**
    * 通过 View 方式加载
    *
    * @param view
    */
   @Override
   public void setContentView(View view) {
       Log.i(TAG, "  setContentView --> view");
       if (that != null) {
           that.setContentView(view);
       } else {
           super.setContentView(view);
       }
   }

   /**
    * 通过 layoutID 加载
    *
    * @param layoutResID
    */
   @Override
   public void setContentView(int layoutResID) {
       Log.i(TAG, "  setContentView --> layoutResID");
       if (that != null) {
           that.setContentView(layoutResID);
       } else {
           super.setContentView(layoutResID);
       }
   }

   /**
    * 通过代理 去找布局 ID
    *
    * @param id
    * @param <T>
    * @return
    */
   @Override
   public <T extends View> T findViewById(int id) {
       if (that != null)
           return that.findViewById(id);
       return super.findViewById(id);
   }

   /**
    * 通过 代理去开启 Activity
    *
    * @param intent
    */
   @Override
   public void startActivity(Intent intent) {
       if (that != null) {
           Intent tempIntent = new Intent();
           tempIntent.putExtra(Constants.ACTIVITY_CLASS_NAME, intent.getComponent().getClassName());
           that.startActivity(tempIntent);
       } else
           super.startActivity(intent);
   }
   ```

```text
   @Override
   public String getPackageName() {
       return that.getPackageName();
   }

   @Override
   public void onActivityStarted(@NonNull Activity activity) {
       Log.i(TAG, "  onActivityStarted");
       onStart();


   }

   @Override
   public void onActivityResumed(@NonNull Activity activity) {
       Log.i(TAG, "  onActivityResumed");
       onResume();
   }

   @Override
   public void onActivityPaused(@NonNull Activity activity) {
       Log.i(TAG, "  onActivityPaused");
       onPause();
   }

   @Override
   public void onActivityStopped(@NonNull Activity activity) {
       Log.i(TAG, "  onActivityStopped");
       onStop();
   }

   @Override
   public void onActivitySaveInstanceState(@NonNull Activity activity, @NonNull Bundle bundle) {
       onSaveInstanceState(bundle);
       Log.i(TAG, "  onActivitySaveInstanceState");
   }

   @Override
   public void onActivityDestroyed(@NonNull Activity activity) {
       Log.i(TAG, "  onActivityDestroyed");
       onDestroy();

   }


   @Override
   protected void onCreate(@Nullable Bundle savedInstanceState) {

   }


   @Override
   protected void onStart() {

   }

   @Override
   protected void onResume() {

   }

   @Override
   protected void onStop() {

   }

   @Override
   protected void onPause() {

   }

   @Override
   protected void onSaveInstanceState(Bundle outState) {

   }

   @Override
   protected void onDestroy() {

   }

   @Override
   public void onBackPressed() {

   }
```

}

```text
## 加载插件中 Broadcast

**流程图**

[![-.png](https://user-gold-cdn.xitu.io/2019/8/25/16cc7e4758c7881a?w=1390&h=1270&f=png&s=53990)](https://free.imgsha.com/i/skBZO)

------

**代码实现**

1. 代理 ProxyActivity 中重写注册广播

   ```java
       @Override
       public Intent registerReceiver(BroadcastReceiver receiver, IntentFilter filter) {
           IntentFilter proxyIntentFilter = new IntentFilter();
           for (int i = 0; i < filter.countActions(); i++) {
               //内部是一个数组
               proxyIntentFilter.addAction(filter.getAction(i));
           }
           //交给代理广播去注册
           this.receiver = new ProxyBroadcast(receiver.getClass().getName(), this);
           return super.registerReceiver(this.receiver, filter);
       }
```

1. 加载插件中需要注册的广播全路径

   ```java
       public ProxyBroadcast(String broadcastClassName, Context context) {
           this.broadcastClassName = broadcastClassName;
           this.iBroadcast = iBroadcast;

           //通过加载插件的 DexClassLoader loadClass
           try {
               Class<?> pluginBroadcastClassName = PluginManager.getInstance().getPluginClassLoader().loadClass(broadcastClassName);
               Constructor<?> constructor = pluginBroadcastClassName.getConstructor(new Class[]{});
               iBroadcast = (IBroadcast) constructor.newInstance(new Object[]{});
             //返回给插件中广播生命周期
               iBroadcast.attach(context);
           } catch (Exception e) {
               e.printStackTrace();
               Log.e(TAG, e.getMessage());
           }
       }
   ```

2. 接收到消息返回给插件中

   ```java
       @Override
       public void onReceive(Context context, Intent intent) {
           iBroadcast.onReceive(context, intent);
       }
   ```

3. 插件中广播注册

   ```java
       /**
        * 动态注册广播
        */
       public void register() {
           //动态注册广播
           IntentFilter intentFilter = new IntentFilter();
           intentFilter.addAction("_DevYK");
           receiver = new PluginBroadReceiver();
           registerReceiver(receiver, intentFilter);
       }

       /**
        * 通过代理去注册广播
        *
        * @param receiver
        * @param filter
        * @return
        */
       @Override
       public Intent registerReceiver(BroadcastReceiver receiver, IntentFilter filter) {
           if (that != null) {
               return that.registerReceiver(receiver, filter);
           } else
               return super.registerReceiver(receiver, filter);
       }
   ```

4. 插件中实现代理广播中的生命周期并实现接收函数

   ```java
   public class BaseBroadReceiverImp extends BroadcastReceiver implements IBroadcast {
     //代理广播中绑定成功插件广播
       @Override
       public void attach(Context context) {

       }

     //代理广播接收到数据转发给插件中
       @Override
       public void onReceive(Context context, Intent intent) {

       }
   }
   ```

### 加载插件中 Service

**流程图**

[![-service.png](https://user-gold-cdn.xitu.io/2019/8/25/16cc7e47590e7528?w=1532&h=1128&f=png&s=58247)](https://free.imgsha.com/i/sk3QZ)

**代码实现**

1. ProxyAcitivy 开启插件中服务

   ```java
       /**
        * 加载插件中 启动服务
        * @param service
        * @return
        */
       @Override
       public ComponentName startService(Intent service) {
           String className = getLoadServiceClassName(service);
           Intent intent = new Intent(this,ProxyService.class);
           intent.putExtra(Constants.SERVICE_CLASS_NAME,className);
           return super.startService(intent);
       }
   ```

   ProxyService.java

   \`\`\`java public class ProxyService extends Service {

   ```text
   private IService iService;

   @Override
   public IBinder onBind(Intent intent) {
       return iService.onBind(intent);
   }

   @Override
   public void onCreate() {
       super.onCreate();

   }

   @Override
   public int onStartCommand(Intent intent, int flags, int startId) {
       if (iService == null)
           init(intent);
       return iService.onStartCommand(intent, flags, startId);
   }

   @Override
   public void onStart(Intent intent, int startId) {
       super.onStart(intent, startId);
      iService.onStart(intent,startId);
   }

   @Override
   public boolean onUnbind(Intent intent) {
       iService.onUnbind(intent);
       return super.onUnbind(intent);
   }
   ```

```text
   @Override
   public void onDestroy() {
       super.onDestroy();
       iService.onDestroy();
   }


   //初始化
   public void init(Intent proIntent) {
       //拿到需要启动服务的全类名
       String serviceClassName = getServiceClassName(proIntent);
       try {
           Class<?> pluginService = PluginManager.getInstance().getPluginClassLoader().loadClass(serviceClassName);
           Constructor<?> constructor = pluginService.getConstructor(new Class[]{});
           iService = (IService) constructor.newInstance(new Object[]{});
           iService.onCreate(getApplicationContext());
       } catch (Exception e) {
           //加载 class
       }
   }

   @Override
   public ClassLoader getClassLoader() {
       return PluginManager.getInstance().getPluginClassLoader();
   }

   public String getServiceClassName(Intent intent) {
       return intent.getStringExtra(Constants.SERVICE_CLASS_NAME);
   }
```

}

```text
2. 插件服务实现 IService  

   ```java
   public class BaseServiceImp extends Service implements IService {
     ...
   }
```

1. 插件中重写 startService 交于代理中处理

   ```java
       /**
        * 加载插件中服务，交于代理处理
        * @param service
        * @return
        */
       @Override
       public ComponentName startService(Intent service) {
           String className = getLoadServiceClassName(service);
           Intent intent = new Intent(this,ProxyService.class);
           intent.putExtra(Constants.SERVICE_CLASS_NAME,className);
           return super.startService(intent);
       }
   ```

## 总结

动态加载 Activity, Broadcast , Service 其实基本原理就是将插件中需要启动四大组件的信息告诉代理类中，让代理类来负责处理插件中的逻辑，代理类中处理完之后通过 IActivity, IBroadcast, IService 来通知插件。

动态加载插件我们这篇文章就讲到这里了，感兴趣的可以参考[项目地址](https://github.com/yangkun19921001/YKPluginAPK) ，这个实现方案不适合线上商业项目，使用需谨慎。如果项目中只用到了插件中的生命周期可以选择性的使用。

感谢阅览本篇文章，谢谢！

## 参考文章

[Android插件化框架总结](https://mp.weixin.qq.com/s?__biz=MzIwMzYwMTk1NA==&mid=2247486927&idx=1&sn=29e7439c220387f34df232f04ab283ac)

[深入理解Android插件化技术](https://zhuanlan.zhihu.com/p/33017826)

[DroidPlugin](https://github.com/DroidPluginTeam/DroidPlugin/tree/master/DOC)

[https://free.imgsha.com/i/sk3QZ](https://free.imgsha.com/i/sk3QZ)\)

**代码实现**

1. ProxyAcitivy 开启插件中服务

   ```java
       /**
        * 加载插件中 启动服务
        * @param service
        * @return
        */
       @Override
       public ComponentName startService(Intent service) {
           String className = getLoadServiceClassName(service);
           Intent intent = new Intent(this,ProxyService.class);
           intent.putExtra(Constants.SERVICE_CLASS_NAME,className);
           return super.startService(intent);
       }
   ```

   ProxyService.java

   \`\`\`java public class ProxyService extends Service {

   ```text
   private IService iService;

   @Override
   public IBinder onBind(Intent intent) {
       return iService.onBind(intent);
   }

   @Override
   public void onCreate() {
       super.onCreate();

   }

   @Override
   public int onStartCommand(Intent intent, int flags, int startId) {
       if (iService == null)
           init(intent);
       return iService.onStartCommand(intent, flags, startId);
   }

   @Override
   public void onStart(Intent intent, int startId) {
       super.onStart(intent, startId);
      iService.onStart(intent,startId);
   }

   @Override
   public boolean onUnbind(Intent intent) {
       iService.onUnbind(intent);
       return super.onUnbind(intent);
   }
   ```

```text
   @Override
   public void onDestroy() {
       super.onDestroy();
       iService.onDestroy();
   }


   //初始化
   public void init(Intent proIntent) {
       //拿到需要启动服务的全类名
       String serviceClassName = getServiceClassName(proIntent);
       try {
           Class<?> pluginService = PluginManager.getInstance().getPluginClassLoader().loadClass(serviceClassName);
           Constructor<?> constructor = pluginService.getConstructor(new Class[]{});
           iService = (IService) constructor.newInstance(new Object[]{});
           iService.onCreate(getApplicationContext());
       } catch (Exception e) {
           //加载 class
       }
   }

   @Override
   public ClassLoader getClassLoader() {
       return PluginManager.getInstance().getPluginClassLoader();
   }

   public String getServiceClassName(Intent intent) {
       return intent.getStringExtra(Constants.SERVICE_CLASS_NAME);
   }
```

}

```text
2. 插件服务实现 IService  

   ```java
   public class BaseServiceImp extends Service implements IService {
     ...
   }
```

1. 插件中重写 startService 交于代理中处理

   ```java
       /**
        * 加载插件中服务，交于代理处理
        * @param service
        * @return
        */
       @Override
       public ComponentName startService(Intent service) {
           String className = getLoadServiceClassName(service);
           Intent intent = new Intent(this,ProxyService.class);
           intent.putExtra(Constants.SERVICE_CLASS_NAME,className);
           return super.startService(intent);
       }
   ```

## 总结

动态加载 Activity, Broadcast , Service 其实基本原理就是将插件中需要启动四大组件的信息告诉代理类中，让代理类来负责处理插件中的逻辑，代理类中处理完之后通过 IActivity, IBroadcast, IService 来通知插件。

动态加载插件我们这篇文章就讲到这里了，感兴趣的可以参考[项目地址](https://github.com/yangkun19921001/YKPluginAPK) ，这个实现方案不适合线上商业项目，使用需谨慎。如果项目中只用到了插件中的生命周期可以选择性的使用。

感谢阅览本篇文章，谢谢！

## 参考文章

[Android插件化框架总结](https://mp.weixin.qq.com/s?__biz=MzIwMzYwMTk1NA==&mid=2247486927&idx=1&sn=29e7439c220387f34df232f04ab283ac)

[深入理解Android插件化技术](https://zhuanlan.zhihu.com/p/33017826)

[DroidPlugin](https://github.com/DroidPluginTeam/DroidPlugin/tree/master/DOC)

