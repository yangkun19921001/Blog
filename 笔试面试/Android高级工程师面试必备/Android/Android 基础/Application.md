###Application 面试点

####1、OnLowMemory 和 OnTrimMemory 的比较

【参考】

1、OnLowMemory 被回调时，已经没有后台进程；而 onTrimMemory 被回调时，还有后台

进程。

2、OnLowMemory 是在最后一个后台进程被杀时调用，一般情况是 low memory killer 杀进

程后触发；而 OnTrimMemory 的触发更频繁，每次计算进程优先级时，只要满足条件，都

会触发。

3、通过一键清理后，OnLowMemory 不会被触发，而 OnTrimMemory 会被触发一次。

OnTrimMemory 的参数是一个 int 数值，代表不同的内存状态：

TRIM_MEMORY_COMPLETE：内存不足，并且该进程在后台进程列表最后一个，马上就要被

清理TRIM_MEMORY_MODERATE：内存不足，并且该进程在后台进程列表的中部。

TRIM_MEMORY_BACKGROUND：内存不足，并且该进程是后台进程。

TRIM_MEMORY_UI_HIDDEN：内存不足，并且该进程的 UI 已经不可见了。

以上 4 个是 4.0 增加TRIM_MEMORY_RUNNING_CRITICAL：内存不足(后台进程不足 3 个)，并且该进程优先级比较高，需要清理内存TRIM_MEMORY_RUNNING_LOW：内存不足(后台进程不足 5 个)，并且该进程优先级比较高，需要清理内存TRIM_MEMORY_RUNNING_MODERATE：内存不足(后台进程超过 5 个)，并且该进程优先级比较高，需要清理内存以上 3 个是 4.1 增加

