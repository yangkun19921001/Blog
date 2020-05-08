#  Git 基本使用

- git 介绍

  https://www.liaoxuefeng.com/wiki/896043488029600

  

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
$ git pull
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
   
6. Push  单个 tag

   git push origin [tagname]
   
7. 强制与远端同步

   git pull
   
8. 删除 tag

   1. 删除本地 tag

      git tag -d [tagname]

   2. 删除远端 tag

      git push origin :refs/tags/[tagname]
   
9. update 某个文件

   git fetch

   git checkout -m 2408ca5 文件名
   
10. 打一个 tag

   Git tag [tagname]
   
11. 删除一个本地分支

   git branch -d [name]

12. 检出一个新分支

   git checkout -b 11120c30443f7e3861d78225fe0cd949c131cc19

13. 如何处理一个 pull request 

   https://blog.lzuer.net/2016/10/10/github-pr/

14. Git 回退到某一个版本

   ```
   git reset --hard [commit id]
   ```

15. Git push 大文件处理

   ```
   https://git-lfs.github.com/
   ```

16. 合并某个分支某个文件代码

   ```shell
   git checkout 分支名 分支文件
   
   ```
```
## git error

1、error: RPC failed; curl 18 transfer closed with outstanding read data remaining

        遇到的问题一：
    
    error: RPC failed; curl 18 transfer closed with outstanding read data remaining
    fatal: The remote end hung up unexpectedly
    fatal: early EOF
    fatal: index-pack failed
    
      #    解决方式一， 网上大部分解决措施：命令终端输入 
      #   这个错误是因为项目太久，tag资源文件太大
       git config --global http.postBuffer 524288000


```

## 强制 push

```git
git push -f origin master
```

## git push 大文件

```shell
#1. 直接从官网下载安装包 [](https://git-lfs.github.com/)

#2. 解压进入包类输入命令 
		git lfs install

#3. 在项目中输入命令 追踪 所有 .a 文件
		git lfs track "*.a"

#4. 之后操作跟以往不变  add commit push
```

## git 查看需要删除远程的文件

```
#查看
git rm -r -n --cached app/build
#删除 
git rm -r --cached app/build
# 查看 git 相关文件占用的空间
git count-objects -v 
# 查看 .git 文件夹占用磁盘空间
du -sh .git 
```

## git 删除所有提交记录

```
删除.git文件夹可能会导致git存储库中的问题。如果要删除所有提交历史记录，但将代码保持在当前状态，可以按照以下方式安全地执行此操作：

#尝试  运行  
git checkout --orphan latest_branch
添加所有文件
#git add -A
#提交更改
git commit -am "commit message"
#删除分支
git branch -D master
#将当前分支重命名
git branch -m master
#最后，强制更新存储库。
git push -f origin master
```

## 修改已经提交的 message

```
#1.输入如下命令
git commit --amend
#2. 在编辑框中输入修改的 message
```

