import os
import sys
import json
import time
import fitz  # PyMuPDF
from google.cloud import vision
from dotenv import load_dotenv

# Load environmental variables from .env file
load_dotenv()

def perform_ocr_with_retry(page_image_bytes, max_retries=3, delay_seconds=2):
    """
    Sends image bytes to Google Cloud Vision API with automatic retries on temporary failures.
    """
    client = vision.ImageAnnotatorClient()
    image = vision.Image(content=page_image_bytes)
    image_context = vision.ImageContext(language_hints=["sa", "hi", "en"])
    
    for attempt in range(1, max_retries + 1):
        try:
            response = client.document_text_detection(image=image, image_context=image_context)
            if response.error.message:
                raise Exception(response.error.message)
            return response.full_text_annotation.text if response.full_text_annotation else ""
        except Exception as e:
            print(f"    API Attempt {attempt}/{max_retries} failed: {str(e)}")
            if attempt == max_retries:
                raise e
            time.sleep(delay_seconds * attempt)  # Exponential backoff

def extract_sargeant(input_path, output_path, start_page=1, end_page=None):
    """
    Performs OCR on Winthrop Sargeant PDF page-by-page, storing progress in memory,
    and writing to a single JSON file. Resumes automatically if output exists.
    """
    print(f"Opening PDF: {input_path}")
    doc = fitz.open(input_path)
    total_pages = len(doc)
    
    if end_page is None:
        end_page = total_pages
        
    print(f"Total pages: {total_pages}. Processing range: Page {start_page} to {end_page}")
    
    # Load existing progress if available to resume
    extracted_data = []
    processed_pages = set()
    
    if os.path.exists(output_path):
        try:
            with open(output_path, "r", encoding="utf-8") as f:
                extracted_data = json.load(f)
                processed_pages = {item["page"] for item in extracted_data}
                print(f"Resuming scan. Found {len(processed_pages)} pages already processed in: {output_path}")
        except Exception as e:
            print(f"Could not parse existing output file, starting fresh. Details: {str(e)}")
            extracted_data = []

    # Process pages
    for page_num in range(start_page, end_page + 1):
        if page_num in processed_pages:
            continue
            
        print(f"Processing Page {page_num}...")
        
        # Render page to image
        page = doc[page_num - 1]
        zoom = 300 / 72
        matrix = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=matrix)
        image_bytes = pix.tobytes("png")
        
        try:
            # Perform robust OCR
            text = perform_ocr_with_retry(image_bytes)
            
            extracted_data.append({
                "page": page_num,
                "text": text.strip()
            })
            
            # Periodically write the single backup file to disk every 10 pages
            if page_num % 10 == 0:
                with open(output_path, "w", encoding="utf-8") as f:
                    json.dump(extracted_data, f, ensure_ascii=False, indent=2)
                    
        except Exception as e:
            print(f"  Error on page {page_num}: {str(e)}")
            print("  Progress saved up to the last successful page.")
            break
            
    # Save the final complete JSON file at the end
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(extracted_data, f, ensure_ascii=False, indent=2)
        print(f"\nOCR Extraction Complete! Output saved to: {output_path}")
        print(f"Total processed pages stored in single file: {len(extracted_data)}")
    except Exception as e:
        print(f"Error saving final output file: {str(e)}")

def main():
    input_file = "./data/raw/gita_editions/The Bhagavad Gita Winthrop Sargeant (Word-for-Word English).pdf"
    output_file = "./data/output/sargeant_ocr.json"

    print("=" * 80)
    print("                NITYAGEETA - WINTHROP SARGEANT OCR EXTRACTOR")
    print(f"                Python Version: {sys.version.split()[0]}")
    print("=" * 80)

    if "GOOGLE_APPLICATION_CREDENTIALS" not in os.environ:
        print("Error: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.")
        print("Please configure your GCP service account credentials in your .env file.")
        sys.exit(1)

    if not os.path.exists(input_file):
        print(f"Error: Target PDF file not found at '{input_file}'")
        sys.exit(1)

    extract_sargeant(input_file, output_file, start_page=1, end_page=None)
    print("=" * 80)

if __name__ == "__main__":
    main()
