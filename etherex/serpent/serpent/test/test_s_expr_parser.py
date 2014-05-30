
import os.path
import io
import sys
from random import random

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from python_2_3_compat import to_str, is_str
from s_expr_parser import SExprParser, s_expr_str


def gen_tree(p, n, d):
    out = []
    for i in range(n):
        if random() < p and d > 0:
            out.append(gen_tree(p, n, d - 1))
        else:
            out.append(str(random()))
    return out


class TestParser(SExprParser):

    def test_case(self, string, tree, o='(', c=')', white=[' ', '\t', '\n']):
        result = self.parse(string)
        if result != tree:
            raise Exception('Mismatch', 'tree', tree, 'string', string, 'result', result)

    def test_1(self, p=0.1, n=2, d=2):
        tree = gen_tree(p, n, d)
        self.test_case(s_expr_str(tree), tree)

TestParser().test_case('"string (stuff" should end',
                       [['str', 'string (stuff'], 'should', 'end'])

# Simple case test.
TestParser().test_case("bla 123 (45(678      af)sa faf((a sf))  (a) sfsa) ;do not include",
                        ['bla', '123', ['45', ['678', 'af'],
                         'sa', 'faf', [['a', 'sf']], ['a'], 'sfsa']])

# IMO Should have been caught in a test and not ended up downstream.
for i in range(200):
    TestParser().test_1()
