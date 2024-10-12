import api from "@/app/api";
import get from "@/prisma/juese/get";
import tSchema from "@/app/api/tSchema";
import idSchema from "@/app/api/idSchema";
import post from "@/prisma/juese/post";
import {z} from "zod";
import patch from "@/prisma/juese/patch";
import del from "@/prisma/juese/delete";
import bSchema from "@/app/api/bSchema";
import put from "@/prisma/juese/put";
import aSchema from "@/app/api/aSchema";

export const GET = api(async ({nextUrl: {searchParams}}) => get({
    id: idSchema.parse(searchParams.get('id')),
    lt: tSchema.parse(searchParams.get('lt') ?? undefined),
    gt: tSchema.parse(searchParams.get('gt') ?? undefined)
}))

export const POST = api(async request => post(z.object({
    wenyouId: z.number(),
    keyVerify: bSchema,
    keyEncrypt: bSchema,
    messageData: bSchema,
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
        wenyouIds: aSchema,
    }).strict().parse(await json()),
    lt: tSchema.parse(searchParams.get('lt') ?? undefined),
    gt: tSchema.parse(searchParams.get('gt') ?? undefined)
}))