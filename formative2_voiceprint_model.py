"""
Formative 2: Voiceprint Verification Model
Multimodal Data Preprocessing Assignment - Voiceprint Component

This script implements:
1. Voiceprint verification model training
2. Model evaluation (Accuracy, F1-Score, Loss)
3. Prediction functions for voice verification
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler
import joblib
import os
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Configuration
FEATURES_CSV = 'audio_features.csv'
MODEL_DIR = Path('models')
MODEL_DIR.mkdir(exist_ok=True)


class VoiceprintVerificationModel:
    """
    Voiceprint verification model for authenticating users based on voice features.
    """
    
    def __init__(self, model_type='random_forest', random_state=42):
        """
        Initialize the voiceprint verification model.
        
        Args:
            model_type: Type of model ('random_forest', 'logistic_regression', or 'xgboost')
            random_state: Random state for reproducibility
        """
        self.model_type = model_type
        self.random_state = random_state
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = None
        self.is_trained = False
        
        # Initialize model based on type
        if model_type == 'random_forest':
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=random_state,
                n_jobs=-1
            )
        elif model_type == 'logistic_regression':
            self.model = LogisticRegression(
                max_iter=1000,
                random_state=random_state,
                solver='lbfgs'
            )
        elif model_type == 'xgboost':
            try:
                import xgboost as xgb
                self.model = xgb.XGBClassifier(
                    random_state=random_state,
                    eval_metric='logloss'
                )
            except ImportError:
                print("⚠️  XGBoost not available. Using Random Forest instead.")
                self.model = RandomForestClassifier(
                    n_estimators=100,
                    max_depth=10,
                    random_state=random_state,
                    n_jobs=-1
                )
                self.model_type = 'random_forest'
        else:
            raise ValueError(f"Unknown model type: {model_type}")
    
    def prepare_data(self, df: pd.DataFrame, authorized_members: list = None):
        """
        Prepare data for training by creating binary labels (authorized vs unauthorized).
        
        Args:
            df: DataFrame with audio features
            authorized_members: List of authorized member names. If None, uses all members.
        
        Returns:
            Tuple of (X, y) where X is features and y is binary labels
        """
        # Use only original (non-augmented) samples for training
        df_original = df[df['augmentation'] == 'original'].copy()
        
        if authorized_members is None:
            # Use all members as authorized
            authorized_members = df_original['member_name'].unique().tolist()
        
        # Create binary labels: 1 = authorized, 0 = unauthorized
        df_original['is_authorized'] = df_original['member_name'].isin(authorized_members).astype(int)
        
        # Get feature columns (exclude metadata)
        metadata_cols = ['member_name', 'audio_file', 'phrase', 'augmentation', 
                        'augmentation_params', 'is_authorized']
        self.feature_columns = [col for col in df_original.columns if col not in metadata_cols]
        
        X = df_original[self.feature_columns].values
        y = df_original['is_authorized'].values
        
        return X, y
    
    def train(self, X_train, y_train):
        """
        Train the voiceprint verification model.
        
        Args:
            X_train: Training features
            y_train: Training labels
        """
        print(f"\n🔧 Training {self.model_type} model...")
        print(f"   Training samples: {len(X_train)}")
        print(f"   Features: {X_train.shape[1]}")
        print(f"   Authorized samples: {np.sum(y_train == 1)}")
        print(f"   Unauthorized samples: {np.sum(y_train == 0)}")
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        self.is_trained = True
        
        print("✅ Model training complete!")
    
    def predict(self, X):
        """
        Predict if voice samples are authorized.
        
        Args:
            X: Feature matrix
        
        Returns:
            Predictions (1 = authorized, 0 = unauthorized)
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction!")
        
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)
    
    def predict_proba(self, X):
        """
        Get prediction probabilities.
        
        Args:
            X: Feature matrix
        
        Returns:
            Probability array [prob_unauthorized, prob_authorized]
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction!")
        
        X_scaled = self.scaler.transform(X)
        return self.model.predict_proba(X_scaled)
    
    def evaluate(self, X_test, y_test):
        """
        Evaluate model performance.
        
        Args:
            X_test: Test features
            y_test: Test labels
        
        Returns:
            Dictionary with evaluation metrics
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before evaluation!")
        
        y_pred = self.predict(X_test)
        
        accuracy = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='weighted')
        
        # Calculate loss (using log loss for probabilities)
        y_proba = self.predict_proba(X_test)
        from sklearn.metrics import log_loss
        loss = log_loss(y_test, y_proba)
        
        metrics = {
            'accuracy': accuracy,
            'f1_score': f1,
            'loss': loss
        }
        
        return metrics, y_pred
    
    def save(self, filepath: str):
        """
        Save the trained model to disk.
        
        Args:
            filepath: Path to save the model
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before saving!")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_columns': self.feature_columns,
            'model_type': self.model_type
        }
        
        joblib.dump(model_data, filepath)
        print(f"💾 Model saved to: {filepath}")
    
    def load(self, filepath: str):
        """
        Load a trained model from disk.
        
        Args:
            filepath: Path to the saved model
        """
        model_data = joblib.load(filepath)
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_columns = model_data['feature_columns']
        self.model_type = model_data['model_type']
        self.is_trained = True
        print(f"📂 Model loaded from: {filepath}")


def train_voiceprint_model(features_csv: str = FEATURES_CSV, 
                          authorized_members: list = None,
                          model_type: str = 'random_forest',
                          test_size: float = 0.2):
    """
    Train and evaluate the voiceprint verification model.
    
    Args:
        features_csv: Path to audio features CSV file
        authorized_members: List of authorized member names
        model_type: Type of model to train
        test_size: Proportion of data to use for testing
    
    Returns:
        Trained model and evaluation metrics
    """
    print("="*60)
    print("VOICEPRINT VERIFICATION MODEL TRAINING")
    print("="*60)
    
    # Load features
    if not os.path.exists(features_csv):
        raise FileNotFoundError(f"Features file not found: {features_csv}")
    
    df = pd.read_csv(features_csv)
    print(f"\n📊 Loaded {len(df)} feature vectors from {features_csv}")
    
    # Initialize model
    model = VoiceprintVerificationModel(model_type=model_type)
    
    # Prepare data
    X, y = model.prepare_data(df, authorized_members)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42, stratify=y
    )
    
    print(f"\n📈 Data split:")
    print(f"   Training: {len(X_train)} samples")
    print(f"   Testing: {len(X_test)} samples")
    
    # Train model
    model.train(X_train, y_train)
    
    # Evaluate model
    print("\n📊 Evaluating model...")
    metrics, y_pred = model.evaluate(X_test, y_test)
    
    print("\n" + "="*60)
    print("EVALUATION RESULTS")
    print("="*60)
    print(f"Accuracy:  {metrics['accuracy']:.4f} ({metrics['accuracy']*100:.2f}%)")
    print(f"F1-Score:  {metrics['f1_score']:.4f}")
    print(f"Loss:      {metrics['loss']:.4f}")
    print("="*60)
    
    # Detailed classification report
    print("\n📋 Classification Report:")
    print(classification_report(y_test, y_pred, 
                               target_names=['Unauthorized', 'Authorized']))
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    print("\n📊 Confusion Matrix:")
    print("                  Predicted")
    print("                Unauthorized  Authorized")
    print(f"Actual Unauthorized    {cm[0,0]:4d}        {cm[0,1]:4d}")
    print(f"       Authorized      {cm[1,0]:4d}        {cm[1,1]:4d}")
    
    # Save model
    model_path = MODEL_DIR / f'voiceprint_model_{model_type}.pkl'
    model.save(str(model_path))
    
    return model, metrics


def verify_voice(model: VoiceprintVerificationModel, features: dict) -> dict:
    """
    Verify a voice sample using the trained model.
    
    Args:
        model: Trained VoiceprintVerificationModel
        features: Dictionary of audio features
    
    Returns:
        Dictionary with verification result
    """
    if not model.is_trained:
        raise ValueError("Model must be trained before verification!")
    
    # Extract features in correct order
    feature_vector = np.array([features[col] for col in model.feature_columns])
    feature_vector = feature_vector.reshape(1, -1)
    
    # Predict
    prediction = model.predict(feature_vector)[0]
    probabilities = model.predict_proba(feature_vector)[0]
    
    is_authorized = bool(prediction == 1)
    confidence = float(probabilities[1])  # Probability of being authorized
    
    return {
        'is_authorized': is_authorized,
        'confidence': confidence,
        'probabilities': {
            'unauthorized': float(probabilities[0]),
            'authorized': float(probabilities[1])
        }
    }


if __name__ == "__main__":
    # Example usage
    print("Training voiceprint verification model...")
    print("\nNote: Make sure audio_features.csv exists with extracted features.")
    print("Run formative2_audio_processing.py first to generate features.\n")
    
    try:
        # Train model (use all members as authorized for demo)
        # In real scenario, specify authorized_members list
        model, metrics = train_voiceprint_model(
            features_csv=FEATURES_CSV,
            authorized_members=None,  # Use all members as authorized
            model_type='random_forest',
            test_size=0.2
        )
        
        print("\n✅ Model training and evaluation complete!")
        print(f"   Model saved to: {MODEL_DIR / 'voiceprint_model_random_forest.pkl'}")
        
    except FileNotFoundError as e:
        print(f"\n❌ Error: {e}")
        print("\nPlease run 'formative2_audio_processing.py' first to generate audio_features.csv")

