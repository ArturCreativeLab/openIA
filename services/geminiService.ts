import { GoogleGenAI, Type } from "@google/genai";
import type { EditableBlock } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { 
        type: Type.STRING,
        description: 'A unique identifier for the block, like a UUID.'
      },
      type: { 
        type: Type.STRING,
        description: 'The type of content, which should be "text".'
      },
      content: { 
        type: Type.STRING,
        description: 'The full transcribed text content of the block.'
       },
      bbox: {
        type: Type.OBJECT,
        properties: {
          x: { type: Type.NUMBER, description: 'The x-coordinate of the top-left corner.' },
          y: { type: Type.NUMBER, description: 'The y-coordinate of the top-left corner.' },
          width: { type: Type.NUMBER, description: 'The width of the bounding box.' },
          height: { type: Type.NUMBER, description: 'The height of the bounding box.' },
        },
        required: ["x", "y", "width", "height"],
      },
    },
    required: ["id", "type", "content", "bbox"],
  },
};

export const analyzePageImage = async (base64Image: string): Promise<EditableBlock[]> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };

  const textPart = {
    text: `You are an expert document analysis system. Your task is to analyze the provided image of a document page. Identify every distinct paragraph of text. Do not group separate paragraphs. For each paragraph, provide a JSON object describing it. The response must be a valid JSON array of these objects, adhering to the provided schema. For the 'id' field, generate a unique random string for each block.`,
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });
    
    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);

    // Validate that the parsed data is an array
    if (!Array.isArray(parsedData)) {
      throw new Error("Gemini response is not a JSON array.");
    }

    // Further validation can be added here to check the structure of each object
    return parsedData as EditableBlock[];
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to analyze page with Gemini.");
  }
};