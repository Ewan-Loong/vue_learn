<template>
  <a-modal
      :title="mode === 'create' ? '新建' : '编辑'"
      :open="open"
      :mask-closable="false"
      :keyboard="true"
      :destroy-on-close="true"
      @ok="submit"
      @cancel="handleCancel"
      :confirm-loading="submitting"
      width="600px"
  >
    <GenericForm
        ref="formRef"
        :form-items="formItems"
        :initial-values="initialValues"
        :max-height="'60vh'"
        :show-footer="false"
        :mode="mode"
        :submitting="submitting"
        @submit="handleSubmit"
        @cancel="handleCancel"
    />
  </a-modal>
</template>

<script>
import GenericForm from './GenericForm.vue';

export default {
  name: 'ModalForm',
  components: {GenericForm},
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    formItems: {
      type: Array,
      required: true,
    },
    initialValues: {
      type: Object,
      default: () => ({}),
    },
    submitting: {
      type: Boolean, default: false
    }
  },
  emits: ['submit', 'cancel', 'update:open'],
  computed: {
    mode() {
      return Object.keys(this.initialValues).length > 0 ? 'edit' : 'create';
    },
  },
  methods: {
    submit() {
      this.$refs.formRef.handleSubmit();
    },
    handleSubmit(data) {
      this.$emit('submit', data);
      // 父组件在 submit 成功后关闭 modal
    },
    handleCancel() {
      this.$emit('update:open', false);
      this.$emit('cancel');
    },
  },
};
</script>