export enum UpgradeAction {
    Make = 'makeClick',
    Sell = 'sellClick',
    MakeMultiplier = 'makeRps',
    SellMultiplier = 'sellRps',
    BatchCost = 'batchPurity',
}

export default interface Upgrade {
    sid: string,
    label: string
    description: string
    action: UpgradeAction | string | null
    purchased: boolean
    mod: number
    cost: number
    preReq: string | null
    hidden?: boolean
}
