export interface NavItem {
  key: string;
  label: string;
  href: string;
  badge?: string;
}

export interface HeaderProps {
  brandName?: string;
  navItems?: NavItem[];
  currency?: string;
  currencyFlag?: string;
  signInLabel?: string;
  onSignInClick?: () => void;
}
