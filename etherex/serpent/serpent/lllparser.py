import parser


def tokenize_lll(text):
    tokens = []
    for line in text.split('\n'):
        i = line.find(';')
        if i >= 0:
            tokens += parser.tokenize(line[:i])
        else:
            tokens += parser.tokenize(line)
    return tokens


def parse_lll(text):
    tokens = tokenize_lll(text)
    for token in tokens:
        token.line = text[:token.char].count('\n')
        token.char -= text[:token.char].rfind('\n')
        token.metadata = [token.fil, token.line, token.char]
    ast, v = _parse_lll(tokens, 0)
    return ast


def _parse_lll(tokens, pos):
    m, sv, o = tokens[pos].metadata, tokens[pos].val, []
    if sv not in ['(', '{', '[', '@', '@@']:
        return tokens[pos], pos + 1
    elif sv == '@':
        node, pos = _parse_lll(tokens, pos+1)
        return parser.astnode('mload', [node], *m), pos
    elif sv == '@@':
        node, pos = _parse_lll(tokens, pos+1)
        return parser.astnode('sload', [node], *m), pos
    elif sv == '(':
        pos, o, watch = pos + 1, [], ')'
    elif sv == '{':
        pos, o, watch = pos + 1, [parser.token('seq')], '}'
    elif sv == '[':
        sv, pos, o, watch = '[[', pos + 1, [parser.token('mstore')], ']'
    else:
        raise Exception(sv)
    while tokens[pos].val != watch:
        sub, pos = _parse_lll(tokens, pos)
        o.append(sub)
    pos += 1
    if sv in ['[', '[['] and tokens[pos].val != ']':
        sub, pos = _parse_lll(tokens, pos)
        o.append(sub)
    if len(o) == 0:
        o.append(parser.token('seq'))
    if len(o) == 3 and isinstance(o[0], parser.token) and o[0].val == 'mstore' and \
            isinstance(o[1], parser.astnode) and len(o[1].args) == 1 and \
            o[1].fun == 'mstore':
        o = [parser.token('sstore'), o[1].args[0], o[2]]
    return parser.astnode(o[0].val, o[1:], *m), pos
