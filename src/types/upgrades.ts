export enum UpgradeAction {
    Make = 'makeClick',
    Sell = 'sellClick',
    MakeMultiplier = 'makeRps',
    SellMultiplier = 'sellRps',
    BatchCost = 'batch_cost',
}

export default interface Upgrade extends Object {
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
