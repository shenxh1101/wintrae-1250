import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div
        className={`relative w-full ${sizeClasses[size]} bg-cream-50 rounded-lg shadow-theater-lg border border-gold-200/50 animate-fade-in`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold-200/50">
          <h3 className="font-serif-sc text-lg font-semibold text-wine-700">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-charcoal-400 hover:text-wine-600 hover:bg-wine-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-gold-200/50 bg-cream-100/50 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
