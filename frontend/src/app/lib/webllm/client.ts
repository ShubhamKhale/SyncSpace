import { MODEL, DTYPE } from "./model";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pipelineInstance: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let initPromise: Promise<any> | null = null;

export async function getPipeline(
  onProgress: (progress: number, text: string) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  if (pipelineInstance) {
    onProgress(100, "Model ready");
    return pipelineInstance;
  }

  if (!initPromise) {
    initPromise = (async () => {
      const { pipeline, env } = await import("@huggingface/transformers");

      // Use browser cache (IndexedDB) — no repeated downloads
      env.useBrowserCache = true;
      env.allowLocalModels = false;

      const pipe = await pipeline("text-generation", MODEL, {
        dtype: DTYPE,
        progress_callback: (info: {
          status: string;
          progress?: number;
          file?: string;
          name?: string;
        }) => {
          if (info.status === "progress" && typeof info.progress === "number") {
            const pct = Math.round(info.progress);
            onProgress(pct, `Downloading ${info.file ?? "model"}… ${pct}%`);
          } else if (info.status === "done") {
            onProgress(99, `Loaded ${info.file ?? ""}`);
          } else if (info.status === "ready") {
            onProgress(100, "Model ready");
          }
        },
      });

      pipelineInstance = pipe;
      return pipe;
    })();
  }

  return initPromise;
}

export function resetPipeline() {
  pipelineInstance = null;
  initPromise = null;
}
