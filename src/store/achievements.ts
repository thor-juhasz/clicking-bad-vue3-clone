import { Store } from './store-class'
import Achievement from '@/types/achievements'
import { achievements } from '@/data/achievements'
import { statsStore } from '@/store/stats'
import { cookersStore } from '@/store/cookers'
import { sellersStore } from '@/store/sellers'
import { banksStore } from '@/store/banks'
import { messagesStore } from '@/store/messages'

interface Achievements {
    items: Record<string, Achievement>
}

class AchievementsStore extends Store<Achievements> {
    protected data(): Achievements {
        return {
            items: JSON.parse(JSON.stringify(achievements)),
        }
    }

    public loadFromStorage(data: Achievements) {
        if (
            !Object.prototype.hasOwnProperty.call(data, 'items') ||
            typeof data.items !== 'object'
        ) {
            return
        }

        Object.entries(data.items).forEach(([key, item]) => {
            Object.entries(item).forEach(([itemKey, itemValue]) => {
                switch (itemKey) {
                    case 'unlocked':
                    case 'hidden':
                        if (typeof itemValue === 'boolean') {
                            this.state.items[key][itemKey] = itemValue
                        }
                        break
                }
            })
        })
    }

    public loadIntoStorage(): string {
        const data: Record<string, Pick<Achievement, 'unlocked' | 'hidden'>> = {}

        Object.entries(this.state.items).forEach(([key, item]) => {
            data[key] = {
                unlocked: item.unlocked,
                hidden: item.hidden
            }
        })

        return JSON.stringify({ items: data })
    }

    public unlockedAchievements(): Record<string, Achievement> {
        const items: Record<string, Achievement> = {}

        Object.entries(this.state.items).forEach(([key, item]) => {
            if (!item.unlocked && item.hidden) {
                return
            }

            items[key] = item
        })

        return items as Record<string, Achievement>
    }

    private setUnlocked(sid: string): void {
        this.state.items[sid].unlocked = true
        this.state.items[sid].hidden = false
    }

    public processAchievements(): void {
        Object.entries(this.state.items).forEach(([, item]) => {
            if (item.unlocked) {
                return
            }

            const propertyParts = item.property.split('.')
            switch (propertyParts[0]) {
                case 'stats':
                    this.processStats(item)
                    break
                case 'cookers':
                    this.processCookers(item)
                    break
                case 'sellers':
                    this.processSellers(item)
                    break
                case 'banks':
                    this.processBanks(item)
                    break
            }
        })
    }

    private processStats(item: Achievement): void {
        const propertyParts = item.property.split('.')
        switch (propertyParts[1]) {
            case 'cookedByClicks':
                if (statsStore.getState().cookedByClicks >= item.required) {
                    this.setUnlocked(item.sid)
                    messagesStore.addMessage(`You've earned a new achievement: <em>${item.label}</em>`)
                }
                break
            case 'totalCash':
                if (statsStore.getState().totalCash >= item.required) {
                    this.setUnlocked(item.sid)
                    messagesStore.addMessage(`You've earned a new achievement: <em>${item.label}</em>`)
                }
                break
            case 'timePlayed':
                if ((statsStore.getState().timePlayed / 1000) >= item.required) {
                    this.setUnlocked(item.sid)
                    messagesStore.addMessage(`You've earned a new achievement: <em>${item.label}</em>`)
                }
                break
            case 'totalSpent':
                if (statsStore.getState().totalSpent >= item.required) {
                    this.setUnlocked(item.sid)
                    messagesStore.addMessage(`You've earned a new achievement: <em>${item.label}</em>`)
                }
                break
            case 'cheatedCash':
                if (statsStore.getState().cheatedCash >= item.required) {
                    this.setUnlocked(item.sid)
                    messagesStore.addMessage(`You've earned a new achievement: <em>${item.label}</em>`)
                }
                break
            case 'cheatedBatches':
                if (statsStore.getState().cheatedBatches >= item.required) {
                    this.setUnlocked(item.sid)
                    messagesStore.addMessage(`You've earned a new achievement: <em>${item.label}</em>`)
                }
                break
        }
    }

    private processCookers(item: Achievement): void {
        const propertyParts = item.property.split('.')
        const cookers = cookersStore.getState().items

        for (const key in cookers) {
            if (!Object.prototype.hasOwnProperty.call(cookers, key)) {
                continue
            }

            if (key === propertyParts[1]) {
                switch (propertyParts[2]) {
                    case 'amount':
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
        const propertyParts = item.property.split('.')
        const sellers = sellersStore.getState().items

        for (const key in sellers) {
            if (!Object.prototype.hasOwnProperty.call(sellers, key)) {
                continue
            }

            if (key === propertyParts[1]) {
                switch (propertyParts[2]) {
                    case 'amount':
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
        const propertyParts = item.property.split('.')
        const banks = banksStore.getState().items

        for (const key in banks) {
            if (!Object.prototype.hasOwnProperty.call(banks, key)) {
                continue
            }

            if (key === propertyParts[1]) {
                switch (propertyParts[2]) {
                    case 'amount':
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
        Object.entries(this.state.items).forEach(([, item]) => {
            item.unlocked = false
            if (['a101', 'a102'].includes(item.sid)) {
                item.hidden = true
            }
        })
    }
}

export const achievementsStore: AchievementsStore = new AchievementsStore('achievements')
