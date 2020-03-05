# Android 8.0 源码分析 \(一\)  SystemServer 进程启动

## 前言

我们熟知一般 Android 工程师都是在应用层上开发，不会涉及系统源码，但是如果你想往底层发展，或者深入插件化、Framework 系统层等开发工作，如果不了解 Android 源码可是不行的，那么接下来我基于自己的理解跟学习来记录跟 Android 开发息息相关的源码分析，大概从 Android 中的 SystemServer 启动、四大组件启动、AMS、PMS 等几个维度来介绍，下面是我的计划，当然在未来也有可能改变。

**还没有关注的小伙伴，可以先关注一波，系列文章会持续更新。**

[Android 8.0 源码分析 \(一\) SystemServer 进程启动](https://juejin.im/post/5db3f95ee51d4529e83947f9)

[Android 8.0 源码分析 \(二\) Launcher 启动](android-8.0-yuan-ma-fen-xi-yi-systemserver-jin-cheng-qi-dong.md)

[Android 8.0 源码分析 \(三\) 应用程序进程启动](android-8.0-yuan-ma-fen-xi-yi-systemserver-jin-cheng-qi-dong.md)

[Android 8.0 源码分析 \(四\) Activity 启动](android-8.0-yuan-ma-fen-xi-yi-systemserver-jin-cheng-qi-dong.md)

[Android 8.0 源码分析 \(五\) Service 启动](android-8.0-yuan-ma-fen-xi-yi-systemserver-jin-cheng-qi-dong.md)

[Android 8.0 源码分析 \(六\) BroadcastReceiver 启动](android-8.0-yuan-ma-fen-xi-yi-systemserver-jin-cheng-qi-dong.md)

[Android 8.0 源码分析 \(七\) ContentProvider 启动](android-8.0-yuan-ma-fen-xi-yi-systemserver-jin-cheng-qi-dong.md)

## 介绍

Android 中的 SystemServer 可以说是最为重要的进程也不为过，因为我们熟知的 AMS、WMS、PMS 等等都是通过它来启动的，因此掌握 SystemServer 进程是如何启动，它在启动又干了哪些活，这些都是有必要的。

## 源码分析

在分析 SystemServer 启动源码之前，我们先看一下 SystemServer 启动时序图

![K0L9ld.png](https://s2.ax1x.com/2019/10/26/K0L9ld.png)

### 1. Zygote 开创 Java 框架层入口

根据上面时序图我们知道是 Zygote 是 Java 框架端的入口，那么 Zygote 是什么呢？它有一个中文名称我们叫它 **孵化器**，顾名思义它就是为应用程序或者系统程序来创建它们对应进程的，Zygote 通过 **init.rc** 脚本启动，Zygote 启动过程打算后面单独写一篇来介绍，这里就直接跳到 JNI 层启动 Zygote 的入口，其实就是 ZygoteInit.java 文件，我们直接看它的 main 函数实现。

```java
//com.android.internal.os.ZygoteInit.java
    public static void main(String argv[]) {

                ....

        try {

          ...
            //是否开启 SystemServer 标记
            boolean startSystemServer = false;
              //服务端 Socket 名称
            String socketName = "zygote";

              //根据 JNI 层传递过来的信息，来判断是否启动系统服务
            for (int i = 1; i < argv.length; i++) {
                if ("start-system-server".equals(argv[i])) {
                    startSystemServer = true;
                } else if ("--enable-lazy-preload".equals(argv[i])) {
                    enableLazyPreload = true;
                } else if (argv[i].startsWith(ABI_LIST_ARG)) {
                    abiList = argv[i].substring(ABI_LIST_ARG.length());
                } else if (argv[i].startsWith(SOCKET_NAME_ARG)) {
                    socketName = argv[i].substring(SOCKET_NAME_ARG.length());
                } else {
                    throw new RuntimeException("Unknown command line argument: " + argv[i]);
                }
            }


            /**
             * 1. 创建服务端的 Socket ,名称为 "zygote"
             */

            zygoteServer.registerServerSocket(socketName);

            if (!enableLazyPreload) {
                bootTimingsTraceLog.traceBegin("ZygotePreload");
                EventLog.writeEvent(LOG_BOOT_PROGRESS_PRELOAD_START,
                    SystemClock.uptimeMillis());
                /**
                 *  2. 用来预加载资源
                 */
                preload(bootTimingsTraceLog);
                EventLog.writeEvent(LOG_BOOT_PROGRESS_PRELOAD_END,
                    SystemClock.uptimeMillis());
                bootTimingsTraceLog.traceEnd(); // ZygotePreload
            } else {
                Zygote.resetNicePriority();
            }

            ...

            if (startSystemServer) {
                /**
                 * 3. 启动 SystemServer 进程
                 *
                 */
                startSystemServer(abiList, socketName, zygoteServer);
            }

            Log.i(TAG, "Accepting command socket connections");
            /**
             * 4. 等待 AMS 请求
             */
            zygoteServer.runSelectLoop(abiList);
                        //清理或者关闭对应的 Socket
            zygoteServer.closeServerSocket();
        } catch (Zygote.MethodAndArgsCaller caller) {
            caller.run();
        } catch (Throwable ex) {
            Log.e(TAG, "System zygote died with exception", ex);
            zygoteServer.closeServerSocket();
            throw ex;
        }
    }
```

通过上面代码我们可以把 **ZygoteInit.main\(\)**  做的工作分为四大步

* 1. 创建一个 Server 端为 ”zygote“ 名称的  Socket，用于等待 AMS 请求 Zygote 来创建新的应用程序进程。
* 1. 预处理加载类跟资源。
* 1. 根据 JNI 传递过来的信息来判断是否启动 SystemServer 进程。
* 1. 等待 AMS 请求，用于创建新的应用程序进程。

**1. zygoteServer.registerServerSocket\(socketName\);**

我们首先来分析第一步具体做了什么，看下面函数代码

```java
//com.android.internal.os ZygoteServer.java

    void registerServerSocket(String socketName) {
        if (mServerSocket == null) {
            int fileDesc;
            /**
             * 1. 拿到 Socket 名称
             */
            final String fullSocketName = ANDROID_SOCKET_PREFIX + socketName;
            try {
                /**
                 * 2. 得到 Socket 环境变量的值
                 */
                String env = System.getenv(fullSocketName);
                /**
                 * 3. 将 Socket 环境变量的值转换为文件描述符的参数
                 */
                fileDesc = Integer.parseInt(env);
            } catch (RuntimeException ex) {
                throw new RuntimeException(fullSocketName + " unset or invalid", ex);
            }

            try {
                /**
                 * 4. 创建文件描述符
                 */
                FileDescriptor fd = new FileDescriptor();
                                //将 Socket 转换出来的信息传递给文件描述符，用于获取具体信息
                fd.setInt$(fileDesc);
                /**
                 *5. 创建服务端 Socket
                 */
                mServerSocket = new LocalServerSocket(fd);
            } catch (IOException ex) {
                throw new RuntimeException(
                        "Error binding to local socket '" + fileDesc + "'", ex);
            }
        }
    }
```

根据上面注释我们来总结下 **registerServerSocket** 函数干了哪些事儿？

* 1. 拿到拼接之后的 Socket 名称（ANDROID\_SOCKET\_zygote）
* 1. 通过 funSocketName Socket 名称转换为系统环境变量的值
* 1. 将 Socket 的系统环境变量的值转换为文件描述符的参数
* 1. 创建 FileDescriptor 文件描述符
* 1. 创建服务端 Socket 并将拿到对应的文件描述符作为参数传递给服务端 Socket 

最后服务端 Socket 就创建成功了，并处于等待 AMS 请求 zygote 进程来创建新的应用程序进程。

**2. 启动 SystemServer 进程**

接下来请继续回到 ZygoteInit main 函数的注释 3 处具体实现，如下：

```java
  //com.android.internal.os ZygoteInit.main->startSystemServer

    private static boolean startSystemServer(String abiList, String socketName, ZygoteServer zygoteServer)
            throws Zygote.MethodAndArgsCaller, RuntimeException {
        long capabilities = posixCapabilitiesAsBits(
                OsConstants.CAP_IPC_LOCK,
                OsConstants.CAP_KILL,
                OsConstants.CAP_NET_ADMIN,
                OsConstants.CAP_NET_BIND_SERVICE,
                OsConstants.CAP_NET_BROADCAST,
                OsConstants.CAP_NET_RAW,
                OsConstants.CAP_SYS_MODULE,
                OsConstants.CAP_SYS_NICE,
                OsConstants.CAP_SYS_PTRACE,
                OsConstants.CAP_SYS_TIME,
                OsConstants.CAP_SYS_TTY_CONFIG,
                OsConstants.CAP_WAKE_ALARM
        );

        ...

        /* Hardcoded command line to start the system server */
        /**
         * 1. 启动 SystemServer 的参数
         */
        String args[] = {
                "--setuid=1000",
                "--setgid=1000",
                "--setgroups=1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1018,1021,1023,1032,3001,3002,3003,3006,3007,3009,3010",
                "--capabilities=" + capabilities + "," + capabilities,
                "--nice-name=system_server",
                "--runtime-args",
                "com.android.server.SystemServer", //全类名路径
        };
        ZygoteConnection.Arguments parsedArgs = null;

        int pid;

        try {
            parsedArgs = new ZygoteConnection.Arguments(args);
            ZygoteConnection.applyDebuggerSystemProperty(parsedArgs);
            ZygoteConnection.applyInvokeWithSystemProperty(parsedArgs);

            /* Request to fork the system server process */
            /**
             * 创建一个子进程，也就是 SystemServer 进程
             */
            pid = Zygote.forkSystemServer(
                    parsedArgs.uid, parsedArgs.gid,
                    parsedArgs.gids,
                    parsedArgs.debugFlags,
                    null,
                    parsedArgs.permittedCapabilities,
                    parsedArgs.effectiveCapabilities);
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException(ex);
        }

        /* For child process */
        /**
         * 如果当前代码运行在子进程中 ，也就是 SystemServer 进程中
         */
        if (pid == 0) {
            if (hasSecondZygote(abiList)) {
                waitForSecondaryZygote(socketName);
            }
            //关闭 Zygote 进程创建的 Socket
            zygoteServer.closeServerSocket();
            /**
             * 处理 SystemServer 进程
             */
            handleSystemServerProcess(parsedArgs);
        }

        return true;
    }
```

根据上面代码我们还是来分析下当前函数到底干了些什么

* 1. 根据定义的 args ，作为启动 SystemServer  进程的参数。
* 1. 通过  Zygote.forkSystemServer 函数来创建 SystemServer 进程\(其内部也是在 native 创建\)，返回进程 pid
* 1. 如果 pid 为 0 那么就表示已经运行在 SystemServer 进程中了，执行 handleSystemServerProcess 函数

handleSystemServerProcess\(\) 具体处理 SystemServer 逻辑，在文章中第二大点中介绍。

**3. zygoteServer.runSelectLoop\(abiList\);**

SystemServer 进程启动成功之后，会继续回到 ZygoteInit.Main\(\) 中执行 runSelectLoop 函数，下面看下具体实现：

```java
//  com.android.internal.os ZygoteInit.main->runSelectLoop

    void runSelectLoop(String abiList) throws Zygote.MethodAndArgsCaller {
        ArrayList<FileDescriptor> fds = new ArrayList<FileDescriptor>();
        ArrayList<ZygoteConnection> peers = new ArrayList<ZygoteConnection>();

        /**
         * 1. 添加获得该 Socket 的 fd 字段的值
         */
        fds.add(mServerSocket.getFileDescriptor());
        peers.add(null);

        /**
         * 死循环等待 AMS 的请求
         */
        while (true) {
            StructPollfd[] pollFds = new StructPollfd[fds.size()];
            /**
             * 2. 将 fds 信息转存到 pollFds 数组中。
             */
            for (int i = 0; i < pollFds.length; ++i) {
                pollFds[i] = new StructPollfd();
                pollFds[i].fd = fds.get(i);
                pollFds[i].events = (short) POLLIN;
            }
            try {
                Os.poll(pollFds, -1);
            } catch (ErrnoException ex) {
                throw new RuntimeException("poll failed", ex);
            }

            /**
             * 3.对 pollFds 信息进行遍历
             */
            for (int i = pollFds.length - 1; i >= 0; --i) {

                if ((pollFds[i].revents & POLLIN) == 0) {
                    continue;
                }
                //如果 i == 0 那么就认为 服务端 Socket 与客户端连接上了，就是与 AMS 建立了连接
                if (i == 0) {
                    /**
                     * 4.
                     */
                    ZygoteConnection newPeer = acceptCommandPeer(abiList);
                    //将 ZygoteConnection 添加到 Socket 连接列表中
                    peers.add(newPeer);
                    //将 ZygoteConnection 的文件描述符 添加到 fds 列表中
                    fds.add(newPeer.getFileDesciptor());
                } else {//如果不等于 0 ，那么就说明 AMS 向 Zygote 发送了一个创建应用进程的请求
                    /**
                     * 5. 调用 ZygoteConnection 的 runOnce 函数来创建一个新的应用进程，并在成功创建后将这个连接从 Socket 连接列表中 peers、fd 列表中关闭
                     */
                    boolean done = peers.get(i).runOnce(this);
                    if (done) {
                        peers.remove(i);
                        fds.remove(i);
                    }
                }
            }
        }
    }
```

通过上面代码我们分析该函数主要做了些什么

* 1. mServerSocket 就是我们在 registerZygoteSocket 函数中创建的服务器端 Socket,调用 mServerSocket.getFileDescriptor\(\) 函数用来获得该 Socket 的 fd 字段的值并添加到 fds 列表中。接下来就无限循环用来等待 AMS 请求 Zygote 进程创建的新的应用程序进程。
* 1. 将 fds 信息转存到 pollFds 数组中。
* 1. 对 pollFds 信息进行遍历,如果 i == 0 那么就认为 服务端 Socket 与客户端连接上了，就是与 AMS 建立了连接，否则就说明 AMS 向 Zygote 发送了一个创建应用进程的请求,并在成功创建后将这个连接从 Socket 连接列表中 peers、fd 列表中关闭。

**小结**

通过 ZygoteInit main 函数的实现，做一个小总结

* 1. 通过 JNI 调用 ZygoteInit  的 main 函数进入 Zygote 的 Java 框架层；
* 1. 通过 registerZygoteSocket 函数创建服务端 Socket,并通过 runSelectLoop 函数等待 AMS 的请求来创建新的应用程序进程。
* 1. 启动 SystemServer 进程

这一小节相当于给 SystemServer 启动做一个铺垫，知道在哪里调用启动，然后在具体分析。

### 2. SystemServer 进程处理过程

通过上一小节的第二点我们知道最后进入处理 SystemServer 是在 **ZygoteInit.main\(\) -&gt; startSystemServer\(\)** 函数的 **handleSystemServerProcess** 中，那么我们直接看该函数实现

```java
//com.android.internal.os ZygoteInit.main

    private static void handleSystemServerProcess(
            ZygoteConnection.Arguments parsedArgs)
            throws Zygote.MethodAndArgsCaller {

        ...

        if (parsedArgs.invokeWith != null) {
            ...
        } else {
            ClassLoader cl = null;
            if (systemServerClasspath != null) {
                /**
                 * 1. 创建了 PathClassLoader
                 */
                cl = createPathClassLoader(systemServerClasspath, parsedArgs.targetSdkVersion);

                Thread.currentThread().setContextClassLoader(cl);
            }

            /**
             * 2. 调用自己的 zygoteInit 函数
             */
            ZygoteInit.zygoteInit(parsedArgs.targetSdkVersion, parsedArgs.remainingArgs, cl);
        }

        /* should never reach here */
    }
```

在注释 1 处创建了 PathClassLoader 做过热修复跟插件化的相信对它一点不陌生，这里不做详细讲解，可以把它理解为可以动态加载 **JAR/ZIP/APK**, 注释 2 调用了 ZygoteInit.zygoteInit ，代码如下

```java
// com.android.internal.os ZygoteInit

    public static final void zygoteInit(int targetSdkVersion, String[] argv,
            ClassLoader classLoader) throws Zygote.MethodAndArgsCaller {
        if (RuntimeInit.DEBUG) {
            Slog.d(RuntimeInit.TAG, "RuntimeInit: Starting application from zygote");
        }

        Trace.traceBegin(Trace.TRACE_TAG_ACTIVITY_MANAGER, "ZygoteInit");
        RuntimeInit.redirectLogStreams();

        RuntimeInit.commonInit();
        /**
         * 1. 启动 Binder 线程池
         */
        ZygoteInit.nativeZygoteInit();
        /**
         * 2. 进入 SystemServer 的 main 方法
         */
        RuntimeInit.applicationInit(targetSdkVersion, argv, classLoader);
    }
```

注释 1 处调用 ZygoteInit 的 nativeZygoteInit\(\) 函数，其底层就是调用 native 层代码，用于启动 Binder 线程池，这样 SystemServer 就能通过 Binder 与其它进程进行通信了。注释 2 处作用就是反射调用 SystemServer main 函数。

**1. Binder 线程池启动**

因为当前文章主要将 SystemServer 内容，对启动 Binder 源码可以参考 **AndroidRuntime.cpp ，app\_main.cpp** 。

启动成功之后就可以使用 Binder 与其它进程进行通信了。

**2. 进入 SystemServer.java main\(\) 入口**

我们继续回到 ZygoteInit.java 的 zygoteInit 中的 RuntimeInit.applicationInit 调用，代码如下

```java
  //com.android.internal.os RuntimeInit.java

    protected static void applicationInit(int targetSdkVersion, String[] argv, ClassLoader classLoader)
            throws Zygote.MethodAndArgsCaller {
                ....

        invokeStaticMain(args.startClass, args.startArgs, classLoader);
    }
```

```java
    private static void invokeStaticMain(String className, String[] argv, ClassLoader classLoader)
            throws Zygote.MethodAndArgsCaller 
    {
        Class<?> cl;

        try {
            /**
             *1.  通过 className(com.android.server.SystemServer )反射得到SystemServer 类
             * className 通过 AMS 等其它地方传递过来的，并不是唯一
             */
            cl = Class.forName(className, true, classLoader);
        } catch (ClassNotFoundException ex) {
            throw new RuntimeException(
                    "Missing class when invoking static main " + className,
                    ex);
        }

        Method m;
        try {
            /**
             * 2. 拿到 SystemServer  main 函数
             */
            m = cl.getMethod("main", new Class[] { String[].class });
        } catch (NoSuchMethodException ex) {
            ...
        } catch (SecurityException ex) {
            ...
        }

        int modifiers = m.getModifiers();
        if (! (Modifier.isStatic(modifiers) && Modifier.isPublic(modifiers))) {
           ...
        }

        /**
         * 3. 将 m 、argv 传入 MethodAndArgsCaller，然后抛一个异常，并在 ZygoteInit.main 中进行捕获异常
         */
        throw new Zygote.MethodAndArgsCaller(m, argv);
    }
```

通过上面代码我们知道首先通过 **com.android.server.SystemServer** 反射拿到 Class ，其次在通过当前获取到的 Class 拿到它的 main 方法，最后抛了一个 **Zygote.MethodAndArgsCaller\(m, argv\)** 异常。

```java
//com.android.internal.os Zygote.java
    public static class MethodAndArgsCaller extends Exception
            implements Runnable {
            ...
    }
```

，通过上面代码我们知道，它就是继承的 Java 异常父类 Exception ，然后是实现 Runnable 函数。这里写其实很有意思。这里的异常是在 ZygoteInit.java main 函数进行捕获，我们看代码实现

```java
//com.android.internal.os ZygoteInit.java


    public static void main(String argv[]) {
                ...

            if (startSystemServer) {
                /**
                 * 1. 启动 SystemServer 进程
                 *
                 */
                startSystemServer(abiList, socketName, zygoteServer);
            }

          ....
         //2. 捕获异常
        } catch (Zygote.MethodAndArgsCaller caller) {
              //3. 执行 run 函数
            caller.run();
        } catch (Throwable ex) {
            Log.e(TAG, "System zygote died with exception", ex);
            zygoteServer.closeServerSocket();
            throw ex;
        }
    }
```

通过上面代码最后会执行到注释 3 处，我们看内部代码实现

```java
////com.android.internal.os Zygote.java

    public static class MethodAndArgsCaller extends Exception
            implements Runnable {
        /** method to call */
        private final Method mMethod;

        /** argument array */
        private final String[] mArgs;

        public MethodAndArgsCaller(Method method, String[] args) {
            mMethod = method;
            mArgs = args;
        }

        public void run() {
            try {
                /**
                 * 1. 这里就开始执行 SystemServer main 方法了
                 */
                mMethod.invoke(null, new Object[] { mArgs });
            } catch (IllegalAccessException ex) {
                throw new RuntimeException(ex);
            } catch (InvocationTargetException ex) {
                Throwable cause = ex.getCause();
                if (cause instanceof RuntimeException) {
                    throw (RuntimeException) cause;
                } else if (cause instanceof Error) {
                    throw (Error) cause;
                }
                throw new RuntimeException(ex);
            }
        }
    }
```

通过注释 1 ，我们知道这里通过反射直接调用 **SystemServer.java main\(\)** 函数，我们直接看它的 main 实现吧。

```java
//com.android.server SystemServer.java
    /**
     * 这里的 main 函数 主要是 zygote 通过反射调用
     */
    public static void main(String[] args) {
                 //调用内部 run 函数
        new SystemServer().run();
    }
```

```java
//com.android.server SystemServer.java

    private void run() {
        try {

           ...


            /**
             * 创建 主线程的消息 Looper
             */

            Looper.prepareMainLooper();

            // Initialize native services.
            /**
             * 1. 加载动态库 libandroid_servers .so
             */
            System.loadLibrary("android_servers");

            // Check whether we failed to shut down last time we tried.
            // This call may not return.
            performPendingShutdown();

            // Initialize the system context.
            /**
             * 创建系统级别的 Context
             */
            createSystemContext();

            // Create the system service manager.
            /**
             * 2. 创建 SystemServiceManager 它会对系统服务进行创建、启动和生命周期管理
             */
            mSystemServiceManager = new SystemServiceManager(mSystemContext);
            mSystemServiceManager.setRuntimeRestarted(mRuntimeRestart);
            LocalServices.addService(SystemServiceManager.class, mSystemServiceManager);
            // Prepare the thread pool for init tasks that can be parallelized
            SystemServerInitThreadPool.get();
        } finally {
            traceEnd();  // InitBeforeStartServices
        }

        // Start services.
        try {
            traceBeginAndSlog("StartServices");
            /**
             * 3. SystemServiceManager启动了 AMS 、PowerMS、PackageMS 等服务
             */
            startBootstrapServices();
            /**
             * 4. 启动了 DropBoxManagerService、BatteryService、UsageStatsService 和 WebViewUpdateService
             */
            startCoreServices();
            /**
             * 5. 启动了CameraService、AlarmManagerService、VrManagerService 等服务。
             */
            startOtherServices();
            SystemServerInitThreadPool.shutdown();
        } catch (Throwable ex) {
            Slog.e("System", "******************************************");
            Slog.e("System", "************ Failure starting system services", ex);
            throw ex;
        } finally {
            traceEnd();
        }

                ...

        // Loop forever.
        Looper.loop();
        throw new RuntimeException("Main thread loop unexpectedly exited");
    }
```

通过上面代码主要做了哪些事儿，请看下面总结

* 1. 创建消息 Looper
* 1. 加载动态库 libandroid\_servers .so
* 1. 创建系统级别的 Context
* 1. 创建 SystemServiceManager 它会对系统服务进行创建、启动和生命周期管理
* 1. 通过 SystemServiceManager 启动 AMS 、PowerMS、PackageMS 等服务
* 1. 启动 DropBoxManagerService、BatteryService、UsageStatsService 和 WebViewUpdateService 等核心服务，他们父类都是 SystemServer 
* 1. 启动 CameraService、AlarmManagerService、VrManagerService 等服务

从上面代码中的注释 3，4，5 的函数中key9看出，官方把系统分为了 三种类型，分别是引导服务，核心服务和其它服务, 其中其它服务是一些非紧要和不需要立即启动的服务。这 三种类型的服务总有 100 多个，下面列出部分系统服务及其作用。

| 引导服务 | 作用 |
| :--- | :--- |
| Installer | 系统安装 APK 的一个服务类，启动完成 Installer 服务之后才能启动其它系统服务 |
| ActivityManagerService | 负责四大组件的启动、切换、调度 |
| PowerManagerService | 计算系统中和 Power 相关的计算，然后决策系统应该如何反应 |
| LightsService | 管理和显示背光 LED |
| DisplayManagerService | 用来管理所有显示设备 |
| UserManagerService | 多用户模式管理 |
| SensorService | 为系统提供各种感应器服务 |
| PackageManagerService | 用来对 APK 进行安装、解析、删除、卸载等操作 |
| ...... | ...... |

| 核心服务 | 作用 |
| :--- | :--- |
| DropBoxManagerService | 用于生成和管理系统运行时的一些日志文件 |
| BatteryService | 管理电池相关服务 |
| UsageStatsService | 手机用户使用每一个 APP 的频率、使用时长 |
| WebViewUpdateService | WebView 更新服务 |

| 其它服务 | 作用 |
| :--- | :--- |
| CameraService | 摄像头相关服务 |
| AlarmManagerService | 全局定时器管理服务 |
| InputManagerService | 管理输入事件 |
| WindowManagerService | 窗口管理服务 |
| VrManagerService | VR 模式管理服务 |
| BluetoothService | 蓝牙管理服务 |
| NotificationManagerService | 通知管理服务 |
| DeviceStorageMonitorService | 存储相关管理服务 |
| LocationManagerService | 定位管理服务 |
| AudioService | 音频相关管理服务 |
| ...... | ...... |

**3. 举例说明 ActivityManagerService 服务启动**

因为这些服务启动逻辑都是相似的，所以这里以启动 ActivityManagerService 来进行举例，代码如下

```java
//com.android.server SystemServer.java
 private void startBootstrapServices() {

   ...

   //1. 调用 SystemServiceManager 的统一启动服务接口 startService
    mActivityManagerService = mSystemServiceManager.startService(
                ActivityManagerService.Lifecycle.class).getService();
   //2. AMS 与 系统服务管理类进行绑定
    mActivityManagerService.setSystemServiceManager(mSystemServiceManager);
   //3. AMS 与 APK 安装服务进行绑定 
    mActivityManagerService.setInstaller(installer);

   ...
 }
```

我们先看 SystemServiceManager.startService 实现

```java
   //com.android.server SystemServiceManager.java
        public <T extends SystemService> T startService(Class<T> serviceClass) {
        try {
       ....

          try {
                    //1. 反射实例化对象
                Constructor<T> constructor = serviceClass.getConstructor(Context.class);
                service = constructor.newInstance(mContext);
            } catch (InstantiationException ex) {

            ....
                 //2. 
            startService(service);
            return service;
        } finally {
            Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
        }
    }
```

```java
    public void startService(@NonNull final SystemService service) {
        // 1. 
        mServices.add(service);
        // Start it.
        long time = System.currentTimeMillis();
        try {
              //2. 
            service.onStart();
        } catch (RuntimeException ex) {
            ...
        }
        ...
    }
```

通过代码我们知道 serviceClass 就是以参数传递进来的 **ActivityManagerService.Lifecycle.class** 拿到该 class 然后反射实例化 Lifecycle 对象，最后调用 Lifecycle 的 onStart 函数。代码如下

```java
//com.android.server.am ActivityManagerService.java

    public static final class Lifecycle extends SystemService {
        private final ActivityManagerService mService;

        public Lifecycle(Context context) {
            super(context);
              //1. 
            mService = new ActivityManagerService(context);
        }

        @Override
        public void onStart() {
              //2. 
            mService.start();
        }

        public ActivityManagerService getService() {
          //3. 
            return mService;
        }
    }
```

Lifecycle 是 AMS 中的静态内部类，继承系统服务 SystemService , 根据上面注释我们得到，当调用 serviceClass 反射实例化的时候会执行上面注释 1，然后 service.onStart\(\); 对应的是 service 子类 Lifecycle 的 onStart 函数，最后 getService 就是 **mSystemServiceManager.startService\(ActivityManagerService.Lifecycle.class\).getService\(\)** 该函数调用。

到这里 ActivityManagerService 就被 SystemServiceManager 给实例化了。

**小结**

大概总结一下 SystemServer 主要做了就是启动 三种类型 的服务，因为各个服务启动逻辑相似，所以最后以 AMS 来举例说明启动流程。最后 SystemServer 进程启动跟 其它服务启动也讲解完了，最后到了我们总结环节了。

## 总结

我这里就从 Java 框架入口 ZygoteInit.main\(\) 函数到 SystemServer 进程启动和处理服务启动的逻辑执行流程大概总结说明下：

* 1. 创建一个 Server 端为 ”zygote“ 名称的  Socket，用于等待 AMS 请求 Zygote 来创建新的应用程序进程。
* 1. 预处理加载类跟资源。
* 1. 根据 JNI 传递过来的信息来判断是否创建 SystemServer 进程。
* 1. 启动 Binder 线程池，与其它进程进行通信。
* 1. 进入 SystemServer.java main\(\) 函数并创建 SystemServiceManager ，用于对各种服务的创建、启动和生命周期的管理。
* 1. 启动各种系统服务。
* 1. 等待 AMS 请求，用于创建新的应用程序进程。

**AMS 和四大组件工作原理等文章会在后面陆续更新**

## 参考

* 《Android 进阶解密》

