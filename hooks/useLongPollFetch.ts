import { useEffect, useState } from "react";
import { ActualCurrenciesType } from "../pages";

type useLongPollFetchType = {
    data: ActualCurrenciesType | undefined
    isError: boolean
    isLoading: boolean
}

export const useLongPollFetch = (initialUrl: string, pollUrl: string, isEnabled: boolean): useLongPollFetchType => {
    const [data, setData] = useState<ActualCurrenciesType | undefined>(undefined)
    const [isError, setIsError] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const _fetch = async (type: 'long' | 'default' = 'default') => {
        if (!isEnabled && type === 'long') return
        const url: string = type === 'long' ? `${initialUrl}${pollUrl}/poll` : `${initialUrl}${pollUrl}`
        setIsLoading(true)
        try {
            const response = await fetch(url)
            if (response.status === 200) {
                setIsLoading(false)
                setIsError(false)
                const res =  await response.json()
                setData(res)
                if (type === 'long') await _fetch('long')
            }
        } catch (e) {
            setIsError(true)
            setIsLoading(false)
            await new Promise(resolve => setTimeout(resolve, 15000))
            if (type === 'long') await _fetch('long')
        }
    }

    useEffect(() => {
        _fetch()
        _fetch('long')
    }, [])

    return { data, isError, isLoading }
}
