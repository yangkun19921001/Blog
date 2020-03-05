# 电量优化 - battery-historian

## 简介

现在基本上都是人手一部智能手机，你可以发现不管走在街上，公交地铁上，等等任何娱乐办公地方，随处可见有人正在低着头玩手机，有的还随身携带充电宝。由此可见，现在智能手机的电量有多么的不经用，当然我们是优化不了电池的，不过我们可以从 APP 中着手优化，我相信一线大厂也有自己电量分析工具，我相信只要是能够分析电量的工具，都是好工具 \(_^▽^_\)。那么该我们的主角上场了 [Google 开源电量分析工具 battery-historian](https://github.com/google/battery-historian>) 下面就让我们一起来了解下 BatteryHistonian 吧！

## Battery-Historian

### Battery Historian 背景

Battery Historian 是在运行 Android 5.0 Lollipop（API级别21）及更高版本的 Android 设备上检查电池相关信息和事件的工具，而设备未插入。它允许应用程序开发人员在时间线上可视化系统和应用程序级事件通过平移和缩放功能，可以轻松查看自设备上次完全充电以来的各种汇总统计信息，并选择一个应用程序并检查影响所选应用程序特定电池的指标。 它还允许对两个错误报告进行A / B比较，突出显示关键电池相关指标的差异

### Battery Historian 安装

Battery Historian 安装是一个复杂的工程，需要配置一大堆的环境。不过官方给咱们提供了 2 中安装方式，下面让我们一起来了解下吧。

**快速安装 - 百度云**

_battery historian 源码及 JS 环境_ ：[https://pan.baidu.com/s/1D3Guq0WWhTSo7roBxFC-UA](https://pan.baidu.com/s/1D3Guq0WWhTSo7roBxFC-UA) 提取码：g1cx

使用方式：

1. 解压在 GO 的 $GOPATH/目录 执行 5.2 -&gt; 5.4 步骤 
2. IE 浏览器 或者 Google 浏览器输入 [http://localhost:9999/](http://localhost:9999/) 

#### 源码安装 \(推荐\)

源码安装虽然配置的环境很多，但是用起来还是比较稳定，下面就跟我的步伐来一起安装吧。

1. 安装配置 GO 语言
   1. [科学上网下载](https://golang.org/doc/install>) 或者 [使用我下载好的 提取码：nh8p](https://pan.baidu.com/s/1Mbu33vxwHHAHLq7Ma8Z-Og%20)

      ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4e19f57d102?w=949&h=755&f=jpeg&s=138917)

      ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4ddf283bd7d?w=1160&h=490&f=jpeg&s=113253)

   2. 安装 注意更改路径

      ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee494ff6ab1a1?w=492&h=386&f=png&s=26120)

      ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee494fedc3a4e?w=494&h=383&f=png&s=14713)

      ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee494ffeae922?w=495&h=387&f=png&s=22252)

   3. 配置环境

      系统变量中新建 GOROOT GOPATH 变量，然后配置 Path 环境变量

      ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4d9f1ae2f34?w=1079&h=723&f=gif&s=710866)
2. 检查是否安装成功

   在 cmd 命令行中输入 go version 查看是否成功安装及当前版本

   ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4d682e7de15?w=993&h=519&f=jpeg&s=35037)

3. python 安装

   由于 historian.py 脚本是 python2 写的，所以需要安装 python2.7 环境。

   下载安装: [https://www.python.org/](https://www.python.org/)

   云盘提供安装: [https://pan.baidu.com/s/103GXARgc4vIUFgFlVKnrNg](https://pan.baidu.com/s/103GXARgc4vIUFgFlVKnrNg) 提取码：sm8p

   1. 官网下载 2.7 版本

      ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4952f1d209e?w=554&h=332&f=png&s=94398)

   2. 安装 py

      ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4952821c846?w=499&h=429&f=png&s=55820)

      ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4956fd99047?w=499&h=429&f=png&s=55072)

      ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee495965e9d16?w=499&h=429&f=png&s=59673)

   3. 配置环境

      ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4d1bd2e1411?w=541&h=570&f=jpeg&s=126048)

   4. 检验 root 权限输入 python -V

      显示版本号，就说明安装成功了

      ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4ccbc5d3aa8?w=993&h=519&f=jpeg&s=34615)

4. 配置 JAVA 环境

   这个就自己百度配置了哈。

5. 配置 Git 环境

   这个也自己百度吧，很简单。

