#!/bin/bash

# install on linux sudo apt-get install libjemalloc-dev 
# use LD_preload memory loader for lower memory usage: https://stackoverflow.com/questions/53234410/how-to-use-node-js-with-jemalloc
export LD_PRELOAD=$LD_PRELOAD:/usr/lib/arm-linux-gnueabihf/libjemalloc.so
node index.js 80 &>> logs.txt &
