# Ubuntu Bionic 기반
FROM ubuntu:bionic

# 기본 패키지 설치
RUN set -x \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential git wget golang \
       python3 python3-pip python3-setuptools python3-wheel ninja-build \
       libgstreamer1.0-dev libgirepository1.0-dev libunwind-dev apt-utils libsrtp-dev \
       gdb libmicrohttpd-dev libjansson-dev libnice-dev \
       libssl-dev libsofia-sip-ua-dev libglib2.0-dev libopus-dev libogg-dev \
       libconfig-dev libavutil-dev libavcodec-dev libavformat-dev libnanomsg-dev \
       libcurl4-openssl-dev liblua5.3-dev pkg-config gengetopt libtool automake \
       curl jq httpie vim screen doxygen graphviz \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Node.js 16 및 npm 설치
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g wscat

# CMake 설치
RUN set -x \
    && wget https://cmake.org/files/v3.16/cmake-3.16.2.tar.gz \
    && tar -xvzf cmake-3.16.2.tar.gz \
    && cd cmake-3.16.2 \
    && ./bootstrap --prefix=/usr/local \
    && make -j$(nproc) && make install \
    && cd .. && rm -rf cmake-3.16.2 cmake-3.16.2.tar.gz

# Clang 10 설치 및 설정
RUN set -x \
    && apt-get update \
    && apt-get install -y clang-10 \
    && update-alternatives --install /usr/bin/clang clang /usr/bin/clang-10 100 \
    && update-alternatives --install /usr/bin/clang++ clang++ /usr/bin/clang++-10 100

# boringssl 설치
RUN set -x \
    && git clone https://boringssl.googlesource.com/boringssl \
    && cd boringssl \
    && mkdir build \
    && cd build \
    && cmake -GNinja -DCMAKE_C_COMPILER=clang -DCMAKE_CXX_COMPILER=clang++ -DCMAKE_C_FLAGS="-Wno-error" .. \
    && ninja \
    && mkdir -p /opt/boringssl/lib \
    && cp ssl/libssl.a /opt/boringssl/lib/ \
    && cp crypto/libcrypto.a /opt/boringssl/lib/ \
    && cp -r ../include /opt/boringssl/ \
    && cd ../.. \
    && rm -rf boringssl

# Python 패키지 설치
RUN set -x \
    && python3 -m pip install --upgrade pip \
    && python3 -m pip install scikit-build \
    && python3 -m pip install meson ninja

# libsrtp 설치
RUN set -x \
    && wget https://github.com/cisco/libsrtp/archive/v2.2.0.tar.gz \
    && tar xfv v2.2.0.tar.gz  \
    && cd libsrtp-2.2.0/ \
    && ./configure --prefix=/usr --enable-openssl \
    && make shared_library && make install \
    && cd .. && rm -rf libsrtp-2.2.0 v2.2.0.tar.gz

# libwebsockets 설치
RUN set -x \
    && git clone https://github.com/warmcat/libwebsockets.git \
    && cd libwebsockets \
    && mkdir build \
    && cd build \
    && cmake -DLWS_MAX_SMP=1 -DLWS_WITHOUT_EXTENSIONS=0 -DCMAKE_INSTALL_PREFIX:PATH=/usr -DCMAKE_C_FLAGS="-fpic" .. \
    && make -j$(nproc) && make install \
    && cd ../.. && rm -rf libwebsockets

# libnice 설치
RUN set -x \
    && git clone https://gitlab.freedesktop.org/libnice/libnice \
    && cd libnice \
    && meson --prefix=/usr build && ninja -C build && ninja -C build install \
    && cd .. && rm -rf libnice

# Janus 빌드 및 설치
RUN export JANUS_WITH_POSTPROCESSING
RUN set -x \
    && git clone https://github.com/meetecho/janus-gateway.git \
    && cd janus-gateway \
    && sh autogen.sh \
    && ./configure --prefix=/opt/janus \
    && make -j$(nproc) \
    && make install \
    && make configs \
    && cd .. && rm -rf janus-gateway

# WebSockets 및 TURN/STUN 서버 설정 추가
RUN echo ' \
general: { \
        ws = true \n\
        ws_port = 8188 \n\
        ws_interface = "0.0.0.0" \n\
        secure = false \n\
        ws_pingpong_interval = 50 \n\
        ws_pingpong_timeout = 500 \n\
} \
' > /opt/janus/etc/janus/janus.transport.websockets.jcfg

# TURN/STUN 설정 추가
RUN echo ' \
nat: { \n\
    stun_server = "stun.l.google.com" \n\
    stun_port = 19302 \n\
    turn_server = "turn:coturn-container" \n\
    turn_port = 3478 \n\
    turn_type = "udp" \n\
    turn_user = "jootalkpia" \n\
    turn_pwd = "1234" \n\
} \n\
' >> /opt/janus/etc/janus/janus.jcfg

# WebSockets transport 활성화
RUN echo 'include = janus.transport.websockets.jcfg' >> /opt/janus/etc/janus/janus.jcfg

# 불필요한 소스 삭제
RUN set -x \
    && rm -rf /libwebsockets \
    && rm -rf /janus-gateway \
    && rm -rf /boringssl

# janus 사용자 추가 및 권한 설정
RUN adduser --disabled-password --gecos '' janus
RUN chown -R janus:janus /opt/janus
RUN chmod -R 755 /opt/janus
USER janus

EXPOSE 8188 3478/udp 5349/tcp 5349/udp

# 컨테이너 실행 시 Janus 실행
CMD ["/opt/janus/bin/janus"]