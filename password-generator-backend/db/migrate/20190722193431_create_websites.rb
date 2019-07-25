class CreateWebsites < ActiveRecord::Migration[5.2]
  def change
    create_table :websites do |t|
      t.string :name
      t.string :url
      t.integer :password_min
      t.integer :password_max
      t.text :chars_not_permitted, default: [].to_yaml
      t.references :user, foreign_key: true

      t.timestamps
    end
  end
end
