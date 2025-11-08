"""
Audio Processing Breakout Room Tasks
Using librosa for audio analysis and processing
"""

import librosa
import librosa.display
import numpy as np
import matplotlib.pyplot as plt
import os
import soundfile as sf
from pathlib import Path

# Task 1: Load sample data with audio files
def load_audio_files(data_dir='sample_data'):
    """
    Load audio files from the sample data directory
    """
    audio_files = []
    data_path = Path(data_dir)
    
    if not data_path.exists():
        print(f"Directory {data_dir} not found. Please create it and add audio files.")
        return audio_files
    
    # Common audio formats
    audio_extensions = ['.wav', '.mp3', '.flac', '.m4a', '.ogg']
    
    for ext in audio_extensions:
        audio_files.extend(list(data_path.glob(f'*{ext}')))
        audio_files.extend(list(data_path.glob(f'**/*{ext}')))
    
    print(f"Found {len(audio_files)} audio file(s)")
    return audio_files

# Task 2: Load and visualize amplitude versus time graph of the first audio
def visualize_amplitude_time(audio_path, sr=22050):
    """
    Load audio using librosa and visualize amplitude vs time
    """
    print(f"\nLoading audio: {audio_path}")
    
    # Load audio file
    y, sample_rate = librosa.load(audio_path, sr=sr)
    
    # Create time axis
    time = np.linspace(0, len(y) / sample_rate, len(y))
    
    # Plot amplitude vs time
    plt.figure(figsize=(12, 6))
    plt.plot(time, y)
    plt.title(f'Amplitude vs Time: {os.path.basename(audio_path)}')
    plt.xlabel('Time (seconds)')
    plt.ylabel('Amplitude')
    plt.grid(True)
    plt.tight_layout()
    plt.savefig('amplitude_vs_time.png', dpi=150)
    print("Saved: amplitude_vs_time.png")
    plt.show()
    
    return y, sample_rate

# Task 3: Trim audio to remove silence
def trim_silence(audio, sr=22050, top_db=20):
    """
    Remove silence from the beginning and end of audio
    """
    print("\nTrimming silence from audio...")
    
    # Trim silence using librosa
    y_trimmed, index = librosa.effects.trim(audio, top_db=top_db)
    
    # Calculate trimmed duration
    original_duration = len(audio) / sr
    trimmed_duration = len(y_trimmed) / sr
    
    print(f"Original duration: {original_duration:.2f} seconds")
    print(f"Trimmed duration: {trimmed_duration:.2f} seconds")
    print(f"Removed: {original_duration - trimmed_duration:.2f} seconds of silence")
    
    # Visualize comparison
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))
    
    time_original = np.linspace(0, original_duration, len(audio))
    time_trimmed = np.linspace(0, trimmed_duration, len(y_trimmed))
    
    ax1.plot(time_original, audio)
    ax1.set_title('Original Audio (with silence)')
    ax1.set_xlabel('Time (seconds)')
    ax1.set_ylabel('Amplitude')
    ax1.grid(True)
    
    ax2.plot(time_trimmed, y_trimmed)
    ax2.set_title('Trimmed Audio (silence removed)')
    ax2.set_xlabel('Time (seconds)')
    ax2.set_ylabel('Amplitude')
    ax2.grid(True)
    
    plt.tight_layout()
    plt.savefig('trimmed_audio_comparison.png', dpi=150)
    print("Saved: trimmed_audio_comparison.png")
    plt.show()
    
    return y_trimmed

