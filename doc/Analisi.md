# Scopo

Pilota per mostrare la soluzione a prospect, verifica tecnologie/architettura

# Scenario

Prevediamo produzione di sacche di sangue, area di produzione, due celle frigorifere a temperatura controllata, una nell'area di stoccaggio, la seconda nell'area pre spedizione, un refrigerator truck parte dal magazzino di produzione e porta fino al distributore finale.

AGGIUNGERE SCENARI DEI TRE PARTNER

PRODUZIONE PRIMARIA
PRODUZIONE SECONDARIA
DEPOSITARIO

# Preparazione

Configurazione in CCP dello scenario, caricamento cliente, definizione dei frontends da connettere.
Ad ogni frontend viene assegnato un ID univoco, ogni messaggio inviato dal frontend verso la piattaforma deve contenere l'id, l'id deve quindi essere presente anche all'interno del frontend, inserito manualmente.
_(lunghezza del campo ID alfanumerico di n caratteri, le dimensioni del campo influiscono sui dati mandati in cloud e quindi sui costi di piattaforma)_.

Le celle frigorifere vengono impostate manualmente con la temperatura a cui deve essere mantenuto il prodotto e le soglie limite. Le celle possono ospitare un solo prodotto per volta oppure più prodotti che devono essere mantenuti nello stesso range di temperatura.

E' possibile immagazzinare anche temporaneamente dei prodotti, cioè inserisco tre sacche e poi dopo un'ora ne aggiungo un'altra, escono tutte assieme oppure anche separate.

# Processo

Caricamento manuale in CCP della configurazione del tenant del cliente:
- dati anagrafici
- elenco plant
- elenco aree
- elenco prodotti

In ERP viene creato il lotto, il lotto viene caricato manulmente in CCP.

La sacca di sangue viene prodotta, l'etichettatrice genera l'id univoco RFID, stampa e attacca l'etichetta, l'etichetta viene riletta per controllo, se tutto ok le informazioni dell'etichetta vengono inviate a CCP. Una etichetta RFID identifica una singola handling unit che verrà tracciata fino allo step in cui l'handling unit viene disaggregata, dal quel momento perdiamo il tracciamento della singola confezione.  
Per esempio se un cartone contiene 20 confezioni, viene spedito e tracciato, in seguito una confezione viene estratta dalla cartone e venduta, sulla singola confezione c'è stampato il lotto ma non si con quale cartone è stata spedita.

Viene inviato il seriale RFID contenente l'sscc dell'handling unit, la location, il lotto, business e technical send timestamp. L'RFID diventa la chiave univoca dell'unità di movimentazione. Tutti i messaggi successivi faranno riferimento all'unità di movimentazione tramite questo ID globalmente univoco, globalmente vuol dire univoco anche rispetto a tutti gli altri clienti della piattaforma.  
Per generalizzare il processo, il nome tecnico del campo id dell'unità non sarà RFID, ma HANDLING_UNIT_ID.
L'etichettatrice esegue una singola chiamata al gateway accentratore locale di plant che accoda il messaggio per l'invio a CCP. (Alternativa l'etichettatrice potrebbe raggruppare i codici generati e mandare pacchetti di messaggi). Il messaggio verso gateway viene inviato tramite protocollo MQTTs e da accentratore verso cloud in MQTTs.  
L'accentratore invia l'unità di movimentazione in CCP, l'unità viene creata, nella configurazione in cloud delle etichettatrici sarà possibile definire in quale area andare a posizionare l'handling unit appena etichettata. Dovremo avere l'elenco delle aree. L'area sarà un tipo generico di cold room, refrigerator truck oppure un'area a temperatura non controllata.

Gestione errori: se per errore viene inviato due volte lo stesso RFID il processo dovrebbe bloccarsi. Come vogliamo gestirlo?  
_I sistemi di serializzazione generano centralmente gli ID e i sistemi di livello x richiedono un sottoinsieme di codici. Noi ci accorgiamo di codici doppi solo quando il messaggio arriva in CCP, a questo punto come vogliamo gestirlo? Genericamente sarà la CCP ad avere un log di errori ed a gestire alerting._

L'etichettatrice deve avere un buffer in cui salvare i dati che non riesce ad inviare al gateway, esempio se il gateway è spento per manutenzione.

Con quale velocità vengono generati gli RFID?

L'unità di movimentazione passa sotto l'identification frontend di ingresso stoccaggio. Viene inviato un messaggio all'accentratore con l'id dell'handling unit movimentata.
In CCP dall'anagrafica dell'identification viene determinata la zona di arrivo, nell'anagrafica handling units viene aggiornata posizione conosciuta dell'handling unit. La direzione contraria farà ritornare l'handling unit nella precedente area in cui era l'handling unit (cioè non viene definita in anagrafica la area di arrivo per direzione contraria).
Abbiamo quindi l'anagrafica identifications ma anche l'anagrafica aree, dovremo mappare il processo e definire le aree. Come paletto per semplificare mettiamo che un'identification frontend porta sempre in modo fisso ad una certa area.
_In altri contesti i clienti non hanno accettato di mettere i dati in un servizio cloud saas pubblico, dobbiamo pensare di mettere i dati più sensibili non in cloud oppure in un cloud privato? mettendo i dati on premise oppure in un cloud privato decade il discorso saas. CONFERMATO CHE DEVE ESSERE TUTTO ASSOLUTAMENTE SAAS NESSUNA GESTIONE ON PREMISE, MAGARI CLOUD PRIVATO CIOE' DB SEPARATO_

L'identification frontend deve avere un buffer in cui salvare i dati che non riesce ad inviare al gateway, esempio se il gateway è spento per manutenzione.

L'unità di movimentazione passa sotto l'identification frontend posto sull'uscita dell'area di stoccaggio. Viene inviato un messaggio all'accentratore con l'id dell'handling unit movimentata.
In CCP dall'anagrafica dell'identification viene determinata la zona di arrivo, nell'anagrafica handling units viene aggiornata posizione conosciuta dell'handling unit. La direzione contraria farà ritornare l'handling unit nella precedente area. _(per rientrare nella cella frigorifera si puà anche passare dall'indentification di ingresso cella?)_

