var etherExAddr = "0x995db8d9f8f4dcc2b35da87a3768bd10eb8ee2da";
var tradesAddr = "0x6b385354b319a439b36bbeb74f8b8c0517b359ad";
var xethAddr = "0x5d07190100b7e73def243e52eb9e575b939e20ef";
var gavAddr = "0x929b11b8eeea00966e873a241d4b67f7540d1f38";
sendGav = function() {
  // var data = "0x" + document.getElementById("to").value).pad(32);
  // data += bin(document.getElementById("value").value).pad(32);
  eth.transact(
    eth.key,
    "0",
    gavAddr,
    eth.secretToAddress(document.getElementById("to").value).pad(32) + document.getElementById("value").value.pad(32),
    "10000",
    eth.gasPrice
  );

  // eth.transact(eth.key, "0", gavCoinAddr, eth.secretToAddress(document.getElementById("to").value).pad(32) + document.getElementById("value").value.pad(32), "10000", eth.gasPrice)
};
// check = function () {
//   document.getElementById("check").innerText = unbin(bin(document.getElementById("price").value * Math.pow(10,8)));
// };
// buy = function() {
//   var data = bin(1).pad(32);
//   data += bin(document.getElementById("amount").value * Math.pow(10,18)).pad(32);
//   data += bin(document.getElementById("price").value * Math.pow(10,8)).pad(32);
//   data += bin(1).pad(32);
//   eth.transact(
//     key.secret(eth.key()),
//     0,
//     etherExAddr,
//     data,
//     "100000",
//     eth.gasPrice(),
//     updateBalances
//   );
// };
// sell = function() {
//   var data = bin(2).pad(32);
//   data += bin(document.getElementById("amount").value * Math.pow(10,18)).pad(32);
//   data += bin(document.getElementById("price").value * Math.pow(10,8)).pad(32);
//   data += bin(1).pad(32);
//   eth.transact(
//     key.secret(eth.key()),
//     document.getElementById("amount").value * Math.pow(10,18),
//     etherExAddr,
//     data,
//     "100000",
//     eth.gasPrice(),
//     updateBalances
//   );
// };
getOrderbook = function() {
  var table = "<table><tr><th class='book'>Buy</th><th class='book'>Sell</th></tr>";
  var startkey = 100;
  var lastkey = eth.storageAt(tradesAddr, 10).dec();
  document.getElementById("last").innerHTML = lastkey;
  // var trades = u256.toValue(eth.storageAt(tradesAddr, u256.value(startkey)));
  // var prices = eth.keys;
  var check = 0;
  var booklength = lastkey / 5;
  for (var i = startkey; i < startkey + lastkey; i = i + 5) {
    // myaddr = u256.toValue(u256.fromAddress(key.address(indexes[i])));
    // price = indexes[i][1];
    var value = eth.storageAt(tradesAddr, i).dec();
    if (value) {
      var type = eth.storageAt(tradesAddr, i).dec();
      var price = eth.storageAt(tradesAddr, i+1).dec() / Math.pow(10, 8);
      var strprice = price + " ETH/BTC";
      var amount = eth.storageAt(tradesAddr, i+2).dec() / Math.pow(10, 18);
      var stramount = "<br />of " + eth.storageAt(tradesAddr, i+2).dec();
      document.getElementById("lastprice").innerHTML = price;
      var owner = "<br />by " + key.toAbridged(eth.storageAt(tradesAddr, i+3)).substr(2);
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
updateBalances = function() {
  // getOrderbook();
  document.getElementById("eth").innerHTML = eth.balanceAt(eth.coinbase).dec();
  document.getElementById("xeth").innerHTML = eth.balanceAt(xethAddr).dec();
  document.getElementById("gav").innerHTML = eth.storageAt(gavAddr, eth.coinbase).dec();
  document.getElementById("tot").innerHTML = eth.balanceAt(etherExAddr).dec();
};

$(document).ready(function() {
  eth.watch(xethAddr, eth.coinbase, updateBalances);
  updateBalances();
});
