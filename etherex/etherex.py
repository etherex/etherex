import sys
sys.path.insert(0, './serpent')
import serpent
sys.path.insert(0, './pyethereum')
from pyethereum import transactions, blocks, processblock, utils
from debug import *

def new_user(brain_pass):
    key = utils.sha3(brain_pass)
    addr = utils.privtoaddr(key)
    return key, addr

def make_population(N):
    users = ["f9e57456f18d90886263fedd9cc30b27cd959137"]
    keys = ["d0a0916e41daa07dce522025b65cd04ffce1a785b6c4aedd964497bbaf2db199"]
    # for i in xrange(N):
    #     key, addr = new_user('dsdmn%dvdscu7w2y%d%d'%(i, i*91, i+31))
    #     users.append(addr)
    #     keys.append(key)
    return users, keys


def genesis_block(users, coins_each=10**42):
    dd = dict(zip(users, [coins_each]*len(users)))
    gen = blocks.genesis(dd)
    return gen

def write_owner(root_hash, filename):
    f = open(filename)
    d = f.readlines()
    f.close()
    if not d[0] == 'owner = 0x%s\n'%root_hash:
        d[0] = 'owner = 0x%s\n'%root_hash
        f = open(filename, 'w')
        f.writelines(d)
        f.close()

def init_system(genesis, key):
    code = serpent.compile(open('contracts/etherex.ser').read())
    # print code.encode('hex')
    tx_make_root = transactions.contract(0,0,10**12, 100000, code).sign(key)
    root_contract = processblock.apply_tx(genesis, tx_make_root)

    print "Contract address: " + root_contract[1]

    # f = lambda x: write_owner(root_hash, x)
    # map(f, ['contracts/balances_init.ser', 'contracts/trades_init.ser', 'contracts/indexes_init.ser', 'contracts/xeth_init.ser'])

    code = serpent.compile(open('contracts/balances.ser').read())
    tx_make_balances = transactions.contract(1,0,10**12, 10000, code).sign(key)
    code = serpent.compile(open('contracts/indexes.ser').read())
    tx_make_indexes = transactions.contract(2,0,10**12, 10000, code).sign(key)
    code = serpent.compile(open('contracts/trades.ser').read())
    tx_make_trades = transactions.contract(3,0,10**12, 10000, code).sign(key)
    code = serpent.compile(open('contracts/currencies.ser').read())
    tx_make_currency = transactions.contract(4,0,10**12, 10000, code).sign(key)

    balances_contract = processblock.apply_tx(genesis, tx_make_balances)
    print "Balances (XETH) address: " + balances_contract[1]
    indexes_contract = processblock.apply_tx(genesis, tx_make_indexes)
    print "Indexes address: " + indexes_contract[1]
    trades_contract = processblock.apply_tx(genesis, tx_make_trades)
    print "Trades address: " + trades_contract[1]
    currencies_contract = processblock.apply_tx(genesis, tx_make_currency)
    print "Currencies address: " + currencies_contract[1]

    r_contract = root_contract[1]
    b_contract = balances_contract[1]
    i_contract = indexes_contract[1]
    t_contract = trades_contract[1]
    c_contract = currencies_contract[1]

    # init EtherEx
    data = serpent.encode_datalist([b_contract, i_contract, t_contract, c_contract])
    tx_init_root = transactions.Transaction(5, 10**12, 10000, r_contract, 0, data).sign(key)
    ret = processblock.apply_tx(genesis, tx_init_root)
    print "Result: %s" % serpent.decode_datalist(ret[1])
    # init Balances
    tx_init_root = transactions.Transaction(6, 10**12, 10000, b_contract, 1 * 10 ** 18, serpent.encode_datalist([r_contract])).sign(key)
    ret = processblock.apply_tx(genesis, tx_init_root)
    print "Result: %s" % serpent.decode_datalist(ret[1])
    # init Indexes
    tx_init_root = transactions.Transaction(7, 10**12, 10000, i_contract, 0, serpent.encode_datalist([r_contract])).sign(key)
    ret = processblock.apply_tx(genesis, tx_init_root)
    print "Result: %s" % serpent.decode_datalist(ret[1])
    # init Trades
    tx_init_root = transactions.Transaction(8, 10**12, 10000, t_contract, 0, serpent.encode_datalist([r_contract])).sign(key)
    ret = processblock.apply_tx(genesis, tx_init_root)
    print "Result: %s" % serpent.decode_datalist(ret[1])
    # init Currencies
    tx_init_root = transactions.Transaction(9, 10**12, 10000, c_contract, 0, serpent.encode_datalist([r_contract])).sign(key)
    ret = processblock.apply_tx(genesis, tx_init_root)
    print "Result: %s" % serpent.decode_datalist(ret[1])

    # Run tests
    data = serpent.encode_datalist([1, 10 * 10 ** 19, 1500 * 10 ** 8, 1])
    tx_init_root = transactions.Transaction(10, 10**12, 100000, r_contract, 0, data).sign(key)
    ret = processblock.apply_tx(genesis, tx_init_root)
    print "Result: %s" % serpent.decode_datalist(ret[1])

    # data = serpent.encode_datalist([9, 0xf9e57456f18d90886263fedd9cc30b27cd959137]) #2, 10 * 10 ** 19, 1500 * 10 ** 8, 1])
    # tx_init_root = transactions.Transaction(11, 10 * 10 ** 19, 10**12, 100000, root_contract, data).sign(key)
    # ret = processblock.apply_tx(genesis, tx_init_root)
    # print "Result: %s" % serpent.decode_datalist(ret)

    addresses = {r_contract:'etherex', b_contract:'balances', i_contract:'indexes', t_contract:'trades', c_contract:'currency', utils.privtoaddr(key):'me'}

    print addresses
    return addresses

