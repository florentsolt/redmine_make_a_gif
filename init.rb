Redmine::Plugin.register :redmine_make_a_gif do
  name 'Redmine Make A Gif plugin'
  author 'Benoit Zugmeyer & Florent Solt'
  description 'This is a plugin for Redmine'
  version '0.0.1'
  url 'https://github.com/florentsolt/redmine-make-a-gif'
  menu :top_menu, :gifs, { :controller => 'gif_uploader', :action => 'gallery' }, :caption => 'Gifs Gallery'
end

class MakeAGifViewListener < Redmine::Hook::ViewListener
  def view_layouts_base_html_head(context)
    javascript_include_tag("animated_gif.js", :plugin => "redmine_make_a_gif") +
	javascript_include_tag("gumhelper.js", :plugin => "redmine_make_a_gif") +
	javascript_include_tag("main.js", :plugin => "redmine_make_a_gif")
  end
end

module Redmine::WikiFormatting::Textile::Helper
  def heads_for_wiki_formatter_with_make_a_gif
    heads_for_wiki_formatter_without_make_a_gif
    unless @heads_for_wiki_formatter_with_make_a_gif_included
      content_for :header_tags do
        javascript_include_tag('jstoolbar', :plugin => 'redmine_make_a_gif')
      end
      @heads_for_wiki_formatter_with_make_a_gif_included = true
    end
  end

  alias_method_chain :heads_for_wiki_formatter, :make_a_gif
end


