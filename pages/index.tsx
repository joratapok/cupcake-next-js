import { useMemo } from "react"
import { withStyles, Theme, createStyles, makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Container from '@material-ui/core/Container'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Link from 'next/link'
import { findLowestValue } from '../utils/findLowestValue'
import { calcCurrencyValues } from '../utils/calcCurrensies'
import { MainLayout } from '../Components/MainLayout'
import c from '../styles/indexPage.module.css'
import {
    useLongPoll,
} from "../hooks/useLongPoll";

export type ActualCurrenciesType = {
    rates: RatesType
    timestamp: number
    base: string
    date: string
} | undefined
export type RatesType = {
    'RUB': number
    'USD': number
    'EUR': number
}
export type MarketsType = 'first' | 'second' | 'third'
type drawTablePropsType = {
    currency: string
    ind: number
    firstMarket: Array<number>
    secondMarket: Array<number>
    thirdMarket: Array<number>
}
type initRequestType<T> = {
    firstMarketInitialResponse: T
    secondMarketInitialResponse: T
    thirdMarketInitialResponse: T
}

const useStyles = makeStyles({
    table: {
        minWidth: 500,
        maxWidth: 800
    },
    container: {
        marginTop: 20,
        maxWidth: 800
    },
    activeCell: {
        backgroundColor: '#cfe8fc',
        transition: '1s'
    },
    passiveCell: {
        transition: '0.5s'
    }
})
const StyledTableRow = withStyles((theme: Theme) =>
    createStyles({
        root: {
            '&:nth-of-type(odd)': {
                backgroundColor: theme.palette.action.hover
            }
        }
    })
)(TableRow)

const initial = [0, 0, 0, 0, 0, 0]
const creatorLongPollFetch = (market: string): () => Promise<ActualCurrenciesType> => {
    return async (): Promise<ActualCurrenciesType> => {
            let response = await fetch(`http://localhost:3000/api/v1/${market}/poll`)
            return await response.json()
    }
}
const creatorInitialFetch = (market: string): () => Promise<ActualCurrenciesType> => {
    return async (): Promise<ActualCurrenciesType> => {
        let response = await fetch(`http://localhost:3000/api/v1/${market}`)
        return await response.json()
    }
}

const useDataTransformer = (responseLongPoll: ActualCurrenciesType): Array<number> => {
    return useMemo(() => {
        if (responseLongPoll) {
            return calcCurrencyValues(responseLongPoll.rates)
        }
        return initial
    }, [responseLongPoll])
}

export default function Home ({firstMarketInitialResponse,
                                  secondMarketInitialResponse,
                                  thirdMarketInitialResponse}: initRequestType<ActualCurrenciesType>) {
    const classes = useStyles()
    const markets: Array<MarketsType> = ['first', 'second', 'third']
    const currencies = ['RUB/CUPCAKE', 'USD/CUPCAKE', 'EUR/CUPCAKE', 'RUB/USD', 'RUB/EUR', 'EUR/USD']

    const firstMarket = useLongPoll<ActualCurrenciesType>({
        fetchLongPoll: creatorLongPollFetch('first') ,
        fetchInitialData: creatorInitialFetch('first'),
        isEnabled: true,

    })
    const secondMarket = useLongPoll<ActualCurrenciesType>({
        fetchLongPoll: creatorLongPollFetch('second') ,
        fetchInitialData: creatorInitialFetch('second'),
        isEnabled: true,
    })
    const thirdMarket = useLongPoll<ActualCurrenciesType>({
        fetchLongPoll: creatorLongPollFetch('third') ,
        fetchInitialData: creatorInitialFetch('third'),
        isEnabled: false,
    })

    const firstMarketHandledData = useDataTransformer(firstMarket.data)
    const secondMarketHandledData = useDataTransformer(secondMarket.data)
    const thirdMarketHandledData = useDataTransformer(thirdMarket.data)
    const firstMarketHandledInitialData = useDataTransformer(firstMarketInitialResponse)
    const secondMarketHandledInitialData = useDataTransformer(secondMarketInitialResponse)
    const thirdMarketHandledInitialData = useDataTransformer(thirdMarketInitialResponse)

    return (
        <MainLayout title={'Cupcake currencies'}>
            <Container className={classes.container}>
                <TableContainer component={Paper}>
                    <Table className={classes.table} size="small" aria-label="currencies">
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">Pair name / Market</TableCell>
                                {markets.map((market) => <TableCell key={market} align="center">{market}</TableCell>)}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currencies.map((currency, ind) => (
                                <DrawTable key={currency}
                                           currency={currency}
                                           ind={ind}
                                           firstMarket={firstMarketHandledData || firstMarketHandledInitialData}
                                           secondMarket={secondMarketHandledData || secondMarketHandledInitialData}
                                           thirdMarket={thirdMarketHandledData || thirdMarketHandledInitialData}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Link  href="/unsubscribe"><a><h3>Unsubscribe long poll</h3></a></Link>
            </Container>
        </MainLayout>
    )
}

function DrawTable ({currency, ind, firstMarket, secondMarket, thirdMarket}: drawTablePropsType) {
    const lowest: Array<number> = useMemo(() => {
        return findLowestValue(firstMarket, secondMarket, thirdMarket)
    }, [firstMarket, secondMarket, thirdMarket])
    return (
        <StyledTableRow>
            <TableCell align="left">{currency}</TableCell>
            <TableCell align="center"
                       className={(firstMarket[ind] === lowest[ind] && lowest[ind] !== 0) ? c.activeCell : c.passiveCell}
            >{firstMarket[ind]}</TableCell>
            <TableCell align="center"
                       className={(secondMarket[ind] === lowest[ind] && lowest[ind] !== 0) ? c.activeCell : c.passiveCell}
            >{secondMarket[ind]}</TableCell>
            <TableCell align="center"
                       className={(thirdMarket[ind] === lowest[ind] && lowest[ind] !== 0) ? c.activeCell : c.passiveCell}
            >{thirdMarket[ind]}</TableCell>
        </StyledTableRow>
    )
}

Home.getInitialProps = async () => {
    const initRequest: initRequestType<ActualCurrenciesType> = {
        firstMarketInitialResponse: undefined,
        secondMarketInitialResponse: undefined,
        thirdMarketInitialResponse: undefined,
    }
    try {
        initRequest.firstMarketInitialResponse = await creatorInitialFetch('first')()
        initRequest.secondMarketInitialResponse = await creatorInitialFetch('second')()
        initRequest.thirdMarketInitialResponse = await creatorInitialFetch('third')()
    } catch (e) {
        console.log(e.message)
    }
    return initRequest
}
