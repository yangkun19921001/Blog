##基本使用：

###变量缓存 PARENT_SCOPE

CMake中的set用于给一般变量，缓存变量，环境变量赋值。

```
set(<variable> <value>
    [[CACHE <type> <docstring> [FORCE]] | PARENT_SCOPE])
```

