import Page from "@/app/juese/[jueseId]/page";
import {useState} from "react";
import {Button} from "@/components/ui/button";

export default function Juese({children}: { children: string }) {
    const [open, setOpen] = useState(false)
    return (
        <>
            <Button size="sm" onClick={() => setOpen(!open)}>{"#"}{children}</Button>
            {open && <Page params={{jueseId: children}}/>}
        </>
    )
}