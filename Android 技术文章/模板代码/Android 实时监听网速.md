


## TrafficStats类实现Android监听网速



**一、网络状态**

Android市场的逐渐降温及形成稳定，其实说明了Android的发展走向稳重成熟的阶段。

除却最开始的功能实现，到如今的用户体验至上，Android研发面临的挑战却从未冷却。基于大多数APP均是以APP为数据展示框架，实现客户与服务器数据交互，网络扮演了十分重要的角色。

网络状态，除了WiFi，数据，网络不可用等，还有网络条件不好等情形。存有标志网络速度的则能较好地标示当前网络情形。

以下则实现监听网速，展示当前网速条件。借由给客户更好的用户体验。

**二、实现监听网速**

TrafficStats类提供了以下方法，关于统计网速：

```java
    /**
     * static long getMobileRxBytes()//获取通过Mobile连接收到的字节总数，但不包含WiFi static long
     * getMobileRxPackets()//获取Mobile连接收到的数据包总数 static long
     * getMobileTxBytes()//Mobile发送的总字节数 static long
     * getMobileTxPackets()//Mobile发送的总数据包数 static long
     * getTotalRxBytes()//获取总的接受字节数，包含Mobile和WiFi等 static long
     * getTotalRxPackets()//总的接受数据包数，包含Mobile和WiFi等 static long
     * getTotalTxBytes()//总的发送字节数，包含Mobile和WiFi等 static long
     * getTotalTxPackets()//发送的总数据包数，包含Mobile和WiFi等 static long
     * getUidRxBytes(int uid)//获取某个网络UID的接受字节数 static long getUidTxBytes(int
     * uid) //获取某个网络UID的发送字节数
     */
```

实现整体思路：

创建浮动窗口，用于展示网速状态；应用程序后台运行，浮动窗口依旧显示，则使用Service展示浮动窗口；在Activity中开启Service。

网速监听主体功能实现，TrafficBean.java：

