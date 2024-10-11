'use client'

import {useMemo} from "react";

export default function Page({params: {jueseId: jueseId_}}: { params: { jueseId: string } }) {
    const jueseId = useMemo(() => Number(jueseId_), [jueseId_])
    return (
        <>
        </>
    )
}