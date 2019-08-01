class WebsitesController < ApplicationController
    def index
        websites = Website.all
        render json: websites, include: [:accounts]
    end

    def show
        website = Website.find(params[:id])
        render json: website, include: [:accounts]
    end

    def create
        website = Website.new(website_params)
        if website.save
            render json: website, include: [:accounts]
        else 
			render json: {"error": website.errors.full_messages}, status: 406
        end
    end

    def update
        website = Website.find(params[:id])
        website.update(website_params)
        if website.save
            render json: website, include: [:accounts]
        else
			render json: {"error": website.errors.full_messages}, status: 406
        end
    end

    def destroy
        website = Website.find(params[:id])
        website.destroy
        render json: website
    end

    private 

    def website_params 
        params.permit(:name, :url, :password_min, :password_max, :user_id, :chars_not_permitted => [])
    end
end
