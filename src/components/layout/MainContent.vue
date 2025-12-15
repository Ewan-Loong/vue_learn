<!-- layouts/BasicLayout.vue -->
<template>
  <div class="basic-layout">
    <!-- 内容区域 -->
    <div class="content-wrapper">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainContent',
  data() {
    return {
      breadcrumbList: [],
    };
  },
  watch: {
    // 监听路由变化，更新面包屑
    $route: {
      immediate: true,
      handler(newRoute) {
        this.updateBreadcrumb(newRoute);
      },
    },
  },
  methods: {
    updateBreadcrumb(route) {
      const matched = route.matched.filter(item => item.name); // 过滤掉无名路由
      const breadcrumb = matched.map(item => ({
        title: item.meta?.title || item.name || '未知页面',
        path: item.path,
      }));
      this.breadcrumbList = breadcrumb;
    },
    goTo(path) {
      if (path && this.$route.path !== path) {
        this.$router.push(path);
      }
    },
  },
};
</script>

<style scoped>
.basic-layout {
  width: 100%;
  height: 100%;
  background-color: #fff;
  padding: 0 24px; /* 外部左右留白 */
}

.breadcrumb {
  padding: 8px 0;
  font-size: 14px;
}

.content-wrapper {
  padding: 0 0 24px; /* 底部留白，可选 */
}
</style>