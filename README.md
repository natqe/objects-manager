# Objects Manager
### A simple and powerful library for managing arrays of objects in a maintainable way
## Usage Example
### Init Store
```javascript
import { Store } from 'objects-manager'
// init store
const store = new Store({
    uniqueKey: `id`,
    value: []
})
```
### Subscribe to changes
```javascript
// log when value changed
const subscription = store.subscribe(value => console.log(value.length))
// Unsubscribe from an subscription if no needed anymore
subscription.unsubscribe()
```
**NOTE:** Store.value cannot be mutated directly.
### Update or Insert items
```javascript
// Insert new items to the store
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
        firstName: 'Kaitlin'
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
+ LessThan
+ LessThanOrEqual
+ MoreThan
+ MoreThanOrEqual
## Delete items
```javascript
store.delete({
    where: {
        firstName: 'Harrison'
    }
})
// output [{ firstName: 'Harrison', lastName: 'Jones', id: 5 }]
```
## React Usage Example
```jsx
import { Store } from 'objects-manager/react'
const Example = ()=> {
    // init store
    const users = useStore(()=> ({
        uniqueKey: `id`,
        value: [] // value to start with
    }))
    // log when value changed
    useEffect(
        ()=> console.log(`Value Changed`),
        [users.value]
    )
    // insert new items
    // usual should take a place after some call to an api
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
            {users.value.map((user, index) => <li key={index}>{user.name}</li>)}
        </ul>
    )
}
```