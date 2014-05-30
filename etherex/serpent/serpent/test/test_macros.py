import os.path
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import macros

def assert_eq(expand, should_be=None, expand_1=None):
    if should_be is None:  # Latter not specified, then it sohuld not change.
        should_be = expand

    ret = macros.macroexpand(expand)
    if ret != should_be:
        raise Exception('macroexpand wrong', ret, 'vs\n', should_be)

    if expand_1 is not None:
        ret = macros.macroexpand_1(expand)
        if ret != expand_1:
            raise Exception('Single step macroexpand wrong', ret, 'vs\n', expand_1)


assert_eq(['set', ['access', 'contract.storage', 'index'], 'value'],
          ['sstore', 'index', 'value'])
assert_eq(['set', 'x', ['+', '3', '5']])
assert_eq(['if', 1, 2, 3], ['ifelse', 1, 2 ,3])
assert_eq(['if', 1, 2],    ['if', 1, 2])
assert_eq(['access', 'msg.data', 'index'], ['calldataload', 'index'])
assert_eq(['access', 'contract.storage', 'index'], ['sload', 'index'])

assert_eq(['array_lit', 1, 2, 3],
          ['-', ['set_and_inc', 3, ['set_and_inc', 2,
                                    ['set_and_inc', 1, ['array', '3']]]], '96'])

completely = ['msg', 'function', '0', ['-', 'tx.gas', '21'], ['-', ['set_and_inc', 3, ['set_and_inc', 2, ['set_and_inc', 1, ['array', '3']]]], '96'], '3']
one        = ['msg', 'function', '0', ['-', 'tx.gas', macros.msg_gas],
                     ['array_lit', 1, 2, 3], '3']
# Test both automatic and manual calling of funcall.
assert_eq(['function', 1, 2, 3], completely, one)
assert_eq(['funcall', 'function', 1, 2, 3], completely, one)
          
