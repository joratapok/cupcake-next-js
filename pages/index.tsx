import {useEffect, useMemo, useState} from "react";
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
import { QueryClientProvider, QueryClient } from 'react-query'
import { findLowestValue } from '../utils/findLowestValue'
import { calcCurrencyValues } from '../utils/calcCurrensies'
import { MainLayout } from '../Components/MainLayout'
import c from '../styles/indexPage.module.css'
import { useLongPollFetch } from "../hooks/useLongPollFetch";

export type ActualCurrenciesType = {
    rates: RatesType
    timestamp: number
    base: string
    date: string
}
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

export const initial = [0, 0, 0, 0, 0, 0]

const TableCurrency = () => {
    const classes = useStyles()
    const [isEnabled, setIsEnabled] = useState<boolean>(true)
    const markets: Array<MarketsType> = ['first', 'second', 'third']
    const currencies = ['RUB/CUPCAKE', 'USD/CUPCAKE', 'EUR/CUPCAKE', 'RUB/USD', 'RUB/EUR', 'EUR/USD']
    const initUrl = 'http://localhost:3000/api/v1/'

    useEffect(() => {
        setIsEnabled(true)
        return () => setIsEnabled(false)
    }, [])

    const firstMarket = useLongPollFetch(initUrl,'first', isEnabled)
    const secondMarket = useLongPollFetch(initUrl,'second', isEnabled)
    const thirdMarket = useLongPollFetch(initUrl,'third', isEnabled)

    const valueProvider = (responseLongPoll: ActualCurrenciesType | undefined,
                           isError: boolean) => {
        if (isError) {
            return initial
        }
        if (responseLongPoll) {
            return calcCurrencyValues(responseLongPoll.rates)
        }
        return initial
    }

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
                                           firstMarket={valueProvider(firstMarket.data, firstMarket.isError)}
                                           secondMarket={valueProvider(secondMarket.data, secondMarket.isError)}
                                           thirdMarket={valueProvider(thirdMarket.data, thirdMarket.isError)}
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

export default function Home() {
    const queryClient = new QueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            <TableCurrency />
        </QueryClientProvider>
    )
}
