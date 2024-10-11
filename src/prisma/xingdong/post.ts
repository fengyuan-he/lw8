import prisma from "@/prisma";
import auth from "@/crypto/auth";

export default async ({jueseId, messageData, messageVector, wanjia, signature}: {
    jueseId: number
    messageData: Buffer
    messageVector: Buffer
    wanjia: boolean
    signature: Buffer
}) => {
    await auth(wanjia ? (await prisma.juese.findUniqueOrThrow({
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
            wanjia,
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