#!/usr/bin/env python

from distutils.core import setup

setup(name='ethereum-serpent',
      version='1.2.0',
      description='Serpent contract programming language tools',
      author='Vitalik Buterin',
      author_email='vitalik@ethereum.org',
      packages=['serpent'],
      install_requires=['bitcoin', 'pysha3'],
      scripts=['scripts/serpent']
     )
