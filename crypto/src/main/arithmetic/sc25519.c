/*
* Copyright Voxaly-Docaposte, tout droit réservé.
*/

#include "sc25519.h"
void sc25519_set0(sc25519 v){
    for (int i=0; i<14; i++) v[i] = 0;
}

void sc25519_set(sc25519 v,sc25519 dst){
    for (int i=0;i<14;i++) dst[i]=v[i];
}

void sc25519_cset(const int b,sc25519 v, sc25519 e){
    for (int i=0;i<14;i++){
        e[i]+=b*(v[i]-e[i]);
    }
}

int sc25519_is_zero(sc25519 e){
    sc25519_red(e);
    return (e[0]|e[2]|e[3]|e[4]|e[5]|e[6]|e[7]|
            e[8]|e[9]|e[10]|e[11]|e[12]|e[13])==0L;
}

int sc25519_greater_than_q(uint8_t* src){
    int cur = src[31];
    int neg = (cur-16)>>8; // neg !=0 : src < q
    int eq = ((cur^16)-1)>>8; // eq !=0 : src = q so far
    cur = (src[16]|src[17]|src[18]|src[19]|src[20]|src[21]|src[22]|src[23]|
           src[24]|src[25]|src[26]|src[27]|src[28]|src[29]|src[30]);
    eq &= (cur-1)>>8;
    cur = src[15];
    neg |= eq & ((cur-20)>>8);
    eq &= ((cur^20)-1)>>8;
    cur = src[14];
    neg |= eq & ((cur-222)>>8);
    eq &= ((cur^222)-1)>>8;
    cur = src[13];
    neg |= eq & ((cur-249)>>8);
    eq &= ((cur^249)-1)>>8;
    cur = src[12];
    neg |= eq & ((cur-222)>>8);
    eq &= ((cur^222)-1)>>8;
    cur = src[11];
    neg |= eq & ((cur-162)>>8);
    eq &= ((cur^162)-1)>>8;
    cur = src[10];
    neg |= eq & ((cur-247)>>8);
    eq &= ((cur^247)-1)>>8;
    cur = src[9];
    neg |= eq & ((cur-156)>>8);
    eq &= ((cur^156)-1)>>8;
    cur = src[8];
    neg |= eq & ((cur-214)>>8);
    eq &= ((cur^214)-1)>>8;
    cur = src[7];
    neg |= eq & ((cur-88)>>8);
    eq &= ((cur^88)-1)>>8;
    cur = src[6];
    neg |= eq & ((cur-18)>>8);
    eq &= ((cur^18)-1)>>8;
    cur = src[5];
    neg |= eq & ((cur-99)>>8);
    eq &= ((cur^99)-1)>>8;
    cur = src[4];
    neg |= eq & ((cur-26)>>8);
    eq &= ((cur^26)-1)>>8;
    cur = src[3];
    neg |= eq & ((cur-92)>>8);
    eq &= ((cur^92)-1)>>8;
    cur = src[2];
    neg |= eq & ((cur-245)>>8);
    eq &= ((cur^245)-1)>>8;
    cur = src[1];
    neg |= eq & ((cur-211)>>8);
    eq &= ((cur^211)-1)>>8;
    cur = src[0];
    neg |= eq & ((cur-237)>>8);
    return neg == 0;
}

void sc25519_rnd(uint8_t* r){
    do{
        randombytes_buf(r,32);
        r[31]&=31;
    } while(sc25519_greater_than_q(r));
}

