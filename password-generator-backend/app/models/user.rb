class User < ApplicationRecord
    has_many :websites

    validates :name, presence: true
    validates :email, presence: true
    validates :email, uniqueness: true
end
