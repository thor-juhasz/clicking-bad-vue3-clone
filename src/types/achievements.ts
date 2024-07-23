export default interface Achievement {
    sid: string,
    label: string
    description: string
    property: string
    required: number
    unlocked: boolean
    value: number
    group: number
    minTime: number
    hidden: boolean
}
