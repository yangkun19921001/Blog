### 查看系统可用库版本

```
strings /lib64/libc.so.6 |grep GLIBC_
```

### 查看系统库版本

```
ls -l /lib64/libc.so.*
```

### 循环创建 dir

```
mkdir -p /data/lib/ffmpeg
```

### MAC OS 查看 so 依赖关系

```
otool -L libBitStreamAnalyze.dylib
```

###Linux 查看 so 依赖关系

```
ldd libBitStreamAnalyze.so
```

### linux 查看 log

```
tail -f /datalog/app.log
```



## 查找可执行文件目录

```
Which
```

