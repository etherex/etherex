import pyext
import sys

VERSION = '1.5.4'


class Metadata(object):
    def __init__(self, li):
        self.file = li[0]
        self.ln = li[1]
        self.ch = li[2]

    def out(self):
        return [self.file, self.ln, self.ch]


class Token(object):
    def __init__(self, val, metadata):
        self.val = val
        self.metadata = Metadata(metadata)

    def out(self):
        return [0, self.val, self.metadata.out()]

    def __repr__(self):
        return str(self.val)


class Astnode(object):
    def __init__(self, val, args, metadata):
        self.val = val
        self.args = map(node, args)
        self.metadata = Metadata(metadata)

    def out(self):
        o = [1, self.val, self.metadata.out()]+[x.out() for x in self.args]
        return o

    def __repr__(self):
        return '('+str(self.val)+' '+' '.join(map(repr, self.args))+')'


def node(li):
    if li[0]:
        return Astnode(li[1], li[3:], li[2])
    else:
        return Token(li[1], li[2])


def take(x):
    return pyext.parse_lll(x) if isinstance(x, (str, unicode)) else x.out()


def takelist(x):
    return map(take, parse(x).args if isinstance(x, (str, unicode)) else x)


compile = lambda x: pyext.compile(x)
compile_to_lll = lambda x: node(pyext.compile_to_lll(x))
compile_lll = lambda x: pyext.compile_lll(take(x))
parse = lambda x: node(pyext.parse(x))
rewrite = lambda x: node(pyext.rewrite(take(x)))
pretty_compile = lambda x: map(node, pyext.pretty_compile(x))
pretty_compile_lll = lambda x: map(node, pyext.pretty_compile_lll(take(x)))
serialize = lambda x: pyext.serialize(takelist(x))
deserialize = lambda x: map(node, pyext.deserialize(x))

is_numeric = lambda x: isinstance(x, (int, long))
is_string = lambda x: isinstance(x, (str, unicode))
tobytearr = lambda n, L: [] if L == 0 else tobytearr(n / 256, L - 1)+[n % 256]


# A set of methods for detecting raw values (numbers and strings) and
# converting them to integers
def frombytes(b):
    return 0 if len(b) == 0 else ord(b[-1]) + 256 * frombytes(b[:-1])


def fromhex(b):
    hexord = lambda x: '0123456789abcdef'.find(x)
    return 0 if len(b) == 0 else hexord(b[-1]) + 16 * fromhex(b[:-1])


def numberize(b):
    if is_numeric(b):
        return b
    elif b[0] in ["'", '"']:
        return frombytes(b[1:-1])
    elif b[:2] == '0x':
        return fromhex(b[2:])
    else:
        return int(b)


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


def main():
    if len(sys.argv) == 1:
        print "serpent <command> <arg1> <arg2> ..."
    else:
        cmd = sys.argv[2] if sys.argv[1] == '-2' else sys.argv[1]
        if sys.argv[1] == '-s':
            args = [sys.stdin.read()] + sys.argv[3:]
            if cmd == 'deserialize':
                args[0] = args[0].strip().decode('hex')
        elif sys.argv[1] == '-v':
            print VERSION
            sys.exit()
        else:
            cmd = sys.argv[1]
            args = sys.argv[2:]
        o = globals()[cmd](*args)
        if isinstance(o, (Token, Astnode, list)):
            print repr(o)
        else:
            print o.encode('hex')
