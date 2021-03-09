#!/bin/bash

#npm install -g pm2
#pm2 list
#pm2 stop
#pm2 restart
#pm2 delete

pm2 start npm --name config-uploader -- start