

## 服务器上部署 hexo 

1. Linux 源码 install node

   ```shell
   wget http://nodejs.org/dist/v9.9.0/node-v9.9.0.tar.gz
   tar -zxvf node-v9.9.0.tar.gz
   cd node-v9.9.0
   ./configure
   make
   make install
   
   检查是否安装成功
   node -v
   npm -v
   
   //cnpm install
   npm install -g cnpm --registry=https://registry.npm.taobao.org
   sudo cnpm install cnpm -g
   ```

2. Install hexo

   ```shell
   # 创建一个目录作为工作区(位置名称随意)
   mkdir hexoBlog
   cd hexoBlog
   # 在工作区中进行局部安装
   cnpm install hexo
   # 设置环境变量(在工作区目录可以直接使用hexo命令)
   echo 'PATH="$PATH:./node_modules/.bin"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. 创建 hexo 站点

   ```
   cd hexoBlog
   hexo init blog-hexo  # blog-hexo为站点目录，名称随意
   ```

4. 更换主题

   ```shell
   1. 下载主题
   git clone https://github.com/ppoffice/hexo-theme-icarus.git themes/icarus
   2. 配置更新，进入站点根目录 
   vim _config.yml 
   //将theme: landscape 修改为 theme: icarus
   ```

5. hexo 发布

   ```
   1. 生成静态网页
   hexo g 
   2. 启动 hexo 服务
   hexo s
   ```

   - 以上步骤如遇见如下错误:

   ```
   ERROR Package cheerio is not installed.
   ERROR Please install the missing dependencies from the root directory of your Hexo site.
   ```

   原因缺少`cheerio`依赖，进入`blog-hexo`目录，执行`npm i cheerio -S`命令进行安装即可，`-S`指安装并将其保存到当前项目的配置中，下次就会统一安装了。

   - 执行 hexo g 如遇见如下错误

   ```
   ERROR Package bulma-stylus is not installed.
   ERROR Package hexo-component-inferno is not installed.
   ERROR Package hexo-renderer-inferno is not installed.
   ERROR Package inferno is not installed.
   ERROR Package inferno-create-element is not installed.
   ERROR Please install the missing dependencies your Hexo site root directory:
   ERROR npm install --save bulma-stylus@0.8.0 hexo-component-inferno@^0.3.0 hexo-renderer-inferno@^0.1.3 inferno@^7.3.3 inferno-create-element@^7.3.3
   ```

   直接执行 

   ```shell
   npm install --save bulma-stylus@0.8.0 hexo-component-inferno@^0.3.0 hexo-renderer-inferno@^0.1.3 inferno@^7.3.3 inferno-create-element@^7.3.3
   ```

6. 发布到 github

   ```
   1. 修改站点 _config.yml
   # Deployment
   ## Docs: https://hexo.io/docs/deployment.html
   deploy:
     type: git
    #repo: git@115.28.137.49:/home/git/blog.git
     repo: git@github.com:yangkun19921001/devyk.github.io.git
     branch: master
     message:
     
     //2. 生成静态网页
     hexo g
     //3. 本地查看
     hexo s
     //4. 推送到 服务端
     hexo d
   ```

   

7. 服务器环境搭建

   1. 安装 nginx

   ```
   yum install -y nginx
   nginx start/stop/-s reload
   ```

   2. 配置服务器路由

      安装并启动服务器后，我们就完成了第一步，现在我们可以尝试使用自己的电脑去访问服务器的公网IP。我们可以惊喜地发现，公网IP可以打开一个nginx的默认网页。这样，我们就成功了第一步。

      但是我们实际上是想要让这个地址指向我们的博客，而不是nginx的默认网址，这就需要我们去配置**nginx的配置文件**。我在配置的时候在网上查到的关于nginx配置文件的有关资料，大部分关于centOS的资料都是说配置位于**etc/nginx/conf.d/** 下的**dafault.conf** 这个配置文件，但是我在配置的时候并没有找到它，后来查看了一下文件结构，阿里云默认的库下载的是fedora版本的nginx，所以我们应该配置的是位于 **etc/nginx/** 下的 **nginx.conf** 。

      我们先不急着打开这个文件，因为我并不建议直接配置这个文件，我们应该先创建一个新的文件，然后采用include的方式，将这个文件包含进nginx.conf中。

      操作如下：
      在/etc/nginx/目录下创建一个文件夹 叫 **vhost**

      ```shell
      cd /etc/nginx/a
      mkdir vhost
      cd vhost
      vim blog.conf
      
      ```

      Vim blog.conf

      ```
      server{
      	listen    80;
      	root /home/www/website;#这里填博客目录存放的地址
      	server_name #这里填域名如(www.baidu.com) 如果暂时没有域名就填阿里云的公网ip，以后有了再改回来;
      	location /{
      	}
      }
      
      保存:
      :wq
      ```

      打开/etc/nginx/目录下的nginx.conf文件
      `vi /etc/nginx/nginx.conf`

      在 http/下添加一行

      ```
      include /etc/nginx/vhost/*.conf
      ```

      ![](https://blog.objectspace.cn/2019/08/15/%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BAHexo%E5%8D%9A%E5%AE%A2%E5%B9%B6%E9%83%A8%E7%BD%B2%E9%98%BF%E9%87%8C%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8-%E5%A5%B6%E5%A6%88%E7%BA%A7%E6%95%99%E5%AD%A6/7e1c6965.png)

      如果以后还想添加新的网站，也可以在vhost目录下新建一个conf配置文件。

      在刚才我们自己写的blog.conf配置文件中root的路径相应路径建立博客的目录：

      ```
      cd /home
      mkdir www
      cd /www
      mkdir website
      
      ```

      这样我们就可以得到 /home/www/website 作为博客的根路径，就和配置文件中的路径对应上了。
      
   3. nginx 配置 https

      1. Create the SSL Certificate

         ```shell
         sudo mkdir /etc/nginx/ssl
         sudo openssl req -x509 -nodes -days 36500 -newkey rsa:2048 -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt
         ```

         创建了有效期100年，加密强度为RSA2048的SSL密钥key和X509证书文件。

         **参数说明:**

         req: 配置参数-x509指定使用 X.509证书签名请求管理(certificate signing request (CSR))."X.509" 是一个公钥代表that SSL and TLS adheres to for its key and certificate management.
         -nodes: 告诉OpenSSL生产证书时忽略密码环节.(因为我们需要Nginx自动读取这个文件，而不是以用户交互的形式)。
         -days 36500: 证书有效期，100年
         -newkey rsa:2048: 同时产生一个新证书和一个新的SSL key(加密强度为RSA 2048)
         -keyout:SSL输出文件名
         -out:证书生成文件名
         它会问一些问题。需要注意的是在common name中填入网站域名，如wiki.xby1993.net即可生成该站点的证书，同时也可以使用泛域名如*.xby1993.net来生成所有二级域名可用的网站证书。
         整个问题应该如下所示:

         ```shell
         Country Name (2 letter code) [AU]:US
         State or Province Name (full name) [Some-State]:New York
         Locality Name (eg, city) []:New York City
         Organization Name (eg, company) [Internet Widgits Pty Ltd]:Bouncy Castles, Inc.
         Organizational Unit Name (eg, section) []:Ministry of Water Slides
         Common Name (e.g. server FQDN or YOUR name) []:your_domain.com
         Email Address []:admin@your_domain.com
         ```

      2. Configure Nginx to Use SSL

         ```shell
         server {
                 listen       80;
                 server_name  www.yourdomain.com;
                 rewrite ^ https://$http_host$request_uri? permanent;    # force redirect http to https
             #return 301 https://$http_host$request_uri;
             }
         
         server {
                 listen 443 ssl;
         
                 ssl_certificate /etc/nginx/ssl/nginx.crt;
                 ssl_certificate_key /etc/nginx/ssl/nginx.key;
             keepalive_timeout   70;
                 server_name www.yourdomain.com;
             #禁止在header中出现服务器版本，防止黑客利用版本漏洞攻击
             server_tokens off;
             #如果是全站 HTTPS 并且不考虑 HTTP 的话，可以加入 HSTS 告诉你的浏览器本网站全站加密，并且强制用 HTTPS 访问
             #add_header Strict-Transport-Security "max-age=31536000; includeSubdomains";
                 # ......
                 fastcgi_param   HTTPS               on;
                 fastcgi_param   HTTP_SCHEME         https;
         
             access_log      /var/log/nginx/wiki.xby1993.net.access.log;
                 error_log       /var/log/nginx/wiki.xby1993.net.error.log;
             }
         ```

         如果想同时启用 https/http

         ```
         server {
             listen              80;
             listen              443 ssl;
             server_name         www.example.com;
             ssl_certificate     www.example.com.crt;
             ssl_certificate_key www.example.com.key;
             ...
         }
         ```

      3. 

      

   4. Create the SSL Certificate

7. 配置 git 

   ```
   //1. 安装git:
   yum install git
   
   //2. 进入 /home/www 目录
   cd /home/www
   //3. clone 项目
   git clone https/xxx.git[项目仓库] /website
   ```

   

8. 重启 nginx

   ```
   nginx -s reload
   ```



## hexo 写文章

### 在线编辑

```
1.
npm install --save hexo-admin

2.
hexo server -d
open http://localhost:4000/admin/

3. 巧用 <!-- more -->
发布的文章较长时，主页会全部显示出来，页面也会变得很长。这个时候我们在编辑内容时，在合适的地方添加一行代码：<!-- more -->，在它之上是摘要，是在主页会显示的文字部分。在它之下是余下全文，在主页中会多一个阅读全文的按钮，点击后才会看到全部内容。

这样就避免了主页显示不必要的内容，占据大量篇幅。
```

### 添加备案号

在`\blog\themes\icarus\layout\common`路径下找到`footer.jsx`文件，
在其中添加

`<br/>`我是换行用的。。。

```
<p class="size-small">
  <span dangerouslySetInnerHTML={{ __html: `&copy; ${siteYear} ${author || siteTitle}` }}></span>
  &nbsp;&nbsp;Powered by <a href="https://hexo.io/" target="_blank" rel="noopener">Hexo</a>&nbsp;&&nbsp;
  <a href="https://github.com/ppoffice/hexo-theme-icarus" target="_blank" rel="noopener">Icarus</a>
//添加
<br />
<a href="http://www.beian.miit.gov.cn/" target="_blank">你的备案号</a>

```



## 服务搭建遇见的问题

- [Host key verification failed.](https://blog.csdn.net/wd2014610/article/details/85639741)



##参考地址:

- [阿里云服务器搭建 hexo]([https://blog.objectspace.cn/2019/08/15/%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BAHexo%E5%8D%9A%E5%AE%A2%E5%B9%B6%E9%83%A8%E7%BD%B2%E9%98%BF%E9%87%8C%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8-%E5%A5%B6%E5%A6%88%E7%BA%A7%E6%95%99%E5%AD%A6/#](https://blog.objectspace.cn/2019/08/15/从零搭建Hexo博客并部署阿里云服务器-奶妈级教学/#))

- [Hexo+Github博客搭建完全教程 推荐](https://sunhwee.com/posts/6e8839eb.html#toc-heading-23)
- [Hexo 主题配置]([https://blog.zhangruipeng.me/hexo-theme-icarus/Configuration/icarus%E7%94%A8%E6%88%B7%E6%8C%87%E5%8D%97-%E4%B8%BB%E9%A2%98%E9%85%8D%E7%BD%AE/](https://blog.zhangruipeng.me/hexo-theme-icarus/Configuration/icarus用户指南-主题配置/))
- [最全Hexo博客搭建+主题优化+插件配置+常用操作+错误分析](https://juejin.im/post/5bebfe51e51d45332a456de0#heading-7)
- [超详细Hexo+Github博客搭建小白教程](https://zhuanlan.zhihu.com/p/35668237)
- [Github Pages部署个人博客（Hexo篇）](https://juejin.im/post/5acf02086fb9a028b92d8652)
- [Hexo+Github博客搭建完全教程 推荐](https://sunhwee.com/posts/6e8839eb.html#toc-heading-23)
- [hexo 挂件配置]([https://blog.zhangruipeng.me/hexo-theme-icarus/Widgets/icarus%E7%94%A8%E6%88%B7%E6%8C%87%E5%8D%97-%E6%8C%82%E4%BB%B6/#%E6%9C%80%E6%96%B0%E6%96%87%E7%AB%A0](https://blog.zhangruipeng.me/hexo-theme-icarus/Widgets/icarus用户指南-挂件/#最新文章))
- https://jishuin.proginn.com/p/763bfbd71894

