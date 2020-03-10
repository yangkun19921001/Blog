### Context 相关面试题题

#### 1. Context

- 1、Activity和Service以及Application的Context是不一样的,Activity继承自ContextThemeWraper.其他的继承自ContextWrapper。
- 2、每一个Activity和Service以及Application的Context是一个新的ContextImpl对象。
- 3、getApplication()用来获取Application实例的，但是这个方法只有在Activity和Service中才能调用的到。那也许在绝大多数情况下我们都是在Activity或者Servic中使用Application的，但是如果在一些其它的场景，比如BroadcastReceiver中也想获得Application的实例，这时就可以借助getApplicationContext()方法，getApplicationContext()比getApplication()方法的作用域会更广一些，任何一个Context的实例，只要调用getApplicationContext()方法都可以拿到我们的Application对象。
- 4、创建对话框时不可以用Application的context，只能用Activity的context。
- 5、Context的数量等于Activity的个数 + Service的个数 +1，这个1为Application。



#### 2. ApplicationContext和ActivityContext的区别

这是两种不同的context，也是最常见的两种.第一种中context的生命周期与Application的生命周期相关的，context随着Application的销毁而销毁，伴随application的一生，与activity的生命周期无关.第二种中的context跟Activity的生命周期是相关的，但是对一个Application来说，Activity可以销毁几次，那么属于Activity的context就会销毁多次.至于用哪种context，得看应用场景。还有就是，在使用context的时候，小心内存泄露，防止内存泄露，注意一下几个方面：

- 不要让生命周期长的对象引用activity context，即保证引用activity的对象要与activity本身生命周期是一样的。
- 对于生命周期长的对象，可以使用application context。
- 避免非静态的内部类，尽量使用静态类，避免生命周期问题，注意内部类对外部对象引用导致的生命周期变化。