class Website < ApplicationRecord
  serialize :chars_not_permitted, Array
  belongs_to :user
  has_many :accounts, dependent: :destroy
end
