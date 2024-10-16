import prisma from "@/prisma";
import to from "@/base64/to";

export default async ({id, lt, gt}: {
    id: number
    lt?: number
    gt?: number
}) => {
    if (lt !== undefined && gt !== undefined) throw new Error('lt和gt不能同时有')
    const {
        Wenyou,
        wenyouId,
        createdAt,
        keyEncrypt,
        messageData,
        Xingdong
    } = await prisma.juese.findUniqueOrThrow({
        where: {id},
        select: {
            Wenyou: {
                select: {
                    createdAt: true,
                    message: true
                }
            },
            wenyouId: true,
            createdAt: true,
            keyEncrypt: true,
            messageData: true,
            Xingdong: {
                ...lt !== undefined ? {where: {id: {lt}}} : gt !== undefined && {where: {id: {gt}}},
                orderBy: {
                    id: gt !== undefined ? 'asc' : 'desc'
                },
                take: 10,
                select: {
                    id: true,
                    createdAt: true,
                    messageData: true,
                    wanjia: true
                }
            }
        }
    })
    if (gt !== undefined) Xingdong.reverse()
    return {
        parent: {
            create: Wenyou.createdAt.valueOf(),
            message: Wenyou.message
        },
        parentId: wenyouId,
        create: createdAt.valueOf(),
        keyEncrypt: to(keyEncrypt),
        messageData: to(messageData),
        list: Xingdong.map(({id, createdAt, messageData, wanjia}) => ({
            id,
            create: createdAt.valueOf(),
            messageData: to(messageData),
            wanjia
        }))
    }
}