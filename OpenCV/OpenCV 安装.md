## Linux 安装

```shell
#opencv 环境 4.5.5
#安装依赖包
sudo yum install freeglut-devel mesa-libGL mesa-libGL-devel  boost boost-thread boost-devel libv4l-devel libjpeg-turbo-devel libtiff-devel  libdc1394-devel tbb-devel eigen3-devel gstreamer-plugins-base-devel python-devel numpy python34-numpy gtk2-devel libpng-devel jasper-devel openexr-devel libwebp-devel python3 python3-devel python3-pip  python3-devel python3-numpy
#下载 OpenCV 源码 

wget -O opencv-4.5.5.zip         https://github.com/opencv/opencv/archive/refs/tags/4.5.5.zip
wget -O opencv_contrib-4.5.5.zip https://github.com/opencv/opencv_contrib/archive/refs/tags/4.5.5.zip
unzip opencv-4.5.5.zip
unzip opencv_contrib-4.5.5.zip

cd opencv-4.5.5
mkdir build && cd build

OPENCV_CONTRIB_DIR=/root/opencv/opencv_contrib-4.5.5/modules

cmake -D CMAKE_BUILD_TYPE=RELEASE \
    -D CMAKE_INSTALL_PREFIX=/usr/local \
    -D INSTALL_C_EXAMPLES=ON \
    -D INSTALL_PYTHON_EXAMPLES=ON \
    -D OPENCV_GENERATE_PKGCONFIG=ON \
    -D OPENCV_EXTRA_MODULES_PATH="${OPENCV_CONTRIB_DIR}" \
    -D BUILD_EXAMPLES=ON ..

#使用 8cpu 编译并安装    
make -j8 && make install    

```



### MAC 安装

```
brew install opencv
```

