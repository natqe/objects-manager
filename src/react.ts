import { useDebugValue, useLayoutEffect, useReducer, useState } from "react"
import { Store, StoreOptions } from "./index"

export const useStore = <T, K extends keyof T>(initialState: () => StoreOptions<T, K>) => {
    const [, dispatch] = useReducer(prev => ++prev, 0)
    const [store] = useState(() => new Store(initialState()))
    useLayoutEffect(
        () => {
            let init: boolean
            const { unsubscribe } = store.subscribe(() => init ? dispatch() : init = true)
            return unsubscribe
        },
        []
    )
    useDebugValue(store.value)
    return store
}