void sc25519_from_bytes(uint8_t* src, sc25519 r){
    const int32_t mask2=3, mask4=15, mask6=63;
    r[0]=(src[0])|(src[1]<<8)|((src[2]&mask2)<<16);
    r[1]=(src[2]>>2)|(src[3]<<6)|((src[4]&mask4)<<14);
    r[2]=(src[4]>>4)|(src[5]<<4)|((src[6]&mask6)<<12);
    r[3]=(src[6]>>6)|(src[7]<<2)|(src[8]<<10);
    r[4]=src[9]|(src[10]<<8)|((src[11]&mask2)<<16);
    r[5]=(src[11]>>2)|(src[12]<<6)|((src[13]&mask4)<<14);
    r[6]=(src[13]>>4)|(src[14]<<4)|((src[15]&mask6)<<12);
    r[7]=(src[15]>>6)|(src[16]<<2)|(src[17]<<10);
    r[8]=src[18]|(src[19]<<8)|((src[20]&mask2)<<16);
    r[9]=(src[20]>>2)|(src[21]<<6)|((src[22]&mask4)<<14);
    r[10]=(src[22]>>4)|(src[23]<<4)|((src[24]&mask6)<<12);
    r[11]=(src[24]>>6)|(src[25]<<2)|(src[26]<<10);
    r[12]=src[27]|(src[28]<<8)|((src[29]&mask2)<<16);
    r[13]=(src[29]>>2)|(src[30]<<6)|(src[31]<<14);
}

void positive_cycle(sc25519 ele){
    int32_t head = ele[0]&(-262144);
    ele[0]^=head; ele[1]+=head>>18;
    head = ele[1]&(-262144);
    ele[1]^=head; ele[2]+=head>>18;
    head = ele[2]&(-262144);
    ele[2]^=head; ele[3]+=head>>18;
    head = ele[3]&(-262144);
    ele[3]^=head; ele[4]+=head>>18;
    head = ele[4]&(-262144);
    ele[4]^=head; ele[5]+=head>>18;
    head = ele[5]&(-262144);
    ele[5]^=head; ele[6]+=head>>18;
    head = ele[6]&(-262144);
    ele[6]^=head; ele[7]+=head>>18;
    head = ele[7]&(-262144);
    ele[7]^=head; ele[8]+=head>>18;
    head = ele[8]&(-262144);
    ele[8]^=head; ele[9]+=head>>18;
    head = ele[9]&(-262144);
    ele[9]^=head; ele[10]+=head>>18;
    head = ele[10]&(-262144);
    ele[10]^=head; ele[11]+=head>>18;
    head = ele[11]&(-262144);
    ele[11]^=head; ele[12]+=head>>18;
    head = ele[12]&(-262144);
    ele[12]^=head; ele[13]+=head>>18;
}

const int32_t x0=119789, x1=169789, x2=75313, x3=219488, x4=194460, x5=161704, x6=85487;

