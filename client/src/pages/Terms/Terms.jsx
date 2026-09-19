import "./Terms.css";
import BackButton from "../../components/BackButton/BackButton";

function Terms() {

  return (

    <div className="terms-page">

      <div className="terms-container">

        <div className="legal-back-row"><BackButton label="Back" /></div>

        <h1>

          Terms & Conditions

        </h1>

        <p>

          Last Updated : July 2026

        </p>

        <section>

          <h2>

            Acceptance of Terms

          </h2>

          <p>

            By using Digital Vault, you agree to follow these
            Terms and Conditions.

          </p>

        </section>

        <section>

          <h2>

            User Responsibilities

          </h2>

          <p>

            You are responsible for maintaining the confidentiality of
            your account and uploaded documents.

          </p>

        </section>

        <section>

          <h2>

            Document Ownership

          </h2>

          <p>

            All uploaded documents remain your property. We do not claim
            ownership of your files.

          </p>

        </section>

        <section>

          <h2>

            Security

          </h2>

          <p>

            We use secure technologies to protect your data, but no
            online service is 100% risk-free.

          </p>

        </section>

        <section>

          <h2>

            Account Termination

          </h2>

          <p>

            We reserve the right to suspend accounts that violate these
            terms.

          </p>

        </section>

      </div>

    </div>

  );

}

export default Terms;