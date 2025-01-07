FROM ruby:3.4.1 AS base

RUN apt-get update -qq && apt-get install -y build-essential apt-utils libpq-dev nodejs ffmpeg

# Install yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
	&& echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
	&& apt-get update && apt-get install -y yarn


WORKDIR /docker/app

COPY Gemfile* ./

ADD . /docker/app

RUN bundle install

ARG DEFAULT_PORT 3000

EXPOSE ${DEFAULT_PORT}

CMD [ "bundle","exec", "puma", "config.ru"] # CMD ["rails", "server"] # you can also write like this.