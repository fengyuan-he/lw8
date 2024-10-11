'use client'
import Items from "@/components/Items";
import app from "@/app/index";
import {z} from "zod";
import Frame from "@/components/Frame";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Anchor from "@/components/Anchor";
import MDX from "@/components/MDX";
import {Separator} from "@/components/ui/separator";

const GET = app(z.object({
    announcement: z.string(),
    list: z.object({
        id: z.number(),
        create: z.number(),
        message: z.string()
    }).strict().array()
}).strict())
const parseGET = ({announcement, list}: Awaited<ReturnType<typeof GET>>) => ({
    announcement,
    list: list.map(({id, create, message}) => ({
        id,
        at: new Date(create).toLocaleString(),
        message
    }))
})
const handleRefresh = async () => parseGET(await GET('/api'))
const handleLoadNew = async (gt: number) => parseGET(await GET(`/api?gt=${gt}`))
const handleLoadOld = async (lt: number) => parseGET(await GET(`/api?lt=${lt}`))

export default function Page() {
    return (
        <Items
            handleRefresh={handleRefresh}
            handleLoadNew={handleLoadNew}
            handleLoadOld={handleLoadOld}
            map={({id, at, message}: ReturnType<typeof parseGET>['list'][number]) => (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            <Anchor href={`/wenyou/${id}`}>{">"}{id}</Anchor>
                        </CardTitle>
                        <CardDescription>{at}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MDX>{message}</MDX>
                    </CardContent>
                </Card>
            )}
        >
            {([refresh, list]) => <Frame header="首页" actions={refresh}>{list && (() => {
                const [{announcement}, node] = list
                return (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>公告</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <MDX>{announcement}</MDX>
                            </CardContent>
                        </Card>
                        <Separator/>
                        {node}
                    </>
                )
            })()}</Frame>}
        </Items>
    )
}
