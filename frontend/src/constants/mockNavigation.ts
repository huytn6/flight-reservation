import type { NavItem } from '../types/navigation';

export const MOCK_NAV_ITEMS: NavItem[] = [
  { key: 'flights', label: 'Flights', href: '#' },
  { key: 'hotels', label: 'Stays & Hotels', href: '#' },
  { key: 'cars', label: 'Car Rentals', href: '#' },
  { key: 'packages', label: 'Vacation Packages', href: '#' },
];

export const MOCK_TOP_NOTICE = {
  text: 'Welcome to Expedia.com. Continue to the Vietnam site at',
  linkText: 'Expedia.com.vn',
  linkHref: 'https://www.expedia.com.vn',
};
