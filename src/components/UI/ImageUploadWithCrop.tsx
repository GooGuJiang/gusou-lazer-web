import React, { useState, useRef } from 'react';
import { FiUpload } from 'react-icons/fi';
import imageCompression from 'browser-image-compression';
import ImageCropper from './ImageCropper';
import toast from 'react-hot-toast';

interface ImageUploadWithCropProps {
  onImageSelect: (file: File) => void;
  preview?: string;
  aspectRatio?: number;
  maxWidth?: number;
  maxHeight?: number;
  maxFileSize?: number; // MB
  acceptedTypes?: string[];
  placeholder?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  isUploading?: boolean;
  uploadingText?: string;
}

const ImageUploadWithCrop: React.FC<ImageUploadWithCropProps> = ({
  onImageSelect,
  preview,
  aspectRatio,
  maxWidth = 1200,
  maxHeight = 800,
  maxFileSize = 10, // 10MB
  acceptedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  placeholder = '选择图片',
  description,
  icon,
  className = '',
  isUploading = false,
  uploadingText = '上传中...'
}) => {
  const [showCropper, setShowCropper] = useState(false);
  const [originalImageSrc, setOriginalImageSrc] = useState<string>('');
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!acceptedTypes.includes(file.type)) {
      toast.error(`不支持的文件格式。支持的格式: ${acceptedTypes.map(type => type.split('/')[1]).join(', ')}`);
      return;
    }

    // 验证文件大小
    if (file.size > maxFileSize * 1024 * 1024) {
      toast.error(`文件大小不能超过 ${maxFileSize}MB`);
      return;
    }

    let processedFile = file;

    // 如果文件过大，先进行预压缩
    if (file.size > 2 * 1024 * 1024) { // 大于2MB时进行预压缩
      try {
        toast.loading('正在优化图片...', { id: 'compress' });
        
        const options = {
          maxWidthOrHeight: 2048, // 预压缩到最大2048px
          useWebWorker: true,
          quality: 0.9,
          initialQuality: 0.9,
          alwaysKeepResolution: false,
          preserveExif: false,
        };

        processedFile = await imageCompression(file, options);
        toast.success('图片优化完成', { id: 'compress' });
      } catch (error) {
        console.error('预压缩失败:', error);
        toast.dismiss('compress');
        // 如果预压缩失败，使用原文件
        processedFile = file;
      }
    }

    // 读取文件并显示裁剪器
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImageSrc(e.target?.result as string);
      setOriginalFileName(processedFile.name);
      setShowCropper(true);
    };
    reader.readAsDataURL(processedFile);
  };

  // 处理裁剪完成
  const handleCropComplete = (croppedFile: File) => {
    onImageSelect(croppedFile);
    setShowCropper(false);
    setOriginalImageSrc('');
    
    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理裁剪取消
  const handleCropCancel = () => {
    setShowCropper(false);
    setOriginalImageSrc('');
    
    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 点击上传区域
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* 上传区域 */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleUploadClick}
            className="inline-flex items-center px-4 py-2 bg-osu-pink text-white rounded-lg hover:bg-osu-pink/90 transition-colors"
          >
            {icon || <FiUpload className="mr-2" />}
            {placeholder}
          </button>
          {description && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </div>
          )}
        </div>

        {/* 预览图片 */}
        {preview && (
          <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${
            aspectRatio === 2 ? 'w-60 h-30' : // 旗帜比例 2:1 (240x120)
            aspectRatio === 1.5 ? 'w-full max-w-md h-48' : // 封面比例 3:2
            'w-48 h-48' // 默认方形
          }`}>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 图片裁剪器 */}
      {showCropper && (
        <ImageCropper
          src={originalImageSrc}
          aspectRatio={aspectRatio}
          maxWidth={maxWidth}
          maxHeight={maxHeight}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          fileName={originalFileName}
          isUploading={isUploading}
          uploadingText={uploadingText}
        />
      )}
    </>
  );
};

export default ImageUploadWithCrop;
