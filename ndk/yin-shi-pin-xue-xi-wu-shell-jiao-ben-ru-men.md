# 音视频学习 \(五\) shell 脚本入门

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200113140837.jpg)

\[TOC\]

## 前言

学习 Shell 脚本也是为了后面编译第三方库打下一个基础，编译第三方库几乎都需要用到 shell 语法，如果你不懂那么就不会编译出自己想要的版本，只会 copy 网络上别人写好的这其实是没有任何学习的意义。

## 介绍

Shell 是一个用 C 语言编写的程序，它是用户使用 Linux 的桥梁。Shell 既是一种命令语言，又是一种程序设计语言。

Shell 是指一种应用程序，这个应用程序提供了一个界面，用户通过这个界面访问操作系统内核的服务。

Ken Thompson 的 sh 是第一种 Unix Shell，Windows Explorer 是一个典型的图形界面 Shell。

## Shell 入门学习

打开文本编辑器\(可以使用 vi/vim 命令来创建文件\)，新建一个文件 test.sh，扩展名为 sh（sh代表shell），扩展名并不影响脚本执行，见名知意就好。

### 第一个 shell 脚本

我们还是以输出一个 “Hello Word !” 为例子正式进行学习，脚本代码如下:

```text
#!/bin/bash
echo "Hello World !"
```

输出:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200112211254.gif)

**\#!** 是一个约定的标记，它告诉系统这个脚本需要什么解释器来执行，即使用哪一种 Shell。

echo 命令用于向窗口输出文本。

注意: 如果执行提示没有权限还需要命令输入 `chmod +x test.sh` 开放可执行权限。

### 变量

定义变量时，变量名不加美元符号 \($\) ,如下:

```text
my_name="DevYK"
```

注意，变量名和等号之间不能有空格，这可能和你熟悉的所有编程语言都不一样。同时，变量名的命名须遵循如下规则：

* 命名只能使用英文字母，数字和下划线，首个字符不能以数字开头。
* 中间不能有空格，可以使用下划线（\_）。
* 不能使用标点符号。
* 不能使用bash里的关键字（可用help命令查看保留关键字）。

除了显式地直接赋值，还可以用语句给变量赋值，如：

```text
#一定要切记for file in $后边的那个引号不是单引号，而是tab键上边的那个键，或者说是1左边的那个键。否则的话不起作用。
for file in $`ls /root/android`
do
echo $file
done
```

输出效果:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200112214354.gif)

**使用变量:**

使用一个定义过的变量，只要在变量名前面加美元符号即可，如：

```text
my_name="DevYK"
echo $my_name
#变量名外面的花括号是可选的，加不加都行，加花括号是为了帮助解释器识别变量的边界
echo ${my_name}
```

输出:

```text
DevYK
DevYK
```

**只读变量:**

```text
#4. 只读变量
my_blog_url="https://www.devyk.top/"
readonly my_blog_url
my_blog_url="www.baidu.com"
```

输出:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200112215148.png)

**删除变量:**

```text
#变量被删除后不能再次使用。unset 命令不能删除只读变量。
your_name="小明"
unset your_name
echo $your_name
```

输出:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200112215800.gif)

可以看到定义了删除变量之后，后面是没有任何输出

**变量类型:**

运行shell时，会同时存在三种变量：

* **1\) 局部变量** 局部变量在脚本或命令中定义，仅在当前 shell 实例中有效，其他 shell 启动的程序不能访问局部变量。
* **2\) 环境变量** 所有的程序，包括 shell 启动的程序，都能访问环境变量，有些程序需要环境变量来保证其正常运行。必要的时候 shell 脚本也可以定义环境变量。
* **3\) shell变量** shell 变量是由 shell 程序设置的特殊变量。shell 变量中有一部分是环境变量，有一部分是局部变量，这些变量保证了shell的正常运行

### 字符串

字符串是 shell 编程中最常用最有用的数据类型（除了数字和字符串，也没啥其它类型好用了），字符串可以用单引号，也可以用双引号，也可以不用引号。

```text
#单引号
str='this is a book'
```

单引号字符串的限制：

