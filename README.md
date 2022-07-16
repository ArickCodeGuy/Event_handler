# Event handler
simple to use library to add event handler to certain actions on page and add animation to target elements accordingly  

## Usage
call  
```js
new EventHandler(selector, options)
```  

selector could be either  
 - string
 - HTMLElement
 - NodeList

## Options  
```js
prevent: true, // e.preventDefault()
parent: "body", // allows to constrain parent element to apply querySelectorAll from
target_selector: '', // you can specify it here or via data-target html attribute (data-target has more priority)
animation: {
  speed: 300, // transition-duration css attribute added during animation
  prefix: "animation-", // every animation has prefix (e.g. classAnimation adds classes like transition in vue)
  use_animation_class: true, // use class `${options.animation.prefix}playing` to prevent animation overlap
  function: fadeInOut, // function to be exicuted when event is triggerred. Animations return promises which resolve upon end of animation
  event: "click", // event type to watch
  fire_on_init: false, // trigger event on init
}
```

## Methods
destroy()  
destroys current event handler
