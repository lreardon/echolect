# frozen_string_literal: true

# == Schema Information
#
# Table name: users
#
#  id                     :uuid             not null, primary key
#  confirmation_sent_at   :datetime
#  confirmation_token     :string
#  confirmed_at           :datetime
#  email                  :string           default(""), not null
#  encrypted_password     :string           default(""), not null
#  first_name             :string           not null
#  last_name              :string           not null
#  remember_created_at    :datetime
#  reset_password_sent_at :datetime
#  reset_password_token   :string
#  unconfirmed_email      :string
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  active_institution_id  :uuid
#
# Indexes
#
#  index_users_on_active_institution_id  (active_institution_id)
#  index_users_on_confirmation_token     (confirmation_token) UNIQUE
#  index_users_on_email                  (email) UNIQUE
#  index_users_on_reset_password_token   (reset_password_token) UNIQUE
#
class User < ApplicationRecord
	# Include default devise modules. Others available are:
	# :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
	devise :database_authenticatable, :registerable,
		:recoverable, :rememberable, :validatable, :confirmable
	has_many :chats, dependent: :destroy
	has_many :chat_memberships, dependent: :destroy
	has_many :joined_chats, through: :chat_memberships, source: :chat
	has_many :messages, dependent: :destroy
	has_many :reactions, dependent: :destroy
	has_many :institutional_affiliations, dependent: :destroy
	has_many :institutions, through: :institutional_affiliations

	belongs_to :active_institution, class_name: 'Institution', foreign_key: 'active_institution_id', optional: true

	has_and_belongs_to_many :institutions, join_table: :institutional_affiliations

	def name
		"#{first_name} #{last_name}"
	end

	def join_chat(chat, code: :code)
		return unless chat.access_code == code

		joined_chats << chat
	end

	def owns_chat(chat)
		chat.user_id == id
	end

	def lecturer?
		institutional_affiliations.where(lecturer: true).any?
	end

	def affiliation(institution)
		institutional_affiliations.find_by(institution: institution)
	end

	def active_affiliation
		return nil if active_institution.nil?

		affiliation(active_institution)
	end

	def active_affiliation?
		!active_affiliation.nil?
	end

	def active_institution_course_offerings
		active_institution&.course_offerings&.where(user_id: id)
	end
end
