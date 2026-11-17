import { AppError } from "./AppError";

export type AgentName = "itinerary_planner" | "destination_comparison";

export type AgentOperation = "generate_itinerary" | "compare_destinations";

export type AgentErrorContext = {
  agent: AgentName;
  operation: AgentOperation;
};

export type AgentErrorCode =
  | "AI_SERVICE_UNAVAILABLE"
  | "AI_SERVICE_MISCONFIGURED"
  | "AI_PROVIDER_RATE_LIMITED"
  | "AI_REQUEST_REJECTED"
  | "AI_INVALID_OUTPUT"
  | "AI_OUTPUT_MISSING"
  | "AGENT_STEP_LIMIT_REACHED"
  | "AGENT_EXECUTION_FAILED"
  | "AGENT_INVALID_REQUEST"
  | "DESTINATION_UNAVAILABLE";

export class AgentError extends AppError {
  public readonly code: AgentErrorCode;
  public readonly context: AgentErrorContext;
  public readonly retryable: boolean;

  constructor({
    code,
    message,
    statusCode,
    context,
    retryable,
    cause,
  }: {
    code: AgentErrorCode;
    message: string;
    statusCode: number;
    context: AgentErrorContext;
    retryable: boolean;
    cause?: unknown;
  }) {
    super(message, statusCode, cause);
    this.name = "AgentError";
    this.code = code;
    this.context = context;
    this.retryable = retryable;
  }
}
