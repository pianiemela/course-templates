#!/bin/bash

docker run --rm \
  -v $(pwd):/compile \
  -u $(id -u):$(id -g) \
  -e "STATIC_CONTENT_HOST=https://tie-lukioplus.rd.tuni.fi/grader/static/santtufork/" \
  apluslms/compile-rst:1.6 \
  make touchrst html
