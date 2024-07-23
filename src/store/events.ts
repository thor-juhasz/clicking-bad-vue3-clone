import { readonly } from 'vue'
import Event, { EventAction } from '@/types/events'
import { events } from '@/data/events'
import { statsStore } from '@/store/stats'
import { cookAndSellStore } from '@/store/cook-and-sell'
import { cookersStore } from '@/store/cookers'
import { sellersStore } from '@/store/sellers'
import { messagesStore } from '@/store/messages'
import { formatCurrency, formatNumber } from '@/functions'

interface Events {
    items: Record<string, Event>
}

class EventsStore<T extends Events> {
    protected state: T

    constructor() {
        this.state = this.data() as T
    }

    protected data(): T {
        return {
            items: JSON.parse(JSON.stringify(events)),
        } as T
    }

    public getState(): T {
        return readonly(this.state) as T
    }

    public runEvent(sid: string): void {
        const item = this.state.items[sid]
        if (item) {
            switch (item.action) {
                case EventAction.FoundCash:
                    if (item.mod) {
                        EventsStore.eventFoundCash(item.mod)
                    }
                    break
                case EventAction.FoundMeth:
                    if (item.mod) {
                        EventsStore.eventFoundMeth(item.mod)
                    }
                    break
                case EventAction.LostCash:
                    if (item.mod) {
                        EventsStore.eventLostCash(item.mod)
                    }
                    break
                case EventAction.LostMeth:
                    if (item.mod) {
                        EventsStore.eventLostMeth(item.mod)
                    }
                    break
                case EventAction.RivalStoleCash:
                    if (item.mod) {
                        EventsStore.eventRivalStoleCash(item.mod)
                    }
                    break
                case EventAction.PayBribe:
                    if (item.mod) {
                        EventsStore.eventPayBribe(item.mod)
                    }
                    break
                case EventAction.DeaSeizeBuilding:
                    EventsStore.eventDeaSeizeBuilding()
                    break
                case EventAction.IrsAudit:
                    if (item.mod) {
                        EventsStore.eventIrsAudit(item.mod)
                    }
                    break
            }
        }
    }

    private static eventFoundCash(mod: number): void {
        let amount = (statsStore.getState().sellerRps * statsStore.getState().cookerRoi) * mod
        if (amount < 100) {
            amount = 100
        }

        let cashFound = formatCurrency(amount, 2)
        if (amount < 1_000_000) {
            cashFound = formatNumber(amount, 2)
        }

        let message = 'You found some extra cash hidden in a shoe box, worth $%amount%!'
        if (amount > 10_000_000_000) {
            message = 'A mystery benefactor has contributed $%amount% to your cause'
        } else if (amount > 10_000_000) {
            message = 'You found a truck load of cash, containing $%amount% inside!'
        } else if (amount > 100_000) {
            message = 'You found a briefcase with $%amount% inside!'
        }

        cookAndSellStore.modifyCash(amount)
        messagesStore.addGoodMessage(message.replace('%amount%', cashFound))
    }

    private static eventFoundMeth(mod: number): void {
        let amount = statsStore.getState().cookerRps * mod
        if (amount < 100) {
            amount = 100
        }

        let methFound = formatCurrency(amount, 2)
        if (amount < 1_000_000) {
            methFound = formatNumber(amount, 0)
        }

        cookAndSellStore.modifyBatches(amount)
        messagesStore.addGoodMessage(`You found an extra barrel of meth, with ${methFound}`)
    }

    private static eventLostCash(mod: number): void {
        const amount = EventsStore.eventCalcLoseCashAmount(mod)
        if (amount < 1) {
            return
        }

        let cashLost = formatCurrency(amount, 2)
        if (amount < 1_000_000) {
            cashLost = formatNumber(amount, 2)
        }

        cookAndSellStore.modifyCash(-Math.abs(amount))
        messagesStore.addBadMessage(`According to accounting, $${cashLost} has been "lost"`)
    }

    private static eventLostMeth(mod: number): void {
        let amount = statsStore.getState().cookerRps * mod
        if (amount < 1) {
            return
        }
        if (amount > cookAndSellStore.getState().batches) {
            amount = cookAndSellStore.getState().batches
        }

        let methLost = formatCurrency(amount, 2)
        if (amount < 1_000_000) {
            methLost = formatNumber(amount, 2)
        }

        cookAndSellStore.modifyBatches(-Math.abs(amount))
        messagesStore.addBadMessage(`About ${methLost} batches of meth have gone missing...`)
    }

