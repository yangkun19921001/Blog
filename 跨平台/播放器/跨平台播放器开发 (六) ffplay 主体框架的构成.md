## 简介

从该篇开始，跨平台播放器将不以 QT 为主，为什么呢？因为 QT 不是我们主要学习的范围，我们主要还是学习如何基于 ffmpeg 等基础库来打造一个真正的跨平台播放器 SDK 。

计划该播放器的核心会基于 ffplay 二次开发，为什么需要二次开发呢？因为目前的 ffplay 实在是很不方便扩展，基本上所有逻辑都写在一个 c 文件中。那么为了解决不易扩展，所以就构思了一套基于 ffplay 二次开发的想法(移动端后面会参考 ijk)，既然是二次开发，功能肯定比之前强大，所以我规划了如下几点:



**Android**

- cpu: ARMv7a, ARM64v8a
- api:类似于 MediaPlayer
- 视频渲染: OpenGL ES
- 音频渲染: OpenSL ES
- 硬件解码: NDK MediaCodec (Android 5.0 +)
- 倍速播放
- 截取片段保存 GIF

**IOS**

- cpu: armv7, arm64
- api:类似于 MediaPlayer.framework
- 视频渲染: OpenGL ES
- 音频输出: AudioQueue、AudioUnit
- 硬件解码器：VideoToolbox（iOS 8+）
- 倍速播放
- 截取片段保存 GIF

**PC**

- SDL



目前 PC 端的代码已经差不多写完了，可以看下工程结构及效果:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c91936da73a54973954cae9335403174~tplv-k3u1fbpfcp-zoom-1.image)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/276f7baeaed04063b75a7283edf9af31~tplv-k3u1fbpfcp-zoom-1.image)

代码等到后面写的差不多在开源出来 ~

后续的文章基本上是上部分分析源码，然后下部分进行实践的一个思路进行。

下面我们主要分析 ffplay 主体框架的一个构成

## ffplay 是什么

