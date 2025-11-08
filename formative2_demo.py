"""
Formative 2: Quick Demo Script
Demonstrates the complete audio processing and voiceprint verification workflow.
"""

import os
from pathlib import Path
from formative2_audio_processing import process_audio_samples, save_features_to_csv
from formative2_voiceprint_model import train_voiceprint_model
from formative2_system_simulation import SystemSimulation

def demo_workflow():
    """
    Demonstrates the complete workflow for the audio assignment.
    """
    print("="*70)
    print("FORMATIVE 2: AUDIO PROCESSING DEMO")
    print("="*70)
    
    # Step 1: Process audio samples
    print("\n📝 STEP 1: Processing Audio Samples")
    print("-"*70)
    
    # Example team members - UPDATE THIS WITH YOUR ACTUAL DATA
    team_members = {
        # Example format:
        # 'Member1': {
        #     'audio_files': [
        #         'audio_samples/member1_yes_approve.wav',
        #         'audio_samples/member1_confirm_transaction.wav'
        #     ],
        #     'phrases': ['Yes, approve', 'Confirm transaction']
        # },
    }
    
    if not team_members:
        print("\n⚠️  No team members configured.")
        print("Please update the 'team_members' dictionary in this script")
        print("with your actual audio file paths.")
        print("\nExample:")
        print("""
team_members = {
    'Member1': {
        'audio_files': [
            'audio_samples/member1_yes_approve.wav',
            'audio_samples/member1_confirm_transaction.wav'
        ],
        'phrases': ['Yes, approve', 'Confirm transaction']
    }
}
        """)
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
    
    # Save features
    if all_features:
        save_features_to_csv(all_features)
        print("\n✅ Step 1 Complete: Features extracted and saved!")
    else:
        print("\n❌ Step 1 Failed: No features extracted")
        return
    
    # Step 2: Train voiceprint model
    print("\n\n🤖 STEP 2: Training Voiceprint Verification Model")
    print("-"*70)
    
    try:
        model, metrics = train_voiceprint_model(
            features_csv='audio_features.csv',
            authorized_members=None,  # Use all members as authorized
            model_type='random_forest',
            test_size=0.2
        )
        print("\n✅ Step 2 Complete: Model trained and evaluated!")
    except Exception as e:
        print(f"\n❌ Step 2 Failed: {e}")
        return
    
    # Step 3: System simulation
    print("\n\n🎮 STEP 3: System Simulation")
    print("-"*70)
    
    # Initialize system
    model_path = 'models/voiceprint_model_random_forest.pkl'
    if not os.path.exists(model_path):
        print(f"❌ Model file not found: {model_path}")
        return
    
    system = SystemSimulation(voice_model_path=model_path)
    
    # Simulate authorized transaction
    if team_members:
        first_member = list(team_members.keys())[0]
        first_audio = team_members[first_member]['audio_files'][0]
        
        if os.path.exists(first_audio):
            print(f"\n📋 Simulating authorized transaction for: {first_member}")
            result = system.simulate_full_transaction(
                user_name=first_member,
                voice_audio_path=first_audio
            )
            
            if result['access_granted']:
                print("\n✅ Step 3 Complete: Authorized transaction successful!")
            else:
                print("\n⚠️  Step 3: Transaction failed (this may be expected if model needs tuning)")
        else:
            print(f"⚠️  Audio file not found: {first_audio}")
            print("   Skipping transaction simulation")
    
    # Simulate unauthorized attempt
    print(f"\n📋 Simulating unauthorized access attempt...")
    unauthorized_result = system.simulate_unauthorized_attempt(
        user_name="UnauthorizedUser"
    )
    
    if not unauthorized_result['access_granted']:
        print("\n✅ Step 3 Complete: Unauthorized access correctly denied!")
    
    print("\n" + "="*70)
    print("DEMO COMPLETE!")
    print("="*70)
    print("\nNext steps:")
    print("1. Review generated visualizations in audio_visualizations/")
    print("2. Check audio_features.csv for extracted features")
    print("3. Review model evaluation metrics")
    print("4. Run full system simulation with: python formative2_system_simulation.py")


if __name__ == "__main__":
    demo_workflow()

