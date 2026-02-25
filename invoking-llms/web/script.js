document.addEventListener("DOMContentLoaded", () => {

  const messages = document.getElementById("messages");
  const input = document.getElementById("user-input");
  const button = document.getElementById("send-btn");

  // 🔹 Call backend
  async function callServer(userText) {
    const response = await fetch("http://localhost:4000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userText })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Server response:", data);

    // 🔥 Flexible response handling
    return (
      data.message ||
      data.reply ||
      data.response ||
      data.choices?.[0]?.message?.content ||
      "No response from AI"
    );
  }

  // 🔹 Create message bubble
  function addMessage(text, type) {
    const div = document.createElement("div");

    div.className =
      type === "user"
        ? "bg-blue-600 text-white p-2 rounded-lg self-end max-w-[70%]"
        : "bg-white/30 text-white p-2 rounded-lg self-start max-w-[70%]";

    // Preserve line breaks
    div.innerHTML = text.replace(/\n/g, "<br>");

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;

    return div;
  }

  // 🔹 Send message
  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    button.disabled = true;

    const botBubble = addMessage("Thinking...", "bot");

    try {
      const reply = await callServer(text);
      botBubble.innerHTML = reply.replace(/\n/g, "<br>");
    } catch (error) {
      console.error(error);
      botBubble.textContent = "⚠ Error connecting to server.";
    } finally {
      button.disabled = false;
      input.focus();
    }
  }

  button.addEventListener("click", sendMessage);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

});