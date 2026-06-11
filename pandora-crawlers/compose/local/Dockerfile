FROM node:14-slim

RUN apt-get update \
    && apt-get install -y wget gnupg sudo python make g++ libevent-dev zlib1g zlib1g-dev libssl-dev

RUN sudo apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
    libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
    libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
    libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
    fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils

RUN wget https://dist.torproject.org/tor-0.4.4.5.tar.gz \
  && tar -xf tor-0.4.4.5.tar.gz \
  && cd tor-0.4.4.5 \
  && ./configure \
  && make \
  && make install \
  && echo 'ControlPort 9051' > /usr/local/etc/tor/torrc \
  && echo 'CookieAuthentication 0' >> /usr/local/etc/tor/torrc

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r pptruser \
    && useradd -r -g pptruser -G audio,video pptruser \
    && adduser pptruser sudo \
    && mkdir -p /home/pptruser/pandora-crawler \
    && chown -R pptruser:pptruser /home/pptruser /usr/local/etc/tor

EXPOSE 3123

COPY ./compose/local/start /start
RUN sed -i 's/\r//' /start
RUN chmod +x /start && chown -R pptruser:pptruser /start

WORKDIR /home/pptruser/pandora-crawler

# Run everything after as non-privileged user.
# USER pptruser

RUN npm install puppeteer puppeteer-extra puppeteer-cluster

# Instala as dependencias
COPY package*.json ./
RUN npm install

# Copia a aplicacao para o container
COPY tsconfig.json ./
COPY src ./src
COPY compose ./compose
COPY .envs ./.envs

# RUN chown -R pptruser:pptruser /home/pptruser

CMD ["/start"]
