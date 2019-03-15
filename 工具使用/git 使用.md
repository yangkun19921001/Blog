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



