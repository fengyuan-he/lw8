import api from "@/app/api";
import get from "@/prisma/get";
import tSchema from "@/app/api/tSchema";

export const GET = api(async ({nextUrl: {searchParams}}) => get({
    lt: tSchema.parse(searchParams.get('lt') ?? undefined),
    gt: tSchema.parse(searchParams.get('gt') ?? undefined)
}))