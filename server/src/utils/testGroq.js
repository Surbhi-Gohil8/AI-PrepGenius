const { Groq } = require('groq-sdk');
require('dotenv').config();

const apiKey = process.env.GROQ_API_KEY;
console.log("Using API Key:", apiKey ? apiKey.slice(0, 10) + "..." : "undefined");

const groq = new Groq({ apiKey });

(async () => {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'user', content: 'Say hello!' }
      ]
    });
    console.log("Groq response success:", response.choices[0]?.message?.content);
  } catch (e) {
    console.error("Groq API Call failed:", e.message);
    if (e.response) {
      console.error("Status:", e.response.status);
      console.error("Data:", e.response.data);
    }
  }
})();
