<!-- PermissionMenu.vue -->
<template>
  <div class="menubar-main">
    <div class="user-info">
      <a-avatar size="large" :style="{ backgroundColor: '#1d83ff', verticalAlign: 'middle',margin: '0 16px'}" :gap="2">
        {{ currentUser.name }}
      </a-avatar>
      <a-tag color="blue">
        {{ currentUser.rname + '(' + currentUser.rcode + ')' }}
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
  InboxOutlined,
  LogoutOutlined,
  MenuOutlined,
  SettingOutlined,
  UserOutlined
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
          no_permission: true,
        },
        {
          label: '系统管理',
          key: 'System',
          icon: MenuOutlined,
          children: [
            {label: '系统列表', key: 'SystemList'},
            {label: '角色管理', key: 'RoleList'},
            {label: '权限管理', key: 'PermissionList'},
          ],
        },
        {
          label: '用户管理',
          key: 'UserList',
          icon: UserOutlined
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
            {label: 'Option 1', key: 'other1'},
            {label: 'Option 2', key: 'other2'},
            {label: 'Option 3', key: 'other3'},
          ],
        },
        {
          label: '退出',
          key: 'Logout',
          icon: LogoutOutlined,
          no_permission: true,
        },
      ],
    };
  },
  async mounted() {
    // 模拟：从 store / API / props 获取当前用户权限
    // 实际项目中，可能来自 this.$store.state.user.permissions 或 route meta 等
    const userPermissions = await this.getUserPermissions(); // 返回 string[]，如 ['1', '2', '5', '7']

    // 转为 Set 提升查找效率
    const allowedKeys = new Set(userPermissions);

    // 收集所有可能的根 submenu keys（用于控制展开逻辑）
    this.rootSubmenuKeys = this.extractRootSubmenuKeys(this.fullMenuConfig);

    // 过滤菜单
    this.items = this.filterMenuByPermission(this.fullMenuConfig, allowedKeys);

    // 初始化 selectedKeys 为当前路由的 key
    this.selectedKeys = [this.$route.name];
  },

  methods: {
    async getUserPermissions() {
      try {
        // 从本地获取用户权限
        let rolePermission = JSON.parse(localStorage.getItem('role_permission'))

        if (!rolePermission) {
          // 若无 则从API获取当前登录用户权限
          const response = await this.$api.post('RolePermissionQuery', {'role_id': this.currentUser?.rid})
          rolePermission = response.data
          localStorage.setItem('role_permission', JSON.stringify(rolePermission))
        }

        // 返回权限代码数组
        return Array.isArray(rolePermission)
            ? rolePermission.filter(i => i.category === 'menu').map(i => String(i.code)) : []
      } catch (error) {
        console.error('获取用户权限失败:', error);
        return [];
      }
    },

    getItem(label, key, icon = null, children = [], type = undefined) {
      return {key, icon, children: children.length > 0 ? children : undefined, label, type,}
    },

    filterMenuByPermission(menuItems, allowedKeys, parentPath = '') {
      const result = [];

      for (const item of menuItems) {
        const {key, label, icon, children, no_permission = false} = item

        if (no_permission) {
          // 有 no_permission 标识的菜单不参与权限检查，直接添加
          result.push(this.getItem(label, key, h(icon), children));
          continue;
        }

        // 构建当前菜单的完整路径
        const currentPath = parentPath ? `${parentPath}:${key}` : key;

        // 检查当前菜单是否有权限
        const hasPermission = this.checkPermission(currentPath, allowedKeys, children);

        if (hasPermission) {
          if (!children || children.length === 0) {
            // 叶子节点，直接添加
            result.push(this.getItem(label, key, h(icon)));
          } else {
            // 递归处理子菜单
            const filteredChildren = this.filterMenuByPermission(children, allowedKeys, currentPath);

            // 只有当子菜单中有权限项时才添加父菜单
            if (filteredChildren.length > 0) {
              result.push(this.getItem(label, key, h(icon), filteredChildren));
            } else {
              // 检查是否父菜单有通配符权限，这种情况下也应该显示父菜单
              if (allowedKeys.has(`${currentPath}:*`)) {
                result.push(this.getItem(label, key, h(icon), filteredChildren));
              }
            }
          }
        } else if (children && children.length > 0) {
          // 当前菜单无权限，但子菜单可能有权限，仍需检查子菜单
          const filteredChildren = this.filterMenuByPermission(children, allowedKeys, currentPath);
          if (filteredChildren.length > 0) {
            // 如果子菜单有权限，则父菜单也需要显示以便访问子菜单
            result.push(this.getItem(label, key, h(icon), filteredChildren));
          }
        }
      }

      return result;
    },

    // 权限检查逻辑
    checkPermission(currentPath, allowedKeys, children) {
      // 检查是否有通配符权限
      if (allowedKeys.has('*')) {
        return true;
      }

      // 检查是否有直接权限
      if (allowedKeys.has(currentPath)) {
        return true;
      }

      // 检查通配符权限 (例如 'Prod:*')
      const wildcardKey = `${currentPath}:*`;
      if (allowedKeys.has(wildcardKey)) {
        return true;
      }

      // 如果是叶子节点，检查是否存在以当前路径为前缀的权限
      if (!children || children.length === 0) {
        for (const perm of allowedKeys) {
          if (perm.startsWith(currentPath + ':') || perm === currentPath) {
            return true;
          }
        }
      }

      return false;
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
            this.$router.push({name: key});
          } else {
            this.$message.error(`路由 ${key} 不存在`);
          }
      }
    },
  },
  created() {
    // 页面加载时尝试读取"记住我"的用户名
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