# Dart 语言详解（二）

## 异常

### Exception 类型

- 延迟加载异常: DeferredLoadException

- 格式异常       : FormatException

- 整数除零异常: IntegerDivisionByZeroException

- IO 异常          : IOException

- 隔离产生异常:  IsolateSpawnException

- 超时异常       : TimeoutException

  

  ```Dart
  /// 部分异常参考 跟 Java 类型的异常都大同小异
  main() {
    /// ---------------------------------异常的抛出throw--------------------------------
    //抛出Exception对象
  //  throw new FormatException('格式异常');
  
    //抛出Error对象
  //  throw new NullThrownError();
  
    //抛出任意非null对象
  //  throw '这是一个异常';
  
    /// ---------------------------------异常的捕获try catch--------------------------------
    try {
  
      throw new NullThrownError();
  //    throw new OutOfMemoryError();
    } on OutOfMemoryError {
      //on 指定异常类型
      print('没有内存了');
  //    rethrow; //把捕获的异常给 重新抛出
    } on Error {
      //捕获Error类型
      print('Unknown error catched');
    } on Exception catch (e) {
      //捕获Exception类型
      print('Unknown exception catched');
    } catch (e, s) {
      //catch() 可以带有一个或者两个参数， 第一个参数为抛出的异常对象， 第二个为StackTrace对象堆栈信息
      print(e);
      print(s);
    }
  }
  ```

  

### Error 类型

- 抽象类实例化错误 :  AbstractClassInstantiationError

- 参数错误               :  ArgumentError

- 断言错误               :  AssertionError

- 异步错误               :  AsyncError

- Cast 错误              :  CastError

- 并发修改错误        :  ConcurrentModificationError

- 周期初始错误        :  CyclicInitializationError

- Fall Through 错误 :  FallThroughError

- json 不支持错误    :  JsonUnsupportedObjectError

- 没有这个方法错误 :  NoSuchMethodError

- Null 错误               :  NullThrownError

- 内存溢出错误        :  OutOfMemoryError

- 远程错误               :  RemoteError

- 堆栈溢出错误        :  StackOverflowError

- 状态错误               :  StateError

- 未实现的错误        :  UnimplementedError

- 不支持错误            :  UnsupportedError

  

##  类 

### 构造函数

- 普通构造函数(Java / Dart 比较 )

  ```Dart
  void main（）{
       //普通构造函数
    var p = new Point(1, 1); //new 可省略 var point = Point(1, 2);
    print(p);
  //  print(p.runtimeType); //可以使用Object类的runtimeType属性,获取对象的类型
  }
  
  class Point {
    num x;
    num y;
      
    //普通构造函数 Java 形式
  //  Point(num x, num y){
  //    this.x = x;
  //    this.y = y;
  //  }
      
    //简化构造 Dart 形式
  //  Point(this.x, this.y);
  
  
    @override
    String toString() {
      // TODO: implement toString
      return 'Point(x = $x, y = $y)';
    }
  }
  
  ```

- 命名构造函数

  ```dart
  void main(){
        /// 命名构造函数
   var p =  Point.fromJson({'x':2,'y':3});
    print(p);
  }
  
  /// 创建一个 Point 类
  class Point {
    num x;
    num y;
  
    //命名构造函数
    Point.fromJson(Map json){
      x = json['x'];
      y = json['y'];
    }
  
    @override
    String toString() {
      return 'Point{x: $x, y: $y}';
    }
  }
  ```

- 重定向构造函数

  ```Dart
  void main(){
    Point  p = Point.alongXAxis(2);
    print(p);
  }
  
  class Point {
    num x;
    num y;
  
    //简化构造
    Point(this.x, this.y);
  
    //重定向构造函数，使用冒号调用其它构造函数
    Point.alongXAxis(num x) : this(x, 0);
  
    @override
    String toString() {
      return 'Point{x: $x, y: $y}';
    }
  }
  ```

- 初始化列表

  ```Dart
  void  main(){
      var p = Point(3,3);
      print(p);
      
      /// 打印结果：Point{x: 3, y: 3,distanceFromOrigin:3.0}
  }
  
  /// 创建一个 Point 类
  class Point {
    num x;
    num y;
    var distanceFromOrigin;
  
    //初始化列表  这里的 sqrt 开方需要导包 import 'dart:math';
    Point(this.x,this.y) : distanceFromOrigin = sqrt(x*y);
  
    @override
    String toString() {
      return 'Point{x: $x, y: $y,distanceFromOrigin:${distanceFromOrigin}';
    }
  }
  ```

