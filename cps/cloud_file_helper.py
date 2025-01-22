from io import BytesIO
import os
from . import constants
import gcsfs

def upload_from_filename(local_file_path, destination_path):
    # Initialize the GCSFileSystem
    bucket_name = constants.GCS_BUCKET_NAME
    fs = gcsfs.GCSFileSystem()

    # Define the full path for the destination in GCS
    destination_full_path = f"{bucket_name}/{os.getenv('GCS_STORAGE_PREFIX') + destination_path}"
    try:
        # Upload the local file to GCS
        progress = 0
        with open(local_file_path, 'rb') as local_file:
            with fs.open(destination_full_path, 'wb') as gcs_file:
                while chunk := local_file.read(1024*1024):  # Read in 8KB chunks
                    progress += 1
                    print(progress, len(chunk), "uploaded")
                    gcs_file.write(chunk)

        print(f"File {local_file_path} uploaded to {os.getenv('GCS_STORAGE_PREFIX') + destination_full_path}")

        # Optionally, delete the local file after successful upload
        os.remove(local_file_path)
        print(f"Local file {local_file_path} has been deleted.")
    except Exception as e:
        print(f"An error occurred: {e}")
        return False, f"An error occurred: {e}"
    return True, None


def upload_from_file(file_source, destination_path):
    """
    Uploads data to Google Cloud Storage from a file-like object or a local file path.

    :param bucket_name: The name of the GCS bucket.
    :param destination_path: The destination path in the GCS bucket.
    :param file_source: A file-like object or a local file path.
    """
    # Initialize the GCSFileSystem
    fs = gcsfs.GCSFileSystem()

    # Define the full path for the destination in GCS
    destination_full_path = f"{constants.GCS_BUCKET_NAME}/{os.getenv('GCS_STORAGE_PREFIX') + destination_path}"
    try:
        # Determine if the source is a file-like object or a file path
        msg = ""
        if hasattr(file_source, 'read'):
            # If it's a file-like object, use it directly
            with fs.open(destination_full_path, 'wb') as gcs_file:
                msg += "1 "
                gcs_file.write(file_source.read())
            msg += "2 "
        else:
            # If it's a file path, open the file and upload its contents
            with open(file_source, 'rb') as local_file:
                msg += f"2{file_source} "
                with fs.open(destination_full_path, 'wb') as gcs_file:
                    gcs_file.write(local_file.read())
                msg += f"3 "

        print(f"Data uploaded to {destination_full_path}")
    except Exception as e:
        print(f"An error occurred: {e}")
        return False, f"An error occurred: {msg , e}"
    return True, None

def rename(old_file_path, new_file_path):
    # Initialize the GCSFileSystem
    fs = gcsfs.GCSFileSystem()

    # Define the full paths for the old and new file locations
    old_full_path = f"{constants.GCS_BUCKET_NAME}/{os.getenv('GCS_STORAGE_PREFIX') + old_file_path}"
    new_full_path = f"{constants.GCS_BUCKET_NAME}/{os.getenv('GCS_STORAGE_PREFIX') + new_file_path}"
    try:
        # Copy the file to the new location
        fs.copy(old_full_path, new_full_path)
        print(f"Copied {os.getenv('GCS_STORAGE_PREFIX') + old_file_path} to {os.getenv('GCS_STORAGE_PREFIX') + new_file_path}")

        # Delete the original file
        fs.rm(old_full_path)
        print(f"Deleted original file {os.getenv('GCS_STORAGE_PREFIX') + old_file_path}")
    except Exception as e:
        print(f"An error occurred: {e}")
        return False
    return True

def delete(file_path):    
    fs = gcsfs.GCSFileSystem()

    # Define the full path for the file in GCS
    full_path = f"{constants.GCS_BUCKET_NAME}/{os.getenv('GCS_STORAGE_PREFIX') + file_path}"

    try:
        # Delete the file
        fs.rm(full_path)
        print(f"Deleted file {os.getenv('GCS_STORAGE_PREFIX') + full_path}")

    except Exception as e:
        print(f"An error occurred: {e}")
        return False
    return True

def download(gcs_file_path, local_file_path):
    # Initialize the GCSFileSystem
    fs = gcsfs.GCSFileSystem()

    # Define the full path for the file in GCS
    full_path = f"{constants.GCS_BUCKET_NAME}/{os.getenv('GCS_STORAGE_PREFIX') + gcs_file_path}"

    try:
        # Open the file in GCS and read its contents
        with fs.open(full_path, 'rb') as gcs_file:
            # Write the contents to a local file
            with open(local_file_path, 'wb') as local_file:
                local_file.write(gcs_file.read())

        print(f"Downloaded {os.getenv('GCS_STORAGE_PREFIX') + gcs_file_path} to {local_file_path}")

    except Exception as e:
        print(f"An error occurred: {e}")
        return False
    return True

def move(old_file_path, new_file_path):
    return rename(old_file_path, new_file_path)

