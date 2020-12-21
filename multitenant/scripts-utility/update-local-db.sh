# Attiva l'opzione che se c'è un errore deve uscire
set -o errexit
mv -v db/local_data db/data
echo

# Disattiva l'opzione che se c'è un errore deve uscire così rinomina sempre data in local_data
set +o errexit

cds deploy

echo
mv -v db/data db/local_data