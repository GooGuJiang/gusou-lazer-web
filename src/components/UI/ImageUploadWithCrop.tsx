import React, { useState, useRef } from 'react';
import { FiUpload } from 'react-icons/fi';
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
  uploadingText = '上传中...',
}) => {
  const [showCropper, setShowCropper] = useState(false);
  const [originalImageSrc, setOriginalImageSrc] = useState<string>('');
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  // 处理文件（统一的文件处理逻辑）
  const processFile = (file: File) => {
    // 验证文件类型
    if (!acceptedTypes.includes(file.type)) {
      toast.error(
        `不支持的文件格式。支持的格式: ${acceptedTypes.map((type) => type.split('/')[1]).join(', ')}`
      );
      return;
    }

    // 验证文件大小
    if (file.size > maxFileSize * 1024 * 1024) {
      toast.error(`文件大小不能超过 ${maxFileSize}MB`);
      return;
    }

    // 读取文件并显示裁剪器
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImageSrc(e.target?.result as string);
      setOriginalFileName(file.name);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  // 拖拽事件处理
  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors ${
              isDragOver ? 'bg-osu-pink/80' : 'bg-osu-pink hover:bg-osu-pink/90'
            }`}
          >
            {icon || <FiUpload className="mr-2" />}
            {isDragOver ? '释放文件开始上传' : placeholder}
          </button>
          {description && (
            <div className="text-sm text-gray-500 dark:text-gray-400">{description}</div>
          )}
        </div>

        {/* 预览图片 */}
        {preview && (
          <div
            className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${
              aspectRatio === 2
                ? 'w-60 h-30' // 旗帜比例 2:1 (240x120)
                : aspectRatio === 1.5
                  ? 'w-full max-w-md h-48' // 封面比例 3:2
                  : 'w-48 h-48' // 默认方形
            }`}
          >
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
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
