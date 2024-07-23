import { reactive, readonly } from 'vue'

export abstract class Store<T extends Record<string, any>> {
    protected module: string
    protected state: T

    constructor(name: string) {
        this.module = name
        this.state = reactive(this.data()) as T
    }

    protected abstract data(): T

    public abstract loadFromStorage(data: T): void

    public abstract loadIntoStorage(): string

    public getState(): T {
        return readonly(this.state) as T
    }
}
