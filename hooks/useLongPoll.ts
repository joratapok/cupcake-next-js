import { useEffect, useState } from "react";

type UseLongPollPropsType<U, T> = {
    fetchLongPoll: () => Promise<U>
    fetchInitialData: () => Promise<U>
    isEnabled: boolean
    dataTransformer?: (data: U | undefined) => T
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

    const data = (dataTransformer) ? dataTransformer(longPollData): longPollData

    useEffect(() => {
        let isMounted = true
        async function subscriber () {
            if (!isEnabled) return
            try {
                const initialData = await fetchInitialData()
                setLongPollData(initialData)
            }catch (e) {
                console.log(e.message)
            }

            while (isMounted) {
                try {
                    const response = await fetchLongPoll()
                    setLongPollData(response)
                }catch (e) {
                    setIsError(true)
                    setLongPollData(undefined)
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
