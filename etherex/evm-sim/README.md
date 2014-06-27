# Ethereum VM Contract Simulator

## Description

Simulator of the Ethereum Virtual Machine. The intention of this simulator is
to help contract coders develop and test their work using test driven best
practises and in full isolation, without the need to connect to the Ethereum
Test Net. It currently support the Serpent, LLL and Mutan languages.

## Working Examples

| Name            | Contract file                                     | Test                                             |
| --------------- | --------------------------------------------------| ------------------------------------------------ |
| Namecoin        | [namecoin.se](examples/namecoin.se)               | [test\_namecoin.py](tests/test_namecoin.py)      |
| Subcurrency     | [subcurrency.se](examples/subcurrency.se)         | [test\_subcurrency.py](tests/test_subcurrency.py)|
| ReturnTen       | [returnten.se](examples/returnten.se)             | [test\_returnten.py](tests/test_returnten.py)    |
| Datafeed        | [datafeed.se](examples/datafeed.se)               | [test\_datafeed.py](tests/test_datafeed.py)      |

## Installation

Install the required Python libraries with `pip`, it is suggested to do this within a [virtualenv](http://virtualenv.readthedocs.org/).

` pip install -r requirements.txt`

To use Serpent, the `serpent` compiler binary needs to be installed and available on the PATH; install it from https://github.com/ethereum/serpent/

To use LLL, the `lllc` compiler binary needs to be installed and available on the PATH; install it from https://github.com/ethereum/cpp-ethereum/

To use Mutan, the `mutan` compiler binary needs to be installed and available on the PATH; install it from https://github.com/obscuren/mutan

## Usage

` py.test tests/test_namecoin.py`

Continious testing (will rerun as soon as a file is changed)

` py.test -f tests/test_namecoin.py`

## License

Released under the MIT License.
