# Kotlin 学习记录

## 基础

###基本数据类型

| 类型  | 大小（比特数） | 最小值                            | 最大值                              |
| :---- | :------------- | :-------------------------------- | :---------------------------------- |
| Byte  | 8              | -128                              | 127                                 |
| Short | 16             | -32768                            | 32767                               |
| Int   | 32             | -2,147,483,648 (-231)             | 2,147,483,647 (231 - 1)             |
| Long  | 64             | -9,223,372,036,854,775,808 (-263) | 9,223,372,036,854,775,807 (263 - 1) |

| 类型   | 大小（比特数） | 有效数字比特数 | 指数比特数 | 十进制位数 |
| :----- | :------------- | :------------- | :--------- | :--------- |
| Float  | 32             | 24             | 8          | 6-7        |
| Double | 64             | 53             | 11         | 15-16      |

每个数字类型支持如下的转换:

- `toByte(): Byte`
- `toShort(): Short`
- `toInt(): Int`
- `toLong(): Long`
- `toFloat(): Float`
- `toDouble(): Double`
- `toChar(): Char`

### 原生类型数组

Kotlin 也有无装箱开销的专门的类来表示原生类型数组: `ByteArray`、 `ShortArray`、`IntArray` 等等。这些类与 `Array` 并没有继承关系，但是它们有同样的方法属性集。它们也都有相应的工厂方法:

```kotlin
val x: IntArray = intArrayOf(1, 2, 3)
x[0] = x[1] + x[2]
// 大小为 5、值为 [0, 0, 0, 0, 0] 的整型数组
val arr = IntArray(5)

// 例如：用常量初始化数组中的值
// 大小为 5、值为 [42, 42, 42, 42, 42] 的整型数组
val arr = IntArray(5) { 42 }

// 例如：使用 lambda 表达式初始化数组中的值
// 大小为 5、值为 [0, 1, 2, 3, 4] 的整型数组（值初始化为其索引值）
var arr = IntArray(5) { it * 1 } 
```

### 字符串模板

字符串字面值可以包含*模板表达式* ，即一些小段代码，会求值并把结果合并到字符串中。 模板表达式以美元符（`$`）开头，由一个简单的名字构成:

```kotlin
fun main() {
//sampleStart
    val i = 10
    println("i = $i") // 输出“i = 10”
//sampleEnd
}
```

或者用花括号括起来的任意表达式:

```kotlin
fun main() {
//sampleStart
    val s = "abc"
    println("$s.length is ${s.length}") // 输出“abc.length is 3”
//sampleEnd
}
```

原始字符串与转义字符串内部都支持模板。 如果你需要在原始字符串中表示字面值 `$` 字符（它不支持反斜杠转义），你可以用下列语法：

```kotlin
val price = """
${'$'}9.99
```

###返回到标签

Kotlin 有函数字面量、局部函数和对象表达式。因此 Kotlin 的函数可以被嵌套。 标签限制的 *return* 允许我们从外层函数返回。 最重要的一个用途就是从 lambda 表达式中返回。回想一下我们这么写的时候：

```kotlin
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach {
        if (it == 3) return // 非局部直接返回到 foo() 的调用者
        print(it)
    }
    println("this point is unreachable")
}

fun main() {
    foo()
}
```

```
---> 1 2
```

