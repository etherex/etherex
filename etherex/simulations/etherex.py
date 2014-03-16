from sim import Block, Contract, Simulation, Tx, log, mktx, stop

class Exchange(Contract):
    """Exchange contract"""

    def run(self, tx, contract, block):

        if tx.value < 200 * block.basefee:
            stop("Insufficient fee")
        if tx.value < 1 * 10 ** 18:
            stop("Insufficient value")
        k = 10000
        owners = 3
        ownercount = contract.storage[k + owners + 1]
        ownerbalance = contract.storage[k + owners]
        if ownercount < owners:
            if tx.value < 1 * 10 ** 18:
                stop("Cheap creator")
            contract.storage[k + ownercount] = tx.sender
            contract.storage[k + owners] = ownerbalance + tx.value - block.basefee * 200
            contract.storage[k + owners + 1] = ownercount + 1
        elif ownercount >= owners:
            feevalue = tx.value - ((tx.value - 2 * 200 * block.basefee) * 1.05)
            if tx.value < 5 * (2 * 200 * block.basefee) + feevalue:
                stop("Insufficient fees")
            buyvalue = tx.data[0]
            sellvalue = tx.data[1]
            withdraw = tx.data[2]
            owner = tx.sender
            buy = 0
            buyers = 2
            countb = 4
            sell = 1
            sellers = 3
            countc = 6
            exfee = k * block.basefee
            fees = (5 * 200 * block.basefee) - exfee
            valuelessfees = tx.value - fees
            ownerbuy = contract.storage[k + owners + 2 + buy]
            if ownerbuy == 0:
                ownerbuy = [0]
            ownersell = contract.storage[k + owners + 2 + sell]
            if ownersell == 0:
                ownersell = [0]
            ownerbuyers = contract.storage[k + owners + 2 + buyers]
            if ownerbuyers == 0:
                ownerbuyers = [0]
            ownersellers = contract.storage[k + owners + 2 + sellers]
            if ownersellers == 0:
                ownersellers = [0]
            countbuyers = contract.storage[k + owners + 2 + countb]
            countsellers = contract.storage[k + owners + 2 + countc]
            if buyvalue > 0:
                ownerbuy[0] = countbuyers + 1
                # ownerbuy[countbuyers + 1] = valuelessfees
                if ownerbuy is not 0:
                    ownerbuy.append(valuelessfees)
                else:
                    ownerbuy[1] = valuelessfees
                contract.storage[k + owners + 2 + buy] = ownerbuy
                if ownerbuyers == 0:
                    ownerbuyers = [1, tx.sender]
                else:
                    ownerbuyers[0] = countbuyers + 1
                    if ownerbuyers is not 0:
                        ownerbuyers.append(tx.sender) # [countbuyers + 1] = tx.sender
                    else:
                        ownerbuyers[1] = tx.sender
                    # ownerbuyers[countbuyers + 1] = tx.sender
                contract.storage[k + owners + 2 + buyers] = ownerbuyers
                contract.storage[k + owners + 2 + countb] = 1
                countbuyers = countbuyers + 1
            elif sellvalue > 0:
                ownersell[0] = countsellers + 1
                # ownersell[countsellers + 1] = valuelessfees
                if ownersell is not 0:
                    ownersell.append(valuelessfees)
                else:
                    ownersell[1] = valuelessfees
                contract.storage[k + owners + 2 + sell] = ownersell
                if ownerbuyers == 0:
                    ownersellers = [1, tx.sender]
                else:
                    ownersellers[0] = countsellers + 1
                    if ownersellers is not 0:
                        ownersellers.append(tx.sender) # [countsellers + 1] = tx.sender
                    else:
                        ownersellers[1] = tx.sender
                    # ownersellers[countsellers] = tx.sender
                contract.storage[k + owners + 2 + sellers] = ownersellers
                contract.storage[k + owners + 2 + countc] = countsellers + 1
                countsellers = countsellers + 1
            # if ownerbuy:
            #     valuelessfees = ownerbuy + valuelessfees
            # if ownersell:
            #     valuelessfees = ownersell + valuelessfees
            if buyvalue > 0:
                log("Trying to buy, there's %d sellers" % countsellers)
                countsells = 1
                while countsells < countsellers + 1:
                    if valuelessfees > 0 and valuelessfees <= ownersell[countsells]:
                        log("Buying...")
                        # ownersell[countsells + 1] = ownersell[countsells + 2]
                        # countsells = countsells + 1
                        # mktx()
                        # if ownersell[1] > 0:
                        #     ownersell[countsellers + 1] = ownersell[1] + valuelessfees
                        # else:
                        # ownersell[0] = countsellers - 1
                        ownersell[countsells] = ownersell[countsells] - valuelessfees
                        log("Left: %d" % ownersell[countsells])
                        # ownersellers[0] = countsellers - 1
                        if ownersell[countsells] <= 0:
                            ownersell[0] = countsellers - 1
                            ownersellers[countsells] = 0
                        ownerbuy[0] = countbuyers - 1
                        ownerbuyers[0] = countbuyers - 1
                        ownerbuy[countbuyers] = 0
                        ownerbuyers[countbuyers] = 0
                            # ownerbuyers[0] = countbuyers - 1
                        contract.storage[k + owners + 2 + buy] = ownerbuy
                        contract.storage[k + owners + 2 + buyers] = ownerbuyers
                        countbuyers = countbuyers - 1
                        valuelessfees = 0
                        countsells = countsellers

                        contract.storage[k + owners + 2 + sell] = ownersell
                        contract.storage[k + owners + 2 + sellers] = ownersellers
                        contract.storage[k + owners + 2 + countb] = countbuyers
                        contract.storage[k + owners + 2 + countc] = countsellers
                        mktx(ownersellers[countsells], exfee * 0.1, 0, 0)
                        mktx(tx.sender, valuelessfees * 2, 0, 0)
                    else:
                        countsells = countsells + 1
                contract.storage[k + owners + 2 + countc] = countsellers
            if sellvalue > 0:
                log("Trying to sell, there's %s buyers" % countbuyers)
                countbuys = 1
                while countbuys < countbuyers:
                    if valuelessfees > 0 and valuelessfees >= ownerbuy[countbuys]:
                        log("Selling...")
                        # ownerbuy[countbuys + 1] = ownerbuy[countbuys + 2]
                        # ownersell[0] = countsellers - 1
                        ownersell[countsellers] = ownersell[countbuys] - valuelessfees
                        # if leftvalue <= 0:
                        if ownersell[countsellers] <= 0:
                            ownerbuy[0] = countbuyers - 1
                            ownerbuyers[countbuys] = 0

                            ownersell[0] = countsellers - 1
                            ownersellers[0] = countsellers - 1
                        # ownerbuyers[0] = countbuyers - 1
                        # if ownerbuy[countbuys + 1] == 0:
                        # ownerbuyers[countbuys] = 0
                        contract.storage[k + owners + 2 + buy] = ownerbuy
                        contract.storage[k + owners + 2 + buyers] = ownerbuyers

                        # ownersellers[0] = countsellers - 1
                        contract.storage[k + owners + 2 + sell] = ownersell
                        contract.storage[k + owners + 2 + sellers] = ownersellers
                        countsellers = countsellers - 1
                        countbuys = countbuyers
                        contract.storage[k + owners + 2 + countb] = countbuyers
                        contract.storage[k + owners + 2 + countc] = countsellers
                        mktx(ownerbuyers[countbuys], ownerbuy[countbuys] * 2 - fees, 0, 0)
                        mktx(tx.sender, exfee * 0.1, 0, 0)
                    else:
                        countbuys = countbuys + 1

            if contract.storage[k + owners] > owners * 10 ** 18 + owners * 500: # block.account_balance(contract.contract) > 3 * 10 ** 18:
            # if block.address_balance > 6000:
                profit = ownerbalance + exfee - (exfee * 0.1) - owners * 10 ** 18 - 200 * block.basefee
                ownerbalance = ownerbalance - profit
                contract.storage[k + owners] = ownerbalance
                o = 0
                while o < owners:
                    mktx(contract.storage[k + o], profit / owners, 0, 0)
                    o = o + 1
            else:
                contract.storage[k + owners] = ownerbalance + exfee
                ownerbalance = ownerbalance + exfee

            log("Pending exchange data: Buy: " + str(ownerbuy) + ' from ' + str(ownerbuyers) + '; Sell: ' + str(ownersell) + ' from ' + str(ownersellers))


        #
        # V1 -- working sim
        #

        # k = 1000
        # # contractstatus = contract.storage[k]
        # owners = 3
        # if tx.value < 200 * block.basefee:
        #     stop("Insufficient fee")

        # if tx.value < 1 * 10 ** 18:
        #     stop("Insufficient value")

        # ownercount = contract.storage[k + owners + 1]
        # ownerbalance = contract.storage[k + ownercount]
        # if ownercount < owners and ownerbalance == 0:
        #     if tx.value < 1 * 10 ** 18:
        #         stop("Insufficient fee for storage")
        #     contract.storage[k + ownercount] = tx.sender
        #     # if ownercount == 0
        #     #     contract.storage[1000 + owners] = 0
        #     contract.storage[k + owners] += tx.value - block.basefee * 200
        #     contract.storage[k + owners + 1] += 1
        #     log(tx.sender + " is in.")
        #     if contract.storage[k + owners + 1] == owners:
        #         contract.storage[k + owners + 2] = {}
        #         log("Exchange initialized - PIEW PIEW")
        #     # stop("")
        #     # contract.storage[1000] = 1
        #     # contract.storage[1001] = tx.sender

        # elif ownercount >= owners:
        #     feevalue = tx.value - ((tx.value - 2 * 200 * block.basefee) * 1.05)
        #     if tx.value < 5 * (2 * 200 * block.basefee) + feevalue:
        #         stop("Insufficient value")

        #     sellvalue = block.contract_storage(D)[S]
        #     buyvalue = block.contract_storage(D)[B]
        #     # owner = block.contract_storage(D)[O]
        #     owner = tx.sender
        #     ownerbuy = 0
        #     ownersell = 0
        #     exfee = 1000 * block.basefee
        #     fees = (5 * 200 * block.basefee) - exfee
        #     valuelessfees = tx.value - fees
        #     orderbook = contract.storage[k + owners + 2]

        #     try:
        #         storageowner = orderbook[owner]
        #     except:
        #         storageowner = contract.storage[k + owners + 2][owner] = {}

        #     log("Initial exchange data: " + str(contract.storage[k + owners + 2]))

        #     if buyvalue > 0:
        #         log("Buying for " + str(valuelessfees))
        #     try:
        #         ownerbuy = orderbook[owner][B]
        #     except:
        #         contract.storage[k + owners + 2][owner][B] = 0
        #     if buyvalue > 0:
        #         contract.storage[k + owners + 2][owner][B] += valuelessfees
        #     if ownerbuy:
        #         valuelessfees += ownerbuy

        #     if sellvalue > 0:
        #         log("Selling for " + str(valuelessfees))
        #     try:
        #         ownersell = orderbook[owner][S]
        #     except:
        #         contract.storage[k + owners + 2][owner][S] = 0
        #     if sellvalue > 0:
        #         contract.storage[k + owners + 2][owner][S] += valuelessfees
        #     if ownersell:
        #         valuelessfees += ownersell
        #         # contract.storage[k + owners + 2][owner] = { S: valuelessfees }
        #         # contract.storage[k + owners + 2][owner][S] += valuelessfees

        #     log("Pending exchange data: " + str(contract.storage[k + owners + 2]))

        #     for (offer, otherowner) in enumerate(orderbook):
        #         if otherowner:
        #             offervalues = contract.storage[k + owners + 2][otherowner]
        #             if (offervalues[S] > 0):
        #                 print "Offer: " + S + " " + str(offervalues[S]) + " from " + otherowner
        #             if (offervalues[B] > 0):
        #                 print "Offer: " + B + "  " + str(offervalues[B]) + " from " + otherowner

        #             if sellvalue > 0 and offervalues[B] > 0:
        #                 if offervalues[S] >= valuelessfees and offervalues[B] <= valuelessfees:
        #                     contract.storage[k + owners + 2][tx.sender][S] -= valuelessfees
        #                     contract.storage[k + owners + 2][otherowner][B] -= valuelessfees
        #                     mktx(tx.sender, exfee * 0.1, 0, 0)
        #                     mktx(otherowner, valuelessfees * 2, 0, 0)
        #                     log("Order filled")
        #                 else:
        #                     log("-- Minimum offer value not met")
        #             if buyvalue > 0 and offervalues[S] > 0:
        #                 if offervalues[S] >= valuelessfees:
        #                     contract.storage[k + owners + 2][otherowner][S] -= valuelessfees
        #                     contract.storage[k + owners + 2][tx.sender][B] -= valuelessfees
        #                     mktx(tx.sender, valuelessfees * 2, 0, 0)
        #                     mktx(otherowner, exfee * 0.1, 0, 0)
        #                     log("Order filled")
        #                 else:
        #                     log("-- Minimum offer value not met")

        #     profit = ownerbalance + exfee - (exfee * 0.1) - (3 * 10 ** 18)
        #     if profit > owners * 2000:
        #         contract.storage[k + owners] -= profit
        #         for owner in range(owners):
        #             mktx(contract.storage[k + owner], profit / owners, 0, 0)
        #     else:
        #         contract.storage[k + owners] += exfee



        #     log("New exchange data: " + str(contract.storage[k + owners + 2]))
        #     # ethervalue = contract.storage[1001] / block.contract_storage(D)[I]
        #     # log("Ether Value = %s" % ethervalue)
        #     # if ethervalue >= 5000:  # XXX Bug in contract example, value shouldn't be times 10 ** 18
        #     #     mktx(contract.storage[1003], 5000 * 10 ** 18, 0, 0)
        #     # elif block.timestamp > contract.storage[1002]:
        #     #     # XXX Bug in contract example, values should be times 10 ** 18
        #     #     mktx(contract.storage[1003], ethervalue * 10 ** 18, 0, 0)
        #     #     mktx(A, (5000 - ethervalue) * 10 ** 18, 0, 0)


