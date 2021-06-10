#! /bin/bash

CMD_DIR=$(cd $(dirname $0);pwd)

node ${CMD_DIR}/splitPlist.js $1 $2
