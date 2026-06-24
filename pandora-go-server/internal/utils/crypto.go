package utils

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/md5"
	crand "crypto/rand"
	"crypto/sha1"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"io"
)

func MD5Hex(value string) string {
	sum := md5.Sum([]byte(value))
	return hex.EncodeToString(sum[:])
}

func SHA1Hex(value string) string {
	sum := sha1.Sum([]byte(value))
	return hex.EncodeToString(sum[:])
}

func SHA256Hex(value string) string {
	sum := sha256.Sum256([]byte(value))
	return hex.EncodeToString(sum[:])
}

func HashSenha(password string) string {
	raw := make([]byte, 16)
	if _, err := crand.Read(raw); err != nil {
		return SHA256Hex(password)
	}
	salt := SHA256Hex(hex.EncodeToString(raw))
	return salt + SHA256Hex(salt+password)
}

func EncryptCryptoJSAES(plain string, passphrase string) (string, error) {
	if passphrase == "" {
		return "", errors.New("aes passphrase not configured")
	}
	salt := make([]byte, 8)
	if _, err := io.ReadFull(crand.Reader, salt); err != nil {
		return "", err
	}
	key, iv := evpBytesToKey([]byte(passphrase), salt, 32, aes.BlockSize)
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}
	padded := pkcs7Pad([]byte(plain), block.BlockSize())
	encrypted := make([]byte, len(padded))
	cipher.NewCBCEncrypter(block, iv).CryptBlocks(encrypted, padded)
	payload := append([]byte("Salted__"), salt...)
	payload = append(payload, encrypted...)
	return base64.StdEncoding.EncodeToString(payload), nil
}

func EncryptAESGCM(plain string, passphrase string) (string, error) {
	if passphrase == "" {
		return "", errors.New("aes passphrase not configured")
	}
	block, err := aes.NewCipher(SHA256Bytes(passphrase))
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(crand.Reader, nonce); err != nil {
		return "", err
	}
	sealed := gcm.Seal(nil, nonce, []byte(plain), nil)
	payload := append(nonce, sealed...)
	return base64.RawURLEncoding.EncodeToString(payload), nil
}

func DecryptAESGCM(encoded string, passphrase string) (string, error) {
	if passphrase == "" {
		return "", errors.New("aes passphrase not configured")
	}
	raw, err := base64.RawURLEncoding.DecodeString(encoded)
	if err != nil {
		return "", err
	}
	block, err := aes.NewCipher(SHA256Bytes(passphrase))
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	if len(raw) <= gcm.NonceSize() {
		return "", errors.New("ciphertext too short")
	}
	nonce := raw[:gcm.NonceSize()]
	ciphertext := raw[gcm.NonceSize():]
	plain, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}
	return string(plain), nil
}

func SHA256Bytes(value string) []byte {
	sum := sha256.Sum256([]byte(value))
	return sum[:]
}

func evpBytesToKey(passphrase, salt []byte, keyLen, ivLen int) ([]byte, []byte) {
	total := keyLen + ivLen
	out := make([]byte, 0, total)
	var prev []byte
	for len(out) < total {
		h := md5.New()
		_, _ = h.Write(prev)
		_, _ = h.Write(passphrase)
		_, _ = h.Write(salt)
		prev = h.Sum(nil)
		out = append(out, prev...)
	}
	return out[:keyLen], out[keyLen:total]
}

func pkcs7Pad(data []byte, blockSize int) []byte {
	padding := blockSize - len(data)%blockSize
	return append(data, bytes.Repeat([]byte{byte(padding)}, padding)...)
}
