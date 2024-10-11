'use client'

import Items from "@/components/Items";
import app from "@/app/index";
import {z} from "zod";
import Frame from "@/components/Frame";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import MDX from "@/components/MDX";
import {Separator} from "@/components/ui/separator";
import useLocalStorage from "@/app/useLocalStorage";
import {useCallback, useMemo, useState} from "react";
import {exportDecryptKey, exportEncryptKey, generateAsymmetricKey} from "@/crypto/asymmetric";
import {exportSignKey, exportVerifyKey, generateDigitalKey, sign} from "@/crypto/digital";
import to from "@/base64/to";
import {useRouter} from "next/navigation";
import {Textarea} from "@/components/ui/textarea";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import Async from "@/components/Async";
import Wenyou, {WenyouProps} from "@/app/Wenyou";

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
const POST = app(z.number())
const handleCreate = async (message: string) => {
    const {signKey, verifyKey} = await generateDigitalKey()
    const {encryptKey, decryptKey} = await generateAsymmetricKey()
    const id = await POST('/api/wenyou', {
        method: 'POST',
        body: JSON.stringify({
            keyVerify: to(Buffer.from(await exportVerifyKey(verifyKey))),
            keyEncrypt: to(Buffer.from(await exportEncryptKey(encryptKey))),
            message,
            signature: to(Buffer.from(await sign(signKey, Buffer.from(new TextEncoder().encode(message)))))
        })
    })
    localStorage.setItem(`wenyou-signKey-${id}`, to(Buffer.from(await exportSignKey(signKey))))
    localStorage.setItem(`wenyou-decryptKey-${id}`, to(Buffer.from(await exportDecryptKey(decryptKey))))
    return id
}

export default function Page() {
    const [msg, setMsg] = useLocalStorage('wenyou-msg')
    const msg_ = useMemo(() => msg ?? '', [msg])
    const [preview, setPreview] = useState(false)
    const {push} = useRouter()
    const create = useCallback(async () => {
        const id = await handleCreate(msg_)
        setMsg(undefined)
        setPreview(false)
        push(`/wenyou/${id}`)
    }, [msg, setMsg, push])
    return (
        <Items
            handleRefresh={handleRefresh}
            handleLoadNew={handleLoadNew}
            handleLoadOld={handleLoadOld}
            map={(value: WenyouProps) => <Wenyou {...value}/>}
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
                        {
                            preview ?
                                <MDX>{msg_}</MDX> :
                                <Textarea
                                    className="resize-none my-4"
                                    placeholder="请在这里填写要创建的文游的内容，支持MDX格式，将公开可见"
                                    value={msg}
                                    onChange={event => setMsg(event.target.value)}
                                />
                        }
                        <div className="flex items-center space-x-2">
                            <Switch id="preview" checked={preview} onCheckedChange={setPreview}/>
                            <Label htmlFor="preview">预览</Label>
                            <Async fn={create}>送出</Async>
                        </div>
                        <Separator/>
                        {node}
                    </>
                )
            })()}</Frame>}
        </Items>
    )
}
