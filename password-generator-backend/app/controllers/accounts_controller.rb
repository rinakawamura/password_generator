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
        account = Account.new(account_params)
        if account.save 
            render json: account
        else
            render json: {"error": account.errors.full_messages}, status: 406
        end
    end

    def update_username
        account = Account.find(params[:id])
        account.update(username: params[:username])
        render json: account
    end

    def update_keys
        account = Account.find(params[:id])
        account.update(key_params)
        render json: account
    end

    def destroy
        account = Account.find(params[:id])
        account.destroy
    end

    private

    def account_params 
        params.permit(:username, :key, :special_char, :char_frequency, :digit, :digit_frequency, :hint, :website_id)
    end

    def key_params
        params.permit(:key, :special_char, :char_frequency, :digit, :digit_frequency)
    end
    
end