Nel frattempo ogni 15 minuti le celle frigorifere inviano i dati della temperatura misurata all'accentratore che a sua volta invia in CCP.
La cella invia i messaggi all'accentratore tramite MQTTs, accentratore invia i dati tramite protocollo MQTTs.

La cella frigorifera è stata impostata per lavorare in un certo range di temperatura, se la temperatura esce dal range invia un messaggio di temperatura con codice errore "anomalia temperatura", durante il periodo di anomalia la cella invia i dati all'accentratore ogni 5 minuti invece che ogni 15.
All'inizio dell'anomalia la cella deve anche avvisare tempestivamente degli utenti operatori nel plant riguardo l'anomalia. Chi deve ricevere l'alert? Su quale strumento riceve l'alert? Nel pilota prevediamo gestione turni?

La soluzione migliore sarebbe che il processo di alerting fosse tutto on-premise senza la necessità di collegamenti verso il cloud, come arrivano i dati al device?  
Gli alert vengono comunque tracciati nella piattaforma cloud.

Il T° frontend deve avere un buffer in cui salvare i dati che non riesce ad inviare al gateway, esempio se il gateway è spento per manutenzione.

Nel frattempo ogni 5 minuti gira il processo in CCP che calcola i dati di permanenza in area di ogni handling unit. Il processo incrocia i dati di movimentazione delle handling units con i dati di temperatura inviati dalle celle frigorifere per calcolare il T Min, T Max e TOR.  
Il TOR delle aree senza controllo temperatura è uguale al tempo di permanenza in area, nel caso di zona a temperatura controllata considera i tempi di anomalia considerando che una handling unit potrebbe essere solo passata dalla cella durante l'anomalia, magari perchè è stata sposata in una cella funzionante.  
Cioè se una sacca entra in cella alle 10:00 ed esce alle 16:00 e la cella ha un'anomalia di temperatura dalle 14:00 alle 20:00 il TOR è di 2 ore (dalle 14:00 alle 16:00).  
Il calcolo delle anomalia arriva alla risoluzione del minuto.  
_Alternativa, la cella è in grado di dirci dall'ora A all'ora B quanti minuti è stata fuori range, deve essere in grado di supportare molteplici richieste in parallelo, una per handling unit, possiamo ottimizzare inserendo una cache per evitare chiamate con gli stessi parametri. I servizi onPremise della cella devono essere rangiungibile dall'esterno, utilizzare SAP Cloud Connector?_

Nel frattempo ogni 15 minuti gira il processo in CCP che estrae tutte le handling unit arrivate a destinazione, estrae tutte le informazioni riepilogative dell'handling unit, prepara un JSON e lo scrive in Blockchain, il servizio Blockchain restituisce l'hash del JSON, l'hash viene salvato in CCP, i dati consolidati vengono spostati del database di archiviazione.
_(come capiamo se il processo di spedizione della sacca è concluso e consolidato?_)

Nel frattempo il communication frontend richiede a CCP i dati di una specifica handling unit _(o richiede i dati riepilogativi di un lotto?)_ CCP recupera i dati di riepilogo, se il tracciamento dell'handling unit è terminato e consolidato _(come e quando determiniamo e consideriamo un tracking concluso e consolidato?)_ viene fatta la verifica in blockchain della validità dei dati archiviati.

Nel frattempo il communication frontend richiede i dati di temperatura di un'area in un dato periodo di tempo, CCP recupera i dati di temperatura dal db iot.

Nel frattempo la piattaforma tiene monitorate le connessioni con i gateway edge.

## Casistiche determinazione TOR prodotto in cella con anomalie

Per calcolare il TOR durante la permanenza in area a temperatura anomala vengono sommati tutti i minuti in cui l'handling unit era in una area con anomalia di temperatura:

| Caso  |          |        | INIZIO ANOMALIA |          |       |        | FINE ANOMALIA |          |        |
| :---: | :------: | :----: | :-------------: | :------: | :---: | :----: | :-----------: | :------: | :----: |
|  1°   | INGRESSO | USCITA |                 |          |       |        |               |          |        |
|  2°   | INGRESSO |        |                 |          |       | USCITA |               |          |        |
|  3°   |          |        |                 | INGRESSO |       | USCITA |               |          |        |
|  4°   |          |        |                 | INGRESSO |       |        |               |          | USCITA |
|  5°   |          |        |                 |          |       |        |               | INGRESSO | USCITA |
|  6°   | INGRESSO |        |                 |          |       |        |               |          | USCITA |

| Regola                                          | Caso coperto | Inizio anomalia | Fine anomalia |
| ----------------------------------------------- | ------------ | --------------- | ------------- |
| INGRESSO <= START USCITA => START USCITA <= END | 2            | START           | USCITA        |
| INGRESSO >= START USCITA <= END                 | 3            | INGRESSO        | USCITA        |
| INGRESSO >= START INGRESSO <= END USCITA <= END | 4            | INGRESSO        | END           |
| INGRESSO <= START USCITA => END                 | 6            | START           | END           |

# Alternative:

## Cliente non vuole dati in cloud

Manteniamo i dati on premise oppure in private cloud? Solo dati in cloud, dati on premise non sono in ambito

## Logica di calcolo TOR on edge

Per calcolare il TOR in edge l'EDGE dovrebbe avere tutte le informazioni per determinare i tempi di fuori temperatura, mantenere lo storico di tutte le temperature, oppure la cella deve ritornare i minuti di anomalia nel periodo

# Tipologie di utenti:

## PlatformAdmin

Utente amministratore della piattaforma, sono utenti interni per la gestione della piattaforma (configurazione della piattaforma, monitoring, ...), i clienti finali della piattaforma non hanno accesso con questo livello di accesso.
Riceve le notifiche di alert di alto livello della piattaforma, esempio alert su problemi di avvio di microservizio della piattaforma.

## Superuser

Utente gestore dei dati del singolo cliente (definizione di una nuova cella frigorifera, gesione anagrafica prodotti, ...), i clienti finali della piattaforma hanno accesso con questo livello.
Riceve le notifiche di alert di alto livello del cliente, esempio disconnessione del gateway accentratore di plant con il cloud.

## Operatore

Utente operativo, utente che lavora all'interno del plant, i clienti finali della piattaforma hanno accesso con questo livello.
Riceve le notifiche di alert di basso livello del cliente, esempio segnalazioni in arrivo dalla cella, problemi riconoscimento RFID.

## Utente

