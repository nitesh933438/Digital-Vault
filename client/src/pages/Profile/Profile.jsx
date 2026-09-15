import { useEffect, useRef, useState } from "react";
import "./Profile.css";
import BackButton from "../../components/BackButton/BackButton";
import toast from "react-hot-toast";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaEdit,
  FaSave,
  FaCamera,
  FaTimes,
} from "react-icons/fa";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { uploadToCloudinary } from "../../services/cloudinaryService";

function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    createdAt: "",
    photoURL: "",
  });

  useEffect(() => {
    loadProfile();
    return () => {
      if (photoPreview?.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    };
    // Profile is loaded once when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? snap.data() : {};
      const photoURL = user.photoURL || data.photoURL || "";
      setProfile({
        name: data.name || user.displayName || "",
        email: user.email || data.email || "",
        mobile: data.mobile || "",
        createdAt: user.metadata?.creationTime || "",
        photoURL,
      });
      setPhotoPreview(photoURL);
    } catch (err) {
      toast.error(err.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      toast.error("Please choose a JPG, PNG or WEBP image.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile photo must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }
    if (photoPreview?.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    if (photoPreview?.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("Please login again.");
      return;
    }
    if (!profile.name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    try {
      setSaving(true);
      let photoURL = profile.photoURL || "";

      if (photoFile) {
        const uploaded = await uploadToCloudinary(photoFile);
        photoURL = uploaded.secure_url;
      }

      await updateProfile(user, {
        displayName: profile.name.trim(),
        photoURL: photoURL || null,
      });

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name: profile.name.trim(),
          email: user.email || profile.email,
          mobile: profile.mobile.trim(),
          photoURL: photoURL || "",
          createdAt: profile.createdAt || user.metadata?.creationTime || "",
        },
        { merge: true }
      );

      setProfile((current) => ({ ...current, name: profile.name.trim(), photoURL }));
      setPhotoFile(null);
      setPhotoPreview(photoURL);
      if (fileInputRef.current) fileInputRef.current.value = "";
      window.dispatchEvent(new Event("profileUpdated"));
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading Profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-page-inner">
        <div className="profile-back-row">
          <BackButton label="Back to Dashboard" />
        </div>

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar-wrap">
              <button
                type="button"
                className="profile-avatar"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change profile photo"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" />
                ) : (
                  <FaUserCircle />
                )}
                <span className="avatar-camera"><FaCamera /></span>
              </button>
              {photoPreview && (
                <button type="button" className="remove-photo-btn" onClick={removePhoto} title="Remove photo">
                  <FaTimes />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              className="profile-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
            />
            <button type="button" className="change-photo-link" onClick={() => fileInputRef.current?.click()}>
              <FaCamera /> Change profile photo
            </button>
            <h2>{profile.name || "User"}</h2>
            <p>Manage your Digital Vault profile</p>
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label><FaUserCircle /> Full Name</label>
              <input type="text" name="name" value={profile.name} onChange={handleChange} autoComplete="name" />
            </div>

            <div className="form-group">
              <label><FaEnvelope /> Email Address</label>
              <input type="email" value={profile.email} disabled />
            </div>

            <div className="form-group">
              <label><FaPhone /> Mobile Number</label>
              <input type="tel" name="mobile" value={profile.mobile} onChange={handleChange} autoComplete="tel" placeholder="Enter mobile number" />
            </div>

            <div className="form-group">
              <label><FaCalendarAlt /> Account Created</label>
              <input type="text" value={profile.createdAt || "Not available"} disabled />
            </div>

            <button className="save-btn" onClick={saveProfile} disabled={saving}>
              {saving ? <><FaSave /> Saving...</> : <><FaEdit /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
