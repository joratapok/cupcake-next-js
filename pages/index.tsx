import {MainLayout} from "../Components/MainLayout";
import {useEffect, useState} from "react";
import {calcCurrencyValues} from "../utils/calcCurrensies";
import { withStyles, Theme, createStyles, makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Container from '@material-ui/core/Container'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Link from "next/link";
import { findLowestValue } from "../utils/findLowestValue";
import c from '../styles/indexPage.module.css'

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

type MarketsType = 'first' | 'second' | 'third'

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

const initial = [0, 0, 0, 0, 0, 0]
let unSubscribe = false
const setUnSubscribe = (val: true | false): void => {
    unSubscribe = val
}

export default function Home() {
    const classes = useStyles()
    const [firstMarket, setFirstMarket] = useState<Array<number>>(initial)
    const [secondMarket, setSecondMarket] = useState<Array<number>>(initial)
    const [thirdMarket, setThirdMarket] = useState<Array<number>>(initial)
    const markets: Array<MarketsType> = ['first', 'second', 'third']
    const currencies = ['RUB/CUPCAKE', 'USD/CUPCAKE', 'EUR/CUPCAKE', 'RUB/USD', 'RUB/EUR', 'EUR/USD']

    useEffect(() => {
        setUnSubscribe(false)
        const subscribeToMarket = async (market: MarketsType): Promise<void> => {
            if (unSubscribe) return undefined
            try {
                const response = await fetch(`http://localhost:3000/api/v1/${market}/poll`)
                if (response.status === 200) {
                    const currency: ActualCurrenciesType = await response.json()
                    if (market === 'first') setFirstMarket(calcCurrencyValues(currency.rates))
                    if (market === 'second') setSecondMarket(calcCurrencyValues(currency.rates))
                    if (market === 'third') setThirdMarket(calcCurrencyValues(currency.rates))
                    await subscribeToMarket(market)
                }
                await new Promise(resolve => setTimeout(resolve, 15000))
                await subscribeToMarket(market)
            } catch (e) {
                console.error('>>>>>>>')
                if (market === 'first') setFirstMarket(initial)
                if (market === 'second') setSecondMarket(initial)
                if (market === 'third') setThirdMarket(initial)
                await new Promise(resolve => setTimeout(resolve, 15000))
                await subscribeToMarket(market)
            }
        }
        subscribeToMarket('first')
        subscribeToMarket('second')
        subscribeToMarket('third')
        return () => setUnSubscribe(true)
    }, [])

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
                                           firstMarket={firstMarket}
                                           secondMarket={secondMarket}
                                           thirdMarket={thirdMarket}
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
    const [lowest, setLowest] = useState<Array<number>>(initial)
    useEffect(() => {
        setLowest(findLowestValue(firstMarket, secondMarket, thirdMarket))
    },[firstMarket, secondMarket, thirdMarket])
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
