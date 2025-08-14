# WhatsApp Persona Bot

An AI-powered CLI chatbot that generates personalized AI personas from your WhatsApp chat history and allows you to chat in the style of your friends or colleagues.

---

## Features

- Extracts WhatsApp chat messages from exported `.txt` files.
- Generates detailed personas for each user based on their chat style.
- Supports casual, humorous, sarcastic, and other tones.
- CLI interface for selecting a persona and chatting with them.
- Ignores `<Media omitted>` messages in WhatsApp exports.

---

## Prerequisites

- Node.js v18+  
- NPM or Yarn  
- OpenAI API Key

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

---

Clone the repository:

```
git clone https://github.com/yourusername/whatsapp-persona-bot.git
cd whatsapp-persona-bot
```

Install dependencies:

```
npm install
```

Place your exported WhatsApp chat (chats.txt) in the project root.

Run the bot:

```
node bot.js
```

The bot will:

Extract chats from chats.txt → chats.json (if not already created)

Generate personas → persona.json (if not already created)

Display a list of available personas

Select a persona by number to start chatting.

Type your message and press Enter to chat.

---

Notes

Make sure chats.txt uses the standard WhatsApp export format:
MM/DD/YY, HH:MM AM/PM - User: Message

The bot is intended for text-based exported chats only, not groups with heavy media content.