import z from "zod";

const loadAiSdk = async () => {
  const aiSdk = await import("ai");
  const googleProvider = await import("@ai-sdk/google");

  return {
    generateText: aiSdk.generateText,
    google: googleProvider.google,
  };
};

const sentimentAnalysisSchema = z.object({
  sentiment: z.enum(["positive", "negative", "neutral"]),
  themes: z.array(z.string()),
});

const analyzeSentiment = async (reviewText: string) => {
  const { generateText, google } = await loadAiSdk();

  const { text } = await generateText({
    model: google("gemini-3.5-flash-lite"),
    prompt:`
    Analyze the following review and respond ONLY with valid JSON.
    No explanation, no markdown, just raw JSON. The JSON object must have all keys
    and all string values enclosed in double quotes.

    Review: "${reviewText}"

    Response format:
    {
      "sentiment": "positive" | "neutral" | "negative",
      "themes": ["array", "of", "key", "topics", "mentioned"]
    }`,
  });
  return JSON.parse(text);
};

export { analyzeSentiment };
