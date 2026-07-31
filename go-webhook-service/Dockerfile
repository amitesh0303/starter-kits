FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -o /bin/server ./cmd/server

FROM alpine:3.20 AS runtime

COPY --from=builder /bin/server /bin/server

ENV PORT=8080
EXPOSE 8080

CMD ["/bin/server"]
