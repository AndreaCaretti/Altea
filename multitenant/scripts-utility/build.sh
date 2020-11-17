#!/bin/bash
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

function checkGitBranch() {
    CURRENT_BRANCH=`git branch --show-current`

    if [ $CURRENT_BRANCH != 'main' ]; then
        echo -e "${RED}Bisogna essere nella branch 'main'${NC}\n"
        exit 1
    fi
}

function checkGitStatus() {
    CHANGED_FILES=`git status -s | wc -l`

    if [ $CHANGED_FILES -gt 0 ]; then
        echo -e "${RED}Ci sono dei file non committati, prima committare tutto:${NC}"
        git status -s
        echo -e "\n"
        exit 2
    fi
}

function checkGitPush() {
    UPTODATE=`git status | grep "Your branch is up to date with 'origin/main'"`

    if [ -z $UPTODATE ]; then
        echo -e "${RED}Prima fare il push delle modifiche nella branch 'origin/main'${NC}\n"
        exit 3
    fi
}

checkGitBranch
checkGitStatus
checkGitPush

echo -e "${GREEN}Rinomina precedente mtar:${NC}"
mv -v mta_archives/cloud-cold-chain-multitenant_0.0.1.mtar mta_archives/cloud-cold-chain-multitenant_0.0.1.mtar_old

echo -e "${GREEN}Cancellazione makefile rimasti appesi:${NC}"
rm -v Makefile*

echo -e "${GREEN}Move db/data in db/local_data${NC}"
mv -v db/data db/local_data

set -o errexit

echo -e "${GREEN}Configurazione approuter per SCP:${NC}"
cp cloud-foundry/approuter/xs-app-cloud.json cloud-foundry/approuter/xs-app.json -v
echo -e "\n"
mbt build
