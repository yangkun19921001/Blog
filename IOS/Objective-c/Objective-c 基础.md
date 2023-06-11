## 基础

### OC 中用到的 C 语言知识

**基本数据类型**

| 数据类型 | short  | int  | long   | float        | double       |
| -------- | ------ | ---- | ------ | ------------ | ------------ |
| 名称     | 短整型 | 整型 | 长整型 | 单精度浮点型 | 双精度浮点型 |
| 长度     | 2      | 4    | 8      | 4            | 8            |

**分支和循环结构**

OC语言的分支和循环结构的语法和C语言相同，分支结构使用`if...else`和`switch...case`，循环结构使用`while`、`do...while`、`for`



### 分析 OC 程序

```objective-c
#import <Foundation/Foundation.h>
int main() {
    NSLog(@"Hello, World!");
    return 0;
}
```

1)、#import 引入头文件。与 #include 相比，#import 能保证头文件只被引入一次

2)、Foundation.h 是 OC 语言的基础框架，它提供了OC专有的基本数据类型（如字符串、数组、时间日期等），提供了多线程、网络连接、文件操作、本地数据存储等常用功能。Foundation.h 就像C语言中的 stdio.h，一般都需要引入。

3)、NSLog() 是OC中的格式化输出函数，相当于C语言中的 printf() 的升级版，不仅可以用来输出C语言中的数据，还可以输出OC中的数据。

`@`符号没有实际含义，只是用来作为OC字符串的特有标志。在OC中，字符串前面都要加`@`，如果不加，就变成了C语言中的字符串

在 NSLog() 中，如果涉及到C语言中的基本数据类型，就可以使用%d、%f、%s等格式控制字符来输出,比如下面代码

```objective-c
int main(int argc, const char * argv[]) {
    int a = 100;
    float b = 39.52;
    long long c = 64;
    char *d = "C";//C语言中的字符串
    NSString * e = @"Objective-C";//C语言中的字符串

    NSLog(@"a=%d\n b=%f\n c=%lld\n  d=%s\n e=%@\n", a,b,c,d,e);
    return 0;
}
```

运行结果:

**a=100**

 **b=39.520000**

 **c=64**

 **d=C**

 **e=Objective-C**

NSString 是OC中的字符串类型，需要使用格式控制符`%@`来输出



###OC 中的对象和概念

**定义结构体**

```c
//定义结构体 Student
struct Student{
    char *name;
    int age;
    float score;
};
```

**声明类**

```objective-c
//声明类
@interface Student : NSObject //通过 @interface 来声明类
//类中所包含的变量
@property NSString * name;
@property int age;
@property float score;

-(void)show;
@end//使用 @end 关键字
```

**实现类中的声明**

```objective-c

//实现在类中的声明
@implementation Student //通过@implementation关键字来实现类中的函数
-(void)show{
     NSLog(@"Student: name=%@,age=%d,score=%f \n",self.name,self.age,self.score);
};

@end

```

**运行 main**

```objective-c
int main(int argc, const char * argv[]) {
    //通过类来定义变量 stu,即create对象 stu
  Student* stu1 =   [[Student alloc] init];//alloc 函数为对象分配内存空间，init 函数会初始化对象
    //操作类中的成员
       stu1.name = @"DevYK";
       stu1.age = 16;
       stu1.score = 99.5;
    [stu1 show];//操作类中的函数
}
```

运行结果:

Student: name=DevYK,age=16,score=99.500000

**结论：**

- interface 是 “接口的意思” OC 使用 @interface 来声明一个类 ； Student 是类的名称； NSObject 表示派生自哪个类。

- 在 OC 中，类中所包含的变量和函数都有特定的称呼，变量被称为属性 （Property）,函数被称为方法 （Method）,属性和方法统称为类的成员（Member）。从上面的代码可以看出，声明类的属性要使用 @property 关键字，而声明类的方法不需要使用关键字

### 向工程中中添加文件

