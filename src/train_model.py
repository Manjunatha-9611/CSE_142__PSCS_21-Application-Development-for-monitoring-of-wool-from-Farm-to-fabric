import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import os

DATA_CSV = os.path.join('src', 'data', 'textual wool dataset.csv')

df = pd.read_csv(DATA_CSV)

# Map categorical features to codes for model training
for col in ['Crimp Characteristics', 'Strength', 'Elasticity', 'Fineness', 'Wool Type']:
    df[col+"_cat"] = df[col].astype('category').cat.codes

# Create Indian Grade labels based on micron values
def micron_to_indian_grade(micron):
    if micron < 25:
        return "Super A"
    elif micron <= 34.4:
        return "A"
    elif micron <= 37.4:
        return "B"
    elif micron <= 40.4:
        return "C"
    else:
        return "D"

df["indian_grade"] = df["Fiber Diameter (Microns)"].apply(micron_to_indian_grade)

# Define features for both models
features = [
    'Fiber Diameter (Microns)', 
    'Fiber Length (mm)', 
    'Crimp Characteristics_cat', 
    'Strength_cat', 
    'Elasticity_cat', 
    'Fineness_cat'
]

X = df[features]

# Split data once for both models
X_train, X_test = train_test_split(X, test_size=0.2, random_state=42)

print("="*60)
print("Training Dual Wool Quality Models")
print("="*60)

# ========== MODEL 1: Wool Type Classification ==========
print("\n[1/2] Training Wool Type Model...")
y_wool_type = df['Wool Type']
y_wool_train, y_wool_test = train_test_split(y_wool_type, test_size=0.2, random_state=42)

wool_type_model = RandomForestClassifier(n_estimators=100, random_state=42)
wool_type_model.fit(X_train, y_wool_train)

wool_type_accuracy = wool_type_model.score(X_test, y_wool_test)
print(f"✓ Wool Type Model - Validation Accuracy: {wool_type_accuracy:.4f} ({wool_type_accuracy*100:.2f}%)")

joblib.dump(wool_type_model, "wool_type_model.pkl")
print("✓ Saved: wool_type_model.pkl")

# ========== MODEL 2: Indian Grade Classification ==========
print("\n[2/2] Training Indian Grade Model...")
y_indian_grade = df['indian_grade']
y_indian_train, y_indian_test = train_test_split(y_indian_grade, test_size=0.2, random_state=42)

indian_grade_model = RandomForestClassifier(n_estimators=100, random_state=42)
indian_grade_model.fit(X_train, y_indian_train)

indian_grade_accuracy = indian_grade_model.score(X_test, y_indian_test)
print(f"✓ Indian Grade Model - Validation Accuracy: {indian_grade_accuracy:.4f} ({indian_grade_accuracy*100:.2f}%)")

joblib.dump(indian_grade_model, "indian_grade_model.pkl")
print("✓ Saved: indian_grade_model.pkl")

# ========== Save Category Mappings ==========
print("\n[3/3] Saving category mappings...")
cat_maps = {}
for col in ['Crimp Characteristics', 'Strength', 'Elasticity', 'Fineness']:
    cat_maps[col] = dict(enumerate(df[col].astype('category').cat.categories))

# Also save Wool Type categories for reference
cat_maps['Wool Type'] = dict(enumerate(df['Wool Type'].astype('category').cat.categories))

joblib.dump(cat_maps, "category_maps.pkl")
print("✓ Saved: category_maps.pkl")

print("\n" + "="*60)
print("Training Complete!")
print("="*60)
print(f"\nModels created:")
print(f"  1. wool_type_model.pkl (Accuracy: {wool_type_accuracy*100:.2f}%)")
print(f"  2. indian_grade_model.pkl (Accuracy: {indian_grade_accuracy*100:.2f}%)")
print(f"  3. category_maps.pkl")
print("\nYou can now use these models for predictions via the FastAPI server.")
