export function findLowestValue (first: Array<number>, second: Array<number>, third: Array<number>): Array<number> {
    let lowest: Array<number> = [0, 0, 0, 0, 0, 0]
    return lowest.map((val, ind) => {
        let currentValue: number = Math.min(first[ind], second[ind], third[ind])
        if (lowest === first && lowest === second) {
            currentValue = 0
        }
        if (lowest === second && lowest === third) {
            currentValue = 0
        }
        if (lowest === first && lowest === third) {
            currentValue = 0
        }
        return currentValue
    })
}
