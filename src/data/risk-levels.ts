import RiskLevel from '@/types/risk-levels'

export const riskLevels: Record<string, RiskLevel> = {
    r01: {
        level: 0.000_1,
        label: 'nearly impossible',
        color: '#1b5a1b',
    },
    r02: {
        level: 0.005,
        label: 'super low',
        color: '#1b5a1b',
    },
    r03: {
        level: 0.05,
        label: 'very low',
        color: '#1b5a1b',
    },
    r04: {
        level: 0.2,
        label: 'low',
        color: '#1b5a1b',
    },
    r05: {
        level: 0.35,
        label: 'moderate',
        color: '#e59150',
    },
    r06: {
        level: 0.50,
        label: 'high',
        color: '#aa2020',
    },
    r07: {
        level: 0.7,
        label: 'very high',
        color: '#aa2020',
    },
    r08: {
        level: 0.9,
        label: 'nearly certain (!)',
        color: '#aa2020',
    },
    r09: {
        level: 100_000_000_000_000_000,
        label: 'certain (!!)',
        color: '#aa2020',
    },
}