- 调用超类构造函数

  ```Dart
  void main(){
   var child =  Child.fromJson(5, 5);
   var child2 =  Child(5,6);
   print('child: ${child} ,child2: ${child2}');
      
   //打印结果,由此可见跟 Java 一样 父类方法先执行。
   ///超类命名构造函数
   ///子类命名构造函数
   ///超类命名构造函数
  }
  
  ///创建一个父类
  class Parent{
    num x;
    num y;
    
    Parent.fromJson(x,y):x = x,y = y{
      print('超类命名构造函数');
    }
  }
  
  ///创建一个子类
  class Child extends Parent{
    num x;
    num y;
  
  /*  //如果超类没有默认构造函数， 则你需要手动的调用超类的其他构造函数
    Child.fromJson(x, y) : super.fromJson(x, y){
      //调用超类构造函数的参数无法访问 this
      print('子类构造函数');
    }*/
      
    Child(this.x,this.y) : super.fromJson(x, y);
  
    //在构造函数的初始化列表中使用 super()，需要把它放到最后
    Child.fromJson(x,y) : x = x,y = y,super.fromJson(x,y){
      print('子类命名构造函数');
    } 
  }
  ```

- 常量构造函数

  ```dart
  /// 注意：同一个对象如果定义为常量对象的话，那么存在内存中的地址是相同的
  void main(){
    var p2 = const Point2(6, 8);
    print(p2);
  
    var p21 =  Point2(4, 4); //创建的是非 常量对象
    var p22 = const Point2(4, 4);
    print(identical(p22, p21));
    print(identical(p2, p22));
  }
  
  ///创建一个常量的构造函数
  class Point2 {
    //定义 const 构造函数要确保所有实例变量都是final
    final num x;
    final num y;
    static final Point2 origin = const Point2(0, 0);
  
    //const 关键字放在构造函数名称之前，不能有函数体
    const Point2(this.x, this.y);
  
    @override
    String toString() {
      return 'Point2{x: $x, y: $y}';
    }
  }
  ```

- 工厂构造函数

  ```Dart
  void main(){
    /// 工厂方法构造函数
    var singletonl = Singleton('Java');
    var singletonl2 = Singleton('Flutter');
    print(identical(singletonl, singletonl2));
  }
  
  ///创建一个工厂模式的类
  ///第一种方试
  class Singleton{
    String name;
    //工厂构造函数无法访问 this.所以这里要静态的
    static Singleton _cache;
    factory Singleton([String name = 'singleton']){
      if(_cache == null){
        _cache = Singleton._newObject(name);
      }
      return _cache;
    }
  
    Singleton._newObject(this.name);
  }
  
  /// 第二种方式
  class Singleton{
      String name;
      static Singleton _cache;
      
      factory Singleton([String name = 'singleton']) => _cache ?== Singleton._newObject(name);
      
    	Singleton._newObject(this.name);
  }
  
  ```

- 工厂模式两种方式

  - 创建顶级函数

    ```dart
    void main(){
      var footMassage = new Massage('foot');
      footMassage.doMassage();
      var bodyMassage = new Massage('body');
      bodyMassage.doMassage();
      var specialMassage = new Massage('%#@##@##');
      specialMassage.doMassage();
        
      //打印：
      //脚底按摩
      //全身按摩
      //特殊按摩
    }
    
    /工厂模式
    abstract class Massage {
      factory Massage(String type) {
        switch (type) {
          case 'foot':
            return new FootMassage();
          case 'body':
            return new BodyMassage();
          default:
            return new SpecialMassage();
        }
      }
    
      void doMassage();
    }
    
    class FootMassage implements Massage {
      @override
      doMassage() {
        print('脚底按摩');
      }
    }
    
    class BodyMassage implements Massage {
      @override
      void doMassage() {
        print('全身按摩');
      }
    }
    
    class SpecialMassage implements Massage {
      @override
      void doMassage() {
        print('特殊按摩');
      }
    }
    
    ```

  - 创建工厂构造函数

    ```Dart
    void main(){
      ///创建顶级函数
      var footMassage = massageFactory('foot');
      footMassage.doMassage();
    }
    
    //工厂函数
    class Massage {
      void doMassage() {
        print('按摩');
      }
    }
    /**
     * 创建顶级工厂模式
     */
    Massage massageFactory(String type) {
      switch (type) {
        case 'foot':
          return FootMassage();
        case 'body':
          return BodyMassage();
        default:
          return SpecialMassage();
      }
    }
    
    class FootMassage extends Massage {
      @override
      doMassage() {
        print('脚底按摩');
      }
    }
    
    class BodyMassage extends Massage {
      @override
      void doMassage() {
        print('全身按摩');
      }
    }
    
    class SpecialMassage extends Massage {
      @override
      void doMassage() {
        print('特殊按摩');
      }
    }
    ```

