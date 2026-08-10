import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@astryxdesign/core/Card';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack, HStack } from '@astryxdesign/core/Layout';
import { Divider } from '@astryxdesign/core/Divider';

/**
 * Adapters over the real Astryx components.
 *
 * The admin screens were written against these five names, so keeping the
 * signatures and swapping the implementation moves every screen onto genuine
 * Astryx components in one step. Sizes, type, radii, colour and motion are all
 * the design system's defaults — nothing is overridden here.
 */

/* =================================================================== */
/* CARD                                                                */
/* =================================================================== */
interface AstryxCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'surface' | 'borderless';
  density?: 'balanced' | 'compact';
  onClick?: () => void;
}

export const AstryxCard: React.FC<AstryxCardProps> = ({
  children,
  className,
  variant = 'default',
  density = 'balanced',
  onClick,
}) => {
  const cardVariant =
    variant === 'surface' ? 'muted' : variant === 'borderless' ? 'transparent' : 'default';

  return (
    <Card variant={cardVariant} padding={density === 'compact' ? 3 : 4}>
      {onClick ? (
        <div onClick={onClick} className={className} role="presentation">
          {children}
        </div>
      ) : (
        <div className={className}>{children}</div>
      )}
    </Card>
  );
};

/* =================================================================== */
/* BADGE                                                               */
/* =================================================================== */
interface AstryxBadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'cyan' | 'amber' | 'red' | 'outline' | 'neutral';
  dot?: boolean;
  className?: string;
}

const BADGE_VARIANT = {
  green: 'green',
  cyan: 'cyan',
  amber: 'yellow',
  red: 'red',
  outline: 'neutral',
  neutral: 'neutral',
} as const;

export const AstryxBadge: React.FC<AstryxBadgeProps> = ({ children, variant = 'neutral' }) => (
  <Badge variant={BADGE_VARIANT[variant] as never} label={String(children)} />
);

/* =================================================================== */
/* BUTTON                                                              */
/* =================================================================== */
interface AstryxButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const AstryxButton: React.FC<AstryxButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  onClick,
  disabled,
  title,
  type = 'button',
}) => (
  <Button
    label={String(children)}
    variant={variant === 'danger' ? 'destructive' : variant}
    size={size}
    type={type}
    isDisabled={disabled}
    tooltip={title}
    onClick={onClick}
    icon={Icon ? <Icon aria-hidden /> : undefined}
  />
);

/* =================================================================== */
/* PAGE HEADER                                                         */
/* =================================================================== */
interface AstryxHeaderProps {
  badgeText?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const AstryxHeader: React.FC<AstryxHeaderProps> = ({
  badgeText,
  title,
  subtitle,
  children,
}) => (
  <VStack gap={3}>
    <HStack gap={3} justify="between" align="start">
      <VStack gap={0.5}>
        {badgeText && (
          <Text type="supporting" display="block">
            {badgeText}
          </Text>
        )}
        <Heading level={1}>{title}</Heading>
        {subtitle && (
          <Text type="supporting" display="block">
            {subtitle}
          </Text>
        )}
      </VStack>
      {children && <HStack gap={2}>{children}</HStack>}
    </HStack>
    <Divider />
  </VStack>
);

/* =================================================================== */
/* FORM FIELD                                                          */
/* =================================================================== */
interface AstryxFieldProps {
  label: string;
  info?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper for fields still using bare inputs. Astryx inputs carry their own
 * `label` and `description`, so screens migrated to TextInput/TextArea don't
 * need this at all.
 */
export const AstryxField: React.FC<AstryxFieldProps> = ({ label, info, children, className }) => (
  <div className={className}>
    <VStack gap={1}>
      <Text type="label" as="label" display="block">
        {label}
      </Text>
      {children}
      {info && (
        <Text type="supporting" display="block">
          {info}
        </Text>
      )}
    </VStack>
  </div>
);

/* =================================================================== */
/* SECTION                                                             */
/* =================================================================== */
interface AstryxSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const AstryxSection: React.FC<AstryxSectionProps> = ({
  title,
  description,
  children,
  actions,
}) => (
  <VStack gap={3}>
    <HStack gap={3} justify="between" align="start">
      <VStack gap={0.5}>
        <Heading level={3}>{title}</Heading>
        {description && (
          <Text type="supporting" display="block">
            {description}
          </Text>
        )}
      </VStack>
      {actions && <HStack gap={2}>{actions}</HStack>}
    </HStack>
    {children}
  </VStack>
);