?

# Tabelle centrali di piattaforma

Tabelle centrali di piattaforma - DB Single Tenant

## Tabella CustomerCategories

Categorie di clienti

| _ID_ | _name_        | description   |
| ---- | ------------- | ------------- |
| GUID | Produttore    | Market Holder |
| GUID | Trasportatore | Trasportatore |
| GUID | Depositario   | Depositario   |

## Tabella Customers

Dati anagrafici soggetti

| _ID_   | name (50)  | category (CustomerCategories) | gs1CompanyPrefix (9) | tenantGUID                           |
| ------ | ---------- | ----------------------------- | -------------------- | ------------------------------------ |
| *GUID* | Customer A | Produttore                    | 123456789            | a1d03e7f-53e4-414b-aca0-c4d44157f2a0 |
| *GUID* | Customer B | Trasportatore                 | 234567890            | dfea1d03e7f-53e4-414b-aca0-c4d4334ff |
| *GUID* | Customer C | Depositario                   | 567891234            | e34s1d03e7f-53e4-414b-aca0-ddde3322a |

# Tabelle configurazione piattaforma

Tabelle per parametrizzare la piattaforma - DB Multitenant

## Tabella CustomerCategories

Categorie di clienti

| _ID_ | _name_        | description   |
| ---- | ------------- | ------------- |
| GUID | Produttore    | Market Holder |
| GUID | Trasportatore | Trasportatore |

## Tabella AreaCategories

Categorie di aree

| _ID_ | _name_ (25)        |
| ---- | ------------------ |
| GUID | No Temperature     |
| GUID | Cold Room          |
| GUID | Refrigerator Truck |

## Tabella ControlPointsCategories

Categorie di control points

| _ID_   | _name_ (25)         |
| ------ | ------------------- |
| *GUID* | Etichettatrice RFID |
| *GUID* | Gate RFID           |
| *GUID* | Gate RFID on Truck  |
| *GUID* | Trasportatore       |
| *GUID* | Depositario         |

## Tabella TemperatureRanges

Range di temperature

| _ID_   | _name_ (25) | min | max | warningMin | warningMax |
| ------ | ----------- | --- | --- | ---------- | ---------- |
| *GUID* | 6-10        | 6   | 10  | 8          | 9          |
| *GUID* | 12-18       | 12  | 18  | 14         | 16         |

* min         temperatura minima in °C per calcolare TOR
* max         temperatura massima in °C per calcolare TOR
* warningMin  temperatura minima in °C per far scattare il warning
* warningMax  temperatura massima in °C  per far scattare il warning

# Tabelle parametriche/customizing singolo cliente

Tabelle per parametrizzare/customizzare la soluzione per il singolo cliente, DB Multitenant

## Tabella Customers

Dati anagrafici cliente, siccome i dati dei clienti sono separati a livello di tenant ci aspettiamo un solo record per tenant

| _ID_   | name (50)  | category (CustomerCategories) | gs1CompanyPrefix (9) |
| ------ | ---------- | ----------------------------- | -------------------- |
| *GUID* | Customer A | Produttore                    | 123456789            |

## Tabella Locations

| _ID_   | name   |
| ------ | ------ |
| *GUID* | PlantA |
| *GUID* | PlantB |

## Tabella Areas

### Produttore

| _ID_   | name               | category (AreaCategories) | location (Locations) | ID Device IoT |
| ------ | ------------------ | ------------------------- | -------------------- | ------------- |
| *GUID* | Produzione Plant A | No Temperature            | PlantA               |               |
| *GUID* | Stoccaggio         | Cold Room                 | PlantA               | 99999         |
| *GUID* | Uscita merci       | No Temperature            | PlantA               |               |
| *GUID* | Piazzale esterno   | No Temperature            | PlantA               |               |

-   Mappare le aree non a temperatura controllata è utile anche ai fini statistici. Grafici che indicano le aree non controllate a maggior permanenza.

### Trasportatore

| _ID_   | name      | category (AreaCategories) | location (Locations) | ID Device IoT |
| ------ | --------- | ------------------------- | -------------------- | ------------- |
| *GUID* | Targa ABC | Refrigerator Truck        | Mobile               | 11111         |
| *GUID* | Targa 123 | Refrigerator Truck        | Mobile               | 22222         |
| *GUID* | Targa ZXY | Refrigerator Truck        | Mobile               | 33333         |

### Depositario

| _ID_   | name             | category (AreaCategories) | location (Locations) | ID Device IoT |
| ------ | ---------------- | ------------------------- | -------------------- | ------------- |
| *GUID* | Entrata merci    | No Temperature            | PlantA               |               |
| *GUID* | Stoccaggio       | Cold Room                 | PlantA               | 5555          |
| *GUID* | Uscita merci     | No Temperature            | PlantA               |               |
| *GUID* | Piazzale esterno | No Temperature            | PlantA               |               |

## Tabella ControlPoints

### Produttore

| _ID_   | name             | category (ControlPointsCategories) |
| ------ | ---------------- | ---------------------------------- |
| *GUID* | Etichettatrice A | Etichettatrice RFID                |
| *GUID* | Stoccaggio       | Gate RFID                          |
| *GUID* | Uscita A         | Gate RFID                          |
| *GUID* | Trasportatore 1  | Trasportatore                      |
| *GUID* | Trasportatore n  | Trasportatore                      |
| *GUID* | Depositario 1    | Depositario                        |
| *GUID* | Depositario n    | Depositario                        |

### Trasportatore

| _ID_   | name      | category (ControlPointsCategories) |
| ------ | --------- | ---------------------------------- |
| *GUID* | Targa ABC | Gate RFID                          |
| *GUID* | Targa 123 | Gate RFID                          |
| *GUID* | Targa ZXY | Gate RFID                          |

### Produttore

| _ID_   | name           | category (ControlPointsCategories) |
| ------ | -------------- | ---------------------------------- |
| *GUID* | Entrate Merci  | Gate RFID                          |
| *GUID* | Stoccaggio     | Gate RFID                          |
| *GUID* | Uscita Merci A | Gate RFID                          |

# Tabelle anagrafiche

Tabelle anagrafiche con dati specifici di un singolo cliente, i dati dei clienti sono suddivisi a livello tenant

## Tabella Products

