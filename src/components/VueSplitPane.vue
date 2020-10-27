<template>
  <div
    ref="splitBase"
    :class="splitClass"
    :style="splitStyle"
    @mouseup="handleMouseUp"
    @mousemove="handleMouseMove"
  >
    <div
      class="pane pane-left"
      :style="paneStyles.left"
    >
      <div
        v-if="showToggle"
        class="handle-close-area"
      >
        <slot
          name="close"
          :open-area="handleOpenArea"
        >
          <div
            class="handle-open-default"
            :style="getToggleOption.style"
            @click="handleOpenArea"
          >
            <div class="handle-open-dots">
              <span />
            </div>
          </div>
        </slot>
      </div>
      <slot
        v-else
        name="paneL"
      />
    </div>
    <div
      v-if="showHandle"
      :class="['handle', { large: largeHandle }]"
      @mousedown="handleMouseDown"
    />
    <div
      class="pane pane-right"
      :style="paneStyles.right"
    >
      <slot name="paneR" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TOGGLE_OPTION } from '@/constants';

interface ToggleOptions {
  showHandle: boolean;
  toggleSize: number;
  style: object;
}

interface SizeInfo {
  type: string;
  value: number;
}

interface PaneStyle {
  left: {
    flex?: string|number;
    width?: string;
    height?: string;
  };
  right: {
    flex?: string|number;
    width?: string;
    height?: string;
  };
}

interface SplitStyle {
  userSelect: string;
  cursor: string;
}

@Component
export default class VueSplitPane extends Vue {
  @Prop({
    type: Boolean,
    default: false,
  })
  readonly horizontal: boolean

  @Prop({
    type: Boolean,
    default: false,
  })
  readonly useToggle: boolean

  @Prop({
    type: Object,
    default: () => ({
      showHandle: TOGGLE_OPTION.SHOW_HANDLE, // handle 표시 여부
      toggleSize: TOGGLE_OPTION.TOGGLE_SIZE, // toggle btn size
      style: {},
    }),
  })
  readonly toggleOption: ToggleOptions

  @Prop({
    type: [Number, String],
    default: null,
    validator: (value) => (
      typeof value === 'number' || /^([0-9]+|[0-9]+(px|%))$/.test(value)
    ),
  })
  readonly minSize: number|string

  @Prop({
    type: Boolean,
    default: true,
  })
  readonly validMinRight: boolean

  @Prop({
    type: [Number, String],
    default: null,
    validator: (value) => (
      typeof value === 'number' || /^([0-9]+|[0-9]+(px|%))$/.test(value)
    ),
  })
  readonly maxSize: number|string

  @Prop({
    type: [Number, String],
    default: 100,
    validator: (value) => (
      typeof value === 'number' || /^([0-9]+|[0-9]+(px|%))$/.test(value)
    ),
  })
  readonly size: number|string

  @Prop({
    type: Boolean,
    default: false,
  })
  readonly largeHandle: boolean

  private active = false;

  private hasMoved = false;

  private splitClass = this.horizontal ? 'split horizontal' : 'split vertical';

  private pageSize = 0;

  private pixel: number|null = null;

  get currentPixel(): number {
    return this.pixel || 0;
  }

  get paneStyles(): PaneStyle {
    if (!this.currentPixel && this.currentPixel !== 0) {
      return {
        left: {},
        right: {},
      };
    }
    return {
      left: {
        flex: `${this.currentPixel * 100} 1 0%`,
      },
      right: {
        flex: `${(this.pageSize - this.currentPixel) * 100} 1 0%`,
      },
    };
  }

  get showToggle(): boolean {
    const { toggleSize } = this.getToggleOption;
    return this.useToggle && (this.isMinimum || this.currentPixel <= toggleSize);
  }

  get showHandle(): boolean {
    return !this.showToggle || (this.showToggle && this.getToggleOption.showHandle);
  }

  get isMinimum(): boolean {
    if (!this.currentPixel && this.currentPixel !== 0) return false;

    const minSize = VueSplitPane.getPixel(this.minSize);

    if (!minSize) return false;

    return this.currentPixel <= minSize;
  }

  get splitStyle(): SplitStyle {
    const cursor = this.horizontal ? 'row-resize' : 'col-resize';
    return {
      userSelect: this.active ? 'none' : '',
      cursor: this.active ? cursor : '',
    };
  }

  get getToggleOption(): ToggleOptions {
    const {
      showHandle,
      toggleSize,
      style,
    } = this.toggleOption;

    return {
      showHandle: showHandle || TOGGLE_OPTION.SHOW_HANDLE,
      toggleSize: toggleSize || TOGGLE_OPTION.TOGGLE_SIZE,
      style: style || {},
    };
  }

