import re
import utils
token, astnode = utils.token, utils.astnode


# Number of spaces at the beginning of a line
def spaces(ln):
    spaces = 0
    while spaces < len(ln) and ln[spaces] == ' ':
        spaces += 1
    return spaces


# Main parse function
def parse(document, fil='main'):
    return parse_lines(document.split('\n'), fil)


# Parse the statement-level structure, including if and while statements
def parse_lines(lns, fil='main', voffset=0, hoffset=0):
    o = []
    i = 0
    while i < len(lns):
        main = lns[i]
        line_index = i
        ms = main.strip()
        # Skip empty lines
        if ms[:2] == '//' or ms[:1] in ['#', '']:
            i += 1
            continue
        if spaces(main) > 0:
            raise Exception("Line "+str(i)+" indented too much!")
        main = ms
        hoffset2 = len(main) - len(main.lstrip())
        # If the line was only a comment it's now empty, so skip it
        if len(main) == 0:
            i += 1
            continue
        # Grab the child block of an if statement
        indent = 99999999
        i += 1
        child_lns = []
        while i < len(lns):
            if len(lns[i].strip()) > 0:
                sp = spaces(lns[i])
                if sp == 0:
                    break
                indent = min(sp, indent)
                child_lns.append(lns[i])
            i += 1
        child_block = map(lambda x: x[indent:], child_lns)
        # Calls parse_line to parse the individual line
        out = parse_line(main, fil, voffset + line_index, hoffset + hoffset2)
        # Include the child block into the parsed expression
        if out.fun in bodied:
            # assert len(child_block)  # May be zero now(`case` for instance)
            params = fil, voffset + line_index + 1, hoffset + indent
            out.args.append(parse_lines(child_block, *params))
        else:
            assert not len(child_block)
        # This is somewhat complicated. Essentially, it converts something like
        # "if c1 then s1 elif c2 then s2 elif c3 then s3 else s4" (with
        # appropriate indenting) to [ if c1 s1 [ if c2 s2 [ if c3 s3 s4 ] ] ]
        if len(o) == 0 or not isinstance(out, astnode):
            o.append(out)
            continue
        u = o[-1]
        # It is a continued body.
        if u.fun in bodied_continued and out.fun in bodied_continued[u.fun]:
                while len(u.args) == 3:
                    u = u.args[-1]
                u.args.append(out.args[-1] if out.fun == 'else' else out)
        else:
            # Normal case: just add the parsed line to the output
            o.append(out)
    return o[0] if len(o) == 1 else astnode('seq', o, fil, voffset, hoffset)


# Tokens contain one or more chars of the same type, with a few exceptions
def chartype(c):
    if c in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_.':
        return 'alphanum'
    elif c in '\t ':
        return 'space'
    elif c in '()[]{}':
        return 'brack'
    elif c == '"':
        return 'dquote'
    elif c == "'":
        return 'squote'
    else:
        return 'symb'


# Converts something like "b[4] = x+2 > y*-3" to
# [ 'b', '[', '4', ']', '=', 'x', '+', '2', '>', 'y', '*', '-', '3' ]
def tokenize(ln, fil='main', linenum=0, charnum=0):
    tp = 'space'
    i = 0
    o = []
    global cur
    cur = ''
    # Finish a token and start a new one

    def nxt():
        global cur
        if len(cur) >= 2 and cur[-1] in ['-', '#']:
            o.append(token(cur[:-1], fil, linenum, charnum + i - len(cur)))
            o.append(token(cur[-1], fil, linenum, charnum + i))
        elif len(cur) >= 3 and cur[-2:] == '//':
            o.append(token(cur[:-2], fil, linenum, charnum + i - len(cur)))
            o.append(token(cur[-2:], fil, linenum, charnum + i))
        elif len(cur.strip()) >= 1:
            o.append(token(cur, fil, linenum, charnum + i - len(cur)))
        cur = ''
    # Main loop
    while i < len(ln):
        c = chartype(ln[i])
        # Inside a string
        if tp == 'squote' or tp == "dquote":
            if c == tp:
                cur += ln[i]
                nxt()
                i += 1
                tp = 'space'
            elif ln[i:i+2] == '\\x':
                cur += ln[i+2:i+4].decode('hex')
                i += 4
            elif ln[i:i+2] == '\\n':
                cur += '\x0a'
                i += 2
            elif ln[i] == '\\':
                cur += ln[i+1]
                i += 2
            else:
                cur += ln[i]
                i += 1
        # Not inside a string
        else:
            if cur[-2:] == '//' or cur[-1:] in ['-', '#']: nxt()
            elif c == 'brack' or tp == 'brack': nxt()
            elif c == 'space': nxt()
            elif c != 'space' and tp == 'space': nxt()
            elif c == 'symb' and tp != 'symb': nxt()
            elif c == 'alphanum' and tp == 'symb': nxt()
            elif c == 'squote' or c == "dquote": nxt()
            cur += ln[i]
            tp = c
            i += 1
    nxt()
    if len(o) > 0 and o[-1].val in [':', ':\n', '\n']:
        o.pop()
    if tp in ['squote', 'dquote']:
        raise Exception("Unclosed string: "+ln)
    return o

