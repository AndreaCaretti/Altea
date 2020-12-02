namespace cloudcoldchain;

define type GTIN : String(13)@title : 'GTIN';
define type HU_ID : String(18)@title : 'HU_ID';

define type direction : String(1)@title : 'Direction'  @assert.range enum {
    F;
    B;
};


//alertLevel
define type alertLevel : String(1)@title : 'Alert Level'  @assert.range enum {
    VeryHigh;
    High;
    Medium;
    Low;
};

define type RouteStepNr : Integer @title : 'Step Number';

type LogLevel : Integer enum {
    LOG_EMERG   = 0; /* system is unusable */
    LOG_ALERT   = 1; /* action must be taken immediately */
    LOG_CRIT    = 2; /* critical conditions */
    LOG_ERR     = 3; /* error conditions */
    LOG_WARNING = 4; /* warning conditions */
    LOG_NOTICE  = 5; /* normal but significant condition */
    LOG_INFO    = 6; /* informational */
    LOG_DEBUG   = 7; /* debug-level messages */
}

type endReasonType : Integer enum {
    EXIT_FROM_AREA = 0; // l'handling unit è uscita dall'area
    END_PROBLEM    = 1; // il problema è stato risolto
}

type startReasonType : Integer enum {
    WAS_ALREADY_IN_AREA = 0; // l'handling unit si trovava nell'area nel momento dell'inizio del problema
    ARRIVED_IN_AREA     = 1; // : l'hangling unit è entrato nell'area durante il problema
}