# Task 4: Generate more audio files with added random noise
def add_random_noise(audio, sr=22050, noise_level=0.01, num_variations=3):
    """
    Generate multiple audio files with added random noise
    """
    print(f"\nGenerating {num_variations} audio files with random noise...")
    
    noisy_audios = []
    output_dir = Path('generated_audio')
    output_dir.mkdir(exist_ok=True)
    
    for i in range(num_variations):
        # Generate random noise
        noise = np.random.normal(0, noise_level, len(audio))
        
        # Add noise to audio
        noisy_audio = audio + noise
        
        # Normalize to prevent clipping
        noisy_audio = librosa.util.normalize(noisy_audio)
        
        # Save noisy audio
        output_path = output_dir / f'noisy_audio_{i+1}.wav'
        sf.write(str(output_path), noisy_audio, sr)
        
        print(f"Generated: {output_path}")
        noisy_audios.append(noisy_audio)
    
    return noisy_audios

# Task 5: Load spectrogram of each audio file and visualize them
def visualize_spectrograms(audio_files, sr=22050):
    """
    Load and visualize spectrograms for each audio file
    """
    print("\nGenerating spectrograms...")
    
    num_files = len(audio_files)
    if num_files == 0:
        print("No audio files to process")
        return
    
    # Create subplots
    fig, axes = plt.subplots(num_files, 2, figsize=(15, 5*num_files))
    
    if num_files == 1:
        axes = axes.reshape(1, -1)
    
    for idx, audio_path in enumerate(audio_files):
        # Load audio
        y, _ = librosa.load(audio_path, sr=sr)
        
        # Compute spectrogram
        D = librosa.amplitude_to_db(np.abs(librosa.stft(y)), ref=np.max)
        
        # Plot waveform
        time = np.linspace(0, len(y) / sr, len(y))
        axes[idx, 0].plot(time, y)
        axes[idx, 0].set_title(f'Waveform: {os.path.basename(audio_path)}')
        axes[idx, 0].set_xlabel('Time (seconds)')
        axes[idx, 0].set_ylabel('Amplitude')
        axes[idx, 0].grid(True)
        
        # Plot spectrogram
        img = librosa.display.specshow(D, y_axis='hz', x_axis='time', sr=sr, ax=axes[idx, 1])
        axes[idx, 1].set_title(f'Spectrogram: {os.path.basename(audio_path)}')
        axes[idx, 1].set_xlabel('Time (seconds)')
        axes[idx, 1].set_ylabel('Frequency (Hz)')
        plt.colorbar(img, ax=axes[idx, 1], format='%+2.0f dB')
    
    plt.tight_layout()
    plt.savefig('spectrograms_comparison.png', dpi=150)
    print("Saved: spectrograms_comparison.png")
    plt.show()

def visualize_mel_spectrogram(audio, sr=22050):
    """
    Visualize Mel spectrogram (more useful for speech recognition)
    """
    # Compute Mel spectrogram
    S = librosa.feature.melspectrogram(y=audio, sr=sr, n_mels=128)
    S_dB = librosa.power_to_db(S, ref=np.max)
    
    # Plot
    plt.figure(figsize=(12, 6))
    librosa.display.specshow(S_dB, x_axis='time', y_axis='mel', sr=sr)
    plt.colorbar(format='%+2.0f dB')
    plt.title('Mel Spectrogram')
    plt.tight_layout()
    plt.savefig('mel_spectrogram.png', dpi=150)
    print("Saved: mel_spectrogram.png")
    plt.show()
    
    return S_dB