* 单引号里的任何字符都会原样输出，单引号字符串中的变量是无效的；
* 单引号字串中不能出现单独一个的单引号（对单引号使用转义符后也不行），但可成对出现，作为字符串拼接使用。

```text
#双引号
your_title=“玄幻小说”
str="嗨, 请问这是一本什么类型的小说？ \"$your_title\" \n"
echo -e $str
```

输出:

```text
嗨, 请问这是一本什么类型的小说？ "“玄幻小说”"
```

双引号的优点：

* 双引号里可以有变量
* 双引号里可以出现转义字符

**拼接字符串:**

```text
your_name="DevYK_1"
#使用双引号拼接
str1="2 我是 “$your_name” !"
str2="2 我是 ${your_name} !"
echo $str1 $str2
#使用单引号拼接
str3='1 我是 “$your_name” !'
str4='1 我是 ${your_name} !'
echo $str3 $str4
```

输出:

```text
2 我是 “DevYK_1” ! 2 我是 DevYK_1 !
1 我是 DevYK_1 ! 1 我是 ${your_name} !
```

**获取字符串长度:**

```text
str_length='123456'
echo ${#str_length}
```

输出: 6

**提取字符串:**

以下实例从字符串第 **2** 个字符开始截取 **4** 个字符：

```text
echo ${str_length:1:4}
```

输出: 2345

**查找字符串:**

```text
echo `expr index "$str_length" 3` //是反斜杠 tab 上 1 键左
```

输出：3

### 传递参数

我们可以在执行 Shell 脚本时，向脚本传递参数，脚本内获取参数的格式为：**$n**。**n** 代表一个数字，1 为执行脚本的第一个参数，2 为执行脚本的第二个参数，以此类推……

例子:

以下实例我们向脚本传递三个参数，并分别输出，其中 **$0** 为执行的文件名：

```text
echo "Shell 传递参数实例！";
echo "执行的文件名：$0";
echo "第一个参数为：$1";
echo "第二个参数为：$2";
echo "第三个参数为：$3";
```

输出:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20200112223631.gif)

### 数组

数组中可以存放多个值。Bash Shell 只支持一维数组（不支持多维数组），初始化时不需要定义数组大小。

与大部分编程语言类似，数组元素的下标由 0 开始。

Shell 数组用括号来表示，元素用 "空格" 符号分割开，语法格式如下：

```text
array_name=(value1 ... valuen)
```

例子:

```text
my_array=(A B "C" D)

echo "第一个元素为: ${my_array[0]}"
echo "第二个元素为: ${my_array[1]}"
echo "第三个元素为: ${my_array[2]}"
echo "第四个元素为: ${my_array[3]}"

#使用@ 或 * 可以获取数组中的所有元素，例如：
echo "数组的元素为: ${my_array[*]}"
echo "数组的元素为: ${my_array[@]}"

#获取数组长度的方法与获取字符串长度的方法相同
echo "数组元素个数为: ${#my_array[*]}"
echo "数组元素个数为: ${#my_array[@]}"
```

输出:

```text
第一个元素为: A
第二个元素为: B
第三个元素为: C
第四个元素为: D
数组的元素为: A B C D
数组的元素为: A B C D
数组元素个数为: 4
数组元素个数为: 4
```

### 运算符

Shell 和其他编程语言一样，支持多种运算符，包括：

* 算数运算符
* 关系运算符
* 布尔运算符
* 字符串运算符
* 文件测试运算符

原生 bash 不支持简单的数学运算，但是可以通过其他命令来实现，例如 awk 和 expr，expr 最常用。

expr 是一款表达式计算工具，使用它能完成表达式的求值操作。

**注意:**

* 表达式和运算符之间要有空格，例如 2+2 是不对的，必须写成 2 + 2，这与我们熟悉的大多数编程语言不一样。
* 完整的表达式要被  **``** 包含，注意这个字符不是常用的单引号，在 Esc 键下边。

**算符运算符:**

