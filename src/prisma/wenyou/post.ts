import prisma from "@/prisma";
import auth from "@/crypto/auth";
import {importEncryptKey} from "@/crypto/asymmetric";

export default async ({keyVerify, keyEncrypt, message, signature}: {
    keyVerify: Buffer
    keyEncrypt: Buffer
    message: string
    signature: Buffer
}) => {
    await importEncryptKey(keyEncrypt)
    await auth(keyVerify, Buffer.from(new TextEncoder().encode(message)), signature)
    return (await prisma.wenyou.create({
        data: {
            keyVerify,
            keyEncrypt,
            message
        },
        select: {
            id: true
        }
    })).id
}