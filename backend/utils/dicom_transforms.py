import shutil

import pydicom
import os
import numpy as np
import json


def apply_boolean_mask(array, array_criterion, criterion, value):
    array.copy()
    if array.shape != array_criterion.shape:
        print("Размеры не совпадают")
        return
    if len(array.shape) == 2:
        for i in range(len(array)):
            for j in range(len(array[i])):
                if criterion(array_criterion[i][j]):
                    array[i][j] = value
    elif len(array.shape) == 3:
        for i in range(len(array)):
            for j in range(len(array[i])):
                for k in range(len(array[i][j])):
                    if criterion(array_criterion[i][j][k]):
                        array[i][j][k] = value
    return array


def tag2int(x):
    # get x[0] as in int is x is a 'pydicom.multival.MultiValue', otherwise get int(x)
    if isinstance(x, pydicom.multival.MultiValue):
        x = x[0]
    x = str(x)
    x = x.split(',')[0]
    return int(float(x))


def data2tags(data):
    windowing = {}
    try:
        windowing['window_center'] = tag2int(data[('0028', '1050')].value)  # window center
        windowing['window_width'] = tag2int(data[('0028', '1051')].value)  # window width
    except KeyError:
        windowing['window_center'] = 2048
        windowing['window_width'] = 4096
    try:
        windowing['intercept'] = tag2int(data[('0028', '1052')].value)  # window center
        windowing['slope'] = tag2int(data[('0028', '1053')].value)  # window width
    except KeyError:
        windowing['intercept'] = 0
        windowing['slope'] = 1
    try:
        windowing['image_mode'] = str(data[('0028', '0004')].value)  # monochrome1 or not
    except KeyError:
        pass
    return windowing


def reformat_survey(src_path):
    data, scan = read_survey(src_path)
    tags = data2tags(data)
    scan = np.array(scan, dtype=np.uint16).tobytes()
    return scan, tags


def read_survey(path):
    survey = pydicom.dcmread(path)
    scan = survey.pixel_array
    return survey, scan


def create_empty_json_files(dicom_paths):
    for dicom_path in dicom_paths:
        json_path = dicom_path.replace('.dcm', '.json')
        with open(json_path, 'w') as f:
            json.dump({"contours": [],
                       "points": [],
                       "rulers": [],
                       "polygons": [[]]}, f)


def get_paths(dst_folder, web_path):
    dicom_file_names = os.listdir(dst_folder)
    dicom_file_names = list(filter(lambda x: x.split('.')[-1] == 'dcm', dicom_file_names))
    dicom_file_paths = ["/".join([web_path, dicom_file_name]) for dicom_file_name in dicom_file_names]
    dicom_file_paths.sort()
    json_file_paths = [x.replace(".dcm", ".json") for x in dicom_file_paths]
    return dicom_file_paths, json_file_paths


def rename_dicoms(paths_to_dicoms):
    new_paths = []
    for path in paths_to_dicoms:
        single_slice = pydicom.dcmread(path)
        number = single_slice.InstanceNumber - 1
        new_path = path.split('/')[:-1]
        new_path.append(str(number).rjust(4, '0') + '.dcm')
        new_path = '/'.join(new_path)
        os.rename(path, new_path)
        new_paths.append(new_path)
    return new_paths
