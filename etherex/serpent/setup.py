#!/usr/bin/env python

import os
from setuptools import setup
from setuptools.command.install import install
from distutils.command.build import build
from subprocess import call


class build_serpent(build):
    def run(self):
        # run original build code
        build.run(self)
        call('make')


class install_serpent(install):
    def run(self):
        # run original install code
        install.run(self)
        call(['make', 'install'])


def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()


setup(
    name='ethereum-serpent',
    version='1.3.8',
    description='Serpent compiler',
    maintainer='Vitalik Buterin',
    maintainer_email='v@buterin.com',
    license='WTFPL',
    url='http://www.ethereum.org/',
    long_description=read('README.md'),
    cmdclass={
        'build': build_serpent,
        'install': install_serpent,
    }
)
