# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html

match '/gif/:filename.gif', :to => 'gif_uploader#download'
match '/gif/upload', :to => 'gif_uploader#upload'
