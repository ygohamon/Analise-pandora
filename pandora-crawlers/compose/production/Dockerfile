FROM node:14-slim

RUN apt-get update \
    && apt-get install -y  wget procps gnupg sudo python make vim musl-dev iproute2 g++ libevent-dev zlib1g zlib1g-dev libssl-dev

RUN wget https://dist.torproject.org/tor-0.4.4.5.tar.gz \
  && tar -xf tor-0.4.4.5.tar.gz \
  && cd tor-0.4.4.5 \
  && ./configure \
  && make \
  && make install \
  && echo 'ControlPort 9051' > /usr/local/etc/tor/torrc \
  && echo 'CookieAuthentication 0' >> /usr/local/etc/tor/torrc

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pm2 \
    && pm2 install pm2-server-monit \
    && pm2 update

RUN groupadd -r pptruser \
    && useradd -r -g pptruser -G audio,video pptruser \
    && adduser pptruser sudo \
    && mkdir -p /home/pptruser/pandora-crawler \
    && chown -R pptruser:pptruser /home/pptruser /usr/local/etc/tor

WORKDIR /home/pptruser/pandora-crawler

EXPOSE 3123

COPY ./compose/production/start /start
RUN sed -i 's/\r//' /start
RUN chmod +x /start && chown -R pptruser:pptruser /start

RUN npm install puppeteer puppeteer-extra puppeteer-cluster


# Instala as dependencias
COPY package*.json ./
RUN npm install

# Copia a aplicacao para o container
COPY tsconfig.json ./
COPY src ./src
COPY compose ./compose
COPY .envs ./.envs

CMD ["/start"]
