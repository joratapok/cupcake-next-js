import { useEffect, useState } from "react";
import { ActualCurrenciesType } from "../pages";

export type useLongPollFetchType<T> = {
    data: T
    isError: boolean
}

export const useLongPollFetch = (longPollFetch: (market?: string) => Promise<Response>,
                                 _fetch: (market?: string) => Promise<Response>,
                                 isEnabled: boolean,
                                 market?: string,
                                 valueTransformer?: (responseLongPoll: ActualCurrenciesType | undefined,
                                                    isError: boolean,
                                                    responseFirstFetch: ActualCurrenciesType | undefined) => Array<number>): useLongPollFetchType<any> => {
    const [longPollData, setLongPollData] = useState<ActualCurrenciesType | undefined>(undefined)
    const [firstFetchData, setFirstFetchData] = useState<ActualCurrenciesType | undefined>(undefined)
    const [isError, setIsError] = useState<boolean>(false)

    const data = (valueTransformer) ? valueTransformer(longPollData, isError, firstFetchData):
        (longPollData) ? longPollData : firstFetchData

    useEffect(() => {
        if (isEnabled) {
            longPollFetch(market)
                .then(res => res.json())
                .then((res) => setLongPollData(res))
                .catch(e => setIsError(true))
        }
    }, [isEnabled, longPollData, isError])

    useEffect(() => {
        _fetch(market)
            .then(res => res.json())
            .then((res) => setFirstFetchData(res))
            .catch(e => console.log(e.message))
    }, [])

    useEffect(() => {
        if (isError) {
            new Promise(resolve => setTimeout(resolve, 15000))
                .then(() => setIsError(false))
        }
    }, [isError])

    return { data, isError }
}
