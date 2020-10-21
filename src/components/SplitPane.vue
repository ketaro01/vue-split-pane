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
              >
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
<script>
import { TOGGLE_OPTION } from '@/constants';

export default {
  name: 'SplitPane',
  props: {
    // 세로 모드 ( 높낮이 조절을 위한 )
    vertical: {
      type: Boolean,
      default: false,
    },
    // toggle
    useToggle: {
      type: Boolean,
      default: false,
    },
    toggleOption: {
      type: Object,
      default: () => ({
        showHandle: TOGGLE_OPTION.SHOW_HANDLE, // handle 표시 여부
        toggleSize: TOGGLE_OPTION.TOGGLE_SIZE, // toggle btn size
        icon: TOGGLE_OPTION.ICON, // mdi-icon name
        style: {},
      }),
    },
    minSize: {
      validator: (value) => (
        typeof value === 'number' || /^([0-9]+|[0-9]+(px|%))$/.test(value)
      ),
      type: [Number, String],
      default: null,
    },
    validMinRight: {
      type: Boolean,
      default: true,
    },
    maxSize: {
      validator: (value) => (
        typeof value === 'number' || /^([0-9]+|[0-9]+(px|%))$/.test(value)
      ),
      type: [Number, String],
      default: null,
    },
    size: {
      validator: (value) => (
        typeof value === 'number' || /^([0-9]+|[0-9]+(px|%))$/.test(value)
      ),
      type: [Number, String],
      default: 100,
    },
    largeHandle: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      active: false,
      hasMoved: false,
      type: this.vertical ? 'height' : 'width',
      splitClass: this.vertical ? 'split vertical' : 'split horizontal',
      pixel: null,
    };
  },
  computed: {
    paneStyles() {
      if (!this.pixel && this.pixel !== 0) {
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
          [this.type]: `${this.pixel}px`,
        },
        right: {
          [this.type]: `${this.pageSize - this.pixel}px`,
        },
      };
    },
    showToggle() {
      const { toggleSize } = this.getToggleOption;
      return this.useToggle && (this.isMinimum || this.pixel <= toggleSize);
    },
    showHandle() {
      return !this.showToggle || (this.showToggle && this.getToggleOption.showHandle);
    },
    isMinimum() {
      if (!this.pixel && this.pixel !== 0) return false;

      const minSize = this.getPixel(this.minSize);
      return minSize && this.pixel <= minSize;
    },
    pageSize() {
      if (!this.$refs.splitBase) return null;
      const { offsetWidth, offsetHeight } = this.$refs.splitBase;
      const pageSize = this.vertical ? offsetHeight : offsetWidth;
      const { boxOffset } = this.getOffset(this.$refs.splitBase);
      return pageSize - boxOffset;
    },
    splitStyle() {
      const cursor = this.vertical ? 'row-resize' : 'col-resize';
      return {
        userSelect: this.active ? 'none' : '',
        cursor: this.active ? cursor : '',
      };
    },
    getToggleOption() {
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
    },
  },
  mounted() {
    this.pixel = this.getPixel(this.size, this.pageSize);
  },
  methods: {
    getSize(value) {
      if (!value) return null;
      if (typeof value === 'number') return { type: 'px', value };
      const nValue = parseInt(value.replace(/(px|%)/, ''), 10);
      if (Number.isNaN(nValue)) return null;
      if (value.indexOf('px') > -1) return { type: 'px', value: nValue };
      if (value.indexOf('%') > -1) return { type: '%', value: nValue };
      return null;
    },
    /**
     * mousedown handler
     */
    handleMouseDown() {
      this.active = true;
      this.hasMoved = false;
    },
    /**
     * mouseup handler
     */
    handleMouseUp() {
      this.active = false;
    },
    /**
     * mousemove handler
     * @param e
     */
    handleMouseMove(e) {
      if (e.buttons === 0 || e.which === 0) {
        this.active = false;
      }

      if (this.active) {
        const { offset, boxOffset } = this.getOffset(e.currentTarget);

        const currentPage = this.vertical ? e.pageY : e.pageX;
        const targetOffset = (
          this.vertical
            ? e.currentTarget.offsetHeight
            : e.currentTarget.offsetWidth
        );
        const pageSize = targetOffset - boxOffset;
        const pixel = currentPage - offset;
        this.setPixel(pixel, pageSize);
      }
      this.hasMoved = false;
    },
    getOffset(element) {
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
        target = target.offsetParent;
      }
      return {
        offset,
        boxOffset,
      };
    },
    setPixel(pixel, pageSize) {
      const minPixel = this.getPixel(this.minSize, pageSize);

      if (minPixel && pixel < minPixel) {
        this.pixel = minPixel;
        return;
      }

      if (this.validMinRight && minPixel && pixel > pageSize - minPixel) {
        this.pixel = pageSize - minPixel;
        return;
      }

      const maxPixel = this.getPixel(this.maxSize, pageSize);

      if (maxPixel && pixel > maxPixel) {
        this.pixel = maxPixel;
        return;
      }

      if (pixel > pageSize) {
        this.pixel = pageSize;
        return;
      }

      this.pixel = pixel;
    },
    getPixel(size, pageSize) {
      const sizeInfo = this.getSize(size);

      if (!sizeInfo) return null;

      const { type, value } = sizeInfo;

      if (type === '%') {
        return (pageSize * value) / 100;
      }

      return value;
    },
    /**
     * pane area open
     */
    handleOpenArea() {
      this.pixel = null;
    },
  },
};
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
      background-color: rgb(0,0,0,0.3);
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
    background-color: rgb(0,0,0,0.3);
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
