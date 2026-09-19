import "./Stats.css";
import {
  FaFileAlt,
  FaUsers,
  FaShieldAlt,
  FaCloudUploadAlt
} from "react-icons/fa";

function Stats() {

  const stats = [
    {
      number: "50,000+",
      title: "Documents Stored",
      icon: <FaFileAlt />,
      color: "blue"
    },
    {
      number: "15,000+",
      title: "Happy Users",
      icon: <FaUsers />,
      color: "purple"
    },
    {
      number: "99.9%",
      title: "Secure Storage",
      icon: <FaShieldAlt />,
      color: "green"
    },
    {
      number: "24/7",
      title: "Cloud Available",
      icon: <FaCloudUploadAlt />,
      color: "orange"
    }
  ];

  return (

    <section className="stats-section">

      <div className="stats-heading">

        <span>Trusted Worldwide</span>

        <h2>
          Millions Trust Digital Vault
        </h2>

        <p>
          Store, manage and protect your important files with enterprise-grade
          AI powered security.
        </p>

      </div>

      <div className="stats-grid">

        {

          stats.map((item,index)=>(

            <div
              key={index}
              className={`stats-card ${item.color}`}
            >

              <div className="stats-icon">

                {item.icon}

              </div>

              <h1>

                {item.number}

              </h1>

              <h3>

                {item.title}

              </h3>

            </div>

          ))

        }

      </div>

    </section>

  );

}

export default Stats;