- set,get

  ```Dart
  void main(){
    ///set get
    var rect = new Rectangle(1, 1, 10, 10);
    print(rect.left);
    rect.right = 12;
    print(rect.left);
    rect.buttom = 11;
    print(rect.top);
      
    ///打印效果
    /// 1,2,1 
  }
  
  /**
   * setter getter
   * 每个实例变量都隐含的具有一个 getter， 如果变量不是 final 的则还有一个 setter
   * 可以通过实行 getter 和 setter 来创建新的属性， 使用 get 和 set 关键字定义 getter 和 	
   * setter
   */
  class Rectangle {
    num left;
    num top;
    num width;
    num height;
  
    //声明构造方法
    Rectangle(this.left, this.top, this.width, this.height);
  
    // getter 和 setter 的好处是，可以开始使用实例变量，
    // 后面可以把实例变量用函数包裹起来，
    // 而调用你代码的地方不需要修改。
    //获取 right
    num get right => left + width;
  
    //set right
    set right(num value) => left = value - width;
  
    //获取 button
    num get button => top + height;
  
    //set button
    set buttom(num value) => top = value - height;
  }
  ```

- 可调用类

  ```Dart
  void main(){
    var cf = new ClassFunction();
    var out = cf("Java"," Android"," Flutter");
    print('$out'); // Hi there, gang!
    print(cf.runtimeType); // ClassFunction
    print(out.runtimeType); // String
    print(cf is Function); // true
  }
  
  /**创建一个可调用的类*/
  class ClassFunction {
    call(String a, String b, String c) => '$a $b $c';
  }
  ```

- 重载

  ```Dart
  void main(){
    final v1 = Vector(2, 3);
    final v2 = Vector(2, 2);
    final r1 = v1 + v2;
    final r2 = v1 - v2;
    print([r1.x, r1.y]);
    print([r2.x, r2.y]);
  }
  
  //重载操作类
  class Vector{
    final int x;
    final int y;
  
    const Vector(this.x,this.y);
  
    //重载+
    Vector operator + (Vector v){
      return Vector(x+v.x, y+v.y);
    }
    //重载-
    Vector operator -(Vector v) {
      return new Vector(x - v.x, y - v.y);
    }
  }
  ```

## Mixin