| 运算符 | 说明 | 举例 |
| :--- | :--- | :--- |
| + | 加法 | `expr $a + $b` 结果为 30。 |
| - | 减法 | `expr $a - $b` 结果为 -10。 |
| \* | 乘法 | `expr $a \* $b` 结果为  200。 |
| / | 除法 | `expr $b / $a` 结果为 2。 |
| % | 取余 | `expr $b % $a` 结果为 0。 |
| = | 赋值 | a=$b 将把变量 b 的值赋给 a。 |
| == | 相等。用于比较两个数字，相同则返回 true。 | \[ $a == $b \] 返回 false。 |
| != | 不相等。用于比较两个数字，不相同则返回 true。 | \[ $a != $b \] 返回 true。 |

**注意：**条件表达式要放在方括号之间，并且要有空格，例如: **\[$a==$b\]** 是错误的，必须写成 **\[ $a == $b \]**。

```text
a=10
b=20

val=`expr $a + $b`
echo "a + b : $val"

val=`expr $a - $b`
echo "a - b : $val"

val=`expr $a \* $b`
echo "a * b : $val"

val=`expr $b / $a`
echo "b / a : $val"

val=`expr $b % $a`
echo "b % a : $val"

if [ $a == $b ]
then
   echo "a 等于 b"
fi
if [ $a != $b ]
then
   echo "a 不等于 b"
fi
```

输出:

```text
a + b : 30
a - b : -10
a * b : 200
b / a : 2
b % a : 0
a 不等于 b
```

> **注意:**
>
> * 乘号\(\*\)前边必须加反斜杠\(\)才能实现乘法运算；
> * if...then...fi 是条件语句，后续将会讲解。
> * 在 MAC 中 shell 的 expr 语法是：**$\(\(表达式\)\)**，此处表达式中的 "\*" 不需要转义符号 "\" 。

**关系运算符:**

关系运算符只支持数字，不支持字符串，除非字符串的值是数字。

下表列出了常用的关系运算符，假定变量 a 为 10，变量 b 为 20：

| 运算符 | 说明 | 举例 |
| :--- | :--- | :--- |
| -eq | 检测两个数是否相等，相等返回 true。 | \[ $a -eq $b \] 返回 false。 |
| -ne | 检测两个数是否不相等，不相等返回 true。 | \[ $a -ne $b \] 返回 true。 |
| -gt | 检测左边的数是否大于右边的，如果是，则返回 true。 | \[ $a -gt $b \] 返回 false。 |
| -lt | 检测左边的数是否小于右边的，如果是，则返回 true。 | \[ $a -lt $b \] 返回 true。 |
| -ge | 检测左边的数是否大于等于右边的，如果是，则返回 true。 | \[ $a -ge $b \] 返回 false。 |
| -le | 检测左边的数是否小于等于右边的，如果是，则返回 true。 | \[ $a -le $b \] 返回 true。 |

例子:

```text
a=10
b=20
if [ $a -eq $b ]
then
   echo "$a -eq $b : a 等于 b"
else
   echo "$a -eq $b: a 不等于 b"
fi
if [ $a -ne $b ]
then
   echo "$a -ne $b: a 不等于 b"
else
   echo "$a -ne $b : a 等于 b"
fi
if [ $a -gt $b ]
then
   echo "$a -gt $b: a 大于 b"
else
   echo "$a -gt $b: a 不大于 b"
fi
if [ $a -lt $b ]
then
   echo "$a -lt $b: a 小于 b"
else
   echo "$a -lt $b: a 不小于 b"
fi
if [ $a -ge $b ]
then
   echo "$a -ge $b: a 大于或等于 b"
else
   echo "$a -ge $b: a 小于 b"
fi
if [ $a -le $b ]
then
   echo "$a -le $b: a 小于或等于 b"
else
   echo "$a -le $b: a 大于 b"
fi
```

输出:

```text
10 -eq 20: a 不等于 b
10 -ne 20: a 不等于 b
10 -gt 20: a 不大于 b
10 -lt 20: a 小于 b
10 -ge 20: a 小于 b
10 -le 20: a 小于或等于 b
```

**布尔运算符:**

下表列出了常用的布尔运算符，假定变量 a 为 10，变量 b 为 20：

