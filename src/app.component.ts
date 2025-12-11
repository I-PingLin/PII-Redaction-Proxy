
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from './services/gemini.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class AppComponent {
  private readonly geminiService = inject(GeminiService);

  // Default text to demonstrate the functionality
  userInput = signal<string>('My Taiwan ID is A123456789. Please check its validity. Also, my German tax ID is 12345678901. Please summarize this information.');
  maskedPrompt = signal<string>('');
  llmResponse = signal<string>('');
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  onInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.userInput.set(target.value);
  }

  private maskPII(text: string): string {
    // Taiwan ID: One uppercase letter followed by 9 digits
    const twIdRegex = /[A-Z]\d{9}/g;
    // German Tax ID (Steuer-ID): 11 digits, first one not 0.
    // This is a simplified regex and might have false positives.
    const deTaxIdRegex = /\b[1-9]\d{10}\b/g;

    let maskedText = text.replace(twIdRegex, '[REDACTED_TW_ID]');
    maskedText = maskedText.replace(deTaxIdRegex, '[REDACTED_DE_TAX_ID]');
    return maskedText;
  }

  async handleSubmit(): Promise<void> {
    const currentInput = this.userInput().trim();
    if (!currentInput) {
      this.error.set("Please enter some text to process.");
      return;
    };

    this.isLoading.set(true);
    this.error.set(null);
    this.llmResponse.set('');
    this.maskedPrompt.set('');
    
    try {
      const masked = this.maskPII(currentInput);
      this.maskedPrompt.set(masked);

      const promptForLLM = `Briefly summarize the following user request, maintaining the original intent: "${masked}"`;

      const response = await this.geminiService.generateContent(promptForLLM);
      this.llmResponse.set(response);
    } catch (e: any) {
      this.error.set(e.message || 'An unknown error occurred.');
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }
}
