### 执行 jar 命令

https://www.cnblogs.com/jack204/archive/2012/07/02/2572932.html

```shell
java -cp jni/out/artifacts/jni_jar/jni.jar com.bytesflow.media.jni.DeteceBlurUtils2 "/Users/devyk/Data/Project/piaoquan/PQMedia/jni/temp"

```

```
java -cp jni/out/artifacts/jni_jar/jni.jar -Xms512M -Xmx2048M -XX:PermSize=512M -XX:MaxPermSize=1024M com.bytesflow.media.jni.DeteceBlurUtils2 "/root/image"

java -cp /Users/devyk/Data/Project/sample/github_code/OpenCVSam
ple/output/jar/libpq-cv-media.jar com.bytesflow.opencv.media.test.OpenCVImageBlurTest /Users/devyk/Downloads/IMG_3067.PNG /Users/devyk/Data/Project/sample/github_code/OpenCVSample/output/lib/libpiaoquan_java_opencv.dylib 5


java -cp /root/PQCVMedia/output/jar/libpq-cv-media.jar com.bytesflow.opencv.media.test.OpenCVImageBlurTest /root/image/IMG_3067.PNG /root/PQCVMedia/output/lib/libpiaoquan_java_opencv.so 5

Xms:堆内存初始大小
Xmx:堆内存最大值
PermSize:永久内存初始大小
MaxPermSize：永久内存最大值
```

