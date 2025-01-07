# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...

## Pesky Issues

<p>If ever in production you get the dreaded `Connection not secure` error, just go into the droplet, kill the containers, run `server/bin/init-cert.sh` and restart the containers.</p>