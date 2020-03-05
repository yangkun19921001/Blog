上一篇讲了 [dex 加密解密](<https://juejin.im/post/5cf3ee295188256aa76bb1e1>) 还没有看过的可以先去了解下 dex 怎么加解密，这篇就来带大家完成剩下的工作，dex 解密完成之后需要把代理 *ProxyApplication* 给删除掉，然后把我们自己的 Application 给添加到我们程序中。想要替换  *ProxyApplication* 可不是一件简单的事儿，首先必须的对 Application 启动方式很熟悉才能对它进行超作，下面由我来带着大家一起进入源码的世界吧。

## Application 绑定过程

APP 启动流程可以看我另外一篇文章[性能优化(一)启动优化](<https://juejin.im/post/5cc19374e51d456e781f2036>)，今天主要从 **ActivityThread => main()** 开始，下面以一个流程图来说明一下:

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3phqmxkwmj30xq0u0tbp.jpg)

### XML 中如何解析我们的 Application

- ActivityThread.java

  mian() -> thread.attach() -> attachApplication() -> 接收 AMS 发过来的参数之后 sendMessage（H.BIND_APPLICATION）-> 处理 BIND_APPLICATION -> handleBindApplication() 在这里准备好 application - > Application app = data.info.makeApplication() - > mInitialApplication = app;

  

- LoadedApk.java 

  这个类就是 APK 在内存中的表示，可以得到如代码，资料，功能清单等信息

  1. 通过 mApplicationInfo.className 得到我们注册的全类名
  2. app = mActivityThread.mInstrumentation.newApplication () 创建 application 
  3. 接下来会使用  appContext.setOuterContext(app)
  4. mApplication = app

### 反射需要替换的内容

- ContextImpl -> mOuterContext(app) 通过 Application 的 attachBaseContext 回调参数获取
- ActivityThread -> mAllApplication(arrayList) 通过 ContextImpl 的 mMainThread 属性获取
- LoadedApk -> mApplication 通过 ContextImpl 的 mPackageInfo 属性获取

#### 反射开始替换 Application

```java
    boolean isBindReal;
    Application delegate;
    private void bindRealApplicatin() throws Exception {
        if (isBindReal) {
            return;
        }
        if (TextUtils.isEmpty(app_name)) {
            return;
        }
        //得到attachBaseContext(context) 传入的上下文 ContextImpl
        Context baseContext = getBaseContext();
        //创建用户真实的application (MyApplication)
        Class<?> delegateClass = Class.forName(app_name);
        delegate = (Application) delegateClass.newInstance();
        //得到attach()方法
        Method attach = Application.class.getDeclaredMethod("attach", Context.class);
        attach.setAccessible(true);
        attach.invoke(delegate, baseContext);


//        ContextImpl---->mOuterContext(app)   通过Application的attachBaseContext回调参数获取
        Class<?> contextImplClass = Class.forName("android.app.ContextImpl");
        //获取mOuterContext属性
        Field mOuterContextField = contextImplClass.getDeclaredField("mOuterContext");
        mOuterContextField.setAccessible(true);
        mOuterContextField.set(baseContext, delegate);

//        ActivityThread--->mAllApplications(ArrayList)       ContextImpl的mMainThread属性
        Field mMainThreadField = contextImplClass.getDeclaredField("mMainThread");
        mMainThreadField.setAccessible(true);
        Object mMainThread = mMainThreadField.get(baseContext);

//        ActivityThread--->>mInitialApplication
        Class<?> activityThreadClass=Class.forName("android.app.ActivityThread");
        Field mInitialApplicationField = activityThreadClass.getDeclaredField("mInitialApplication");
        mInitialApplicationField.setAccessible(true);
        mInitialApplicationField.set(mMainThread,delegate);
//        ActivityThread--->mAllApplications(ArrayList)       ContextImpl的mMainThread属性
        Field mAllApplicationsField = activityThreadClass.getDeclaredField("mAllApplications");
        mAllApplicationsField.setAccessible(true);
        ArrayList<Application> mAllApplications =(ArrayList<Application>) mAllApplicationsField.get(mMainThread);
        mAllApplications.remove(this);
        mAllApplications.add(delegate);

//        LoadedApk------->mApplication                      ContextImpl的mPackageInfo属性
        Field mPackageInfoField = contextImplClass.getDeclaredField("mPackageInfo");
        mPackageInfoField.setAccessible(true);
        Object mPackageInfo=mPackageInfoField.get(baseContext);

        Class<?> loadedApkClass=Class.forName("android.app.LoadedApk");
        Field mApplicationField = loadedApkClass.getDeclaredField("mApplication");
        mApplicationField.setAccessible(true);
        mApplicationField.set(mPackageInfo,delegate);

        //修改ApplicationInfo className   LooadedApk
        Field mApplicationInfoField = loadedApkClass.getDeclaredField("mApplicationInfo");
        mApplicationInfoField.setAccessible(true);
        ApplicationInfo mApplicationInfo = (ApplicationInfo)mApplicationInfoField.get(mPackageInfo);
        mApplicationInfo.className=app_name;

        delegate.onCreate();
        isBindReal = true;
    }
```

现在签名打包完成，启动我们的 APK 看下 Log

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3pj93e2v1g31dr0r1gue.jpg)

