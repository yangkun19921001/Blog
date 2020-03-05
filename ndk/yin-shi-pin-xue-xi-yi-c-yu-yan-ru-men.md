# 音视频学习 \(一\) C 语言入门

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191217201707.png)

## 前言

现在 Android 初中级开发工程师想找一份满意的工作是越来越难了，当然有实力的是不愁好工作的。如果正巧你是初中级工程师想要进阶音视频方向或者对 NDK 技术感兴趣的，那么关注我准没错。在 5G 时代的到来，我相信音视频方向的工程师会越来越吃香。那么想要学习音视频技术首先就得具备 C/C++ 语言基础，下面我们就先来学习 C 语言基础。

> ps: 音视频方向计划写一个系列文章 \(初步计划以 C/C++ 语言基础、JNI 、MakeFile/Cmake 、利用 FFmpeg 开发音视频播放器 、RTMP 直播、OpenCV 人脸/车牌识别、OpenGL 视频处理、视频特效、WebRTC 音视频通话等技术文章\)，该系列我也会持续更新 。C/C++ 基础文章本来我是不打算写的，看过我的文章都知道我写的几乎是系列文章，如果缺胳膊少腿的看起来也不那么清晰流程，所以 C/C++ 基础我就参考网上的来写了，因为基础这个东西，网上好的入门资料太多了，该篇就当复习参考了。有这方面基础的可以直接翻篇了😂。

就不说那么多废话了，下面我们就一起来学习音视频方向的技术，让我们一起沉浸在学习中无法自拔😁。

## C 简介

C 语言是一种通用的高级语言，最初是由丹尼斯·里奇在贝尔实验室为开发 UNIX 操作系统而设计的。C 语言最开始是于 1972 年在 DEC PDP-11 计算机上被首次实现。

在 1978 年，布莱恩·柯林汉（Brian Kernighan）和丹尼斯·里奇（Dennis Ritchie）制作了 C 的第一个公开可用的描述，现在被称为 K&R 标准。

UNIX 操作系统，C编译器，和几乎所有的 UNIX 应用程序都是用 C 语言编写的。由于各种原因，C 语言现在已经成为一种广泛使用的专业语言。

* 易于学习。
* 结构化语言。
* 它产生高效率的程序。
* 它可以处理底层的活动。
* 它可以在多种计算机平台上编译。

## 环境设置

这是只说明在 MAC 上怎么使用 C 语言来进行开发，环境的话需要用到 GCC 进行编译，你可以下载并安装 Xcode 工具，一旦安装上 Xcode，您就能使用 GNU 编译器。开发工具你可以使用 Xcode 或者 CLion 都可以，看个人喜好。我这里用的是 CLion 工具，你可以发现 CLion 页面跟使用风格包括快捷键都跟 AndroidStudio 一样。上手极其容易。

## C 语言入门

不知道大家在学习一门新的开发语言敲的第一行代码是什么？应该百分之 90 % 以上都是打印 ”HelloWorld“ 吧，我们就以打印 ”HelloWorld“ 为例来正式进入 C 语言的学习吧。

### 1. 程序结构

我们先来看一下最简单的一个 C 程序，先来打印一个 “HelloWorld”。代码如下:

```c
#include <stdio.h>
/**
 * C 语言入口程序
 * @return
 */
int main() {//主函数，程序从这里开始执行
    printf("C 语言入门第一行代码 Hello World! \n");
    return 0;
}
```

可以看到 C 语言的入口函数跟 Java 的类似吧，都是以 `main` 来定义的入口，接下来我们讲解一下上面这段程序的意思：

1. 程序的第一行 _\#include_  是预处理器指令，告诉 C 编译器在实际编译之前要包含 stdio.h 文件。
2. 下一行 /_..._/ 将会被编译器忽略，这里放置程序的注释内容。它们被称为程序的注释。
3. 下一行 _int main\(\)_ 是主函数，程序从这里开始执行。
4. 下一行 _printf\(...\)_ 是 C 中另一个可用的函数，会在屏幕上显示消息 "C 语言入门第一行代码 Hello World!"。
5. 下一行 **return 0;** 终止 main\(\) 函数，并返回值 0。

当然你可以通过命令来执行,如下所示:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191215204637.gif)

```c
1. 使用 gcc xxx.c
2. ./a.out
```

直接使用上面 2 个步骤就可以进行执行 C 代码了。

### 2. 基本语法

上一小节我们知道了一个简单的小应用由哪些部分组成，这将有助于我们理解 C 语言的其它基本的构建块。

c 程序由各种令牌组成，令牌可以是关键字、标识符、常量、字串符值、或者是一个符号。

下面我们来看一下 C 中的关键字，这些关键字不能作为常量名，变量名或者其它标识符名称（跟 Java 类似）。

| 关键字 | 说明 |
| :--- | :--- |
| auto | 声明自动变量 |
| break | 跳出当前循环 |
| case | 开关语句分支 |
| char | 声明字符型变量或者函数返回值类型 |
| const | 声明只具可读变量 |
| continue | 结束当前循环，开始下一个循环 |
| default | 开关语句中的其它分支 |
| do | 循环语句的循环体 |
| double | 声明双进度浮点型变量或者函数返回值类型 |
| else | 条件语句否定分支 |
| enum | 声明枚举类型 |
| extern | 声明变量或函数是在其它文件或本文件的其他位置定义 |
| float | 声明浮点型变量或者函数返回值类型 |
| for | 一种循环语句 |
| goto | 无条件跳转语句 |
| if | 条件语句 |
| int | 声明整型变量或函数 |
| long | 声明长整型变量或函数返回值类型 |
| register | 声明寄存器变量 |
| return | 子程序返回语句 |
| short | 声明短整型变量或者函数 |
| signed | 声明有符号类型变量或者函数 |
| sizeof | 计算数据类型或者变量长度（即所占字节数） |
| static | 声明静态变量 |
| struct | 声明结构体类型 |
| switch | 用于开关语句 |
| typedef | 用以给数据类型取别名 |
| unsigned | 声明无符号类型变量或函数 |
| union | 声明共用体类型 |
| void | 声明函数无返回值或无参树，声明无类型指针 |
| volatile | 说明变量在程序执行中可被隐含地改变 |
| while | 循环语句的循环条件 |

### 3. 数据类型

在 C 语言中，数据类型指的是用于声明不同类型的变量或函数的一个广泛的系统。变量的类型决定了变量存储占用的空间，以及如何解释存储的位模式。

C 中的类型可分为以下几种：

| 类型 | 说明 |
| :--- | :--- |
| 基本类型 | 它们是算术类型，包括两种类型：整数类型和浮点类型。 |
| 枚举类型 | 它们也是算术类型，被用来定义在程序中只能赋予其一定的离散整数值得变量。 |
| void 类型 | 类型说明符 void 表名没有可用的值 |
| 派生类型 | 它们包括：指针类型、数组类型、结构类型、共用体类型和函数类型。 |

**整数类型**

下表列出了关于标准整数类型的存储大小和值范围的细节

| 类型 | 32 位 | 64  位 | 值范围 |
| :--- | :--- | :--- | :--- |
| char | 1 | 1 | -128 到 127 或 0 到 255 |
| unsigned char | 1 | 1 | 0 到 255 |
| int | 4 | 4 | -32,768 到 32,767 或 -2,147,483,648 到 2,147,483,647 |
| unsigned int | 4 | 4 | 0 到 65,535 或 0 到 4,294,967,295 |
| short | 2 | 2 | -32,768 到 32,767 |
| unsigned short | 2 | 2 | 0 到 65,535 |
| long | 4 | 8 | -2,147,483,648 到 2,147,483,647 |
| unsigned long | 4 | 8 | 0 到 4,294,967,295 |

`注意:` 各种类型的存储大小与系统位数有关，但目前通用的以 64 为系统为主。

**浮点类型**

| 类型 | 比特（位）数 | 有效数字 | 取值范围 |
| :--- | :--- | :--- | :--- |
| float | 4 | 6~7 | 1.2E-38 到 3.4E+38 |
| double | 8 | 15~16 | 2.3E-308 到 1.7E+308 |
| long double | 16 | 18~19 | 3.4E-4932 到 1.1E+4932 |

他们的字节，精度，取值范围都可以通过代码打印实现，如下:

```c
void main() {
        /**
     * 整数类型
     */

    printf("\n\n 整数类型 \n");

    //char 1 字节
    printf("char 存储大小: %lu \n", sizeof(char));
    printf("unsinged char 存储大小: %lu \n", sizeof(unsigned char));

    //short 2 字节
    printf("short 存储大小: %lu \n", sizeof(short));
    printf("unsinged short 存储大小: %lu \n", sizeof(unsigned short));

    //int 4 字节
    printf("int 存储大小: %lu \n", sizeof(int));
    printf("unsinged int 存储大小: %lu \n", sizeof(unsigned int));


    //long 4/8 字节
    printf("long 存储大小: %lu \n", sizeof(long));
    printf("unsinged long 存储大小: %lu \n", sizeof(unsigned long));

        /**
     * 浮点类型
     */

    printf("\n\n 浮点类型 \n");
    //float 4 字节 ，精度 6 位小数
    printf("float 存储最大字节数：%lu \n", sizeof(float));
    printf("float 最小值：%e \n", FLT_MIN);
    printf("float 最大值：%e \n", FLT_MAX);
    printf("float 精度值：%d \n", FLT_DIG);

    //double 8 字节
    printf("double 存储最大字节数：%d \n", sizeof(double));
    printf("double 最小值：%e \n", DBL_MIN);
    printf("double 最大值：%e \n", DBL_MAX);
    printf("double 精度值：%d \n", DBL_DIG);

    //long double 16 字节
    printf("long double 存储最大字节数：%lu byte \n", sizeof(long double));
    printf("long double 最小值：%lg \n", LDBL_MIN);
    printf("long double 最大值：%lg \n", LDBL_MAX);
    printf("long double 精度值：%d \n", LDBL_DIG);

}
```

可以通过 `sizeof` 关键字来获取数据类型占用内存的大小。上面代码可以看到了打印中出现了很多不识的 scanf\(\) 格式控制符，我总结了一个表，可以参考下:

| 格式控制符 | 说明 |
| :--- | :--- |
| %c | 读取一个单一的字符 |
| %hd、%d、%ld | 读取一个十进制整数，并分别赋值给 short、int、long 类型 |
| %ho、%o、%lo | 读取一个八进制整数（可带前缀也可不带），并分别赋值给 short、int、long 类型 |
| %hx、%x、%lx | 读取一个十六进制整数（可带前缀也可不带），并分别赋值给 short、int、long 类型 |
| %hu、%u、%lu | 读取一个无符号整数，并分别赋值给 unsigned short、unsigned int、unsigned long 类型 |
| %f、%lf | 读取一个十进制形式的小数，并分别赋值给 float、double 类型 |
| %e、%le | 读取一个指数形式的小数，并分别赋值给 float、double 类型 |
| %g、%lg | 既可以读取一个十进制形式的小数，也可以读取一个指数形式的小数，并分别赋值给 float、double 类型 |
| %s | 读取一个字符串（以空白符为结束） |

### 4. 变量

变量其实只不过是程序可操作的存储区的名称。C 中每个变量都有特定的类型，类型决定了变量存储的大小和布局，该范围内的值都可以存储在内存中，运算符可应用于变量上。

变量的名称可以由字母、数字和下划线字符组成。它必须以字母或下划线开头。大写字母和小写字母是不同的，因为 C 对大小写敏感的。

**C 中的变量定义**

变量定义就是告诉编译器在何处创建变量的存储，以及如何创建变量的存储。变量定义指定一个数据类型，并包含了该类型的一个或多个变量的列表，如下所示：

```c
type list;
```

在这里，**type** 必须是一个有效的 C 数据类型，可以是 char、w\_char、int、float、double 或任何用户自定义的对象，**list** 可以由一个或多个标识符名称组成，多个标识符之间用逗号分隔。下面列出几个有效的声明：

```c
int a,b,c;
char c1,c2,c3;
float f,f1,f2;
double d1,d2,d3;
```

这里其实跟 Java 声明变量差不多，就不再单独解释了。

**c 中变量声明**

变量声明向编译器保证变量以指定的类型和名称存在，这样编译器在不需要知道变量完整细节的情况下也能继续进一步的编译。变量声明只在编译时有它的意义，在程序连接时编译器需要实际的变量声明。

变量的声明有两种情况：

* 1、一种是需要建立存储空间的。例如：int a 在声明的时候就已经建立了存储空间。
* 2、另一种是不需要建立存储空间的，通过使用 extern 关键字声明变量名而不定义它。 例如：extern int a 其中变量 a 可以在别的文件中定义的。
* 除非有 extern 关键字，否则都是变量的定义。

