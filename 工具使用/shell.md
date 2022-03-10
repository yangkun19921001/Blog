### 文件传输

```
scp -i stuuudy.pem /Users/devyk/Data/Project/piaoquan/PQMedia/jni/out/production/6.zip root@192.168.202.43:/root/fffff

scp -i ~/Sync/works/tzld/stuuudy.pem root@192.168.204.182:/datalog/barrage_20211101.csv ~/Downloads
```



### shell 执行耗时

```shell
#!/bin/zsh

# shellcheck disable=SC2006
startTime=`date +%Y%m%d-%H:%M:%S`
startTime_s=`date +%s`

#./wz264_sample_encoder superfast 0 1280 694 30 /Users/devyk/Data/Project/piaoquan/PQMedia/temp/1280x694_30.yuv out.264 250 -1 2.42 2 3 -1 0

sleep 5.0
endTime=`date +%Y%m%d-%H:%M:%S`
endTime_s=`date +%s`

# shellcheck disable=SC2007
sumTime=$[ $endTime_s - $startTime_s ]
echo "$startTime ---> $endTime" "cost time:$sumTime seconds"
```

