# [iTerm2 + Oh My Zsh 打造舒适终端体验](https://segmentfault.com/a/1190000014992947)

最终效果图：

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200329120520.png)

因排版和原文中的一些bug，参照搜索引擎和原文有了本篇文章。

因为powerline以及homebrew均需要安装command line tool，网络条件优越的同学在执行本文下面内容之前，可以先安装XCode并打开运行一次（会初始化安装components），省去以后在iterm2中的等待时间。

另外，git也是必要的，各位可以自行下载安装，除了网络没有任何坑：

介于此，本文默认各位同学已经安装了git环境和xcode（command line tools），遇到提示找不到git命令或需要安装command line tool的地方，文中不再赘述了。

安装完成后，在/bin目录下会多出一个zsh的文件。

Mac系统默认使用dash作为终端，可以使用命令修改默认使用zsh：

```
chsh -s /bin/zsh
```

如果想修改回默认dash，同样使用chsh命令即可：

```
chsh -s /bin/bash
```

OK，这就是iTerm2初始的样子，下面我们来美化它，让它变得更好用！

![](https://raw.githubusercontent.com/sirius1024/pubimgs/master/blogs/iterm2/1.png)

安装方法有两种，可以使用curl或wget，看自己环境或喜好：

```
# curl 
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

```
# wget
sh -c "$(wget https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O -)"
```

安装命令和安装完成后的截图：

![](https://segmentfault.com/img/remote/1460000014992803?w=1378&h=938)

安装powerline的方式依然简单，也只需要一条命令：

```
pip install powerline-status --user
```

没有安装pip的同学可能会碰到zsh: command not found: pip。

![](https://segmentfault.com/img/remote/1460000014992804?w=484&h=76)

使用命令安装pip即可：

```
sudo easy_install pip
```

安装后再次执行安装powerline的命令即可。

![](https://segmentfault.com/img/remote/1460000014992805?w=2104&h=318)

安装字体库需要首先将项目git clone至本地，然后执行源码中的install.sh。

在你习惯的位置新建一个文件夹，如：~/Desktop/OpenSource/

![](https://raw.githubusercontent.com/sirius1024/pubimgs/master/blogs/iterm2/5.png)

在此文件夹下执行git clone命令：

```
# git clone
git clone https://github.com/powerline/fonts.git --depth=1
# cd to folder
cd fonts
# run install shell
./install.sh
```

执行结果如下：

![](https://segmentfault.com/img/remote/1460000014992807?w=2562&h=574)

安装好字体库之后，我们来设置iTerm2的字体，具体的操作是iTerm2 -> Preferences -> Profiles -> Text，在Font区域选中Change Font，然后找到Meslo LG字体。有L、M、S可选，看个人喜好：

![](https://raw.githubusercontent.com/sirius1024/pubimgs/master/blogs/iterm2/7.png)

配色方案在使用VIM或Colorful Log时会变得非常有用，同时界面也不会一片黑绿一样死板。

同样使用git clone的方式下载源码进行安装：

```shell
cd ~/Desktop/OpenSource
git clone https://github.com/altercation/solarized
cd solarized/iterm2-colors-solarized/
open .
```

在打开的finder窗口中，双击Solarized Dark.itermcolors和Solarized Light.itermcolors即可安装明暗两种配色：

![](https://segmentfault.com/img/remote/1460000014992809?w=1854&h=1350)

再次进入iTerm2 -> Preferences -> Profiles -> Colors -> Color Presets中根据个人喜好选择这两种配色中的一种即可：

![](https://segmentfault.com/img/remote/1460000014992810?w=2000&h=1670)

下载agnoster主题，执行脚本安装：

```
cd ~/Desktop/OpenSource
git clone https://github.com/fcamblor/oh-my-zsh-agnoster-fcamblor.git
cd oh-my-zsh-agnoster-fcamblor/
./install
```

执行上面的命令会将主题拷贝到oh my zsh的themes中：

![](https://segmentfault.com/img/remote/1460000014992811?w=1140&h=982)

拷贝完成后，执行命令打开zshrc配置文件，将ZSH_THEME后面的字段改为agnoster。

```
vi ~/.zshrc
```

![](https://segmentfault.com/img/remote/1460000014992812?w=1140&h=982)

修改完成后按一下esc调出vi命令，输入:wq保存并退出vi模式。

此时command+Q或source配置文件后，iTerm2变了模样：

![](https://segmentfault.com/img/remote/1460000014992813?w=1140&h=854)

这是oh my zsh的一个插件，安装方式与theme大同小异：

```
cd ~/.oh-my-zsh/custom/plugins/
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git
vi ~/.zshrc
```

这时我们再次打开zshrc文件进行编辑。找到plugins，此时plugins中应该已经有了git，我们需要把高亮插件也加上：

![](https://segmentfault.com/img/remote/1460000014992814?w=380&h=126)

请务必保证插件顺序，zsh-syntax-highlighting必须在最后一个。

然后在文件的最后一行添加：source ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

按一下esc调出vi命令，输入:wq保存并退出vi模式。

执行命令使刚才的修改生效：

```
source ~/.zshrc
```

至此大功告成，请看最终效果图：

![](https://segmentfault.com/img/remote/1460000014992801?w=2880&h=1800)

背景图片取自微软Surface Studio的4K壁纸(将近12MB大小)，非常漂亮，需要的可以自取：

更换背景图片方式：iTerm2 -> Preferences -> Profiles -> Window -> BackGround Image勾选图片即可。

跟代码高亮的安装方式一样，这也是一个zsh的插件，叫做zsh-autosuggestion，用于命令建议和补全。

```
cd ~/.oh-my-zsh/custom/plugins/
git clone https://github.com/zsh-users/zsh-autosuggestions
vi ~/.zshrc
```

找到plugins，加上这个插件即可：

```shell
plugins=(
    git
    zsh-autosuggestions
    zsh-syntax-highlighting
)

source ~/.zshrc
```

