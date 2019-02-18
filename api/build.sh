#!/bin/bash

yum downgrade -y glibc-2.17-196.172.amzn1

yum install -y gcc-c++

yarn add @tensorflow/tfjs-node --ignore-engines
