import prisma from "@/prisma";
import to from "@/base64/to";

export default async ({wenyouIds, jueseIds, lt, gt}: {
    wenyouIds?: number[]
    jueseIds?: number[]
    lt?: number
    gt?: number
}) => {
    if (wenyouIds === undefined && jueseIds === undefined) throw new Error('wenyouIds和jueseIds不能都没有')
    if (wenyouIds !== undefined && jueseIds !== undefined) throw new Error('wenyouIds和jueseIds不能同时有')
    if (lt !== undefined && gt !== undefined) throw new Error('lt和gt不能同时有')
    const Xingdong = await prisma.xingdong.findMany({
        where: {
            ...wenyouIds !== undefined ? {wenyouId: {in: wenyouIds}} : {jueseId: {in: jueseIds}},
            ...lt !== undefined ? {where: {id: {lt}}} : gt !== undefined && {where: {id: {gt}}}
        },
        orderBy: {
            id: gt !== undefined ? 'asc' : 'desc'
        },
        take: 10,
        select: {
            jueseId: true,
            id: true,
            createdAt: true,
            messageData: true
        }
    })
    if (gt !== undefined) Xingdong.reverse()
    return {
        title: `${wenyouIds !== undefined ? '玩家' : '推演'}回复`,
        list: Xingdong.map(({jueseId, id, createdAt, messageData}) => ({
            jueseId,
            id,
            create: createdAt.valueOf(),
            messageData: to(messageData)
        }))
    }
}