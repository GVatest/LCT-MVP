import os
import zipfile
from lct_backend.settings import MEDIA_ROOT


def process_uploaded_zip(file_ziped):
    original_zip = zipfile.ZipFile(file_ziped, 'r')
    new_zip = zipfile.ZipFile(file_ziped.name, 'w')
    buffer = 0
    for item in original_zip.infolist():
        buffer = original_zip.read(item.filename)
        if not str(item.filename).startswith('__MACOSX/'):
            new_zip.writestr(item, buffer)
    original_zip.close()

    return new_zip, buffer


def read_zip_annotations(user_id, patient_id, series_id):
    dir = '/'.join([MEDIA_ROOT, str(user_id), str(patient_id), str(series_id)])
    path = '/'.join([dir, 'annotations.zip'])
    filenames = [x for x in os.listdir(dir) if x.split('.')[-1] == 'json']
    with zipfile.ZipFile(path, mode="w") as archive:
        for filename in filenames:
            archive.write(filename)
    return path  # необходимо передать на фронт


def write_zip_annotations(user_id, patient_id, series_id, filepath):
    dir = '/'.join([MEDIA_ROOT, str(user_id), str(patient_id), str(series_id)])
    path = '/'.join([dir, 'annotations.zip'])
    os.rename(filepath, path)
    with zipfile.ZipFile(path, 'r') as zip_ref:
        zip_ref.extractall(dir)
