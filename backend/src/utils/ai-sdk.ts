const importAiSdk = async () => {
  const [aiSdk, googleSdk] = await Promise.all([
    import("ai"),
    import("@ai-sdk/google"),
  ]);

  return {
    ToolLoopAgent: aiSdk.ToolLoopAgent,
    Output: aiSdk.Output,
    isStepCount: aiSdk.isStepCount,
    generateText: aiSdk.generateText,
    google: googleSdk.google,
  };
};

let aiSdkPromise: ReturnType<typeof importAiSdk> | undefined;

/** Loads the ESM-only AI SDK packages for this CommonJS application once. */
export const loadAiSdk = () => {
  if (!aiSdkPromise) {
    aiSdkPromise = importAiSdk();
  }

  return aiSdkPromise;
};