```c
extern int i;//声明，不是定义
int a;//声明，也是定义
```

**例子**

```c
#include <stdio.h>
//函数外定义变量      
//如果需要在一个源文件中引用另外一个源文件中定义的变量，我们只需在引用的文件中将变量加上 extern 关键字的声明即可
int x;
int y;

int sum() {
    //函数内声明变量 X , Y 为外部变量
    x = 10;
    y = 15;
    return x + y;
}

//入口函数
void main() {
    //打印变量相加
    int result;
    result = sum();
    printf("x + y = %d",result);
}
```

输出:

```c
x + y = 25
```

### 5. 常量

常量是固定值，在程序执行期间不会改变。这些固定的值，又叫做**字面量**。

常量可以是任何的基本数据类型，比如整数常量、浮点常量、字符常量，或字符串字面值，也有枚举常量。

**常量**就像是常规的变量，只不过常量的值在定义后不能进行修改。

在 Java 中声明一个常量往往是在数据类型中定义 final 关键字就行了，但是 c 中没有 final 关键字，我们来看看怎么定义，如下所示:

**整数常量**

整数常量可以是十进制、八进制或十六进制的常量。前缀指定基数：0x 或 0X 表示十六进制，0 表示八进制，不带前缀则默认表示十进制。

整数常量也可以带一个后缀，后缀是 U 和 L 的组合，U 表示无符号整数（unsigned），L 表示长整数（long）。后缀可以是大写，也可以是小写，U 和 L 的顺序任意。

```c
212         /* 合法的 */
215u        /* 合法的 */
0xFeeL      /* 合法的 */
078         /* 非法的：8 不是八进制的数字 */
032UU       /* 非法的：不能重复后缀 */
```

**浮点常量**

浮点常量由整数部分、小数点、小数部分和指数部分组成。您可以使用小数形式或者指数形式来表示浮点常量。

当使用小数形式表示时，必须包含整数部分、小数部分，或同时包含两者。当使用指数形式表示时， 必须包含小数点、指数，或同时包含两者。带符号的指数是用 e 或 E 引入的。

```c
3.14159       /* 合法的 */
314159E-5L    /* 合法的 */
510E          /* 非法的：不完整的指数 */
210f          /* 非法的：没有小数或指数 */
.e55          /* 非法的：缺少整数或分数 */
```

**定义常量**

在 C 中，有两种简单的定义常量的方式：

1. 使用 **\#define** 预处理器。
2. 使用 **const** 关键字。

下面是使用 \#define 预处理器定义常量的形式：

```c
#define identifier value
```

例子:

```c
#define name 10L
#define age 27U
void main() {
    int  person;
    person = name + age;
    printf("values :%d",person);

}
```

**const 关键字**

您可以使用 **const** 前缀声明指定类型的常量，如下所示：

```c
const type variable = value;
```

例子:

```c
void main() {
    const int LEGTH = 10;
    const int WIDTH = 5;
    const char NEWLINE = '\n';
    int area;
    area = LEGTH * WIDTH;
    printf("value of area: %d", area);
}
```

### 6. 存储类

存储类定义 C 程序中变量/函数的范围（可见性）和生命周期。这些说明符放置在它们所修饰的类型之前。下面列出 C 程序中可用的存储类：

* auto
* register
* static
* extern

**auto 存储类**

auto 存储类时所有局部变量默认的存储类。

```c
int month;
auto int month;
```

上面定义了两个带有相同存储类，auto 只能用在函数内，即 auto 只能修饰局部变量。

**register 存储类**

**register** 存储类用于定义存储在寄存器中而不是 RAM 中的局部变量。这意味着变量的最大尺寸等于寄存器的大小（通常是一个词），且不能对它应用一元的 '&' 运算符（因为它没有内存位置）。

```c
register int miles;
```

寄存器只用于需要快速访问的变量，比如计数器。还应注意的是，定义 `register`并不意味着变量将被存储在寄存器中，它意味着变量可能存储在寄存器中，这取决于硬件和实现的限制。

**static 存储类**

**static** 存储类指示编译器在程序的生命周期内保持局部变量的存在，而不需要在每次它进入和离开作用域时进行创建和销毁。因此，使用 static 修饰局部变量可以在函数调用之间保持局部变量的值。static 修饰符也可以应用于全局变量。当 static 修饰全局变量时，会使变量的作用域限制在声明它的文件内。

全局声明的一个 static 变量或方法可以被任何函数或方法调用，只要这些方法出现在跟 static 变量或方法同一个文件中。

例子:

```c
//函数声明
void func1(void);

static int count = 10; //全局变量 - static 默认的
void main() {
    while (count--) {
        func1();
    }
}

void func1(void) {
//   'thingy' 是 'func1' 的局部变量 - 只初始化一次
// * 每次调用函数 'func1' 'thingy' 值不会被重置。 
    static int thingy = 5;
    thingy++;
    printf("thingy 为 %d, count 为 %d \n", thingy, count);
}
```

输出:

```c
thingy 为 6, count 为 9 
thingy 为 7, count 为 8 
thingy 为 8, count 为 7 
thingy 为 9, count 为 6 
thingy 为 10, count 为 5 
thingy 为 11, count 为 4 
thingy 为 12, count 为 3 
thingy 为 13, count 为 2 
thingy 为 14, count 为 1 
thingy 为 15, count 为 0
```

实例中 count 作为全局变量可以在函数内使用，thingy 在局部使用 static 修饰后，不会在每次调用时重置。

**extern 存储类**

**extern** 存储类用于提供一个全局变量的引用，全局变量对所有的程序文件都是可见的。当您使用 **extern** 时，对于无法初始化的变量，会把变量名指向一个之前定义过的存储位置。

当您有多个文件且定义了一个可以在其他文件中使用的全局变量或函数时，可以在其他文件中使用 _extern_ 来得到已定义的变量或函数的引用。可以这么理解，_extern_ 是用来在另一个文件中声明一个全局变量或函数。

extern 修饰符通常用于当有两个或多个文件共享相同的全局变量或函数的时候，如下所示：

第一个文件 ndk\_day1.c

```c
#include <stdio.h> //stdio.h 是一个头文件（标准输入输出头文件）,#include 是一个预处理命令，用来引入头文件。
#include "support.h" //引入自己的头文件
int main() {
    int sum = add(2, 5);
    printf("extern 使用 :%d", sum);
}
```

声明 support.h 头文件

```c
//
// Created by 阳坤 on 2019/12/13.
//

#ifndef NDK_SAMPLE_SUPPORT_H
#define NDK_SAMPLE_SUPPORT_H

#endif //NDK_SAMPLE_SUPPORT_H

extern int add(int num1,int num2);
```

头文件的实现 support.c

```c
int add(int num1,int num2){
    return num1 * num2;
}
```

输出:

```c
extern 使用 :10
```

### 7. 运算符

运算符是一种告诉编译器执行特定的数学或逻辑操作的符号。C 语言内置了丰富的运算符，并提供了以下类型的运算符：

* 算术运算符
* 关系运算符
* 逻辑运算符
* 位运算符
* 赋值运算符
* 杂项运算符

**算术运算符**

下表显示了 C 语言支持的所有算术运算符。假设变量 **A** 的值为 10，变量 **B** 的值为 20，则：

| 运算符 | 描述 | 实例 |
| :--- | :--- | :--- |
| + | 把两个操作数相加 | A + B 将得到 30 |
| - | 从第一个操作数中减去第二个操作数 | A - B 将得到 -10 |
| \* | 把两个操作数相乘 | A \* B 将得到 200 |
| / | 分子除以分母 | B / A 将得到 2 |
| % | 取模运算符，整除后的余数 | B % A 将得到 0 |
| ++ | 自增运算符，整数值增加 1 | A++ 将得到 11 |
| -- | 自减运算符，整数值减少 1 | A-- 将得到 9 |

例子:

```c
void main(){
    int a = 21;
    int b = 10;
    int c;

    c = a + b;
    printf("a + b = %d \n", c);

    c = a - b;
    printf("a - b = %d \n", c);

    c = a * b;
    printf("a * b = %d \n", c);

    c = a / b;
    printf("a / b = %d \n", c);

    c = a % b;
    printf("a % b = %d \n", c);

    c = ++a;
    printf("++a = %d , %d \n", c, a);

    c = b++;
    printf("b++ = %d , %d \n", c, b);

    c = b--;
    printf("b-- = %d \n", c);
}
```

输出:

```c
a + b = 31 
a - b = 11 
a * b = 210 
a / b = 2 
a b = 1 
++a = 22 , 22 
b++ = 10 , 11 
b-- = 11
```

**关系运算符**

下表显示了 C 语言支持的所有关系运算符。假设变量 **A** 的值为 10，变量 **B** 的值为 20，则：

| 运算符 | 描述 | 实例 |
| :--- | :--- | :--- |
| == | 检查两个操作数的值是否相等，如果相等则条件为真。 | \(A == B\) 为假。 |
| != | 检查两个操作数的值是否相等，如果不相等则条件为真。 | \(A != B\) 为真。 |
| &gt; | 检查左操作数的值是否大于右操作数的值，如果是则条件为真。 | \(A &gt; B\) 为假。 |
| &lt; | 检查左操作数的值是否小于右操作数的值，如果是则条件为真。 | \(A &lt; B\) 为真。 |
| &gt;= | 检查左操作数的值是否大于或等于右操作数的值，如果是则条件为真。 | \(A &gt;= B\) 为假。 |
| &lt;= | 检查左操作数的值是否小于或等于右操作数的值，如果是则条件为真。 | \(A &lt;= B\) 为真。 |

**逻辑运算符**

下表显示了 C 语言支持的所有关系逻辑运算符。假设变量 **A** 的值为 1，变量 **B** 的值为 0，则：

| 运算符 | 描述 | 实例 |
| :--- | :--- | :--- |
| && | 称为逻辑与运算符。如果两个操作数都非零，则条件为真。 | \(A && B\) 为假。 |
| \|\| | 称为逻辑或运算符。如果两个操作数中有任意一个非零，则条件为真。 | \(A \|\| B\) 为真。 |
| ! | 称为逻辑非运算符。用来逆转操作数的逻辑状态。如果条件为真则逻辑非运算符将使其为假。 | !\(A && B\) 为真。 |

```c
void main(){
   int a1 = 5;
    int b1 = 5;
    int c1;
    //如果两个操作数都非零，则条件为真。
    if (a1 && b1) {
        printf("a1 && b1  %d \n", true);
    } else {
        printf("a1 && b1  %d \n", false);
    }
    //如果两个操作数中有任意一个非零，则条件为真。
    if (a1 || b1) {
        printf("a1 || b1  %d \n", true);
    } else {
        printf("a1 || b1  %d \n", false);
    }

    //改变 a1 b1 的值
    a1 = 0;
    b1 = 10;

    //如果两个操作数都非零，则条件为真。
    if (a1 && b1) {
        printf("a1 && b1  %d \n", true);
    } else {
        printf("a1 && b1  %d \n", false);
    }

    if (!(a1 && b1)) {
        printf("!(a1 && b1)  %d \n", true);
    } else {
        printf("a1 || b1  %d \n", false);
    }

}
```

输出:

```c
a1 && b1  1 
a1 || b1  1 
a1 && b1  0 
!(a1 && b1)  1
```

**位运算符**

| p | q | p & q | p \| q | p ^ q |
| :--- | :--- | :--- | :--- | :--- |
| 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 | 1 |
| 1 | 1 | 1 | 1 | 0 |
| 1 | 0 | 0 | 1 | 1 |

```c
void main(){
   //位运算符 & | ^ ~
    int wA = 60; //0011 1100
    int wB = 13; //0000 1101
    int wC = 10;

    //都为真，才是真 0000 1100
    printf("wA & wB=？%d\n", wA & wB);

    //其中一个为真，就为真 0011 1101
    printf("wA | wB=？%d\n", wA | wB);

    //一个为真则为真，2个为真这为假 00110001
    printf("wA ^ wB=？%d\n", wA ^ wB);

    printf("~wB=？%d\n", ~wB);


    //二进制左移运算符 左 * 4 = 40
    printf("wC<<2=？%d\n", wC << 2);

    //二进制右移运算符 右 / 4
    printf("wC>>2=？%d\n", wC >> 2);
}
```

输出:

```c
wA & wB=？12
wA | wB=？61
wA ^ wB=？49
~wB=？-14
wC<<2=？40
wC>>2=？2
```

下表显示了 C 语言支持的位运算符。假设变量 **A** 的值为 60，变量 **B** 的值为 13，则：

