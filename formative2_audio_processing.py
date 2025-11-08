"""
Formative 2: Audio Data Collection and Processing
Multimodal Data Preprocessing Assignment - Audio Component

This script handles:
1. Audio data collection and recording
2. Waveform and spectrogram visualization
3. Audio augmentations (pitch shift, time stretch, background noise)
4. Feature extraction (MFCCs, spectral roll-off, energy)
5. Saving features to audio_features.csv
"""

import librosa
import librosa.display
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import soundfile as sf
import os
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

# Configuration
SAMPLE_RATE = 22050
AUDIO_DIR = Path('audio_samples')
AUGMENTED_DIR = Path('audio_augmented')
VISUALIZATIONS_DIR = Path('audio_visualizations')
FEATURES_CSV = 'audio_features.csv'

# Create directories
AUDIO_DIR.mkdir(exist_ok=True)
AUGMENTED_DIR.mkdir(exist_ok=True)
VISUALIZATIONS_DIR.mkdir(exist_ok=True)


def record_audio(filename: str, duration: float = 3.0, sample_rate: int = SAMPLE_RATE) -> Optional[str]:
    """
    Record audio using pyaudio (if available) or prompt user to record manually.
    
    Args:
        filename: Name of the output file
        duration: Recording duration in seconds
        sample_rate: Sample rate for recording
    
    Returns:
        Path to saved audio file or None if recording failed
    """
    try:
        import pyaudio
        import wave
        
        chunk = 1024
        format = pyaudio.paInt16
        channels = 1
        
        p = pyaudio.PyAudio()
        
        print(f"\n🎤 Recording for {duration} seconds...")
        print("Speak now!")
        
        stream = p.open(format=format,
                       channels=channels,
                       rate=sample_rate,
                       input=True,
                       frames_per_buffer=chunk)
        
        frames = []
        for _ in range(0, int(sample_rate / chunk * duration)):
            data = stream.read(chunk)
            frames.append(data)
        
        print("✅ Recording complete!")
        
        stream.stop_stream()
        stream.close()
        p.terminate()
        
        # Save recording
        output_path = AUDIO_DIR / filename
        wf = wave.open(str(output_path), 'wb')
        wf.setnchannels(channels)
        wf.setsampwidth(p.get_sample_size(format))
        wf.setframerate(sample_rate)
        wf.writeframes(b''.join(frames))
        wf.close()
        
        print(f"💾 Saved to: {output_path}")
        return str(output_path)
        
    except ImportError:
        print("\n⚠️  pyaudio not available. Please record audio manually and save to:")
        print(f"   {AUDIO_DIR / filename}")
        print("\nYou can use:")
        print("  - Audacity (free, cross-platform)")
        print("  - Online recorder: https://online-voice-recorder.com/")
        print("  - Your phone's voice recorder")
        return None
    except Exception as e:
        print(f"❌ Recording error: {e}")
        print(f"Please record manually and save to: {AUDIO_DIR / filename}")
        return None


def load_audio(audio_path: str, sr: int = SAMPLE_RATE) -> Tuple[np.ndarray, int]:
    """
    Load audio file using librosa.
    
    Args:
        audio_path: Path to audio file
        sr: Target sample rate
    
    Returns:
        Tuple of (audio array, sample rate)
    """
    y, sample_rate = librosa.load(audio_path, sr=sr)
    return y, sample_rate


def visualize_waveform(audio: np.ndarray, sr: int, title: str, save_path: str):
    """
    Visualize audio waveform (amplitude vs time).
    
    Args:
        audio: Audio signal array
        sr: Sample rate
        title: Plot title
        save_path: Path to save the visualization
    """
    time = np.linspace(0, len(audio) / sr, len(audio))
    
    plt.figure(figsize=(12, 4))
    plt.plot(time, audio)
    plt.title(f'Waveform: {title}')
    plt.xlabel('Time (seconds)')
    plt.ylabel('Amplitude')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  ✓ Saved waveform: {save_path}")