| _ID_   | _gtin_ (GTIN) | erpProductCode (50) | denomination (100) | max_tor | temperatureRange |
| ------ | ------------- | ------------------- | ------------------ | ------- | ---------------- |
| *GUID* | 1234567890123 | PROD-001            | Sacca di sangue    | 200     | 12-18            |

GTIN:   
  * 01-09 Prefisso aziendale GS1  
  * 10-12 Codide prodotto  
  * 13    Cifra di controllo  

* max_tor è il numero di minuti massimo fuori dal range di temperatura

## Tabella Routes

Records solo nel DB del produttore

| _ID_   | prodotto (Products) | step | controlPoint (controlPoints) | direction | destinationArea (Locations)  |
| ------ | ------------------- | ---- | ---------------------------- | --------- | ---------------------------- |
| *GUID* | 1234567890123       | 1    | Etichettatrice A             | F         | Produzione Plant A           |
| *GUID* | 1234567890123       | 2    | Stoccaggio                   | F         | Cold Room                    |
| *GUID* | 1234567890123       | 3    | Stoccaggio                   | B         | Uscita merci                 |
| *GUID* | 1234567890123       | 4    | Uscita A                     | F         | Piazzale esterno             |
| *GUID* | 1234567890123       | 5    | Trasportatore                | F         | Truck                        |
| *GUID* | 1234567890123       | 6    | Trasportatore                | B         | Piazzale esterno depositario |
| *GUID* | 1234567890123       | 7    | Depositario                  | F         | Depositario                  |

## Tabella Lots

| _ID_   | _name_  (20) | productionDate (Date) | expirationDate (Date) | Products (association) |
| ------ | ------------ | --------------------- | --------------------- | ---------------------- |
| *GUID* | LOT-XYZ      | 06.07.2020            | 06.07.2022            | prod567890123          |

## Tabella HandlingUnits

| _sscc_ (SSCC)      | lot     | lastKnownArea(Locations) | inAreaBusinessTime (Timestamp) | jsonSummary (LargeString)             | blockchainHash (100)                                 |
| ------------------ | ------- | ------------------------ | ------------------------------ | ------------------------------------- | ---------------------------------------------------- |
| 123456789012345678 | LOT-XYZ | Uscita magazzino         | 2020-10-14T09:01:33.763Z       | { HandlingUnit: "HandlingUnitA", etc} | adb24ba2f2ef33d73d79e60b9d47f7fb97c69013eb6c8f37c... |

* il campo lastKnowArea indica l'ultima posizione conosciuta dell'SSCC
* il campo inAreaBusinessTime indica il momento in cui è stato rilevato l'ultimo spostamento

SSCC:   
  * 01    Cifra di estensione, identifica il tipo di collo: pallet, cartone, scatola
  * 02-10 Prefisso aziendale GS1
  * 11-17 Numero seriale unità logistica
  * 18    Cifra di controllo

# Tabelle transazionali

Tabella contenenti dati transazionali

## Tabella HandlingUnitsRawMovements

Passaggi Handling Unit da Control Point

| _ID_   | CP_ID (String 36)                    | SSCC_ID (SSCC)     | TE (String 24)           | TS (String 24)           | DIR (String 1) |
| ------ | ------------------------------------ | ------------------ | ------------------------ | ------------------------ | -------------- |
| *GUID* | 90abe75c-e2c6-4e5f-a12f-fb81aa50d011 | 123456789012345678 | 2020-10-14T09:01:33.763Z | 2020-10-14T09:01:33.763Z | F              |
| *GUID* | 90abe75c-e2c6-4e5f-a12f-fb81aa50d011 | 123456789012345678 | 2020-10-14T09:02:33.763Z | 2020-10-14T09:02:33.763Z | F              |
| *GUID* | 90abe75c-e2c6-4e5f-a12f-fb81aa50d011 | 123456789012345678 | 2020-10-14T09:03:33.763Z | 2020-10-14T09:03:33.763Z | F              |
| *GUID* | 90abe75c-e2c6-4e5f-a12f-fb81aa50d011 | 123456789012345678 | 2020-10-14T09:04:33.763Z | 2020-10-14T09:04:33.763Z | F              |
| *GUID* | 90abe75c-e2c6-4e5f-a12f-fb81aa50d011 | 123456789012345678 | 2020-10-14T09:05:33.763Z | 2020-10-14T09:05:33.763Z | B              |
| *GUID* | 90abe75c-e2c6-4e5f-a12f-fb81aa50d011 | 123456789012345678 | 2020-10-14T09:06:33.763Z | 2020-10-14T09:06:33.763Z | F              |
| *GUID* | 90abe75c-e2c6-4e5f-a12f-fb81aa50d011 | 123456789012345678 | 2020-10-14T09:07:33.763Z | 2020-10-14T09:07:33.763Z | B              |
| *GUID* | 90abe75c-e2c6-4e5f-a12f-fb81aa50d011 | 123456789012345678 | 2020-10-14T09:08:33.763Z | 2020-10-14T09:08:33.763Z | F              |

* CP_ID      GUID del control point definito in CCP       
* TE         Momento dell'evento                          
* TS         Momento dell'invio del messaggio             
* SSCC_ID    Codice SSCC dell'handling unit               
* DIR        Valori possibili: F -> Forward, B -> Backward

## Tabella HandlingUnitsMovements

Passaggi Handling Unit da Control Point

| _ID_   | sscc (SSCC)        | businessTime (Timestamp) | controlPoint           | direction | destinationArea                  | elaborationTime (Timestamp) |
| ------ | ------------------ | ------------------------ | ---------------------- | --------- | -------------------------------- | --------------------------- |
| *GUID* | 123456789012345678 | 2020-10-14T09:01:33.763Z | Etichettatrice A       | Forward   | Produzione                       | 2020-10-14T09:01:33.763Z    |
| *GUID* | 123456789012345678 | 2020-10-14T09:02:33.763Z | Ingresso Stoccaggio    | Forward   | Stoccaggio                       |                             |
| *GUID* | 123456789012345678 | 2020-10-14T09:03:33.763Z | Uscita Stoccaggio      | Forward   | Spedizione                       |                             |
| *GUID* | 123456789012345678 | 2020-10-14T09:04:33.763Z | Uscita Stoccaggio      | Backward  | Stoccaggio                       |                             |
| *GUID* | 123456789012345678 | 2020-10-14T09:05:33.763Z | Ingresso spedizione    | Forward   | Spedizione                       |                             |
| *GUID* | 123456789012345678 | 2020-10-14T09:06:33.763Z | Uscita area spedizione | Forward   | Uscita magazzino                 |                             |
| *GUID* | 123456789012345678 | 2020-10-14T09:07:33.763Z | PortaTruckABCD         | Forward   | Truck Targa ABCD                 |                             |
| *GUID* | 123456789012345678 | 2020-10-14T09:08:33.763Z | PortaTruckABCD         | Backward  | **Come capire la destinazione?** |                             |

