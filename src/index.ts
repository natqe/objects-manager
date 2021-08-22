import fastDeepEqual from "fast-deep-equal"
import get from "lodash-es/get"
import isFunction from 'lodash-es/isFunction'
import mergeWith from 'lodash-es/mergeWith'
import uniqWith from 'lodash-es/uniqWith'
import { cloneDeep } from "./clone-deep"
import { deepFreeze } from "./deep-freeze"

export type StoreOptions<T, K extends keyof T> = {
    uniqueKey: K
    value: ReadonlyArray<T>
    deepMergeArrays?: boolean | Array<string>
}

type ValueByOptions<T> = { [K in keyof T]?: T[K] }
    & { [K in keyof T & string as `${K}Not`]?: T[K] }
    & { [K in keyof T & string as `${K}In`]?: ReadonlyArray<T[K]> | T[K] }
    & { [K in keyof T & string as `${K}NotIn`]?: ReadonlyArray<T[K]> | T[K] }
    & { [K in keyof T & string as `${K}Includes`]?: T[K] extends Array<any> ? T[K][0] : T[K] extends string ? T[K] : any }
    & { [K in keyof T & string as `${K}NotIncludes`]?: T[K] extends Array<any> ? T[K][0] : T[K] extends string ? T[K] : any }
    & { [K in keyof T & string as `${K}LessThan`]?: T[K] }
    & { [K in keyof T & string as `${K}LessThanOrEqual`]?: T[K] }
    & { [K in keyof T & string as `${K}MoreThan`]?: T[K] }
    & { [K in keyof T & string as `${K}MoreThanOrEqual`]?: T[K] }
    | ((item: T) => boolean)

type ValueByMultipleOptions<T> = { [key: number]: ValueByOptions<T> } & ReadonlyArray<ValueByOptions<T>>

type FindOptions<T> = {
    where: ValueByMultipleOptions<T> | ValueByOptions<T>
}

type UpsertOptions<T, K extends keyof T> = {
    value: ReadonlyArray<T> | ReadonlyArray<Partial<T> & Required<Pick<T, K>>>
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
    upsert(options: UpsertOptions<T, K>) {
        const { value } = options
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
    find(options: FindOptions<T>) {
        const where: ValueByMultipleOptions<T> = Array.isArray(options.where) ? options.where : [options.where]
        return this.value.filter(i => where.some(condition => isFunction(condition) ? condition(i) : Object.entries(condition).every(([key, value]) => {
            if (key in i) return i[key] === value
            const getValue = (operator: string) => i[key.substring(0, key.lastIndexOf(operator))]
            if (key.endsWith(`Not`)) return getValue(`Not`) !== value
            if (key.endsWith(`NotIn`)) return !(value as Array<any>).includes(getValue(`NotIn`))
            if (key.endsWith(`In`)) return (value as Array<any>).includes(getValue(`In`))
            if (key.endsWith(`NotIncludes`)) return !getValue(`NotIncludes`)?.includes(value)
            if (key.endsWith(`Includes`)) return !!getValue(`Includes`)?.includes(value)
            if (key.endsWith(`LessThan`)) return (getValue(`LessThan`) ?? 0) < value
            if (key.endsWith(`LessThanOrEqual`)) return (getValue(`LessThanOrEqual`) ?? 0) <= value
            if (key.endsWith(`MoreThan`)) return (getValue(`MoreThan`) ?? 0) > value
            if (key.endsWith(`MoreThanOrEqual`)) return (getValue(`MoreThanOrEqual`) ?? 0) >= value
        })))
    }
    delete(options: FindOptions<T>) {
        let effected = this.find(options)
        this.dispatch(this.value.filter(i => !effected.includes(i)))
        return effected
    }
    clear() {
        const effected = this.value
        this.dispatch([])
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