import "./QuickStats.css";

function QuickStats() {

  const stats = [
    {
      number: "50K+",
      title: "Documents Stored"
    },
    {
      number: "12K+",
      title: "Happy Users"
    },
    {
      number: "99.99%",
      title: "Secure Storage"
    },
    {
      number: "24/7",
      title: "Cloud Access"
    }
  ];

  return (

    <section className="stats">

      <h2>Trusted By Thousands</h2>

      <div className="stats-grid">

        {stats.map((item,index)=>(

          <div className="stat-card" key={index}>

            <h1>{item.number}</h1>

            <p>{item.title}</p>

          </div>

        ))}

      </div>

    </section>

  );

}

export default QuickStats;