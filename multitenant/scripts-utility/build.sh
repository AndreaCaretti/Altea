#!/bin/bash
set -o errexit

cp cloud-foundry/approuter/xs-app-cloud.json cloud-foundry/approuter/xs-app.json -v
echo -e "\n"
mbt build
