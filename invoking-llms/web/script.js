// Wait until the full HTML page is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get important elements from HTML
  const messages = document.getElementById("messages");   // Chat area
  const input = document.getElementById("user-input");    // Text input box
  const button = document.getElementById("send-btn");     // Send button

  // Function to create and show a message
  function addMessage(text, type) {

    // Create a new div (message bubble)
    const div = document.createElement("div");

    // If message is from user → show on right (blue)
    if (type === "user") {
      div.className =
        "bg-blue-600 text-white p-2 rounded-lg self-end max-w-[70%]";
    } 
    // Otherwise → show on left (bot message)
    else {
      div.className =
        "bg-white/30 text-white p-2 rounded-lg self-start max-w-[70%]";
    }

    // Add text inside the message bubble
    div.textContent = text;

    // Add message to chat area
    messages.appendChild(div);

    // Auto scroll to latest message
    messages.scrollTop = messages.scrollHeight;

    // Return the created message (useful for editing later)
    return div;
  }
  // Function that runs when user sends message
  function sendMessage() {

    // Get text from input and remove extra spaces
    const text = input.value.trim();

    // If input is empty → stop function
    if (!text) return;

    // Show user's message in chat
    addMessage(text, "user");

    // Clear input box after sending
    input.value = "";

    // Add temporary bot message
    const botMsg = addMessage("Thinking...", "bot");

    // After 1 second → change bot message
    setTimeout(() => {
      botMsg.textContent = "This is a demo response.";
    }, 1000);
  }
  // When Send button is clicked → run sendMessage()
  button.addEventListener("click", sendMessage);

  // When Enter key is pressed → send message
  input.addEventListener("keydown", (e) => {

    // If key is Enter and Shift is NOT pressed
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();  // Stop new line
      sendMessage();       // Send message
    }
  });

});