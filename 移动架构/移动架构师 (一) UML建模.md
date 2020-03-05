## UML

### 定义

UML 是统一建模语言,  是一种开放的方法，用于说明、可视化、构建和编写一个正在开发的、面向对象的、软件密集系统的制品的开放方法。

### 作用

1. 帮组开发团队以一种可视化的方式理解系统的功能需求。
2. 有利于开发团队队员之间在各个开发环节间确立沟通的标准，便于系统文档的制定和项目的管理。因为 UML 的简单、直观和标准性，在一个团队中用 UML 来交流比用文字说明的文档要好的多。
3. UML 为非专业编程人士理解软件的功能和构造，提供了一种直白、简单、通俗的方法。
4. 使用 UML 可以方便的理解各种框架的设计方式。

##  面向对象模型

### 用例图 (User  Case Diagram)

#### 概述

- 用例图主要模拟系统中的动态行为，并且描述了用户、需求、以及系统功能单元之间的关系。

- 用例图由参与者 (用户) ，用例 (功能) 和它们之间的关系组成。

#### 目的

1. 用来收集系统的要求。
2. 用于获取系统的外观图。
3. 识别外部和内部影响因素。
4. 显示要求之间的相互作用是参与者。

#### 构成元素

| 组成元素               | 说明                                                         | 符号表示                                                     |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 参与者 (Actor)         | 表示与你自己的程序或者系统进行正在交互的动作。用一个小人表示 | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45q0o6koqj302m02m0ow.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |
| 用例 (User Case)       | 表示在一个系统或者程序中某个功能的描述。用一个椭圆代表       | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45q2tlt9yj303702q3ya.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |
| 关联关系 (Association) | 表示参与者与用例之间的关系。用一个箭头表示                   | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45qoc3vzoj306503r0fa.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |
| 包含关系 (Include)     | 表示一个大的功能分解成多个小模块的动作。用一个带包含文字的虚线箭头表示 | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45quqrtd0j308e09f74b.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |
| 扩展关系 (Extend)      | 表示用例功能的延伸，相当于是为用例提供附加功能。用一个带扩展文字的虚线箭头表示 | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45qyv3jdoj30b5043wed.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |
| 依赖 (dependency)      | 表示一个用例依赖于另一个用例（相当于程序里面的一个类引用另一个类的关系）。用一个带依赖文字的虚线箭头表示 | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45r1l0c74j30920883yj.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |
| 泛化 (Generalization)  | 相当于程序里面的继承关系。用一个箭头表示                     | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45r6lv556j30cf07rdft.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |

#### 用例图例子

需求: 以一个登录的例子来画一个用例图

1. 包含 登录/注册/
2. 登录/注册 支持手机号码、第三方 QQ/weichat/GitHub 登录注册

效果图:

 ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g46cdqxogcj30n50doaal.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>)

提供的登录用例基本上已经包含了刚刚所学的组成元素部分。

### 结构图

#### 类图 (Class Diagram)

##### 概念

类图 (Class Diagram) 是显示了模型的静态结构，特别是模型中存在的类、类的内部结构以及它们与其它类的关系等。

类图不显示暂时性的信息，类图是面向对象建模的主要组成部分。它即用于应用程序的系统分类的一般概念建模，也用于详细建模，将模型转换成编程代码。

##### 构成元素

