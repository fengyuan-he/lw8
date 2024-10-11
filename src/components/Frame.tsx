import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {ReactNode} from "react";

export default function Frame({title, header, actions, children}: {
    title?: string
    header: string
    actions: ReactNode
    children: ReactNode
}) {
    const {push} = useRouter()
    return (
        <div className="container py-6 space-y-4">
            <title>{title ? `${title}|联八` : '联八'}</title>
            <div className="flex items-center justify-between">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">{header}</h1>
                {actions}
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => push('/')}
                    >
                        首页
                    </Button>
                </div>
            </div>
            {children}
        </div>
    )
}