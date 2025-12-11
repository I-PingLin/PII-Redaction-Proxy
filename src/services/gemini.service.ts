
import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      // In a real app, you might have a more robust way to handle this,
      // but for this environment, we rely on the pre-configured process.env.
      console.error("API_KEY environment variable not set.");
      throw new Error("API_KEY environment variable not set.");
    }
    this.genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const response: GenerateContentResponse = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error generating content:', error);
      // Propagate a more user-friendly error message
      throw new Error('Failed to generate content from the Gemini API. The API key might be invalid or the service may be unavailable.');
    }
  }
}