def visualize_spectrogram(audio: np.ndarray, sr: int, title: str, save_path: str):
    """
    Visualize audio spectrogram.
    
    Args:
        audio: Audio signal array
        sr: Sample rate
        title: Plot title
        save_path: Path to save the visualization
    """
    # Compute spectrogram
    D = librosa.amplitude_to_db(np.abs(librosa.stft(audio)), ref=np.max)
    
    plt.figure(figsize=(12, 6))
    librosa.display.specshow(D, y_axis='hz', x_axis='time', sr=sr)
    plt.colorbar(format='%+2.0f dB')
    plt.title(f'Spectrogram: {title}')
    plt.xlabel('Time (seconds)')
    plt.ylabel('Frequency (Hz)')
    plt.tight_layout()
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"  ✓ Saved spectrogram: {save_path}")


def visualize_audio_samples(audio_paths: List[str], member_name: str):
    """
    Load and visualize waveforms and spectrograms for audio samples.
    
    Args:
        audio_paths: List of paths to audio files
        member_name: Name of the team member
    """
    print(f"\n📊 Visualizing audio samples for {member_name}...")
    
    for idx, audio_path in enumerate(audio_paths):
        if not os.path.exists(audio_path):
            print(f"  ⚠️  File not found: {audio_path}")
            continue
        
        audio, sr = load_audio(audio_path)
        filename = Path(audio_path).stem
        
        # Visualize waveform
        waveform_path = VISUALIZATIONS_DIR / f"{member_name}_{filename}_waveform.png"
        visualize_waveform(audio, sr, f"{member_name} - {filename}", str(waveform_path))
        
        # Visualize spectrogram
        spectrogram_path = VISUALIZATIONS_DIR / f"{member_name}_{filename}_spectrogram.png"
        visualize_spectrogram(audio, sr, f"{member_name} - {filename}", str(spectrogram_path))


def augment_pitch_shift(audio: np.ndarray, sr: int, n_steps: float = 2.0) -> np.ndarray:
    """
    Apply pitch shift augmentation.
    
    Args:
        audio: Audio signal array
        sr: Sample rate
        n_steps: Number of semitones to shift (positive = higher, negative = lower)
    
    Returns:
        Pitch-shifted audio
    """
    return librosa.effects.pitch_shift(audio, sr=sr, n_steps=n_steps)


def augment_time_stretch(audio: np.ndarray, rate: float = 1.2) -> np.ndarray:
    """
    Apply time stretch augmentation (changes speed without changing pitch).
    
    Args:
        audio: Audio signal array
        rate: Stretch factor (>1.0 = slower, <1.0 = faster)
    
    Returns:
        Time-stretched audio
    """
    return librosa.effects.time_stretch(audio, rate=rate)


def augment_background_noise(audio: np.ndarray, noise_level: float = 0.01) -> np.ndarray:
    """
    Add random background noise to audio.
    
    Args:
        audio: Audio signal array
        noise_level: Standard deviation of noise (relative to signal)
    
    Returns:
        Audio with added noise
    """
    noise = np.random.normal(0, noise_level, len(audio))
    noisy_audio = audio + noise
    # Normalize to prevent clipping
    return librosa.util.normalize(noisy_audio)


