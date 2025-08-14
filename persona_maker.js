require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");

const client = new OpenAI();

const chatsPath = path.join(__dirname, "chats.json");
const chats = JSON.parse(fs.readFileSync(chatsPath, "utf-8"));

const personaOutputPath = path.join(__dirname, "persona.json");

async function generatePersonaForUser(user, messages) {
    const prompt = `
You are an AI assistant. 
Create a detailed and realistic persona for this user based on their chat messages.

Include:
- Conversation style and arc
- Emotional tone
- Humor or sarcasm
- Politeness and verbosity
- Frequent topics
- Typical expressions or catchphrases

Return ONLY valid JSON with this structure:
{
  "user": "<snake_case_user_name>",
  "summary": "<summary of user's style, personality, and conversation arc>",
  "tone": "<formal / casual / humorous / sarcastic / friendly / etc>",
  "personality_traits": ["<trait1>", "<trait2>", "..."],
  "frequent_topics": ["<topic1>", "<topic2>", "..."],
  "sample_phrases": ["<phrase1>", "<phrase2>", "..."]
}

User messages:
${messages.map(m => `- ${m}`).join("\n")}
`;

    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You generate detailed user persona based on chat conversation arcs." },
                { role: "user", content: prompt }
            ]
        });

        let content = response.choices[0].message.content;

        content = content.replace(/```json|```/g, "").trim();

        let persona;
        try {
            persona = JSON.parse(content);
        } catch (err) {
            console.error(`Failed to parse persona for ${user}:`, content);
            persona = { 
                user, 
                summary: content, 
                tone: "unknown", 
                personality_traits: [], 
                frequent_topics: [], 
                sample_phrases: [] 
            };
        }

        persona.user = user;

        return persona;
    } catch (err) {
        console.error(`Error generating persona for ${user}:`, err.message);
        return { 
            user, 
            summary: "Error generating persona", 
            tone: "unknown", 
            personality_traits: [], 
            frequent_topics: [], 
            sample_phrases: [] 
        };
    }
}

exports.GeneratePersona = async() => {
    const personas = [];

    for (const user in chats) {
        console.log(`Generating persona for ${user}...`);
        const messages = chats[user];
        const persona = await generatePersonaForUser(user, messages);
        personas.push(persona);
    }

    fs.writeFileSync(personaOutputPath, JSON.stringify(personas, null, 2));
    console.log("Enhanced personas stored in persona.json");
}
