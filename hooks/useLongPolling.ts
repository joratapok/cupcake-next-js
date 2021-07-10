import { useQuery } from "react-query";
import axios from "axios";
import {ActualCurrenciesType, MarketsType} from "../pages";

const getCurrencyLongPoll = (initUrl: string, market: MarketsType) => {
    return async (): Promise<ActualCurrenciesType> => {
        const response = await axios.get(
            `${initUrl}${market}/poll`
        )
        return response.data;
    }
}

export default function useLongPolling(initUrl: string, market: MarketsType, isEnabled: boolean) {
    return useQuery(`${market}/poll`, getCurrencyLongPoll(initUrl, market),{refetchInterval: 500, enabled: !isEnabled})
}