* destination area viene determinata dalla tabella percorsi al momento dell'arrivo dell'evento nella piattaforma, modifiche alla tabella percorsi non ha conseguenze sui dati salvati
* elaborationTime indica in quale momento il movimento è stato elaborato dalla routine che gestisce gli spostamenti cioè che aggiorna il campo lastKnowArea nella tabella HandlingUnits
  e aggiorna la tabella HandlingUnitsResidenceTime

## Tabella HandlingUnitsResidenceTime

Permanenza Handling Unit in area

| _ID_   | sscc (SSCC)        | step | area                         | inBusinessTime           | outBusinessTime          | residenceTime (Integer) | tor | tmin  | tmax  | torElaborationTime (Timestamp) |
| ------ | ------------------ | ---- | ---------------------------- | ------------------------ | ------------------------ | ----------------------- | --- | :---: | :---: | ------------------------------ |
| *GUID* | 123456789012345678 | 1    | Produzione Plant A           | 2020-10-14T09:01:33.763Z | 2020-10-14T09:01:33.763Z | 1600                    | 0   |       |       | 2020-10-14T09:01:33.763Z       |
| *GUID* | 123456789012345678 | 2    | Cold Room                    | 2020-10-14T09:01:33.763Z | 2020-10-14T09:01:33.763Z | 3600                    | 30  |   4   |  20   | 2020-10-14T09:01:33.763Z       |
| *GUID* | 123456789012345678 | 3    | Uscita merci                 | 2020-10-14T09:01:33.763Z | 2020-10-14T09:01:33.763Z | 1600                    |     |       |       |                                |
| *GUID* | 123456789012345678 | 4    | Piazzale esterno             | 2020-10-14T09:01:33.763Z | 2020-10-14T09:01:33.763Z | 2000                    |     |       |       |                                |
| *GUID* | 123456789012345678 | 5    | Truck                        | 2020-10-14T09:01:33.763Z | 2020-10-14T09:01:33.763Z | 20                      |     |       |       |                                |
| *GUID* | 123456789012345678 | 6    | Piazzale esterno depositario | 2020-10-14T09:01:33.763Z | 2020-10-14T09:01:33.763Z | 20                      |     |       |       |                                |
| *GUID* | 123456789012345678 | 7    | Depositario                  | 2020-10-14T09:01:33.763Z | 2020-10-14T09:01:33.763Z | 20                      |     |       |       |                                |

* inBusinessTime è l'ora di ingresso dell'handling unit nell'area
* outBusinessTime è l'ora di uscita dell'handling unit dall'area
* ResidenceTime è il numero di minuti di permanenza dell'handling unit nell'area
* TOR è il numero di minuti di permanenza nell'area con temperatura fuori range
* tmin
* tman
* elaborationTimeTor momento in cui sono stati recuperati di dati di temperatura e calcolo TOR

(per recuperare i range di temperatura dei soggetti esterni verrà esposto un servizio esterno alla piattaforma)

## Tabella temperatura monitorata in area

I dati di temperatura sono salvati nel Data Lake IoT, la tabella viene riportata qui per promemoria, i campi sono provvisori

| _Area_     | _Ora_ | Temperatura °C | Anomalia     |
| ---------- | ----- | -------------- | ------------ |
| Stoccaggio | 16:00 | 4              |              |
| Stoccaggio | 16:15 | 4              |              |
| Stoccaggio | 16:30 | 20             | OUT_OF_RANGE |
| Stoccaggio | 16:35 | 20             | OUT_OF_RANGE |
| Stoccaggio | 16:40 | 20             | OUT_OF_RANGE |
| Stoccaggio | 16:45 | 20             | OUT_OF_RANGE |
| Stoccaggio | 16:50 | 20             | OUT_OF_RANGE |
| Stoccaggio | 16:55 | 4              |              |
| Stoccaggio | 17:00 | 4              |              |

# Tabella Alerts

Tabelle di alert applicativi rilevati dalla piattaforma da segnalare / segnalati agli utenti:

| _ID_   | _alertBusinessTime_      | sender(?) | message (String)                           | level (alertLevel) |
| ------ | ------------------------ | --------- | ------------------------------------------ | ------------------ |
| _GUID_ | 2020-10-14T09:01:33.763Z |           | RFID XXX già esistente                     | Grave              |
| _GUID_ | 2020-10-14T09:01:33.763Z |           | Temperatura cella fuori range da 20 minuti | Alert              |

# Tabella Audits

Tabelle di auditing della configurazione della piattaforma:

| _businessTime_           | entity   | key      | event  | changedField | oldValue | newValue | user      |
| ------------------------ | -------- | -------- | ------ | ------------ | -------- | -------- | --------- |
| 2020-10-14T09:01:33.763Z | Products | PROD-001 | CREATE |              |          |          | SBARZAGHI |
| 2020-10-14T09:01:33.763Z | Products | PROD-001 | UPDATE | TOR          | 18       | 20       | SBARZAGHI |
| 2020-10-14T09:01:33.763Z | Products | PROD-001 | UPDATE | DESCRIZIONE  | aaaa     | AAAA     | SBARZAGHI |

# Log piattaforma

Log interni di piattaforma vengono centralizzati in Elasticsearch, visualizzazione tramite Kibana

# Architettura Cold Chain Platform

## Central Platform

Soluzione sviluppata su SAP Cloud Platform, microservizi Cloud Foundry

## Cloud Supervisor

-   SAP Cloud Platform - Cloud Foundry
-   SAP Leonardo IoT
-   Custom

## Edge Gateway

