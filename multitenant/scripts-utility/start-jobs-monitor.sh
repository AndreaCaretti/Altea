#!/bin/bash
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Avvio jobs monitor all'indirizzo http://localhost:8089/jobs-monitor${NC}"
( cd jobs-monitor; npm start )