| 运算符 | 描述 | 实例 |  |  |  |  |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| & | 按位与操作，按二进制位进行"与"运算。运算规则：`0&0=0;    0&1=0;     1&0=0;      1&1=1;` | \(A & B\) 将得到 12，即为 0000 1100 |  |  |  |  |
| \| | 按位或运算符，按二进制位进行"或"运算。运算规则：\`0 | 0=0;    0 | 1=1;    1 | 0=1;     1 | 1=1;\` | \(A \| B\) 将得到 61，即为 0011 1101 |
| ^ | 异或运算符，按二进制位进行"异或"运算。运算规则：`0^0=0;    0^1=1;    1^0=1;   1^1=0;` | \(A ^ B\) 将得到 49，即为 0011 0001 |  |  |  |  |
| ~ | 取反运算符，按二进制位进行"取反"运算。运算规则：`~1=0;    ~0=1;` | \(~A \) 将得到 -61，即为 1100 0011，一个有符号二进制数的补码形式。 |  |  |  |  |
| &lt;&lt; | 二进制左移运算符。将一个运算对象的各二进制位全部左移若干位（左边的二进制位丢弃，右边补0）。 | A &lt;&lt; 2 将得到 240，即为 1111 0000 |  |  |  |  |
| &gt;&gt; | 二进制右移运算符。将一个数的各二进制位全部右移若干位，正数左补0，负数左补1，右边丢弃。 | A &gt;&gt; 2 将得到 15，即为 0000 1111 |  |  |  |  |

**赋值运算符**

下表列出了 C 语言支持的赋值运算符：

| 运算符 | 描述 | 实例 |
| :--- | :--- | :--- |
| = | 简单的赋值运算符，把右边操作数的值赋给左边操作数 | C = A + B 将把 A + B 的值赋给 C |
| += | 加且赋值运算符，把右边操作数加上左边操作数的结果赋值给左边操作数 | C += A 相当于 C = C + A |
| -= | 减且赋值运算符，把左边操作数减去右边操作数的结果赋值给左边操作数 | C -= A 相当于 C = C - A |
| \*= | 乘且赋值运算符，把右边操作数乘以左边操作数的结果赋值给左边操作数 | C _= A 相当于 C = C_  A |
| /= | 除且赋值运算符，把左边操作数除以右边操作数的结果赋值给左边操作数 | C /= A 相当于 C = C / A |
| %= | 求模且赋值运算符，求两个操作数的模赋值给左边操作数 | C %= A 相当于 C = C % A |
| &lt;&lt;= | 左移且赋值运算符 | C &lt;&lt;= 2 等同于 C = C &lt;&lt; 2 |
| &gt;&gt;= | 右移且赋值运算符 | C &gt;&gt;= 2 等同于 C = C &gt;&gt; 2 |
| &= | 按位与且赋值运算符 | C &= 2 等同于 C = C & 2 |
| ^= | 按位异或且赋值运算符 | C ^= 2 等同于 C = C ^ 2 |
| \|= | 按位或且赋值运算符 | C \|= 2 等同于 C = C \| 2 |

例子:

```c
void main(){
int wAA = 21;
    int wBB;

    wBB = wAA;
    printf("= %d\n", wBB);

    wBB += wAA;
    printf("+= %d\n", wBB);

    wBB -= wAA;
    printf("-= %d\n", wBB);

    wBB *= wAA;
    printf("*= %d\n", wBB);

    wBB /= wAA;
    printf("/= %d\n", wBB);

    wBB %= wAA;
    printf("%= %d\n", wBB);

    wBB <<= wAA;
    printf("<<= %d\n", wBB);

    wBB <<= wAA;
    printf(">>= %d\n", wBB);

    wBB &= wAA;
    printf("&= %d\n", wBB);

    wBB ^= wAA;
    printf("^= %d\n", wBB);

    wBB |= wAA;
    printf("|= %d\n", wBB);
}
```

输出:

```c
= 21
+= 42
-= 21
*= 441
/= 21
= 0
<<= 0
>>= 0
&= 0
^= 21
|= 21
```

**杂项运算符 sizeof、&、三元**

下表列出了 C 语言支持的其他一些重要的运算符，包括 **sizeof** 和 **? :**。

| 运算符 | 描述 | 实例 |
| :--- | :--- | :--- |
| sizeof\(\) | 返回变量的大小。 | sizeof\(a\) 将返回 4，其中 a 是整数。 |
| & | 返回变量的地址。 | &a; 将给出变量的实际地址。 |
| \* | 指向一个变量。 | \*a; 将指向一个变量。 |
| ? : | 条件表达式 | 如果条件为真 ? 则值为 X : 否则值为 Y |

例子:

```c
void main(){
      int zxA = 4;
    short zxB;
    double zxC;
    int *ptr;

    //sizeOf 运算符实例 ,lu 32位无符号整数
    printf("zxA sizeOf = %lu \n", sizeof(zxA));
    printf("zxB sizeOf = %lu \n", sizeof(zxB));
    printf("zxC sizeOf = %lu \n", sizeof(zxC));

    //& 和 * 运算符实例
    ptr = &zxA; //将 zxA 的地址值复制给 ptr 指针
    printf("zxA 的值为：%d \n", zxA);
    printf("*ptr 的值为：%d \n", *ptr);

      //三元运算符
    zxA = 10;
    zxB = (zxA == 1) ? 20 : 30;
    printf("zxb 的值为：%d \n", zxB);

    zxB = (zxA == 10) ? 20 : 30;
    printf("zxb 的值为：%d \n", zxB);
}
```

输出:

```text
zxA sizeOf = 4 
zxB sizeOf = 2 
zxC sizeOf = 8 
zxA 的值为：4 
*ptr 的值为：4 
zxb 的值为：30 
zxb 的值为：20
```

### 8. 判断

C 语言把任何**非零**和**非空**的值假定为 **true**，把**零**或 **null** 假定为 **false**。

C 语言提供了以下类型的判断语句。点击链接查看每个语句的细节。

| 语句 | 描述 |
| :--- | :--- |
| [if 语句](https://www.runoob.com/cprogramming/c-if.html) | 一个 **if 语句** 由一个布尔表达式后跟一个或多个语句组成。 |
| [if...else 语句](https://www.runoob.com/cprogramming/c-if-else.html) | 一个 **if 语句** 后可跟一个可选的 **else 语句**，else 语句在布尔表达式为假时执行。 |
| [嵌套 if 语句](https://www.runoob.com/cprogramming/c-nested-if.html) | 您可以在一个 **if** 或 **else if** 语句内使用另一个 **if** 或 **else if** 语句。 |
| [switch 语句](https://www.runoob.com/cprogramming/c-switch.html) | 一个 **switch** 语句允许测试一个变量等于多个值时的情况。 |
| [嵌套 switch 语句](https://www.runoob.com/cprogramming/c-nested-switch.html) | 您可以在一个 **switch** 语句内使用另一个 **switch** 语句。 |

**?:运算符**

跟 Java 一样

```c
void main(){
         int pdNumber;
    printf("输入一个数字：");
    scanf("%d", &pdNumber);
    (pdNumber % 2 == 0) ? printf("偶数") : printf("基数");
}
```

### 9. 循环

C 语言提供了以下几种循环类型。点击链接查看每个类型的细节。

| 循环类型 | 描述 |
| :--- | :--- |
| [while 循环](https://www.runoob.com/cprogramming/c-while-loop.html) | 当给定条件为真时，重复语句或语句组。它会在执行循环主体之前测试条件。 |
| [for 循环](https://www.runoob.com/cprogramming/c-for-loop.html) | 多次执行一个语句序列，简化管理循环变量的代码。 |
| [do...while 循环](https://www.runoob.com/cprogramming/c-do-while-loop.html) | 除了它是在循环主体结尾测试条件外，其他与 while 语句类似。 |
| [嵌套循环](https://www.runoob.com/cprogramming/c-nested-loops.html) | 您可以在 while、for 或 do..while 循环内使用一个或多个循环。 |

**循环控制语句**

循环控制语句改变你代码的执行顺序。通过它你可以实现代码的跳转。

C 提供了下列的循环控制语句。点击链接查看每个语句的细节。

| 控制语句 | 描述 |
| :--- | :--- |
| [break 语句](https://www.runoob.com/cprogramming/c-break-statement.html) | 终止**循环**或 **switch** 语句，程序流将继续执行紧接着循环或 switch 的下一条语句。 |
| [continue 语句](https://www.runoob.com/cprogramming/c-continue-statement.html) | 告诉一个循环体立刻停止本次循环迭代，重新开始下次循环迭代。 |
| [goto 语句](https://www.runoob.com/cprogramming/c-goto-statement.html) | 将控制转移到被标记的语句。但是不建议在程序中使用 goto 语句。 |

使用方法可以参考 Java ，下面给出循环的例子:

```c
void main(){
      //限制
    for (int i = 0; i < 6; i++) {
        printf("限制循环,%d \n",i);
    }
    //无限循环
    for (;;) {
        printf("该循环会一直执行下去！\n");
    }
}
```

### 10. 函数

**函数定义**

C 语言中的函数定义的一般形式如下：

```c
return_type function_name( parameter list )
{
   body of the function
}
```

在 C 语言中，函数由一个函数头和一个函数主体组成。下面列出一个函数的所有组成部分：

* **返回类型：**一个函数可以返回一个值。**return\_type** 是函数返回的值的数据类型。有些函数执行所需的操作而不返回值，在这种情况下，return\_type 是关键字 **void**。
* **函数名称：**这是函数的实际名称。函数名和参数列表一起构成了函数签名。
* **参数：**参数就像是占位符。当函数被调用时，您向参数传递一个值，这个值被称为实际参数。参数列表包括函数参数的类型、顺序、数量。参数是可选的，也就是说，函数可能不包含参数。
* **函数主体：**函数主体包含一组定义函数执行任务的语句。

例子:

```c
/* 函数返回两个数中较大的那个数 */
int max(int num1, int num2) 
{
   /* 局部变量声明 */
   int result;

   if (num1 > num2)
      result = num1;
   else
      result = num2;

   return result; 
}
```

**函数声明**

函数**声明**会告诉编译器函数名称及如何调用函数。函数的实际主体可以单独定义。

函数声明包括以下几个部分：

```text
return_type function_name( parameter list );
```

针对上面定义的函数 max\(\)，以下是函数声明：

```text
int max(int num1, int num2);
```

在函数声明中，参数的名称并不重要，只有参数的类型是必需的，因此下面也是有效的声明：

```text
int max(int, int);
```

当您在一个源文件中定义函数且在另一个文件中调用函数时，函数声明是必需的。在这种情况下，您应该在调用函数的文件顶部声明函数。

**调用函数**

```c
//函数声明
int max(int num1, int num2);

/**
 *C 函数
 */
void main() {
    //找出函数中最大值
    printf("找出函数中最大值，%d \n",max(66,88));

}

int max(int num1, int num2) {
    return (num1 > num2) ? num1 : num2;
}
```

输出:

```c
找出函数中最大值，88
```

**函数参数**

如果函数要使用参数，则必须声明接受参数值的变量。这些变量称为函数的**形式参数**。

形式参数就像函数内的其他局部变量，在进入函数时被创建，退出函数时被销毁。

| 调用类型 | 描述 |
| :--- | :--- |
| [传值调用](https://www.runoob.com/cprogramming/c-function-call-by-value.html) | 该方法把参数的实际值复制给函数的形式参数。在这种情况下，修改函数内的形式参数不会影响实际参数。 |
| [引用调用](https://www.runoob.com/cprogramming/c-function-call-by-pointer.html) | 通过指针传递方式，形参为指向实参地址的指针，当对形参的指向操作时，就相当于对实参本身进行的操作。 |

### 11. 作用域规则

任何一种编程中，作用域是程序中定义的变量所存在的区域，超过该区域变量就不能被访问。C 语言中有三个地方可以声明变量：

1. 在函数或块内部的**局部**变量
2. 在所有函数外部的**全局**变量
3. 在**形式**参数的函数参数定义中

让我们来看看什么是**局部**变量、**全局**变量和**形式**参数。

**局部变量**

在某个函数或块的内部声明的变量称为局部变量。它们只能被该函数或该代码块内部的语句使用。局部变量在函数外部是不可知的。下面是使用局部变量的实例。在这里，所有的变量 a、b 和 c 是 main\(\) 函数的局部变量。

```c
void main(){
    //局部变量
    int a, b;
    int c;
    //初始化局部变量
    a = 10;
    b = 20;
    c = a + b;
    //%d:以十进制形式输出带符号整数(正数不输出符号)
    printf("values of a = %d,b = %d and c = %d \n", a, b, c);
}
```

输出:

```c
values of a = 10,b = 20 and c = 30
```

**全局变量**

全局变量是定义在函数外部，通常是在程序的顶部。全局变量在整个程序生命周期内都是有效的，在任意的函数内部能访问全局变量。

全局变量可以被任何函数访问。也就是说，全局变量在声明后整个程序中都是可用的。下面是使用全局变量和局部变量的实例：

```c
//全局变量声明
int g;
void main(){
   int a, b;
    //初始化局部变量
    a = 10;
    b = 20;
   //全部变量赋值
    g = a + c;
    printf("values of a = %d,bc = %d and g = %d \n", a, c, g);
}
```

输出:

```c
values of a = 10,bc = 30 and g = 40
```

**形式参数**

函数的参数，形式参数，被当作该函数内的局部变量，如果与全局变量同名它们会优先使用。下面是一个实例：

```c
int sumA(int a, int b) {
    printf("value of a in sum() = %d\n", a);
    printf("value of b in sum() = %d\n", b);
    return x + y;
}

