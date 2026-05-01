/*
* Copyright Voxaly-Docaposte, tout droit réservé.
*/

#include "fe25519.h"

void ffe25519_set(fe25519 v, fe25519 x){
    for (int i=0; i<10; i++){
        x[i] = v[i];
    }
}

void ffe25519_set0(fe25519 x){
    for (int i=0; i<10; i++){
        x[i] = 0;
    }
}

void ffe25519_set1(fe25519 x){
    x[0] = 1;
    for (int i=1; i<10; i++){
        x[i] = 0;
    }
}

void ffe25519_add(fe25519 x, fe25519 y, fe25519 s){
    for (int i=0; i<10; i++){
        s[i] = x[i] + y[i];
    }
}

void ffe25519_add_int(fe25519 x, int32_t y, fe25519 s){
    s[0] = x[0] + y;
    for (int i=1; i<10; i++){
        s[i] = x[i];
    }
}

void ffe25519_neg(fe25519 x, fe25519 n){
    for (int i=0; i<10; i++){
        n[i] = -x[i];
    }
}

void ffe25519_sub(fe25519 x, fe25519 y, fe25519 s){
    for (int i=0; i<10; i++){
        s[i] = x[i] - y[i];
    }
}

void ffe25519_dbl(fe25519 x, fe25519 d){
    for (int i=0; i<10; i++){
        d[i] = x[i]<<1;
    }
}

void cr(int64_t r0,int64_t r1,int64_t r2,int64_t r3,int64_t r4,int64_t r5,int64_t r6,int64_t r7,int64_t r8,int64_t r9, fe25519 m){
    int64_t head = (r8 + 33554432L)&(-67108864L);
    r8 -= head; r9 += head>>26;
    head = r9&(-33554432L);
    r9 ^= head; r0 += 19L*(head>>25);
    head = (r0 + 33554432L)&(-67108864L);
    r0 -= head; r1 += head>>26;
    head = r1&(-33554432L);
    m[1] = (int32_t) (r1^head); r2 += head>>25;
    head = (r2 + 33554432L)&(-67108864L);
    m[2] = (int32_t) (r2-head); r3 += head>>26;
    head = r3&(-33554432L);
    m[3] = (int32_t) (r3^head); r4 += head>>25;
    head = (r4 + 33554432L)&(-67108864L);
    m[4] = (int32_t) (r4-head); r5 += head>>26;
    head = r5&(-33554432L);
    m[5] = (int32_t) (r5^head); r6 += head>>25;
    head = (r6 + 33554432L)&(-67108864L);
    m[6] = (int32_t) (r6-head); r7 += head>>26;
    head = r7&(-33554432L);
    m[7] = (int32_t) (r7^head); r8 += head>>25;
    head = (r8 + 33554432L)&(-67108864L);
    m[8] = (int32_t) (r8 - head); r9 += head>>26;
    head = r9&(-33554432L);
    m[9] = (int32_t) (r9^head);
    m[0] = (int32_t) (r0+19L*(head>>25));
}

