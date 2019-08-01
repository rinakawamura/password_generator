# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_07_24_132819) do

  create_table "accounts", force: :cascade do |t|
    t.string "username"
    t.string "key"
    t.string "special_char"
    t.integer "char_frequency"
    t.integer "digit"
    t.integer "digit_frequency"
    t.text "hint", default: "No hint provided."
    t.integer "website_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["website_id"], name: "index_accounts_on_website_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "password_digest"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "websites", force: :cascade do |t|
    t.string "name"
    t.string "url"
    t.integer "password_min"
    t.integer "password_max"
    t.text "chars_not_permitted", default: "--- []\n"
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_websites_on_user_id"
  end

end
