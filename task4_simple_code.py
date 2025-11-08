"""
Task 4: Generate more audio files with added random noise to the original audio files
"""

import librosa
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import soundfile as sf
import os

# Load original audio
y, sr = librosa.load('sample_data/your_audio.wav')  # Change to your audio file

# Create output directory
os.makedirs('generated_audio', exist_ok=True)

# Generate 3 audio files with random noise
for i in range(3):
    # Generate random noise
    noise = np.random.normal(0, 0.01, len(y))
    
    # Add noise to original audio
    noisy_audio = y + noise
    
    # Save the noisy audio file
    output_file = f'generated_audio/noisy_audio_{i+1}.wav'
    sf.write(output_file, noisy_audio, sr)
    
    # Visualize
    pd.Series(noisy_audio).plot(figsize=(10, 5),
                                title=f'Noisy Audio {i+1} (with random noise)')
    plt.show()
    
    print(f"Generated: {output_file}")

print("\nDone! Generated 3 noisy audio files.")

