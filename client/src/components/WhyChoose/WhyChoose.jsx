import "./WhyChoose.css";

import { Link } from "react-router-dom";

import {
FaLock,
FaCloudUploadAlt,
FaMobileAlt,
FaUserShield
} from "react-icons/fa";

function WhyChoose(){

const data=[

{
icon:<FaLock/>,
title:"Military Grade Security",
desc:"Your documents are protected using secure cloud encryption."
},

{
icon:<FaCloudUploadAlt/>,
title:"Unlimited Uploads",
desc:"Upload all your important documents without hassle."
},

{
icon:<FaMobileAlt/>,
title:"Access Anywhere",
desc:"Open your files from Mobile, Tablet or Desktop anytime."
},

{
icon:<FaUserShield/>,
title:"Privacy Guaranteed",
desc:"Only you can view and manage your personal documents."
}

];

return(

<section
className="why-section"
id="about"
>

<div className="why-left">

<h2>

Why Choose Digital Vault?

</h2>

<p>

Digital Vault keeps your important documents safe,
organized and accessible anytime from anywhere.

</p>

<Link to="/register" className="why-start-btn">Start Storing →</Link>

</div>

<div className="why-right">

{

data.map((item,index)=>(

<div
key={index}
className="why-card"
>

<div className="why-icon">

{item.icon}

</div>

<div>

<h3>

{item.title}

</h3>

<p>

{item.desc}

</p>

</div>

</div>

))

}

</div>

</section>

);

}

export default WhyChoose;