void ffe25519_mul(fe25519 a, fe25519 b, fe25519 m){
    const int64_t a1x19 = (int64_t) (19*a[1]);
    const int64_t a2x19 = (int64_t) (19*a[2]);
    const int64_t a3x19 = (int64_t) (19*a[3]);
    const int64_t a4x19 = (int64_t) (19*a[4]);
    const int64_t a5x19 = (int64_t) (19*a[5]);
    const int64_t a6x19 = (int64_t) (19*a[6]);
    const int64_t a7x19 = (int64_t) (19*a[7]);
    const int64_t a8x19 = (int64_t) (19*a[8]);
    const int64_t a9x19 = (int64_t) (19*a[9]);

    const int64_t a0 = (int64_t) a[0]; const int64_t b0 = (int64_t) b[0];
    const int64_t a1 = (int64_t) a[1]; const int64_t b1 = (int64_t) b[1];
    const int64_t a2 = (int64_t) a[2]; const int64_t b2 = (int64_t) b[2];
    const int64_t a3 = (int64_t) a[3]; const int64_t b3 = (int64_t) b[3];
    const int64_t a4 = (int64_t) a[4]; const int64_t b4 = (int64_t) b[4];
    const int64_t a5 = (int64_t) a[5]; const int64_t b5 = (int64_t) b[5];
    const int64_t a6 = (int64_t) a[6]; const int64_t b6 = (int64_t) b[6];
    const int64_t a7 = (int64_t) a[7]; const int64_t b7 = (int64_t) b[7];
    const int64_t a8 = (int64_t) a[8]; const int64_t b8 = (int64_t) b[8];
    const int64_t a9 = (int64_t) a[9]; const int64_t b9 = (int64_t) b[9];

    const int64_t r0=a0*b0+(((a1x19*b9+a3x19*b7+a5x19*b5+a7x19*b3+a9x19*b1)<<1)+a2x19*b8+a4x19*b6+a6x19*b4+a8x19*b2);
    const int64_t r1=a0*b1+a1*b0+(a2x19*b9+a3x19*b8+a4x19*b7+a5x19*b6+a6x19*b5+a7x19*b4+a8x19*b3+a9x19*b2);
    const int64_t r2=a0*b2+a2*b0+((a1*b1)<<1)+(((a3x19*b9+a5x19*b7+a7x19*b5+a9x19*b3)<<1)+a4x19*b8+a6x19*b6+a8x19*b4);
    const int64_t r3=a0*b3+a1*b2+a2*b1+a3*b0+(a4x19*b9+a5x19*b8+a6x19*b7+a7x19*b6+a8x19*b5+a9x19*b4);
    const int64_t r4=a0*b4+a2*b2+a4*b0+((a1*b3+a3*b1)<<1)+(((a5x19*b9+a7x19*b7+a9x19*b5)<<1)+a6x19*b8+a8x19*b6);
    const int64_t r5=a0*b5+a1*b4+a2*b3+a3*b2+a4*b1+a5*b0+(a6x19*b9+a7x19*b8+a8x19*b7+a9x19*b6);
    const int64_t r6=a0*b6+a2*b4+a4*b2+a6*b0+((a1*b5+a3*b3+a5*b1)<<1)+(((a7x19*b9+a9x19*b7)<<1)+a8x19*b8);
    const int64_t r7=a0*b7+a1*b6+a2*b5+a3*b4+a4*b3+a5*b2+a6*b1+a7*b0+(a8x19*b9+a9x19*b8);
    const int64_t r8=a0*b8+a2*b6+a4*b4+a6*b2+a8*b0+((a1*b7+a3*b5+a5*b3+a7*b1)<<1)+((a9x19*b9)<<1);
    const int64_t r9=a0*b9+a1*b8+a2*b7+a3*b6+a4*b5+a5*b4+a6*b3+a7*b2+a8*b1+a9*b0;

    cr(r0,r1,r2,r3,r4,r5,r6,r7,r8,r9,m);
}

