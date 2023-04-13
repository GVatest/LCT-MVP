from django.urls import path
from .views import StudyListView, StudyUploadView, StudyProcessingView, StudyMarkupView

urlpatterns = [
    path('upload/', StudyUploadView.as_view()),
    path('study/<uuid:unique_id>', StudyProcessingView.as_view()),
    path('study/markup/<uuid:unique_id>', StudyMarkupView.as_view()),
    path('studies', StudyListView.as_view()),
    path('studies/<uuid:unique_id>', StudyListView.as_view()),
]