FROM redis:6-buster

RUN apt-get update && \
    apt-get install -y iproute2 vim

COPY ./scripts/redis.conf /usr/local/etc/redis/redis.conf
CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]