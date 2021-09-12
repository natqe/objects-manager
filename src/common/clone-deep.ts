import * as rfdc from 'rfdc'

export const cloneDeep = <T>(value: T): T => rfdc({ proto: true })(value)