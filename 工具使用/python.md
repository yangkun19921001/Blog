>>> from ctypes import *
>>> H264Clip = CDLL("/Users/devyk/Data/Project/sample/github_code/h264_parser/output/libs/libh264_clip.dylib")
>>>
>>> H264Clip.get_h264_info("/Users/devyk/Data/Project/sample/github_code/h264_parser/output/new.h264")
>>>
>>> print(H264Clip.getVersion())

