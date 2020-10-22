import { VueConstructor } from 'vue';
import VueSplitPane from '@/components/VueSplitPane.vue';

const install = (Vue: VueConstructor) => {
  Vue.component(VueSplitPane.name, VueSplitPane);
};

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export {
  VueSplitPane,
  install,
};

export default {
  VueSplitPane,
  install,
};
