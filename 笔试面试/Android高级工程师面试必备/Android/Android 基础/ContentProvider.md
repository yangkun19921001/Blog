### ContentProvider 相关面试题

#### 1. ContentProvider使用方法。

进行跨进程通信，实现进程间的数据交互和共享。通过Context 中 getContentResolver() 获得实例，通过 Uri匹配进行数据的增删改查。ContentProvider使用表的形式来组织数据，无论数据的来源是什么，ConentProvider 都会认为是一种表，然后把数据组织成表格。



#### 2. ContentProvider的权限管理(读写分离，权限控制-精确到表级，URL控制)。

对于ContentProvider暴露出来的数据，应该是存储在自己应用内存中的数据，对于一些存储在外部存储器上的数据，并不能限制访问权限，使用ContentProvider就没有意义了。对于ContentProvider而言，有很多权限控制，可以在AndroidManifest.xml文件中对节点的属性进行配置，一般使用如下一些属性设置：

- android:grantUriPermssions:临时许可标志。
- android:permission:Provider读写权限。
- android:readPermission:Provider的读权限。
- android:writePermission:Provider的写权限。
- android:enabled:标记允许系统启动Provider。
- android:exported:标记允许其他应用程序使用这个Provider。
- android:multiProcess:标记允许系统启动Provider相同的进程中调用客户端。



#### 3. 说说ContentProvider、ContentResolver、ContentObserver 之间的关系？

ContentProvider：管理数据，提供数据的增删改查操作，数据源可以是数据库、文件、XML、网络等，ContentProvider为这些数据的访问提供了统一的接口，可以用来做进程间数据共享。

ContentResolver：ContentResolver可以为不同URI操作不同的ContentProvider中的数据，外部进程可以通过ContentResolver与ContentProvider进行交互。

ContentObserver：观察ContentProvider中的数据变化，并将变化通知给外界。



####4. Android 系统为什么会设计ContentProvider？

【参考】

在开发中，假如，A、B 进程有部分信息需要同步，这个时候怎么处理呢？设想这么一个场

景，有个业务复杂的 Activity 非常占用内存，并引发 OOM，所以，想要把这个 Activity 放到

单独进程，以保证 OOM 时主进程不崩溃。但是，两个整个 APP 有些信息需要保持同步，比

如登陆信息等，无论哪个进程登陆或者修改了相应信息，都要同步到另一个进程中去，这个

时候怎么做呢？



第一种：一个进程里面的时候，经常采用 SharePreference 来做，但是 SharePreference 不支

持多进程，它基于单个文件的，默认是没有考虑同步互斥，而且，APP 对 SP 对象做了缓存，

不好互斥同步，虽然可以通过 FileLock 来实现互斥，但同步仍然是一个问题。



第二种：基于 Binder 通信实现 Service 完成跨进程数据的共享，能够保证单进程访问数据，

不会有互斥问题，可是同步的事情仍然需要开发者手动处理。



第三种：基于 Android 提供的 ContentProvider 来实现，ContentProvider 同样基于 Binder，

不存在进程间互斥问题，对于同步，也做了很好的封装，不需要开发者额外实现。ContentProvider 只是 Android 为了跨进程共享数据提供的一种机制，本身基于 Binder 实现，在操作数据上只是一种抽象，具体要自己实现ContentProvider 只能保证进程间的互斥，无法保证进程内，需要自己实现

ContentResolver 接口的 notifyChange 函 数 来 通 知 那 些 注 册 了 监 控 特 定 URI 的

ContentObserver 对象，使得它们可以相应地执行一些处理。ContentObserver 可以通过

registerContentObserver 进行注册。既然是对外提供数据共享，那么如何限制对方的使用呢？

android:exported 属性非常重要。这个属性用于指示该服务是否能够被其他应用程序组件调用或跟它交互。如果设置为 true，则能够被调用或交互，否则不能。设置为 false 时，只有同一个应用程序的组件或带有相同用户 ID 的应用程序才能启动或绑定该服务

https://blog.csdn.net/happylishang/article/details/78550156



####5. ContentProvider 与 DB 关系，provider可以调用 db 么？

【参考】

1、ContentProvider 提供了对底层数据存储方式的抽象。比如上图中，底层使用了 SQLite 数

据库，在用了 ContentProvider 封装后，即使你把数据库换成 MongoDB，也不会对上层数据

使用层代码产生影响。

2、Android 框架中的一些类需要 ContentProvider 类型数据。如果你想让你的数据可以使用

在如 SyncAdapter, Loader, CursorAdapter 等类上，那么你就需要为你的数据做一层

ContentProvider 封装。

3、第三个原因也是最主要的原因，是 ContentProvider 为应用间的数据交互提供了一个安全

的环境。它准许你把自己的应用数据根据需求开放给其他应用进行增、删、改、查，而不用

担心直接开放数据库权限而带来的安全问题。

https://www.jianshu.com/p/f5ec75a9cfea

