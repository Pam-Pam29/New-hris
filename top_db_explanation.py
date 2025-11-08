"""
Explanation: What does top_db parameter do in librosa.effects.trim()?

top_db = Threshold in decibels (dB) below the peak amplitude
"""

import librosa
import numpy as np
import matplotlib.pyplot as plt

# Load audio
y, sr = librosa.load('sample_data/your_audio.wav')  # Change to your file

# What top_db does:
# - It finds the peak (loudest) amplitude in the audio
# - Then it removes any parts that are more than 'top_db' decibels quieter than the peak
# - top_db=20 means: remove parts that are 20 dB or more below the peak

# Example with different top_db values:
print("=" * 60)
print("UNDERSTANDING top_db PARAMETER")
print("=" * 60)

# Find the peak amplitude
peak_amplitude = np.max(np.abs(y))
print(f"\nPeak amplitude in audio: {peak_amplitude:.4f}")

# Convert to dB
peak_db = 20 * np.log10(peak_amplitude + 1e-10)  # Add small value to avoid log(0)
print(f"Peak in decibels: {peak_db:.2f} dB")

print("\n" + "-" * 60)
print("What top_db=20 means:")
print("-" * 60)
print("The function will keep only parts of audio that are within")
print("20 dB of the peak amplitude.")
print(f"Threshold: {peak_db - 20:.2f} dB")
print("\nAnything quieter than this threshold is considered 'silence'")
print("and will be trimmed from the beginning and end.")

# Trim with different top_db values to show the difference
print("\n" + "=" * 60)
print("COMPARING DIFFERENT top_db VALUES")
print("=" * 60)

top_db_values = [10, 20, 30, 40]

fig, axes = plt.subplots(len(top_db_values) + 1, 1, figsize=(12, 3 * (len(top_db_values) + 1)))

# Original audio
time_original = np.linspace(0, len(y) / sr, len(y))
axes[0].plot(time_original, y)
axes[0].set_title('Original Audio (no trimming)')
axes[0].set_xlabel('Time (seconds)')
axes[0].set_ylabel('Amplitude')
axes[0].grid(True)

for idx, top_db in enumerate(top_db_values, 1):
    y_trimmed, _ = librosa.effects.trim(y, top_db=top_db)
    time_trimmed = np.linspace(0, len(y_trimmed) / sr, len(y_trimmed))
    
    axes[idx].plot(time_trimmed, y_trimmed)
    axes[idx].set_title(f'top_db={top_db} (more aggressive trimming)')
    axes[idx].set_xlabel('Time (seconds)')
    axes[idx].set_ylabel('Amplitude')
    axes[idx].grid(True)
    
    original_duration = len(y) / sr
    trimmed_duration = len(y_trimmed) / sr
    print(f"\ntop_db={top_db}:")
    print(f"  Original: {original_duration:.2f}s → Trimmed: {trimmed_duration:.2f}s")
    print(f"  Removed: {original_duration - trimmed_duration:.2f}s")

plt.tight_layout()
plt.savefig('top_db_comparison.png', dpi=150)
print("\nSaved: top_db_comparison.png")
plt.show()

print("\n" + "=" * 60)
print("SUMMARY:")
print("=" * 60)
print("• top_db=10  → Very aggressive (removes more, keeps only loudest parts)")
print("• top_db=20  → Moderate (good default, removes clear silence)")
print("• top_db=30  → Less aggressive (keeps quieter parts)")
print("• top_db=40  → Very lenient (removes only very quiet parts)")
print("\nLower top_db = More trimming (stricter)")
print("Higher top_db = Less trimming (more lenient)")

