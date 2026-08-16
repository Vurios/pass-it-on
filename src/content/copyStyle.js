/**
 * PASS IT ON - COPY STYLE GUIDELINES
 *
 * Rule 1: Title Case for UI Labels & Headings
 * - Use for: Headings (h1-h6), button labels, category tags, modal titles, short status badges,
 *   technique names, and tab labels.
 * - Capitalize every word EXCEPT minor connector words:
 *   a, an, the, and, or, but, for, nor, of, in, on, to, with, as, at, by
 *   (these stay lowercase unless they are the first word).
 * - Examples:
 *   - "Host a Game", "Join a Game", "Play on One Screen"
 *   - "Read Aloud", "Play Again", "Odd Source Out", "Spot the Spin"
 *   - "Real or Rendered", "Chain of Custody", "Fabricated Teaching Example"
 *   - "What Your Room Learned", "Final Scoreboard", "Back to Scores"
 *   - "Leave Game", "Keep Playing", "Download PNG"
 *
 * Rule 2: Sentence case for Full Sentences & Descriptions
 * - Use for: Round questions, full-sentence descriptions, answer options, error messages,
 *   subtitles, feedback text, and explanations.
 * - Capitalize ONLY the first letter of each sentence, with everything else lowercase
 *   except proper nouns.
 * - Examples:
 *   - "Spot the tricks. Share the clues. Play together."
 *   - "Scan with a phone. No account needed."
 *   - "Your room is ready. First player gets the loudest welcome."
 *   - "Which source is least credible for checking this event?"
 *   - "Every headline in this game was written by the team as a teaching example. None of them are real news."
 */

export const COPY_STYLE_NOTES = Object.freeze({
  TITLE_CASE_RULES: 'Capitalize all words except minor connectors (a, an, the, and, or, but, for, nor, of, in, on, to, with, as, at, by) unless first word.',
  SENTENCE_CASE_RULES: 'Capitalize only the first word and proper nouns in full sentences and paragraphs.',
})
