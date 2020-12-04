# Communication Frontends

## Invio configurazione piattaforma centrale

### Descrizione

Invio al communication frontend delle locations/departments/aree e dei prodotti configurati nella piattaforma centrale, con i rispettivi responsabili assegnati

### Quando viene inviato

Premendo un tasto nell'applicazione di configurazione della piattaforma viene richiamato un webservice REST esposto dal communication frontend.
Nella piattaforma vengono tracciati le invii effettuati (data, ora, payload, result).

### Tracciato
```json
{
    "customer" : {
        "customerGUID" : "d532b292-a03c-4530-af37-6732dc5c7758",
        "companyName": "...",
        "customerTenant" : {
            "tokenEndpoint" : "https://ccp-customera.authentication.eu10.hana.ondemand.com/oauth/token",
            "uri" : "https://ccp-provider-dev-qas.dev.cfapps.eu10.hana.ondemand.com"
        },
        "gs1CompanyPrefixs" : [
            "123456789",
            "234567890"
        ],
        "locations" : [
            {
                "locationGUID" : "eff08cb8-57fc-4863-bb1e-e898479e0fe2",
                "description" : "Plant A",
                "departments" : [
                    {
                        "departmentGUID" : "9dcc35bf-1bb5-411a-b6b0-0527465ec900",
                        "description" : "Packaging Area A",
                        "areas" : [
                            {
                                "areaGUID" : "a6fe9383-13c5-48b6-94a5-fe0a69f362ee",
                                "description" : "Cold Room 1",
                                "assetManager" : "coldroom1@domain.com"
                            },
                            {
                                "areaGUID" : "a7dac933-2b2a-4dde-b0ac-cc1c328b25da",
                                "description" : "Cold Room 2",
                                "assetManager" : "coldroom2@domain.com"
                            }
                        ]
                    }
                ]
            }
        ],
        "products" : [
            {
                "gtin" : "1234567890123",
                "description" : "...",
                "productManager" : "productmanager1@domain.com",
                "QAManager" : "qamanager1@domain.com"
            },
            {
                "gtin" : "1234567890199",
                "description" : "...",
                "productManager" : "productmanager1@domain.com",
                "QAManager" : "qamanager2@domain.com"
            }
        ]
    }
}
```

## Piattaforma -> Frontend

### OLT - Out of limit temperature

#### Descrizione

Avviso che viene inviato quando un'area refrigerata è fuori dal range di temperatura stabilito.
Vengono inviate le informazioni relative all'allarme, all'area e il contenuto dell'area nel momento in cui è scattato l'allarme, il contenuto viene raggruppato per prodotto/lotto.

#### Esempio

La cella 1 del reparto packaging del plant A alle 13:30 ha raggiunto la temperatura di 20°, la sua temperatura prevista è 4° - 10° e nel momento dell'allarme conteneva 50 cartoni di aspirina lotto AB12344

#### Quando viene inviato

- l'area segnala in near realtime alla piattaforma che la temperatura rilevata è uscita dal range definito
- la piattaforma inserisce in near realtime la notifica nella coda verso il communication frontend
- la coda richiama il webhook esposto dal communication frontend per inviare la notifica

