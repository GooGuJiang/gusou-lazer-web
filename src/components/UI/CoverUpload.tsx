import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiUpload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { userAPI } from '../../utils/api';
import ImageCropper from './ImageCropper';

interface CoverUploadProps {
  userId?: number;
  currentCoverUrl?: string;
  onUploadSuccess: (coverUrl: string) => void;
  onClose: () => void;
}

const CoverUpload: React.FC<CoverUploadProps> = ({
  userId,
  currentCoverUrl,
  onUploadSuccess,
  onClose,
}) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<'select' | 'crop'>('select');
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 防止背景滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  // 处理文件（统一的文件处理逻辑）
  const processFile = (file: File) => {
    // 验证文件类型
    if (!['image/png', 'image/jpeg', 'image/gif'].includes(file.type)) {
      toast.error('只支持 PNG、JPEG、GIF 格式的图片');
      return;
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('文件大小不能超过 10MB');
      return;
    }

    // 读取文件
    const reader = new FileReader();
    reader.onload = (e) => {
      setImgSrc(e.target?.result as string);
      setOriginalFileName(file.name);
      setStep('crop');
    };
    reader.readAsDataURL(file);
  };

  // 拖拽事件处理
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  // 处理裁剪完成
  const handleCropComplete = async (croppedFile: File) => {
    if (!userId) {
      toast.error('用户 ID 不存在');
      return;
    }

    setIsUploading(true);
    try {
      const response = await userAPI.uploadCover(croppedFile);
      toast.success('头图上传成功');
      onUploadSuccess(response.cover_url);
      onClose();
    } catch (error: any) {
      console.error('头图上传失败:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('头图上传失败，请重试');
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

  // （保留占位：可能未来需要添加“重新开始”按钮，此处移除未使用的 resetUpload 函数以消除 TS 警告）

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
        className="bg-card rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
        style={{ minHeight: '400px' }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {step === 'select' ? '上传头图' : '裁剪头图'}
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
              
              {currentCoverUrl && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">当前头图</p>
                  <img
                    src={currentCoverUrl}
                    alt="当前头图"
                    className="w-full max-w-md h-32 mx-auto object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                  />
                </div>
              )}

              <div 
                className={`border-2 border-dashed rounded-lg p-8 mb-4 transition-colors cursor-pointer ${
                  isDragOver 
                    ? 'border-osu-pink bg-osu-pink/10' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-osu-pink/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <FiUpload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-osu-pink' : 'text-gray-400'}`} />
                <p className={`mb-2 ${isDragOver ? 'text-osu-pink' : 'text-gray-600 dark:text-gray-400'}`}>
                  {isDragOver ? '释放文件开始上传' : '点击选择图片或拖拽图片到此处'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  支持 PNG、JPEG、GIF 格式，最大 10MB
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                  建议尺寸：2000*500 像素（4:1 比例）
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-osu-pink hover:bg-osu-pink/90 text-white px-6 py-2 rounded-lg transition-colors"
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
          aspectRatio={4} // 4:1 比例头图
          maxWidth={2000}
          maxHeight={500}
          quality={0.9}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          fileName={originalFileName}
          isUploading={isUploading}
          uploadingText="上传头图中..."
        />
      )}
    </div>,
    document.body
  );
};

export default CoverUpload;