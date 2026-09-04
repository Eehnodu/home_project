# 역할: PCM16 바이트를 WAV 파일로 저장하는 오디오 유틸

import os
import tempfile
import wave

import numpy as np


async def convert_pcm_to_wav(filename: str, pcm_data: bytes, sample_rate: int = 16000) -> None:
    try:
        pcm_array = np.frombuffer(pcm_data, dtype=np.int16)
        with wave.open(filename, "wb") as wav_file:
            wav_file.setnchannels(1)      # mono
            wav_file.setsampwidth(2)      # 16-bit
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(pcm_array.tobytes())
    except Exception as e:
        print(f"WAV 변환 중 오류: {e}")