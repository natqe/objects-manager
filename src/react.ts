import { useState, useDebugValue, useLayoutEffect, useReducer } from "react"
import { Store, StoreOptions } from "./index"

export const useStore = <T, K extends keyof T>(initialState: () => StoreOptions<T, K>) => {
    const [, dispatch] = useReducer(prev => ++prev, 0)
    const [store] = useState(() => new Store(initialState()))
    useLayoutEffect(
        () => {
            const { unsubscribe } = store.subscribe(() => dispatch())
            return unsubscribe
        },
        []
    )
    useDebugValue(store.value)
    return store
}