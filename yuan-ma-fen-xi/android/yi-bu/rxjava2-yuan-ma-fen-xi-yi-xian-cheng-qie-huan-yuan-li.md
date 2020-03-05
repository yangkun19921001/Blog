# Rxjava2 源码分析 \(一\) 线程切换原理

## 介绍

[RxJava](https://github.com/ReactiveX/RxJava) 出来已经有几年了，我相信大家多多少少都有使用过 RxJava \(简单来说：它就是一个实现异步操作的库\)，它强大的操作变换符和线程切换等，使我们的业务逻辑操作起来更加简单明了。我使用 Rxjava 有 2 年左右了吧，当初还是看[扔物线](https://github.com/rengwuxian) 的 [给 Android 开发者的 RxJava 详解](http://gank.io/post/560e15be2dca930e00da1083) 入的门，门现在入了，使用上也没什么障碍了，现在我们就可以来看下 Rxjava 底层是怎么实现的。在了解原理之前，我们先来看下基本使用。

## 使用参考

这里只是总结一下 Rxjava 操作符，不做示例讲解。

### 被观察者

| 观察者 | 说明 |
| :--- | :--- |
| Observable | Observable 即被观察者，决定什么时候触发事件以及触发怎样的事件 |
| Flowable | Flowable 可以看成是 Observable 的实现，只是它支持背压 |
| Single | 只有 onSuccess 可 onError 事件，只能用 onSuccess 发射一个数据或一个错误通知，之后再发射数据也不会做任何处理，直接忽略 |
| Completable | 只有 onComplete 和 onError 事件，不发射数据，没有 map，flatMap 操作符。常常结合 andThen 操作符使用 |
| Maybe | 没有 onNext 方法，同样需要 onSuccess 发射数据，且只能发射 0 或 1 个数据，多发也不再处理 |

### 操作符

#### 创建操作符

| 被观察者的操作符 | 说明 |
| :--- | :--- |
| create | 创建一个被观察者 |
| just | 创建一个被观察者，并发送事件，发送的事件不可以超过10个以上 |
| fromArray | 这个方法和 just\(\) 类似，只不过 fromArray 可以传入多于10 个的变量，并且可以传入一个数组 |
| fromCallable | 这里的 Callable 是 java.util.concurrent 中的 Callable，Callable 和 Runnable 的用法基本一致，只是它会返回一个结果值，这个结果值就是发给观察者的 |
| fromFuture | 参数中的 Future 是 java.util.concurrent 中的 Future，Future 的作用是增加了 cancel\(\) 等方法操作 Callable，它可以通过 get\(\) 方法来获取 Callable 返回的值 |
| fromIterable | 直接发送一个 List 集合数据给观察者 |
| defer | 这个方法的作用就是直到被观察者被订阅后才会创建被观察者。 |
| Timer | 当到指定时间后就会发送一个 0L 的值给观察者。 |
| Interval | 每隔一段时间就会发送一个事件，这个事件是从 0 开始，不断增 1 的数字。 |
| intervalRange | 可以指定发送事件的开始值和数量，其他与 interval\(\) 的功能一样。 |
| range | 同时发送一定范围的事件序列。 |
| rangeLong | 作用与 range\(\) 一样，只是数据类型为 Long |
| empty | 直接发送 onComplete\(\) 事件 |
| never | 不发送任何事件 |
| error | 发送 onError\(\) 事件 |

#### 转换操作符

| 名称 | 说明 |
| :--- | :--- |
| map\(\) | map 可以将被观察者发送的数据类型转变成其他的类型 |
| flatMap\(\) | 这个方法可以将事件序列中的元素进行整合加工，返回一个新的被观察者。flatMap\(\) 其实与 map\(\) 类似，但是 flatMap\(\) 返回的是一个 Observerable |
| concatMap\(\) | concatMap\(\) 和 flatMap\(\) 基本上是一样的，只不过 concatMap\(\) 转发出来的事件是有序的，而 flatMap\(\) 是无序的 |
| buffer\(\) | 从需要发送的事件当中获取一定数量的事件，并将这些事件放到缓冲区当中一并发出 |
| groupBy\(\) | 将发送的数据进行分组，每个分组都会返回一个被观察者 |
| scan\(\) | 将数据以一定的逻辑聚合起来 |
| window\(\) | 发送指定数量的事件时，就将这些事件分为一组。window 中的 count 的参数就是代表指定的数量，例如将 count 指定为 2，那么每发 2  个数据就会将这 2 个数据分成一组。 |

#### 组合操作符

| 操作符 | 说明 |
| :--- | :--- |
| concat\(\) | 可以将多个观察者组合在一起，然后按照之前发送顺序发送事件。需要注意的是，concat\(\) 最多只可以发送4个事件。 |
| concatArray\(\) | 与 concat\(\) 作用一样，不过 concatArray\(\) 可以发送多于 4 个被观察者。 |
| merge\(\) | 这个方法月 concat\(\) 作用基本一样，知识 concat\(\) 是串行发送事件，而 merge\(\) 并行发送事件。 |
| concatArrayDelayError\(\) & mergeArrayDelayError\(\) | 在 concatArray\(\) 和 mergeArray\(\) 两个方法当中，如果其中有一个被观察者发送了一个 Error 事件，那么就会停止发送事件，如果你想 onError\(\) 事件延迟到所有被观察者都发送完事件后再执行的话，就可以使用  concatArrayDelayError\(\) 和 mergeArrayDelayError\(\) |
| zip\(\) | 会将多个被观察者合并，根据各个被观察者发送事件的顺序一个个结合起来，最终发送的事件数量会与源 Observable 中最少事件的数量一样。 |
| combineLatest\(\) & combineLatestDelayError\(\) | combineLatest\(\) 的作用与 zip\(\) 类似，但是 combineLatest\(\) 发送事件的序列是与发送的时间线有关的，当 combineLatest\(\) 中所有的 Observable 都发送了事件，只要其中有一个 Observable 发送事件，这个事件就会和其他 Observable 最近发送的事件结合起来发送 |
| reduce\(\) | 与 scan\(\) 操作符的作用也是将发送数据以一定逻辑聚合起来，这两个的区别在于 scan\(\) 每处理一次数据就会将事件发送给观察者，而 reduce\(\) 会将所有数据聚合在一起才会发送事件给观察者。 |
| collect\(\) | 将数据收集到数据结构当中 |
| startWith\(\) & startWithArray\(\) | 在发送事件之前追加事件，startWith\(\) 追加一个事件，startWithArray\(\) 可以追加多个事件。追加的事件会先发出。 |
| count\(\) | 返回被观察者发送事件的数量。 |

#### 功能操作符

| 操作符 | 说明 |
| :--- | :--- |
| delay\(\) | 延迟一段时间发送事件。 |
| doOnEach\(\) | Observable 每发送一件事件之前都会先回调这个方法。 |
| doOnNext\(\) | Observable 每发送 onNext\(\) 之前都会先回调这个方法。 |
| doAfterNext\(\) | Observable 每发送 onNext\(\) 之后都会回调这个方法。 |
| doOnComplete\(\) | Observable 每发送 onComplete\(\) 之前都会回调这个方法。 |
| doOnError\(\) | Observable 每发送 onError\(\) 之前都会回调这个方法。 |
| doOnSubscribe\(\) | Observable 每发送 onSubscribe\(\) 之前都会回调这个方法。 |
| doOnDispose\(\) | 当调用 Disposable 的 dispose\(\) 之后回调该方法 |
| doOnLifecycle\(\) | 在回调 onSubscribe 之前回调该方法的第一个参数的回调方法，可以使用该回调方法决定是否取消订阅 |
| doOnTerminate\(\) & doAfterTerminate\(\) | doOnTerminate 是在 onError 或者 onComplete 发送之前回调，而 doAfterTerminate 则是 onError 或者 onComplete 发送之后回调 |
| doFinally\(\) | 在所有事件发送完毕之后回调该方法。 |
| onErrorReturn\(\) | 当接受到一个 onError\(\) 事件之后回调，返回的值会回调 onNext\(\) 方法，并正常结束该事件序列 |
| onErrorResumeNext\(\) | 当接收到 onError\(\) 事件时，返回一个新的 Observable，并正常结束事件序列 |
| onExceptionResumeNext\(\) | 与 onErrorResumeNext\(\) 作用基本一致，但是这个方法只能捕捉 Exception。 |
| retry\(\) | 如果出现错误事件，则会重新发送所有事件序列。times 是代表重新发的次数 |
| retryUntil\(\) | 出现错误事件之后，可以通过此方法判断是否继续发送事件。 |
| retryWhen\(\) | 当被观察者接收到异常或者错误事件时会回调该方法，这个方法会返回一个新的被观察者。如果返回的被观察者发送 Error 事件则之前的被观察者不会继续发送事件，如果发送正常事件则之前的被观察者会继续不断重试发送事件 |
| repeat\(\) | 重复发送被观察者的事件，times 为发送次数 |
| repeatWhen\(\) | 这个方法可以会返回一个新的被观察者设定一定逻辑来决定是否重复发送事件。 |
| subscribeOn\(\) | 指定被观察者的线程，要注意的时，如果多次调用此方法，只有第一次有效。 |
| observeOn\(\) | 指定观察者的线程，每指定一次就会生效一次。 |

#### 过滤操作符

| 操作符 | 说明 |
| :--- | :--- |
| filter\(\) | 通过一定逻辑来过滤被观察者发送的事件，如果返回 true 则会发送事件，否则不会发送 |
| ofType\(\) | 可以过滤不符合该类型事件 |
| skip\(\) | 跳过正序某些事件，count 代表跳过事件的数量 |
| distinct\(\) | 过滤事件序列中的重复事件。 |
| distinctUntilChanged\(\) | 过滤掉连续重复的事件。 |
| take\(\) | 控制观察者接收的事件的数量。 |
| debounce\(\) | 如果两件事件发送的时间间隔小于设定的时间间隔则前一件事件就不会发送给观察者。 |
| firstElement\(\) && lastElement\(\) | firstElement\(\) 取事件序列的第一个元素，lastElement\(\) 取事件序列的最后一个元素。 |
| elementAt\(\) & elementAtOrError\(\) | elementAt\(\) 可以指定取出事件序列中事件，但是输入的 index 超出事件序列的总数的话就不会出现任何结果。这种情况下，你想发出异常信息的话就用 elementAtOrError\(\) 。 |

#### 条件操作符

| 操作符 | 说明 |
| :--- | :--- |
| all\(\) | 判断事件序列是否全部满足某个事件，如果都满足则返回 true，反之则返回 false。 |
| takeWhile\(\) | 可以设置条件，当某个数据满足条件时就会发送该数据，反之则不发送 |
| skipWhile\(\) | 可以设置条件，当某个数据满足条件时不发送该数据，反之则发送。 |
| takeUntil\(\) | 可以设置条件，当事件满足此条件时，下一次的事件就不会被发送了。 |
| skipUntil\(\) | 当 skipUntil\(\) 中的 Observable 发送事件了，原来的 Observable 才会发送事件给观察者。 |
| sequenceEqual\(\) | 判断两个 Observable 发送的事件是否相同。 |
| contains\(\) | 判断事件序列中是否含有某个元素，如果有则返回 true，如果没有则返回 false。 |
| isEmpty\(\) | 判断事件序列是否为空。 |
| amb\(\) | amb\(\) 要传入一个 Observable 集合，但是只会发送最先发送事件的 Observable 中的事件，其余 Observable 将会被丢弃 |
| defaultIfEmpty\(\) | 如果观察者只发送一个 onComplete\(\) 事件，则可以利用这个方法发送一个值 |

## 基本执行流程

在讲基本执行流程之前我们先来看一段代码

```java
@Test
public   void  test(){
        Observable.create(new ObservableOnSubscribe<String>() {
            @Override
            public void subscribe(ObservableEmitter<String> emitter) throws Exception {
                System.out.println("Thread = [" + Thread.currentThread().getName() + "]");

                emitter.onNext("1");
                emitter.onNext("2");
                emitter.onNext("3");
                emitter.onComplete();

            }
        })
        .subscribe(new Observer<String>() {
            @Override
            public void onSubscribe(Disposable d) {
                System.out.println("Observer = [ onSubscribe ]");
            }

            @Override
            public void onNext(String s) {
                System.out.println("Observer = [ onNext ]" + s);
            }

            @Override
            public void onError(Throwable e) {
                System.out.println("Observer = [ onError ] "+e.getMessage());
            }

            @Override
            public void onComplete() {
                System.out.println("Observer = [ onComplete ]");
            }
        });

    }
```

Output：

```java
Observer = [ onSubscribe ]
Observer = [ onNext ]1
Observer = [ onNext ]2
Observer = [ onNext ]3
Observer = [ onComplete ]
```

上面代码就是一个简单的被观察者的一个订阅关系，不涉及线程切换，通过 create 操作符创建一个新的观察者，然后发射了几条 String 的数据，下游接收到数据并打印出来，下面我们就看下它的具体执行流程。

先来看一个流程图

![](http://tva1.sinaimg.cn/large/007X8olVly1g7gd9e8bvdj30ut0u0q6a.jpg)

下面我们就跟着流程图看下代码

```java
//调用层调用 create 函数，返回一个被观察者对象    
public static <T> Observable<T> create(ObservableOnSubscribe<T> source) {
        //1. 判断空处理
        ObjectHelper.requireNonNull(source, "source is null");
        //2 hook
        return RxJavaPlugins.onAssembly(new ObservableCreate<T>(source));
    }
```

create 主要做了 2 件事儿，首先对 source 判断空，然后在钩子函数中创建了一个 ObservableCreate 对象，然后然后这个 ObservableCreate 对象，我们看一下内部

```java
public final class ObservableCreate<T> extends Observable<T> {
    final ObservableOnSubscribe<T> source;

    public ObservableCreate(ObservableOnSubscribe<T> source) {
        //赋值给成员变量
        this.source = source;
    }
  ....
}
```

这里我们看到只是把 source 赋值给了 ObservableCreate 的成员变量。

接着我们在看 Observable\#subscribe

```java
    @SchedulerSupport(SchedulerSupport.NONE)
    @Override
    public final void subscribe(Observer<? super T> observer) {
        //1. 判空
        ObjectHelper.requireNonNull(observer, "observer is null");
        try {
            //2. hook ,返回一个观察者
            observer = RxJavaPlugins.onSubscribe(this, observer);
            //3. 判空
            ObjectHelper.requireNonNull(observer, "The RxJavaPlugins.onSubscribe hook returned a null Observer. Please change the handler provided to RxJavaPlugins.setOnObservableSubscribe for invalid null returns. Further reading: https://github.com/ReactiveX/RxJava/wiki/Plugins");
            //4. 内部调用 subscribeActual 函数
            subscribeActual(observer);
        } catch (NullPointerException e) {
            throw e;
        } catch (Throwable e) {
            ....
            throw npe;
        }
    }
```

被观察者订阅观察者 subscribe 这里主要做了 4 步

1. 判断观察者是否为空
2. hook 观察者，返回一个观察者
3. 对观察者判断
4. 执行 subscribeActual

继续看 subscribeActual 函数

```java
    //这里是一个抽象类 看它的上一个流
    protected abstract void subscribeActual(Observer<? super T> observer);
```

这里是一个抽象类，根据上面流程图得知，ObservableCreate 实现了 这个函数，我们继续在跟

```java
public final class ObservableCreate<T> extends Observable<T> {
    final ObservableOnSubscribe<T> source;

    public ObservableCreate(ObservableOnSubscribe<T> source) {
        //赋值给成员变量
        this.source = source;
    }

  ....

    @Override
    protected void subscribeActual(Observer<? super T> observer) {
        //1. 创建一个发射器
        CreateEmitter<T> parent = new CreateEmitter<T>(observer);
        //2.表示订阅成功
        observer.onSubscribe(parent);
        try {
            //3.创建发射器，主要发射数据
            source.subscribe(parent);
        } catch (Throwable ex) {
            Exceptions.throwIfFatal(ex);
            parent.onError(ex);
        }
    }
}
```

相信大家看到注释 2 已经看到订阅成功的回调消息，注释 3 也回调到了 create 中，可以调用 parent 发送数据了，这里我们看下 CreateEmitter 具体实现

```java
    static final class CreateEmitter<T>
    extends AtomicReference<Disposable>
    implements ObservableEmitter<T>, Disposable {

        private static final long serialVersionUID = -3434801548987643227L;

        final Observer<? super T> observer;

        CreateEmitter(Observer<? super T> observer) {
            this.observer = observer;
        }
                //1. 调用层调用
        @Override
        public void onNext(T t) {
            if (t == null) {
                onError(new NullPointerException("onNext called with null. Null values are generally not allowed in 2.x operators and sources."));
                return;
            }
            //是否取消
            if (!isDisposed()) {
            //回调
                observer.onNext(t);
            }
        }

        @Override
        public void onError(Throwable t) {
            if (!tryOnError(t)) {
                RxJavaPlugins.onError(t);
            }
        }

        @Override
        public boolean tryOnError(Throwable t) {
            if (t == null) {
                t = new NullPointerException("onError called with null. Null values are generally not allowed in 2.x operators and sources.");
            }
            if (!isDisposed()) {
                try {
                    observer.onError(t);
                } finally {
                    dispose();
                }
                return true;
            }
            return false;
        }

        @Override
        public void onComplete() {

            if (!isDisposed()) {
                try {
                        //完成
                    observer.onComplete();
                } finally {
                    dispose();
                }
            }
        }

        ....

    }
```

根据上面代码可以看到，observer .onNext\(\)/onComplete\(\) 是在 CreateEmitter 内部中调用的，到这里基本执行流程已经完成了，下面我们看下线程切换原理。

## 线程切换原理

讲解线程切换的原理之前，先请看下面一段代码。

```java
    public void RxTest(){
       Observable.create(new io.reactivex.ObservableOnSubscribe<String>() {
            @Override
            public void subscribe(io.reactivex.ObservableEmitter<String> emitter){
                System.out.println("Thread = [ 准备发射数据 " + Thread.currentThread().getName() + "]");

                emitter.onNext("1");
                emitter.onNext("2");
                emitter.onNext("3");
                emitter.onComplete();

            }
        }).subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(new io.reactivex.Observer<String>() {
                    @Override
                    public void onSubscribe(Disposable d) {
                        System.out.println("Thread = [" + Thread.currentThread().getName() + " onSubscribe ]");
                    }

                    @Override
                    public void onNext(String s) {
                        System.out.println("Thread = [" + Thread.currentThread().getName() + "  onNext ]" + s);
                    }

                    @Override
                    public void onError(Throwable e) {
                        System.out.println("Thread = [" + Thread.currentThread().getName() + " onError ] "+e.getMessage());
                    }

                    @Override
                    public void onComplete() {
                        System.out.println("Thread = [" + Thread.currentThread().getName() + " onComplete ]");
                    }
                });
    }
```

output:

```java
Thread = [main onSubscribe ] //订阅成功
Thread = [ 准备发射数据 RxCachedThreadScheduler-1] //准备发送数据 ----》在 Rxjava 子线程
Thread = [main  onNext ]1 //在主线程中接收数据
Thread = [main  onNext ]2
Thread = [main  onNext ]3
Thread = [main onComplete ]
```

`根据上面示例代码先来看一个执行的时序图`

[![ucLrh4.png](https://s2.ax1x.com/2019/10/06/ucLrh4.png)](https://imgchr.com/i/ucLrh4)

`被观察者 ObservableSubscribeOn Schedulers.io() 子线程初始化`

[![ugAZ9I.png](https://s2.ax1x.com/2019/10/06/ugAZ9I.png)](https://imgchr.com/i/ugAZ9I)

`主线程初始化`

[![ugAe3t.png](https://s2.ax1x.com/2019/10/06/ugAe3t.png)](https://imgchr.com/i/ugAe3t)

`现在根据线程切换的初始化流程图，来看下从具体发送数据到线程切换流程`

[![ugnNvR.png](https://s2.ax1x.com/2019/10/06/ugnNvR.png)](https://imgchr.com/i/ugnNvR)

到这里我们对线程切换的执行流程已经有了一定的了解，知道了子线程从哪里运行，主线程在哪里运行。下面我们根据实际的代码来讲解线程切换的原理：

1. create

   ```java
   public static <T> Observable<T> create(ObservableOnSubscribe<T> source) {
       //1. 判断空处理
       ObjectHelper.requireNonNull(source, "source is null");
       //2 hook,返回一个 ObservableCreate 
       return RxJavaPlugins.onAssembly(new ObservableCreate<T>(source));
   }
   ```

2. ObservableCreate

   ```java
   public final class ObservableCreate<T> extends Observable<T> {
         //这里的 source 代表的是 Observable.create(new ObservableOnSubscribe<String>()  中的 ObservableOnSubscribe
       final ObservableOnSubscribe<T> source;

       public ObservableCreate(ObservableOnSubscribe<T> source) {
           //赋值给成员变量
           this.source = source;
       }
   }
   ```

   根据第一步和第二步，我们知道在调用层创建一个被观察者 `ObservableCreate` 。

3. 在 `ObservableCreate` 中指定子线程执行

   ```java
   public abstract class Observable<T> implements ObservableSource<T> {
       @CheckReturnValue
       @SchedulerSupport(SchedulerSupport.CUSTOM)
       public final Observable<T> subscribeOn(Scheduler scheduler) {
           ObjectHelper.requireNonNull(scheduler, "scheduler is null");
             //返回一个 ObservableSubscribeOn 被观察者对象
           return RxJavaPlugins.onAssembly(new ObservableSubscribeOn<T>(this, scheduler));
       }
   }
   ```

   根据流程可知，这里的 Observable 其实是在 ObservableCreate 内部中调用的，下面看 ObservableSubscribeOn 初始化

4. ObservableSubscribeOn 初始化

   ```java
   //线程切换的主要实现
   public final class ObservableSubscribeOn<T> extends AbstractObservableWithUpstream<T, T> {
       final Scheduler scheduler;

       public ObservableSubscribeOn(ObservableSource<T> source, Scheduler scheduler) {
             //1. 将上一层的被观察者传递给成员变量
           super(source);
             //2. 将抽象 scheduler赋值给当前成员变量
           this.scheduler = scheduler;
       }
   }
   ```

   根据上面时序图可知，上面代码中注释一 其实就是 `ObservableCreate`, 而 `scheduler` 就是 `IOscheduler`；

5. 接着又在 ObservableSubscribeOn 中调用 Observable 的 observeOn 操作符

   ```java
   public abstract class Observable<T> implements ObservableSource<T> {
   @CheckReturnValue
       @SchedulerSupport(SchedulerSupport.CUSTOM)
       public final Observable<T> observeOn(Scheduler scheduler, boolean delayError, int bufferSize) {
           ObjectHelper.requireNonNull(scheduler, "scheduler is null");
           ObjectHelper.verifyPositive(bufferSize, "bufferSize");
           return RxJavaPlugins.onAssembly(new ObservableObserveOn<T>(this, scheduler, delayError, bufferSize));
       }

   }
   ```

   这里返回一个 ObservableObserveOn 被观察者，我们看下初始化代码

6. ObservableObserveOn 初始化

   ```java
   public final class ObservableObserveOn<T> extends AbstractObservableWithUpstream<T, T> {

       final Scheduler scheduler;
       final boolean delayError;
       final int bufferSize;

       public ObservableObserveOn(ObservableSource<T> source, Scheduler scheduler, boolean delayError, int bufferSize) {
             //1. source 代表上一个被观察者
           super(source);
             //2. 这里指 HandlerScheduler
           this.scheduler = scheduler;
           this.delayError = delayError;
           this.bufferSize = bufferSize;
       }
   }
   ```

   根据代码注释一可知 source 是上一个被观察者，也就是 `ObservableSubscribeOn`,注释二根据流程图可以知道它是 `HandlerScheduler`;

7. 接着看被观察者订阅函数

   ```java
   public abstract class Observable<T> implements ObservableSource<T> {
       @SchedulerSupport(SchedulerSupport.NONE)
       @Override
       public final void subscribe(Observer<? super T> observer) {
           //1. 判空
           ObjectHelper.requireNonNull(observer, "observer is null");
           try {
               //2. hook ,返回一个观察者
               observer = RxJavaPlugins.onSubscribe(this, observer);
               //3. 判空
               ObjectHelper.requireNonNull(observer, "The RxJavaPlugins.onSubscribe hook returned a null Observer. Please change the handler provided to RxJavaPlugins.setOnObservableSubscribe for invalid null returns. Further reading: https://github.com/ReactiveX/RxJava/wiki/Plugins");
               //4. 内部调用 subscribeActual 函数
               subscribeActual(observer);
           } catch (NullPointerException e) { // NOPMD
               throw e;
           } catch (Throwable e) {
             ...
           }
       }
   }
   ```

   根据流程可知当前的 Observable 是在 ObservableObserveOn 中调用的，所以根据注释 4 可知，实现类是在 ObservableObserveOn 中；

8. ObservableObserveOn 的 subscribeActual 函数实现

   ```java
   public final class ObservableObserveOn<T> extends AbstractObservableWithUpstream<T, T> {

       @Override
       protected void subscribeActual(Observer<? super T> observer) {
           if (scheduler instanceof TrampolineScheduler) {
               source.subscribe(observer);
           } else {
               //1.返回 HandlerWorker
               Scheduler.Worker w = scheduler.createWorker();
               //2. 这里代表回调到上一个被观察者
               source.subscribe(new ObserveOnObserver<T>(observer, w, delayError, bufferSize));
           }
       }
   }
   ```

   根据注释可知先拿到 HandlerWorker 然后执行上一层的 被观察者，根据流程可以这里的 source 是 ObservableSubscribeOn；

9. 将 ObserveOnObserver 对象传递给 ObservableSubscribeOn 的 subscribeActual 函数

   ```java
   public final class ObservableSubscribeOn<T> extends AbstractObservableWithUpstream<T, T> {
       final Scheduler scheduler;

   ...
       @Override
       public void subscribeActual(final Observer<? super T> observer) {
           //1. 包装观察者对象
           final SubscribeOnObserver<T> parent = new SubscribeOnObserver<T>(observer);
           //2. 这里的 observer 代表的是 ObserveOnObserver
           observer.onSubscribe(parent);
           //3. 设置被观察者的运行线程 scheduler 代表的是 IOScheduler ，SubscribeTask 是一个 Runnable 运行在子线程中的
           parent.setDisposable(scheduler.scheduleDirect(new SubscribeTask(parent)));
       }
   }
   ```

   上面代码注释一是包装 observer -&gt; ObserveOnObserver , 注释二这一步是在 ObserveOnObserver 中实现的，最后是订阅成功的功能；注释三这一步才是线程切换的核心代码，首先看 `scheduler.scheduleDirect(new SubscribeTask(parent))`

10. scheduler.scheduleDirect\(new SubscribeTask\(parent\)\) 实现

    ```java
    public abstract class Scheduler {   
    @NonNull
        public Disposable scheduleDirect(@NonNull Runnable run) {
              //1. 调用内部的重载函数
            return scheduleDirect(run, 0L, TimeUnit.NANOSECONDS);
        }
          @NonNull
        public Disposable scheduleDirect(@NonNull Runnable run, long delay, @NonNull TimeUnit unit) {
            //2. 创建 IoSchedule
            final Worker w = createWorker();
            //3 run 代表的是  SubscribeTask
            final Runnable decoratedRun = RxJavaPlugins.onSchedule(run);
            //4. 对 SubscribeTask ，IoSchedule 进行包装
            DisposeTask task = new DisposeTask(decoratedRun, w);
            //5 执行 IoSchedule 中的 schedule 函数
            w.schedule(task, delay, unit);
            return task;
        }
    }
    ```

    根据注释 1-4 前面是初始化和包装线程，重要的是注释5 接着往下看。

11. 执行 IoSchedule 中的 schedule 函数

    ```java
    public final class IoScheduler extends Scheduler {        
    @NonNull
    @Override
    public Disposable schedule(@NonNull Runnable action, long delayTime, @NonNull TimeUnit unit) {
      if (tasks.isDisposed()) {
        // don't schedule, we are unsubscribed
        return EmptyDisposable.INSTANCE;
        }
        //1. action 代表的是 DisposeTask
        return threadWorker.scheduleActual(action, delayTime, unit, tasks);
        }
    }
    ```

    接着跟 threadWorker.scheduleActual

12. threadWorker.scheduleActual 函数实现

    ```java
    public class NewThreadWorker extends Scheduler.Worker implements Disposable {   
    public ScheduledRunnable scheduleActual(final Runnable run, long delayTime, @NonNull TimeUnit unit, @Nullable DisposableContainer parent) {
            //1. run 代表的是 DisposeTask
            Runnable decoratedRun = RxJavaPlugins.onSchedule(run);
            //2. decoratedRun 代表的是 DisposeTask
            ScheduledRunnable sr = new ScheduledRunnable(decoratedRun, parent);

            if (parent != null) {
                if (!parent.add(sr)) {
                    return sr;
                }
            }

            Future<?> f;
            try {
                if (delayTime <= 0) {
                  //3. 线程池执行子线程任务
                    f = executor.submit((Callable<Object>)sr);
                } else {
                    f = executor.schedule((Callable<Object>)sr, delayTime, unit);
                }
                sr.setFuture(f);
            } catch (RejectedExecutionException ex) {
            ...
            }

            return sr;
        }

    }
    ```

    到这里我们已经找到了执行层中具体执行逻辑了。线程池执行那么就会回调 `SubscribeTask` run 函数，我们跟着看下 run 具体实现。

13. SubscribeTask run 具体实现

    ```java
    public final class ObservableSubscribeOn<T> extends AbstractObservableWithUpstream<T, T> {
        final Scheduler scheduler;

    ...

    final class SubscribeTask implements Runnable {
            private final SubscribeOnObserver<T> parent;

            SubscribeTask(SubscribeOnObserver<T> parent) {
                this.parent = parent;
            }

            @Override
            public void run() {
                //1. 这里代表的是上一个被观察者对象，这里的也就是 create 操作符
                source.subscribe(parent);
            }
        }
    }
    ```

    可以看到 SubscribeTask 是 ObservableSubscribeOn 的非静态内部类，那么根据上面流程可知 source 其实就是 ObservableCreate 被观察者

14. 被观察者 ObservableCreate 的 subscribeActual 实现

    ```java
    public final class ObservableCreate<T> extends Observable<T> {
        final ObservableOnSubscribe<T> source;

        public ObservableCreate(ObservableOnSubscribe<T> source) {
            //赋值给成员变量
            this.source = source;
        }

        @Override
        protected void subscribeActual(Observer<? super T> observer) {
            //1. 创建一个发射器
            CreateEmitter<T> parent = new CreateEmitter<T>(observer);
            //2. 子线程 SubscribeOnObserver
            observer.onSubscribe(parent);
            try {
                //3. 发射器回调
                source.subscribe(parent);
            } catch (Throwable ex) {
                Exceptions.throwIfFatal(ex);
                parent.onError(ex);
            }
        }
    }
    ```

    根据上面代码注释可知先创建一个发射器，然后调用下游的 ObservableSubscribeOn\#SubscribeOnObserver 的 onSubscribe 函数，最后回调发射器 subscribe ，现在可以进行数据传递了。其实到这里`emitter.onNext("1");` 已经是在子线程中了，那么我们在跟一下发射数据到接收数据之间线程的切换。

15. emitter.onNext\("1"\) 执行

    ```java
    public final class ObservableCreate<T> extends Observable<T> {        
    //1. 调用层 调用
    @Override
    public void onNext(T t) {
        if (t == null) {
            onError(new NullPointerException("onNext called with null. Null values are generally not allowed in 2.x operators and sources."));
            return;
        }
        if (!isDisposed()) {
        //1.1 回调到下游
        observer.onNext(t);
        }
    }
    ```

    根据执行流程时序图可知，这里的 observer 是 ObservableCreate 的下游 ObservableSubscribeOn\#SubscribeOnObserver.onNext\(T t\) 继续跟

16. ObservableSubscribeOn\#SubscribeOnObserver.onNext\(T t\) 实现

    \`\`\`java //线程切换的主要实现 public final class ObservableSubscribeOn extends AbstractObservableWithUpstream { final Scheduler scheduler;

    ...

```text
static final class SubscribeOnObserver<T> extends AtomicReference<Disposable> implements Observer<T>, Disposable {        
@Override
        public void onNext(T t) {
            downstream.onNext(t);
        } 
    }
```

代码中的 downstream 也代表的是下游 Observer, 继续跟 
```

1. ObservableObserveOn\#ObserveOnObserver.next\(\)

   ```java
           @Override
           public void onNext(T t) {
               if (done) {
                   return;
               }

               if (sourceMode != QueueDisposable.ASYNC) {
                     //任务放入队列中
                   queue.offer(t);
               }
                 //调用内部重载
               schedule();
           }

           void schedule() {
               if (getAndIncrement() == 0) {
                   worker.schedule(this);
               }
           }
   ```

   这里的 worker 是 HandlerScheduler\#HandlerWorker

2. HandlerWorker.schedule 函数具体实现

   ```java
   public Disposable schedule(Runnable run, long delay, TimeUnit unit) {
       if (run == null) throw new NullPointerException("run == null");
       if (unit == null) throw new NullPointerException("unit == null");
       if (disposed) {
           return Disposables.disposed();
       }

       run = RxJavaPlugins.onSchedule(run);
       //1. 对 Runnable 进行包装
       ScheduledRunnable scheduled = new ScheduledRunnable(handler, run);
       //2. 对象池中拿到 message
       Message message = Message.obtain(handler, scheduled);
       message.obj = this; // Used as token for batch disposal of this worker's runnables.

     if (async) {
           message.setAsynchronous(true);
       }
       //3. 发送数据
       handler.sendMessageDelayed(message, unit.toMillis(delay));
       //4. 如果停止发送数据，就删除主线程回调
       if (disposed) {
           handler.removeCallbacks(scheduled);
       return Disposables.disposed();
       }
       return scheduled;
   }
   ```

   上面代码就是子线程切换到主线程的主要代码，没错就是 handler, 当 handler sendMessageDelayed 会回调 Runnable 的 run 函数，不知道有没有人发现这里的 runnable 接收的数据在哪里，没错根据 `worker.schedule(this);` 的 this 可知，它就是 ObserveOnObserver 观察者，实现了 runnable 对象，接下来看 ObserveOnObserver run 函数

3. ObserveOnObserver run 函树实现

   \`\`\`java @Override public void run\(\) { if \(outputFused\) { drainFused\(\); } else { drainNormal\(\); } }

```text
        void drainNormal() {
            int missed = 1;

            final SimpleQueue<T> q = queue;
            final Observer<? super T> a = downstream;

            for (;;) {
                if (checkTerminated(done, q.isEmpty(), a)) {
                    return;
                }

                for (;;) {

                      ...
                                        //回调到调用层
                    a.onNext(v);
                }
                                ...
            }
        }
```

最后 a.onNext(v); 回调到了调用层。

到这里整个线程切换已经讲完了，相信大家对 Rxjava 的线程切换有了一定的认识了。
```

## 总结

不知道大家在看时序图的时候有没有发现，其实初始化的时候跟流水线一样，将一个原始的产品经过重重包装，最后包装完然后利用抽象 subscribeActual 函数，一步一步又回滚上去，最后发射数据又经过重重传递最后回调到调用层，这才算是一个完整过程。

其实我对 Rxjava 的理解，有点像接口回调一样，基本上靠回调传递数据。

大家如果还有不理解的可以根据我绘制的时序图跟着源代码走一遍。

