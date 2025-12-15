<template>
  <a-layout class="tag-manager-layout">
    <a-layout-content class="layout-content">
      <a-row :gutter="24" class="main-content">
        <!-- 左侧树 -->
        <a-col :span="16">
          <a-spin :spinning="treeLoading" class="">
            <a-tree
                :tree-data="treeData"
                :selected-keys="selectedKeys"
                @select="onSelect"
                :field-names="fieldNames"
                style="height: calc(100vh - 180px); overflow-y: auto"
            >
              <template #title="{ tid, tname }">
                <span class="tree-node-title">{{ tid }} {{ tname }}</span>
                <div class="tree-node-actions">
                  <a-button size="small" type="link" @click.stop="openAddModal(tid)">
                    新增
                  </a-button>
                  <a-button size="small" type="link" @click.stop="openEditModal(tid, tname)">
                    编辑
                  </a-button>
                  <a-popconfirm
                      title="确定删除该标签及所有子标签？"
                      ok-text="确定"
                      cancel-text="取消"
                      @confirm="handleDelete(tid)"
                  >
                    <a-button size="small" type="link" danger>删除</a-button>
                  </a-popconfirm>
                </div>
              </template>
            </a-tree>
          </a-spin>
        </a-col>

        <!-- 右侧说明 -->
        <a-col :span="8">
          <a-alert
              message="操作说明"
              description="• 新增：在当前父标签下新增子标签
• 编辑：编辑当前标签的信息
• 删除：会级联删除标签本身其所有子标签
• 注意：新增/编辑标签时,不填父标签,默认在根节点新增/编辑"
              type="info"
              show-icon
          />
        </a-col>
      </a-row>
    </a-layout-content>

    <!-- 使用抽象 ModalForm 组件 -->
    <ModalForm
        v-model:open="modalVisible"
        :form-items="formItems"
        :initial-values="modalInitialValues"
        :submitting="confirmLoading"
        :mode="editingTid ? 'edit' : 'create'"
        @submit="handleModalSubmit"
        @cancel="handleModalCancel"
    />
  </a-layout>
</template>

<script>
import ModalForm from '@/components/form/ModalForm.vue';
import {CheckedRange} from "@/utils/formValidators";

export default {
  name: 'ProdTag',
  components: {
    ModalForm
  },
  data() {
    return {
      treeData: [],
      selectedKeys: [],
      modalVisible: false,
      confirmLoading: false,
      editingTid: null,
      treeLoading:false,
      // ModalForm 的 initialValues（响应式）
      modalInitialValues: {},

      // 表单字段配置
      formItems: [
        {
          title: '标签名称', dataIndex: 'tname', key: 'tname',
          rules: [
            {required: true, message: '请输入标签名称', trigger: 'blur'},
            {max: 32, message: '最多32个字符', trigger: 'blur'}
          ]
        },
        {
          title: '父级标签',
          dataIndex: 'ptid',
          key: 'ptid',
          type: 'tree',
          options: [],
          multiple: false,
          fieldNames: {children: 'child', label: 'tname', value: 'tid'},
          rules: [CheckedRange({max: 3})]
        },
      ],

      fieldNames: {
        children: 'child',
        title: 'tname',
        key: 'tid',
        label: 'tname',
        value: 'tid'
      }
    };
  },

  watch: {
    // 当 treeData 更新时，动态注入到 formItems[1].props.treeData
    treeData: {
      handler(newVal) {
        if (this.formItems[1]) {
          this.formItems[1].options = newVal
        }
      },
      immediate: true
    }
  },

  methods: {
    async loadTree() {
      this.treeLoading = true;
      try {
        const res = await this.$api.get('TagQuery');
        this.treeData = res.data || [];
      } catch (error) {
        console.error('加载标签树失败:', error);
        this.treeData = [];
      } finally {
        this.treeLoading = false;
      }
    },

    // getAllTids(nodes, tids = []) {
    //   for (const node of nodes) {
    //     tids.push(node.tid);
    //     if (node.child?.length) {
    //       this.getAllTids(node.child, tids);
    //     }
    //   }
    //   return tids;
    // },

    onSelect(keys) {
      this.selectedKeys = keys;
    },

    openAddModal(parentId) {
      this.editingTid = null;
      this.modalInitialValues = {
        tname: '',
        ptid: parentId || null
      };
      this.modalVisible = true;
    },

    openEditModal(tid, tname) {
      const findNode = (nodes, id) => {
        for (const node of nodes) {
          if (node.tid === id) return node;
          if (node.child?.length) {
            const found = findNode(node.child, id);
            if (found) return found;
          }
        }
        return null;
      };

      this.editingTid = tid;
      this.modalInitialValues = {
        tname: tname,
        ptid: findNode(this.treeData, tid)?.ptid ?? null
      };
      this.modalVisible = true;
    },

    async handleModalSubmit(data) {
      this.confirmLoading = true;
      try {
        if (this.editingTid !== null) {
          await this.$api.post('TagUpdate', {...data, tid: this.editingTid});
        } else {
          await this.$api.post('TagAdd', data);
        }
        this.$message.success('操作成功');
        this.modalVisible = false;
        this.loadTree();
      } catch (error) {
        console.error(error);
        this.$message.error('操作失败，请重试');
      } finally {
        this.confirmLoading = false;
      }
    },

    handleModalCancel() {
      this.modalVisible = false;
    },

    handleDelete(tid) {
      this.$api.post(`TagDelete`, {tid: tid})
          .then(() => {
            this.$message.success('删除成功');
            this.loadTree();
          })
    }
  },

  mounted() {
    this.loadTree();
  }
};
</script>

<style scoped>
.tag-manager-layout {
  height: 100vh;
  background-color: #f0f2f5;
}

.layout-content {
  padding: 12px 24px;
  height: 100%;
}

.page-header h2 {
  margin: 0 0 24px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.main-content {
  background: #fff;
  padding: 12px 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  height: 100%;
}

.tree-node-title {
  display: inline-block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.tree-node-actions {
  display: inline-block;
  margin-left: 12px;
  vertical-align: middle;
}

:deep(.ant-alert-description) {
  white-space: pre-line;
}
</style>