```c++
#ifndef LOGGER_H
#define LOGGER_H
#include <iostream>
#include <fstream>
#include <string>
#include <queue>
#include <tuple>
#include <mutex>
#include <condition_variable>
#include <thread>
#include <atomic>
#include <chrono>
#include <ctime>
#include <sstream>

enum LogLevel { DEBUG, INFO, WARNING, ERROR };

class Logger {
public:
    static Logger& get_instance() {
        static Logger instance;
        return instance;
    }

    void set_log_level(LogLevel level) {
        log_level = level;
    }

    void set_output_file(const std::string& base_filename) {
        this->base_filename = base_filename;
    }

    template<typename... Args>
    void log(LogLevel level, const std::string& filename, const std::string& func, int line, const Args&... args) {
        if (level >= log_level) {
            std::string formatted_msg = format_message(level, filename, func, line);
            append_args(formatted_msg, args...);
            output_to_file(formatted_msg, level);
            output_to_console(formatted_msg, level);
        }
    }

    template<typename... Args>
    void async_log(LogLevel level, const std::string& filename, const std::string& func, int line, const Args&... args) {
        if (level >= log_level) {
            std::unique_lock<std::mutex> lock(queue_mutex);
            log_queue.push(std::make_tuple(level, filename, func, line, format_args(args...)));
            lock.unlock();
            queue_cv.notify_one();
        }
    }

private:
    Logger() : stop_async_writer(false), writer_thread(&Logger::async_writer, this) {}
    ~Logger() {
        stop_async_writer = true;
        queue_cv.notify_one();
        if (writer_thread.joinable()) {
            writer_thread.join();
        }
    }

    Logger(const Logger&) = delete;
    Logger& operator=(const Logger&) = delete;

    LogLevel log_level;
    std::string base_filename;

    std::queue<std::tuple<LogLevel, std::string, std::string, int, std::string>> log_queue;
    std::mutex queue_mutex;
    std::condition_variable queue_cv;
    std::atomic_bool stop_async_writer;
    std::thread writer_thread;

    template<typename... Args>
    void append_args(std::string& message, const Args&... args) {
        std::ostringstream stream;
        ((stream << args), ...);
        message += stream.str();
    }

    template<typename... Args>
    std::string format_args(const Args&... args) {
        std::ostringstream stream;
        ((stream << args), ...);
        return stream.str();
    }

    std::string format_message(LogLevel level, const std::string& filename, const std::string& func, int line) {
        std::string prefix;
        std::string timestamp = get_current_time();

        switch (level) {
            case DEBUG:
                prefix = "[DEBUG] ";
                break;
            case INFO:
                prefix = "[INFO] ";
                break;
            case WARNING:
                prefix = "[WARNING] ";
                break;
            case ERROR:
                prefix = "[ERROR] ";
                break;
        }

        return timestamp + " " + prefix + filename + "::" + func + ":" + std::to_string(line) + " - ";
    }

    std::string get_current_time() {
        auto now = std::chrono::system_clock::now();
        auto now_time_t = std::chrono::system_clock::to_time_t(now);
        auto now_tm = std::localtime(&now_time_t);

        char buffer[20];
        std::strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", now_tm);
        return std::string(buffer);
    }

    void output_to_file(const std::string& message, LogLevel level) {
//        std::string date_str = get_current_date();
//        std::ofstream log_file(base_filename + "_" + date_str + ".log", std::ios_base::app);
//        if (log_file.is_open()) {
//
//            log_file << message << std::endl;
//            log_file.close();
//        }
        if (!base_filename.empty()) {
            std::string filename = base_filename + "_" + get_current_date() + ".log";
            std::ofstream log_file(filename, std::ios::app);

            log_file << message << std::endl;
            log_file.close();
        }
    }

    void output_to_console(const std::string& message, LogLevel level) {
        switch (level) {
            case DEBUG:
                std::cout << "\033[37m" << message << "\033[0m" << std::endl;
                break;
            case INFO:
                std::cout << "\033[32m" << message << "\033[0m" << std::endl;
                break;
            case WARNING:
                std::cout << "\033[33m" << message << "\033[0m" << std::endl;
                break;
            case ERROR:
                std::cout << "\033[31m" << message << "\033[0m" << std::endl;
                break;
        }
    }

    void async_writer() {
        while (!stop_async_writer) {
            std::unique_lock<std::mutex> lock(queue_mutex);
            queue_cv.wait(lock, [&]() { return !log_queue.empty() || stop_async_writer; });

            if (!log_queue.empty()) {
                auto item = log_queue.front();
                log_queue.pop();
                lock.unlock();

                std::string formatted_msg = format_message(std::get<0>(item), std::get<1>(item), std::get<2>(item), std::get<3>(item));
                formatted_msg += std::get<4>(item);
                output_to_file(formatted_msg, std::get<0>(item));
                output_to_console(formatted_msg, std::get<0>(item));
            } else {
                lock.unlock();
            }
        }
    }

    std::string get_current_date() {
        auto now = std::chrono::system_clock::now();
        auto now_time_t = std::chrono::system_clock::to_time_t(now);
        auto now_tm = std::localtime(&now_time_t);

        char buffer[20];
        std::strftime(buffer, sizeof(buffer), "%Y-%m-%d", now_tm);
        return std::string(buffer);
    }
};
template<typename... Args>
void LOG(LogLevel level, const std::string& filename, const std::string& func, int line, const Args&... args) {
    Logger::get_instance().log(level, filename, func, line, args...);
}

template<typename... Args>
void ASYNC_LOG(LogLevel level, const std::string& filename, const std::string& func, int line, const Args&... args) {
    Logger::get_instance().async_log(level, filename, func, line, args...);
}

#define LOG_DEBUG(...) LOG(LogLevel::DEBUG, __FILE__, __func__, __LINE__,__VA_ARGS__)
#define LOG_INFO(...) LOG( LogLevel::INFO, __FILE__, __func__, __LINE__,__VA_ARGS__)
#define LOG_WARNING(...) LOG( LogLevel::WARNING, __FILE__, __func__, __LINE__,__VA_ARGS__)
#define LOG_ERROR(...) LOG(LogLevel::ERROR, __FILE__, __func__, __LINE__,__VA_ARGS__)

#define ASYNC_LOG_DEBUG(...) ASYNC_LOG(LogLevel::DEBUG, __FILE__, __func__, __LINE__,__VA_ARGS__)
#define ASYNC_LOG_INFO(...) ASYNC_LOG(LogLevel::INFO, __FILE__, __func__, __LINE__,__VA_ARGS__)
#define ASYNC_LOG_WARNING(...) ASYNC_LOG(LogLevel::WARNING, __FILE__, __func__, __LINE__,__VA_ARGS__)
#define ASYNC_LOG_ERROR(...) ASYNC_LOG(LogLevel::ERROR, __FILE__, __func__, __LINE__,__VA_ARGS__)

#endif // LOGGER_H
```

