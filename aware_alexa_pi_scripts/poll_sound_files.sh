#!/bin/bash
endpoint="aware-backend"
readarray -t soundFiles < <(find . -name \*.mp3 -exec basename {} \;)

for i in "${soundFiles[@]}"
do

stringJSON+=$i,

done

stringJSON=$(echo $stringJSON | sed s'/.$//')

echo $stringJSON

parse=$(curl -s -H 'Content-Type: application/json' -X POST -d "{\"code\":\"retrieveSoundFiles\", \"hasFiles\":\"$stringJSON\"}" \
	https://8txb69pmhb.execute-api.us-east-1.amazonaws.com/default/$endpoint | grep -oP 'downloadLinks\":\"\K(.*?)\"' | sed 's/"//g')

IFS=',' read -r -a fileLinks <<< "$parse"

for i in "${fileLinks[@]}"
do

	echo "Downloading: $i"
	wget --quiet --no-check-certificate --no-proxy $i -P /home/pi/Desktop/Aware-Alexa/aware_alexa_pi_scripts

done
