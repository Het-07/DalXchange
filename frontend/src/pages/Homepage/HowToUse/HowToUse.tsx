import UsageCard from "../../../components/UsageCard/UsageCard";
import "./HowToUse.css";

const HowToUse = () => {
  const steps = [
    {
      icon: "📱",
      title: "Create an Account",
      description:
        "Sign up using your Dalhousie email address to join the community.",
    },
    {
      icon: "📦",
      title: "Post Your Listings",
      description:
        "Take photos and create detailed listings for items you want to sell.",
    },
    {
      icon: "🔍",
      title: "Browse & Connect",
      description:
        "Search for items or browse categories to find what you need.",
    },
    {
      icon: "🤝",
      title: "Meet & Exchange",
      description:
        "Arrange to meet on campus or nearby to complete the transaction.",
    },
  ];

  return (
    <section className="how-to-use">
      <div className="how-container">
        <h2 className="how-heading">How DalXchange Works?</h2>
        <div className="how-grid">
          {steps.map((step, index) => (
            <UsageCard
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToUse;
