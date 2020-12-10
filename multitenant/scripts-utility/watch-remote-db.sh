#!/bin/bash
GREEN='\033[0;32m'
NC='\033[0m'

set -o errexit

# Configurazione per collegamento a DB Remoto
echo -e "${GREEN}Configurazione per collegamento a DB Remoto${NC}"
export CDS_ENV=production

# Scrive i log in console in modalità semplice esempio:
# 2020-10-26T20:50:49.608Z - 200 - message
export SIMPLE_LOG=true

# Configurazione route approuter per test in locale
echo -e "${GREEN}Configurazione route approuter per test in locale:${NC}"
cp cloud-foundry/approuter/xs-app-local-with-xsuaa.json cloud-foundry/approuter/xs-app.json -v

# Configurazione xsuaa approuter per test in locale che punta a customera
echo -e "${GREEN}Configurazione xsuaa approuter per test in locale:${NC}"
cp cloud-foundry/approuter/default-env-xsuaa-customera.json cloud-foundry/approuter/default-env.json -v

# Avvia app router
(cd cloud-foundry/approuter/ ; npm start &)

echo -e "${GREEN}Apri il browser all'indirizzo http://localhost:5000${NC}"

# Recupera comando cds da avviare
cds_command=$(which cds)

# Avvia cds watch in una subshell con debug
#( export NODE_OPTIONS='--inspect-brk' && $cds_command )
cds watch