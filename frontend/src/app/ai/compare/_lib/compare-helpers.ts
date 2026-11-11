import type { ApiError, ComparisonOutput } from "@/lib/api";

export const examples = [
  {
    label: "Peaceful history · Hampi vs Taj Mahal",
    query:
      "Should I visit Hampi or the Taj Mahal? I love ancient history and photography, but prefer peaceful places to explore on foot.",
  },
  {
    label: "July timing · Leh vs Goa",
    query:
      "I am planning a trip in July during monsoon. Should I go to Leh Ladakh or Goa Beaches?",
  },
  {
    label: "Split interests · Goa vs Rishikesh",
    query:
      "We are a group of friends deciding between Goa Beaches and Rishikesh. Half of us want river rafting and camping, while the other half want to chill by the water.",
  },
  {
    label: "Gentle mountain walks · Ladakh vs Munnar",
    query:
      "Compare Leh Ladakh and Munnar for a couple looking for scenic mountain views and cool weather with moderate walking.",
  },
  {
    label: "Three heritage cities · Jaipur, Varanasi & Jaisalmer",
    query:
      "Compare Jaipur, Varanasi, and Jaisalmer for a 4-day solo cultural trip focused on architectural beauty and vibrant street photography.",
  },
];

export type CompareState =
  | { kind: "comparison"; query: string; comparison: ComparisonOutput }
  | {
      kind: "unavailable" | "invalid_request";
      message: string;
      result?: ComparisonOutput;
    }
  | { kind: "error"; message: string }
  | null;

export type ComparisonErrorBody = {
  message?: string;
  data?: {
    result?: ComparisonOutput;
    comparison?: ComparisonOutput;
  };
};

export function stateFromOutput(query: string, output: ComparisonOutput): CompareState {
  if (output.status === "unavailable" || output.status === "invalid_request") {
    return {
      kind: output.status,
      message:
        output.message ||
        (output.status === "unavailable"
          ? "One or more requested destinations could not be verified."
          : "Compare between two and three destinations at a time."),
      result: output,
    };
  }

  return {
    kind: "comparison",
    query,
    comparison: output,
  };
}

export function getComparisonFailure(error: ApiError): CompareState {
  const payload = error.payload as ComparisonErrorBody | null;
  const result = payload?.data?.comparison || payload?.data?.result;

  if (result?.status === "unavailable" || result?.status === "invalid_request") {
    return {
      kind: result.status,
      message: result.message || payload?.message || error.message,
      result,
    };
  }

  return {
    kind: "error",
    message: payload?.message || error.message,
  };
}

export function sentimentVariant(
  sentiment: string,
): "success" | "warning" | "danger" | "outline" {
  switch (sentiment) {
    case "overwhelmingly positive":
    case "mostly positive":
      return "success";
    case "mixed":
      return "warning";
    case "mostly negative":
      return "danger";
    default:
      return "outline";
  }
}

export function readableCategory(category: string): string {
  return category.replace(/-/g, " ");
}

