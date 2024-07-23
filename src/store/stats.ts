import { Store } from './store-class'
import Stats from '@/types/stats'

class StatsStore extends Store<Stats> {
    protected data(): Stats {
        return {
            cookerRps: 0,
            sellerRps: 0,
            bankRps: 0,

            cookerRoi: 1,
            sellerRoi: 1,

            cheatedBatches: 0,
            cheatedCash: 0,

            cookedByClicks: 0,
            soldByClicks: 0,
            timePlayed: 0,
            boughtUpgrades: 0,

            lastSaveGame: Date.now(),
            lastDeaBuildingSeize: Date.now(),
            sellReturn: 0.5,

            totalCooked: 0,
            totalSold: 0,
            totalCash: 0,
            totalSpent: 0,
            totalBank: 0,

            startTime: Date.now(),
        }
    }

    public loadFromStorage(data: Stats) {
        for (const key in data) {
            if (!Object.prototype.hasOwnProperty.call(data, key)) {
                continue
            }

            switch (key) {
                case 'cheatedBatches':
                case 'cheatedCash':
                case 'cookedByClicks':
                case 'soldByClicks':
                case 'timePlayed':
                case 'lastSaveGame':
                case 'lastDeaBuildingSeize':
                case 'totalCooked':
                case 'totalSold':
                case 'totalCash':
                case 'totalSpent':
                case 'totalBank':
                case 'startTime':
                    if (typeof data[key] === 'number') {
                        this.state[key] = data[key]
                    }
                    break
            }
        }
    }

    public loadIntoStorage(): string {
        return JSON.stringify({
            cheatedBatches: this.state.cheatedBatches,
            cheatedCash: this.state.cheatedCash,

            cookedByClicks: this.state.cookedByClicks,
            soldByClicks: this.state.soldByClicks,
            timePlayed: this.state.timePlayed,

            lastSaveGame: this.state.lastSaveGame,
            lastDeaBuildingSeize: this.state.lastDeaBuildingSeize,

            totalCooked: this.state.totalCooked,
            totalSold: this.state.totalSold,
            totalCash: this.state.totalCash,
            totalSpent: this.state.totalSpent,
            totalBank: this.state.totalBank,

            startTime: this.state.startTime,
        })
    }

    public modifyCookerRps(amount: number): void {
        this.state.cookerRps = this.state.cookerRps + amount
    }

    public setCookerRps(amount: number) {
        this.state.cookerRps = amount
    }

    public modifySellerRps(amount: number) {
        this.state.sellerRps = this.state.sellerRps + amount
    }

    public setSellerRps(amount: number) {
        this.state.sellerRps = amount
    }

    public modifyBankRps(amount: number) {
        this.state.bankRps = this.state.bankRps + amount
    }

    public setBankRps(amount: number) {
        this.state.bankRps = amount
    }

    public modifyCookerRoi(amount: number) {
        this.state.cookerRoi = this.state.cookerRoi + amount
    }

    public modifySellerRoi(amount: number) {
        this.state.sellerRoi = this.state.sellerRoi + amount
    }

    public modifyCheatedBatches(amount: number) {
        this.state.cheatedBatches = this.state.cheatedBatches + amount
    }

    public modifyCheatedCash(amount: number) {
        this.state.cheatedCash = this.state.cheatedCash + amount
    }

    public modifyCookedByClicks(amount: number) {
        this.state.cookedByClicks = this.state.cookedByClicks + amount
    }

    public modifySoldByClicks(amount: number) {
        this.state.soldByClicks = this.state.soldByClicks + amount
    }

    public modifyTimePlayed(ticks: number) {
        this.state.timePlayed = this.state.timePlayed + ticks
    }

    public modifyBoughtUpgrades(amount: number) {
        this.state.boughtUpgrades = this.state.boughtUpgrades + amount
    }

    public setBoughtUpgrades(amount: number) {
        this.state.boughtUpgrades = amount
    }

    public setLastSaveGame(time: number) {
        this.state.lastSaveGame = time
    }

    public setLastDeaBuildingSeize(time: number) {
        this.state.lastDeaBuildingSeize = time
    }

    public modifyTotalCooked(amount: number) {
        this.state.totalCooked = this.state.totalCooked + amount
    }

    public modifyTotalSold(amount: number) {
        this.state.totalSold = this.state.totalSold + amount
    }

    public modifyTotalCash(amount: number) {
        this.state.totalCash = this.state.totalCash + amount
    }

    public modifyTotalSpent(amount: number) {
        this.state.totalSpent = this.state.totalSpent + amount
    }

    public modifyTotalBank(amount: number) {
        this.state.totalBank = this.state.totalBank + amount
    }

    public modifyStartTime(time: number) {
        this.state.startTime = this.state.startTime + time
    }

    public fixValues(): void {
        this.state.cookerRps = 0
        this.state.cookerRoi = 1

        this.state.sellerRps = 0
        this.state.sellerRoi = 1

        this.state.bankRps = 0
    }

    public resetValues(): void {
        this.fixValues()

        this.state.cheatedBatches = 0
        this.state.cheatedCash = 0

        this.state.cookedByClicks = 0
        this.state.soldByClicks = 0
        this.state.timePlayed = 0
        this.state.boughtUpgrades = 0

        this.state.lastSaveGame = Date.now()
        this.state.lastDeaBuildingSeize = Date.now()

        this.state.totalCooked = 0
        this.state.totalSold = 0
        this.state.totalCash = 0
        this.state.totalSpent = 0
        this.state.totalBank = 0

        this.state.startTime = Date.now()
    }
}

export const statsStore: StatsStore = new StatsStore('stats')