- 图

  ![1553157226(1).jpg](http://pntnlt1wq.bkt.clouddn.com/1553157226(1).jpg)

- 代码

  ```Dart
  void main() {
    Bicycle().transport();
    Motorcycle().transport();
    Car().transport();
    //四轮木制脚踏车
    WoodenCar().transport();
      
    /// 打印内容
    自行车:
    动力组件: 两个轮子 , 安全指数： low , 动力来源：全靠腿登
    摩托车:
    动力组件: 两个轮子 , 安全指数： low , 动力来源：汽油
    汽车:
    动力组件: 四个轮子 , 安全指数： middle , 动力来源：汽油
    四轮木制脚踏车:
    动力组件: 四个轮子 ， 安全指数： middle ， 动力来源：汽油
  }
  
  
  //交通工具类，拥有运输功能
  abstract class Transportation {
    //运输功能
    void transport();
  }
  
  //双轮交通工具
  class TwoWheelTransportation {
    String powerUnit() => "两个轮子";
  }
  
  //四轮交通工具，一般来说安全性能为中
  class FourWheelTransportation {
    String powerUnit() => "四个轮子";
  }
  
  //安全指数中等的交通工具
  class MiddleSafetyIndex {
    String safetyIndex() => "middle";
  }
  
  //安全指数低的交通工具
  class LowSafetyIndex {
    String safetyIndex() => "low";
  }
  
  //人力发动机
  class BodyEnergyTransportation {
    String energy() => "全靠腿登";
  }
  
  //汽油能源交通工具
  class GasolineEnergyTransportation {
    String energy() => "汽油";
  }
  
  //自行车
  class Bicycle extends Transportation
      with TwoWheelTransportation, LowSafetyIndex, BodyEnergyTransportation {
    @override
    void transport() {
      print(
          "自行车:\n动力组件: ${powerUnit()} , 安全指数： ${safetyIndex()} , 动力来源：${energy()}");
    }
  }
  
  //摩托车
  class Motorcycle extends Transportation
      with TwoWheelTransportation, LowSafetyIndex, GasolineEnergyTransportation {
    @override
    void transport() {
      print(
          "摩托车:\n动力组件: ${powerUnit()} , 安全指数： ${safetyIndex()} , 动力来源：${energy()}");
    }
  }
  
  //汽车
  class Car extends Transportation
      with
          FourWheelTransportation,
          MiddleSafetyIndex,
          GasolineEnergyTransportation {
    @override
    void transport() {
      print(
          "汽车:\n动力组件: ${powerUnit()} , 安全指数： ${safetyIndex()} , 动力来源：${energy()}");
    }
  }
  
  //四轮木制脚踏车
  class WoodenCar extends Car
  {
    @override
    void transport() {
      print(
          "四轮木制脚踏车:\n动力组件: ${powerUnit()} ， 安全指数： ${safetyIndex()} ， 动力来源：${energy()}");
    }
  }
  
  
  ```

- 总结

  注意 extends ，with 顺序问题：

  1. 如果 2 个或多个超类拥有相同签名的 A 方法，那么子类会以继承的最后一个超类中的 A 方法为准。
  2. 当然这是子类没有重写 A 方法的前提下，如果子类自己重写了 A 方法则以本身的 A 方法为准。

  代码演示：

  ```dart
  void main(){
    var ab = AB();
    var ba = BA();
    var c = C();
    var cc = CC();
  
    print(ab.getMessage());
    print(ba.getMessage());
    print(c.getMessage());
    print(cc.getMessage());
    
      
    ///打印 B,A,C,B
  }
  
  class A {
    String getMessage() => 'A';
  }
  
  class B {
    String getMessage() => 'B';
  }
  
  class P {
    String getMessage() => 'P';
  }
  
  class AB extends P with A, B {}
  
  class BA extends P with B, A {}
  
  class C extends P with B, A {
    String getMessage() => 'C'; //优先级最高的是在具体类中的方法。
  }
  
  class CC extends P with B implements A {
  } //这里的 implement 只是表明要实现 A 的方法，这个时候具体实现是再 B 中 mixin 了具体实现
  ```



## 泛型

- 容器类型的泛型，使用方式跟 Java 一样。

  ```Dart
  void main(){
    ///使用泛型，很多的容器对象，在创建对象时都可以定义泛型类型,跟Java 一样
    var list = List<String>();
    list.add('1');
    list.add('2');
    list.add('4');
    print(list);
  
    /// Map 泛型 跟 Java 也都是一样
    var map = Map<int, String>();
    map[0] = '23';
    map[55] = '33';
    print(map);
  }
  ```

- 泛型函数

  ```Dart
  void main(){
     //泛型函数
    K addCache<K, V>(K key, V value) {
      K temp = key;
      print('key:$key ,value: $value');
      return temp;
    }
  
    var key  = addCache(5, '5');
    print(key);
    print(key.runtimeType);
  }
  ```

- 构造函数泛型

  ```dart
  void main(){
    //构造函数泛型
    var p = Phone<String>('Flutter');
    print(p.text);
  }
  
  class Phone<T> {
    final T text;
    Phone(this.text);
  }
  ```

- 泛型限制

  ```dart
  void main(){
    //泛型限制， 通过 extends 关键字限定可泛型使用的类型
    var footMassage = FootMassage();
    var m = Massage<FootMassage>(footMassage);
    m.massage.doMassage();
  }
  
  //泛型限制
  class Massage<T extends FootMassage > {
    final T massage;
    Massage(this.massage);
  }
  
  class FootMassage {
    void doMassage() {
      print('脚底按摩');
    }
  }
  
  ```

- 运行时判断泛型

  ```dart
  void main(){
    //运行时可判断泛型
    var names = List<String>();
    print(names is List<String>);
    print(names.runtimeType);   
  }
  ```

- Dart 泛型 与 Java 区别

  1. Java 中的泛型信息是编译时的，泛型信息在运行时是不存在的。
  2. Dart 的泛型类型是固化的，在运行时也有可以判断的具体类型。

## 库

- 使用核心库

  ```Dart
  import 'dart:math'; //载入核心库
  void main(){
      print(sqrt(4));
  }
  ```

- 载入第三方库(https://pub.dartlang.org/packages?q=http)

  ```Dart
  1. 编写 pubspec.yaml
      
      dependencies:
    flutter:
      sdk: flutter
  
    cupertino_icons: ^0.1.0
    dio: ^2.1.0
    
  2. 代码编写
        import 'package:dio/dio.dart';
        void main（）{
        gethttp();
    }
  
  void getHttp() async{
    try{
      var response = await Dio().get("http://www.baidu.com");
      print(response);
    }catch(e){
      print(e);
    }
  
  }
  
  ```

- 载入文件

  ```dart
  1. 新创建一个 MyLib1.dart 文件
      class DevFlutter {
  
    static DevFlutter _deFlutter;
  
    factory DevFlutter () => _deFlutter ??= DevFlutter._newInstance();
  
    DevFlutter._newInstance();
  
  }
  
  class Test {
    void start() {
      print(" Flutter... ");
    }
  }
  
  2. 回到 A dart 文件 导入 MyLib1.dart 包
      import 'mylib1.dart'
      void main(){
      //载入文件
      var myLib1 = MyLib()；
  }
      
  ```

  

- 指定库前缀

  ```dart
  ///注意：如果两个库有冲突的标识符，可以为其中一个或两个库都指定前缀:
  import 'MyLib1.dart' as lib1; 
  import 'MyLib2.dart' as lib2;
  
  void main(){
   var myLib = lib1.MyLib();
   var myLib2 = lib2.MyLib();    
  }
  ```

  

- 选择性载入

  1. show 只载入库的某些部分
  2. hide 筛选掉库的某些部分

  ```dart
  import 'Mylib1.dart' as lib1 show Test;
  import 'Mylib2.dart' as lib2 hide Test;
  
  void main(){
   	var test = lib1.Test();
  	var lib = lib2.MyLib();
  }
  ```

- 延迟载入

  1. 使用 deferred as 导入
  2. 使用标识符调用 loadLibrary() 加载库;

  ```dart
  import 'MyLib1.dart' deferred as defelib;//延迟载入
  
  void main(){
    //延迟载入
    deferredLoad();
  }
  
  //延迟载入
  //可提高程序启动速度
  //用在不常使用的功能
  //用在载入时间过长的包
  void deferredLoad() async{
    await defelib.loadLibrary();
    var test = defelib.Test;
  }
  ```

  

- 自定义库

  1. 创建一个 A 库 a .dart
  2. 创建一个 B 库 b.dart
  3. 创建一个 lib 库 libs.dart

  注意：代码中的 part,library 的含义

  part: 有的时候一个库可能太大，不能方便的保存在一个文件当中。Dart 允许我们把一个库拆分成一个或者多个较小的 part 组件。或者我们想让某一些库共享它们的私有对象的时候，我们需要使用 part 。

  library:  当没有指定 `library` 指令的时候，根据每个库 的路径和文件名会为每个库生成一个唯一的标签。 所以，我们 建议你不要在代码中使用 `library` 指令， 除非你想 [生成库的 API 文档](http://dart.goodev.org/guides/libraries/create-library-packages#documenting-a-library)。

  ```dart
  1. a.dart。
  part of libs;
  
  void printA() => print('A');
  
  2. b.dart。
  part of libs;
  
  void printB() => print('B');
  
  3. libs 库
  library libs;
  
  part 'util.dart';
  
  part 'tool.dart';
  
  void printLibs() => print('libs');
  
  ///开始调用
  //import 'lib/libs.dart';//载入自定义库
  
  void main(){
      //载入自定义库
      printA();
      printB();
      printLibs();
  }
  
  
      
  ```

  

## 感谢

[Dart 中文社区](http://dart.goodev.org/guides/get-started);



























































