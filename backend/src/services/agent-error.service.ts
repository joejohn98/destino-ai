import type { loadAiSdk } from "../utils/ai-sdk";
import { AgentError, type AgentErrorContext } from "../utils/AgentError";

type AiSdk = Awaited<ReturnType<typeof loadAiSdk>>;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getErrorCode = (error: unknown): string | undefined =>
  isObject(error) && typeof error.code === "string" ? error.code : undefined;

const makeAgentError = (
  context: AgentErrorContext,
  details: Omit<ConstructorParameters<typeof AgentError>[0], "context">,
) => new AgentError({ ...details, context });

const classifyProviderError = (
  error: unknown,
  context: AgentErrorContext,
): AgentError | undefined => {
  if (!isObject(error) || typeof error.statusCode !== "number") {
    return undefined;
  }

  const { statusCode } = error;

  if (statusCode === 401 || statusCode === 403 || statusCode === 404) {
    return makeAgentError(context, {
      code: "AI_SERVICE_MISCONFIGURED",
      message:
        "The AI service is temporarily unavailable. Please try again later.",
      statusCode: 503,
      retryable: false,
      cause: error,
    });
  }

  if (statusCode === 429) {
    return makeAgentError(context, {
      code: "AI_PROVIDER_RATE_LIMITED",
      message: "The AI service is busy. Please try again shortly.",
      statusCode: 503,
      retryable: true,
      cause: error,
    });
  }

  if (statusCode === 408 || statusCode >= 500 || error.isRetryable === true) {
    return makeAgentError(context, {
      code: "AI_SERVICE_UNAVAILABLE",
      message:
        "The AI service is temporarily unavailable. Please try again shortly.",
      statusCode: 503,
      retryable: true,
      cause: error,
    });
  }

  return makeAgentError(context, {
    code: "AI_REQUEST_REJECTED",
    message:
      "The AI service could not process this request. Try making it more specific.",
    statusCode: 422,
    retryable: false,
    cause: error,
  });
};

export const classifyAgentError = (
  error: unknown,
  context: AgentErrorContext,
  sdk?: AiSdk,
): AgentError => {
  if (error instanceof AgentError) return error;

  if (sdk && sdk.RetryError.isInstance(error)) {
    for (const nestedError of error.errors) {
      const classified = classifyAgentError(nestedError, context, sdk);
      if (classified.code !== "AGENT_EXECUTION_FAILED") return classified;
    }
  }

  if (sdk?.APICallError.isInstance(error)) {
    return (
      classifyProviderError(error, context) ??
      makeAgentError(context, {
        code: "AI_SERVICE_UNAVAILABLE",
        message:
          "The AI service is temporarily unavailable. Please try again shortly.",
        statusCode: 503,
        retryable: true,
        cause: error,
      })
    );
  }

  if (sdk?.LoadAPIKeyError.isInstance(error)) {
    return makeAgentError(context, {
      code: "AI_SERVICE_MISCONFIGURED",
      message:
        "The AI service is temporarily unavailable. Please try again later.",
      statusCode: 503,
      retryable: false,
      cause: error,
    });
  }

  if (
    sdk?.NoOutputGeneratedError.isInstance(error) ||
    sdk?.InvalidResponseDataError.isInstance(error) ||
    sdk?.TypeValidationError.isInstance(error) ||
    sdk?.JSONParseError.isInstance(error)
  ) {
    return makeAgentError(context, {
      code: "AI_INVALID_OUTPUT",
      message: "The AI returned a response we could not use. Please try again.",
      statusCode: 502,
      retryable: true,
      cause: error,
    });
  }

  const errorCode = getErrorCode(error);
  if (
    errorCode === "ECONNRESET" ||
    errorCode === "ECONNREFUSED" ||
    errorCode === "ETIMEDOUT" ||
    errorCode === "EAI_AGAIN" ||
    errorCode === "UND_ERR_CONNECT_TIMEOUT"
  ) {
    return makeAgentError(context, {
      code: "AI_SERVICE_UNAVAILABLE",
      message:
        "The AI service is temporarily unavailable. Please try again shortly.",
      statusCode: 503,
      retryable: true,
      cause: error,
    });
  }

  if (!sdk) {
    return makeAgentError(context, {
      code: "AI_SERVICE_UNAVAILABLE",
      message:
        "The AI service is temporarily unavailable. Please try again later.",
      statusCode: 503,
      retryable: false,
      cause: error,
    });
  }

  return makeAgentError(context, {
    code: "AGENT_EXECUTION_FAILED",
    message: "We could not complete this AI request. Please try again.",
    statusCode: 500,
    retryable: false,
    cause: error,
  });
};
