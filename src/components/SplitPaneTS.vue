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
            <div class="handle-open-icon">
              <v-icon>{{ getToggleOption.icon }}</v-icon>
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
  icon: string;
  style: object;
}

@Component
export default class SplitPane extends Vue {
  @Prop({
    type: Boolean,
    required: false,
    default: false,
  })
  readonly vertical: boolean

  @Prop({
    type: Boolean,
    required: false,
    default: false,
  })
  readonly useToggle: boolean

  @Prop({
    type: Object,
    default: () => ({
      showHandle: TOGGLE_OPTION.SHOW_HANDLE, // handle 표시 여부
      toggleSize: TOGGLE_OPTION.TOGGLE_SIZE, // toggle btn size
      icon: TOGGLE_OPTION.ICON, // mdi-icon name
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
    default: true,
  })
  readonly largeHandle: boolean

  private active = false;

  private hasMoved = false;

  private type = this.vertical ? 'height' : 'width';

  private splitClass = this.vertical ? 'split vertical' : 'split horizontal';

  private pixel: number|null = null;

  get currentPixel(): number {
    return this.pixel || 0;
  }

  get paneStyles(): object {
    if (!this.currentPixel && this.currentPixel !== 0) {
      const initSize = typeof this.size === 'number' ? `${this.size}px` : this.size;
      return {
        left: {
          flex: '0 0 auto',
          [this.type]: initSize,
        },
        right: {
          flex: 1,
        },
      };
    }
    return {
      left: {
        [this.type]: `${this.currentPixel}px`,
      },
      right: {
        [this.type]: `${this.pageSize - this.currentPixel}px`,
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

    const minSize = SplitPane.getPixel(this.minSize);

    if (!minSize) return false;

    return this.currentPixel <= minSize;
  }

  get pageSize(): number {
    if (!this.$refs.splitBase) return 0;
    const { offsetWidth, offsetHeight } = this.$refs.splitBase as HTMLElement;
    const pageSize = this.vertical ? offsetHeight : offsetWidth;
    const { boxOffset } = this.getOffset(this.$refs.splitBase as HTMLElement);
    return pageSize - boxOffset;
  }

  get splitStyle(): object {
    const cursor = this.vertical ? 'row-resize' : 'col-resize';
    return {
      userSelect: this.active ? 'none' : '',
      cursor: this.active ? cursor : '',
    };
  }

  get getToggleOption(): ToggleOptions {
    const {
      showHandle,
      toggleSize,
      icon,
      style,
    } = this.toggleOption;

    return {
      showHandle: showHandle || TOGGLE_OPTION.SHOW_HANDLE,
      toggleSize: toggleSize || TOGGLE_OPTION.TOGGLE_SIZE,
      icon: icon || TOGGLE_OPTION.ICON,
      style: style || {},
    };
  }

  mounted() {
    this.pixel = SplitPane.getPixel(this.size, this.pageSize);
  }

  static getSize(value: number|string) {
    if (!value) return null;
    if (typeof value === 'number') return { type: 'px', value };
    const nValue = parseInt(value.replace(/(px|%)/, ''), 10);
    if (Number.isNaN(nValue)) return null;
    if (value.indexOf('px') > -1) return { type: 'px', value: nValue };
    if (value.indexOf('%') > -1) return { type: '%', value: nValue };
    return null;
  }

  public handleMouseDown() {
    this.active = true;
    this.hasMoved = false;
  }

  public handleMouseUp() {
    this.active = false;
  }

  public handleMouseMove(e: MouseEvent) {
    if (e.buttons === 0 || e.which === 0) {
      this.active = false;
    }

    if (this.active) {
      const { offset, boxOffset } = this.getOffset(e.currentTarget as HTMLElement);

      const currentPage = this.vertical ? e.pageY : e.pageX;
      const { offsetHeight, offsetWidth } = e.currentTarget as HTMLElement;
      const targetOffset = (
        this.vertical
          ? offsetHeight
          : offsetWidth
      );
      const pageSize = targetOffset - boxOffset;
      const pixel = currentPage - offset;
      this.setPixel(pixel, pageSize);
    }
    this.hasMoved = false;
  }

  public getOffset(element: HTMLElement) {
    let offset = 0;
    let boxOffset = 0;
    let target = element;
    while (target) {
      offset += this.vertical ? target.offsetTop : target.offsetLeft;
      const styles = window.getComputedStyle(target);
      boxOffset += this.vertical
        ? parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)
        : parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      boxOffset += this.vertical
        ? parseFloat(styles.marginLeft) + parseFloat(styles.marginRight)
        : parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
      target = target.offsetParent as HTMLElement;
    }
    return {
      offset,
      boxOffset,
    };
  }

  public setPixel(pixel: number, pageSize: number) {
    const minPixel = SplitPane.getPixel(this.minSize, pageSize);

    if (minPixel && pixel < minPixel) {
      this.pixel = minPixel;
      return;
    }

    if (this.validMinRight && minPixel && pixel > pageSize - minPixel) {
      this.pixel = pageSize - minPixel;
      return;
    }

    const maxPixel = SplitPane.getPixel(this.maxSize, pageSize);

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

  static getPixel(size: number|string, pageSize?: number) {
    const sizeInfo = SplitPane.getSize(size);

    if (!sizeInfo) return null;

    const { type, value } = sizeInfo;

    if (type === '%') {
      if (!pageSize) return 0;

      return (pageSize * value) / 100;
    }

    return value;
  }

  public handleOpenArea() {
    this.pixel = null;
  }
}
</script>
<style lang="scss" scoped>
.split {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  > .pane {
    height: 100%;
    position: relative;
    outline: none;
  }
  > .handle {
    position: relative;
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

  &.horizontal {
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
  &.vertical {
    flex-direction: column;
    > .pane {
      width: 100%;
      height: 50%;
    }
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
    > .handle-open-icon {
      color: white;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translateX(-50%) translateY(-50%);
    }
  }
}
</style>
