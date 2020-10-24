#!/bin/bash
cf t
cf set-env mtt-approuter XS_APP_LOG_LEVEL DEBUG
cf set-env mtt-approuter REQUEST_TRACE true
cf restart mtt-approuter
