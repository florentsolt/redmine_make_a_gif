# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html

match '/gif/:filename.gif', :to => 'gif_uploader#download', :via => :get
match '/gif/upload', :to => 'gif_uploader#upload', :via => :post
match '/gif/gallery', :to => 'gif_uploader#gallery', :via => :get
