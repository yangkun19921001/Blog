# Dart 语言详解

[Dart 官网](https://www.dartlang.org/guides/language)

## 变量

### 变量的声明

1. var
2. dynamic
3. Object
4. 声明一个未初始化的变量，变量的类型可以更改

   ```dart
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

5. 声明一个初始化的变量，变量类型不能再更改

   ```dart
    var variablel =
         'HelloWorld'; //变量是一个引用，名字为 variablel 的变量引用了一个内容为‘HelloWorld’的 String 对象。
   //  variablel = 123; //变量初始化后，variablel 变量的类型被推断为String类型，其类型不能再改变
   ```

6. dynamic 和 Object 声明的变量初始化后，变量的类型仍可改变

   ```dart
   dynamic variable2 = "HelloWorld";
     variable2 = 123;
   //  variable2.test();//调用不存在的test()方法，编译通过，运行报异常。编译阶段不检查类型

     Object variable3 = 'HelloWorld';
     variable3 = 123;
   //  variable3.test();//调用不存在的test()方法，编译不通过。编译阶段检查类型
   ```

7. 使用确定类型显示声明变量，变量的类型不能再改变

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

* 没有初始化的变量默认值都是null

  一切皆对象，对象的默认值是null

  ```dart
  bool isEmpty;
  print((isEmpty == null));
  ```

### final 和 const

* 被 final 或者 const 修饰的变量，变量类型可以省略

  ```dart
   final FVariablel = "HelloWorld";
  //  final  String FVariablel = "HelloWorld";

    const cVariablel = "HelloWorld";
  //  const String cVariablel = "HelloWorld";
  ```

* 被 final 或 const 修饰的变量无法再去修改其值。

  ```dart
  //   fVariable1 = '123';
  //   cVariable1 = '123456';
  ```

* 如果是类级别常量，使用 static, const 。

  ```dart
  DateTime; //可参照DateTime static const int monday = 1;
  ```

* const 可以使用其他 const 常量的值来初始化其值.

  ```dart
  const width = 100;
  const height = 100;
  const square = width * height;
  ```

* const 赋值申明可省略

  ```dart
  const List clist = [1, 2, 3];
  //  const List clist = const [1, 2, 3];//dart 2之前，const赋值必须用const声明
  print("\n\n\n");
  print(clist);
  ```

* 可以更改非 final,非 const 变量的值，即使它曾经具有 const 值

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

* const 导致的不可变性是可传递的

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

* 相同的 const 常量不会在内存中重复创建

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

* const 需要是编译时常量

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

* 声明的类型可省略
* 初始化后不能再赋值
* 不能和 var 同时使用

区别（需要注意的地方）

* 类级别常量，使用 static ，const 。
* const 可使用其他 const 常量的值来初始化其值
* const 可使用其他 const 常量的值来初始化其值
* 可以更改非 final、非 const 变量的值，即使曾经具有 const 值
* const 导致的不可变性是可传递的
* 相同的 const 常量不会在内存中重复创建
* const 需要是编译时常量

## 内置类型

### Number 数值\(num,int,double\)

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

```dart
//Dart 字符串是 UTF-16 编码的字符序列，可以使用单引号或者双引号来创建字符串
var name = 'HelloWorld';
//可以在字符串中使用表达式： ${expression},如果表达式是一个标识符，可以省略 {}。 如果表达式的结果为一个对象，则 Dart 会调用对象的 toString() 函数来获取一个字符串
var names = 'HelloWorld ${name}';
//r 前缀可以创建一个 “原始 raw” 字符串
var rawNames = r"HelloWorld ${name}";
print('name:${names}');
print('rawNames :${rawNames}');
//如果表达式的结果为一个对象，则 Dart 会调用对象的 toString() 函数来获取一个字符串。
pint(Map);
//可以使用三个单引号或者双引号也可以 创建多行字符串对象
var multiLinesString = '''
Java Android
Flutter''';
pint('mutiLinesString:${mutiLinesString}');

/// StringBuffer
var sb = StringBuffer(); //dart 2 可以省略 new
sb..write('aaa')..write('bbb')..write('ccc');//..级联符实现链式调用
sb.writeAll([aaa,bbb,ccc],',');//第二个参数表示分隔符，将第一个参数列表里的数据用这个分隔符拼接起来
pint('sb:${sb}');
```

### Booleans 布尔值  \(bool\)

```dart
//bool :true 和 false
bool isNull;
print('isNull: ${isNull}');
```

### List 列表\(数组 List\)

```dart
//声明一个自动长度的数组
List growableList = new List();
//List growbleList = new List()..length = 3;
growbleList..add(1)..add(2)..add('HelloWorld');
pint('growbleList: ${growbleList}');

//声明一个固定长度的数组
var list = List(6);// 这里可以用 var 声明，也可以用 List
list[0] = "Java";
list[1] = "Android";
list[2] = "Dart";
list[3] = "Flutter";
list[4] = "C++";
list[5] = "C"
pint('list:${list}');

//元素固定类型
var typeList = List<String>;
typeList..add("1")..add("2")..add("3");
pint('typeList:${typeList}');

//常用属性-获取第一个元素
String first = typeList.fisrt;
pint('typeList.fisrt:$typeFirst');
//最后一个元素
String last = typeList.last;
pint('typeList.last:${last}');
//元素个数
int typeListLength = typeList.length;
pint('typeListLength:${typeListLength}');
//元素是否为空
bool isEmpty = typeList.isEmpty;
pint('typeList.isEmpty:${isEmpty}');
//元素是否不为空
bool isNotEmpty = typeList.isNotEmpty;
pint('typeList.isNotEmpty:${isNotEmpty}');
//数组倒序
Iterable reversed = typeList.reversed;
print('typeList.reversed:${reversed}');

// 常用方法 增删改查，排序，洗牌，复制子列表
var list4 = [];
//增
list4.add(1);
pint('add 1:${list4}');
list4.addAll([2,3,4]);
print('addAll[2,3,4]:${list4}');
list4.insert(0,0);
print('insert(0,0) : ${list4}');
list4.insertAll(1,[5,6,7,8]);
print('insertAll(1,[5,6,7,8]) :${list4}');
//删除
list4.remove(5);
print('remove 5 :${list4}');
list4.removeAt(2);
print('remove at 0:${list4}');
//改
list4[4] = 5;
print('updata list4[4] to 5 :${list4}');
//range
list4.fillRange(0,3,9);
print('fillRange updata list4[0] - list[2] to 9 :$list4');
Iterable getRange = list4.getRange(0,3);
print('getRange list4[0]-list[2]:${getRange}');
//查
var contains = list.contains(5);
print('contains 5 :${contains}');
var indexOf = list4.indexOf(1);
print('list4 indexOf 1 :${indexOf}');
int indexWhere = list4.indexWhere((test) => test == 5);
print('list4 indexWhere 5 :${indexWhere}');
// 排序
list4.sort();
print('list4 sort:${list4}');
//洗牌
list4.shuffle();
print('list4 shuffle:${list4}');
//复制子列表
var list5 = list4.shulist(1);
print('sublist(1) list5: ${list5}');
//操作符
var list6 =[8,9];
print('list6:${list6}');
var list7 = list5 + list7;
print('list5 + list6:${list7}');
```

### Maps 键值对集合 \(Map\)

```dart
//声明一个动态类型的 Map
var dynamicMap = Map();
dynamicMap['name'] = 'HelloWorld';
dynamicMap[1] = 'android';
print('dynamicMap :${dymaicMap}');
//强类型
var map = Map<int,String>();
map[1] = 'java';
map[2] = 'Android';
print('map :${map}');
//也可以这样声明
var map1 = {'name':'Java',1:'android'};
map1.addAll({'name','Flutter'});
print('map1:${map1}');
  //常用属性
//  print(map.isEmpty); //是否为空
//  print(map.isNotEmpty); //是否不为空
//  print(map.length); //键值对个数
//  print(map.keys); //key 集合
//  print(map.values); //value集合
```

### Set 集合 \(Set\)

```dart
// Set 无重复列表
var dynamicSet = Set();
dynamicSet.add('java');
dynamicSet.add('Android');
dynamicSet.add('Flutter');
dynamicSet.add('C/C++');
dynamicSet.add('1');
dynamicSet.add('1');
print('dynamicSet :${dynamicSet}');

//常用属性与 List 类似
//常用方法 增删改查与 List 类似
var set1 = {'java','Android'};
print('set1: ${set1}');
var differencel2 = set1.difference(set2);
var difference21 = set1.difference(set1);
print('set1 difference set2 :${differencel2}');//返回 set1 集合里有但 set2 里没有的元素集合
print('set2 difference set1 :${difference2l}');//返回 set2 集合里面有但 set1 里没有的元素集合
var intersection = set1.intersection(set2);
print('set1 set2 交集 :${intersection}');//返回 set1 和 set2 的交集
var union = set1.union(set2);
print('set2 set1并集：${union}');
set2.retainAll(['java','Android']);//只保留（要保留的元素要在原 set 中存在）
print('set2 只保留 java Android :${set2}');
```

### Runes 符号字符

```dart
//Runes用于在字符串中表示Unicode字符 //https://copychar.cc/emoji/
String runesStr = '👄';
print(runesStr);
print(runesStr.length); //表示占 2 个 16 位字符
print(runesStr.runes.length); //表示占 1 个 32 位字符

Runes runes = new Runes('\u{1f605} \u6211');
var str1 = String.fromCharCodes(runes); //使用String.fromCharCodes显示字符图形
print(str1);
String str2 = '\u{1f605} \u6211'; //如果非4个数值，需要把编码值放到大括号中
print(str2)
```

### Symbols 标识符

```dart
//Symbol标识符 主要是反射用，现在mirrors已经被移除了
```

## 函数

### 定义

* 可在函数内定义

  ```dart
  void main(){
      int add(int x,int y){
          return x + y;
      }

      print(add(1,2));
  }
  ```

* 定义函数时可省略类型

  ```dart
  void main(){
      add( x, y){ //不建议省略
          return x + y;
      }
      print(add(3,4));
  }
  ```

* 支持缩写语法 =&gt;

  ```dart
  void main(){
      int add2(int x,int y) => x + y;
      /// 等同于
      int add3(int x，int y){
          return x + y;
      }
       print(add2(3,4));
       print(add3(3,4));
  }
  ```

### 可选参数

* 可选命名参数，使用 {param1,param2,...} 的形式来指定命名参数

  ```dart
  void main(){
      int add3({int x,int y,int z}){
          x ?? = 1;
          x ?? = 2;
          x ?? = 3;
          return x + y + z;
      }
      print(add3());
  }
  ```

* 可选位置参数，把可选参数放在 \[ \] 中，必填参数要放在可循参数前面

  ```dart
  void main(){
      int add(int x,[int y ,int z]){
          y ?? = 2;
          z ?? = 3;
          return x + y + z;
      }   
      print(add(1));
  }
  ```

* 可选命名参数默认值\(默认值必须是编译时常量\)，目前可使用等号 ‘=’ 或 ‘:’,Dart SDK 1.21 之前只能用冒号，冒号的支持以后会移除，所以建议使用等号

  ```dart
  void main(){
      int add5(int x,[int y =2,int z = 3]){
          return x + y +z;
      }
      //前面的必填参数没有名字
      print(add(5,y:10,z:20));
  }

  //可选位置参数默认值(默认值必须是编译时常量)，只能使用等号 “=”
  void mian (){
      int add6(int x,[int y = 2,int z = 3]){
          return x + y + z;
      }

      print(add6(1));
  }

  //使用 list 或者 map 作为默认值，但必须是 const
  void func({List list = const [1,2,3],Map map = const {1:1,'fun' :'全栈'}}){
      //TODO ----
  }
  ```

### 匿名函数

* 可赋值给变量，通过变量调用

  ```dart
  //无参匿名函数
  var anonFunc1 = () => print('无参匿名函数');
  anonFunction();

  //有参匿名函数
  var anonFunc = (name) => 'I am ${name}';
  print(anonFunc('DevYK'));

  //通过（）调用，不推荐
  (() => print('不推荐'))();
  ```

* 可在其他函数中直接调用或传递给其他函数

  \`\`\`dart void main\(\){ List test\(List list,String func\(str\)\){ for\(var i =0;i &lt; list.length;i++\){ list\[i\] = func\(list\[i\]\); } return list; }

  ```text
  var list = ['a','b','c','d','e'];
  print(test(list,(str) => str * 2)); // String * int ,Dart 和 Py 可以这样用。
  ```

```text
//List.forEach()就用的匿名函数
List list1 = [11, 12, 13];
list1.forEach((item) => print('$item'));
```

}

```text
### 闭包

- 返回 Function 对象（闭包）

  ```dart
  void main(){
      Function makeAddFunc(int x){
          x++;
          return (int y) => x + y;
      }
      var addFunc = makeAddFunc(2);
      print(addFunc(3));
  }
```

### 函数别名

* 可以指向任何同签名的函数

  ```dart
  void main(){
      MyFunc myFunc;
      myFunc = subtsract;
      myFunc(4,2);
      myFunc = divide;
      myFunc(4,2);
      //typeDef 作为参数传递给参数
      calculator(4,2,subtsract);
  }

  //函数别名
  typedef MyFunc(int a,int b);
  //根据 MyFunc 相同的函数签名定义两个函数
  subtsract(int a,int b){
      print('subtsract: ${a-b}');
  }
  divide(int a,int b){
      print('divide: ${a / b}');
  }
  //typedef 也可以作为参数传递给函数
  calculator(int a,int b,MyFunc func){
      func(a,b);
  }
  ```

## 操作符

### 后缀操作

* 条件成员访问 和 . 类似，但是左边的操作对象不能为 null，例如 foo?.bar 如果 foo 为 null 则返回 null，否则返回 bar 成员。

  ```dart
  String a;
  print(a?.length);
  ```

### 取商操作符

* 被除数 ÷ 除数 = 商 ... 余数，A ~/ B = C，这个C就是商。相当于Java里的 /

  ```dart
  print(2 / 3);
  print(2 ~/ 3);
  ```

### 类型判定操作符

* as、is、is! 在运行时判定对象类型

  ```dart
  void main(){
      //as 类型转换
  num iNum = 1;
  num dNum = 1.0;
  int i = iNum as int;
  double d = dNum as double;
  print([i,d]);

  // is 如果对象是指定的类型返回 true
  print(iNum is int);
  Child child;
  Child childl = new Child();
  print(child is Parent);//child is Null
  print(childl is Parent);

  // is! 如果对象是制定的类型返回 False
  print(iNum is! int);
  }
  class Parent {}
  class Child extends Parent {}
  ```

### 条件表达式

* 三目运算符 condition ? expr1 : expr2

  ```dart
  bool isFinish = true;
  String textVal = isFinish ？'yes':'no';
  // expr1 ?? expr2，如果 expr1 是 non-null，返回其值； 否则执行 expr2 并返回其结果。
  bool isPaused;
  isPaused = isPaused ?? false;
  //或者
  isPaused ??= false;
  ```

### 级联操作符

* .. 可以在同一个对象上 连续调用多个函数以及访问成员变量。 严格来说， 两个点的级联语法不是一个操作符。 只是一个 Dart 特殊语法。

  ```dart
  StringBuffer sb = new StringBuffer();
   sb
    ..write('Java')
    ..write('Android')
    ..write('\n')
    ..writeln('DevYK');
  ```

## 流程控制语句

### if  else

### for , forEach , for-in

* forEach

  ```dart
  collection.forEach(item) => print('forEach: ${item}');
  ```

* for-in

  ```dart
    for (var item in collection) {
      print('for-in: $item');
    }
  ```

### while , do   、while

### break，continue

### whitch case

