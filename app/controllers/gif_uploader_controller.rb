class GifUploaderController < ApplicationController
  accept_api_auth :upload

  skip_before_filter :verify_authenticity_token
  ROOT = File.join(Rails.root, 'files', 'gif')

  def download
    name = File.basename(params[:filename] + '.gif')
    file = File.join(ROOT, name)
    send_file file, :filename => name, :disposition => 'inline'
  end

  def upload
    name = File.basename(params[:file].original_filename)
    dest = File.join(ROOT, name)
    Dir.mkdir(ROOT) if not File.exists?(ROOT)
    File.unlink(dest) if File.exists?(dest)
    FileUtils.mv(params[:file].tempfile.path, dest)
    render :text => name.to_json, :status => 200
  end

end
