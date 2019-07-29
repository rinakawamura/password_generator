class UsersController < ApplicationController
	def create 
		user = User.new(user_params)
		if user.save
			render json: user
		else
			render json: {"error": user.errors.full_messages}, status: 406
		end
	end
	
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

	private 
	def user_params 
		params.permit(:name, :email)
	end
end
