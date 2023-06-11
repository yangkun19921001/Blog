### 生成 jks

```
keytool -genkey -v -keystore izpan.jks -alias izpan -storepass 123456 -keypass 123456 -keyalg RSA -keysize 2048 -validity 36500
```

- -keystore：设置生成的文件名称，包含后缀；
- -alias：设置别名
- -storepass：设置文件的密码
- -keypass：设置key的密码
- -keyalg：设置使用的加密算法，一般写RSA
- -keysize：指定密钥长度（默认 1024）
- -validity：设置有效期，尽可能长啦（天）



### 查看

```
keytool -list -v -keystore .\pgcmobile.jks -storepass 密码
```

