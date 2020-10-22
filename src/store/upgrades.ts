import { Store } from './store-class'
import { upgrades } from '@/data/upgrades.ts'
import { cookAndSellStore } from "@/store/cook-and-sell"
import { sellersStore } from "@/store/sellers"
import { cookersStore } from "@/store/cookers"
import { banksStore } from "@/store/banks"
import Upgrade, { UpgradeAction } from "@/types/upgrades"
import { statsStore } from "@/store/stats"
import { messagesStore } from "@/store/messages"
import { formatPrice } from "@/functions"

interface Upgrades extends Object {
    items: Record<string, Upgrade>
}

class UpgradesStore extends Store<Upgrades> {
    protected data(): Upgrades {
        return {
            items: JSON.parse(JSON.stringify(upgrades)),
        }
    }

    public loadFromStorage(data: Upgrades) {
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
                    case "purchased":
                    case "hidden":
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
                purchased: item.purchased,
                hidden: item.hidden
            }
        }

        return JSON.stringify({ items: data })
    }

    public unlockedUpgrades(): Record<string, Upgrade> {
        const items: Record<string, Upgrade> = {}
        for (const key in this.state.items) {
            if (!Object.prototype.hasOwnProperty.call(this.state.items, key)) {
                continue
            }

            const item = this.state.items[key]
            if (item.hidden && !item.purchased) {
                continue
            }

            if (key === 'u70') {
                items[key] = item
                continue
            }

            const preReq = item.preReq
            if (!preReq || this.state.items[preReq].purchased) {
                items[key] = item
            }
        }

        return items
    }

    public buyUpgrade(sid: string): void {
        const item = this.state.items[sid]
        if (!item || cookAndSellStore.getState().cash < item.cost) {
            return
        }

        cookAndSellStore.modifyCash(-Math.abs(item.cost))
        statsStore.modifyTotalSpent(item.cost)
        statsStore.modifyBoughtUpgrades(1)

        const priceText = formatPrice(item.cost)
        this.state.items[sid].purchased = true
        messagesStore.addMessage(`You've unlocked ${item.label} for $${priceText}`)

        UpgradesStore.processUpgrade(item)
    }

    private static processUpgrade(item: Upgrade): void {
        if (item.action === null) {
            return
        }

        switch (item.action) {
            case UpgradeAction.Make:
                statsStore.modifyCookerRoi(item.mod)
                break
            case UpgradeAction.Sell:
                statsStore.modifySellerRoi(item.mod)
                break
            case UpgradeAction.BatchCost:
                cookAndSellStore.modifyBatchPurity(item.mod)
                break
            case UpgradeAction.MakeMultiplier:
                cookAndSellStore.modifyCookRpsMultiplier(item.mod)
                break
            case UpgradeAction.SellMultiplier:
                cookAndSellStore.modifySellRpsMultiplier(item.mod)
                break
            default:
                UpgradesStore.processOtherUpgrade(item)
                break
        }
    }

    private static processOtherUpgrade(item: Upgrade): void {
        if (item.action === null) {
            return
        }

        const parts = item.action.split('.')
        switch (parts[0]) {
            case 'cookers':
                UpgradesStore.processCookers(item)
                break
            case 'sellers':
                UpgradesStore.processSellers(item)
                break
            case 'banks':
                UpgradesStore.processBank(item)
                break
        }
    }

    private static processCookers(item: Upgrade): void {
        if (item.action === null) {
            return
        }

        const parts = item.action.split('.')
        const cooker = cookersStore.getState().items[parts[1]]

        if (!cooker) {
            return
        }

        if (parts[2] === 'rps') {
            cookersStore.modifyCookerRps(parts[1], item.mod)
            statsStore.modifyCookerRps(item.mod)
        }
        if (parts[2] === 'risk') {
            cookersStore.modifyCookerRisk(parts[1], item.mod)
        }
    }

    private static processSellers(item: Upgrade): void {
        if (item.action === null) {
            return
        }

        const parts = item.action.split('.')
        const seller = sellersStore.getState().items[parts[1]]

        if (!seller) {
            return
        }

        if (parts[2] === 'rps') {
            sellersStore.modifySellerRps(parts[1], item.mod)
            statsStore.modifySellerRps(item.mod)
        }
        if (parts[2] === 'risk') {
            sellersStore.modifySellerRisk(parts[1], item.mod)
        }
    }

    private static processBank(item: Upgrade): void {
        if (item.action === null) {
            return
        }

        const parts = item.action.split('.')
        const bank = banksStore.getState().items[parts[1]]

        if (!bank) {
            return
        }

        if (parts[2] === 'rps') {
            banksStore.modifyBankRps(parts[1], item.mod)
            statsStore.modifyBankRps(item.mod)
        }
    }

    public resetValues(): void {
        for (const key in this.state.items) {
            if (!Object.prototype.hasOwnProperty.call(this.state.items, key)) {
                continue
            }

            const item = this.state.items[key]
            item.purchased = ['u28', 'u38'].includes(item.sid)
            if (['u48', 'u70'].includes(item.sid)) {
                item.hidden = true
            }
        }
    }

    public fixValues(): void {
        let boughtUpgrades = 0
        for (const key in this.state.items) {
            if (!Object.prototype.hasOwnProperty.call(this.state.items, key)) {
                continue
            }

            const item = this.state.items[key]
            if (!item.purchased) {
                continue
            }

            boughtUpgrades++
            UpgradesStore.processUpgrade(item)
        }

        statsStore.setBoughtUpgrades(boughtUpgrades)
    }

    public applyThankYou(): void {
        const item = this.state.items.u70
        if (!item.purchased) {
            cookAndSellStore.modifyBatchPurity(item.mod)
            messagesStore.addGoodMessage(`You have unlocked the "Thank You" hidden upgrade`)
            item.purchased = true
            item.hidden = false

            this.buyUpgrade(item.sid)
        }
    }
}

export const upgradesStore: UpgradesStore = new UpgradesStore('upgrades')