void main(){
  int a, b,c;
    //初始化局部变量
    a = 10;
    b = 20;
  c = sumA(a, b);
  printf("value of c in main() = %d\n", c);
}
```

输出:

```text
value of a in main() = 30
```

**全局变量和局部变量的区别**

* 全局变量保存在内存的全局存储区中，占用静态的存储单元；
* 局部变量保存在栈中，只有在所在函数被调用时才动态地为变量分配存储单元。

**初始化局部变量和全局变量的默认值**

| 数据类型 | 初始化默认值 |
| :--- | :--- |
| int | 0 |
| char | '\0' |
| float | 0 |
| double | 0 |
| pointer | NULL |

### 12. 数组

C 语言支持**数组**数据结构，它可以存储一个固定大小的相同类型元素的顺序集合。数组是用来存储一系列数据，但它往往被认为是一系列相同类型的变量。

数组的声明并不是声明一个个单独的变量，比如 number0、number1、...、number99，而是声明一个数组变量，比如 numbers，然后使用 numbers\[0\]、numbers\[1\]、...、numbers\[99\] 来代表一个个单独的变量。数组中的特定元素可以通过索引访问。

所有的数组都是由连续的内存位置组成。最低的地址对应第一个元素，最高的地址对应最后一个元素。

**声明数组**

在 C 中要声明一个数组，需要指定元素的类型和元素的数量，如下所示：

```c
type arrayName [ arraySize ];
```

这叫做一维数组。**arraySize** 必须是一个大于零的整数常量，**type** 可以是任意有效的 C 数据类型。例如，要声明一个类型为 double 的包含 10 个元素的数组 **balance**，声明语句如下：

```c
double balance[10];
```

**初始化数组**

```c
void main(){
  double balance[10] = {1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2.0}
}
```

大括号 { } 之间的值的数目不能大于我们在数组声明时在方括号 \[ \] 中指定的元素数目。

如果您省略掉了数组的大小，数组的大小则为初始化时元素的个数。因此，如果：

```c
void main(){
  double balance[] = {1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2.0}
}
```

您将创建一个数组，它与前一个实例中所创建的数组是完全相同的。下面是一个为数组中某个元素赋值的实例：

```c
balance[1] = 50.5;
```

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191216174347.png)

**访问数组元素**

```c
//跟 Java 一样
double value = balance[1]
```

例子:

```c
void main() {
    //定义一个长度为 10 的整数数组
    int n[10];
    int i, j;

    //初始化数组元素
    for (i = 0; i < 10; i++) {
        n[i] = 2 * i;
    }

    //输出元素中的数据
    for (int k = 0; k < 10; ++k) {
        printf("Element[%d] = %d \n", k, n[k]);
    }

    //总的大小除以其中一个大小就得到了 数组长度
    printf("整数数组 n 的长度： %d \n", sizeof(n) / sizeof(n[0]));

    //输出元素中的数据
    for (int k = 0; k < sizeof(n) / sizeof(n[0]); ++k) {
        printf("Element[%d] = %d \n", k, n[k]);
    }
}
```

输出:

```c
Element[0] = 0 
Element[1] = 2 
Element[2] = 4 
Element[3] = 6 
Element[4] = 8 
Element[5] = 10 
Element[6] = 12 
Element[7] = 14 
Element[8] = 16 
Element[9] = 18 
整数数组 n 的长度： 10 
Element[0] = 0 
Element[1] = 2 
Element[2] = 4 
Element[3] = 6 
Element[4] = 8 
Element[5] = 10 
Element[6] = 12 
Element[7] = 14 
Element[8] = 16 
Element[9] = 18
```

**C 中数组详解**

在 C 中，数组是非常重要的，我们需要了解更多有关数组的细节。下面列出了 C 程序员必须清楚的一些与数组相关的重要概念：

| 概念 | 描述 |
| :--- | :--- |
| [多维数组](https://www.runoob.com/cprogramming/c-multi-dimensional-arrays.html) | C 支持多维数组。多维数组最简单的形式是二维数组。 |
| [传递数组给函数](https://www.runoob.com/cprogramming/c-passing-arrays-to-functions.html) | 您可以通过指定不带索引的数组名称来给函数传递一个指向数组的指针。 |
| [从函数返回数组](https://www.runoob.com/cprogramming/c-return-arrays-from-function.html) | C 允许从函数返回数组。 |
| [指向数组的指针](https://www.runoob.com/cprogramming/c-pointer-to-an-array.html) | 您可以通过指定不带索引的数组名称来生成一个指向数组中第一个元素的指针。 |

### 13. 枚举

枚举是 C 语言中的一种基本数据类型，它可以让数据更简洁，更易读。

枚举语法定义格式为：

```c
enum　枚举名　{枚举元素1,枚举元素2,……};
```

接下来我们举个例子，比如：一星期有 7 天，如果不用枚举，我们需要使用 \#define 来为每个整数定义一个别名：

```c
#define MON  1
#define TUE  2
#define WED  3
#define THU  4
#define FRI  5
#define SAT  6
#define SUN  7
```

这个看起来代码量就比较多，接下来我们看看使用枚举的方式：

```c
enum DAY
{
      MON=1, TUE, WED, THU, FRI, SAT, SUN
};
```

这样看起来是不是更简洁了。

**注意：**第一个枚举成员的默认值为整型的 0，后续枚举成员的值在前一个成员上加 1。我们在这个实例中把第一个枚举成员的值定义为 1，第二个就为 2，以此类推。

> 可以在定义枚举类型时改变枚举元素的值：
>
> ```text
> enum season {spring, summer=3, autumn, winter};
> ```
>
> 没有指定值的枚举元素，其值为前一元素加 1。也就说 spring 的值为 0，summer 的值为 3，autumn 的值为 4，winter 的值为 5

**枚举变量的定义**

前面我们只是声明了枚举类型，接下来我们看看如何定义枚举变量。

我们可以通过以下三种方式来定义枚举变量

**1、先定义枚举类型，再定义枚举变量**

```c
enum DAY
{
      MON=1, TUE, WED, THU, FRI, SAT, SUN
};
enum DAY day;
```

**2、定义枚举类型的同时定义枚举变量**

```c
enum DAY
{
      MON=1, TUE, WED, THU, FRI, SAT, SUN
} day;
```

**3、省略枚举名称，直接定义枚举变量**

```c
enum
{
      MON=1, TUE, WED, THU, FRI, SAT, SUN
} day;
```

例子:

```c
void main() {
    //遍历一周
    for (day = MON; day <= SUN; day++) {
        printf("周: %d \n", day);
    }

    enum color { red=1, green, blue ,black};

    enum  color favorite_color;

//     ask user to choose color
    printf("请输入你喜欢的颜色: (1. red, 2. green, 3. blue): ");
    scanf("%d", &favorite_color);

//     输出结果
    switch (favorite_color)
    {
        case red:
            printf("你喜欢的颜色是红色");
            break;
        case green:
            printf("你喜欢的颜色是绿色");
            break;
        case blue:
            printf("你喜欢的颜色是蓝色");
            break;
        case black:
            printf("你喜欢的颜色是黑色");
            break;
        default:
            printf("你没有选择你喜欢的颜色");
    }


    //将整数转换为枚举
    enum day
    {
        saturday,
        sunday,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday
    } ;
    int a = 1;
    enum day weekend;
    weekend = (enum day)a;
    printf("weekend:%d \n",weekend);
}
```

输出:

```c
周: 1 
周: 2 
周: 3 
周: 4 
周: 5 
周: 6 
周: 7 
请输入你喜欢的颜色: (1. red, 2. green, 3. blue): 1
你喜欢的颜色是红色weekend:1
```

### 14. 指针

学习 C 语言的指针既简单又有趣。通过指针，可以简化一些 C 编程任务的执行，还有一些任务，如动态内存分配，没有指针是无法执行的。所以，想要成为一名优秀的 C 程序员，学习指针是很有必要的。

正如您所知道的，每一个变量都有一个内存位置，每一个内存位置都定义了可使用连字号（&）运算符访问的地址，它表示了在内存中的一个地址。请看下面的实例，它将输出定义的变量地址：

```c
void main(){
    int var1;
    char var2[10];
    //%p ： 输出指针地址
    printf("var1 变量的地址：%p \n", &var1);
    printf("var2 变量的地址：%p \n", &var2);
}
```

输出:

```c
var1 变量的地址：0x7ffee7e976b8 
var2 变量的地址：0x7ffee7e976be
```

通过上面的实例，我们了解了什么是内存地址以及如何访问它。接下来让我们看看什么是指针。

**什么是指针?**

**指针**是一个变量，其值为另一个变量的地址，即内存位置的直接地址。就像其他变量或常量一样，您必须在使用指针存储其他变量地址之前，对其进行声明。指针变量声明的一般形式为：

```c
type *var-name
```

在这里，**type** 是指针的基类型，它必须是一个有效的 C 数据类型，**var-name** 是指针变量的名称。用来声明指针的星号 \* 与乘法中使用的星号是相同的。但是，在这个语句中，星号是用来指定一个变量是指针。以下是有效的指针声明：

```c
int *i; //一个整型的指针    
double *d;//double 型指针
float *f;//浮点型指针
char *ch//字符型指针
```

所有实际数据类型，不管是整型、浮点型、字符型，还是其他的数据类型，对应指针的值的类型都是一样的，都是一个代表内存地址的长的十六进制数。

不同数据类型的指针之间唯一的不同是，指针所指向的变量或常量的数据类型不同。

**如何使用指针?**

使用指针时会频繁进行以下几个操作：定义一个指针变量、把变量地址赋值给指针、访问指针变量中可用地址的值。这些是通过使用一元运算符 **\*** 来返回位于操作数所指定地址的变量的值。下面的实例涉及到了这些操作：

例子:

```c
    //如何使用指针
    int var = 66;//实际变量的声明
    int *ip;//指针变量的声明

    ip = &var; //指针变量中存储 var 的地址
    printf("var 的地址 : %p  \n", var);

    //在指针变量中存储的地址
    printf("ip 的地址：%p  \n", ip);

    //使用指针访问地址
    printf("ip 指针对应的地址：%p \n", *ip);

    //使用指针访问地址对应的值
    printf("ip 指针对应的地址：%d \n", *ip);
```

输出:

```c
var 的地址 : 0x42  
ip 的地址：0x7ffee96eb6b4  
ip 指针对应的地址：0x42 
ip 指针对应的地址：66
```

**C 中的 NULL 指针**

在变量声明的时候，如果没有确切的地址可以赋值，为指针变量赋一个 NULL 值是一个良好的编程习惯。赋为 NULL 值的指针被称为**空**指针。

NULL 指针是一个定义在标准库中的值为零的常量。请看下面的程序：

```c
void main(){
    //赋值一个 NULL 指针
    int *ptr = NULL;
    printf("ptr 的地址是： %p \n", ptr);

    //检查一个空指针
    if (ptr) printf("如果 ptr 不是空指针，则执行"); else printf("如果 ptr 是空指针，则执行");
}
```

输出:

> ptr 的地址是： 0x0 ptr 是空指针

**C 指针详解**

在 C 中，有很多指针相关的概念，这些概念都很简单，但是都很重要。下面列出了 C 程序员必须清楚的一些与指针相关的重要概念：

| 概念 | 描述 |
| :--- | :--- |
| [指针的算术运算](https://www.runoob.com/cprogramming/c-pointer-arithmetic.html) | 可以对指针进行四种算术运算：++、--、+、- |
| [指针数组](https://www.runoob.com/cprogramming/c-array-of-pointers.html) | 可以定义用来存储指针的数组。 |
| [指向指针的指针](https://www.runoob.com/cprogramming/c-pointer-to-pointer.html) | C 允许指向指针的指针。 |
| [传递指针给函数](https://www.runoob.com/cprogramming/c-passing-pointers-to-functions.html) | 通过引用或地址传递参数，使传递的参数在调用函数中被改变。 |
| [从函数返回指针](https://www.runoob.com/cprogramming/c-return-pointer-from-functions.html) | C 允许函数返回指针到局部变量、静态变量和动态内存分配。 |

### 15. 函数指针与回调函数

函数指针是指向函数的指针变量。

通常我们说的指针变量是指向一个整型、字符型或数组等变量，而函数指针是指向函数。

函数指针可以像一般函数一样，用于调用函数、传递参数。

函数指针变量的声明：

```c
typedef int (*fun_ptr)(int,int)//声明一个指向同样参数，返回值得函数指针类型
```

例子:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191216224142.gif)

```c
int max(int num1, int num2) {
    return (num1 > num2) ? num1 : num2;
}

