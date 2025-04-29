import { Logger } from '@nestjs/common';
import { SurveyData } from '@app/modules/drizzle/buddhashanti-db/schema';

// Remove @Injectable() since this is an abstract class
export abstract class BaseParserService {
  protected readonly logger: Logger;

  constructor(serviceName: string) {
    this.logger = new Logger(serviceName);
  }

  /**
   * Helper method to extract data from SurveyData or use raw data
   */
  protected extractDataFromSurvey<T>(
    surveyData: Record<string, any> | SurveyData<T>,
  ): Record<string, any> {
    if (!surveyData) {
      return {};
    }

    // Check if it's a SurveyData object (has data property)
    if ('data' in surveyData && typeof surveyData.data === 'object') {
      this.logger.debug('Extracting data from SurveyData wrapper');
      return surveyData.data as Record<string, any>;
    }

    // Otherwise return as is
    return surveyData as Record<string, any>;
  }

  /**
   * Multi-tier token matching system
   * @param token1 First token to compare
   * @param token2 Second token to compare
   * @returns Number indicating match level: 3 (exact), 2 (normalized), 1 (character count), 0 (no match)
   */
  matchTokens(token1: string, token2: string): number {
    //this.logger.debug(`Matching tokens: "${token1}" and "${token2}"`);

    if (!token1 || !token2) {
      this.logger.debug('One or both tokens empty, returning 0');
      return 0;
    }

    // Tier 1: Exact match
    if (token1 === token2) {
      this.logger.debug('Exact match found (Tier 1)');
      return 3;
    }

    // Tier 2: Normalized match (trimmed and uppercase)
    const normalizedToken1 = token1.trim().toUpperCase();
    const normalizedToken2 = token2.trim().toUpperCase();

    if (normalizedToken1 === normalizedToken2) {
      this.logger.debug('Normalized match found (Tier 2)');
      return 2;
    }

    // Tier 3: Character frequency match
    if (
      this.haveMatchingCharacterFrequencies(normalizedToken1, normalizedToken2)
    ) {
      this.logger.debug('Character frequency match found (Tier 3)');
      return 1;
    }

    //this.logger.debug('No match found');
    return 0;
  }

  /**
   * Check if two strings have the same character frequencies
   * @param str1 First string
   * @param str2 Second string
   * @returns True if character frequencies match
   */
  private haveMatchingCharacterFrequencies(
    str1: string,
    str2: string,
  ): boolean {
    // If lengths differ, character counts can't match
    if (str1.length !== str2.length) {
      return false;
    }

    const freq1 = this.getCharacterFrequency(str1);
    const freq2 = this.getCharacterFrequency(str2);

    // Compare character frequencies
    for (const char of Object.keys(freq1)) {
      if (freq1[char] !== freq2[char]) {
        return false;
      }
    }

    for (const char of Object.keys(freq2)) {
      if (freq1[char] !== freq2[char]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate frequency of each character in a string
   * @param str Input string
   * @returns Object mapping each character to its frequency
   */
  private getCharacterFrequency(str: string): Record<string, number> {
    const freq: Record<string, number> = {};

    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }

    return freq;
  }
}
