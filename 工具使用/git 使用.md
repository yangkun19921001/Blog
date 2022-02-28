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
   
   //根据描述来打 tag
   
   git tag v10433 -m "修复火警类型转换异常问题" 82d7f7c
   
11. 删除一个本地分支

   git branch -d [name]

     baidu_location_report
     config_share_wechat
     del_umeng_push

   * dev
     dev-piaoquan-jianyin
     dev-piaoquan-longvideo
     dev-piaoquan-quanmingjianji
     dev-v2.4.4-merge
     dev_lebo_screen
     dev_umeng_push
     dev_v2.4.7_netrestips
     draft_module
     fix_avmerge_bug
     fix_dev
     master
     git branch -d message-module-dev
     muxer_optimize
     git branch -d quanminjianji
     git branch -d re_create
     git branch -d v2.3.10
     git branch -d video-create
     git branch -d video-create-opt
     git branch -d video_create_audiorecord
     git branch -d video_create_music_serach
     video_create_v2

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

## 拉取最新版本

```
Git pull
```

## git push 大文件

```shell
#1. 直接从官网下载安装包 [](https://git-lfs.github.com/)

#2. 解压进入包类输入命令 
		git lfs install

#3. 在项目中输入命令 追踪 所有 .a 文件
		git lfs track "*.a"
		//git lfs untrack *.txt
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
git commit -m "commit message"
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



### 本地仓库同步远程仓库

```
git fetch origin master
```



### 分支合并

```
//将 dev 分支合并到 merge 中
git  merge dev
```



## 从 Git Large File Storage 中删除文件

https://docs.github.com/cn/github/managing-large-files/removing-files-from-git-large-file-storage

## Git push 本地分支

```
git push origin [name]
```



##Git 创建新分支

```
git checkout -b [name]
```



### 修改分支名称

```
git remote set-url origin http://192.168.100.235:9797/john/git_test.git
```



## Git clone 分支

```
找一个干净目录，假设是git_work
cd git_work
git clone http://myrepo.xxx.com/project/.git ,这样在git_work目录下得到一个project子目录
cd project
git branch -a，列出所有分支名称如下：
remotes/origin/dev
remotes/origin/release
git checkout -b dev origin/dev，作用是checkout远程的dev分支，在本地起名为dev分支，并切换到本地的dev分支
git checkout -b release origin/release，作用参见上一步解释
git checkout dev，切换回dev分支，并开始开发。
```

##Git clone tag

```
git clone -b 4.5.5 https://github.com/opencv/opencv.git
```





### Git checkout 远端分支

```shell
//查看远程所有分支
$ git branch -a

* dev
 master
 remotes/origin/HEAD -> origin/master
 remotes/origin/master
 remotes/origin/release/caigou_v1.0
 
 //新建分支并切换到指定分支
 git checkout -b dev origin/release/caigou_v1.0
 
 //查看本地分支及追踪的分支
 git branch -vv
 
 //将本地分支推送到远程
 git push -u origin dev:release/caigou_v1.0
```





## git commit 撤销

```
git reset --soft HEAD^
```

## 版本回退

```
//先用下面命令找到要回退的版本的commit id：
git reflog
//接着回退版本:
git reset --hard Obfafd

//紧接着强制推送到远程分支：
git push -f origin master ## 这里假设只有一个master分支
```



## Git 寻找大文件并删除

```shell
//参考 https://harttle.land/2016/03/22/purge-large-files-in-gitrepo.html
//1、首先通过rev-list来找到仓库记录中的大文件：
git rev-list --objects --all | grep "$(git verify-pack -v .git/objects/pack/*.idx | sort -k 3 -n | tail -5 | awk '{print$1}')"

git filter-branch -f --index-filter 'git rm --cached --ignore-unmatch ffmpeg-mediacodec-test-yuv.yuv'

//2、然后通过filter-branch来重写这些大文件涉及到的所有提交（重写历史记录）：
git filter-branch -f --prune-empty --index-filter 'git rm -rf --cached --ignore-unmatch your-file-name' --tag-name-filter cat -- --all
```



## Git 删除远端分支

```shell
//1、查看远端分支
git branch -a
//2、删除远端分支
git push origin --delete 分支名称

//删除本地分支
git branch -d
```



## Git 修改分支名称

```shell
1. 本地分支重命名(还没有推送到远程)
git branch -m oldName newName

2. 远程分支重命名 (已经推送远程-假设本地分支和远程对应分支名称相同)
a. 重命名远程分支对应的本地分支
git branch -m oldName newName

b. 删除远程分支
git push --delete origin oldName

c. 上传新命名的本地分支
git push origin newName

d.把修改后的本地分支与远程分支关联
git branch --set-upstream-to origin/newName
```



### Git 合并指定分支的文件或文件夹到当前 branch

```shell
//合并指定分支的文件夹
git checkout message-module-dev  app/src/main/java/com/piaoquantv/piaoquanvideoplus/videocreate/**

//合并指定分支的文件
git checkout message-module-dev   app/src/main/java/com/piaoquantv/piaoquanvideoplus/Contacts.kt
```



### 临时保存和恢复修改

- git stash

  保存当前工作进度，将工作区和暂存区恢复到修改之前。

- git stash save message

  作用同上，message为此次进度保存的说明。

- git stash list

  显示保存的工作进度列表，编号越小代表保存进度的时间越近。

- git stash pop stash@{num}

  恢复工作进度到工作区，此命令的stash@{num}是可选项，在多个工作进度中可以选择恢复，不带此项则默认恢复最近的一次进度相当于`git stash pop stash@{0}`

- git stash apply stash@{num}

  恢复工作进度到工作区且该工作进度可重复恢复，此命令的stash@{num}是可选项，在多个工作进度中可以选择恢复，不带此项则默认恢复最近的一次进度相当于`git stash apply stash@{0}`。

- git stash drop stash@{num}

  删除一条保存的工作进度，此命令的stash@{num}是可选项，在多个工作进度中可以选择删除，不带此项则默认删除最近的一次进度相当于`git stash drop stash@{0}`

- 命令：`git stash clear`

  删除所有保存的工作进度

### checkout tag

```
git checkout -b branch_name tag_name
```



##git status 乱码

```shell
git config --global core.quotepath false
```

## 解决 GitHub不再支持密码验证解决方案：SSH免密与Token登录配置

```
git remote rm origin
git remote add origin [url]
```



## BUG

- 网页 check ping

  ```
  http://ping.chinaz.com/www.github.com
  ```

- git clone

  LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to github.com:443

  ```
  vim ~/.gitconfig
  把里面关于https的配置删掉，然后就可以了
  ```

  





