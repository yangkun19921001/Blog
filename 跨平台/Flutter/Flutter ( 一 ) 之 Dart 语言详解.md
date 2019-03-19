# Dart 语言详解

## 变量 

### 变量的声明

1. var
2. dynamic
3. Object

- 声明一个未初始化的变量，变量的类型可以更改

  ```Dart
  //变量
  /// 三斜杠文档注释
  /// 返回类型 void 可以省略，省略后的返回值为 null
  
  void main(){
    ///----------------------- 变量的声明-----------------
    ///声明一个未初始化的变量，变量的类型可改变
    var data;
    data = "HelloWorld";
  
    dynamic data1;
    data1 = "HelloWorld1";
    data1 = 123;
  
    Object data2;
    data2 = 'HelloWorld2';
    data2 = 123;
    print([data,data1,data2]);
  }
  
  /// 打印效果
  lib/1-variables.dart:1: Warning: Interpreting this as package URI, 'package:flutter_test3/1-variables.dart'.
  [HelloWorld, 123, 123]
  
  ```

- 声明一个初始化的变量，变量类型不能再更改 

  ```dart
   var variablel =
        'HelloWorld'; //变量是一个引用，名字为 variablel 的变量引用了一个内容为‘HelloWorld’的 String 对象。
  //  variablel = 123; //变量初始化后，variablel 变量的类型被推断为String类型，其类型不能再改变
  ```

- dynamic 和 Object 声明的变量初始化后，变量的类型仍可改变

  ```dart
  dynamic variable2 = "HelloWorld";
    variable2 = 123;
  //  variable2.test();//调用不存在的test()方法，编译通过，运行报异常。编译阶段不检查类型
  
    Object variable3 = 'HelloWorld';
    variable3 = 123;
  //  variable3.test();//调用不存在的test()方法，编译不通过。编译阶段检查类型
  ```

- 使用确定类型显示声明变量，变量的类型不能再改变

  ```dart
  String name3 = "HelloWorld";
  //  name3 =123; //变量的类型不能更改
  ```

#### 变量声明总结

1. var: 如果没有初始值，可以变成任何类型

2. dynamic:动态任意类型，编译阶段不检查类型

3. Object 动态任意类型，编译阶段检查类型

   区别：

   1. 唯一区别 var 如果有初始值，类型被是锁定

### 默认值

- 没有初始化的变量默认值都是null

  一切皆对象，对象的默认值是null

  ```dart
  bool isEmpty;
  print((isEmpty == null));
  ```

###  final 和 const

- 被 final 或者 const 修饰的变量，变量类型可以省略

  ```dart
   final FVariablel = "HelloWorld";
  //  final  String FVariablel = "HelloWorld";
  
    const cVariablel = "HelloWorld";
  //  const String cVariablel = "HelloWorld";
  ```

- 被 final 或 const 修饰的变量无法再去修改其值。

  ```dart
  //   fVariable1 = '123';
  //   cVariable1 = '123456';
  ```

- 如果是类级别常量，使用 static, const 。

  ```dart
  DateTime; //可参照DateTime static const int monday = 1;
  ```

- const 可以使用其他 const 常量的值来初始化其值.

  ```dart
  const width = 100;
  const height = 100;
  const square = width * height;
  ```

- const 赋值申明可省略

  ```dart
  const List clist = [1, 2, 3];
  //  const List clist = const [1, 2, 3];//dart 2之前，const赋值必须用const声明
  print("\n\n\n");
  print(clist);
  ```

- 可以更改非 final,非 const 变量的值，即使它曾经具有 const 值

  ```dart
  var varList = const [1, 2, 3];
    final finalList = const [1, 2, 3];
    const constList = [1, 2, 3];
    print([varList, finalList, constList]);
    varList = [1];
  //  constList[1];
  //  finalList[1];
    print("\n\n");
    print([varList, finalList, constList]);
  
  	打印效果--
    /***
     * [[1, 2, 3], [1, 2, 3], [1, 2, 3]]
     * [[1], [1, 2, 3], [1, 2, 3]]
     */
  
  ```

- const 导致的不可变性是可传递的

  ```dart
  final List ls = [1, 2, 3];
    ls[2] = 444;
    print(ls);
    const List cLs = [4, 5, 6];
  //  cLs[1] = 4;
    print("\n");
    print(ls);
  
  报错：
        /***
     * Unhandled exception:
        Unsupported operation: Cannot modify an unmodifiable list
        #0      UnmodifiableListBase.[]= (dart:_internal/list.dart:90:5)
        #1      main (package:flutter_test3/1-variables.dart:103:6)
     */
  ```

- 相同的 const 常量不会在内存中重复创建

  ```dart
  final finalList1 = [1, 2, 3];
  final finalList2 = [4, 5, 6];
  print("\n");
  print(identical(finalList1, finalList2)); //identical用于检查两个引用是否指向同一个对象
  
  const constList1 = [1, 2];
  const constList2 = [1, 2];
  print("\n");
  print(identical(constList1, constList2)); //identical用于检查两个引用是否指向同一个对象
  ```

- const 需要是编译时常量

  ```dart
  final DateTime finalDateTime = DateTime.now();
  //    const DateTime constDateTime = DateTime.now();//DateTime.now() 是运行期计算出来的值
    const sum = 1 + 2; //使用内置数据类型的字面量通过基本运算得到的值
    const aConstNum = 0;
    const aConstBool = true;
    const aConstString = 'a constant string';
    const aConstNull = null;
    const validConstString =
        '$aConstNum, $aConstBool, $aConstString, $aConstNull';
    print(validConstString); //使用计算结果为null或数字，字符串或布尔值的编译时常量的插值表达式
  ```

#### final 和 const 总结

共同点

- 声明的类型可省略
- 初始化后不能再赋值
- 不能和 var 同时使用

区别（需要注意的地方）

- 类级别常量，使用 static ，const 。
- const 可使用其他 const 常量的值来初始化其值
- const 可使用其他 const 常量的值来初始化其值
- 可以更改非 final、非 const 变量的值，即使曾经具有 const 值
- const 导致的不可变性是可传递的
- 相同的 const 常量不会在内存中重复创建
- const 需要是编译时常量

## 内置类型

### Number 数值(num,int,double)

```dart
int i = 1; //整数型
double d = 1.0 ;//double b4-bit(双精度)浮点数
int bitLength = i.bitLength;
print('bitLength:${bitLength}'); //bitLength 判断 int 值需要多少位 bit 位。
double maxFinite = double.maxFinite;
print('maxFinite: ${maxFinite}'); //maxFinitedouble的最大值
//int和double都是num的子类
num n1 = 1;
num n2 = 1.0;
//支持 十进制、十六进制
int il = oxfff;
//科学计数法
double dl = 1.2e2; //120.0
//转换
//String > int
int i2 = int.pasrse('1');
double d2 = 1;//当 double 的值为 int 值时，int 自动转为 double
print('d2：${d2}');
int i2 = int.try.parse('1.0');//返回 null

//int > String
int is = 123;
String s = 123.toString;

```

### String 字符串

### Booleans 布尔值  (bool)

### List 列表(数组 List)

### Maps 键值对集合 (Map)

### Set 集合 (Set)

### Runes 符号字符

### Symbols 标识符



