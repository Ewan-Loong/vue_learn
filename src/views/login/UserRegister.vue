<template>
  <div class="register-container">
    <div class="register-card">
      <GenericForm
          title="注册新用户"
          :form-items="formConfig"
          :loading="formLoading"
          @submit="onSubmit"
          @cancel="onCancel"
      />
    </div>
  </div>
</template>

<script>
import {
  noSpecialChars,
  stringLength,
  notAfterToday,
  phoneRule,
  emailRule,
  passwordComplexity
} from '@/utils/formValidators';
import GenericForm from "@/components/form/GenericForm";

export default {
  components: {GenericForm},
  name: "UserRegister",
  data() {
    return {
      formLoading: false,
      formConfig: [
        {
          dataIndex: 'name',
          title: '用户名',
          type: 'string',
          required: true,
          rules: [
            noSpecialChars('用户名不能包含除下划线(_)外的特殊字符'),
            stringLength({min: 4, max: 20})
          ]
        },
        {
          dataIndex: 'email',
          title: '邮箱',
          type: 'string',
          rules: [emailRule()],
        },
        {
          dataIndex: 'phone',
          title: '手机号',
          type: 'string',
          rules: [phoneRule()]
        },
        {
          dataIndex: 'birthdt',
          title: '出生年月日',
          type: 'date',
          rules: [notAfterToday()]
        },
        {
          dataIndex: 'passwd',
          title: '密码',
          type: 'password',
          required: true,
          rules: [
            passwordComplexity(),
            stringLength({min: 8, max: 20})
          ]
        },
      ]
    };
  },
  methods: {
    async onSubmit(data) {
      try {
        console.log('提交:', data);
        // this.$api.post()
        this.$message.success('注册成功即将跳转登陆页面');
        this.$router.push('Login')
      } catch (error) {
        this.$message.error('注册失败', error);
      }
    },

    onCancel() {
      this.$router.push('Login')
    }
  },
};
</script>

<style scoped>
.register-container {
  background-image: url('/src/assets/background.png');
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.register-card {
  width: 100%;
  max-width: 400px;
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

</style>
