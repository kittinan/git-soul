from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'repositories', views.RepositoryViewSet)
router.register(r'analyses', views.AnalysisViewSet)

urlpatterns = [
    path('', include(router.urls)),
]