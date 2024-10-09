import prisma from "@/prisma";
import to from "@/base64/to";

export default async ({id, lt, gt}: {
    id: number
    lt?: number
    gt?: number
}) => {
    if (lt !== undefined && gt !== undefined) throw new Error('lt和gt不能同时有')
    const {createdAt, keyEncrypt, message, Juese} = await prisma.wenyou.findUniqueOrThrow({
        where: {id},
        select: {
            createdAt: true,
            keyEncrypt: true,
            message: true,
            Juese: {
                ...lt !== undefined ? {where: {id: {lt}}} : gt !== undefined && {where: {id: {gt}}},
                orderBy: {
                    id: gt !== undefined ? 'asc' : 'desc'
                },
                take: 10,
                select: {
                    id: true,
                    createdAt: true,
                    keyEncrypt: true,
                    messageData: true,
                    messageVector: true
                }
            }
        }
    })
    if (gt !== undefined) Juese.reverse()
    return {
        create: createdAt.valueOf(),
        keyEncrypt: to(keyEncrypt),
        message,
        list: Juese.map(({id, createdAt, keyEncrypt, messageData, messageVector}) => ({
            id,
            create: createdAt.valueOf(),
            keyEncrypt: to(keyEncrypt),
            messageData: to(messageData),
            messageVector: to(messageVector)
        }))
    }
}