def read_as_bytes(gcs_file_path):
    fs = gcsfs.GCSFileSystem()

    # Define the full path for the file in GCS
    full_path = f"{constants.GCS_BUCKET_NAME}/{os.getenv('GCS_STORAGE_PREFIX') + gcs_file_path}"

    try:
        # Open the file in GCS and read its contents as bytes
        with fs.open(full_path, 'rb') as gcs_file:
            file_bytes = gcs_file.read()
            print(f"Downloaded {os.getenv('GCS_STORAGE_PREFIX') + gcs_file_path} as bytes")
            return file_bytes

    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def download_to_memory(src_name):
    return BytesIO(read_as_bytes(src_name))

def delete_folder(folder_prefix):
     # Initialize the GCSFileSystem
    fs = gcsfs.GCSFileSystem()

    # Define the full path for the folder in GCS
    full_prefix = f"{constants.GCS_BUCKET_NAME}/{os.getenv('GCS_STORAGE_PREFIX') + folder_prefix}"

    try:
        # List all objects with the given prefix
        files = fs.find(full_prefix)

        # Delete each file
        for file in files:
            fs.rm(file)
            print(f"Deleted {file}")

        print(f"All files under {os.getenv('GCS_STORAGE_PREFIX') + folder_prefix} have been deleted.")

    except Exception as e:
        print(f"An error occurred: {e}")
        return False
    return True

def file_size(file_path):
    # Initialize the GCSFileSystem
    fs = gcsfs.GCSFileSystem()

    # Define the full path for the file in GCS
    full_path = f"{constants.GCS_BUCKET_NAME}/{os.getenv('GCS_STORAGE_PREFIX') + file_path}"

    try:
        # Get the file info
        file_info = fs.info(full_path)

        # Extract the file size from the metadata
        file_size = file_info['size']
        print(f"Size of {os.getenv('GCS_STORAGE_PREFIX') + file_path}: {file_size} bytes")

    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    return True

def rename_folder(old_prefix, new_prefix):
    # Initialize the GCSFileSystem
    fs = gcsfs.GCSFileSystem()

    # Define the full paths for the old and new prefixes
    old_full_prefix = f"{constants.GCS_BUCKET_NAME}/{os.getenv('GCS_STORAGE_PREFIX') + old_prefix}"
    new_full_prefix = f"{constants.GCS_BUCKET_NAME}/{os.getenv('GCS_STORAGE_PREFIX') + new_prefix}"

    try:
        # List all objects with the old prefix
        files = fs.find(old_full_prefix)

        # Iterate over each file and rename it
        for old_file in files:
            # Determine the new file path
            new_file = old_file.replace(old_full_prefix, new_full_prefix, 1)
            
            # Copy the file to the new location
            fs.copy(old_file, new_file)
            print(f"Copied {os.getenv('GCS_STORAGE_PREFIX') + old_file} to {os.getenv('GCS_STORAGE_PREFIX') + new_file}")

            # Delete the original file
            fs.rm(old_file)
            print(f"Deleted original file {os.getenv('GCS_STORAGE_PREFIX') + old_file}")

        print(f"All files under {os.getenv('GCS_STORAGE_PREFIX') + old_prefix} have been renamed to {os.getenv('GCS_STORAGE_PREFIX') + new_prefix}.")

    except Exception as e:
        print(f"An error occurred: {e}")
        return False
    return True


# add for ebook cover extract

import fitz
def pdf_first_page_to_image(pdf_path, output_image_path):
    # Open the PDF file
    try:
        pdf_document = fitz.open(pdf_path)

        # Check if the PDF has at least one page
        if pdf_document.page_count < 1:
            print("The PDF file is empty.")
            return

        # Select the first page
        page = pdf_document[0]

        # Render the page to a pixmap (image)
        pix = page.get_pixmap()

        # Save the image to a file
        pix.save(output_image_path)
        print(f"First page saved as {output_image_path}")
    except Exception as e:
        print(f"\npdf_first_page_to_image An error occurred: {e}\n")
        return False
    return True
import langcodes

def get_language_code(language_name):
    language = langcodes.find(language_name)
    if language:
        return language.language
    else:
        return None
    
import os
import PyPDF2
import docx
from ebooklib import epub
from bs4 import BeautifulSoup
from langdetect import detect

def extract_text(file_path, target):
    _, file_extension = os.path.splitext(target)
    file_extension = file_extension.lower()
    if file_extension == '.pdf':
        return extract_text_from_pdf(file_path)
    elif file_extension == '.epub':
        return extract_text_from_epub(file_path)
    elif file_extension in ['.doc', '.docx']:
        return extract_text_from_docx(file_path)
    else:
        return ("Unsupported file type")

def extract_text_from_pdf(file_path):
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ''
        for page in reader.pages:
            text += page.extract_text()
    return text

def extract_text_from_epub(file_path):
    book = epub.read_epub(file_path)
    text = ''
    for item in book.get_items():
        if item.get_type() == epub.EpubHtml:
            soup = BeautifulSoup(item.get_body_content(), 'html.parser')
            text += soup.get_text()
    return text

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    text = ''
    for para in doc.paragraphs:
        text += para.text
    return text

def detect_language_from_file(file_path, target):
    text = extract_text(file_path, target)
    try:
        language = detect(text)
    except:
        language = "Unknown"
    return language
