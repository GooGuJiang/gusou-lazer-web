import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import type { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FiUpload, FiX, FiRotateCcw, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { userAPI } from '../../utils/api';

// 开发环境调试工具
const debugLog = (message: string, data?: unknown) => {
  if (import.meta.env.DEV) {
    console.log(message, data);
  }
};

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
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<'select' | 'crop'>('select');
  
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 防止背景滚动
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 中心裁剪，1:1 比例
  function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
  ): Crop {
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    );
    
    debugLog('创建头像裁剪区域:', crop);
    return crop;
  }

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // 检查文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('图片大小不能超过5MB');
        return;
      }

      // 检查文件类型
      if (!file.type.match(/^image\/(png|jpeg|jpg|gif)$/)) {
        toast.error('只支持PNG、JPEG、GIF格式的图片');
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const imageUrl = reader.result?.toString() || '';
        setImgSrc(imageUrl);
        setStep('crop');
      });
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // 根据API文档，检查图片尺寸 - 最大256x256
    if (width > 1024 || height > 1024) {
      toast.error('图片尺寸过大，建议使用小于1024x1024像素的图片以获得最佳效果');
      // 不阻止继续，只是提醒用户
    }

    // 设置默认裁剪区域为1:1比例
    const crop = centerAspectCrop(width, height, 1);
    setCrop(crop);
  };

  const handleCropAndUpload = async () => {
    if (!completedCrop || completedCrop.width <= 0 || completedCrop.height <= 0) {
      toast.error('请选择有效的裁剪区域');
      return;
    }

    if (!imgRef.current || !previewCanvasRef.current) {
      toast.error('图片加载失败，请重试');
      return;
    }

    setIsUploading(true);

    try {
      // 生成256x256的裁剪图片
      const image = imgRef.current;
      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('无法获取画布上下文');
      }

      // 设置画布大小为256x256
      canvas.width = 256;
      canvas.height = 256;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // 计算裁剪区域，确保不超出图片边界
      const sourceX = Math.max(0, Math.min(completedCrop.x * scaleX, image.naturalWidth));
      const sourceY = Math.max(0, Math.min(completedCrop.y * scaleY, image.naturalHeight));
      const sourceWidth = Math.max(1, Math.min(completedCrop.width * scaleX, image.naturalWidth - sourceX));
      const sourceHeight = Math.max(1, Math.min(completedCrop.height * scaleY, image.naturalHeight - sourceY));

      // 清空画布
      ctx.clearRect(0, 0, 256, 256);

      // 绘制裁剪后的图片到画布
      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        256,
        256
      );

      // 将canvas转换为blob，使用JPEG格式以减小文件大小
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            debugLog('生成的blob:', {
              type: blob.type,
              size: blob.size,
              constructor: blob.constructor.name
            });
            resolve(blob);
          } else {
            debugLog('canvas.toBlob返回null');
            reject(new Error('无法生成图片blob'));
          }
        }, 'image/jpeg', 0.85);
      });

      debugLog('准备上传的blob验证:', {
        isBlob: blob instanceof Blob,
        type: blob.type,
        size: blob.size
      });

      // 检查blob大小（5MB限制）
      if (blob.size > 5 * 1024 * 1024) {
        toast.error('处理后的图片仍然超过5MB限制，请选择更小的图片');
        return;
      }

      // 创建File对象而不是直接使用Blob
      const fileName = 'avatar.jpg';
      const file = new File([blob], fileName, { type: blob.type });
      
      debugLog('创建的File对象:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // 上传头像
      const result = await userAPI.uploadAvatar(file);
      
      debugLog('上传结果:', result);
      
      // 构造带有缓存破坏的头像URL，确保浏览器会重新加载头像
      let avatarUrl: string;
      if (userId) {
        avatarUrl = userAPI.getAvatarUrl(userId, true);
      } else {
        // 如果没有 userId，使用服务器返回的 URL 并添加时间戳
        const serverUrl = typeof result === 'string' ? result : (result.avatar_url || result.url || result);
        avatarUrl = `${serverUrl}?t=${Date.now()}`;
      }
      
      toast.success('头像上传成功！');
      onUploadSuccess(avatarUrl);
      onClose();

    } catch (error: unknown) {
      debugLog('上传错误:', error);
      const err = error as {
        response?: {
          status?: number;
          data?: { detail?: { msg?: string; loc?: string[] }[]; message?: string };
        };
        message?: string;
      };
      debugLog('错误详情:', err.response?.data);
      
      // 处理422验证错误
      if (err.response?.status === 422) {
        const details = err.response.data?.detail;
        debugLog('422错误详情:', details);

        if (details && Array.isArray(details) && details.length > 0) {
          const errorMsg = details[0].msg || '验证失败';
          const field = details[0].loc ? details[0].loc.join('.') : '';
          toast.error(`上传失败: ${field ? `${field}: ` : ''}${errorMsg}`);
        } else if (err.response.data?.message) {
          toast.error(`上传失败: ${err.response.data.message}`);
        } else {
          toast.error('图片格式或大小不符合要求，请检查图片是否为PNG、JPEG或GIF格式，且小于5MB');
        }
      } else {
        toast.error(err.message || '上传失败，请重试');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setStep('select');
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (previewCanvasRef.current) {
      const ctx = previewCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
      }
    }
  };

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e: React.MouseEvent) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-content"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {step === 'select' && '选择头像'}
            {step === 'crop' && '裁剪头像'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                onChange={onSelectFile}
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
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-pink-400 to-teal-400 hover:from-pink-500 hover:to-teal-500 text-white px-6 py-2 rounded-lg transition-colors"
              >
                选择图片
              </button>
            </div>
          )}

          {step === 'crop' && imgSrc && (
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  调整裁剪区域，头像将被调整为 256x256 像素
                </p>
                <div className="relative flex justify-center">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    minWidth={30}
                    minHeight={30}
                    keepSelection
                    style={{ maxWidth: '100%' }}
                  >
                    <img
                      ref={imgRef}
                      alt="裁剪预览"
                      src={imgSrc}
                      onLoad={onImageLoad}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '400px',
                        width: 'auto',
                        height: 'auto',
                        display: 'block',
                        userSelect: 'none'
                      }}
                    />
                  </ReactCrop>
                </div>
                {completedCrop && completedCrop.width > 0 && completedCrop.height > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    选中区域: {Math.round(completedCrop.width)}x{Math.round(completedCrop.height)} 像素
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetUpload}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiRotateCcw className="w-4 h-4" />
                  重新选择
                </button>
                <button
                  onClick={handleCropAndUpload}
                  disabled={!completedCrop || completedCrop.width <= 0 || completedCrop.height <= 0 || isUploading}
                  className="flex-1 bg-gradient-to-r from-pink-400 to-teal-400 hover:from-pink-500 hover:to-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      上传中...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      裁剪并上传
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* 隐藏的画布用于图片处理 */}
        <canvas
          ref={previewCanvasRef}
          className="hidden"
        />
      </div>
    </div>,
    document.body
  );
};

export default AvatarUpload;
