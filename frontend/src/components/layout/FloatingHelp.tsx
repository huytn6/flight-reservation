import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingHelpProps {
  label?: string;
  onClick?: () => void;
}

export const FloatingHelp: React.FC<FloatingHelpProps> = ({ 
  label = 'Help', 
  onClick 
}) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-white border border-gray-300 text-[#141d38] font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all flex items-center gap-2"
    >
      <MessageSquare className="w-4 h-4 text-blue-600" />
      <span>{label}</span>
    </Button>
  );
};
