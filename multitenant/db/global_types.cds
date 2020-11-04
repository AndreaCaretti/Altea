namespace cloudcoldchain;

define type GTIN : String(13)@title : 'GTIN';
define type SSCC : String(18)@title : 'SSCC';

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
