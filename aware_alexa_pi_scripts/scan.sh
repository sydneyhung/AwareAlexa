#!/bin/bash

#inputFile="/home/pi/Desktop/Aware-Alexa/aware_alexa_pi_scripts/scan_list.txt"
source /home/pi/Desktop/Aware-Alexa/aware_alexa_pi_scripts/myVars.sh
endpoint="aware-backend"
playSound="false"
echo $endpoint
arrayMAC=()

#if [ -z "${PI_IS_REGISTERED}" ]
#then
#	echo 'PI_IS_REGISTERED=TRUE' >> /home/pi/Desktop/distance_detector/myVars.sh
#	echo "Registering PI to lambda"
#
#	curl -s -H 'Content-Type: application/json' -X POST -d "{\"code\":\"piBlueToothRegister\", \"deviceID\":\"MyPI1\"}" \
#	https://8txb69pmhb.execute-api.us-east-1.amazonaws.com/default/$endpoint
#fi

while true
do
	if [ ${#arrayMAC[@]} -eq 0 ]
	then	
		parse=$(curl -s -H 'Content-Type: application/json' -X POST -d "{\"code\":\"piBlueToothUpdate\", \"deviceID\":\"MyPI1\", \"deviceAddress\":\"BADADDR\",\"RSSIstrength\":\"-1\"}" \
			https://8txb69pmhb.execute-api.us-east-1.amazonaws.com/default/$endpoint)
		getMACs=$(echo "$parse" | grep -oP 'scanAddress\":\"\K(.*?)\"' | sed 's/"//g')
		IFS=',' read -r -a arrayMAC <<< "$getMACs"
	else
		count=0
		for i in "${arrayMAC[@]}"
		do
			bt=$(hcitool rssi $i 2> /dev/null)
			if [ "$bt" == "" ]; then
				sudo hcitool cc $i 2> /dev/null
				bt=$(hcitool rssi $i 2> /dev/null)
			fi	
		
			rssi=$(echo $bt | grep -o ':.*' | sed 's/: //')
			if [ -z "$rssi" ] 
			then
				rssi=-100
			fi

			echo -e "\n$i $rssi"
	
			parse=$(curl -s -H 'Content-Type: application/json' -X POST -d "{\"code\":\"piBlueToothUpdate\", \"deviceID\":\"MyPI1\", \"deviceAddress\":\"$i\",\"RSSIstrength\":\"$rssi\"}" \
				https://8txb69pmhb.execute-api.us-east-1.amazonaws.com/default/$endpoint)
			play=$(echo $parse | grep -oP 'download\":\"\K(.*?)\"' | sed 's/"//g')
			if [[ $play == *"yes"* && $playSound=="true" ]];
			then
				echo "Downloading..."
				wget --quiet --no-check-certificate --no-proxy https://bucket-202-project.s3.amazonaws.com/tmp.mp3 -P /home/pi/Desktop/Aware-Alexa/aware_alexa_pi_scripts
				mpg123 --timeout 1 tmp.mp3
				rm tmp.mp3

			fi

			echo "$parse"
			(( length=${#arrayMAC[@]} ))
			(( length=length-1 ))
			if [ $count -eq $length ]
			then
				parse=$(echo "$parse" | grep -oP 'scanAddress\":\"\K(.*?)\"' | sed 's/"//g')
				IFS=',' read -r -a arrayMAC <<< "$parse"
				echo "array size: ${#arrayMAC[@]}"
			else
				(( count=count+1 ))
			fi
		done
	fi
	
	#sleep 0.5
done