```java
2019-06-04 23:17:30.892 6064-6064/com.yk.dexdeapplication I/DevYK: provider onCreate:com.example.proxy_core.ProxyApplication@1ec3c70
2019-06-04 23:17:30.892 6064-6064/com.yk.dexdeapplication I/DevYK: provider onCreate:com.example.proxy_core.ProxyApplication@1ec3c70
2019-06-04 23:17:30.892 6064-6064/com.yk.dexdeapplication I/DevYK: provider onCreate:com.example.proxy_core.ProxyApplication
2019-06-04 23:17:30.895 6064-6064/com.yk.dexdeapplication I/DevYK: MyApplication onCreate()
2019-06-04 23:17:30.995 6064-6064/com.yk.dexdeapplication I/DevYK: activity:com.yk.dexdeapplication.App@300b5f6
2019-06-04 23:17:30.995 6064-6064/com.yk.dexdeapplication I/DevYK: activity:com.yk.dexdeapplication.App@300b5f6
2019-06-04 23:17:30.995 6064-6064/com.yk.dexdeapplication I/DevYK: activity:com.yk.dexdeapplication.App
2019-06-04 23:17:31.001 6064-6064/com.yk.dexdeapplication I/DevYK: provider delete:com.example.proxy_core.ProxyApplication@1ec3c70
2019-06-04 23:17:31.021 6064-6064/com.yk.dexdeapplication I/DevYK: service:com.yk.dexdeapplication.App@300b5f6
2019-06-04 23:17:31.021 6064-6064/com.yk.dexdeapplication I/DevYK: service:com.yk.dexdeapplication.App@300b5f6
2019-06-04 23:17:31.021 6064-6064/com.yk.dexdeapplication I/DevYK: service:com.yk.dexdeapplication.App
2019-06-04 23:17:31.022 6064-6064/com.yk.dexdeapplication I/DevYK: reciver:android.app.ReceiverRestrictedContext@9b92293
2019-06-04 23:17:31.022 6064-6064/com.yk.dexdeapplication I/DevYK: reciver:com.yk.dexdeapplication.App@300b5f6
2019-06-04 23:17:31.022 6064-6064/com.yk.dexdeapplication I/DevYK: reciver:com.yk.dexdeapplication.App
```

注意看 LOG 

```java
MyApplication onCreate()
```

这里已经替换成我们自己的 MyApplication , 而且 Activity 和 Service 获取上下文也已经是我们替换成功的 Applicaton。但是...也许有的眼神比较好的已经看出问题了，为什么内容提供者 Context 还是代理的 Application 而且比我们自己的应用还要先执行，那么我们带着这个问题去看 Application onCreate 之前做了什么事儿。

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3pk5zdxkgj30pm0n40vf.jpg)

我们点击 installlContentProviders(app,providers);

注意这里传进去的还是 代理 Context

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3pkdqdeyrg31270oqk3l.jpg)

重点在最后

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3pkgcq3ixj30lj0kht9z.jpg)

