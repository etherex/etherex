#!/usr/bin/env python
import sys
import time
sys.path.insert(0, './serpent')
import serpent
sys.path.insert(0, './pyethereum')
from pyethereum import eth, transactions, blocks, processblock, utils

import signal
import ConfigParser
from optparse import OptionParser
import logging
import logging.config

from pyethereum.signals import config_ready
from pyethereum.tcpserver import tcp_server
from pyethereum.peermanager import peer_manager
from pyethereum.chainmanager import chain_manager
from pyethereum.apiserver import api_server

logger = logging.getLogger(__name__)

from etherex import *
from debug import *

N = 1
addrs, keys = make_population(N)
users = zip(keys, addrs)
master_key = users[0][0]
print "Initializing exchange from addr and key: %s, %s" % ("0x" + users[0][1], "0x" + master_key.encode('hex'))
# genesis = genesis_block(addrs)

# Init network and get blockchain, from eth.py main()
def init_network():
    init = False
    config = eth.create_config()
    config_ready.send(sender=config)

    try:
        tcp_server.start()
    except IOError as e:
        logger.error("Could not start TCP server: \"{0}\"".format(str(e)))
        sys.exit(1)

    peer_manager.start()
    chain_manager.start()
    api_server.start()

    # handle termination signals
    def signal_handler(signum=None, frame=None):
        logger.info('Signal handler called with signal {0}'.format(signum))
        peer_manager.stop()
        chain_manager.stop()
        tcp_server.stop()

    for sig in [signal.SIGTERM, signal.SIGHUP, signal.SIGQUIT, signal.SIGINT]:
        signal.signal(sig, signal_handler)

    # connect peer
    if config.get('network', 'remote_host'):
        peer_manager.connect_peer(
            "127.0.0.1", # config.get('network', 'remote_host'),
            config.getint('network', 'remote_port'))

    # loop
    while not peer_manager.stopped():
        time.sleep(0.5)
        if len(peer_manager.get_connected_peer_addresses()) > 0:
            chain_manager.synchronize_blockchain()

            if chain_manager.head != None:
                print chain_manager.head
            if init == False and chain_manager.head is not None:
                # block = genesis_block(addrs)
                # block = blocks.get_block(chain_manager.blockchain.get('HEAD'))
                block = chain_manager.head
                if block.number > 10:
                    # block = chain_manager.blockchain.get("ab6b9a5613970faa771b12d449b2e9bb925ab7a369f0a4b86b286e9d540099cf".decode('hex'))
                    print block
                    # display_block_chain(block, users)
                    contracts = init_system(block, master_key)

                    root_contract = [i for i,j in zip(contracts.keys(), contracts.values()) if j=='etherex'][0]
                    balances_contract = [i for i,j in zip(contracts.keys(), contracts.values()) if j=='balances'][0]
                    indexes_contract = [i for i,j in zip(contracts.keys(), contracts.values()) if j=='indexes'][0]
                    trades_contract = [i for i,j in zip(contracts.keys(), contracts.values()) if j=='trades'][0]
                    xeth_contract = [i for i,j in zip(contracts.keys(), contracts.values()) if j=='currency'][0]

                    init = True
                    # DEBUG
                    # bdict = block.to_dict()
                    # print bdict
                    print block
                    # display_block_chain(block, users)

    logger.info('exiting')

    peer_manager.join()

    logger.debug('main thread finished')


init_network()


block = genesis_block(addrs)
# block = chain_manager.blockchain.get('head')
# print block
display_block_chain(block, users)
contracts = init_system(block, master_key)

root_contract = [i for i,j in zip(contracts.keys(), contracts.values()) if j=='etherex'][0]
balances_contract = [i for i,j in zip(contracts.keys(), contracts.values()) if j=='balances'][0]
indexes_contract = [i for i,j in zip(contracts.keys(), contracts.values()) if j=='indexes'][0]
trades_contract = [i for i,j in zip(contracts.keys(), contracts.values()) if j=='trades'][0]
xeth_contract = [i for i,j in zip(contracts.keys(), contracts.values()) if j=='currency'][0]

init = True
# DEBUG
# bdict = block.to_dict()
# print bdict
print block
print block.to_dict()
# display_block_chain(block, users)
