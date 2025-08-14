const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { OpenAI } = require("openai");
const { GeneratePersona } = require("./persona");
const { Extractor } = require("./extractor");
require("dotenv").config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const personaFile = path.join(__dirname, "./persona.json");
const chatsTxtPath = path.join(__dirname, "./chats.txt");
const chatsJsonPath = path.join(__dirname, "./chats.json");

async function init() {
    if (!fs.existsSync(chatsTxtPath)) {
        console.error("❌ chats.txt not found!");
        process.exit(1);
    }

    if (!fs.existsSync(chatsJsonPath)) {
        console.log("chats.json not found. Running Extractor...");
        await Extractor();
    }

    if (!fs.existsSync(personaFile)) {
        console.log("persona.json not found. Generating personas...");
        await GeneratePersona();
    }

    const personas = JSON.parse(fs.readFileSync(personaFile, "utf-8"));
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: "> " });

    personas.forEach((p, idx) => console.log(`${idx + 1}. ${p.user} (${p.tone})`));

    async function selectPersona() {
        return new Promise(resolve => {
            rl.question("Select a persona by number: ", async idx => {
                const index = parseInt(idx) - 1;
                if (index < 0 || index >= personas.length) resolve(await selectPersona());
                else resolve(personas[index]);
            });
        });
    }

    async function chatWithPersona(persona) {
        console.log(`\n💬 Chatting with ${persona.user} (${persona.tone})`);
        console.log("Type 'exit' to quit.\n");

       const messages = [{
        role: "system",
        content: `You are now ${persona.user}.
        Speak, think, and respond exactly as this persona would in all situations.
        Summary: ${persona.summary}
        Tone: ${persona.tone}
        Personality: ${(persona.personality_traits || []).join(", ")}
        Frequent Topics: ${(persona.frequent_topics || []).join(", ")}
        Signature Phrases: ${(persona.sample_phrases || []).join(", ")}

        When replying:
        - Maintain the tone and style of ${persona.user}
        - Naturally use signature phrases where appropriate
        - Focus on topics they frequently discuss
        - Ensure responses feel authentic to their personality
        Do not break character under any circumstances.`
        }];


        rl.prompt();
        for await (const line of rl) {
            const input = line.trim();
            if (input.toLowerCase() === "exit") process.exit(0);

            messages.push({ role: "user", content: input });

            try {
                const response = await client.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages
                });

                const output = response.choices[0].message.content;
                console.log(`🤖 ${persona.user}: ${output}`);
                messages.push({ role: "assistant", content: output });
            } catch (err) {
                console.error("❌ Error:", err.message);
            }
            rl.prompt();
        }
    }

    const selectedPersona = await selectPersona();
    await chatWithPersona(selectedPersona);
}

init();
