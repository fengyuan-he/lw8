import prisma from "@/prisma";
import auth from "@/crypto/auth";

export default async ({id, message, signature}: {
    id: number
    message: string
    signature: Buffer
}) => {
    await auth((await prisma.wenyou.findUniqueOrThrow({
        where: {id},
        select: {
            keyVerify: true
        }
    })).keyVerify, Buffer.from(new TextEncoder().encode(message)), signature)
    await prisma.wenyou.update({
        where: {id},
        data: {message}
    })
}