class CreateAccounts < ActiveRecord::Migration[5.2]
  def change
    create_table :accounts do |t|
      t.string :username
      t.string :key
      t.string :special_char
      t.integer :char_frequency
      t.integer :digit
      t.integer :digit_frequency
      t.text :hint, default: "No hint provided."
      t.references :website, foreign_key: true

      t.timestamps
    end
  end
end
