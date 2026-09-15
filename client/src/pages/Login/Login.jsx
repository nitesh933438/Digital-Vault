import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { sendEmailVerification, reload, signOut } from "firebase/auth";

import { auth } from "../../firebase/firebase";

import {
  loginUser,
  googleLogin,
} from "../../services/authService";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaCloudUploadAlt,
  FaLockOpen
} from "react-icons/fa";

import "./Login.css";
import GoogleLogo from "../../components/GoogleLogo";
import BackButton from "../../components/BackButton/BackButton";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";

function Login() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const ADMIN_EMAIL = "nitesh933438@gmail.com";


  // =========================
  // Login
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!email.trim()) {

      toast.error("Please enter your email.");

      return;

    }

    if (!password.trim()) {

      toast.error("Please enter your password.");

      return;

    }

    try {

      if (email.trim().toLowerCase() === ADMIN_EMAIL) {
        toast.error("Admin must sign in with Google using nitesh933438@gmail.com.");
        return;
      }

      setLoading(true);

      const userCredential = await loginUser(

        email.trim(),

        password

      );

      const user = userCredential.user;

      await reload(user);
      if (!user.emailVerified) {
        toast("Email is not verified yet. You can still use your account; verify it from your inbox for full account security.", { icon: "✉️", duration: 5000 });
      } else {
        toast.success("Login Successful 🎉");
      }

      navigate("/dashboard");

    }

    catch (err) {

      switch (err.code) {

        case "auth/user-not-found":

          toast.error("User not found.");

          break;

        case "auth/wrong-password":

          toast.error("Wrong password.");

          break;

        case "auth/invalid-email":

          toast.error("Invalid email.");

          break;

        case "auth/invalid-credential":

          toast.error("Invalid email or password.");

          break;

        case "auth/too-many-requests":

          toast.error("Too many attempts. Try later.");

          break;

        case "auth/network-request-failed":
          toast.error("Network error. Check your internet connection and try again.");
          break;
        case "auth/api-key-not-valid":
        case "auth/invalid-api-key":
          toast.error("Firebase API key is invalid. Check client/.env against Firebase Console → Project settings → Your apps.");
          break;

        case "auth/operation-not-allowed":
          toast.error("Email/password sign-in is disabled in Firebase Authentication.");
          break;

        default:

          toast.error(

            err.message ||

            "Login Failed"

          );

      }

    }

    finally {

      setLoading(false);

    }

  };

  // =========================
  // Google Login
  // =========================

  const handleGoogleLogin = async () => {

    try {

      setLoading(true);

      const result = await googleLogin();
      if (!result?.user) {
        throw new Error("Google Login Failed");
      }

    }

    catch (err) {

      toast.error(

        err.message ||

        "Google Login Failed"

      );

    }

    finally {

      setLoading(false);

    }

  };

  const handleResendVerification = async () => {
    try {
      const credential = await loginUser(email.trim(), password);
      if (credential.user.emailVerified) {
        toast.success("Your email is already verified. Please log in.");
        return;
      }
      await sendEmailVerification(credential.user);
      await signOut(auth);
      toast.success("Verification email sent again. Please check your inbox.");
    } catch (err) {
      toast.error(err.message || "Unable to resend verification email.");
    }
  };

    return (

    <div className="login-page">

      <div className="bg-circle circle1"></div>
      <div className="bg-circle circle2"></div>
      <div className="bg-circle circle3"></div>

      <div className="login-container">

        {/* LEFT */}

        <div className="login-left">

          <h1 className="brand-heading">
            <img src={`${import.meta.env.BASE_URL}app-logo.svg`} alt="Digital Vault" className="brand-heading-logo" />
            <span>Digital Vault</span>
          </h1>

          <p>

            Secure Cloud Based Digital Document Management System.

          </p>

          <div className="feature-box">

            <div>

              <FaShieldAlt />

              <span>

                End-to-End Encryption

              </span>

            </div>

            <div>

              <FaCloudUploadAlt />

              <span>

                Secure Cloud Storage

              </span>

            </div>

            <div>

              <FaLockOpen />

              <span>

                Access Anywhere Anytime

              </span>

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="login-right">

          <div className="auth-top-actions"><BackButton label="Back to Home" /><ThemeToggle /></div>

          <div className="auth-back-row" style={{display:"none"}}><BackButton label="Back to Home" /></div>

          <h2>

            Welcome Back 👋

          </h2>

          <p>

            Login to continue

          </p>

          <form onSubmit={handleSubmit}>

            <div className="input-box">

              <FaEnvelope />

              <input

                type="email"

                placeholder="Email Address"

                autoComplete="email"

                required

                value={email}

                onChange={(e) =>

                  setEmail(e.target.value)

                }

              />

            </div>

            <div className="input-box">

              <FaLock />

              <input

                type={

                  showPassword

                    ? "text"

                    : "password"

                }

                placeholder="Password"

                autoComplete="current-password"

                required

                value={password}

                onChange={(e) =>

                  setPassword(e.target.value)

                }

              />

              <button

                type="button"

                className="eye-btn"

                onClick={() =>

                  setShowPassword(

                    !showPassword

                  )

                }

              >

                {

                  showPassword

                    ?

                    <FaEyeSlash />

                    :

                    <FaEye />

                }

              </button>

            </div>

            <div className="login-options">
              <Link to="/forgot-password">Forgot Password?</Link>
              <button type="button" className="resend-link" onClick={handleResendVerification} disabled={loading || !email.trim() || !password}>
                Resend verification
              </button>
            </div>

            <button

              type="submit"

              className="login-btn"

              disabled={loading}

            >

              {

                loading

                  ?

                  "Logging In..."

                  :

                  "Login"

              }

            </button>

            <div className="divider">

              <span>

                OR

              </span>

            </div>

            <button

              type="button"

              className="google-btn"

              disabled={loading}

              onClick={handleGoogleLogin}

            >

              <GoogleLogo size={20} />

              Continue with Google

            </button>

            <p className="register-text">

              Don't have an account?

              <Link to="/register">

                Register

              </Link>

            </p>

          </form>

        </div>

      </div>

    </div>

  );

}

export default Login;