import api from "@/app/api";
import tSchema from "@/app/api/tSchema";
import post from "@/prisma/xingdong/post";
import {z} from "zod";
import patch from "@/prisma/xingdong/patch";
import del from "@/prisma/xingdong/delete";
import bSchema from "@/app/api/bSchema";
import put from "@/prisma/xingdong/put";
import aSchema from "@/app/api/aSchema";

export const POST = api(async request => post(z.object({
    jueseId: z.number(),
    messageData: bSchema,
    wanjia: z.boolean(),
    signature: bSchema
}).strict().parse(await request.json())))

export const PATCH = api(async request => patch(z.object({
    id: z.number(),
    messageData: bSchema,
    signature: bSchema
}).strict().parse(await request.json())))

export const DELETE = api(async request => del(z.object({
    id: z.number(),
    signature: bSchema
}).strict().parse(await request.json())))

export const PUT = api(async ({nextUrl: {searchParams}, json}) => put({
    ...z.object({
        wenyouIds: aSchema.optional(),
        jueseIds: aSchema.optional(),
    }).strict().parse(await json()),
    lt: tSchema.parse(searchParams.get('lt') ?? undefined),
    gt: tSchema.parse(searchParams.get('gt') ?? undefined)
}))