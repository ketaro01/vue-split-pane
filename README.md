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
import VueSplitPane from '@dbseogns1212/vue-split-pane';
import '@dbseogns1212/vue-split-pane/dist/splitPane.css';

Vue.use(VueSplitPane);
```

### use component
```jsx
// ###.vue
import { VueSplitPane } from '@dbseogns1212/vue-split-pane';
import '@dbseogns1212/vue-split-pane/dist/splitPane.css';

export default {
  components: {
    VueSplitPane,
  },
};
```

### component
```jsx
// ###.vue
<template>
  <vue-split-pane
    size="30%"
    min-size="100px"
  >
    <template #paneL>
      <div style="width: 100%; height: 100%;">test1</div>
    </template>
    <template #paneR>
      <div style="width: 100%; height: 100%;">test2</div>
    </template>
  </vue-split-pane>
</template>
```

### props
name                | type               | default                                           | description
:------------------ | :----------------: | :------------------------------------------------ | :-----------
`horizontal`        | number             | 22                                                | horizontal flag
`useToggle`         | boolean            | false                                             | use toggle btn
`toggleOption`      | object             | { showHandle: false, toggleSize: 30, style: {} }  | toggle btn option 최소 사이즈로 내려가거나 toggle size 보다 작은경우 버튼으로 변경
`minSize`           | number|string      | null                                              | ex) 100px or 10%
`validMinRight`     | boolean            | true                                              | right pane min-size 적용 여부
`maxSize`           | number|string      | null                                              | ex) 100px or 10%
`size`              | number|string      | 100                                               | init size
`largeHandle`       | boolean            | false                                             | split handle size
