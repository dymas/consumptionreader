import fs from "fs";
import path from "path";
import { dirname } from "path";
import { promisify } from "util";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fileURLToPath } from 'url';
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function extractMeasurement(
  measure_type: string,
  image: string
): Promise<number> {
  try {
    const tempFilePath = path.join(__dirname, "temp_image.jpg");
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");

    await writeFileAsync(tempFilePath, base64Data, "base64");
    
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

    const uploadResponse = await fileManager.uploadFile(tempFilePath, {
      mimeType: "image/jpeg",
      displayName: "Measurement Image",
    });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri
        },
      },
      { text: `Describe the measurement on the ${measure_type} meter.` },
    ]);

    const responseText = result.response.text();
    const measurementValue = parseFloat(responseText);

    if (isNaN(measurementValue)) {
      throw new Error("Failed to extract a valid measurement value.");
    }

    return measurementValue;
  } catch (error) {
    console.error("Error extracting measurement:", error);
    throw new Error("Failed to extract measurement from image.");
  }
}
