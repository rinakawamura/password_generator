class Website < ApplicationRecord
  serialize :chars_not_permitted, Array
  belongs_to :user
  has_many :accounts, dependent: :destroy

  validates :name, :presence => {:message => 'Please enter website name'}
  validates :url, :presence => {:message => 'Please enter website URL'}

  validates :name, uniqueness: true
end
