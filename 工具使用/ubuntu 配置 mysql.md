安装 mysql

```
    sudo apt-get install mysql-server mysql-client
    然后mysql -V查看mysql是否安装成功
    sudo  apt-get install libmysqlclient-dev python3-dev
    然后
    pip install mysqlclient就不会报错找不到'mysql_config'了
    
    
    输入 mysql_config 就能看到安装的路径了
    
    
   
```

修改密码

进入到/etc/mysql/ 目录下，查看debian.cnf文件

输入:

mysql -udebian-sys-maint -p6Uhc9zmR2lveyJsd
