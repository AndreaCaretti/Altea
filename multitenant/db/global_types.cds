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
