

如果你想使用Android自带的API来实现室内定位，可以尝试使用Wi-Fi定位。这里有一个简单的室内定位工具类示例：

1. 在你的项目的AndroidManifest.xml文件中添加以下权限：

```
xmlCopy code
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

1. 在项目中创建一个名为`IndoorLocationHelper.java`的文件：

```
javaCopy code
import android.content.Context;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;

public class IndoorLocationHelper {
    private final Context mContext;
    private LocationManager mLocationManager;
    private LocationListener mLocationListener;

    public IndoorLocationHelper(Context context) {
        mContext = context;
        mLocationManager = (LocationManager) mContext.getSystemService(Context.LOCATION_SERVICE);
    }

    public void startLocationUpdates(LocationListener listener) {
        mLocationListener = listener;

        try {
            mLocationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0, 0, mLocationListener);
        } catch (SecurityException e) {
            e.printStackTrace();
        }
    }

    public void stopLocationUpdates() {
        if (mLocationManager != null && mLocationListener != null) {
            mLocationManager.removeUpdates(mLocationListener);
        }
    }
}
```

1. 现在，在你的主活动（MainActivity）中，使用`IndoorLocationHelper`类开始和停止位置更新：

```
javaCopy code
import android.location.Location;
import android.location.LocationListener;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private IndoorLocationHelper mIndoorLocationHelper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mIndoorLocationHelper = new IndoorLocationHelper(this);

        mIndoorLocationHelper.startLocationUpdates(new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {
                // 处理位置更新
            }

            @Override
            public void onStatusChanged(String provider, int status, Bundle extras) {
            }

            @Override
            public void onProviderEnabled(String provider) {
            }

            @Override
            public void onProviderDisabled(String provider) {
            }
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        mIndoorLocationHelper.stopLocationUpdates();
    }
}
```

这个示例使用Android的LocationManager来获取基于网络的位置更新。但是，请注意，这种方法的准确性可能不如专门的室内定位解决方案（如IndoorAtlas）。

在使用这种方法时，还要确保用户已经授予了位置权限。在Android 6.0（API级别23）及更高版本的设备上，需要在运行时请求这些权限。你可以使用`ActivityCompat.requestPermissions()`方法在运行时请求位置权限。