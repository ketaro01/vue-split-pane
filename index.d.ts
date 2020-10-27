import { ComponentOptions, PluginFunction } from "vue"

interface VueSplitPanePluginOptions {
  horizontal?: boolean,
  useToggle?: boolean,
  toggleOption?: object,
  minSize?: number|string,
  validMinRight?: boolean,
  maxSize: number|string,
  size?: number|string,
  largeHandle?: boolean,
}

export const install: PluginFunction<VueSplitPanePluginOptions>

declare const VueSplitPanePlugin: VueSplitPanePlugin
export default VueSplitPanePlugin
export interface VueSplitPanePlugin {
  install: PluginFunction<VueSplitPanePluginOptions>
}

export declare const VueSplitPane: ComponentOptions<any, any, any, any>
