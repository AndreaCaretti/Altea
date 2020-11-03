namespace cloudcoldchain;

define type GTIN : String(13)@title : 'GTIN';
define type SSCC : String(18)@title : 'SSCC';

define type direction : String(1)@title : 'Direction'  @assert.range enum {
    F;
    B;
};
