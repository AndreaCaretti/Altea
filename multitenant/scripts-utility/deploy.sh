#!/bin/bash
GREEN='\033[0;32m'
NC='\033[0m'

set -o errexit

echo -e "${GREEN}MTA che stò per deployare..."
ls -lh mta_archives/cloud-cold-chain-multitenant_0.0.1.mtar
echo -e "${NC}Starting deploy..."
date
cf deploy mta_archives/cloud-cold-chain-multitenant_0.0.1.mtar -f
echo "deploy finished"
date