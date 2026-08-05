def safe_print(text):
    """Prints text with UTF-8 encoding, ignoring unsupported characters."""
    try:
        print(text, flush=True)
    except UnicodeEncodeError:
        print(text.encode("utf-8", "ignore").decode("utf-8"))
    except Exception as e:
        print("Error in safe_print: {e}")