这个 *return* 表达式从最直接包围它的函数即 `foo` 中返回。 （注意，这种非局部的返回只支持传给[内联函数](http://www.kotlincn.net/docs/reference/inline-functions.html)的 lambda 表达式。） 如果我们需要从 lambda 表达式中返回，我们必须给它加标签并用以限制 *return*。

```kotlin
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach lit@{
        if (it == 3) return@lit // 局部返回到该 lambda 表达式的调用者，即 forEach 循环
        print(it)
    }
    print(" done with explicit label")
}

fun main() {
    foo()
}
```

```
---->1245 done with explicit label
```

现在，它只会从 lambda 表达式中返回。通常情况下使用隐式标签更方便。 该标签与接受该 lambda 的函数同名。

```kotlin
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach {
        if (it == 3) return@forEach // 局部返回到该 lambda 表达式的调用者，即 forEach 循环
        print(it)
    }
    print(" done with implicit label")
}

fun main() {
    foo()
}
```

----> 1245 done with implicit label

或者，我们用一个[匿名函数](http://www.kotlincn.net/docs/reference/lambdas.html#匿名函数)替代 lambda 表达式。 匿名函数内部的 *return* 语句将从该匿名函数自身返回

```kotlin
fun foo() {
    listOf(1, 2, 3, 4, 5).forEach(fun(value: Int) {
        if (value == 3) return  // 局部返回到匿名函数的调用者，即 forEach 循环
        print(value)
    })
    print(" done with anonymous function")
}

fun main() {
    foo()
}
```

----> 1245 done with anonymous function



请注意，前文三个示例中使用的局部返回类似于在常规循环中使用 *continue*。并没有 *break* 的直接等价形式，不过可以通过增加另一层嵌套 lambda 表达式并从其中非局部返回来模拟：

```kotlin
fun foo() {
    run loop@{
        listOf(1, 2, 3, 4, 5).forEach {
            if (it == 3) return@loop // 从传入 run 的 lambda 表达式非局部返回
            print(it)
        }
    }
    print(" done with nested loop")
}

fun main() {
    foo()
}
```

----> 12 done with nested loop



当要返一个回值的时候，解析器优先选用标签限制的 return，即

```kotlin
return@a 1
```

意为“返回 `1` 到 `@a`”，而不是“返回一个标签标注的表达式 `(@a 1)`”。

##类与对象

### 构造函数

在 Kotlin 中的一个类可以有一个**主构造函数**以及一个或多个**次构造函数**。主构造函数是类头的一部分：它跟在类名（与可选的类型参数）后。

```kotlin
class Person constructor(firstName: String) { /*……*/ }
```

如果主构造函数没有任何注解或者可见性修饰符，可以省略这个 *constructor* 关键字。

```kotlin
class Person(firstName: String) { /*……*/ }
```

如果构造函数有注解或可见性修饰符，这个 *constructor* 关键字是必需的，并且这些修饰符在它前面：

```kotlin
class Customer public @Inject constructor(name: String) { /*……*/ }
```

#### 次构造函数

类也可以声明前缀有 *constructor*的**次构造函数**：

```kotlin
class Person {
    var children: MutableList<Person> = mutableListOf<Person>();
    constructor(parent: Person) {
        parent.children.add(this)
    }
}
```

如果类有一个主构造函数，每个次构造函数需要委托给主构造函数， 可以直接委托或者通过别的次构造函数间接委托。委托到同一个类的另一个构造函数用 *this* 关键字即可：

```kotlin
class Person(val name: String) {
    var children: MutableList<Person> = mutableListOf<Person>();
    constructor(name: String, parent: Person) : this(name) {
        parent.children.add(this)
    }
}
```

### 创建类的实例

要创建一个类的实例，我们就像普通函数一样调用构造函数：

```kotlin
val invoice = Invoice()

val customer = Customer("Joe Smith")
```

注意 Kotlin 并没有 *new* 关键字。

创建嵌套类、内部类与匿名内部类的类实例在[嵌套类](http://www.kotlincn.net/docs/reference/nested-classes.html)中有述。

### 覆盖方法

我们之前提到过，Kotlin 力求清晰显式。因此，Kotlin 对于可覆盖的成员（我们称之为*开放*）以及覆盖后的成员需要显式修饰符：

```kotlin
open class Shape {
    open fun draw() { /*……*/ }
    fun fill() { /*……*/ }
}

class Circle() : Shape() {
    override fun draw() { /*……*/ }
}
```



### 覆盖规则

在 Kotlin 中，实现继承由下述规则规定：如果一个类从它的直接超类继承相同成员的多个实现， 它必须覆盖这个成员并提供其自己的实现（也许用继承来的其中之一）。 为了表示采用从哪个超类型继承的实现，我们使用由尖括号中超类型名限定的 *super*，如 `super<Base>`：

```kotlin
open class Rectangle {
    open fun draw() { /* …… */ }
}

interface Polygon {
    fun draw() { /* …… */ } // 接口成员默认就是“open”的
}

class Square() : Rectangle(), Polygon {
    // 编译器要求覆盖 draw()：
    override fun draw() {
        super<Rectangle>.draw() // 调用 Rectangle.draw()
        super<Polygon>.draw() // 调用 Polygon.draw()
    }
}
```

###Getters 与 Setters

声明一个属性的完整语法是

```kotlin
var <propertyName>[: <PropertyType>] [= <property_initializer>]
    [<getter>]
    [<setter>]
```

如果我们定义了一个自定义的 setter，那么每次给属性赋值时都会调用它。一个自定义的 setter 如下所示：

```kotlin
var stringRepresentation: String
    get() = this.toString()
    set(value) {
        setDataFromString(value) // 解析字符串并赋值给其他属性
    }
```

###延迟初始化属性与变量

一般地，属性声明为非空类型必须在构造函数中初始化。 然而，这经常不方便。例如：属性可以通过依赖注入来初始化， 或者在单元测试的 setup 方法中初始化。 这种情况下，你不能在构造函数内提供一个非空初始器。 但你仍然想在类体中引用该属性时避免空检测。

为处理这种情况，你可以用 `lateinit` 修饰符标记该属性：

```kotlin
public class MyTest {
    lateinit var subject: TestSubject

    @SetUp fun setup() {
        subject = TestSubject()
    }

    @Test fun test() {
        subject.method()  // 直接解引用
    }
}
```

### 检测一个 lateinit var 是否已初始化（自 1.2 起）

要检测一个 `lateinit var` 是否已经初始化过，请在[该属性的引用](http://www.kotlincn.net/docs/reference/reflection.html#属性引用)上使用 `.isInitialized`：

```kotlin
if (foo::bar.isInitialized) {
    println(foo.bar)
}
```

###接口中的属性

你可以在接口中定义属性。在接口中声明的属性要么是抽象的，要么提供访问器的实现。在接口中声明的属性不能有幕后字段（backing field），因此接口中声明的访问器不能引用它们。

```kotlin
interface MyInterface {
    val prop: Int // 抽象的

    val propertyWithImplementation: String
        get() = "foo"

    fun foo() {
        print(prop)
    }
}

class Child : MyInterface {
    override val prop: Int = 29
}
```

### 解决覆盖冲突

实现多个接口时，可能会遇到同一方法继承多个实现的问题。例如

```kotlin
interface A {
    fun foo() { print("A") }
    fun bar()
}

interface B {
    fun foo() { print("B") }
    fun bar() { print("bar") }
}

class C : A {
    override fun bar() { print("bar") }
}

class D : A, B {
    override fun foo() {
        super<A>.foo()
        super<B>.foo()
    }

    override fun bar() {
        super<B>.bar()
    }
}
```

上例中，接口 *A* 和 *B* 都定义了方法 *foo()* 和 *bar()*。 两者都实现了 *foo()*, 但是只有 *B* 实现了 *bar()* (*bar()* 在 *A* 中没有标记为抽象， 因为没有方法体时默认为抽象）。因为 *C* 是一个实现了 *A* 的具体类，所以必须要重写 *bar()* 并实现这个抽象方法。

然而，如果我们从 *A* 和 *B* 派生 *D*，我们需要实现我们从多个接口继承的所有方法，并指明 *D* 应该如何实现它们。这一规则既适用于继承单个实现（*bar()*）的方法也适用于继承多个实现（*foo()*）的方法。

## 类型别名

类型别名为现有类型提供替代名称。 如果类型名称太长，你可以另外引入较短的名称，并使用新的名称替代原类型名。

它有助于缩短较长的泛型类型。 例如，通常缩减集合类型是很有吸引力的：

```kotlin
typealias NodeSet = Set<Network.Node>

typealias FileTable<K> = MutableMap<K, MutableList<File>>


class A {
    inner class Inner
}
class B {
    inner class Inner
}

typealias AInner = A.Inner
typealias BInner = B.Inner
```



## 参数传递

### 无参数函数调用

```kotlin
class HelloWorld {

    fun say() {
        Timber.i("Hello World")
    }

    /**
    * 在 Kotlin 中无返回为 Unit
    *
    * 此方法接收一个无参数的函数并且无返回
    *
    * 使用参数名加 () 来调用
    */
    fun people(hello: () -> Unit) {
        hello()
    }

    /**
    * 在 kotlin 中有一个约定，如果最后一个参数是函数，可以省略括号
    */
    fun main() {
        people ({ say() })
        people { say() }
    }

}
```



### 有参数函数调用

```kotlin
class Hello {

    fun say(msg: String) {
        Timber.i("Hello $msg")
    }

    /**
    * 当调用的函数有形参时，
    * 需要在调用的函数声明，并使用声明的形参；
    * 函数参数中的形参无法使用
    */
    fun people(arg0: String, hello: (arg1: String) -> Unit) {
        hello(arg0)
        // hello(arg1) 这样调用将报错
    }

    fun main() {
        people("Android") { say("World") }
    }

}
```



