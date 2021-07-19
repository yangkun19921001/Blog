## olive 开源项目编译

### ocio 编译

```shell
#!/usr/bin/env bash
# Copyright (C) 2021 Olive Team
# SPDX-License-Identifier: GPL-3.0-or-later

sudo rm -rf ocio/
sudo rm -rf $(pwd)/../../temp/ocio
set -ex
mkdir ocio
cd ocio
export CC=/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/cc
export CXX=/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/c++
#git clone --depth 1 --branch "${OCIO_VERSION}" https://github.com/AcademySoftwareFoundation/OpenColorIO.git
git clone  https://github.com/AcademySoftwareFoundation/OpenColorIO.git
cd OpenColorIO
git checkout v2.0.0


mkdir build
cd build

#cd ocio/OpenColorIO/build

#OLIVE_INSTALL_PREFIX=/Users/devyk/Data/qt/project/olive/temp/ocio
#mkdir -p /Users/devyk/Data/qt/project/olive/temp/ocio
OLIVE_INSTALL_PREFIX=/usr/local
echo "------------>$OLIVE_INSTALL_PREFIX"

cmake \
    -DCMAKE_INSTALL_PREFIX="${OLIVE_INSTALL_PREFIX}" \
    -DCMAKE_BUILD_TYPE=RelWithDebInfo \
    -DOCIO_BUILD_APPS=OFF \
    -DOCIO_BUILD_NUKE=OFF \
    -DOCIO_BUILD_DOCS=OFF \
    -DOCIO_BUILD_TESTS=OFF \
    -DOCIO_BUILD_GPU_TESTS=OFF \
    -DOCIO_USE_HEADLESS=OFF \
    -DOCIO_BUILD_PYTHON=OFF \
    -DOCIO_BUILD_JAVA=OFF \
    -DOCIO_WARNING_AS_ERROR=OFF \
    -DOCIO_INSTALL_EXT_PACKAGES=ALL \
    ..
sudo make -j$(sysctl -n hw.ncpu)
sudo make install

cd ../..
OCIO_CONFIGS_VERSION=1.0_r2
curl --location "https://github.com/imageworks/OpenColorIO-Configs/archive/refs/tags/v${OCIO_CONFIGS_VERSION}.tar.gz" -o "ocio-configs.tar.gz"
tar -zxf ocio-configs.tar.gz
cd "OpenColorIO-Configs-${OCIO_CONFIGS_VERSION}"

sudo mkdir "${OLIVE_INSTALL_PREFIX}/openColorIO"
sudo cp nuke-default/config.ocio "${OLIVE_INSTALL_PREFIX}/openColorIO/"
sudo cp -r nuke-default/luts "${OLIVE_INSTALL_PREFIX}/openColorIO/"

cd ../..
sudo rm -rf ocio

```