def apply_augmentations(audio: np.ndarray, sr: int, base_filename: str, member_name: str) -> List[Dict]:
    """
    Apply multiple augmentations to an audio sample.
    
    Args:
        audio: Original audio signal
        sr: Sample rate
        base_filename: Base filename for saving augmented files
        member_name: Name of the team member
    
    Returns:
        List of dictionaries with augmentation info and file paths
    """
    augmentations = []
    
    # Augmentation 1: Pitch shift up
    audio_pitch_up = augment_pitch_shift(audio, sr, n_steps=2.0)
    pitch_up_path = AUGMENTED_DIR / f"{member_name}_{base_filename}_pitch_up.wav"
    sf.write(str(pitch_up_path), audio_pitch_up, sr)
    augmentations.append({
        'type': 'pitch_shift',
        'params': {'n_steps': 2.0},
        'path': str(pitch_up_path),
        'audio': audio_pitch_up
    })
    print(f"  ✓ Pitch shift (+2 semitones): {pitch_up_path.name}")
    
    # Augmentation 2: Time stretch (slower)
    audio_slow = augment_time_stretch(audio, rate=1.2)
    slow_path = AUGMENTED_DIR / f"{member_name}_{base_filename}_time_stretch.wav"
    sf.write(str(slow_path), audio_slow, sr)
    augmentations.append({
        'type': 'time_stretch',
        'params': {'rate': 1.2},
        'path': str(slow_path),
        'audio': audio_slow
    })
    print(f"  ✓ Time stretch (1.2x slower): {slow_path.name}")
    
    # Augmentation 3: Background noise
    audio_noisy = augment_background_noise(audio, noise_level=0.01)
    noisy_path = AUGMENTED_DIR / f"{member_name}_{base_filename}_noise.wav"
    sf.write(str(noisy_path), audio_noisy, sr)
    augmentations.append({
        'type': 'background_noise',
        'params': {'noise_level': 0.01},
        'path': str(noisy_path),
        'audio': audio_noisy
    })
    print(f"  ✓ Background noise: {noisy_path.name}")
    
    return augmentations


def extract_mfccs(audio: np.ndarray, sr: int, n_mfcc: int = 13) -> np.ndarray:
    """
    Extract MFCC (Mel-Frequency Cepstral Coefficients) features.
    
    Args:
        audio: Audio signal array
        sr: Sample rate
        n_mfcc: Number of MFCC coefficients to extract
    
    Returns:
        MFCC features (mean across time)
    """
    mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=n_mfcc)
    # Return mean across time frames
    return np.mean(mfccs, axis=1)


def extract_spectral_rolloff(audio: np.ndarray, sr: int, roll_percent: float = 0.85) -> float:
    """
    Extract spectral roll-off frequency.
    
    Args:
        audio: Audio signal array
        sr: Sample rate
        roll_percent: Roll-off percentage (default 0.85 = 85%)
    
    Returns:
        Spectral roll-off frequency
    """
    rolloff = librosa.feature.spectral_rolloff(y=audio, sr=sr, roll_percent=roll_percent)
    return np.mean(rolloff)


def extract_energy(audio: np.ndarray) -> float:
    """
    Extract RMS energy from audio.
    
    Args:
        audio: Audio signal array
    
    Returns:
        RMS energy
    """
    rms = librosa.feature.rms(y=audio)
    return np.mean(rms)


def extract_all_features(audio: np.ndarray, sr: int) -> Dict[str, float]:
    """
    Extract all audio features (MFCCs, spectral roll-off, energy).
    
    Args:
        audio: Audio signal array
        sr: Sample rate
    
    Returns:
        Dictionary of extracted features
    """
    features = {}
    
    # Extract MFCCs (13 coefficients)
    mfccs = extract_mfccs(audio, sr, n_mfcc=13)
    for i, mfcc in enumerate(mfccs):
        features[f'mfcc_{i+1}'] = float(mfcc)
    
    # Extract spectral roll-off
    features['spectral_rolloff'] = float(extract_spectral_rolloff(audio, sr))
    
    # Extract energy
    features['energy'] = float(extract_energy(audio))
    
    return features


