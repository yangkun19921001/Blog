```c++
#include <chrono>
#include <functional>
#include <future>
#include <queue>
#include <mutex>
#include <thread>
#include <condition_variable>
class Timer {
public:
    Timer() : m_stop(false) {
        m_thread = std::thread([this]() {
            while (!m_stop) {
                std::unique_lock<std::mutex> lock(m_mutex);
                auto now = std::chrono::steady_clock::now();
                while (!m_queue.empty() && m_queue.top().time <= now) {
                    auto task = m_queue.top().task;
                    m_queue.pop();
                    lock.unlock();
                    task();
                    lock.lock();
                }
                if (!m_queue.empty()) {
                    m_cv.wait_until(lock, m_queue.top().time);
                } else {
                    m_cv.wait(lock);
                }
            }
        });
    }
    ~Timer() {
        stop();
    }
    void add_task(std::function<void()> task, std::chrono::steady_clock::time_point time) {
        std::lock_guard<std::mutex> lock(m_mutex);
        m_queue.push({ task, time });
        m_cv.notify_one();
    }
    void stop() {
        m_stop = true;
        m_cv.notify_one();
        if (m_thread.joinable()) {
            m_thread.join();
        }
    }
private:
    struct Task {
        std::function<void()> task;
        std::chrono::steady_clock::time_point time;
        bool operator<(const Task& other) const {
            return time > other.time;
        }
    };
    std::thread m_thread;
    std::atomic<bool> m_stop;
    std::priority_queue<Task> m_queue;
    std::mutex m_mutex;
    std::condition_variable m_cv;
};
```