注意看我 勾画 的圈里面的逻辑判断，判断当前应用的包名是否跟 XML 中的包名一致，如果一致我们就赋值，再次提醒下 这里的 context 是我们代理的 context ,那么我们怎么做勒，我们在代理中重写 PackageName 只要都不等 那么就会走 else 会根据包名创建一个 Context

```java
    /**
     * 让代码走入if中的第三段中
     * @return
     */
    @Override
    public String getPackageName() {
        if(!TextUtils.isEmpty(app_name)){
            return "";
        }
        return super.getPackageName();
    }

    @Override
    public Context createPackageContext(String packageName, int flags) throws PackageManager.NameNotFoundException {
       if(TextUtils.isEmpty(app_name)){
           return super.createPackageContext(packageName, flags);
       }
        try {
            bindRealApplicatin();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return delegate;

    }
```

1. 首先判断我们自己 XML 中的 app_name 是否为空
2. 如果不为空，我们传入一个 空包
3. SDK 会判断是否跟 XML 中的 pck 一样，最后走 else 我们在重写 createPackageContext 传入我们自己应用的包名。会生成一个 Context 

最后我们来验证一下：

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3pktx7qmdg31bn0oqqbm.jpg)

```java
2019-06-05 00:12:30.271 7570-7570/com.yk.dexdeapplication I/DevYK: MyApplication onCreate()
2019-06-05 00:12:30.273 7570-7570/com.yk.dexdeapplication I/DevYK: provider onCreate:com.yk.dexdeapplication.App@1ec3c70
2019-06-05 00:12:30.273 7570-7570/com.yk.dexdeapplication I/DevYK: provider onCreate:com.yk.dexdeapplication.App@1ec3c70
2019-06-05 00:12:30.273 7570-7570/com.yk.dexdeapplication I/DevYK: provider onCreate:com.yk.dexdeapplication.App
2019-06-05 00:12:30.381 7570-7570/com.yk.dexdeapplication I/DevYK: activity:com.yk.dexdeapplication.App@1ec3c70
2019-06-05 00:12:30.381 7570-7570/com.yk.dexdeapplication I/DevYK: activity:com.yk.dexdeapplication.App@1ec3c70
2019-06-05 00:12:30.381 7570-7570/com.yk.dexdeapplication I/DevYK: activity:com.yk.dexdeapplication.App
2019-06-05 00:12:30.387 7570-7570/com.yk.dexdeapplication I/DevYK: provider delete:com.yk.dexdeapplication.App@1ec3c70
2019-06-05 00:12:30.406 7570-7570/com.yk.dexdeapplication I/DevYK: service:com.yk.dexdeapplication.App@1ec3c70
2019-06-05 00:12:30.406 7570-7570/com.yk.dexdeapplication I/DevYK: service:com.yk.dexdeapplication.App@1ec3c70
2019-06-05 00:12:30.406 7570-7570/com.yk.dexdeapplication I/DevYK: service:com.yk.dexdeapplication.App
2019-06-05 00:12:30.408 7570-7570/com.yk.dexdeapplication I/DevYK: reciver:android.app.ReceiverRestrictedContext@b7a3b82
2019-06-05 00:12:30.408 7570-7570/com.yk.dexdeapplication I/DevYK: reciver:com.yk.dexdeapplication.App@1ec3c70
2019-06-05 00:12:30.408 7570-7570/com.yk.dexdeapplication I/DevYK: reciver:com.yk.dexdeapplication.App
```

日志中除了 BroadCase Context 是系统的以外，所有的 Context 都是我们替换的 Application Context。完美这解决。不过这里有一个隐藏 BUG ，据说面试题会问那么是什么勒？

**可以在广播中使用 context 在开启一个广播吗？**

我们其实可以带着这个问题看下源码

H -> RECEIVER 消息

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3pl5ci14zg31bn0oqngb.jpg)

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3pl36mjbgj30lu0imabb.jpg)

果然注册广播和绑定服务会抛一个异常。

## 总结

到这里我们的加固已经讲完了，从 dex 分包 -> 加密 -> 对齐 > 签名 - > 打包压缩成 APK 。一套完整的流程和代码都已经写完了。跟市面上的加固流程原理都几乎一样。懂了原理再去使用第三方就轻车熟路了。

[代码传送](<https://github.com/yangkun19921001/DexEncryptionDecryption>)







