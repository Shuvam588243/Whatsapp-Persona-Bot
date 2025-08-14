const fs = require("fs");
const path = require("path");

exports.Extractor = async () => {
    const chatFilePath = path.join(__dirname, "chats.txt");
    const chatsJsonPath = path.join(__dirname, "chats.json");

    if (!fs.existsSync(chatFilePath)) {
        console.error("❌ chats.txt not found in root!");
        process.exit(1);
    }

    console.log("📥 Reading chats.txt...");
    const chatText = fs.readFileSync(chatFilePath, "utf-8");

    const lines = chatText.split("\n").filter(Boolean);
    const chats = {};

    // WhatsApp export format: date, time - user: message
    const regex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s([\d:]{4,8}\s[APM]{2})\s-\s(.*?):\s(.*)$/;

    console.log("📝 Extracting messages per user...");
    for (const line of lines) {
        const match = line.match(regex);
        if (match) {
            let [, date, time, user, message] = match;

            // Skip media messages
            if (message === "<Media omitted>") continue;

            if (!chats[user]) chats[user] = [];
            chats[user].push(message.trim());
        }
    }

    fs.writeFileSync(chatsJsonPath, JSON.stringify(chats, null, 2));
    console.log(`✅ Chats extracted to chats.json for ${Object.keys(chats).length} users`);
};
