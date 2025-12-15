<template>
  <a-drawer
      :title="title"
      :open="open"
      placement="right"
      :width="isMobile ? '95vw' : 600"
      :destroy-on-close="true"
      @close="handleCancel"
  >
    <GenericDesc
        :form-items="formItems"
        :record="record"
        :column="column"
    />
  </a-drawer>
</template>

<script>
import GenericDesc from './GenericDesc.vue';

export default {
  name: 'DrawerDesc',
  components: {GenericDesc},
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
  emits: ['cancel', 'update:open'],
  data() {
    return {
      isMobile: window.innerWidth <= 768,
    };
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
    handleCancel() {
      this.$emit('update:open', false);
      this.$emit('cancel');
    }
  }
};
</script>