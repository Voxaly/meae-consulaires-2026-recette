MAKEFLAGS += -s
MAIN := src/main/
AR := $(MAIN)arithmetic/
CR := $(MAIN)crypto/
VO := $(MAIN)vote/
ZK := $(MAIN)zkp/
TE := src/test/
ARC := $(AR)fe25519.c $(AR)sc25519.c $(AR)edwards25519.c
EGC := $(VO)elgamal.c

all:
	emcc -o2 -I /usr/local/include $(MAIN)exports.c $(CR)signature.c $(CR)pbkdf2_hmac_sha256.c $(EGC) $(ARC) libsodium.a  -sEXPORTED_RUNTIME_METHODS=['UTF8ToString','stringToUTF8','lengthBytesUTF8'] -sEXPORTED_FUNCTIONS=['_free','_malloc'] -sMODULARIZE=1 -sSINGLE_FILE -sEXPORT_NAME=createVotingModule -sENVIRONMENT=web -o voxaled.mjs

node:
	emcc -o2 -I /usr/local/include $(MAIN)exports.c $(CR)signature.c $(CR)pbkdf2_hmac_sha256.c $(EGC) $(ARC) libsodium.a  -sEXPORTED_RUNTIME_METHODS=['UTF8ToString','stringToUTF8','lengthBytesUTF8'] -sEXPORTED_FUNCTIONS=['_free','_malloc'] -sMODULARIZE=1 -sSINGLE_FILE -sEXPORT_NAME=createVotingModule -o voxaled.mjs

testFE:
	echo testing finite field arithmetic
	gcc $(TE)arithmetic/fe_test.c $(AR)fe25519.c -fsanitize=address  -lsodium -o test
	./test;\
	rm test

testSC:
	echo testing scalar arithmetic
	gcc $(TE)arithmetic/sc_test.c $(AR)sc25519.c -fsanitize=address  -lsodium -o test
	./test;\
	rm test

testGE:
	echo testing elliptic curve arithmetic
	gcc $(TE)arithmetic/ge_test.c $(ARC) -fsanitize=address -lsodium -o test
	./test;\
	rm test