class WebsitesController < ApplicationController

    def create
        website = Website.create(website_params)
        render json: website, include: [:accounts]
    end

    def index
        websites = Website.all
        render json: websites, include: [:accounts]
    end

    def show
        website = Website.find(params[:id])
        render json: website, include: [:accounts]
    end

    private 

    def website_params 
        params.permit(:name, :url, :password_min, :password_max, :chars_not_permitted, :key, :special_char, :char_frequency, :digit, :digit_frequency, :hint, :user_id)
    end
end
