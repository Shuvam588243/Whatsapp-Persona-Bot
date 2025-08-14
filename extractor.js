const fs = require("fs");
const path = require("path");
const readline = require("readline");

exports.Extractor = async () => {
    const chatFilePath = path.join(__dirname, "chats.txt");
    const chatsJsonPath = path.join(__dirname, "chats.json");

    if (!fs.existsSync(chatFilePath)) {
        console.error("❌ chats.txt not found in root!");
        process.exit(1);
    }

    function toSnakeCase(name) {
        return name.toLowerCase().replace(/\s+/g, "_");
    }

    const chats = {};

    const fileStream = fs.createReadStream(chatFilePath, { encoding: "utf-8" });

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const regex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s([\d:]{4,8}\s[APM]{2})\s-\s(.*?):\s(.*)$/;

    for await (const line of rl) {
        const match = line.match(regex);
        if (match) {
            let [, date, time, user, message] = match;
            if (message === "<Media omitted>") continue;

            const key = toSnakeCase(user);
            if (!chats[key]) chats[key] = [];
            chats[key].push(message.trim());
        }
    }

    fs.writeFileSync(chatsJsonPath, JSON.stringify(chats, null, 2));
    console.log("✅ Chats extracted to chats.json");
};
