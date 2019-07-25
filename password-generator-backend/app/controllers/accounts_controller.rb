class AccountsController < ApplicationController
    def index
        accounts = Account.all
        render json: accounts
    end

    def show
        account = Account.find(params[:id])
        render json: account
    end

    def create
        account = Account.create(account_params)
        render json: account
    end

    private

    def account_params 
        params.permit(:username, :key, :special_char, :char_frequency, :digit, :digit_frequency, :hint, :website_id)
    end
    
end