ffplay 是 ffmpeg 自带的跨平台播放器，使用 C 语言编写。当你在编译 ffmpeg 添加如下参数 **--enable-ffplay** 的时候 ，编译完成会在 **output/bin/**  下产生一个 ffplay  可执行文件，使用 **ffplay xxx.mp4** 就可以播放一个媒体文件，它主要是以 ffmpeg + sdl 实现的一个播放器。其实大名鼎鼎的 [ijkplayer](https://github.com/bilibili/ijkplayer) 就是基于 ffplay.c 进行的二次开发，所以掌握 ffplay 原理对我们开发播放器有非常大的帮助。



## ffplay 框架分析

目前 ffplay 主要以 main ui，read_thread，audio_thread,  video_thread, audioqueue_thread(sdl 音频渲染) 5个线程构建而成，下图展示的是整体的流程:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8017895c0e5942279a645d603b2b4e97~tplv-k3u1fbpfcp-zoom-1.image)



### stream_open 播放器初始化

stream_open 内部就做了 4 件事

1. 音频/视频/字幕解码完成数据按照设定的固定队列大小进行初始化->  `frame_queue_init` 
2. 音频/视频/字幕待解码 packet 队列进行初始化->  `packet_queue_init` 
3. 按照音频/视频/外部时钟进行初始化 `init_clock`
4. 使用 sdl 封装好的 `SDL_CreateThread` 函数来创建读取解封装的媒体数据线程

### 线程

#### main 主线程

1. 配置命令参数，并且调用 `stream_open` 初始化播放器需要的参数，最后开启 read_thread 线程
2. 通过 SDL 在主线程中渲染视频

#### read_thread 读取解封装数据线程

1. `avformat_open_input` 打开媒体文件
2. 找到对应 音频/视频/字幕 码流信息
3. 根据对应的码流信息打开对应的 音频/视频/字幕 解码器，并开启各自的线程进行解码
4. 开始 `av_read_frame` 轮训读取待解码的数据 `packet`,然后调用 `packet_queue_put` 将 `AVPacket` 存起来

#### audio_decoder/video_decoder/subtitle_decoder 解码线程

1. 从 packet queue 去读对应码流 AVPacket ，调用对应解码器，将解码好的  AVFrame 存入 frame queue 队列中

#### audioqueue_thread -> sdl_audio_callback 音频渲染线程

1. 从解码好的 AVFrame pcm 数据 copy -> sdl 进行播放

### 内部核心功能

**音画同步机制**

- 以音频为主
- 以视频为主
- 以外部时钟为主

**音频处理**

- 音频控制

- 静音控制

- PCM 归一化

**视频处理**

- YUV -> RGB
- scale

**控制**

- 播放，暂停，停止，快进，快退，逐帧播放，静音

## 数据结构分析

### VideoState 播放器整体管理结构体

**VideoState** 主要是对播放器的全局属性做一个封装，有以下字段:

```c
typedef struct VideoState {
    SDL_Thread *read_tid;                // 读取解封装线程句柄
    AVInputFormat *iformat;              // 传入指定的输入格式，指向 demuxer
    int abort_request;                   // =1 时请求退出播放
    int force_refresh;                   // =1 时需要刷新画面，请求立即刷新画面的意思
    int paused;                          // =1 时暂停，=0 时播放
    int last_paused;           					 // 暂存“暂停”/“播放”状态
    int queue_attachments_req;					 // 请求 mp3、aac 等音频文件的封面
    int seek_req;              					 // 标识一次 seek 请求
    int seek_flags;            					 // seek 标志，诸如 AVSEEK_FLAG_BYTE 等
    int64_t seek_pos;          					 // 请求 seek 的目标位置(当前位置+增量)
    int64_t seek_rel;          					 // 本次 seek 的位置增量
    int read_pause_return;
    AVFormatContext *ic;       					 // 解封装得到格式上下文
    int realtime;           						 // =1 为实时流

    Clock audclk;             					 // 音频时钟
    Clock vidclk;             				 	 // 视频时钟
    Clock extclk;             					 // 外部时钟

    FrameQueue pictq;          					 // 解码后的视频 Frame 队列
    FrameQueue subpq;          					 // 解码后的字幕 Frame 队列
    FrameQueue sampq;          					 // 解码后的音频 Frame 队列

    Decoder auddec;             				 // 音频解码器
    Decoder viddec;             				 // 视频解码器
    Decoder subdec;             				 // 字幕解码器

    int audio_stream;          					 // 音频流索引

    int av_sync_type;           				 // 音视频同步类型, 默认视频向音频同步

    double audio_clock;                  // 当前音频帧的 PTS+当前帧 Duration
    int audio_clock_serial;              // 播放序列，seek 可改变此值
    // 以下4个参数 非audio master同步方式使用
    double audio_diff_cum;               // used for AV difference average computation
    double audio_diff_avg_coef;
    double audio_diff_threshold;
    int audio_diff_avg_count;
    // end

    AVStream *audio_st;                  // 音频码流信息
    PacketQueue audioq;                  // 音频 packet 队列
    int audio_hw_buf_size;               // SDL 音频缓冲区的大小(字节为单位)
    // 指向待播放的一帧音频数据，指向的数据区将被拷入SDL音频缓冲区。若经过重采样则指向 audio_buf1，
    // 否则指向frame中的音频
    uint8_t *audio_buf;             		 // 指向需要重采样的数据
    uint8_t *audio_buf1;            		 // 指向重采样后的数据
    unsigned int audio_buf_size;     		 // 待播放的一帧音频数据( audio_buf 指向)的大小
    unsigned int audio_buf1_size;    		 // 申请到的音频缓冲区 audio_buf1 的实际尺寸
    int audio_buf_index;            		 // 更新拷贝位置 当前音频帧中已拷入SDL音频缓冲区
    // 的位置索引(指向第一个待拷贝字节)
    // 当前音频帧中尚未拷入SDL音频缓冲区的数据量:
    // audio_buf_size = audio_buf_index + audio_write_buf_size
    int audio_write_buf_size;
    int audio_volume;               		 // 音量
    int muted;                      		 // =1静音，=0则正常
    struct AudioParams audio_src;        // 音频frame的参数
#if CONFIG_AVFILTER
    struct AudioParams audio_filter_src;
#endif
    struct AudioParams audio_tgt;       // SDL支持的音频参数，重采样转换：audio_src->audio_tgt
    struct SwrContext *swr_ctx;         // 音频重采样context
    int frame_drops_early;              // 丢弃视频packet计数
    int frame_drops_late;               // 丢弃视频frame计数

    enum ShowMode {
        SHOW_MODE_NONE = -1,    			 	// 无显示
        SHOW_MODE_VIDEO = 0,    				// 显示视频
        SHOW_MODE_WAVES,        				// 显示波浪，音频
        SHOW_MODE_RDFT,         				// 自适应滤波器
        SHOW_MODE_NB
    } show_mode;

    // 音频波形显示使用
    int16_t sample_array[SAMPLE_ARRAY_SIZE];    // 采样数组
    int sample_array_index;                     // 采样索引
    int last_i_start;                           // 上一开始
    RDFTContext *rdft;                          // 自适应滤波器上下文
    int rdft_bits;                              // 自使用比特率
    FFTSample *rdft_data;                       // 快速傅里叶采样

    int xpos;
    double last_vis_time;
    SDL_Texture *vis_texture;       						// 音频Texture

    SDL_Texture *sub_texture;       						// 字幕显示
    SDL_Texture *vid_texture;       						// 视频显示

    int subtitle_stream;           							// 字幕流索引
    AVStream *subtitle_st;          						// 字幕流
    PacketQueue subtitleq;          						// 字幕packet队列

    double frame_timer;             						// 记录最后一帧播放的时刻
    double frame_last_returned_time;    				// 上一次返回时间
    double frame_last_filter_delay;     				// 上一个过滤器延时

    int video_stream;               						// 视频流索引
    AVStream *video_st;             						// 视频流
    PacketQueue videoq;             						// 视频队列
    double max_frame_duration;      						// 一帧最大间隔. above this, we consider the jump a timestamp discontinuity
    struct SwsContext *img_convert_ctx; 				// 视频尺寸格式变换
    struct SwsContext *sub_convert_ctx; 				// 字幕尺寸格式变换
    int eof;            												// 是否读取结束

    char *filename;     												// 文件名
    int width, height, xleft, ytop; 						// 宽、高，x起始坐标，y起始坐标
    int step;           												// =1 步进播放模式, =0 其他模式

#if CONFIG_AVFILTER
    int vfilter_idx;
    AVFilterContext *in_video_filter;   				// the first filter in the video chain
    AVFilterContext *out_video_filter;  				// the last filter in the video chain
    AVFilterContext *in_audio_filter;   				// the first filter in the audio chain
    AVFilterContext *out_audio_filter;  				// the last filter in the audio chain
    AVFilterGraph *agraph;              				// audio filter graph
#endif
    // 保留最近的相应audio、video、subtitle流的steam index
    int last_video_stream, last_audio_stream, last_subtitle_stream;

    SDL_cond *continue_read_thread; 						// 当读取数据队列满了后进入休眠时，可以通过该condition唤醒读线程
} VideoState;
```



### Clock 时钟封装结构体

Clock 主要是对音频/视频/字幕的时间戳封装，它的结构体如下:

```c
// 这里讲的系统时钟 是通过 av_gettime_relative() 获取到的时钟，单位为微妙
typedef struct Clock {
    double pts;            // 时钟基础, 当前帧(待播放)显示时间戳，播放后，当前帧变成上一帧
    // 当前pts与当前系统时钟的差值, audio、video对于该值是独立的
    double pts_drift;      // clock base minus time at which we updated the clock
    // 当前时钟(如视频时钟)最后一次更新时间，也可称当前时钟时间
    double last_updated;   // 最后一次更新的系统时钟
    double speed;          // 时钟速度控制，用于控制播放速度
    // 播放序列，所谓播放序列就是一段连续的播放动作，一个seek操作会启动一段新的播放序列
    int serial;            // clock is based on a packet with this serial
    int paused;            // = 1 说明是暂停状态
    // 指向packet_serial
    int *queue_serial;      /* pointer to the current packet queue serial, used for obsolete clock detection */
} Clock;
```

主要调用 api 有如下几个:

```c
//初始化时钟，queue_serial 当前队列中播放的序号
void init_clock(Clock *c, int *queue_serial);

