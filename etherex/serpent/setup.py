from setuptools import setup, Extension

import os
from distutils.sysconfig import get_config_vars

(opt,) = get_config_vars('OPT')
os.environ['OPT'] = " ".join(
    flag for flag in opt.split() if flag != '-Wstrict-prototypes'
)

setup(
    # Name of this package
    name="ethereum-serpent",

    # Package version
    version='1.5.5',

    description='Serpent compiler',
    maintainer='Vitalik Buterin',
    maintainer_email='v@buterin.com',
    license='WTFPL',
    url='http://www.ethereum.org/',

    # Describes how to build the actual extension module from C source files.
    ext_modules=[
         Extension(
             'pyext',         # Python name of the module
             ['bignum.cpp', 'util.cpp', 'tokenize.cpp',
              'lllparser.cpp', 'parser.cpp', 'rewriter.cpp',
              'compiler.cpp', 'funcs.cpp', 'pyserpent.cpp']
         )],
    py_modules=[
        'serpent',
        'pyserpent'
    ],
    scripts=[
        'serpent.py'
    ],
    entry_points={
        'console_scripts': [
            'serpent = serpent:main',
        ],
    }
    ),
