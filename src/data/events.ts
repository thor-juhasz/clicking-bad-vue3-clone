import Event, { EventAction } from "@/types/events"

export const items: Record<string, Event> = {
    e01: {
        sid: 'e01',
        name: 'cash_found_small',
        chance: 0.04,
        action: EventAction.FoundCash,
        mod: 60,
    },
    e02: {
        sid: 'e02',
        name: 'cash_found_med',
        chance: 0.005,
        action: EventAction.FoundCash,
        mod: 240,
    },
    e03: {
        sid: 'e03',
        name: 'cash_found_large',
        chance: 0.001,
        action: EventAction.FoundCash,
        mod: 640,
    },
    e04: {
        sid: 'e04',
        name: 'meth_found_small',
        chance: 0.04,
        action: EventAction.FoundMeth,
        mod: 120,
    },
    e05: {
        sid: 'e05',
        name: 'building_seized',
        chance: 0.15,
        action: EventAction.DeaSeizeBuilding,
        mod: null,
    },
    e06: {
        sid: 'e06',
        name: 'cash_lost',
        chance: 0.007,
        action: EventAction.LostCash,
        mod: 60,
    },
    e07: {
        sid: 'e07',
        name: 'rival_cash_lost',
        chance: 0.005,
        action: EventAction.RivalStoleCash,
        mod: 205,
    },
    e08: {
        sid: 'e08',
        name: 'pay_bribe',
        chance: 0.01,
        action: EventAction.PayBribe,
        mod: 125,
    },
    e09: {
        sid: 'e09',
        name: 'lose_meth',
        chance: 0.005,
        action: EventAction.LostMeth,
        mod: 125,
    },
    e10: {
        sid: 'e10',
        name: 'irs_audit_1',
        chance: 0.15,
        action: EventAction.IrsAudit,
        mod: 0.5,
    },
}