# This is the part where we turn a token list into an abstract syntax tree
precedence = {
    '!': 0,
    '^': 1,
    '*': 2,
    '/': 3,
    '%': 4,
    '#/': 2,
    '#%': 2,
    '+': 3,
    '-': 3,
    '<': 4,
    '<=': 4,
    '>': 4,
    '>=': 4,
    '&': 5,
    '==': 5,
    'and': 6,
    '&&': 6,
    'or': 7,
    '||': 7,
    '=': 10,
}

bodied = {'init': [], 'code': [],  # NOTE: also used in serpent_writer
          'if': [''], 'elif': [''], 'else': [],
          'while': [''],
          'cond': 'dont',  # (it is internal if ... elif .. else does it)
          'case': [''], 'of': [''], 'default': [],
          'for': ['', 'in'],
          'simple_macro': []}

bodied_continued = {'elif': ['elif', 'else'],
                    'if': ['elif', 'else'],
                    'case': ['of', 'default'],
                    'init': ['code']}


def toktype(token):
    if token is None or isinstance(token, astnode):
        return None
    elif token.val in ['(', '[']:
        return 'left_paren'
    elif token.val in [')', ']']:
        return 'right_paren'
    elif token.val == ',':
        return 'comma'
    elif token.val == ':':
        return 'colon'
    elif token.val in ['!']:
        return 'unary_operation'
    elif not isinstance(token.val, str):
        return 'compound'
    elif token.val in precedence:
        return 'binary_operation'
    elif re.match('^[0-9a-zA-Z\-\._]*$', token.val):
        return 'alphanum'
    elif token.val[0] in ['"', "'"] and token.val[0] == token.val[-1]:
        return 'alphanum'
    else:
        print token
        raise Exception("Invalid token: " + str(token))


