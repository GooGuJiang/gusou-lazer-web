// 这是一个使用示例，展示如何手动触发验证流程
import { useVerification } from '../contexts/VerificationContext';

export const useVerificationExample = () => {
  const { showVerificationModal } = useVerification();

  const triggerVerification = async (method: 'totp' | 'mail') => {
    try {
      await showVerificationModal(method);
      console.log('验证成功完成');
      // 在这里处理验证成功后的逻辑
    } catch (error) {
      console.log('验证失败或被取消');
      // 在这里处理验证失败的逻辑
    }
  };

  return { triggerVerification };
};

// 使用示例：
// const { triggerVerification } = useVerificationExample();
// 
// const handleSomeAction = async () => {
//   try {
//     // 执行需要验证的操作
//     await triggerVerification('totp');
//     // 验证成功，继续执行
//   } catch (error) {
//     // 验证失败，处理错误
//   }
// };





