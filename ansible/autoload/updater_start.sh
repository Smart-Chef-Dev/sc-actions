#!/bin/bash
ip=$(hostname -I | awk '{print $1}')

cd ~/sc-actions
screen -dm ./updater -k=$(doppler run --command='echo $UPDATER_KEY') -l=$ip:8081