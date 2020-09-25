# 📖 Documentation

This documentation is split up into several parts for a better structure and overview
over the protocols and communitcation methods that CosmicSail utilizes.

## Backend

Our backend is written in Golang with the help of two amazing frameworks,
[Gorm](https://gorm.io) and [Fiber](https://gofiber.io).

- [Authentication](): To use the CosmicSail API, a user has to authenticate over these endpoints
- [v1 User Endpoints](): Endpoints that a user can access to manage their boats
- [v1 Boat Endpoints](): Endpoints which are made for the boat (telemetry updating or data loading)

## Socket Protocol

We are communicating over [Socket.io](https://socket.io) for realtime scenarios,
as it's much more stable and reliable compared to traditional WebSockets.

- [User communication](): Events a user can send/receive to control boats and get data
- [Boat communication](): Events a boat client should implement to work properly
