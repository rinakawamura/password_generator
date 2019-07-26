Rails.application.routes.draw do
  resources :accounts
  resources :websites
  resources :users
  post "/login", to: "users#login"
  patch "/accounts/username/:id", to: "accounts#update_username"
  patch "/accounts/keys/:id", to: "accounts#update_keys"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
