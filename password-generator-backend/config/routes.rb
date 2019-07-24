Rails.application.routes.draw do
  resources :accounts
  resources :websites
  resources :users
  post "/login", to: "users#login"
  get "/users/:id", to: "users#show"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
