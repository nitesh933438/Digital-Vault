import "./HowItWorks.css";

import {
  FaUserPlus,
  FaCloudUploadAlt,
  FaFolderOpen,
  FaDownload
} from "react-icons/fa";

function HowItWorks() {

  const steps = [

    {
      icon: <FaUserPlus />,
      title: "Create Account",
      desc: "Register yourself in just a few seconds."
    },

    {
      icon: <FaCloudUploadAlt />,
      title: "Upload Documents",
      desc: "Upload Aadhaar, PAN, Resume and Certificates."
    },

    {
      icon: <FaFolderOpen />,
      title: "Manage Documents",
      desc: "Preview, Search and Organize your files."
    },

    {
      icon: <FaDownload />,
      title: "Download Anytime",
      desc: "Access your documents securely from anywhere."
    }

  ];

  return (

    <section className="works">

      <h2>

        How It Works

      </h2>

      <p>

        Start managing your documents in just four simple steps.

      </p>

      <div className="works-grid">

        {

          steps.map((item,index)=>(

            <div
              className="works-card"
              key={index}
            >

              <div className="step-number">

                {index+1}

              </div>

              <div className="works-icon">

                {item.icon}

              </div>

              <h3>

                {item.title}

              </h3>

              <p>

                {item.desc}

              </p>

            </div>

          ))

        }

      </div>

    </section>

  );

}

export default HowItWorks;