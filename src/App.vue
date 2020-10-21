<template>
  <div id="app">
    <div style="height:100%; width:100%;">
      <split-pane
        size="30%"
      >
        <template #paneL>
          <div>test1</div>
        </template>
        <template #paneR>
          <div>test2</div>
        </template>
      </split-pane>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import HelloWorld from '@/components/HelloWorld.vue';
import SplitPane from '@/components/SplitPaneTS.vue';

@Component({
  components: {
    HelloWorld,
    SplitPane,
  },
})
export default class App extends Vue {}
</script>

<style>
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  width: 100%;
  height: 100%;
}
</style>
