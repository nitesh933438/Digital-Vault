import "./AIAssistant.css";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
FaRobot,
FaPaperPlane,
FaFileAlt,
FaSearch,
FaMagic,
FaLightbulb
} from "react-icons/fa";

function AIAssistant(){

const navigate = useNavigate();
const [question,setQuestion]=useState("");
const chatEndRef = useRef(null);

const [messages,setMessages]=useState([
{
type:"ai",
text:"👋 Hello! I'm your AI Assistant. How can I help you today?"
}
]);

useEffect(() => {
  chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
}, [messages]);

const sendMessage=()=>{

if(question.trim()==="") return;

const userMessage={
type:"user",
text:question
};

const aiMessage={
type:"ai",
text:"🤖 AI feature will be connected with Gemini/OpenAI soon."
};

setMessages(prev=>[
...prev,
userMessage,
aiMessage
]);

setQuestion("");

};

return(

<div className="ai-card">

<div className="ai-header">

<div className="ai-logo">

<FaRobot/>

</div>

<div>

<h2>AI Assistant</h2>

<p>Smart Document Helper</p>

</div>

</div>

<div className="ai-tools">
{[
  [FaFileAlt, "Summarize", "AI document summaries will be available after an AI provider is connected."],
  [FaSearch, "Find File", "Use the Documents page search to find files by name.", "/documents"],
  [FaMagic, "Organize", "Choose categories on the Documents page to organize your files.", "/documents"],
  [FaLightbulb, "Suggestions", "Tip: use Favorites for documents you access frequently."]
].map(([Icon, label, text, path]) => (
  <button type="button" key={label} onClick={() => {
    setMessages((prev) => [...prev, { type: "user", text: label }, { type: "ai", text }]);
    if (path) navigate(path);
  }}>
    <Icon />
    {label}
  </button>
))}
</div>

<div className="chat-box" aria-live="polite">

{

messages.map((msg,index)=>(

<div

key={index}

className={`chat-message ${msg.type}`}

>

{msg.text}

</div>

))

}

<div ref={chatEndRef} aria-hidden="true" />
</div>

<form className="chat-input" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>

<input

type="text"

placeholder="Ask AI anything..."

value={question}

onChange={(e)=>setQuestion(e.target.value)}

>

</input>

<button

type="submit"

aria-label="Send message"

>

<FaPaperPlane/>

</button>

</form>

</div>

);

}

export default AIAssistant;