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