# https://en.wikipedia.org/wiki/Shunting-yard_algorithm
#
# The algorithm works by maintaining three stacks: iq, stack, oq. Initially,
# the tokens are placed in order on the iq. Then, one by one, the tokens are
# processed. Values are moved immediately to the output queue. Operators are
# pushed onto the stack, but if an operator comes along with lower precendence
# then all operators on the stack with higher precedence are applied first.
# For example:
# iq = 2 + 3 * 5 + 7, stack = \, oq = \
# iq = + 3 * 5 + 7, stack = \, oq = 2
# iq = 3 * 5 + 7, stack = +, oq = 2
# iq = * 5 + 7, stack = +, oq = 2 3
# iq = 5 + 7, stack = + *, oq = 2 3 (since * > + in precedence)
# iq = + 7, stack = + *, oq = 2 3 5
# iq = 7, stack = + +, oq = 2 [* 3 5] (since + > * in precedence)
# iq = \, stack = + +, oq = 2 [* 3 5] 7
# iq = \, stack = +, oq = 2 [+ [* 3 5] 7]
# iq = \, stack = \, oq = [+ 2 [+ [* 3 5] 7] ]
#
# Functions, where function arguments begin with a left bracket preceded by
# the function name, are separated by commas, and end with a right bracket,
# are also included in this algorithm, though in a different way
def shunting_yard(tokens):
    iq = [x for x in tokens]
    oq = []
    stack = []
    prev, tok = None, None

    # The normal Shunting-Yard algorithm simply converts expressions into
    # reverse polish notation. Here, we try to be slightly more ambitious
    # and build up the AST directly on the output queue
    # eg. say oq = [ 2, 5, 3 ] and we add "+" then "*"
    # we get first [ 2, [ +, 5, 3 ] ] then [ [ *, 2, [ +, 5, 3 ] ] ]
    def popstack(stack, oq):
        tok = stack.pop()
        typ = toktype(tok)
        if typ == 'binary_operation':
            a, b = oq.pop(), oq.pop()
            oq.append(astnode(tok.val, [b, a], *tok.metadata))
        elif typ == 'unary_operation':
            a = oq.pop()
            oq.append(astnode(tok.val, [a], *tok.metadata))
        elif typ == 'right_paren':
            args = []
            while toktype(oq[-1]) != 'left_paren':
                args.insert(0, oq.pop())
            lbrack = oq.pop()
            if tok.val == ']' and args[0].val != 'id':
                oq.append(astnode('access', args, *lbrack.metadata))
            elif tok.val == ']':
                oq.append(astnode('array_lit', args[1:], *lbrack.metadata))
            elif tok.val == ')' and len(args) and args[0].val != 'id':
                oq.append(astnode(args[0].val, args[1:], *args[0].metadata))
            else:
                oq.append(args[1])
    # The main loop
    while len(iq) > 0:
        prev = tok
        tok = iq.pop(0)
        typ = toktype(tok)
        if typ == 'alphanum':
            oq.append(tok)
        elif typ == 'left_paren':
            # Handle cases like 3 * (2 + 5) by using 'id' as a default function
            # name
            if toktype(prev) != 'alphanum' and toktype(prev) != 'right_paren':
                oq.append(token('id', *prev.metadata))
            # Say the statement is "... f(45...". At the start, we would have f
            # as the last item on the oq. So we move it onto the stack, put the
            # leftparen on the oq, and move f back to the stack, so we have ( f
            # as the last two items on the oq. We also put the leftparen on the
            # stack so we have a separator on both the stack and the oq
            stack.append(oq.pop())
            oq.append(tok)
            oq.append(stack.pop())
            stack.append(tok)
        elif typ == 'right_paren':
            # eg. f(27, 3 * 5 + 4). First, we finish evaluating all the
            # arithmetic inside the last argument. Then, we run popstack
            # to coalesce all of the function arguments sitting on the
            # oq into a single list
            while len(stack) and toktype(stack[-1]) != 'left_paren':
                popstack(stack, oq)
            if len(stack):
                stack.pop()
            stack.append(tok)
            popstack(stack, oq)
        elif typ == 'unary_operation' or typ == 'binary_operation':
            # -5 -> 0 - 5
            if tok.val == '-' and toktype(prev) not in ['alphanum', 'right_paren']:
                oq.append(token('0', *tok.metadata))
            # Handle BEDMAS operator precedence
            prec = precedence[tok.val]
            while len(stack) and toktype(stack[-1]) == 'binary_operation' and precedence[stack[-1].val] < prec:
                popstack(stack, oq)
            stack.append(tok)
        elif typ == 'comma':
            # Finish evaluating all arithmetic before the comma
            while len(stack) and toktype(stack[-1]) != 'left_paren':
                popstack(stack, oq)
        elif typ == 'colon':
            # Colon is like a comma except it stays in the argument list
            while len(stack) and toktype(stack[-1]) != 'right_paren':
                popstack(stack, oq)
            oq.append(tok)
    while len(stack):
        popstack(stack, oq)
    if len(oq) == 1:
        return oq[0]
    else:
        raise Exception("Wrong number of items on stack!")


def parse_line(ln, fil='main', linenum=0, charnum=0):
    l_offset = len(ln) - len(ln.lstrip())
    metadata = fil, linenum, charnum + l_offset
    tok = tokenize(ln.strip(), *metadata)
    for i, t in enumerate(tok):
        if t.val in ['#', '//']:
            tok = tok[:i]
            break
    if tok[-1].val == ':':
        tok = tok[:-1]
    if tok[0].val in bodied:
        names = bodied[tok[0].val]
        if names == 'dont':
            raise Exception("% not allowed.", tok[0].val)
        args = []
        i, j, k = 1, 1, 1
        while i < len(names):
            if tok[j].val == names[i]:  # Find the name until which the data is
                args.append(shunting_yard(tok[k:j]))
                i += 1
                j += 1
                k = j
            j += 1
        if k < len(tok):
            args.append(shunting_yard(tok[k:]))
        return astnode(tok[0], args, *metadata)
    else:
        return shunting_yard(tok)
