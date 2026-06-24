FROM golang:1.23-bookworm

WORKDIR /server

COPY go.mod go.sum ./
RUN go mod download

COPY . .

COPY ./compose/local/start /start
RUN sed -i 's/\r//' /start && chmod +x /start

EXPOSE 7000

CMD ["/start"]