6. 下载 **Battery Historian** 源码
   1. 在 Git Bash 中输入命令 go get -d -u github.com/google/battery-historian/...（即下载到GOPATH配置目录下）
   2. 进入到$GOPATH/src/github.com/google/battery-historian目录下
   3. 运行 Battery Historian：输入命令行 go run setup.go

      ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4c7cbbb4f24?w=993&h=839&f=jpeg&s=51452)

   4. 运行 Battery Historian.go

      **在 battery-historian 目录下执行** go run cmd/battery-historian/battery-historian.go

      ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4c521437138?w=993&h=839&f=jpeg&s=215213)

   5. 浏览器输入

      [http://localhost:9999](http://localhost:9999/)

      ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4b9559587af?w=1920&h=671&f=jpeg&s=64814)

#### Docker 安装

docker 我这里就粗略的说下，因为在 win10 下安装 坑太多了。还有点不稳定，导致最后使用 _源码安装_。

**准备工作**

**官网下载 Docker :** [https://docs.docker.com/engine/installation/](https://docs.docker.com/engine/installation/)

**win 10 家庭版本缺少 Hyper-V 组件需升级企业版密码钥匙也可以百度:** NPPR9-FWDCX-D2C8J-H872K-2YT43

1. 安装 Docker for Windows Installer 安装步骤直接下一步，安装过程中会出现自动重启电脑。
2. 命令输入运行 docker

   ```java
   docker run --name=battery -d -p 9999:9999 bhaavan/battery-historian
   ```

   ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4bbf1ab494c?w=993&h=519&f=jpeg&s=114927)

3. 验证: 在浏览器上输入 [http://localhost:9999](http://localhost:9999/)

   ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4b9559587af?w=1920&h=671&f=jpeg&s=64814)

**注意：**

1. 如果 win10 企业版安装失败，可以看看[官网提示](https://translate.googleusercontent.com/translate_c?depth=1&hl=zh-CN&prev=search&rurl=translate.google.com&sl=en&sp=nmt4&u=https://github.com/docker/for-win/issues/1263&xid=17259,15700023,15700186,15700190,15700256,15700259&usg=ALkJrhgz4h2dF1utlnoTgLQSC9FQwmUiWA)
2. 如果升级了企业版 那么 VMware 虚拟机用不了，下面给出解决办法。
   1. 关闭 Hyper-V 组件

      ```java
      bcdedit /set hypervisorlaunchtype off
      ```

   2. 开启

      ```java
      bcdedit /set hypervisorlaunchtype auto
      ```

### Battery Historian 使用及数据分析

#### adb 对手机的操作

1. 重置内部数据，相当于清空

   ```java
   adb shell dumpsys batterystats --reset
   ```

2. 获取完整的 wakelock 信息

   ```java
   adb shell dumpsys batterystats --enable full-wake-history
   ```

3. 拔掉 USB 等待一段时间建议长一点，现在随意使用 APP
4. 获得电量报告

   ```java
   // > 6.0
   adb bugreport bugreport.zip
   // <= 6.0
   adb bugreport > bugreport.txt
   ```

5. 提交电量报告，并查看

   ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4b4cea10338?w=1922&h=981&f=gif&s=2693008)

#### 数据参数详细说明

1. WakeLock 级别
   * PARTIAL\_WAKE\_LOCK: 保证 CPU 保持高性能运行，而屏幕和键盘背光（也可能是触摸按键的背光）关闭。一般情况下都会使用这个 WakeLock 。
   * ACQUIRE\_CAUSES\_WAKEUP: 这个WakeLock除了会使 CPU 高性能运行外还会导致屏幕亮起，即使屏幕原先处于关闭的状态下。
   * ON\_AFTER\_RELEASE: 如果释放 WakeLock 的时候屏幕处于亮着的状态，则在释放WakeLock 之后让屏幕再保持亮一小会。如果释放 WakeLock 的时候屏幕本身就没亮，则不会有动作。
   * API17 被弃用的 WakeLock：保持屏幕长亮
     * ```java
       SCREEN_DIM_WAKE_LOCK：保证屏幕亮起，但是亮度可能比较低。同时键盘背光也可以不亮。

       SCREEN_BRIGHT_WAKE_LOCK ：保证屏幕全亮，同时键盘背光也亮。

       FULL_WAKE_LOCK：表现和SCREEN_BRIGHT_WAKE_LOCK 类似，但是区别在于这个等级的WakeLock使用的是最高亮度
       ```
   * 推荐使用
     * ```java
       //在Activity中：
       getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

       //或者在布局中添加这个属性：
       android:keepScreenOn="true"
       ```

**剩下参数由表格说明**

