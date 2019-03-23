# Dart 语言中的 异步,生成器,隔离,元数据,注释

## 异步

### 简介

[对于异步不太了解，可以直接看官网介绍](https://webdev.dartlang.org/articles/performance/event-loop); 

Dart 有一些语言特性来支持异步编程。最常见的特性是 `async` 方法和 `await` 表达式。

Dart 库中有很多返回 Future 或者 Stream 对象的方法。 这些方法是异步的 : 这些函数在设置完基本的操作后就返回了 , 而无需等待操作执行完成。 例如读取一个文件 , 在打开文件后就返回了。

### async 和 await

有两种方式可以使用 Future 对象中的数据：

- 使用 async 和 await
- 使用 [Future API](http://dart.goodev.org/guides/libraries/library-tour#future)

使用 `async` 和 `await` 的代码是异步的， 但是看起来有点像同步代码。 例如，下面是一些使用 `await` 来 等待异步方法返回的示例：

 ```dart
await lookUpVersion();
 ```

要使用 `await`，其方法必须带有 `async` 关键字：

```dart
checkVersion() saync {
   var version =  await lookUpVersion();
    if(version == expectedVersion){
        // TODO ------
    } else {
         // TODO ------
    }
} 
```

可以使用 `try`, `catch`, 和 `finally` 来处理使用 `await` 的异常：

```dart
void getHttp(){
  try{
    var response = await Dio().get("http://www.baidu.com");
    print(response);
  }catch(e){
    print(e);
  }
}
```

声明异步方法

- 一个 async 方法 是函数体被标记为 async 的方法。 虽然异步方法的执行可能需要一定时间，但是 异步方法立刻返回 - 在方法体还没执行之前就返回了。

  ```dart
  void getHttp async {
      // TODO ---
  }
  ```

在一个方法上添加 async 关键字，则这个方法返回值为 Future。 例如，下面是一个返回字符串的同步方法：

```dart
String loadAppVersion() => "1.0.2"
```

如果使用 async 关键字，则该方法返回一个 Future，并且 认为该函数是一个耗时的操作。

```dart
Futre<String> loadAppVersion() async  => "1.0.2"
```

注意，方法的函数体并不需要使用 Future API。 Dart 会自动在需要的时候创建 Future 对象。

####  推荐使用 async / await 而不是直接使用底层的特性

- 好的习惯

```dart
void main() {
 //调用异步方法
 doAsync();
}

// 在函数上声明了 async 表明这是一个异步方法
Future<bool> doAsync() async {
  try {
    // 这里是一个模拟请求一个网络耗时操作
    var result = await getHttp();
    //请求出来的结果
    return printResult(result);
  } catch (e) {
    print(e);
    return false;
  }
}
//将请求出来的结果打印出来
Future<bool> printResult(summary) {
  print(summary);
}

//开始模拟网络请求 等待 5 秒返回一个字符串
getHttp() {
 return new Future.delayed(Duration(seconds: 5), () => "Request Succeeded");
}
```

- 坏的习惯写法

```dart
void main() {
 doAsync();
}

Future<String> doAsync() async {
    return  getHttp().then((r){
      return printResult(r);
    }).catchError((e){
      print(e);
    });
}

Future<String> printResult(summary) {
  print(summary);
}

Future<String> getHttp() {
 return new Future.delayed(Duration(seconds: 5), () => "Request Succeeded");
}
```

### then,catchError,whenComplete

先来看一段代码

```dart
void doAsyncs() async{
  //then catchError whenComplete
  new Future(() => futureTask()) //  异步任务的函数
      .then((m) => "1-:$m") //   任务执行完后的子任务
      .then((m) => print('2-$m')) //  其中m为上个任务执行完后的返回的结果
      .then((_) => new Future.error('3-:error'))
      .then((m) => print('4-'))
      .whenComplete(() => print('5-')) //不是最后执行whenComplete，通常放到最后回调

//      .catchError((e) => print(e))//如果不写test默认实现一个返回true的test方法
      .catchError((e) => print('6-catchError:' + e), test: (Object o) {
    print('7-:' + o);
    return true; //返回true，会被catchError捕获
//        return false; //返回false，继续抛出错误，会被下一个catchError捕获
  })
  .then((_) => new Future.error('11-:error'))
      .then((m) => print('10-'))
      .catchError((e) => print('8-:' + e))
      ;
}

 futureTask() {
//  throw 'error';
  return Future.delayed(Duration(seconds: 5),()  => "9-走去跑步");
}
```

大家猜一猜，看下是怎么样的一个执行流程；我直接放上答案吧，我们来分析下

```dart
2-1-:9-走去跑步
5-
7-:3-:error
6-catchError:3-:error
8-:11-:error
```

当异步函数 futureTask() 执行完会在内存中保存 ‘9-走去跑步’ 然后继续执行下一步 这个时候遇见了 then 现在会在内存中保存 “1-: 9-走去跑步 ”  继续执行 这个时候遇见了打印输出  2-1-:9-走去跑步 。现在第一个打印出来了。接着执行下一个 then() 这个时候遇见了一个 error 异常，Dart 会把这个异常保存在内存直到遇见捕获异常的地方。下面执行 whenComplete 这个函数 打印 5- 。然后遇见了一个捕获异常的函数 catchError 如果 test 返回 true ，会被 catchError 捕获 打印 7-:3-:error  6-catchError:3-:error。如果返回 false 只打印  7-:3-:error，会把 error 抛给下一个 catchError 。继续执行 又遇见了一个 error 11-:error ,现在出现 error 了  所以 then 10- 就不会执行了  。最后就直接捕获异常 打印 "8-11-error"。

分析完了，大家会了吗？相信大家差不多会了！

### Event-Looper

[以下内容从官网所得到]([https://webdev.dartlang.org/articles/performance/event-loop](https://link.jianshu.com/?t=https%3A%2F%2Fwebdev.dartlang.org%2Farticles%2Fperformance%2Fevent-loop))

Dart 是单线程模型 Main, 也就没有了所谓的主线程/子线程之分。

Dart 也是 Event-Loop 以及 Event - Queue 的模型，所有的事件都是通过 Event-loop 的依次执行。

而 Dart 的 Event Loop 就是:

- 从 EventQueue 中获取 Event

- 处理 Event

- 直到 EventQueue 为空

  ![1553334610.jpg](http://pntnlt1wq.bkt.clouddn.com/1553334610.jpg)

而这些 Event 包括了用户输入，点击， Timer, 文件 IO 等

![1553334796.jpg](http://pntnlt1wq.bkt.clouddn.com/1553334796.jpg)



#### 单线程模型

一旦某个 Dart 的函数开始执行，它将执行到这个函数结束，也就是 Dart 的函数不会被其他 Dart 代码打断。

Dart 中没有线程的概念，只有 isolate(隔离)，每个 isolate 都是隔离的，并不会共享内存。而一个 Dart 程序是在 Main isolate 的 main 函数开始，而在 Main 函数结束后，Main isolate 线程开始一个一个（one by one）的开始处理 Event Queue 中的每一个 Event 。

![asgrargargaw.webp](http://pntnlt1wq.bkt.clouddn.com/asgrargargaw.webp)

### Event Queue 和 Microtask Queue

Dart 中的 Main Isolate 只有一个 Event - Looper，但是存在两个 Event Queue : Event Queue 以及 Microtask Queue
Microtask Queue 存在的意义是：
希望通过这个 Queue 来处理稍晚一些的事情，但是在下一个消息到来之前需要处理完的事情。
当 Event Looper 正在处理 Microtask Queue 中的 Event 时候，Event Queue 中的 Event 就停止了处理了，此时 App 不能绘制任何图形，不能处理任何鼠标点击，不能处理文件 IO 等等。

Event-Looper 挑选 Task 的执行顺序为：

- 优先全部执行完 Microtask Queue.

- 直到 Microtask Queue 为空时，才会执行 Event Queue 中的 Event.

  ![1941624-f7acc83a0816453f.png](http://pntnlt1wq.bkt.clouddn.com/1941624-f7acc83a0816453f.png)

Dart 中只能知道 Event 处理的先后顺序，但是并不知道某个 Event 执行的具体时间点，因为它的处理模型是一个单线程循环，而不是基于时钟调度（即它的执行只是按照 Event 处理完，就开始循环下一个 Event，而与Java 中的 Thread 调度不一样，没有时间调度的概念），也就是我们既是指定另一个 Delay Time 的 Task，希望它在预期的时间后开始执行，它有可能不会在那个时间执行，需要看是否前面的 Event 是否已经 Dequeue 。

### 任务调度

当有代码可以在后续任务执行的时候，有两种方式，通过**dart:async**这个Lib中的API即可：

- 使用 Future 类，可以将任务加入到 Event Queue 的队尾
- 使用 **scheduleMicrotask** 函数，将任务加入到 Microtask Queue 队尾

当使用 EventQueue 时，需要考虑清楚，尽量避免 microtask queue 过于庞大，否则会阻塞其他事件的处理

![1941624c2926ff39b5a2ac9.webp](http://pntnlt1wq.bkt.clouddn.com/1941624c2926ff39b5a2ac9.webp)

### new Future()

先来看一段代码

```dart
void testFuture() {
  Future f = new Future(() => print("1"));
  Future f1 = new Future(() => null);
  Future f2 = new Future(() => null);
  Future f3 = new Future(() => null);
    
  f3.then((_) => print("2"));
  f2.then((_) {
    print("3");
    new Future(() => print("4"));
    f1.then((_) {
      print("5");
    });
  });
  f1.then((m) {
    print("6");
  });
  print("7");
}
```

大家来猜一猜上面的打印效果，打印结果是：

```dart
7
1
6
3
5
2
4
```

是不是没有想到。下面我们来分析下执行流程

1. main 函数执行完的时候，f, f1, f2, f3 会进入事件队列，这里 print( 7 )不进入队列 直接打印 7；
2. 队列里面又执行 f 事件，发现 f 存在一个打印事件 print(1) 直接打印 1;
3. 现在又执行 f1 事件，发现了一个 f1.then(m) => print('6') 直接打印 6；
4. 执行到了 f2 事件，发现了 f2 事件里面有一个 打印事件 3，先打印一个 3
   1. 然后遇见了一个新的时间 f4,放入新的事件队列里面。
   2. 现在又发现了一个 f1 的事件 print('5'),这里的 f1 因为执行完了 返回的 null 所以要把该事件存放入 *微队列*  里面。微队列里面优先执行所以打印 5 ；
5. 现在该执行到了 f2 事件了，发现了一个 print(2), 直接打印 2;
6. 最后执行到了 f4 事件，发现了一个 print(4),直接打印 4；

注意：这里的 f,f1,f2,f3... 进入事件队列里面要把它们理解成是一个整体，不管其它地方 还有 f1.then 或者 f2.then 。最后都是一个整体。

**注意**

1. 使用 new Future 将任务加入 event 队列。

2. Future 中的 then 并没有创建新的 Event 丢到 Event Queue 中，而只是一个普通的 Function Call ，

   FutureTask 执行完后，立即开始执行。

3. 如果在 then() 调用之前 Future 就已经执行完毕了，那么任务会被加入到 microtask 队列中，并且该任务会执行 then() 中注册的回调函数。

4. 使用 Future.value 构造函数的时候，就会上一条一样，创建 Task 丢到 microtask Queue 中执行 then 传入的函数。

5. Future.sync 构造函数执行了它传入的函数之后，也会立即创建 Task 丢到 microtask Queue 中执行。

6. 当任务需要延迟执行时，可以使用 new Future.delay() 来将任务延迟执行。

### scheduleMicrotask();

看一段代码，然后再来分析它们的执行流程

```dart
//scheduleMicrotask
void testScheduleMicrotask() {
  //918346572
  scheduleMicrotask(() => print('s1'));

  new Future.delayed(new Duration(seconds: 1), () => print('s2'));

  new Future(() => print('s3')).then((_) {
    print('s4');
    scheduleMicrotask(() => print('s5'));
  }).then((_) => print('s6'));

  new Future(() => print('s10'))
      .then((_) => new Future(() => print('s11')))
      .then((_) => print('s12'));

  new Future(() => print('s7'));

  scheduleMicrotask(() => print('s8'));

  print('s9');
}
```

打印结果

```
s9
s1
s8
s3
s4
s6
s5
s10
s7
s11
s12
s2
```

这一次大家自己分析了 咳咳 ~ 。

**注意**

1. 如果可以，尽量将任务放入event 队列中。
2. 使用 Future 的 then 方法或 whenComplete 方法来指定任务顺序。
3. 为了保持你 app 的可响应性，尽量不要将大计算量的任务放入这两个队列。
4. 大计算量的任务放入额外的 isolate 中。

## 生成器

### 同步生成器

```dartrtda
//同步生成器
//调用getSyncGenerator 立刻返回 Iterable
void main() {
  var it = getSyncGenerator(5).iterator;
  //  调用moveNext方法时getSyncGenerator才开始执行
  while (it.moveNext()) {
    print(it.current);
  }
}

//同步生成器： 使用sync*，返回的是Iterable对象
Iterable<int> getSyncGenerator(int n) sync* {
  print('start');
  int k = n;
  while (k > 0) {
    //yield会返回moveNext为true,并等待 moveNext 指令
    yield k--;
  }
  print('end');
}
```

**注意**

1. 使用 sync* ，返回的是 Iterable 对象。
2. yield 会返回 moveNext 为 true ,并等待 moveNext 指令。
3. 调用 getSyncGenerator 立即返回 Iterable 对象。
4. 调用 moveNext 方法时 getSyncGenerator 才开始执行。

### 异步生成器

```dart
//异步生成器调用
// getAsyncGenerator立即返回Stream,只有执行了listen，函数才会开始执行
  StreamSubscription subscription = getAsyncGenerator(5).listen(null);
  subscription.onData((value) {
    print(value);
    if (value >= 2) {
      subscription.pause(); //可以使用StreamSubscription对象对数据流进行控制
    }
  });

//异步生成器： 使用async*，返回的是Stream对象
Stream<int> getAsyncGenerator(int n) async* {
  print('start');
  int k = 0;
  while (k < n) {
    //yield不用暂停，数据以流的方式一次性推送,通过StreamSubscription进行控制
    yield k++;
  }
  print('end');
}
```

**注意**

1. 使用 async* ，返回的是 Stream 对象。
2. yield 不用暂停，数据以流的方式一次性推送,通过 StreamSubscription 进行控制。
3. 调用 getAsyncGenerator 立即返回 Stream ,只有执行了 listen ，函数才会开始执行。
4. listen 返回一个 StreamSubscription 对象进行流监听控制。
5. 可以使用 StreamSubscription 对象对数据流进行控制。

### 递归生成器

#### 异步

```dart
void main(){
      //异步
  getAsyncRecursiveGenerator(5).listen((value) => print(value));
}

//异步递归生成器
Stream<int> getAsyncRecursiveGenerator(int n) async* {
  if (n > 0) {
    yield n;
    yield* getAsyncRecursiveGenerator(n - 1);
  }
}

```



#### 同步

```dart
void main (){
  //递归生成器
  //同步
  var it1 = getSyncRecursiveGenerator(5).iterator;
  while (it1.moveNext()) {
    print(it1.current);
  }
}

//递归生成器：使用yield*
Iterable<int> getSyncRecursiveGenerator(int n) sync* {
  if (n > 0) {
    yield n;
    yield* getSyncRecursiveGenerator(n - 1);
  }
}
```



**注意**

1. yield* 以指针的方式传递递归对象，而不是整个同步对象。

## 隔离

### Isolates

现代的浏览器以及移动浏览器都运行在多核 CPU 系统上。 要充分利用这些 CPU，开发者一般使用共享内存 数据来保证多线程的正确执行。然而， 多线程共享数据通常会导致很多潜在的问题，并导致代码运行出错。

所有的 Dart 代码在 *isolates* 中运行而不是线程。 每个 isolate 都有自己的堆内存，并且确保每个 isolate 的状态都不能被其他 isolate 访问。

## 元数据

### (注解)-@deprecated

```dart
main() {
  dynamic tv = new Television();
  tv.activate();
  tv.turnOn();
}

class Television {
  @deprecated
  void activate() {
    turnOn();
  }

  void turnOn() {
    print('Television turn on!');
  }
}

```



### (注解)-@override

```dart
main() {
  dynamic tv = new Television();
  tv.activate();
  tv.turnOn();
  tv.turnOff();
}

class Television {
  @deprecated
  void activate() {
    turnOn();
  }
  
  void turnOn() {
    print('Television turn on!');
  }
  @override
  noSuchMethod(Invocation mirror) {
    print('没有找到方法');
  }
}

```

**注意**

1. 所有的 Dart 代码都可以使用： @deprecated 和 @override。

### (注解)-自定义

创建 todo.dart 文件

```
//todo.dart

class Todo {
  final String who;
  final String what;

  const Todo({this.who, this.what});
}

```

```
import 'todo.dart’;

main() {
  dynamic tv = new Television();
  tv.doSomething();
}

class Television {
  @Todo(who: 'damon', what: 'create a new method')
  void doSomething() {
    print('doSomething');
  }
}

```

**注意**

1. 在 java 中，如果自定义一个注解，需要添加 @Target 作用域注解，@Retention 注解类型注解，添加 @interface，然后定义注解参数。
2. 构造方法定义为编译时常量 

## 注释

### 单行注释

```dart
// 跟 Java 一样
```



### 多行注释

```dart
/**跟 Java 一样**/
```



### 文档注释

```dart
/// 跟 Java 一样
```



## 总结

这 *三篇基础* 内容介绍了常见的 Dart 语言特性。 还有更多特性有待实现，但是新的特性不会破坏已有的代码。 更多信息请参考 [Dart 语言规范](http://dart.goodev.org/guides/language/spec) 和 [Effective Dart](http://dart.goodev.org/guides/language/effective-dart)。

要了解 Dart 核心库的详情，请参考 [Dart 核心库预览](http://dart.goodev.org/guides/libraries/library-tour)。



