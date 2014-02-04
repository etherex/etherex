FROM saucy
MAINTAINER caktux

# Ethereum
# - Build
# sudo docker build -rm -t ethereum - < ./Ethereum-server.Dockerfile
# - Run interactive
# docker run -i -t ethereum bash
# - Run
# docker run -i -t ethereum

EXPOSE 22
EXPOSE 30303

RUN apt-get update --fix-missing -f -y && apt-get upgrade -f -y && apt-get dist-upgrade -f -y

# Install pip if we go with Python
# RUN apt-get install -y easy_install
# RUN easy_install pip

# Install dependencies
# RUN sudo add-apt-repository ppa:kernel-ppa/ppa
RUN apt-get install --fix-missing -y ntp apt-utils python-pip python-dev python-openssl supervisor git sudo ssh openssh-server vim inotify-tools screen build-essential libgmp-dev libgmp3-dev libcrypto++-dev cmake libboost-all-dev automake libtool libleveldb-dev yasm unzip libminiupnpc-dev

# Build specific dependencies
RUN mkdir /ethereum && mkdir /ethereum/cryptopp562 && cd /ethereum/cryptopp562 && wget http://www.cryptopp.com/cryptopp562.zip && unzip cryptopp562.zip && make

RUN cd /ethereum && wget http://gavwood.com/secp256k1.tar.bz2 && tar xjf secp256k1.tar.bz2 && cd secp256k1 && ./configure && make

# Clone latest Ethereum
RUN cd /ethereum && git clone https://github.com/ethereum/cpp-ethereum.git && cd cpp-ethereum && git checkout remotes/origin/poc-1

# Install Python libraries
# RUN pip install pip-tools boto simplejson pycrypto txrequests requests
# -- Ethereum --
# RUN pip install ez-setup leveldb pysha3 pybitcointools
# RUN pip-review -a

# Build Ethereum
RUN mkdir /ethereum/cpp-ethereum/cpp-ethereum-build && cd /ethereum/cpp-ethereum/cpp-ethereum-build && cmake /ethereum/cpp-ethereum/cpp-ethereum-build -DCMAKE_BUILD_TYPE=Release /ethereum/cpp-ethereum && make

# SSH
RUN mkdir /ethereum/log && mkdir /root/.ssh && chmod 700 /root/.ssh && mkdir /var/run/sshd

# Setup supervisord
RUN /bin/echo -e "[supervisord]\n\
nodaemon=true\n\
\n\
[program:ethereum]\n\
directory=/ethereum\n\
user=root\n\
command=/ethereum/server.sh\n\
# exitcodes=0,2\n\
startsecs=0\n\
\n\
[program:ssh]\n\
directory=/ethereum\n\
user=root\n\
command=/ethereum/launch-ssh.sh\n\
# exitcodes=0,2\n\
startsecs=0\n\
" > /etc/supervisor/conf.d/ethereum.conf

# Start Ethereum with some variables, was grabbing them from files on a multi-user setup but you can just set them up for single use
RUN /bin/echo -e "#!/bin/bash\n\
export ZG_ETHEREUM_PORT=30303\n\
export ZG_ETHEREUM_PEER=\n\
export ZG_ETHEREUM_PEERS=5\n\
export ZG_ETHEREUM_TYPE=full\n\
export ZG_ETHEREUM_MINE=on\n\
exec >/dev/tty 2>/dev/tty </dev/tty\n\
# while [ 1 ]; do # From Ethereum build instructions, not a good idea here.\n\
# # Might want to set ZG_ETHEREUM_PEER to some peer for it to connect for now.\n\
# -l 30303 # Can force 30303.\n\
# -u <YourIPaddress> -l 30304 # Maybe that'll work sometimes\n\
HOME=/ethereum screen -s /bin/bash -dmS ethereum /ethereum/cpp-ethereum/cpp-ethereum-build/eth/eth -l \$ZG_ETHEREUM_PORT -p 30303 -o \$ZG_ETHEREUM_TYPE -x \$ZG_ETHEREUM_PEERS -v 9 -m \$ZG_ETHEREUM_MINE > /ethereum/log/eth.log\n\
mv /ethereum/log/eth.log /ethereum/log/eth.log-\$(date +%F_%T)\n\
# done\n\
" > /ethereum/server.sh
RUN chmod +x /ethereum/server.sh

# # Might work, from the Ethereum build instructions, we're using supervisord and screen instead
# RUN /bin/echo -e "\n\
# /ethereum/server.sh &" >> /etc/rc.local

RUN /bin/echo -e "#!/bin/bash\n\
# service ntp start\n\
cp -f /ethereum/log/authorized_keys /root/.ssh/authorized_keys && chmod 644 /root/.ssh/authorized_keys\n\
sed -ri 's/UsePAM yes/#UsePAM yes/g' /etc/ssh/sshd_config && sed -ri 's/#UsePAM no/UsePAM no/g' /etc/ssh/sshd_config\n\
/usr/sbin/sshd\n\
# cd /ethereum/log\n\
# exec >/dev/tty 2>/dev/tty </dev/tty\n\
# screen -s /bin/bash -dmS ethereum_log tail -f /ethereum/log/eth.log | less\n\
" > /ethereum/launch-ssh.sh
RUN chmod +x /ethereum/launch-ssh.sh

# Add "screen -r" to .profile
RUN /bin/echo -e "\n\
cd /ethereum\n\
screen -r\n\
" >> /root/.profile

CMD ["-n", "-c", "/etc/supervisor/conf.d/ethereum.conf"]

ENTRYPOINT ["/usr/bin/supervisord"]
