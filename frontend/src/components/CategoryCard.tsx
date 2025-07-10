import "./CategoryCard.css";

interface CategoryCardProps {
  name: string;
  icon: string;
  color: string;
}

const CategoryCard = ({ name, icon, color }: CategoryCardProps) => {
  return (
    <div className="category-card" style={{ backgroundColor: color }}>
      <div className="category-icon">{icon}</div>
      <h3 className="category-name">{name}</h3>
    </div>
  );
};

export default CategoryCard;
