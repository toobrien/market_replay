#!/bin/bash

date=$1

cd '/Volumes/[C] Windows 11/SierraChart/Data/MarketDepthData' 

for file in $(find . -type f -name "*.depth")
do
  if [[ $(echo $file | sed 's/.*\.\([0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}\)\.depth/\1/') < $date ]]
  then  
    rm ${file}
  fi
done
