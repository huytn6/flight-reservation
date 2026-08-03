import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  secondaryActions?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  breadcrumbs = [],
  primaryAction,
  secondaryActions,
}) => {
  const IconComponent = primaryAction?.icon || Plus;

  return (
    <div className="flex flex-col gap-3 pb-2 border-b border-slate-200/60">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link to="/admin" className="hover:text-slate-900 transition-colors">
            Trang chủ
          </Link>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {item.href ? (
                <Link to={item.href} className="hover:text-slate-900 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-semibold">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title Bar & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xs text-slate-500 mt-1 font-normal">
              {description}
            </p>
          )}
        </div>

        {/* Single Primary Action + Secondary Actions */}
        {(primaryAction || secondaryActions) && (
          <div className="flex items-center gap-2.5 shrink-0">
            {secondaryActions}
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                className="bg-[#0065eb] hover:bg-blue-700 text-white text-xs font-semibold h-9 px-4 rounded-lg flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <IconComponent className="w-4 h-4" />
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
