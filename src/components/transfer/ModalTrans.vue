<template>
  <a-modal
      :title="mode === 'create' ? modalTitle+'新增' : modalTitle+'编辑'"
      :open="open"
      :mask-closable="false"
      :keyboard="true"
      :destroy-on-close="true"
      :confirm-loading="submitting"
      :width="width"
      :footer="null"
      @cancel="handleCancel"
  >
    <GenericTrans
        ref="transferRef"
        :data-source="dataSource"
        :target-keys="targetKeys"
        :selected-keys="selectedKeys"
        :titles="titles"
        :show-title="showTitle"
        :operations="operations"
        :list-style="listStyle"
        @submit="submit"
        :submitting="submitting"
        :loading="loading"
    />
  </a-modal>
</template>

<script>
import GenericTrans from '@/components/transfer/GenericTrans.vue';

export default {
  name: 'ModalTrans',
  components: {GenericTrans},
  props: {
    open: {type: Boolean, default: false,},
    width: {type: String, default: '720px'},
    loading: {type: Boolean,},
    dataSource: {type: Array[Object], required: true, default: () => [],},
    targetKeys: {type: Array[Object],},
    selectedKeys: {type: Array[Object],},
    titles: {type: Array,},
    modalTitle: {type: String,},
    showTitle: {type: String,},
    operations: {type: Array,},
    listStyle: {type: Object,},
    submitting: {type: Boolean, default: false,},
  },
  emits: ['cancel', 'update:open'],
  computed: {
    mode() {
      return (this.targetKeys?.length || 0) > 0 ? 'edit' : 'create';
    },
  },
  methods: {
    handleCancel() {
      this.$emit('update:open', false);
      this.$emit('cancel');
    },
    submit(data) {
      this.$emit('submit', data);
    },
  },
};
</script>

<style scoped>
:deep(.ant-modal-body) {
  padding: 16px 24px;
}
</style>