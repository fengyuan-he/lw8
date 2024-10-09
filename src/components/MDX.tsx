import {MDXRemote} from "next-mdx-remote";
import {serialize} from "next-mdx-remote/serialize";
import Await from "@/components/Await";
import Wenyou from "@/components/Wenyou";
import Juese from "@/components/Juese";
import {memo} from "react";
import "github-markdown-css";
import Anchor from "@/components/Anchor";

function MDX({children}: { children: string }) {
    return (
        <Await fn={() => serialize(children)}>
            {res =>
                <article className="markdown-body" style={{background: 'transparent'}}>
                    <MDXRemote{...res} components={{Wenyou, Juese, a: (props: any) => <Anchor {...props}/>}}/>
                </article>
            }
        </Await>
    )
}

export default memo(MDX)