from rest_framework.views import APIView
from rest_framework import permissions
from utils.process_files import process_uploaded_zip
from rest_framework.response import Response
from django.conf import settings
import os, shutil


import glob
import matplotlib.pyplot as plt
import nibabel as nib
import torch
import numpy as np
import cv2
import albumentations as A
from tqdm import tqdm
import json
import sys

import torch
from torch import nn
import segmentation_models_pytorch as smp
import torch.nn.functional as F
import pydicom as dicom
from tqdm import tqdm
from random import randint
from random import choice
import time


class Unet(nn.Module):
    def __init__(self, cfg):
        super(Unet, self).__init__()
        self.cfg = cfg
        self.model = smp.Unet(cfg.backbone, classes=cfg.num_classes,
                              activation='softmax' if cfg.num_classes > 1 else 'sigmoid',
                              in_channels=cfg.in_channels)

        for i, x in enumerate(self.model.encoder.children()):
            if isinstance(x, torch.nn.Sequential):
                if cfg.layers_to_freeze:
                    for param in x.parameters():
                        param.requires_grad = False
                    cfg.layers_to_freeze -= 1

    def forward(self, x):
        return self.model(x)

class Config(dict):
    def load(self, path=None):
        assert os.path.exists(path), f"{path} does not exist"
        with open(path) as f:
            data = json.load(f)
        for key in data.keys():
            self.__setattr__(key, data[key])
        return self

    def save(self, replace=False):
        configs_path = os.path.join(self.save_folder, 'configs')
        if not os.path.exists(configs_path):
            os.makedirs(configs_path)
            print(f"{configs_path} created successfully")
        save_path = os.path.join(configs_path, self.save_name) + '.cfg'
        if not replace:
            assert not os.path.exists(save_path), f"{save_path} already exists"
        with open(save_path, 'w') as f:
            json.dump(self, f)

    def __getattr__(self, attr):
        return self.get(attr)

    def __setattr__(self, key, value):
        self.__setitem__(key, value)



