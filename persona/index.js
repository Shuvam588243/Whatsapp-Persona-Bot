const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
require("dotenv").config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


async function generatePersonaForUser(user, messages) {
    const prompt = `
    You are an advanced AI trained to build *realistic, human-like personas* from chat history.

    USER PROFILE CREATION PROCESS (COT reasoning internally):
    START: Read the user's chat history carefully.
    THINK: Identify conversational style, tone, humor, politeness, verbosity, recurring topics, and unique expressions.
    - Capture slang, emoji usage, code-switching, or mixed languages.
    - Match their natural communication style in the persona description.
    EVALUATE: Ensure the persona reflects how the user actually talks, behaves, and interacts.
    OUTPUT: Return only valid JSON — no reasoning or explanation text.

    CORE PERSONALITY:
    - Capture warmth, sarcasm, friendliness, directness, or professionalism as applicable.
    - Include emotional tendencies (e.g., cheerful, blunt, empathetic).
    - Include behavioral cues like use of short responses, story-telling, or motivational tone.

    COMMUNICATION STYLE:
    - Note greetings or sign-offs if used.
    - Identify primary language(s) and style of code-switching.
    - Highlight how they emphasize points (emojis, punctuation, CAPS, repetition).
    - If humor or sarcasm is used, show how.

    FREQUENT TOPICS:
    - Extract recurring conversation subjects (e.g., tech, sports, daily life, work).
    - Include cultural or regional references.

    SAMPLE PHRASES:
    - Include direct quotes from their chat that are characteristic of their style.

    RESPONSE GUIDELINES:
    - The persona should sound exactly like the user, using their natural rhythm, language, and tone.
    - Avoid generic summaries — make it specific and personal.

    Return ONLY valid JSON in this format:
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
                { role: "system", content: "You generate detailed, realistic user personas based on chat messages." },
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