void ffe25519_mul2(fe25519 a, fe25519 b, fe25519 m){
    const int64_t a1x19 = (int64_t) (19*a[1]);
    const int64_t a2x19 = (int64_t) (19*a[2]);
    const int64_t a3x19 = (int64_t) (19*a[3]);
    const int64_t a4x19 = (int64_t) (19*a[4]);
    const int64_t a5x19 = (int64_t) (19*a[5]);
    const int64_t a6x19 = (int64_t) (19*a[6]);
    const int64_t a7x19 = (int64_t) (19*a[7]);
    const int64_t a8x19 = (int64_t) (19*a[8]);
    const int64_t a9x19 = (int64_t) (19*a[9]);

    const int64_t a0 = (int64_t) a[0]; const int64_t b0 = (int64_t) b[0];
    const int64_t a1 = (int64_t) a[1]; const int64_t b1 = (int64_t) b[1];
    const int64_t a2 = (int64_t) a[2]; const int64_t b2 = (int64_t) b[2];
    const int64_t a3 = (int64_t) a[3]; const int64_t b3 = (int64_t) b[3];
    const int64_t a4 = (int64_t) a[4]; const int64_t b4 = (int64_t) b[4];
    const int64_t a5 = (int64_t) a[5]; const int64_t b5 = (int64_t) b[5];
    const int64_t a6 = (int64_t) a[6]; const int64_t b6 = (int64_t) b[6];
    const int64_t a7 = (int64_t) a[7]; const int64_t b7 = (int64_t) b[7];
    const int64_t a8 = (int64_t) a[8]; const int64_t b8 = (int64_t) b[8];
    const int64_t a9 = (int64_t) a[9]; const int64_t b9 = (int64_t) b[9];

    const int64_t r0=a0*b0+(((a1x19*b9+a3x19*b7+a5x19*b5+a7x19*b3+a9x19*b1)<<1)+a2x19*b8+a4x19*b6+a6x19*b4+a8x19*b2);
    const int64_t r1=a0*b1+a1*b0+(a2x19*b9+a3x19*b8+a4x19*b7+a5x19*b6+a6x19*b5+a7x19*b4+a8x19*b3+a9x19*b2);
    const int64_t r2=a0*b2+a2*b0+((a1*b1)<<1)+(((a3x19*b9+a5x19*b7+a7x19*b5+a9x19*b3)<<1)+a4x19*b8+a6x19*b6+a8x19*b4);
    const int64_t r3=a0*b3+a1*b2+a2*b1+a3*b0+(a4x19*b9+a5x19*b8+a6x19*b7+a7x19*b6+a8x19*b5+a9x19*b4);
    const int64_t r4=a0*b4+a2*b2+a4*b0+((a1*b3+a3*b1)<<1)+(((a5x19*b9+a7x19*b7+a9x19*b5)<<1)+a6x19*b8+a8x19*b6);
    const int64_t r5=a0*b5+a1*b4+a2*b3+a3*b2+a4*b1+a5*b0+(a6x19*b9+a7x19*b8+a8x19*b7+a9x19*b6);
    const int64_t r6=a0*b6+a2*b4+a4*b2+a6*b0+((a1*b5+a3*b3+a5*b1)<<1)+(((a7x19*b9+a9x19*b7)<<1)+a8x19*b8);
    const int64_t r7=a0*b7+a1*b6+a2*b5+a3*b4+a4*b3+a5*b2+a6*b1+a7*b0+(a8x19*b9+a9x19*b8);
    const int64_t r8=a0*b8+a2*b6+a4*b4+a6*b2+a8*b0+((a1*b7+a3*b5+a5*b3+a7*b1)<<1)+((a9x19*b9)<<1);
    const int64_t r9=a0*b9+a1*b8+a2*b7+a3*b6+a4*b5+a5*b4+a6*b3+a7*b2+a8*b1+a9*b0;

    cr(r0<<1,r1<<1,r2<<1,r3<<1,r4<<1,r5<<1,r6<<1,r7<<1,r8<<1,r9<<1,m);
}

void ffe25519_sqr(fe25519 a, fe25519 s){
    const int64_t a0 = (int64_t) a[0];
    const int64_t a1 = (int64_t) a[1];
    const int64_t a2 = (int64_t) a[2];
    const int64_t a3 = (int64_t) a[3];
    const int64_t a4 = (int64_t) a[4];
    const int64_t a5 = (int64_t) a[5];
    const int64_t a6 = (int64_t) a[6];
    const int64_t a7 = (int64_t) a[7];
    const int64_t a8 = (int64_t) a[8];
    const int64_t a9 = (int64_t) a[9];

    const int64_t r0=a0*a0+38L*(a5*a5+a4*a6+a2*a8+((a1*a9+a3*a7)<<1));
    const int64_t r1=((a0*a1)<<1)+38L*(a2*a9+a3*a8+a4*a7+a5*a6);
    const int64_t r2=((a0*a2+a1*a1)<<1)+19L*(((((a3*a9+a5*a7)<<1)+a4*a8)<<1)+a6*a6);
    const int64_t r3=((a0*a3+a1*a2)<<1)+38L*(a4*a9+a5*a8+a6*a7);
    const int64_t r4=((a0*a4+((a1*a3)<<1))<<1)+a2*a2+38L*(a7*a7+a6*a8+((a5*a9)<<1));
    const int64_t r5=((a0*a5+a1*a4+a2*a3)<<1)+38L*(a6*a9+a7*a8);
    const int64_t r6=((a0*a6+a2*a4+((a1*a5)<<1)+a3*a3)<<1)+19L*(((a7*a9)<<2)+a8*a8);
    const int64_t r7=((a0*a7+a1*a6+a2*a5+a3*a4)<<1)+38L*(a8*a9);
    const int64_t r8=((a0*a8+a2*a6+((a1*a7+a3*a5)<<1))<<1)+a4*a4+38L*a9*a9;
    const int64_t r9=((a0*a9+a1*a8+a2*a7+a3*a6+a4*a5)<<1);

    cr(r0,r1,r2,r3,r4,r5,r6,r7,r8,r9,s);
}

