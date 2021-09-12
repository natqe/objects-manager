import * as fastDeepEqual from "fast-deep-equal"
import { get, mergeWith, uniqWith, castArray } from "lodash-es"
import { cloneDeep, deepFreeze } from "./common"

type Immutable<T> = {
    readonly [K in keyof T]: T[K] extends object ? Immutable<T[K]> : T[K]
}

type Item<T, K extends keyof T> = T & Immutable<T> & Required<Pick<T, K>> & Immutable<Required<Pick<T, K>>>

type Value<T, K extends keyof T> = ReadonlyArray<Item<T, K>>

export type StoreOptions<T, K extends keyof T> = {
    uniqueKey: K
    value: Value<T, K>
    deepMergeArrays?: boolean | Array<string>
}

export class Store<T, K extends keyof T> {
    private _value: Value<T, K>
    constructor(private readonly options: StoreOptions<T, K>) {
        this.dispatch(options.value)
    }
    private readonly subscribers = Array<((value: Value<T, K>) => void)>()
    get value() {
        return this._value
    }
    private updateSubscription(subscriber: (value: Value<T, K>) => void) {
        subscriber(this.value)
    }
    private dispatch(newState: Value<T, K>) {
        if (!fastDeepEqual(this.value, newState)) {
            this._value = newState.length ? deepFreeze(newState) : Object.freeze(newState)
            for (const subscriber of this.subscribers) this.updateSubscription(subscriber)
        }
    }
    upsert(value: Partial<Item<T, K>> & Required<Pick<Item<T, K>, K>> | ReadonlyArray<Partial<Item<T, K>> & Required<Pick<Item<T, K>, K>>>) {
        value = castArray(value)
        const newState = cloneDeep(this.value) as Array<Item<T, K>>
        for (const item of value) {
            const index = newState.findIndex(({ [this.options.uniqueKey]: _id }) => _id === item[this.options.uniqueKey] as any)
            const pathsToMerge = index !== -1 && Array.isArray(this.options.deepMergeArrays) ? this.options.deepMergeArrays.map(path => get(newState[index], path)) : []
            index !== -1 ?
                mergeWith(newState[index], item, (a, b) => {
                    if (Array.isArray(a) && Array.isArray(b) && (this.options.deepMergeArrays === true || pathsToMerge.includes(a))) return uniqWith([...a, ...b], fastDeepEqual)
                }) :
                newState.push(item as any)
        }
        this.dispatch(newState)
        const effected = value.map(i => this.value.find(v => v[this.options.uniqueKey] === i[this.options.uniqueKey] as any))
        return effected
    }
    delete(predicate?: Parameters<Value<T, K>['filter']>[0]) {
        let effected = predicate ? this.value.filter(predicate) : this.value
        this.dispatch(predicate ? this.value.filter(i => !effected.includes(i)) : [])
        return effected
    }
    subscribe(subscriber: (value: Value<T, K>) => void) {
        this.subscribers.push(subscriber)
        this.updateSubscription(subscriber)
        return {
            unsubscribe: () => this.unsubscribe(subscriber)
        }
    }
    unsubscribe(subscriber: (value: Value<T, K>) => void) {
        const index = this.subscribers.findIndex(i => i === subscriber)
        if (index !== -1) this.subscribers.splice(index, 1)
    }
}