| 参数 | 说明 |
| :--- | :--- |
| CPU runing | cpu 运行的状态, 是否被唤醒 |
| Kernel only uptime | 只有内核运行时间 |
| Activity Manager Proc | 活跃的用户进程 |
| Mobile network type | 网络类型 |
| Mobile radio active | 移动蜂窝信号 比 wiff 耗电 |
| Crashes\(logcat\) | Crashes\(logcat\) 某个时间点出现 crash 的应用 |
| Doze | 是否进入doze 模式 |
| JobScheduler | 异步作业调度,延迟操作，父类 Service |
| SyncManager | 同步操作 |
| Temp White List | 电量优化白名单 |
| Phone call | 是否打电话 |
| GPS | 是否使用 GPS |
| Network connectivity | 网络连接状态 \(wifi、mobile是否连接\) |
| Mobile signal strength | 移动信号强度 \(great\good\moderate\poor\) |
| Wifi scan | 是否在扫描 wifi 信号 |
| Wifi supplicant | 是否有 wifi 请求 |
| Wifi radio | 是否正在通过 wifi 传输数据 |
| Wifi running | wifi 组件是否在工作\(未传输数据\) |
| Wifi on | wifi 组件是否在工作\(未传输数据\) |
| Audio | 音频是否开启 |
| Camera | 相机是否在工作 |
| Video | 是否在播放视频 |
| Foreground process | 前台进程 |
| Package install | 是否在进行包安装 |
| Package active | 包管理在工作 |
| Battery level | 电池当前电量 |
| Temperature | 电池温度 |
| Logcat misc | 是否在导出日志 |
| Plugged | 是否是充电状态 |

#### 当前 APP Stats

![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4ac9b7cbad2?w=1184&h=891&f=jpeg&s=170951)

![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4a9f1c0e8c7?w=1174&h=655&f=jpeg&s=94719)

#### 分析当前 APP 电量详细信息

1. 从上图可以看出 早上 11:00 - 下午 12: 00 这一个小时内电量下降的最快，耗电量最多的罪魁祸首就是 **GPS** 和 **wakelock**  
2. 在 APP Stats -&gt; Device estimated power 中可以查看在这一小时耗电时常，（由上图 Battery Level 得知电量变化过程是 69  - 61 ，1h 下降 8 ）APP 1h 耗电为 5.38 % 还是挺耗电的。

**当前 APP 优化建议:**

GPS ：GPS 可以间断获取，或者使用第三方\(高德、百度\)它们提供省电模式定位，有 wiff 地方切换 wif 定位，少用 高精准定位模式。

网络连接: 有 wiff 地方建议切换 wiff

wakelock : 尽量不要使用。

### 总结-优化方案

#### 1. 加入电量优化白名单

