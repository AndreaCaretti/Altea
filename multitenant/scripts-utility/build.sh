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

function createReleaseFile() {
    echo -e "BUILD `date` `whoami`@`hostname`\n" >  srv/release.info
    git status >> srv/release.info
    echo -e "\nGit Commit:">> srv/release.info
    git show-ref | grep origin/main >> srv/release.info
}

function updateRelease() {
    GITCOMMIT=`git show-ref | grep origin/main | cut -f 1 -d ' '`

    SOPRA=`head mta.yaml -n 8`
    SOTTO=`tail mta.yaml -n +10`
    VERSION="version: 0.0.1-$GITCOMMIT"

    echo -e "$SOPRA" > mta.yaml
    echo -e "$VERSION" >> mta.yaml
    echo -e "$SOTTO"  >> mta.yaml
}

function preparaFilename() {
    GITCOMMIT=`git show-ref | grep origin/main | cut -f 1 -d ' ' | cut -c -7`
    DATA=`date --iso-8601=seconds`
    FILENAME="ccp-$DATA-$GITCOMMIT"

    echo -e  "${GREEN}Creazione file $FILENAME${NC}\n"
}

function build() {
    echo $FILENAME
    mbt build --mtar $FILENAME
}

function commit() {
    git add srv/release.info
    git add mta.yaml
    git commit -m "Build MTA $FILENAME"
    echo "Push su github della build..."
    git push
}

function main() {

    set -o errexit

    checkGitBranch
    checkGitStatus
    checkGitPush
    createReleaseFile
    updateRelease
    preparaFilename
    commit

    set +o errexit

    echo -e "${GREEN}Cancellazione makefile rimasti appesi:${NC}"
    rm -v Makefile*

    echo -e "${GREEN}Move db/data in db/local_data${NC}"
    mv -v db/data db/local_data

    set -o errexit

    echo -e "${GREEN}Configurazione approuter per SCP:${NC}"
    cp cloud-foundry/approuter/xs-app-cloud.json cloud-foundry/approuter/xs-app.json -v
    echo -e "\n"

    build

}

main