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