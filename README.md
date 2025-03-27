# README

Here you'll find information to help develop, debug, and deploy Echolect. To view this document in VSCode, use the keystroke `Shift + CMD + V`

## Things that come up frequently enough and are obscure enough

### Connecting to the database directly

We use a postgres container. To connect to the container, ssh into the application with `ssh root@echolect.co`, navigate to `~/server`. Then `docker exec -it postgres bash`. Then `psql -U {{username}} postgres` to log in (maybe a password will be necessary). Then you can do stuff in there.

## Pesky Issues

`yarn add chokidar` in production after webapp build

If ever in production you get the dreaded <b>Connection not secure</b> error, you can just connect to the server, stop the containers (probably just need to kill the nginx one actually), run `server/bin/init-cert.sh` and restart the containers. CAUTION: Before stopping any containers, be sure you're not going to interrupt anything important or cause data to be lost when peforming this procedure.

Python environment stuff sucks. As of now, I'm using pyenv to manage python versions, and using version 3.12 for the project. The virtual environment for development is managed by direnv. We use `python 3.12.9`, `uv pip install -r requirements.txt` for installing packages, `pyenv`, and hook the python version into `.envrc`. It's a fucking brittle mess.

Deployment to production is flaky. Right (right right) now I'm rebuilding contianers on the server via first `ssh root@echolect.co` from my machine with SSH keys for the droplet, then running `docker compose -f dockerfile.production.yml up`. We'll see if that works. The main pain points seem to be (1) bundling new dependencies, (2) everything else.

The base image Docker For DigitalOcean (I believe, and of which I ought to dispose, as it's overhead isn't necessary and is possibly an anti-pattern) does not include `docker-compose`, so I installed it with `sudo apt install docker-compose`. 3/26/25

## TODO
Copy the models to the production server with: `scp -r services/whisper/models root@echolect.co:server/services/whisper/models`
Look into better sync method