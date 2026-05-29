import hashlib
import hmac
import os

# PBKDF2 from the standard library: salted and iterated, so identical passwords
# produce different hashes and brute-forcing is expensive. No external deps.
_ALGORITHM = "sha256"
_ITERATIONS = 200_000
_SALT_BYTES = 16


def hash_password(password: str) -> str:
    """Return a self-describing hash: ``pbkdf2_<algo>$<iterations>$<salt>$<hash>``.

    Storing the parameters alongside the hash lets us verify later (and raise
    the iteration count over time) without a schema change.
    """
    salt = os.urandom(_SALT_BYTES)
    derived = hashlib.pbkdf2_hmac(_ALGORITHM, password.encode(), salt, _ITERATIONS)
    return f"pbkdf2_{_ALGORITHM}${_ITERATIONS}${salt.hex()}${derived.hex()}"


def verify_password(password: str, stored: str) -> bool:
    """Check a plaintext password against a stored hash in constant time."""
    try:
        algorithm_label, iterations_str, salt_hex, hash_hex = stored.split("$")
        algorithm = algorithm_label.removeprefix("pbkdf2_")
        iterations = int(iterations_str)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(hash_hex)
    except (ValueError, AttributeError):
        return False

    derived = hashlib.pbkdf2_hmac(algorithm, password.encode(), salt, iterations)
    return hmac.compare_digest(derived, expected)
