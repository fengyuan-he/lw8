'use client'

import {useMemo} from "react";

export default function Page({params: {wenyouId: wenyouId_}}: { params: { wenyouId: string } }) {
    const wenyouId = useMemo(() => Number(wenyouId_), [wenyouId_])
    return (
        <>
        </>
    )
}