void main() {

    //定义一个返回值为 int 类型，参数为 （int,int） 形式的函数指针
    int (*p)(int, int) = *max;
    int a, b, c, d;
    printf("请输入三个数字:\n");
    scanf("%d %d %d", &a, &b, &c);

    //与直接调用函数等价，d = max(max(a,b),c);
    d = p(p(a, b), c);
    printf("最大数字是: %d \n", d);

}
```

**回调函数**

函数指针变量可以作为某个函数的参数来使用的，回调函数就是一个通过函数指针调用的函数。

简单讲：回调函数是由别人的函数执行时调用你实现的函数。

例子:

例子中 populate\_array 函数定义了三个参数，其中第三个参数是函数的指针，通过该函数来设置数组的值。

实例中我们定义了回调函数 getNextRandomValue，它返回一个随机值，它作为一个函数指针传递给 populate\_array 函数。

populate\_array 将调用 10 次回调函数，并将回调函数的返回值赋值给数组。

```c
#include <stdlib.h>  
#include <stdio.h>
//回调函数
void populate_array(int *array, size_t arraySize, int(*getNextValue)(void)) {
    printf("array 地址：%p \n", array);
    for (size_t i = 0; i < arraySize; i++) {
        array[i] = getNextValue();
        printf(" array[%d] ,存储值：%d \n", i, array[i]);
    }
}

//获取一个随机数
int getNextRandomValue(void) {
    return rand();
}

void main() {

    //回调函数
    int array[10];
    printf("Int array 地址：%p \n", array);
    populate_array(array, sizeof(array)/sizeof(array[0]), getNextRandomValue);
    for (int i = 0; i < sizeof(array)/sizeof(array[0]); ++i) {
        printf(" array[%d] , 对应值为：%d \n", i, array[i]);
    }

}
```

输出:

```c
Int array 地址：0x7ffeebf1a650 
array 地址：0x7ffeebf1a650 
 array[0] ,存储值：16807 
 array[1] ,存储值：282475249 
 array[2] ,存储值：1622650073 
 array[3] ,存储值：984943658 
 array[4] ,存储值：1144108930 
 array[5] ,存储值：470211272 
 array[6] ,存储值：101027544 
 array[7] ,存储值：1457850878 
 array[8] ,存储值：1458777923 
 array[9] ,存储值：2007237709 
 array[0] , 对应值为：16807 
 array[1] , 对应值为：282475249 
 array[2] , 对应值为：1622650073 
 array[3] , 对应值为：984943658 
 array[4] , 对应值为：1144108930 
 array[5] , 对应值为：470211272 
 array[6] , 对应值为：101027544 
 array[7] , 对应值为：1457850878 
 array[8] , 对应值为：1458777923 
 array[9] , 对应值为：2007237709
```

### 16. 字符串

在 C 语言中，字符串实际上是使用 **null** 字符 '\0' 终止的一维字符数组。因此，一个以 null 结尾的字符串，包含了组成字符串的字符。

下面的声明和初始化创建了一个 "Hello" 字符串。由于在数组的末尾存储了空字符，所以字符数组的大小比单词 "Hello" 的字符数多一个。

```c
char ch[6] = {'H', 'e', 'l', 'l', 'o', '\0'};
```

也可以使用以下简写模式:

```c
char ch[6] = "Hello"
```

字符串在 C/C++ 中内存表示:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191216225601.png)

其实，您不需要把 _null_ 字符放在字符串常量的末尾。C 编译器会在初始化数组时，自动把 '\0' 放在字符串的末尾。让我们尝试输出上面的字符串：

```c
void main(){
      //定义一个 char 数组
    char string[6] = {'H', 'e', 'l', 'l', 'o', '\0'};
    //简写
    char string2[6] = "Hello";
    //%s:输出字符串
    printf("string message : %s\n", string);
}
```

输出:

```c
string message : Hello
```

C 中对字符串操作的 API

| 序号 | 函数 & 目的 |
| :--- | :--- |
| 1 | **strcpy\(s1, s2\);** 复制字符串 s2 到字符串 s1。 |
| 2 | **strcat\(s1, s2\);** 连接字符串 s2 到字符串 s1 的末尾。 |
| 3 | **strlen\(s1\);** 返回字符串 s1 的长度。 |
| 4 | **strcmp\(s1, s2\);** 如果 s1 和 s2 是相同的，则返回 0；如果 s1s2 则返回大于 0。 |
| 5 | **strchr\(s1, ch\);** 返回一个指针，指向字符串 s1 中字符 ch 的第一次出现的位置。 |
| 6 | **strstr\(s1, s2\);** 返回一个指针，指向字符串 s1 中字符串 s2 的第一次出现的位置。 |

例子:

```c
void main(){
      //字符串操作
    char str1[12] = "Hello";
    char str2[12] = "World";
    char str3[12];
    int len;

    //将 str1 复制到 str3
    strcpy(str3, str1);
    printf("strcpy (str3,str1) :%s\n", str3);

    //拼接字符串  str1 + str2
    strcat(str1, str2);
    printf("strcat(str1,str2) :%s\n", str1);

    //返回字符串的长度
    len = strlen(str1);
    printf("strlen(str1) :%d\n", len);
}
```

输出:

```c
strcpy (str3,str1) :Hello
strcat(str1,str2) :HelloWorld
strlen(str1) :10
```

### 17. 结构体

C 数组允许定义可存储相同类型数据项的变量，**结构**是 C 编程中另一种用户自定义的可用的数据类型，它允许您存储不同类型的数据项。

结构用于表示一条记录，假设您想要跟踪图书馆中书本的动态，您可能需要跟踪每本书的下列属性：

* Title
* Author
* Subject
* Book ID

**定义结构**

为了定义结构，您必须使用 **struct** 语句。struct 语句定义了一个包含多个成员的新的数据类型，struct 语句的格式如下：

```c
struct name{
  member-list;
  member-list;
  ...
}name_tag,
```

_name_ 是结构的标签。

_member-list_ 是标准的变量定义，比如 int i;或者 float f,或者其它有效的变量定义。

_name\_tag_ 结构变量，定义在结构的末尾，最后一个分号之前，你可以指定一个或多个结构变量，下面是声明 Book 的结构方式：

```c
struct Books{
  char title[50];
  char author[50];
  char subject[100];
  int book_id;
} book;
```

注意：在定义结构体的时候**name、member-list、name\_tag** 这 3 部分至少要出现 2 个。

**结构体变量的初始化**

和其它类型变量一样，在初始化的时候可以指定初始值。

```c
//定义一个 Books 结构，类似于 Java 中的数据 bean
struct Books {
    char title[50];
    char author[50];
    char subject[100];
    int book_id;
    double rmb;
} book = {"Java", "Android", "C 语言", 666, 55.5};


void main(){
      //打印 Books
    printf("title : %s\nauthor: %s\nsubject: %s\nbook_id: %d\nrmb: %f\n", book.title,
           book.author, book.subject, book.book_id, book.rmb);
}
```

输出:

```c
title : Java
author: Android
subject: C 语言
book_id: 666
rmb: 55.500000
```

**访问结构成员**

```c
struct Books2 {
    char title[50];
    char author[50];
    char subject[100];
    int book_id;
};
void main(){
      //访问 Books2 结构成员
    struct Books2 Books2A;//声明 Books2A 类型为 Books2
    struct Books2 Books2B;//声明 Books2B 类型为 Books2

    //Books2A 详述
    strcpy(Books2A.title, "C Plus");
    strcpy(Books2A.author, "Nuha Ali");
    strcpy(Books2A.subject, "C");
    Books2A.book_id = 666888;

    //Books2B 详述
    strcpy(Books2B.title, "C++ Plus");
    strcpy(Books2B.author, "DevYK");
    strcpy(Books2B.subject, "C++");
    Books2B.book_id = 666999;

    // 输出 Book1 信息
    printf("Book 1 title : %s\n", Books2A.title);
    printf("Book 1 author : %s\n", Books2A.author);
    printf("Book 1 subject : %s\n", Books2A.subject);
    printf("Book 1 book_id : %d\n", Books2A.book_id);

    // 输出 Book2 信息
    printf("Book 2 title : %s\n", Books2B.title);
    printf("Book 2 author : %s\n", Books2B.author);
    printf("Book 2 subject : %s\n", Books2B.subject);
    printf("Book 2 book_id : %d\n", Books2B.book_id);
}
```

输出:

```c
Book 1 title : C Plus
Book 1 author : Nuha Ali
Book 1 subject : C
Book 1 book_id : 666888
Book 2 title : C++ Plus
Book 2 author : DevYK
Book 2 subject : C++
Book 2 book_id : 666999
```

**结构作为函数参数**

```c
//函数声明
void printBook(struct Books2 books2);

void main(){
      //访问 Books2 结构成员
    struct Books2 Books2A;//声明 Books2A 类型为 Books2
    struct Books2 Books2B;//声明 Books2B 类型为 Books2

    //Books2A 详述 ，将 CPlus copy 到 title 中
    strcpy(Books2A.title, "C Plus");
    strcpy(Books2A.author, "Nuha Ali");
    strcpy(Books2A.subject, "C");
    Books2A.book_id = 666888;

    //Books2B 详述
    strcpy(Books2B.title, "C++ Plus");
    strcpy(Books2B.author, "DevYK");
    strcpy(Books2B.subject, "C++");
    Books2B.book_id = 666999;

    // 输出 Book1 信息
    printf("Book 1 title : %s\n", Books2A.title);
    printf("Book 1 author : %s\n", Books2A.author);
    printf("Book 1 subject : %s\n", Books2A.subject);
    printf("Book 1 book_id : %d\n", Books2A.book_id);

    // 输出 Book2 信息
    printf("Book 2 title : %s\n", Books2B.title);
    printf("Book 2 author : %s\n", Books2B.author);
    printf("Book 2 subject : %s\n", Books2B.subject);
    printf("Book 2 book_id : %d\n", Books2B.book_id);

    printf("\n\n\n");
    //结构作为函数参数
    printBook(Books2A);
    printBook(Books2B);
}


void printBook(struct Books2 book) {
    printf("Book  title : %s\n", book.title);
    printf("Book  author : %s\n", book.author);
    printf("Book  subject : %s\n", book.subject);
    printf("Book  book_id : %d\n", book.book_id);
}
```

输出:

```c
Book 1 title : C Plus
Book 1 author : Nuha Ali
Book 1 subject : C
Book 1 book_id : 666888
Book 2 title : C++ Plus
Book 2 author : DevYK
Book 2 subject : C++
Book 2 book_id : 666999



Book  title : C Plus
Book  author : Nuha Ali
Book  subject : C
Book  book_id : 666888
Book  title : C++ Plus
Book  author : DevYK
Book  subject : C++
Book  book_id : 666999
```

**指向结构的指针**

您可以定义指向结构的指针，方式与定义指向其他类型变量的指针相似，如下所示：

```c
struct Books *struct_pointer;
```

现在，您可以在上述定义的指针变量中存储结构变量的地址。为了查找结构变量的地址，请把 & 运算符放在结构名称的前面，如下所示：

```c
struct_pointer = &Book1;
```

为了使用指向该结构的指针访问结构的成员，您必须使用 -&gt; 运算符，如下所示：

```c
struct_pointer->title;
```

例子:

```c
//定义指向结构的指针
void printBookZZ(struct Books2 *books2);

void main(){
      //访问 Books2 结构成员
    struct Books2 Books2A;//声明 Books2A 类型为 Books2
    struct Books2 Books2B;//声明 Books2B 类型为 Books2

    //Books2A 详述 ，将 CPlus copy 到 title 中
    strcpy(Books2A.title, "C Plus");
    strcpy(Books2A.author, "Nuha Ali");
    strcpy(Books2A.subject, "C");
    Books2A.book_id = 666888;

    //Books2B 详述
    strcpy(Books2B.title, "C++ Plus");
    strcpy(Books2B.author, "DevYK");
    strcpy(Books2B.subject, "C++");
    Books2B.book_id = 666999;

     //通过内存地址传递信息，为了查找结构变量的地址，请把 & 运算符放在结构名称的前面
     printBookZZ(&Books2A);
     printBookZZ(&Books2B);
} 

