#!/usr/bin/python
import random
from serpent import parser, rewriter, compiler, lllparser

def bijection_test_lllparser(lll):
    text = repr(lll)
    i = 0
    n = random.randrange(4)
    while i >= 0 and n > 0:
        i = text.find('\n', i)
        n -= 1
    if i > 0:
        text = text[:i] + ';-\n' + text[i+1:]

    ast = lllparser.parse_lll(text)
    if ast.listfy() != lll.listfy():
        print("BUG: Parsing output again gave different result!")
        print(lll)
        print(ast)
        print("")


def test_on_text(text):
    print text

    ast = parser.parse(text)
    print "AST:", ast
    print ""

    lll = rewriter.compile_to_lll(ast)
    print "LLL:", lll
    print ""

    bijection_test_lllparser(lll)

    varz = rewriter.analyze(ast)
    print "Analysis: ", varz
    print ""

    aevm = compiler.compile_lll(lll)
    print "AEVM:", ' '.join([str(x) for x in aevm])
    print ""

    code = compiler.assemble(aevm)
    print "Output:", code.encode('hex')


def test_on_file(file):
    t = open(file).readlines()
    i = 0
    while True:
        o = []
        while i < len(t) and (not len(t[i]) or t[i][0] != '='):
            o.append(t[i])
            i += 1
        i += 1
        print '================='
        text = '\n'.join(o).replace('\n\n', '\n')
        test_on_text(text)
        if i >= len(t):
            break

for f in ['tests.txt',
          'examples/mul2.se', 'examples/namecoin.se',
          # Currently dont work, latter is fixed by #33
          'examples/returnten.se', 'examples/subcurrency.se'
          ]:
    test_on_file(f)
