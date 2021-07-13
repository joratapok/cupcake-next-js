import { useEffect, useState } from "react";

type UseLongPollPropsType<U> = {
    fetchLongPoll: () => Promise<U>
    fetchInitialData: () => Promise<U>
    isEnabled: boolean
}
type useLongPollReturnType<U> = {
    data: U | undefined
    isError: boolean
}

export const useLongPoll = <U> ({ fetchLongPoll,
                                 fetchInitialData,
                                 isEnabled }: UseLongPollPropsType<U>): useLongPollReturnType<U> => {
    const [longPollData, setLongPollData] = useState<U | undefined>(undefined)
    const [isError, setIsError] = useState<boolean>(false)

    useEffect(() => {
        let isSubscribed = isEnabled
        async function subscriber () {
            try {
                const initialData = await fetchInitialData()
                if (isEnabled) setLongPollData(initialData)
            }catch (e) {
                console.log(e.message)
            }

            while (isSubscribed) {
                try {
                    const response = await fetchLongPoll()
                    if (isEnabled) setLongPollData(response)
                }catch (e) {
                    setIsError(true)
                    if (isEnabled) setLongPollData(undefined)
                }
            }
        }
        if (isSubscribed) subscriber()
        return () => {
            isSubscribed = false
        }
    }, [isEnabled])

    return { data: longPollData, isError }
}
