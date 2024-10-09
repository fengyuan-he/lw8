import api from "@/app/api";
import get from "@/prisma/wenyou/get";
import tSchema from "@/app/api/tSchema";
import idSchema from "@/app/api/idSchema";
import post from "@/prisma/wenyou/post";
import {z} from "zod";
import update from "@/prisma/wenyou/update";
import del from "@/prisma/wenyou/delete";
import bSchema from "@/app/api/bSchema";

export const GET = api(async ({nextUrl: {searchParams}}) => get({
    id: idSchema.parse(searchParams.get('id')),
    lt: tSchema.parse(searchParams.get('lt') ?? undefined),
    gt: tSchema.parse(searchParams.get('gt') ?? undefined)
}))

export const POST = api(async request => post(z.object({
    keyVerify: bSchema,
    keyEncrypt: bSchema,
    message: z.string(),
    signature: bSchema
}).strict().parse(await request.json())))

export const UPDATE = api(async request => update(z.object({
    id: z.number(),
    message: z.string(),
    signature: bSchema
}).strict().parse(await request.json())))

export const DELETE = api(async request => del(z.object({
    id: z.number(),
    signature: bSchema
}).strict().parse(await request.json())))