def send_money(to, amount, genesis, root_contract, usr):
    key, addr = usr
    nonce = get_nonce(genesis, addr)
    tx_money = transactions.Transaction(nonce, 0, 10**12, 10000, root_contract, serpent.encode_datalist([to, amount])).sign(key)
    ans = processblock.apply_tx(genesis, tx_money)

def push_content(content, title, genesis, root_contract, usr):
    key, addr = usr
    nonce = get_nonce(genesis, addr)
    content_hash = utils.sha3(content)
    # push a transaction with a title.  recover title from blockchain
    tx_push = transactions.Transaction(nonce, 0, 10**12, 10000, root_contract, serpent.encode_datalist([1, content_hash, title])).sign(key)
    ans = processblock.apply_tx(genesis, tx_push)

    f = open('data/%s'%content_hash.encode('hex'), 'w')
    f.write(content)
    f.close()

    return content_hash

def register_name(name, genesis, root_contract, usr):
    key, addr = usr
    nonce = get_nonce(genesis, addr)
    # register eth-address to a name.  recover name from blockchain.  names are not unique. but names + first 4 digits of address probably are....
    tx_register_name = transactions.Transaction(nonce, 0, 10**12, 10000, root_contract, serpent.encode_datalist([5, name])).sign(key)
    ans = processblock.apply_tx(genesis, tx_register_name)


def tag_content(content_hash, tag, genesis, root_contract, usr):
    key, addr = usr
    nonce = get_nonce(genesis, addr)
    tx_tag = transactions.Transaction(nonce, 0, 10**12, 10000, root_contract, serpent.encode_datalist([2, content_hash, tag])).sign(key)
    ans = processblock.apply_tx(genesis, tx_tag)

def vote_tag(content_hash, tag, vote, genesis, root_contract, usr):
    key, addr = usr
    nonce = get_nonce(genesis, addr)
    #vote on a tag. 
    tx_vote = transactions.Transaction(nonce, 0, 10**12, 10000, root_contract, serpent.encode_datalist([3, content_hash, tag, vote])).sign(key)
    ans = processblock.apply_tx(genesis, tx_vote)


def get_all_content(genesis, root_contract, usr):
    key, addr = usr
    nonce = get_nonce(genesis, addr)
    tx_v = transactions.Transaction(nonce, 0, 10**12, 10000, root_contract, serpent.encode_datalist([7, 'kjsdhg'])).sign(key)
    ans = processblock.apply_tx(genesis, tx_v)
    decoded = serpent.decode_datalist(ans)
    hexd = map(hex, decoded)
    f = lambda x : x[2:-1]
    hexd = map(f, hexd)
    f = lambda x: x.decode('hex')
    hexd = map(f, hexd)
    return hexd

def get_content(content_hash):
    f = open('data/%s'%content_hash.encode('hex'))
    content = f.read()
    f.close()
    return content

def get_content_title(content_hash, data_contract, genesis):
    #a = int(content_hash.encode('hex'),16) + 1 # index of title
    a = int(content_hash.encode('hex'),16) + 1 # index of title
    jj = genesis.get_storage_data(data_contract, a)
    return hex(jj)[2:-1].decode('hex')

def get_name(user_addr, users_contract, genesis):
    jj = genesis.get_storage_data(users_contract, user_addr)
    return hex(jj)[2:-1].decode('hex')

def get_tags(content_hash, tag_contract, genesis):
    ntags = genesis.get_storage_data(tag_contract,  content_hash)
    tags = []
    for i in xrange(ntags):
        #a = int(content_hash.encode('hex'),16) + 3*(i+1) # index of ith tag
        a = int(content_hash.encode('hex'), 16) + 3*(i+1) # index of ith tag
        jj = genesis.get_storage_data(tag_contract, a)
        tag = hex(jj)[2:-1].decode('hex')
        tags.append(tag)
    return tags

def get_votes(content_hash, tag, tag_contract, genesis):
    ntags = genesis.get_storage_data(tag_contract,  content_hash)
    found = False
    for i in xrange(ntags):
        a = int(content_hash.encode('hex'), 16) + 3*(i+1) # index of ith tag
        jj = genesis.get_storage_data(tag_contract, a)
        t = hex(jj)[2:-1].decode('hex')
        if tag == t:
            tagnum = i
            found = True
            break
    if found  == True:
        a = int(content_hash.encode('hex'), 16) + 3*tagnum + 1 # index of upvotes
        uv = genesis.get_storage_data(tag_contract, a)
        dv = genesis.get_storage_data(tag_contract, a+1)
        return int(uv), int(dv)
    else:
        return None
    