使用Xcode向某个工程中添加文件时，有两种方式：
方式一：“command”＋“n”，弹出添加文件对话框。
方式二：在需要添加文件的工程目录下右键，选择“New File…”。



在“Source”中，右侧会显示一下几个文件，这里说明几个常用的文件：
Cocoa Class    ——向工程建立一个类文件，包含.h和.m文件
Objecive－C file  ——向工程中添加一个.m文件
Header File     ——向工程中添加一个.h文件
C File          ——向工程中添加C语言的.c和.h文件
C++ File        ——向工程中添加C++语言的.cpp和.hpp文件



### 面向对象的 OC

**区别: ** 面向对象采用了“类”这种数据结构，面向结构编程中不能使用“类”。

**特性:**

- 封装: 只公开代码单元的对外接口，隐藏具体实现
- 继承: 子类自动共享父类一切公共资源的机制
- 多态: 父类的指针指向子类的对象



### OC 中类结构的详细介绍

在类中创建发昂发的步骤：

1. 首先要确定你要创建类方法还是对象方法，类方法，类方法用＋开头，对象方法用－开头。（拿类方法举例）
2. 确定返回值类型（例如返回int类型）
3. 确定这个方法有没有参数，如果有，我们就要在每个参数前，对这个参数进行说明（参数和后边参数说明之间至少有一个空格）；如果没有，直接给这个方法起一个名字就可以了。

​    例如：+(int)personWithName:(NSString*)name  andAge:(int)age andSex:(BOOL)sex;



### 第一个类程序

**最简单的类创建**

**声明**

````objective-c
//声明一个对象
@interface Day5 : NSObject
//声明成员变量
@property NSString *name;
-(void)display;

@end
````

**实现**

```objective-c
@implementation Day5
-(void)display{
    NSLog(@"我是 %@ \n %@",@"Day5 学习内容",self.name);
}
@end
```

运行结果:

我是 Day5 学习内容  DevYK



在使用C语言或者OC语言中的基本数据类型时，需要遵循“先声明，后使用”的原则。学习OC的类时，同样也需要遵循一个原则：“先声明，再实现，后使用”。



### OC 中的点语法

**点语法的功能**

点语法是通过“类对象.属性”的方式来调用类中属性的一种方法



### 类中 self 和 “_” 的使用

**对 self 的理解**

如果 self 所在的这个方法是类方法，那么self就代表当前类；如果是对象方法，self就代表当前类的对象。



**对 “_” 的理解**

如果在编写过程中需要在类中调用本类的属性，如果这个地方必须调用get或set方法，那就必须使用self.name这种方式，如果在get或者set方法中，就必须使用_name的方式，如果不是上述的两种情况，使用哪个都可以



**“super” 关键字**

在OC面向对象大环境下，不但提供有本类的self，还有父类的super关键字。
super和self的使用规则一样，不同之处在于：super指父类方法的调用者。而self指当前方法的调用者。



### @property 的几种常用修饰词

常用的修饰词有：nonatomic、copy、strong、assign、weak、readwrite、readonly等

如果@property后不对属性进行设置，该属性同样有它的默认的一些设置。下面向大家介绍一下几种属性的用法以及默认的情况：

**nonatomic**和atomic

nonatomic：原名：非原子性，它涉及到多线程的相关知识。在这里我们只需要知道有nonatomic声明的属性，任何人任何地点任何时间都可以调用它（就是很多人可以同时使用它），所以它的缺点就是不安全，而优点就是效率高，访问速度快。

atomic(默认)：原子性。和nonatomic正好相反，他对属性的访问进行了限制，保护了声明属性的安全，缺点就是：访问效率低，速度慢。



**copy**、**strong**和**weak**

copy：一般使用于字符串，它的特点如同它的中文翻译，将内容另外拷贝一份，保存在一个单独的存储空间中。

strong：叫做：强引用。



**assign**、**readonly**和**readwrite**

assign我认为是其中最简单的，它应用于OC的基础数据类型（NSInteger、BOOL）和C语言中的基本数据类型(int,float,double,char)

