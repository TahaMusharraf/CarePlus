type BadgeVariant = 'blue' | 'teal' | 'navy' | 'amber' | 'red' | 'green' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  variant:  BadgeVariant;
}

const Badge: React.FC<BadgeProps> = ({ children, variant }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

export default Badge;