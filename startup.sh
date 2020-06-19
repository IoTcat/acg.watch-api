#!/bin/bash
pm2 start index.js --name acgwatch-api -o /var/log/acgwatch/api.out -e /var/log/acgwatch/api.err --watch
