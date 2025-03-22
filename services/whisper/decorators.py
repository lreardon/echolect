from flask import request, jsonify
from functools import wraps

def endpoint(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not authorized(request):
            return jsonify({"error": "Unauthorized"}), 401
        
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
        
        # Get the JSON data
        data = request.get_json(silent=True) or {}
        
        # Pass the JSON data to the decorated function
        return f(data, *args, **kwargs)
    
    return decorated_function

def authorized(request):
    request_headers = request.headers
    api_key = request_headers.get('x-api-key', '')

    if api_key == 'test':
        return True
    
    return False