### A simple and powerful library for managing arrays of objects in a maintainable way

<!-- ## Usage
```jsx
// Initial value is Required!
const initialValue = {
    lang: 'en',
    color: 'dark' ,
    firstVisit: null
}

// "createObjectContext" - This is where the magic happens
const ExampleContext = createObjectContext(initialValue)

// You can now wrap your components as you normally would
const ParentComponent = ()=> {
    const lang = 'he'
    const color = 'light'
    const firstVisit = true
    return (
        <ExampleContext.Provider value={{ lang, color, firstVisit }}>
            <ChildComponent />
        </ExampleContext.Provider>
    )
}

const ChildComponent = ()=> {
    // Select only the properties you want to use
    const { color, lang } = ExampleContext.use('color', 'lang')
    return (
        <div>The color is {color}, and the language is {lang}</div>
    )
}
``` -->