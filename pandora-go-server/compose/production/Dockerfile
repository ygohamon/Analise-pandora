FROM golang:1.23-bookworm AS build

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/pandora-go-server ./cmd/api

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /server

COPY --from=build /out/pandora-go-server /usr/local/bin/pandora-go-server
COPY ./compose/production/start /start
RUN sed -i 's/\r//' /start && chmod +x /start

EXPOSE 7000

CMD ["/start"]

