import { useEffect, useState } from "react";
import "./CookieBanner.css";

function CookieBanner() {

  const [show, setShow] = useState(false);

  useEffect(() => {

    const accepted = localStorage.getItem("cookieConsent");

    if (!accepted) {

      setShow(true);

    }

  }, []);

  const handleAccept = () => {

    localStorage.setItem("cookieConsent", "accepted");

    setShow(false);

  };

  const handleReject = () => {

    localStorage.setItem("cookieConsent", "rejected");

    setShow(false);

  };

  if (!show) return null;

  return (

    <div className="cookie-banner">

      <div>

        <h3>🍪 Cookie Notice</h3>

        <p>

          We use cookies to improve your experience, enhance security
          and analyze website traffic.

        </p>

      </div>

      <div className="cookie-buttons">

        <button
          className="reject-btn"
          onClick={handleReject}
        >

          Reject

        </button>

        <button
          className="accept-btn"
          onClick={handleAccept}
        >

          Accept

        </button>

      </div>

    </div>

  );

}

export default CookieBanner;