| 构成元素              | 说明                                                         | 表示符号                                                     |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 泛化 (Generalization) | 是一种继承关系, 表示一般与特殊的关系, 它指定了子类如何特化父类的所有特征和行为。用一个带三角箭头的实线，箭头指向父类表示 | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45r6lv556j30cf07rdft.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |
| 实现 (Realization)    | 是一种类与接口的关系, 表示类是接口所有特征和行为的实现。用一个带三角箭头的虚线，箭头指向接口表示. | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g46ha63facj304n07pa9x.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |
| 关联 (Association)    | 1. 是一种拥有的关系, 它使一个类知道另一个类的属性和方法. 2.关联可以是双向的，也可以是单向的。*双向的关联*可以有两个箭头或者没有箭头，*单向的关联*有一个箭头。用一个带普通箭头的实心线，指向被拥有者 | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45qoc3vzoj306503r0fa.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |
| 依赖 (Dependency)     | 是一种使用的关系,  即一个类的实现需要另一个类的协助, 所以要尽量不使用双向的互相依赖.用一个带箭头的虚线，指向被使用者 | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45r1l0c74j30920883yj.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |
| 聚合 (Aggregation)    | 聚合是一种特殊的关联 (Association) 形式，表示两个对象之间的所属 (has-a) 关系。所有者对象称为聚合对象，它的类称为聚合类；从属对象称为被聚合对象，它的类称为被聚合类。例如，一个公司有很多员工就是公司类 Company 和员工类Employee 之间的一种聚合关系。被聚合对象和聚合对象有着各自的生命周期，即如果公司倒闭并不影响员工的存在。用一个带**空心菱形**的实心线，菱形指向整体 | [![VXn1BV.png](https://s2.ax1x.com/2019/06/19/VXn1BV.png)](https://imgchr.com/i/VXn1BV) |
| 组合 (Composition)    | 是整体与部分的关系, 但*部分不能离开整体而单独存在*. 如公司和部门是整体和部分的关系, 没有公司就不存在部门。用一个带**实心菱形**的实线，菱形指向整体表示。 | ![](https://images2017.cnblogs.com/blog/896610/201708/896610-20170815203140240-1642090222.png) |

##### 类图例子

需求: 基于 [google 官方 MVP 架构](<https://github.com/googlesamples/android-architecture/tree/todo-mvp/>) 绘制一个基本的 MVP 类图架构

![ZIm7Fg.jpg](https://s2.ax1x.com/2019/07/14/ZIm7Fg.jpg)



#### 组合结构图 (Composite Structure Diagram)

##### 概念

用来显示组合结构或部分系统的内部构造，包括类、接口、包、组件、端口和连接器等元素。比类图更抽象的表示，一般来说先画组合结构图，再画类图。

##### 构成元素

| 构成元素              | 说明                                                         | 表示符号                                                     |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 类 (Class)            | 表示对某件事物的描述                                         | ![class.jpg](https://s3.ax2x.com/2019/07/17/class.jpg)       |
| 接口 (Interface)      | 表示用于对 Class 的说明                                      | ![25a5bf4ec2a49f23bbc971fb55242484.jpg](https://s3.ax2x.com/2019/07/17/25a5bf4ec2a49f23bbc971fb55242484.jpg) |
| 端口 (port)           | 表示部件和外部环境的交互点                                   | ![958803fcc1ecf9dd710a7fa4d3d7f284.jpg](https://s3.ax2x.com/2019/07/17/958803fcc1ecf9dd710a7fa4d3d7f284.jpg) |
| 部件 (part)           | 表示被描述事物所拥有的内部成分                               | ![388d69ae3fb52b2777f1efa2051e2d03.jpg](https://s3.ax2x.com/2019/07/17/388d69ae3fb52b2777f1efa2051e2d03.jpg) |
| 泛化 (Generalication) | 是一种继承关系, 表示一般与特殊的关系, 它指定了子类如何特化父类的所有特征和行为。用一个带三角箭头的实线，箭头指向父类表示 | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45r6lv556j30cf07rdft.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |
| 实现 (Realization)    | 是一种类与接口的关系, 表示类是接口所有特征和行为的实现。用一个带三角箭头的虚线，箭头指向接口表示. | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g46ha63facj304n07pa9x.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |
| 关联 (Association)    | 1. 是一种拥有的关系, 它使一个类知道另一个类的属性和方法. 2.关联可以是双向的，也可以是单向的。*双向的关联*可以有两个箭头或者没有箭头，*单向的关联*有一个箭头。用一个带普通箭头的实心线，指向被拥有者 | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45qoc3vzoj306503r0fa.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |
| 依赖 (Dependency)     | 是一种使用的关系,  即一个类的实现需要另一个类的协助, 所以要尽量不使用双向的互相依赖.用一个带箭头的虚线，指向被使用者 | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45r1l0c74j30920883yj.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |
| 聚合 (Aggregation)    | 聚合是一种特殊的关联 (Association) 形式，表示两个对象之间的所属 (has-a) 关系。所有者对象称为聚合对象，它的类称为聚合类；从属对象称为被聚合对象，它的类称为被聚合类。例如，一个公司有很多员工就是公司类 Company 和员工类Employee 之间的一种聚合关系。被聚合对象和聚合对象有着各自的生命周期，即如果公司倒闭并不影响员工的存在。用一个带**空心菱形**的实心线，菱形指向整体 | [![VXn1BV.png](https://s2.ax1x.com/2019/06/19/VXn1BV.png)](https://imgchr.com/i/VXn1BV) |
| 组合 (Composition)    | 是整体与部分的关系, 但*部分不能离开整体而单独存在*. 如公司和部门是整体和部分的关系, 没有公司就不存在部门。用一个带**实心菱形**的实线，菱形指向整体表示。 | ![](https://images2017.cnblogs.com/blog/896610/201708/896610-20170815203140240-1642090222.png) |

##### 注意事项

侧重类的整体特性，就用类图；侧重类的内部结构，就使用组合结构图。

##### 组合结构图例子

[![Composite-Structures1-.md.png](https://s3.ax2x.com/2019/07/15/Composite-Structures1-.md.png)](https://free.imgsha.com/i/QRxIX)

#### 对象图 (Object Diagram)

##### 概念

显示某时刻对象和对象之间的关系

##### 构成元素

| 构成元素                 | 说明                               | 表示符号                                                     |
| ------------------------ | ---------------------------------- | ------------------------------------------------------------ |
| 对象 (Object)            | 代表某个事物                       | ![class.jpg](https://s3.ax2x.com/2019/07/17/class.jpg)       |
| 实例链接 (Instance Link) | 链是类之间关系的实例               | ![-3c9ce1846469aa82.jpg](https://s3.ax2x.com/2019/07/17/-3c9ce1846469aa82.jpg) |
| 依赖 (Dependency)        | 想当于 A 对象使用 B 对象里面的属性 | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45r1l0c74j30920883yj.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |



##### 对象图例子

![](https://7n.w3cschool.cn/attachments/image/20170821/1503307429855450.jpg)

#### 包图 (Package Diagram)

##### 概念

包与包的之间的关系

##### 构成元素

| 构成元素              | 说明                                                         | 表示符号                                                     |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 包 (Package)          | 当对一个比较复杂的软件系统进行建模时，会有大量的类、接口、组件、节点和图需要处理；如果放在同一个地方的话，信息量非常的大，显得很乱，不方便查询，所以就对这些信息进行分组，将语义或者功能相同的放在同一个包中，这样就便于理解和处理整个模型 | [![PackageDiagram1.png](https://s3.ax2x.com/2019/07/15/PackageDiagram1.png)](https://free.imgsha.com/i/QbAO3) |
| 泛化 (Generalization) | 是一种继承关系, 表示一般与特殊的关系, 它指定了子类如何特化父类的所有特征和行为。用一个带三角箭头的实线，箭头指向父类表示 | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45r6lv556j30cf07rdft.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |
| 依赖 (Dependency)     | 是一种使用的关系,  即一个类的实现需要另一个类的协助, 所以要尽量不使用双向的互相依赖.用一个带箭头的虚线，指向被使用者 | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45r1l0c74j30920883yj.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |

##### 包图例子

[![PackageDiagram2.md.png](https://s3.ax2x.com/2019/07/15/PackageDiagram2.md.png)](https://free.imgsha.com/i/QbY3p)

### 动态图

#### 时序图 (Sequence Diagram)

#####概念

时序图（Sequence Diagram) , 又名序列图、循序图、顺序图，是一种UML交互图。

它通过描述对象之间发送消息的时间顺序显示多个对象之间的动态协作。

它可以表示用例的行为顺序，当执行一个用例行为时，其中的每条消息对应一个类操作或状态机中引起转换的触发事件。

#####构成元素

| 构成元素              | 说明                                                         | 表示符号                                                     |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 参与者 (Actor)        | 表示与你自己的程序或者系统进行正在交互的动作。用一个小人表示 | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45q0o6koqj302m02m0ow.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |
| 对象 (Object)         | 代表某个事物                                                 | ![class.jpg](https://s3.ax2x.com/2019/07/17/class.jpg)       |
| 控制焦点 (Activation) | 控制焦点是顺序图中表示时间段的符号，在这个时间段内对象将执行相应的操作。用小矩形表示 | ![1563183352712.jpg](https://s3.ax2x.com/2019/07/15/1563183352712.jpg) |
| 消息 (Message)        | 消息一般分为同步消息（Synchronous Message），异步消息（Asynchronous Message）和返回消息（Return Message） | ![1563183471285.jpg](https://s3.ax2x.com/2019/07/15/1563183471285.jpg) |

#####时序图例子

需求：这里为了简单就用一个登陆的时序图为参考

[![SequenceDiagram_.png](https://s3.ax2x.com/2019/07/15/SequenceDiagram_.png)](https://free.imgsha.com/i/QgEpJ)



#### 通讯图 (Communication Diagram)

##### 概念

顺序图强调先后顺序，通信图则是强调相互之间的关系。顺序图和通信图基本同构，但是很少使用通信图，因为顺序图更简洁，更直观。

##### 构成元素

| 构成元素                 | 说明                                                         | 表示符号                                                     |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 参与者 (Actor)           | 表示与你自己的程序或者系统进行正在交互的动作。用一个小人表示 | ![](<https://ws3.sinaimg.cn/large/005BYqpgly1g45q0o6koqj302m02m0ow.jpg?referrer=https://cdn.sinaimg.cn.52ecy.cn>) |
| 对象 (Object)            | 代表某个事物                                                 | ![class.jpg](https://s3.ax2x.com/2019/07/17/class.jpg)       |
| 实例链接 (Instance Link) | 链是类之间关系的实例                                         | ![-3c9ce1846469aa82.jpg](https://s3.ax2x.com/2019/07/17/-3c9ce1846469aa82.jpg) |
| 消息 (Message)           | 消息一般分为同步消息（Synchronous Message），异步消息（Asynchronous Message）和返回消息（Return Message） | ![1563183471285.jpg](https://s3.ax2x.com/2019/07/15/1563183471285.jpg) |

##### 通讯图例子

​	![](https://gss0.bdstatic.com/94o3dSag_xI4khGkpoWK1HF6hhy/baike/c0%3Dbaike80%2C5%2C5%2C80%2C26/sign=9c62a6a6edf81a4c323fe49bb6430b3c/4034970a304e251f059bf02aa186c9177e3e53f7.jpg)

#### 活动图 (Activity Diagram)

##### 概念

活动图是 UML 用于对系统的动态行为建模的另一种常用工具，它描述活动的顺序，展现从一个活动到另一个活动的控制流。活动图在本质上是一种流程图。活动图着重表现从一个活动到另一个活动的控制流，是内部处理驱动的流程。

##### 构成元素

| 构成元素               | 说明                                                         | 表示符号                                                     |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 活动 (Activity)        | 活动状态用于表达状态机中的非原子的运行                       | ![1563204107193.jpg](https://s3.ax2x.com/2019/07/15/1563204107193.jpg) |
| 对象节点 (Object Node) | 某件事物的具体代表                                           | ![1563204175149.jpg](https://s3.ax2x.com/2019/07/15/1563204175149.jpg) |
| 判断 (Decision)        | 对某个事件进行判断                                           | [![1563204318945.jpg](https://s3.ax2x.com/2019/07/15/1563204318945.jpg)](https://free.imgsha.com/i/Q0Ahs) |
| 同步 (synchronization) | 指发送一个请求,需要等待返回,然后才能够发送下一个请求，有个等待过程; | [![1563204447903.jpg](https://s3.ax2x.com/2019/07/15/1563204447903.jpg)](https://free.imgsha.com/i/Q0wdV) |
| 开始 (final)           | 表示成实心黑色圆点                                           | [![1563204607110.jpg](https://s3.ax2x.com/2019/07/15/1563204607110.jpg)](https://free.imgsha.com/i/Q07b0) |
| 结束 (Flow Final)      | 分为活动终止节点（activity final nodes）和流程终止节点（flow final nodes)。而流程终止节点表示是子流程的结束。 | [![1563204701765.jpg](https://s3.ax2x.com/2019/07/15/1563204701765.jpg)](https://free.imgsha.com/i/Q0SKD) |

##### 活动图例子

需求: 点开直播 -> 观看直播的动作

[![cdcf1ece24ce8cf2829939376955d829.jpg](https://s3.ax2x.com/2019/07/16/cdcf1ece24ce8cf2829939376955d829.jpg)](https://free.imgsha.com/i/jWuf8)

#### 状态图 (Statechart Diagram)

##### 概念

描述了某个对象的状态和感兴趣的事件以及对象响应该事件的行为。转换 (transition) 用标记有事件的箭头表示。状态（state）用圆角矩形表示。通常的做法会包含一个初始状态，当实例创建时，自动从初始状态转换到另外一个状态。

状态图显示了对象的生命周期：即对象经历的事件、对象的转换和对象在这些事件之间的状态。当然，状态图不必要描述所有的事件。

##### 构成元素

| 构成元素               | 说明                                                         | 表示符号                                                     |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 开始 (final)           | 表示成实心黑色圆点                                           | ![1563204607110.jpg](https://s3.ax2x.com/2019/07/15/1563204607110.jpg) |
| 结束 (Flow Final)      | 分为活动终止节点（activity final nodes）和流程终止节点（flow final nodes)。而流程终止节点表示是子流程的结束。 | ![1563204701765.jpg](https://s3.ax2x.com/2019/07/15/1563204701765.jpg) |
| 状态 (state)           | 某一时刻变化的记录                                           | [![1563205220353.jpg](https://s3.ax2x.com/2019/07/15/1563205220353.jpg)](https://free.imgsha.com/i/Q05iN) |
| 过渡 (Transition)      | 相当于 A 点走向 B 点的过渡                                   | [![1563205289524.jpg](https://s3.ax2x.com/2019/07/15/1563205289524.jpg)](https://free.imgsha.com/i/Q0VMX) |
| 同步 (synchronization) | 共同执行一个指令                                             | [![1563204447903.jpg](https://s3.ax2x.com/2019/07/15/1563204447903.jpg)](https://free.imgsha.com/i/Q0wdV) |

##### 状态图例子

需求: 这里直接借鉴 [Activity 官方状态图](https://developer.android.com/guide/components/activities/?hl=zh-CN#Lifecycle)

[![Activity-.jpg](https://s3.ax2x.com/2019/07/16/Activity-.jpg)](https://free.imgsha.com/i/jAPGk)



#### 交错纵横图 (Interaction overview Diagram)

##### 概念

用来表示多张图之间的关联

##### 构成元素

| 构成元素               | 说明                                                         | 表示符号                                                     |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 开始 (final)           | 表示成实心黑色圆点                                           | ![1563204607110.jpg](https://s3.ax2x.com/2019/07/15/1563204607110.jpg) |
| 结束 (Flow Final)      | 分为活动终止节点（activity final nodes）和流程终止节点（flow final nodes)。而流程终止节点表示是子流程的结束。 | ![1563204701765.jpg](https://s3.ax2x.com/2019/07/15/1563204701765.jpg) |
| 同步 (synchronization) | 共同执行一个指令                                             | [![1563204447903.jpg](https://s3.ax2x.com/2019/07/15/1563204447903.jpg)](https://free.imgsha.com/i/Q0wdV) |
| 判断 (Decision)        | 对某个事件进行判断                                           | ![1563204318945.jpg](https://s3.ax2x.com/2019/07/15/1563204318945.jpg) |
| 流 (Flow)              | 事件流的走向                                                 | 可以参考，开始跟结束                                         |

##### 交错纵横图例子

[![82ea391d3a841e9097d737c315be3879.png](https://s3.ax2x.com/2019/07/17/82ea391d3a841e9097d737c315be3879.png)](https://free.imgsha.com/i/jA7m5)

### 交互图

#### 组件图 (Component Diagram)

##### 概念

组件图(component diagram)是用来反映代码的[物理结构](https://baike.baidu.com/item/物理结构/9663422)。从组件图中，您可以了解各[软件组件](https://baike.baidu.com/item/软件组件/9817461)（如[源代码](https://baike.baidu.com/item/源代码/3814213)文件或动态链接库）之间的[编译器](https://baike.baidu.com/item/编译器/8853067)和运行时依赖关系。使用组件图可以将系统划分为[内聚](https://baike.baidu.com/item/内聚/9857344)组件并显示代码自身的结构

##### 构成元素

| 构成元素         | 说明                                                         | 表示符号                                                     |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 组件 (Component) | 组件用一个左侧带有突出两个小矩形的矩形来表示                 | ![35397ded31ae2f0576de21395a532b6c.jpg](https://s3.ax2x.com/2019/07/17/35397ded31ae2f0576de21395a532b6c.jpg) |
| 接口 (Interface) | 接口由一组操作组成，它指定了一个契约，这个契约必须由实现和使用这个接口的构件的所遵循 | ![1aa3560034ea28d1a9f621bb59d3cc5f.jpg](https://s3.ax2x.com/2019/07/17/1aa3560034ea28d1a9f621bb59d3cc5f.jpg) |

##### 组件图例子

[![810389027b2bc0e8a2bd6432147372a8.png](https://s3.ax2x.com/2019/07/17/810389027b2bc0e8a2bd6432147372a8.png)](https://free.imgsha.com/i/jA5H7)

#### 部署图 (Deployment Diagram)

##### 概念

部署图可以用于描述规范级别的架构，也可以描述实例级别的架构。这与类图和对象图有点类似，做系统集成很方便。

##### 构成元素

| 构成元素                 | 说明                                                         | 表示符号                                                     |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 节点 (node)              | 结点是存在与运行时的代表计算机资源的物理元素，可以是硬件也可以是运行其上的软件系统 | ![node.jpg](https://s3.ax2x.com/2019/07/17/node.jpg)         |
| 节点实例 (Node Instance) | 与结点的区别在于名称有下划线                                 | ![466029a462fe609fa554ddfe910c6050.jpg](https://s3.ax2x.com/2019/07/17/466029a462fe609fa554ddfe910c6050.jpg) |
| 物件(Artifact)           | 物件是软件开发过程中的产物，包括过程模型（比如用例图、设计图等等）、源代码、可执行程序、设计文档、测试报告、需求原型、用户手册等等。 | [![5adb2c458e0218a5094b76d8b0564101.jpg](https://s3.ax2x.com/2019/07/17/5adb2c458e0218a5094b76d8b0564101.jpg)](https://free.imgsha.com/i/jArG1) |



##### 部署图例子

[![617cd1f8a76331806f29f144ee9b5912.png](https://s3.ax2x.com/2019/07/17/617cd1f8a76331806f29f144ee9b5912.png)](https://free.imgsha.com/i/jA3bT)

### 经典例子

#### 微信支付时序图

![](https://pay.weixin.qq.com/wiki/doc/api/img/chapter7_4_1.png)



### 总结

只要掌握常用的几种图 (用例图、类图、时序图、活动图) ，就已经迈向架构第一步了，加油！



