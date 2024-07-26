import { statsStore } from '@/store/stats'
import { cookAndSellStore } from '@/store/cook-and-sell'
import { cookersStore } from '@/store/cookers'
import { sellersStore } from '@/store/sellers'
import { banksStore } from '@/store/banks'
import { upgradesStore } from '@/store/upgrades'
import { achievementsStore } from '@/store/achievements'
import { messagesStore } from '@/store/messages'
import Bank from '@/types/banks'
import Cooker from '@/types/cookers'
import Seller from '@/types/sellers'

export const getNumberOfUnits = (number: number): number => {
    // Divide to get SI Unit engineering style numbers (1e3,1e6,1e9, etc)
    return Math.floor(((number).toFixed(0).length - 1) / 3)
}
export const getNumberUnit = (number: number): string => {
    const units = [
        'k', //   Thousand          10^3
        'M', //   Million           10^6
        'B', //   Billion           10^9
        'T', //   Trillion          10^12
        'Qa', //  Quadrillion       10^15
        'Qi', //  Quintillion       10^18
        'Sx', //  Sextillion        10^21
        'Sp', //  Septillion        10^24
        'Oc', //  Octillion         10^27
        'Np', //  Nonillion         10^30
        'Dc', //  Decillion         10^33
        'Ud', //  Undecillion       10^36
        'Dd', //  Duodecillion      10^39
        'Td', //  Tredecillion      10^42
        'Qad', // Quattuordecillion 10^45
        'Qid', // Quindecillion     10^48
        'Sxd', // Sexdecillion      10^51
        'Spd', // Septdecillion     10^54
        'Ocd', // Octodecillion     10^57
        'Nod', // Novemdecillion    10^60
        'Vg', //  Vigintillion      10^63
        'Uvg', // Unvigintillion    10^66
    ]

    const unit = getNumberOfUnits(number)

    return units[unit - 1]
}

/**
 * Works much the same way as {@see formatPrice()}.
 *
 * Define number of decimals you want in output.
 * Only removed if using units and decimals are =.00
 *
 * @param amount
 * @param decimals
 */
export const formatCurrency = (amount: number, decimals: number): string => {
    if (amount >= 1e6) {
        const numberOfUnits = getNumberOfUnits(amount)
        const unitName = getNumberUnit(amount)

        // Calculate the remainder
        const num = amount / parseFloat('1e' + (numberOfUnits * 3))

        // Correct decimals
        if (Math.floor(num) === num) {
            decimals = 0
        }

        // Output number remainder + unitName
        return `${(new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })).format(num)} ${unitName}`
    }

    return (new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })).format(amount)
}

export const formatNumber = (amount: number, decimals?: number): string => {
    if (typeof decimals === 'undefined') {
        decimals = 2
    }
    return (new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })).format(amount)
}

export const formatRps = (rps: number): string => {
    if (rps < 1_000_000) {
        if (rps <= 10) {
            return formatNumber(rps, 2)
        }
        return formatNumber(rps, 0)
    }

    return formatCurrency(rps, 2)
}

export const formatRisk = (risk: number): string => {
    risk = Math.round(risk * 100 * 100) / 100

    if (Math.floor(risk) === (risk)) {
        return formatNumber(risk, 0)
    } else if (Math.floor(risk * 10) === (risk * 10)) {
        return formatNumber(risk, 1)
    }

    return formatNumber(risk, 2)
}

export const buyPrice = (amount: number, baseCost: number): number => {
    const price = ((amount + 1) * baseCost) * (amount + 1)
    if ((amount + 1) > 10) {
        return price * 2
    }

    return price
}

export const lastBuyPrice = (amount: number, baseCost: number): number => {
    const price = (amount * baseCost) * amount
    if (amount > 10) {
        return price * 2
    }

    return price
}

export const sellPrice = (amount: number, baseCost: number): number => {
    return lastBuyPrice(amount, baseCost) * statsStore.getState().sellReturn
}

/**
 * Auto format depending on number size
 *
 * If number is lower than 1M, don't use number units
 * If larger, use units.
 * In case of using units, only shows decimals if they are != .00
 *
 * @param amount
 */
