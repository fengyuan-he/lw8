import prisma from "@/prisma";
import to from "@/base64/to";

export default async ({wenyouIds, lt, gt}: {
    wenyouIds: number[]
    lt?: number
    gt?: number
}) => {
    if (lt !== undefined && gt !== undefined) throw new Error('不能同时有lt和gt')
    const Juese = await prisma.juese.findMany({
        where: {
            wenyouId: {
                in: wenyouIds
            },
            ...lt !== undefined ? {where: {id: {lt}}} : gt !== undefined && {where: {id: {gt}}}
        },
        orderBy: {
            id: gt !== undefined ? 'asc' : 'desc'
        },
        take: 10,
        select: {
            id: true,
            createdAt: true,
            messageData: true
        }
    })
    if (gt !== undefined) Juese.reverse()
    return {
        title: '玩家报名',
        list: Juese.map(({id, createdAt, messageData}) => ({
            id,
            create: createdAt.valueOf(),
            messageData: to(messageData)
        }))
    }
}