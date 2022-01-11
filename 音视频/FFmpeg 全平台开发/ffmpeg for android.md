```
#!/bin/bash

#配置 Android SDK PATH
export ANDROID_HOME=$ANDROID_SDK
#配置 Android  NDK PATH
export ANDROID_NDK_ROOT=/Users/devyk/Data/Android/NDK/android-ndk-r20b

echo $ANDROID_HOME
echo $ANDROID_NDK_ROOT

#./android.sh --help


./android.sh \
        --lts \
        --speed \
        --disable-x86 \
        --disable-x86-64 \
        --disable-arm-v7a-neon \
        --enable-gpl \
        --enable-gnutls \
        --enable-android-zlib \
        --enable-android-media-codec \
        --enable-libass \
        --enable-freetype \
        --enable-fontconfig \
        --enable-fribidi \
        --enable-gmp \
        --enable-x265 \
        --enable-x264 \
        --enable-libwebp \
        --enable-lame \
```