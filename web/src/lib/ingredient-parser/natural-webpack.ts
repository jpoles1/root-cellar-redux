/*
Importing natural into webpack (the node nlp toolkit)

This is just copy of natural's index.js with some exports commented out.
This way it works in webpack, however I haven't full tested it.
*/

/* eslint-disable */

export const SoundEx = require('natural/lib/natural/phonetics/soundex')
export const Metaphone = require('natural/lib/natural/phonetics/metaphone')
export const DoubleMetaphone = require('natural/lib/natural/phonetics/double_metaphone')
export const SoundExDM = require('natural/lib/natural/phonetics/dm_soundex')
export const PorterStemmer = require('natural/lib/natural/stemmers/porter_stemmer')
export const PorterStemmerFa = require('natural/lib/natural/stemmers/porter_stemmer_fa')
export const PorterStemmerFr = require('natural/lib/natural/stemmers/porter_stemmer_fr')
export const PorterStemmerRu = require('natural/lib/natural/stemmers/porter_stemmer_ru')
export const PorterStemmerEs = require('natural/lib/natural/stemmers/porter_stemmer_es')
export const PorterStemmerIt = require('natural/lib/natural/stemmers/porter_stemmer_it')
export const PorterStemmerNo = require('natural/lib/natural/stemmers/porter_stemmer_no')
export const PorterStemmerPt = require('natural/lib/natural/stemmers/porter_stemmer_pt')
export const LancasterStemmer = require('natural/lib/natural/stemmers/lancaster_stemmer')
export const StemmerFr = require('natural/lib/natural/stemmers/stemmer_fr')
export const StemmerPl = require('natural/lib/natural/stemmers/stemmer_pl')
export const StemmerJa = require('natural/lib/natural/stemmers/stemmer_ja')
export const AggressiveTokenizerNl = require('natural/lib/natural/tokenizers/aggressive_tokenizer_nl')
export const AggressiveTokenizerFa = require('natural/lib/natural/tokenizers/aggressive_tokenizer_fa')
export const AggressiveTokenizerFr = require('natural/lib/natural/tokenizers/aggressive_tokenizer_fr')
export const AggressiveTokenizerRu = require('natural/lib/natural/tokenizers/aggressive_tokenizer_ru')
export const AggressiveTokenizerEs = require('natural/lib/natural/tokenizers/aggressive_tokenizer_es')
export const AggressiveTokenizerIt = require('natural/lib/natural/tokenizers/aggressive_tokenizer_it')
export const AggressiveTokenizerPl = require('natural/lib/natural/tokenizers/aggressive_tokenizer_pl')
export const AggressiveTokenizerPt = require('natural/lib/natural/tokenizers/aggressive_tokenizer_pt')
export const AggressiveTokenizerNo = require('natural/lib/natural/tokenizers/aggressive_tokenizer_no')
export const AggressiveTokenizer = require('natural/lib/natural/tokenizers/aggressive_tokenizer')
export const CaseTokenizer = require('natural/lib/natural/tokenizers/tokenizer_case')
export const RegexpTokenizer = require('natural/lib/natural/tokenizers/regexp_tokenizer').RegexpTokenizer
export const WordTokenizer = require('natural/lib/natural/tokenizers/regexp_tokenizer').WordTokenizer
export const WordPunctTokenizer = require('natural/lib/natural/tokenizers/regexp_tokenizer').WordPunctTokenizer
export const TreebankWordTokenizer = require('natural/lib/natural/tokenizers/treebank_word_tokenizer')
export const TokenizerJa = require('natural/lib/natural/tokenizers/tokenizer_ja')
export const SentenceTokenizer = require('natural/lib/natural/tokenizers/sentence_tokenizer')
// export const BayesClassifier = require('natural/lib/natural/classifiers/bayes_classifier'); // uses fs
// export const LogisticRegressionClassifier = require('natural/lib/natural/classifiers/logistic_regression_classifier'); // uses fs
export const NounInflector = require('natural/lib/natural/inflectors/noun_inflector')
export const NounInflectorFr = require('natural/lib/natural/inflectors/fr/noun_inflector')
export const NounInflectorJa = require('natural/lib/natural/inflectors/ja/noun_inflector')
export const PresentVerbInflector = require('natural/lib/natural/inflectors/present_verb_inflector')
export const CountInflector = require('natural/lib/natural/inflectors/count_inflector')
// export const WordNet = require('natural/lib/natural/wordnet/wordnet'); // uses fs
// export const TfIdf = require('natural/lib/natural/tfidf/tfidf'); /// uses fs
export const Trie = require('natural/lib/natural/trie/trie')
export const SentenceAnalyzer = require('natural/lib/natural/analyzers/sentence_analyzer')
export const stopwords = require('natural/lib/natural/util/stopwords').words
export const ShortestPathTree = require('natural/lib/natural/util/shortest_path_tree')
export const Spellcheck = require('natural/lib/natural/spellcheck/spellcheck')
export const LongestPathTree = require('natural/lib/natural/util/longest_path_tree')
export const EdgeWeightedDigraph = require('natural/lib/natural/util/edge_weighted_digraph')
export const NGrams = require('natural/lib/natural/ngrams/ngrams')
export const NGramsZH = require('natural/lib/natural/ngrams/ngrams_zh')
export const JaroWinklerDistance = require('natural/lib/natural/distance/jaro-winkler_distance')
export const LevenshteinDistance = require('natural/lib/natural/distance/levenshtein_distance')
export const DiceCoefficient = require('natural/lib/natural/distance/dice_coefficient')
export const normalize = require('natural/lib/natural/normalizers/normalizer').normalize_tokens
export const normalize_ja = require('natural/lib/natural/normalizers/normalizer_ja').normalize_ja
export const removeDiacritics = require('natural/lib/natural/normalizers/remove_diacritics')
export const transliterate_ja = require('natural/lib/natural/transliterators/ja')
// export const BrillPOSTagger = require('natural/lib/natural/brill_pos_tagger/lib/Brill_POS_Tagger'); // uses fs
