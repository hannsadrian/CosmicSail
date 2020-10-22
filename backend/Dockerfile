FROM golang AS build-go
WORKDIR /rudder
COPY go.mod .
COPY go.sum .
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /bin/rudder .

FROM alpine:latest
RUN addgroup -S rudder && adduser -S rudder -G rudder
USER rudder
WORKDIR /home/rudder
COPY --from=build-go /bin/rudder ./

RUN mkdir ./static
COPY ./static ./static

EXPOSE 3000
EXPOSE 3030
ENTRYPOINT ["./rudder"]