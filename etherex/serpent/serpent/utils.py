import re


class token():
    def __init__(self, val, fil='', line=0, char=0):
        self.val = val
        self.metadata = [self.fil, self.line, self.char] = fil, line, char
        self.__repr__ = lambda: str(self.val)
        self.listfy = lambda: self.val


def tokenify(s, fil='', line=0, char=0):
    return s if isinstance(s, token) else token(s, fil, line, char)


def detokenify(s):
    return s.val if isinstance(s, token) else s


class astnode():
    def __init__(self, fun, args, fil='', line=0, char=0):
        self.fun = detokenify(fun)
        self.args = args
        self.metadata = [self.fil, self.line, self.char] = fil, line, char
        self.listfy = lambda: [self.fun] + map(lambda x: x.listfy(), self.args)

    def __repr__(self):
        o = '(' + self.fun
        subs = map(repr, self.args)
        k = 0
        out = ' '
        while k < len(subs) and o != '(seq':
            if '\n' in subs[k] or len(out + subs[k]) >= 80:
                break
            out += subs[k] + ' '
            k += 1
        if k < len(subs):
            o += out + '\n    '
            o += '\n'.join(subs[k:]).replace('\n', '\n    ')
            o += '\n)'
        else:
            o += out.rstrip() + ')'
        return o


def nodeify(s, fil='', line=0, char=0):
    if isinstance(s, astnode):
        metadata = s.metadata
        fun = s.fun
        nodes = map(lambda x: nodeify(x, *s.metadata), s.args)
    elif isinstance(s, (token, str, unicode, int, long)):
        return tokenify(s)
    else:
        metadata = fil, line, char
        fun = s[0].val if isinstance(s[0], token) else s[0]
        nodes = map(lambda x: nodeify(x, *metadata), s[1:])
    return astnode(fun, nodes, *metadata)

is_numeric = lambda x: isinstance(x, (int, long))
is_string = lambda x: isinstance(x, (str, unicode))


# A set of methods for detecting raw values (numbers and strings) and
# converting them to integers
def frombytes(b):
    return 0 if len(b) == 0 else ord(b[-1]) + 256 * frombytes(b[:-1])


def fromhex(b):
    hexord = lambda x: '0123456789abcdef'.find(x)
    return 0 if len(b) == 0 else hexord(b[-1]) + 16 * fromhex(b[:-1])


def is_numberlike(b):
    if isinstance(b, (str, unicode)):
        if re.match('^[0-9\-]*$', b):
            return True
        if b[0] in ["'", '"'] and b[-1] in ["'", '"'] and b[0] == b[-1]:
            return True
        if b[:2] == '0x':
            return True
    return False


def log256(x):
    return 0 if x == 0 else (1 + log256(x / 256))


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
