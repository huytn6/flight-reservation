import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  backPath?: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
  };
  secondaryActions?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  breadcrumbs = [],
  backPath,
  primaryAction,
  secondaryActions,
}) => {
  const navigate = useNavigate();
  const IconComponent = primaryAction?.icon || Save;

  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-slate-200/80 font-sans">
      {/* Optional Breadcrumbs */}
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
                <span className="text-slate-900 font-normal">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Header Bar: [ Back Button ] Title & Subtitle (Left) <---> [ Actions ] (Right) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Back Button + Title + Description */}
        <div className="flex items-start gap-3">
          {backPath && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => navigate(backPath)}
              className="w-8 h-8 border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer rounded-md shrink-0 mt-0.5 shadow-2xs font-normal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </Button>
          )}

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Header Action Buttons */}
        {(primaryAction || secondaryActions) && (
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {secondaryActions}
            {primaryAction && (
              <Button
                type={primaryAction.onClick ? "button" : "submit"}
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
                className="bg-[#0065eb] hover:bg-blue-700 text-white text-xs font-normal h-8.5 px-4 rounded-md flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{primaryAction.label}</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
