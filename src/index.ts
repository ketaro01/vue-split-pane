import { VueConstructor } from 'vue';
import VueSplitPane from '@/components/VueSplitPane.vue';

const install = (Vue: VueConstructor) => {
  Vue.component(VueSplitPane.name, VueSplitPane);
};

export default {
  install,
};

export { VueSplitPane };
