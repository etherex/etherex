import os
import cllcompiler
t = open(os.path.dirname(os.path.realpath(__file__)) + '/tests.txt').readlines()
i = 0
while 1:
    o = []
    while i < len(t) and (not len(t[i]) or t[i][0] != '='): 
        o.append(t[i])
        i += 1
    i += 1
    print '================='
    text = '\n'.join(o).replace('\n\n','\n')
    print text
    ast = cllcompiler.parse(text)
    print "AST:",ast
    print ""
    aevm = cllcompiler.compile_to_aevm(ast)
    print "AEVM:",' '.join([str(x) for x in aevm])
    print ""
    code = cllcompiler.assemble(aevm)
    print "Output:",' '.join([str(x) for x in code])
    if i >= len(t):
        break
