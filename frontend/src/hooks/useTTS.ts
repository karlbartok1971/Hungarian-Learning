import { useState, useEffect, useCallback, useRef } from 'react';

interface TTSOptions {
    lang?: string;
    rate?: number; // 속도 (0.1 ~ 10)
    pitch?: number; // 피치 (0 ~ 2)
    volume?: number; // 볼륨 (0 ~ 1)
}

export const useTTS = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceInfo, setVoiceInfo] = useState<{ name: string; lang: string } | null>(null);

    const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
    const hungarianVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

    // GC(가비지 컬렉션)에 의해 재생 중 끊기는 현상을 방지하기 위한 참조 보관소
    // 브라우저 버그 회피용 (특히 Chrome)
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const loadAndSelectVoice = useCallback(() => {
        const availableVoices = window.speechSynthesis.getVoices();
        voicesRef.current = availableVoices;

        if (availableVoices.length === 0) return;

        let selectedVoice = availableVoices.find(
            (v) => v.lang === 'hu-HU' && v.name.includes('Google')
        );

        if (!selectedVoice) {
            selectedVoice = availableVoices.find((v) => v.lang === 'hu-HU');
        }

        if (!selectedVoice) {
            selectedVoice = availableVoices.find((v) => v.lang.includes('hu'));
        }

        hungarianVoiceRef.current = selectedVoice || null;

        // 개발 모드에서만 로그 출력 (불필요한 로그 노이즈 감소)
        if (selectedVoice && process.env.NODE_ENV === 'development') {
            console.log(`🎤 Voice Ready: ${selectedVoice.name}`);
            setVoiceInfo({ name: selectedVoice.name, lang: selectedVoice.lang });
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            loadAndSelectVoice();
            window.speechSynthesis.onvoiceschanged = loadAndSelectVoice;
        }

        // 클린업: 컴포넌트 언마운트 시 말하고 있던거 멈춤
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, [loadAndSelectVoice]);

    const speak = useCallback((text: string, options: TTSOptions = {}) => {
        if (!window.speechSynthesis) return;

        // 1. 반응 속도를 위해 기존 대기열 즉시 제거 (Zero Latency 핵심)
        window.speechSynthesis.cancel();

        if (!text) return;

        // 목소리 재확인
        if (!hungarianVoiceRef.current) {
            loadAndSelectVoice();
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // 옵션 설정
        utterance.lang = 'hu-HU';
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;

        if (hungarianVoiceRef.current) {
            utterance.voice = hungarianVoiceRef.current;
        }

        // 2. 이벤트 핸들링 최적화
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            utteranceRef.current = null; // 참조 해제
        };
        utterance.onerror = (e) => {
            console.error('TTS Error', e);
            setIsSpeaking(false);
            utteranceRef.current = null;
        };

        // 3. 브라우저 메모리 해제 방지 트릭 (전역 ref에 할당)
        utteranceRef.current = utterance;

        window.speechSynthesis.speak(utterance);
    }, [loadAndSelectVoice]);

    const cancel = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    return { speak, cancel, isSpeaking, voiceInfo };
};
