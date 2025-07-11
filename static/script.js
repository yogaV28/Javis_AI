let synth = window.speechSynthesis;

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1.1;
  utterance.volume = 1;
  utterance.lang = "en-US";
  synth.speak(utterance);
}

function stopSpeaking() {
  synth.cancel();
}

function askGPT() {
  const prompt = document.getElementById("prompt").value.trim();
  if (!prompt) return;

  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes("your name") || lowerPrompt.includes("who are you")) {
    const reply = "My name is JARVIS, your personal AI assistant.";
    document.getElementById("response").innerText = reply;
    speak(reply);
    return;
  }

  document.getElementById("response").innerText = "💡 Thinking...";

  fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("response").innerText = data.response;
      speak(data.response);
    })
    .catch(err => {
      document.getElementById("response").innerText = "⚠️ Error contacting GPT.";
    });
}

function startListening() {
  if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
    alert("Speech recognition is not supported in your browser.");
    return;
  }

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    document.getElementById("prompt").value = speechResult;
    askGPT();
  };

  recognition.onerror = (event) => {
    document.getElementById("response").innerText = "🎤 Mic Error: " + event.error;
  };

  recognition.start();
}

// ✅ GREET on window load with fallback if voices not ready
window.onload = () => {
  const greeting = "Hello, I am JARVIS, your personal AI assistant. How can I help you today?";
  const responseBox = document.getElementById("response");
  responseBox.innerText = greeting;

  // Sometimes voices aren’t ready immediately, so wait until they are
  const waitForVoices = () => {
    if (speechSynthesis.getVoices().length === 0) {
      // Retry in 100ms
      setTimeout(waitForVoices, 100);
    } else {
      speak(greeting);
    }
  };

  waitForVoices(); // Start waiting
};