/**
 * 为了使用指向该结构的指针访问结构的成员，您必须使用 -> 运算符，如下所示：
 * @param book
 */
void printBookZZ(struct Books2 *book) {
    printf("Book -> title : %s\n", book->title);
    printf("Book -> author : %s\n", book->author);
    printf("Book -> subject : %s\n", book->subject);
    printf("Book -> book_id : %d\n", book->book_id);
}
```

**位域**

有些信息在存储时，并不需要占用一个完整的字节，而只需占几个或一个二进制位。例如在存放一个开关量时，只有 0 和 1 两种状态，用 1 位二进位即可。为了节省存储空间，并使处理简便，C 语言又提供了一种数据结构，称为"位域"或"位段"。

所谓"位域"是把一个字节中的二进位划分为几个不同的区域，并说明每个区域的位数。每个域有一个域名，允许在程序中按域名进行操作。这样就可以把几个不同的对象用一个字节的二进制位域来表示。

典型的实例：

* 用 1 位二进位存放一个开关量时，只有 0 和 1 两种状态。
* 读取外部文件格式——可以读取非标准的文件格式。

`位域ed 定义:`

```c
struct 位域结构名称{
  位域列表
};
```

位域列表的形式为:

```c
类型说明符 位域名：位域长度
```

例如:

```c
struct bean {
  int a:8;
  int b:4;
  int c:4;
}data;
```

说明 data 为 bean 变量，共占 2个字节。其中位域 a 占 8 位，位域 b 占 4 位，位域 c 占 4 位。

注意:

* 一个位域存储在同一个字节中，如一个字节所剩空间不够存放另一位域时，则会从下一单元起存放该位域。也可以有意使某位域从下一单元开始。例如：

```c
struct bean{
  unsigned a:4;
  unsigned  :4;//空域
  unsigned b:4;//从下一个单元开始存放
  unsigned c:4;
}
```

在这个位域定义中共占用 2 个字节，a 占第一字节的 4 位，后 4 位填 0 表示不使用，b 从第二字节开始，占用 4 位，c 占用 4 位。

> * 由于位域不允许跨两个字节，因此位域的长度不能大于一个字节的长度，也就是说不能超过8位二进位。如果最大长度大于计算机的整数字长，一些编译器可能会允许域的内存重叠，另外一些编译器可能会把大于一个域的部分存储在下一个字中。
> * 位域可以是无名位域，这时它只用来作填充或调整位置。无名的位域是不能使用的。例如：
>
>   ```c
>   struct k{
>      int a:1;
>      int  :2;    /* 该 2 位不能使用 */
>      int b:3;
>      int c:2;
>   };
>   ```
>
> 从以上分析可以看出，位域在本质上就是一种结构类型，不过其成员是按二进位分配的。

**位域的使用**

位域的使用和结构成员的使用相同，其一般形式为:

> 位域变量名.位域名
>
> 位域变量名-&gt;位域名

位域允许用各种格式输出。

例子:

```c
void main(){
       //位域
     struct bs {
         unsigned int a:1;//占 位段a 1 位
         unsigned b:6;//占 位段b 3 位
         unsigned c:7;//占 位段c 4 位
     } bit, *pbit;
     // 给位域赋值（应注意赋值不能超过该位域的允许范围）
     bit.a = 1; //以二进制 1 表示 1 bit位
     bit.b = 50;//以二进制 110010 表示 6 bit位
     bit.c = 100;//以二进制 1100100 标志 7 bit位
     printf("%d,%d,%d\n",bit.a,bit.b,bit.c);    // 以整型量格式输出三个域的内容

     pbit=&bit;     //把位域变量 bit 的地址送给指针变量 pbit
     pbit->a=0;     //用指针方式给位域 a 重新赋值，赋为 0
     pbit->b&=3;     //使用了复合的位运算符 "&="，相当于：pbit->b=pbit->b&3，位域 b 中原有值为 50，与 3 作按位与运算的结果为 2（110010&011=010，十进制值为 2）
     pbit->c|=1;     //使用了复合位运算符"|="，相当于：pbit->c=pbit->c|1，其结果为 （1100100 | 0000001）= 1100101 = 101
     printf("%d,%d,%d\n",pbit->a,pbit->b,pbit->c);     //用指针方式输出了这三个域的值
}
```

输出:

```c
1,50,100
0,2,101
```

### 18. 共用体

**共用体**是一种特殊的数据类型，允许您在相同的内存位置存储不同的数据类型。您可以定义一个带有多成员的共用体，但是任何时候只能有一个成员带有值。共用体提供了一种使用相同的内存位置的有效方式。

**定义共同体**

为了定义共用体，您必须使用 **union** 语句，方式与定义结构类似。union 语句定义了一个新的数据类型，带有多个成员。union 语句的格式如下：

```c
union [union tag]
{
member definition;
member definition;
...
member definition;
}[one or more union variables];
```

**union tag** 是可选的，每个 member definition 是标准的变量定义，比如 int i; 或者 float f; 或者其他有效的变量定义。在共用体定义的末尾，最后一个分号之前，您可以指定一个或多个共用体变量，这是可选的。下面定义一个名为 Data 的共用体类型，有三个成员 i、f 和 str：

```c
union Data
{
int i;
float f;
char str[20];
}
```

现在，**Data** 类型的变量可以存储一个整数、一个浮点数，或者一个字符串。这意味着一个变量（相同的内存位置）可以存储多个多种类型的数据。您可以根据需要在一个共用体内使用任何内置的或者用户自定义的数据类型。

共用体占用的内存应足够存储共用体中最大的成员。例如，在上面的实例中，Data 将占用 20 个字节的内存空间，因为在各个成员中，字符串所占用的空间是最大的。下面的实例将显示上面的共用体占用的总内存大小：

```c
union Data {
    int i;
    float f;
    char str[20];
};
void main(){
    union Data data;
    printf("Memory size occupied by data: %d\n", sizeof(data));
}
```

输出:

```c
Memory size occupied by data: 20
```

**访问共同体成员**

为了访问共用体的成员，我们使用**成员访问运算符（.）**。成员访问运算符是共用体变量名称和我们要访问的共用体成员之间的一个句号。您可以使用 **union** 关键字来定义共用体类型的变量。下面的实例演示了共用体的用法：

```c
union Data {
    int i;
    float f;
    char str[20];
};

void main() {
    //1. 访问共同体 no
    data.i = 10;
    data.f = 1314.520;
    strcpy(data.str,"C/C++");
    printf( "data.i : %d\n", data.i);
    printf( "data.f : %f\n", data.f);
    printf( "data.str : %s\n", data.str);

    printf("\n\n\n");
    //2. 访问共同体   yes
    data.i = 10;
    printf( "data.i : %d\n", data.i);
    data.f = 1314.520;
    printf( "data.f : %f\n", data.f);
    strcpy(data.str,"C/C++");
    printf( "data.str : %s\n", data.str);

}
```

输出:

```c
data.i : 725823299
data.f : 0.000000
data.str : C/C++



data.i : 10
data.f : 1314.520020
data.str : C/C++
```

在这里，我们可以看到上面注释 1 共用体的 **i** 和 **f** 成员的值有损坏，因为最后赋给变量的值占用了内存位置，这也是 **str** 成员能够完好输出的原因。我们看注释 2 ，这次我们在同一时间只使用一个变量成员，所以都能完好输出。

### 19. 位域

参考 17.\(位域的介绍\)

### 20. typedef

C 语言提供了 **typedef** 关键字，您可以使用它来为类型取一个新的名字。下面的实例为单字节数字定义了一个术语 **BYTE**：

```text
typedef unsigned char BYTE;
```

在这个类型定义之后，标识符 BYTE 可作为类型 **unsigned char** 的缩写，例如：

```text
BYTE  b1, b2;
```

按照惯例，定义时会大写字母，以便提醒用户类型名称是一个象征性的缩写，但您也可以使用小写字母，如下：

```text
typedef unsigned char byte;
```

您也可以使用 **typedef** 来为用户自定义的数据类型取一个新的名字。例如，您可以对结构体使用 typedef 来定义一个新的数据类型名字，然后使用这个新的数据类型来直接定义结构变量，如下：

```c
typedef struct Books {
    char title[50];
    char author[50];
    char subject[50];
    int book_id;
} Book;

#define TRUE  1
#define FALSE  0

 void main(){
     Book book;
     strcpy( book.title, "C 教程");
     strcpy( book.author, "Runoob");
     strcpy( book.subject, "编程语言");
     book.book_id = 12345;
     printf( "书标题 : %s\n", book.title);
     printf( "书作者 : %s\n", book.author);
     printf( "书类目 : %s\n", book.subject);
     printf( "书 ID : %d\n", book.book_id);

     printf( "TRUE 的值: %d\n", TRUE);
     printf( "FALSE 的值: %d\n", FALSE);
 }
```

输出:

```c
书标题 : C 教程
书作者 : Runoob
书类目 : 编程语言
书 ID : 12345
TRUE 的值: 1
FALSE 的值: 0
```

**typedef vs define**

**define** 是 C 指令，用于为各种数据类型定义别名，与 **typedef** 类似，但是它们有以下几点不同：

* **typedef** 仅限于为类型定义符号名称，**\#define** 不仅可以为类型定义别名，也能为数值定义别名，比如您可以定义 1 为 ONE。
* **typedef** 是由编译器执行解释的，**\#define** 语句是由预编译器进行处理的。

例子可以参考上面是 \#define 使用。

### 21. 输入 & 输出

当我们提到**输入**时，这意味着要向程序填充一些数据。输入可以是以文件的形式或从命令行中进行。C 语言提供了一系列内置的函数来读取给定的输入，并根据需要填充到程序中。

当我们提到**输出**时，这意味着要在屏幕上、打印机上或任意文件中显示一些数据。C 语言提供了一系列内置的函数来输出数据到计算机屏幕上和保存数据到文本文件或二进制文件中。

**标准输出**

C 语言把所有的设备都当作文件。所以设备（比如显示器）被处理的方式与文件相同。以下三个文件会在程序执行时自动打开，以便访问键盘和屏幕。

| 标准文件 | 文件指针 | 设备 |
| :--- | :--- | :--- |
| 标准输入 | stdin | 键盘 |
| 标准输出 | stdout | 屏幕 |
| 标准错误 | stderr | 您的屏幕 |

文件指针是访问文件的方式，本节将讲解如何从屏幕读取值以及如何把结果输出到屏幕上。

C 语言中的 I/O \(输入/输出\) 通常使用 printf\(\) 和 scanf\(\) 两个函数。

scanf\(\) 函数用于从标准输入（键盘）读取并格式化， printf\(\) 函数发送格式化输出到标准输出（屏幕）。

例子:

```c
void main(){
      float f;
    printf("Enter a float number: \n");
    // %f 匹配浮点型数据
    scanf("%f",&f);
    printf("Value = %f", f);
}
```

输出:

```c
Enter a float number: 
12.3
Value = 12.300000
```

**getchar\(\)&putchar\(\) 函数**

**int getchar\(void\)** 函数从屏幕读取下一个可用的字符，并把它返回为一个整数。这个函数在同一个时间内只会读取一个单一的字符。您可以在循环内使用这个方法，以便从屏幕上读取多个字符。

**int putchar\(int c\)** 函数把字符输出到屏幕上，并返回相同的字符。这个函数在同一个时间内只会输出一个单一的字符。您可以在循环内使用这个方法，以便在屏幕上输出多个字符。

```c
void main(){
    int c;
    printf( "\nEnter a value :");
    //函数从屏幕读取下一个可用的字符，并把它返回为一个整数。这个函数在同一个时间内只会读取一个单一的字符。您可以在循环内使用这个方法，以便从屏幕上读取多个字符。
    c = getchar( );
    printf( "\nYou entered: ");
    //读取第一个字符
    putchar( c );
}
```

输出:

```c
Enter a value :abcdef

You entered: a
```

**gets\(\) & puts\(\) 函数**

**char \*gets\(char \*s\)** 函数从 **stdin** 读取一行到 **s** 所指向的缓冲区，直到一个终止符或 EOF。

**int puts\(const char \*s\)** 函数把字符串 s 和一个尾随的换行符写入到 **stdout**。

```c
void main(){
    char str[100];

    printf( "\nEnter a value :");
    //读取一行
    gets( str );

    printf( "\nYou entered: ");
    puts( str );
}
```

输出:

```c
Enter a value :大家好，才是真的好！

