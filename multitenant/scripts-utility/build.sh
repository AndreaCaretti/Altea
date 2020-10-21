#!/bin/bash
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Rinomina precedente mtar:${NC}"
mv -v mta_archives/cloud-cold-chain-multitenant_0.0.1.mtar mta_archives/cloud-cold-chain-multitenant_0.0.1.mtar_old
set -o errexit
echo -e "${GREEN}Configurazione approuter per SCP:${NC}"
cp cloud-foundry/approuter/xs-app-cloud.json cloud-foundry/approuter/xs-app.json -v
echo -e "\n"
mbt build
