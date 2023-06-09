from django.contrib import admin
from django.views.generic import TemplateView
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from .jwt_views_config import MyTokenObtainPairView
from accounts.views import UsersListView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/", include("storage.urls")),
    path("api/user/", include("accounts.urls")),
    path("api/users/", UsersListView.as_view()),
    path("api/generation/", include("generation.urls")),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # path('media/', GetDicomEndpoint.as_view())
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# urlpatterns += [re_path(r"^.*", TemplateView.as_view(template_name="index.html", content_type="text/html"))] 
