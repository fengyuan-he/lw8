import Await from "@/components/Await";
import {decrypt, encrypt, importDecryptKey, importEncryptKey} from "@/crypto/asymmetric";
import from from "@/base64/from";
import useLocalStorage from "@/app/useLocalStorage";
import React, {useCallback, useMemo, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Anchor from "@/components/Anchor";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {importSignKey, sign} from "@/crypto/digital";
import MDX from "@/components/MDX";
import {Lock} from "lucide-react";
import request from "@/app/api/request";
import to from "@/base64/to";
import {useRouter} from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import Async from "@/components/Async";

export interface JueseProps {
    wenyouId: number
    id: number
    at: string
    keyEncrypt: Buffer
    messageData: Buffer
}

export default function Juese({wenyouId, id, at, keyEncrypt, messageData}: JueseProps) {
    const [signKey] = useLocalStorage(`juese-signKey-${id}`)
    const [raw, setRaw] = useState(false)
    const [deleted, setDeleted] = useState(false)
    return (
        <Await fn={async () => {
            const decryptKey = localStorage.getItem(`wenyou-decryptKey-${wenyouId}`)
            return decryptKey === null ? localStorage.getItem(`juese-message-${id}`) ?? undefined : new TextDecoder().decode(await decrypt(await importDecryptKey(from(decryptKey)), messageData))
        }}>
            {message =>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Anchor href={`/wenyou/${id}`}>{">"}{id}</Anchor>
                            <Switch id="raw" checked={raw} onCheckedChange={setRaw}/>
                            <Label htmlFor="raw">原始</Label>
                            {deleted ?
                                <Badge variant="destructive">已被删除</Badge> :
                                signKey !== undefined &&
                                <Await fn={() => importSignKey(from(signKey))}>
                                    {signKey =>
                                        <>
                                            <JueseUpdate
                                                id={id}
                                                keyEncrypt={keyEncrypt}
                                                message={message}
                                                signKey={signKey}
                                            />
                                            <JueseDelete
                                                id={id}
                                                onDelete={() => setDeleted(true)}
                                                signKey={signKey}
                                            />
                                        </>}
                                </Await>}
                        </CardTitle>
                        <CardDescription>{at}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {message === undefined ? <Lock/> : raw ? <pre>{message}</pre> : <MDX>{message}</MDX>}
                    </CardContent>
                </Card>}
        </Await>
    )
}

const handleUpdate = async (id: number, keyEncrypt: Buffer, message: string, signKey: CryptoKey) => {
    const messageData = await encrypt(await importEncryptKey(keyEncrypt), new TextEncoder().encode(message))
    await request('/api/juese', {
        method: 'PATCH',
        body: JSON.stringify({
            id,
            messageData: to(Buffer.from(messageData)),
            signature: to(Buffer.from(await sign(signKey, messageData)))
        })
    })
}

function JueseUpdate({id, keyEncrypt, message, signKey}: {
    id: number
    keyEncrypt: Buffer
    message?: string
    signKey: CryptoKey
}) {
    const [msg, setMsg] = useLocalStorage(`juese-msg-${id}`, message)
    const msg_ = useMemo(() => msg ?? '', [msg])
    const [preview, setPreview] = useState(false)
    const {push} = useRouter()
    const update = useCallback(async () => {
        await handleUpdate(id, keyEncrypt, msg_, signKey)
        setMsg(undefined)
        setPreview(false)
        push(`/juese/${id}`)
    }, [msg, setMsg, push, signKey])
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">编辑</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>编辑</DialogTitle>
                    <DialogDescription>请在这里填写更新后的角色的内容，支持MDX格式，仅推演和玩家可见</DialogDescription>
                </DialogHeader>
                {
                    preview ?
                        <MDX>{msg_}</MDX> :
                        <Textarea
                            className="resize-none my-4"
                            value={msg}
                            onChange={event => setMsg(event.target.value)}
                        />
                }
                <DialogFooter className="flex items-center space-x-2">
                    <Switch id="preview" checked={preview} onCheckedChange={setPreview}/>
                    <Label htmlFor="preview">预览</Label>
                    <Async fn={update}>送出</Async>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const handleDelete = async (id: number, signKey: CryptoKey) => {
    await request('/api/juese', {
        method: 'DELETE',
        body: JSON.stringify({
            id,
            signature: to(Buffer.from(await sign(signKey, Buffer.alloc(0))))
        })
    })
}

function JueseDelete({id, onDelete, signKey}: {
    id: number
    onDelete: () => void
    signKey: CryptoKey
}) {
    const [id_, setId_] = useState<string>()
    const del = useCallback(async () => {
        await handleDelete(id, signKey)
        setId_(undefined)
        localStorage.removeItem(`juese-signKey-${id}`)
        localStorage.removeItem(`juese-decryptKey-${id}`)
        localStorage.removeItem(`juese-message-${id}`)
        localStorage.removeItem(`juese-msg-${id}`)
        localStorage.removeItem(`${id}-xingdong-msg`)
        onDelete()
    }, [id, signKey, onDelete])
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">删除</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>删除</DialogTitle>
                    <DialogDescription>请在这里填写要删除的角色的id，也就是{id}</DialogDescription>
                </DialogHeader>
                <Textarea
                    className="resize-none my-4"
                    value={id_}
                    onChange={event => setId_(event.target.value)}
                />
                <DialogFooter>
                    <Async fn={del} disabled={id_ !== String(id)}>确定</Async>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}