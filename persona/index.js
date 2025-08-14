const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
require("dotenv").config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


async function generatePersonaForUser(user, messages) {
   const prompt = `
    You are an AI assistant. 
    Your task is to create a *realistic, human-like persona* for the user based on their chat messages.

    Follow the COT (Chain of Thought) reasoning process internally:

    START: Read the user's chat history carefully.
    THINK: Identify the user's conversational style, tone, humor, politeness, verbosity, common topics, and unique expressions. 
    Pay attention to the language they use — slang, emoji, code-switching, or mixed languages — and mimic it naturally.
    EVALUATE: Check if your persona description truly reflects the user's style and personality. Adjust if something feels off.
    OUTPUT: Provide only valid JSON containing the final persona. Do NOT include the reasoning steps.

    Return ONLY valid JSON in the following format:
    {
      "user": "<snake_case_user_name>",
      "summary": "<summary of user's style, personality, conversation arc>",
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
                { role: "system", content: "You generate detailed user persona based on chat messages." },
                { role: "user", content: prompt }
            ]
        });

        let content = response.choices[0].message.content;
        content = content.replace(/```json|```/g, "").trim();

        let persona;
        try { persona = JSON.parse(content); }
        catch (err) {
            console.error(`❌ Failed to parse persona for ${user}. Using raw content.`);
            persona = { user, summary: content, tone: "unknown", personality_traits: [], frequent_topics: [], sample_phrases: [] };
        }

        persona.user = user;
        return persona;
    } catch (err) {
        console.error(`❌ Error generating persona for ${user}:`, err.message);
        return { user, summary: "Error generating persona", tone: "unknown", personality_traits: [], frequent_topics: [], sample_phrases: [] };
    }
}

exports.GeneratePersona = async () => {
    const chatsJsonPath = path.join(__dirname, "../chats.json");
    const personaJsonPath = path.join(__dirname, "../persona.json");

    if (!fs.existsSync(chatsJsonPath)) {
        console.error("❌ chats.json not found! Run Extractor first.");
        process.exit(1);
    }

    const chats = JSON.parse(fs.readFileSync(chatsJsonPath, "utf-8"));

    const personas = [];
    for (const user in chats) {
        console.log(`📝 Generating persona for ${user}...`);
        const persona = await generatePersonaForUser(user, chats[user]);
        personas.push(persona);
    }
    fs.writeFileSync(personaJsonPath, JSON.stringify(personas, null, 2));
    console.log("✅ persona.json created successfully.");
};
