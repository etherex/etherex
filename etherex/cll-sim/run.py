#!/usr/bin/env python

import argparse
import imp
import inspect
import logging
import os.path
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), 'lib'))

from sim import Simulation

def get_subclasses(mod, cls):
    """Yield the classes in module ``mod`` that inherit from ``cls``"""
    for name, obj in inspect.getmembers(mod):
        if hasattr(obj, "__bases__") and cls in obj.__bases__:
            yield obj

def load_simulation_class(script):
    sim_name = os.path.splitext(os.path.basename(script))[0]
    sim_module = imp.load_source(sim_name, script)

    sims = list(get_subclasses(sim_module, Simulation))
    if len(sims) < 1:
        raise RuntimeError("No Simulation found in %s" % script)
    elif len(sims) > 1:
        raise RuntimeError("Multiple Simulations found in %s" % script)

    return sims[0]

def main(script):
    logging.basicConfig(format='%(module)-12s %(levelname)-8s%(message)s',
                        level=logging.DEBUG)

    simulation_class = load_simulation_class(script)
    simulation = simulation_class()
    simulation.run_all()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("script")
    args = parser.parse_args()
    main(args.script)
