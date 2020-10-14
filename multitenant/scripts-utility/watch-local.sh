#!/bin/bash
set -o errexit

cp cloud-foundry/approuter/xs-app-local.json cloud-foundry/approuter/xs-app.json -v
cds watch & 
cd cloud-foundry/approuter/
npm start