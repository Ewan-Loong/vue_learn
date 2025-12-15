<template>
  <a-drawer
      :title="title"
      :open="open"
      placement="right"
      :width="isMobile ? '95vw' : 600"
      :destroy-on-close="true"
      @close="handleCancel"
  >
    <GenericTable
        :loading="loading"
        :raw-columns="rawColumns"
        :raw-data="rawData"
    />
  </a-drawer>
</template>

<script>
import GenericTable from "@/components/table/GenericTable.vue";

export default {
  name: 'DrawerTable',
  components: {GenericTable},
  props: {
    rawData: {type: Array, required: true, default: () => []},
    rawColumns: {type: Array, required: true, default: () => []},
    loading: {type: Boolean, default: false},
    open: {type: Boolean, default: false},
    title: {type: String, default: '详情'}
  },
  data() {
    return {
      isMobile: window.innerWidth <= 768,
    };
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