```java
package com.future.netobserverdemo.bean;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.TrafficStats;
import android.os.Handler;
import android.os.Message;
import android.util.Log;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Timer;
import java.util.TimerTask;

/**
 * 功能：流量Bean属性信息
 * 作者：vision
 * 时间：2016/10/19
 */
public class TrafficBean implements Serializable {
    /**
     * static long getMobileRxBytes()//获取通过Mobile连接收到的字节总数，但不包含WiFi static long
     * getMobileRxPackets()//获取Mobile连接收到的数据包总数 static long
     * getMobileTxBytes()//Mobile发送的总字节数 static long
     * getMobileTxPackets()//Mobile发送的总数据包数 static long
     * getTotalRxBytes()//获取总的接受字节数，包含Mobile和WiFi等 static long
     * getTotalRxPackets()//总的接受数据包数，包含Mobile和WiFi等 static long
     * getTotalTxBytes()//总的发送字节数，包含Mobile和WiFi等 static long
     * getTotalTxPackets()//发送的总数据包数，包含Mobile和WiFi等 static long
     * getUidRxBytes(int uid)//获取某个网络UID的接受字节数 static long getUidTxBytes(int
     * uid) //获取某个网络UID的发送字节数
     */

    /**
     * 不支持状态【标识变量】
     */
    private static final int UNSUPPORT = -1;
    /**
     * 打印信息标志
     */
    private static final String TAG = "TrafficBean";
    /**
     * 当前对象实例
     */
    private static TrafficBean instance;
    /**
     * 当前应用的uid
     */
    static int UUID;
    /**
     * 上一次记录网络字节流
     */
    private long preRxBytes = 0;
    /**
     *
     */
    private Timer mTimer = null;
    /**
     * 上下文对象
     */
    private Context context;
    /**
     * 消息处理器
     */
    private Handler handler;
    /**
     * 更新频率
     */
    private final int UPDATE_FREQUENCY = 1;
    private int times = 1;

    /**
     * 构造方法
     *
     * @param context
     * @param handler
     * @param uid
     */
    public TrafficBean(Context context, Handler handler, int uid) {
        this.context = context;
        this.handler = handler;
        this.UUID = uid;
    }

    public TrafficBean(Context context, Handler handler) {
        this.context = context;
        this.handler = handler;
    }

    /**
     * 获取实例对象
     *
     * @param context
     * @param handler
     * @return
     */
    public static TrafficBean getInstance(Context context, Handler handler) {
        if (instance == null) {
            instance = new TrafficBean(context, handler);
        }
        return instance;
    }

    /**
     * 获取总流量
     *
     * @return
     */
    public long getTrafficInfo() {
        long recTraffic = UNSUPPORT;//下载流量
        long sendTraffic = UNSUPPORT;//上传流量
        recTraffic = getRecTraffic();
        sendTraffic = getSendTraffic();

        if (recTraffic == UNSUPPORT || sendTraffic == UNSUPPORT) {
            return UNSUPPORT;
        } else {
            return recTraffic + sendTraffic;
        }
    }

    /**
     * 获取上传流量
     *
     * @return
     */
    private long getSendTraffic() {
        long sendTraffic = UNSUPPORT;
        sendTraffic = TrafficStats.getUidTxBytes(UUID);
        if (sendTraffic == UNSUPPORT) {
            return UNSUPPORT;
        }
        RandomAccessFile rafSend = null;
        String sndPath = "/proc/uid_stat/" + UUID + "/tcp_snd";
        try {
            rafSend = new RandomAccessFile(sndPath, "r");
            sendTraffic = Long.parseLong(rafSend.readLine());
        } catch (FileNotFoundException e) {
            Log.e(TAG, "FileNotFoundException: " + e.getMessage());
            sendTraffic = UNSUPPORT;
        } catch (IOException e) {
            Log.e(TAG, "IOException: " + e.getMessage());
            e.printStackTrace();
        } finally {
            try {
                if (rafSend != null)
                    rafSend.close();
            } catch (IOException e) {
                Log.w(TAG, "Close RandomAccessFile exception: " + e.getMessage());
            }
        }
        return sendTraffic;
    }

    /**
     * 获取下载流量
     * 某个应用的网络流量数据保存在系统的
     * /proc/uid_stat/$UID/tcp_rcv | tcp_snd文件中
     *
     * @return
     */
    private long getRecTraffic() {
        long recTraffic = UNSUPPORT;
        recTraffic = TrafficStats.getUidRxBytes(UUID);
        if (recTraffic == UNSUPPORT) {
            return UNSUPPORT;
        }
        Log.i(TAG, recTraffic + " ---1");
        //访问数据文件
        RandomAccessFile rafRec = null;
        String rcvPath = "/proc/uid_stat/" + UUID + "/tcp_rcv";
        try {
            rafRec = new RandomAccessFile(rcvPath, "r");
            recTraffic = Long.parseLong(rafRec.readLine()); // 读取流量统计
        } catch (FileNotFoundException e) {
            Log.e(TAG, "FileNotFoundException: " + e.getMessage());
            recTraffic = UNSUPPORT;
        } catch (IOException e) {
            Log.e(TAG, "IOException: " + e.getMessage());
            e.printStackTrace();
        } finally {
            try {
                if (rafRec != null)
                    rafRec.close();
            } catch (IOException e) {
                Log.w(TAG, "Close RandomAccessFile exception: " + e.getMessage());
            }
        }
        Log.i("test", recTraffic + "--2");
        return recTraffic;
    }

    /**
     * 获取当前下载流量总和
     *
     * @return
     */
    public static long getNetworkRxBytes() {
        return TrafficStats.getTotalRxBytes();
    }

    /**
     * 获取当前上传流量总和
     *
     * @return
     */
    public static long getNetworkTxBytes() {
        return TrafficStats.getTotalTxBytes();
    }

    /**
     * 获取当前网速
     *
     * @return
     */
    public double getNetSpeed() {
        long curRxBytes = getNetworkRxBytes();
        if (preRxBytes == 0)
            preRxBytes = curRxBytes;
        long bytes = curRxBytes - preRxBytes;
        preRxBytes = curRxBytes;
        //int kb = (int) Math.floor(bytes / 1024 + 0.5);
        double kb = (double) bytes / (double) 1024;
        BigDecimal bd = new BigDecimal(kb);

        return bd.setScale(1, BigDecimal.ROUND_HALF_UP).doubleValue();
    }

    /**
     * 开启流量监控
     */
    public void startCalculateNetSpeed() {
        preRxBytes = getNetworkRxBytes();
        if (mTimer != null) {
            mTimer.cancel();
            mTimer = null;
        }
        if (mTimer == null) {
            mTimer = new Timer();
            mTimer.schedule(new TimerTask() {
                @Override
                public void run() {
                    if (times == UPDATE_FREQUENCY) {
                        Message msg = new Message();
                        msg.what = 1;
                        //msg.arg1 = getNetSpeed();
                        msg.obj = getNetSpeed();
                        handler.sendMessage(msg);
                        times = 1;
                    } else {
                        times++;
                    }
                }
            }, 1000, 1000);
        }
    }

    /**
     * 停止网速监听计算
     */
    public void stopCalculateNetSpeed() {
        if (mTimer != null) {
            mTimer.cancel();
            mTimer = null;
        }
    }

    /**
     * 获取当前应用uid
     *
     * @return
     */
    public int getUid() {
        try {
            PackageManager pm = context.getPackageManager();
            //修改
            ApplicationInfo ai = pm.getApplicationInfo(context.getPackageName(), PackageManager.GET_META_DATA);
            return ai.uid;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        return -1;
    }
}
```

