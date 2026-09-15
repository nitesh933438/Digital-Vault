import "./Contact.css";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaFacebook, FaInstagram, FaLinkedin, FaGithub, FaPaperPlane } from "react-icons/fa";
import { submitContactMessage } from "../../services/contactService";

const CONTACT_EMAIL = "nitesh933438@gmail.com";

function Contact() {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    try {
      setBusy(true);
      await submitContactMessage(form);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent successfully. We’ll get back to you soon.");
    } catch (error) {
      toast.error(error.message || "Could not send your message.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-left">
        <span className="contact-eyebrow">We’re here to help</span>
        <h2>Contact Us</h2>
        <p>Have a question, feedback, or need help with Digital Vault? Send us a message and we’ll get back to you.</p>
        <div className="contact-info">
          <div><FaMapMarkerAlt /><span>Patna, Bihar, India</span></div>
          <div><FaEnvelope /><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></div>
          <div><FaPhone /><a href="tel:+919334387983">+91 9334387983</a></div>
        </div>
        <div className="social-icons" aria-label="Social links">
          <a href="https://www.facebook.com/share/1BfEnT1HRq/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
          <a href="https://www.instagram.com/i._am_nitesh_?igsh=azN4OWx0eDZjOGNh" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
          <a href="https://www.linkedin.com/in/nitesh-kumar-3b7b4b382" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
          <a href="https://github.com/nitesh933438" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
        </div>
      </div>
      <div className="contact-right">
        <form onSubmit={submit} noValidate>
          <div className="contact-form-grid">
            <label><span>Your Name</span><input type="text" value={form.name} onChange={update("name")} placeholder="Enter your name" autoComplete="name" maxLength={100} required /></label>
            <label><span>Email Address</span><input type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" autoComplete="email" maxLength={160} required /></label>
          </div>
          <label><span>Subject</span><input type="text" value={form.subject} onChange={update("subject")} placeholder="How can we help?" maxLength={180} /></label>
          <label><span>Message</span><textarea rows="7" value={form.message} onChange={update("message")} placeholder="Write your message..." maxLength={5000} required /></label>
          <button type="submit" disabled={busy}><FaPaperPlane /> {busy ? "Sending..." : "Send Message"}</button>
          <small>Your message is securely saved in the Digital Vault support inbox for the administrator.</small>
        </form>
      </div>
    </section>
  );
}

export default Contact;
