export default interface Stats {
    cookerRps: number
    sellerRps: number
    bankRps: number,

    cookerRoi: number,
    sellerRoi: number,

    cheatedBatches: number
    cheatedCash: number

    cookedByClicks: number
    soldByClicks: number
    timePlayed: number
    boughtUpgrades: number

    lastSaveGame: number
    lastDeaBuildingSeize: number
    sellReturn: number

    totalCooked: number
    totalSold: number
    totalCash: number
    totalSpent: number
    totalBank: number

    startTime: number
}
