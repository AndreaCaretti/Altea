#! /bin/bash

# Parent PID of a process
function ppid () { 
    ps -p ${1:-$$} -o ppid=; 
}

#!/bin/bash
GREEN='\033[0;32m'
NC='\033[0m'

# Stop processo cds già attivo in ascolto sulla porta 4004
cds_process=$(lsof -t -i:4004)
cds_node_process=$(ppid $cds_process)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Kill CDS già in esecuzione $cds_process${NC}"
    kill -9 $cds_process $cds_node_process
fi

# Stop processo approuter già attivo in ascolto sulla porta 5000
approuter_process=$(lsof -t -i:5000)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Kill APPROUTER già in esecuzione $approuter_process${NC}"
    kill -9 $approuter_process
fi

# Blocca lo script se un comando restituisce exitcode diverso da 0
set -o errexit

# Utilizzo del DB locale (toglie se c'è l'env CDS_ENV=production)
echo -e "${GREEN}DB Locale${NC}"
unset CDS_ENV

# Scrive i log in console in modalità semplice esempio:
# 2020-10-26T20:50:49.608Z - 200 - message
export SIMPLE_LOG=true

# Avvia redis
sudo service redis-server start

# Configurazione approuter per test in locale
echo -e "${GREEN}Configurazione approuter per test in locale:${NC}"
cp cloud-foundry/approuter/xs-app-local.json cloud-foundry/approuter/xs-app.json -v

# Avvia app router
(cd cloud-foundry/approuter/ ; npm start &)

echo -e "${GREEN}Apri il browser all'indirizzo http://localhost:5000${NC}"

# Avvia cds watch
cds watch