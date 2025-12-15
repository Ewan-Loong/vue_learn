<template>
  <a-descriptions
      v-if="filteredFormItems && filteredFormItems.length"
      :column="column"
      bordered
      size="small"
      :class="['generic-desc', `desc-column-${column}`]"
  >
    <a-descriptions-item
        v-for="item in filteredFormItems"
        :key="item.dataIndex || item.key"
        :label="item.title"
    >
      {{ formatValue(item, record[item.dataIndex]) }}
    </a-descriptions-item>
  </a-descriptions>
  <div v-else>
    <p class="no-data">暂无详情信息</p>
  </div>
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: 'GenericDesc',
  props: {
    formItems: {
      type: Array,
      required: true,
      default: () => []
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
  computed: {
    filteredFormItems() {
      return this.formItems.filter(item =>
          item != null &&
          item.dataIndex != null &&
          item.dataIndex !== ''
      );
    }
  },
  methods: {
    formatValue(item, value) {
      if (!item) return '';
      if (value == null) return '';

      // 日期类型
      if (item.type === 'date' || item.type === 'datetime') {
        const d = dayjs(value);
        return d.isValid()
            ? d.format(item.type === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss')
            : '';
      }

      // 数字类型
      if (item.type === 'number') {
        return String(value);
      }

      // 选择类型
      if (['select', 'radio', 'checkbox', 'tree'].includes(item.type) && item.options) {
        if (item.type === 'select' || item.type === 'radio') {
          const option = item.options.find(opt => this.getNodeValue(opt, item) === value);
          return option ? this.getNodeLabel(option, item) : value;
        } else if (item.type === 'checkbox') {
          const selectedOptions = item.options.filter(opt => value.includes(this.getNodeValue(opt, item)));
          return selectedOptions.map(opt => this.getNodeLabel(opt, item)).join(', ');
        } else if (item.type === 'tree') {
          return this.getTreePaths(item, value);
        }
      }

      // 开关类型
      if (item.type === 'switch') {
        return value ? (item.checkedText || '是') : (item.unCheckedText || '否');
      }

      // 默认情况
      return String(value);
    },

    /**
     * 获取节点的值（使用 fieldNames 配置）
     * @param {Object} node - 节点对象
     * @param {Object} item - 表单项配置
     * @returns {string|number} 节点的值
     */
    getNodeValue(node, item) {
      const fieldNames = item.fieldNames || {};
      const valueField = fieldNames.value || 'value';
      return node[valueField];
    },

    /**
     * 获取节点的标签（使用 fieldNames 配置）
     * @param {Object} node - 节点对象
     * @param {Object} item - 表单项配置
     * @returns {string} 节点的标签
     */
    getNodeLabel(node, item) {
      const fieldNames = item.fieldNames || {};
      const labelField = fieldNames.label || 'label';
      return node[labelField];
    },

    /**
     * 获取树形结构的子节点字段（使用 fieldNames 配置）
     * @param {Object} item - 表单项配置
     * @returns {string} 子节点字段名
     */
    getTreeChildrenField(item) {
      const fieldNames = item.fieldNames || {};
      return fieldNames.children || 'children';
    },

    /**
     * @param {Object} item - 表单项配置
     * @param {string|number} value - 单个ID
     * @returns {string} 路径字符串
     */
    getTreePaths(item, value) {
      // 如果 value 不是数组，按单个ID处理（兼容旧逻辑）
      if (!Array.isArray(value)) {
        return this.getTreePath(item, value);
      }

      // 1. 提取所有叶子节点ID（通过 fieldNames.value）
      const ids = value.map(node => this.getNodeValue(node, item));

      // 2. 为每个ID获取路径
      const paths = ids.map(id => this.getTreePath(item, id));

      // 3. 过滤掉无效路径（如未找到的ID）
      const validPaths = paths.filter(path => path !== value);

      // 4. 返回竖线分隔的路径
      return validPaths.length > 0 ? validPaths.join(' | ') : value[0]?.tname || '';
    },

    /**
     * @param {Object} item - 表单项配置
     * @param {string|number} value - 单个ID
     * @returns {string} 路径字符串
     */
    getTreePath(item, value) {
      // 保持不变的树路径查找逻辑
      const targetId = String(value);
      const childrenField = this.getTreeChildrenField(item);
      const treeNodes = this.normalizeTreeOptions(item.options);

      const findNode = (node, path = []) => {
        if (String(this.getNodeValue(node, item)) === targetId) {
          return [...path, this.getNodeLabel(node, item)];
        }

        if (node[childrenField] && Array.isArray(node[childrenField])) {
          for (const child of node[childrenField]) {
            const result = findNode(child, [...path, this.getNodeLabel(node, item)]);
            if (result) return result;
          }
        }

        return null;
      };

      for (const node of treeNodes) {
        const path = findNode(node);
        if (path) {
          return path.join('>');
        }
      }

      return value; // 未找到时返回原始ID
    },

    // 保持不变的 normalizeTreeOptions 方法
    normalizeTreeOptions(options) {
      if (Array.isArray(options)) return options;
      if (options && typeof options === 'object') return [options];
      return [];
    }

  }
};
</script>

<style scoped>
.generic-desc {
  margin-top: 16px;
}

.no-data {
  color: #8c8c8c;
  text-align: center;
  padding: 16px 0;
}
</style>