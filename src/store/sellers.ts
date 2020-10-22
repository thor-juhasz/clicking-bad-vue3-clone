import { Store } from "./store-class"
import Seller from "@/types/sellers"
import { sellers } from "@/data/sellers.ts"
import { cookAndSellStore } from "@/store/cook-and-sell"
import { statsStore } from "@/store/stats"
import { messagesStore } from "@/store/messages"
import {
    buyPrice,
    formatPrice,
    getCookerAndSellerRisks,
    getUnlockedItems,
    sellPrice,
} from "@/functions"

interface Sellers extends Object {
    items: Record<string, Seller>
}

class SellersStore extends Store<Sellers> {
    protected data(): Sellers {
        return {
            items: JSON.parse(JSON.stringify(sellers)),
        }
    }

    public loadFromStorage(data: Sellers) {
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
                    case "unlocked":
                        if (typeof itemValue === "boolean") {
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
                unlocked: item.unlocked,
            }
        }

        return JSON.stringify({ items: data })
    }

    public unlockedSellers(): Record<string, Seller> {
        return getUnlockedItems(this.state.items, statsStore.getState().sellerRps) as Record<string, Seller>
    }

    public modifyAmount(sid: string, amount: number): void {
        this.state.items[sid].amount = this.state.items[sid].amount + amount
    }

    public modifySellerRps(sid: string, amount: number): void {
        this.state.items[sid].rps = this.state.items[sid].rps + amount
    }

    public modifySellerRisk(sid: string, amount: number): void {
        this.state.items[sid].risk = this.state.items[sid].risk + amount
    }

    public getRisks(): number {
        return getCookerAndSellerRisks(this.state.items)
    }

    public buySeller(sid: string): void {
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
        statsStore.modifySellerRps(item.rps)

        const priceText = formatPrice(price)
        messagesStore.addMessage(`You have purchased a ${item.label} for $${priceText}`)
        this.modifyAmount(item.sid, 1)
    }

    public sellSeller(sid: string): void {
        const item = this.state.items[sid]
        if (!item || item.amount <= 0) {
            return
        }

        const price = sellPrice(1, item.baseCost)

        cookAndSellStore.modifyCash(price)
        statsStore.modifyTotalCash(price)
        statsStore.modifySellerRps(-Math.abs(item.rps))

        const priceText = formatPrice(price)
        messagesStore.addMessage(`You sold a ${item.label} for $${priceText}`)
        this.modifyAmount(item.sid, -Math.abs(1))
    }

    public fixValues(): void {
        let sellerRps = 0
        for (const key in this.state.items) {
            if (!Object.prototype.hasOwnProperty.call(this.state.items, key)) {
                continue
            }

            const item = this.state.items[key]
            item.rps = sellers[key].rps
            item.risk = sellers[key].risk
            sellerRps += (item.rps * item.amount)
        }

        statsStore.setSellerRps(sellerRps)
    }

    public resetValues(): void {
        for (const key in this.state.items) {
            if (!Object.prototype.hasOwnProperty.call(this.state.items, key)) {
                continue
            }

            const item = this.state.items[key]
            item.amount = 0
            item.rps = sellers[key].rps
            item.risk = sellers[key].risk
            item.unlocked = sellers[key].unlocked
        }
    }
}

export const sellersStore: SellersStore = new SellersStore('sellers')
