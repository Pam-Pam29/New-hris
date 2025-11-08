"""
Formative 2: System Simulation - Command Line Application
Multimodal Data Preprocessing Assignment - System Simulation Component

This script simulates the complete user identity and product recommendation system:
1. Face recognition (simulated)
2. Voice verification
3. Product recommendation
4. Unauthorized attempt simulation
"""

import os
import sys
import argparse
from pathlib import Path
import pandas as pd
import numpy as np
from formative2_voiceprint_model import VoiceprintVerificationModel, verify_voice
from formative2_audio_processing import load_audio, extract_all_features
import joblib
import warnings
warnings.filterwarnings('ignore')

# Configuration
MODEL_DIR = Path('models')
FEATURES_CSV = 'audio_features.csv'
AUDIO_DIR = Path('audio_samples')
SAMPLE_RATE = 22050


class SystemSimulation:
    """
    Simulates the complete authentication and product recommendation system.
    """
    
    def __init__(self, voice_model_path: str = None, face_model_path: str = None):
        """
        Initialize the system simulation.
        
        Args:
            voice_model_path: Path to trained voiceprint model
            face_model_path: Path to trained face recognition model (optional, simulated)
        """
        self.voice_model = None
        self.face_model = None
        self.authorized_users = set()
        
        # Load voiceprint model
        if voice_model_path and os.path.exists(voice_model_path):
            self.voice_model = VoiceprintVerificationModel()
            self.voice_model.load(voice_model_path)
            print(f"✅ Loaded voiceprint model from: {voice_model_path}")
        else:
            print("⚠️  Voiceprint model not found. Please train the model first.")
            print("   Run: python formative2_voiceprint_model.py")
        
        # Load face model (simulated - in real implementation, load actual model)
        if face_model_path and os.path.exists(face_model_path):
            # In real implementation, load face recognition model here
            self.face_model = "face_model_loaded"  # Placeholder
            print(f"✅ Loaded face recognition model from: {face_model_path}")
        else:
            print("⚠️  Face recognition model not found. Using simulation mode.")
            self.face_model = None
        
        # Load authorized users from features CSV
        self._load_authorized_users()
    
    def _load_authorized_users(self):
        """Load list of authorized users from features CSV."""
        if os.path.exists(FEATURES_CSV):
            df = pd.read_csv(FEATURES_CSV)
            # Get unique member names from original (non-augmented) samples
            authorized = df[df['augmentation'] == 'original']['member_name'].unique()
            self.authorized_users = set(authorized)
            print(f"📋 Loaded {len(self.authorized_users)} authorized user(s)")
        else:
            print("⚠️  Features CSV not found. No authorized users loaded.")
    
    def simulate_face_recognition(self, user_name: str, image_path: str = None) -> dict:
        """
        Simulate face recognition step.
        
        Args:
            user_name: Name of the user attempting access
            image_path: Path to face image (optional, for simulation)
        
        Returns:
            Dictionary with recognition result
        """
        print("\n" + "="*60)
        print("STEP 1: FACE RECOGNITION")
        print("="*60)
        print(f"🔍 Checking face for user: {user_name}")
        
        # Simulate face recognition
        # In real implementation, this would:
        # 1. Load and preprocess the image
        # 2. Extract face embeddings
        # 3. Compare with stored face embeddings
        # 4. Return match confidence
        
        if self.face_model is None:
            # Simulation mode: check if user is in authorized list
            is_recognized = user_name in self.authorized_users
            confidence = 0.95 if is_recognized else 0.15
            print(f"   [SIMULATION] Face recognition result: {'✅ RECOGNIZED' if is_recognized else '❌ NOT RECOGNIZED'}")
        else:
            # Real implementation would use actual face model here
            is_recognized = user_name in self.authorized_users
            confidence = 0.92 if is_recognized else 0.18
            print(f"   Face recognition result: {'✅ RECOGNIZED' if is_recognized else '❌ NOT RECOGNIZED'}")
        
        result = {
            'is_recognized': is_recognized,
            'user_name': user_name,
            'confidence': confidence
        }
        
        if is_recognized:
            print(f"   ✅ User '{user_name}' recognized with confidence: {confidence:.2%}")
            print("   → Proceeding to voice verification...")
        else:
            print(f"   ❌ User '{user_name}' not recognized (confidence: {confidence:.2%})")
            print("   → ACCESS DENIED")
        
        return result
    
    def verify_voice_sample(self, audio_path: str, expected_user: str = None) -> dict:
        """
        Verify voice sample using voiceprint model.
        
        Args:
            audio_path: Path to audio file
            expected_user: Expected user name (optional)
        
        Returns:
            Dictionary with verification result
        """
        print("\n" + "="*60)
        print("STEP 2: VOICE VERIFICATION")
        print("="*60)
        print(f"🎤 Verifying voice sample: {Path(audio_path).name}")
        
        if self.voice_model is None:
            print("   ❌ Voiceprint model not loaded!")
            return {
                'is_authorized': False,
                'confidence': 0.0,
                'error': 'Model not loaded'
            }
        
        if not os.path.exists(audio_path):
            print(f"   ❌ Audio file not found: {audio_path}")
            return {
                'is_authorized': False,
                'confidence': 0.0,
                'error': 'File not found'
            }
        
        try:
            # Load and extract features from audio
            audio, sr = load_audio(audio_path, sr=SAMPLE_RATE)
            features = extract_all_features(audio, sr)
            
            # Verify using model
            verification = verify_voice(self.voice_model, features)
            
            is_authorized = verification['is_authorized']
            confidence = verification['confidence']
            
            print(f"   Voice verification result: {'✅ AUTHORIZED' if is_authorized else '❌ UNAUTHORIZED'}")
            print(f"   Confidence: {confidence:.2%}")
            print(f"   Probabilities:")
            print(f"      - Authorized: {verification['probabilities']['authorized']:.2%}")
            print(f"      - Unauthorized: {verification['probabilities']['unauthorized']:.2%}")
            
            if is_authorized:
                print("   ✅ Voice verified successfully!")
                print("   → Proceeding to product recommendation...")
            else:
                print("   ❌ Voice verification failed!")
                print("   → ACCESS DENIED")
            
            return verification
            
        except Exception as e:
            print(f"   ❌ Error during voice verification: {e}")
            return {
                'is_authorized': False,
                'confidence': 0.0,
                'error': str(e)
            }
    
    def get_product_recommendation(self, user_name: str) -> dict:
        """
        Get product recommendation for authorized user.
        
        Args:
            user_name: Name of the authorized user
        
        Returns:
            Dictionary with product recommendation
        """
        print("\n" + "="*60)
        print("STEP 3: PRODUCT RECOMMENDATION")
        print("="*60)
        print(f"🛍️  Generating product recommendation for: {user_name}")
        
        # Simulate product recommendation
        # In real implementation, this would use the product recommendation model
        # trained on merged customer data
        
        # Example products (in real implementation, these would come from the model)
        products = [
            "Premium Wireless Headphones",
            "Smart Fitness Tracker",
            "Portable Bluetooth Speaker",
            "Wireless Charging Pad",
            "Smart Home Security Camera"
        ]
        
        # Simulate recommendation based on user (in real implementation, use actual model)
        recommended_product = np.random.choice(products)
        confidence = np.random.uniform(0.75, 0.95)
        
        print(f"   ✅ Recommended Product: {recommended_product}")
        print(f"   Confidence: {confidence:.2%}")
        print(f"   User: {user_name}")
        
        return {
            'recommended_product': recommended_product,
            'confidence': confidence,
            'user': user_name
        }
    
    def simulate_full_transaction(self, user_name: str, face_image_path: str = None, 
                                 voice_audio_path: str = None):
        """
        Simulate a complete transaction flow.
        
        Args:
            user_name: Name of the user
            face_image_path: Path to face image (optional)
            voice_audio_path: Path to voice audio file (optional)
        
        Returns:
            Dictionary with complete transaction result
        """
        print("\n" + "="*70)
        print("SIMULATING FULL TRANSACTION")
        print("="*70)
        
        transaction_result = {
            'user_name': user_name,
            'face_recognition': None,
            'voice_verification': None,
            'product_recommendation': None,
            'access_granted': False
        }
        
        # Step 1: Face Recognition
        face_result = self.simulate_face_recognition(user_name, face_image_path)
        transaction_result['face_recognition'] = face_result
        
        if not face_result['is_recognized']:
            print("\n" + "="*70)
            print("❌ TRANSACTION FAILED: Face not recognized")
            print("="*70)
            return transaction_result
        
        # Step 2: Voice Verification
        if voice_audio_path is None:
            # Try to find a voice sample for this user
            voice_audio_path = self._find_user_voice_sample(user_name)
        
        if voice_audio_path is None:
            print("\n⚠️  No voice sample provided. Skipping voice verification.")
            print("   (In production, voice verification would be required)")
            voice_result = {'is_authorized': False, 'error': 'No audio file provided'}
        else:
            voice_result = self.verify_voice_sample(voice_audio_path, user_name)
        
        transaction_result['voice_verification'] = voice_result
        
        if not voice_result.get('is_authorized', False):
            print("\n" + "="*70)
            print("❌ TRANSACTION FAILED: Voice verification failed")
            print("="*70)
            return transaction_result
        
        # Step 3: Product Recommendation
        product_result = self.get_product_recommendation(user_name)
        transaction_result['product_recommendation'] = product_result
        transaction_result['access_granted'] = True
        
        print("\n" + "="*70)
        print("✅ TRANSACTION SUCCESSFUL!")
        print("="*70)
        print(f"User: {user_name}")
        print(f"Recommended Product: {product_result['recommended_product']}")
        print(f"Confidence: {product_result['confidence']:.2%}")
        print("="*70)
        
        return transaction_result
    
    def simulate_unauthorized_attempt(self, user_name: str = "UnauthorizedUser", 
                                     voice_audio_path: str = None):
        """
        Simulate an unauthorized access attempt.
        
        Args:
            user_name: Name of unauthorized user
            voice_audio_path: Path to unauthorized voice sample (optional)
        
        Returns:
            Dictionary with attempt result
        """
        print("\n" + "="*70)
        print("🚨 SIMULATING UNAUTHORIZED ACCESS ATTEMPT")
        print("="*70)
        
        attempt_result = {
            'user_name': user_name,
            'face_recognition': None,
            'voice_verification': None,
            'access_granted': False
        }
        
        # Step 1: Face Recognition (should fail)
        face_result = self.simulate_face_recognition(user_name)
        attempt_result['face_recognition'] = face_result
        
        if face_result['is_recognized']:
            print("\n⚠️  Unexpected: Face was recognized (this shouldn't happen for unauthorized user)")
            # Continue to voice verification anyway
        else:
            print("\n" + "="*70)
            print("❌ ACCESS DENIED: Face not recognized")
            print("="*70)
            return attempt_result
        
        # Step 2: Voice Verification (should also fail)
        if voice_audio_path:
            voice_result = self.verify_voice_sample(voice_audio_path, user_name)
            attempt_result['voice_verification'] = voice_result
            
            if not voice_result.get('is_authorized', False):
                print("\n" + "="*70)
                print("❌ ACCESS DENIED: Voice verification failed")
                print("="*70)
                return attempt_result
        
        # If somehow both passed (shouldn't happen), deny access anyway
        print("\n" + "="*70)
        print("❌ ACCESS DENIED: Unauthorized user detected")
        print("="*70)
        
        return attempt_result
    
    def _find_user_voice_sample(self, user_name: str) -> str:
        """Try to find a voice sample for the given user."""
        if not AUDIO_DIR.exists():
            return None
        
        # Look for audio files that might belong to this user
        audio_files = list(AUDIO_DIR.glob(f'*{user_name}*.wav')) + \
                     list(AUDIO_DIR.glob(f'*{user_name}*.mp3'))
        
        if audio_files:
            return str(audio_files[0])
        
        return None