void ffe25519_sqr2(fe25519 a, fe25519 s){
    const int64_t a0 = (int64_t) a[0];
    const int64_t a1 = (int64_t) a[1];
    const int64_t a2 = (int64_t) a[2];
    const int64_t a3 = (int64_t) a[3];
    const int64_t a4 = (int64_t) a[4];
    const int64_t a5 = (int64_t) a[5];
    const int64_t a6 = (int64_t) a[6];
    const int64_t a7 = (int64_t) a[7];
    const int64_t a8 = (int64_t) a[8];
    const int64_t a9 = (int64_t) a[9];

    const int64_t r0=a0*a0+38L*(a5*a5+a4*a6+a2*a8+((a1*a9+a3*a7)<<1));
    const int64_t r1=((a0*a1)<<1)+38L*(a2*a9+a3*a8+a4*a7+a5*a6);
    const int64_t r2=((a0*a2+a1*a1)<<1)+19L*(((((a3*a9+a5*a7)<<1)+a4*a8)<<1)+a6*a6);
    const int64_t r3=((a0*a3+a1*a2)<<1)+38L*(a4*a9+a5*a8+a6*a7);
    const int64_t r4=((a0*a4+((a1*a3)<<1))<<1)+a2*a2+38L*(a7*a7+a6*a8+((a5*a9)<<1));
    const int64_t r5=((a0*a5+a1*a4+a2*a3)<<1)+38L*(a6*a9+a7*a8);
    const int64_t r6=((a0*a6+a2*a4+((a1*a5)<<1)+a3*a3)<<1)+19L*(((a7*a9)<<2)+a8*a8);
    const int64_t r7=((a0*a7+a1*a6+a2*a5+a3*a4)<<1)+38L*(a8*a9);
    const int64_t r8=((a0*a8+a2*a6+((a1*a7+a3*a5)<<1))<<1)+a4*a4+38L*a9*a9;
    const int64_t r9=((a0*a9+a1*a8+a2*a7+a3*a6+a4*a5)<<1);

    cr(r0<<1,r1<<1,r2<<1,r3<<1,r4<<1,r5<<1,r6<<1,r7<<1,r8<<1,r9<<1,s);
}

void ffe25519_reduce(fe25519 x){
    int32_t head = (x[8] + 33554432)&(-67108864);
    x[8] -= head; x[9] += head>>26;
    head = x[9]&(-33554432);
    x[9] ^= head; x[0] += 19*(head>>25);
    head = (x[0] + 33554432)&(-67108864);
    x[0] -= head; x[1] += head>>26;
    head = x[1]&(-33554432);
    x[1] ^= head; x[2] += head>>25;
    head = (x[2] + 33554432)&(-67108864);
    x[2] -= head; x[3] += head>>26;
    head = x[3]&(-33554432);
    x[3] ^= head; x[4] += head>>25;
    head = (x[4] + 33554432)&(-67108864);
    x[4] -= head; x[5] += head>>26;
    head = x[5]&(-33554432);
    x[5] ^= head; x[6] += head>>25;
    head = (x[6] + 33554432)&(-67108864);
    x[6] -= head; x[7] += head>>26;
    head = x[7]&(-33554432);
    x[7] ^= head; x[8] += head>>25;
    head = (x[8] + 33554432)&(-67108864);
    x[8] -= head; x[9] += head>>26;
    head = x[9]&(-33554432);
    x[9] ^= head;
    x[0] += 19*(head>>25);
}

int ffe25519_is_zero(fe25519 x){
    ffe25519_reduce(x);
    return (x[0] | x[1] | x[2] | x[3] | x[4] | x[5] | x[6] | x[7] | x[8] | x[9]) == 0;
}

int ffe25519_is_odd(fe25519 x){
    ffe25519_reduce(x);
    return x[0]&1;
}

void ffe25519_inv(fe25519 x, fe25519 i){
    fe25519 _1011, x10, x50;
    ffe25519_sqr(x, i); ffe25519_sqr(i, x10); ffe25519_sqr(x10, x10); ffe25519_mul(x10, x, x10);
    ffe25519_mul(x10, i, _1011);
    ffe25519_sqr(_1011, i); ffe25519_mul(i, x10, i);
    ffe25519_sqr(i,x10); ffe25519_sqr(x10,x10); ffe25519_sqr(x10,x10); ffe25519_sqr(x10,x10); ffe25519_sqr(x10,x10); ffe25519_mul(x10,i,x10);
    ffe25519_sqr(x10,i); for (int it=1; it<10; it++) ffe25519_sqr(i, i); ffe25519_mul(i, x10, i);
    ffe25519_sqr(i, x50); for (int it=1; it<20; it++) ffe25519_sqr(x50,x50); ffe25519_mul(x50, i, x50);
    for (int it=0; it<10; it++) ffe25519_sqr(x50, x50); ffe25519_mul(x50, x10, x50);
    ffe25519_sqr(x50, x10); for (int it=1; it<50; it++) ffe25519_sqr(x10, x10); ffe25519_mul(x10, x50, x10);
    ffe25519_sqr(x10, i); for (int it=1; it<100; it++) ffe25519_sqr(i, i); ffe25519_mul(i, x10, i);
    for (int it=0; it<50; it++) ffe25519_sqr(i, i); ffe25519_mul(i, x50, i);
    ffe25519_sqr(i,i); ffe25519_sqr(i,i); ffe25519_sqr(i,i); ffe25519_sqr(i,i); ffe25519_sqr(i,i); ffe25519_mul(i,_1011,i);
}

