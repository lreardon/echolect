# README

## Pesky Issues

<p>If ever in production you get the dreaded <b>Connection not secure</b> error, you can just connect to the server, stop the containers (probably just need to kill the nginx one actually), run `server/bin/init-cert.sh` and restart the containers. CAUTION: Before stopping any containers, be sure you're not going to interrupt anything important or cause data to be lost when peforming this procedure.</p>

<p>Python environment stuff sucks. As of now, I'm using pyenv to manage python versions, and using version 3.12 for the project. The virtual environment for development is managed by direnv. We use `python 3.12.9`, `uv pip install -r requirements.txt` for installing packages, `pyenv`, and hook the python version into `.envrc`. It's a fucking brittle mess.</p>

<p>Deployment to production is flaky. Right (right right) now I'm rebuilding contianers on the server via first `ssh root@echolect.co` from my machine with SSH keys for the droplet, then running `docker compose -f dockerfile.production.yml up`. We'll see if that works. The main pain points seem to be (1) bundling new dependencies, (2) everything else.</p>
