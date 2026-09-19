import "./WhatsAppButton.css";
import { FaWhatsapp } from "react-icons/fa";

function WhatsAppButton() {

  // Your WhatsApp Number
  const phone = "919334387983";

  // Default Message
  const message = encodeURIComponent(
    "Hi Nitesh 👋, I visited your Digital Vault website and I'd like to know more about it."
  );

  return (

    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-btn"
      title="Chat with Nitesh on WhatsApp"
    >

      <FaWhatsapp />

      <span>Chat</span>

    </a>

  );

}

export default WhatsAppButton;