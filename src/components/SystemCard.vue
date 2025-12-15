<!-- components/SystemCard.vue -->
<template>
  <a-card
      class="system-card"
      :class="{ 'card-clickable': !!system.url }"
      @click="handleClick"
  >
    <template #title>
      <div class="card-title">
        <span>{{ system.name }}</span>
        <a-tag
            class="status-tag"
            :color="statusConfig.color"
            :icon="statusConfig.icon ? h(statusConfig.icon) : undefined"
        >
          {{ statusConfig.text }}
        </a-tag>
      </div>
    </template>

    <p class="card-description">
      {{ system.description }}
    </p>
  </a-card>
</template>

<script>
import {h} from 'vue';
import {CheckCircleOutlined, SyncOutlined, StopOutlined} from '@ant-design/icons-vue';

export default {
  name: 'SystemCard',
  props: {
    system: {
      type: Object,
      required: true,
      validator(value) {
        return value.name && value.url !== undefined;
      }
    }
  },
  setup() {
    return {
      h,
      CheckCircleOutlined,
      SyncOutlined,
      StopOutlined,
    };
  },
  computed: {
    statusConfig() {
      const config = {
        running: {
          text: '运行中',
          color: 'success',
          icon: this.CheckCircleOutlined,
        },
        maintenance: {
          text: '维护中',
          color: 'processing',
          icon: this.SyncOutlined,
        },
        offline: {
          text: '已下线',
          color: 'error',
          icon: this.StopOutlined,
        },
      };
      return config[this.system.status] || config.offline;
    }
  },
  methods: {
    handleClick() {
      if (this.system.url) {
        // 在新窗口打开系统
        window.open(this.system.url, '_blank', 'noopener,noreferrer');
      }
    }
  }
};
</script>

<style scoped>
.system-card {
  height: 100%;
  transition: box-shadow 0.3s, transform 0.2s;
}

.card-clickable {
  cursor: pointer;
}

.card-clickable:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-2px);
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.status-tag {
  margin-left: 12px;
  font-weight: normal;
}

.card-description {
  margin: 0;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.5;
}
</style>