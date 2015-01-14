# encoding=utf-8

require 'json'
require 'twitter'

class TwitterStream

	def initialize
		file = File.open Rails.root.join('app', 'helpers', 'twitter_keys.json')
		keys = JSON.parse file.read

		@client = Twitter::Streaming::Client.new do |config|
			config.consumer_key        = keys['api_key']
			config.consumer_secret     = keys['api_key_secret']
			config.access_token        = keys['access_token']
			config.access_token_secret = keys['access_token_secret']
		end
	end

	def get_tweet
		start = Time::now
		@client.sample do |object|
			if (object.is_a?(Twitter::Tweet) and object.lang == "en")
				return object.text
			end

			if (Time::now - start > 5) 
				Rails.loggger "No tweet found in time"
				return "No tweet found"
			end
		end
	end

	def get_tweets(num)
		if !num.is_a? Integer then num = 1 end
		collection = []
		@client.sample do |object|
			start = Time::now
			if (object.is_a?(Twitter::Tweet) and object.lang == "en")
				collection << object.text
				num -= 1
				break if num < 1
			end

			if (Time::now - start > 5) 
				Rails.loggger "No tweet found in time"
			end
		end
		JSON.generate collection
	end

	def stream_tweets
		start = Time::now
		@client.sample do |object|
			if (object.is_a?(Twitter::Tweet) and object.lang == "en") 
				puts "#{object.text}"
			if (Time::now - start > 60) then return end
			end
		end
	end

end