class GenerationView(APIView):
    permission_classes = (permissions.IsAuthenticated, )

    def post(self, request, format=None):
        GENERATIONS_FOLDER = "generations/"
        GENERATIONS_READY_FOLDER = "ready/"
        user = request.user

        try:
            file_obj = request.data["file"]
        except KeyError:
            return Response({"error": "File does not exist"}, status=400)
        # user = request.user

        dir_path = os.path.join(settings.MEDIA_ROOT + "/" + user.username, GENERATIONS_FOLDER)
        web_path = os.path.join(settings.MEDIA_ROOT + '/' + user.username , GENERATIONS_READY_FOLDER)

        zip_file, _ = process_uploaded_zip(file_obj)

        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
        else:
            shutil.rmtree(dir_path)
            os.makedirs(dir_path)

        if not os.path.exists(web_path):
            os.makedirs(web_path)
        else:
            shutil.rmtree(web_path)
            os.makedirs(web_path)

        zip_file.extractall(path=dir_path)
        zip_file.close()


        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

        cfg = Config().load('generation/lung.cfg')
        lung_top_model = Unet(cfg)

        print('Model loading')
        lung_top_model.load_state_dict(torch.load('generation/lung.pth', map_location=torch.device('cpu')))
        lung_top_model.to(device)
        lung_top_model.eval()
        print('Model loaded')

        ex_path = dir_path + '*.dcm'
        dcm_paths = glob.glob(ex_path)

        trd = np.zeros((len(dcm_paths), 512, 512))
        for path in dcm_paths:
            ds = dicom.dcmread(path)
            trd[ds.InstanceNumber - 1, :, :] = ds.pixel_array
        print(trd.shape)
        orig_trd = trd.copy()

        # trd = window_image(trd)
        trd = (trd - trd.min()) / (trd.max() - trd.min())

        t = A.Resize(512, 512)
        inv_t = A.Resize(trd.shape[1], trd.shape[2])

        batches = [x for x in np.array_split(trd, trd.shape[0] // 4 + 1, axis=0)]

        preds = []
        for i, batch in enumerate(tqdm(batches)):
            batch = t(image=batch.transpose(1, 2, 0))['image']
            tensor_batch = torch.tensor(batch.astype(np.float32)).unsqueeze(0).permute(3, 0, 1, 2)
            tensor_batch = tensor_batch.to(device)
            pred = lung_top_model(tensor_batch).detach().cpu().numpy()[:, 0, :, :]
            pred = (pred > 0.5).astype(np.uint8).transpose(1, 2, 0)
            pred = inv_t(image=pred)['image']
            pred = pred.transpose(2, 0, 1).astype(np.uint8)
            for j in range(pred.shape[0]):
                ex = pred[j, :, :]
                contours, hierarchy = cv2.findContours(ex, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

                f = False
                if len(contours) > 1:
                    f = True
                    areas = [cv2.contourArea(contours[z]) for z in range(len(contours))]
                    lung_idxs = np.argpartition(areas, -2)[-2:]
                    cnt1 = contours[lung_idxs[0]].squeeze(1)
                    cnt2 = contours[lung_idxs[1]].squeeze(1)
                    ex = cv2.medianBlur(ex, 5)
                    ex1 = cv2.fillPoly(ex, pts=[cnt1, cnt2], color=(255, 255, 255))
                if f:
                    preds.append(np.expand_dims(ex1.astype(bool), axis=0))
                else:
                    preds.append(np.expand_dims(ex.astype(bool), axis=0))

        predictions = np.concatenate(preds, axis=0)

        mod_preds = []
        for i in tqdm(range(predictions.shape[1])):
            ex = predictions[:, i, :].astype(np.uint8)
            ex = cv2.medianBlur(ex, 5)
            contours, hierarchy = cv2.findContours(ex, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
            if len(contours) > 1:
                areas = [cv2.contourArea(contours[i]) for i in range(len(contours))]
                lung_idxs = np.argpartition(areas, -2)[-2:]
                cnt1 = contours[lung_idxs[0]].squeeze(1)
                cnt2 = contours[lung_idxs[1]].squeeze(1)
                cv2.fillPoly(ex, pts=[cnt1, cnt2], color=(255, 255, 255))
                # cv2.fillPoly(ex, pts =[cnt2], color=(2,2,2))
            mod_preds.append(np.expand_dims(ex, axis=0))
        mod_preds = np.concatenate(mod_preds, axis=0).transpose(1, 0, 2)

        nonzero_idxs = np.nonzero(np.sum(mod_preds, axis=(1, 2)))[0]
        start_idx, end_idx = nonzero_idxs[0], nonzero_idxs[-1]

        delta = (end_idx - start_idx + 1)
        right_upper = start_idx + (delta // 8) * 3
        right_middle = start_idx + (delta // 8) * 5
        right_bottom = end_idx

        left_upper = start_idx + delta // 2
        left_bottom = end_idx

        r1 = np.nonzero(mod_preds[:right_upper, :, :])
        r1_n = randint(1, r1[0].shape[0])

        r2 = np.nonzero(mod_preds[right_upper:right_middle, :, :])
        r2_n = randint(1, r2[0].shape[0])

        r3 = np.nonzero(mod_preds[right_middle:right_bottom, :, :])
        r3_n = randint(1, r3[0].shape[0])

        l1 = np.nonzero(mod_preds[:left_upper, :, :])
        l1_n = randint(1, l1[0].shape[0])

        l2 = np.nonzero(mod_preds[left_upper:left_bottom, :, :])
        l2_n = randint(1, l2[0].shape[0])

        str_amount = request.data['amount']
        if str_amount == "few":
            amount = randint(4, 10)
        elif str_amount == "single":
            amount = 1
        else:
            amount = randint(10, 15)

        str_size = request.data['size']
        if str_size == "small":
            obj_dir = 'objects/1/*.npz'
        elif str_size == "medium":
            obj_dir = 'objects/2/*.npz'
        elif str_size == "large":
            obj_dir = 'objects/3/*.npz'
        else:
            obj_dir = 'objects/4/*.npz'

        obj_dir = 'generation/' + obj_dir
        obj_paths = glob.glob(obj_dir)

        for i in range(amount):
            r1_n = randint(1, r1[0].shape[0])
            r1_x = r1[0][r1_n]
            r1_y = r1[1][r1_n]
            r1_z = r1[2][r1_n]

            r2_n = randint(1, r2[0].shape[0])
            r2_x = r2[0][r2_n]
            r2_y = r2[1][r2_n]
            r2_z = r2[2][r2_n]

            r3_n = randint(1, r3[0].shape[0])
            r3_x = r3[0][r3_n]
            r3_y = r3[1][r3_n]
            r3_z = r3[2][r3_n]

            l1_n = randint(1, l1[0].shape[0])
            l1_x = l1[0][l1_n]
            l1_y = l1[1][l1_n]
            l1_z = l1[2][l1_n]

            l2_n = randint(1, l2[0].shape[0])
            l2_x = l2[0][l2_n]
            l2_y = l2[1][l2_n]
            l2_z = l2[2][l2_n]

            obj = np.load(choice(obj_paths))['obj']
            t = A.Resize(10, obj.shape[1])
            obj = t(image=obj)['image']
            end_x = min(trd.shape[0], r1_x + obj.shape[0])
            end_y = min(trd.shape[1], r1_y + obj.shape[1])
            end_z = min(trd.shape[2], r1_z + obj.shape[2])
            end_obj_x = min(trd.shape[0] - r1_x, obj.shape[0])
            end_obj_y = min(trd.shape[1] - r1_y, obj.shape[1])
            end_obj_z = min(trd.shape[2] - r1_z, obj.shape[2])

            obj = obj[:end_obj_x, :end_obj_y, :end_obj_z] * (mod_preds == 255)[r1_x:end_x, r1_y:end_y, r1_z:end_z]

            rect = orig_trd[r1_x:end_x, r1_y:end_y, r1_z:end_z]

            np.putmask(rect, obj != 0, rect * 0.75 + 0.25 * obj)
            orig_trd[r1_x:end_x, r1_y:end_y, r1_z:end_z] = rect

        # web_path = web_path.replace('generations/', 'ready/')

        for path in dcm_paths:
            ds = dicom.dcmread(path)
            ds.PixelData = orig_trd[ds.InstanceNumber - 1, :, :].astype(np.int16).tobytes()
            save_path = path.replace('generations/', 'ready/')
            ds.save_as(save_path)

        result_path = os.path.join("/".join(web_path.split("/")[:-2]), 'result')

        print("start")
        print(result_path)
        print(web_path)

        start_time = time.time()
        shutil.make_archive(result_path, 'zip', web_path)
        print(time.time() - start_time)

        print("generated")

        return Response({"url": os.path.join(settings.MEDIA_URL + user.username, "result.zip"), "success": "Паталогии успешно сгенерированы"}, status=200)

        


        

