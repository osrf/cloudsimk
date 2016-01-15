#!/usr/bin/env bash

cd /home/ubuntu/code/src_cloud_simulator

#
# update repo
#
hg revert -a
hg pull -u

# execute script
./first_aws_boot.bash



