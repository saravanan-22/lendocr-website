"""Refresh the website demo from the real LendOCR API.

Runs each SPECIMEN document through /v1/documents:extract and saves the actual responses
(trimmed) to src/data/demo.json, plus WebP previews in public/demo/. Run with the API's
environment, which has Pillow, pypdfium2 and httpx:

    LENDOCR_API_KEY=lo_... uv run --project ../lendocr python scripts/export-demo.py
"""

import json
import os
from pathlib import Path

import httpx
import pypdfium2 as pdfium
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
SPECIMENS = ROOT.parent / "lendocr" / "tests" / "fixtures" / "specimens"
API = os.environ.get("LENDOCR_API_URL", "http://localhost:8000")
KEY = os.environ["LENDOCR_API_KEY"]

SAMPLES = [
    ("pan", "PAN card", "pan_specimen.png", {}),
    ("aadhaar", "Aadhaar", "aadhaar_front_specimen.png", {}),
    ("bank_statement", "Bank statement", "bank_statement_specimen.pdf", {}),
    ("cheque", "Cheque", "cheque_specimen.png", {}),
    ("electricity_bill", "Electricity bill", "electricity_bill_specimen.png", {}),
    ("motor_insurance", "Car insurance", "car_insurance_specimen.png", {}),
    ("salary_slip", "Salary slip", "salary_slip_specimen.png", {}),
    ("itr_v", "ITR-V (password PDF)", "itr_v_protected_specimen.pdf", {"password": "abcpk1234f12041990"}),
]


def preview(src: Path, out: Path, password: str | None) -> tuple[int, int]:
    if src.suffix == ".pdf":
        pdf = pdfium.PdfDocument(src.read_bytes(), password=password)
        img = pdf[0].render(scale=1.4).to_pil().convert("RGB")
        # Crop to the printed area (plus a margin) so the preview has no empty page.
        box = ImageChops.difference(img, Image.new("RGB", img.size, "white")).getbbox()
        if box:
            m = 24
            img = img.crop((max(box[0] - m, 0), max(box[1] - m, 0),
                            min(box[2] + m, img.width), min(box[3] + m, img.height)))
        # Footers sit at the page bottom; keep the top part (header and first rows).
        img = img.crop((0, 0, img.width, min(img.height, int(img.width * 0.75))))
    else:
        img = Image.open(src).convert("RGB")
    img.thumbnail((900, 900))
    img.save(out, "WEBP", quality=82)
    return img.size


def main() -> None:
    samples = []
    for doc_type, title, file, form in SAMPLES:
        src = SPECIMENS / file
        r = httpx.post(
            f"{API}/v1/documents:extract",
            headers={"Authorization": f"Bearer {KEY}"},
            files={"file": (file, src.read_bytes())},
            data={"engine": "fast", **form},
            timeout=60,
        )
        r.raise_for_status()
        body = r.json()
        out = ROOT / "public" / "demo" / f"{doc_type}.webp"
        w, h = preview(src, out, form.get("password"))
        sample = {
            "id": doc_type,
            "title": title,
            "image": f"demo/{doc_type}.webp",
            "width": w,
            "height": h,
            "response": {
                k: body[k]
                for k in ("document_type", "fields", "checks", "needs_review", "warnings", "pages", "processing_ms")
            },
        }
        if "data" in body:
            a = body["data"]["analysis"]
            sample["response"]["data"] = {
                "analysis": {
                    "average_balance": a["average_balance"],
                    "salary": {"monthly_estimate": a["salary"]["monthly_estimate"]},
                    "emi_loan": {"monthly_average": a["emi_loan"]["monthly_average"]},
                    "bounces": {"count": a["bounces"]["count"]},
                    "balance_check": a["balance_check"],
                },
                "transactions": body["data"]["transactions"][:3],
            }
        samples.append(sample)
        print(f"{title:28} {body['document_type']:18} {body['processing_ms']:5} ms  review={body['needs_review']}")
    (ROOT / "src" / "data" / "demo.json").write_text(json.dumps(samples, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
