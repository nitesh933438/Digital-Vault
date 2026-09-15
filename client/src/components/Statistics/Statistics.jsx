import "./Statistics.css";
import CountUp from "react-countup";

function Statistics() {

  const stats = [
    {
      number: 12500,
      suffix: "+",
      title: "Documents Stored"
    },
    {
      number: 3200,
      suffix: "+",
      title: "Happy Users"
    },
    {
      number: 98,
      suffix: "%",
      title: "Security Rating"
    },
    {
      number: 24,
      suffix: "/7",
      title: "Cloud Access"
    }
  ];

  return (

    <section className="statistics">

      <h2>Trusted By Thousands</h2>

      <p>
        Securely managing important documents every day.
      </p>

      <div className="stats-grid">

        {stats.map((item,index)=>(

          <div className="stat-card" key={index}>

            <h1>

              <CountUp
                end={item.number}
                duration={3}
              />

              {item.suffix}

            </h1>

            <span>{item.title}</span>

          </div>

        ))}

      </div>

    </section>

  );

}

export default Statistics;