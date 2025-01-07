import hashlib
from typing import BinaryIO
import re

from unidecode import unidecode

def file_hash(f_in: BinaryIO, buffer_size=65536) -> str:
    """
    Given a file stream opened in binary mode, constructs a MD5 hash for the file
    """
    md5 = hashlib.md5()
    while True:
        data = f_in.read(buffer_size)
        if not data:
            break
        md5.update(data)
    return md5.hexdigest()

def generate_document_string(title, author, md5_hash):
    # Normalize the title
    normalized_title = unidecode(title)
    
    # Unicode title is the original title
    unicode_title = title
    
    # Format the string
    result = f"{normalized_title}_{unicode_title}_{author}_{md5_hash}"
    
    return result