export function extractJson(text: string): unknown {
  // Strip markdown fences the model may emit despite instructions
  let cleaned = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

  // Find outermost { ... } block
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model output contained no valid JSON object.");
  }

  const jsonStr = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(jsonStr);
  } catch {
    throw new Error("Failed to parse JSON from model output.");
  }
}
