import "./Features.css";

import {
FaCloudUploadAlt,
FaLock,
FaDownload,
FaEye,
FaMobileAlt,
FaShieldAlt
} from "react-icons/fa";

function Features() {

const features=[

{
icon:<FaCloudUploadAlt/>,
title:"Easy Upload",
desc:"Upload your documents securely with drag & drop."
},

{
icon:<FaLock/>,
title:"Secure Storage",
desc:"Your files are encrypted and protected."
},

{
icon:<FaDownload/>,
title:"Quick Download",
desc:"Download documents anytime in one click."
},

{
icon:<FaEye/>,
title:"Live Preview",
desc:"Preview PDF and Images before downloading."
},

{
icon:<FaMobileAlt/>,
title:"Responsive",
desc:"Works perfectly on Mobile Tablet and Desktop."
},

{
icon:<FaShieldAlt/>,
title:"Privacy First",
desc:"Only you can access your personal documents."
}

];

return(

<section
id="features"
className="features"
>

<h2>

Powerful Features

</h2>

<p className="feature-sub">

Everything you need to manage your important documents.

</p>

<div className="feature-grid">

{

features.map((item,index)=>(

<div
key={index}
className="feature-card"
>

<div className="feature-icon">

{item.icon}

</div>

<h3>

{item.title}

</h3>

<p>

{item.desc}

</p>

</div>

))

}

</div>

</section>

);

}

export default Features;