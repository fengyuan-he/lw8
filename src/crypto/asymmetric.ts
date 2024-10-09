const rsa = {name: 'RSA-OAEP'}
const rsaHashed = {...rsa, hash: 'SHA-512'}
const rsaGen = {...rsaHashed, modulusLength: 4096, publicExponent: new Uint8Array([1, 0, 1])}
export const generateAsymmetricKey = () => crypto.subtle.generateKey(rsaGen, true, ['encrypt', 'decrypt'])
    .then(({privateKey, publicKey}) => ({decryptKey: privateKey, encryptKey: publicKey}))
export const exportEncryptKey = (encryptKey: CryptoKey) => crypto.subtle.exportKey('spki', encryptKey)
export const importEncryptKey = (encryptKeyData: BufferSource) => crypto.subtle.importKey('spki', encryptKeyData, rsaHashed, false, ['encrypt'])
export const exportDecryptKey = (decryptKey: CryptoKey) => crypto.subtle.exportKey('pkcs8', decryptKey)
export const importDecryptKey = (decryptKeyData: BufferSource) => crypto.subtle.importKey('pkcs8', decryptKeyData, rsaHashed, false, ['decrypt'])
export const encrypt = (encryptKey: CryptoKey, data: BufferSource) => crypto.subtle.encrypt(rsa, encryptKey, data)
export const decrypt = (decryptKey: CryptoKey, data: BufferSource) => crypto.subtle.decrypt(rsa, decryptKey, data)