<template>
  <div id="app">
    <div class="test-box">
      <split-pane
        size="30%"
        large-handle
        use-toggle
        :toggle-option="{
          toggleSize: 60,
        }"
        min-size="60"
      >
        <template #paneL>
          <div class="test-pane">pane1</div>
        </template>
        <template #paneR>
          <div class="test-pane">
            <split-pane
              size="200px"
              large-handle
              horizontal
            >
              <template #paneL>
                <div>pane2</div>
              </template>
              <template #paneR>
                <split-pane
                  size="150px"
                  large-handle
                >
                  <template #paneL>
                    <div>pane3</div>
                  </template>
                  <template #paneR>
                    <div>pane4</div>
                  </template>
                </split-pane>
              </template>
            </split-pane>
          </div>
        </template>
      </split-pane>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import SplitPane from '@/components/SplitPane.vue';

@Component({
  components: {
    SplitPane,
  },
})
export default class App extends Vue {}
</script>

<style lang="scss">
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
.test-box {
  width: 100%;
  height: 100%;
  background-color: #eee;
  box-sizing: border-box;
  padding: 20px;
  .test-pane {
    width: 100%;
    height: 100%;
    background-color: white;
  }
}
</style>
