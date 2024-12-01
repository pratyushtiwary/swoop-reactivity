# Swoop Reactivity

This project focuses on creating reactive variables, similar to Vue, that allows to listen for changes

## Usage
Similar to Vue, this module contains 3 functions, `reactive`, `ref` & `watchEffect`

```js
const temp = ref(0);

watchEffect(() => {
	console.log(temp.value);
});

temp.value = 1;
```

## Working

ref returns an object of `Dep`, where `value` prop has a custom getter and setter, reactive on the other hand uses (Proxy)[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy] to understand which effects should be notified. Interally a queue is maintained and all the fired events are triggered after 10ms of the last fire event call, this way we batch event triggering making it more efficient.

**Note: Passing same function in watchEffect only calls it once, this works with anonymous functions as well, there function body is used for unique identification**

## Future

This module is part of a small Vue like framework that I am working on named `Swoop`, in future `swoop` will have its own repo and this repo will be merged in it.