def process_audio_samples(member_name: str, audio_files: List[str], phrases: List[str]):
    """
    Process audio samples for a team member: visualize, augment, and extract features.
    
    Args:
        member_name: Name of the team member
        audio_files: List of paths to audio files
        phrases: List of phrases corresponding to each audio file
    
    Returns:
        List of feature dictionaries
    """
    print(f"\n{'='*60}")
    print(f"Processing audio samples for: {member_name}")
    print(f"{'='*60}")
    
    all_features = []
    
    # Visualize original samples
    visualize_audio_samples(audio_files, member_name)
    
    # Process each audio file
    for idx, (audio_path, phrase) in enumerate(zip(audio_files, phrases)):
        if not os.path.exists(audio_path):
            print(f"  ⚠️  Skipping missing file: {audio_path}")
            continue
        
        print(f"\n📁 Processing: {Path(audio_path).name} ('{phrase}')")
        audio, sr = load_audio(audio_path)
        base_filename = Path(audio_path).stem
        
        # Extract features from original
        print("  🔍 Extracting features from original...")
        original_features = extract_all_features(audio, sr)
        original_features.update({
            'member_name': member_name,
            'audio_file': Path(audio_path).name,
            'phrase': phrase,
            'augmentation': 'original',
            'augmentation_params': 'none'
        })
        all_features.append(original_features)
        
        # Apply augmentations
        print("  🎨 Applying augmentations...")
        augmentations = apply_augmentations(audio, sr, base_filename, member_name)
        
        # Extract features from augmented samples
        for aug in augmentations:
            aug_features = extract_all_features(aug['audio'], sr)
            aug_features.update({
                'member_name': member_name,
                'audio_file': Path(audio_path).name,
                'phrase': phrase,
                'augmentation': aug['type'],
                'augmentation_params': str(aug['params'])
            })
            all_features.append(aug_features)
    
    print(f"\n✅ Processed {len(audio_files)} audio file(s) for {member_name}")
    return all_features


def save_features_to_csv(features_list: List[Dict], output_file: str = FEATURES_CSV):
    """
    Save extracted features to CSV file.
    
    Args:
        features_list: List of feature dictionaries
        output_file: Output CSV file path
    """
    if not features_list:
        print("⚠️  No features to save!")
        return
    
    df = pd.DataFrame(features_list)
    
    # Reorder columns for better readability
    metadata_cols = ['member_name', 'audio_file', 'phrase', 'augmentation', 'augmentation_params']
    feature_cols = [col for col in df.columns if col not in metadata_cols]
    df = df[metadata_cols + feature_cols]
    
    df.to_csv(output_file, index=False)
    print(f"\n💾 Saved {len(df)} feature vectors to: {output_file}")
    print(f"   Shape: {df.shape}")
    print(f"   Columns: {len(df.columns)}")


def main():
    """
    Main function to process audio samples for all team members.
    """
    print("="*60)
    print("FORMATIVE 2: AUDIO DATA COLLECTION AND PROCESSING")
    print("="*60)
    
    # Example structure - modify with your team's data
    # Each team member should have at least 2 audio samples
    team_members = {
        # Example format:
        # 'Member1': {
        #     'audio_files': [
        #         'audio_samples/member1_yes_approve.wav',
        #         'audio_samples/member1_confirm_transaction.wav'
        #     ],
        #     'phrases': ['Yes, approve', 'Confirm transaction']
        # },
        # Add your team members here
    }
    
    # If no team members defined, provide instructions
    if not team_members:
        print("\n📝 SETUP INSTRUCTIONS:")
        print("="*60)
        print("1. Record audio samples for each team member:")
        print("   - At least 2 phrases per member:")
        print("     * 'Yes, approve'")
        print("     * 'Confirm transaction'")
        print("\n2. Save audio files to 'audio_samples/' directory")
        print("   Format: member_name_phrase.wav")
        print("   Example: member1_yes_approve.wav")
        print("\n3. Update the 'team_members' dictionary in main() function")
        print("   with your actual file paths and member names")
        print("\n4. Run this script again to process all samples")
        print("="*60)
        
        # Check if audio_samples directory has files
        if AUDIO_DIR.exists():
            audio_files = list(AUDIO_DIR.glob('*.wav')) + list(AUDIO_DIR.glob('*.mp3'))
            if audio_files:
                print(f"\n📁 Found {len(audio_files)} audio file(s) in {AUDIO_DIR}:")
                for f in audio_files:
                    print(f"   - {f.name}")
                print("\n💡 You can manually process these files by updating the script.")
        return
    
    # Process all team members
    all_features = []
    for member_name, data in team_members.items():
        member_features = process_audio_samples(
            member_name,
            data['audio_files'],
            data['phrases']
        )
        all_features.extend(member_features)
    
    # Save all features to CSV
    if all_features:
        save_features_to_csv(all_features)
        print(f"\n✅ Processing complete! Check '{FEATURES_CSV}' for extracted features.")
    else:
        print("\n⚠️  No features extracted. Please check your audio file paths.")


if __name__ == "__main__":
    main()

