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

    GIT_STATUS=`git status`
}

function checkGitPush() {
    UPTODATE=`git status | grep "Your branch is up to date with 'origin/main'"`

    if [ -z "$UPTODATE" ]; then
        echo -e "${RED}Prima fare il push delle modifiche nella branch 'origin/main'${NC}\n"
        exit 3
    fi
}

function updateRelease() {
    GITCOMMIT=`git show-ref | grep origin/main | cut -f 1 -d ' '`
    MAJOR_VERSION=`head mta.yaml | grep ^version | cut -f 1-2 -d '.'`
    MINOR_VERSION=$((`head mta.yaml | grep ^version | cut -f 3 -d '.' | cut -f1 -d '-'`+1))

    SOPRA=`head mta.yaml -n 8`
    SOTTO=`tail mta.yaml -n +10`
    VERSION="$MAJOR_VERSION.$MINOR_VERSION-$GITCOMMIT"
    VERSION="$(echo -e "${VERSION}" | tr -d '[:space:]')"
    VERSION="$(echo "${VERSION//:/ : }")"

    echo -e "${GREEN}Versione MTA [$VERSION${NC}]\n"

    echo -e "$SOPRA" > mta.yaml
    echo -e "$VERSION" >> mta.yaml
    echo -e "$SOTTO"  >> mta.yaml

}

function createReleaseFile() {
    echo -e "BUILD `date` `whoami`@`hostname`\n" >  srv/release.info
    echo -e "VERSIONE MTA $VERSION\n" >>  srv/release.info

    echo -e "$GIT_STATUS" >> srv/release.info
    echo -e "\nGit Commit:">> srv/release.info
    git show-ref | grep origin/main >> srv/release.info
}

function preparaFilename() {
    GITCOMMIT=`git show-ref | grep origin/main | cut -f 1 -d ' ' | cut -c -7`
    DATA=`date --iso-8601=seconds`
    FILENAME="ccp-$DATA-$GITCOMMIT"
    FILENAME="$(echo -e "${FILENAME}" | tr -d '[:space:]')"

    echo -e "${GREEN}Creazione file $FILENAME${NC}\n"
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

    checkGitBranch
    checkGitStatus
    checkGitPush

    set -o errexit

    updateRelease
    createReleaseFile
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