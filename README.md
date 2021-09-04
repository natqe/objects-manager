# Objects Manager
### A tiny and powerful library for managing arrays of objects in a maintainable way
## Usage Example
### Init Store
```javascript
import { Store } from 'objects-manager'

const store = new Store({
    uniqueKey: 'id',
    value: [] // value to start with
})
```
### Store options
+ **uniqueKey -**
Represents a unique key that must be on all objects in the store.
+ **value -**
The initial value for the store.
+ **deepMergeArrays (optional) -**
Could be a boolean or an array of strings that represents path`s to arrays inside individual object.
Make it true or pass a path to an array inside the object that should be updated instead of replaced when using Store.upsert.
### Use Store Value
```javascript
// You have access to the store items via the store value property
store.value.forEach(item => console.log(item))
```
**NOTE:** Store.value cannot be mutated directly.
### Subscribe to value
```javascript
const onValue = value => {/* Do something with the value*/}
const subscription = store.subscribe(onValue)
// It will run on initial and when the value changes.
```
### Unsubscribe from a previous subscription
```javascript
// Use the unsubscribe method on the subscription object
subscription.unsubscribe()
// Alternatively you can use Store.unsubscribe method instead
// Pass the subscription handler as a parameter
store.unsubscribe(onValue)
```
### Update or Insert items
```javascript
// Insert new items to the store
// Returns the effected items
store.upsert([
    // example list
    { firstName: 'Delia', lastName: 'Nolan', id: 1 },
    { firstName: 'Clemens', lastName: 'Carter', id: 2 },
    { firstName: 'Kaitlin', lastName: 'Keeling', id: 3 },
    { firstName: 'Benny', lastName: 'Gibson', id: 4 },
    { firstName: 'Harrison', lastName: 'Jones', id: 5 },
])
// You can also put in a single item
store.upsert({ firstName: 'Nathan', lastName: 'Olson', id: 6 })
// Update items example
store.upsert([
    { id: 2, lastName: 'Harvey'},
    { id: 5, firstName: 'Doug' }
])
// output [{ firstName: 'Clemens', lastName: 'Harvey', id: 2 }, { firstName: 'Doug', lastName: 'Jones', id: 5 }]
```
### Delete items from the store
```javascript
// Pass a callback to determine whether the item should be deleted or not
// Returns the effected items
store.delete(item => item.id === 5)
// output [{ firstName: 'Harrison', lastName: 'Jones', id: 5 }]
```
### Clear all items from the store
```javascript
// If you do not pass an callback to the delete method all items will be removed
store.delete()
```
## React Usage Example
```jsx
import { useStore } from 'objects-manager/react'
const Example = ()=> {
    // init store
    const users = useStore(()=> ({
        uniqueKey: 'id',
        value: []
    }))
    // log when value changed
    useEffect(
        ()=> console.log(`Value Changed`),
        [users.value]
    )
    // Insert new items
    // In usual should take a place after some call to an api
    useEffect(
        ()=> {
            users.upsert([
                { name: 'Delia', id: 1 },
                { name: 'Clemens', id: 2 },
                { name: 'Kaitlin', id: 3 },
                { name: 'Benny', id: 4 },
                { name: 'Harrison', id: 5 },
            ])
        },
        []
    )
    return (
        <ul>
            {users.value.map(user => <li key={user.id}>{user.name}</li>)}
        </ul>
    )
}
```