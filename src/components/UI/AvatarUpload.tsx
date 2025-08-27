import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiUpload, FiX } from 'react-icons/fi';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';
import { userAPI } from '../../utils/api';
import ImageCropper from './ImageCropper';

interface AvatarUploadProps {
  userId?: number;
  currentAvatarUrl?: string;
  onUploadSuccess: (avatarUrl: string) => void;
  onClose: () => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  userId,
  currentAvatarUrl,
  onUploadSuccess,
  onClose,
}) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<'select' | 'crop'>('select');
  const [originalFileName, setOriginalFileName] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 防止背景滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!['image/png', 'image/jpeg', 'image/gif'].includes(file.type)) {
      toast.error('只支持 PNG、JPEG、GIF 格式的图片');
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('文件大小不能超过 5MB');
      return;
    }

    let processedFile = file;

    // 如果文件过大，先进行预压缩
    if (file.size > 1 * 1024 * 1024) { // 头像大于1MB时进行预压缩
      try {
        toast.loading('正在优化头像...', { id: 'compress-avatar' });
        
        const options = {
          maxWidthOrHeight: 512, // 头像预压缩到最大512px
          useWebWorker: true,
          quality: 0.85,
          initialQuality: 0.85,
          alwaysKeepResolution: false,
          preserveExif: false,
        };

        processedFile = await imageCompression(file, options);
        toast.success('头像优化完成', { id: 'compress-avatar' });
      } catch (error) {
        console.error('头像预压缩失败:', error);
        toast.dismiss('compress-avatar');
        processedFile = file;
      }
    }

    // 读取文件
    const reader = new FileReader();
    reader.onload = (e) => {
      setImgSrc(e.target?.result as string);
      setOriginalFileName(processedFile.name);
      setStep('crop');
    };
    reader.readAsDataURL(processedFile);
  };

  // 处理裁剪完成
  const handleCropComplete = async (croppedFile: File) => {
    if (!userId) {
      toast.error('用户 ID 不存在');
      return;
    }

    setIsUploading(true);
    try {
      const response = await userAPI.uploadAvatar(croppedFile);
      toast.success('头像上传成功');
      onUploadSuccess(response.avatar_url);
      onClose();
    } catch (error: any) {
      console.error('头像上传失败:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('头像上传失败，请重试');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // 处理裁剪取消
  const handleCropCancel = () => {
    setStep('select');
    setImgSrc('');
    setOriginalFileName('');
  };



  return createPortal(
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUploading) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
        style={{ minHeight: '400px' }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {step === 'select' ? '上传头像' : '裁剪头像'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {step === 'select' && (
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {currentAvatarUrl && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">当前头像</p>
                  <img
                    src={currentAvatarUrl}
                    alt="当前头像"
                    className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-gray-200 dark:border-gray-600"
                  />
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 mb-4">
                <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  点击选择图片或拖拽图片到此处
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  支持 PNG、JPEG、GIF 格式，最大 5MB
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                  头像将自动调整为 256x256 像素
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-pink-400 to-teal-400 hover:from-pink-500 hover:to-teal-500 text-white px-6 py-2 rounded-lg transition-colors"
              >
                选择图片
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 图片裁剪器 */}
      {step === 'crop' && imgSrc && (
        <ImageCropper
          src={imgSrc}
          aspectRatio={1} // 1:1 正方形头像
          maxWidth={256}
          maxHeight={256}
          quality={0.9}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          fileName={originalFileName}
          isUploading={isUploading}
          uploadingText="上传头像中..."
        />
      )}
    </div>,
    document.body
  );
};

export default AvatarUpload;