Gateway fisico accentratore verso la piattaforma cloud.  
Instaura una connessione permanente verso il cloud, monitora la connessione, se la connessione cade riconnette.  
Riceve i messaggi tramite protocollo MQTTs dai frontend in formato payload condiviso, esegue store e forward verso cloud, i dati vengono salvati in un database solo fino a quando non vengono passati alla piattaforma cloud.

## Storage Cloud

Tipologie di storage

| Tipologia Dati       | Tipologia Storage    | Prodotto                                | Prodotto Alternativo           | Fornitore | Fornitore Alternativo |
| -------------------- | -------------------- | --------------------------------------- | ------------------------------ | --------- | --------------------- |
| Configurazione       | Database Relazionale | SAP HANA Cloud                          | SAP HANA (gestione on-premise) | Microsoft | SAP                   |
| Anagrafiche          | Database Relazionale | SAP HANA Cloud                          |                                | SAP       |                       |
| Transazionale sicuro | Ledger Database      | AWS Quantum Ledger                      | SAP HANA Cloud                 | Amazon    |                       |
| Consolidato/Storico  | Database NOSQL       | SAP HANA Cloud - Data Lake              | SAP HANA (gestione on-premise) | Microsoft | SAP                   |
| IoT Timeseries       | Piattaforma IoT      | SAP Leonardo IoT                        | Azure IoT Hub                  | SAP       |                       |
| IoT Warm/Cold        | Piattaforma IoT      | SAP Leonardo IoT                        | Azure IoT Hub                  | SAP       |                       |
| Log                  | Elasticsearch        | SAP Application Logging (Elastic Stack) |                                | SAP       |                       |
| Audit transazionali  | Database Relazionale | SAP HANA Cloud                          |                                | SAP       |                       |
| Blockchain           |                      |                                         |                                | JSB       |                       |

## Servizi SAP per BOM

SAP HANA Cloud
SAP Application Runtime
SAP Enterprise Messaging
SAP Application Logging
SAP Alerting
SAP IoT Cloud Foundry
SAP Leonardo IoT
SAP Integration Service
SAP Identity Service
SAP Job Scheduler

## User Interface

### User Interface Portale Piattaforma

User interface per la configurazione e gestione della piattaforma

-   SAP Launchpad Portal Cloud
-   SAP Fiori

### User Interface Operativa

User interface per la configurazione e gestione dei dati clienti, dipendono dalla tipologia di cliente?

-   SAP Launchpad Portal Cloud
-   SAP Fiori

### User Interface Mobile

User interface mobile, dipendono dalla tipologia di cliente?

### User Interface Dashboarding

Applicazioni di dashboarding e analitiche, dipendono dalla tipologia di cliente?

## Integrazione

### Comunicazione passaggi da control points

Control Point ---> Plant Gateway ---> Topic SCP EM ---> Queue SCP EM ---> CAP Service ---> SAP DB HANA Customer Tenant

Note:
* ogni gateway del cliente avrà il suo clientid e clientsecret con cui autenticarsi (OAuth2 client_credentials)
* ogni gateway del cliente avrà un suo specifico topic su cui scrivere
* ogni gateway del cliente sarà autorizzato a pubblicare solo sul suo topic
* ogni topic sarà collegato ad una specifica queue in cui verranno salvati i suoi messaggi verso il CAP, ci permette di monitorare i messaggi del singolo cliente
* tutti i webhook punteranno al sevizio CAP multitenant, autenticazione con clientid, clientsecret, il clientid identifica il tenant del cliente
* il servizio CAP Service sarà scalabili aumentanto ram e aumentando le istanze

Protocolli e autenticazione:

| Sorgente      | Destinazione  | Protocollo | Autenticazione                                            |
| ------------- | ------------- | ---------- | --------------------------------------------------------- |
| Control point | Plant Gateway | MQTTs      | basic                                                     |
| Plant Gateway | SCP EM        | MQTTs      | OAuth2 client_credentials (clientid, clientsecret, token) |
| SCP EM        | CAP Service   | AMQPs      | OAuth2 client_credentials (clientid, clientsecret, token) |

### Formato messaggio passaggio handling unit

Il formato del payload del messaggio di passaggio dell'handling unit da control point è pensato per limitare il consumo di banda tra i componenti, per maggiore facilità di lettura il formato del payload è pretty print, in produzione sarà "linearized".

Esempio:
```
{
	"CP_ID": "90abe75c-e2c6-4e5f-a12f-fb81aa50d011",
    "DIR": "F"
    "SSCC_ID": "123456789012345678",
    "TE": "2020-10-14T09:01:33.763Z",
	"TS": "2020-10-14T09:01:34.763Z",
}
```

| Nome Campo | Nome Esteso                        | Descrizione                                   | Formato                | Esempio                              |
| ---------- | ---------------------------------- | --------------------------------------------- | ---------------------- | ------------------------------------ |
| CP_ID      | Control Point GUID                 | GUID del control point definito in CCP        | GUID 36 CHAR           | 90abe75c-e2c6-4e5f-a12f-fb81aa50d011 |
| TE         | Time Event                         | Momento dell'evento                           | Edm.DateTimeOffset UTC | 2020-10-14T09:01:33.763Z             |
| TS         | Time Send                          | Momento dell'invio del messaggio              | Edm.DateTimeOffset UTC | 2020-10-14T09:01:34.763Z             |
| SSCC_ID    | Serialized shipping container code | Codice SSCC dell'handling unit                | GS1 SSCC               | 123456789012345678                   |
| DIR        | Direction                          | Valori possibili: F -> Forward, B -> Backward | CHAR 1                 | F                                    |

### Comunicazione dati temperatura da cella frigorifera_

T° Data Logger ---> Plant Gateway ---> SCP Internet of Things ---> SCP IoT DataLake

Protocolli e autenticazione:

| Sorgente      | Destinazione  | Protocollo | Autenticazione         |
| ------------- | ------------- | ---------- | ---------------------- |
| Data Logger   | Plant Gateway | MQTTs      | basic                  |
| Plant Gateway | SCP IoT       | MQTTs      | clientid, clientsecret |

### Comunicazione dati temperatura da refrigerator truck

T° Data Logger ---> Truck Gateway ---> SCP Internet of Things ---> SCP IoT DataLake

_Comunicazione da piattaforma cloud verso blockchain_

Servizio CAP ---> Blockchain
Servizio CAP <--- Blockchain

-   Cloud -> Blockchain => HTTPS REST API

