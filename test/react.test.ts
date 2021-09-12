import { createElement, FC, useEffect } from 'react'
import * as renderer from 'react-test-renderer'
import { useStore } from '../src/react'

test('Initialization should run only once', () => {
    let countInitialization = 0
    const Component: FC = () => {
        const store = useStore(() => {
            ++countInitialization
            return {
                value: Array<{ id: number }>(),
                uniqueKey: 'id'
            }
        })
        return null
    }
    const component = renderer.create(createElement(Component))
    component.toJSON()
    component.toJSON()
    expect(countInitialization).toBe(1)
})

test('Store.value change trigger renderer', done => {
    let countRendered = 0
    const Component: FC = () => {
        const store = useStore(() => ({
            value: Array<{ id: number }>(),
            uniqueKey: 'id'
        }))
        useEffect(() => {
            if (!countRendered) store.upsert({ id: 1 })
            ++countRendered
        })
        return null
    }
    renderer.create(createElement(Component))
    setTimeout(
        () => {
            expect(countRendered).toBe(2)
            done()
        },
        1000
    )
})