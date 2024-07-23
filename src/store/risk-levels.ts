import { readonly } from 'vue'
import RiskLevel from '@/types/risk-levels'
import { riskLevels } from '@/data/risk-levels'

interface RiskLevels {
    items: Record<string, RiskLevel>
}

class RiskLevelsStore<T extends RiskLevels> {
    protected state: T

    constructor() {
        this.state = this.data() as T
    }

    protected data(): T {
        return {
            items: JSON.parse(JSON.stringify(riskLevels)),
        } as T
    }

    public getState(): T {
        return readonly(this.state) as T
    }
}

export const riskLevelsStore: RiskLevelsStore<RiskLevels> = new RiskLevelsStore()
