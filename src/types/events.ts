export enum EventAction {
    FoundCash = 'foundCash',
    FoundMeth = 'foundMeth',
    LostCash = 'lostCash',
    LostMeth = 'lostMeth',
    RivalStoleCash = 'rivalStoleCash',
    PayBribe = 'payBribe',
    DeaSeizeBuilding = 'deaSeizeBuilding',
    IrsAudit = 'irsAudit',
}

export default interface Event {
    sid: string
    name: string
    chance: number
    action: EventAction
    mod: number | null
}
