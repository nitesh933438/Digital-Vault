import "./Testimonials.css";
import { FaStar } from "react-icons/fa";

function Testimonials() {

  const reviews = [

    {
      name: "Rahul Kumar",
      role: "Student",
      message:
        "Digital Vault helped me store all my certificates safely. Amazing experience!"
    },

    {
      name: "Priya Sharma",
      role: "Software Engineer",
      message:
        "Very clean interface and super secure. I can access my documents anytime."
    },

    {
      name: "Amit Singh",
      role: "Business Owner",
      message:
        "The best cloud document manager I've ever used. Highly recommended."
    }

  ];

  return (

    <section className="testimonial">

      <h2>

        What Our Users Say

      </h2>

      <p>

        Thousands of users trust Digital Vault every day.

      </p>

      <div className="testimonial-grid">

        {

          reviews.map((item,index)=>(

            <div
              className="testimonial-card"
              key={index}
            >

              <div className="user-avatar">

                {item.name.charAt(0)}

              </div>

              <h3>

                {item.name}

              </h3>

              <span>

                {item.role}

              </span>

              <div className="stars">

                <FaStar/>
                <FaStar/>
                <FaStar/>
                <FaStar/>
                <FaStar/>

              </div>

              <p>

                "{item.message}"

              </p>

            </div>

          ))

        }

      </div>

    </section>

  );

}

export default Testimonials;