class ExchangeRun(Simulation):

    contract = Exchange(C="caktux", E="eoar", F="fabrezio") #, D="data") #, B="buy", S="sell") # , O="owner")
    ts_zero = 1392632520

    def test_insufficient_fee(self):
        tx = Tx(sender='caktux', value=10)
        self.run(tx, self.contract)
        assert self.stopped == 'Insufficient fee'

    def test_insufficient_value(self):
        tx = Tx(sender='caktux', value=1000)
        self.run(tx, self.contract)
        assert self.stopped == 'Insufficient value'
        assert self.contract.storage[1000] == 0

    def test_creation(self):
        block = Block(timestamp=self.ts_zero)
        tx = Tx(sender='caktux', value=1 * 10 ** 18)
        self.run(tx, self.contract, block)
        tx = Tx(sender='eoar', value=1 * 10 ** 18)
        self.run(tx, self.contract, block)
        tx = Tx(sender='fabrezio', value=1 * 10 ** 18)
        self.run(tx, self.contract, block)
        # assert self.contract.storage[1000] == 1
        # assert self.contract.storage[1001] == 2495000
        # assert self.contract.storage[1002] == self.ts_zero + 30 * 86400
        # assert self.contract.storage[1003] == tx.sender
        # assert len(self.contract.txs) == 0

    def test_sell_one(self):
        block = Block(timestamp=self.ts_zero + 10 * 86400 + 1)
        tx = Tx(sender='caktux', value=1500 * 10 ** 18, data=[0, 1500 * 10 ** 18, 0])
        # block.contract_storage(self.contract.D)[self.contract.O] = tx.sender
        # block.contract_storage(self.contract.D)[self.contract.S] = tx.value - (2 * 200 * block.basefee)
        self.run(tx, self.contract, block)
        # assert len(self.contract.txs) == 1
        # assert self.contract.txs == [('bob', 5000 * 10 ** 18, 0, 0)]

    def test_buy_one(self):
        block = Block(timestamp=self.ts_zero + 15 * 86400 + 1)
        tx = Tx(sender='eoar', value=1200 * 10 ** 18, data=[1200 * 10 ** 18, 0, 0])
        # block.contract_storage(self.contract.D)[self.contract.O] = tx.sender
        # block.contract_storage(self.contract.D)[self.contract.B] = tx.value - (2 * 200 * block.basefee)
        self.run(tx, self.contract, block)

    def test_buy_two(self):
        block = Block(timestamp=self.ts_zero + 20 * 86400 + 1)
        tx = Tx(sender='fabrezio', value=4200 * 10 ** 18, data=[4200 * 10 ** 18, 0, 0])
        # block.contract_storage(self.contract.D)[self.contract.O] = tx.sender
        # block.contract_storage(self.contract.D)[self.contract.B] = tx.value - (2 * 200 * block.basefee)
        self.run(tx, self.contract, block)
        # assert len(self.contract.txs) == 2
        # assert self.contract.txs == [('bob', 623 * 10 ** 18, 0, 0), ('alice', 4377 * 10 ** 18, 0, 0)]

    def test_sell_two(self):
        block = Block(timestamp=self.ts_zero + 25 * 86400 + 1)
        tx = Tx(sender='eoar', value=8000 * 10 ** 21, data=[0, 8000 * 10 ** 18, 0])
        # block.contract_storage(self.contract.D)[self.contract.O] = tx.sender
        # block.contract_storage(self.contract.D)[self.contract.S] = tx.value - (2 * 200 * block.basefee)
        self.run(tx, self.contract, block)

    def test_buy_three(self):
        block = Block(timestamp=self.ts_zero + 26 * 86400 + 1)
        tx = Tx(sender='fabrezio', value=5000 * 10 ** 18, data=[5000 * 10 ** 18, 0, 0])
        # block.contract_storage(self.contract.D)[self.contract.O] = tx.sender
        # block.contract_storage(self.contract.D)[self.contract.B] = tx.value - (2 * 200 * block.basefee)
        self.run(tx, self.contract, block)

    def test_sell_three(self):
        block = Block(timestamp=self.ts_zero + 28 * 86400 + 1)
        tx = Tx(sender='eoar', value=20000 * 10 ** 18, data=[0, 20000 * 10 ** 18, 0])
        # block.contract_storage(self.contract.D)[self.contract.O] = tx.sender
        # block.contract_storage(self.contract.D)[self.contract.S] = tx.value - (2 * 200 * block.basefee)
        self.run(tx, self.contract, block)

    def test_buy_four(self):
        block = Block(timestamp=self.ts_zero + 30 * 86400 + 1)
        tx = Tx(sender='fabrezio', value=2500 * 10 ** 18, data=[2500 * 10 ** 18, 0, 0])
        # block.contract_storage(self.contract.D)[self.contract.O] = tx.sender
        # block.contract_storage(self.contract.D)[self.contract.B] = tx.value - (2 * 200 * block.basefee)
        self.run(tx, self.contract, block)
