var Ethereum = require("ethereumjs-lib");

var units = {
  "Uether": Ethereum.BigInteger("1000000000000000000000000000000000000000000000000000000"),
  "Vether": Ethereum.BigInteger("1000000000000000000000000000000000000000000000000000"),
  "Dether": Ethereum.BigInteger("1000000000000000000000000000000000000000000000000"),
  "Nether": Ethereum.BigInteger("1000000000000000000000000000000000000000000000"),
  "Yether": Ethereum.BigInteger("1000000000000000000000000000000000000000000"),
  "Zether": Ethereum.BigInteger("1000000000000000000000000000000000000000"),
  "Eether": Ethereum.BigInteger("1000000000000000000000000000000000000"),
  "Pether": Ethereum.BigInteger("1000000000000000000000000000000000"),
  "Tether": Ethereum.BigInteger("1000000000000000000000000000000"),
  "Gether": Ethereum.BigInteger("1000000000000000000000000000"),
  "Mether": Ethereum.BigInteger("1000000000000000000000000"),
  "Kether": Ethereum.BigInteger("1000000000000000000000"),
  "ether" : Ethereum.BigInteger("1000000000000000000"),
  "finney": Ethereum.BigInteger("1000000000000000"),
  "szabo" : Ethereum.BigInteger("1000000000000"),
  "Gwei"  : Ethereum.BigInteger("1000000000"),
  "Mwei"  : Ethereum.BigInteger("1000000"),
  "Kwei"  : Ethereum.BigInteger("1000"),
  "wei"   : Ethereum.BigInteger("1")
};

module.exports = units;