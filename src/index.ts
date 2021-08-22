import fastDeepEqual from "fast-deep-equal"
import get from "lodash-es/get"
import mergeWith from 'lodash-es/mergeWith'
import uniqWith from 'lodash-es/uniqWith'
import { cloneDeep } from "./clone-deep"
import { deepFreeze } from "./deep-freeze"

export type StoreOptions<T, K extends keyof T> = {
    uniqueKey: K
    value: ReadonlyArray<T>
    deepMergeArrays?: boolean | Array<string>
}

export class Store<T, K extends keyof T> {
    readonly value: ReadonlyArray<T>
    constructor(private readonly options: StoreOptions<T, K>) {
        this.dispatch(options.value)
    }
    private readonly subscribers = Array<((value: this['value']) => void)>()
    private dispatch(newState: this['value']) {
        if (!fastDeepEqual(this.value, newState)) {
            //@ts-expect-error
            this.value = newState.length ? deepFreeze(newState) : Object.freeze(newState)
            for (const subscriber of this.subscribers) subscriber(this.value)
        }
    }
    upsert(value: T | Partial<T> & Required<Pick<T, K>> | ReadonlyArray<T> | ReadonlyArray<Partial<T> & Required<Pick<T, K>>>) {
        if(!Array.isArray(value)) value = [value] as any
        value = value as ReadonlyArray<T>
        const newState = cloneDeep(this.value) as Array<T>
        for (const item of value) {
            const index = newState.findIndex(({ [this.options.uniqueKey]: _id }) => _id === item[this.options.uniqueKey])
            const pathsToMerge = index !== -1 && Array.isArray(this.options.deepMergeArrays) ? this.options.deepMergeArrays.map(path => get(newState[index], path)) : []
            index !== -1 ?
                mergeWith(newState[index], item, (a, b) => {
                    if (Array.isArray(a) && Array.isArray(b) && (this.options.deepMergeArrays === true || pathsToMerge.includes(a))) return uniqWith([...a, ...b], fastDeepEqual)
                }) :
                newState.push(item as T)
        }
        this.dispatch(newState)
        const effected = value.map(i => this.value.find(v => v[this.options.uniqueKey] === i[this.options.uniqueKey]))
        return effected
    }
    delete(predicate?: Parameters<ReadonlyArray<T>['filter']>[0]) {
        let effected = predicate ? this.value.filter(predicate) : this.value
        this.dispatch(predicate ? this.value.filter(i => !effected.includes(i)) : [])
        return effected
    }
    subscribe(subscriber: (value: this['value']) => void) {
        this.subscribers.push(subscriber)
        return {
            unsubscribe: () => this.unsubscribe(subscriber)
        }
    }
    unsubscribe(subscriber: (value: this['value']) => void) {
        const index = this.subscribers.findIndex(i => i === subscriber)
        if (index !== -1) this.subscribers.splice(index, 1)
    }
}