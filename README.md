# vue-split-pane

### [demo](https://ketaro01.github.io/vue-split-pane/)

## installation
``` shell script
$ yarn add dbseogns1212@vue-split-pane
or
$ npm install --save dbseogns1212@vue-split-pane
```

## Usage
### use global plugin
```jsx
// main.js
import Vue from 'vue';
import SplitPane from '@dbseogns1212/vue-split-pane';
import '@dbseogns1212/vue-split-pane/dist/splitPane.css';

Vue.use(SplitPane);
```

### use component
```jsx
// ###.vue
import SplitPane from '@dbseogns1212/vue-split-pane';
import '@dbseogns1212/vue-split-pane/dist/splitPane.css';

export default {
  components: {
    SplitPane,
  },
};
```

### component
```jsx
// ###.vue
<template>
  <split-pane
    size="30%"
    min-size="100px"
  >
    <template #paneL>
      <div style="width: 100%; height: 100%;">test1</div>
    </template>
    <template #paneR>
      <div style="width: 100%; height: 100%;">test2</div>
    </template>
  </split-pane>
</template>
```
