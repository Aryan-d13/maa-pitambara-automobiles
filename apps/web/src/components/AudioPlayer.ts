let activeUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Reads the provided text aloud in English or Hindi using the Web Speech API.
 */
export function speakText(text: string, lang: 'en' | 'hi') {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn("Speech Synthesis is not supported in this browser.");
    return;
  }

  // Stop any current reading
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';

  // Slow down slightly for clear understanding on speakerphones
  utterance.rate = 0.85;
  utterance.pitch = 1.0;

  // Attempt to select the best matching voice
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(v => 
    v.lang.toLowerCase().replace('_', '-').startsWith(lang === 'hi' ? 'hi' : 'en')
  );
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  activeUtterance = utterance;

  utterance.onend = () => {
    if (activeUtterance === utterance) {
      activeUtterance = null;
    }
  };

  utterance.onerror = (e) => {
    console.error("Speech Synthesis Error:", e);
    if (activeUtterance === utterance) {
      activeUtterance = null;
    }
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Stops any active speech synthesis immediately.
 */
export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}
