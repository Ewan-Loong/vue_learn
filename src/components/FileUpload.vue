<template>
  <div class="file-upload-container">
    <a-upload
        :custom-request="handleUpload"
        :show-upload-list="false"
        :accept="accept"
        :disabled="isBusy"
        v-model:file-list="fileList"
    >
      <a-button
          type="primary"
          class="upload-button"
          :class="{ 'busy': isBusy, 'has-message': shouldShowParseResult || isUploading }"
          :loading="false"
      >
        <!-- 上传中：进度条 -->
        <div v-if="isUploading" class="button-inner progress">
          <a-progress
              :percent="uploadProgress"
              :show-info="true"
              :stroke-width="4"
              stroke-color="#fff"
              size="small"
              class="inner-progress"
          />
        </div>

        <!-- 解析结果 -->
        <div v-else-if="shouldShowParseResult" class="button-inner result">
          <CheckCircleOutlined
              v-if="parseResult.status === 'success'"
              class="status-icon success"
          />
          <CloseCircleOutlined
              v-else-if="parseResult.status === 'error'"
              class="status-icon error"
          />
          <span class="result-text">{{ parseResult.message }}</span>
        </div>

        <!-- 默认状态 -->
        <div v-else class="button-inner default">
          <UploadOutlined class="default-icon"/>
          <span>{{ uploadButtonText }}</span>
        </div>
      </a-button>
    </a-upload>
  </div>
</template>

<script>
import {CheckCircleOutlined, CloseCircleOutlined, UploadOutlined} from '@ant-design/icons-vue';

export default {
  name: 'FileUpload',
  components: {CheckCircleOutlined, CloseCircleOutlined, UploadOutlined},
  props: {
    uploadApi: {type: String, required: true},
    parseApi: {type: String, default: ''},
    accept: {type: String, default: '.xlsx,.xls,.csv,.txt,.json'},
    parseParams: {type: Object, default: () => ({})},
    enableParse: {type: Boolean, default: true},
    buttonText: {type: String}
  },
  emits: ['uploadStart', 'uploadSuccess', 'parseComplete', 'parseError', 'error'],
  data() {
    return {
      isUploading: false,
      isParsing: false,
      fileList: [],
      parseResult: null,
      uploadProgress: 0,
      hideTimer: null
    };
  },
  computed: {
    uploadButtonText() {
      return this.buttonText ? this.buttonText : '点击上传文件';
    },
    isParsingEnabled() {
      return this.parseApi && this.enableParse;
    },
    shouldShowParseResult() {
      return this.isParsingEnabled && this.parseResult && !this.isUploading;
    },
    isBusy() {
      return this.isUploading || this.isParsing;
    },
  },
  watch: {
    parseResult: {
      handler(newVal) {
        if (newVal) {
          this.startAutoHideTimer();
        }
      },
      deep: true
    }
  },
  methods: {
    async handleUpload({file, onSuccess, onError}) {
      this.resetStatus();
      this.$emit('uploadStart', {file: file.name});

      try {
        this.isUploading = true;
        this.uploadProgress = 0;

        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await this.$api.post(
            this.uploadApi,
            formData,
            {
              headers: {'Content-Type': 'multipart/form-data'},
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total > 0) {
                  this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                } else {
                  this.uploadProgress = Math.min(this.uploadProgress + 1, 99);
                }
              },
              timeout: 60000
            }
        );

        this.$emit('uploadSuccess', uploadRes);
        onSuccess();

        if (this.isParsingEnabled) {
          this.isParsing = true;
          try {
            const parseData = {
              fileId: uploadRes.fileId || uploadRes.id || uploadRes.data?.fileId,
              ...this.parseParams
            };
            const parseRes = await this.$api.post(this.parseApi, parseData);

            this.parseResult = {
              status: 'success',
              message: parseRes.message || parseRes.msg || '文件解析成功',
              data: parseRes.data || parseRes
            };
            this.$emit('parseComplete', parseRes);
          } catch (parseError) {
            onError();
            this.handleParseError(parseError);
          } finally {
            this.isParsing = false;
          }
        }
      } catch (error) {
        onError();
        this.handleError(error);
      } finally {
        this.isUploading = false;
      }
    },

    handleParseError(error) {
      const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.msg ||
          error.message ||
          '解析失败，请重试';
      this.parseResult = {status: 'error', message: errorMessage};
      this.$emit('parseError', error);
      this.$emit('error', error);
      this.$message.error(errorMessage);
    },

    handleError(error) {
      const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.msg ||
          error.message ||
          '文件处理失败，请重试';
      this.parseResult = {status: 'error', message: errorMessage};
      this.$emit('error', error);
      this.$message.error(errorMessage);
    },

    resetStatus() {
      if (this.hideTimer) clearTimeout(this.hideTimer);
      this.isUploading = false;
      this.isParsing = false;
      this.parseResult = null;
      this.uploadProgress = 0;
    },

    startAutoHideTimer() {
      if (this.hideTimer) clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => {
        this.parseResult = null;
      }, 10000);
    }
  },
  beforeUnmount() {
    if (this.hideTimer) clearTimeout(this.hideTimer);
  }
};
</script>

<style scoped>
.file-upload-container {
  max-width: 200px;
  margin: 0;
}

/* 核心：重置按钮内部样式 */
.upload-button {
  width: 200px;
  height: 32px;
  padding: 0 !important; /* 清除 AntD 默认 padding */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.upload-button.busy {
  opacity: 0.75 !important;
  cursor: not-allowed !important;
  pointer-events: none;
}

/* 所有内容容器 */
.button-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
}

/* 进度条特殊处理 */
.button-inner.progress {
  padding: 0 8px;
}

.inner-progress {
  width: 100% !important;
  max-width: 160px;
}

:deep(.inner-progress .ant-progress-text) {
  color: #fff !important;
}

/* 图标统一尺寸和对齐 */
.status-icon,
.default-icon {
  flex-shrink: 0;
}

.result-text {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
}
</style>