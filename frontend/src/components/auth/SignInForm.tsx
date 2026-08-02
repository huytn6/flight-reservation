import React, { useState } from 'react';
import { Input, Button } from '@heroui/react';

interface SignInFormProps {
  onSubmitEmail?: (email: string) => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSubmitEmail }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitEmail && email) {
      onSubmitEmail(email);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full text-sm border border-gray-400 focus:border-[#0065eb] rounded-xl"
        required
      />
      
      <Button
        type="submit"
        variant="primary"
        className="w-full bg-[#0065eb] hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-full shadow-md transition-colors"
      >
        Continue
      </Button>
    </form>
  );
};
