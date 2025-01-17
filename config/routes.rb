# frozen_string_literal: true

Rails.application.routes.draw do
	mount ActionCable.server => '/cable'

	# Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

	# Defines the root path route ("/")
	# root "articles#index"
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
	resources :users

	resources :course_offerings, only: %i[show]
	resources :lectures, only: %i[show]
	resources :recordings, only: %i[create]
end
