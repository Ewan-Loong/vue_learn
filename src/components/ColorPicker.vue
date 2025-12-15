<template>
  <div class="theme-color-picker">
    <!-- 标题 -->
    <span class="picker-label">主题色:</span>

    <!-- 颜色输入框容器 -->
    <div class="color-input-wrapper">
      <!-- 原生颜色输入框 -->
      <input
          type="color"
          :value="value"
          @input="handleInput"
          class="color-input-native"
          aria-label="选择主题色"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorPicker',

  props: {
    // 当前主题色（如 #1890ff）
    value: {
      type: String,
      default: '#1890ff',
      validator: (val) => /^#([0-9A-Fa-f]{6})$/.test(val)
    }
  },

  emits: ['change'],

  methods: {
    // 输入事件处理
    handleInput(e) {
      const newColor = e.target.value
      // 触发 change 事件，通知父组件更新
      this.$emit('change', newColor)
    }
  }
}
</script>

<style scoped>
.theme-color-picker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 0 24px;
  margin-left: auto;
}

.picker-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}

.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 原生 color input 样式重置 */
.color-input-native {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  background: transparent;
  outline: none;
}

/* 自定义 input 的显示样式 */
.color-input-native::-webkit-color-swatch-wrapper {
  padding: 0;
  border: 2px solid #ddd;
  border-radius: 8px;
}

.color-input-native::-webkit-color-swatch {
  border: none !important;
  border-radius: 6px !important;
}
</style>