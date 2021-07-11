import {useCallback, useEffect, useState} from "react";
import { ActualCurrenciesType } from "../pages";

type useLongPollFetchType = {
    data: ActualCurrenciesType | undefined
    isError: boolean
    isLoading: boolean
}

export const useTestingHook = (initialUrl: string, pollUrl: string): useLongPollFetchType => {
    const [data, setData] = useState<ActualCurrenciesType | undefined>(undefined)
    const [isError, setIsError] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const _fetch = async (type: 'long' | 'default' = 'long') => {
        const url: string = type === 'long' ? `${initialUrl}${pollUrl}/poll` : `${initialUrl}${pollUrl}`
        try {
            const response = await fetch(url)
            if (response.status === 200) {
                return  await response.json()
            }
        } catch (e) {
            setIsError(true)
        }
    }

    const execute = useCallback (() => {
        return _fetch()
            .then((response) => {
                setData(response)
            })
            .catch((e) => {
            })
    }, [_fetch])

    useEffect(() => {
        execute()
    }, [execute])

    useEffect(() => {
        _fetch('default')
            .then((response) => {
                setData(response)
            })
    }, [])

    return { data, isError, isLoading }
}
