<template>
  <a-config-provider :theme="themeConfig" :locale="language">
    <!-- 上1中2下1布局 三段各占1行 -->
    <a-layout style="height: 100vh;">
      <a-layout-sider class="siderStyle" v-model:collapsed="collapsed">
        <MenuBar :collapsed="collapsed"/>
      </a-layout-sider>

      <a-layout>
        <a-layout-header class="headerStyle">
          <a-button type="primary" @click="toggleCollapsed">
            <MenuUnfoldOutlined v-if="collapsed"/>
            <MenuFoldOutlined v-else/>
          </a-button>

          <!-- 面包屑 -->
          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
              <span v-if="index === breadcrumbList.length - 1">{{ item.title }}</span>
              <a v-else @click="goTo(item.path)">{{ item.title }}</a>
            </a-breadcrumb-item>
          </a-breadcrumb>

          <!-- 调色板组件 -->
          <ColorPicker :value="primaryColor" @change="handleColorChange"/>
        </a-layout-header>

        <a-layout-content class="contentStyle">
          <router-view/>
        </a-layout-content>

        <a-layout-footer class="footerStyle">Copyright © 2025 All Rights Reserved</a-layout-footer>
      </a-layout>

    </a-layout>
  </a-config-provider>
</template>

<script>
import ColorPicker from "@/components/ColorPicker.vue";
import {MenuFoldOutlined, MenuUnfoldOutlined} from '@ant-design/icons-vue';
import MenuBar from '@/components/layout/MenuBar.vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';

export default {
  name: "HomeIndex",
  components: {ColorPicker, MenuBar, MenuUnfoldOutlined, MenuFoldOutlined},
  data() {
    return {
      primaryColor: '#1890ff',
      collapsed: false,
      breadcrumbList: [],
      language: zhCN
    }
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
  computed: {
    themeConfig() {
      return {
        token: {
          colorPrimary: this.primaryColor
        }
      }
    }
  },

  mounted() {
    const saved = localStorage.getItem('antd-primary-color')
    if (saved && /^#[0-9A-Fa-f]{6}$/.test(saved)) {
      this.primaryColor = saved
    }
  },

  methods: {
    handleColorChange(newColor) {
      this.primaryColor = newColor
      localStorage.setItem('antd-primary-color', newColor)
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
    },
    updateBreadcrumb(route) {
      const matched = route.matched.filter(item => item.name); // 过滤掉无名路由
      this.breadcrumbList = matched.map(item => ({
        title: item.meta?.title || item.name || '未知页面',
        path: item.path,
      }));
    },
    goTo(path) {
      if (path && this.$route.path !== path) {
        this.$router.push(path);
      }
    },
  }
}
</script>

<style scoped>
.headerStyle {
  min-height: 10vh;
  padding-inline: 20px;
  line-height: 64px;
  background-color: white;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap; /* 小屏时换行 */
  gap: 16px;
  /*justify-content: space-between;*/
}

.contentStyle {
  flex: 1;
  overflow: auto;
  padding: 2px;
  box-sizing: border-box;
}

.footerStyle {
  text-align: center;
  color: #333;
  background-color: #f0f2f5;
  padding: 12px 0;
  font-size: 12px;
  border-top: 1px solid #e8e8e8;
}

.breadcrumb {
  padding: 8px 0;
  font-size: 14px;
}
</style>