class Account < ApplicationRecord
    belongs_to :website

    validates :username, presence: {message: 'Please enter your username'}
    validates :key, :presence => {:message => 'Please enter key word/phrase to generate keys'}

end
