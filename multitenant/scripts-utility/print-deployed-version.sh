echo "Target SCP:"
cf target 
echo
echo "Versione mtt-cap-services deployata:"
cf ssh mtt-cap-services -c "cat ~/app/srv/release.info"