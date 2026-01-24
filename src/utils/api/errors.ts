import toast from "react-hot-toast";
import { t } from "../i18n.ts";

export const handleApiError = <T extends Record<string, unknown>>(error: unknown) => {
  const err = error as {
    response?: {
      data?: {
        msg_key?: string;
        error?: string;
        error_description?: string;
        message?: string;
        // 取决于错误，可能有其他的字段
      } & T;
    };
    message?: string;
  };

  // 从错误描述等获取 Fallback
  let message: string = err.response?.data?.error_description ?? err.response?.data?.message ?? err.message
    ?? t("errors.unknown");

  if (err.response?.data?.msg_key) {
    // 尝试本地化消息
    const key = `errors.${err.response.data.msg_key}`;
    const localized = t(key, err.response.data);
    if (localized !== key) {
      message = localized;
    }
  }

  toast.error(message);
};
