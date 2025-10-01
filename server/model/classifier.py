import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import os
import pytesseract
from transformers import pipeline

# ✅ Class index mapping (RVL-CDIP)
class_map = {
    0: "Advertisement", 1: "Budget", 2: "Email", 3: "File Folder", 4: "Form",
    5: "Handwritten", 6: "Invoice", 7: "Letter", 8: "Memo", 9: "News Article",
    10: "Presentation", 11: "Questionnaire", 12: "Resume", 13: "Scientific Publication",
    14: "Scientific Report", 15: "Specification"
}

# ✅ Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

# ✅ Load model
def load_model(model_path):
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    model.fc = nn.Linear(model.fc.in_features, 16)
    model.load_state_dict(torch.load(model_path, map_location="cpu"))
    model.eval()
    return model

# ✅ Predict document type
def predict_image(model, image_path):
    image = Image.open(image_path).convert("RGB")
    input_tensor = transform(image).unsqueeze(0)
    with torch.no_grad():
        output = model(input_tensor)
        predicted_idx = output.argmax(1).item()
        confidence = torch.softmax(output, dim=1)[0][predicted_idx].item()
    return class_map[predicted_idx], confidence

# ✅ OCR extraction
def extract_text(image_path):
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    image = Image.open(image_path).convert("L")
    return pytesseract.image_to_string(image).strip()

# ✅ Summarization
def summarize_text(text):
    if len(text) < 50:
        return "Text too short to summarize."
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    return summarizer(text, max_length=100, min_length=30, do_sample=False)[0]['summary_text']

# ✅ LLM-based classification
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

def classify_with_llm(text):
    candidate_labels = list(class_map.values())
    result = classifier(text, candidate_labels)
    return result['labels'][0], result['scores'][0]
# llm mistral calling and getting the response
def classify_with_mistral(text):
    import requests
    import json

    prompt = f"""
You are a document classification expert. Your task is to classify the following OCR-extracted document text into one of the following types:

- Resume: Contains sections like 'Summary', 'Work Experience', 'Education', 'Skills', and personal contact info.
- Memo: Internal communication with 'To:', 'From:', 'Subject:', and a date.
- Letter: Formal communication with greetings like 'Dear', and closing like 'Sincerely'.
- Specification: Technical document listing product specs, parameters, or test instructions.

Return a JSON object with:
- "document_type": one of the four labels above
- "confidence": a float between 0 and 1
- "reasoning": a short explanation of why you chose this label

Document Text:
{text}
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",  # Ollama or vLLM endpoint
            json={"model": "mistral", "prompt": prompt, "stream": False}
        )
        if response.status_code == 200:
            return json.loads(response.json()["response"])
    except Exception:
        return None



# ✅ Heuristic detectors
def heuristic_detect(text):
    text_lower = text.lower()
    heuristics = {
        "Resume": ["work experience", "education", "skills", "certifications", "linkedin"],
        "Invoice": ["invoice", "amount due", "total", "bill to", "payment terms"],
        "Memo": ["interoffice memo", "subject:", "to:", "from:", "date:"],
        "Email": ["subject:", "to:", "from:", "sent:", "cc:"],
        "Letter": ["dear", "sincerely", "regards", "to whom it may concern"],
        "Form": ["fill out", "checkbox", "signature", "date", "form number"],
        "Questionnaire": ["survey", "question", "response", "rate", "agree"],
        "Budget": ["budget", "fiscal year", "allocation", "expenditure", "forecast"],
        "Presentation": ["slide", "agenda", "overview", "bullet points", "presentation"],
        "News Article": ["byline", "headline", "reporter", "press", "breaking news"],
        "Scientific Publication": ["abstract", "methodology", "results", "references", "doi"],
        "Scientific Report": ["experiment", "data", "analysis", "conclusion", "report"],
        "Specification": ["specification", "requirements", "parameters", "dimensions", "test"],
        "Advertisement": ["sale", "discount", "offer", "limited time", "buy now"],
        "File Folder": ["folder", "contents", "index", "file list", "archive"],
        "Handwritten": ["handwritten", "pen", "ink", "cursive", "scribble"]
    }

    for label, keywords in heuristics.items():
        if sum(kw in text_lower for kw in keywords) >= 3:
            return label, 0.95
    return None, None
