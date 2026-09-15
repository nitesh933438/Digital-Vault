import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

import toast from "react-hot-toast";

import {
  sendEmailVerification,
  signOut
} from "firebase/auth";

import { auth } from "../../firebase/firebase";

import {
  registerUser,
  googleLogin
} from "../../services/authService";

import "./Register.css";
import GoogleLogo from "../../components/GoogleLogo";
import BackButton from "../../components/BackButton/BackButton";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";

function Register() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({

    name: "",

    email: "",

    mobile: "",

    password: "",

    confirmPassword: ""

  });

  const handleChange = (e) => {

    setForm({

      ...form,

      [e.target.name]: e.target.value

    });

  };

  // ===========================
  // Register
  // ===========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    // Name

    if (!form.name.trim()) {

      toast.error("Please enter your name.");

      return;

    }

    // Email

    if (!form.email.trim()) {

      toast.error("Please enter your email.");

      return;

    }

    const emailRegex =

      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {

      toast.error("Invalid email address.");

      return;

    }

    // Mobile

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {

      toast.error(

        "Enter valid 10 digit mobile number."

      );

      return;

    }

    // Password

    if (form.password.length < 6) {

      toast.error(

        "Password must be at least 6 characters."

      );

      return;

    }

    if (

      !/(?=.*[A-Z])/.test(form.password)

    ) {

      toast.error(

        "Password must contain one uppercase letter."

      );

      return;

    }

    if (

      !/(?=.*[0-9])/.test(form.password)

    ) {

      toast.error(

        "Password must contain one number."

      );

      return;

    }

    if (

      form.password !==

      form.confirmPassword

    ) {

      toast.error(

        "Passwords do not match."

      );

      return;

    }

    try {

      setLoading(true);

      const result = await registerUser(

        form.name.trim(),

        form.email.trim(),

        form.mobile,

        form.password

      );

      await sendEmailVerification(

        result.user

      );

      await signOut(auth);

      toast.success(

        "Registration Successful. Verification email sent."

      );

      navigate("/login");

    }

    catch (err) {

      switch (err.code) {

        case "auth/email-already-in-use":

          toast.error(

            "Email already registered."

          );

          break;

        case "auth/invalid-email":

          toast.error(

            "Invalid email."

          );

          break;

        case "auth/weak-password":

          toast.error(

            "Weak password."

          );

          break;

        default:

          toast.error(

            err.message ||

            "Registration Failed"

          );

      }

    }

    finally {

      setLoading(false);

    }

  };

  // ===========================
  // Google Register
  // ===========================

  const handleGoogleRegister = async () => {

    try {

      setLoading(true);

      const result = await googleLogin();
      if (!result?.user) {
        throw new Error("Google sign-in did not return a user.");
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

    return (

    <div className="register-page">

      <div className="floating one"></div>
      <div className="floating two"></div>
      <div className="floating three"></div>

      <motion.div

        className="register-card"

        initial={{ opacity: 0, y: 50 }}

        animate={{ opacity: 1, y: 0 }}

        transition={{ duration: .8 }}

      >

        <div className="auth-top-actions"><BackButton label="Back to Home" /><ThemeToggle /></div>

        <h1>

          Create Account 🚀

        </h1>

        <p>

          Create your secure Digital Vault account.

        </p>

        <form onSubmit={handleSubmit}>

          {/* Name */}

          <input

            type="text"

            name="name"

            placeholder="Full Name"

            autoComplete="name"

            required

            value={form.name}

            onChange={handleChange}

          />

          {/* Email */}

          <input

            type="email"

            name="email"

            placeholder="Email Address"

            autoComplete="email"

            required

            value={form.email}

            onChange={handleChange}

          />

          {/* Mobile */}

          <input

            type="tel"

            name="mobile"

            placeholder="Mobile Number"

            autoComplete="tel"

            maxLength={10}

            required

            value={form.mobile}

            onChange={handleChange}

          />

          {/* Password */}

          <div className="password-box">

            <input

              type={

                showPassword

                  ? "text"

                  : "password"

              }

              name="password"

              placeholder="Password"

              autoComplete="new-password"

              required

              value={form.password}

              onChange={handleChange}

            />

            <button

              type="button"

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

          {/* Confirm Password */}

          <div className="password-box">

            <input

              type={

                showConfirmPassword

                  ? "text"

                  : "password"

              }

              name="confirmPassword"

              placeholder="Confirm Password"

              autoComplete="new-password"

              required

              value={form.confirmPassword}

              onChange={handleChange}

            />

            <button

              type="button"

              onClick={() =>

                setShowConfirmPassword(

                  !showConfirmPassword

                )

              }

            >

              {

                showConfirmPassword

                  ?

                  <FaEyeSlash />

                  :

                  <FaEye />

              }

            </button>

          </div>

          <button

            type="submit"

            disabled={loading}

          >

            {

              loading

                ?

                "Creating Account..."

                :

                "Create Account"

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

            onClick={handleGoogleRegister}

          >

            <GoogleLogo size={20} />

            Continue with Google

          </button>

        </form>

        <p className="login-link">

          Already have an account?

          <Link to="/login">

            Login

          </Link>

        </p>

      </motion.div>

    </div>

  );

}

export default Register;