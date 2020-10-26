#!/bin/bash
GREEN='\033[0;32m'
NC='\033[0m'

set -o errexit

echo -e "${GREEN}DB Locale${NC}"
unset CDS_ENV

echo -e "${GREEN}Configurazione approuter per test in locale:${NC}"
cp cloud-foundry/approuter/xs-app-local.json cloud-foundry/approuter/xs-app.json -v
cds watch & 
cd cloud-foundry/approuter/
npm start

echo -e "${GREEN}Apri il browser all'indirizzo http://localhost:5000${NC}"