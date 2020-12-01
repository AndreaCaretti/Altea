# Communication Frontends

## Piattaforma -> Frontend

### OLT - Out of limit temperature

Descrizione

Avviso che una area refrigerata è fuori dal range di temperatura stabilito

Quando viene inviato

- l'area segnala in near realtime alla piattaforma che la temperatura rilevata è uscita dal range definito
- la piattaforma inserisce in near realtime la notifica nella coda verso il communication frontend
- la coda richiama il webhook esposto dal communication frontend per inviare la notifica

Tracciato

```json
 {
     "nome": "sam"
 }
```

```
{
    "eventGuid": "ada49efe-c732-4ed3-a7a9-cb7275ae5c5e", // eventGuid invece che id
    "severity": 1,
    "eventDate": "2020-11-17T12:00:00Z", // invece che creationDate
    "notificationDate": "2020-11-17T12:05:00Z", // momento in cui inseriamo la notifica nella coda verso keethings
    "area": {
        // identifica l'area impattata dall'evento (per area intendiamo cella frigorifera ma in futuro anche un truck)
        "guid": "c7163657-20c8-4fc3-925a-9028bc6b0d8f",
        "description": "Cold Room 1",
        "category": "COLD_ROOM", // categoria dell'area impattata (COLD_ROOM, TRUCK, ...)
        "department": {
            // identifica il department in cui è contenuta l'area
            "guid": "c55dd03a-c097-487c-a60c-bf3fa8abea5b",
            "description": "Packging"
        },
        "location": {
            // identifica il plant in cui è contenuta l'area
            "guid": "c55dd03a-c097-487c-a60c-bf3fa8abea5b",
            "description": "Plant A"
        },
        "guidAsset": "592D9BEA5FD74E3DBF2C9BF5BD7CDA26" // guid dell'asset iot che ha notificato l'evento
    },
    "handlingUnits": [
        // Stiamo ragionando per "handling unit" contenute nell'area, dati aggregati per prodotto/lotto
        {
            "gtin": "1234567890123", // gtin invece che "unit"
            "productDescription": "”Antibiotic X", // productDescription inve che "description", non in lingua
            "lot": "U4654",
            "quantity": "200" // potrebbe essere utile avere la quantità di handling unit presenti nell'area nel momento dell'evento
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
    ],
    "alarmType": "OLT",
    "details": {
        "measurementUnit": "Celsius",
        "eventTemperature": "20.00", // eventTemperature invece che currentTemperatura, nel momento dell'evento
        "workingTemperature": {
            // Range di temperatura impostato nella cella nel momento della notifica (non dell'evento)
            "min": "-20.00",
            "max": "0.00"
        },
        "cause": "" // Non disponibile
    }
}
```

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

