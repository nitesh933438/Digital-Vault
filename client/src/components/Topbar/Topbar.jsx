import "./Topbar.css";
import { useState, useEffect, useRef } from "react";
import {
  FaBell,
  FaSearch,
  FaUserCircle,
  FaCloud,
  FaRobot,
  FaChevronDown,
  FaCog,
  FaUser,
  FaSignOutAlt
} from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";

import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../services/authService";
import { subscribeNotifications } from "../../services/notificationService";

import toast from "react-hot-toast";

function Topbar() {

  const { user } = useAuth();

  const navigate = useNavigate();

  const [showNotification, setShowNotification] = useState(false);

  const [showProfile, setShowProfile] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [time, setTime] = useState(new Date());
  const [searchText, setSearchText] = useState("");

  const profileRef = useRef();

  const notifyRef = useRef();

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      return undefined;
    }

    const unsubscribe = subscribeNotifications((data) => {
      setNotifications(data || []);
    });

    return () => unsubscribe?.();
  }, [user?.uid]);

  useEffect(() => {

    const interval = setInterval(() => {

      setTime(new Date());

    },1000);

    return ()=>clearInterval(interval);

  },[]);

  useEffect(()=>{

    const close=(e)=>{

      if(profileRef.current &&
      !profileRef.current.contains(e.target)){

        setShowProfile(false);

      }

      if(notifyRef.current &&
      !notifyRef.current.contains(e.target)){

        setShowNotification(false);

      }

    };

    document.addEventListener("mousedown",close);

    return ()=>document.removeEventListener("mousedown",close);

  },[]);

  const handleLogout=async()=>{

    try{

      await logoutUser();

      toast.success("Logged Out");

      navigate("/login");

    }

    catch(err){

      toast.error(err.message);

    }

  };

  return (

<header className="topbar">

<div className="search-box">

<FaSearch/>

<input
type="text"
placeholder="Search documents, folders, PDF..."
value={searchText}
onChange={(e) => setSearchText(e.target.value)}
onKeyDown={(e) => {
  if (e.key === "Enter") navigate(searchText.trim() ? `/documents?search=${encodeURIComponent(searchText.trim())}` : "/documents");
}}
/>

<button className="ai-search" type="button" onClick={() => navigate("/dashboard?assistant=1")}>

<FaRobot/>

AI Search

</button>

</div>

<div className="topbar-right">

<div className="live-time">

<div>

<h4>

{time.toLocaleDateString()}

</h4>

<span>

{time.toLocaleTimeString()}

</span>

</div>

</div>

<div className="cloud-status">

<FaCloud/>

<span>

Synced

</span>

</div>

<div
className="notification-wrapper"
ref={notifyRef}
>

<button
className="notification-btn"
onClick={()=>
setShowNotification(
!showNotification
)}
>

<FaBell/>

{notifications.filter((item) => !item.read).length > 0 && (
  <span className="notification-badge">
    {notifications.filter((item) => !item.read).length}
  </span>
)}

</button>

{

showNotification &&

<div className="notification-dropdown">

<div className="dropdown-header">

<h3>

Notifications

</h3>

<Link to="/notifications">

View All

</Link>

</div>

{

notifications.length===0 ?

<p className="empty">

No Notifications

</p>

:

notifications
.slice(0,5)
.map(item=>(

<div
className="notify-item"
key={item.id}
>

<h4>

{item.message}

</h4>

<span>

{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : "Just now"}

</span>

</div>

))

}

</div>

}

</div>

<ThemeToggle/>

<div
className="profile-wrapper"
ref={profileRef}
>

<div
className="profile-box"
onClick={()=>
setShowProfile(
!showProfile
)}
>

{

user?.photoURL ? (
  <span className="profile-image-wrap">
    <img
      src={user.photoURL}
      alt="Profile"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.style.display = "none";
        e.currentTarget.parentElement?.querySelector(".profile-fallback-icon")?.classList.remove("hidden");
      }}
    />
    <FaUserCircle className="profile-fallback-icon hidden" />
  </span>
) : (
  <FaUserCircle className="profile-icon" />
)

}

<div className="profile-info">

<h4>

{

user?.displayName ||

"User"

}

</h4>

<span>

Premium User

</span>

</div>

<FaChevronDown/>

</div>

{

showProfile &&

<div className="profile-dropdown">

<Link to="/profile">

<FaUser/>

Profile

</Link>

<Link to="/settings">

<FaCog/>

Settings

</Link>

<button
onClick={handleLogout}
>

<FaSignOutAlt/>

Logout

</button>

</div>

}

</div>

</div>

</header>

  );

}

export default Topbar;