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
