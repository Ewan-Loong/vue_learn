<template>
  <a-result
      status="404"
      sub-title="抱歉，您访问的页面不存在。"
      title="404"
  >
    <template #extra>
      <a-button type="primary" @click="goBack">返回上一页</a-button>
    </template>
  </a-result>
</template>

<script>
export default {
  name: 'NotFound',
  methods: {
    goBack() {
      // 尝试返回上一页
      this.$router.go(-1);

      // 若无历史记录1s后返回登录页 - 基本不触发
      // setTimeout(() => {
      //   if (this.$route.name === 'NotFound') {
      //     this.$router.push({ name: 'Login' });
      //   }
      // }, 1000);
    },
  },
};
</script>