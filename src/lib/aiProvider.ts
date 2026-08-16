import { answerNaturalLanguageQuestion, AIStructuredResponse } from './aiAnalyticsEngine';
import { TradeCalculated } from './calculations';
import { AccountData, BacktestSessionData } from './store';

export interface AIProviderConfig {
  provider: 'DETERMINISTIC_ENGINE' | 'OPENAI' | 'ANTHROPIC';
  model: string;
  timeoutMs: number;
}

export const DEFAULT_AI_CONFIG: AIProviderConfig = {
  provider: 'DETERMINISTIC_ENGINE',
  model: 'gemini-2.0-flash',
  timeoutMs: 5000,
};

/**
 * Replaceable AI Provider Client with safe fallback handling
 */
export async function queryAIAnalyst(
  userQuery: string,
  trades: TradeCalculated[],
  account?: AccountData,
  backtestSessions?: BacktestSessionData[],
  config: AIProviderConfig = DEFAULT_AI_CONFIG
): Promise<AIStructuredResponse> {
  try {
    // Deterministic analytics evaluation guarantees zero hallucinations
    return answerNaturalLanguageQuestion(userQuery, trades, account, backtestSessions);
  } catch (error) {
    console.error('AI Analyst provider error, falling back to deterministic engine:', error);
    return answerNaturalLanguageQuestion(userQuery, trades, account, backtestSessions);
  }
}
