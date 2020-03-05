# 性能优化\(十二\)进程保活

## 简介

现在只要是社交 APP 没有哪个开发者不想让自己的 APP 永久常驻的，想要永久常驻除非你们家的实力非常雄厚，APP 用户量非常大，那么厂商都会主动来找你，把你们家的 APP 加入白名单。否则永久常驻是不可能甚至都不给你权限后台运行。既然不能永久常驻，那么我们有没有一个办法可以使我们的 APP 不那么容易被系统杀死勒？或者说是杀死后能主动唤醒，显然是可以的，下面我们进入主题吧。

## 怎么使用

1. down 代码 [https://github.com/yangkun19921001/KeepAlive.git](https://github.com/yangkun19921001/KeepAlive.git) ，将 live\_library 放入自己工程
2. 在 KeepAliveRuning onRuning 中实现需要保活的代码

   ```java
   public class KeepAliveRuning implements IKeepAliveRuning {
       /**这里实现 Socket / 推送 等一些保活组件*/
       @Override
       public void onRuning() {
           //TODO--------------------------------------------
           Log.e("runing?KeepAliveRuning", "true");
       }

       @Override
       public void onStop() {
           Log.e("runing?KeepAliveRuning", "false");
       }
   }
   ```

3. 开启保活

   ```java
       public void start() {
           //启动保活服务
           KeepAliveManager.toKeepAlive(
                   getApplication()
                   , HIGH_POWER_CONSUMPTION,
                   "进程保活",
                   "Process: System(哥们儿) 我不想被杀死",
                   R.mipmap.ic_launcher,
                   new ForegroundNotification(
                           //定义前台服务的通知点击事件
                           new ForegroundNotificationClickListener() {
                               @Override
                               public void foregroundNotificationClick(Context context, Intent intent) {
                                   Log.d("JOB-->", " foregroundNotificationClick");
                               }
                           })
           );
       }
   ```

4. 停止保活

   ```java
      KeepAliveManager.stopWork(getApplication());
   ```

## 最终效果

### 开启保活

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3xno8palog30xu0m4b2d.jpg)

我们应该知道正常的话点击手机回收垃圾桶后台的应用都会被 kill 掉，还有主动点击 AS Logcat 的进程停止运行的按钮，我们也会发现进程会自动起来并且 pid 跟上一次不一样了。要的就是这种效果，下面我们来了解下进程保活的知识吧.

* 长时间运行，不被杀死，如果被杀死双进程会启动死掉的进程

  ![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3y4897xkyj309s0jmq5f.jpg)

### 未开启保活

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3xo2efw7wg30ar0m41jq.jpg)

[代码传送阵](https://github.com/yangkun19921001/KeepAlive>)

## 进程优先级

[官网详细介绍](https://developer.android.google.cn/guide/components/processes-and-threads.html?hl=zh-cn>)

### 进程

如果内存不足，而其他为用户提供更紧急服务的进程又需要内存时，Android 可能会决定在某一时刻关闭某一进程。在被终止进程中运行的应用组件也会随之销毁。 当这些组件需要再次运行时，系统将为它们重启进程。

决定终止哪个进程时，Android 系统将权衡它们对用户的相对重要程度。例如，相对于托管可见 Activity 的进程而言，它更有可能关闭托管屏幕上不再可见的 Activity 的进程。 因此，是否终止某个进程的决定取决于该进程中所运行组件的状态。 下面，我们介绍决定终止进程所用的规则。

### 进程生命周期

Android 系统将尽量长时间地保持应用进程，但为了新建进程或运行更重要的进程，最终需要移除旧进程来回收内存。 为了确定保留或终止哪些进程，系统会根据进程中正在运行的组件以及这些组件的状态，将每个进程放入“重要性层次结构”中。 必要时，系统会首先消除重要性最低的进程，然后是重要性略逊的进程，依此类推，以回收系统资源。

重要性层次结构一共有 5 级。以下列表按照重要程度列出了各类进程（第一个进程_最重要_，将是_最后一个被终止_的进程）：

| 名称 | 概括 | 回收状态 |
| :--- | :--- | :--- |
| 前台进程 | 正在交互 | 只有在内存不足以支持它们同时继续运行这一万不得已的情况下，系统才会终止它们 |
| 可见进程 | 没有任何前台组件、但仍会影响用户在屏幕上所见内容的进程 | 可见进程被视为是极其重要的进程，除非为了维持所有前台进程同时运行而必须终止，否则系统不会终止这些进程。 |
| 服务进程 | 正在运行已使用 `startService()` 方法启动的服务且不属于上述两个更高类别进程的进程。 | 除非内存不足以维持所有前台进程和可见进程同时运行，否则系统会让服务进程保持运行状态。 |
| 后台进程 | 对用户不可见的 Activity 的进程 | 系统可能随时终止它们 |
| 空进程 | 不含任何活动应用组件的进程 | 最容易为杀死 |

## LMK\(LowMemoryKiller\)

* 为什么引入 LMK ?

  进程的启动分冷启动和热启动，当用户退出某一个进程的时候，并不会真正的将进程退出，而是将这个进程放到后台，以便下次启动的时候可以马上启动起来，这个过程名为热启动，这也是Android 的设计理念之一。这个机制会带来一个问题，每个进程都有自己独立的内存地址空间，随着应用打开数量的增多, 系统已使用的内存越来越大，就很有可能导致系统内存不足。为了解决这个问题，系统引入 LowmemoryKiller \(简称 lmk \) 管理所有进程，根据一定策略来 kill 某个进程并释放占用的内存，保证系统的正常运行。

* LMK 基本原理

  所有应用进程都是从 zygote 孵化出来的，记录在 AMS 中mLruProcesses 列表中，由 AMS 进行统一管理，AMS 中会根据进程的状态更新进程对应的 oom\_adj 值，这个值会通过文件传递到 kernel 中去，kernel 有个低内存回收机制，在内存达到一定阀值时会触发清理 oom\_adj 值高的进程腾出更多的内存空间

* LMK 杀进程标准

  minfree : 存放6个数值，单位内存页面数 \( 一个页面 4kb \)

  ![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3xovie8xyj30nr0efdg9.jpg)

| 内存阈值 | 内存回收阈值 | 对应进程 |
| :--- | :--- | :--- |
| 18432 | 72 M | .前台进程（foreground） |
| 23040 | 90 M | 可见进程（visible） |
| 27648 | 108 M | 次要服务（secondary server） |
| 32256 | 126 M | 后台进程（hidden） |
| 36864 | 144 M | 内容供应节点（content provider） |
| 46080 | 180 M | 空进程（empty） |

当内存到 180 M的时候会将空进程进行回收，当内存到 144 M 的时候把空进程回收完以后开始对内容供应节点进行回收，并不是所有的内容供应节点都回收，而是通过判断它的优先级进行回收，优先级是用 oom\_adj 的值来表示，值越大回收的几率越高

adj 查看:

```java
  cat /sys/module/lowmemorykiller/parameters/adj
```

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3xp8r31oyj30ge01agle.jpg)

查看进程 adj 值：

```java
  adb shell ps
```

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3xozty2a6j30nr0ef0tc.jpg)

