#  ADB 使用

##  adb wiff 或者 USB 调式手机

### wiff

直接输入命令 adb connect IP:5555

### usb

1. 设置 adb tcpip 填写自定义端口

   电脑端显示 **restarting in**  ..... 可以进行下一步了

2. 输入命令 adb connect IP:自定义端口

   connect to ...... 表示连接成功

1.  将安卓设备usb连接到电脑
2.  设备链接到wifi
3.  Ping设备ip，检查是否可通信
4.  在cmd依次输入以下命令：
5.  adb usb
6.  adb kill-server
7.  adb tcpip 5555
8.  adb connect youip:5555
9.  拔掉usb插头即可
---------------------


## 情况出现：

打开androidstudio，一直连接不上电脑，提示：Unable to start adb server: error: protocol fault (couldn't read status): Connection reset by peer

## 问题原因：

大多数情况是5037端口被占用。5037为adb默认端口。

## 解决办法：

查看哪个程序占用了adb端口，结束这个程序，然后重启adb就好了。

### 版本

1. 

   

    使用命令：netstat -aon|findstr "5037"找到占用5037端口的进程PID。

   

   ![img](https:////upload-images.jianshu.io/upload_images/3144381-116646d6b4e715bf?imageMogr2/auto-orient/strip%7CimageView2/2/w/801/format/webp)

   image

2. 

   

    使用命令：tasklist|findstr "5440"通过PID找出进程。

   

   ![img](https:////upload-images.jianshu.io/upload_images/3144381-c58c00de6779770b?imageMogr2/auto-orient/strip%7CimageView2/2/w/797/format/webp)

   image

3. 调出任务管理器，找到这个进程，结束进程。
4. 使用命令:adb start-server 启动adb就行了



ADB很强大，记住一些ADB命令有助于提高工作效率。

1. 获取序列号：

   ```
    adb get-serialno
   ```

   ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

2. 查看连接计算机的设备：

   ```
    adb devices
   ```

   ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

3. 重启机器：

   ```
    adb reboot
   ```

   ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

4. 重启到bootloader，即刷机模式：

   ```
    adb reboot bootloader
   ```

   ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

5. 重启到recovery，即恢复模式：

   ```
    adb reboot recovery
   ```

   ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

6. 查看log：

   ```
    adb logcat
   ```

   ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

7. 终止adb服务进程：

   ```
    adb kill-server
   ```

8. 重启adb服务进程：

   ```
    adb start-server
   ```

   ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

9. 获取机器MAC地址：

   ```
    adb shell  cat /sys/class/net/wlan0/address
   ```

10. 获取 CPU info：

   ```
   adb shell cat /proc/cpuinfo
   
   
   ```

   ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

11. 安装APK：

    ```
    adb install <apkfile> //比如：adb install baidu.apk
    ```

12. 保留数据和缓存文件，重新安装apk：

    ```
    adb install -r <apkfile> //比如：adb install -r baidu.apk
    ```

13. 安装apk到sd卡：

    ```
    adb install -s <apkfile> // 比如：adb install -s baidu.apk
    ```

14. 卸载APK：

    ```
    adb uninstall <package> //比如：adb uninstall com.baidu.search
    ```

15. 卸载app但保留数据和缓存文件：

    ```
    adb uninstall -k <package> //比如：adb uninstall -k com.baidu.search
    ```

16. 启动应用：

    ```
    adb shell am start -n <package_name>/.<activity_class_name>
    ```

17. 查看设备cpu和内存占用情况：

    ```
    adb shell top
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

18. 查看占用内存前6的app：

    ```
    adb shell top -m 6
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

19. 刷新一次内存信息，然后返回：

    ```
    adb shell top -n 1
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

20. 查询各进程内存使用情况：

    ```
    adb shell procrank
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

21. 杀死一个进程：

    ```
    adb shell kill [pid]
    ```

22. 查看进程列表：

    ```
    adb shell ps
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

23. 查看指定进程状态：

    ```
    adb shell ps -x [PID]
    ```

24. 查看后台services信息：

    ```
    adb shell service list
    ```

25. 查看当前内存占用：

    ```
    adb shell cat /proc/meminfo
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

26. 查看IO内存分区：

    ```
    adb shell cat /proc/iomem
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

27. 将system分区重新挂载为可读写分区：

    ```
    adb remount
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

28. 从本地复制文件到设备：

    ```
    adb push <local> <remote>
    ```

29. 从设备复制文件到本地：

    ```
    adb pull <remote>  <local>
    ```

30. 列出目录下的文件和文件夹，等同于dos中的dir命令：

    ```
    adb shell ls
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

31. 进入文件夹，等同于dos中的cd 命令：

    ```
    adb shell cd <folder>
    ```

32. 重命名文件：

    ```
    adb shell rename path/oldfilename path/newfilename
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

33. 删除system/avi.apk：

    ```
    adb shell rm /system/avi.apk
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

34. 删除文件夹及其下面所有文件：

    ```
    adb shell rm -r <folder>
    ```

35. 移动文件：

    ```
    adb shell mv path/file newpath/file
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

36. 设置文件权限：

    ```
    adb shell chmod 777 /system/fonts/DroidSansFallback.ttf
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

37. 新建文件夹：

    ```
    adb shell mkdir path/foldelname
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

38. 查看文件内容：

    ```
    adb shell cat <file>
    ```

39. 查看wifi密码：

    ```
    adb shell cat /data/misc/wifi/*.conf
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

40. 清除log缓存：

    ```
    adb logcat -c
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

41. 查看bug报告：

    ```
    adb bugreport
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

42. 获取设备名称：

    ```
    adb shell cat /system/build.prop
    ```

    ![点击并拖拽以移动](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

43. 查看ADB帮助：

    ```
    adb help
    ```

44. 跑monkey：

    ```
    adb shell monkey -v -p your.package.name 500
    ```

45. 查看当前 APP 当前的 Activity：

```
adb shell dumpsys window w |findstr \/ |findstr name=

//MAC
adb shell dumpsys window w |grep \\/ |grep name=
```

46. dos 设置编码

    ```java
    1.设置uft-8编码
    1.运行CMD 
    2.在命令行中输入 chcp 65001 回车, 控制台会切换到新的代码页. 
    3.在标题栏点击右键, 打开属性面板, 会看到”选项”标签页下方显示”当前代码页”的编码. 然后选择”字体”标签页, 把字体设置为Lucia Console, 然后确定关闭.
    ```

47. adb anr 目录

    ```java
    data/anr/traces.txt
    
    ```
    
48. 获取手机 IP 

    ```java
    adb shell netcfg
    ```

49. ping

    ```java
    adb shell ping -c 4 41.1.234.205
    ```

50. 查看 Android 版本

    ```java
    adb shell getprop ro.build.version.release
    ```

51. 杀进程

    ```java
    tmusb shell am force-stop com.t01.dida.small
    
    adb shell am force-stop com.ykun.keepalive
    
    ```

52. 修改 TCP/UDP 缓存区大小

    ```java
    cat /proc/sys/net/core/wmem_default
    
    echo 512000 > /proc/sys/net/core/wmem_default
    
    echo 1024000 > /proc/sys/net/core/wmem_max
    
    ```

53. 查看支持的 CPU 架构列表

    ```shell
    adb shell getprop ro.product.cpu.abilist
    ```

54. 读取手机 data 目录下的数据

    ```shell
    正确使用adb读取data目录下的文件方式
    shell@android:/data $ run-as com.your.package
    run-as com.your.package
    shell@android:/data/data/com.your.package $ cd /data/data/com.your.package
    cd /data/data/com.your.package
    shell@android:/data/data/com.your.package $ ls
    ls
    cache
    databases
    lib
    shared_prefs
    shell@android:/data/data/com.your.package $ cd databases
    cd databases
    shell@android:/data/data/com.your.package/databases $ ls
    yourpackagename.db
    $ cat preferences.db > /mnt/sdcard/yourpackagename.db  
    ```

55. 获取 CPU 使用情况

    ```shell
    adb shell dumpsys cpuinfo
    ```

56. 根据 pid 查看 CPU 使用率

    ```shell
    adb shell top –n 25822 | grep proc
    ```

57. 获取手机型号

    ```shell
    adb shell getprop ro.product.model
    ```

58. 查看 CPU 信息

    ```shell
    adb shell cat /proc/cpuinfo
    ```

59. 导出 ANR

    ```
    //高版本
    adb bugreport
    //低版本 
    adb pull data/anr
    ```

    

<<<<<<< HEAD
60. apk 签名

    ```
    /Users/devyk/Data/Android/SDK/build-tools/26.0.1/apksigner sign --ks /Users/devyk/Downloads/jianyin.keystore  --ks-key-alias jianyin --ks-pass pass:112233 --key-pass pass:112233 --out tap_sign.apk /Users/devyk/Downloads/tap_unsign.apk
    ```

    

61. 过滤日志

    ```
    adb logcat | grep MyApp
    ```

    
=======



>>>>>>> fbed24254acf717e7a0704f26fe2772261b256a4



# 参考

https://www.cnblogs.com/zhuminghui/p/10472193.html

























