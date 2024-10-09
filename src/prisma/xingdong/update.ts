import prisma from "@/prisma";
import auth from "@/crypto/auth";

export default async ({id, messageData, messageVector, signature}: {
    id: number
    messageData: Buffer
    messageVector: Buffer
    signature: Buffer
}) => {
    const {zhukong, Juese, Wenyou} = await prisma.xingdong.findUniqueOrThrow({
        where: {id},
        select: {
            zhukong: true,
            Juese: {
                select: {
                    keyVerify: true
                }
            },
            Wenyou: {
                select: {
                    keyVerify: true
                }
            }
        }
    })
    await auth(zhukong ? Juese.keyVerify : Wenyou.keyVerify, messageData, signature)
    await prisma.xingdong.update({
        where: {id},
        data: {messageData, messageVector}
    })
}