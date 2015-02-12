#! /usr/bin/env python
# runtests.py -- EtherEx tests launcher
#
# Copyright (c) 2014 EtherEx
#
# This software may be modified and distributed under the terms
# of the MIT license.  See the LICENSE file for details.

import subprocess
# import os
import sys
import json
sys.path.insert(0, './serpent')
import serpent

def compile(f):
  t = open(f).readlines()
  i = 0
  while 1:
    o = []
    while i < len(t) and (not len(t[i]) or t[i][0] != '='):
      o.append(t[i])
      i += 1
    i += 1
    print '================='
    text = '\n'.join(o).replace('\n\n', '\n')

    lll = serpent.compile_to_lll(text)
    print "LLL:", lll
    print ""

    aevm = serpent.pretty_compile_lll(lll)
    print "AEVM:", aevm
    print ""

    code = serpent.compile(text)
    print "HEX:", code.encode('hex')
    print ""

    if i >= len(t):
      break

print '\n'
print '==================='
print 'EtherEx LVM'
print '==================='

print 'EtherEx'
print '\n'
# f = 'contracts/etherex.se'
# compile(f)

subprocess.call(["py.test", "tests/etherex.py", "-vv", "-x"])

print '==================='
print 'WARNING: Experimental code, use at your own risks.'
print '==================='