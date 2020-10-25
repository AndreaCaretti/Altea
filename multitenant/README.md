# Getting Started

Welcome to the template for a multitenant project.

It contains these folders and files, following our recommended project layout:

| File / Folder                                                    | Purpose                                                      |
| ---------------------------------------------------------------- | ------------------------------------------------------------ |
| `db/`                                                            | your domain models and data go here                          |
| `srv/`                                                           | your service models and code go here                         |
| `app/`                                                           | content for UI frontends go here                             |
| `app/com.alteaup.solutions.accessrights/`                        | Fiori Elements very simple app example                       |
| `app/flpSandbox`                                                 | Configuration of the Fiori Launchpad sandbox for local tests |
| `app/index.cds`                                                  | Index of all the UI related cds annotations                  |
| `cloud-foundry/`                                                 | Cloud Foundry related objects, services, and configuration   |
| `cloud-foundry/approuter`                                        | App Router                                                   |
| `cloud-foundry/approuter/xs-apps.json`                           | Configuration of the App Router routes                       |
| `cloud-foundry/html5-deployer`                                   | HTML5 Deployer                                               |
| `cloud-foundry/portal-deployer`                                  | Portal Deployer                                              |
| `cloud-foundry/portal-deployer\portal-site\CommonDataModel.json` | Configuration of the Fiori Launchpad in Cloud                |
| `cloud-foundry/xsuaa`                                            | XSUAA Service (Authorization)                                |
| `cloud-foundry/xsuaa/xs-security.json`                           | Authorization Scopes and Roles configuration                 |
| `mta.yaml`                                                       | MTA yaml configuration for the whole project                 |
| `package.json`                                                   | project metadata and configuration                           |
| `readme.md`                                                      | this getting started guide                                   |


## Deploy
* creare in SCP un subaccount 'provider' con organizzazione CF che conterrà gli sviluppi
* creare in SCP un subaccount 'clienteA' senza organizzazione CF
* `npm run build`
* `npm run deploy`
* subscription del subaccout 'clienteA'
* creare una route `${subaccount}-mt-test-mtt-approuter`
* lanciare l'upgrade dei tenant

## Run local...

* deployare su SCP
* copia dall'env dell'app mtt-cap-services la parte VCAP_SERVICES e metterla nel file /default-env.json
* `cd run`

poi per lanciare:
```
export CDS_ENV=production
cds run
```
*nota: `cds watch` non funziona perchè lancia in modalità sviluppo*

* fare la subscription del tenant

Start cds services:

```
cds watch
```

Start app router:

```
cd cloud-foundry/approuter
npm start
```

Open url of the app router:
http://localhost:5000/srv_api/flpSandbox.html

Utente:
sbarzaghi@alteanet.it

Nel file `cloud-foundry\approuter\xs-app.json` (che è il file di configurazione dell'app router) c'è definito il mapping tra il path `^/srv_api/(.*)` e la destination `srv_api`

La destination `srv_api` in locale punta a `http://localhost:4004/`, (definito in `cloud-foundry\approuter\default-env.json`),  
in cloud la destination è una variabile di ambiente dell'app router

## FAQ

Perchè non viene usato il portale SCP invece del portale configurato dall'APP?

-   Il salvataggio delle entity non funziona esce l'errore "The server does not support the functionality required to fulfill the request"
-   Bisogna configurare una destinazione per ogni singola app
-   L'app viene lanciata fullscreen
-   Se si entra nella pagina di dettaglio dell'entity e si preme back ritorna sul launchpad invece che sulla pagina di ricerca

## Per creare le app

Create con yeoman con il generatore in "C:\Users\sbarzaghi\OneDrive - Altea\test\generator-easy-ui5\generators"

## STEPS CREAZIONE

-   Creato progetto mta con webide con html5 repository
-   Creata un'app fiori vuota da usare come template
-   Commit e push su github
-   In locale git clone
-   cds init nella directory principale
-   rinominato il file mta.yaml in mta_webide.yaml
-   cds add mta
-   merge file mta.yaml con mta_webide.yaml
    -   aggiunto modulo db
    -   cambiato il tipo da hana a hanatrial
    -   aggiunto il modulo server
    -   cancellato la resurce di xsuaa utilizzo quelle di webide
-   rinominato il file mta_webide.yaml in mta.yaml
-   aggiunto in \package.json:

```
"cds": {
  "requires": {
    "db": {
        "kind": "sql"
    }
  },
  "requires": {
    "uaa": {
        "kind": "xsuaa"
    }
  }
}
```

-   installato:

```
npm add @sap/hana-client --save
npm install passport
npm install @sap/xssec @sap/xsenv
```

## DEPLOY SCP

C'è lo script deploy.sh che si occupa di tutta, basta lanciarlo

## DEPLOY SOLO DEI SERVIZI CDS

Con utenza solutions.aup@gmail.com sosKEYpaaOW?9p:

`\$env:CDS_ENV = "production" ; mbt build; cd gen\srv; cf push`

## AGGIORNAMENTO FILE XSUAA

`cf update-service uaa_tbw -c .\xs-security.json`

## AGGIORNAMENTO DI UNA APPLICAZIONE UI5

dalla cartella dell'applicazione:
`npm build`

## AGGIORNAMENTO CONFIGURAZIONE PORTALE

se non c'è il file manifest, dalla cartella del portale
`cf create-app-manifest cap-template-portal-deployer`
rinominare il file in manifest.yaml
rifare il push con:
`cf push`

## PULIZIA COMPLETA DI SCP

```

cf d cap-template-cap-services -f &
cf d cap-template-portal-deployer -f &
cf d cap-template-hanadb-deployer -f &
cf d cap-template-html-deployer -f &
cf d cap-template-approuter -f &
cf ds cap-template-destination -f &
cf ds cap-template-hanadb -f &
cf ds cap-template-html5-repo-host -f &
cf ds cap-template-html5-repo-runtime -f &
cf ds cap-template-portal -f &
cf ds cap-template-uaa -f &

```

## CREAZIONE DEL DB SQLITE IN LOCALE

`cds deploy --to sqlite:localtest.db`

Attenzione che mi ha messo sqlite invece che sql nel file /package.json, rimettere sql:

```
"cds": {
  "requires": {
    "db": {
        "kind": "sql"
    }
  },
  "requires": {
    "uaa": {
        "kind": "xsuaa"
    }
  }
}
```

```

```

## CAMBIO DI REPOSITORY DA NPM.SAP.COM A REGISTRY UFFICIALE NPM

npm install @sap/audit-logging
npm install @sap/cds
npm install @sap/hana-client
npm install @sap/xsenv
npm install @sap/xssec
