#!/bin/bash
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

function checkTarget() {
    CURRENT_ORG=`cf target | grep org | cut -f 2 -d ':' | xargs`

    if [ $CURRENT_ORG != 'ccp-provider-dev-qas' ]; then
        echo -e "${RED}Il target deve essere l'organizzazione 'ccp-provider-dev-qas'${NC}\n"
        exit 1
    fi

    CURRENT_SPACE=`cf target | grep space | cut -f 2 -d ':' | xargs`

    if [ $CURRENT_SPACE != 'dev' ]; then
        echo -e "${RED}Il target deve essere lo space 'dev'${NC}\n"
        exit 1
    fi
}

function main() {
    set -o errexit

    checkTarget

    LAST_FILENAME=`ls mta_archives/ -t | head -n 1`

    echo -e "${GREEN}Deploy del file MTA..."
    ls -lh mta_archives/$LAST_FILENAME
    echo -e "${NC}Starting deploy..."
    date
    cf deploy mta_archives/$LAST_FILENAME -f
    echo "deploy finished"
    date

    echo "RICORDATI DI AGGIORNARE IL DB CON (SE SERVE):"
    echo "npm run update-db-tenants"
}

main