//设置时间戳
void set_clock(struct Clock *c, double pts, int serial);

//获取对应的时间戳
double get_clock(struct Clock *c);

//根据同步类型来获取主时间戳
int get_master_sync_type(struct VideoState *is);
```



### PacketQueue AVPacket 队列 

该队列的设计思想有以下几点:

1. 线程安全，互斥，等待，唤醒
2. 缓存数据量大小统计
3. 缓存包大小统计
4. 累计包可持续时间
5. 基本的存/取/释放功能

PacketQueue  主要用于对音频/视频/字幕 解封装出来的数据进行存取的封装，它的结构体，如下:

```c
typedef struct MyAVPacketList {
    AVPacket pkt; 								//解封装后的数据
    struct MyAVPacketList *next;  //下一个节点
    int serial;										//播放序列
} MyAVPacketList;


typedef struct PacketQueue {
    MyAVPacketList *first_pkt, *last_pkt;  // 队首，队尾指针
    int nb_packets; 											 // 包数量，也就是队列元素数量
    int size;       											 // 队列所有元素的数据大小总和
    int64_t duration;											 // 队列所有元素的数据播放持续时间
    int abort_request;										 // 用户退出请求标志
    int serial; 													 // 播放序列号，和MyAVPacketList的serial作用相同，但改变的时序稍微有点不同
    SDL_mutex *mutex;											 // 用于维持PacketQueue的多线程安全(SDL_mutex可以按pthread_mutex_t理解）
    SDL_cond *cond;												 // 用于维持PacketQueue的多线程安全(SDL_mutex可以按pthread_mutex_t理解）
    AVPacket *flush_pkt;
} PacketQueue;
```

主要调用的 API:

```c
/**
 * 初始化各个字段的值
 * @param q
 * @return
 */
