#!/usr/bin/python

import random


def bijection_test_lllparser(ast2):
    text2 = repr(ast2)
    i = 0
    n = random.randrange(4)  # No comments yet.
    while i >= 0 and n > 0:
        i = text2.find('\n', i)
        n -= 1
    if i > 0:
        text2 = text2[:i] + ';blablabla\n' + text2[i+1:]
    print(text2)

    ast3  = lllparser.parse_lll(text2)
    if ast3.listfy() != ast2.listfy():
        print("BUG: Parsing output again gave different result!")
        print(ast2)
        print(ast3)
        print("")


from serpent import parser, rewriter, compiler, lllparser


def test_on_text(text):
    print text
    ast = parser.parse(text)
    print "AST:", ast
    print ""
    ast2 = rewriter.compile_to_lll(ast)
    print "LLL:", ast2
    print ""
    bijection_test_lllparser(ast2)

    varz = rewriter.analyze(ast)
    print "Analysis: ", varz
    print ""
    aevm = compiler.compile_lll(ast2)
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
