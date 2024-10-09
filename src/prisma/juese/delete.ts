import prisma from "@/prisma";
import auth from "@/crypto/auth";

export default async ({id, signature}: {
    id: number
    signature: Buffer
}) => {
    await auth((await prisma.juese.findUniqueOrThrow({
        where: {id},
        select: {
            keyVerify: true
        }
    })).keyVerify, Buffer.alloc(0), signature)
    await prisma.juese.delete({
        where: {id}
    })
}