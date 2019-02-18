#!/bin/bash

yum install -y gcc64-c++ libcurl-devel
export CC=gcc64
export CXX=g++64

yarn add @tensorflow/tfjs-node --ignore-engines
