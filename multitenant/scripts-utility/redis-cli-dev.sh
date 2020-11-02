#!/bin/bash
GREEN='\033[0;32m'
NC='\033[0m'

set -o errexit

echo 'Configurazione tunnel TLS'
sudo cp -v ../cloud-foundry/redis/redis.conf /etc/stunnel/redis.conf

echo 'Start tunnel'
sudo service stunnel4 start

echo -e "${GREEN}Adesso lancio il portforwarding, lascia questa finestra aperta e in un altra finestra wsl lancia:${NC}"
echo -e "${GREEN}redis-cli -p 6380 -a wZeclLFPfCuMPYSbsjPODyrlHYAnjZCR${NC}"
cf ssh -L 6666:clustercfg.rg-6e1d7a7c-d381-4c1b-99e9-d3b8974de85c.iroxbd.euc1.cache.amazonaws.com:1199 mtt-cap-services
