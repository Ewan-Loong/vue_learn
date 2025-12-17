<template>
  <div class="system-portal">
    <a-row :gutter="[16, 16]" class="card-grid">
      <a-col
          v-for="sys in systems"
          :key="sys.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
      >
        <SystemCard :system="sys"/>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import SystemCard from '@/components/SystemCard.vue';

export default {
  name: 'SystemList',
  components: {SystemCard},
  data() {
    return {
      systems: [
        {
          id: 'finance',
          name: '财务管理系统',
          url: 'https://finance.example.com',
          status: 'running', // 'running' | 'maintenance' | 'offline'
          description: '用于公司财务报销、预算审批、报表生成等核心财务管理功能。',
        },
        {
          id: 'hr',
          name: '人力资源系统',
          url: 'https://hr.example.com',
          status: 'maintenance',
          description: '员工档案、考勤、薪酬、招聘一体化管理平台。',
        },
        {
          id: 'crm',
          name: '客户关系管理系统',
          url: 'https://crm.example.com',
          status: 'running',
          description: '客户信息管理、销售漏斗跟踪、服务工单处理。',
        },
        {
          id: 'oa',
          name: '办公自动化系统',
          url: 'https://oa.example.com',
          status: 'offline',
          description: '内部流程审批、通知公告、文档协作平台。',
        },
      ]
    };
  }
};
</script>

<style scoped>
.system-portal {
  padding: 12px 24px;
}

.system-portal h2 {
  margin-bottom: 24px;
  font-size: 20px;
  font-weight: 600;
}

.card-grid {
  /* 可选：限制最大宽度 */
  max-width: 1200px;
}
</style>