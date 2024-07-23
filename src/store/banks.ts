import { Store } from './store-class'
import Bank from '@/types/banks'
import { banks } from '@/data/banks'
import { statsStore } from '@/store/stats'
import {
    buyPrice,
    formatPrice,
    getUnlockedItems,
    sellPrice,
} from '@/functions'
import { cookAndSellStore } from '@/store/cook-and-sell'
import { messagesStore } from '@/store/messages'

interface Banks {
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
            typeof data.items !== 'object'
        ) {
            return
        }

        Object.entries(data.items).forEach(([key, item]) => {
            Object.entries(item).forEach(([itemKey, itemValue]) => {
                switch (itemKey) {
                    case 'amount':
                        if (typeof itemValue === 'number') {
                            this.state.items[key][itemKey] = itemValue
                        }
                        break
                }
            })
        })
    }

    public loadIntoStorage(): string {
        const data: Record<string, Pick<Bank, 'amount' | 'unlocked'>> = {}
        Object.entries(this.state.items).forEach(([key, item]) => {
            data[key] = {
                amount: item.amount,
                unlocked: item.unlocked
            }
        })

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
        Object.entries(this.state.items).forEach(([key, item]) => {
            item.rps = banks[key].rps
            banksRps += (item.rps * item.amount)
        })

        statsStore.setBankRps(banksRps)
    }

    public resetValues(): void {
        Object.entries(this.state.items).forEach(([key, item]) => {
            item.amount = 0
            item.rps = banks[key].rps
        })
    }
}

export const banksStore: BanksStore = new BanksStore('banks')
