# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_01_07_060344) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "chat_memberships", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "chat_id", null: false
    t.boolean "good_standing", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chat_id"], name: "index_chat_memberships_on_chat_id"
    t.index ["user_id", "chat_id"], name: "index_chat_memberships_on_user_id_and_chat_id", unique: true
    t.index ["user_id"], name: "index_chat_memberships_on_user_id"
  end

  create_table "chats", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.string "code", null: false
    t.index ["code"], name: "index_chats_on_code", unique: true
    t.index ["user_id"], name: "index_chats_on_user_id"
  end

  create_table "course_offerings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "institution_id"
    t.uuid "user_id"
    t.uuid "course_id"
    t.uuid "course_session_id"
    t.index ["course_id"], name: "index_course_offerings_on_course_id"
    t.index ["course_session_id"], name: "index_course_offerings_on_course_session_id"
    t.index ["institution_id"], name: "index_course_offerings_on_institution_id"
    t.index ["user_id"], name: "index_course_offerings_on_user_id"
  end

  create_table "course_sessions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "institution_id"
    t.index ["institution_id"], name: "index_course_sessions_on_institution_id"
  end

  create_table "courses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "institution_id"
    t.index ["institution_id"], name: "index_courses_on_institution_id"
  end

  create_table "institutional_affiliations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "institution_id", null: false
    t.uuid "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_lecturer", default: false
    t.index ["institution_id"], name: "index_institutional_affiliations_on_institution_id"
    t.index ["is_lecturer"], name: "index_institutional_affiliations_on_is_lecturer"
    t.index ["user_id"], name: "index_institutional_affiliations_on_user_id"
  end

  create_table "institutions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "messages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "body"
    t.uuid "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "chat_id"
    t.index ["chat_id"], name: "index_messages_on_chat_id"
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "reactions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "emoji"
    t.uuid "user_id", null: false
    t.uuid "chat_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chat_id"], name: "index_reactions_on_chat_id"
    t.index ["user_id"], name: "index_reactions_on_user_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "chats", "users"
  add_foreign_key "course_offerings", "course_sessions"
  add_foreign_key "course_offerings", "courses"
  add_foreign_key "course_offerings", "institutions"
  add_foreign_key "course_offerings", "users"
  add_foreign_key "course_sessions", "institutions"
  add_foreign_key "courses", "institutions"
  add_foreign_key "institutional_affiliations", "institutions"
  add_foreign_key "institutional_affiliations", "users"
  add_foreign_key "messages", "chats"
  add_foreign_key "messages", "users"
  add_foreign_key "reactions", "chats"
  add_foreign_key "reactions", "users"
end