### Comunicazione da communication frontend verso piattaforma cloud

-   Communication Frontend -> Cloud => HTTPS REST API (SAP API HUB per security, traffic management, KPIs, Monetizing)

## Autenticazione / Autorizzazioni Cloud

SAP Identity Service (Basic, Certificates, SAML, OAuth 2.0, Microsoft ADFS, User Replication, ...)

## Autenticazione Edge Gateway

Basic

## Alerting Edge

Architettura alerting onsite senza connessione Cloud?

# Sincronizzazione ora componenti

L'ora verrà sincronizzata rispetto al server centrale XXX

# Due pensieri per cold chain

1. Gestione ambiente di sviluppo e devops (costi generali)
2. Metodo di integrazione backend {cloud connector?)
3. Scalabilità e numeri a crescere per runtime gb (SCP runtime) al variare dei clienti per gestire il volume
4. Gestione dei downtime / fail (di platform, come incidono?)
5. Gestione dati onpremise (abbiamo detto out of scope vero?)
6. Api manager, non lo abbiamo previsto alla fine (meglio rivalutare?)

# Versioning

Un solo enorme repository GIT suddiviso in sottocartelle, una sottocartella per ogni modulo così da poter gestire le dipendenze tra moduli. 
Esempio possiamo gestire un nuovo campo aggiunto nell'entity CAP e la sua gestione nel webhook di ingestion dei dati transazionali, tutto con un solo commit.

Repository github/alteaup/cloudcoldchain

# Ingestion creazione Handling Unit

## Analisi

-   Etichettatrice genera il codice dell'handling unit, ogni tanto invia un pacchetto con l'elenco dell'handling unit al gateway centrale di plant, potrebbe essere ogni N minuti, una volta al giorno, a fine lotto
-   Il gateway invia le informazione in cloud ad una queue definita in SAP Enterprise Messaging con protocollo MQTT, una queue per singolo cliente
-   SAP Enterprise messaging invia i dati della coda verso un webhook implementato in Cloud Foundry attraverso una comunicazione interna AMQP (da confermare se AMQP gestione QoS 1, altrimenti REST), con quality of service 1 (at least one)
-   Il webhook riceve il messaggio e lo riconosce come messaggio di creazione HU, esegue dei controlli di validazione dei dati, salva i dati delle handling unit nel db e conferma la ricezione a SAP Enterprise Messaging.
-   Nel caso di problemi il webhook avvisa attraverso il servizio di alerting CCC

## Reliability

L'etichettatrice ha un db di store da N GB, in caso di mancanto collegamento con il gateway mantiene i dati in locale, la riconessione al gateway avviene in automatico.  
Non è previsto un backup del db dell'etichettatrice.

Il gateway ha un db di store da N GB, in caso di mancato collegamento con il cloud è in grado di mantenere i dati in locale, la riconnessione al servizio cloud è automatico.  
Non è previsto un backup del db del gateway.

SAP Enteprise Messaging ha un db di store da 10 GB, in caso di mancato collegamento con il servizio cloud o la non conferma di ricezione del messaggio da parte del servizio cloud, è in grado di mantenere i dati in locale, i tentativi di invio verso il webservice sono automatici.  
E' disponibile una dashboard con il numero di messaggi in coda in attesa di essere inviati, non c'è dettaglio del contenuto dei messaggi.  
Il servizio è in gestione a SAP Cloud Platform, backup gestito in modo trasparente.

_Note SAP Enteprise Messaging: The order of delivery is not guaranteed by the service._
_Aggiornamento dopo incident da provare:_
\_
537885 / 2020 The order of delivery is not guaranteed for the messaging protocols supported by the service.

enterprise messaging

Hi Samuele,

SAP Cloud Platform Enterprise Messaging does not yet offer in-order delivery of messages with REST consumers.

However you can achieve in-order with certain specific setup (with MQTT publisher and AMQP consumer). Please see the below for details on the same.

Publisher (with MQTT)

1.  Producer must send one event at a time, i.e. send a second event only after the first event is acknowledged by EMS
2.  Producer must send events synchronously, i.e. publish the event as soon as the operation happens
3.  A single producer must publish events
4.  Events must be routed to an EXCLUSIVE queue
5.  The queue must have the following configuration: maxDeliveredUnackedMsgsPerFlow = 1

Consumer (with AMQP)

1.  Consumer consumes from the EXCLUSIVE queue
2.  Consumer must consume one event at a time (i.e. with prefetch count of 1). EMS will send a second event only after the consumer has acknowledged the first

Please note this is a specific setup in which one can't have multiple app instances working a producers and consumers.

Regards,
indeevar

-

## Limitazioni

### Definite da noi come prodotto

-   1 subaccount gestisce fino a 100 gateway (numero massimo connessione SAP Enterprice Messaging)

### SAP Enterprise Messaging

Limitazioni prese da:
https://help.sap.com/viewer/bf82e6b26456494cbdd197057c09979f/Cloud/en-US/ac83090b07684f8e908df40d024f8fe5.html

-   Message Size

    -   The maximum message size is 1 MB for all messaging protocols
    -   The maximum storage space for all messages in all the queues per subaccount is 10 GB
    -   The maximum message throughput per subaccount is 250 KB/s
    -   The maximum message throughput per subaccount 1.280 messaggi al secondo

-   Queues and Queue Subscriptions

    -   The maximum number of queues per subaccount is 250
    -   The maximum number of queue subscriptions per subaccount is 10,000

-   Connections
    -   The maximum number of connections per subaccount is 100
    -   The maximum number of connections per message client (service instance) is 10
    -

## Metriche di costo

-   Comunicazione interna al plant, nessuna costo
-   Invio dati verso SAP Enterprise Messaging, GB di banda consumata, 9€ al GB
-   Comunicazione tra SAP Enterprise Messaging e webhook, 9€ al GB
-   Dimensioni singolo messaggio ~200 Byte (135 Byte effettivi + 50% overhead e contigency)
-   Numero messaggi al GB di banda => ( 1.073.741.824 Byte / 200 Byte / 2 ) - 10% contigency = 2.250.000 messaggi


# Struttura Repository