值越低越不易被回收，0 代表就不会被回收。

内存阈值在不同的手机上不一样，一旦低于该值, Android 便开始按顺序关闭进程. 因此 Android 开始结束优先级最低的空进程，即当可用内存小于 180MB \(46080\)

## 进程保活方案

### Activity 提权

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3xpm0wpnsg311v0m44q9.jpg)

这里可见 oom\_adj 为 0 是不会被回收的

后台 oom\_adj 为 6 内存不足会被回收

锁屏 oom\_adj 开启一像素 Activity 为 0 相当于可见进程，不易被回收

**实现原理:**

监控手机锁屏解锁事件，在屏幕锁屏时启动 1 个像素透明的 Activity ，在用户解锁时将 Activity 销毁掉，从而达到提高进程优先级的作用。

**代码实现**

1. 创建 onePxActivity

   ```java
       @Override
       protected void onCreate(Bundle savedInstanceState) {
           super.onCreate(savedInstanceState);
           //设定一像素的activity
           Window window = getWindow();
           window.setGravity(Gravity.START | Gravity.TOP);
           WindowManager.LayoutParams params = window.getAttributes();
           params.x = 0;
           params.y = 0;
           params.height = 1;
           params.width = 1;
           window.setAttributes(params);
           //在一像素activity里注册广播接受者    接受到广播结束掉一像素
           br = new BroadcastReceiver() {
               @Override
               public void onReceive(Context context, Intent intent) {
                   finish();
               }
           };
           registerReceiver(br, new IntentFilter("finish activity"));
           checkScreenOn("onCreate");
       }
   ```

2. 创建锁屏开屏广播接收

   ```java
       @Override
       public void onReceive(final Context context, Intent intent) {
           if (intent.getAction().equals(Intent.ACTION_SCREEN_OFF)) {    //屏幕关闭的时候接受到广播
               appIsForeground = IsForeground(context);
               try {
                   Intent it = new Intent(context, OnePixelActivity.class);
                   it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                   it.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
                   context.startActivity(it);
               } catch (Exception e) {
                   e.printStackTrace();
               }
               //通知屏幕已关闭，开始播放无声音乐
               context.sendBroadcast(new Intent("_ACTION_SCREEN_OFF"));
           } else if (intent.getAction().equals(Intent.ACTION_SCREEN_ON)) {   //屏幕打开的时候发送广播  结束一像素
               context.sendBroadcast(new Intent("finish activity"));
               if (!appIsForeground) {
                   appIsForeground = false;
                   try {
                       Intent home = new Intent(Intent.ACTION_MAIN);
                       home.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                       home.addCategory(Intent.CATEGORY_HOME);
                       context.getApplicationContext().startActivity(home);
                   } catch (Exception e) {
                       e.printStackTrace();
                   }
               }
               //通知屏幕已点亮，停止播放无声音乐
               context.sendBroadcast(new Intent("_ACTION_SCREEN_ON"));
           }
       }
   ```

### Service 提权

创建一个前台服务用于提高 app 在按下 home 键之后的进程优先级

