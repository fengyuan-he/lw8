import prisma from "@/prisma";

export default async ({lt, gt}: {
    lt?: number
    gt?: number
}) => {
    if (lt !== undefined && gt !== undefined) throw new Error('lt和gt不能同时有')
    const Wenyou = (await prisma.wenyou.findMany({
        ...lt !== undefined ? {where: {id: {lt}}} : gt !== undefined && {where: {id: {gt}}},
        orderBy: {
            id: gt !== undefined ? 'asc' : 'desc'
        },
        take: 10,
        select: {
            id: true,
            createdAt: true,
            message: true
        }
    }))
    if (gt !== undefined) Wenyou.reverse()
    return {
        announcement: `欢迎来到联八，这是一个专为h/lq文游打造的匿名论坛，实现了端到端加密，来保护角色的内容和行动的内容仅推演和玩家可见，但**文游的内容所有人可见，请勿发布违法内容**

所有内容均支持[MDX](https://www.mdxjs.cn)格式，支持[Tailwind CSS](https://tailwindcss.com)，可以用\`<Wenyou>\`标签引用文游、用\`<Juese>\`标签引用角色，children填id即可`,
        list: Wenyou.map(({id, createdAt, message}) => ({
            id,
            create: createdAt.valueOf(),
            message
        }))
    }
}