int packet_queue_init(struct PacketQueue *q);

/**
 * 消息队列，释放内存
 * @param q
 */
void packet_queue_destroy(struct PacketQueue *q);

/**
 * 启动队列
 * @param q
 */
void packet_queue_start(struct PacketQueue *q);

/**
 * 中止队列
 * @param q
 */
void packet_queue_abort(struct PacketQueue *q);


/**
 * 从队列中取一个节点
 * @param q
 * @param pkt
 * @param block
 * @param serial
 * @return
 */
int packet_queue_get(struct PacketQueue *q, AVPacket *pkt, int block, int *serial);

/**
 * 存放一个节点
 * @param q
 * @param pkt
 * @return
 */
int packet_queue_put(struct PacketQueue *q, AVPacket *pkt);

/**
 * 放入一个空包
 * @param q
 * @param starat_index
 * @return
 */
int packet_queue_put_nullpacket(struct PacketQueue *q, int starat_index);

/**
 * 将已经存在的节点清除
 * @param q
 */
void packet_queue_flush(struct PacketQueue *q);

/**
 * 存节点
 * @param q
 * @param pkt
 * @return
 */
int packet_queue_put_private(struct PacketQueue *q, AVPacket *pkt);
```



### FrameQueue AVFrame 队列

设计思想:

1. 线程安全，⽀持互斥、等待、唤醒 
2. 控制缓存队列的大小

FrameQueue 主要用于存取音频/视频/字幕解码完成后的原始数据

```c
// 用于缓存解码后的音频，视频，字幕数据
typedef struct Frame {
    AVFrame *frame;         // 指向数据帧
    AVSubtitle sub;         // 用于字幕
    int serial;             // 帧序列，在 seek 的操作时 serial 会变化
    double pts;             // 时间戳，单位为秒
    double duration;        // 该帧持续时间，单位为秒
    int64_t pos;            // 该帧在输入文件中的字节位置
    int width;              // 图像宽度
    int height;             // 图像高读
    int format;             // 对于图像为(enum AVPixelFormat)，
    // 对于声音则为(enum AVSampleFormat)
    AVRational sar;         // 图像的宽高比（16:9，4:3...），如果未知或未指定则为0/1
    int uploaded;           // 用来记录该帧是否已经显示过？
    int flip_v;             // =1则垂直翻转， = 0则正常播放
} Frame;

/* 这是一个循环队列，windex是指其中的首元素，rindex是指其中的尾部元素. */
typedef struct FrameQueue {
    Frame queue[FRAME_QUEUE_SIZE];      // FRAME_QUEUE_SIZE  最大size, 数字太大时会占用大量的内存，需要注意该值的设置
    int rindex;                         // 读索引。待播放时读取此帧进行播放，播放后此帧成为上一帧
    int windex;                         // 写索引
    int size;                           // 当前总帧数
    int max_size;                       // 可存储最大帧数
    int keep_last;                      // = 1说明要在队列里面保持最后一帧的数据不释放，只在销毁队列的时候才将其真正释放
    int rindex_shown;                   // 初始化为0，配合keep_last=1使用
    SDL_mutex *mutex;                   // 互斥量
    SDL_cond *cond;                     // 条件变量
    PacketQueue *pktq;                  // 数据包缓冲队列
} FrameQueue;
```

主要操作的 api 有如下几个:

```c
/**
 * 初始化 FrameQueue
 * @param f 原始数据
 * @param pktq 编码数据
 * @param max_size 最大缓存
 * @param keep_last
 * @return
 */
int frame_queue_init(struct FrameQueue *f,struct PacketQueue *pktq, int max_size, int keep_last);

/**
 * 销毁队列中的所有帧
 * @param f
 * @return
 */
int frame_queue_destory(struct FrameQueue *f);

/**
 * 释放缓存帧的引用
 * @param vp
 */
void frame_queue_unref_item(struct Frame *vp);

/**
 * 发送唤醒的信号
 * @param f
 */
void frame_queue_signal(struct FrameQueue *f);

