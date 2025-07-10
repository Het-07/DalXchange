import "./UsageCard.css";

interface UsageCardProps {
  icon: string;
  title: string;
  description: string;
}

const UsageCard = ({ icon, title, description }: UsageCardProps) => {
  return (
    <div className="usage-card">
      <div className="usage-icon">{icon}</div>
      <h3 className="usage-title">{title}</h3>
      <p className="usage-description">{description}</p>
    </div>
  );
};

export default UsageCard;