Service中创建浮动窗口，展示网速状态，ManagerService.java:

```java
public class ManagerService extends Service {
    private static final String TAG = "ManagerService";
    /**
     * 浮动窗口布局
     */
    private LinearLayout floatLL;
    public WindowManager.LayoutParams params;
    /**
     * 浮动串口布局参数
     */
    public WindowManager windowManager;
    public TextView floatTV;
    private ServiceBinder binder = new ServiceBinder();

    @Override
    public void onCreate() {
        super.onCreate();
        createFloatView();
    }

    /**
     * 创建浮动窗口布局
     */
    private void createFloatView() {
        params = new WindowManager.LayoutParams();
        windowManager = (WindowManager) getApplication().getSystemService(getApplication().WINDOW_SERVICE);
        params.type = WindowManager.LayoutParams.TYPE_SYSTEM_ALERT;// 设置window
        // type为TYPE_SYSTEM_ALERT
        params.format = PixelFormat.RGBA_8888;// 设置图片格式，效果为背景透明
        params.flags = WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;// 设置浮动窗口不可聚焦（实现操作除浮动窗口外的其他可见窗口的操作）
        params.gravity = Gravity.LEFT | Gravity.TOP;// 默认位置：左上角
        params.width = WidgetUtils.dpToPx(getApplicationContext(), 65);
        params.height = WindowManager.LayoutParams.WRAP_CONTENT;
        params.x = (WidgetUtils.getScreenWidth(getApplicationContext()) - params.width) / 2;// 设置x、y初始值，相对于gravity
        params.y = 10;
        // 获取浮动窗口视图所在布局
        LayoutInflater inflater = LayoutInflater.from(getApplication());
        floatLL = (LinearLayout) inflater.inflate(R.layout.float_layout, null);
        windowManager.addView(floatLL, params);// 添加mFloatLayout
        floatTV = (TextView) floatLL.findViewById(R.id.move_desc);
        floatTV.measure(View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED), View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED));
        // 设置监听浮动窗口的触摸移动
        floatTV.setOnTouchListener(new View.OnTouchListener() {

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                // getRawX是触摸位置相对于屏幕的坐标，getX是相对于按钮的坐标
                params.x = (int) event.getRawX() - floatTV.getMeasuredWidth() / 2;
                Log.i(TAG, "RawX" + event.getRawX());
                Log.i(TAG, "X" + event.getX());
                params.y = (int) event.getRawY() - floatTV.getMeasuredHeight() / 2 - 25;// 减25为状态栏的高度
                Log.i(TAG, "RawY" + event.getRawY());
                Log.i(TAG, "Y" + event.getY());
                windowManager.updateViewLayout(floatLL, params);// 刷新
                return false; // 此处必须返回false，否则OnClickListener获取不到监听
            }
        });
        floatTV.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View arg0) {
                Toast.makeText(getApplicationContext(), "浮动窗口被点击了！", Toast.LENGTH_SHORT).show();
            }
        });
    }

    public void setSpeed(String str) {
        floatTV.setText(str);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (floatLL != null && windowManager != null) {
            windowManager.removeView(floatLL);// 移除悬浮窗口
        }
        startService(new Intent(this, ManagerService.class));
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY_COMPATIBILITY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }

    @Override
    public void onTrimMemory(int level) {
        super.onTrimMemory(level);
    }

    public class ServiceBinder extends Binder {
        public ManagerService getService() {
            return ManagerService.this;
        }
    }
}
```

