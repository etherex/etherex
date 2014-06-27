# Utils from the original Python serpent project before it got moved to cpp
# https://github.com/ethereum/serpent/blob/develop/serpent/compiler.py

def encode_datalist(vals):
    def enc(n):
        if is_numeric(n):
            return ''.join(map(chr, tobytearr(n, 32)))
        elif is_string(n) and len(n) == 40:
            return '\x00' * 12 + n.decode('hex')
        elif is_string(n):
            return '\x00' * (32 - len(n)) + n
        elif n is True:
            return 1
        elif n is False or n is None:
            return 0
    if isinstance(vals, (tuple, list)):
        return ''.join(map(enc, vals))
    elif vals == '':
        return ''
    else:
        # Assume you're getting in numbers or 0x...
        return ''.join(map(enc, map(numberize, vals.split(' '))))

def decode_datalist(arr):
    if isinstance(arr, list):
        arr = ''.join(map(chr, arr))
    o = []
    for i in range(0, len(arr), 32):
        o.append(frombytes(arr[i:i + 32]))
    return o

is_numeric = lambda x: isinstance(x, (int, long))
is_string = lambda x: isinstance(x, (str, unicode))

def frombytes(b):
    return 0 if len(b) == 0 else ord(b[-1]) + 256 * frombytes(b[:-1])

def tobytearr(n, L):
    return [] if L == 0 else tobytearr(n / 256, L - 1) + [n % 256]

def numberize(b):
    if is_numeric(b):
        return b
    elif b[0] in ["'", '"']:
        return frombytes(b[1:-1])
    elif b[:2] == '0x':
        return fromhex(b[2:])
    else:
        return int(b)
