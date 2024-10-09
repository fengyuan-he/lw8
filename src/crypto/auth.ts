import {importVerifyKey, verify} from "@/crypto/digital";

class AuthError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = 'AuthError'
    }
}

export default async (keyVerify: Buffer, data: Buffer, signature: Buffer) => {
    if (!await verify(await importVerifyKey(keyVerify), data, signature)) throw new AuthError('The signature is forged.')
}