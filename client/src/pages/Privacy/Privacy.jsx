import "./Privacy.css";
import BackButton from "../../components/BackButton/BackButton";

function Privacy() {

  return (

    <div className="privacy-page">

      <div className="privacy-container">

        <div className="legal-back-row"><BackButton label="Back" /></div>

        <h1>

          Privacy Policy

        </h1>

        <p>

          Last Updated : July 2026

        </p>

        <section>

          <h2>

            Information We Collect

          </h2>

          <p>

            We collect only the information required to provide secure
            document storage services. This includes your name,
            email address and uploaded documents.

          </p>

        </section>

        <section>

          <h2>

            Document Security

          </h2>

          <p>

            Your uploaded files are securely stored using Firebase
            Storage and protected by authentication.

          </p>

        </section>

        <section>

          <h2>

            Cookies

          </h2>

          <p>

            We use cookies to improve your experience,
            remember your preferences and analyze traffic.

          </p>

        </section>

        <section>

          <h2>

            Third Party Services

          </h2>

          <p>

            We use Firebase Authentication,
            Cloudinary for file storage and Firestore Database.

          </p>

        </section>

        <section>

          <h2>

            Contact

          </h2>

          <p>

            support@digitalvault.com

          </p>

        </section>

      </div>

    </div>

  );

}

export default Privacy;