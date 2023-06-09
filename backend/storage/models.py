from django.db import models
from django.utils.timezone import now
import uuid

from accounts.models import UserAccount


class Study(models.Model):

    STATE_COICES = [
        ("Не размечен", "Не размечен"),
        ("Отклонён", "Отклонён"),
        ("В процессе разметки", "В процессе разметки"),
        ("Размечен", "Размечен"),
    ]
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=20, blank=True, null=True)
    date_upload = models.DateField(default=now, blank=True, null=True)
    done = models.CharField(max_length=10, blank=True, null=True)
    modality = models.CharField(max_length=16, null=True, blank=True)
    patient_id = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(choices=STATE_COICES, default='Не размечен', max_length=20)
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    instance_id = models.CharField(max_length=255)
    comment = models.CharField(max_length=255, default="")

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['date_upload']