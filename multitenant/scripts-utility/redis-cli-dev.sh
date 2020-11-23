#!/bin/bash
GREEN='\033[0;32m'
NC='\033[0m'

set -o errexit

echo 'Configurazione tunnel TLS'
sudo cp -v ../cloud-foundry/redis/redis.conf /etc/stunnel/redis.conf

echo 'Start tunnel'
sudo service stunnel4 start

echo -e "${GREEN}Adesso lancio il portforwarding, lascia questa finestra aperta e in un altra finestra wsl lancia:${NC}"
echo -e "${GREEN}redis-cli -p 6380 -a GaJoFOorxmiPONZjZPabLYQLlcmgzAGU${NC}"
#cf ssh -L 6666:clustercfg.rg-b1d65754-56bd-4059-bfc2-e113c2bad9e0.iroxbd.euc1.cache.amazonaws.com:1205 mtt-approuter
cf ssh -L 6666:rg-b1d65754-56bd-4059-bfc2-e113c2bad9e0-0001-001.rg-b1d65754-56bd-4059-bfc2-e113c2bad9e0.iroxbd.euc1.cache.amazonaws.com:1205 mtt-approuter
