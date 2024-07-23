export default interface Bank {
    sid: string,
    label: string
    description: string
    amount: number
    rps: number
    unlockRps: number
    baseCost: number
    cost: number
    unlocked: boolean
}