void ffe25519_pm5d8(fe25519 x, fe25519 r){
    fe25519 tmp, sto;
    ffe25519_sqr(x, tmp); ffe25519_mul(tmp, x, sto); // 2
    ffe25519_sqr(sto, tmp); ffe25519_sqr(tmp, tmp); ffe25519_mul(sto, tmp, sto); // 4
    ffe25519_sqr(sto, tmp); ffe25519_sqr(tmp, tmp); ffe25519_sqr(tmp, tmp); ffe25519_sqr(tmp, tmp); ffe25519_mul(sto, tmp, r); // 8
    ffe25519_sqr(r, tmp); ffe25519_mul(tmp, x, sto); // 9
    ffe25519_sqr(sto, tmp); for (int i=1; i<8; i++) ffe25519_sqr(tmp, tmp); ffe25519_mul(tmp, r, sto); // 17
    ffe25519_sqr(sto, tmp); for (int i=1; i<8; i++) ffe25519_sqr(tmp, tmp); ffe25519_mul(r, tmp, r); // 25
    ffe25519_sqr(r, tmp); for (int i=1; i<25; i++) ffe25519_sqr(tmp, tmp); ffe25519_mul(r, tmp, sto); // 50
    ffe25519_sqr(sto, tmp); for (int i=1; i<50; i++) ffe25519_sqr(tmp, tmp); ffe25519_mul(sto, tmp, sto); // 100
    ffe25519_sqr(sto, tmp); for (int i=1; i<25; i++) ffe25519_sqr(tmp, tmp); ffe25519_mul(r, tmp, r); // 125
    ffe25519_sqr(r, tmp); for (int i=1; i<125; i++) ffe25519_sqr(tmp, tmp); ffe25519_mul(r, tmp, r); // 250
    ffe25519_sqr(r, r); ffe25519_sqr(r, r); ffe25519_mul(r, x, r); // 252
}

void ffe25519_from_bytes(uint8_t* src, fe25519 x){
    const int32_t mask1 = 1;
    const int32_t mask2 = 3;
    const int32_t mask3 = 7;
    const int32_t mask4 = 15;
    const int32_t mask5 = 31;
    const int32_t mask6 = 63;
    // 3 src, 2 bits
    x[0] = src[0] | (src[1]<<8) | (src[2]<<16) | ((src[3] & mask2)<<24);
    // 6 bits, 2 src, 3 bits
    x[1] = (src[3]>>2) | (src[4]<<6) | (src[5]<<14) | ((src[6] & mask3)<<22);
    // 5 bits, 2 src, 5 bits
    x[2] = (src[6]>>3) | (src[7]<<5) | (src[8]<<13) | ((src[9] & mask5)<<21);
    // 3 bits, 2 src, 6 bits
    x[3] = (src[9]>>5) | (src[10]<<3)| (src[11]<<11)| ((src[12]& mask6)<<19);
    // 2 bits, 3 src
    x[4] = (src[12]>>6)| (src[13]<<2)| (src[14]<<10)| (src[15]<<18);
    // 3 src, 1 bit
    x[5] = src[16] | (src[17]<<8) | (src[18]<<16) | ((src[19]& mask1)<<24);
    // 7 bits, 2 src, 3 bits
    x[6] = (src[19]>>1)| (src[20]<<7)| (src[21]<<15)| ((src[22]& mask3)<<23);
    // 5 bits, 2 src, 4 bits
    x[7] = (src[22]>>3)| (src[23]<<5)| (src[24]<<13)| ((src[25]& mask4)<<21);
    // 4 bits, 2 src, 6 bits
    x[8] = (src[25]>>4)| (src[26]<<4)| (src[27]<<12)| ((src[28]& mask6)<<20);
    // 2 bits, 3 src
    x[9] = (src[28]>>6)| (src[29]<<2)| (src[30]<<10)| (src[31]<<18);
}

