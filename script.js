document.addEventListener('DOMContentLoaded', () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    // 음의 주파수를 정의 (A4 = 440Hz)
    const notes = {
        'C': 261.63,
        'C#': 277.18,
        'D': 293.66,
        'D#': 311.13,
        'E': 329.63,
        'F': 349.23,
        'F#': 369.99,
        'G': 392.00,
        'G#': 415.30,
        'A': 440.00,
        'A#': 466.16,
        'B': 493.88,
        'C2': 523.25
    };

    function playSound(frequency) {
        // 오디오 컨텍스트가 정지된 경우 다시 시작
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine'; // 사인파로 소리를 생성
        oscillator.frequency.value = frequency;

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(
            0.00001, audioContext.currentTime + 1
        );
        oscillator.stop(audioContext.currentTime + 1);
    }

    // 모든 키에 이벤트 리스너 추가 (마우스 클릭)
    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('click', () => {
            const note = key.getAttribute('data-note');
            const frequency = notes[note];
            playSound(frequency);

            key.classList.add('active');
            setTimeout(() => key.classList.remove('active'), 200);
        });
    });

    // 키보드 입력 처리
    document.addEventListener('keydown', (event) => {
        const keyMap = {
            'a': 'C',
            'w': 'C#',
            's': 'D',
            'e': 'D#',
            'd': 'E',
            'f': 'F',
            't': 'F#',
            'g': 'G',
            'y': 'G#',
            'h': 'A',
            'u': 'A#',
            'j': 'B',
            'k': 'C2'
        };

        const note = keyMap[event.key];
        if (note) {
            const frequency = notes[note];
            playSound(frequency);

            // 해당하는 키의 버튼에 애니메이션 효과 추가
            const keyElement = document.querySelector(`[data-note="${note}"]`);
            if (keyElement) {
                keyElement.classList.add('active');
                setTimeout(() => keyElement.classList.remove('active'), 200);
            }
        }
    });
});

