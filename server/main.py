from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import concurrent.futures
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
from model.classifier import (
    load_model,
    predict_image,
    extract_text,
    summarize_text,
    classify_with_llm,
    heuristic_detect,
    classify_with_mistral  # ✅ Mistral override logic
)

app = FastAPI()

# ✅ Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load model once
# Try to get model path from environment, fallback to relative path
MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(os.path.dirname(__file__), "model", "resnet18_rvlcdip_final_fully_finetuned.pth"))

# If model file doesn't exist at relative path, try the original absolute path
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = "C:/Users/VICTUS 15/Desktop/Doc_Classifier/Finetuned/resnet18_rvlcdip_final_fully_finetuned.pth"
    print(f"WARNING: Using fallback model path: {MODEL_PATH}")
else:
    print(f"SUCCESS: Using model path: {MODEL_PATH}")

model = load_model(MODEL_PATH)

# ✅ Safe timeout wrapper
def safe_run_with_timeout(fn, *args, timeout=20):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(fn, *args)
        try:
            return future.result(timeout=timeout)
        except concurrent.futures.TimeoutError:
            return None
        except Exception:
            return None

@app.post("/classify")
async def classify(file: UploadFile = File(...)):
    try:
        # ✅ Save uploaded file temporarily
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        # ✅ Phase 1: CNN prediction
        cnn_label, cnn_confidence = predict_image(model, temp_path)

        # ✅ Phase 2: OCR extraction
        text = extract_text(temp_path)
        text_for_llm = text[:2000]  # ✅ Truncate only for LLM

        # ✅ Phase 3: Resume-friendly summarization
        summary = safe_run_with_timeout(summarize_text, text, timeout=20)
        if summary is None:
            summary = "Summarization failed or timed out."

        # ✅ Initialize final label and confidence
        label = cnn_label
        confidence = cnn_confidence
        override_reason = "CNN prediction"
        disagreement = False

        # ✅ Phase 4: Override logic
        sensitive_labels = ["Resume", "Specification", "Memo", "Letter"]

        if len(text) > 50:
            heuristic_label, heuristic_conf = heuristic_detect(text)

            # ✅ Heuristic override allowed if:
            # - CNN confidence is low
            # - OR CNN label is sensitive
            if heuristic_label and heuristic_label != cnn_label:
                if cnn_label in sensitive_labels or cnn_confidence < 0.85:
                    label = heuristic_label
                    confidence = heuristic_conf
                    override_reason = "Heuristic override"
                    disagreement = True

            # ✅ Mistral override only for sensitive labels
            elif cnn_label in sensitive_labels:
                mistral_result = safe_run_with_timeout(classify_with_mistral, text_for_llm, timeout=20)
                if mistral_result:
                    mistral_label = mistral_result.get("document_type")
                    mistral_conf = mistral_result.get("confidence", 0.90)
                    if mistral_label and mistral_label != cnn_label:
                        label = mistral_label
                        confidence = mistral_conf
                        override_reason = "Mistral override"
                        disagreement = True

            # ✅ Fallback resume detection
            if label == cnn_label and "work experience" in text.lower() and "education" in text.lower():
                label = "Resume"
                confidence = 0.95
                override_reason = "Fallback resume detection"
                disagreement = (label != cnn_label)

        # ✅ Clean up temp file
        os.remove(temp_path)

        # ✅ Final response
        return JSONResponse({
            "label": label,
            "confidence": f"{confidence:.2f}",
            "text": text,
            "summary": summary,
            "override_reason": override_reason,
            "disagreement": disagreement
        })

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