#### Tracciato
```json
{
    "eventGuid": "ada49efe-c732-4ed3-a7a9-cb7275ae5c5e",
    "severity": 1,
    "alarmType": "OLT",
    "eventDate": "2020-11-17T12:00:00Z",
    "notificationDate": "2020-11-17T12:05:00Z",
    "details": {
        "measurementUnit": "Celsius",
        "eventTemperature": 20,
        "workingTemperature": {
        
            "min": -20,
            "max": 0
        },
        "cause": ""
    },
    "area": {
    
        "guid": "c7163657-20c8-4fc3-925a-9028bc6b0d8f",
        "description": "Cold Room 1",
        "category": "COLD_ROOM",
        "department": {
        
            "guid": "c55dd03a-c097-487c-a60c-bf3fa8abea5b",
            "description": "Packging"
        },
        "location": {
        
            "guid": "c55dd03a-c097-487c-a60c-bf3fa8abea5b",
            "description": "Plant A"
        },
        "guidAsset": "592D9BEA5FD74E3DBF2C9BF5BD7CDA26"
    },
    "handlingUnits": [
    
        {
            "gtin": "1234567890123",
            "productDescription": "Antibiotic X",
            "lot": "U4654",
            "quantity": 5,
            "unitOfMeasure" : "pallet"
        },
        {
            "gtin": "1234567890123",
            "productDescription": "Antibiotic X",
            "lot": "U4655",
            "quantity": 3,
            "unitOfMeasure" : "pallet"
        },
        {
            "gtin": "1234567890125",
            "productDescription": "”Antibiotic Y",
            "lot": "U7655",
            "quantity": 200,
            "unitOfMeasure" : "cartoni"
        }
    ]
}
```
| Campo                | Descrizione                                                                             | Tipo     | Esempio                                |
| -------------------- | --------------------------------------------------------------------------------------- | -------- | -------------------------------------- |
| eventGuid            | UUID generato dalla piattaforma, identifica univocamente la notifica                    | UUID     | "ada49efe-c732-4ed3-a7a9-cb7275ae5c5e" |
| severity             | livello della notifica `1` - allarme                                                    | String   | "1"                                    |
| alarmType            | fisso OLT out of limit temperature                                                      | String   | "OLT"                                  |
| eventDate            | momento in cui viene generato l'evento dal device che monitora la temperatura dell'area | ISO 8601 | "2020-11-17T12:00:00Z"                 |
| notificationDate     | momento in cui la notifica viene accodata verso il communication - frontend             | ISO 8601 | "2020-11-17T12:00:00Z"                 |
| details              | dettagli dell'allarme                                                                   | Object   |                                        |
| - measurementUnit    | unità di misura della temperatura rilevata                                              | String   | "Celsius"                              |
| - eventTemperature   | temperatura rilevata nel momento dell'allarme                                           | Number   | 20                                     |
| - workingTemperature | range di temperatura di funzionamento previsto                                          | Object   |                                        |
| - - min              | temperatura minima                                                                      | Number   | -20                                    |
| - - max              | temperatura massima                                                                     | Number   | 0                                      |
| - cause              | futuri ampliamenti, attualmente vuoto                                                   | String   | ""                                     |
| area                 | informazioni riguardanti l'area                                                         | Object   |                                        |
| - guid               | UUID generato dalla piattaforma, identifica univocamente l'area                         | UUID     | "ada49efe-c732-4ed3-a7a9-cb7275ae5c5e" |
| - description        | descrizione dell'area, non in lingua                                                    | String   | "Cold Room 1"                          |
| - category           | categoria dell'area `COLD_ROOM`, (wave 2 `REFRIGERATOR_TRUCK`)                          | String   | "COLD_ROOM"                            |
| department           | dipartimento in cui è inserita l'area                                                   | Object   |                                        |
| - guid               | UUID generato dalla piattaforma, identifica univocamente il dipartimento                | UUID     | "c55dd03a-c097-487c-a60c-bf3fa8abea5b" |
| - description        | descrizione del dipartimento, non in lingua                                             | String   | "Packging"                             |
| location             | plant in cui è inserita l'area                                                          | Object   |                                        |
| - guid               | UUID generato dalla piattaforma, identifica univocamente il plant                       | UUID     | "c55dd03a-c097-487c-a60c-bf3fa8abea5b" |
| - description        | descrizione del plant, non in lingua                                                    | String   | "Plant A"                              |
| guidAsset            | GUID dell'asset IoT che ha generato l'allarme                                           | String   | "592D9BEA5FD74E3DBF2C9BF5BD7CDA26"     |
| handlingUnits        | elenco delle handling units presenti nell'area nel momento dell'allarme                 | Array    |                                        |
| - gtin               | codice GTIN del prodotto                                                                | String   | "1234567890123"                        |
| - productDescription | descrizione del prodotto, non in lingua                                                 | String   | "Antibiotic X"                         |
| - lot                | lotto                                                                                   | String   | "U4654"                                |
| - quantity           | quantità di handling units presenti nell'area nel momento dell'allarme                  | Number   | 5                                      |
| - unitOfMeasure      | unità di misura della quantità                                                          | String   | "pallet"                               |

### TOR - Time out of refrigeration

#### Descrizione

Avviso che viene inviato quando le unità di movimentazione superano una determinata soglia di tempo al di fuori del proprio range di temperatura.
Vengono inviate le informazioni relative all'allarme, all'area e i prodotti / lotti che hanno superato l'intervallo TOR.

#### Esempio
 
100 cartoni di Aspirina 500g con TOR 4 ore e 200 cartoni di Aspirina 1000g con TOR 5 ore sono al di fuori del loro range di temperatura da 6 ore.
Attualmente sono nell'area di Carico A1 che è una zona non refrigerata.

#### Quando viene inviato

- la piattaforma tiene monitorati i tempi di permanenza delle handling units stoccate in aree a temperatura non controllata oppure in aree a temperatura controllata ma che hanno dei problemi di out of range
- al superamento delle soglie la piattaforma inserisce una notifica nella coda verso il communication frontend aggregando per area, i dati delle handling units vengono raggruppati per prodotto e lotto
- la coda richiama il webhook esposto dal communication frontend per inviare la notifica

