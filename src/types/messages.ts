export enum MessageType {
    Generic = 'generic',
    Good = 'good',
    Bad = 'bad',
    Error = 'error',
}

export interface Message {
    id: string
    type: MessageType
    message: string
    time: number
}
