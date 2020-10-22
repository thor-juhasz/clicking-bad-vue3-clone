import { Store } from "./store-class"
import Bank from "@/types/banks"
import { banks } from '@/data/banks.ts'
import { statsStore } from "@/store/stats"
import {
    buyPrice,
    formatPrice,
    getUnlockedItems,
    sellPrice,
} from "@/functions"
import { cookAndSellStore } from "@/store/cook-and-sell"
import { messagesStore } from "@/store/messages"

interface Banks extends Object {
    items: Record<string, Bank>
}

class BanksStore extends Store<Banks> {
    protected data(): Banks {
        return {
            items: JSON.parse(JSON.stringify(banks)),
        }
    }

    public loadFromStorage(data: Banks) {
        if (
            !Object.prototype.hasOwnProperty.call(data, 'items') ||
            typeof data.items !== "object"
        ) {
            return
        }

        for (const key in data.items) {
            if (!Object.prototype.hasOwnProperty.call(data.items, key)) {
                continue
            }

            const item: any = data.items[key]
            for (const itemKey in item) {
                if (!Object.prototype.hasOwnProperty.call(item, itemKey)) {
                    continue
                }

                const itemValue: any = item[itemKey]
                switch (itemKey) {
                    case "amount":
                        if (typeof itemValue === "number") {
                            this.state.items[key][itemKey] = itemValue
                        }
                        break
                }
            }
        }
    }

    public loadIntoStorage(): string {
        const data: any = {}
        for (const key in this.state.items) {
            if (!Object.prototype.hasOwnProperty.call(this.state.items, key)) {
                continue
            }

            const item = this.state.items[key]
            data[key] = {
                amount: item.amount,
            }
        }

        return JSON.stringify({ items: data })
    }

    public unlockedBanks(): Record<string, Bank> {
        return getUnlockedItems(this.state.items, statsStore.getState().sellerRps) as Record<string, Bank>
    }

    public modifyAmount(sid: string, amount: number): void {
        this.state.items[sid].amount = this.state.items[sid].amount + amount
    }

    public modifyBankRps(sid: string, amount: number): void {
        this.state.items[sid].rps = this.state.items[sid].rps + amount
    }

    public buyBank(sid: string): void {
        const item = this.state.items[sid]
        if (!item) {
            return
        }

        const price = buyPrice(item.amount, item.baseCost)

        if (cookAndSellStore.getState().cash < price) {
            return
        }

        cookAndSellStore.modifyCash(-Math.abs(price))
        statsStore.modifyTotalSpent(price)
        statsStore.modifyBankRps(item.rps)

        const priceText = formatPrice(price)

        messagesStore.addMessage(`You've purchased a ${item.label} for $${priceText}`)
        this.modifyAmount(item.sid, 1)
    }

    public sellBank(sid: string): void {
        const item = this.state.items[sid]
        if (!item || item.amount <= 0) {
            return
        }

        const price = sellPrice(item.amount, item.baseCost)

        cookAndSellStore.modifyCash(price)
        statsStore.modifyTotalCash(price)
        statsStore.modifyBankRps(-Math.abs(item.rps))

        const priceText = formatPrice(price)
        messagesStore.addMessage(`You sold a ${item.label} for $${priceText}`)
        this.modifyAmount(item.sid, -Math.abs(1))
    }

    public fixValues(): void {
        let banksRps = 0
        for (const key in this.state.items) {
            if (!Object.prototype.hasOwnProperty.call(this.state.items, key)) {
                continue
            }

            const item = this.state.items[key]
            item.rps = banks[key].rps
            banksRps += (item.rps * item.amount)
        }

        statsStore.setBankRps(banksRps)
    }

    public resetValues(): void {
        for (const key in this.state.items) {
            if (!Object.prototype.hasOwnProperty.call(this.state.items, key)) {
                continue
            }

            const item = this.state.items[key]
            item.amount = 0
            item.rps = banks[key].rps
        }
    }
}

export const banksStore: BanksStore = new BanksStore('banks')
