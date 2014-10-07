class GifUploaderController < ApplicationController

  skip_before_filter :verify_authenticity_token
  ROOT = File.join(Rails.root, 'files', 'gif')

  def download
    name = File.basename(params[:filename] + '.gif')
    file = File.join(ROOT, name)
    expires_in 10.years, :public => true
    fresh_when etag: name
    send_file file, :filename => name, :disposition => 'inline'
  end

  def upload
    name = Time.now.strftime("%Y%m%d-%H%M%S-") + User.current.id.to_s + '.gif'
    dest = File.join(ROOT, name)
    Dir.mkdir(ROOT) if not File.exists?(ROOT)
    FileUtils.mv(params[:file].tempfile.path, dest) if not File.exists?(dest)
    render :text => name, :status => 200
  end

  def gallery
    @gifs = Dir[File.join(ROOT, '*.gif')]

    per_page = params[:per_page].to_i
    per_page = 20 if per_page < 1

    page = params[:page].to_i
    page = 1 if page < 1

    @count = @gifs.count
    @pages = Paginator.new @count, per_page, page

    @gifs = @gifs.sort.reverse.slice(@pages.offset, per_page).map do |f|
      name = File.basename(f)
      user = User.find(name.split('-', 3).last.to_i) rescue User.anonymous
      { :name => name, :user => user}
    end
  end

end
