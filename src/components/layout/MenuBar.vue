<!-- PermissionMenu.vue -->
<template>
  <div class="menubar-main">
    <div class="user-info">
      <a-avatar size="large" :style="{ backgroundColor: '#1d83ff', verticalAlign: 'middle',margin: '0 16px'}" :gap="2">
        {{ currentUser.name }}
      </a-avatar>
      <a-tag color="blue">
        超级管理员
      </a-tag>
    </div>

    <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        :open-keys="openKeys"
        :items="items"
        @openChange="onOpenChange"
        @click="onMenuClick"
        theme="dark"
    />
  </div>
</template>

<script>
import {h} from 'vue';
import {
  HomeOutlined,
  MenuOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  InboxOutlined
} from '@ant-design/icons-vue';

export default {
  name: 'MenuBar',
  data() {
    return {
      rootSubmenuKeys: [],
      openKeys: [],
      selectedKeys: [],
      items: [],
      currentUser: null,
      fullMenuConfig: [
        {
          label: '首页',
          key: 'Index',
          icon: HomeOutlined,
        },
        {
          label: '系统管理',
          key: 'System',
          icon: MenuOutlined,
          children: [
            {label: '系统列表', key: 'SystemList'},
            {label: '添加系统', key: 'system_add'},
            {label: '修改系统', key: 'system_edit'},
          ],
        },
        {
          label: '用户管理',
          key: 'User',
          icon: UserOutlined,
          children: [
            {label: '用户列表', key: 'UserList'},
            {label: '新增用户', key: 'UserAdd'},
            {
              label: '修改用户', key: 'UserUpdate',
              children: [
                {label: 'Option 1', key: 'e_user1'},
                {label: 'Option 2', key: 'e_user2'},
              ],
            },
          ],
        },
        {
          label: '产品管理',
          key: 'Prod',
          icon: InboxOutlined,
          children: [
            {label: '产品列表', key: 'ProdList'},
            {label: '产品标签', key: 'ProdTag'},
            {label: '产品库存', key: 'ProdStock'},
          ],
        },
        {
          label: '其他设置',
          key: 'other',
          icon: SettingOutlined,
          children: [
            {label: 'Option 1', key: 'other 1'},
            {label: 'Option 2', key: 'other 2'},
            {label: 'Option 3', key: 'other 3'},
          ],
        },
        {
          label: '退出',
          key: 'Logout',
          icon: LogoutOutlined,
        },
      ],
    };
  },
  async mounted() {
    // 模拟：从 store / API / props 获取当前用户权限
    // 实际项目中，可能来自 this.$store.state.user.permissions 或 route meta 等
    const userPermissions = this.getUserPermissions(); // 返回 string[]，如 ['1', '2', '5', '7']

    // 转为 Set 提升查找效率
    const allowedKeys = new Set(userPermissions);

    // 收集所有可能的根 submenu keys（用于控制展开逻辑）
    this.rootSubmenuKeys = this.extractRootSubmenuKeys(this.fullMenuConfig);

    // 过滤菜单
    this.items = this.filterMenuByPermission(this.fullMenuConfig, allowedKeys);

    // 默认展开第一个有权限的根菜单（可选）
    // const firstRootWithPermission = this.items.find(item => item.children)?.key;
    // if (firstRootWithPermission) {
    //   this.openKeys = [firstRootWithPermission];
    // }

    // 初始化 selectedKeys 为当前路由的 key
    this.selectedKeys = [this.$route.name];
  },

  methods: {
    // 模拟获取用户权限（实际应替换为真实逻辑）
    getUserPermissions() {
      // 示例：假设登录用户有权限访问这些菜单项
      return ['*'];
      // return this.$store.getters['user/permissions']; // Vuex 示例
      // return this.$route.meta.permissions; // 路由级权限示例
    },
    getItem(label, key, icon = null, children = [], type = undefined) {
      return {
        key,
        icon,
        children: children.length > 0 ? children : undefined,
        label,
        type,
      }
    },
    filterMenuByPermission(menuItems, allowedKeys) {
      const result = [];

      for (const item of menuItems) {
        const {key, label, icon, children} = item;

        // 如果是叶子节点（无 children），检查权限
        if (!children || children.length === 0) {
          if (allowedKeys.has(key) || allowedKeys.has('*')) {
            const iconVNode = h(icon);
            result.push(this.getItem(label, key, iconVNode));
          }
        } else {
          // 有子菜单：先递归过滤子项
          const filteredChildren = this.filterMenuByPermission(children, allowedKeys);

          // 只有当子菜单非空时，才保留父菜单
          if (filteredChildren.length > 0) {
            const iconVNode = h(icon);
            result.push(this.getItem(label, key, iconVNode, filteredChildren));
          }
          // 否则：子项全无权限，父菜单也不显示
        }
      }

      return result
    },

    // 提取所有根级 submenu 的 key（用于 onOpenChange 控制单开）
    extractRootSubmenuKeys(config) {
      // 只遍历最外层（一级菜单）
      return config.filter(item => item.children && item.children.length > 0).map(item => item.key);
    },

    onOpenChange(openKeys) {
      const latestOpenKey = openKeys.find(key => !this.openKeys.includes(key));
      if (latestOpenKey && this.rootSubmenuKeys.includes(latestOpenKey)) {
        this.openKeys = [latestOpenKey];
      } else {
        this.openKeys = openKeys;
      }
    },
    // 菜单点击事件回调函数 注意点击有子菜单item会触发openChange 不会触发该项
    async onMenuClick({key}) {
      // 完整参数 item, key, keyPath;
      switch (key) {
        case 'Logout':
          await this.$api.post('UserLogout', {uid: this.currentUser.uid, name: this.currentUser.name})
          this.$router.push({name: 'Login'})
          this.$message.success('登出成功！');
          break;
        default:
          if (this.$router.hasRoute(key)) {
            this.$router.push({ name: key });
          } else {
            this.$message.error(`路由 ${key} 不存在`);
          }
      }
    },
  },
  created() {
    // 页面加载时尝试读取“记住我”的用户名
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser) {
      this.currentUser = currentUser
    } else {
      this.$message.info('请先登录');
      this.$router.push('Login')
    }
  },
};
</script>

<style scoped>
.menubar-main {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.user-info {
  flex-direction: column;
  align-items: center;
  padding: 8px 0 8px 0;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 8px;
}

</style>