def main():
    """Main function for command-line interface."""
    parser = argparse.ArgumentParser(
        description='Formative 2: System Simulation - Authentication and Product Recommendation'
    )
    parser.add_argument('--mode', type=str, choices=['transaction', 'unauthorized', 'voice-only'],
                       default='transaction',
                       help='Simulation mode: transaction, unauthorized, or voice-only')
    parser.add_argument('--user', type=str, default=None,
                       help='User name for simulation')
    parser.add_argument('--voice-model', type=str, default=None,
                       help='Path to voiceprint model (default: auto-detect)')
    parser.add_argument('--face-model', type=str, default=None,
                       help='Path to face recognition model (default: simulated)')
    parser.add_argument('--audio', type=str, default=None,
                       help='Path to voice audio file')
    parser.add_argument('--face-image', type=str, default=None,
                       help='Path to face image file')
    
    args = parser.parse_args()
    
    # Auto-detect voice model if not provided
    voice_model_path = args.voice_model
    if voice_model_path is None:
        # Try to find model in models directory
        model_files = list(MODEL_DIR.glob('voiceprint_model_*.pkl'))
        if model_files:
            voice_model_path = str(model_files[0])
        else:
            voice_model_path = None
    
    # Initialize system
    system = SystemSimulation(
        voice_model_path=voice_model_path,
        face_model_path=args.face_model
    )
    
    # Determine user name
    user_name = args.user
    if user_name is None:
        # Try to get from authorized users
        if system.authorized_users:
            user_name = list(system.authorized_users)[0]
            print(f"\n💡 Using first authorized user: {user_name}")
        else:
            user_name = "TestUser"
            print(f"\n⚠️  No authorized users found. Using: {user_name}")
    
    # Run simulation based on mode
    if args.mode == 'transaction':
        result = system.simulate_full_transaction(
            user_name=user_name,
            face_image_path=args.face_image,
            voice_audio_path=args.audio
        )
    elif args.mode == 'unauthorized':
        result = system.simulate_unauthorized_attempt(
            user_name=user_name or "UnauthorizedUser",
            voice_audio_path=args.audio
        )
    elif args.mode == 'voice-only':
        if args.audio:
            result = system.verify_voice_sample(args.audio, user_name)
        else:
            print("❌ Error: --audio required for voice-only mode")
            return
    else:
        print(f"❌ Unknown mode: {args.mode}")
        return
    
    print("\n✅ Simulation complete!")


if __name__ == "__main__":
    main()