#### Tracciato
```json
{
    "eventGuid": "ada49efe-c732-4ed3-a7a9-cb7275ae5c5e",
    "severity": 1,
    "alarmType": "TOR",
    "eventDate": "2020-11-17T12:00:00Z",
    "notificationDate": "2020-11-17T12:05:00Z",
    "area": {
        "guid": "c7163657-20c8-4fc3-925a-9028bc6b0d8f",
        "description": "Load Area",
        "category": "LOAD_AREA",
        "department": {
            "guid": "c55dd03a-c097-487c-a60c-bf3fa8abea5b",
            "description": "Packging"
        },
        "location": {
            "guid": "c55dd03a-c097-487c-a60c-bf3fa8abea5b",
            "description": "Area di Carico A1"
        }
    },
	"handlingUnits": 
    [
        {
            "gtin": "1234567890123",
            "productDescription": "Antibiotic X",
            "lot": "U4654",
            "quantity": 5,
            "unitOfMeasure" : "pallet",
            "TOR" : 7200000 ,
            "maxTOR" : 3600000
        },
        {
            "gtin": "1234567890123",
            "productDescription": "Antibiotic X",
            "lot": "U4655",
            "quantity": 3,
            "unitOfMeasure" : "pallet",
            "TOR" : 7200000 ,
            "maxTOR" : 3600000
        },
        {
            "gtin": "1234567890125",
            "productDescription": "Antibiotic Y",
            "lot": "U7655",
            "quantity": 200,
            "unitOfMeasure" : "cartoni",
            "TOR" : 7200000 ,
            "maxTOR" : 5600000
        }
	],
}
```

| Campo                | Descrizione                                                                             | Tipo     | Esempio                                |
| -------------------- | --------------------------------------------------------------------------------------- | -------- | -------------------------------------- |
| eventGuid            | UUID generato dalla piattaforma, identifica univocamente la notifica                    | UUID     | "ada49efe-c732-4ed3-a7a9-cb7275ae5c5e" |
| severity             | livello della notifica `1` - allarme                                                    | String   | "1"                                    |
| alarmType            | fisso OLT out of limit temperature                                                      | String   | "TOR"                                  |
| eventDate            | momento in cui viene generato l'evento dal device che monitora la temperatura dell'area | ISO 8601 | "2020-11-17T12:00:00Z"                 |
| notificationDate     | momento in cui la notifica viene accodata verso il communication - frontend             | ISO 8601 | "2020-11-17T12:00:00Z"                 |
| area                 | l'area in cui i prodotti si trovano nel momento dell'invio della notifica               | Object   |                                        |
| - guid               | UUID generato dalla piattaforma, identifica univocamente l'area                         | UUID     | "ada49efe-c732-4ed3-a7a9-cb7275ae5c5e" |
| - description        | descrizione dell'area, non in lingua                                                    | String   | "Cold Room 1"                          |
| - category           | categoria dell'area `COLD_ROOM`, (wave 2 `REFRIGERATOR_TRUCK`)                          | String   | "COLD_ROOM"                            |
| department           | dipartimento in cui è inserita l'area                                                   | Object   |                                        |
| - guid               | UUID generato dalla piattaforma, identifica univocamente il dipartimento                | UUID     | "c55dd03a-c097-487c-a60c-bf3fa8abea5b" |
| - description        | descrizione del dipartimento, non in lingua                                             | String   | "Packging"                             |
| location             | plant in cui è inserita l'area                                                          | Object   |                                        |
| - guid               | UUID generato dalla piattaforma, identifica univocamente il plant                       | UUID     | "c55dd03a-c097-487c-a60c-bf3fa8abea5b" |
| - description        | descrizione del plant, non in lingua                                                    | String   | "Plant A"                              |
| guidAsset            | GUID dell'asset IoT che ha generato l'allarme                                           | String   | "592D9BEA5FD74E3DBF2C9BF5BD7CDA26"     |
| handlingUnits        | elenco delle handling units presenti nell'area nel momento dell'allarme                 | Array    |                                        |
| - gtin               | codice GTIN del prodotto                                                                | String   | "1234567890123"                        |
| - productDescription | descrizione del prodotto, non in lingua                                                 | String   | "Antibiotic X"                         |
| - lot                | lotto                                                                                   | String   | "U4654"                                |
| - quantity           | quantità di handling units presenti nell'area nel momento dell'allarme                  | Number   | 5                                      |
| - unitOfMeasure      | unità di misura della quantità                                                          | String   | "pallet"                               |
| - TOR                | minuti in cui il prodotto è rimasto fuori dal range di temperatura previsto             | Number   | 7200000                                |
| - maxTOR             | tempo massimo consentito di permanenza fuori dal range espresso in minuti               | Number   | 3600000                                |

### EOD - End of detection

Descrizione


Quando viene inviato


Tracciato


## Frontend -> Piattaforma

### Lotto Compliance

#### Descrizione

L'utente richiede informazioni riguardo allo stato di compliance di un prodotto/lotto.

#### Esempio richiesta
https://ccp-provider-dev-qas.dev.cfapps.eu10.hana.ondemand.com/frontend/lotStatus(gtin='1234589',lot='AB123')

#### Tracciato risposta
```json
{
    "gtin" : "1234567",
    "lot" : "AB123",
    "locations" : [
        "Ontario...",
        "Plant B..,",
    ],
    "status" : 1
}
