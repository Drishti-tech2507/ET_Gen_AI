import { useEffect, useState } from "react";

function App() {
  const [page, setPage] = useState("login");
  const [news, setNews] = useState([]);
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  const [selected, setSelected] = useState(null);
  const [translated, setTranslated] = useState("");
  const [category, setCategory] = useState("business");

  // chatbot
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // FETCH NEWS
  useEffect(() => {
    fetch(`http://localhost:5000/search?q=${category}`)
      .then(res => res.json())
      .then(data => setNews(data));
  }, [category]);

  const enterApp = () => setPage("home");

  // SEARCH
  const searchNews = async () => {
    if (!query.trim()) return alert("Enter something");
    const res = await fetch(`http://localhost:5000/search?q=${query}`);
    const data = await res.json();
    setNews(data);
  };

  // TRANSLATE (EN → HINDI FIXED)
  const translate = async (text) => {
    const res = await fetch("http://localhost:5000/translate", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setTranslated(data.translation);
  };

  // CHAT
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);

    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    setMessages(prev => [...prev, { sender: "bot", text: data.reply }]);
    setInput("");
  };

  // ONBOARDING
  if (page === "login") {
    return (
      <div style={{
        height:"100vh",
        display:"flex",
        flexDirection:"column",
        justifyContent:"center",
        alignItems:"center",
        background:"linear-gradient(135deg,#7441c6,#9f7aea)",
        color:"white",
        textAlign:"center"
      }}>
        <h1 style={{fontSize:"40px"}}>🚀 My ET AI</h1>
        <p>Smart News • AI Assistant • Translation</p>

        <button
          style={{
            padding:"12px 30px",
            marginTop:"20px",
            borderRadius:"10px",
            border:"none",
            background:"white",
            color:"#7441c6",
            fontWeight:"bold",
            cursor:"pointer"
          }}
          onClick={enterApp}
        >
          Get Started →
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: dark ? "#121212" : "#f4f6ff",
      color: dark ? "#fff" : "#000",
      minHeight:"100vh"
    }}>

      {/* NAVBAR */}
      <div style={{
        display:"flex",
        justifyContent:"space-between",
        padding:"15px 25px",
        background: dark ? "#1e1e1e" : "#fff",
        alignItems:"center"
      }}>
        <h2 style={{color:"#7441c6"}}>My ET</h2>

        <div>
          {["business","tech","ai","finance"].map(c => (
            <button key={c}
              onClick={()=>setCategory(c)}
              style={{
                margin:"0 5px",
                padding:"6px 12px",
                background: category===c ? "#7441c6":"#ddd",
                color: category===c ? "white":"black",
                border:"none",
                borderRadius:"6px"
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div>
          <button onClick={()=>setDark(!dark)}>🌙</button>
          <button onClick={()=>setPage("login")}>⬅ Home</button>
        </div>
      </div>

      {/* SEARCH */}
      <div style={{textAlign:"center", margin:"20px"}}>
        <input
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          placeholder="Search news..."
          style={{padding:"10px", width:"250px"}}
        />
        <button onClick={searchNews}>🔍</button>
      </div>

      {/* TRANSLATION */}
      {translated && (
        <div style={{textAlign:"center"}}>
          <h3>Translation:</h3>
          <p>{translated}</p>
        </div>
      )}

      {/* NEWS */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",
        gap:"20px",
        padding:"20px"
      }}>
        {news.map((item,i)=>(
          <div key={i}
            style={{
              background: dark ? "#1e1e1e" : "#fff",
              padding:"15px",
              borderRadius:"10px",
              cursor:"pointer"
            }}
            onClick={()=>setSelected(item)}
          >
            <img src={item.image} style={{width:"100%", borderRadius:"8px"}} />
            <h3>{item.title}</h3>
            <p>{item.description}</p>

            <button onClick={(e)=>{
              e.stopPropagation();
              translate(item.title);
            }}>
              🌐 Translate
            </button>
          </div>
        ))}
      </div>

      {/* ARTICLE MODAL */}
      {selected && (
        <div style={{
          position:"fixed",
          top:0,left:0,
          width:"100%",height:"100%",
          background:"#000000cc",
          display:"flex",
          justifyContent:"center",
          alignItems:"center"
        }}>
          <div style={{
            background:"#fff",
            padding:"20px",
            width:"60%",
            borderRadius:"10px",
            maxHeight:"80vh",
            overflowY:"auto"
          }}>
            <button onClick={()=>setSelected(null)}>⬅ Back</button>
            <h2>{selected.title}</h2>

            <img src={selected.image} style={{width:"100%"}} />

            <p>{selected.content || selected.description}</p>

            <a href={selected.url} target="_blank" rel="noreferrer">
              🔗 Open Full Article
            </a>
          </div>
        </div>
      )}

      {/* CHAT BUTTON */}
      <div onClick={()=>setChatOpen(!chatOpen)}
        style={{
          position:"fixed",
          bottom:"20px",
          right:"20px",
          background:"#7441c6",
          color:"white",
          padding:"15px",
          borderRadius:"50%"
        }}
      >
        🤖
      </div>

      {/* CHAT */}
      {chatOpen && (
        <div style={{
          position:"fixed",
          bottom:"80px",
          right:"20px",
          width:"320px",
          height:"420px",
          background:"white",
          display:"flex",
          flexDirection:"column",
          borderRadius:"10px"
        }}>
          <div style={{background:"#7441c6",color:"white",padding:"10px"}}>
            AI Assistant
          </div>

          <div style={{flex:1,padding:"10px",overflowY:"auto"}}>
            {messages.map((m,i)=>(
              <div key={i}
                style={{textAlign:m.sender==="user"?"right":"left"}}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div style={{display:"flex"}}>
            <input
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              placeholder="Ask..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;