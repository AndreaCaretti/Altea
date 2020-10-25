#!/bin/bash
GREEN='\033[0;32m'
NC='\033[0m'

set -o errexit

echo -e "${GREEN}Configurazione approuter per test in locale:${NC}"
cp cloud-foundry/approuter/xs-app-local.json cloud-foundry/approuter/xs-app.json -v
cd cloud-foundry/approuter/
npm start &

echo -e "${GREEN}Preparazione per lancio in debug:${NC}"
export NODE_OPTIONS='--inspect'
cd ../../
echo -e "${GREEN}cds run${NC}"
cds run
