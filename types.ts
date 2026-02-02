
export enum AnalysisType {
  METAPHOR = 'Metaphor',
  IDIOM = 'Idiom',
  WORD = 'Word',
  SLANG = 'Slang',
  TERM = 'Term',
  CHAT = 'Chat'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SemanticAnalysis {
  id: string;
  term: string;
  rootForm?: string; // Base form of the word (e.g., 'go' for 'went')
  partOfSpeech: string;
  context: string;
  type: AnalysisType;
  tags: string[];
  semanticCore: {
    en: string;
    cn: string;
    cn_definition?: string;
    contextualMeaning: {
      en: string;
      cn: string;
    };
  };
  pragmatics: {
    tone: string;
    register: string;
    nuance_cn: string;
  };
  mapping?: {
    source: string;
    target: string;
    explanation_cn: string;
  };
  originStory: string;
  synonyms: string[];
  antonyms?: string[];
  collocations: string[];
  usageExamples: {
    category: string;
    en: string;
    cn: string;
  }[];
  impactScore: number;
  timestamp: string;
  groundingSources?: GroundingSource[];
  visualContext?: string;
  meta?: {
    provider: 'doubao';
    model: string;
    latencyMs: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
