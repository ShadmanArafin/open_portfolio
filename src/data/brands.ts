export interface Brand {
  id: string;
  name: string;
  logo: string;
  alt: string;
  url?: string;
  size?: 'small' | 'default' | 'wide';
}

/**
 * Demo client logos.
 *
 * These are invented companies with CC0 wordmarks — see public/demo/LICENSE.md.
 * Never commit a real client's logo here: displaying a client mark on your own
 * site is normally fine, but redistributing it inside a template that strangers
 * deploy is a trademark problem. Upload your own from /admin/brands.
 */
export const BRANDS: Brand[] = [
  {
    id: 'brand-northwind',
    name: 'Northwind',
    logo: '/demo/logos/northwind.svg',
    alt: 'Northwind logo',
    url: 'https://example.com',
    size: 'wide',
  },
  {
    id: 'brand-contoso',
    name: 'Contoso',
    logo: '/demo/logos/contoso.svg',
    alt: 'Contoso logo',
    url: 'https://example.com',
    size: 'default',
  },
  {
    id: 'brand-fabrikam',
    name: 'Fabrikam',
    logo: '/demo/logos/fabrikam.svg',
    alt: 'Fabrikam logo',
    url: 'https://example.com',
    size: 'wide',
  },
  {
    id: 'brand-initech',
    name: 'Initech',
    logo: '/demo/logos/initech.svg',
    alt: 'Initech logo',
    url: 'https://example.com',
    size: 'default',
  },
  {
    id: 'brand-lumen-yard',
    name: 'Lumen Yard',
    logo: '/demo/logos/lumen-yard.svg',
    alt: 'Lumen Yard logo',
    url: 'https://example.com',
    size: 'wide',
  },
];
