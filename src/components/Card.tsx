import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`card-theater ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-5 py-4 border-b border-gold-100 ${className}`}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`px-5 py-4 border-t border-gold-100 ${className}`}>
      {children}
    </div>
  );
}

interface SectionTitleProps {
  icon?: ReactNode;
  title: string;
  action?: ReactNode;
}

export function SectionTitle({ icon, title, action }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="section-title">
        {icon}
        {title}
      </h3>
      {action}
    </div>
  );
}
