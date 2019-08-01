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

		if user && user.authenticate(params["password"])
			render json: user
		else
			render json: {error: "Incorrect email or password", status: 401}
		end
    end
    
    def show
		user = User.find(params[:id])
		render json: user
	end

	def update
		user = User.find(params[:id])
		user.update(update_params)
		render json: user
	end

	def updatePassword
		user = User.find(params[:id])
		if user.authenticate(params[:current_password])
			user.update(password_params)
			if user.save 
				render json: user
			else
				render json: {"error": user.errors.full_messages}, status: 406
			end
		else
			render json: {"error": ["Current password is incorrect"]}, status: 406
		end
	end		

	private 

	def user_params 
		params.permit(:name, :email, :password, :password_confirmation)
	end

	def update_params 
		params.permit(:name, :email)
	end

	def password_params
		params.permit(:password, :password_confirmation)
	end
end
