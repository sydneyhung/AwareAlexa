#!/bin/bash
endpoint="aware-backend"
while(true)
do
	parse=$(curl -s -H 'Content-Type: application/json' -X POST -d "{\"code\":\"playFiles\"}" \
		https://8txb69pmhb.execute-api.us-east-1.amazonaws.com/default/$endpoint | grep -oP 'AudioStream\":\"\K(.*?)\"' | sed 's/"//g')

	IFS=',' read -r -a filesToPlay <<< "$parse"

	for i in "${filesToPlay[@]}"
	do
		echo $i > tmp.mp3
		echo "Playing: tmp.mp3"
		mpg123 --timeout 1 tmp.mp3
		rm tmp.mp3

	done
	echo $parse
	echo "hi"
	sleep 1
done
