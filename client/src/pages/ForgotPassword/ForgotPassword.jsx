import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaPaperPlane,
  FaShieldAlt
} from "react-icons/fa";

import toast from "react-hot-toast";

import { resetPassword } from "../../services/authService";

import "./ForgotPassword.css";
import BackButton from "../../components/BackButton/BackButton";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";

function ForgotPassword() {

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (value) => {

    const regex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(value);

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!email.trim()) {

      toast.error("Please enter your email.");

      return;

    }

    if (!validateEmail(email)) {

      toast.error("Please enter a valid email.");

      return;

    }

    try {

      setLoading(true);

      await resetPassword(email.trim());

      setEmailSent(true);

      toast.success(
        "Password reset email has been sent."
      );

    } catch (err) {

      switch (err.code) {

        case "auth/user-not-found":

          toast.error(
            "No account found with this email."
          );

          break;

        case "auth/invalid-email":

          toast.error(
            "Invalid email address."
          );

          break;

        case "auth/network-request-failed":
          toast.error("Network error. Check your internet connection and try again.");
          break;

        case "auth/operation-not-allowed":
          toast.error("Password reset is not enabled in Firebase Authentication. Enable Email/Password sign-in in Firebase Console.");
          break;

        case "auth/invalid-api-key":
        case "auth/api-key-not-valid":
          toast.error("Firebase API key is invalid. Check client/.env against Firebase Console.");
          break;

        case "auth/too-many-requests":

          toast.error(
            "Too many requests. Please try again later."
          );

          break;

        default:

          toast.error(
            err.message ||
            "Unable to send reset email."
          );

      }

    } finally {

      setLoading(false);

    }

  };

    return (

    <div className="forgot-page">

      <div className="bg-circle circle1"></div>
      <div className="bg-circle circle2"></div>
      <div className="bg-circle circle3"></div>

      <motion.div

        className="forgot-card"

        initial={{ opacity: 0, y: 60 }}

        animate={{ opacity: 1, y: 0 }}

        transition={{ duration: .7 }}

      >

        <div className="auth-top-actions forgot-theme-action"><BackButton label="Back To Login" /><ThemeToggle /></div>

        <div className="forgot-icon">

          <FaShieldAlt />

        </div>

        <h1>

          Forgot Password?

        </h1>

        <p>

          Don't worry! Enter your registered email address
          and we'll send you a secure password reset link.

        </p>

        {

          emailSent &&

          <div className="success-box">

            <FaPaperPlane />

            <span>

              Password reset link sent successfully.
              Please check your inbox.

            </span>

          </div>

        }

        <form onSubmit={handleSubmit}>

          <div className="input-box">

            <FaEnvelope />

            <input

              type="email"

              placeholder="Enter your email"

              autoComplete="email"

              value={email}

              onChange={(e)=>

                setEmail(e.target.value)

              }

            />

          </div>

          <button

            type="submit"

            className="reset-btn"

            disabled={loading}

          >

            {

              loading

              ?

              "Sending Reset Link..."

              :

              "Send Reset Link"

            }

          </button>

        </form>

        

      </motion.div>

    </div>

  );

}

export default ForgotPassword;