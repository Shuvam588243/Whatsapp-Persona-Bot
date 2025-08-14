exports.PERSONA_PROMPT = `
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
  "summary": "<summary of user's style, personality, and conversation arc>",
  "tone": "<formal / casual / humorous / sarcastic / friendly / etc>",
  "personality_traits": ["<trait1>", "<trait2>", "..."],
  "frequent_topics": ["<topic1>", "<topic2>", "..."],
  "sample_phrases": ["<phrase1>", "<phrase2>", "..."]
}
`