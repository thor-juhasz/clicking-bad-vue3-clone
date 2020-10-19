import { Store } from "./store-class"
import Achievement from "@/types/achievements"
import { items as achievements } from '@/data/achievements'
import { statsStore } from "@/store/stats"
import { cookersStore } from "@/store/cookers"
import { sellersStore } from "@/store/sellers"
import { banksStore } from "@/store/banks"
import { messagesStore } from "@/store/messages"

interface Achievements extends Object {
    items: Record<string, Achievement>
}

class AchievementsStore extends Store<Achievements> {
    protected data(): Achievements {
        return {
            items: achievements,
        }
    }

    public loadFromStorage(data: Achievements) {
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
                    case "unlocked":
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
                unlocked: item.unlocked,
                hidden: item.hidden
            }
        }

        return JSON.stringify({ items: data })
    }

    public unlockedAchievements(): Record<string, Achievement> {
        const items: Record<string, Achievement> = {}
        for (const key in this.state.items) {
            if (!Object.prototype.hasOwnProperty.call(this.state.items, key)) {
                continue
            }

            const item = this.state.items[key]
            if (!item.unlocked && item.hidden) {
                continue
            }

            items[key] = item
        }

        return items as Record<string, Achievement>
    }

    private setUnlocked(sid: string): void {
        this.state.items[sid].unlocked = true
    }

    public processAchievements(): void {
        for (const key in this.state.items) {
            if (!Object.prototype.hasOwnProperty.call(this.state.items, key)) {
                continue
            }

            const item = this.state.items[key]
            if (item.unlocked) {
                continue
            }

            const propertyParts = item.property.split(".")
            switch (propertyParts[0]) {
                case "stats":
                    this.processStats(item)
                    break
                case "cookers":
                    this.processCookers(item)
                    break
                case "sellers":
                    this.processSellers(item)
                    break
                case "banks":
                    this.processBanks(item)
                    break
            }
        }
    }

    private processStats(item: Achievement): void {
        const propertyParts = item.property.split(".")
        switch (propertyParts[1]) {
            case "cookedByClicks":
                if (statsStore.getState().cookedByClicks >= item.required) {
                    this.setUnlocked(item.sid)
                    messagesStore.addMessage(`You've earned a new achievement: <em>${item.label}</em>`)
                }
                break
            case "totalCash":
                if (statsStore.getState().totalCash >= item.required) {
                    this.setUnlocked(item.sid)
                    messagesStore.addMessage(`You've earned a new achievement: <em>${item.label}</em>`)
                }
                break
            case "timePlayed":
                if ((statsStore.getState().timePlayed / 1000) >= item.required) {
                    this.setUnlocked(item.sid)
                    messagesStore.addMessage(`You've earned a new achievement: <em>${item.label}</em>`)
                }
                break
            case "totalSpent":
                if (statsStore.getState().totalSpent >= item.required) {
                    this.setUnlocked(item.sid)
                    messagesStore.addMessage(`You've earned a new achievement: <em>${item.label}</em>`)
                }
                break
            case "cheatedCash":
                if (statsStore.getState().cheatedCash >= item.required) {
                    this.setUnlocked(item.sid)
                    messagesStore.addMessage(`You've earned a new achievement: <em>${item.label}</em>`)
                }
                break
            case "cheatedBatches":
                if (statsStore.getState().cheatedBatches >= item.required) {
                    this.setUnlocked(item.sid)
                    messagesStore.addMessage(`You've earned a new achievement: <em>${item.label}</em>`)
                }
                break
        }
    }

    private processCookers(item: Achievement): void {
        const propertyParts = item.property.split(".")
        const cookers = cookersStore.getState().items

        for (const key in cookers) {
            if (!Object.prototype.hasOwnProperty.call(cookers, key)) {
                continue
            }

            if (key === propertyParts[1]) {
                switch (propertyParts[2]) {
                    case "amount":
                        if (cookers[key].amount >= item.required) {
                            this.setUnlocked(item.sid)
                            messagesStore.addMessage(`You've earned a new achievement: <em>${item.label}</em>`)
                        }
                        break
                }
            }
        }
    }

    private processSellers(item: Achievement): void {
        const propertyParts = item.property.split(".")
        const sellers = sellersStore.getState().items

        for (const key in sellers) {
            if (!Object.prototype.hasOwnProperty.call(sellers, key)) {
                continue
            }

            if (key === propertyParts[1]) {
                switch (propertyParts[2]) {
                    case "amount":
                        if (sellers[key].amount >= item.required) {
                            this.setUnlocked(item.sid)
                            messagesStore.addMessage(`You've earned a new achievement: <em>${item.label}</em>`)
                        }
                        break
                }
            }
        }
    }

    private processBanks(item: Achievement): void {
        const propertyParts = item.property.split(".")
        const banks = banksStore.getState().items

        for (const key in banks) {
            if (!Object.prototype.hasOwnProperty.call(banks, key)) {
                continue
            }

            if (key === propertyParts[1]) {
                switch (propertyParts[2]) {
                    case "amount":
                        if (banks[key].amount >= item.required) {
                            this.setUnlocked(item.sid)
                            messagesStore.addMessage(`You've earned a new achievement: <em>${item.label}</em>`)
                        }
                        break
                }
            }
        }
    }

    public resetValues(): void {
        for (const key in this.state.items) {
            if (!Object.prototype.hasOwnProperty.call(this.state.items, key)) {
                continue
            }

            const item = this.state.items[key]
            item.unlocked = false
            if (['a101', 'a102'].includes(item.sid)) {
                item.hidden = true
            }
        }
    }
}

export const achievementsStore: AchievementsStore = new AchievementsStore('achievements')
