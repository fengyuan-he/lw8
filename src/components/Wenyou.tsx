import Page from "@/app/wenyou/[wenyouId]/page";
import {useState} from "react";
import {Button} from "@/components/ui/button";

export default function Wenyou({children}: { children: string }) {
    const [open, setOpen] = useState(false)
    return (
        <>
            <Button size="sm" onClick={() => setOpen(!open)}>{">"}{children}</Button>
            {open && <Page params={{wenyouId: children}}/>}
        </>
    )
}