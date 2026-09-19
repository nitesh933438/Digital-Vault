import { useState } from "react";
import "./FAQ.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

function FAQ() {

  const faqs = [

    {
      question: "Is my data secure?",
      answer:
        "Yes. All your documents are stored securely and only you can access them."
    },

    {
      question: "Can I upload multiple files?",
      answer:
        "Yes. You can upload multiple documents at the same time."
    },

    {
      question: "Can I access documents from mobile?",
      answer:
        "Absolutely. Digital Vault works on Mobile, Tablet and Desktop."
    },

    {
      question: "Which file types are supported?",
      answer:
        "PDF, DOC, DOCX, JPG, PNG and many other common formats."
    }

  ];

  const [active,setActive]=useState(null);

  const toggle=(index)=>{

    if(active===index){

      setActive(null);

    }else{

      setActive(index);

    }

  };

  return(

<section className="faq-section">

<h2>

Frequently Asked Questions

</h2>

<p>

Everything you need to know about Digital Vault.

</p>

<div className="faq-list">

{

faqs.map((item,index)=>(

<div
className="faq-item"
key={index}
>

<div
className="faq-question"
onClick={()=>toggle(index)}
>

<h3>

{item.question}

</h3>

{

active===index

?

<FaChevronUp/>

:

<FaChevronDown/>

}

</div>

{

active===index &&

<div className="faq-answer">

{item.answer}

</div>

}

</div>

))

}

</div>

</section>

);

}

export default FAQ;