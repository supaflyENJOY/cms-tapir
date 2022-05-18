# cms-tapir

`cms-tapir` is designed for building simple Frontend+API as a single application

Backend API is working on top of api-tapir package

Frontend is build with component based jsx\json5 files on the top of the reactive-dom project.


## How to setup a project

`cms-tapir` is the only dependency that you would need.

Use `yarn add cms-tapir` or `npm i --add cms-tapit` command to add required package to your project.

Or add it manually to your package.json and use any package manager that you want.


When the dependency is met, you only need to make some main js file to initialize the Tapir.

Simplest config contains only `routes` and base project structure `config`.

__*index.js*__ 
```js
var tapir = require('cms-tapir');

new tapir({
    config: {
        static: ['public'], // files from static folders would be served as is
        template: 'template', // template folder contains all project code
        html: 'html/page.html', // generic html template. Instead per-route template can be used
        
        scripts: [ // scripts that needs to be included in all pages
            '/core/Path.js', // path resolver 
            '/core/Require.js', // module loader
            'https://form.dev/vanilla/build/rDOM_latest.js' // latest version of reactiveDOM
        ] 
    },
    routes: {
        '/': {
            //html: 'html/page2.html', // can specify unique template for any route
            page: 'main', // this is the jsx corresponding to the route
            cache: []
        }
    }
});
```


## Lets create our first page

For the above config your project would have at least this structure:
```
index.js
package.json
template/
  |- html/
  |  \_ page.html
  \_ page/
     \_ main.jsx
public/
```

Now we would create that `main.jsx` and `page.html` files.

We specified `page.html` as a HTML template in our config. It would be searched in the `template` folder.

__*template/html/page.html*__
```html
<html>
  <head><title>Hello, Tapir!</title><meta charset="UTF-8">
    <script>window.env = %ENV%</script>%SCRIPTS%
  </head>
  <body>
    <script>%PAGECODE%</script>
  </body>
</html>
```

HTML template was designed as simple as possible, all logic is settled in jsx files


Now lets create a simple jsx page:

__*template/page/main.jsx*__
```jsx
import './styling.scss';

<div>
	<div class={'title'}>My first tapir page</div>
</div>;
```

SCSS is the default css preprocessor. So we can just import scss styles.

__*template/page/styling.scss*__
```scss
import './styling.scss';

<div>
	<div class={'title'}>My first tapir page</div>
</div>;
```

`node index` would start your application. You can use your IDE for debugging API


## DOM, Values, Reactivity

`reactive-dom` does not have any shadow dom.
html (jsx) elements creates native html elements
you can actually do things like this:
```js
var x = <div>abc</div>; 
x.innerText = '123';
x.appendChild(<b>child</b>);
document.body.appendChild(x);
```

<br>

### Reactivity

This project was started before React and it has got not currently most spread meaning of reactivity.

The most simple explanation of concept of reactivity you can see in Excel: when you change one cell — the other dependent cells get recomputed.

As in react jsx templates — we can insert values
```jsx
let someValue = 'text';
<div>{someValue}</div>
```
<br>

Reactive part of the library is presented by a clever store that handle changes:
1. Single variables are created via `new Store.Value`. Example that would create a counter that updates every 100ms:
   ```jsx
   let someNumber = new Store.Value.Number(0);
   
   setInterval(()=>someNumber.set(someNumber.get()+1), 100);
   
   <div>{someNumber}</div>;
   ```
   This concept looks nearly similar to react's useHook. But it does not recalculate the whole tree modifications, it only updates parts that have changed


2. Store can handle multiple values at once. 
   ```jsx
    let store = new Store({num: 1, mod2: false, mod3: false, mod5: false});
    
    setInterval(()=>{
        let num = store.get('num')+1;
        store.set('num', num);
        store.set('mod2', num % 2 === 0);
        store.set('mod3', num % 3 === 0);
        store.set('mod5', num % 5 === 0);
    }, 1000);
    
    <div>
        {store.val('num')}
        <Store.IF condition={store.valEqual('mod2', true)}><div>dividable by 2</div></Store.IF>
        <Store.IF condition={store.val('mod3')}><div>dividable by 3</div></Store.IF>
        <Store.IF condition={store.val('mod5')}><div>dividable by 5</div></Store.IF>
        <Store.IF condition={update => 
            store.sub('num', newVal => update(newVal%7 === 0))
        }>
            <div>dividable by 7</div>
        </Store.IF>
    </div>
   ```

