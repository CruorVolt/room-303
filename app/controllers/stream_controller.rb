require 'json'
require 'twitter'
require 'htmlentities'

class StreamController < ApplicationController

	include ActionController::Live

	# Open a server-side stream that delivers tweets
	def tweet
		response.headers['Content-Type'] = 'text/event-stream'

		sse = SSE.new(response.stream, retry: 300, event: "event-name")

		file = File.open Rails.root.join('app', 'helpers', 'twitter_keys.json')
		keys = JSON.parse file.read
		file.close

		@client = Twitter::Streaming::Client.new do |config|
			config.consumer_key        = keys['api_key']
			config.consumer_secret     = keys['api_key_secret']
			config.access_token        = keys['access_token']
			config.access_token_secret = keys['access_token_secret']
		end

		start = Time::now
		@client.sample do |object|
			if (object.is_a?(Twitter::Tweet) and object.lang == "en") 
				#Output a new 'tweet' event with tweet's text
				sse.write(clean(object.text), event: "tweet");
			end
			if (Time::now - start > 10) #Reconnect after 10s
				return end
			end
	rescue IOError
		#sse.write thows when client disconnects
	ensure
		response.stream.close
	end

	def clean(string)
		"#{HTMLEntities.new.decode string}... "
	end
end




