import { readonly } from "vue"
import RiskLevel from "@/types/risk-levels"
import { items as riskLevels } from "@/data/risk-levels"

interface RiskLevels extends Object {
    items: Record<string, RiskLevel>
}

class RiskLevelsStore<T extends RiskLevels> {
    protected state: T

    constructor() {
        this.state = this.data() as T
    }

    protected data(): T {
        return {
            items: riskLevels,
        } as T
    }

    public getState(): T {
        return readonly(this.state) as T
    }
}

export const riskLevelsStore: RiskLevelsStore<RiskLevels> = new RiskLevelsStore()
