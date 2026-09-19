import "./Settings.css";
import BackButton from "../../components/BackButton/BackButton";
import { useEffect, useState } from "react";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import toast from "react-hot-toast";

function Settings() {

  const [autoLogout, setAutoLogout] = useState(false);

  const [emailNotification, setEmailNotification] = useState(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("settings") || "{}");
      if (typeof saved.autoLogout === "boolean") setAutoLogout(saved.autoLogout);
      if (typeof saved.emailNotification === "boolean") setEmailNotification(saved.emailNotification);
    } catch {
      // Ignore invalid local settings and use defaults.
    }
  }, []);

  const saveSettings = () => {

    localStorage.setItem(
      "settings",
      JSON.stringify({
        autoLogout,
        emailNotification
      })
    );

    window.dispatchEvent(new Event("settingsUpdated"));
    toast.success("Settings Saved Successfully");

  };

  return (

    <div className="settings-page">

      <div className="page-back-row"><BackButton label="Back to Dashboard" /></div>

      <h1>

        ⚙ Settings

      </h1>

      <div className="settings-card">

        <div className="setting-item">

          <div>

            <h3>

              Dark Mode

            </h3>

            <p>

              Change Application Theme

            </p>

          </div>

          <ThemeToggle />

        </div>

        <div className="setting-item">

          <div>

            <h3>

              Email Notifications

            </h3>

            <p>

              Receive Email Alerts

            </p>

          </div>

          <input

            type="checkbox"

            checked={emailNotification}

            onChange={(e)=>

              setEmailNotification(

                e.target.checked

              )

            }

          />

        </div>

        <div className="setting-item">

          <div>

            <h3>

              Auto Logout

            </h3>

            <p>

              Logout after inactivity

            </p>

          </div>

          <input

            type="checkbox"

            checked={autoLogout}

            onChange={(e)=>

              setAutoLogout(

                e.target.checked

              )

            }

          />

        </div>

        <button

          className="save-btn"

          onClick={saveSettings}

        >

          Save Settings

        </button>

      </div>

    </div>

  );

}

export default Settings;