    private static eventRivalStoleCash(mod: number): void {
        const amount = EventsStore.eventCalcLoseCashAmount(mod)
        if (amount < 1) {
            return
        }

        let cashStolen = formatCurrency(amount, 2)
        if (amount < 1_000_000) {
            cashStolen = formatNumber(amount, 2)
        }

        cookAndSellStore.modifyCash(-Math.abs(amount))
        messagesStore.addBadMessage(`A rival cartel has hijacked a sale worth $${cashStolen}!`)
    }

    private static eventPayBribe(mod: number): void {
        const amount = EventsStore.eventCalcLoseCashAmount(mod)
        if (amount < 1) {
            return
        }

        let cashPayoff = formatCurrency(amount, 2)
        if (amount < 1_000_000) {
            cashPayoff = formatNumber(amount, 2)
        }

        cookAndSellStore.modifyCash(-Math.abs(amount))
        messagesStore.addBadMessage(`You had to pay off a government official with $${cashPayoff}`)
    }

    private static eventCalcLoseCashAmount(mod: number): number {
        let amount = (statsStore.getState().sellerRps * cookAndSellStore.getState().batchPurity) * mod
        amount -= cookAndSellStore.getState().bank

        if (amount > cookAndSellStore.getState().cash) {
            amount = cookAndSellStore.getState().cash
        }

        return amount
    }

    private static eventDeaSeizeCash(mod: number): void {
        let amount = cookAndSellStore.getState().cash * mod
        amount -= cookAndSellStore.getState().bank
        if (amount < 1) {
            messagesStore.addGoodMessage('The DEA was unable to seize any cash')
            return
        }

        let cashSeized = formatCurrency(amount, 2)
        if (amount < 1_000_000) {
            cashSeized = formatNumber(amount, 2)
        }

        cookAndSellStore.modifyCash(-Math.abs(amount))
        messagesStore.addBadMessage(`The DEA has seized $${cashSeized}!`)
    }

    private static eventDeaSeizeBuilding(): void {
        const now = Date.now()
        const risk = cookersStore.getRisks() + sellersStore.getRisks()

        if (risk > Math.random()) {
            const lastSeize = statsStore.getState().lastDeaBuildingSeize
            if ((now - lastSeize) < 240_000) {
                messagesStore.addGoodMessage('You narrowly avoided an altercation with the DEA')
                return
            }

            const picks = []
            for (const key in cookersStore.getState().items) {
                if (!Object.prototype.hasOwnProperty.call(cookersStore.getState().items, key)) {
                    continue
                }

                const item = cookersStore.getState().items[key]
                if (item.amount > 0 && item.risk > 0.001) {
                    picks.push(item)
                }
            }

            if (picks.length < 1) {
                messagesStore.addGoodMessage('The DEA attempted to seize something, but they couldn\'t find anything to seize')
                return
            }

            const pick = picks[Math.floor(Math.random() * picks.length)]
            if (pick) {
                cookersStore.modifyAmount(pick.sid, -1)
                statsStore.setLastDeaBuildingSeize(now)
                EventsStore.eventDeaSeizeCash(0.1)
                messagesStore.addBadMessage(`The DEA has seized a ${pick.label}, it's a sad day for meth addicts everywhere :(`)

                return
            }
        }

        messagesStore.addGoodMessage('You were able to negotiate your way out of the DEA raid')
    }

    private static eventIrsAudit(mod: number): void {
        const risk = cookAndSellStore.getIrsRisk()
        if (risk < Math.random()) {
            messagesStore.addGoodMessage('You were able to avoid an IRS audit')
            return
        }

        const cash = cookAndSellStore.getState().cash
        const bank = cookAndSellStore.getState().bank
        const amount = (cash * mod) - bank
        if (amount < 1) {
            messagesStore.addGoodMessage('The IRS was unable to find any ill-gotten cash to seize')
            return
        }

        cookAndSellStore.modifyCash(-Math.abs(amount))
        messagesStore.addBadMessage('The IRS has confiscated $${formatCurrency(amount, 2)} of your funds')
    }
}

export const eventsStore: EventsStore<Events> = new EventsStore()
