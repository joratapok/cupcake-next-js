import {ActualCurrenciesType, MarketsType} from "../pages";
import {useQuery} from "react-query";
import axios from "axios";

const getCurrencyShortPoll = (initUrl: string, market: MarketsType) => {
    return async (): Promise<ActualCurrenciesType> => {
        const response = await axios.get(
            `${initUrl}${market}`
        )
        return response.data;
    }
}

export default function useShortPolling(initUrl: string, market: MarketsType) {
    return useQuery(market, getCurrencyShortPoll(initUrl, market))
}