# Task 6: Discussion on using spectrograms for speech recognition
def discuss_speech_recognition():
    """
    Discussion points on using spectrograms for speech recognition
    """
    discussion = """
    ============================================================
    USING SPECTROGRAMS FOR SPEECH RECOGNITION
    ============================================================
    
    1. SPECTROGRAM AS INPUT FEATURES:
       - Spectrograms convert audio signals into 2D images
       - Each pixel represents frequency intensity at a specific time
       - Neural networks (CNNs, RNNs) can process these like images
    
    2. MEL SPECTROGRAMS (Preferred for Speech):
       - Mel scale mimics human auditory perception
       - More emphasis on lower frequencies (where speech is)
       - Standard input for speech recognition models
    
    3. FEATURE EXTRACTION:
       - MFCCs (Mel-Frequency Cepstral Coefficients)
       - Mel spectrograms
       - Chroma features
       - Spectral contrast
    
    4. MODEL ARCHITECTURE OPTIONS:
       a) CNN-based: Treat spectrograms as images
          - ResNet, VGG, EfficientNet
          - Good for phoneme/word classification
       
       b) RNN-based: Process time sequences
          - LSTM, GRU
          - Good for sequence-to-sequence tasks
       
       c) Transformer-based: Attention mechanisms
          - Wav2Vec, Whisper
          - State-of-the-art performance
    
    5. TRAINING PIPELINE:
       - Preprocess: Load audio → Generate spectrograms
       - Augment: Add noise, time shift, pitch shift
       - Label: Phonemes, words, or full transcriptions
       - Train: Feed spectrograms to model
       - Evaluate: Word Error Rate (WER), Character Error Rate (CER)
    
    6. ADVANTAGES:
       - Preserves temporal and frequency information
       - Works well with deep learning models
       - Can handle variable-length audio
       - Robust to some noise variations
    
    7. CHALLENGES:
       - Requires large labeled datasets
       - Computational resources for training
       - Handling different accents/languages
       - Real-time processing constraints
    
    ============================================================
    """
    print(discussion)
    
    # Save discussion to file
    with open('speech_recognition_discussion.txt', 'w') as f:
        f.write(discussion)
    print("Saved: speech_recognition_discussion.txt")

# Main execution
def main():
    """
    Main function to execute all tasks
    """
    print("=" * 60)
    print("AUDIO PROCESSING BREAKOUT ROOM TASKS")
    print("=" * 60)
    
    # Task 1: Load sample data
    print("\n[TASK 1] Loading sample audio files...")
    audio_files = load_audio_files('sample_data')
    
    if len(audio_files) == 0:
        print("\n⚠️  No audio files found in 'sample_data' directory.")
        print("Please create a 'sample_data' folder and add audio files (.wav, .mp3, etc.)")
        print("\nFor testing, you can download sample audio files from:")
        print("- https://www2.cs.uic.edu/~i101/SoundFiles/")
        print("- https://freewavesamples.com/")
        return
    
    # Task 2: Visualize first audio
    print("\n[TASK 2] Visualizing amplitude vs time for first audio...")
    first_audio_path = audio_files[0]
    y, sr = visualize_amplitude_time(first_audio_path)
    
    # Task 3: Trim silence
    print("\n[TASK 3] Trimming silence...")
    y_trimmed = trim_silence(y, sr)
    
    # Task 4: Generate noisy audio files
    print("\n[TASK 4] Generating audio files with random noise...")
    noisy_audios = add_random_noise(y_trimmed, sr, noise_level=0.01, num_variations=3)
    
    # Task 5: Visualize spectrograms
    print("\n[TASK 5] Visualizing spectrograms...")
    # Include original and generated files
    all_audio_files = [first_audio_path] + list(Path('generated_audio').glob('*.wav'))
    visualize_spectrograms(all_audio_files, sr)
    
    # Also create Mel spectrogram (better for speech recognition)
    print("\nGenerating Mel spectrogram (better for speech recognition)...")
    mel_spec = visualize_mel_spectrogram(y_trimmed, sr)
    
    # Task 6: Discussion
    print("\n[TASK 6] Discussion on using spectrograms for speech recognition...")
    discuss_speech_recognition()
    
    print("\n" + "=" * 60)
    print("ALL TASKS COMPLETED!")
    print("=" * 60)
    print("\nGenerated files:")
    print("- amplitude_vs_time.png")
    print("- trimmed_audio_comparison.png")
    print("- generated_audio/ (directory with noisy audio files)")
    print("- spectrograms_comparison.png")
    print("- mel_spectrogram.png")
    print("- speech_recognition_discussion.txt")

if __name__ == "__main__":
    main()

