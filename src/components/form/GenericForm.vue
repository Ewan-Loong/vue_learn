<template>
  <a-spin :spinning="loading" size="large" tip="加载中...">
    <div v-show="!loading" class="generic-form-container" :style="{ maxHeight, overflowY: 'auto' }">
      <div v-if="title" class="form-title">
        <h2>{{ title }}</h2>
      </div>
      <a-form
          ref="formRef"
          :model="formData"
          layout="horizontal"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          :colon="false"
      >
        <a-row :gutter="[0, 16]">
          <a-col v-for="item in visibleItems" :key="item.dataIndex" :span="24">
            <a-form-item
                :label="item.title"
                :name="item.dataIndex"
                :rules="getRules(item)"
            >
              <!-- string / text -->
              <a-input
                  v-if="!item.type || item.type === 'string'"
                  v-model:value="formData[item.dataIndex]"
                  :placeholder="`请输入${item.title}`"
                  :disabled="!isEditable(item)"
                  style="width: 100%"
              />

              <!-- password -->
              <a-input-password
                  v-else-if="item.type === 'password'"
                  v-model:value="formData[item.dataIndex]"
                  :disabled="!isEditable(item)"
                  style="width: 100%"
                  :placeholder="`请输入${item.title}`"
              />

              <!-- number -->
              <a-input-number
                  v-else-if="item.type === 'number'"
                  v-model:value="formData[item.dataIndex]"
                  :disabled="!isEditable(item)"
                  style="width: 100%"
                  :placeholder="`请输入${item.title}`"
              />

              <!-- date -->
              <a-date-picker
                  v-else-if="item.type === 'date'"
                  v-model:value="formData[item.dataIndex]"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  :disabled="!isEditable(item)"
                  style="width: 100%"
                  :placeholder="`请选择${item.title}`"
              />

              <!-- datetime -->
              <a-date-picker
                  v-else-if="item.type === 'datetime'"
                  v-model:value="formData[item.dataIndex]"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  show-time
                  :disabled="!isEditable(item)"
                  style="width: 100%"
                  :placeholder="`请选择${item.title}`"
              />

              <!-- select -->
              <a-select
                  v-else-if="item.type === 'select'"
                  v-model:value="formData[item.dataIndex]"
                  :placeholder="`请选择${item.title}`"
                  :disabled="!isEditable(item)"
                  style="width: 100%"
                  :options="item.options"
                  :allowClear="!item.required && isEditable(item)"
              />

              <!-- switch -->
              <a-switch
                  v-else-if="item.type === 'switch'"
                  v-model:checked="formData[item.dataIndex]"
                  :disabled="!isEditable(item)"
                  :checked-children="item.checkedText || '是'"
                  :un-checked-children="item.unCheckedText || '否'"
              />

              <!-- radio -->
              <a-radio-group
                  v-else-if="item.type === 'radio'"
                  v-model:value="formData[item.dataIndex]"
                  :disabled="!isEditable(item)"
                  style="width: 100%"
              >
                <a-radio
                    v-for="opt in item.options"
                    :key="opt.value"
                    :value="opt.value"
                    :disabled="!isEditable(item)"
                >
                  {{ opt.label }}
                </a-radio>
              </a-radio-group>

              <!-- checkbox -->
              <a-checkbox-group
                  v-else-if="item.type === 'checkbox'"
                  v-model:value="formData[item.dataIndex]"
                  :disabled="!isEditable(item)"
                  style="width: 100%"
              >
                <a-checkbox
                    v-for="opt in item.options"
                    :key="opt.value"
                    :value="opt.value"
                    :disabled="!isEditable(item)"
                >
                  {{ opt.label }}
                </a-checkbox>
              </a-checkbox-group>

              <!-- tree -->
              <a-tree-select
                  v-else-if="item.type === 'tree'"
                  v-model:value="formData[item.dataIndex]"
                  :tree-data="item.options"
                  :tree-checkable="item.multiple"
                  allow-clear
                  :placeholder="`请选择${item.title}`"
                  :tree-node-filter-prop="item.fieldNames.label"
                  :field-names="item.fieldNames"
              />

              <!-- fallback -->
              <a-input
                  v-else
                  v-model:value="formData[item.dataIndex]"
                  :placeholder="`请输入${item.title}`"
                  :disabled="!isEditable(item)"
                  style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <div v-if="showFooter" class="form-footer">
        <a-space>
          <a-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ mode === 'create' ? '新建' : '保存' }}
          </a-button>
          <a-button @click="handleCancel">取消</a-button>
        </a-space>
      </div>
    </div>
  </a-spin>
