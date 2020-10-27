sudo service stunnel4 start
cf ssh -L 2666:clustercfg.rg-6e1d7a7c-d381-4c1b-99e9-d3b8974de85c.iroxbd.euc1.cache.amazonaws.com:1199 mtt-cap-services
redis-cli -p 6380 -a wZeclLFPfCuMPYSbsjPODyrlHYAnjZCR