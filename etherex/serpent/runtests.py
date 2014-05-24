#!/usr/bin/python

import random


def bijection_test_lllparser(ast2):
    text2 = lllparser.serialize_lll(ast2)
    i = 0
    n = random.randrange(4)  # No comments yet.
    while i >= 0 and n > 0:
        i = text2.find('\n', i)
        n -= 1
    if i > 0:
        text2 = text2[:i] + '\n' + text2[i:]
    print(text2)

    ast3  = lllparser.parse_lll(text2)
    if ast3.listfy() != ast2.listfy():
        print("BUG: Parsing output again gave different result!")
        print(ast2)
        print(ast3)
        print("")


from serpent import parser, rewriter, compiler, lllparser
t = open('tests.txt').readlines()
i = 0
while True:
    o = []
    while i < len(t) and (not len(t[i]) or t[i][0] != '='):
        o.append(t[i])
        i += 1
    i += 1
    print '================='
    text = '\n'.join(o).replace('\n\n', '\n')
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
    if i >= len(t):
        break
