#!/bin/bash
GREEN='\033[0;32m'
NC='\033[0m'

set -o errexit

LAST_FILENAME=`ls mta_archives/ -t | head -n 1`

echo -e "${GREEN}MTA che stò per deployare..."
ls -lh mta_archives/$LAST_FILENAME
echo -e "${NC}Starting deploy..."
date
cf deploy mta_archives/$LAST_FILENAME -f
echo "deploy finished"
date