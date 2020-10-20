import { reactive, readonly } from "vue"
import { Message, MessageType } from "@/types/messages"

interface Messages extends Object {
    items: Array<Message>
}

class MessagesStore<T extends Messages> {
    protected state: T

    constructor() {
        this.state = reactive(this.data()) as T
    }

    protected data(): T {
        return {
            items: [] as Message[],
        } as T
    }

    public getState(): T {
        return readonly(this.state) as T
    }

    public loadFromStorage(data: Messages) {
        if (
            !Object.prototype.hasOwnProperty.call(data, 'items') ||
            typeof data.items !== "object" ||
            !Array.isArray(data.items)
        ) {
            return
        }

        this.state.items = data.items
    }

    public loadIntoStorage(): string {
        return JSON.stringify({ items: this.state.items })
    }

    public updateMessageId(id: string, newId: string): void {
        for (const message of this.state.items) {
            if (message.id !== id) {
                continue
            }

            message.id = newId
            return
        }
    }

    public addMessage(message: string): void {
        const msg = {
            id: '_' + Math.random().toString(36).substr(2, 9),
            type: MessageType.Generic,
            message: message,
            time: Date.now(),
        } as Message

        this.state.items.push(msg)
        this.pruneMessages()
    }

    public addGoodMessage(message: string): void {
        const msg = {
            id: '_' + Math.random().toString(36).substr(2, 9),
            type: MessageType.Good,
            message: message,
            time: Date.now(),
        } as Message

        this.state.items.push(msg)
        this.pruneMessages()
    }

    public addBadMessage(message: string): void {
        const msg = {
            id: '_' + Math.random().toString(36).substr(2, 9),
            type: MessageType.Bad,
            message: message,
            time: Date.now(),
        } as Message

        this.state.items.push(msg)
        this.pruneMessages()
    }

    public addErrorMessage(message: string): void {
        const msg = {
            id: '_' + Math.random().toString(36).substr(2, 9),
            type: MessageType.Error,
            message: message,
            time: Date.now(),
        } as Message

        this.state.items.push(msg)
        this.pruneMessages()
    }

    private pruneMessages(): void {
        while (this.state.items.length > 20) {
            this.state.items.shift()
        }
    }

    public resetList(): void {
        this.state.items.length = 0
        this.state.items = []
    }
}

export const messagesStore: MessagesStore<Messages> = new MessagesStore()
