import React from 'react';
import { Button } from '@/components/ui/button';

interface SocialLoginButtonsProps {
  onGoogleSignIn?: () => void;
  onAppleSignIn?: () => void;
  onFacebookSignIn?: () => void;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGoogleSignIn,
  onAppleSignIn,
  onFacebookSignIn,
}) => {
  return (
    <div className="w-full flex flex-col gap-3">
      {/* Sign in with Google */}
      <Button
        onClick={onGoogleSignIn}
        variant="outline"
        className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs sm:text-sm py-3 rounded-full border border-gray-400 flex items-center justify-center gap-3 transition-colors"
      >
        {/* Google Colorful G SVG */}
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Sign in with Google</span>
      </Button>

      {/* Sign in with Apple */}
      <Button
        onClick={onAppleSignIn}
        variant="outline"
        className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs sm:text-sm py-3 rounded-full border border-gray-400 flex items-center justify-center gap-3 transition-colors"
      >
        {/* Apple Logo SVG */}
        <svg className="w-4 h-4 text-black shrink-0 fill-current" viewBox="0 0 170 170">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.14.12-10.06-1.99-14.75-6.35-3.14-2.76-7.01-7.44-11.61-14.04-6.35-9.15-11.45-19.49-15.31-31.02-3.86-11.53-5.79-22.61-5.79-33.24 0-14.88 3.84-27.17 11.52-36.87 7.68-9.7 17.29-14.64 28.84-14.83 4.95 0 10.45 1.25 16.49 3.76 6.04 2.51 10.15 3.82 12.33 3.93 1.83 0 6.09-1.39 12.78-4.17 6.69-2.78 12.28-4.05 16.78-3.81 12.74.61 22.84 5.37 30.3 14.28-11.41 6.89-16.98 16.74-16.71 29.54.27 10.3 4.24 18.73 11.91 25.3 4.35 3.76 9.38 6.53 15.09 8.31-2.45 7.15-5.74 14.4-9.87 21.75zM119.22 31.06c0-7.14 2.65-14.13 7.95-20.97 5.3-6.84 11.91-11.08 19.83-12.72.33 1.4.49 2.67.49 3.8 0 7.37-2.73 14.54-8.19 21.52-5.46 6.98-12.18 11.22-20.17 12.72-.11-1.02-.17-1.68-.17-1.98z" />
        </svg>
        <span>Sign in with Apple</span>
      </Button>

      {/* Sign in with Facebook */}
      <Button
        onClick={onFacebookSignIn}
        variant="outline"
        className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs sm:text-sm py-3 rounded-full border border-gray-400 flex items-center justify-center gap-3 transition-colors"
      >
        {/* Facebook Blue Logo SVG */}
        <svg className="w-4 h-4 text-[#1877F2] shrink-0 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        <span>Sign in with Facebook</span>
      </Button>
    </div>
  );
};
