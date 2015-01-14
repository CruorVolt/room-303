Rails.application.routes.draw do
  # See how all your routes lay out with "rake routes".

    root 'matrix#index'
    get 'vertical/' => 'vertical#index'
    get 'horizontal/' => 'horizontal#index'
    get 'tweet/' => 'stream#tweet'
    get 'about/' => 'about#index'

end
