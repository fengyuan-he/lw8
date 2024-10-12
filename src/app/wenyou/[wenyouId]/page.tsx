'use client'

import {useCallback, useMemo, useState} from "react";
import useLocalStorage from "@/app/useLocalStorage";
import {useRouter} from "next/navigation";
import {exportSignKey, exportVerifyKey, generateDigitalKey, sign} from "@/crypto/digital";
import {
    encrypt,
    exportDecryptKey,
    exportEncryptKey,
    generateAsymmetricKey,
    importEncryptKey
} from "@/crypto/asymmetric";
import to from "@/base64/to";
import nRequest from "@/app/api/nRequest";
import app from "@/app";
import {z} from "zod";
import from from "@/base64/from";
import Items from "@/components/Items";
import Juese from "@/app/wenyou/[wenyouId]/Juese";
import Frame from "@/components/Frame";
import MDX from "@/components/MDX";
import {Separator} from "@/components/ui/separator";
import {Textarea} from "@/components/ui/textarea";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import Async from "@/components/Async";
import Wenyou from "@/app/Wenyou";

const GET = app(z.object({
    create: z.number(),
    keyEncrypt: z.string(),
    message: z.string(),
    list: z.object({
        id: z.number(),
        create: z.number(),
        messageData: z.string()
    }).strict().array()
}).strict())
const parseGET = ({create, keyEncrypt, message, list}: Awaited<ReturnType<typeof GET>>) => ({
    at: new Date(create).toLocaleString(),
    keyEncrypt: from(keyEncrypt),
    message,
    list: list.map(({id, create, messageData}) => ({
        id,
        at: new Date(create).toLocaleString(),
        messageData: from(messageData)
    }))
})
const handleRefresh = async (id: number) => parseGET(await GET(`/api/wenyou?id=${id}`))
const handleLoadNew = async (id: number, gt: number) => parseGET(await GET(`/api/wenyou?id=${id}&gt=${gt}`))
const handleLoadOld = async (id: number, lt: number) => parseGET(await GET(`/api/wenyou?id=${id}&lt=${lt}`))

export default function Page({params: {wenyouId: wenyouId_}}: { params: { wenyouId: string } }) {
    const wenyouId = useMemo(() => Number(wenyouId_), [wenyouId_])
    return (
        <Items
            handleRefresh={useCallback(() => handleRefresh(wenyouId), [wenyouId])}
            handleLoadNew={useCallback((gt: number) => handleLoadNew(wenyouId, gt), [wenyouId])}
            handleLoadOld={useCallback((lt: number) => handleLoadOld(wenyouId, lt), [wenyouId])}
            map={(value: { id: number, at: string, messageData: Buffer }, {keyEncrypt}: { keyEncrypt: Buffer }) =>
                <Juese wenyouId={wenyouId} {...value} keyEncrypt={keyEncrypt}/>}
        >
            {([refresh, list]) =>
                <Frame header="文游" actions={refresh} title={`>${wenyouId}`}>
                    {list && (() => {
                        const [{at, keyEncrypt, message}, node] = list
                        return (
                            <>
                                <Wenyou id={wenyouId} at={at} message={message}/>
                                <Separator/>
                                <JueseCreate wenyouId={wenyouId} keyEncrypt={keyEncrypt}/>
                                <Separator/>
                                {node}
                            </>
                        )
                    })()}
                </Frame>}
        </Items>
    )
}

const handleCreate = async (wenyouId: number, keyEncrypt: Buffer, message: string) => {
    const {signKey, verifyKey} = await generateDigitalKey()
    const {encryptKey, decryptKey} = await generateAsymmetricKey()
    const messageData = await encrypt(await importEncryptKey(keyEncrypt), new TextEncoder().encode(message))
    const id = await nRequest('/api/juese', {
        method: 'POST',
        body: JSON.stringify({
            wenyouId,
            keyVerify: to(Buffer.from(await exportVerifyKey(verifyKey))),
            keyEncrypt: to(Buffer.from(await exportEncryptKey(encryptKey))),
            messageData: to(Buffer.from(messageData)),
            signature: to(Buffer.from(await sign(signKey, messageData)))
        })
    })
    localStorage.setItem(`juese-signKey-${id}`, to(Buffer.from(await exportSignKey(signKey))))
    localStorage.setItem(`juese-decryptKey-${id}`, to(Buffer.from(await exportDecryptKey(decryptKey))))
    localStorage.setItem(`juese-message-${id}`, message)
    return id
}

function JueseCreate({wenyouId, keyEncrypt}: {
    wenyouId: number
    keyEncrypt: Buffer
}) {
    const [msg, setMsg] = useLocalStorage(`${wenyouId}-juese-msg`)
    const msg_ = useMemo(() => msg ?? '', [msg])
    const [preview, setPreview] = useState(false)
    const {push} = useRouter()
    const create = useCallback(async () => {
        const id = await handleCreate(wenyouId, keyEncrypt, msg_)
        setMsg(undefined)
        setPreview(false)
        push(`/juese/${id}`)
    }, [wenyouId, msg, setMsg, push])
    return (
        <>
            {
                preview ?
                    <MDX>{msg_}</MDX> :
                    <Textarea
                        className="resize-none my-4"
                        placeholder="请在这里填写要创建的角色的内容，支持MDX格式，仅推演和玩家可见"
                        value={msg}
                        onChange={event => setMsg(event.target.value)}
                    />
            }
            <div className="flex items-center space-x-2">
                <Switch id="preview" checked={preview} onCheckedChange={setPreview}/>
                <Label htmlFor="preview">预览</Label>
                <Async fn={create}>送出</Async>
            </div>
        </>
    )
}