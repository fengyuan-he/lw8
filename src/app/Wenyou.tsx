import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Anchor from "@/components/Anchor";
import MDX from "@/components/MDX";
import useLocalStorage from "@/app/useLocalStorage";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import Await from "@/components/Await";
import from from "@/base64/from";
import {importSignKey, sign} from "@/crypto/digital";
import {useCallback, useMemo, useState} from "react";
import to from "@/base64/to";
import {useRouter} from "next/navigation";
import {Textarea} from "@/components/ui/textarea";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import Async from "@/components/Async";
import request from "@/app/api/request";
import {Badge} from "@/components/ui/badge";

export interface WenyouProps {
    id: number
    at: string
    message: string
}

export default function Wenyou({id, at, message}: WenyouProps) {
    const [signKey] = useLocalStorage(`wenyou-signKey-${id}`)
    const [raw, setRaw] = useState(false)
    const [deleted, setDeleted] = useState(false)
    return (
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
                                    <WenyouUpdate
                                        id={id}
                                        message={message}
                                        signKey={signKey}
                                    />
                                    <WenyouDelete
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
                {raw ? <pre>{message}</pre> : <MDX>{message}</MDX>}
            </CardContent>
        </Card>
    )
}

const handleUpdate = async (id: number, message: string, signKey: CryptoKey) => {
    await request('/api/wenyou', {
        method: 'PATCH',
        body: JSON.stringify({
            id,
            message,
            signature: to(Buffer.from(await sign(signKey, Buffer.from(new TextEncoder().encode(message)))))
        })
    })
}

function WenyouUpdate({id, message, signKey}: {
    id: number
    message: string
    signKey: CryptoKey
}) {
    const [msg, setMsg] = useLocalStorage(`wenyou-msg-${id}`, message)
    const msg_ = useMemo(() => msg ?? '', [msg])
    const [preview, setPreview] = useState(false)
    const {push} = useRouter()
    const update = useCallback(async () => {
        await handleUpdate(id, msg_, signKey)
        setMsg(undefined)
        setPreview(false)
        push(`/wenyou/${id}`)
    }, [msg, setMsg, push, signKey])
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">编辑</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>编辑</DialogTitle>
                    <DialogDescription>请在这里填写更新后的文游的内容，支持MDX格式，将公开可见</DialogDescription>
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
    await request('/api/wenyou', {
        method: 'DELETE',
        body: JSON.stringify({
            id,
            signature: to(Buffer.from(await sign(signKey, Buffer.alloc(0))))
        })
    })
}

function WenyouDelete({id, onDelete, signKey}: {
    id: number
    onDelete: () => void
    signKey: CryptoKey
}) {
    const [id_, setId_] = useState<string>()
    const del = useCallback(async () => {
        await handleDelete(id, signKey)
        setId_(undefined)
        localStorage.removeItem(`wenyou-signKey-${id}`)
        localStorage.removeItem(`wenyou-decryptKey-${id}`)
        localStorage.removeItem(`wenyou-msg-${id}`)
        localStorage.removeItem(`${id}-juese-msg`)
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
                    <DialogDescription>请在这里填写要删除的文游的id，也就是{id}</DialogDescription>
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