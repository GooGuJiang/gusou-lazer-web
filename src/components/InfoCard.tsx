import React from 'react';

interface InfoCardProps {
  image: string;
  imageAlt: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({
  image,
  imageAlt,
  title,
  content,
  icon,
  className = ""
}) => {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden transition-all duration-150 ease-in-out group hover:border-profile-color/30 hover:dark:border-profile-color/50 hover:bg-profile-color/5 hover:dark:bg-profile-color/10 h-full ${className}`}>
      <div className="flex flex-col h-full">
        <div className="relative w-full p-6 pb-0 saturate-30 dark:brightness-85 group-hover:saturate-100 dark:group-hover:brightness-100 transition-all duration-150 ease-in-out">
          <div className="h-32 flex items-center justify-center">
            <img 
              src={image} 
              alt={imageAlt} 
              className="max-w-full max-h-full object-contain transition-transform duration-300" 
            />
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-center items-center w-full gap-x-2 mb-3 text-gray-900 group-hover:text-profile-color dark:text-zinc-100 dark:group-hover:text-profile-color">
            <div className="h-5 w-5 shrink-0">
              {icon}
            </div>
            <h3 className="text-lg line-clamp-1 text-ellipsis font-semibold transition-all duration-150 ease-in-out leading-tight">
              {title}
            </h3>
          </div>
          <p className="text-zinc-600 dark:text-zinc-300 group-hover:text-profile-color/75 dark:group-hover:text-profile-color leading-relaxed transition-all duration-150 ease-in-out text-sm flex-1 line-clamp-6">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;
