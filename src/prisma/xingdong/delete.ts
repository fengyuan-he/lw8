import prisma from "@/prisma";
import auth from "@/crypto/auth";

export default async ({id, signature}: {
    id: number
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
    await auth(wanjia ? Juese.keyVerify : Wenyou.keyVerify, Buffer.alloc(0), signature)
    await prisma.xingdong.delete({
        where: {id}
    })
}