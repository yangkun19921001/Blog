#  Git 基本使用

- git 介绍

  https://gitee.com/help/articles/4104

  

## 新手快速上手 Git

### 初次使用 Git  命令

- git init   // 初始化版本库 
- git add .   // 添加文件到版本库（只是添加到缓存区），.代表添加文件夹下所有文件  
- git commit -m "first commit" // 把添加的文件提交到版本库，并填写提交备注 

到目前为止，我们完成了代码库的初始化，但代码是在本地，还没有提交到远程服务器，所以关键的来了，要提交到就远程代码服务器，进行以下两步： 

- git remote add origin 你的远程库地址  // 把本地库与远程库关联 
- git push -u origin master    // 第一次直接推送时到远程厂库中

### 第二次提交版本使用 Git 命令  

- git add .   // 添加文件到版本库（只是添加到缓存区），.代表添加文件夹下所有文件  
- git commit -m "提交需要的备注" // 把添加的文件提交到版本库，并填写提交备注 
- git push origin master  // 第一次推送后，直接使用该命令即可推送修改 

## 强制更新

在使用Git的过程中，有些时候我们只想要git服务器中的最新版本的项目，对于本地的项目中修改不做任何理会，就需要用到Git pull的强制覆盖，具体代码如下：

```
$ git fetch --all
$ git reset --hard origin/master 
$ git pull123
```

Git pull的强制覆盖本地文件在自动化部署项目中很有作用，比如用SaltStack部署web项目，强制覆盖可以保持与服务器内容一致。

上面的操作有点复杂，直接用git checkout 就ok了

##远程拉取指定版本

以 [glide](https://links.jianshu.com/go?to=%5Bhttps%3A%2F%2Fgithub.com%2Fbumptech%2Fglide%5D(https%3A%2F%2Fgithub.com%2Fbumptech%2Fglide)) 为例，目前官网最新是 4.9.0 版本，如果要编译 4.8.0 版本的 jar，该如何操作呢。

1. 首先clone项目到本地
   `git clone https://github.com/bumptech/glide.git`

2. 然后进入项目
   `cd glide/`

3. 查看历史版本
   `git tag`
4. 拉取指定版本
   `git checkout tags/1.2.1`

5. 编译 jar 包
   `./gradlew assemble`



