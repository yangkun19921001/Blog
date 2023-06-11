> c++实现高性能定时器

在C++中实现高性能定时器，可以考虑使用操作系统提供的定时器接口，如Linux中的timerfd和Windows中的TimerQueue。

下面是一个简单的使用timerfd实现定时器的例子：

c++

```c
#include <sys/timerfd.h>
#include <unistd.h>
#include <iostream>

class Timer {
public:
    Timer(int interval, std::function<void()> callback) 
        : interval_(interval), callback_(callback), running_(false) {
        timer_fd_ = timerfd_create(CLOCK_MONOTONIC, TFD_NONBLOCK);
        if (timer_fd_ == -1) {
            std::cerr << "timerfd_create failed" << std::endl;
        }
    }

    ~Timer() {
        stop();
        close(timer_fd_);
    }

    void start() {
        if (running_) return;

        struct itimerspec spec;
        spec.it_interval.tv_sec = interval_ / 1000;
        spec.it_interval.tv_nsec = (interval_ % 1000) * 1000000;
        spec.it_value = spec.it_interval;

        int ret = timerfd_settime(timer_fd_, 0, &spec, nullptr);
        if (ret == -1) {
            std::cerr << "timerfd_settime failed" << std::endl;
            return;
        }

        running_ = true;

        while (running_) {
            uint64_t exp;
            read(timer_fd_, &exp, sizeof(exp));
            callback_();
        }
    }

    void stop() {
        if (!running_) return;

        struct itimerspec spec;
        spec.it_interval.tv_sec = 0;
        spec.it_interval.tv_nsec = 0;
        spec.it_value.tv_sec = 0;
        spec.it_value.tv_nsec = 0;

        int ret = timerfd_settime(timer_fd_, 0, &spec, nullptr);
        if (ret == -1) {
            std::cerr << "timerfd_settime failed" << std::endl;
            return;
        }

        running_ = false;
    }

private:
    int timer_fd_;
    int interval_;
    std::function<void()> callback_;
    bool running_;
};

int main() {
    Timer timer(1000, []() {
        std::cout << "timer fired" << std::endl;
    });

    timer.start();

    sleep(5);

    timer.stop();

    return 0;
}
```

在上面的代码中，我们使用timerfd\_create创建了一个定时器文件描述符。然后在start函数中，我们通过timerfd\_settime函数设置了定时器的间隔和初次触发时间，并且使用read函数阻塞等待定时器事件发生。当定时器事件发生时，我们调用回调函数执行相应的操作。在stop函数中，我们通过重新设置定时器参数来停止定时器。

需要注意的是，这里的定时器使用的是单线程的方式，即在一个while循环中阻塞等待事件发生，因此在处理回调函数时需要尽可能地快速完成，以免阻塞其他操作。如果需要支持更多的并发操作，可以考虑使用多线程或者异步IO的方式来处理定时器事件。