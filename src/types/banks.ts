export default interface Bank extends Object {
    sid: string,
    label: string
    description: string
    amount: number
    rps: number
    unlockRps: number
    baseCost: number
    cost: number
}
