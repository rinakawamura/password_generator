class UsersController < ApplicationController
    def login
		user = User.find_by(email: params[:email])
		if user
			render json: user
		else
			render json: {error: "No user found", status: 401}
		end
    end
    
    def show
		user = User.find(params[:id])
		render json: user
	end
end
