## 1、MAC 安装 node

```
brew install node
```

安装完使用 npm 会报错

env: node: No such file or directory

##2、修复问题

```
brew link --overwrite node

brew postinstall node

node -v
```

## 3、安装本地服务

```
npm install http-server -g
```

## 4、当前目录下开启一个服务

```
http-server -g 端口号
```

