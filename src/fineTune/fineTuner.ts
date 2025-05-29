import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import { FineTunableModel, SupportedModelProvider } from "../configs/enum.js";
import { aiConfig } from "../configs/aiConfig.js";
import { baseModelTokenLimits } from "../helpers/helper.js";

export const MODELS_PATH = path.join(process.cwd(), "fine-tuned/models.json");

export interface FineTuneOptions {
  agentName: string;
  modelKey: string; // unique key for saved model
  baseModel: FineTunableModel;
  source: string; // .jsonl file or URL
  validation?: string;
  suffix?: string;
}

export class OpenAiFineTuner {
  static async modelTraining(options: FineTuneOptions) {
    const { agentName, modelKey, baseModel, source, validation, suffix } =
      options;

    if (!agentName || !baseModel || !source) {
      throw new Error(
        "Missing required fields: agentName, baseModel, and source are mandatory."
      );
    }

    console.log(
      `\n🚀 Starting model training for agent '${agentName}' with model '${baseModel}'...`
    );

    console.log(
      "\n🎯 Training completed and registered successfully. Now waiting for model to be ready..."
    );

    return await trainAndRegisterFineTunedModel({
      agentName,
      modelKey,
      baseModel,
      source,
      validation,
      suffix,
    });
  }
}

export async function trainAndRegisterFineTunedModel(options: FineTuneOptions) {
  const { agentName, baseModel, modelKey, source, validation, suffix } =
    options;

  const config = aiConfig[baseModel];
  if (!config || config.model.provider !== SupportedModelProvider.OPENAI) {
    throw new Error(
      `Only OpenAI fine-tuning is supported. '${baseModel}' is not valid.`
    );
  }

  const openai = new OpenAI({ apiKey: config.apiKey });

  // Upload training file(s)
  const trainingFile = await uploadFile(source, openai);
  const validationFile = validation
    ? await uploadFile(validation, openai)
    : undefined;

  const job = await openai.fineTuning.jobs.create({
    training_file: trainingFile.id,
    model: baseModel,
    validation_file: validationFile?.id,
    suffix: suffix || agentName.toLowerCase().replace(/\s+/g, "-"),
  });

  console.log("🎓 Fine-tuning started:", job.id);

  const finalJob = await waitForModelReady(openai, job.id);
  const fineTunedModel = finalJob.fine_tuned_model;
  const baseTokenLimit =
    baseModelTokenLimits[baseModel] ??
    baseModelTokenLimits[config.model.name] ??
    16000;

  const newEntry = {
    [modelKey]: {
      apiKey: config.apiKey,
      model: {
        name: fineTunedModel,
        provider: "openai",
        supportsTools: false,
        maxContextTokens: baseTokenLimit,
      },
    },
  };

  const fullPath = path.resolve(MODELS_PATH);
  const existing = fs.existsSync(fullPath)
    ? JSON.parse(fs.readFileSync(fullPath, "utf-8"))
    : {};

  if (existing[modelKey]) {
    throw new Error(
      `Model key '${modelKey}' already exists in finetunedModels.json. Please choose a different key.`
    );
  }

  const updated = { ...existing, ...newEntry };
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(updated, null, 2), "utf-8");

  console.log(
    `✅ Fine-tuned model saved to models.json under key '${modelKey}'`
  );
}

async function waitForModelReady(
  openai: OpenAI,
  jobId: string,
  intervalMs = 5000
): Promise<OpenAI.FineTuning.Jobs.FineTuningJob> {
  console.log(`⏳ Waiting for fine-tuning job '${jobId}' to complete...`);

  while (true) {
    const job = await openai.fineTuning.jobs.retrieve(jobId);

    if (job.status === "succeeded") {
      console.log(`✅ Fine-tuning complete. Model: ${job.fine_tuned_model}`);
      return job;
    }

    if (job.status === "failed") {
      console.error(`❌ Fine-tuning failed.`);
      throw new Error("Fine-tuning job failed.");
    }

    console.log(
      `🟡 Status: ${job.status} (checking again in ${intervalMs / 1000}s)`
    );
    await new Promise((res) => setTimeout(res, intervalMs));
  }
}

async function uploadFile(input: string, openai: OpenAI) {
  if (input.startsWith("http")) {
    const res = await fetch(input);
    const data = await res.text();
    const tmpPath = path.join(".tmp", `remote-${Date.now()}.jsonl`);
    fs.mkdirSync(".tmp", { recursive: true });
    fs.writeFileSync(tmpPath, data, "utf-8");
    return await openai.files.create({
      file: fs.createReadStream(tmpPath),
      purpose: "fine-tune",
    });
  } else {
    return await openai.files.create({
      file: fs.createReadStream(input),
      purpose: "fine-tune",
    });
  }
}
