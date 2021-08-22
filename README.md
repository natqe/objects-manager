# Objects Manager
### A simple and powerful library for managing arrays of objects in a maintainable way
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
### Subscribe to changes
```javascript
const onValueChange = value => {/* Do something with the value*/}
const subscription = store.subscribe(onValueChange)
```
### Unsubscribe from a previous subscription
```javascript
// Use the unsubscribe method on the subscription object
subscription.unsubscribe()
// Alternatively you can use Store.unsubscribe method instead
// Pass the subscription handler as a parameter
store.unsubscribe(onValueChange)
```
### Update or Insert items
```javascript
// Insert new items to the store
// Returns the effected items
store.upsert({
    value: [
        // example list
        { firstName: 'Delia', lastName: 'Nolan', id: 1 },
        { firstName: 'Clemens', lastName: 'Carter', id: 2 },
        { firstName: 'Kaitlin', lastName: 'Keeling', id: 3 },
        { firstName: 'Benny', lastName: 'Gibson', id: 4 },
        { firstName: 'Harrison', lastName: 'Jones', id: 5 },
    ]
})
// Update items example
store.upsert({
    value: [
        { id: 2, lastName: 'Harvey'},
        { id: 5, firstName: 'Doug' }
    ]
})
// output [{ firstName: 'Clemens', lastName: 'Harvey', id: 2 }, { firstName: 'Doug', lastName: 'Jones', id: 5 }]
```
### Find items in the store
```javascript
// find by property example
store.find({
    where: {
        firstName: 'Kaitlin', // And
        lastName: 'Keeling'
    }
})
// output [{ firstName: 'Kaitlin', lastName: 'Keeling', id: 3 }]

// "In" operator example
store.find({
    where: {
        firstNameIn: ['Delia', 'Kaitlin']
    }
})
// output [{ firstName: 'Delia', lastName: 'Nolan', id: 1 }, { firstName: 'Kaitlin', lastName: 'Keeling', id: 3 }]

// "LessThan" operator example
store.find({
    where: {
        idLessThan: 2
    }
})
// output [{ firstName: 'Delia', lastName: 'Nolan', id: 1 }]
```
**List of all Find Operators**
+ Not
+ In
+ NotIn
+ Includes
+ NotIncludes
+ StartsWith
+ NotStartsWith
+ EndsWith
+ NotEndsWith
+ Match
+ NotMatch
+ LessThan
+ LessThanOrEqual
+ MoreThan
+ MoreThanOrEqual
### Find Items via custom Callback
```javascript
// When you have a custom logic you can put a callback in the where property instead of options
store.find({
    where: item => item.id > 2
})
```
### Find with Multiple Where scenarios
```javascript
// If you have multiples ways to find the items you can pass an array to the where property
store.find({
    where: [
        { idNot: 2 }, // Or
        item => item.firstName === `Benny`
    ]
})
```
### Delete items from the store
```javascript
// You can use the delete method exactly like you use the find method
// Returns the effected items
store.delete({
    where: {
        firstName: 'Harrison'
    }
})
// output [{ firstName: 'Harrison', lastName: 'Jones', id: 5 }]
```
### Clear all items from the store
```javascript
// Use this method to clear all items from the store
// Returns the effected items (all items)
store.clear()
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
            users.upsert({
                value: [
                    { name: 'Delia', id: 1 },
                    { name: 'Clemens', id: 2 },
                    { name: 'Kaitlin', id: 3 },
                    { name: 'Benny', id: 4 },
                    { name: 'Harrison', id: 5 },
                ]
            })
        },
        []
    )
    // Store.find example
    useEffect(
        ()=> {
            // Store.find is a useful helper for finding one or more items inside the store
            const specialUsers = users.find({ where: { nameIn: ['Benny', 'Harrison'] } })
            console.log(specialUsers.length) // output 2
        },
        [users.value]
    )
    return (
        <ul>
            {users.value.map(user => <li key={user.id}>{user.name}</li>)}
        </ul>
    )
}
```