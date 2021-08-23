import { Store } from './index'

const store = new Store({
    uniqueKey: 'id',
    value: Array<{ id: number, firstName?: string }>() // value to start with
})
afterEach(() => store.delete())
test(`Init Store`, () => expect(store).toBeDefined())
test(`Store.value is accessible`, () => expect(store.value).toBeDefined())
test(`Store.value cannot be mutated`, () => {
    //@ts-expect-error
    expect(() => store.value = [{ id: 1 }]).toThrowError()
    // prepare
    store.upsert({ id: 1 })
    //@ts-expect-error
    expect(() => store.value[0].id = 2).toThrowError()
})
test(`Subscribe to changes`, done => {
    let count = 0
    const { unsubscribe } = store.subscribe(value => {
        if (++count > 1) {
            expect(value).toBeDefined()
            done()
        }
    })
    store.upsert({ id: 1 })
    store.delete()
    unsubscribe()
})
test(`Unsubscribe from changes`, () => {
    let count = 0
    const { unsubscribe } = store.subscribe(() => ++count)
    store.upsert({ id: 1 })
    unsubscribe()
    store.delete(i => i.id === 2)
    expect(count).toBe(1)
    // unsubscribe doesn't do any when non subscriber handler passes
    const fakeHandler = jest.fn()
    store.unsubscribe(fakeHandler)
    expect(fakeHandler).not.toBeCalled()
})
test(`Insert one item`, () => {
    store.upsert({ id: 1 })
    expect(store.value.length).toBe(1)
})
test(`Insert multiple items`, () => {
    store.upsert([{ id: 1 }, { id: 2 }])
    expect(store.value.length).toBe(2)
})
test(`update one item`, () => {
    store.upsert({ id: 1 })
    store.upsert({ id: 1, firstName: `Meghan` })
    expect(store.value[0].firstName).toBe(`Meghan`)
})
test(`Update multiple items`, () => {
    store.upsert([{ id: 1 }, { id: 2 }])
    store.upsert([{ id: 1, firstName: `Meghan` }, { id: 2, firstName: `Rosemary` }])
    expect(store.value).toEqual([{ id: 1, firstName: `Meghan` }, { id: 2, firstName: `Rosemary` }])
})
test(`Delete items`, () => {
    store.upsert([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }])
    store.delete(i => i.id > 1 && i.id < 4)
    expect(store.value.length).toBe(2)
    store.upsert([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }])
    store.delete()
    expect(store.value.length).toBe(0)
})
test(`Deep merge arrays option`, () => {
    const store = new Store({
        uniqueKey: 'id',
        deepMergeArrays: [`path.to.array`],
        value: Array<{ id: number, path: { to: { array: Array<string> } }, someOtherList: Array<number> }>() // value to start with
    })
    store.upsert({ id: 1, path: { to: { array: [`Rudy, Tyler`] } }, someOtherList: [1, 2, 3] })
    store.upsert({ id: 1, path: { to: { array: [`Casandra`] } }, someOtherList: [4, 5, 6] })
    expect(store.value).toEqual([{ id: 1, path: { to: { array: [`Rudy, Tyler`, `Casandra`] } }, someOtherList: [4, 5, 6] }])
})