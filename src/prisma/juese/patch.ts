import prisma from "@/prisma";
import auth from "@/crypto/auth";

export default async ({id, messageData, signature}: {
    id: number
    messageData: Buffer
    signature: Buffer
}) => {
    await auth((await prisma.juese.findUniqueOrThrow({
        where: {id},
        select: {
            keyVerify: true
        }
    })).keyVerify, messageData, signature)
    await prisma.juese.update({
        where: {id},
        data: {messageData}
    })
}