| File / Folder                                                            | Purpose                                                                                  |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `doc/`                                                                   | Folder with additional specific documentation                                            |
| `central/`                                                               | Folder with with all central platform components not dependents on customer subscription |
| `central/db/`                                                            | Central domain models                                                                    |
| `central/srv/`                                                           | Central service models and code                                                          |
| `central/app/`                                                           | Content for central UI frontends                                                         |
| `central/app/flpSandbox`                                                 | Configuration of the Fiori Launchpad sandbox for local tests                             |
| `central/app/index.cds`                                                  | Index of all the UI related cds annotations                                              |
| `central/cloud-foundry/`                                                 | Cloud Foundry related objects, services, and configuration                               |
| `central/cloud-foundry/approuter`                                        | App Router                                                                               |
| `central/cloud-foundry/approuter/xs-apps.json`                           | Configuration of the App Router routes                                                   |
| `central/cloud-foundry/html5-deployer`                                   | HTML5 Deployer                                                                           |
| `central/cloud-foundry/portal-deployer`                                  | Portal Deployer                                                                          |
| `central/cloud-foundry/portal-deployer\portal-site\CommonDataModel.json` | Configuration of the Fiori Launchpad in Cloud                                            |
| `central/cloud-foundry/xsuaa`                                            | XSUAA Service (Authorization)                                                            |
| `central/cloud-foundry/xsuaa/xs-security.json`                           | Authorization Scopes and Roles configuration central platform                            |
| `central/mta.yaml`                                                       | MTA yaml configuration for the whole central project                                     |
| `central/package.json`                                                   | Central project metadata and configuration                                               |
| `tenant/`                                                                | Folder with with customer tenant dependent components                                    |
| `tenant/db`                                                              | Customer tenant domain models                                                            |
| `iot/`                                                                   | IoT Components                                                                           |
| `enterprise-messaging/`                                                  | Enterprise Messaging Components Components                                               |
| `readme.md`                                                              | Main documentation (this document)                                                       |

# Layout SAP Cloud Platform

## Subaccount dev-central

Central Objects Development

Space:
- dev

Contiene gli oggetti central utilizzati da più subaccount anche non cloud cold chain, pensato per il nostro CPEA con un solo DB
- SAP HANA Cloud
- Job Schedule per schedulazione accensioni e spegnimento

## Subaccount ccp-provider

Cold Chain Platform - Development - Provider

Spaces:
- dev
- qas

Contiene:
- cap application
- approuter
- logs
- saas
- html5 repository

## Subaccount ccc-dev-customer1

Cloud Cold Chain Development Customer 1

Solo sottoscrizione alla cloud cold chain e portale, CF non attivato

## Subaccount ccc-prd-provider

Cloud Cold Chain Provider Production

Spaces:
- prd

Contiene:
- SAP HANA Cloud
- cap application
- approuter
- logs
- saas
- html5 repository
  
## Subaccount ccc-prd-[nomecliente]

Cloud Cold Chain Development Customer 1

Solo sottoscrizione alla cloud cold chain e portale, CF non attivato

# Documentazione

## Ingestion dati movimentazione handling unit
- gate rfid invia a enterprise messaging in mqtt nel topic specifico del cliente *aggiungere esempio del topic*
- enterprise messaging sottoscrive il topic e aggiunge ad una coda
- la coda è collegata ad un webhook che punto al servizio odata del cap con autenticazione OAuth2, viene richiesto il token al subaccount del cliente, il token staccato determina il tenant del client
- il servizio cap inserisce il record secco nella tabella senza controlli HandlingUnitMovementsRaw
- il servizio cap inserisce nella lista Redis i dati del movimento, l'utente e il tenant del cliente
- processo in background che attende il messaggio sulla coda redis e crea il record del movimento nella tabella HandlingUnitMovements
- scrive nella coda redis `RESIDENCE_TIME:WAITING` i dati del movimento
- processo in background che attende il messaggio sulla coda redis `RESIDENCE_TIME:WAITING`, quando riceve un messaggio:
  - ricerca il lotto collegato all'SSCC nella tabella `HandlingUnits`
  - ricerca il prodotto collegato al lotto nella tabella `Lots`
  - ricerca nella tabella `Products` le route collegate
  - ricerca nella tabella `Routes` con controlPoint e direction per determinare l'area di destinazione della scatola
  - inserisce nella tabella `HandlingUnitsResidenceTime` un record con: `sscc`, `step`, `area`, `inBusinessTime` con il t del movimento
  - aggiorna il campo `ResidenceTimeStatus` della tabella `HandlingUnitMovements` a `OK`
  - se il t del movimento è maggiore di `HandlingUnits-inAreaBusinessTime` aggiorna `lastKnowArea` e `inAreaBusinessTime`

## Determinazione HandlingUnitsResidenceTime-outBusinessTime e residenceTime
- ogni n minuti random tra parte un processo per un singolo cliente
- processo che ricerca tutti i record in `HandlingUnitsResidenceTime` senza `outBusinessTime`
- per ogni record cerca un record con step = step del record + 1
- se lo trova aggiorna il campo `outBusinessTime` con `inBusinessTime` del record trovato
- calcola la differenza in minuti arrotondando per eccesso di `outBusinessTime` - `inBusinessTime`
- se l'area è l'area in cui è in questo momento la handling unit (capibile leggendo la tabella `HandlingUnits`) aggiorna il campo residenceTime = current time - inBusinessTime
- se l'area non è a temperatura controllata riporta il campo `residenceTime` nel campo `tot` e impostato il `torElaborationTime`
- se l'area è a temperatura controlla scrive nella coda waiting dei record che devono recuperare da IoT i dati della cella e calcolo del TOR
- finito il check per il cliente viene impostata l'ora in cui verrà rifatto il controllo per il cliente

# Appunti costi piattaforma

# IoT

## Calcolatore
https://sap-iot-noah-live-estimator-ui.cfapps.eu10.hana.ondemand.com/estimator-ui/index.html

## Esempio 1
450€:

- 100 celle che inviano temperatura ogni minuto
- backend che ogni 5 minuti interroga IoT per avere i dati sulla temperatura di ogni cella
- 12 mesi di dati caldi
- 3 mesi warm
- 24 mesi cold

Feature	Capacity Units
- SAP  IoT, connectivity	37
- SAP  IoT, business services	63
- SAP  IoT, aggregate store	23
- SAP  IoT, time series & event store	19
- SAP  IoT, time series archive	1
- Total	425
