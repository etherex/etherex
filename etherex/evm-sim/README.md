# Ethereum VM Contract Simulator

## Description

Simulator of the Ethereum Virtual Machine. The intention of this simulator is
to help contract coders develop and test their work using test driven best
practises and in full isolation, without the need to connect to the Ethereum
Test Net.

## Working Examples

| Name            | Contract file                                     | Test                                             |
| --------------- | --------------------------------------------------| ------------------------------------------------ |
| Namecoin        | [namecoin.se](examples/namecoin.se)               | [test\_namecoin.py](tests/test_namecoin.py)      |
| Subcurrency     | [subcurrency.se](examples/subcurrency.se)         | [test\_subcurrency.py](tests/test_subcurrency.py)|
| ReturnTen       | [returnten.se](examples/returnten.se)             | [test\_returnten.py](tests/test_returnten.py)    |

## Installation

` pip install -r requirements.txt`

## Usage

` py.test tests/test_namecoin.py`

Continious testing (will rerun as soon as a file is changed)

` py.test -f tests/test_namecoin.py`

## License

Released under the MIT License.
