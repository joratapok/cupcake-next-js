import { useEffect, useState } from "react";

type UseLongPollPropsType<U, T> = {
    fetchLongPoll: () => Promise<U>
    fetchInitialData: () => Promise<U>
    isEnabled: boolean
    dataTransformer?: (data: U | undefined, isError: boolean) => T
}
type useLongPollReturnType<U, T> = {
    data: U | T | undefined
    isError: boolean
}

export const useLongPoll = <U, T> ({ fetchLongPoll,
                                 fetchInitialData,
                                 isEnabled,
                                 dataTransformer }: UseLongPollPropsType<U, T>): useLongPollReturnType<U, T> => {
    const [longPollData, setLongPollData] = useState<U | undefined>(undefined)
    const [isError, setIsError] = useState<boolean>(false)

    const data = (dataTransformer) ? dataTransformer(longPollData, isError): longPollData

    useEffect(() => {
        let isMounted = true
        async function subscriber () {
            const initialData = await fetchInitialData()
            setLongPollData(initialData)
            while (isMounted) {
                try {
                    const response = await fetchLongPoll()
                    setLongPollData(response)
                }catch (e) {
                    setIsError(true)
                }
            }
        }
        subscriber()
        return () => {
            isMounted = false
        }
    }, [])

    return { data, isError }
}
