<template>
  <a-drawer
      :title="mode === 'create' ? title+'新建' : title+'编辑'"
      :open="open"
      placement="right"
      :width="isMobile ? '95vw' : 600"
      :destroy-on-close="true"
      @close="handleCancel"
  >
    <GenericForm
        ref="formRef"
        :form-items="formItems"
        :initial-values="initialValues"
        :max-height="'calc(100vh - 160px)'"
        :show-footer="false"
        :mode="mode"
        :submitting="submitting"
        @submit="handleSubmit"
        @cancel="handleCancel"
    />

    <template #footer>
      <a-space>
        <a-button type="primary" @click="submit" :loading="submitting">
          {{ mode === 'create' ? '新建' : '保存' }}
        </a-button>
        <a-button @click="handleCancel">取消</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script>
import GenericForm from './GenericForm.vue';

export default {
  name: 'DrawerForm',
  components: {GenericForm},
  props: {
    title: {type: String, default: ''},
    open: {type: Boolean, default: false,},
    formItems: {type: Array, required: true,},
    initialValues: {type: Object, default: () => ({}),},
    submitting: {type: Boolean, default: false}
  },
  emits: ['submit', 'cancel', 'update:open'],
  data() {
    return {
      isMobile: window.innerWidth <= 768,
    };
  },
  computed: {
    mode() {
      return Object.keys(this.initialValues).length > 0 ? 'edit' : 'create';
    },
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth <= 768;
    },
    submit() {
      this.$refs.formRef.handleSubmit();
    },
    handleSubmit(data) {
      this.$emit('submit', data);
      // 注意：不要在这里关闭抽屉，由父组件控制 open
    },
    handleCancel() {
      this.$emit('update:open', false);
      this.$emit('cancel');
    },
  },
};
</script>