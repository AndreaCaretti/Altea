#! /bin/bash

set -o errexit

sqlite3 local-test-data.db < scripts-utility/export-db-to-csv.sql.txt
echo "Dati esportati in file csv nella cartella db/local_data"