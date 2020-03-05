# Java 反射 API 总结

## JAVA 反射 API 总结

### Class 获取

| 返回值 | API | 说明 |
| :--- | :--- | :--- |
| obj | Obj.class | 对于一个对象而言，如果这个对象可以访问，那么调用 `getClass()`方法就可以获取到了它的相应的 Class 对象。 |
| Class | String.clas | 通过 .class 标识 |
| Class | Class.forName\("全类名"\); | 通过 Class.forName\(\) 方法 |

### Class 成员获取

| 返回值 | API | 说明 |
| :--- | :--- | :--- |
| Field | getDeclaredField\(String name\) | 获取的是 Class 中被 private 修饰的属性 |
| Field | getField\(String name\) | 获取的是非私有属性，并且 getField\(\) 在当前 Class 获取不到时会向父类获取 |
| Field\[\] | getDeclaredFields\(\) | _获取所有的属性，但不包括从父类继承下来的属性_ |
| Field\[\] | getFields\(\) | _获取自身的所有的 public 属性，包括从父类继承下来的。_ |

### 获取 Method

| 返回值 | API | 说明 |
| :--- | :--- | :--- |
| Method | getDeclaredMethod\(String name, Class&lt;?&gt;... parameterTypes\) | 根据函数名和函数中的参数获取（public、protected,private）该函数。 |
| Method | getMethod\(String name, Class&lt;?&gt;... parameterTypes\) | 根据函数名和函数中的参数获取（public）该函数。 |
| Method\[\] | getDeclaredMethods\(\) | 获取所有（public、protected,private）函数。 |
| Method\[\] | getMethods\(\) | 获取所有（public）函数。包含父类 |

### 获取 Constructor

| 返回值 | API | 说明 |
| :--- | :--- | :--- |
| Constructor | getDeclaredConstructor\(Class&lt;?&gt;... parameterTypes\) | 根据参数获取（public、protected,private）构造函数 |
| Constructor | getConstructor\(Class&lt;?&gt;... parameterTypes\) | 根据参数获取（public）构造函数 |
| Constructor&lt;?&gt;\[\] | getDeclaredConstructors\(\) | 获取（public、protected,private）所有的构造函数 |
| Constructor&lt;?&gt;\[\] | getConstructors\(\) | 获取（public）所有的构造函数 |

### Field 类型的获取

| 返回值 | API | 说明 |
| :--- | :--- | :--- |
| Type | getGenericType\(\) | 能够获取到泛型类型 |
| Class&lt;?&gt; | getType\(\) | 获取 class 全路径 |

### Field 内容的读取和赋值

| 返回值 | API | 说明 |
| :--- | :--- | :--- |
| Object | get\(Object obj\); |  |
| int | getInt\(Object obj\); |  |
| long | getLong\(Object obj\) |  |
| float | getFloat\(Object obj\) |  |
| short | getShort\(Object obj\) |  |
| double | getDouble\(Object obj\) |  |
| char | getChar\(Object obj\) |  |
| byte | getByte\(Object obj\) |  |
| boolean | getBoolean\(Object obj\) |  |
| void | set\(Object obj,Object value\); |  |
| void | setInt\(Object obj, int i\) |  |
| void | setLong\(Object obj, long l\) |  |
| void | setFloat\(Object obj, float f\) |  |
| void | setDouble\(Object obj, double d\) |  |
| void | setShort\(Object obj, short s\) |  |
| void | setChar\(Object obj, char c\) |  |
| void | setByte\(Object obj, byte b\) |  |
| void | setBoolean\(Object obj, boolean z\) |  |

### Method 获取方法名、参数、返回值类型、修饰符、异常类型

| 返回值 | API | 说明 |
| :--- | :--- | :--- |
| String | getName\(\) | 获取函数名称 |
| Parameter\[\] | getParameters\(\) | 获取参数数组 |
| Class&lt;?&gt;\[\] | getParameterTypes\(\) | 获取所有的参数类型 |
| Type\[\] | getGenericParameterTypes\(\) | 获取所有的参数类型，包括泛型 |
| Class&lt;?&gt; | getReturnType\(\) | _获取返回值类型_ |
| Type | getGenericReturnType\(\) | _获取返回值类型包括泛型_ |
| int | getModifiers\(\) | 获取修饰符 |
| Class&lt;?&gt;\[\] | getExceptionTypes\(\) |  |
| Type\[\] | getGenericExceptionTypes\(\) |  |

### Method 方法执行

| 返回值 | API | 说明 |
| :--- | :--- | :--- |
| Object | invoke\(Object obj, Object... args\) | 方法中第一个参数 Object 实质上是 Method 所依附的 Class 对应的类的实例，如果这个方法是一个静态方法，那么 ojb 为 null，后面的可变参数 Object 对应的自然就是参数。 |

## 参考

* [https://blog.csdn.net/briblue/article/details/74616922](https://blog.csdn.net/briblue/article/details/74616922)
* [https://blog.csdn.net/briblue/article/details/76223206](https://blog.csdn.net/briblue/article/details/76223206)