  mounted() {
    this.resetSplitPane();
    window.addEventListener('resize', this.onResize, { passive: true });
  }

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize, false);
  }

  updated() {
    if (!this.pageSize) {
      this.pageSize = this.getPageSize();
    }
  }

  private resetSplitPane(): void {
    this.pageSize = this.getPageSize();
    this.pixel = VueSplitPane.getPixel(this.size, this.pageSize);
  }

  private onResize(): void {
    setTimeout(() => {
      this.pageSize = this.getPageSize();
    }, 200);
  }

  private getPageSize(): number {
    if (!this.$refs.splitBase) return 0;
    const { offsetWidth, offsetHeight } = this.$refs.splitBase as HTMLElement;
    return this.horizontal ? offsetHeight : offsetWidth;
  }

  private handleMouseDown(): void {
    this.active = true;
    this.hasMoved = false;
  }

  private handleMouseUp(): void {
    this.active = false;
  }

  private handleMouseMove(e: MouseEvent): void {
    if (e.buttons === 0 || e.which === 0) {
      this.active = false;
    }

    if (this.active) {
      const offset = this.getOffset(e.currentTarget as HTMLElement);

      const currentPage = this.horizontal ? e.pageY : e.pageX;
      const { offsetHeight, offsetWidth } = e.currentTarget as HTMLElement;

      const pageSize = this.horizontal
        ? offsetHeight
        : offsetWidth;
      const pixel = currentPage - offset;

      this.pageSize = pageSize;
      this.setPixel(pixel, pageSize);
    }
    this.hasMoved = false;
  }

  private getOffset(element: HTMLElement): number {
    let offset = 0;
    let target = element;
    while (target) {
      offset += this.horizontal ? target.offsetTop : target.offsetLeft;
      target = target.offsetParent as HTMLElement;
    }
    return offset;
  }

  private setPixel(pixel: number, pageSize: number): void {
    const minPixel = VueSplitPane.getPixel(this.minSize, pageSize);

    if (minPixel && pixel < minPixel) {
      this.pixel = minPixel;
      return;
    }

    if (this.validMinRight && minPixel && pixel > pageSize - minPixel) {
      this.pixel = pageSize - minPixel;
      return;
    }

    const maxPixel = VueSplitPane.getPixel(this.maxSize, pageSize);

    if (maxPixel && pixel > maxPixel) {
      this.pixel = maxPixel;
      return;
    }

    if (pixel > pageSize) {
      this.pixel = pageSize;
      return;
    }

    this.pixel = pixel;
  }

  private handleOpenArea(): void {
    this.resetSplitPane();
  }

  static getPixel(size: number|string, pageSize?: number): number {
    const sizeInfo = VueSplitPane.getSize(size);

    if (!sizeInfo) return 0;

    const { type, value } = sizeInfo;

    if (type === '%') {
      if (!pageSize) return 0;

      return (pageSize * value) / 100;
    }

    return value;
  }

  static getSize(value: number|string): SizeInfo|null {
    if (!value) return null;
    if (typeof value === 'number') return { type: 'px', value };
    const nValue = parseInt(value.replace(/(px|%)/, ''), 10);
    if (Number.isNaN(nValue)) return null;
    if (!/(px|%)/.test(value) || value.indexOf('px') > -1) return { type: 'px', value: nValue };
    if (value.indexOf('%') > -1) return { type: '%', value: nValue };
    return null;
  }
}
</script>
<style lang="scss" scoped>
.split {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  flex: 1;
  box-sizing: border-box;
  > .pane {
    position: relative;
    outline: none;
    min-width: 0;
    min-height: 0;
  }
  > .handle {
    position: relative;
    background-color: #ccc;
    &::before {
      content: '';
      position: absolute;
      transition: opacity 0.4s;
      background-color: rgba(0,0,0,0.3);
      z-index: 1;
      opacity: 0;
    }
  }
  > .handle:hover::before, .handle:active::before {
    opacity: 1;
  }

  &.vertical {
    > .handle {
      min-width: 1px;
      cursor: col-resize;
      &::before {
        height: 100%;
      }
    }
    > .handle.large {
      &::before {
        left: -6px;
        right: -6px;
      }
    }
  }
  &.horizontal {
    flex-direction: column;
    > .handle {
      min-height: 1px;
      cursor: row-resize;
      &::before {
        width: 100%;
      }
    }
    > .handle.large {
      &::before {
        top: -6px;
        bottom: -6px;
      }
    }
  }
}
.handle-close-area {
  width: 100%;
  height: 100%;
  position: relative;
  > .handle-open-default {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.3);
    cursor: pointer;
    > .handle-open-dots {
      color: white;
      position: absolute;
      height: 20px;
      width: 20px;
      top: 50%;
      left: 50%;
      transform: translateX(-50%) translateY(-50%);
      &::before {
        content: '';
        width: 4px;
        height: 4px;
        border-radius: 4px;
        background-color: white;
        position: absolute;
        top: 0;
        left: 8px;
      }
      &::after {
        content: '';
        width: 4px;
        height: 4px;
        border-radius: 4px;
        background-color: white;
        position: absolute;
        top: 16px;
        left: 8px;
      }
      > span:before {
        content: '';
        width: 4px;
        height: 4px;
        border-radius: 4px;
        background-color: white;
        position: absolute;
        top: 8px;
        left: 8px;
      }
    }
  }
}
</style>
