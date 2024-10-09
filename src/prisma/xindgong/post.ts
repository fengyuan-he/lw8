import prisma from "@/prisma";
import auth from "@/crypto/auth";

export default async ({jueseId, messageData, messageVector, zhukong, signature}: {
    jueseId: number
    messageData: Buffer
    messageVector: Buffer
    zhukong: boolean
    signature: Buffer
}) => {
    await auth(zhukong ? (await prisma.juese.findUniqueOrThrow({
        where: {
            id: jueseId
        },
        select: {
            keyVerify: true
        }
    })).keyVerify : (await prisma.juese.findUniqueOrThrow({
        where: {
            id: jueseId
        },
        select: {
            Wenyou: {
                select: {
                    keyVerify: true
                }
            }
        }
    })).Wenyou.keyVerify, messageData, signature)
    await prisma.xingdong.create({
        data: {
            jueseId,
            messageData,
            messageVector,
            zhukong,
            ...await prisma.juese.findUniqueOrThrow({
                where: {
                    id: jueseId
                },
                select: {
                    wenyouId: true
                }
            })
        }
    })
}