| 运算符 | 说明 | 举例 |
| :--- | :--- | :--- |
| ! | 非运算，表达式为 true 则返回 false，否则返回 true。 | \[ ! false \] 返回 true。 |
| -o | 或运算，有一个表达式为 true 则返回 true。 | \[ $a -lt 20 -o $b -gt 100 \] 返回 true。 |
| -a | 与运算，两个表达式都为 true 才返回 true。 | \[ $a -lt 20 -a $b -gt 100 \] 返回 false。 |

```text
a=10
b=20

if [ $a != $b ]
then
   echo "$a != $b : a 不等于 b"
else
   echo "$a == $b: a 等于 b"
fi
if [ $a -lt 100 -a $b -gt 15 ]
then
   echo "$a 小于 100 且 $b 大于 15 : 返回 true"
else
   echo "$a 小于 100 且 $b 大于 15 : 返回 false"
fi
if [ $a -lt 100 -o $b -gt 100 ]
then
   echo "$a 小于 100 或 $b 大于 100 : 返回 true"
else
   echo "$a 小于 100 或 $b 大于 100 : 返回 false"
fi
if [ $a -lt 5 -o $b -gt 100 ]
then
   echo "$a 小于 5 或 $b 大于 100 : 返回 true"
else
   echo "$a 小于 5 或 $b 大于 100 : 返回 false"
fi
```

输出:

```text
10 != 20 : a 不等于 b
10 小于 100 且 20 大于 15 : 返回 true
10 小于 100 或 20 大于 100 : 返回 true
10 小于 5 或 20 大于 100 : 返回 false
```

**逻辑运算符:**

以下介绍 Shell 的逻辑运算符，假定变量 a 为 10，变量 b 为 20:

| 运算符 | 说明 | 举例 |  |  |
| :--- | :--- | :--- | :--- | :--- |
| && | 逻辑的 AND | \[\[ $a -lt 100 && $b -gt 100 \]\] 返回 false |  |  |
| \|\| | 逻辑的 OR | \[\[ $a -lt 100 |  | $b -gt 100 \]\] 返回 true |

例子:

```text
a=10
b=20
if [[ $a -lt 100 && $b -gt 100 ]]
then
   echo "返回 true"
else
   echo "返回 false"
fi

if [[ $a -lt 100 || $b -gt 100 ]]
then
   echo "返回 true"
else
   echo "返回 false"
fi
```

输出:

```text
返回 false
返回 true
```

**字符串运算符**

下表列出了常用的字符串运算符，假定变量 a 为 "123"，变量 b 为 "456"：

| 运算符 | 说明 | 举例 |
| :--- | :--- | :--- |
| = | 检测两个字符串是否相等，相等返回 true。 | \[ $a = $b \] 返回 false。 |
| != | 检测两个字符串是否相等，不相等返回 true。 | \[ $a != $b \] 返回 true。 |
| -z | 检测字符串长度是否为0，为0返回 true。 | \[ -z $a \] 返回 false。 |
| -n | 检测字符串长度是否为0，不为0返回 true。 | \[ -n "$a" \] 返回 true。 |
| $ | 检测字符串是否为空，不为空返回 true。 | \[ $a \] 返回 true。 |

例子:

```text
str1="123"
str2="456"

if [ $str1 = $str2 ]
then
   echo "$str1 = $str2 : str1 等于 str2"
else
   echo "$str1 = $str2: str1 不等于 str2"
fi
if [ $str1 != $str2 ]
then
   echo "$str1 != $str2 : str1 不等于 str2"
else
   echo "$str1 != $str2: str1 等于 str2"
fi
if [ -z $str1 ]
then
   echo "-z $str1 : 字符串长度为 0"
else
   echo "-z $str1 : 字符串长度不为 0"
fi
if [ -n "$str1" ]
then
   echo "-n $str1 : 字符串长度不为 0"
else
   echo "-n $str1 : 字符串长度为 0"
fi
if [ $str1 ]
then
   echo "$str1 : 字符串不为空"
else
   echo "$str1 : 字符串为空"
fi
```

输出:

```text
123 = 456: str1 不等于 str2
123 != 456 : str1 不等于 str2
-z 123 : 字符串长度不为 0
-n 123 : 字符串长度不为 0
123 : 字符串不为空
```

