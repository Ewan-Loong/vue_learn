<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header"><h2>欢迎登录 XX后台系统</h2></div>
      <a-form
          ref="loginFormRef"
          :model="formState"
          :rules="rules"
          layout="horizontal"
          :label-col="{span: 6}"
          @finish="onFinish"
          autocomplete="off"
      >
        <!-- 用户名 -->
        <a-form-item name="username" label="用户名">
          <a-input
              v-model:value="formState.username"
              placeholder="请输入用户名"
              allow-clear
          />
        </a-form-item>

        <!-- 密码 -->
        <a-form-item name="password" label="密码">
          <a-input-password
              v-model:value="formState.password"
              placeholder="请输入密码"
              allow-clear
          />
        </a-form-item>

        <!-- 记住我 + 忘记密码 -->
        <a-form-item>
          <div class="extra-options">
            <a-checkbox v-model:checked="rememberMe">记住我</a-checkbox>
            <a @click="goToForgotPassword">忘记密码？</a>
          </div>
        </a-form-item>

        <!-- 登录按钮 -->
        <a-form-item>
          <a-button
              type="primary"
              html-type="submit"
              block
              :loading="loading"
              size="large"
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>

      <!-- 注册链接 -->
      <div class="login-footer">
        <a @click="goToRegister">注册新用户</a>
      </div>
    </div>
  </div>
</template>

<script>
// import md5 from '@/utils/md5';
import {noSpecialChars} from '@/utils/formValidators'

export default {
  name: 'UserLogin',
  components: {},
  data() {
    return {
      loading: false,
      rememberMe: false,
      formState: {
        username: '',
        password: '',
      },
      rules: {
        username: [{validator: noSpecialChars(), trigger: 'blur'}, {required: true, message: `用户名不能为空`}],
        // password: [{validator: passwordComplexity(), trigger: 'blur'}],
        password: [{validator: noSpecialChars(), trigger: 'blur'}, {required: true, message: `密码不能为空`}],
      },
    };
  },

  created() {
    // 页面加载时尝试读取“记住我”的用户名
    const saved = localStorage.getItem('login_username');
    if (saved) {
      this.formState.username = saved;
      this.rememberMe = true;
      this.$nextTick(() => {
        document.querySelector('.ant-input-password input')?.focus();
      });
    }
  },

  methods: {
    async onFinish() {
      try {
        this.loading = true;
        // MD5 加密密码（仅传输用，不影响表单显示）
        // const encryptedPassword = md5(this.formState.password).toString();
        // 模拟请求
        // await new Promise(resolve => setTimeout(resolve, 1000));

        // 实际请求示例：
        await this.$api.post('UserLogin', {
          name: this.formState.username,
          passwd: this.formState.password,
        }).then(response => {
          if (!response.user || !response.token) {
            this.$message.error(response.msg);
          } else {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            this.$message.success('登录成功！');
            this.$router.push({name: 'Home'});
          }
        })

        // 处理“记住我”
        if (this.rememberMe) {
          localStorage.setItem('login_username', this.formState.username);
        } else {
          localStorage.removeItem('login_username');
        }
      } catch (error) {
        // 表单验证错误
        if (error?.errorFields) {
          return;
        }
      } finally {
        this.loading = false;
      }
    },

    goToRegister() {
      this.$router.push({name: 'Register'});
    },

    goToForgotPassword() {
      this.$router.push({name: 'ForgotPassword'});
    },
  },
};
</script>

<style scoped>
.login-container {
  background-image: url('/src/assets/background.png');
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.login-header {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: rgba(0, 0, 0, 0.85);
  padding-bottom: 8px;
  border-bottom: 1px solid #d9d9d9;
}

.extra-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-footer {
  text-align: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #d9d9d9;
}

.login-footer a {
  color: #1890ff;
  text-decoration: none;
  font-size: 14px;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>