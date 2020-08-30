## FFmpeg API 文档

## libavcodec

| API                                                          | 说明                                       |
| ------------------------------------------------------------ | ------------------------------------------ |
| AVCodec *avcodec_find_encoder(enum AVCodecID id);            | 根据 ID 找到编码器                         |
| AVCodec *avcodec_find_encoder_by_name(const char *name);     | 根据编码器名称找到编码器                   |
| AVCodecContext *avcodec_alloc_context3(const AVCodec *codec); | 根据编码器声明一个编码器上下文环境         |
| int avcodec_parameters_from_context(AVCodecParameters *par,                                     const AVCodecContext *codec) | 将编码上下文环境的参数 copy 到编码器参数中 |
| const AVBitStreamFilter *av_bsf_get_by_name(const char *name); | 过滤码流信息                               |
|                                                              |                                            |



## libfilter

## libformat

| API                                                          | 含义                     |
| ------------------------------------------------------------ | ------------------------ |
| avformat_alloc_output_context2                               | 构造输出格式的上下文环境 |
| AVStream *avformat_new_stream(AVFormatContext *s, const AVCodec *c); | 添加一个新的流媒体       |
|                                                              |                          |
|                                                              |                          |
|                                                              |                          |
|                                                              |                          |



## libavutil

## libswresample

## libswscale

