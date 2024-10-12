import {ReactNode, useCallback, useState} from "react";
import Async from "@/components/Async";

export default function Items<
    V extends { id: number },
    T extends { list: V[] }
>({handleRefresh, handleLoadNew, handleLoadOld, map, children}: {
    handleRefresh: () => Promise<T>
    handleLoadNew: (gt: number) => Promise<T>
    handleLoadOld: (lt: number) => Promise<T>
    map: (value: V, rest: Omit<T, 'list'>) => ReactNode
    children: (array: [ReactNode, [Omit<T, 'list'>, ReactNode] | undefined]) => ReactNode
}) {
    const [data, setData] = useState<T>()
    const refresh = useCallback(async () => {
        setData(await handleRefresh())
    }, [handleRefresh])
    const loadNew = useCallback(async () => {
        if (data?.list.length) {
            const result = await handleLoadNew(data.list[0].id)
            setData(data => data === undefined ? result : {...result, list: [...result.list, ...data.list]})
        } else await refresh()
    }, [handleLoadNew, data, refresh])
    const loadOld = useCallback(async () => {
        if (data?.list.length) {
            const result = await handleLoadOld(data.list[data.list.length - 1].id)
            setData(data => data === undefined ? result : {...result, list: [...data.list, ...result.list]})
        } else await refresh()
    }, [handleLoadOld, data, refresh])
    return children([
        <Async fn={refresh} autoClick>刷新</Async>,
        data && (() => {
            const {list, ...restData} = data
            return [
                restData,
                <>
                    <Async fn={loadNew} autoPoll>加载更近</Async>
                    <ul className="space-y-2">{list.map(value => <li key={value.id}>{map(value, restData)}</li>)}</ul>
                    <Async fn={loadOld}>加载更远</Async>
                </>
            ]
        })()
    ])
}