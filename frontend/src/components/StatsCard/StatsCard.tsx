interface StatCardProps {
  label: string;
  value: number | string;
  icon:  string;
  color: 'blue' | 'teal' | 'navy' | 'amber' | 'green' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
  </div>
);

export default StatCard;