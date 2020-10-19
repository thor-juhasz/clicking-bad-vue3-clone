export default interface Cooker extends Object {
    sid: string,
    label: string
    description: string
    amount: number
    risk: number
    rps: number
    baseCost: number
    cost: number
    unlockRps: number
    unlocked: boolean
}
