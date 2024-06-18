# frozen_string_literal: true

Rails.application.routes.draw do
	mount ActionCable.server => '/cable'

	root 'pages#home'
	get 'offline' => 'pages#offline'

	get '/service-worker.js' => 'service_worker#service_worker'
	get '/manifest.json' => 'service_worker#manifest'

	resource :example, constraints: -> { Rails.env.development? }
	resources :chats, only: %i[show]
	resources :messages, only: %i[create destroy]

	devise_for :users, controllers: {
		registrations: 'users/registrations'
	}
	# Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

	# Defines the root path route ("/")
	# root "articles#index"
end
