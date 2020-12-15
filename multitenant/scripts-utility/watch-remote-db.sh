#!/bin/bash

# Parent PID of a process
function ppid () { 
    ps -p ${1:-$$} -o ppid=; 
}

#!/bin/bash
GREEN='\033[0;32m'
NC='\033[0m'

# Stop processo cds già attivo in ascolto sulla porta 4004
cds_process=$(lsof -t -i:4004)
if [ $? -eq 0 ]; then
    
    cds_node_process=$(ppid $cds_process)

    echo -e "${GREEN}Kill CDS già in esecuzione $cds_process${NC}"
    kill -9 $cds_process $cds_node_process
fi

# Stop processo approuter già attivo in ascolto sulla porta 5000
approuter_process=$(lsof -t -i:5000)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Kill APPROUTER già in esecuzione $approuter_process${NC}"
    kill -9 $approuter_process
fi

# Stop processo jobs-monitor già attivo in ascolto sulla porta 5000
jobs_monitor_process=$(lsof -t -i:8189)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Kill Jobs Monitor già in esecuzione $jobs_monitor_process${NC}"
    kill -9 $jobs_monitor_process
fi

# Blocca lo script se un comando restituisce exitcode diverso da 0
set -o errexit

# Configurazione per collegamento a DB Remoto
echo -e "${GREEN}Configurazione per collegamento a DB Remoto${NC}"
export CDS_ENV=production

# Scrive i log in console in modalità semplice esempio:
# 2020-10-26T20:50:49.608Z - 200 - message
export SIMPLE_LOG=true

# Avvia redis
sudo service redis-server start

# Configurazione route approuter per test in locale
echo -e "Configurazione route approuter per test in locale:"
cp cloud-foundry/approuter/xs-app-local-with-xsuaa.json cloud-foundry/approuter/xs-app.json -v

# Configurazione xsuaa approuter per test in locale che punta a customera
echo -e "Configurazione xsuaa approuter per test in locale:"
cp cloud-foundry/approuter/default-env-xsuaa-customera.json cloud-foundry/approuter/default-env.json -v

# Avvia app router
(cd cloud-foundry/approuter/ ; npm start &)

echo -e "\n${GREEN}App router all'indirizzo http://localhost:5000${NC}\n"

# Avvia jobs monitor
(cd jobs-monitor ; npm start &)

echo -e "${GREEN}Jobs monitor all'indirizzo http://localhost:8189/jobs-monitor${NC}\n"

# Recupera comando cds da avviare
cds_command=$(which cds)

# Avvia cds watch in una subshell con debug
#( export NODE_OPTIONS='--inspect-brk' && $cds_command )
cds watch