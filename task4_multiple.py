"""
Task 4: Generate multiple audio files with added random noise
Simple version - generates 3 noisy variations
"""

import librosa
import numpy as np
import soundfile as sf
import os

# Load original audio file
audio_file = 'sample_data/your_audio.wav'  # Change this to your audio file path
y, sr = librosa.load(audio_file)

# Create output directory
os.makedirs('generated_audio', exist_ok=True)

# Generate 3 noisy versions
for i in range(3):
    # Generate random noise
    noise = np.random.normal(0, 0.01, len(y))
    
    # Add noise to audio
    noisy_audio = y + noise
    
    # Save the noisy audio file
    output_file = f'generated_audio/noisy_audio_{i+1}.wav'
    sf.write(output_file, noisy_audio, sr)
    
    print(f"Generated: {output_file}")

print("\nDone! Generated 3 noisy audio files.")