**文件测试运算符:**

文件测试运算符用于检测 Unix 文件的各种属性。

属性检测描述如下：

| 操作符 | 说明 | 举例 |
| :--- | :--- | :--- |
| -b file | 检测文件是否是块设备文件，如果是，则返回 true。 | \[ -b $file \] 返回 false。 |
| -c file | 检测文件是否是字符设备文件，如果是，则返回 true。 | \[ -c $file \] 返回 false。 |
| -d file | 检测文件是否是目录，如果是，则返回 true。 | \[ -d $file \] 返回 false。 |
| -f file | 检测文件是否是普通文件（既不是目录，也不是设备文件），如果是，则返回 true。 | \[ -f $file \] 返回 true。 |
| -g file | 检测文件是否设置了 SGID 位，如果是，则返回 true。 | \[ -g $file \] 返回 false。 |
| -k file | 检测文件是否设置了粘着位\(Sticky Bit\)，如果是，则返回 true。 | \[ -k $file \] 返回 false。 |
| -p file | 检测文件是否是有名管道，如果是，则返回 true。 | \[ -p $file \] 返回 false。 |
| -u file | 检测文件是否设置了 SUID 位，如果是，则返回 true。 | \[ -u $file \] 返回 false。 |
| -r file | 检测文件是否可读，如果是，则返回 true。 | \[ -r $file \] 返回 true。 |
| -w file | 检测文件是否可写，如果是，则返回 true。 | \[ -w $file \] 返回 true。 |
| -x file | 检测文件是否可执行，如果是，则返回 true。 | \[ -x $file \] 返回 true。 |
| -s file | 检测文件是否为空（文件大小是否大于0），不为空返回 true。 | \[ -s $file \] 返回 true。 |
| -e file | 检测文件（包括目录）是否存在，如果是，则返回 true。 | \[ -e $file \] 返回 true。 |

其他检查符：

* **-S**: 判断某文件是否 socket。
* **-L**: 检测文件是否存在并且是一个符号链接。

变量 file 表示文件 **/root/android/shell/test.sh**，它具有 **rwx** 权限。下面的代码，将检测该文件的各种属性：

```text
file="/root/android/shell/test.sh"
if [ -r $file ]
then
   echo "文件可读"
else
   echo "文件不可读"
fi
if [ -w $file ]
then
   echo "文件可写"
else
   echo "文件不可写"
fi
if [ -x $file ]
then
   echo "文件可执行"
else
   echo "文件不可执行"
fi
if [ -f $file ]
then
   echo "文件为普通文件"
else
   echo "文件为特殊文件"
fi
if [ -d $file ]
then
   echo "文件是个目录"
else
   echo "文件不是个目录"
fi
if [ -s $file ]
then
   echo "文件不为空"
else
   echo "文件为空"
fi
if [ -e $file ]
then
   echo "文件存在"
else
   echo "文件不存在"
fi
```

输出:

```text
文件可读
文件可写
文件可执行
文件为普通文件
文件不是个目录
文件不为空
文件存在
```

### echo 命令

Shell 的 echo 指令用于字符串的输出。命令格式：

```text
echo string
```

例子

```text
#显示普通字符串
echo "This is a book"
#也可以省略双引号
echo This is a book
#显示转义字符
echo"\"This is a book"\"
#显示变量
your_name_2="DevYK_2"
echo "变量的名称是:$your_name_2"
#显示换行 -e 开始转义
echo -e "换行 \n"
echo  "是否换行了"
#显示不换行
echo -e "不换行 \c"
echo  "是否换行了"
#显示命令执行结果
echo `date`
```

输出:

```text
This is a book
This is a book
"This is a book"
变量的名称是:DevYK_2
换行 

是否换行了
不换行 是否换行了
Mon Jan 13 12:12:32 CST 2020
```

### printf 命令

上一章节我们学习了 Shell 的 echo 命令，本章节我们来学习 Shell 的另一个输出命令 printf。

printf 命令模仿 C 程序库（library）里的 printf\(\) 程序。