readwrite（默认）：它代表这个属性即可以读，也可以写(可以调用它的get和set方法)

readonly：和readwrite不同，它代表这个属性只能读，不能进行写操作(只能调用get方法，不能调用set方法)



**setter** **和 getter**

getter=method:在声明的这个属性可读的前提下，使用它给这个属性设定get方法

setter=method:同get方法类似，在声明的属性可写的前提下，使用这个设置可以设定这个属性的set方法。
（这两个设置很少用，因为只是给get和set方法换个名字而已）

在@property的属性中，以上几个属性最常见，实际开发过程中基本上都能囊括。



对于基本数据类型，例如int，double，float，char，还有OC语言中的BOOL以及NSInteger来说，都用assign。
例如：@property (nonatomic,assign)int age;

对于OC中特有的字符串类型(NSString)来说，最常用的是copy。
例如：@property (nonatomic,copy)NSString * name;

对于OC中大量的类对象，一般用strong。
例如：@property (nonatomic,strong)Person * person;

### OC的潜规则命名

特别提醒，在学习过程中，要养成良好的命名习惯，忌用a、b、c、a1、b1等作为某种对象的名称。在命名时，要尽量赋予对象名由实际意义的英文名。养成良好的编码习惯，在以后找工作过程中也是会加分的。

（提示：在编程过程中，对于命名在初期学习的时候就要养成良好的规范，OC中默认的规范是： (一般是这样，如果公司有自己的要求，则按照公司要求来)：

1. 类名每个单词首字母大写
2. 类中属性名第一个单词首字母小写，后边每个单词首字母大写
3. 类中方法名第一个单词首字母小写，后边每个单词首字母大写，参数命名规则和属性相同。


同时还要注意的是，类名不能和属性名或者方法名相同。）



### OC 中的类别

类别，别名：扩展类。意思是在现有类的基础上为该类增加一些新的方法(只能是方法，不能添加属性) 如果类别中的方法和现有类中方法相同，就覆盖原有方法

**类别和类扩展的区别**

同：（类扩展和类别都可以为原有类添加新的方法）。
异：（通过类扩展添加的方法外界无法调用。而类别可以；类扩展能添加属性，而类别只能添加方法）。



### OC 中的协议

OC语言是单继承多协议的语言。在学习继承的同时，还需要学会适当的使用协议完成特定的功能。

协议和我们生活中的含义大同小异，例如：有一个孩子，由于年龄很小，无法照顾自己，所以不得不委托他人来照顾他的饮食起居。

从协议的角度分析上面的例子，孩子需要得到照顾，但是他自己办不了，只能让保姆照顾他。所以孩子是协议生成方，保姆是协议实现方。
     
从程度的角度上考虑，协议就是某类创建，其他类来帮其实现。



**使用协议需要注意的点**