void sc25519_to_bytes(sc25519 src, uint8_t* dst){
    positive_cycle(src);
    int32_t head = src[13]&((src[13]&(-524288))>>1);
    src[13]^=head; head>>=18;
    src[0]-=head*x0;src[1]-=head*x1;
    src[2]-=head*x2;src[3]-=head*x3;
    src[4]-=head*x4;src[5]-=head*x5;
    src[6]-=head*x6;
    positive_cycle(src);
    const int32_t mask2=3, mask4=15, mask6=63;
    dst[0]=(uint8_t)src[0];
    dst[1]=(uint8_t)(src[0]>>8);
    dst[2]=(uint8_t)(((src[0]>>16)&mask2)|((src[1]&mask6)<<2));
    dst[3]=(uint8_t)(src[1]>>6);
    dst[4]=(uint8_t)(((src[1]>>14)&mask4)|((src[2]&mask4)<<4));
    dst[5]=(uint8_t)(src[2]>>4);
    dst[6]=(uint8_t)(((src[2]>>12)&mask6)|((src[3]&mask2)<<6));
    dst[7]=(uint8_t)(src[3]>>2);
    dst[8]=(uint8_t)(src[3]>>10);
    dst[9]=(uint8_t)src[4];
    dst[10]=(uint8_t)(src[4]>>8);
    dst[11]=(uint8_t)(((src[4]>>16)&mask2)|((src[5]&mask6)<<2));
    dst[12]=(uint8_t)(src[5]>>6);
    dst[13]=(uint8_t)(((src[5]>>14)&mask4)|((src[6]&mask4)<<4));
    dst[14]=(uint8_t)(src[6]>>4);
    dst[15]=(uint8_t)(((src[6]>>12)&mask6)|((src[7]&mask2)<<6));
    dst[16]=(uint8_t)(src[7]>>2);
    dst[17]=(uint8_t)(src[7]>>10);
    dst[18]=(uint8_t)src[8];
    dst[19]=(uint8_t)(src[8]>>8);
    dst[20]=(uint8_t)(((src[8]>>16)&mask2)|((src[9]&mask6)<<2));
    dst[21]=(uint8_t)(src[9]>>6);
    dst[22]=(uint8_t)(((src[9]>>14)&mask4)|((src[10]&mask4)<<4));
    dst[23]=(uint8_t)(src[10]>>4);
    dst[24]=(uint8_t)(((src[10]>>12)&mask6)|((src[11]&mask2)<<6));
    dst[25]=(uint8_t)(src[11]>>2);
    dst[26]=(uint8_t)(src[11]>>10);
    dst[27]=(uint8_t)src[12];
    dst[28]=(uint8_t)(src[12]>>8);
    dst[29]=(uint8_t)(((src[12]>>16)&mask2)|((src[13]&mask6)<<2));
    dst[30]=(uint8_t)(src[13]>>6);
    dst[31]=(uint8_t)(src[13]>>14);
}

void sc25519_add(sc25519 a, sc25519 b, sc25519 r){
    for (int i=0; i<14; i++) r[i] = a[i] + b[i];
}

void sc25519_add_int(sc25519 a, int b, sc25519 r){
    r[0] = a[0]+b;
    for (int i=1; i<14; i++) r[i] = a[i];
}

void sc25519_sub(sc25519 a, sc25519 b, sc25519 r){
    for (int i=0; i<14; i++) r[i] = a[i] - b[i];
}

void cr14(int64_t p0, int64_t p1, int64_t p2, int64_t p3, int64_t p4, int64_t p5, int64_t p6, int64_t p7,
        int64_t p8, int64_t p9, int64_t p10, int64_t p11, int64_t p12, int64_t p13, sc25519 r){
    int64_t head;
    head=p11&(-262144LL);
    p11^=head; p12 += head>>18;
    head=p12&(-262144LL);
    p12^=head; p13 += head>>18;
    head=p13&(-262144LL);
    p13^=head;
    head>>=18; // first reduction with arbitrary length
    p0-=head*x0;p1-=head*x1;p2-=head*x2;p3-=head*x3;p4-=head*x4;p5-=head*x5;p6-=head*x6;
    head=p0&(-262144L); p0^=head;
    p1 += head>>18; head=p1&(-262144LL); p1^=head;
    p2 += head>>18; head=p2&(-262144LL); p2^=head;
    p3 += head>>18; head=p3&(-262144LL); p3^=head;
    p4 += head>>18; head=p4&(-262144LL); p4^=head;
    p5 += head>>18; head=p5&(-262144LL); p5^=head;
    p6 += head>>18; head=p6&(-262144LL); p6^=head;
    p7 += head>>18; head=p7&(-262144LL); r[7] = (int32_t) (p7^head);
    p8 += head>>18; head=p8&(-262144LL); r[8] = (int32_t) (p8^head);
    p9 += head>>18; head=p9&(-262144LL); r[9] = (int32_t) (p9^head);
    p10 += head>>18;head=p10&(-262144LL);r[10]= (int32_t) (p10^head);
    p11 += head>>18;head=p11&(-262144LL);r[11]= (int32_t) (p11^head);
    p12 += head>>18;head=p12&(-262144LL);r[12]= (int32_t) (p12^head);
    p13 += head>>18;head=p13&(-262144LL);r[13]= (int32_t) (p13^head); // second reduction with length 1
    head>>=18;
    r[0]=(int32_t) (p0-head*x0);
    r[1]=(int32_t) (p1-head*x1);
    r[2]=(int32_t) (p2-head*x2);
    r[3]=(int32_t) (p3-head*x3);
    r[4]=(int32_t) (p4-head*x4);
    r[5]=(int32_t) (p5-head*x5);
    r[6]=(int32_t) (p6-head*x6);
    }