<br/>

#### More complex values (hook functions)
If we pass a function as value — this function would be instantly called and would have update method as it's first argument.
It is a similar pattern to `callbacks`, but we call it `hook-functions`, because it looks like passing a bait that can be triggered any time
and if this happens — tapir hooks it`s prey and updating the value!
```jsx
let someValue = 'text';
<div>{bait => {
	let x = 0;
	setInterval(()=>{
		bait(x++);
	}, 100);
}}</div>;
```
This is a general behavior, style properties can also be initialized with such function
```jsx
<div style={{ 
    border: _ => { // this is not the best example, but it should work
        var b = 0;
        setInterval(()=> {
            b += 0.1;
            _( `${Math.sin(b)*10+10|0}px solid red` )
        }, 100)
    }}}>
    Border!
</div>
```


## Components

Let's create a new simple page with a component! We would add a new route to `index.js`

__*index.js*__
```js
routes: {
    '/': {
        page: 'main', // this is the jsx corresponding to the route
        cache: []
    },
	'/page2': {
        page: 'page2', // this is the jsx corresponding to the route
        cache: []
    }
}
```

__!!! Server must be restarted to apply, changes in main js file__

Our page would be a simple color picker.

This would be a color-slider component

Create a folder `component` in a `template` directory. (it can be any folder)

<br>

### Creating colorSlider component
Now we would create a slider. For simplicity we would use HTML5 range type of input:

__*template/component/colorSlider.jsx*__
```jsx
import './colorSliderStyles.scss';

/*
 Arguments are passed to the component through `input` object.
 When we would instantiate our Slider like this: 
 <Slider name="Red"/>
 input.name would contains "Red"
 */

const range = <input type="range" min="0" max="255"
					 oninput={e => input.value.set(range.value)}
					 value={input.value}/>;
// Now in the `range` variable we have native HTMLInputElement
// When our input triggers native oninput event our function is called and we update

// also `input.value` is setted as input`s value property. 
// If value of Slider would be changed outside — our input would be updated instantly 

<div class={'slider'}>
	<div class={'slider__title'}>{input.name}</div>
	{range}
</div>;
	
// here we are just inserting our range variable in the final DOM
// we could write it with usage of e.target.value instead, but it looks more obscure
```

### Creating colorSlider styles
__*template/component/colorSliderStyles.scss*__
```css
.slider__title {
    font-size: 14px;
    margin-bottom: -10px;
}
```

### Usage of our slider on color-picker demo page

__*template/page/page2.jsx*__
```jsx
import './styling.scss';
// all paths are resolved regarding to a templates directory specified in config
// file extensions are mandatory for now
import Slider from '/component/colorSlider.jsx';

// creating a store with default color values
const store = new Store({
	r: 187,
	g: 70,
	b: 178
});

// creating a simple reactive value that would be updated if colors have changed
const backgroundColor = new Store.Value.String('');

// we are subscribing to changes of stored values of `r`, `g`, and `b`
store.sub(['r', 'g', 'b'], (r,g,b)=>{
	// when such change happens — we form a new string of backgroundColor
    // it can be done inline via hook-functions
	backgroundColor.set(`rgba(${r}, ${g}, ${b}, 1)`);
});

<div>
	<div class={'title'}>Tapir page with components</div>

	<div class={'result-color'} style={{background: backgroundColor }}/>

	<Slider name={'Red'} value={store.bind('r')}/>
	<Slider name={'Green'} value={store.bind('g')}/>
	<Slider name={'Blue'} value={store.bind('b')}/>

	<div>Values: R: {store.val('r')}, G: {store.val('g')}, B: {store.val('b')} </div>

	<button onclick={()=>store.set({r: 0, g: 190, b: 50})}>Green</button>
	<button onclick={()=>store.set({r: 190, g: 0, b: 11})}>Red</button>
</div>;
```


## Component details.
Base component class component/Component.jsx

prop should contain definition for all reactive links of the component. 

Example: ```{value: {type: 'String'}}```


block


### Config
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


## IDE settings for making life easier

WebStorm:

mark `template` and `public` as resources root

disable "Convert html attributes on paste in jsx" in Settings (Preferences)|Editor|General|Smart Keys

## Features to be fixed

Live reloading was working one day but is broken now

Source maps have the same issue

SCSS is the most complex dependency of the project. One day we would switch to some simpler css preprocessor

This project is still in  progress.