1、协议没有父类(协议可以服从多个(>=0) 协议，并不是 NSObject 这个类

2、协议中不能定义变量 (属性) ,只能定义方法



### OC中的单例

**单例的理解:**

简单的理解，就是在开发过程中，有时会需要在不同的地方对同一块内存的数据进行操作，而对于OC来讲，这块内存往往代表的是一个对象的数据。

**单例的实例:**

这个单例模拟的是两个人张三和李四合租了一辆车，通过记录每个人开车的时间，最后统计出这辆车总共跑的小时数。

创建两个类，一个 Person 类，一个 Car 类；

由于两个人公用一辆车，所以 Car 类中有一个单例，我们先来看 Car 类的代码实现

```objective-c
@interface Car : NSObject

//定义跑车时间计数
@property (nonatomic,assign)int driveHours;
//确定返回的对象
+(instancetype)car;

@end
```

```objective-c
#import "Car.h"

//声明一个静态的 car 空对象
static Car *car = NULL;

@implementation Car
+ (instancetype)car{
    if (car == NULL) {
        car = [[Car alloc] init];
    }
    return car;
}
@end
```

分解一下 Car 类中的代码:

Car.h 中声明了一个记录总时间和属性和一个类方法。

关键的代码在 Car.m 中，首先我们声明了一个全局本类的对象(这个对象必须赋空值)

staticn 关键字在这里的作用是: 是这个对象只分配一次内存(static 还有很多特性)

在 Car 的类方法中，我们首先判断 car 对象是否是空值，如果是空值，我们才给它初始化。否则，说明它已经被使用过了，就直接返回，不进入 if 

**下面我们来看一下 Person 类中的实现**

```objective-c
#import <Foundation/Foundation.h>
#import "Car.h"
@interface Person : NSObject
@property (nonatomic,copy)NSString * name;
@property (nonatomic,strong)Car * car;
-(void)displayWithDriveHours:(int)hours;
@end
```

```objective-c
#import "Person.h"
@implementation Person
-(instancetype)init{
if (self=[super init]) {
        self.car=[Car car];//创建对象的car属性实际上就是Car类的那个唯一的实例。
        self.name=nil;
    }
    return self;
}
-(void)displayWithDriveHours:(int)hours{
    self.car.driveHours+=hours;
}
@end
```

Main 中的代码

```objective-c
import <Foundation/Foundation.h>
#import "Person.h"
int main(int argc, const char * argv[]) {
    Person * ZhangSan=[[Person alloc] init];
   
    Person * LiSi=[[Person alloc] init];
   
    [LiSi displayWithDriveHours:5];
   
    [ZhangSan displayWithDriveHours:10];
    [LiSi displayWithDriveHours:3];
    Car * car=[Car car];
    NSLog(@"The allHours are %d",car.driveHours);
    return 0;
}
```

输出结果：18

在main.m中，无论是哪个对象调用这个类方法，返回的都是相同的对象，对同一块内存数据做操作。这就是单例的实际作用。
                                                               
我们已经学习了很多方法传递数据了，每种方式有它特有的优势，这个需要在不断地实践中，体会它们，在适当的地方使用适当的传递方法。

单例，严格来说应该是工程中需要共享数据时才使用，如果用单例只是去传递数据，那就有点大材小用了。



### Foundation 框架简介

**Foundation****框架涉及的领域**

提供了OC专有基本数据类型，如NSArray、NSString、NSDictionary等，如：
<Foundation/NSArray.h> <Foundation/NSData.h>
<Foundation/NSDate.h>
<Foundation/NSString.h>
<Foundation/NSDictionary.h>

提供了和网络连接相关功能的接口类，如：
<Foundation/NSURLConnection.h>
<Foundation/NSURLRequest.h>
<Foundation/NSURL.h>

提供了关于本地数据存储相关功能的接口类，如：
<Foundation/NSUserDefaults.h>

提供了对文件操作相关的接口类，例如移动文件等，如：
<Foundation/NSFileManager.h>

提供了和多线程相关的接口类，如：
<Foundation/NSThread.h>

## 参考

- [Objective-C基础教程：1天玩转Objective-C语法](http://c.biancheng.net/cpp/objective_c/)







1、掌握基本的测试业务流程，对整体的项目有测试计划，具备独立测试 Web 、移动端项目的能力。

2、熟练掌握 Linux 命令，比如日志查看，日志导出，日志上传，连接数据库等操作。

3、熟练使用 XMind 思维导图工具来对功能模块进行划分及测试用例编写。

4、熟练使用 Jira、禅道等工具对 Bug 进行管理。

5、熟练使用 SQL 语句对数据库的基本操作，比如对数据的增删查改。

6、熟练使用 Fiddler、Charles 抓包工具对 Http/Https 协议抓包，并分析 response 数据的正确性。

7、掌握 Python 语言，能够独立基于 pytest 搭建自动化测试框架，并编写自动化接口测试程序。

8、掌握 Jenkins 工具的环境搭建，并通过 Jenkins 工具持续构建自动化程序。

9、掌握 adb 命令，比如 Crash 、ANR、LogCat 的日志查看和导出。 

10、了解 Jmeter 性能工具对接口的压力和并发测试。

11、了解 Git 命令对代码的管理。
