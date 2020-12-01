# Communication Frontends

## Piattaforma -> Frontend

### OLT - Out of limit temperature

Descrizione

Avviso che viene inviato quando un'area refrigerata è fuori dal range di temperatura stabilito.
Vengono inviate le informazioni relative all'allarme, all'area e il suo contenuto nel momento in cui è scattato l'allarme, il contenuto raggruppato per prodotto/lotto e la sua quantità.

Esempio

La cella 1 del reparto packaging del plant A alle 13:30 ha raggiunto la temperatura di 20°, la sua temperatura prevista è 4° - 10° e nel momento dell'allarme conteneva 50 cartoni di aspirina lotto AB12344

Quando viene inviato

- l'area segnala in near realtime alla piattaforma che la temperatura rilevata è uscita dal range definito
- la piattaforma inserisce in near realtime la notifica nella coda verso il communication frontend
- la coda richiama il webhook esposto dal communication frontend per inviare la notifica

Tracciato

```json
{
    "eventGuid": "ada49efe-c732-4ed3-a7a9-cb7275ae5c5e",
    "severity": 1,
    "alarmType": "OLT",
    "eventDate": "2020-11-17T12:00:00Z",
    "notificationDate": "2020-11-17T12:05:00Z",
    "details": {
        "measurementUnit": "Celsius",
        "eventTemperature": "20.00",
        "workingTemperature": {
        
            "min": "-20.00",
            "max": "0.00"
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
            "productDescription": "”Antibiotic X",
            "lot": "U4654",
            "quantity": "200"
        },
        {
            "gtin": "1234567890123",
            "productDescription": "”Antibiotic X",
            "lot": "U4655",
            "quantity": "200"
        },
        {
            "gtin": "1234567890125",
            "productDescription": "”Antibiotic Y",
            "lot": "U7655",
            "quantity": "200"
        }
    ]
}
```

- `eventGuid`: UUID generato dalla piattaforma, identifica univocamente la notifica
- `severity`: livello della notifica `1` - allarme
- `alarmType`: fisso `OLT` out of limit temperature
- `eventDate`: momento in cui viene generato l'evento dal device che monitora la temperatura dell'area
- `notificationDate`: momento in cui la notifica viene accodata verso il communication - frontend
- `details`: dettagli dell'allarme
    - `measurementUnit`: unità di misura della temperatura rilevata
    - `eventTemperature`: temperatura rilevata nel momento dell'allarme
    - `workingTemperature`: range di temperatura di funzionamento previsto
        - `min`: temperatura minima
        - `max`: temperatura massima
    - `cause`: futuri ampliamenti, attualmente vuoto
- `area`: informazioni riguardanti l'area
    - `guid`: UUID generato dalla piattaforma, identifica univocamente l'area
    - `description`: descrizione dell'area, non in lingua
    - `category`: categoria dell'area `COLD_ROOM`, (wave 2 `TRUCK`)
    - `department`: dipartimento in cui è inserita l'area
        - `guid`: UUID generato dalla piattaforma, identifica univocamente il dipartimento
        - `description`: descrizione del dipartimento, non in lingua
    - `location`: plant in cui è inserita l'area
        - `guid`: UUID generato dalla piattaforma, identifica univocamente il plant
        - `description`: descrizione del plant, non in lingua
    - `guidAsset`: GUID dell'asset IoT che ha generato l'allarme
- `handlingUnits`: elenco delle handling units presenti nell'area nel momento dell'allarme
    - `gtin`: codice GTIN del prodotto
    - `productDescription`: descrizione del prodotto, non in lingua
    - `lot`: lotto
    - `quantity`: quantità di handling units presenti nell'area nel momento dell'allarme

### TOR - Time out of refrigeration

Descrizione


Quando viene inviato


Tracciato

### EOD - End of detection

Descrizione


Quando viene inviato


Tracciato

## Frontend -> Piattaforma

### Lotto Compliance

Descrizione

Quando viene richiesto

Tracciato

