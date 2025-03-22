import requests
import os

def download_file(url, save_path=None):
    """
    Download a file from a URL
    
    Args:
        url (str): URL of the file to download
        save_path (str, optional): Path where the file should be saved.
            If not provided, filename from URL will be used in current directory.
    
    Returns:
        str: Path to the downloaded file
    """
    # Make the HTTP request with stream=True to download in chunks
    response = requests.get(url, stream=True)
    response.raise_for_status()  # Raise an exception for HTTP errors
    
    # If save_path is not provided, use the filename from the URL
    if save_path is None:
        filename = url.split('/')[-1]
        save_path = os.path.join(os.getcwd(), filename)
    
    # Save the file
    with open(save_path, 'wb') as file:
        for chunk in response.iter_content(chunk_size=8192):
            file.write(chunk)
    
    return save_path