import prisma from "@/prisma";
import auth from "@/crypto/auth";
import {importEncryptKey} from "@/crypto/asymmetric";

export default async ({wenyouId, keyVerify, keyEncrypt, messageData, signature}: {
    wenyouId: number
    keyVerify: Buffer
    keyEncrypt: Buffer
    messageData: Buffer
    signature: Buffer
}) => {
    await importEncryptKey(keyEncrypt)
    await auth(keyVerify, messageData, signature)
    return (await prisma.juese.create({
        data: {
            wenyouId,
            keyVerify,
            keyEncrypt,
            messageData
        },
        select: {
            id: true
        }
    })).id
}