export const formatPrice = (amount: number): string => {
    if (amount < 1_000_000) {
        return formatNumber(amount, (Math.floor(amount) === amount) ? 0 : 2)
    }

    const numberOfUnits = getNumberOfUnits(amount)
    const unitName = getNumberUnit(amount)

    // Calculate the remainder
    const num = amount / parseFloat('1e' + (numberOfUnits * 3))

    // Set decimals
    const decimals = (Math.floor(num) === num) ? 0 : 2

    // Output number remainder + unitName
    return `${(new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })).format(num)} ${unitName}`
}

export const getCookerAndSellerRisks = (data: Record<string, Cooker | Seller>): number => {
    let risk = 0
    for (const key in data) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) {
            continue
        }

        const item = data[key]
        risk += item.amount * item.risk
    }

    return risk
}

export const getUnlockedItems = (data: Record<string, Bank | Cooker | Seller>, compareRps: number): Record<string, Bank | Cooker | Seller> => {
    const items: Record<string, Bank | Cooker | Seller> = {}
    for (const key in data) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) {
            continue
        }

        const item = data[key]
        const unlockRps = item.unlockRps
        if (item.unlocked || !unlockRps || unlockRps <= compareRps) {
            items[key] = item
        }
    }

    return items
}

export const saveGame = (): void => {
    statsStore.setLastSaveGame(Date.now())
    const stores = {
        stats: btoa(statsStore.loadIntoStorage()),
        cookAndSell: btoa(cookAndSellStore.loadIntoStorage()),
        cookers: btoa(cookersStore.loadIntoStorage()),
        sellers: btoa(sellersStore.loadIntoStorage()),
        banks: btoa(banksStore.loadIntoStorage()),
        upgrades: btoa(upgradesStore.loadIntoStorage()),
        achievements: btoa(achievementsStore.loadIntoStorage()),
    }

    localStorage.setItem(`cbvc`, btoa(JSON.stringify(stores)))
}

export const fixValues = (): void => {
    statsStore.fixValues()
    cookAndSellStore.fixValues()
    cookersStore.fixValues()
    sellersStore.fixValues()
    banksStore.fixValues()
    upgradesStore.fixValues()
}

export const resetGame = (all?: boolean): void => {
    statsStore.resetValues()
    cookAndSellStore.resetValues()
    cookersStore.resetValues()
    sellersStore.resetValues()
    banksStore.resetValues()
    upgradesStore.resetValues()
    if (all) {
        achievementsStore.resetValues()
    }

    setTimeout(function() {
        upgradesStore.fixValues()

        messagesStore.resetList()
        messagesStore.addMessage(`Game reset!`)
        saveGame()
    }, 100)
}

const loadData = (data: object) => {
    if (typeof data !== 'object') {
        return
    }

    Object.entries(data).forEach(([key, item]) => {
        switch (key) {
            case 'stats':
                statsStore.loadFromStorage(item)
                break
            case 'cookAndSell':
                cookAndSellStore.loadFromStorage(item)
                break
            case 'cookers':
                cookersStore.loadFromStorage(item)
                break
            case 'sellers':
                sellersStore.loadFromStorage(item)
                break
            case 'banks':
                banksStore.loadFromStorage(item)
                break
            case 'upgrades':
                upgradesStore.loadFromStorage(item)
                break
            case 'achievements':
                achievementsStore.loadFromStorage(item)
                break
        }
    })
}

const decodeData = (data: string): Record<string, unknown> => {
    const decodedData = JSON.parse(atob(data))
    if (typeof decodedData !== 'object') {
        throw new TypeError('Corrupt data in storage')
    }

    for (const key in decodedData) {
        if (!Object.prototype.hasOwnProperty.call(decodedData, key)) {
            continue
        }

        const item = JSON.parse(atob(decodedData[key]))
        if (typeof item !== 'object') {
            throw new TypeError('Corrupt data in storage')
        }

        decodedData[key] = item
    }

    return decodedData
}

export const getFromStorage = (): Record<string, unknown> => {
    const storage = localStorage.getItem(`cbvc`)
    if (!storage) {
        throw new TypeError('No data in storage')
    }

    return decodeData(storage)
}

export const loadGame = (): void => {
    try {
        const data = getFromStorage()

        loadData(data)
    } catch (error) {
        // Error happened, no data to be loaded
        return
    }


    fixValues()
    messagesStore.resetList()
    messagesStore.addMessage(`Game loaded!`)
}

export const importGame = (data: string): void => {
    const decodedData = decodeData(data)

    loadData(decodedData)

    fixValues()
    messagesStore.resetList()
    messagesStore.addMessage(`Game imported!`)
}