```java
private void startService(Context context) {
        try {
            Log.i(TAG, "---》启动双进程保活服务");
            //启动本地服务
            Intent localIntent = new Intent(context, LocalService.class);
            //启动守护进程
            Intent guardIntent = new Intent(context, RemoteService.class);
            if (Build.VERSION.SDK_INT >= 26) {
                startForegroundService(localIntent);
                startForegroundService(guardIntent);
            } else {
                startService(localIntent);
                startService(guardIntent);
            }
        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
        }
    }
```

注意如果开启 startForegroundService 前台服务，那么必须在 5 s内开启一个前台进程的服务通知栏,不会报 ANR

```java
startForeground(KeepAliveConfig.FOREGROUD_NOTIFICATION_ID, notification);
```

### 广播拉活\(在 8.0 以下很受用\)

在发生特定系统事件时，系统会发出广播，通过在 AndroidManifest 中静态注册对应的广播监听器，即可在发生响应事件时拉活。但是从android 7.0 开始，对广播进行了限制，而且在 8.0 更加严格。

以静态广播的形式注册

```java
<receiver android:name=".receive.NotificationClickReceiver">
<intent-filter>
<action android:name="CLICK_NOTIFICATION"></action>
</intent-filter>
</receiver>
```

### 全家桶 拉活

有多个 app 在用户设备上安装，只要开启其中一个就可以将其他的app 也拉活。比如手机里装了手 Q、QQ 空间、兴趣部落等等，那么打开任意一个 app 后，其他的 app 也都会被唤醒。

### Service 机制拉活

将 Service 设置为 START\_STICKY，利用系统机制在 Service 挂掉后自动拉活

只要 targetSdkVersion 不小于5，就默认是 START\_STICKY。 但是某些 ROM 系统不会拉活。并且经过测试，Service 第一次被异常杀死后很快被重启，第二次会比第一次慢，第三次又会比前一次慢，一旦在短时间内 Service 被杀死 4-5 次，则系统不再拉起。

### 账号同步拉活（只做了解，不靠谱）

手机系统设置里会有 “帐户” 一项功能，任何第三方 APP 都可以通过此功能将数据在一定时间内同步到服务器中去。系统在将 APP 帐户同步时，会将未启动的 APP 进程拉活

### JobScheduler 拉活\(靠谱，8.0 官方推荐\)

JobScheduler 允许在特定状态与特定时间间隔周期执行任务。可以利用它的这个特点完成保活的功能,效果即开启一个定时器，与普通定时器不同的是其调度由系统完成。

注意 setPeriodic 方法 在 7.0 以上如果设置小于 15 min 不起作用，可以使用setMinimumLatency 设置延时启动，并且轮询

```java
    public static void startJob(Context context) {
        try {
            mJobScheduler = (JobScheduler) context.getSystemService(
                    Context.JOB_SCHEDULER_SERVICE);
            JobInfo.Builder builder = new JobInfo.Builder(10,
                    new ComponentName(context.getPackageName(),
                            JobHandlerService.class.getName())).setPersisted(true);
            /**
             * I was having this problem and after review some blogs and the official documentation,
             * I realised that JobScheduler is having difference behavior on Android N(24 and 25).
             * JobScheduler works with a minimum periodic of 15 mins.
             *
             */
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                //7.0以上延迟1s执行
                builder.setMinimumLatency(KeepAliveConfig.JOB_TIME);
            } else {
                //每隔1s执行一次job
                builder.setPeriodic(KeepAliveConfig.JOB_TIME);
            }
            mJobScheduler.schedule(builder.build());

        } catch (Exception e) {
            Log.e("startJob->", e.getMessage());
        }
    }
```

### 推送拉活

根据终端不同，在小米手机（包括 MIUI）接入小米推送、华为手机接入华为推送。

### Native 拉活

Native fork 子进程用于观察当前 app 主进程的存亡状态。对于 5.0以上成功率极低。

### 后台循环播放一条无声文件

```java
//如果选择流氓模式，就默认接收了耗电的缺点，但是保活效果很好。     
if (mediaPlayer == null && KeepAliveConfig.runMode == RunMode.HIGH_POWER_CONSUMPTION) {
            mediaPlayer = MediaPlayer.create(this, R.raw.novioce);
            mediaPlayer.setVolume(0f, 0f);
            mediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                @Override
                public void onCompletion(MediaPlayer mediaPlayer) {
                    Log.i(TAG, "循环播放音乐");
                    play();
                }
            });
            play();
        }
```

### 双进程守护 \(靠谱\)

两个进程相互绑定 \(bindService），如果有其中一个进程被杀，那么另外一个进程就会将被杀的进程重新拉起

![](https://cdn.sinaimg.cn.52ecy.cn/large/005BYqpgly1g3xq1l3ahyj30mk06cq36.jpg)

## 总结

进程保活就讲到这里了，最后我自己是结合里面最靠谱的（Activity + Service 提权 + Service 机制拉活 + JobScheduler 定时检测进程是否运行 + 后台播放无声文件 + 双进程守护），然后组成了一个 进程保活终极方案。

