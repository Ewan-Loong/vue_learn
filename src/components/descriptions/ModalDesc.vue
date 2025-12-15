<template>
  <a-modal
      :title="title"
      :open="open"
      :mask-closable="false"
      :keyboard="true"
      :destroy-on-close="true"
      @ok="handleOk"
      @cancel="handleCancel"
      :width="600"
      :footer="null"
  >
    <GenericDesc
        :form-items="formItems"
        :record="record"
        :column="column"
    />
  </a-modal>
</template>

<script>
import GenericDesc from './GenericDesc.vue';

export default {
  name: 'ModalDesc',
  components: { GenericDesc },
  props: {
    open: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '详情'
    },
    formItems: {
      type: Array,
      required: true
    },
    record: {
      type: Object,
      default: () => ({})
    },
    column: {
      type: [Number, String],
      default: 1
    }
  },
  emits: ['ok', 'cancel', 'update:open'],
  methods: {
    handleOk() {
      this.$emit('ok');
    },
    handleCancel() {
      this.$emit('update:open', false);
      this.$emit('cancel');
    }
  }
};
</script>