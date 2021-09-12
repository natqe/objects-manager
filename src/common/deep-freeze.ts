export const deepFreeze = <T extends Object>(o: T) => {
    if (o && !Object.isFrozen(o)) {
        Object.freeze(o)
        Object.getOwnPropertyNames(o).forEach((prop) => {
            if (
                o.hasOwnProperty(prop)
                && o[prop] !== null
                && (typeof o[prop] === `object` || typeof o[prop] === `function`)
                && !Object.isFrozen(o[prop])
            ) {
                deepFreeze(o[prop])
            }
        })
    }
    return o
}