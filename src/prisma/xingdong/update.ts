import prisma from "@/prisma";
import auth from "@/crypto/auth";

export default async ({id, messageData, messageVector, signature}: {
    id: number
    messageData: Buffer
    messageVector: Buffer
    signature: Buffer
}) => {
    const {wanjia, Juese, Wenyou} = await prisma.xingdong.findUniqueOrThrow({
        where: {id},
        select: {
            wanjia: true,
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
    await auth(wanjia ? Juese.keyVerify : Wenyou.keyVerify, messageData, signature)
    await prisma.xingdong.update({
        where: {id},
        data: {messageData, messageVector}
    })
}