printf 由 POSIX 标准所定义，因此使用 printf 的脚本比使用 echo 移植性好。

printf 使用引用文本或空格分隔的参数，外面可以在 printf 中使用格式化字符串，还可以制定字符串的宽度、左右对齐方式等。默认 printf 不会像 echo 自动添加换行符，我们可以手动添加 \n。

printf 命令的语法：

```text
printf  format-string  [arguments...]
```

**参数说明：**

* **format-string:** 为格式控制字符串
* **arguments:** 为参数列表。

例子:

```text
printf "%-10s %-8s %-4s\n"   姓名 性别 体重kg  
printf "%-10s %-8s %-4.2f\n" 郭靖 男 66.1234 
printf "%-10s %-8s %-4.2f\n" 杨过 男 48.6543 
printf "%-10s %-8s %-4.2f\n" 郭芙 女 47.9876
```

输出:

```text
姓名     性别   体重kg
郭靖     男      66.12
杨过     男      48.65
郭芙     女      47.99
```

%s %c %d %f都是格式替代符

%-10s 指一个宽度为10个字符（-表示左对齐，没有则表示右对齐），任何字符都会被显示在10个字符宽的字符内，如果不足则自动以空格填充，超过也会将内容全部显示出来。

%-4.2f 指格式化为小数，其中.2指保留2位小数。

### test 命令

Shell中的 test 命令用于检查某个条件是否成立，它可以进行数值、字符和文件三个方面的测试。

**数值测试:**

| 参数 | 说明 |
| :--- | :--- |
| -eq | 等于则为真 |
| -ne | 不等于则为真 |
| -gt | 大于则为真 |
| -ge | 大于等于则为真 |
| -lt | 小于则为真 |
| -le | 小于等于则为真 |

例子:

```text
num1=100
num2=100
if test $[num1] -eq $[num2]
then
    echo '两个数相等！'
else
    echo '两个数不相等！'
fi
```

输出:

```text
两个数相等！
```

**字符串测试:**

| 参数 | 说明 |
| :--- | :--- |
| = | 等于则为真 |
| != | 不相等则为真 |
| -z 字符串 | 字符串的长度为零则为真 |
| -n 字符串 | 字符串的长度不为零则为真 |

例子:

```text
name_="DEVYK"
name2_="DevYK"
if test $name_ = $name2_
then
    echo '两个字符串相等!'
else
    echo '两个字符串不相等!'
fi
```

输出:

```text
两个字符串不相等!
```

**文件测试:**

| 参数 | 说明 |
| :--- | :--- |
| -e 文件名 | 如果文件存在则为真 |
| -r 文件名 | 如果文件存在且可读则为真 |
| -w 文件名 | 如果文件存在且可写则为真 |
| -x 文件名 | 如果文件存在且可执行则为真 |
| -s 文件名 | 如果文件存在且至少有一个字符则为真 |
| -d 文件名 | 如果文件存在且为目录则为真 |
| -f 文件名 | 如果文件存在且为普通文件则为真 |
| -c 文件名 | 如果文件存在且为字符型特殊文件则为真 |
| -b 文件名 | 如果文件存在且为块特殊文件则为真 |

例子:

```text
if test -e ./test.sh
then
    echo '文件已存在!'
else
    echo '文件不存在!'
fi
```

输出:

```text
文件已存在!
```

### 流程控制

和 Java 语言不一样，sh 的流程控制不可为空，如\(以下为Java流程控制写法\)：

```java
if(1 == 2){
  add(1,2)
}else{
  //不做任何处理
}
```

在sh/bash里可不能这么写，如果else分支没有语句执行，就不要写这个else。

**if 语句语法格式:**

```text
if condition
then
    command1 
    command2
    ...
    commandN 
fi
```

写成一行（适用于终端命令提示符）：

```text
if [ $(ps -ef | grep -c "ssh") -gt 1 ]; then echo "true"; fi
```

**for 循环:**

```text
for var in item1 item2 ... itemN
do
    command1
    command2
    ...
    commandN
done
```

例子:

```text
for loop in 1 2 3
do
    echo "the value is $loop"
done
```

输出:

