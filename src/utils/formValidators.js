import dayjs from 'dayjs';

/**
 * 校验规则工厂函数：返回 Ant Design Vue 兼容的 validator 函数
 */

// 1. 不能包含特殊字符（仅允许中文、英文、数字、下划线、空格）
export const noSpecialChars = (message = '不能包含特殊字符') => {
    return (_, value) => {
        if (!value) return Promise.resolve();
        const reg = /^[\u4e00-\u9fa5a-zA-Z0-9_\s]+$/;
        return reg.test(value)
            ? Promise.resolve()
            : Promise.reject(new Error(message));
    };
};

export const passwordComplexity = (message = '密码必须包含大写字母、小写字母、数字、特殊字符中的任意三项') => {
    return (_, value) => {
        if (!value) return Promise.resolve();  // 允许为空（由 required 控制非空）

        let count = 0;

        // 1. 是否包含小写字母
        if (/[a-z]/.test(value)) count++;
        // 2. 是否包含大写字母
        if (/[A-Z]/.test(value)) count++;
        // 3. 是否包含数字
        if (/[0-9]/.test(value)) count++;
        // 4. 是否包含特殊符号（非字母、非数字）
        if (/[^a-zA-Z0-9]/.test(value)) count++;

        return count >= 3
            ? Promise.resolve()
            : Promise.reject(new Error(message));
    };
};

export const customRegExp = (regexp,message) => {
    return (_, value) => {
        if (!value) return Promise.resolve();
        return regexp.test(value)
            ? Promise.resolve()
            : Promise.reject(new Error(message));
    };
};

// 2. 字符长度限制 [min, max]
export const stringLength = ({min = 0, max = Infinity, message}) => {
    return (_, value) => {
        if (value == null) return Promise.resolve();
        const len = String(value).length;
        if (len >= min && len <= max) {
            return Promise.resolve();
        }
        const defaultMsg = min === max
            ? `长度必须为 ${min} 位`
            : min === 0
                ? `长度不能超过 ${max} 位`
                : max === Infinity
                    ? `长度不能少于 ${min} 位`
                    : `长度必须在 ${min} ~ ${max} 位之间`;
        return Promise.reject(new Error(message || defaultMsg));
    };
};

// 3. 数值范围 [min, max]
export const numberRange = ({min = -Infinity, max = Infinity, message}) => {
    return (_, value) => {
        if (value == null || value === '') return Promise.resolve();
        const num = Number(value);
        if (!isNaN(num) && num >= min && num <= max) {
            return Promise.resolve();
        }
        const defaultMsg = min === max ? `必须等于 ${min}`
            : min === -Infinity ? `不能大于 ${max}`
                : max === Infinity ? `不能小于 ${min}`
                    : `必须在 ${min} ~ ${max} 之间`;
        return Promise.reject(new Error(message || defaultMsg));
    };
};

// 4. 日期不能早于今天（适用于 date / datetime）
export const notBeforeToday = (message = '日期不能早于今天') => {
    return (_, value) => {
        if (!value) return Promise.resolve();
        const selected = dayjs(value);
        const today = dayjs().startOf('day');
        return selected.isValid() && !selected.isBefore(today)
            ? Promise.resolve()
            : Promise.reject(new Error(message));
    };
};

// 4. 日期不能晚于今天（适用于 date / datetime）
export const notAfterToday = (message = '日期不能晚于今天') => {
    return (_, value) => {
        if (!value) return Promise.resolve();
        const selected = dayjs(value);
        const today = dayjs().startOf('day');
        return selected.isValid() && !selected.isAfter(today)
            ? Promise.resolve()
            : Promise.reject(new Error(message));
    };
};

// 5. 必须为手机号（中国）
export const phoneRule = (message = '请输入正确的手机号') => {
    return (_, value) => {
        if (!value) return Promise.resolve();
        const reg = /^1[3-9]\d{9}$/;
        return reg.test(value)
            ? Promise.resolve()
            : Promise.reject(new Error(message));
    };
};

// 6. 必须为邮箱
export const emailRule = (message = '请输入正确的邮箱地址') => {
    return (_, value) => {
        if (!value) return Promise.resolve();
        const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return reg.test(value)
            ? Promise.resolve()
            : Promise.reject(new Error(message));
    };
};


// 7.多选范围 [min, max]
export const CheckedRange = ({min = -Infinity, max = Infinity, message}) => {
    return (_, value) => {
        if (value == null || value === '') return Promise.resolve();
        const count = Array.isArray(value) ? value.length : 0;

        if (count >= min && count <= max) {
            return Promise.resolve();
        }
        const defaultMsg = min === max ? `请选择 ${min} 项`
            : min === -Infinity ? `至多选择 ${max} 项`
                : max === Infinity ? `至少选择 ${min} 项`
                    : `请选择 ${min} ~ ${max} 项`;
        return Promise.reject(new Error(message || defaultMsg));
    };
};