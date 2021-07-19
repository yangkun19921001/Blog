Android defaultConfig 下 配置 ndk 编译平台

```groovy
apply plugin: 'com.android.library'

android {

  ...
    defaultConfig {
      
        ndk {
            // 设置编译的 SO 库架构
            abiFilters 'arm64-v8a', 'armeabi-v7a'
        }
    }

  ...

    sourceSets.main {
        jniLibs.srcDirs 'src/main/libs'
        jni.srcDirs = [] // This prevents the auto generation of Android.mk
    }
  
      externalNativeBuild{
        ndkBuild{
            path "src/main/jni/Android.mk"
        }
    }
}

...
```





参考

- [ndk代码调试](https://cloud.tencent.com/developer/article/1013470)