/**
 * 获取队列当前Frame, 在调用该函数前先调用 ff_frame_queue_nb_remaining 确保有frame可读
 * @param f
 * @return
 */
struct Frame *frame_queue_peek(struct FrameQueue *f);

/**
 * 获取当前Frame的下一Frame, 此时要确保queue里面至少有2个Frame
 * @param f
 * @return  不管什么时候调用，返回来肯定不是 NULL
 */
struct Frame *frame_queue_peek_next(struct FrameQueue *f);

/**
 * 获取上⼀Frame
 * 当rindex_shown=0时，和frame_queue_peek效果一样
 * 当rindex_shown=1时，读取的是已经显示过的frame
 * @param f
 * @return
 */
struct Frame *frame_queue_peek_last(struct FrameQueue *f);

/**
 * 获取⼀个可写Frame，可以以阻塞或⾮阻塞⽅式进⾏
 * @param f
 * @return
 */
struct Frame *frame_queue_peek_writable(struct FrameQueue *f);

/**
 * 获取⼀个可读Frame，可以以阻塞或⾮阻塞⽅式进⾏
 * @param f
 * @return
 */
struct Frame *frame_queue_peek_readable(struct FrameQueue *f);

/**
 * 更新写索引，此时Frame才真正⼊队列，队列节点Frame个数加1
 * @param f
 */
void frame_queue_push(struct FrameQueue *f);

/**
 * 更新读索引，此时Frame才真正出队列，队列节点Frame个数减1，内部调⽤
 * 当keep_last为1, rindex_show为0时不去更新rindex,也不释放当前frame
 * @param f
 */
void frame_queue_next(struct FrameQueue *f);

/**
 * 确保⾄少有2 Frame在队列
 * @param f
 * @return
 */
int frame_queue_nb_remaining(struct FrameQueue *f);

/**
 * 获取最近播放Frame对应数据在媒体⽂件的位置，主要在seek时使⽤
 * @param f
 * @return
 */
int64_t frame_queue_last_pos(struct FrameQueue *f);

```



### Decoder 解码结构体

**Decoder** 主要是对于音频/视频/字幕解码的封装，它的结构体如下:

```c
/**
 * 解码器封装
 */
typedef struct Decoder {
    AVPacket pkt;               //
    PacketQueue *queue;         // 数据包队列
    AVCodecContext *avctx;      // 解码器上下文
    int pkt_serial;             // 包序列
    int finished;               // =0，解码器处于工作状态；=非0，解码器处于空闲状态
    int packet_pending;         // =0，解码器处于异常状态，需要考虑重置解码器；=1，解码器处于正常状态
    SDL_cond *empty_queue_cond; // 检查到packet队列空时发送 signal缓存read_thread读取数据
    int64_t start_pts;          // 初始化时是stream的start time
    AVRational start_pts_tb;    // 初始化时是stream的time_base
    int64_t next_pts;           // 记录最近一次解码后的frame的pts，当解出来的部分帧没有有效的pts时则使用next_pts进行推算
    AVRational next_pts_tb;     // next_pts的单位
    SDL_Thread *decoder_tid;    // 线程句柄
} Decoder;
```

主要调用 api 如下:

```c
/**
 * 解码器初始化
 * @param is
 * @return
 */
int ff_decoder_init(struct VideoState *is);

/**
 * 解码销毁
 * @param d 
 */
void ff_decoder_destroy(struct Decoder *d);


/**
 *  解码器参数初始化
 * @param d
 * @param avctx
 * @param queue
 * @param empty_queue_cond
 */
void ff_decoder_parameters_init(struct Decoder *d, AVCodecContext *avctx, struct PacketQueue *queue,
                                struct SDL_cond *empty_queue_cond);

/**
 * 打开解码器组件
 * @brief stream_component_open
 * @param is
 * @param stream_index 流索引
 * @return Return 0 if OK
 */
int ff_stream_component_open(struct VideoState *is, int stream_index);

/**
 * 创建解码线程, audio/video有独立的线程
 */
int ff_decoder_start(struct Decoder *d, int (*fn)(void *), const char *thread_name, void *arg);

/**
 * 解码停止
 * @param d 
 * @param fq 
 */
void ff_decoder_abort(struct Decoder *d, struct FrameQueue *fq);

/**
 * 音频视频字幕真正解码的函数
 * @param d
 * @param frame
 * @param sub
 * @return
 */
int ff_decoder_decode_frame(struct Decoder *d, AVFrame *frame, AVSubtitle *sub, struct FFOptions *ops);

```



## 总结

该篇介绍了 ffplay 主要构成部分，实现原理会依次在后续文章中体现，敬请期待吧~!
