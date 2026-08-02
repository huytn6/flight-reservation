import React from 'react';
import { Button } from '@heroui/react';

export interface CheckoutButtonProps {
  label?: string;
  onClick?: () => void;
  fullWidth?: boolean;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  label = 'Next: Checkout',
  onClick,
  fullWidth = true,
}) => {
  return (
    <Button
      variant="primary"
      onClick={onClick}
      className={`bg-[#0065eb] hover:bg-blue-700 text-white font-bold rounded-full h-[48px] text-sm sm:text-base shadow-xs transition-colors cursor-pointer ${
        fullWidth ? 'w-full' : 'w-auto px-8'
      }`}
    >
      {label}
    </Button>
  );
};
