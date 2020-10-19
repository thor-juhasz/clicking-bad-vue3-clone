import { Store } from './store-class'

interface CookAndSell extends Object {
    batches: number
    cash: number
    bank: number

    cookRpsMultiplier: number
    sellRpsMultiplier: number

    batchPurity: number
}

class CookAndSellStore extends Store<CookAndSell> {
    protected data(): CookAndSell {
        return {
            batches: 0,
            cash: 0,
            bank: 0,

            cookRpsMultiplier: 0,
            sellRpsMultiplier: 0,

            batchPurity: 0.5,
        }
    }

    public loadFromStorage(data: CookAndSell) {
        for (const key in data) {
            if (!Object.prototype.hasOwnProperty.call(data, key)) {
                continue
            }

            switch (key) {
                case "batches":
                case "cash":
                case "bank":
                    if (typeof data[key] === "number") {
                        this.state[key] = data[key]
                    }
                    break
            }
        }
    }

    public loadIntoStorage(): string {
        return JSON.stringify({
            batches: this.state.batches,
            cash: this.state.cash,
            bank: this.state.bank,
        })
    }

    public modifyBatches(amount: number): void {
        this.state.batches = this.state.batches + amount
    }

    public modifyCash(amount: number) {
        this.state.cash = this.state.cash + amount
    }

    public modifyBank(amount: number) {
        this.state.bank = this.state.bank + amount
    }

    public modifyCookRpsMultiplier(amount: number) {
        this.state.cookRpsMultiplier = this.state.cookRpsMultiplier + amount
    }

    public modifySellRpsMultiplier(amount: number) {
        this.state.sellRpsMultiplier = this.state.sellRpsMultiplier + amount
    }

    public modifyBatchPurity(amount: number) {
        this.state.batchPurity = this.state.batchPurity + amount
    }

    public getIrsRisk(): number {
        if (this.state.cash <= 20_000) {
            return 0
        }

        if (this.state.bank > this.state.cash) {
            return 0
        }

        return 0.5 - (this.state.bank / this.state.cash)
    }

    public fixValues(): void {
        this.state.batchPurity = 0.5
        this.state.cookRpsMultiplier = 0
        this.state.sellRpsMultiplier = 0
    }

    public resetValues(): void {
        this.fixValues()

        this.state.batches = 0
        this.state.cash = 0
        this.state.bank = 0
    }
}

export const cookAndSellStore: CookAndSellStore = new CookAndSellStore('cook_and_sell')