void sc25519_red(sc25519 e) {
    cr14(e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], e[8], e[9], e[10], e[11], e[12], e[13], e);
}

void sc25519_mult(sc25519 a, sc25519 b, sc25519 res){
    const int64_t a0 = (int64_t) a[0], b0 = (int64_t) b[0];
    const int64_t a1 = (int64_t) a[1], b1 = (int64_t) b[1];
    const int64_t a2 = (int64_t) a[2], b2 = (int64_t) b[2];
    const int64_t a3 = (int64_t) a[3], b3 = (int64_t) b[3];
    const int64_t a4 = (int64_t) a[4], b4 = (int64_t) b[4];
    const int64_t a5 = (int64_t) a[5], b5 = (int64_t) b[5];
    const int64_t a6 = (int64_t) a[6], b6 = (int64_t) b[6];
    const int64_t a7 = (int64_t) a[7], b7 = (int64_t) b[7];
    const int64_t a8 = (int64_t) a[8], b8 = (int64_t) b[8];
    const int64_t a9 = (int64_t) a[9], b9 = (int64_t) b[9];
    const int64_t a10= (int64_t) a[10],b10 = (int64_t)b[10];
    const int64_t a11= (int64_t) a[11],b11 = (int64_t)b[11];
    const int64_t a12= (int64_t) a[12],b12 = (int64_t)b[12];
    const int64_t a13= (int64_t) a[13],b13 = (int64_t)b[13];

    const int64_t r0 = a1*b13+a2*b12+a3*b11+a4*b10+a5*b9+a6*b8+a7*b7+a8*b6+a9*b5+a10*b4+a11*b3+a12*b2+a13*b1;
    const int64_t p0=a0*b0;
    const int64_t r1 = a2*b13+a3*b12+a4*b11+a5*b10+a6*b9+a7*b8+a8*b7+a9*b6+a10*b5+a11*b4+a12*b3+a13*b2;
    const int64_t p1=a0*b1+a1*b0;
    const int64_t r2=a3*b13+a4*b12+a5*b11+a6*b10+a7*b9+a8*b8+a9*b7+a10*b6+a11*b5+a12*b4+a13*b3;
    const int64_t p2=a0*b2+a1*b1+a2*b0;
    const int64_t r3=a4*b13+a5*b12+a6*b11+a7*b10+a8*b9+a9*b8+a10*b7+a11*b6+a12*b5+a13*b4;
    const int64_t p3=a0*b3+a1*b2+a2*b1+a3*b0;
    const int64_t r4=a5*b13+a6*b12+a7*b11+a8*b10+a9*b9+a10*b8+a11*b7+a12*b6+a13*b5;
    const int64_t p4=a0*b4+a1*b3+a2*b2+a3*b1+a4*b0;
    const int64_t r5=a6*b13+a7*b12+a8*b11+a9*b10+a10*b9+a11*b8+a12*b7+a13*b6;
    const int64_t p5=a0*b5+a1*b4+a2*b3+a3*b2+a4*b1+a5*b0;
    const int64_t r6=a7*b13+a8*b12+a9*b11+a10*b10+a11*b9+a12*b8+a13*b7;
    const int64_t p6=a0*b6+a1*b5+a2*b4+a3*b3+a4*b2+a5*b1+a6*b0-x0*r6;
    const int64_t r7=a8*b13+a9*b12+a10*b11+a11*b10+a12*b9+a13*b8;
    const int64_t p7=a0*b7+a1*b6+a2*b5+a3*b4+a4*b3+a5*b2+a6*b1+a7*b0-x1*r6-x0*r7;
    const int64_t r8=a9*b13+a10*b12+a11*b11+a12*b10+a13*b9;
    const int64_t p8=a0*b8+a1*b7+a2*b6+a3*b5+a4*b4+a5*b3+a6*b2+a7*b1+a8*b0-x2*r6-x1*r7-x0*r8;
    const int64_t r9=a10*b13+a11*b12+a12*b11+a13*b10;
    const int64_t p9=a0*b9+a1*b8+a2*b7+a3*b6+a4*b5+a5*b4+a6*b3+a7*b2+a8*b1+a9*b0-x3*r6-x2*r7-x1*r8-x0*r9;
    const int64_t r10=a11*b13+a12*b12+a13*b11;
    const int64_t p10=a0*b10+a1*b9+a2*b8+a3*b7+a4*b6+a5*b5+a6*b4+a7*b3+a8*b2+a9*b1+a10*b0-x4*r6-x3*r7-x2*r8-x1*r9-x0*r10;
    const int64_t r11=a12*b13+a13*b12;
    const int64_t p11=a0*b11+a1*b10+a2*b9+a3*b8+a4*b7+a5*b6+a6*b5+a7*b4+a8*b3+a9*b2+a10*b1+a11*b0-x5*r6-x4*r7-x3*r8-x2*r9-x1*r10-x0*r11;
    const int64_t r12=a13*b13;
    const int64_t p12=a0*b12+a1*b11+a2*b10+a3*b9+a4*b8+a5*b7+a6*b6+a7*b5+a8*b4+a9*b3+a10*b2+a11*b1+a12*b0-x6*r6-x5*r7-x4*r8-x3*r9-x2*r10-x1*r11-x0*r12;
    const int64_t p13=a0*b13+a1*b12+a2*b11+a3*b10+a4*b9+a5*b8+a6*b7+a7*b6+a8*b5+a9*b4+a10*b3+a11*b2+a12*b1+a13*b0-x6*r7-x5*r8-x4*r9-x3*r10-x2*r11-x1*r12;

    int64_t p14=-x6*r8-x5*r9-x4*r10-x3*r11-x2*r12;
    int64_t p15=-x6*r9-x5*r10-x4*r11-x3*r12;
    int64_t p16=-x6*r10-x5*r11-x4*r12;
    int64_t p17=-x6*r11-x5*r12;
    int64_t p18=-x6*r12;
    int64_t head=p14&(-262144L);
    p14^=head; p15+=head>>18;
    head=p15&(-262144L);
    p15^=head;p16+=head>>18;
    head=p16&(-262144L);
    p16^=head;p17+=head>>18;
    head=p17&(-262144L);
    p17^=head;p18+=head>>18;
    head=p18&(-262144L);
    p18^=head;
    head>>=18;
    p14+=r0;p15+=r1;p16+=r2;p17+=r3;p18+=r4;head+=r5;
    cr14(p0-x0*p14,p1-x1*p14-x0*p15,p2-x2*p14-x1*p15-x0*p16,p3-x3*p14-x2*p15-x1*p16-x0*p17,
    p4-x4*p14-x3*p15-x2*p16-x1*p17-x0*p18,p5-x5*p14-x4*p15-x3*p16-x2*p17-x1*p18-x0*head,
    p6-x6*p14-x5*p15-x4*p16-x3*p17-x2*p18-x1*head,p7-x6*p15-x5*p16-x4*p17-x3*p18-x2*head,
    p8-x6*p16-x5*p17-x4*p18-x3*head,p9-x6*p17-x5*p18-x4*head,p10-x6*p18-x5*head,p11-x6*head,p12,p13,res);
}
