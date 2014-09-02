/* etherex.js -- EtherEx frontend
 *
 * Copyright (c) 2014 EtherEx
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

(function($) {

  EtherEx = {};

  EtherEx.getAddress = function(_a) {
    ret = "";
    for (var i in EtherEx.addresses.namereg) {
      ret = eth.stateAt(EtherEx.addresses.namereg[i], _a).substr(2);
      if (ret.length == 40)
        return ret;
    }
    return ret;
  };

  EtherEx.getName = function(_a) {
    ret = "";
    for (var i in EtherEx.addresses.namereg) {
      ret = eth.stateAt(EtherEx.addresses.namereg[i], "0x" + _a).bin().unpad();
      if (ret.length > 0)
        return ret;
    }
    return ret;
  };


  // TODO - checks and clear?

  // EtherEx.check = function () {
  //   var data = EtherEx.txdata(1, 1);
  //   document.getElementById("checkval").innerHTML = "<p>" + data.unbin().substr(2) + "</p>";

  //   var pdata = "";
  //   var adata = $("#data").val().split(" ");
  //   for (var d in adata)
  //     pdata += String(adata[d]).pad(32)
  //   document.getElementById("checkval").innerHTML += "<p>" + pdata.unbin().substr(2) + "</p>";
  // };

  // EtherEx.clear = function () {
  //   document.getElementById("checkval").innerHTML = "";
  //   document.getElementById("log").innerHTML = "";
  // };


  // TODO - reimplement trade actions - in progress


  // TODO - reimplement orderbook - in progress


  // TODO - implement XBTC

  // EtherEx.btcBalances = function(keys) {
  //   // document.getElementById("log").innerHTML = keys.length;
  //   $("#addressbook > table > tbody tr.btc").remove();

  //   for (var i = keys.length - 1; i >= 0; i--) {
  //     var key = keys[i];
  //     // console.log(key);
  //     // $("#log").append(i + "...");
  //     $.get("https://api.blockcypher.com/v1/btc/main/addrs/" + key.address, function (info) {
  //       // $("#log").append(i + ";");
  //       // console.log(info);
  //       var entry = $('<tr class="btc"><td><div><span class="address">' + key.address + "</span></div></td><td>" + info.final_balance / 100000000  + " BTC</td></tr>");
  //       $("#addressbook > table > tbody").append(entry);
  //     });
  //     // .fail( function() {
  //     //   var entry = $('<tr><td><div><span class="address">' + key.address + "</span></div></td><td>0 BTC</td></tr>");
  //     //   $("#addressbook > table > tbody").append(entry);
  //     // });
  //   };
  // }



  // TODO - reimplement transactions lists (wallets)

  // EtherEx.transactions = function(addrs) {
  //   var confirmed = 0;
  //   var unconfirmed = 0;
  //   addrs.forEach(
  //     function(x) {
  //       confirmed -=- eth.balanceAt(x, -1).dec();
  //       unconfirmed -=- eth.balanceAt(x).dec();
  //     }
  //   );

  //   document.getElementById('eth').innerHTML = (unconfirmed > confirmed ? EtherEx.formatBalance(confirmed) + "<br /><sup>(" + EtherEx.formatBalance(unconfirmed - confirmed) + " unconfirmed)</sup>" : EtherEx.formatBalance(unconfirmed));

  //   var latest = eth.messages({latest: -1});

  //   var lh = $("#latest").html("");
  //   var s = latest.length - 1;

  //   for (i in latest)
  //   {
  //     var l = latest[s - i];
  //     var ours = (addrs.indexOf(l.from) != -1 || addrs.indexOf(l.to) != -1)
  //     if (l.to != "".pad(20).unbin() && ours)
  //     {
  //       var dest = wesent ? l.to : l.input.bin().substr(12, 20).unbin();
  //       // $("#log").append("<br />" + dest);
  //       var wegot = addrs.indexOf(dest) != -1;
  //       var wesent = addrs.indexOf(l.from) != -1;

  //       var sub = false;
  //       $(EtherEx.markets).each( function(i, market) {
  //         if (l.to == market.address) {
  //           sub = market.name;
  //         }
  //       });

  //       lh.append('<li>' +
  //         '<span class="timestamp" title="' + new Date(l.timestamp * 1000).toLocaleString() + '">' + new Date(l.timestamp * 1000).toLocaleTimeString() + "</span>" +
  //         (wesent ? wegot ? '<span class="xfer"><span class="name">XFER' : '<span class="out"><span class="name">OUT' : '<span class="in"><span class="name">IN') + '</span>' +
  //         '<span class="value">' + (sub ? l.input.bin().substr(32, 32).dec() + ' ' + sub : (l.value ? EtherEx.formatBalance(l.value.dec()) : '')) + '</span>' +
  //         '' + (!wesent ? '<span class="from address"><span class="ind">&lt;</span>' + l.from + '</span>' : !wegot ? '<span class="to address"><span class="ind">&gt;</span>' + (sub ? dest : l.to) + '</span>' : "") + '</span>' +
  //         (l.age ? l.age < 6 ?
  //           '<span class="confirms">' + l.age + ' CONFIRMATIONS</span>' : "" :
  //           '<span class="unconfirmed">UNCONFIRMED</span>'
  //         ) +
  //       '</li>');
  //     }
  //   }
  // };



  // TODO - reimplement wallet

      // document.getElementById("tot").innerHTML = EtherEx.formatBalance(eth.balanceAt(EtherEx.markets[0].address).dec());

      // for (var i = EtherEx.addrs.length - 1; i >= 0; i--) {
      //   var addr = EtherEx.addrs[i]; // eth.secretToAddress(eth.keys[i]);
      //   var bal = EtherEx.formatBalance(eth.balanceAt(addr).dec());
      //   var entry = $('<tr><td><div><span class="address">' + addr.substr(2) + "</span></div></td><td>" + bal + "</td></tr>");

      //   $("#addressbook > table > tbody").append(entry);

      //   try {
      //     for (var m = EtherEx.markets.length - 1; m >= 1; m--) {
      //       var subbal = EtherEx.formatBalance(eth.stateAt(EtherEx.markets[m].address, addr).dec());
      //       var subentry = $('<tr><td class="sub">+ ' + '</td><td><span class="address">' + subbal + "</span> " + EtherEx.markets[m].name + "</td></tr>");

      //       $("#addressbook > table > tbody").append(subentry);
      //     };
      //   }
      //   catch (e) {
      //     EtherEx.showError(e);
      //   }
      // };

      // // BTC wallet
      // // localStorage.removeItem("etherex_btckeys");
      // // sessionStorage.removeItem("etherex_btckeys");
      // var btckeys = sessionStorage.getItem("etherex_btckeys");
      // // console.log(btckeys);
      // if (typeof(btckeys) === "undefined" || btckeys == null) {
      //   // TODO Create multisigaddress - http://dev.blockcypher.com/#multisig
      //   var btckeys = [];
      //   $.post("https://api.blockcypher.com/v1/btc/main/addrs", function (key) {
      //     // console.log(key);
      //     btckeys.push(key);
      //     sessionStorage.setItem("etherex_btckeys", JSON.stringify(btckeys));
      //     EtherEx.btcBalances(btckeys);
      //   });
      // }
      // else {
      //   btckeys = JSON.parse(btckeys);
      //   EtherEx.btcBalances(btckeys);
      // }

      // EtherEx.getOrderbook();

      // EtherEx.transactions(EtherEx.addrs);



  // $(document).ready(function() {

    // TODO reimplement basic watches

    // if (!ethBrowser) {
    //   window.eth.stateAt = window.eth.storageAt;
    //   window.eth.messages = function() { return {}; };

    //   for (var i = eth.keys.length - 1; i >= 0; i--)
    //     eth.watch(eth.secretToAddress(eth.keys[i]), "", EtherEx.updateBalances);

    //   EtherEx.loadMarkets();

    //   for (var i = EtherEx.markets.length - 1; i >= 1; i--)
    //     eth.watch(EtherEx.markets[i].address, "", EtherEx.updateBalances);
    // }
    // else {
    //   var addrs = [];
    //   for (var i = eth.keys.length - 1; i >= 0; i--)
    //     addrs.push(eth.secretToAddress(eth.keys[i]));

    //   EtherEx.loadMarkets();

    //   for (var i = EtherEx.markets.length - 1; i >= 1; i--)
    //     addrs.push(EtherEx.markets[i].address);

    //   eth.watch({altered: addrs}).changed(EtherEx.updateBalances);
    // }


    // TODO - graphs

    // var graph = new Rickshaw.Graph( {
    //   element: document.querySelector("#chart"),
    //   series: [{
    //     color: 'lightblue',
    //     data: [
    //       { x: 0, y: 40 },
    //       { x: 1, y: 49 },
    //       { x: 2, y: 38 },
    //       { x: 3, y: 30 },
    //       { x: 4, y: 32 } ]
    //   }]
    // });
    
    // graph.setRenderer('line');

    // var axes = new Rickshaw.Graph.Axis.Time( { graph: graph } );

    // graph.render();



    // TODO - checks (balance, minimums per market, etc)

    // $("#check").on('click', function() {
    //   EtherEx.check();
    // });

    // $("#buy").on('click', function() {
    //   var amount = $("#amount").val();
    //   var bigamount = Ethereum.BigInteger(amount).multiply(Ethereum.BigInteger("10").pow(18));
    //   var stramount = EtherEx.formatBalance(bigamount);
    //   var price = $("#price").val();
    //   var value = bigamount.divide(Ethereum.BigInteger(price));

    //   // TODO - get minimum amount from market

    //   if (amount < 10) {
    //     alert("Insufficient amount, 10 ETH required");
    //     return;
    //   }

    //   var balance = Ethereum.BigInteger(eth.stateAt(EtherEx.markets[1].address, EtherEx.addrs[0]).dec());

    //   if (balance.compareTo(bigamount) < 0) {
    //     alert("Insufficient balance, you have " + EtherEx.formatBalance(balance) + " and need " + EtherEx.formatBalance(bigamount));
    //     return;
    //   }

    //   // TODO - reimplement confirmations

    //   if (window.confirm("Buy " + amount + " ETH at " + price + " ETH/ETX for " + value + " ETX?")) {
    //     EtherEx.buy();
    //   }
    // });

    // $("#sell").on('click', function() {
    //   var amount = $("#amount").val();
    //   var bigamount = Ethereum.BigInteger(amount).multiply(Ethereum.BigInteger("10").pow(18));
    //   var stramount = EtherEx.formatBalance(bigamount);
    //   var price = $("#price").val();
    //   var value = bigamount.divide(Ethereum.BigInteger(price));

    //   // TODO - get minimum amount from market
    //   if (amount < 10) {
    //     alert("Insufficient amount, 10 ETH required");
    //     return;
    //   }

    //   var balance = Ethereum.BigInteger(eth.balanceAt(EtherEx.addrs[0]).dec());

    //   if (balance.compareTo(bigamount) < 0) {
    //     alert("Insufficient balance, you have " + EtherEx.formatBalance(balance) + " and need " + EtherEx.formatBalance(bigamount));
    //     return;
    //   }

    //   // TODO - reimplement confirmations
    //   if (window.confirm("Sell " + amount + " ETH at " + price + " ETH/ETX for " + value + " ETX?")) {
    //     EtherEx.sell();
    //   }
    // });



    // TODO - reimplement NameReg integrations

    // $("#to,#tto").on('keyup', function(e) {
    //   this.addr = EtherEx.getAddress($(this).val());
    //   if (this.addr.length == 40)
    //     $(this).val(this.addr);

    //   this.namereg = EtherEx.getName($(this).val());
    //   if (this.namereg.length > 0) {
    //     $(this).css('color', 'rgba(0,0,0,.15)');
    //     $(this).next('span').html(this.namereg);
    //   }
    //   else {
    //     $(this).css('color', 'rgba(0,0,0)');
    //     $(this).next('span').html("");
    //   }
    // });
    // $("#to,#tto").on('focus', function() {
    //   $(this).css('color', 'rgba(0,0,0)');
    //   $(this).next('span').html("");
    // });

    // $("#toname").on('click', function() {
    //   $("#to").focus();
    // });

    // $("#addr").on('keyup', function(e) {
    //   this.namereg = EtherEx.getName($(this).val());
    //   if (this.namereg.length > 0)
    //     $("#addrResult").html(this.namereg);
    //   else
    //     $("#addrResult").html("");
    // });



    // TODO - reimplement simple wallet functions

    // EtherEx.sendETH = function() {
    //   eth.transact(
    //     eth.key,
    //     String(Ethereum.BigInteger($("#value").val()).multiply(Ethereum.BigInteger("10").pow(18))),
    //     "0x" + $("#to").val(),
    //     "",
    //     "500",
    //     eth.gasPrice
    //   );
    // };

    // EtherEx.sendETX = function() {
    //   eth.transact(
    //     eth.key,
    //     "0",
    //     EtherEx.markets[1].address,
    //     ("0x" + document.getElementById("to").value).pad(32) + document.getElementById("value").value.pad(32),
    //     "1000",
    //     eth.gasPrice
    //   );
    // };

    // $("#sendeth").on('click', function() {
    //   if ($("#to").val() == "") {
    //     alert("Please provide a recipient address.");
    //     return;
    //   }
    //   if (window.confirm("Send " + $("#value").val() + " ETH to " + $("#to").val() + " ?")) {
    //     EtherEx.sendETH();
    //   }
    // });

    // $("#sendetx").on('click', function() {
    //   if ($("#to").val() == "") {
    //     alert("Please provide a recipient address.");
    //     return;
    //   }
    //   if (window.confirm("Send " + $("#value").val() + " ETX to " + $("#to").val() + " ?")) {
    //     EtherEx.sendETX();
    //   }
    // });



    // TODO - subcurrency creation tool

    // $("#create").on('click', function() {
    //   if ($("#code").val() == "") {
    //     alert("Please provide the compiled contract code.");
    //     return;
    //   }
    //   if (window.confirm("Create contract with " + $("#gas").val() + " gas?")) {
    //     EtherEx.create();
    //   }
    // });



    // TODO - basic transact?

    // $("#transact").on('click', function() {
    //   if (window.confirm("Make transaction with " + $("#tgas").val() + " gas?")) {
    //     EtherEx.transact(
    //       $("#tto").val(),
    //       $("#tgas").val(),
    //       $('#tval').val(),
    //       $('#data').val()
    //       // EtherEx.coinbase.pad(32)
    //       // EtherEx.init[0].pad(32) + EtherEx.init[1].pad(32) + EtherEx.init[2].pad(32) + EtherEx.init[3].pad(32)
    //     );
    //   }
    // });

    // $("#refresh, #clear").on('click', function() {
    //   EtherEx.clear();
    //   EtherEx.updateBalances();
    // });

  // });

})(jQuery);
