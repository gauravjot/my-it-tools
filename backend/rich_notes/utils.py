import json
from django_axor_auth.security.encryption import encrypt, decrypt


# define Python user-defined exceptions
class InvalidKeyException(Exception):
    """The note cannot be decrypted."""
    pass


def encrypt_note(note):
    return encrypt(json.dumps(note))


def decrypt_note(note):
    try:
        return decrypt(note)
    except:
        raise InvalidKeyException