```text
the value is 1
the value is 2
the value is 3
```

**while 语句**

while 循环用于不断执行一系列命令，也用于从输入文件中读取数据；命令通常为测试条件。其格式为：

```text
while condition
do
    command
done
```

以下是一个基本的 while 循环，测试条件是：如果 int 小于等于 5，那么条件返回真。int 从 0 开始，每次循环处理时，int 加 1 。运行上述脚本，返回数字 1 到 5 ，然后终止。

```text
int=1
while(( $int<=5 ))
do
    echo $int
    let "int++"
done
```

输出:

```text
1
2
3
4
5
```

**无限循环**

无限循环语法格式：

```text
while :
do
    command
done
```

或者:

```text
while true
do
    command
done
```

或者:

```text
for (( ; ; ))
```

### 函数

linux shell 可以用户定义函数，然后在 shell 脚本中可以随便调用。

shell 中函数的定义格式如下：

```text
[ function ] funname [()]

{

    action;

    [return int;]

}
```

说明：

* 1、可以带 function fun\(\) 定义，也可以直接 fun\(\) 定义,不带任何参数。
* 2、参数返回，可以显示加：return 返回，如果不加，将以最后一条命令运行结果，作为返回值。 return 后跟数值 n\(0-255\)

例子:

```text
funWithReturn(){
    echo "这个函数会对输入的两个数字进行相加运算..."
    echo "输入第一个数字: "
    read aNum
    echo "输入第二个数字: "
    read anotherNum
    echo "两个数字分别为 $aNum 和 $anotherNum !"
    return $(($aNum+$anotherNum))
}
funWithReturn
echo "输入的两个数字之和为 $? !"
```

输出:

```text
这个函数会对输入的两个数字进行相加运算...
输入第一个数字: 
12
输入第二个数字: 
22
两个数字分别为 12 和 22 !
输入的两个数字之和为 34 !
```

函数返回值在调用该函数后通过 $? 来获得。

注意：所有函数在使用前必须定义。这意味着必须将函数放在脚本开始部分，直至 shell 解释器首次发现它时，才可以使用。调用函数仅使用其函数名即可。

**函数参数:**

在 Shell 中，调用函数时可以向其传递参数。在函数体内部，通过 $n 的形式来获取参数的值，例如，$1表示第一个参数，$2表示第二个参数...

例子:

```text
funWithParam(){
    echo "第一个参数为 $1 !"
    echo "第二个参数为 $2 !"
    echo "第十个参数为 $10 !"
    echo "第十个参数为 ${10} !"
    echo "第十一个参数为 ${11} !"
    echo "参数总数有 $# 个!"
    echo "作为一个字符串输出所有参数 $* !"
}
funWithParam 1 2 3 4 5 6 7 8 9 22 11
```

输出:

```text
第一个参数为 1 !
第二个参数为 2 !
第十个参数为 10 !
第十个参数为 22 !
第十一个参数为 11 !
参数总数有 11 个!
作为一个字符串输出所有参数 1 2 3 4 5 6 7 8 9 22 11 !
```

注意，$10 不能获取第十个参数，获取第十个参数需要​${10}。当n&gt;=10时，需要使用${n}来获取参数。

另外，还有几个特殊字符用来处理参数：

| 参数处理 | 说明 |
| :--- | :--- |
| $\# | 传递到脚本或函数的参数个数 |
| $\* | 以一个单字符串显示所有向脚本传递的参数 |
| $$ | 脚本运行的当前进程ID号 |
| $! | 后台运行的最后一个进程的ID号 |
| $@ | 与$\*相同，但是使用时加引号，并在引号中返回每个参数。 |
| $- | 显示Shell使用的当前选项，与set命令功能相同。 |
| $? | 显示最后命令的退出状态。0表示没有错误，其他任何值表明有错误。 |

## 总结

Shell 入门知识就介绍这么多，后续编译第三方库编写 Shell 脚本有陌生的在进行介绍。

## 参考

* [Shell 教程](https://www.runoob.com/linux/linux-shell-basic-operators.html)
* [Linux 命令](https://www.runoob.com/linux/linux-command-manual.html)

