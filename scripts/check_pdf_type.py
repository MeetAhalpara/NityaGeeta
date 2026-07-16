import os
import sys
import pdfplumber

def check_pdf(file_path):
    """
    Checks if a PDF has a digital text layer (Type 1) or is scanned (Type 2).
    """
    try:
        with pdfplumber.open(file_path) as pdf:
            # Check the first 3 pages (or all pages if the PDF is shorter)
            pages_to_check = min(3, len(pdf.pages))
            total_text_length = 0
            
            for i in range(pages_to_check):
                text = pdf.pages[i].extract_text()
                if text:
                    total_text_length += len(text.strip())
            
            # If we extracted meaningful text, it is digital
            if total_text_length > 100:
                return "Type 1 (Digital/Searchable Text Layer)"
            else:
                return "Type 2 (Scanned/Image-Only - Needs OCR)"
                
    except Exception as e:
        return f"Error reading file: {str(e)}"

def main():
    # Relative path directories using professional folder naming
    base_dir = "./data/raw"
    subfolders = ["gita_editions", "veducation_books"]
    
    print("=" * 80)
    print("                NITYAGEETA - PDF TYPE DETECTOR & VERIFIER")
    print(f"                Python Version: {sys.version.split()[0]}")
    print("=" * 80)
    
    found_any_files = False
    
    for subfolder in subfolders:
        folder_path = os.path.join(base_dir, subfolder)
        print(f"\n📂 Scanning: {folder_path}/")
        
        if not os.path.exists(folder_path):
            print("  Error: Folder does not exist.")
            continue
            
        files = [f for f in os.listdir(folder_path) if f.lower().endswith(".pdf")]
        
        if not files:
            print("  Info: No PDF files found in this directory. Please place files here.")
            continue
            
        found_any_files = True
        
        for file in files:
            file_path = os.path.join(folder_path, file)
            size_mb = os.path.getsize(file_path) / (1024 * 1024)
            print(f"\n  File: {file} ({size_mb:.2f} MB)")
            
            # Run the extraction check
            result = check_pdf(file_path)
            print(f"  Result: {result}")
            
    if not found_any_files:
        print("\nWarning: No PDF files detected. Please copy your PDF files into:")
        print("  - ./data/raw/gita_editions/")
        print("  - ./data/raw/veducation_books/")
        print("Then run this script again.")
        
    print("\n" + "=" * 80)

if __name__ == "__main__":
    main()