Activity中绑定service，实现功能：

```java
public class MainActivity extends AppCompatActivity {
    /**
     * Activity管理器
     */
    private ActivityManager activityManager;
    /**
     * 浮动图标
     */
    private TextView moveDesc;
    /**
     * 消息处理器
     */
    private Handler handler;
    /**
     * 流量信息对象
     */
    private TrafficBean trafficBean;
    /**
     * 服务
     */
    private ManagerService service;
    /**
     * 标记信息
     */
    private static final String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        activityManager = (ActivityManager) getSystemService(ACTIVITY_SERVICE);
        moveDesc = (TextView) findViewById(R.id.tv);

        try {
            handler = new Handler() {
                @Override
                public void handleMessage(Message msg) {
                    if (msg.what == 1) {
                        moveDesc.setText(msg.obj + "kb/s");
                        if (service != null) {
                            service.setSpeed(msg.obj + "kb/s");
                        }
                    }
                    super.handleMessage(msg);
                }
            };
            trafficBean = new TrafficBean(this, handler, 12580);
            trafficBean.startCalculateNetSpeed();
        } catch (Exception e) {
            e.printStackTrace();
        }

        Log.d(TAG, "总流量 = " + trafficBean.getTrafficInfo());
        Intent intent = new Intent(MainActivity.this, ManagerService.class);
        bindService(intent, conn, Context.BIND_AUTO_CREATE);
    }

    private ServiceConnection conn = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder iBinder) {
            service = ((ManagerService.ServiceBinder) iBinder).getService();
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            service = null;
        }
    };

    @Override
    protected void onDestroy() {
        super.onDestroy();
        trafficBean.stopCalculateNetSpeed();
        unbindService(conn);
    }
}
```

**三、细节注意**

1，使用与创建对应，onCreate()中绑定，onDestory()中解绑；

2，清单文件配置权限及服务和广播接收者。

```java
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
```

```java
<service android:name="com.future.netobserverdemo.service.ManagerService" />
```

```java
 
       <receiver android:name="com.future.netobserverdemo.service.ManagerReceiver">
            <intent-filter android:priority="2147483647"> <!-- 优先级加最高 -->
                <!-- 系统启动完成后会调用 -->
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <!-- 解锁完成后会调用 -->
                <action android:name="android.intent.action.USER_PRESENT" />
                <!-- 监听情景切换 -->
                <action android:name="android.media.RINGER_MODE_CHANGED" />
            </intent-filter>
        </receiver>
```

