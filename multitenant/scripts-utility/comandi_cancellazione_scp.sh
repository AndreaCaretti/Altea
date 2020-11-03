# This script deletes all the services keys and then undeploy the MTA

cf dsk mtt-html5-repo-host    mtt-html-deployer-mtt-html5-repo-host-credentials -f
cf dsk mtt-html5-repo-host    mtt-portal-deployer-mtt-html5-repo-host-credentials -f
cf dsk mtt-portal             content-deploy-key -f
cf dsk mtt-saas               mtt-portal-deployer-mtt-saas-credentials -f
cf dsk mtt-xsuaa              mtt-portal-deployer-mtt-xsuaa-credentials -f
cf dsk mtt-service-manager    sk-service-manager-service-instances -f

cf undeploy cloud-cold-chain-multitenant --delete-services -f