You entered: 大家好，才是真的好！
```

### 22. 文件读写

上一节我们讲解了 C 语言处理的标准输入和输出设备。本章我们将介绍 C 程序员如何创建、打开、关闭文本文件或二进制文件。

一个文件，无论它是文本文件还是二进制文件，都是代表了一系列的字节。C 语言不仅提供了访问顶层的函数，也提供了底层（OS）调用来处理存储设备上的文件。本章将讲解文件管理的重要调用。

**打开文件**

您可以使用 **fopen\( \)** 函数来创建一个新的文件或者打开一个已有的文件，这个调用会初始化类型 **FILE** 的一个对象，类型 **FILE** 包含了所有用来控制流的必要的信息。下面是这个函数调用的原型：

```c
FILE *fopen( const char * filename, const char * mode );
```

在这里，**filename** 是字符串，用来命名文件，访问模式 **mode** 的值可以是下列值中的一个：

| 模式 | 描述 |
| :--- | :--- |
| r | 打开一个已有的文本文件，允许读取文件。 |
| w | 打开一个文本文件，允许写入文件。如果文件不存在，则会创建一个新文件。在这里，您的程序会从文件的开头写入内容。如果文件存在，则该会被截断为零长度，重新写入。 |
| a | 打开一个文本文件，以追加模式写入文件。如果文件不存在，则会创建一个新文件。在这里，您的程序会在已有的文件内容中追加内容。 |
| r+ | 打开一个文本文件，允许读写文件。 |
| w+ | 打开一个文本文件，允许读写文件。如果文件已存在，则文件会被截断为零长度，如果文件不存在，则会创建一个新文件。 |
| a+ | 打开一个文本文件，允许读写文件。如果文件不存在，则会创建一个新文件。读取会从文件的开头开始，写入则只能是追加模式。 |

如果处理的是二进制文件，则需要使用下面的访问模式来取代上面的访问模式:

```c
"rb", "wb", "ab", "rb+", "r+b", "wb+", "w+b", "ab+", "a+b"
```

**关闭文件**

为了关闭文件，请使用 fclose\( \) 函数。函数的原型如下：

```text
 int fclose( FILE *fp );
```

如果成功关闭文件，**fclose\( \)** 函数返回零，如果关闭文件时发生错误，函数返回 **EOF**。这个函数实际上，会清空缓冲区中的数据，关闭文件，并释放用于该文件的所有内存。EOF 是一个定义在头文件 **stdio.h** 中的常量。

C 标准库提供了各种函数来按字符或者以固定长度字符串的形式读写文件。

**写入文件**

下面是把字符串写入到流中的最简单的函数:

```c
int fputc(int c,FILE *fp);
```

函数 **fputc\(\)** 把参数 c 的字符值写入到 fp 所指向的输出流中。如果写入成功，它会返回写入的字符，如果发生错误，则会返回 **EOF**。您可以使用下面的函数来把一个以 null 结尾的字符串写入到流中：

```text
int fputs( const char *s, FILE *fp );
```

函数 **fputs\(\)** 把字符串 **s** 写入到 fp 所指向的输出流中。如果写入成功，它会返回一个非负值，如果发生错误，则会返回 **EOF**。您也可以使用 **int fprintf\(FILE \*fp,const char \*format, ...\)** 函数来写把一个字符串写入到文件中。尝试下面的实例：

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191217112600.gif)

```c
void main(){
      //定义一个空指针文件
    FILE *fp = NULL;
    //打开文件，打开一个文本文件，允许读写文件。
    // 如果文件不存在，则会创建一个新文件。
    // 读取会从文件的开头开始，写入则只能是追加模式。
    fp = fopen("/Users/devyk/Data/ClionProjects/NDK_Sample/README.md","a+");
    fprintf(fp, " fprintf 我是添加进来的1\n");
    fprintf(fp, "fprintf 我是添加进来的2\n");
    fputs("fputs 我是添加进来的1\n", fp);
    fputs("fputs 我是添加进来的2\n", fp);
    fclose(fp);
}
```

**读取文件**

下面是从文件读取单个字符的最简单的函数：

```text
int fgetc( FILE * fp );
```

**fgetc\(\)** 函数从 fp 所指向的输入文件中读取一个字符。返回值是读取的字符，如果发生错误则返回 **EOF**。下面的函数允许您从流中读取一个字符串：

```text
char *fgets( char *buf, int n, FILE *fp );
```

函数 **fgets\(\)** 从 fp 所指向的输入流中读取 n - 1 个字符。它会把读取的字符串复制到缓冲区 **buf**，并在最后追加一个 **null** 字符来终止字符串。

如果这个函数在读取最后一个字符之前就遇到一个换行符 '\n' 或文件的末尾 EOF，则只会返回读取到的字符，包括换行符。您也可以使用 **int fscanf\(FILE \*fp, const char \*format, ...\)** 函数来从文件中读取字符串，但是在遇到第一个空格和换行符时，它会停止读取。

例子:

![](https://devyk.oss-cn-qingdao.aliyuncs.com/blog/20191217113101.gif)

```c
void main(){
    FILE *fp = NULL;
    //读取文件
    char buff[255];
    fp = fopen("/Users/devyk/Data/ClionProjects/NDK_Sample/README.md","r");
    fscanf(fp,"%s",buff);
    printf("1: %s\n", buff);

    fgets(buff, 255, (FILE*)fp);
    printf("2: %s\n", buff);

    fgets(buff, 255, (FILE*)fp);
    printf("3: %s\n", buff );
    fclose(fp);
}
```

### 23. 预处理器

**C 预处理器**不是编译器的组成部分，但是它是编译过程中一个单独的步骤。简言之，C 预处理器只不过是一个文本替换工具而已，它们会指示编译器在实际编译之前完成所需的预处理。我们将把 C 预处理器（C Preprocessor）简写为 CPP。

所有的预处理器命令都是以井号（\#）开头。它必须是第一个非空字符，为了增强可读性，预处理器指令应从第一列开始。下面列出了所有重要的预处理器指令：

| 指令 | 描述 |
| :--- | :--- |
| \#define | 定义宏 |
| \#include | 包含一个源代码文件 |
| \#undef | 取消已定义的宏 |
| \#ifdef | 如果宏已经定义，则返回真 |
| \#ifndef | 如果宏没有定义，则返回真 |
| \#if | 如果给定条件为真，则编译下面代码 |
| \#else | \#if 的替代方案 |
| \#elif | 如果前面的 \#if 给定条件不为真，当前条件为真，则编译下面代码 |
| \#endif | 结束一个 \#if……\#else 条件编译块 |
| \#error | 当遇到标准错误时，输出错误消息 |
| \#pragma | 使用标准化方法，向编译器发布特殊的命令到编译器中 |

例子:

分析下面的实例来理解不同的指令。

```text
#define MAX_ARRAY_LENGTH 20
```

这个指令告诉 CPP 把所有的 MAX\_ARRAY\_LENGTH 替换为 20。使用 _\#define_ 定义常量来增强可读性。

```text
#include <stdio.h>
#include "utils.h"
```

这些指令告诉 CPP 从**系统库**中获取 stdio.h，并添加文本到当前的源文件中。下一行告诉 CPP 从本地目录中获取 **utils.h**，并添加内容到当前的源文件中。

```text
#undef  FILE_SIZE
#define FILE_SIZE 42
```

这个指令告诉 CPP 取消已定义的 FILE\_SIZE，并定义它为 42。

```text
#ifndef MESSAGE
   #define MESSAGE "You wish!"
#endif
```

这个指令告诉 CPP 只有当 MESSAGE 未定义时，才定义 MESSAGE。

```text
#ifdef DEBUG
   /* Your debugging statements here */