</template>

<script>
export default {
  name: 'GenericForm',
  props: {
    title: {type: String, default: ''},
    formItems: {
      type: Array,
      required: true,
      default: () => [],
      validator(items) {
        return items.every(
            item =>
                typeof item.dataIndex === 'string' &&
                typeof item.title === 'string'
        );
      },
    },
    initialValues: {type: Object, default: () => ({})},
    showFooter: {type: Boolean, default: true},
    maxHeight: {type: [String, Number], default: 'none'},
    labelCol: {type: Object, default: () => ({span: 6})},
    wrapperCol: {type: Object, default: () => ({span: 18})},
    loading: {type: Boolean, default: false},
    mode: {type: String, default: 'create',},
    submitting: {type: Boolean, default: false},
  },

  emits: ['submit', 'cancel'],

  data() {
    return {
      formData: {},
    };
  },

  computed: {
    visibleItems() {
      return this.formItems.filter(item => {
        // 新建模式下，若 showInAdd !== false，则显示
        if (this.mode === 'create') {
          return item.showInAdd !== false;
        }
        // 编辑模式下，若 showInEdit !== false，则显示
        else if (this.mode === 'edit') {
          return item.showInEdit !== false;
        }
        return true;
      });
    },
  },

  watch: {
    initialValues: {
      handler(newVal) {
        this.initFormData(newVal);
      },
      immediate: true,
      deep: true,
    },
  },

  methods: {
    initFormData(initial = {}) {
      const data = {...initial};
      this.visibleItems.forEach(item => {
        if (!(item.dataIndex in data)) {
          data[item.dataIndex] = this.getDefaultValueByType(item.type);
        }
      });
      this.formData = data;
    },

    getDefaultValueByType(type) {
      if (type === 'number') return undefined;
      if (type === 'date' || type === 'datetime') return null;
      if (type === 'checkbox' || type === 'tree') return [];
      return '';
    },

    isEditable(item) {
      return item.editable !== false;
    },

    getRules(item) {
      const rules = [];

      if (item.required) {
        let validator = null;

        // 特殊类型需自定义 validator
        if (item.type === 'checkbox' || item.type === 'tree') {
          validator = (_, value) =>
              Array.isArray(value) && value.length > 0
                  ? Promise.resolve()
                  : Promise.reject(new Error(`请至少选择一项${item.title}`));
        } else if (item.type === 'number') {
          validator = (_, value) =>
              value != null && value !== ''
                  ? Promise.resolve()
                  : Promise.reject(new Error(`${item.title}不能为空`));
        } else if (item.type === 'radio' || item.type === 'select') {
          validator = (_, value) =>
              value !== undefined && value !== null
                  ? Promise.resolve()
                  : Promise.reject(new Error(`${item.title}不能为空`));
        }

        rules.push({
          required: true,
          message: `${item.title}不能为空`,
          validator, // 对普通 input 可为 null，AntD 会自动校验非空
        });
      }

      // 2. 合并用户自定义 rules
      if (Array.isArray(item.rules)) {
        for (const rule of item.rules) {
          if (typeof rule === 'function') {
            // 自定义校验规则
            rules.push({validator: rule});
          } else if (rule && typeof rule === 'object') {
            // 普通规则对象，如 { pattern, message } 或 { required, ... }
            rules.push(rule);
          }
        }
      }

      return rules;
    },

    handleCancel() {
      this.$emit('cancel');
    },

    async handleSubmit() {
      try {
        await this.$refs.formRef.validate();
        this.$emit('submit', {...this.formData});
      } catch (error) {
        console.warn('表单验证失败:', error);
      }
    },
  },
};
</script>

<style scoped>
.generic-form-container {
  padding: 0 12px;
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: rgba(0, 0, 0, 0.85);
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.form-footer {
  margin-top: 24px;
  text-align: right;
}
</style>