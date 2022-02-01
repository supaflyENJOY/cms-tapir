#Component.
Base component class component/Component.jsx

prop should contain definition for all reactive links of the component. 

Example: ```{value: {type: 'String'}}```


block


## Config
Any automatically wrapped jsx can have a config file

We choose json5 format for config. It is like json, but with comments, not strict quotes around properties and all types of strings that are in js.

Config must have the same name as jsx. So put MyComponent.json5 in the same place as MyComponent.jsx and you are ready to go.


Config contains properties that would be passed to the jsx as an `input` variable.

Properties are reactively wrapped, so `greet: "Hello"` would not be passed as String, but if you write `<div>{input.greet}</div>` — it would be printed correctly.

Properties are wrapped into the typed Store.Value.

Reactivity means that you can reassign some properties and they would be updated on page. Example of button that updates it's text:
```jsx
<button onclick={() => input.greet.set(new Date()) }>
  {input.greet}
</button>
```

#### Important:
If example above is not working — make shure that you have corresponding json5 file with some value in `greet` property.




WebStorm:

disable "Convert html attributes on paste in jsx" in Settings (Preferences)|Editor|General|Smart Keys