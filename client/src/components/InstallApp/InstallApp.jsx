import { useEffect, useState } from "react";
import { FaDownload, FaTimes, FaMobileAlt, FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import "./InstallApp.css";

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(() => isStandalone());
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);
  const [android, setAndroid] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/i.test(ua);
    setIos(isIOS);
    setAndroid(isAndroid);

    const onBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setCanInstall(true);
      if (!isStandalone()) {
        const dismissed = sessionStorage.getItem("dv-install-dismissed");
        if (!dismissed) setVisible(true);
      }
    };

    const onInstalled = () => {
      setInstalled(true);
      setVisible(false);
      setDeferredPrompt(null);
      setCanInstall(false);
      toast.success("Digital Vault installed successfully 🎉");
    };

    const showInstall = () => {
      if (!isStandalone()) {
        setVisible(true);
        return;
      }
      toast("Digital Vault is already installed.", { icon: "✅" });
    };

    if (!isStandalone() && !sessionStorage.getItem("dv-install-dismissed")) {
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("dv:show-install", showInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("dv:show-install", showInstall);
    };
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        if (result.outcome === "dismissed") {
          sessionStorage.setItem("dv-install-dismissed", "1");
          setVisible(false);
        }
      } catch (error) {
        console.warn("Install prompt failed:", error);
      } finally {
        setDeferredPrompt(null);
        setCanInstall(false);
      }
      return;
    }

    if (ios) {
      setVisible(true);
      toast("On iPhone/iPad: tap Share → Add to Home Screen.", { icon: "📱", duration: 6000 });
      return;
    }

    // Browsers that do not expose beforeinstallprompt cannot be opened
    // programmatically. Keep the install CTA useful with platform guidance.
    if (android) {
      toast("Open your browser menu and choose 'Install app' or 'Add to Home screen'.", { icon: "📲", duration: 6000 });
    } else {
      toast("If Install App is not offered, open the browser menu and choose 'Install Digital Vault' or 'Add to Home screen'.", { icon: "💻", duration: 6500 });
    }
  };

  const dismiss = () => {
    sessionStorage.setItem("dv-install-dismissed", "1");
    setVisible(false);
  };

  if (installed) return null;

  return (
    <>
      {visible && (
        <div className="dv-install-banner" role="dialog" aria-label="Install Digital Vault">
          <div className="dv-install-brand">
            <img src={`${import.meta.env.BASE_URL}app-logo.svg`} alt="Digital Vault" />
            <div>
              <strong>Install Digital Vault</strong>
              <span>Use your vault like a real app — faster access, full-screen experience.</span>
            </div>
          </div>
          <div className="dv-install-actions">
            <button className="dv-install-now" onClick={install}><FaDownload /> Install App</button>
            <button className="dv-install-close" onClick={dismiss} aria-label="Close install banner"><FaTimes /></button>
          </div>
        </div>
      )}

      {!visible && (canInstall || deferredPrompt || ios || android) && (
        <button className="dv-install-fab" onClick={install} aria-label="Install Digital Vault">
          <FaMobileAlt /> <span>Install App</span>
        </button>
      )}
    </>
  );
}

export default InstallApp;
