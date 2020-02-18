## 前言

我们熟知一般 Android 工程师都是在应用层上开发，不会涉及系统源码，但是如果你想往底层发展，或者深入插件化、Framework 系统层等开发工作，如果不了解 Android 源码可是不行的，那么接下来我基于自己的理解跟学习来记录跟 Android 开发息息相关的源码分析，大概从 Android 中的 SystemServer 启动、四大组件启动、AMS、PMS 等几个维度来介绍，下面是我的计划，当然在未来也有可能改变。

**还没有关注的小伙伴，可以先关注一波，系列文章会持续更新。**

[Android 8.0 源码分析 (一) SystemServer 进程启动](https://juejin.im/post/5db3f95ee51d4529e83947f9)

[Android 8.0 源码分析 (二) Launcher 启动]()

[Android 8.0 源码分析 (三) 应用程序进程启动]()

[Android 8.0 源码分析 (四) Activity 启动]()

[Android 8.0 源码分析 (五) Service 启动]()

[Android 8.0 源码分析 (六) BroadcastReceiver 启动]()

[Android 8.0 源码分析 (七) ContentProvider 启动]()

## 介绍

前面 2 篇我们学习了 Android 的系统服务进程启动和桌面 Launcher 的启动，那么基于前面学的内容，这一篇将带来应用程序进程的启动过程分析，如果对 Zygote、SystemServer、Launcher 启动原理还不了解的建议先看下我前面文章。

## 应用程序进程简介

想要启动一个应用程序，首先要保证这个应用程序所需要的应用程序进程已经启动。 AMS 在启动应用程序时会检查这个应用程序需要的应用程序进程是否存在，不存在就会请求 Zygote 进程启动需要的应用程序进程。在 [Android 8.0 源码分析 (一) SystemServer 进程启动](https://juejin.im/post/5db3f95ee51d4529e83947f9) 中我们知道在 Zygote 的 Java 框架层中会创建一个 Server 端的 Socket , 这个 Socket 就是用来等待 AMS 请求 Zygote 创建新的应用程序进程。Zygote 进程通过 fock 自身创建的应用程序进程，这样应用程序就会获得 Zygote 进程在启动时创建的虚拟机实例。当然，在应用程序进程创建过程中除了获取虚拟机实例外，还创建了 Bindler 线程池和消息循环，这样运行在应用进程中的应用程序就可以方便的使用 Binder 进行进程间通信以及处理消息了。

## 应用程序进程启动过程介绍

应用程序进程创建过程的步骤比较多，这里分为两个部分来讲解，分别是 AMS 发送启动应用程序进程请求，以及 Zygote 接收请求并创建应用程序进程。

### AMS 发送启动应用程序进程请求

先来看一下 AMS 发送启动应用程序进程请求过程的时序图，然后对每一个步骤进行详细分析。

![KykGXn.png](https://s2.ax1x.com/2019/10/27/KykGXn.png)

AMS 如果想要启动应用程序进程，就需要向 Zygote 进程发送创建应用程序进程的请求， AMS 会通过调用 startProcessLocked 函数向 Zygote 进程发送请求，如下所示:

```java
//com.android.server.am; ActivityManagerService.java

    /**
     * 启动进程的函数
     * @param app
     * @param hostingType
     * @param hostingNameStr
     * @param abiOverride
     * @param entryPoint
     * @param entryPointArgs
     */
    private final void startProcessLocked(
            ProcessRecord app, String hostingType,
            String hostingNameStr, String abiOverride,
            String entryPoint, String[] entryPointArgs){
      
        ...
          
        try {
            try {
                final int userId = UserHandle.getUserId(app.uid);
                AppGlobals.getPackageManager().checkPackageStartable(app.info.packageName, userId);
            } catch (RemoteException e) {
                throw e.rethrowAsRuntimeException();
            }

            /**
             * 1. 获取要创建的应用程序进程的 用户 id 
             */
            int uid = app.uid;
            int[] gids = null;
            int mountExternal = Zygote.MOUNT_EXTERNAL_NONE;
            if (!app.isolated) {
              ...

                /**
                 * 2. 对 gids 进行创建和赋值
                 */
                if (ArrayUtils.isEmpty(permGids)) {
                    gids = new int[3];
                } else {
                    gids = new int[permGids.length + 3];
                    System.arraycopy(permGids, 0, gids, 3, permGids.length);
                }
                gids[0] = UserHandle.getSharedAppGid(UserHandle.getAppId(uid));
                gids[1] = UserHandle.getCacheAppGid(UserHandle.getAppId(uid));
                gids[2] = UserHandle.getUserGid(UserHandle.getUserId(uid));
            }
           ...
            boolean isActivityProcess = (entryPoint == null);
            /**
             * 3. 如果 entryPoint == null 那么将 ActivityThread 全类名赋值给 entryPoint
             */
            if (entryPoint == null) entryPoint = "android.app.ActivityThread";
            Trace.traceBegin(Trace.TRACE_TAG_ACTIVITY_MANAGER, "Start proc: " +
                    app.processName);
            checkTime(startTime, "startProcess: asking zygote to start proc");
            ProcessStartResult startResult;
            if (hostingType.equals("webview_service")) {
                startResult = startWebView(entryPoint,
                        app.processName, uid, uid, gids, debugFlags, mountExternal,
                        app.info.targetSdkVersion, seInfo, requiredAbi, instructionSet,
                        app.info.dataDir, null, entryPointArgs);
            } else {

                /**
                 * 4. 在 AMS 中调用 start 函数进行通知 Zygote fork 进程
                  */
                startResult = Process.start(entryPoint,
                        app.processName, uid, uid, gids, debugFlags, mountExternal,
                        app.info.targetSdkVersion, seInfo, requiredAbi, instructionSet,
                        app.info.dataDir, invokeWith, entryPointArgs);
            }
          ...
    }
```

总结下上面代码意思，可分为 4 个步骤:

- 1. 获取创建应用程序进程的用户 ID
- 2. 对用户组 ID(gids)进行创建和赋值
- 3. 如果 entryPoint 为 null ，就把 ActivityThread 全类名赋值给它
- 4. 调用 Process 的 start 函数

Process.start 的第一个函数就是 **android.app.ActivityThread** ，后面小节会用到它，它就是关键所在，好了下面我们看下 Process 的 start 函数:

```java
//android.os; Process.java

    public static final ProcessStartResult start(final String processClass,
                                  final String niceName,
                                  int uid, int gid, int[] gids,
                                  int debugFlags, int mountExternal,
                                  int targetSdkVersion,
                                  String seInfo,
                                  String abi,
                                  String instructionSet,
                                  String appDataDir,
                                  String invokeWith,
                                  String[] zygoteArgs) {
      	//1. 通过 ZygoteProcess 调用 start 函数
        return zygoteProcess.start(processClass, niceName, uid, gid, gids,
                    debugFlags, mountExternal, targetSdkVersion, seInfo,
                    abi, instructionSet, appDataDir, invokeWith, zygoteArgs);
    }

```

在 Process.start 静态函数中我们看到，又调用了 ZygoteProcess 的 start 函数，其实 ZygoteProcess 是用于与 Zygote 进程保持通信的状态，该 start 函数如下:

```java
//android.os; ZygoteProcess.java

    public final Process.ProcessStartResult start(final String processClass,
                                                  final String niceName,
                                                  int uid, int gid, int[] gids,
                                                  int debugFlags, int mountExternal,
                                                  int targetSdkVersion,
                                                  String seInfo,
                                                  String abi,
                                                  String instructionSet,
                                                  String appDataDir,
                                                  String invokeWith,
                                                  String[] zygoteArgs) {
        try {
            /**
             * 继续调用当前类的 startViaZygote 函数
             */
            return startViaZygote(processClass, niceName, uid, gid, gids,
                    debugFlags, mountExternal, targetSdkVersion, seInfo,
                    abi, instructionSet, appDataDir, invokeWith, zygoteArgs);
        } catch (ZygoteStartFailedEx ex) {
            Log.e(LOG_TAG,
                    "Starting VM process through Zygote failed");
            throw new RuntimeException(
                    "Starting VM process through Zygote failed", ex);
        }
    }

    private Process.ProcessStartResult startViaZygote(final String processClass,
                                                      final String niceName,
                                                      final int uid, final int gid,
                                                      final int[] gids,
                                                      int debugFlags, int mountExternal,
                                                      int targetSdkVersion,
                                                      String seInfo,
                                                      String abi,
                                                      String instructionSet,
                                                      String appDataDir,
                                                      String invokeWith,
                                                      String[] extraArgs)
                                                      throws ZygoteStartFailedEx {

        //创建一个集合 将应用程序进程启动参数保存
        ArrayList<String> argsForZygote = new ArrayList<String>();

        // --runtime-args, --setuid=, --setgid=,
        // and --setgroups= must go first
        argsForZygote.add("--runtime-args");
        argsForZygote.add("--setuid=" + uid);
        argsForZygote.add("--setgid=" + gid);
       ...//省略部分代码

        synchronized(mLock) {
         //继续调用内部函数
            return zygoteSendArgsAndGetResult(openZygoteSocketIfNeeded(abi), argsForZygote);
        }
    }
```

通过上面代码我们知道主要就是将应用程序进程启动参数告诉 zygoteSendArgsAndGetResult 然后通过 Socket 传递给 zygote 进程，我们先来看 openZygoteSocketIfNeeded(abi) 实现

```java
//android.os; ZygoteProcess.java
    @GuardedBy("mLock")
    private ZygoteState openZygoteSocketIfNeeded(String abi) throws ZygoteStartFailedEx {
        Preconditions.checkState(Thread.holdsLock(mLock), "ZygoteProcess lock not held");

        if (primaryZygoteState == null || primaryZygoteState.isClosed()) {
            try {
                /**
                 * 1. 连接 zygote 名称为 "zygote" 服务端的 Socket ，建立进程间通信
                 */
                primaryZygoteState = ZygoteState.connect(mSocket);
            } catch (IOException ioe) {
                throw new ZygoteStartFailedEx("Error connecting to primary zygote", ioe);
            }
        }

        /**
         * 2. 连接 Zygote 主模式返回的 ZygoteState 是否与启动应用程序进程所需要的 ABI 匹配
         */
        if (primaryZygoteState.matches(abi)) {
            return primaryZygoteState;
        }

        // 如果不匹配，则尝试连接 zygote 辅模式
        if (secondaryZygoteState == null || secondaryZygoteState.isClosed()) {
            try {
                /**
                 * 3. 如果不匹配那么就尝试连接 name 为 "zygote_secondary" 的 Socket
                 */
                secondaryZygoteState = ZygoteState.connect(mSecondarySocket);
            } catch (IOException ioe) {
                throw new ZygoteStartFailedEx("Error connecting to secondary zygote", ioe);
            }
        }

        /**
         * 4. 连接 Zygote 辅模式返回的 ZygoteState 是否与启动应用程序进程所需要的 ABI 匹配
         */
        if (secondaryZygoteState.matches(abi)) {
            return secondaryZygoteState;
        }

        //如果都不匹配那么就抛一个异常
        throw new ZygoteStartFailedEx("Unsupported zygote ABI: " + abi);
    }
```

通过上面的代码跟注释我们知道就是与 zygote 进程通过 Socket 进行一个连接，连接成功之后会返回一个 ZygoteState,然后对传递进来的 abi 进行匹配，这里连接和匹配 abi 涉及到 Zygote 的启动脚本，感兴趣的可以查阅相关资料，通俗的来讲就是如果 Zygote 进程采用的是 init.zygote32_64.rc 脚本启动，那么它就是属于主模式为 “name” 名称的服务端 Socket, 如果采用的是 init.zygote64_32.rc 脚本启动，那么它就是属于辅模式为 “zygote_secondary” 名称的服务端 Socket。最后如果都不匹配说明连接或者匹配异常了。如果连接成功之后我们看 zygoteSendArgsAndGetResult 函数主要做了些什么工作:

```java
//android.os; ZygoteProcess.java
    private static Process.ProcessStartResult zygoteSendArgsAndGetResult(
            ZygoteState zygoteState, ArrayList<String> args)
            throws ZygoteStartFailedEx {
       			...
            final BufferedWriter writer = zygoteState.writer;
            final DataInputStream inputStream = zygoteState.inputStream;

            writer.write(Integer.toString(args.size()));
            writer.newLine();

            for (int i = 0; i < sz; i++) {
                String arg = args.get(i);
                writer.write(arg);
                writer.newLine();
            }

            writer.flush();

            ...
            }
            return result;
        } catch (IOException ex) {
            zygoteState.close();
            throw new ZygoteStartFailedEx(ex);
        }
    }
```

通过上面代码我们知道，如果与 zygote 进程的服务端 Socket 连接成功，那么就将存储起来的应用程序进程启动参数写入到 ZygoteState 中。最后就是 Zygote 进程接收后的处理工作了，下面一小节来详细为大家介绍接收之后的工作。

### Zygote 接收请求并创建应用程序进程

如果有看过 [Android 8.0 源码分析 (一) SystemServer 进程启动](https://juejin.im/post/5db3f95ee51d4529e83947f9) 该文章的一定清楚，其实 SystemServer 跟 应用进程启动在 Zygote 的方式相似，这里咱们为了复习一下之前的内容，我们就再来温习一遍吧，先来看一个时序图。

![KymKkq.png](https://s2.ax1x.com/2019/10/27/KymKkq.png)

上面我们讲了在温习一下 ZygoteInit main 函数，那么我们在看一下 服务端的 Socket 创建

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

在上面注释 1 处通过 registerZygoteSocket 函数来创建一个名称为 “name” 的服务端 Socket, 这个 Socket 是用于等待 AMS 发起创建新的应用程序进程的请求，关于 AMS 后面我会详细讲解。注释 3 启动服务进程，注释 4 等待 AMS 的请求，我们直接看 注释 4 的代码实现

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

通过上面注释我们知道，如果 AMS 发来了一个新的请求任务，会走注释 5 通过 peers.get(i).runOnce(this); 来处理请求数据，我们直接看 runOnce 函数具体实现:

```java
//com.android.internal.os; ZygoteConnection.java
    boolean runOnce(ZygoteServer zygoteServer) throws Zygote.MethodAndArgsCaller {

        String args[];
        Arguments parsedArgs = null;
        FileDescriptor[] descriptors;

        try {
            /**
             * 1. 获取应用程序进程的启动参数
             */
            args = readArgumentList();
            descriptors = mSocket.getAncillaryFileDescriptors();
        } catch (IOException ex) {
            Log.w(TAG, "IOException on command socket " + ex.getMessage());
            closeSocket();
            return true;
        }
				...
        int pid = -1;
        FileDescriptor childPipeFd = null;
        FileDescriptor serverPipeFd = null;

        try {
            /**
             * 2. 将获取到启动应用程序进程的启动参数 args 数组 封装到 Arguments 类型的 parsedArgs 对象中
             */
            parsedArgs = new Arguments(args);

           ...
            fd = null;

            /**
             * 3. 通过 Zygote 来创建应用程序进程
             */
            pid = Zygote.forkAndSpecialize(parsedArgs.uid, parsedArgs.gid, parsedArgs.gids,
                    parsedArgs.debugFlags, rlimits, parsedArgs.mountExternal, parsedArgs.seInfo,
                    parsedArgs.niceName, fdsToClose, fdsToIgnore, parsedArgs.instructionSet,
                    parsedArgs.appDataDir);
        } catch (ErrnoException ex) {
          ...
        }

        try {
            //当前代码逻辑运行在被创建出来的子进程中
            if (pid == 0) {
                // in child
                zygoteServer.closeServerSocket();
                IoUtils.closeQuietly(serverPipeFd);
                serverPipeFd = null;
                //4. 处理应用程序进程
                handleChildProc(parsedArgs, descriptors, childPipeFd, newStderr);

                // should never get here, the child is expected to either
                // throw Zygote.MethodAndArgsCaller or exec().
                return true;
            } else {
                // in parent...pid of < 0 means failure
                IoUtils.closeQuietly(childPipeFd);
                childPipeFd = null;
                return handleParentProc(pid, descriptors, serverPipeFd, parsedArgs);
            }
        } finally {
            IoUtils.closeQuietly(childPipeFd);
            IoUtils.closeQuietly(serverPipeFd);
        }
    }
```

通过上面代码我们知道这里 runOnce 首先获取到启动应用程序进程的参数，然后进行一个 Argument 的包装，最后通过 Zygote.forkAndSpecialize 创建 AMS 传递过来启动进程信息，内部其实是 native 函数来进行创建。接下来我们看 注释 4 处理创建完成的应用程序进程，如下代码:

```java
//com.android.internal.os; ZygoteConnection.java    
		private void handleChildProc(Arguments parsedArgs,
            FileDescriptor[] descriptors, FileDescriptor pipeFd, PrintStream newStderr)
            throws Zygote.MethodAndArgsCaller {
        ...
        if (parsedArgs.invokeWith != null) {
            ...
        } else {
            //调用 ZygoteInit 的 zygoteInit 函数
            ZygoteInit.zygoteInit(parsedArgs.targetSdkVersion,
                    parsedArgs.remainingArgs, null /* classLoader */);
        }
    }
```

handleChildProc 内部又调用了 ZygoteInit 的 zygoteInit 函数，具体我们看下源码:

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
         * 2. 进入 ActivityThread 的 main 方法
         */
        RuntimeInit.applicationInit(targetSdkVersion, argv, classLoader);
    }

```

注释 1 处先启动 Binder 线程池，用于进程间通信，我们注解看注释 2 内部实现

```java
  //com.android.internal.os RuntimeInit.java
    protected static void applicationInit(int targetSdkVersion, String[] argv, ClassLoader classLoader)
            throws Zygote.MethodAndArgsCaller {
       	...
        invokeStaticMain(args.startClass, args.startArgs, classLoader);
    }

    private static void invokeStaticMain(String className, String[] argv, ClassLoader classLoader)
            throws Zygote.MethodAndArgsCaller 
    {
        Class<?> cl;

        try {
            /**
             *1.  通过 className("android.app.ActivityThread" )反射得到 ActivityThread 类
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
             * 2. 拿到 ActivityThread  main 函数
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

通过上面代码首先根据 AMS 传递过来的启动参数 **android.app.ActivityThread** 然后进行反射拿到 ActivityThread 实例，在通过它的实例拿到 main 函数，最后交于 Zygote.MethodAndArgsCaller(m, argv); 异常来处理，直接看 ZygoteInit.main() 函数

```java
//com.android.internal.os.ZygoteInit.java
    public static void main(String argv[]) {

	    ....

        try {
          
          ...

          	//服务端 Socket 名称
            String socketName = "zygote";

					...
          

            /**
             * 1. 创建服务端的 Socket ,名称为 "zygote"
             */

            zygoteServer.registerServerSocket(socketName);
           
        		...
            /**
             * 2. 等待 AMS 请求
             */
            zygoteServer.runSelectLoop(abiList);

        } catch (Zygote.MethodAndArgsCaller caller) {
          	//3. 捕获到 RuntimeInit applicationInit 中的异常
            caller.run();
        } catch (Throwable ex) {
            Log.e(TAG, "System zygote died with exception", ex);
            zygoteServer.closeServerSocket();
            throw ex;
        }
    }


```

根据注释 3 我们知道捕获到了 RuntimeInit applicationInit 中的异常，然后进入它的 run 函数

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
                 * 1. 这里就开始执行 ActivityThread main 方法了
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

到了这里 应用程序的进程创建和 应用程序进程的入口 ActivityThread main 都已经执行了，下面我们来看 ActivityThead main 函数实现:

```java
//android.app; ActivityThread.java
    //通过 ZygoteInit 反射调用执行的
    public static void main(String[] args) {
        ...
        //1. 主线程消息循环 Looper 创建
        Looper.prepareMainLooper();
        //2. 创建 ActivityThread 对象
        ActivityThread thread = new ActivityThread();
        //3. Application,Activity ......入口
        thread.attach(false);
				//4. 拿到 H -> Handler
        if (sMainThreadHandler == null) {
            sMainThreadHandler = thread.getHandler();
        }

        ...
        //5. 开启 Looper 循环，处理主线程消息
        Looper.loop();

        throw new RuntimeException("Main thread loop unexpectedly exited");
    }
```

通过上面代码我们知道 ActivityThread main 函数主要做了 5 件事:

- 1. 主线程消息循环 Looper 创建
- 2. 创建 ActivityThread 对象
- 3. 开启 Application,Activity ......入口
- 4. 拿到 H -> Handler
- 5. 开启 Looper 循环，处理主线程消息

我们直接跳到注释 3 处

```java
//

    private void attach(boolean system) {
       	....
          //1. 拿到 IActivityManager aidl 接口
            final IActivityManager mgr = ActivityManager.getService();
            try {
                //2. 关联 Application
                mgr.attachApplication(mAppThread);
            } catch (RemoteException ex) {
                throw ex.rethrowFromSystemServer();
            }
            ...
            try {
                mInstrumentation = new Instrumentation();
              	//3. 创建系统级别的 Context
                ContextImpl context = ContextImpl.createAppContext(
                        this, getSystemContext().mPackageInfo);
              	//4. 创建 Application 对象
                mInitialApplication = context.mPackageInfo.makeApplication(true, null);
              	//5. Application oncreate 生命周期调用
                mInitialApplication.onCreate();
            } catch (Exception e) {
                throw new RuntimeException(
                        "Unable to instantiate Application():" + e.toString(), e);
            }
        }

        ...
    }
```

我们直接看应用程序 Application 创建吧，跳到注释 4 

```java
//android.app; LoadedApk.java
    public Application makeApplication(boolean forceDefaultAppClass,
            Instrumentation instrumentation) {
        if (mApplication != null) {
            return mApplication;
        }

       ...
            ContextImpl appContext = ContextImpl.createAppContext(mActivityThread, this);
            //1. 创建一个新的 Application
            app = mActivityThread.mInstrumentation.newApplication(
                    cl, appClass, appContext);
           
        } catch (Exception e) {
           ..}
        mApplication = app;

        if (instrumentation != null) {
            try {
                instrumentation.callApplicationOnCreate(app);
            } catch (Exception e) {
               ...

        return app;
    }
```

我们继续看注释 1 的实现

```java
//android.app; Instrumentation.java
    public Application newApplication(ClassLoader cl, String className, Context context)
            throws InstantiationException, IllegalAccessException, 
            ClassNotFoundException {
              //调用内部的 newApplication 函数
        return newApplication(cl.loadClass(className), context);
    }

    static public Application newApplication(Class<?> clazz, Context context)
            throws InstantiationException, IllegalAccessException, 
            ClassNotFoundException {
        //反射进行实例化 Application
        Application app = (Application)clazz.newInstance();
        //执行 Application 生命周期函数 attach
        app.attach(context);
        return app;
    }
```

到这里应用程序进程的创建 再到应用程序的 Application 的启动已经介绍完了

## 总结

本篇文章涉及到的知识点很多有 Zygote、AMS、ActivityThread、Application 等等，相信如果跟着我的系列文章来阅读的话，收获肯定还是有的。

在这里就简单的总结下应用程序进程的启动，**首先通过 Launcher  中的点击事件触摸手机屏幕中的应用图标，AMS 会收到启动应用程序进程的信息，然后通过 Socket 传递给 Zygote 进程，Zygote 进程收到 AMS 传递过来的启动信息进行 native 层创建子进程，最后通过反射调用 ActivityThead main 函数，最终在 ActivityThead  attach 函数中通过反射实例化了 Application 并执行了对应的生命周期函数** 。到这里该应用程序进程就 执行到了 Application 中了。下一篇文章将为大家带来四大组件中的 Activity 源码分析，敬请期待！

## 参考

- 《Android 进阶解密》





