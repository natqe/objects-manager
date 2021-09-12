import { deepFreeze } from "../../src/common/deep-freeze"

test(`freeze only when there is a value`, () => {
    expect(deepFreeze(null)).toBeNull()
})