"""
Task 4: Generate audio files with added random noise
Simple version
"""

import librosa
import numpy as np
import soundfile as sf
import os

# Load original audio file
audio_file = 'sample_data/your_audio.wav'  # Change this to your audio file path
y, sr = librosa.load(audio_file)

# Generate random noise
noise_level = 0.01  # Adjust this to control noise amount (0.01 = 1% noise)
noise = np.random.normal(0, noise_level, len(y))

# Add noise to audio
noisy_audio = y + noise

# Save the noisy audio file
output_file = 'noisy_audio.wav'
sf.write(output_file, noisy_audio, sr)

print(f"Generated noisy audio: {output_file}")

