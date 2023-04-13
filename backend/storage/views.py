from io import BytesIO
import os
import shutil
import zipfile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from accounts.models import UserAccount
from utils.process_files import process_uploaded_zip
from utils.dicom_transforms import rename_dicoms, get_paths, create_empty_json_files

from .models import Study
from django.conf import settings
import pydicom
import json
import uuid
import glob


def parse_dicom(file):
    data = pydicom.dcmread(BytesIO(file))
    try:
        name = data[("0010", "0010")].value
    except KeyError:
        name = "-"
    try:
        modality = data[("0008", "0060")].value
    except KeyError:
        modality = "-"

    try:
        done = data[("0008", "0021")].value
        done = done[0:4] + "." + done[4:6] + "." + done[6:8]
    except KeyError:
        done = "-"

    try:
        patient_id = data[("0010", "0020")].value
        if patient_id == "":
            patient_id = str(uuid.uuid1())
    except KeyError:
        patient_id = str(uuid.uuid1())

    try:
        instance_id = data[("0020", "000E")].value
    except KeyError:
        instance_id = str(uuid.uuid1())

    return name, modality, done, patient_id, instance_id


class StudyUploadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def put(self, request, format=None):
        user = request.user
        try:
            file_obj = request.FILES['file']
        except KeyError:
            return Response({"error": "File does not exist"}, status=400)

        user = self.request.user
        dir_path = "/".join([settings.MEDIA_ROOT, user.username])
        dir_path = "/".join([settings.MEDIA_ROOT, user.username])

        new_zip, last_file_buffer = process_uploaded_zip(file_obj)
        if not last_file_buffer:
            return Response({"error": "Пустой архив"}, status=400)
        if new_zip.namelist():
            file_obj.name = new_zip.namelist()[0]
        else:
            return Response({"error": "Пустой архив"}, status=400)
        try:
            name, modality, done, patient_id, instance_id = parse_dicom(last_file_buffer)
            try:
                if Study.objects.get(patient_id=patient_id, instance_id=instance_id, user=user):
                    return Response({"error": "Вы уже загружали это исследование"}, status=400)
            except Study.DoesNotExist:
                pass
            if name == "-":
                return Response({"error": "Исследование не имеет имени"}, status=400)
        except Exception:
            return Response({"error": "Не удалось прочитать информацию из дайкома"}, status=400)
        path = "/".join([dir_path, str(patient_id), str(instance_id)])
        if os.path.isdir(path):
            return Response({"error": "Вы уже загружали это исследование"}, status=400)
        new_zip.extractall(path=path)
        new_zip.close()
        study = Study(done=done, name=name, modality=modality, user=user, patient_id=patient_id,
                      instance_id=instance_id)
        study.save()

        path = "/".join([settings.MEDIA_ROOT, user.username, study.patient_id, study.instance_id])

        file_names = os.listdir(path)
        paths_to_dicoms = ["/".join([path, file_name]) for file_name in file_names]

        paths_to_dicoms = rename_dicoms(paths_to_dicoms)
        create_empty_json_files(paths_to_dicoms)
        # create_metadata_json(path)
        return Response({
            "unique_id": study.unique_id,
            "series_id": study.instance_id,
            "patient_id": study.patient_id,
            "date_upload": study.date_upload.strftime("%m.%d.%Y"),
            "date_study": study.done,
            "modality": study.modality,
            "state": study.state,
            "comment": study.comment,
            "name": study.name}, status=200)