void ffe25519_to_bytes(fe25519 x, uint8_t* dst){
    const int32_t after26 = -67108864, after25 = -33554432;
    const int32_t mask2 = 3L, mask3 = 7, mask4 = 15, mask5 = 31, mask6 = 63, mask7 = 127;
    int32_t p0, p1, p2, p3, p4, p5, p6, p7, p8, p9;
    int32_t head = x[0] & after26; p0 = x[0] ^ head; p1 = x[1] + (head>>26);
    head = p1 & after25; p1 ^= head; p2 = x[2] + (head>>25);
    head = p2 & after26; p2 ^= head; p3 = x[3] + (head>>26);
    head = p3 & after25; p3 ^= head; p4 = x[4] + (head>>25);
    head = p4 & after26; p4 ^= head; p5 = x[5] + (head>>26);
    head = p5 & after25; p5 ^= head; p6 = x[6] + (head>>25);
    head = p6 & after26; p6 ^= head; p7 = x[7] + (head>>26);
    head = p7 & after25; p7 ^= head; p8 = x[8] + (head>>25);
    head = p8 & after26; p8 ^= head; p9 = x[9] + (head>>26);
    head = p9 & after25; p9 ^= head; p0 += 19L*(head>>25);
    head = p0 & after26; p0 ^= head; p1 += (head>>26);
    head = p1 & after25; p1 ^= head; p2 += (head>>25);
    head = p2 & after26; p2 ^= head; p3 += (head>>26);
    head = p3 & after25; p3 ^= head; p4 += (head>>25);
    head = p4 & after26; p4 ^= head; p5 += (head>>26);
    head = p5 & after25; p5 ^= head; p6 += (head>>25);
    head = p6 & after26; p6 ^= head; p7 += (head>>26);
    head = p7 & after25; p7 ^= head; p8 += (head>>25);
    head = p8 & after26; p8 ^= head; p9 += (head>>26);
    dst[0] = (int32_t) p0;
    dst[1] = (int32_t) (p0>>8);
    dst[2] = (int32_t) (p0>>16);
    dst[3] = (int32_t) ((p0>>24) & mask2);    // 26
    dst[3] |= (int32_t) ((p1 & mask6)<<2);
    dst[4] = (int32_t) (p1>>6);
    dst[5] = (int32_t) (p1>>14);
    dst[6] = (int32_t) ((p1>>22) & mask3);    // 25
    dst[6] |= (int32_t) ((p2 & mask5)<<3);
    dst[7] = (int32_t) (p2>>5);
    dst[8] = (int32_t) (p2>>13);
    dst[9] = (int32_t) ((p2>>21) & mask5);    // 26
    dst[9] |= (int32_t) (((p3) & mask3)<<5);
    dst[10] = (int32_t) (p3>>3);
    dst[11] = (int32_t) (p3>>11);
    dst[12] = (int32_t) ((p3>>19) & mask6);    // 25
    dst[12] |= (int32_t) (((p4) & mask2)<<6);
    dst[13] = (int32_t) (p4>>2);
    dst[14] = (int32_t) (p4>>10);
    dst[15] = (int32_t) (p4>>18);            // 26
    dst[16] = (int32_t) (p5);
    dst[17] = (int32_t) (p5>>8);
    dst[18] = (int32_t) (p5>>16);
    dst[19] = (int32_t) ((p5>>24) & 1L);       // 25
    dst[19] |= (int32_t) ((p6 & mask7)<<1);
    dst[20] = (int32_t) (p6>>7);
    dst[21] = (int32_t) (p6>>15);
    dst[22] = (int32_t) ((p6>>23) & mask3);    // 26
    dst[22] |= (int32_t) ((p7 & mask5)<<3);
    dst[23] = (int32_t) (p7>>5);
    dst[24] = (int32_t) (p7>>13);
    dst[25] = (int32_t) ((p7>>21) & mask4);    // 25
    dst[25] |= (int32_t) ((p8 & mask4)<<4);
    dst[26] = (int32_t) (p8>>4);
    dst[27] = (int32_t) (p8>>12);
    dst[28] = (int32_t) ((p8>>20) & mask6);    // 26
    dst[28] |= (int32_t) ((p9 & mask2)<<6);
    dst[29] = (int32_t) (p9>>2);
    dst[30] = (int32_t) (p9>>10);
    dst[31] = (int32_t) (p9>>18);
}