![](https://user-gold-cdn.xitu.io/2019/5/25/16aee4a6be4f9b80?w=397&h=796&f=jpeg&s=22599)

```java
/**
     * 加入电量白名单
     *
     * @param activity
     * @param type 1: 启动 设置页面 2：触发系统对话框
     */
    public static void addWhite(Activity activity, int type) {
        if (activity == null)return;
        WeakReference<Activity> activityWeakReference = new WeakReference<Activity>(activity);
        PowerManager packageManager = (PowerManager) activityWeakReference.get().getApplication()
                .getSystemService(Context.POWER_SERVICE);
        //应用是否在 白名单中
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!packageManager.isIgnoringBatteryOptimizations(activityWeakReference.get().getApplication().getPackageName())) {
                if (type == 1) {
                    //方法1、启动一个  ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS Intent
                    Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                    activityWeakReference.get().getApplication().startActivity(intent);
                } else {
                    //方法2、触发系统对话框
                    Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + activityWeakReference.get().getApplication().getPackageName()));
                    activityWeakReference.get().getApplication().startActivity(intent);
                }
            }
        }
    }
```

#### 2. GPS 优化建议

定位是 App 中常用的功能，但是定位不能千篇一律，不同的场景以及不同类型的 App 对定位更加需要个性化的区分。

* 选择合适的 Location Provider Android系统支持多个 Location Provider：

  GPS\_PROVIDER: GPS 定位，利用 GPS 芯片通过卫星获得自己的位置信息。定位精准度高，一般在 10 米左右，耗电量大；但是在室内，GPS 定位基本没用。

  NETWORK\_PROVIDER： 网络定位，利用手机基站和 WIFI 节点的地址来大致定位位置，这种定位方式取决于服务器，即取决于将基站或 WIFI 节点信息翻译成位置信息的服务器的能力。

  PASSIVE\_PROVIDER: 被动定位，就是用现成的，当其他应用使用定位更新了定位信息，系统会保存下来，该应用接收到消息后直接读取就可以了。比如如果系统中已经安装了百度地图，高德地图\(室内可以实现精确定位\)，你只要使用它们定位过后，再使用这种方法在你的程序肯定是可以拿到比较精确的定位信息。

  使用 Criteria，设置合适的模式、功耗、海拔、速度等需求，系统会返回合适的 Location Provider。 例如你的 App 只是需要一个粗略的定位那么就不需要使用 GPS 进行定位，既耗费电量，定位的耗时也久。

* 及时注销定位监听 在获取到定位之后或者程序处于后台时，注销定位监听，此时监听GPS传感器相当于执行no-op（无操作指令），用户不会有感知但是却耗电。

  ```java
  //如果对定位要求不那么严格的话 可以在关闭屏幕的时候可以暂停 
  public void onPause() {
       super.onPause();
       if(locationManager != null)
           locationManager.removeListener()
   }
  ```

* 多模块使用定位尽量复用 多个模块使用定位，尽量复用上一次的结果，而不是都重新走定位的过程，节省电量损耗；例如：在应用启动的时候获取一次定位，保存结果，之后再用到定位的地方都直接去取。

#### 3.网络切换建议 上传下载尽量用 WIFI

```java
//优化方案 二 ：网络数据切换
        if (!BatteryUtils.isPlugged(getApplicationContext())){
            //如果没有充电，提醒用户是否有可用 wiff 
        }
```

#### 4. WakeLock 亮屏，唤醒 CPU 建议

1. 亮屏替换者

   ```java
   //在Activity中： 
   getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

   //或在布局中添加这个属性：
   android:keepScreenOn="true"
   ```

2. alarm 闹钟让 CPU 间断式工作

   ```java
       /**
        * 开启一个闹钟
        * @param context
        * @param action
        * @param requestId
        * @param interval
        */
       public static void startTimer(Context context,String action,int requestId,int interval) {
           Intent intent = new Intent(action);
           PendingIntent sender = PendingIntent.getBroadcast(context, requestId, intent, PendingIntent.FLAG_CANCEL_CURRENT);

           AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

           Calendar calendar = Calendar.getInstance();
           int second = calendar.get(Calendar.SECOND);
           //延迟一分钟执行
           int delay = 60 - second + 1;
           calendar.add(Calendar.SECOND, delay);
           if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
               String format = new SimpleDateFormat("HH:mm:ss", Locale.CHINA).format(calendar.getTimeInMillis());
               Log.d("下次闹钟执行的时间--》","delay: " + delay +", startMillis: " +format);
               alarmManager.setWindow(AlarmManager.RTC_WAKEUP, calendar.getTimeInMillis(), 100, sender);

           } else {
               alarmManager.setRepeating(AlarmManager.RTC_WAKEUP, calendar.getTimeInMillis(), interval, sender);
           }
       }
   ```

#### 5. JobScheduler \(Service 替代者。 8.0 以后 Google 推荐使用\)

1. 把工作任务放到合适的时间再去执行，比如充电时间，wifi 连接后
2. 也可以把多个任务合并到一起，再选择时间去执行

   ```text
   //需求 现在我需要在充电的状态下并且连接上 wiff 在上传 gps 数据
   //jobScheduler 会自动把数据添加到一个队列中
   //存入数据
       @Override
       public int enqueue(JobInfo job, JobWorkItem work) {
           try {
               return mBinder.enqueue(job, work);
           } catch (RemoteException e) {
               return JobScheduler.RESULT_FAILURE;
           }
       }
   //在适当的时候取出所有数据
       @Override
       public List<JobInfo> getAllPendingJobs() {
           try {
               return mBinder.getAllPendingJobs();
           } catch (RemoteException e) {
               return null;
           }
       }
   ```

   也许有的对这个 jobSchedler 合并任务执行还不是那么清晰，现在看一个录屏

3. 在充电并且连接 wiff 的状态下发送数据（这里旋转屏幕是为了发送数据用的）。
   * 先说一下演示流程 连接 wiff + 充电 正常发送数据
   * 关闭 wiff 发送数据，在打开 wiff 合并发送数据

     ![](https://user-gold-cdn.xitu.io/2019/5/25/16aee49fdc5c6f9a?w=1909&h=897&f=gif&s=3686897)

到这里 咱们电量优化讲的差不多了 最后实际优化了 2% 下去。也还是不错的了。

[代码传送阵](https://github.com/yangkun19921001/battery>)

