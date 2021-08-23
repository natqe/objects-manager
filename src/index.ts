import * as fastDeepEqual from "fast-deep-equal"
import { get, mergeWith, uniqWith, castArray } from "lodash-es"
import { cloneDeep } from "./clone-deep"
import { deepFreeze } from "./deep-freeze"

type Immutable<T> = {
    readonly [K in keyof T]: T[K] extends object ? Immutable<T[K]>: T[K]
}

export type StoreOptions<T, K extends keyof Immutable<T>> = {
    uniqueKey: K
    value: ReadonlyArray<Immutable<T>>
    deepMergeArrays?: boolean | Array<string>
}

export class Store<T, K extends keyof Immutable<T>> {
    private _value: ReadonlyArray<Immutable<T>>
    constructor(private readonly options: StoreOptions<T, K>) {
        this.dispatch(options.value)
    }
    private readonly subscribers = Array<((value: ReadonlyArray<Immutable<T>>) => void)>()
    get value() {
        return this._value as ReadonlyArray<Immutable<T>>
    }
    private dispatch(newState: ReadonlyArray<Immutable<T>>) {
        if (!fastDeepEqual(this.value, newState)) {
            this._value = newState.length ? deepFreeze(newState) : Object.freeze(newState)
            for (const subscriber of this.subscribers) subscriber(this.value)
        }
    }
    upsert(value: Partial<Immutable<T>> & Required<Pick<Immutable<T>, K>> | ReadonlyArray<Partial<Immutable<T>> & Required<Pick<Immutable<T>, K>>>) {
        value = castArray(value)
        const newState = cloneDeep(this.value) as Array<Immutable<T>>
        for (const item of value) {
            const index = newState.findIndex(({ [this.options.uniqueKey]: _id }) => _id === item[this.options.uniqueKey] as any)
            const pathsToMerge = index !== -1 && Array.isArray(this.options.deepMergeArrays) ? this.options.deepMergeArrays.map(path => get(newState[index], path)) : []
            index !== -1 ?
                mergeWith(newState[index], item, (a, b) => {
                    if (Array.isArray(a) && Array.isArray(b) && (this.options.deepMergeArrays === true || pathsToMerge.includes(a))) return uniqWith([...a, ...b], fastDeepEqual)
                }) :
                newState.push(item as Immutable<T>)
        }
        this.dispatch(newState)
        const effected = value.map(i => this.value.find(v => v[this.options.uniqueKey] === i[this.options.uniqueKey] as any))
        return effected
    }
    delete(predicate?: Parameters<ReadonlyArray<Immutable<T>>['filter']>[0]) {
        let effected = predicate ? this.value.filter(predicate) : this.value
        this.dispatch(predicate ? this.value.filter(i => !effected.includes(i)) : [])
        return effected
    }
    subscribe(subscriber: (value: ReadonlyArray<Immutable<T>>) => void) {
        this.subscribers.push(subscriber)
        return {
            unsubscribe: () => this.unsubscribe(subscriber)
        }
    }
    unsubscribe(subscriber: (value: ReadonlyArray<Immutable<T>>) => void) {
        const index = this.subscribers.findIndex(i => i === subscriber)
        if (index !== -1) this.subscribers.splice(index, 1)
    }
}