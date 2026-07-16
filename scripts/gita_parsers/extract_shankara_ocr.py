import os
import sys
import json
import fitz  # PyMuPDF
from google.cloud import vision
from dotenv import load_dotenv

# Load environmental variables from .env file
load_dotenv()

def perform_ocr_on_page(page_image_bytes):
    """
    Sends image bytes to Google Cloud Vision API with Sanskrit/Hindi/English hints.
    """
    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=page_image_bytes)
    
    # Configure language hints for Sanskrit (sa), Hindi (hi), and English (en)
    image_context = vision.ImageContext(language_hints=["sa", "hi", "en"])
    
    response = client.document_text_detection(image=image, image_context=image_context)
    
    if response.error.message:
        raise Exception(f"Google Cloud Vision API Error: {response.error.message}")
        
    return response.full_text_annotation.text if response.full_text_annotation else ""

def extract_pdf_with_ocr(input_path, output_path, start_page=1, end_page=None):
    """
    Renders PDF pages as images, runs OCR, and saves pages to a temporary directory 
    before merging them to avoid local OneDrive/IDE file locks.
    """
    print(f"Opening PDF: {input_path}")
    doc = fitz.open(input_path)
    total_pages = len(doc)
    
    if end_page is None:
        end_page = total_pages
        
    # Temporary directory to store page-by-page JSONs
    temp_dir = os.path.join(os.path.dirname(output_path), "temp_pages")
    os.makedirs(temp_dir, exist_ok=True)
    
    print(f"Total pages: {total_pages}. Processing range: Page {start_page} to {end_page}")

    for page_num in range(start_page, end_page + 1):
        temp_page_path = os.path.join(temp_dir, f"page_{page_num:04d}.json")
        
        # Check if we already processed this page
        if os.path.exists(temp_page_path):
            continue
            
        print(f"Processing Page {page_num}...")
        
        # Render PDF page to image (300 DPI for high OCR accuracy)
        page = doc[page_num - 1]
        zoom = 300 / 72  # 300 DPI relative to default 72 DPI
        matrix = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=matrix)
        image_bytes = pix.tobytes("png")
        
        try:
            # Run Google Cloud Vision OCR
            text = perform_ocr_on_page(image_bytes)
            
            page_data = {
                "page": page_num,
                "text": text.strip()
            }
            
            # Save single page to its own temp file
            with open(temp_page_path, "w", encoding="utf-8") as f:
                json.dump(page_data, f, ensure_ascii=False, indent=2)
            
        except Exception as e:
            print(f"  Stopped on page {page_num}: {str(e)}")
            print("  Progress has been saved in the temp folder.")
            break

    # Merge all page JSONs into the final output file
    print("\nMerging temp page files into final output...")
    merged_data = []
    
    # Sort files numerically
    temp_files = sorted([f for f in os.listdir(temp_dir) if f.startswith("page_") and f.endswith(".json")])
    
    for temp_file in temp_files:
        temp_file_path = os.path.join(temp_dir, temp_file)
        try:
            with open(temp_file_path, "r", encoding="utf-8") as f:
                page_content = json.load(f)
                merged_data.append(page_content)
        except Exception as e:
            print(f"Warning: Failed to read {temp_file}: {str(e)}")

    try:
        # Save merged array
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(merged_data, f, ensure_ascii=False, indent=2)
        print(f"OCR Extraction Complete! Output saved to: {output_path}")
        print(f"Total merged pages: {len(merged_data)}")
    except Exception as e:
        print(f"Error saving merged file: {str(e)}")

def main():
    input_file = "./data/raw/gita_editions/Bhagavad Gita with the Commentary of Adi Shankaracharya.pdf"
    output_file = "./data/output/shankara_commentary_ocr.json"

    print("=" * 80)
    print("                NITYAGEETA - GOOGLE VISION OCR EXTRACTOR")
    print(f"                Python Version: {sys.version.split()[0]}")
    print("=" * 80)

    # Verify GCP credentials are set
    if "GOOGLE_APPLICATION_CREDENTIALS" not in os.environ:
        print("Warning: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.")
        print("Please configure your GCP service account credentials to run this OCR script.")
        print("You can set it in your terminal or .env file.")

    if not os.path.exists(input_file):
        print(f"Error: Target PDF file not found at '{input_file}'")
        sys.exit(1)

    # Run OCR on the entire book (all pages)
    extract_pdf_with_ocr(input_file, output_file, start_page=1, end_page=None)
    print("=" * 80)

if __name__ == "__main__":
    main()
