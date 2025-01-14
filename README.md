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

<p>If ever in production you get the dreaded <b>Connection not secure</b> error, you can just connect to the server, stop the containers (probably just need to kill the nginx one actually), run `server/bin/init-cert.sh` and restart the containers. CAUTION: Before stopping any containers, be sure you're not going to interrupt anything important or cause data to be lost when peforming this procedure.</p>