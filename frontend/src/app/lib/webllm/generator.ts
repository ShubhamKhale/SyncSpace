import { getPipeline } from "./client";
import { extractJson } from "./parser";
import { SYSTEM_PROMPT } from "./prompt";
import type { LogicalGraph } from "../diagram-validator";

export type { LogicalGraph };

export async function generateDiagram(
  prompt: string,
  onProgress: (progress: number, text: string) => void
): Promise<LogicalGraph> {
  const pipe = await getPipeline(onProgress);

  onProgress(100, "Generating…");

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const output = await (pipe as any)(messages, {
    max_new_tokens: 800,
    do_sample: false,       // greedy — more deterministic JSON
    temperature: 1.0,       // ignored when do_sample=false but required by some models
    return_full_text: false,
  });

  // When input is messages[], output[0].generated_text is messages[] too
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = output?.[0]?.generated_text as any;
  let text = "";

  if (typeof raw === "string") {
    text = raw;
  } else if (Array.isArray(raw)) {
    // Last message = assistant reply
    text = raw[raw.length - 1]?.content ?? "";
  }

  if (!text) throw new Error("Model returned empty response.");

  return extractJson(text) as LogicalGraph;
}