class StudyProcessingView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, format=None, **kwargs):
        user = request.user
        try:
            study = user.study_set.get(unique_id=kwargs["unique_id"])
        except Study.DoesNotExist:
            return Response({"error": "Исследование не найдено"}, status=400)

        path = "/".join([settings.MEDIA_ROOT, user.username, study.patient_id, study.instance_id])
        web_path = "/".join([settings.MEDIA_FOLDER, user.username, study.patient_id, study.instance_id])

        slices_paths, json_paths = get_paths(path, web_path)
        return Response({
            "slices_paths": slices_paths,
            "json_paths": json_paths,
            # "metadata": '/'.join([web_path, 'metadata.json']),
        })

    def post(self, request, format=None, **kwargs):
        user = request.user
        try:
            user.study_set.get(unique_id=kwargs["unique_id"])
        except Study.DoesNotExist:
            return Response({"error": "Исследование не найдено"}, status=400)

        objects = request.data
        for object in objects:
            with open("/".join([settings.MEDIA_ROOT, *object['dst'].split("/")[1:]]), 'w') as f:
                json.dump(object["object"], f)

        return Response({"success": "Разметка успешно сохранена"}, status=200)

    def patch(self, request, format=None, **kwargs):
        user = request.user
        try:
            study = user.study_set.get(unique_id=kwargs["unique_id"])
        except Study.DoesNotExist:
            return Response({"error": "Исследование не найдено"}, status=400)

        if "comment" in request.data:
            study.comment = request.data['comment']
        if "state" in request.data:
            study.state = request.data["state"]
        if "comment" not in request.data and "state" not in request.data:
            return Response({"error": "Данные для обновления не обнаружены"})

        study.save()
        return Response({"success": "Исследование успешно сохранено"}, status=200)

    def delete(self, request, format=None, **kwargs):
        user = request.user
        try:
            study = user.study_set.get(unique_id=kwargs["unique_id"])
            path = "/".join([settings.MEDIA_ROOT, user.username, study.patient_id])
            shutil.rmtree(path)
            study.delete()
        except Study.DoesNotExist:
            return Response({"error": "Исследование не найдено"}, status=400)
        return Response({"success": "Комментарий успешно удален"})


class StudyListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, format=None, **kwargs):
        if "unique_id" in kwargs:
            try:
                user = UserAccount.objects.get(unique_id=kwargs["unique_id"])
            except UserAccount.DoesNotExist:
                return Response({"error": "Пользователь не найден"})
        else:
            user = request.user
        studies = user.study_set.all()
        data = []
        for study in studies:
            data.append({
                "unique_id": study.unique_id,
                "series_id": study.instance_id,
                "patient_id": study.patient_id,
                "date_upload": study.date_upload.strftime("%m.%d.%Y"),
                "date_study": study.done,
                "modality": study.modality,
                "state": study.state,
                "comment": study.comment,
                "name": study.name})
        return Response(data, status=200)


class StudyMarkupView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, format=None, **kwargs):

        ARCHIVE_NAME = "markup.zip"

        user = request.user
        try:
            study = user.study_set.get(unique_id=kwargs["unique_id"])
        except Study.DoesNotExist:
            return Response({"error": "Исследование не найдено"}, status=400)

        path = "/".join([settings.MEDIA_ROOT, user.username, study.patient_id, study.instance_id])
        web_path = "/".join([settings.MEDIA_FOLDER, user.username, study.patient_id, study.instance_id])

        json_file_names = os.listdir(path)
        json_file_names = list(filter(lambda x: x.split('.')[-1] == "json", json_file_names))

        with zipfile.ZipFile("/".join([path, ARCHIVE_NAME]), "w") as archive:
            for json_name in json_file_names:
                archive.write("/".join([path, json_name]), json_name)
        
        return Response({"url": "/".join([web_path, ARCHIVE_NAME])}, status=200)
            

    def post(self, request, format=None, **kwargs):
        try:
            file_obj = request.FILES['file']
        except KeyError:
            return Response({"error": "File does not exist"}, status=400)
        user = request.user
        try:
            study = user.study_set.get(unique_id=kwargs["unique_id"])
        except Study.DoesNotExist:
            return Response({"error": "Исследование не найдено"}, status=400)
        
        path = "/".join([settings.MEDIA_ROOT, user.username, study.patient_id, study.instance_id])

        new_zip, _ = process_uploaded_zip(file_obj)
        file_names = new_zip.namelist()
        if len(file_names) == 0:
            return Response({"error": "Пустой архив"}, status=400)

        original_zip, _ = process_uploaded_zip(new_zip.open(file_names[0]))
        print(original_zip.namelist())
        original_zip.extractall(path)
        
        for name in file_names:
            with open("/".join([path, name]), "w") as f:
                pass
                # json.dump(new_zip.open(name).read(), f)
        return Response({"success": "Архив с разметкой успешно сохранен"})