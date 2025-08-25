import React, { useState, useRef, useEffect, useCallback } from 'react';
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

  // 中心裁剪，4:1 比例（官方推荐头图比例）
  function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
  ): Crop {
    // 使用更适中的初始大小，确保居中和良好的用户体验
    const initialCrop = makeAspectCrop(
      {
        unit: '%',
        width: 80, // 使用80%宽度，确保有足够的可视区域
      },
      aspect,
      mediaWidth,
      mediaHeight,
    );

    const centeredCrop = centerCrop(initialCrop, mediaWidth, mediaHeight);
    
    debugLog('创建居中裁剪区域:', centeredCrop);
    return centeredCrop;
  }

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // 检查文件大小 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('图片大小不能超过10MB');
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
    
    // 根据API文档，检查图片尺寸 - 最大3000x2000
    if (width > 3000 || height > 2000) {
      toast.error('图片尺寸过大，建议使用小于3000x2000像素的图片以获得最佳效果');
      // 不阻止继续，只是提醒用户
    }

    // 统一使用官方推荐的 2000x500 比例 (4:1)
    const aspectRatio = 4 / 1;

    // 设置默认裁剪区域，确保不超出图片边界
    const initialCrop = centerAspectCrop(width, height, aspectRatio);
    setCrop(initialCrop);
    setCompletedCrop(undefined); // 重置完成的裁剪
    
    debugLog('图片加载完成，使用官方推荐比例 4:1，目标尺寸 2000x500，裁剪区域:', initialCrop);
  };

  // 简化的备用初始化：只在必要时重新初始化
  useEffect(() => {
    if (!crop && imgRef.current && step === 'crop' && imgSrc) {
      const { width, height } = imgRef.current;
      if (width > 0 && height > 0) {
        setTimeout(() => {
          const newCrop = centerAspectCrop(width, height, 4 / 1);
          setCrop(newCrop);
          debugLog('备用初始化裁剪区域 (4:1比例):', newCrop);
        }, 100);
      }
    }
  }, [crop, step, imgSrc]);

  // 处理裁剪变化，使用更稳定的逻辑防止消失
  const handleCropChange = useCallback((_: Crop, percentCrop: Crop) => {
    // 完全避免边界检查，直接使用传入的值
    // 只做最基本的数值验证
    if (percentCrop && 
        typeof percentCrop.x === 'number' &&
        typeof percentCrop.y === 'number' &&
        typeof percentCrop.width === 'number' &&
        typeof percentCrop.height === 'number' &&
        !isNaN(percentCrop.x) &&
        !isNaN(percentCrop.y) &&
        !isNaN(percentCrop.width) &&
        !isNaN(percentCrop.height) &&
        percentCrop.width > 0 &&
        percentCrop.height > 0) {
      
      setCrop(percentCrop);
    }
  }, []);

  // 处理裁剪完成，添加有效性检查
  const handleCropComplete = useCallback((c: PixelCrop) => {
    // 多重验证确保裁剪区域有效
    if (c && 
        c.width > 0 && 
        c.height > 0 && 
        c.x >= 0 && 
        c.y >= 0 &&
        !isNaN(c.width) &&
        !isNaN(c.height) &&
        !isNaN(c.x) &&
        !isNaN(c.y)) {
      setCompletedCrop(c);
    } else {
      debugLog('裁剪完成时检测到无效区域:', c);
    }
  }, []);

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
      // 生成裁剪图片，保持比例
      const image = imgRef.current;
      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('无法获取画布上下文');
      }

      // 官方推荐的头图尺寸 2000x500 (4:1)
      const targetWidth = 2000;
      const targetHeight = 500;
      
      debugLog(`使用官方推荐尺寸: ${targetWidth}x${targetHeight}`);
      
      // 设置画布大小
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // 清空画布
      ctx.clearRect(0, 0, targetWidth, targetHeight);

      // 启用图片平滑
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // 计算裁剪区域，确保不超出图片边界
      const sourceX = Math.max(0, Math.min(completedCrop.x * scaleX, image.naturalWidth));
      const sourceY = Math.max(0, Math.min(completedCrop.y * scaleY, image.naturalHeight));
      const sourceWidth = Math.max(1, Math.min(completedCrop.width * scaleX, image.naturalWidth - sourceX));
      const sourceHeight = Math.max(1, Math.min(completedCrop.height * scaleY, image.naturalHeight - sourceY));

      // 绘制裁剪后的图片到画布
      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        targetWidth,
        targetHeight
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

      // 检查blob大小（10MB限制）
      if (blob.size > 10 * 1024 * 1024) {
        toast.error('处理后的图片仍然超过10MB限制，请选择更小的图片');
        return;
      }

      // 创建File对象而不是直接使用Blob
      const fileName = 'cover.jpg';
      const file = new File([blob], fileName, { type: blob.type });
      
      debugLog('创建的File对象:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // 上传头图
      const result = await userAPI.uploadCover(file);
      
      debugLog('上传结果:', result);
      
      // 构造带有缓存破坏的头图URL，确保浏览器会重新加载头图
      let coverUrl: string;
      if (userId) {
        // 这里可以根据需要构造头图URL，目前简单使用时间戳
        const serverUrl = typeof result === 'string' ? result : (result.cover_url || result.url || result);
        coverUrl = `${serverUrl}?t=${Date.now()}`;
      } else {
        // 如果没有 userId，使用服务器返回的 URL 并添加时间戳
        const serverUrl = typeof result === 'string' ? result : (result.cover_url || result.url || result);
        coverUrl = `${serverUrl}?t=${Date.now()}`;
      }
      
      toast.success('头图上传成功！');
      onUploadSuccess(coverUrl);
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
          toast.error('图片格式或大小不符合要求，请检查图片是否为PNG、JPEG或GIF格式，且小于10MB');
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
        className="modal-content !max-w-4xl"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {step === 'select' && '选择头图'}
            {step === 'crop' && '裁剪头图'}
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

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 mb-4">
                <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  点击选择图片或拖拽图片到此处
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  支持 PNG、JPEG、GIF 格式，最大 10MB
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                  建议尺寸：2000*500 像素（4:1 比例）
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
                  调整裁剪区域
                </p>
                <div className="relative flex justify-center">
                  <ReactCrop
                    crop={crop}
                    onChange={handleCropChange}
                    onComplete={handleCropComplete}
                    aspect={4 / 1}
                    minWidth={100}
                    minHeight={25}
                    keepSelection={true}
                    disabled={false}
                    locked={false}
                    style={{ maxWidth: '100%', maxHeight: '500px' }}
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
                        maxHeight: '500px',
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

export default CoverUpload;
