# 设计模式 \( 八 \) 状态模式

### 介绍

状态模式中的行为是由状态来决定的，不同的状态下有不同的行为。状态模式和策略模式的结构几乎完全一样，但它们的目的、本质却完全不一样。状态模式的行为是平行的、不可替换的，策略模式的行为是彼此独立、可相互替换的。用一句话来表述，状态模式把对象的行为包装在不同的状态对象里，每一个状态对象都有一个共同抽象状态的基类。状态模式的意图是让一个对象在其内部改变的时候，其行为也随之改变。

### 定义

当一个对象的内在状态改变时允许改变其行为，这个对象看起来看是改变了其类。

### 使用场景

1. 一个对象的行为取决于它的状态，并且它必须在运行时根据状态改变它的行为。
2. 代码中包含大量与对象状态有关的条件语句，例如，一个操作中含有庞大的分支语句 \(if-else / switch-case\) , 且这些分支依赖于该对象的状态。

状态模式将每一个条件分支放入一个独立的类中，这使得你可以根据对象自身的状态作为一个对象，这一对象可以不依赖于其他对象而独立变化，这样通过多态来去除过多的、重复的 if - else 等分支语句。

### XML 类图

[![hUuM6.png](https://storage7.cuntuku.com/2019/09/07/hUuM6.png)](https://cuntuku.com/image/hUuM6)

* Context: 环境类，定义客户感兴趣的接口，维护一个 State 子类的实例，这个实例定义了对象的当前状态。
* State: 抽象状态类或者状态接口，定义一个或者一组接口，表示该状态下的行为。
* ConcreteStateA、ConcreteStateB: 具体状态类，每一个具体的状态类实现抽象 State 中定义的接口，从而达到不同状态下的不同行为。

### 实战

在开发中，我们用到状态模式最常见的地方应该是用户登录系统。在用户登录和未登录的情况下，对于同一事件的处理行为是不一样的，例如，在淘宝中，用户在未登录的情况下点击购买，此时会先让用户登录，然后在做购买支付的操作。

下面我们就用状态模式来简单实现这个过程，首先创建 2 个 Activity , 一个是 LoginActivity, 一个是 HomeActivity , HomeActivity 是应用入口，有购买和注销用户功能。

```java
//抽取公共的状态类
public interface IUserState {

    /**
     * 购物
     * @param id
     */
    void Shopping(Context context,int id);

    /**
     * 注销
     * @param context
     * @param token
     */
    void loginOut(Context context,String token);
}
```

```java
//具体登录状态实现类
public class LoginState implements IUserState {
    private String TAG = getClass().getSimpleName();

    @Override
    public void Shopping(Context context,int id) {
        Log.i(TAG, "购买商品-》" + id + " 即将支付");
        Toast.makeText(context,"购买商品-》" + id + " 即将支付",Toast.LENGTH_LONG).show();
    }

    @Override
    public void loginOut(Context context,String token) {
        Log.i(TAG, "退出系统成功");
        Toast.makeText(context,"退出系统成功",Toast.LENGTH_LONG).show();
    }
}
```

```java
//具体未登录状态实现类
public class LogoutState implements IUserState {
    private String TAG = getClass().getSimpleName();

    @Override
    public void Shopping(Context context, int id) {
        gotoLogin(context);

    }

    private void gotoLogin(Context context) {
        Intent intent = new Intent(context, LoginActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);

    }

    @Override
    public void loginOut(Context context, String token) {
        Log.i(TAG, "已经是退出状态");
    }


}
```

Context 登录状态管理类:

```java
public class LoginContext {
    /**
     * 用户状态 默认未登录
     */
    private IUserState mIuserState = new LogoutState();

    private LoginContext() {
    }

    public void shopping(Context context,int id) {
        mIuserState.Shopping(context,id);
    }

    /**
     * 静态内部类单例
     */
    private static class LoginHolder {
        private static LoginContext loginContext = new LoginContext();
    }

    public static LoginContext getInstance() {
        return LoginHolder.loginContext;
    }

    /**
     * 注入用户的状态
     * @param userState
     */
    public void setState(IUserState userState){
        this.mIuserState = userState;
    }
}
```

UI 操作

```java
public class LoginActivity extends Activity {

    private EditText mUser;
    private EditText mPwd;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_login);

        mUser = findViewById(R.id.etUser);
        mPwd = findViewById(R.id.etPwd);

    }

    public void login(View view) {
        if (mUser.getText().toString().trim().equals("123456") && mPwd.getText().toString().trim().equals("123456")) {
            LoginContext.getInstance().setState(new LoginState());
            Toast.makeText(getApplicationContext(), "登录成功", Toast.LENGTH_LONG).show();
            startActivity(new Intent(this, HomeActivity.class));
            finish();
        }
    }
}
```

```java
public class HomeActivity extends Activity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_home);
    }

    public void logout(View view) {
        LoginContext.getInstance().setState(new LogoutState());
    }

    public void shopping(View view) {
        LoginContext.getInstance().shopping(getApplicationContext(),199);
    }
}
```

用户默认是未登录状态，此时用户在 HomeActivity 界面点击购物时，会先跳转到 LoginActivity 页面，然后登录成功之后在返回到 HomeActivity 页面，此时，用户再次点击购物就可以实现该功能了。

### 总结

状态模式的关键点在于不同的状态下对于同一行为有不同的响应，这其实就是一个将 if~else 用多态来实现的一个具体示例，模式的运用一定要考虑所处的情景以及你要解决的问题，只有符合特定的场景才建议使用对应的模式。

**优点：**

State 模式将所有与一个特性的状态相关的行为都放入一个状态对象中，它提供了一个更好的方法来组织与特定状态相关的代码，将繁琐的状态判断转换成结构清晰的状态类族，在避免代码膨胀的同时也保证了可扩展性与可维护性。

**缺点：**

状态模式的使用必然会增加系统类和对象的个数。

[文章代码地址](https://github.com/yangkun19921001/AndroidDpCode)

## 特别感谢

[《 Android 源码设计模式解析与实战 》](https://item.jd.com/12113187.html)

感谢你的阅读，谢谢！

