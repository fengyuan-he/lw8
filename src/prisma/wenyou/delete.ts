import prisma from "@/prisma";
import auth from "@/crypto/auth";

export default async ({id, signature}: {
    id: number
    signature: Buffer
}) => {
    await auth((await prisma.wenyou.findUniqueOrThrow({
        where: {id},
        select: {
            keyVerify: true
        }
    })).keyVerify, Buffer.alloc(0), signature)
    await prisma.xingdong.deleteMany({
        where: {
            wenyouId: id
        }
    })
    await prisma.juese.deleteMany({
        where: {
            wenyouId: id
        }
    })
    await prisma.wenyou.delete({
        where: {id}
    })
}