#endif
```

这个指令告诉 CPP 如果定义了 DEBUG，则执行处理语句。在编译时，如果您向 gcc 编译器传递了 _-DDEBUG_ 开关量，这个指令就非常有用。它定义了 DEBUG，您可以在编译期间随时开启或关闭调试。

**预定义宏**

ANSI C 定义了许多宏。在编程中您可以使用这些宏，但是不能直接修改这些预定义的宏。

| 宏 | 描述 |
| :--- | :--- |
| **DATE** | 当前日期，一个以 "MMM DD YYYY" 格式表示的字符常量。 |
| **TIME** | 当前时间，一个以 "HH:MM:SS" 格式表示的字符常量。 |
| **FILE** | 这会包含当前文件名，一个字符串常量。 |
| **LINE** | 这会包含当前行号，一个十进制常量。 |
| **STDC** | 当编译器以 ANSI 标准编译时，则定义为 1。 |

例子:

```c
void main() {
    //这会包含当前文件名，一个字符串常量。
    printf("File :%s\n", __FILE__);
    //当前日期，一个以 "MMM DD YYYY" 格式表示的字符常量。
    printf("Date :%s\n", __DATE__);
    //当前时间，一个以 "HH:MM:SS" 格式表示的字符常量。
    printf("Time :%s\n", __TIME__);
    //这会包含当前行号，一个十进制常量。
    printf("Line :%d\n", __LINE__);
    //当编译器以 ANSI 标准编译时，则定义为 1。
    printf("ANSI :%d\n", __STDC__);
}
```

输出:

```c
File :/Users/devyk/Data/ClionProjects/NDK_Sample/day_1/ndk_day1.c
Date :Dec 17 2019
Time :14:23:47
Line :954
ANSI :1
```

**预处理器运算符**

C 预处理器提供了下列的运算符来帮助您创建宏：

**宏延续运算符\(\)**

一个宏通常写在一个单行上。但是如果宏太长，一个单行容纳不下，则使用宏延续运算符（\）。例如：

```text
#define  message_for(a, b)  \
    printf(#a " and " #b ": We love you!\n")
```

**字符串常量化运算符\(\#\)**

在宏定义中，当需要把一个宏的参数转换为字符串常量时，则使用字符串常量化运算符（\#）。在宏中使用的该运算符有一个特定的参数或参数列表。例如：

```c
#include <stdio.h>

#define  message_for(a, b)  \
    printf(#a " and " #b ": We love you!\n")

int main(void)
{
   message_for(Carole, Debra);
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```text
Carole and Debra: We love you!
```

**标记粘贴运算符\(\#\#\)**

宏定义内的标记粘贴运算符（\#\#）会合并两个参数。它允许在宏定义中两个独立的标记被合并为一个标记。例如：

```c
#include <stdio.h>

#define tokenpaster(n) printf ("token" #n " = %d", token##n)

int main(void)
{
   int token34 = 40;

   tokenpaster(34);
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```text
token34 = 40
```

这是怎么发生的，因为这个实例会从编译器产生下列的实际输出：

```text
printf ("token34 = %d", token34);
```

这个实例演示了 token\#\#n 会连接到 token34 中，在这里，我们使用了**字符串常量化运算符（\#）**和**标记粘贴运算符（\#\#）**。

**defined\(\) 运算符**

预处理器 **defined** 运算符是用在常量表达式中的，用来确定一个标识符是否已经使用 \#define 定义过。如果指定的标识符已定义，则值为真（非零）。如果指定的标识符未定义，则值为假（零）。下面的实例演示了 defined\(\) 运算符的用法：

```c
#include <stdio.h>

#if !defined (MESSAGE)
   #define MESSAGE "You wish!"
#endif

int main(void)
{
   printf("Here is the message: %s\n", MESSAGE);  
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```c
Here is the message: You wish!
```

**参数化的宏**

CPP 一个强大的功能是可以使用参数化的宏来模拟函数。例如，下面的代码是计算一个数的平方：

```c
int square(int x) {
   return x * x;
}
```

我们可以使用宏重写上面的代码，如下：

```c
#define square(x) ((x) * (x))
```

在使用带有参数的宏之前，必须使用 **\#define** 指令定义。参数列表是括在圆括号内，且必须紧跟在宏名称的后边。宏名称和左圆括号之间不允许有空格。例如：

```c
#include <stdio.h>

#define MAX(x,y) ((x) > (y) ? (x) : (y))

int main(void)
{
   printf("Max between 20 and 10 is %d\n", MAX(10, 20));  
   return 0;
}
```

当上面的代码被编译和执行时，它会产生下列结果：

```text
Max between 20 and 10 is 20
```

### 24. 头文件

头文件是扩展名为 **.h** 的文件，包含了 C 函数声明和宏定义，被多个源文件中引用共享。有两种类型的头文件：程序员编写的头文件和编译器自带的头文件。

在程序中要使用头文件，需要使用 C 预处理指令 **\#include** 来引用它。前面我们已经看过 **stdio.h** 头文件，它是编译器自带的头文件。

引用头文件相当于复制头文件的内容，但是我们不会直接在源文件中复制头文件的内容，因为这么做很容易出错，特别在程序是由多个源文件组成的时候。

A simple practice in C 或 C++ 程序中，建议把所有的常量、宏、系统全局变量和函数原型写在头文件中，在需要的时候随时引用这些头文件。

**引用头文件的语法**

使用预处理指令 **\#include** 可以引用用户和系统头文件。它的形式有以下两种：

```c
#include <file>
```

这种形式用于引用系统头文件。它在系统目录的标准列表中搜索名为 file 的文件。在编译源代码时，您可以通过 -I 选项把目录前置在该列表前。

```c
#include "file"
```

这种形式用于引用用户头文件。它在包含当前文件的目录中搜索名为 file 的文件。在编译源代码时，您可以通过 -I 选项把目录前置在该列表前。

**引用头文件的操作**

**\#include** 指令会指示 C 预处理器浏览指定的文件作为输入。预处理器的输出包含了已经生成的输出，被引用文件生成的输出以及 **\#include** 指令之后的文本输出。例如，如果您有一个头文件 char\_manger.h，如下：

```c
char *test(void);
```

和一个使用了头文件的主程序 char\_manager.c,如下:

```c
#include "char_manger.h"
int x;
int main (void)
{
   puts (test ());
}
```

编辑器会看到如下的代码信息:

```c
char *test (void);

int x;

int main (void)
{
   puts (test ());
}
```

**只引用一次头文件**

如果一个头文件被引用两次，编译器会处理两次头文件的内容，这将产生错误。为了防止这种情况，标准的做法是把文件的整个内容放在条件编译语句中，如下：

```c
#ifndef HEADER_FILE
#define HEADER_FILE

the entire header file file

#endif
```

这种结构就是通常所说的包装器 **\#ifndef**。当再次引用头文件时，条件为假，因为 HEADER\_FILE 已定义。此时，预处理器会跳过文件的整个内容，编译器会忽略它。

**有条件引用**

有时需要从多个不同的头文件中选择一个引用到程序中。例如，需要指定在不同的操作系统上使用的配置参数。您可以通过一系列条件来实现这点，如下：

```c
#if SYSTEM_1
   # include "system_1.h"
#elif SYSTEM_2
   # include "system_2.h"
#elif SYSTEM_3
   ...
#endif
```

但是如果头文件比较多的时候，这么做是很不妥当的，预处理器使用宏来定义头文件的名称。这就是所谓的**有条件引用**。它不是用头文件的名称作为 **\#include** 的直接参数，您只需要使用宏名称代替即可：

```c
 #define SYSTEM_H "system_1.h"
 ...
 #include SYSTEM_H
```

SYSTEM\_H 会扩展，预处理器会查找 system\_1.h，就像 **\#include** 最初编写的那样。SYSTEM\_H 可通过 -D 选项被您的 Makefile 定义

### 25. 强制类型转换

强制类型转换是把变量从一种类型转换为另一种数据类型。例如，如果您想存储一个 long 类型的值到一个简单的整型中，您需要把 long 类型强制转换为 int 类型。您可以使用**强制类型转换运算符**来把值显式地从一种类型转换为另一种类型，如下所示：

```text
(type_name) expression
```

请看下面的实例，使用强制类型转换运算符把一个整数变量除以另一个整数变量，得到一个浮点数：

```c
void main(){
   void main(){
     int sum = 20,count = 3;
     double  value,value2;
    value = (double)sum / count;
    value2 = sum / count;
    printf("Value 强转 : %f Value2 wei强转 : %f\n ", value ,value2);
 }
}
```

输出：

```c
Value 强转 : 6.666667 Value2 wei强转 : 6.000000
```

**整数提升**

整数提升是指把小于 **int** 或 **unsigned int** 的整数类型转换为 **int** 或 **unsigned int** 的过程。请看下面的实例，在 int 中添加一个字符：

```c
void main(){

    //整数提升
    int i= 17;
    char c = 'c'; //在 ascii 中的值表示 99
    int sum2;

    sum2 = i + c;
    printf("Value of sum : %d\n", sum2 );
}
```

输出:

```c
 Value of sum : 116
```

在这里，sum 的值为 116，因为编译器进行了整数提升，在执行实际加法运算时，把 'c' 的值转换为对应的 ascii 值。

### 26. 错误处理

C 语言不提供对错误处理的直接支持，但是作为一种系统编程语言，它以返回值的形式允许您访问底层数据。在发生错误时，大多数的 C 或 UNIX 函数调用返回 1 或 NULL，同时会设置一个错误代码 **errno**，该错误代码是全局变量，表示在函数调用期间发生了错误。您可以在 errno.h 头文件中找到各种各样的错误代码。

所以，C 程序员可以通过检查返回值，然后根据返回值决定采取哪种适当的动作。开发人员应该在程序初始化时，把 errno 设置为 0，这是一种良好的编程习惯。0 值表示程序中没有错误。

**errno、perror\(\) 和 strerror\(\)**

C 语言提供了 **perror\(\)** 和 **strerror\(\)** 函数来显示与 **errno** 相关的文本消息。

* **perror\(\)** 函数显示您传给它的字符串，后跟一个冒号、一个空格和当前 errno 值的文本表示形式。
* **strerror\(\)** 函数，返回一个指针，指针指向当前 errno 值的文本表示形式。

让我们来模拟一种错误情况，尝试打开一个不存在的文件。您可以使用多种方式来输出错误消息，在这里我们使用函数来演示用法。另外有一点需要注意，您应该使用 **stderr** 文件流来输出所有的错误。

例子:

```c
void main(){
    int dividend = 20;
    int divsor = 0;
    int quotient;

    if (divsor == 0){
        fprintf(stderr,"除数为 0 退出运行。。。\n");
        exit(EXIT_FAILURE);
    }
    quotient = dividend / divsor;
    fprintf(stderr,"quotient 变量的值为 : %d\n", quotient);
    exit(EXIT_SUCCESS);
}
```

输出：

```text
除数为 0 退出运行。。。
```

### 27. 递归

递归指的是在函数的定义中使用函数自身的方法。

语法格式如下:

```c
void recursion()
{
   statements;
   ... ... ...
   recursion(); /* 函数调用自身 */
   ... ... ...
}

int main()
{
   recursion();
}
```

**数的阶乘**

```c
double factorial(unsigned int i){
    if (i <= 1){
        return 1;
    }
   return i * factorial(i - 1);
}
void main(){
    int i = 15;
    printf("%d 的阶乘 %ld \n",i ,factorial(i));
}
```

输出:

```c
15 的阶乘 140732727129776
```

**斐波拉契数列**

```c
//斐波拉契数列
int fibonaci(int i){
    if (i == 0){
        return 0;
    }
    if (i == 1){
        return 1;
    }
    return fibonaci(i - 1) + fibonaci( i -2);
}
void main(){
    for (int j = 0; j < 10; j++) {
        printf("%d\t\n", fibonaci(j));

    }
}
```

输出:

```c
0
1    
1    
2    
3    
5    
8    
13    
21    
34
```

### 28. 可变参数

有时，您可能会碰到这样的情况，您希望函数带有可变数量的参数，而不是预定义数量的参数。C 语言为这种情况提供了一个解决方案，它允许您定义一个函数，能根据具体的需求接受可变数量的参数。下面的实例演示了这种函数的定义。

```c
int func(int, ... ) 
{
   .
   .
   .
}

int main()
{
   func(2, 2, 3);
   func(3, 2, 3, 4);
}
```

请注意，函数 **func\(\)** 最后一个参数写成省略号，即三个点号（**...**），省略号之前的那个参数是 **int**，代表了要传递的可变参数的总数。为了使用这个功能，您需要使用 **stdarg.h** 头文件，该文件提供了实现可变参数功能的函数和宏。具体步骤如下：

* 定义一个函数，最后一个参数为省略号，省略号前面可以设置自定义参数。
* 在函数定义中创建一个 **va\_list** 类型变量，该类型是在 stdarg.h 头文件中定义的。
* 使用 **int** 参数和 **va\_start** 宏来初始化 **va\_list** 变量为一个参数列表。宏 va\_start 是在 stdarg.h 头文件中定义的。
* 使用 **va\_arg** 宏和 **va\_list** 变量来访问参数列表中的每个项。
* 使用宏 **va\_end** 来清理赋予 **va\_list** 变量的内存。

现在让我们按照上面的步骤，来编写一个带有可变数量参数的函数，并返回它们的平均值：

例子:

```c
 double average(int num,...){
     va_list  vaList;
     double  sum = 0.0;
     int i ;
     //为 num 个参数初始化 valist
     va_start(vaList,num);
     //访问所有赋给 vaList 的参数
    for (int j = 0; j < num; j++) {
        sum += va_arg(vaList, int);
    }
    //清理为valist 保留的内存
    va_end(vaList);
    return sum/num;
 }

 void main(){
     printf("Average of 2, 3, 4, 5 = %f\n", average(4, 2,3,4,5));
     printf("Average of 5, 10, 15 = %f\n", average(3, 5,10,15));
 }
```

输出:

```c
Average of 2, 3, 4, 5 = 3.500000
Average of 5, 10, 15 = 10.000000
```

### 29. 内存管理

本章将讲解 C 中的动态内存管理。C 语言为内存的分配和管理提供了几个函数。这些函数可以在  头文件中找到。

| 序号 | 函数和描述 |
| :--- | :--- |
| **void \*calloc\(int num, int size\);** | _在内存中动态地分配 num 个长度为 size 的连续空间，并将每一个字节都初始化为 0。所以它的结果是分配了 num_size 个字节长度的内存空间，并且每个字节的值都是0。 |
| **void free\(void \*address\);** | 该函数释放 address 所指向的内存块,释放的是动态分配的内存空间。 |
| **void \*malloc\(int num\);** | 在堆区分配一块指定大小的内存空间，用来存放数据。这块内存空间在函数执行完成后不会被初始化，它们的值是未知的。 |
| **void \*realloc\(void \*address, int newsize\);** | 该函数重新分配内存，把内存扩展到 **newsize**。 |

**注意:**  void  _类型表示未确定类型的指针。C、C++ 规定 void_  类型可以通过类型转换强制转换为任何其它类型的指针。

**动态分配内存**

编程时，如果您预先知道数组的大小，那么定义数组时就比较容易。例如，一个存储人名的数组，它最多容纳 100 个字符，所以您可以定义数组，如下所示：

```text
char name[100];
```

但是，如果您预先不知道需要存储的文本长度，例如您向存储有关一个主题的详细描述。在这里，我们需要定义一个指针，该指针指向未定义所需内存大小的字符，后续再根据需求来分配内存，如下所示：

```c
void main() {
    char name[100];
    char *description;

    //将字符串 copy 到 name 中
    strcpy(name, "迎娶白富美！");

    //开始动态分配内存
    description = (char *) malloc(200 * sizeof(char));
    if (description == NULL) {
        fprintf(stderr, "Error - unable to allocate required memory\n");
    } else {
        strcpy(description, "开始添加数据到 description 中");
    }
    printf("Name = %s\n", name );
    printf("Description: %s sizeOf 大小 ：%d\n", description , sizeof(description));
//     使用 free() 函数释放内存
    free(description);
}
```

输出:

```c
Name = 迎娶白富美！
Description: 开始添加数据到 description 中 sizeOf 大小 ：8
```

### 30. 命令行参数

执行程序时，可以从命令行传值给 C 程序。这些值被称为**命令行参数**，它们对程序很重要，特别是当您想从外部控制程序，而不是在代码内对这些值进行硬编码时，就显得尤为重要了。

命令行参数是使用 main\(\) 函数参数来处理的，其中，**argc** 是指传入参数的个数，**argv\[\]** 是一个指针数组，指向传递给程序的每个参数。下面是一个简单的实例，检查命令行是否有提供参数，并根据参数执行相应的动作：

```c
void main(int argc , char *argv[]){
    if (argc ==1){
        printf("argv[%d] == %d",0,*argv[0]);
    }
    else if (argc ==2){
        printf("argv[%d] == %d",1,*argv[1]);
    } else{
        printf("匹配失败...");
    }
}
```

输出:

```c
argv[0] == 47
```

## 总结

不知道大家在看完 C 基础内容之后在对比下 Java 语法，是不是大部分都差不多，之前有的人说学了 C 在学其它语言都是小菜一碟，现在看来好像是这么回事。个人觉得其实只要会编程语言中的任何一门在学其它语言都会比较容易上手。

## C 语言基础加强学习资料

* [C 语言 排序算法](https://www.runoob.com/cprogramming/c-sort-algorithm.html)
* [C 语言 基础实例代码](https://www.runoob.com/cprogramming/c-examples.html)
* [C 语言 100 道练习题](https://www.runoob.com/cprogramming/c-100-examples.html)

## 参考

* [https://www.runoob.com/cprogramming/c-tutorial.html](https://www.runoob.com/cprogramming/c-tutorial.html)

