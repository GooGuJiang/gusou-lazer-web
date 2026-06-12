import React, { useState, useEffect } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import Avatar from './Avatar';
import AvatarUpload from './AvatarUpload';

interface EditableAvatarProps {
  userId?: number;
  username: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  editable?: boolean;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
}

const EditableAvatar: React.FC<EditableAvatarProps> = ({
  userId,
  username,
  avatarUrl,
  size = 'md',
  className = '',
  editable = false,
  onAvatarUpdate,
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatarUrl);

  // 当 avatarUrl prop 变化时，更新本地状态
  useEffect(() => {
    setCurrentAvatarUrl(avatarUrl);
  }, [avatarUrl]);

  const handleUploadSuccess = (newAvatarUrl: string) => {
    setCurrentAvatarUrl(newAvatarUrl);
    if (onAvatarUpdate) {
      onAvatarUpdate(newAvatarUrl);
    }
  };

  return (
    <>
      <div className={`relative group ${className}`}>
        <Avatar userId={userId} username={username} avatarUrl={currentAvatarUrl} size={size} />

        {editable && (
          <button
            className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={() => setShowUploadModal(true)}
          >
            <FiEdit2 className="text-white text-lg" />
          </button>
        )}
      </div>

      {showUploadModal && (
        <AvatarUpload
          userId={userId}
          currentAvatarUrl={currentAvatarUrl}
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </>
  );
};

export default EditableAvatar;
