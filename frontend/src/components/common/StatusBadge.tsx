import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  getBookingStatusConfig,
  getPaymentStatusConfig,
  getFlightStatusConfig,
  getUserStatusConfig,
  getUserRoleConfig,
  getTicketStatusConfig,
  getSeatStatusConfig,
  getDraftStatusConfig,
  getCouponStatusConfig,
  getContentStatusConfig,
  type StatusConfig,
} from '@/constants/status-mappings';

export type StatusBadgeType =
  | 'booking'
  | 'payment'
  | 'flight'
  | 'user'
  | 'role'
  | 'ticket'
  | 'seat'
  | 'draft'
  | 'coupon'
  | 'content';

interface StatusBadgeProps {
  type: StatusBadgeType;
  value?: string | null;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  value,
  className = '',
}) => {
  let config: StatusConfig;

  switch (type) {
    case 'booking':
      config = getBookingStatusConfig(value);
      break;
    case 'payment':
      config = getPaymentStatusConfig(value);
      break;
    case 'flight':
      config = getFlightStatusConfig(value);
      break;
    case 'user':
      config = getUserStatusConfig(value);
      break;
    case 'role':
      config = getUserRoleConfig(value);
      break;
    case 'ticket':
      config = getTicketStatusConfig(value);
      break;
    case 'seat':
      config = getSeatStatusConfig(value);
      break;
    case 'draft':
      config = getDraftStatusConfig(value);
      break;
    case 'coupon':
      config = getCouponStatusConfig(value);
      break;
    case 'content':
      config = getContentStatusConfig(value);
      break;
    default:
      config = { label: value || 'Khác', className: 'bg-slate-100 text-slate-700 border-slate-200' };
  }

  return (
    <Badge
      variant="outline"
      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-md border shadow-2xs ${config.className} ${className}`}
    >
      {config.label}
    </Badge>
  );
};
