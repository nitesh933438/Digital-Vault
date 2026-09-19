import { useState } from "react";
import "./Newsletter.css";
import { FaPaperPlane, FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import { subscribeToNewsletter } from "../../services/newsletterService";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (busy) return;
    try {
      setBusy(true);
      const result = await subscribeToNewsletter(email);
      if (result.alreadySubscribed) {
        toast.success("You're already subscribed to Digital Vault updates.");
      } else {
        toast.success("🎉 You're subscribed! We'll keep you updated.");
      }
      setSubscribed(true);
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error(error.message || "Could not subscribe right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="newsletter" id="newsletter">
      <div className="newsletter-content">
        <h2>Stay Updated</h2>
        <p>Subscribe to receive the latest updates, security tips and new features.</p>
        {subscribed ? (
          <div className="newsletter-success"><FaCheckCircle /> Subscription saved successfully.</div>
        ) : (
          <form onSubmit={subscribe}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter your email" autoComplete="email" required disabled={busy} />
            <button type="submit" disabled={busy}>{busy ? "Subscribing…" : <><FaPaperPlane /> Subscribe</>}</button>
          </form>
        )}
      </div>
    </section>
  );
}

export default Newsletter;
