(function($) {

  EtherEx = {};

  EtherEx.coinbase = "0x995db8d9f8f4dcc2b35da87a3768bd10eb8ee2da";

  EtherEx.addresses = {};
  EtherEx.addresses.trades = "0x6b385354b319a439b36bbeb74f8b8c0517b359ad";
  EtherEx.addresses.xeth = "0x5620133321fcac7f15a5c570016f6cb6dc263f9d";
  EtherEx.addresses.markets = "0x5620133321fcac7f15a5c570016f6cb6dc263f9d";

  EtherEx.markets = {};

  EtherEx.loadMarkets = function() {
    var last = eth.storageAt(EtherEx.addresses.markets, String(2));
    for (var i = 100; i < 100 + parseInt(last) / 1000000; i = i + 5) {
      var id = eth.storageAt(EtherEx.addresses.markets, String(i+4)).dec();
      EtherEx.markets[id] = {
        'id': id,
        'name': eth.storageAt(EtherEx.addresses.markets, String(i)),
        'address': eth.storageAt(EtherEx.addresses.markets, String(i+3)),
        'minamount': eth.storageAt(EtherEx.addresses.markets, String(i+1)).dec(),
        'minprice': eth.storageAt(EtherEx.addresses.markets, String(i+2)).dec(),
      }
    };
    console.log(EtherEx.markets);
  };

  EtherEx.sendXETH = function() {
    eth.transact(
      eth.key,
      "0",
      EtherEx.addresses.xeth,
      eth.secretToAddress(document.getElementById("to").value).pad(32) + document.getElementById("value").value.pad(32),
      "10000",
      eth.gasPrice
    );
  };

  EtherEx.txdata = function() {
    var data = String(1).pad(32);
    data += String(Ethereum.BigInteger(document.getElementById("amount").value).multiply(Ethereum.BigInteger("10").pow(18))).pad(32);
    data += String(Ethereum.BigInteger(document.getElementById("price").value).multiply(Ethereum.BigInteger("10").pow(8))).pad(32);
    data += String(1).pad(32);
    return data;
  };

  EtherEx.check = function () {
    var data = EtherEx.txdata();
    document.getElementById("checkval").innerHTML = data.unbin().substr(2);
  };

  EtherEx.clear = function () {
    document.getElementById("checkval").innerHTML = "";
  };

  EtherEx.buy = function() {
    var data = EtherEx.txdata();

    eth.transact(
      eth.key,
      0,
      EtherEx.coinbase,
      data,
      "100000",
      eth.gasPrice,
      EtherEx.updateBalances
    );
  };

  EtherEx.sell = function() {
    var data = EtherEx.txdata();

    eth.transact(
      eth.key,
      Ethereum.BigInteger(document.getElementById("amount").value).multiply(Ethereum.BigInteger("10").pow(18)),
      EtherEx.coinbase,
      data,
      "100000",
      eth.gasPrice,
      EtherEx.updateBalances
    );
  };

  EtherEx.getOrderbook = function() {
    var startkey = 100;
    var lastkey = eth.storageAt(EtherEx.addresses.trades, "10").dec();

    var table = "<table><tr><th class='book'>Buy</th><th class='book'>Sell</th></tr>";

    document.getElementById("last").innerHTML = lastkey;

    var check = 0;
    var booklength = lastkey / 5;
    var length = startkey + parseInt(lastkey);

    for (var i = startkey; i < length; i = i + 5) {
      var value = eth.storageAt(EtherEx.addresses.trades, String(i).bin()).dec();

      if (value) {
        var type = eth.storageAt(EtherEx.addresses.trades, String(i)).dec();
        var price = Ethereum.BigInteger(eth.storageAt(EtherEx.addresses.trades, String(i+1)).dec()) / Math.pow(10, 8);
        var strprice = price + " ETH/BTC";
        var amount = eth.storageAt(EtherEx.addresses.trades, String(i+2)).dec() / Math.pow(10, 18);
        var stramount = "<br />of " + eth.storageAt(EtherEx.addresses.trades, String(i+2)).dec();
        document.getElementById("lastprice").innerHTML = price;
        var owner = "<br />by " + eth.storageAt(EtherEx.addresses.trades, String(i+3)).substr(2);
        if (price) {
          table += "<tr>\
                <td class='book'>" + ((type == 1) ? strprice + stramount + owner : '') + "</td>\
                <td class='book'>" + ((type == 2) ? strprice + stramount + owner : '') + "</td>\
            </tr>";
          document.getElementById("price").value = price;
        };
        if (amount) {
          document.getElementById("amount").value = amount;
        };
      };
    };
    table += "</table>";
    document.getElementById('book').innerHTML = table;
  };

  EtherEx.updateBalances = function() {
    document.getElementById("eth").innerHTML = eth.balanceAt(eth.coinbase).dec();
    document.getElementById("xeth").innerHTML = eth.storageAt(EtherEx.addresses.xeth, eth.coinbase).dec();
    document.getElementById("tot").innerHTML = eth.balanceAt(EtherEx.coinbase).dec();

    EtherEx.loadMarkets();
    EtherEx.getOrderbook();
  };

  $(document).ready(function() {

    EtherEx.updateBalances();

    $("#buy").on('click', function() {
      EtherEx.buy();
    });
    $("#sell").on('click', function() {
      EtherEx.sell();
    });
    $("#check").on('click', function() {
      EtherEx.check();
    });
    $("#sendxeth").on('click', function() {
      EtherEx.sendXETH();
    });
    $("#refresh").on('click', function() {
      EtherEx.clear();
      EtherEx.updateBalances();
    });

    eth.watch(EtherEx.addresses.xeth, eth.coinbase, EtherEx.updateBalances);
  });

})(jQuery);
