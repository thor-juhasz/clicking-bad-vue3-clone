import { Store } from './store-class'

export enum MessageType {
    Generic = 'generic',
    Good = 'good',
    Bad = 'bad',
    Error = 'error',
}

export interface Message extends Object {
    id: string
    type: MessageType
    message: string
    time: number
}

interface Messages extends Object {
    items: Array<Message>
}

class MessagesStore extends Store<Messages> {
    protected data(): Messages {
        return {
            items: [],
        }
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

    protected valid(data: Record<any, any>): boolean {
        if (
            typeof data !== "object" ||
            !Object.prototype.hasOwnProperty.call(data, 'items') ||
            typeof data.items !== "object"
        ) {
            return false
        }

        const values: Record<any, any> = Object.values(data.items)
        const filtered = values.filter((item: any) => {
            return (
                typeof item === "object" &&
                Object.prototype.hasOwnProperty.call(item, 'type') &&
                Object.prototype.hasOwnProperty.call(item, 'message') &&
                typeof item.type === "string" &&
                typeof item.message === "string"
            )
        })

        return Object.keys(values).length === filtered.length
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
}

export const messagesStore: MessagesStore = new MessagesStore('messages')
