from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("wiki/<str:title>", views.info, name="info"),
    path('search/', views.search, name='search'),
    path('create', views.create_page, name='create_page'),
    path('random/', views.random_page, name='random_page'),
    path('wiki/<str:title>/edit/', views.edit_page, name='edit_page'),
    path('wiki/<str:title>/delete/', views.delete_page, name='delete_page'),
    path("all_pages/", views.all_pages, name="all_pages"),
]

